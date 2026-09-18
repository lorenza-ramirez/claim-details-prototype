import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import appealBackup from '../assets/figma/appeal-backup.svg'
import appealChipInfo from '../assets/figma/appeal-info.svg'
import appealDenied from '../assets/figma/appeal-denied.svg'
import appealRadioSelected from '../assets/figma/appeal-radio-selected.svg'
import appealRadioUnselected from '../assets/figma/appeal-radio-unselected.svg'
import { search, submissionsSortDown, tune, widgetArrowDown } from '../assets/icons'

/** Synthetic demo values from Figma — not real PHI/PII. */
const APPEAL_SUBMISSION = {
  id: '9077110',
  created: '1/10/2026',
  memberId: 'BQ60358Y',
  payer: 'Aetna',
  payerIndex: 'Primary',
  appealDeadline: '10/20/2026 (42 days left)',
  status: 'Denied',
  submitted: '1/10/2026',
  type: 'Initial',
  payerForm: 'Form required · mapped',
  denialType: 'Medical necessity, Prior authorization, Underpayment / contracted rate',
  appealDestination: 'Payer portal / CHC, Fax, Mail sent by Athelas',
}

type ProcedureState = 'denied' | 'partial'

type ProcedureRow = {
  id: string
  code: string
  state: ProcedureState
  billed: string
  paid: string
  disputed: string
  types: string[]
}

const PROCEDURES: ProcedureRow[] = [
  {
    id: 'proc-1',
    code: '97110',
    state: 'denied',
    billed: '$130.00',
    paid: '-',
    disputed: '$130.00',
    types: ['Medical Necessity(CO-50)', 'Prior Auth (CO-197 | N54)'],
  },
  {
    id: 'proc-2',
    code: '97110',
    state: 'denied',
    billed: '$149.23',
    paid: '-',
    disputed: '$149.23',
    types: ['Medical Necessity (CO-50 | N115)'],
  },
  {
    id: 'proc-3',
    code: '97110',
    state: 'partial',
    billed: '$82.00',
    paid: '$61.10',
    disputed: '$20.90',
    types: ['Underpayment / contracted rate (CO-45 | N381)'],
  },
]

type DocCategory = 'all' | 'patient' | 'chartNote' | 'medicalFile' | 'fax'
type FileKind = 'pdf' | 'image' | 'doc'

type DocumentationRow = {
  id: string
  name: string
  kind: FileKind
  category: Exclude<DocCategory, 'all'>
  categoryLabel: string
  uploaded: string
  uploadedBy: string
  size: string
}

const DOCUMENT_ROWS: DocumentationRow[] = [
  {
    id: 'doc-1',
    name: 'Plan of Care_97161.pdf',
    kind: 'pdf',
    category: 'chartNote',
    categoryLabel: 'Chart Note',
    uploaded: '02/18/2026',
    uploadedBy: 'J. Alvarez',
    size: '248 KB',
  },
  {
    id: 'doc-2',
    name: 'Prior Auth_WC-MEMIC.pdf',
    kind: 'pdf',
    category: 'medicalFile',
    categoryLabel: 'Medical File',
    uploaded: '02/12/2026',
    uploadedBy: 'Remit Bot',
    size: '112 KB',
  },
  {
    id: 'doc-3',
    name: 'Therapy Progress Note_01-25.jpg',
    kind: 'image',
    category: 'medicalFile',
    categoryLabel: 'Medical File',
    uploaded: '01/26/2026',
    uploadedBy: 'M. Chen',
    size: '1.4 MB',
  },
  {
    id: 'doc-4',
    name: 'Appeal Letter_Initial.docx',
    kind: 'doc',
    category: 'fax',
    categoryLabel: 'Fax',
    uploaded: '01/08/2026',
    uploadedBy: 'J. Alvarez',
    size: '64 KB',
  },
  {
    id: 'doc-5',
    name: 'Patient Intake Forms.pdf',
    kind: 'pdf',
    category: 'patient',
    categoryLabel: 'Patient',
    uploaded: '01/10/2026',
    uploadedBy: 'Front Desk',
    size: '96 KB',
  },
]

const DOC_FILTERS: { id: DocCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'patient', label: 'Patient' },
  { id: 'chartNote', label: 'Chart Note' },
  { id: 'medicalFile', label: 'Medical File' },
  { id: 'fax', label: 'Fax' },
]

const INITIAL_SELECTED = ['doc-1', 'doc-4', 'doc-5']

function AppealField({
  label,
  value,
  action,
}: {
  label: string
  value: string
  action?: string
}) {
  return (
    <div className="claim-details-widget__field">
      <span className="claim-details-widget__label claim-details-widget__label--truncate">
        {label}
      </span>
      <span className="claim-details-widget__value">
        <span className="claim-details-widget__value-text">{value}</span>
      </span>
      {action ? (
        <button
          type="button"
          className="claim-details-widget__value claim-details-widget__value--link appeal-submission__change"
        >
          <span className="claim-details-widget__value-text">{action}</span>
        </button>
      ) : null}
    </div>
  )
}

function CollapsibleCard({
  title,
  titleId,
  children,
  defaultOpen = true,
  id,
  badge,
}: {
  title: string
  titleId: string
  children: ReactNode
  defaultOpen?: boolean
  id?: string
  badge?: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = `${titleId}-body`

  function toggle() {
    setOpen((value) => !value)
  }

  const badgeEl = badge ? <span className="appeal-docs__count">{badge}</span> : null

  const titleContent = (
    <>
      <h3 id={titleId}>{title}</h3>
      <img
        src={widgetArrowDown}
        alt=""
        width={20}
        height={20}
        className={
          open
            ? 'appeal-submission__chevron appeal-submission__chevron--up'
            : 'appeal-submission__chevron'
        }
      />
    </>
  )

  return (
    <section
      id={id}
      className={open ? 'appeal-submission' : 'appeal-submission appeal-submission--collapsed'}
      aria-labelledby={titleId}
      {...(!open
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-expanded': false,
            'aria-controls': bodyId,
            onClick: () => setOpen(true),
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpen(true)
              }
            },
          }
        : {})}
    >
      <header
        className={
          badge
            ? 'appeal-submission__title-row appeal-submission__title-row--with-badge'
            : 'appeal-submission__title-row'
        }
      >
        {open ? (
          <button
            type="button"
            className={
              badge
                ? 'appeal-submission__title-btn appeal-submission__title-btn--with-badge'
                : 'appeal-submission__title-btn'
            }
            aria-expanded
            aria-controls={bodyId}
            onClick={toggle}
          >
            {titleContent}
            {badgeEl}
          </button>
        ) : (
          <>
            <div className="appeal-submission__title-btn">{titleContent}</div>
            {badgeEl}
          </>
        )}
      </header>
      {open ? (
        <div id={bodyId} className="appeal-submission__body">
          {children}
        </div>
      ) : null}
    </section>
  )
}

function AppealRadio({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}) {
  return (
    <label className="appeal-submission__radio">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <img
        src={checked ? appealRadioSelected : appealRadioUnselected}
        alt=""
        width={28}
        height={28}
      />
      <span>{children}</span>
    </label>
  )
}

function AppealSubmissionWidget() {
  const [packetType, setPacketType] = useState<'full' | 'documents'>('full')

  return (
    <CollapsibleCard
      id="appeal-section-submission"
      title="Submission you are appealing"
      titleId="appeal-submission-title"
    >
      <div className="claim-details-widget__grid">
        <div className="claim-details-widget__col claim-details-widget__col--gap">
          <AppealField label="ID" value={APPEAL_SUBMISSION.id} />
          <AppealField label="Created" value={APPEAL_SUBMISSION.created} />
          <AppealField label="Member ID" value={APPEAL_SUBMISSION.memberId} />
          <AppealField label="Payer" value={APPEAL_SUBMISSION.payer} />
          <AppealField label="Payer Index" value={APPEAL_SUBMISSION.payerIndex} action="Change" />
          <AppealField label="Appeal Deadline" value={APPEAL_SUBMISSION.appealDeadline} />
        </div>
        <div className="claim-details-widget__col claim-details-widget__col--gap">
          <AppealField label="Status" value={APPEAL_SUBMISSION.status} />
          <AppealField label="Submitted" value={APPEAL_SUBMISSION.submitted} />
          <AppealField label="Type" value={APPEAL_SUBMISSION.type} />
          <AppealField label="Payer Form" value={APPEAL_SUBMISSION.payerForm} />
          <AppealField label="Denial type" value={APPEAL_SUBMISSION.denialType} />
          <AppealField label="Appeal Destination" value={APPEAL_SUBMISSION.appealDestination} />
        </div>
      </div>

      <div className="appeal-submission__divider" role="separator" />

      <div className="appeal-submission__radios" role="radiogroup" aria-label="Package type">
        <AppealRadio
          name="appeal-packet-type"
          value="full"
          checked={packetType === 'full'}
          onChange={() => setPacketType('full')}
        >
          Full appeal packet (Letter, form, documents)
        </AppealRadio>
        <AppealRadio
          name="appeal-packet-type"
          value="documents"
          checked={packetType === 'documents'}
          onChange={() => setPacketType('documents')}
        >
          Documents only (No letter, no form)
        </AppealRadio>
      </div>
    </CollapsibleCard>
  )
}

function ProcedureStateBadge({ state }: { state: ProcedureState }) {
  if (state === 'denied') {
    return (
      <span className="appeal-procedure__badge appeal-procedure__badge--denied">
        <span className="appeal-procedure__badge-icon" aria-hidden>
          <img src={appealDenied} alt="" width={12} height={12} />
        </span>
        Denied
      </span>
    )
  }

  return (
    <span className="appeal-procedure__badge appeal-procedure__badge--partial">
      <img src={appealChipInfo} alt="" width={16} height={16} />
      Partially paid
    </span>
  )
}

function AppealProceduresWidget() {
  const [selected, setSelected] = useState<string[]>(() => PROCEDURES.map((row) => row.id))
  const allSelected = selected.length === PROCEDURES.length
  const someSelected = selected.length > 0 && !allSelected

  function toggleAll() {
    setSelected(allSelected ? [] : PROCEDURES.map((row) => row.id))
  }

  function toggleRow(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <CollapsibleCard
      id="appeal-section-procedures"
      title="Procedures on this submission"
      titleId="appeal-procedures-title"
      badge="Run All (Recommended)"
    >
      <div className="appeal-procedure__table-wrap">
        <table className="appeal-procedure__table">
          <thead>
            <tr>
              <th className="appeal-procedure__th appeal-procedure__th--check" scope="col">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(node) => {
                    if (node) node.indeterminate = someSelected
                  }}
                  onChange={toggleAll}
                  aria-label="Select all procedures"
                />
              </th>
              <th className="appeal-procedure__th appeal-procedure__th--code" scope="col">
                <span>Procedure</span>
                <img src={submissionsSortDown} alt="" width={16} height={16} />
              </th>
              <th className="appeal-procedure__th appeal-procedure__th--state" scope="col">
                State
              </th>
              <th className="appeal-procedure__th appeal-procedure__th--end" scope="col">
                Billed
              </th>
              <th className="appeal-procedure__th appeal-procedure__th--end" scope="col">
                Paid
              </th>
              <th className="appeal-procedure__th appeal-procedure__th--end" scope="col">
                Disputed
              </th>
              <th className="appeal-procedure__th" scope="col">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {PROCEDURES.map((row) => (
              <tr key={row.id}>
                <td className="appeal-procedure__td appeal-procedure__td--check">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={() => toggleRow(row.id)}
                    aria-label={`Select procedure ${row.code}`}
                  />
                </td>
                <td className="appeal-procedure__td">{row.code}</td>
                <td className="appeal-procedure__td">
                  <ProcedureStateBadge state={row.state} />
                </td>
                <td className="appeal-procedure__td appeal-procedure__td--end">{row.billed}</td>
                <td className="appeal-procedure__td appeal-procedure__td--end">{row.paid}</td>
                <td className="appeal-procedure__td appeal-procedure__td--end">{row.disputed}</td>
                <td className="appeal-procedure__td">
                  <div className="appeal-procedure__chips">
                    {row.types.map((type) => (
                      <span key={type} className="appeal-procedure__chip">
                        {type}
                        <img src={appealChipInfo} alt="" width={16} height={16} />
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleCard>
  )
}

function FileTypeIcon({ kind }: { kind: FileKind }) {
  const label = kind === 'pdf' ? 'PDF' : kind === 'image' ? 'IMG' : 'DOC'
  return (
    <span
      className={`documentation-widget__file-icon documentation-widget__file-icon--${kind === 'image' ? 'image' : kind}`}
      aria-hidden
    >
      {label}
    </span>
  )
}

export type AppealDocument = DocumentationRow

export function AppealDocumentationWidget({
  defaultOpen = true,
  sectionId = 'appeal-section-documentation',
  variant = 'select',
  hideHeader = false,
  activeDocumentId,
  onOpenDocument,
}: {
  defaultOpen?: boolean
  sectionId?: string
  variant?: 'select' | 'attached'
  hideHeader?: boolean
  activeDocumentId?: string | null
  onOpenDocument?: (document: AppealDocument) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [filter, setFilter] = useState<DocCategory>('all')
  const [selected, setSelected] = useState<string[]>(INITIAL_SELECTED)
  const attached = variant === 'attached'
  const titleId = `${sectionId}-title`
  const bodyId = `${sectionId}-body`

  const sourceRows = useMemo(
    () =>
      attached
        ? DOCUMENT_ROWS.filter((row) => INITIAL_SELECTED.includes(row.id))
        : DOCUMENT_ROWS,
    [attached],
  )
  const rows = useMemo(
    () => (filter === 'all' ? sourceRows : sourceRows.filter((row) => row.category === filter)),
    [filter, sourceRows],
  )
  const selectedOnPage = rows.filter((row) => selected.includes(row.id))
  const allSelected = rows.length > 0 && selectedOnPage.length === rows.length
  const someSelected = selectedOnPage.length > 0 && !allSelected

  function toggleAll() {
    if (allSelected) {
      setSelected((current) => current.filter((id) => !rows.some((row) => row.id === id)))
      return
    }
    setSelected((current) => [...new Set([...current, ...rows.map((row) => row.id)])])
  }

  function toggleRow(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  return (
    <section
      id={sectionId}
      className={[
        'appeal-docs',
        open ? '' : 'appeal-docs--collapsed',
        attached ? 'appeal-docs--attached' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...(hideHeader ? { 'aria-label': 'Documentation' } : { 'aria-labelledby': titleId })}
      {...(!hideHeader && !open
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-expanded': false,
            'aria-controls': bodyId,
            onClick: () => setOpen(true),
            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setOpen(true)
              }
            },
          }
        : {})}
    >
      {hideHeader ? null : <header className="appeal-docs__title-row">
        {open ? (
          <button
            type="button"
            className="appeal-docs__toggle"
            aria-expanded
            aria-controls={bodyId}
            onClick={() => setOpen(false)}
          >
            <span className="appeal-submission__title-btn">
              <h3 id={titleId}>Documentation</h3>
              <img
                src={widgetArrowDown}
                alt=""
                width={20}
                height={20}
                className="appeal-submission__chevron appeal-submission__chevron--up"
              />
            </span>
            <span className="appeal-docs__count">{selected.length} selected</span>
          </button>
        ) : (
          <>
            <div className="appeal-submission__title-btn">
              <h3 id={titleId}>Documentation</h3>
              <img
                src={widgetArrowDown}
                alt=""
                width={20}
                height={20}
                className="appeal-submission__chevron"
              />
            </div>
            <span className="appeal-docs__count">{selected.length} selected</span>
          </>
        )}
      </header>}

      {hideHeader || open ? (
      <div id={bodyId} className="appeal-docs__body">
        {attached ? null : (
          <div className="appeal-docs__upload">
            <span className="appeal-docs__upload-icon">
              <img src={appealBackup} alt="" width={20} height={20} />
            </span>
            <p>
              drop files here or <button type="button">Browse Files</button>
            </p>
          </div>
        )}

        <div className="appeal-docs__toolbar">
          <div className="documentation-widget__tabs" role="tablist" aria-label="Document categories">
            {DOC_FILTERS.map((item) => {
              const isActive = filter === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={
                    isActive
                      ? 'documentation-widget__tab documentation-widget__tab--active'
                      : 'documentation-widget__tab'
                  }
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <div className="documentation-widget__toolbar-actions">
            <button type="button" className="icon-btn" aria-label="Search documents">
              <img src={search} alt="" width={20} height={20} />
            </button>
            <button type="button" className="icon-btn" aria-label="Tune documentation">
              <img src={tune} alt="" width={20} height={20} />
            </button>
          </div>
        </div>

        <div className="appeal-docs__table-wrap">
          <table className="appeal-docs__table">
            <thead>
              <tr>
                {attached ? null : (
                  <th className="appeal-docs__th appeal-docs__th--check" scope="col">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(node) => {
                        if (node) node.indeterminate = someSelected
                      }}
                      onChange={toggleAll}
                      aria-label="Select all documents"
                    />
                  </th>
                )}
                <th className="appeal-docs__th appeal-docs__th--file" scope="col">
                  <span>File</span>
                  <img src={submissionsSortDown} alt="" width={16} height={16} />
                </th>
                <th className="appeal-docs__th appeal-docs__th--category" scope="col">
                  Category
                </th>
                <th className="appeal-docs__th appeal-docs__th--end" scope="col">
                  Uploaded
                </th>
                <th className="appeal-docs__th appeal-docs__th--by" scope="col">
                  Uploaded By
                </th>
                <th className="appeal-docs__th appeal-docs__th--end" scope="col">
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={[
                    attached ? 'appeal-docs__row' : '',
                    attached && activeDocumentId === row.id ? 'appeal-docs__row--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  {...(attached && onOpenDocument
                    ? {
                        tabIndex: 0,
                        role: 'button',
                        'aria-label': `View ${row.name}`,
                        'aria-pressed': activeDocumentId === row.id,
                        onClick: () => onOpenDocument(row),
                        onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            onOpenDocument(row)
                          }
                        },
                      }
                    : {})}
                >
                  {attached ? null : (
                    <td className="appeal-docs__td appeal-docs__td--check">
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        aria-label={`Select ${row.name}`}
                      />
                    </td>
                  )}
                  <td className="appeal-docs__td">
                    <div className="documentation-widget__file-cell">
                      <FileTypeIcon kind={row.kind} />
                      <span className="documentation-widget__file-name">{row.name}</span>
                    </div>
                  </td>
                  <td className="appeal-docs__td">{row.categoryLabel}</td>
                  <td className="appeal-docs__td appeal-docs__td--end">{row.uploaded}</td>
                  <td className="appeal-docs__td">{row.uploadedBy}</td>
                  <td className="appeal-docs__td appeal-docs__td--end">{row.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : null}
    </section>
  )
}

export function AppealGeneralInformation() {
  return (
    <div className="appeal-general">
      <AppealSubmissionWidget />
      <AppealProceduresWidget />
      <AppealDocumentationWidget />
    </div>
  )
}
