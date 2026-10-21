import { useEffect, useRef, useState, type ReactNode } from 'react'
import spotDocs from '../assets/figma/spot-docs.svg'
import {
  activityAppointment,
  appealInfo,
  attachFile,
  checkCircle,
  copy,
  dynamicFeed,
  keyboardArrowDown,
  keyboardArrowDown2,
  keyboardArrowDown3,
  layoutColumns,
  link,
  monetizationOn,
  moreHoriz,
  propsChipClose,
  reviewOpenInNew,
  send as sendIcon,
  sendPanel,
  viewDoubleArrow,
  stickyNote,
  thumbDown,
  thumbUp,
  aiGroup1,
  aiGroup2,
  collapseContent,
} from '../assets/icons'
import { GlobalHeader, PropertiesBody, Sidebar } from './ClaimDetailsPage'
import { ClaimV2Panel, type V2TabId } from './ClaimV2Panel'
import {
  DEFAULT_TAB_ORDER,
  SPLIT_DEFAULT_RATIO,
  useClaimSplitView,
  type ClaimSplitState,
} from './claimSplitView'
import { ActivityWidget } from './ActivityWidget'
import { ClaimWidgetsCollapseProvider } from './ClaimWidgetCollapse'
import { DocumentationWidget } from './DocumentationWidget'
import { PaymentsWidget } from './PaymentsWidget'
import { RemittanceDetail } from './RemittanceDetail'
import { RemittancesWidget } from './RemittancesWidget'
import { IOWA_BLUE_SHIELD_REMITTANCE } from './remittancesData'
import { ClaimDetailsSplitContent } from './ClaimDetailsSplitContent'
import { SimilarClaimsWidget } from './SimilarClaimsWidget'
import { SubmissionDetail } from './SubmissionDetail'
import { SubmissionsWidget } from './SubmissionsWidget'
import { INITIAL_CLAIM_SUBMISSION } from './submissionsData'
import { useWidgetView, WidgetViewProvider } from './widgetView'

const CLAIM_ID = '22316691'
const CLAIM_TOTAL = 30

const SHORTCUTS = [
  'Why was 97140 adjudicated?',
  'What changed in the resubmission?',
  'Has this payer denied PI-252 before?',
]

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

type ChatItem =
  | { kind: 'widget'; id: ToolId }
  | { kind: 'user'; id: string; text: string }
  | { kind: 'assistant'; id: string; text: string }

function replyFor(text: string) {
  return (
    CHAT_REPLIES[text] ??
    'This claim was fully denied under CO-16 with remark M76 on lines 97110, 97112, 97140, and 97161. I can walk through the denial, the diagnosis codes, or the next step.'
  )
}

const TOOLS = [
  { id: 'claim-details', label: 'Claim Details', icon: spotDocs, spot: '#d5e8f6' },
  { id: 'submissions', label: 'Submissions', icon: sendPanel, spot: '#e5f6e8' },
  { id: 'remittances', label: 'Remittances', icon: monetizationOn, spot: '#fbf3d5' },
  { id: 'attachments', label: 'Attachments', icon: attachFile, spot: '#e3f6ef' },
  { id: 'payments', label: 'Payments', icon: monetizationOn, spot: '#ece7fb' },
  { id: 'appeals', label: 'Appeals', icon: appealInfo, spot: '#fde8d8' },
  { id: 'similar-claims', label: 'Similar Claims', icon: dynamicFeed, spot: '#f3e8fb' },
  { id: 'activity', label: 'Activity', icon: activityAppointment, spot: '#ece7fb' },
] as const

type ToolId = (typeof TOOLS)[number]['id']

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

export function VisionPage() {
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(true)
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [diagnosisChoice, setDiagnosisChoice] = useState<'replace' | 'remove' | null>(null)
  const [prompt, setPrompt] = useState('')
  const [claimPosition, setClaimPosition] = useState(1)
  const toolsOpen = true
  const [propertiesOpen, setPropertiesOpen] = useState(true)
  const [feed, setFeed] = useState<ChatItem[]>([])
  const [activityOn, setActivityOn] = useState(false)
  const [layoutPrompt, setLayoutPrompt] = useState(false)
  const [shortcutsVisible, setShortcutsVisible] = useState(true)
  const messageId = useRef(0)
  const pinnedTools = feed.flatMap((item) => (item.kind === 'widget' ? [item.id] : []))
  const [selectedTool, setSelectedTool] = useState<ToolId | null>(null)
  const dragToolRef = useRef<ToolId | null>(null)
  const [dragTool, setDragTool] = useState<ToolId | null>(null)
  const [dropTarget, setDropTarget] = useState<{ id: ToolId; after: boolean } | null>(null)
  const [copied, setCopied] = useState<'id' | 'link' | null>(null)
  const [toolsExpanded, setToolsExpanded] = useState(false)
  const [submissionOpen, setSubmissionOpen] = useState(false)
  const [diagnosisOpen, setDiagnosisOpen] = useState(false)
  const [remittanceOpen, setRemittanceOpen] = useState(false)
  const [splitState, setSplitState] = useState<ClaimSplitState>({
    left: 'details',
    right: null,
    focused: 'left',
    ratio: SPLIT_DEFAULT_RATIO,
  })
  const [tabOrder, setTabOrder] = useState<V2TabId[]>([...DEFAULT_TAB_ORDER])
  const [splitHintDismissed, setSplitHintDismissed] = useState(false)
  const split = useClaimSplitView(splitState, setSplitState)

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

  function send(text?: string) {
    const message = (text ?? prompt).trim()
    if (!message) return
    setShortcutsVisible(false)
    messageId.current += 1
    const userId = `user-${messageId.current}`
    messageId.current += 1
    const assistantId = `assistant-${messageId.current}`
      const asked = widgetsAsked(message)
      const toShow = asked.filter((id) => id !== 'activity')
      if (asked.includes('activity')) setActivityOn(true)
      if (toShow.length > 0 || (asked.includes('activity') && !activityOn)) setLayoutPrompt(true)
      setFeed((current) => {
        const withoutAsked = current.filter(
          (item) => !(item.kind === 'widget' && toShow.some((id) => id === item.id)),
        )
        const next: ChatItem[] = [
          ...withoutAsked,
          { kind: 'user', id: userId, text: message },
          { kind: 'assistant', id: assistantId, text: asked.length ? widgetIntro(asked) : replyFor(message) },
        ]
        for (const id of toShow) next.push({ kind: 'widget', id })
        return next
      })
    if (asked.length) setSelectedTool(asked[asked.length - 1])
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

  function pinTool(tool: ToolId, pinned: boolean) {
    if (tool === 'activity') {
      setActivityOn(pinned)
      setLayoutPrompt(true)
      if (pinned) {
        setShortcutsVisible(false)
        setSelectedTool(tool)
      } else {
        setSelectedTool((current) => (current === tool ? null : current))
      }
      return
    }
    if (pinned) setShortcutsVisible(false)
    setLayoutPrompt(true)
    setFeed((current) => {
      const present = current.some((item) => item.kind === 'widget' && item.id === tool)
      if (pinned) return present ? current : [...current, { kind: 'widget', id: tool }]
      return current.filter((item) => !(item.kind === 'widget' && item.id === tool))
    })
    if (pinned) setSelectedTool(tool)
    else setSelectedTool((current) => (current === tool ? null : current))
  }

  function reorderWidget(from: ToolId, to: ToolId, after: boolean) {
    if (from === to) return
    setLayoutPrompt(true)
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
    const latest = stage?.querySelector<HTMLElement>('[data-chat-latest]')
    if (!stage || !latest) return
    const top = latest.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop - 24
    stage.scrollTo({ top, behavior: 'smooth' })
  }, [feed])

  const recordOpen = view?.mode === 'side' && view.recordTitle != null

  function openInitialSubmission() {
    closeRecord()
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
    setSubmissionOpen(true)
  }

  function openDiagnosisCodes() {
    closeRecord()
    setSubmissionOpen(false)
    setRemittanceOpen(false)
    setDiagnosisOpen(true)
  }

  function openRemittance() {
    closeRecord()
    setSubmissionOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(true)
  }

  function closeDrawers() {
    setSubmissionOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
    closeRecord()
  }

  useEffect(() => {
    if (view?.mode !== 'side') return
    setSubmissionOpen(false)
    setDiagnosisOpen(false)
    setRemittanceOpen(false)
  }, [view])

  useEffect(() => {
    if (!submissionOpen && !diagnosisOpen && !remittanceOpen && !recordOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeDrawers()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [submissionOpen, diagnosisOpen, remittanceOpen, recordOpen])

  const resubmitReady = diagnosisChoice != null

  const claimNav = (
    <div className="claim-header vision-claim-nav">
      <div className="claim-header__left">
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
          <div className="vision-page-controls__arrows">
            <button
              type="button"
              className="icon-btn"
              aria-label="Next claim"
              disabled={claimPosition >= CLAIM_TOTAL}
              onClick={() => setClaimPosition((value) => Math.min(CLAIM_TOTAL, value + 1))}
            >
              <Icon src={keyboardArrowDown2} size={18} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Previous claim"
              disabled={claimPosition <= 1}
              onClick={() => setClaimPosition((value) => Math.max(1, value - 1))}
            >
              <Icon src={keyboardArrowDown2} size={18} className="vision-summary__chevron--open" />
            </button>
          </div>
          <div className="page-index" role="status" aria-label={`Claim ${claimPosition} of ${CLAIM_TOTAL}`}>
            <span className="page-index__current">{claimPosition}</span>
            <span className="page-index__sep">/</span>
            <span className="page-index__total">{CLAIM_TOTAL}</span>
          </div>
        </div>
        <div className="claim-header__divider" aria-hidden />
        <button type="button" className="btn btn--secondary">
          Actions
          <Icon src={keyboardArrowDown3} size={14} />
        </button>
        <button type="button" className="btn btn--primary">
          <Icon src={sendIcon} size={14} />
          Submit
        </button>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="main-column">
        <GlobalHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        />
        <div className="content-row">
          <section
            className={toolsExpanded ? 'app-canvas vision-canvas vision-canvas--expanded' : 'app-canvas vision-canvas'}
            aria-label="Claim vision"
          >
            {claimNav}
            <div className="vision-canvas__body">
            <aside
              className={toolsExpanded ? 'vision-tools vision-tools--expanded' : 'vision-tools'}
              aria-label="Claim tools"
            >
              {toolsExpanded ? (
                <ClaimV2Panel
                  split={split}
                  tabOrder={tabOrder}
                  onTabOrderChange={setTabOrder}
                  showSplitHint={!splitHintDismissed}
                  onDismissSplitHint={() => setSplitHintDismissed(true)}
                  tabActions={
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label="Collapse tools"
                      title="Collapse tools"
                      onClick={() => setToolsExpanded(false)}
                    >
                      <Icon src={collapseContent} size={16} />
                    </button>
                  }
                />
              ) : (
              <>
              {layoutPrompt ? (
                <div className="vision-layout-banner" role="status">
                  <Icon src={layoutColumns} size={16} className="vision-layout-banner__icon" />
                  <p className="vision-layout-banner__text">Use this layout for all claims?</p>
                  <button type="button" className="vision-layout-banner__yes" onClick={() => setLayoutPrompt(false)}>
                    Yes
                  </button>
                  <button
                    type="button"
                    className="icon-btn vision-layout-banner__close"
                    aria-label="Dismiss layout prompt"
                    onClick={() => setLayoutPrompt(false)}
                  >
                    <Icon src={propsChipClose} size={16} />
                  </button>
                </div>
              ) : null}
              <div className="vision-tools__list">
                <div className="vision-prop">
                  <button
                    type="button"
                    className="vision-tool"
                    aria-expanded={propertiesOpen}
                    onClick={() => setPropertiesOpen((value) => !value)}
                  >
                    <span className="vision-spot" style={{ background: '#f2f2f2' }}>
                      <Icon src={stickyNote} size={16} />
                    </span>
                    <span>Properties</span>
                    <Icon
                      src={keyboardArrowDown}
                      size={20}
                      className={propertiesOpen ? 'vision-tool__chevron vision-summary__chevron--open' : 'vision-tool__chevron'}
                    />
                  </button>
                </div>
                {propertiesOpen ? <PropertiesFields /> : null}
                {toolsOpen
                  ? TOOLS.map((tool) => {
                      const pinned = tool.id === 'activity' ? activityOn : pinnedTools.includes(tool.id)
                      const canReorder = tool.id !== 'activity' && pinned && pinnedTools.length > 1
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
                          className={`${pinned && selectedTool === tool.id ? 'vision-tool vision-tool--selected' : 'vision-tool'}${pinned ? ' vision-tool--jump' : ''}${dragTool === tool.id ? ' vision-tool--dragging' : ''}${dropClass}`}
                          onClick={() => {
                            if (pinned) scrollToWidget(tool.id)
                          }}
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
                              onDragStart={(event) => {
                                event.dataTransfer.effectAllowed = 'move'
                                event.dataTransfer.setData('text/plain', tool.id)
                                dragToolRef.current = tool.id
                                setDragTool(tool.id)
                              }}
                              onClick={(event) => event.stopPropagation()}
                              onDragEnd={() => {
                                dragToolRef.current = null
                                setDragTool(null)
                                setDropTarget(null)
                              }}
                            >
                              <DragGrip />
                            </span>
                          ) : null}
                          <button
                            type="button"
                            className="vision-tool__name"
                            tabIndex={pinned ? 0 : -1}
                            aria-label={pinned ? `Scroll to ${tool.label}` : tool.label}
                          >
                            <span className="vision-spot" style={{ background: tool.spot }}>
                              <Icon src={tool.icon} size={16} />
                            </span>
                            <span>{tool.label}</span>
                          </button>
                          <button
                            type="button"
                            className={pinned ? 'vision-switch vision-switch--on' : 'vision-switch'}
                            role="switch"
                            aria-checked={pinned}
                            aria-label={`${pinned ? 'Hide' : 'Show'} ${tool.label}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              pinTool(tool.id, !pinned)
                            }}
                          />
                        </div>
                      )
                    })
                  : null}
              </div>
              </>
              )}
            </aside>
            {toolsExpanded ? (
              <div className="vision-rail">
                <button
                  type="button"
                  className="vision-rail__emblem"
                  aria-label="Open Athelas AI"
                  title="Open Athelas AI"
                  onClick={() => setToolsExpanded(false)}
                >
                  <span className="ai-mark" aria-hidden>
                    <img src={aiGroup1} alt="" width={11} height={20} className="ai-mark__a" />
                    <img src={aiGroup2} alt="" width={20} height={11} className="ai-mark__b" />
                  </span>
                </button>
              </div>
            ) : (
            <div className="vision-workspace">
              <div className="vision-workspace__body">
            <div className="vision-main">
              <div className="vision-stage" ref={stageRef} role="log" aria-label="Claim chat">
                <div className="vision-stage__inner">
                  <section className="vision-summary" aria-labelledby="vision-summary-title">
                    <header className="vision-summary__header">
                      <button
                        type="button"
                        className="vision-summary__toggle"
                        aria-expanded={summaryOpen}
                        aria-controls="vision-summary-body"
                        onClick={() => setSummaryOpen((value) => !value)}
                      >
                        <span id="vision-summary-title">Summary</span>
                        <Icon
                          src={keyboardArrowDown}
                          size={20}
                          className={summaryOpen ? 'vision-summary__chevron--open' : undefined}
                        />
                      </button>
                      <button
                        type="button"
                        className="ai-tab claim-summary__ask"
                        onClick={() => ask()}
                      >
                        <span className="ai-mark" aria-hidden>
                          <img src={aiGroup1} alt="" width={11} height={20} className="ai-mark__a" />
                          <img src={aiGroup2} alt="" width={20} height={11} className="ai-mark__b" />
                        </span>
                        <span className="claim-summary__ask-label">Ask Athelas AI</span>
                      </button>
                    </header>

                    {summaryOpen ? (
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
                          <div className="vision-step-card">
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
                          <div className="vision-step-card">
                            <span className="vision-step__num">2.</span>
                            <button
                              type="button"
                              className={
                                resubmitReady
                                  ? 'btn btn--primary vision-action--primary'
                                  : 'btn vision-action--later'
                              }
                              disabled={!resubmitReady}
                              onClick={() => send('Resubmit to Iowa Blue Shield')}
                            >
                              <Icon src={checkCircle} size={14} />
                              Resubmit to Iowa Blue Shield
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </section>
                  {feed.map((item, index) => {
                    const latest = index === feed.length - 1 ? { 'data-chat-latest': '' } : {}
                    if (item.kind === 'widget') {
                      return (
                        <div key={`widget-${item.id}`} className="vision-chat-slot" {...latest}>
                          <PinnedToolWidget id={item.id} />
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
                            <p>{item.text}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {activityOn ? (
                    <div className="vision-chat-slot">
                      <PinnedToolWidget id="activity" />
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
                  {shortcutsVisible ? (
                    <div className="vision-shortcuts">
                      {SHORTCUTS.map((shortcut) => (
                        <button
                          key={shortcut}
                          type="button"
                          className="vision-chip"
                          onClick={() => send(shortcut)}
                        >
                          {shortcut}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div className="vision-composer">
                    <input
                      ref={promptRef}
                      className="vision-composer__input"
                      value={prompt}
                      placeholder="Ask about this claim"
                      aria-label="Ask about this claim"
                      onChange={(event) => setPrompt(event.target.value)}
                    />
                    <div className="vision-composer__actions">
                      <button type="button" className="icon-btn" aria-label="Attach file">
                        <Icon src={attachFile} size={20} />
                      </button>
                      <button type="button" className="icon-btn" aria-label="Dictate">
                        <MicIcon />
                      </button>
                      <button type="submit" className="vision-send" aria-label="Send">
                        <ArrowUpIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
              </div>
            </div>
            )}
            </div>
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

function PinnedToolWidget({ id }: { id: ToolId }) {
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
        {id === 'submissions' ? <SubmissionsWidget hideHeader /> : null}
        {id === 'remittances' ? <RemittancesWidget hideHeader /> : null}
        {id === 'attachments' ? <DocumentationWidget title="Attachments" hideHeader /> : null}
        {id === 'payments' ? <PaymentsWidget hideHeader /> : null}
        {id === 'appeals' ? (
          <p className="claim-v2__empty">No appeals have been filed for this claim.</p>
        ) : null}
        {id === 'similar-claims' ? <SimilarClaimsWidget /> : null}
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

function PropertiesFields() {
  return <PropertiesBody status="Full Denials" className="vision-fields" />
}
