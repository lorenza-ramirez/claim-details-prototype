import { useEffect, useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import spotDocs from '../assets/figma/spot-docs.svg'
import appealClose from '../assets/figma/appeal-close.svg'
import {
  appealInfo,
  attachFile,
  assuredWorkload,
  checkCircle,
  copy,
  dynamicFeed,
  leftPanelClose,
  link,
  monetizationOn,
  moreHoriz,
  propsAdd,
  propsChipClose,
  propsStageProgress,
  propsStatusWarning,
  reviewOpenInNew,
  search,
  sendPanel,
  thumbDown,
  thumbUp,
  tune,
  viewDoubleArrow,
  aiGroup1,
  aiGroup2,
} from '../assets/icons'
import { GlobalHeader, Sidebar } from './ClaimDetailsPage'
import { ActivityWidget, activitySummary } from './ActivityWidget'
import { ClaimWidgetsCollapseProvider } from './ClaimWidgetCollapse'
import { DOCUMENT_ROWS, DocumentationWidget } from './DocumentationWidget'
import { PAYMENT_RECORDS, PaymentsWidget } from './PaymentsWidget'
import { RemittanceDetail } from './RemittanceDetail'
import { RemittancesWidget } from './RemittancesWidget'
import {
  IOWA_BLUE_SHIELD_REMITTANCE,
  REMITTANCE_ROWS,
  type RemittanceRow,
} from './remittancesData'
import { ClaimDetailsSplitContent } from './ClaimDetailsSplitContent'
import { SIMILAR_CLAIM_ROWS, SimilarClaimsWidget } from './SimilarClaimsWidget'
import { SubmissionDetail, SubmissionPanel } from './SubmissionDetail'
import { SubmissionsWidget } from './SubmissionsWidget'
import { INITIAL_CLAIM_SUBMISSION, SUBMISSION_ROWS, type SubmissionRow } from './submissionsData'
import { useWidgetView, WidgetViewProvider } from './widgetView'

const CLAIM_ID = '22316691'
const CLAIM_TOTAL = 30

const CHAT_REPLIES: Record<string, string> = {
  'Why was 97140 adjudicated?':
    'Line 97140 was denied with 97110, 97112, and 97161. Iowa Blue Shield paid nothing and left the $346.00 balance open. The remittance dated October 14, 2026 lists CO-16 with remark M76: the diagnosis or condition information is missing, incomplete, or invalid.',
  'What changed in the resubmission?':
    'This claim has not been resubmitted. The initial claim went out on October 9, 2026, and the October 14 remittance denied all four lines. A resubmission would go out after the diagnosis is corrected.',
  'Has this payer denied PI-252 before?':
    'This denial is CO-16 with remark M76, not PI-252. There is no other Iowa Blue Shield denial under PI-252 on claim 22316691.',
  'Resubmit to Iowa Blue Shield':
    'I can prepare a resubmission to Iowa Blue Shield after the diagnosis change is applied. The open balance is $346.00.',
}

type ChatReference = {
  key: string
  tool: string
  detail: string
  icon: string
}

type ChatItem =
  | { kind: 'widget'; id: ToolId }
  | { kind: 'user'; id: string; text: string; references: ChatReference[] }
  | { kind: 'assistant'; id: string; text: string }

function replyFor(text: string) {
  return (
    CHAT_REPLIES[text] ??
    'This claim was fully denied under CO-16 with remark M76 on lines 97110, 97112, 97140, and 97161. I can walk through the denial, the diagnosis codes, or the next step.'
  )
}

const TOOLS = [
  { id: 'claim-details', label: 'Claim Details', icon: spotDocs, spot: '#d5e8f6' },
  { id: 'activity', label: 'Activity', icon: dynamicFeed, spot: '#dadef1' },
  { id: 'submissions', label: 'Submissions', icon: sendPanel, spot: '#dcefdd' },
  { id: 'remittances', label: 'Remittances', icon: monetizationOn, spot: '#fffacc' },
  { id: 'attachments', label: 'Attachments', icon: attachFile, spot: '#d5f6f2' },
  { id: 'payments', label: 'Payments', icon: assuredWorkload, spot: '#e2daf1' },
  { id: 'appeals', label: 'Appeals', icon: appealInfo, spot: '#ffebcc' },
  { id: 'similar-claims', label: 'Similar Claims', icon: dynamicFeed, spot: '#fad1df' },
] as const

type ToolId = (typeof TOOLS)[number]['id']

type ComposerChip = {
  key: string
  icon: string
  label: string
  removable: boolean
}

type ComposerContext = {
  key: string
  title: string
  compare: boolean
  chips: ComposerChip[]
  references: ChatReference[]
  facts: string[]
}

function toolIcon(id: ToolId) {
  return TOOLS.find((tool) => tool.id === id)?.icon ?? sendPanel
}

function submissionFact(row: SubmissionRow) {
  return `Submission ${row.id} was created ${row.created}, submitted ${row.submitted} to ${row.payer} for ${row.charges}, and is ${row.statusLabel}.`
}

function pageFacts(tool: ToolId) {
  if (tool === 'submissions') return SUBMISSION_ROWS.map(submissionFact)
  if (tool === 'remittances') {
    return REMITTANCE_ROWS.map(
      (row) =>
        `Remittance ${row.checkNumber} (${row.source}) on ${row.checkDate} is ${row.status}, insurance paid ${row.insPaid}, and was sent to ${row.sentTo}.`,
    )
  }
  if (tool === 'payments') {
    return PAYMENT_RECORDS.map(
      (row) => `Payment ${row.label} (${row.kind}) has charges ${row.charges}, paid ${row.paid}, and balance ${row.balance}.`,
    )
  }
  if (tool === 'attachments') {
    return DOCUMENT_ROWS.map((row) => `Attachment ${row.name} is a ${row.type} document dated ${row.date}.`)
  }
  if (tool === 'similar-claims') {
    return SIMILAR_CLAIM_ROWS.map(
      (row) => `Similar claim ${row.id} is ${row.status}, with date of service ${row.dateOfService} and provider ${row.provider}.`,
    )
  }
  if (tool === 'activity') return [activitySummary('submitted'), activitySummary('remit'), activitySummary('resubmission')]
  if (tool === 'claim-details') return [`Claim ${CLAIM_ID} details are open.`]
  return ['No appeals have been filed for this claim.']
}

function pageContext(tool: ToolId): ComposerContext {
  const label = TOOLS.find((item) => item.id === tool)?.label ?? 'Details'
  const facts = pageFacts(tool)
  return {
    key: `page:${tool}`,
    title: `${label} selected`,
    compare: false,
    chips: [],
    references: [{ key: `page-${tool}`, tool: label, detail: label, icon: toolIcon(tool) }],
    facts,
  }
}

const SUMMARY_CONTEXT: ComposerContext = {
  key: 'summary',
  title: 'Summary selected',
  compare: false,
  chips: [{ key: 'summary', icon: spotDocs, label: 'Claim summary', removable: false }],
  references: [
    {
      key: 'summary',
      tool: 'Summary',
      detail: 'Denied claim, CO-16 / M76, $346.00 open',
      icon: spotDocs,
    },
  ],
  facts: [
    'This claim was fully denied. Iowa Blue Shield denied lines 97110, 97112, 97140, and 97161 under CO-16 with remark M76. Nothing has been paid, and the $346.00 balance remains open. The next step is to correct the diagnosis and resubmit.',
  ],
}

const DIAGNOSIS_ACTION_CONTEXT: ComposerContext = {
  key: 'action:diagnosis',
  title: 'Suggested action selected',
  compare: false,
  chips: [
    {
      key: 'diagnosis-action',
      icon: checkCircle,
      label: 'Replace M54.5 with M54.50 or remove diagnosis',
      removable: false,
    },
  ],
  references: [
    {
      key: 'diagnosis-action',
      tool: 'Suggested action',
      detail: 'Replace M54.5 with M54.50 or remove the diagnosis',
      icon: checkCircle,
    },
  ],
  facts: [
    'Suggested action: replace diagnosis M54.5 with M54.50, or remove the diagnosis, before resubmitting to Iowa Blue Shield.',
  ],
}

function chipContext(
  key: string,
  title: string,
  compare: boolean,
  chips: ComposerChip[],
  references: ChatReference[],
  facts: string[],
): ComposerContext {
  return { key, title, compare, chips, references, facts }
}

function submissionChip(row: SubmissionRow, removable: boolean): ComposerChip {
  return {
    key: row.id,
    icon: toolIcon('submissions'),
    label: `# ${row.id} | ${row.created} | ${row.statusLabel}`,
    removable,
  }
}

function submissionReference(row: SubmissionRow): ChatReference {
  return {
    key: `submissions-${row.id}`,
    tool: 'Submissions',
    detail: `# ${row.id} · ${row.created} · ${row.statusLabel}`,
    icon: toolIcon('submissions'),
  }
}

function deriveComposerContext({
  detailTool,
  submissionFocus,
  tableRecord,
  selectedSubmissions,
}: {
  detailTool: ToolId | null
  submissionFocus: SubmissionRow | null
  tableRecord: TableRecord | null
  selectedSubmissions: SubmissionRow[]
}): ComposerContext | null {
  if (!detailTool) return null

  if (detailTool === 'submissions' && submissionFocus) {
    return chipContext(
      `record:submissions:${submissionFocus.id}`,
      'Submissions selected',
      false,
      [submissionChip(submissionFocus, false)],
      [submissionReference(submissionFocus)],
      [submissionFact(submissionFocus)],
    )
  }

  if (detailTool === 'submissions' && selectedSubmissions.length) {
    const noun = selectedSubmissions.length === 1 ? 'Submission' : 'Submissions'
    return chipContext(
      `submissions:${selectedSubmissions.map((row) => row.id).join(',')}`,
      `${selectedSubmissions.length} selected ${noun}`,
      selectedSubmissions.length > 1,
      selectedSubmissions.map((row) => submissionChip(row, true)),
      selectedSubmissions.map(submissionReference),
      selectedSubmissions.map(submissionFact),
    )
  }

  if (tableRecord && detailTool === tableRecord.tool) {
    const focused = focusedRecordContext(tableRecord)
    if (focused) return focused
  }

  return pageContext(detailTool)
}

function focusedRecordContext(record: TableRecord): ComposerContext | null {
  if (record.tool === 'remittances') {
    const row = record.remittance ?? REMITTANCE_ROWS[record.index]
    if (!row) return null
    const label = `${row.checkNumber} | ${row.source} | ${row.checkDate}`
    return chipContext(
      `record:remittances:${record.index}:${row.source}`,
      'Remittances selected',
      false,
      [{ key: label, icon: toolIcon('remittances'), label, removable: false }],
      [{ key: label, tool: 'Remittances', detail: `${row.checkNumber} · ${row.source} · ${row.checkDate}`, icon: toolIcon('remittances') }],
      [`Remittance ${row.checkNumber} (${row.source}) on ${row.checkDate} is ${row.status}, insurance paid ${row.insPaid}, and was sent to ${row.sentTo}.`],
    )
  }
  if (record.tool === 'payments') {
    const row = PAYMENT_RECORDS[record.index]
    if (!row) return null
    const label = `${row.label} | ${row.kind} | ${row.charges}`
    return chipContext(
      `record:payments:${row.label}`,
      'Payments selected',
      false,
      [{ key: row.label, icon: toolIcon('payments'), label, removable: false }],
      [{ key: row.label, tool: 'Payments', detail: `${row.label} · ${row.kind} · ${row.charges}`, icon: toolIcon('payments') }],
      [`Payment ${row.label} (${row.kind}) has charges ${row.charges}, paid ${row.paid}, and balance ${row.balance}.`],
    )
  }
  if (record.tool === 'attachments') {
    const row = DOCUMENT_ROWS[record.index]
    if (!row) return null
    return chipContext(
      `record:attachments:${row.id}`,
      'Attachments selected',
      false,
      [{ key: row.id, icon: toolIcon('attachments'), label: row.name, removable: false }],
      [{ key: row.id, tool: 'Attachments', detail: row.name, icon: toolIcon('attachments') }],
      [`Attachment ${row.name} is a ${row.type} document dated ${row.date}.`],
    )
  }
  const claim = SIMILAR_CLAIM_ROWS[record.index]
  if (!claim) return null
  const label = `# ${claim.id} | ${claim.dateOfService} | ${claim.status}`
  return chipContext(
    `record:similar:${claim.id}`,
    'Similar Claims selected',
    false,
    [{ key: claim.id, icon: toolIcon('similar-claims'), label, removable: false }],
    [{ key: claim.id, tool: 'Similar Claims', detail: `# ${claim.id} · ${claim.dateOfService} · ${claim.status}`, icon: toolIcon('similar-claims') }],
    [`Similar claim ${claim.id} is ${claim.status}, with date of service ${claim.dateOfService} and provider ${claim.provider}.`],
  )
}

type TableTool = 'remittances' | 'payments' | 'attachments' | 'similar-claims'

type TableRecord = {
  tool: TableTool
  index: number
  remittance?: RemittanceRow
}

function tableRecordCount(record: TableRecord) {
  if (record.index < 0) return 1
  if (record.tool === 'remittances') return REMITTANCE_ROWS.length
  if (record.tool === 'payments') return PAYMENT_RECORDS.length
  if (record.tool === 'attachments') return DOCUMENT_ROWS.length
  return SIMILAR_CLAIM_ROWS.length
}

const RECORD_COPY: Record<TableTool, { title: string; list: string; noun: string }> = {
  remittances: { title: 'Remittance detail', list: 'remittances', noun: 'remittance' },
  payments: { title: 'Payment detail', list: 'payments', noun: 'payment' },
  attachments: { title: 'Attachment detail', list: 'attachments', noun: 'attachment' },
  'similar-claims': { title: 'Similar claim detail', list: 'similar claims', noun: 'similar claim' },
}

const WIDGET_ASKS: { id: ToolId; pattern: RegExp }[] = [
  { id: 'claim-details', pattern: /\bclaim details?\b/i },
  { id: 'similar-claims', pattern: /\bsimilar claims?\b/i },
  { id: 'submissions', pattern: /\bsubmissions?\b/i },
  { id: 'remittances', pattern: /\bremittances?\b/i },
  { id: 'attachments', pattern: /\battachments?\b|\bdocumentation\b/i },
  { id: 'payments', pattern: /\bpayments?\b/i },
  { id: 'appeals', pattern: /\bappeals?\b/i },
  { id: 'activity', pattern: /\bactivity\b/i },
]

function widgetsAsked(text: string): ToolId[] {
  return WIDGET_ASKS.flatMap(({ id, pattern }) => {
    const match = pattern.exec(text)
    return match ? [{ id, index: match.index }] : []
  })
    .sort((a, b) => a.index - b.index)
    .map(({ id }) => id)
}

function widgetIntro(ids: ToolId[]) {
  const names = ids.map((id) => TOOLS.find((tool) => tool.id === id)?.label.toLowerCase() ?? id)
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
  return `These are the ${list} for this claim`
}

function Icon({
  src,
  size = 16,
  alt = '',
  className,
}: {
  src: string
  size?: number
  alt?: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      draggable={false}
    />
  )
}

function DragGrip() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="6" cy="4" r="1.1" />
      <circle cx="10" cy="4" r="1.1" />
      <circle cx="6" cy="8" r="1.1" />
      <circle cx="10" cy="8" r="1.1" />
      <circle cx="6" cy="12" r="1.1" />
      <circle cx="10" cy="12" r="1.1" />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg className="icon vision-mic" width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="7" y="2.5" width="4" height="8" rx="2" fill="currentColor" />
      <path d="M4.5 8.5a4.5 4.5 0 0 0 9 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 13v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" fill="currentColor" />
    </svg>
  )
}

function SummaryLink({
  children,
  tool,
  onOpen,
}: {
  children: string
  tool: ToolId
  onOpen: (tool: ToolId) => void
}) {
  return (
    <button type="button" className="claim-summary__link vision-link" onClick={() => onOpen(tool)}>
      {children}
      <Icon src={reviewOpenInNew} size={14} />
    </button>
  )
}

function AiMark() {
  return (
    <span className="ai-mark" aria-hidden>
      <img src={aiGroup1} alt="" width={11} height={20} className="ai-mark__a" />
      <img src={aiGroup2} alt="" width={20} height={11} className="ai-mark__b" />
    </span>
  )
}

const PROPERTIES_MIN = 240
const PROPERTIES_MAX = 560
const WORKSPACE_MIN = 403
const DETAIL_MIN = 360

function Vision2Properties({
  tab,
  onTab,
  onToggle,
}: {
  tab: 'properties' | 'activity'
  onTab: (tab: 'properties' | 'activity') => void
  onToggle: () => void
}) {
  const [tags, setTags] = useState<string[]>(['Label'])
  const [width, setWidth] = useState(300)

  function resizeBy(delta: number) {
    setWidth((current) => Math.min(PROPERTIES_MAX, Math.max(PROPERTIES_MIN, current + delta)))
  }

  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = width
    function move(next: PointerEvent) {
      setWidth(Math.round(Math.min(PROPERTIES_MAX, Math.max(PROPERTIES_MIN, startWidth + next.clientX - startX))))
    }
    function stop() {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  return (
    <aside className="vision2-properties" aria-label="Claim properties" style={{ width }}>
      <div className="vision2-properties__nav">
        <button type="button" className="icon-btn" aria-label="Collapse properties" onClick={onToggle}>
          <Icon src={leftPanelClose} size={20} />
        </button>
      </div>
      <div
        className="vision2-properties__resize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize properties"
        aria-valuemin={PROPERTIES_MIN}
        aria-valuemax={PROPERTIES_MAX}
        aria-valuenow={width}
        tabIndex={0}
        onPointerDown={startResize}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') resizeBy(-16)
          if (event.key === 'ArrowRight') resizeBy(16)
        }}
      />
      <div className="vision2-tabs" role="tablist" aria-label="Claim side panel">
        <button
          type="button"
          role="tab"
          className={tab === 'properties' ? 'vision2-tab vision2-tab--active' : 'vision2-tab'}
          aria-selected={tab === 'properties'}
          onClick={() => onTab('properties')}
        >
          Properties
        </button>
        <button
          type="button"
          role="tab"
          className={tab === 'activity' ? 'vision2-tab vision2-tab--active' : 'vision2-tab'}
          aria-selected={tab === 'activity'}
          onClick={() => onTab('activity')}
        >
          Activity
        </button>
      </div>
      {tab === 'activity' ? (
        <div className="vision2-properties__activity">
          <ActivityWidget hideHeader />
        </div>
      ) : (
        <div className="vision2-fields">
          <div className="vision2-field">
            <span className="vision2-field__label">Status</span>
            <span className="vision2-badge">
              <Icon src={propsStatusWarning} size={16} />
              <span>Needs Initial Review - 1...</span>
            </span>
          </div>
          <div className="vision2-field">
            <span className="vision2-field__label">Stage</span>
            <span className="vision2-badge">
              <Icon src={propsStageProgress} size={16} />
              <span>Payer 1</span>
            </span>
          </div>
          <div className="vision2-divider" />
          <div className="vision2-field vision2-field--text">
            <span className="vision2-field__label">Assignee</span>
            <span className="vision2-avatar" title="David Miller">
              J
            </span>
          </div>
          <div className="vision2-field vision2-field--text">
            <span className="vision2-field__label">Updated On</span>
            <span className="vision2-field__value">08/13/2025 10:22AM</span>
          </div>
          <div className="vision2-field vision2-field--text">
            <span className="vision2-field__label">Updated By</span>
            <span className="vision2-field__value">Colossus</span>
          </div>
          <div className="vision2-divider" />
          <div className="vision2-field">
            <span className="vision2-field__label">Tags</span>
            <div className="vision2-tags">
              {tags.map((tag, index) => (
                <span key={`${tag}-${index}`} className="vision2-chip">
                  {tag}
                  <button
                    type="button"
                    className="vision2-chip__remove"
                    aria-label={`Remove ${tag}`}
                    onClick={() => setTags((current) => current.filter((_, item) => item !== index))}
                  >
                    <Icon src={propsChipClose} size={16} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="vision2-tag-add"
                aria-label="Add tag"
                onClick={() => setTags((current) => [...current, 'Label'])}
              >
                <Icon src={propsAdd} size={18} />
              </button>
            </div>
          </div>
          <div className="vision2-divider" />
          <div className="vision2-field vision2-field--text">
            <span className="vision2-field__label">Initial Submission Date</span>
            <span className="vision2-field__value">Jul 01, 2025</span>
          </div>
          <div className="vision2-divider" />
          <div className="vision2-field">
            <span className="vision2-field__label">Imported Insurances</span>
            <span className="vision2-badge">Primary: Aetna - PPO</span>
          </div>
          <div className="vision2-field">
            <span className="vision2-field__label">Submitted Insurances</span>
            <span className="vision2-badge">Primary: Aetna - PPO</span>
          </div>
          <div className="vision2-divider" />
        </div>
      )}
    </aside>
  )
}

export function Vision2Page() {
  return (
    <WidgetViewProvider>
      <ClaimWidgetsCollapseProvider>
        <VisionScreen />
      </ClaimWidgetsCollapseProvider>
    </WidgetViewProvider>
  )
}

function VisionScreen() {
  const { view, close: closeRecord } = useWidgetView()
  const promptRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [workspaceWidth, setWorkspaceWidth] = useState<number | null>(null)
  const [workspaceResizing, setWorkspaceResizing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [diagnosisChoice, setDiagnosisChoice] = useState<'replace' | 'remove' | null>(null)
  const [prompt, setPrompt] = useState('')
  const claimPosition = 1
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [sideTab, setSideTab] = useState<'properties' | 'activity'>('properties')
  const [feed, setFeed] = useState<ChatItem[]>([])
  const [activityOn, setActivityOn] = useState(false)
  const messageId = useRef(0)
  const pinnedTools = feed.flatMap((item) => (item.kind === 'widget' ? [item.id] : []))
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null)
  const dragToolRef = useRef<ToolId | null>(null)
  const suppressToolClickRef = useRef(false)
  const [dragTool, setDragTool] = useState<ToolId | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: ToolId; after: boolean } | null>(null)
  const [copied, setCopied] = useState<'id' | 'link' | null>(null)
  const [submissionOpen, setSubmissionOpen] = useState(false)
  const [diagnosisOpen, setDiagnosisOpen] = useState(false)
  const [remittanceOpen, setRemittanceOpen] = useState(false)
  const [claimDetailsOpen, setClaimDetailsOpen] = useState(false)
  const [chatDrop, setChatDrop] = useState(false)
  const [detailTool, setDetailTool] = useState<ToolId | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [submissionFocus, setSubmissionFocus] = useState<SubmissionRow | null>(null)
  const [tableRecord, setTableRecord] = useState<TableRecord | null>(null)
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([])
  const [selectedRemittanceIds, setSelectedRemittanceIds] = useState<string[]>([])
  const [dismissedContextKey, setDismissedContextKey] = useState<string | null>(null)
  const [askContext, setAskContext] = useState<ComposerContext | null>(null)
  const selectedSubmissions = selectedSubmissionIds
    .map((id) => SUBMISSION_ROWS.find((row) => row.id === id))
    .filter((row): row is SubmissionRow => Boolean(row))
  const panelVisible = panelOpen && detailTool != null
  const liveContext = deriveComposerContext({
    detailTool: panelVisible ? detailTool : null,
    submissionFocus,
    tableRecord,
    selectedSubmissions,
  })
  const composerContext =
    askContext && askContext.key !== dismissedContextKey
      ? askContext
      : liveContext && liveContext.key !== dismissedContextKey
        ? liveContext
        : null

  useEffect(() => {
    setAskContext(null)
  }, [detailTool, submissionFocus, tableRecord, selectedSubmissionIds, selectedRemittanceIds])

  function scrollToWidget(tool: ToolId) {
    const stage = stageRef.current
    const widget = document.getElementById(`vision-widget-${tool}`)
    if (!stage || !widget) return
    const top = widget.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop - 24
    stage.scrollTo({ top, behavior: 'smooth' })
    setSelectedTool(tool)
  }

  function ask(text?: string) {
    if (text) setPrompt(text)
    promptRef.current?.focus()
  }

  function selectAskContext(context: ComposerContext) {
    setDismissedContextKey(null)
    setAskContext(context)
    ask()
  }

  function hideContext() {
    if (askContext) {
      setAskContext(null)
      return
    }
    if (!liveContext) return
    if (liveContext.key.startsWith('submissions:')) setSelectedSubmissionIds([])
    const onList = panelVisible && !submissionFocus && !(tableRecord && detailTool === tableRecord.tool)
    setDismissedContextKey(onList ? `page:${detailTool}` : liveContext.key)
  }

  function contextReply(message: string, facts: string[]) {
    if (facts.length >= 2 && /compar/i.test(message)) return facts.join(' ')
    return `${replyFor(message)} This uses the selected context: ${facts.join(' ')}`
  }

  function send(text?: string) {
    const message = (text ?? prompt).trim()
    const references = composerContext?.references ?? []
    const facts = composerContext?.facts ?? []
    if (!message && references.length === 0) return
    messageId.current += 1
    const userId = `user-${messageId.current}`
    messageId.current += 1
    const assistantId = `assistant-${messageId.current}`
      const comparing = references.length > 0 && /compar/i.test(message)
      const asked = comparing ? [] : widgetsAsked(message)
      if (asked.includes('claim-details')) openClaimDetails()
      const toShow = asked.filter((id) => id !== 'activity' && id !== 'claim-details')
      if (asked.includes('activity')) setActivityOn(true)
      setFeed((current) => {
        const withoutAsked = current.filter(
          (item) => !(item.kind === 'widget' && toShow.some((id) => id === item.id)),
        )
        const next: ChatItem[] = [
          ...withoutAsked,
          { kind: 'user', id: userId, text: message, references },
          {
            kind: 'assistant',
            id: assistantId,
            text: asked.length
              ? widgetIntro(asked)
              : references.length
                ? contextReply(message, facts)
                : replyFor(message),
          },
        ]
        for (const id of toShow) next.push({ kind: 'widget', id })
        return next
      })
    if (asked.length) setSelectedTool(asked[asked.length - 1])
    if (references.length) hideContext()
    setPrompt('')
  }

  async function copyText(kind: 'id' | 'link', value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(kind)
      window.setTimeout(() => setCopied((current) => (current === kind ? null : current)), 1500)
    } catch {
      setCopied(null)
    }
  }

  function startToolDrag(event: DragEvent, tool: ToolId) {
    event.stopPropagation()
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', tool)
    dragToolRef.current = tool
    suppressToolClickRef.current = true
    setDragTool(tool)
  }

  function endToolDrag() {
    dragToolRef.current = null
    setDragTool(null)
    setDropTarget(null)
    setChatDrop(false)
    window.setTimeout(() => {
      suppressToolClickRef.current = false
    }, 0)
  }

  function addToolToChat(tool: ToolId) {
    if (tool === 'activity') {
      setActivityOn(true)
      setSelectedTool(tool)
      return
    }
    setFeed((current) => {
      const present = current.some((item) => item.kind === 'widget' && item.id === tool)
      return present ? current : [...current, { kind: 'widget', id: tool }]
    })
    setSelectedTool(tool)
  }

  function reorderWidget(from: ToolId, to: ToolId, after: boolean) {
    if (from === to) return
    setFeed((current) => {
      const widgetCount = current.filter((item) => item.kind === 'widget').length
      if (widgetCount < 2) return current
      const moving = current.find((item) => item.kind === 'widget' && item.id === from)
      if (!moving) return current
      const rest = current.filter((item) => !(item.kind === 'widget' && item.id === from))
      const target = rest.findIndex((item) => item.kind === 'widget' && item.id === to)
      if (target < 0) return current
      const next = [...rest]
      next.splice(after ? target + 1 : target, 0, moving)
      return next
    })
    setSelectedTool(from)
  }

  useEffect(() => {
    if (!activityOn) return
    scrollToWidget('activity')
  }, [activityOn])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.scrollTop = stage.scrollHeight
  }, [feed])

  const recordOpen = view?.mode === 'side' && view.recordTitle != null

  function openDetail(tool: ToolId) {
    setSubmissionFocus(null)
    setTableRecord(null)
    if (detailTool === tool && panelOpen) {
      setPanelOpen(false)
      return
    }
    setDetailTool(tool)
    setPanelOpen(true)
  }

  function togglePanel() {
    if (panelOpen && detailTool) {
      setPanelOpen(false)
      return
    }
    if (!detailTool) setDetailTool('claim-details')
    setPanelOpen(true)
  }

  function openSubmission(index: number) {
    const row = SUBMISSION_ROWS[index]
    if (!row) return
    setTableRecord(null)
    setDetailTool('submissions')
    setPanelOpen(true)
    setSubmissionFocus(row)
  }

  function openTableRecord(tool: TableTool, index: number) {
    setSubmissionFocus(null)
    setDetailTool(tool)
    setPanelOpen(true)
    setTableRecord({ tool, index })
  }

  function openClaimDetails() {
    closeRecord()
    setSubmissionOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
    setClaimDetailsOpen(true)
  }

  function openInitialSubmission() {
    closeRecord()
    setClaimDetailsOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
    setSubmissionOpen(false)
    setDetailTool('submissions')
    setPanelOpen(true)
    setSubmissionFocus(INITIAL_CLAIM_SUBMISSION)
  }

  function openDiagnosisCodes() {
    closeRecord()
    setClaimDetailsOpen(false)
    setSubmissionOpen(false)
    setRemittanceOpen(false)
    setDiagnosisOpen(true)
  }

  function openRemittance() {
    closeRecord()
    setClaimDetailsOpen(false)
    setSubmissionOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
    setSubmissionFocus(null)
    setDetailTool('remittances')
    setPanelOpen(true)
    setTableRecord({ tool: 'remittances', index: -1, remittance: IOWA_BLUE_SHIELD_REMITTANCE })
  }

  function closeDrawers() {
    setClaimDetailsOpen(false)
    setSubmissionOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
    closeRecord()
  }

  useEffect(() => {
    if (view?.mode !== 'side') return
    setClaimDetailsOpen(false)
    setSubmissionOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
  }, [view])

  useEffect(() => {
    if (!claimDetailsOpen && !submissionOpen && !diagnosisOpen && !remittanceOpen && !recordOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawers()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [claimDetailsOpen, submissionOpen, diagnosisOpen, remittanceOpen, recordOpen])

  const detailOpen = panelVisible
  const workspaceSized = detailOpen && workspaceWidth != null

  function workspaceMax() {
    const canvas = canvasRef.current
    if (!canvas) return workspaceWidth ?? WORKSPACE_MIN
    const properties = canvas.querySelector<HTMLElement>('.vision2-properties')?.offsetWidth ?? 0
    const rail = canvas.querySelector<HTMLElement>('.vision2-rail')?.offsetWidth ?? 0
    return Math.max(WORKSPACE_MIN, canvas.clientWidth - properties - rail - DETAIL_MIN)
  }

  function resizeWorkspaceBy(delta: number) {
    const current =
      workspaceWidth ??
      canvasRef.current?.querySelector<HTMLElement>('.vision-workspace')?.offsetWidth ??
      WORKSPACE_MIN
    setWorkspaceWidth(Math.round(Math.min(workspaceMax(), Math.max(WORKSPACE_MIN, current + delta))))
  }

  function startWorkspaceResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = event.currentTarget.parentElement?.offsetWidth ?? workspaceWidth ?? WORKSPACE_MIN
    const max = workspaceMax()
    setWorkspaceResizing(true)
    function move(next: PointerEvent) {
      setWorkspaceWidth(Math.round(Math.min(max, Math.max(WORKSPACE_MIN, startWidth + startX - next.clientX))))
    }
    function stop() {
      setWorkspaceResizing(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  useEffect(() => {
    if (!workspaceSized) return
    function clamp() {
      setWorkspaceWidth((current) => {
        if (current == null) return current
        return Math.min(current, workspaceMax())
      })
    }
    window.addEventListener('resize', clamp)
    return () => window.removeEventListener('resize', clamp)
  }, [workspaceSized, propertiesOpen])

  const claimNav = (
    <div className="claim-header vision-claim-nav">
      <div className="claim-header__left">
        {!propertiesOpen && !detailOpen ? (
          <button type="button" className="icon-btn" aria-label="Open properties" onClick={() => setPropertiesOpen(true)}>
            <Icon src={leftPanelClose} size={20} />
          </button>
        ) : null}
        <h1 className="claim-header__title">{CLAIM_ID}</h1>
        <button
          type="button"
          className="icon-btn"
          aria-label={copied === 'link' ? 'Link copied' : 'Copy link'}
          onClick={() => copyText('link', window.location.href)}
        >
          <Icon src={link} size={20} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label={copied === 'id' ? 'ID copied' : 'Copy ID'}
          onClick={() => copyText('id', CLAIM_ID)}
        >
          <Icon src={copy} size={20} />
        </button>
        <button type="button" className="icon-btn" aria-label="More actions">
          <Icon src={moreHoriz} size={20} />
        </button>
      </div>
      <div className="claim-header__right">
        <div className="page-controls vision-page-controls">
          <div className="page-index" role="status" aria-label={`Claim ${claimPosition} of ${CLAIM_TOTAL}`}>
            <span className="page-index__current">{claimPosition}</span>
            <span className="page-index__sep">/</span>
            <span className="page-index__total">{CLAIM_TOTAL}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-shell vision2">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="main-column">
        <GlobalHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
          current={CLAIM_ID}
        />
        <div className="content-row">
          <section className="app-canvas vision-canvas" aria-label="Claim vision">
            <div
              ref={canvasRef}
              className={[
                'vision-canvas__body',
                workspaceSized ? 'vision2-canvas--split' : '',
                workspaceResizing ? 'resize-handle-active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
            {propertiesOpen ? (
            <Vision2Properties
              tab={sideTab}
              onTab={setSideTab}
              onToggle={() => setPropertiesOpen((value) => !value)}
            />
            ) : null}
            {detailOpen && submissionFocus && detailTool === 'submissions' ? (
              <SubmissionPanel
                row={submissionFocus}
                position={
                  (submissionFocus.id === INITIAL_CLAIM_SUBMISSION.id ? [INITIAL_CLAIM_SUBMISSION] : SUBMISSION_ROWS)
                    .findIndex((row) => row.id === submissionFocus.id) + 1
                }
                total={submissionFocus.id === INITIAL_CLAIM_SUBMISSION.id ? 1 : SUBMISSION_ROWS.length}
                onOpenProperties={propertiesOpen ? undefined : () => setPropertiesOpen(true)}
                onClose={() => setSubmissionFocus(null)}
              />
            ) : detailOpen && tableRecord && detailTool === tableRecord.tool ? (
              <TableRecordPanel
                record={tableRecord}
                onOpenProperties={propertiesOpen ? undefined : () => setPropertiesOpen(true)}
                onClose={() => setTableRecord(null)}
              />
            ) : detailOpen && detailTool ? (
              <Vision2Detail
                tool={detailTool}
                showNav={!propertiesOpen}
                onOpenSubmission={openSubmission}
                onOpenTableRecord={openTableRecord}
                onOpenProperties={() => setPropertiesOpen(true)}
                selectedSubmissionIds={selectedSubmissionIds}
                onSelectedSubmissionsChange={setSelectedSubmissionIds}
                selectedRemittanceIds={selectedRemittanceIds}
                onSelectedRemittancesChange={setSelectedRemittanceIds}
              />
            ) : null}
            <div className={propertiesOpen ? 'vision2-body__rest' : 'vision2-body__rest'}>
            <aside
              className={`vision2-rail${detailOpen ? ' vision2-rail--detail' : ''}`}
              aria-label="Claim tools"
            >
              <button
                type="button"
                className="icon-btn vision2-rail__expand"
                aria-label={detailOpen ? 'Close left panel' : 'Open left panel'}
                aria-expanded={detailOpen}
                onClick={togglePanel}
              >
                <Icon src={viewDoubleArrow} size={20} className={detailOpen ? 'vision2-icon-flip' : undefined} />
              </button>
              <div className="vision2-rail__list">
                {TOOLS.filter((tool) => tool.id !== 'activity').map((tool) => {
                      const pinned = pinnedTools.includes(tool.id)
                      const canReorder = pinned && pinnedTools.length > 1
                      const dropClass =
                        dropTarget?.id === tool.id && dragTool !== tool.id
                          ? dropTarget.after
                            ? ' vision-tool--drop-after'
                            : ' vision-tool--drop-before'
                          : ''
                      return (
                        <div
                          key={tool.id}
                          id={`vision-tool-${tool.id}`}
                          className={`${pinned && selectedTool === tool.id ? 'vision-tool vision-tool--selected' : 'vision-tool'}${pinned ? ' vision-tool--jump' : ''}${dragTool === tool.id ? ' vision-tool--dragging' : ''}${detailOpen && detailTool === tool.id ? ' vision-tool--active' : ''}${dropClass}`}
                          draggable
                          onClick={() => {
                            if (suppressToolClickRef.current) return
                            openDetail(tool.id)
                          }}
                          onDragStart={(event) => startToolDrag(event, tool.id)}
                          onDragEnd={endToolDrag}
                          onDragOver={(event) => {
                            if (!dragToolRef.current || dragToolRef.current === tool.id || !canReorder) return
                            event.preventDefault()
                            const after =
                              event.clientY >
                              event.currentTarget.getBoundingClientRect().top +
                                event.currentTarget.offsetHeight / 2
                            setDropTarget((current) =>
                              current?.id === tool.id && current.after === after
                                ? current
                                : { id: tool.id, after },
                            )
                          }}
                          onDrop={(event) => {
                            event.preventDefault()
                            const from = dragToolRef.current
                            if (from && from !== tool.id && canReorder) {
                              const after =
                                event.clientY >
                                event.currentTarget.getBoundingClientRect().top +
                                  event.currentTarget.offsetHeight / 2
                              reorderWidget(from, tool.id, after)
                            }
                            dragToolRef.current = null
                            setDragTool(null)
                            setDropTarget(null)
                          }}
                        >
                          {canReorder ? (
                            <span
                              className="vision-tool__drag"
                              draggable
                              role="button"
                              tabIndex={0}
                              aria-label={`Reorder ${tool.label}`}
                              title="Drag to reorder"
                              onDragStart={(event) => startToolDrag(event, tool.id)}
                              onClick={(event) => event.stopPropagation()}
                              onDragEnd={endToolDrag}
                            >
                              <DragGrip />
                            </span>
                          ) : null}
                          <button
                            type="button"
                            className="vision-tool__name"
                            draggable
                            tabIndex={pinned ? 0 : -1}
                            aria-label={tool.label}
                            aria-pressed={detailOpen && detailTool === tool.id}
                            onDragStart={(event) => startToolDrag(event, tool.id)}
                            onDragEnd={endToolDrag}
                          >
                            <span className="vision-spot" style={{ background: tool.spot }}>
                              <Icon src={tool.icon} size={16} />
                            </span>
                            <span>{tool.label}</span>
                          </button>
                        </div>
                      )
                    })}
              </div>
            </aside>
            <div
              className="vision-workspace"
              style={workspaceSized && workspaceWidth != null ? { width: workspaceWidth, flex: '0 0 auto' } : undefined}
            >
              {detailOpen ? (
                <div
                  className="vision2-workspace__resize"
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize summary"
                  aria-valuemin={WORKSPACE_MIN}
                  aria-valuemax={workspaceMax()}
                  aria-valuenow={workspaceWidth ?? undefined}
                  tabIndex={0}
                  onPointerDown={startWorkspaceResize}
                  onDoubleClick={() => setWorkspaceWidth(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') resizeWorkspaceBy(16)
                    if (event.key === 'ArrowRight') resizeWorkspaceBy(-16)
                  }}
                />
              ) : null}
              {claimNav}
              <div className="vision-workspace__body">
            <div
              className={chatDrop ? 'vision-main vision-main--drop' : 'vision-main'}
              onDragOver={(event) => {
                if (!dragToolRef.current) return
                event.preventDefault()
                event.dataTransfer.dropEffect = 'copy'
                setChatDrop(true)
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
                setChatDrop(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                const from = (event.dataTransfer.getData('text/plain') || dragToolRef.current) as ToolId | null
                endToolDrag()
                if (from && TOOLS.some((tool) => tool.id === from)) addToolToChat(from)
              }}
            >
              <div className="vision-stage" ref={stageRef} role="log" aria-label="Claim chat">
                <div className="vision-stage__inner">
                  <div className="vision2-message">
                    <span className="vision2-emblem" aria-hidden>
                      <AiMark />
                    </span>
                  <section
                    className={
                      askContext?.key === 'summary' ? 'vision-summary vision-summary--context' : 'vision-summary'
                    }
                    aria-labelledby="vision-summary-title"
                    onClick={() => selectAskContext(SUMMARY_CONTEXT)}
                  >
                    <header className="vision-summary__header">
                      <h2 id="vision-summary-title" className="vision2-summary__title">
                        Summary
                      </h2>
                    </header>
                      <div id="vision-summary-body">
                        <div className="claim-summary__details">
                          <div className="claim-summary__section">
                            <p className="claim-summary__section-title">Where things stand</p>
                            <p className="claim-summary__body">
                              This claim was fully <span className="claim-summary__error">denied</span>.
                              Rock Valley Physical Therapy and Therapy Services billed Iowa Blue Shield
                              $386.00 for four therapy lines on October 7, 2026.{' '}
                              <SummaryLink tool="submissions" onOpen={openInitialSubmission}>
                                The initial claim went out on October 9, 2026
                              </SummaryLink>
                              , and{' '}
                              <SummaryLink tool="remittances" onOpen={openRemittance}>
                                Iowa Blue Shield&apos;s remittance dated October 14, 2026
                              </SummaryLink>{' '}
                              denied all four lines — 97110, 97112, 97140, and 97161 — under CO-16
                              (claim lacks information or has a billing error) with remark M76
                              (missing, incomplete, or invalid diagnosis or condition). Nothing has
                              been paid, and the full $346.00 balance remains open.
                            </p>
                          </div>
                          <div className="claim-summary__section">
                            <p className="claim-summary__section-title">What to do next</p>
                            <p className="claim-summary__body">
                              Review the{' '}
                              <SummaryLink tool="claim-details" onOpen={openDiagnosisCodes}>
                                diagnosis codes
                              </SummaryLink>{' '}
                              submitted on this claim. Iowa Blue Shield&apos;s denial under CO-16 with
                              remark M76 points specifically to a problem with the diagnosis or
                              condition information, not the procedure codes themselves. Correct
                              whichever diagnosis is missing, incomplete, or invalid and resubmit to
                              Iowa Blue Shield. If all three codes look correct as submitted, contact
                              the payer to confirm what specific information they require before
                              resubmitting.
                            </p>
                          </div>
                          <div className="claim-summary__feedback">
                            <button
                              type="button"
                              className={
                                feedback === 'up'
                                  ? 'icon-btn vision-feedback--selected'
                                  : 'icon-btn'
                              }
                              aria-pressed={feedback === 'up'}
                              aria-label="Good response"
                              title="Good response"
                              onClick={() => setFeedback((value) => (value === 'up' ? null : 'up'))}
                            >
                              <Icon src={thumbUp} size={20} />
                            </button>
                            <button
                              type="button"
                              className={
                                feedback === 'down'
                                  ? 'icon-btn vision-feedback--selected'
                                  : 'icon-btn'
                              }
                              aria-pressed={feedback === 'down'}
                              aria-label="Bad response"
                              title="Bad response"
                              onClick={() =>
                                setFeedback((value) => (value === 'down' ? null : 'down'))
                              }
                            >
                              <Icon src={thumbDown} size={20} />
                            </button>
                          </div>
                        </div>

                        <div className="claim-summary__suggested vision-suggested">
                          <p className="claim-summary__actions-label">Suggested Actions</p>
                          <div
                            className={
                              askContext?.key === 'action:diagnosis'
                                ? 'vision-step-card vision-step-card--context'
                                : 'vision-step-card'
                            }
                            onClick={(event) => {
                              event.stopPropagation()
                              selectAskContext(DIAGNOSIS_ACTION_CONTEXT)
                            }}
                          >
                            <span className="vision-step__num">1.</span>
                            <button
                              type="button"
                              className="btn btn--primary vision-action--primary"
                              aria-pressed={diagnosisChoice === 'replace'}
                              onClick={() => setDiagnosisChoice('replace')}
                            >
                              <Icon src={checkCircle} size={14} />
                              Replace M54.5 with M54.50
                            </button>
                            <span className="vision-step__or">Or</span>
                            <button
                              type="button"
                              className="btn btn--accent-outline"
                              aria-pressed={diagnosisChoice === 'remove'}
                              onClick={() => setDiagnosisChoice('remove')}
                            >
                              <Icon src={checkCircle} size={14} />
                              Remove Diagnosis
                            </button>
                          </div>
                          <p className="vision-followup">After the diagnosis is fixed</p>
                          <div className="vision-step-card" onClick={(event) => event.stopPropagation()}>
                            <span className="vision-step__num">2.</span>
                            <button
                              type="button"
                              className="btn btn--primary vision-action--primary"
                              onClick={() => send('Resubmit to Iowa Blue Shield')}
                            >
                              <Icon src={checkCircle} size={14} />
                              Resubmit to Iowa Blue Shield
                            </button>
                            <span className="vision-step__or">Or</span>
                            <button type="button" className="btn btn--accent-outline" onClick={() => ask()}>
                              <Icon src={checkCircle} size={14} />
                              Other Actions
                            </button>
                          </div>
                        </div>
                      </div>
                  </section>
                  </div>
                  {feed.map((item, index) => {
                    const latest = index === feed.length - 1 ? { 'data-chat-latest': '' } : {}
                    if (item.kind === 'widget') {
                      return (
                        <div key={`widget-${item.id}`} className="vision-chat-slot" {...latest}>
                          <PinnedToolWidget
                            id={item.id}
                            onOpenSubmission={openSubmission}
                            onOpenTableRecord={openTableRecord}
                            selectedSubmissionIds={selectedSubmissionIds}
                            onSelectedSubmissionsChange={setSelectedSubmissionIds}
                            selectedRemittanceIds={selectedRemittanceIds}
                            onSelectedRemittancesChange={setSelectedRemittanceIds}
                          />
                        </div>
                      )
                    }
                    return (
                      <div
                        key={item.id}
                        className={item.kind === 'user' ? 'vision-chat vision-chat--user' : 'vision-chat vision-chat--assistant'}
                        {...latest}
                      >
                        {item.kind === 'assistant' ? (
                          <span className="vision-chat__emblem" aria-hidden>
                            <span className="ai-mark">
                              <img src={aiGroup1} alt="" width={11} height={20} className="ai-mark__a" />
                              <img src={aiGroup2} alt="" width={20} height={11} className="ai-mark__b" />
                            </span>
                          </span>
                        ) : null}
                        <div className="vision-chat__body">
                          <span className="vision-chat__who">{item.kind === 'user' ? 'You' : 'Ask Athelas'}</span>
                          <div className="vision-chat__bubble">
                            {item.kind === 'user' && item.references.length ? (
                              <div className="vision2-refs">
                                {item.references.map((reference) => (
                                  <div key={reference.key} className="vision2-ref">
                                    <span className="vision2-ref__preview" aria-hidden>
                                      <img src={reference.icon} alt="" width={16} height={16} />
                                    </span>
                                    <p className="vision2-ref__label">
                                      <span className="vision2-ref__tool">{reference.tool}</span>
                                      {reference.detail}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                            {item.text ? <p>{item.text}</p> : null}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {activityOn ? (
                    <div className="vision-chat-slot">
                      <PinnedToolWidget
                        id="activity"
                        onOpenSubmission={openSubmission}
                        onOpenTableRecord={openTableRecord}
                        selectedSubmissionIds={selectedSubmissionIds}
                        onSelectedSubmissionsChange={setSelectedSubmissionIds}
                        selectedRemittanceIds={selectedRemittanceIds}
                        onSelectedRemittancesChange={setSelectedRemittanceIds}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <form
                className="vision-ask"
                onSubmit={(event) => {
                  event.preventDefault()
                  send()
                }}
              >
                <div className="vision-ask__inner">
                  <div className="vision2-ask-stack">
                  {composerContext ? (
                    <div className="vision2-context">
                      <div className="vision2-context__head">
                        <div className="vision2-context__titles">
                          <p className="vision2-context__label">{composerContext.title}</p>
                        </div>
                        {composerContext.compare ? <span className="vision2-context__badge">Compare</span> : null}
                        <button
                          type="button"
                          className="vision2-context__clear"
                          aria-label="Clear selected context"
                          onClick={hideContext}
                        >
                          <img src={appealClose} alt="" width={14} height={14} />
                        </button>
                      </div>
                      {composerContext.chips.length ? (
                        <div className="vision2-context__chips">
                          {composerContext.chips.map((chip) => (
                            <span key={chip.key} className="vision2-context__chip">
                              <img src={chip.icon} alt="" width={14} height={14} />
                              <span>{chip.label}</span>
                              {chip.removable ? (
                                <button
                                  type="button"
                                  aria-label={`Remove ${chip.label}`}
                                  onClick={() =>
                                    setSelectedSubmissionIds((ids) => ids.filter((id) => id !== chip.key))
                                  }
                                >
                                  <img src={appealClose} alt="" width={12} height={12} />
                                </button>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className={`vision-composer${composerContext ? ' vision-composer--context' : ''}`}>
                    <input
                      ref={promptRef}
                      className="vision-composer__input"
                      value={prompt}
                      placeholder="Ask anything..."
                      aria-label="Ask anything"
                      onChange={(event) => setPrompt(event.target.value)}
                    />
                    <div className="vision2-composer__actions">
                      <button type="button" className="icon-btn" aria-label="Attach file">
                        <Icon src={attachFile} size={18} />
                      </button>
                      <span className="vision2-composer__end">
                        <button type="button" className="icon-btn" aria-label="Dictate">
                          <MicIcon />
                        </button>
                        <button type="submit" className="vision-send" aria-label="Send">
                          <ArrowUpIcon />
                        </button>
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
              </form>
            </div>
              </div>
            </div>
            </div>
            </div>
            {claimDetailsOpen ? (
              <VisionDrawer title="Claim Details" onClose={closeDrawers}>
                <ClaimDetailsSplitContent />
              </VisionDrawer>
            ) : null}
            {submissionOpen ? (
              <VisionDrawer title="Oct 09, 2026" onClose={closeDrawers}>
                <SubmissionDetail recordIndex={0} row={INITIAL_CLAIM_SUBMISSION} />
              </VisionDrawer>
            ) : null}
            {diagnosisOpen ? (
              <VisionDrawer title="Diagnosis Codes" onClose={closeDrawers}>
                <DiagnosisCodes />
              </VisionDrawer>
            ) : null}
            {remittanceOpen ? (
              <VisionDrawer title="Oct 14, 2026" onClose={closeDrawers}>
                <RemittanceDetail recordIndex={0} row={IOWA_BLUE_SHIELD_REMITTANCE} paidBy="Iowa Blue Shield" />
              </VisionDrawer>
            ) : null}
            {recordOpen && view ? (
              <VisionDrawer title={view.recordTitle ?? view.title} onClose={closeRecord}>
                {view.widgetId === 'submissions' && view.recordIndex != null ? (
                  <SubmissionDetail key={view.recordIndex} recordIndex={view.recordIndex} />
                ) : null}
                {view.widgetId === 'remittances' && view.recordIndex != null ? (
                  <RemittanceDetail key={view.recordIndex} recordIndex={view.recordIndex} />
                ) : null}
              </VisionDrawer>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  )
}

const VISION_DIAGNOSES: [string, string][] = [
  ['M54.5', 'Low back pain'],
  ['M62.81', 'Muscle weakness (generalized)'],
  ['R26.2', 'Difficulty in walking, not elsewhere classified'],
]

function VisionDrawer({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <>
      <button type="button" className="widget-view-backdrop" aria-label={`Close ${title}`} onClick={onClose} />
      <aside className="widget-view-panel widget-view-panel--side vision-drawer" aria-label={title}>
        <div className="panel-header widget-view-panel__header">
          <h2 className="panel-header__title">{title}</h2>
          <div className="widget-view-panel__header-actions">
            <button
              type="button"
              className="icon-btn icon-btn--outlined"
              aria-label={`Close ${title}`}
              title="Close"
              onClick={onClose}
            >
              <Icon src={viewDoubleArrow} size={20} />
            </button>
          </div>
        </div>
        <div className="widget-view-panel__body">{children}</div>
      </aside>
    </>
  )
}

function DiagnosisCodes() {
  return (
    <div className="claim-details-split__table-wrap vision-diagnosis">
      <table className="claim-details-split__table">
        <thead>
          <tr>
            <th className="claim-details-split__th">Code</th>
            <th className="claim-details-split__th">Description</th>
          </tr>
        </thead>
        <tbody>
          {VISION_DIAGNOSES.map(([code, description]) => (
            <tr key={code}>
              <td className="claim-details-split__td claim-details-split__td--link">{code}</td>
              <td className="claim-details-split__td">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TABLE_TOOLS = new Set<ToolId>(['submissions', 'remittances', 'attachments', 'payments', 'similar-claims'])

function TableRecordPanel({
  record,
  onOpenProperties,
  onClose,
}: {
  record: TableRecord
  onOpenProperties?: () => void
  onClose: () => void
}) {
  const copy = RECORD_COPY[record.tool]
  const total = tableRecordCount(record)
  const position = record.index < 0 ? 1 : record.index + 1

  return (
    <aside className="vision2-detail" aria-label={copy.title}>
      <header className="vision2-submission__head">
        <div className="vision2-submission__title-group">
          {onOpenProperties ? (
            <button type="button" className="icon-btn" aria-label="Open properties" onClick={onOpenProperties}>
              <img src={leftPanelClose} alt="" width={20} height={20} />
            </button>
          ) : null}
          <h2 className="vision2-submission__title">{copy.title}</h2>
        </div>
        <div className="vision2-submission__tools">
          <span className="vision2-submission__count">
            <span>{position}</span>
            <span className="vision2-submission__count-sep">/</span>
            <span className="vision2-submission__count-total">{total}</span>
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Back to ${copy.list}`}
            title={`Back to ${copy.list}`}
            onClick={onClose}
          >
            <img src={appealClose} alt="" width={20} height={20} />
          </button>
        </div>
      </header>
      <div className="vision2-record">
        <TableRecordBody record={record} />
      </div>
    </aside>
  )
}

function RecordFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="vision2-submission__fact">
      <span className="vision2-submission__fact-label">{label}</span>
      <span className="vision2-submission__fact-value">{value}</span>
    </div>
  )
}

function TableRecordBody({ record }: { record: TableRecord }) {
  if (record.tool === 'remittances') {
    const row = record.remittance ?? REMITTANCE_ROWS[record.index]
    if (!row) return null
    return <RemittanceDetail recordIndex={Math.max(record.index, 0)} row={row} paidBy={record.remittance ? 'Iowa Blue Shield' : 'UMR'} />
  }

  if (record.tool === 'payments') {
    const row = PAYMENT_RECORDS[record.index]
    if (!row) return null
    return (
      <div className="vision2-submission__facts vision2-record__facts">
        <RecordFact label="Name" value={row.label} />
        <RecordFact label="Kind" value={row.kind} />
        <RecordFact label="Charges" value={row.charges} />
        <RecordFact label="Paid" value={row.paid} />
        <RecordFact label="PR" value={row.pr} />
        <RecordFact label="Adj." value={row.adj} />
        <RecordFact label="Balance" value={row.balance} />
      </div>
    )
  }

  if (record.tool === 'attachments') {
    const row = DOCUMENT_ROWS[record.index]
    if (!row) return null
    return (
      <div className="vision2-submission__facts vision2-record__facts">
        <RecordFact label="Name" value={row.name} />
        <RecordFact label="Type" value={row.type} />
        <RecordFact label="Document Date" value={row.date} />
        <RecordFact label="Tags" value={row.tags.join(', ')} />
      </div>
    )
  }

  const claim = SIMILAR_CLAIM_ROWS[record.index]
  if (!claim) return null
  return (
    <div className="vision2-submission__facts vision2-record__facts">
      <RecordFact label="Claim ID" value={claim.id} />
      <RecordFact label="Status" value={claim.status} />
      <RecordFact label="Stage" value={claim.stage} />
      <RecordFact label="Provider" value={claim.provider} />
      <RecordFact label="Date of Service" value={claim.dateOfService} />
      <RecordFact label="Assignee" value={claim.assignee} />
    </div>
  )
}

function Vision2Detail({
  tool,
  showNav,
  onOpenSubmission,
  onOpenTableRecord,
  onOpenProperties,
  selectedSubmissionIds,
  onSelectedSubmissionsChange,
  selectedRemittanceIds,
  onSelectedRemittancesChange,
}: {
  tool: ToolId
  showNav: boolean
  onOpenSubmission: (index: number) => void
  onOpenTableRecord: (tool: TableTool, index: number) => void
  onOpenProperties: () => void
  selectedSubmissionIds: string[]
  onSelectedSubmissionsChange: (ids: string[]) => void
  selectedRemittanceIds: string[]
  onSelectedRemittancesChange: (ids: string[]) => void
}) {
  const label = TOOLS.find((item) => item.id === tool)?.label ?? 'Details'
  const table = TABLE_TOOLS.has(tool)
  const [attachmentSearchOpen, setAttachmentSearchOpen] = useState(false)
  const [attachmentQuery, setAttachmentQuery] = useState('')
  return (
    <aside className="vision2-detail" aria-label={label}>
      {showNav ? (
      <div className="vision2-detail__bar">
        <button type="button" className="icon-btn" aria-label="Open properties" onClick={onOpenProperties}>
          <img src={leftPanelClose} alt="" width={20} height={20} />
        </button>
      </div>
      ) : null}
      <div className="vision2-detail__heading">
        <h2 className="vision2-detail__title">{label}</h2>
        {tool === 'attachments' && attachmentSearchOpen ? (
          <input
            className="vision2-detail__search"
            value={attachmentQuery}
            placeholder="Search attachments"
            aria-label="Search attachments"
            autoFocus
            onChange={(event) => setAttachmentQuery(event.target.value)}
          />
        ) : null}
        {table ? (
          <div className="vision2-detail__heading-actions">
            {tool === 'attachments' ? (
              <button
                type="button"
                className="vision2-detail__tool"
                aria-label="Search attachments"
                aria-pressed={attachmentSearchOpen}
                onClick={() => {
                  setAttachmentSearchOpen((current) => {
                    if (current) setAttachmentQuery('')
                    return !current
                  })
                }}
              >
                <img src={search} alt="" width={20} height={20} />
              </button>
            ) : null}
            <button type="button" className="vision2-detail__tool" aria-label="Filters">
              <img src={tune} alt="" width={20} height={20} />
            </button>
          </div>
        ) : null}
      </div>
      <div className={table ? 'vision2-detail__body vision2-detail__body--flush' : 'vision2-detail__body'}>
        <DetailBody
          tool={tool}
          onOpenSubmission={onOpenSubmission}
          onOpenTableRecord={onOpenTableRecord}
          selectedSubmissionIds={selectedSubmissionIds}
          onSelectedSubmissionsChange={onSelectedSubmissionsChange}
          selectedRemittanceIds={selectedRemittanceIds}
          onSelectedRemittancesChange={onSelectedRemittancesChange}
          attachmentQuery={attachmentQuery}
        />
      </div>
    </aside>
  )
}

function DetailBody({
  tool,
  onOpenSubmission,
  onOpenTableRecord,
  selectedSubmissionIds,
  onSelectedSubmissionsChange,
  selectedRemittanceIds,
  onSelectedRemittancesChange,
  attachmentQuery = '',
}: {
  tool: ToolId
  onOpenSubmission: (index: number) => void
  onOpenTableRecord: (tool: TableTool, index: number) => void
  selectedSubmissionIds: string[]
  onSelectedSubmissionsChange: (ids: string[]) => void
  selectedRemittanceIds: string[]
  onSelectedRemittancesChange: (ids: string[]) => void
  attachmentQuery?: string
}) {
  if (tool === 'claim-details') return <ClaimDetailsSplitContent />
  if (tool === 'activity') return <ActivityWidget hideHeader />
  if (tool === 'submissions') {
    return (
      <SubmissionsWidget
        hideHeader
        layout="cards"
        onOpenRecord={onOpenSubmission}
        sortOn="submitted"
        sortDescending
        selectable
        selectedIds={selectedSubmissionIds}
        onSelectedChange={onSelectedSubmissionsChange}
      />
    )
  }
  if (tool === 'remittances') {
    return (
      <RemittancesWidget
        hideHeader
        layout="cards"
        onOpenRecord={(index) => onOpenTableRecord('remittances', index)}
        selectable
        selectedIds={selectedRemittanceIds}
        onSelectedChange={onSelectedRemittancesChange}
      />
    )
  }
  if (tool === 'attachments') {
    return (
      <DocumentationWidget
        title="Attachments"
        hideHeader
        layout="cards"
        searchQuery={attachmentQuery}
        onOpenRecord={(index) => onOpenTableRecord('attachments', index)}
      />
    )
  }
  if (tool === 'payments') return <PaymentsWidget hideHeader onOpenRecord={(index) => onOpenTableRecord('payments', index)} />
  if (tool === 'appeals') return <p className="claim-v2__empty">No appeals have been filed for this claim.</p>
  return <SimilarClaimsWidget onOpenRecord={(index) => onOpenTableRecord('similar-claims', index)} />
}

function PinnedToolWidget({
  id,
  onOpenSubmission,
  onOpenTableRecord,
  selectedSubmissionIds,
  onSelectedSubmissionsChange,
  selectedRemittanceIds,
  onSelectedRemittancesChange,
}: {
  id: ToolId
  onOpenSubmission: (index: number) => void
  onOpenTableRecord: (tool: TableTool, index: number) => void
  selectedSubmissionIds: string[]
  onSelectedSubmissionsChange: (ids: string[]) => void
  selectedRemittanceIds: string[]
  onSelectedRemittancesChange: (ids: string[]) => void
}) {
  const tool = TOOLS.find((item) => item.id === id)
  if (!tool) return null
  if (id === 'claim-details') return <ClaimDetailsCard />

  return (
    <section className="vision-widget vision-widget--table" id={`vision-widget-${id}`} aria-label={tool.label}>
      <header className="vision-widget__header">
        <span className="vision-spot" style={{ background: tool.spot }}>
          <Icon src={tool.icon} size={16} />
        </span>
        <h2 className="vision-widget__title">{tool.label}</h2>
      </header>
      <div className="vision-widget__body">
        {id === 'activity' ? <ActivityWidget hideHeader /> : null}
        {id === 'submissions' ? (
          <SubmissionsWidget
            hideHeader
            onOpenRecord={onOpenSubmission}
            selectable
            selectedIds={selectedSubmissionIds}
            onSelectedChange={onSelectedSubmissionsChange}
          />
        ) : null}
        {id === 'remittances' ? (
          <RemittancesWidget
            hideHeader
            onOpenRecord={(index) => onOpenTableRecord('remittances', index)}
            selectable
            selectedIds={selectedRemittanceIds}
            onSelectedChange={onSelectedRemittancesChange}
          />
        ) : null}
        {id === 'attachments' ? <DocumentationWidget title="Attachments" hideHeader onOpenRecord={(index) => onOpenTableRecord('attachments', index)} /> : null}
        {id === 'payments' ? <PaymentsWidget hideHeader onOpenRecord={(index) => onOpenTableRecord('payments', index)} /> : null}
        {id === 'appeals' ? (
          <p className="claim-v2__empty">No appeals have been filed for this claim.</p>
        ) : null}
        {id === 'similar-claims' ? <SimilarClaimsWidget onOpenRecord={(index) => onOpenTableRecord('similar-claims', index)} /> : null}
      </div>
    </section>
  )
}

function ClaimDetailsCard() {
  return (
    <section className="vision-widget vision-widget--details" id="vision-widget-claim-details" aria-labelledby="vision-claim-details-title">
      <header className="vision-widget__header">
        <span className="vision-spot" style={{ background: '#d5e8f6' }}>
          <Icon src={spotDocs} size={16} />
        </span>
        <h2 id="vision-claim-details-title" className="vision-widget__title">Claim Details</h2>
      </header>
      <div className="vision-widget__body">
        <ClaimDetailsSplitContent />
      </div>
    </section>
  )
}

