import { Fragment, useId, useState, type ReactNode } from 'react'
import appealClose from '../assets/figma/appeal-close.svg'
import appealEdit from '../assets/figma/appeal-edit.svg'
import appealFieldDropdown from '../assets/figma/appeal-field-dropdown.svg'
import appealFlag from '../assets/figma/appeal-flag.svg'
import {
  appealInfo,
  contentCopy,
  docs,
  restartAlt,
  search,
  submissionsPaid,
  widgetArrowDown,
} from '../assets/icons'

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

export function Field({
  label,
  value,
  link = false,
  muted = false,
  note,
}: {
  label: string
  value: string
  link?: boolean
  muted?: boolean
  /** Secondary line under the value, such as a plan name. */
  note?: string
}) {
  const display = value.trim() === '' ? '—' : value
  const isEmpty = display === '—'
  return (
    <div className={note ? 'claim-details-split__field claim-details-split__field--noted' : 'claim-details-split__field'}>
      <span className="claim-details-split__label">{label}</span>
      <span
        className={[
          'claim-details-split__value',
          link && !isEmpty ? 'claim-details-split__value--link' : '',
          (muted || isEmpty) && !link ? 'claim-details-split__value--muted' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="claim-details-split__value-text">{display}</span>
        {note ? <span className="claim-details-split__value-note">{note}</span> : null}
      </span>
    </div>
  )
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="claim-details-split__grid">{children}</div>
}

export function FieldCol({ children }: { children: ReactNode }) {
  return <div className="claim-details-split__col">{children}</div>
}

export function InfoBlock({ children }: { children: ReactNode }) {
  return <div className="claim-details-split__block">{children}</div>
}

function BlockDivider() {
  return <div className="claim-details-split__block-divider" aria-hidden />
}

function CollapsibleSubsection({
  title,
  summary,
  emptyLabel = 'No info',
  open,
  onToggle,
  headerActions,
  chipHover,
  children,
}: {
  title: string
  /** Value chip shown on the row; omit for a muted empty chip. */
  summary?: string
  emptyLabel?: string
  open: boolean
  onToggle: () => void
  headerActions?: ReactNode
  /** Card shown while hovering or focusing the value chip. */
  chipHover?: ReactNode
  children?: ReactNode
}) {
  const chipClassName = summary
    ? 'claim-details-split__chip'
    : 'claim-details-split__chip claim-details-split__chip--empty'

  return (
    <div className="claim-details-split__subsection">
      <div className="claim-details-split__subsection-header" onClick={onToggle}>
        <button
          type="button"
          className="claim-details-split__subsection-toggle"
          aria-expanded={open}
        >
          <Icon
            src={widgetArrowDown}
            size={20}
            className={
              open
                ? 'claim-details-split__chevron claim-details-split__chevron--open'
                : 'claim-details-split__chevron'
            }
          />
          <span>{title}</span>
        </button>
        <div className="claim-details-split__subsection-end">
          {open && headerActions ? (
            <span onClick={(event) => event.stopPropagation()}>{headerActions}</span>
          ) : null}
          {chipHover ? (
            <span className="claim-details-split__chip-anchor">
              <span className={chipClassName} tabIndex={0}>
                {summary ?? emptyLabel}
              </span>
              <div
                className="suggestion-hover claim-details-split__chip-hover"
                role="dialog"
                aria-label={`${title} details`}
                onClick={(event) => event.stopPropagation()}
              >
                {chipHover}
              </div>
            </span>
          ) : (
            <span className={chipClassName}>{summary ?? emptyLabel}</span>
          )}
        </div>
      </div>
      {open && children ? children : null}
    </div>
  )
}

/** Synthetic demo patient — not real PHI. */
const PATIENT_NAME = 'Cole Crawford'

function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="patient-hover__copy"
      aria-label={`Copy ${label}`}
      title={copied ? 'Copied' : 'Copy'}
      onClick={() => {
        void navigator.clipboard?.writeText(value)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1200)
      }}
    >
      <img src={contentCopy} alt="" width={20} height={20} />
    </button>
  )
}

type HoverRowConfig = {
  label: string
  value: string
  /** Render the value on its own line under the label (addresses, file names). */
  stacked?: boolean
  /** Let long text wrap instead of truncating with an ellipsis (descriptions). */
  wrap?: boolean
}

function HoverRow({ label, value, stacked = false, wrap = false }: HoverRowConfig) {
  const valueClassName = wrap ? 'patient-hover__value patient-hover__value--wrap' : 'patient-hover__value'
  const valueEl = (
    <p className={valueClassName} title={wrap ? undefined : value}>
      {value}
    </p>
  )
  if (stacked) {
    return (
      <div className="patient-hover__address">
        <p className="patient-hover__label">{label}</p>
        <div className="patient-hover__address-value">
          {valueEl}
          <CopyButton label={label} value={value} />
        </div>
      </div>
    )
  }
  return (
    <div className="patient-hover__row">
      <p className="patient-hover__label">{label}</p>
      {valueEl}
      <CopyButton label={label} value={value} />
    </div>
  )
}

/** Reusable "EnrichedHover" style dialog shown when hovering a section's value chip. */
function ChipHoverCard({
  title,
  blocks,
  footerLabel,
}: {
  title: string
  blocks: HoverRowConfig[][]
  footerLabel?: string
}) {
  return (
    <div className="patient-hover">
      <div className="patient-hover__header">
        <p className="patient-hover__title">{title}</p>
      </div>
      <div className="patient-hover__body">
        {blocks.map((rows, blockIndex) => (
          <Fragment key={blockIndex}>
            {blockIndex > 0 ? <div className="patient-hover__divider" role="separator" /> : null}
            {rows.map((row) => (
              <HoverRow key={row.label} {...row} />
            ))}
          </Fragment>
        ))}
      </div>
      {footerLabel ? (
        <div className="patient-hover__footer">
          <button type="button" className="patient-hover__link">
            {footerLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}

const PATIENT_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: 'Name', value: PATIENT_NAME },
    { label: 'Patient ID', value: '29126' },
    { label: 'Date of Birth', value: '04/02/2012' },
    { label: 'Age', value: '14' },
    { label: 'Gender', value: 'Male' },
  ],
  [
    { label: 'Site', value: 'Rock Valley Physical Therapy' },
    { label: 'Address', value: '16691 BOSTON PKWY, CLIVE IA 50325-4669', stacked: true },
  ],
]

export function PatientHoverCard() {
  return (
    <ChipHoverCard
      title="Patient Name"
      blocks={PATIENT_HOVER_BLOCKS}
      footerLabel="View Patient Profile"
    />
  )
}

const DATE_OF_SERVICE_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: 'Type', value: 'Single Date of Service' },
    { label: 'Date of Service', value: '09/25/2026' },
    { label: 'Place of Service', value: '11 - Office' },
  ],
]

type InsurancePlan = {
  id: string
  payerName: string
  planName: string
  status: 'active' | 'inactive'
  payerId: string
  clearingHouse: string
  remainingVisits: string
  planStart: string
  planEnd: string
  lastRun: string
  ranBy: string
  memberId: string
  relationship: string
  serviceType: string
  groupNumber: string
  pcp: string
  companyType: string
  groupName: string
  provider: string
  healthNetwork: string
}

/** Synthetic demo insurance plans — not real PHI/PII. */
const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: 'umr',
    payerName: 'United Medical Resources',
    planName: 'UMR Commercial PPO',
    status: 'active',
    payerId: '39026',
    clearingHouse: 'Waystar',
    remainingVisits: '—',
    planStart: '01/01/2026',
    planEnd: '—',
    lastRun: '09/25/2026',
    ranBy: 'Normandy Caller',
    memberId: '17949634',
    relationship: 'Child',
    serviceType: 'Physical Therapy',
    groupNumber: '76412766',
    pcp: '—',
    companyType: 'Commercial',
    groupName: '—',
    provider: 'Rock Valley Physical Therapy',
    healthNetwork: '—',
  },
  {
    id: 'wellmark',
    payerName: 'Wellmark Blue Cross Blue Shield of Iowa',
    planName: 'Alliance Select PPO',
    status: 'active',
    payerId: '88848',
    clearingHouse: 'Waystar',
    remainingVisits: '20',
    planStart: '01/01/2026',
    planEnd: '12/31/2026',
    lastRun: '09/22/2026',
    ranBy: 'Normandy Caller',
    memberId: 'WMK52018847',
    relationship: 'Child',
    serviceType: 'Physical Therapy',
    groupNumber: '40217',
    pcp: '—',
    companyType: 'Commercial',
    groupName: '—',
    provider: 'Rock Valley Physical Therapy',
    healthNetwork: 'Alliance Select',
  },
  {
    id: 'iowa-medicaid',
    payerName: 'Iowa Medicaid',
    planName: 'IA Health Link',
    status: 'active',
    payerId: 'IAMCD',
    clearingHouse: 'Waystar',
    remainingVisits: '—',
    planStart: '07/01/2025',
    planEnd: '06/30/2027',
    lastRun: '09/20/2026',
    ranBy: 'Normandy Caller',
    memberId: '1830492K',
    relationship: 'Child',
    serviceType: 'Physical Therapy',
    groupNumber: '—',
    pcp: '—',
    companyType: 'Medicaid',
    groupName: '—',
    provider: 'Rock Valley Physical Therapy',
    healthNetwork: '—',
  },
  {
    id: 'aetna',
    payerName: 'Aetna',
    planName: 'Open Access Managed Choice',
    status: 'inactive',
    payerId: '60054',
    clearingHouse: 'Waystar',
    remainingVisits: '—',
    planStart: '01/01/2024',
    planEnd: '12/31/2025',
    lastRun: '08/14/2026',
    ranBy: 'Normandy Caller',
    memberId: 'W219384772',
    relationship: 'Child',
    serviceType: 'Physical Therapy',
    groupNumber: '0861204',
    pcp: '—',
    companyType: 'Commercial',
    groupName: '—',
    provider: 'Rock Valley Physical Therapy',
    healthNetwork: '—',
  },
]

function findPlan(id: string | null) {
  return INSURANCE_PLANS.find((plan) => plan.id === id) ?? null
}

function insuranceHoverBlocks(plan: InsurancePlan): HoverRowConfig[][] {
  return [
    [
      { label: 'Payer Name', value: plan.payerName },
      { label: 'Payer ID', value: plan.payerId },
      { label: 'Clearing House', value: plan.clearingHouse },
    ],
    [
      { label: 'Member ID', value: plan.memberId },
      { label: 'Relationship', value: plan.relationship },
      { label: 'Group Number', value: plan.groupNumber },
    ],
  ]
}

function InsurancePicker({
  label,
  placeholder,
  value,
  excludeId,
  onChange,
  clearable = false,
}: {
  label: string
  placeholder: string
  value: InsurancePlan | null
  excludeId?: string
  onChange: (id: string | null) => void
  clearable?: boolean
}) {
  const inputId = useId()
  const listId = `${inputId}-list`
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const options = INSURANCE_PLANS.filter(
    (plan) =>
      plan.id !== excludeId &&
      `${plan.payerName} ${plan.planName} ${plan.payerId}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  )

  function openList() {
    setQuery('')
    setHighlight(0)
    setOpen(true)
  }

  function choose(plan: InsurancePlan) {
    onChange(plan.id)
    setOpen(false)
  }

  return (
    <div className="appeal-form-field insurance-picker">
      <img className="insurance-picker__search" src={search} alt="" width={18} height={18} />
      <input
        id={inputId}
        className="appeal-form-field__input insurance-picker__input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={open ? query : (value?.payerName ?? '')}
        onFocus={openList}
        onClick={() => {
          if (!open) openList()
        }}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value)
          setHighlight(0)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            if (!open) openList()
            else setHighlight((index) => Math.min(index + 1, options.length - 1))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setHighlight((index) => Math.max(index - 1, 0))
          } else if (event.key === 'Enter' && open && options[highlight]) {
            event.preventDefault()
            choose(options[highlight])
          } else if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      {clearable && value ? (
        <button
          type="button"
          className="appeal-form-field__dropdown"
          aria-label={`Remove ${label}`}
          title="Remove"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onChange(null)}
        >
          <img src={appealClose} alt="" width={18} height={18} />
        </button>
      ) : null}
      <button
        type="button"
        className="appeal-form-field__dropdown"
        aria-label={`Open ${label} options`}
        tabIndex={-1}
        onMouseDown={(event) => {
          event.preventDefault()
          if (open) setOpen(false)
          else {
            openList()
            document.getElementById(inputId)?.focus()
          }
        }}
      >
        <img
          src={appealFieldDropdown}
          alt=""
          width={20}
          height={20}
          className={open ? 'insurance-picker__caret--open' : undefined}
        />
      </button>
      <label className="appeal-form-field__label" htmlFor={inputId}>
        {label}
      </label>
      {open ? (
        <ul id={listId} className="insurance-picker__list" role="listbox" aria-label={label}>
          {options.length === 0 ? (
            <li className="insurance-picker__empty">No matching insurances</li>
          ) : (
            options.map((plan, index) => (
              <li
                key={plan.id}
                role="option"
                aria-selected={plan.id === value?.id}
                className={[
                  'insurance-picker__option',
                  index === highlight ? 'insurance-picker__option--active' : '',
                  plan.id === value?.id ? 'insurance-picker__option--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => choose(plan)}
              >
                <span className="insurance-picker__option-name">{plan.payerName}</span>
                <span className="insurance-picker__option-meta">
                  {plan.planName} · Payer ID {plan.payerId}
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}

function InsuranceCard({ plan, rank }: { plan: InsurancePlan; rank: 'primary' | 'secondary' }) {
  const [rerun, setRerun] = useState<{ lastRun: string; ranBy: string } | null>(null)
  const [flagged, setFlagged] = useState(false)
  const lastRun = rerun?.lastRun ?? plan.lastRun
  const ranBy = rerun?.ranBy ?? plan.ranBy

  return (
    <InfoBlock>
      <div className="insurance-card__top">
        <div className="claim-details-split__badges">
          <Badge variant={rank}>{rank === 'primary' ? 'Primary' : 'Secondary'}</Badge>
          {plan.status === 'active' ? (
            <Badge variant="active">Active</Badge>
          ) : (
            <Badge variant="inactive">Inactive</Badge>
          )}
        </div>
        <div className="insurance-card__actions">
          <button type="button" className="icon-btn icon-btn--outlined" aria-label="Edit insurance" title="Edit">
            <img src={appealEdit} alt="" width={18} height={18} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--outlined"
            aria-label="Rerun eligibility"
            title="Rerun Eligibility"
            onClick={() => setRerun({ lastRun: '10/16/2026', ranBy: 'Lorenza Ramirez' })}
          >
            <img src={restartAlt} alt="" width={18} height={18} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--outlined"
            aria-label="Eligibility details"
            title="Eligibility Details"
          >
            <img src={docs} alt="" width={18} height={18} />
          </button>
          <button
            type="button"
            className={
              flagged
                ? 'icon-btn icon-btn--outlined insurance-card__flag--on'
                : 'icon-btn icon-btn--outlined'
            }
            aria-label={flagged ? 'Remove flag' : 'Flag insurance'}
            aria-pressed={flagged}
            title={flagged ? 'Flagged' : 'Flag'}
            onClick={() => setFlagged((value) => !value)}
          >
            <img src={appealFlag} alt="" width={18} height={18} />
          </button>
        </div>
      </div>
      <FieldGrid>
        <FieldCol>
          <Field label="Payer Name" value={plan.payerName} note={plan.planName} />
          <Field label="Payer ID" value={plan.payerId} />
          <Field label="Clearing House" value={plan.clearingHouse} />
          <Field label="Remaining Visits" value={plan.remainingVisits} />
        </FieldCol>
        <FieldCol>
          <Field label="Plan Start" value={plan.planStart} />
          <Field label="Plan End" value={plan.planEnd} />
          <Field label="Last Run" value={lastRun} />
          <Field label="Ran By" value={ranBy} />
        </FieldCol>
      </FieldGrid>
      <BlockDivider />
      <FieldGrid>
        <FieldCol>
          <Field label="Member ID" value={plan.memberId} />
          <Field label="Relationship" value={plan.relationship} />
          <Field label="Service Type" value={plan.serviceType} />
          <Field label="Group Number" value={plan.groupNumber} />
          <Field label="Provider (PCP)" value={plan.pcp} />
        </FieldCol>
        <FieldCol>
          <Field label="Company Type" value={plan.companyType} />
          <Field label="Group Name" value={plan.groupName} />
          <Field label="Provider" value={plan.provider} />
          <Field label="Health Network" value={plan.healthNetwork} />
        </FieldCol>
      </FieldGrid>
      <div className="insurance-card__footer">
        <button type="button" className="claim-details-split__history-btn">
          History
        </button>
      </div>
    </InfoBlock>
  )
}

const PROVIDERS_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: 'Rendering', value: 'Nicholas Grimoskas' },
    { label: 'NPI', value: '1578939690' },
    { label: 'Tax ID', value: '363311720' },
  ],
  [{ label: 'Address', value: '850 43RD AVE STE 100, MOLINE IL 61265-8401', stacked: true }],
]

const FACILITY_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: 'Name', value: 'Rock Valley Physical Therapy' },
    { label: 'Service NPI', value: '1578939690' },
    { label: 'Place of Service', value: '11 - Office' },
  ],
  [{ label: 'Address', value: '850 43RD AVE STE 100, MOLINE IL 61265-8401', stacked: true }],
]

const TEMPLATE_HOVER_BLOCKS: HoverRowConfig[][] = [
  [{ label: 'Template', value: 'No Template Selected' }],
]

const DIAGNOSES_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: 'M54.50', value: 'Low back pain, unspecified', wrap: true },
    { label: 'M62.81', value: 'Muscle weakness (generalized)', wrap: true },
    { label: 'R26.2', value: 'Difficulty in walking, not elsewhere classified', wrap: true },
  ],
]

const PROCEDURES_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: '97110', value: '$68.00' },
    { label: '97140', value: '$67.00' },
    { label: '97530', value: '$70.00' },
  ],
  [{ label: 'Total Charges', value: '$205.00' }],
]

const ADDITIONAL_DATES_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: 'Current Illness Date', value: '09/18/2026' },
    { label: 'Initial Treatment Date', value: '09/18/2026' },
    { label: 'Admission Date', value: '—' },
    { label: 'Discharge Date', value: '—' },
  ],
]

const ADDITIONAL_INFO_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    { label: 'Type of Care', value: 'Outpatient Therapy' },
    { label: 'Admission Type', value: '—' },
    { label: 'Admission Source', value: '—' },
    { label: 'Discharge Status', value: '—' },
  ],
]

const AUTHORIZATIONS_HOVER_BLOCKS: HoverRowConfig[][] = [
  [{ label: 'Prior Authorization', value: 'Not required by payer' }],
]

const SUPPORTING_DOCS_HOVER_BLOCKS: HoverRowConfig[][] = [
  [
    {
      label: 'Document',
      value: 'Crawford_Cole_29126_20260925_Medical_Record.pdf',
      stacked: true,
    },
    { label: 'Attached', value: '09/25/2026' },
  ],
]

const DIAGNOSES: [string, string][] = [
  ['M54.50', 'Low back pain, unspecified'],
  ['M62.81', 'Muscle weakness (generalized)'],
  ['R26.2', 'Difficulty in walking, not elsewhere classified'],
]

const PROCEDURES: [string, string, string, string, string, string][] = [
  ['97110', 'GP', 'M54.50, M62.81', '$68.00', '1', '$68.00'],
  ['97140', 'GP', 'M54.50', '$67.00', '1', '$67.00'],
  ['97530', 'GP, 59', 'M62.81, R26.2', '$70.00', '1', '$70.00'],
]

export function Badge({
  children,
  variant,
}: {
  children: ReactNode
  variant:
    | 'primary'
    | 'secondary'
    | 'active'
    | 'inactive'
    | 'rendering'
    | 'supervising'
    | 'referring'
}) {
  return (
    <span className={`claim-details-split__badge claim-details-split__badge--${variant}`}>
      {variant === 'active' ? <Icon src={submissionsPaid} size={14} /> : null}
      {variant === 'inactive' ? (
        <Icon src={appealInfo} size={14} className="claim-details-split__badge-icon" />
      ) : null}
      {children}
    </span>
  )
}

export function ClaimDetailsSplitContent() {
  const [primaryId, setPrimaryId] = useState('umr')
  const [secondaryId, setSecondaryId] = useState<string | null>(null)
  const primaryPlan = findPlan(primaryId)
  const secondaryPlan = findPlan(secondaryId)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    patient: false,
    dateOfService: false,
    insurances: false,
    providers: false,
    facility: false,
    template: false,
    diagnoses: false,
    procedures: false,
    additionalDates: false,
    additionalInfo: false,
    authorizations: false,
    supportingDocs: false,
  })

  const basicKeys = ['patient', 'dateOfService', 'insurances', 'providers', 'facility'] as const
  const procedureKeys = ['template', 'diagnoses', 'procedures'] as const
  const additionalKeys = [
    'additionalDates',
    'additionalInfo',
    'authorizations',
    'supportingDocs',
  ] as const

  function areAllExpanded(keys: readonly string[]) {
    return keys.every((key) => openSections[key])
  }

  function toggle(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleSectionAll(keys: readonly string[]) {
    const next = !areAllExpanded(keys)
    setOpenSections((prev) => {
      const updated = { ...prev }
      for (const key of keys) {
        updated[key] = next
      }
      return updated
    })
  }

  function SectionHeader({
    title,
    keys,
  }: {
    title: string
    keys: readonly string[]
  }) {
    const allExpanded = areAllExpanded(keys)
    return (
      <div className="claim-details-split__section-header">
        <h3 className="claim-details-split__section-title">{title}</h3>
        <button
          type="button"
          className="claim-details-split__expand-all"
          onClick={() => toggleSectionAll(keys)}
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
    )
  }

  return (
    <div className="claim-details-split">
      <section className="claim-details-split__section">
        <SectionHeader title="Basic Information" keys={basicKeys} />

        <CollapsibleSubsection
          title="Patient"
          summary={PATIENT_NAME}
          chipHover={<PatientHoverCard />}
          open={openSections.patient}
          onToggle={() => toggle('patient')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="First Name" value="Cole" />
                <Field label="Middle Name" value="—" muted />
                <Field label="Last Name" value="Crawford" />
                <Field label="Patient ID" value="29126" />
                <Field label="Date of Birth" value="04/02/2012" />
                <Field label="Age" value="14" />
                <Field label="Sliding Fee Bucket" value="—" muted />
              </FieldCol>
              <FieldCol>
                <Field label="Address Line 1" value="16691 BOSTON PKWY" />
                <Field label="Address Line 2" value="—" muted />
                <Field label="City" value="Clive" />
                <Field label="State" value="IA" />
                <Field label="ZIP Code" value="50325-4669" />
                <Field label="Gender" value="Male" />
                <Field label="Sliding Fee Period" value="-" muted />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Date of Service"
          summary="09/25/2026"
          chipHover={
            <ChipHoverCard
              title="Date of Service"
              blocks={DATE_OF_SERVICE_HOVER_BLOCKS}
              footerLabel="View Service History"
            />
          }
          open={openSections.dateOfService}
          onToggle={() => toggle('dateOfService')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Type" value="Single Date of Service" />
                <Field label="Date of Service" value="09/25/2026" />
              </FieldCol>
              <FieldCol>
                <Field label="Place of Service" value="11 - Office" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Insurances"
          summary={
            primaryPlan
              ? `${primaryPlan.payerName}${secondaryPlan ? ' (+1)' : ''}`
              : undefined
          }
          emptyLabel="No Insurance"
          chipHover={
            primaryPlan ? (
              <ChipHoverCard
                title="Insurances"
                blocks={insuranceHoverBlocks(primaryPlan)}
                footerLabel="View Insurance Details"
              />
            ) : undefined
          }
          open={openSections.insurances}
          onToggle={() => toggle('insurances')}
        >
          <div className="insurance-stack">
            <InsurancePicker
              label="Primary Insurance"
              placeholder="Select Primary Insurance"
              value={primaryPlan}
              excludeId={secondaryId ?? undefined}
              onChange={(id) => {
                if (id) setPrimaryId(id)
              }}
            />
            {primaryPlan ? (
              <InsuranceCard key={primaryPlan.id} plan={primaryPlan} rank="primary" />
            ) : null}
            <InsurancePicker
              label="Secondary Insurance"
              placeholder="Select Secondary Insurance"
              value={secondaryPlan}
              excludeId={primaryId}
              onChange={setSecondaryId}
              clearable
            />
            {secondaryPlan ? (
              <InsuranceCard key={secondaryPlan.id} plan={secondaryPlan} rank="secondary" />
            ) : null}
          </div>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Providers"
          summary="Rendering: Nicholas Grimoskas (3)"
          chipHover={
            <ChipHoverCard
              title="Providers"
              blocks={PROVIDERS_HOVER_BLOCKS}
              footerLabel="View Provider Profile"
            />
          }
          open={openSections.providers}
          onToggle={() => toggle('providers')}
        >
          <InfoBlock>
            <div className="claim-details-split__block-top">
              <Badge variant="rendering">Rendering</Badge>
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="Name" value="Nicholas Grimoskas" />
                <Field label="Phone" value="—" muted />
                <Field label="Fax" value="—" muted />
                <Field label="NPI" value="1578939690" />
                <Field label="Tax ID" value="363311720" />
              </FieldCol>
              <FieldCol>
                <Field label="Address" value="850 43RD AVE STE 100" />
                <Field label="City" value="Moline" />
                <Field label="State" value="IL" />
                <Field label="ZIP Code" value="61265-8401" />
              </FieldCol>
            </FieldGrid>

            <BlockDivider />

            <div className="claim-details-split__block-top">
              <Badge variant="supervising">Supervising</Badge>
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="Name" value="Alan Barrett" />
                <Field label="Phone" value="(843) 667-9414" />
                <Field label="Fax" value="—" muted />
                <Field label="NPI" value="1922174119" />
                <Field label="Tax ID" value="570984427" />
              </FieldCol>
              <FieldCol>
                <Field label="Address" value="360 N IRBY ST" />
                <Field label="City" value="Florence" />
                <Field label="State" value="SC" />
                <Field label="ZIP Code" value="29501-2808" />
              </FieldCol>
            </FieldGrid>

            <BlockDivider />

            <div className="claim-details-split__block-top">
              <Badge variant="referring">Referring</Badge>
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="Name" value="John John" />
                <Field label="Phone" value="(252) 523-0026" />
                <Field label="Fax" value="+1 (252) 523-1855" />
                <Field label="NPI" value="1033105739" />
                <Field label="Tax ID" value="—" muted />
              </FieldCol>
              <FieldCol>
                <Field label="Address" value="744 Airport Rd" />
                <Field label="City" value="Kinston" />
                <Field label="State" value="NC" />
                <Field label="ZIP Code" value="28504" />
              </FieldCol>
            </FieldGrid>

            <div className="claim-details-split__pcp-date">
              <span className="claim-details-split__label">
                Last Seen by Primary Care Provider Date
              </span>
              <span className="claim-details-split__value claim-details-split__value--muted">
                MM/DD/YYYY
              </span>
            </div>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Facility"
          summary="Rock Valley Physical Therapy"
          chipHover={
            <ChipHoverCard
              title="Facility"
              blocks={FACILITY_HOVER_BLOCKS}
              footerLabel="View Facility Details"
            />
          }
          open={openSections.facility}
          onToggle={() => toggle('facility')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Name" value="Rock Valley Physical Therapy" />
                <Field label="City" value="Moline" />
                <Field label="State" value="IL" />
                <Field label="ZIP Code" value="61265-8401" />
              </FieldCol>
              <FieldCol>
                <Field label="Service NPI" value="1578939690" />
                <Field label="Address 1" value="850 43RD AVE STE 100" />
                <Field label="Address 2" value="—" muted />
              </FieldCol>
            </FieldGrid>
            <Field label="Place of Service Code" value="11 - Office" />
            <FieldGrid>
              <FieldCol>
                <Field label="Admission Date" value="MM/DD/YYYY HH:MM" muted />
              </FieldCol>
              <FieldCol>
                <Field label="Discharge Date" value="MM/DD/YYYY HH:MM" muted />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>
      </section>

      <section className="claim-details-split__section">
        <SectionHeader title="Procedure Information" keys={procedureKeys} />

        <CollapsibleSubsection
          title="Template"
          emptyLabel="No Template Selected"
          chipHover={<ChipHoverCard title="Template" blocks={TEMPLATE_HOVER_BLOCKS} />}
          open={openSections.template}
          onToggle={() => toggle('template')}
        >
          <InfoBlock>
            <Field label="Template" value="No Template Selected" muted />
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Diagnoses"
          summary="M54.50 (+2)"
          chipHover={
            <ChipHoverCard
              title="Diagnoses"
              blocks={DIAGNOSES_HOVER_BLOCKS}
              footerLabel="View Diagnosis Codes"
            />
          }
          open={openSections.diagnoses}
          onToggle={() => toggle('diagnoses')}
        >
          <InfoBlock>
            <div className="claim-details-split__table-wrap">
              <table className="claim-details-split__table">
                <thead>
                  <tr>
                    <th className="claim-details-split__th">Code</th>
                    <th className="claim-details-split__th">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {DIAGNOSES.map(([code, description]) => (
                    <tr key={code}>
                      <td className="claim-details-split__td claim-details-split__td--link">{code}</td>
                      <td className="claim-details-split__td">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Procedures"
          summary="97110 (+2)"
          chipHover={
            <ChipHoverCard
              title="Procedures"
              blocks={PROCEDURES_HOVER_BLOCKS}
              footerLabel="View Procedure Codes"
            />
          }
          open={openSections.procedures}
          onToggle={() => toggle('procedures')}
        >
          <InfoBlock>
            <div className="claim-details-split__table-wrap">
              <table className="claim-details-split__table claim-details-split__table--procedures">
                <thead>
                  <tr>
                    <th className="claim-details-split__th">Procedure</th>
                    <th className="claim-details-split__th">Modifiers</th>
                    <th className="claim-details-split__th">Diagnoses</th>
                    <th className="claim-details-split__th">Unit Charge</th>
                    <th className="claim-details-split__th">Count</th>
                    <th className="claim-details-split__th">Total Charge</th>
                  </tr>
                </thead>
                <tbody>
                  {PROCEDURES.map(([code, modifiers, diagnoses, unit, count, total]) => (
                    <tr key={code}>
                      <td className="claim-details-split__td claim-details-split__td--link">{code}</td>
                      <td className="claim-details-split__td">{modifiers}</td>
                      <td className="claim-details-split__td">{diagnoses}</td>
                      <td className="claim-details-split__td">{unit}</td>
                      <td className="claim-details-split__td">{count}</td>
                      <td className="claim-details-split__td">{total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="claim-details-split__table-footer">
              Total Charges: <strong>$205.00</strong>
            </p>
          </InfoBlock>
        </CollapsibleSubsection>
      </section>

      <section className="claim-details-split__section">
        <SectionHeader title="Additional Claim Details" keys={additionalKeys} />

        <CollapsibleSubsection
          title="Additional Dates"
          summary="2 dates"
          chipHover={<ChipHoverCard title="Additional Dates" blocks={ADDITIONAL_DATES_HOVER_BLOCKS} />}
          open={openSections.additionalDates}
          onToggle={() => toggle('additionalDates')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Current Illness Date" value="09/18/2026" />
                <Field label="Initial Treatment Date" value="09/18/2026" />
              </FieldCol>
              <FieldCol>
                <Field label="Admission Date" value="—" muted />
                <Field label="Discharge Date" value="—" muted />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Additional Information"
          summary="Outpatient Therapy"
          chipHover={
            <ChipHoverCard title="Additional Information" blocks={ADDITIONAL_INFO_HOVER_BLOCKS} />
          }
          open={openSections.additionalInfo}
          onToggle={() => toggle('additionalInfo')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Type of Care" value="Outpatient Therapy" />
                <Field label="Admission Type" value="—" muted />
                <Field label="Additional Info" value="—" muted />
              </FieldCol>
              <FieldCol>
                <Field label="Admission Source" value="—" muted />
                <Field label="Discharge Status" value="—" muted />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Authorizations"
          emptyLabel="Not Required"
          chipHover={<ChipHoverCard title="Authorizations" blocks={AUTHORIZATIONS_HOVER_BLOCKS} />}
          open={openSections.authorizations}
          onToggle={() => toggle('authorizations')}
        >
          <InfoBlock>
            <Field label="Prior Authorization" value="Not required by payer" muted />
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Supporting Docs"
          summary="Medical Record"
          chipHover={
            <ChipHoverCard
              title="Supporting Docs"
              blocks={SUPPORTING_DOCS_HOVER_BLOCKS}
              footerLabel="View Document"
            />
          }
          open={openSections.supportingDocs}
          onToggle={() => toggle('supportingDocs')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Document" value="Crawford_Cole_29126_20260925_Medical_Record.pdf" link />
                <Field label="Attached" value="09/25/2026" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>
      </section>
    </div>
  )
}
