import { useState, type ReactNode } from 'react'
import {
  keyboardArrowDown,
  keyboardArrowUp,
  leftPanelClose,
  paymentsArrowDropDown,
  splitSwap,
  submissionAccountCircle,
  submissionRule,
  submissionsError,
  submissionsPaid,
  submissionsRejected,
  viewPreview,
} from '../assets/icons'
import arrowBack from '../assets/figma/appeal-arrow-back.svg'
import { Badge, Field, FieldCol, FieldGrid, InfoBlock } from './ClaimDetailsSplitContent'
import { SUBMISSION_ROWS, type SubmissionRow, type SubmissionStatusKind } from './submissionsData'

const STATUS_ICON: Record<SubmissionStatusKind, string> = {
  error: submissionsError,
  paid: submissionsPaid,
  denied: submissionsRejected,
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatLongDate(value: string) {
  const [month, day, year] = value.split('/').map(Number)
  if (!month || !day || !year) return value
  return `${MONTHS[month - 1]} ${String(day).padStart(2, '0')}, ${year}`
}

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="submission-detail__meta-item">
      <span className="submission-detail__meta-label">{label}</span>
      <span className="submission-detail__meta-value">{children}</span>
    </div>
  )
}

function DetailSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="submission-detail__section">
      <button
        type="button"
        className="submission-detail__section-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <img
          src={paymentsArrowDropDown}
          alt=""
          width={20}
          height={20}
          className={
            open
              ? 'submission-detail__caret'
              : 'submission-detail__caret submission-detail__caret--closed'
          }
        />
        {title}
      </button>
      {open ? <div className="submission-detail__section-body">{children}</div> : null}
    </div>
  )
}

/** Synthetic demo submission content — not real PHI/PII. */
export function SubmissionDetail({
  recordIndex,
  row: rowOverride,
}: {
  recordIndex: number
  row?: SubmissionRow
}) {
  const row = rowOverride ?? SUBMISSION_ROWS[recordIndex] ?? SUBMISSION_ROWS[0]
  const [open, setOpen] = useState({ patient: true, insurances: true, providers: true })

  function toggle(key: keyof typeof open) {
    setOpen((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <div className="submission-detail">
      <header className="submission-detail__header">
        <div className="submission-detail__title-row">
          <h3 className="submission-detail__title">{formatLongDate(row.created)}</h3>
          <div className="submission-detail__title-actions">
            <button type="button" className="icon-btn" aria-label="Validation rules" title="Validation Rules">
              <img src={submissionRule} alt="" width={20} height={20} />
            </button>
            <button type="button" className="icon-btn" aria-label="View claim form PDF" title="View PDF">
              <img src={viewPreview} alt="" width={20} height={20} />
            </button>
          </div>
        </div>
        <div className="submission-detail__meta">
          <MetaItem label="Status">
            <span className={`submissions-widget__status submissions-widget__status--${row.status}`}>
              <img src={STATUS_ICON[row.status]} alt="" width={16} height={16} />
              {row.statusLabel}
            </span>
          </MetaItem>
          <MetaItem label="Index">
            <span className={`submissions-widget__index submissions-widget__index--${row.index}`}>
              {row.index === 'primary' ? 'Primary' : 'Secondary'}
            </span>
          </MetaItem>
          <MetaItem label="Method">{row.method}</MetaItem>
          <MetaItem label="Form Type">{row.formType}</MetaItem>
          <MetaItem label="Submitted By">
            <span className="submission-detail__person">
              <img src={submissionAccountCircle} alt="" width={20} height={20} />
              {row.submittedBy}
            </span>
          </MetaItem>
          <MetaItem label="Submission ID">{row.submissionId}</MetaItem>
        </div>
      </header>

      <section className="submission-detail__body">
        <h4 className="claim-details-split__section-title">Basic Information</h4>

        <DetailSection title="Patient" open={open.patient} onToggle={() => toggle('patient')}>
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="First Name" value="COLE" />
                <Field label="Middle Name" value="—" />
                <Field label="Last Name" value="CRAWFORD" />
                <Field label="Date of Birth" value="04/02/2012" />
                <Field label="Gender" value="Male" />
              </FieldCol>
              <FieldCol>
                <Field label="Address Line 1" value="16691 BOSTON PKWY" />
                <Field label="Address Line 2" value="—" />
                <Field label="City" value="CLIVE" />
                <Field label="State" value="IA" />
                <Field label="ZIP Code" value="50325-4669" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </DetailSection>

        <DetailSection title="Insurances" open={open.insurances} onToggle={() => toggle('insurances')}>
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Name" value={row.payer.toUpperCase()} />
                <Field label="Group Name" value="—" />
                <Field label="Relationship" value="Child" />
              </FieldCol>
              <FieldCol>
                <Field label="Policy Number" value={row.memberId} />
                <Field label="Group Number" value="76412766" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
          <InfoBlock>
            <h5 className="submission-detail__block-title">Subscriber Information</h5>
            <FieldGrid>
              <FieldCol>
                <Field label="First Name" value="SCOTT" />
                <Field label="Middle Name" value="—" />
                <Field label="Last Name" value="CRAWFORD" />
                <Field label="Date of Birth" value="12/28/1978" />
                <Field label="Gender" value="Unknown" />
              </FieldCol>
              <FieldCol>
                <Field label="Address Line 1" value="16691 BOSTON PKWY" />
                <Field label="Address Line 2" value="—" />
                <Field label="City" value="Clive" />
                <Field label="State" value="IA" />
                <Field label="ZIP Code" value="50325-3704" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </DetailSection>

        <DetailSection title="Providers" open={open.providers} onToggle={() => toggle('providers')}>
          <InfoBlock>
            <div className="claim-details-split__block-top">
              <Badge variant="rendering">Rendering</Badge>
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="First Name" value="Nicholas" />
                <Field label="Middle Name" value="—" />
                <Field label="Last Name" value="Grimoskas" />
                <Field label="Taxonomy Code" value="225100000X" />
                <Field label="NPI" value="1578939690" />
                <Field label="Tax ID" value="363311720" />
              </FieldCol>
              <FieldCol>
                <Field label="Address Line 1" value="850 43RD AVE STE 100" />
                <Field label="Address Line 2" value="—" />
                <Field label="City" value="MOLINE" />
                <Field label="State" value="IL" />
                <Field label="ZIP Code" value="61265-8401" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </DetailSection>
      </section>
    </div>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="vision2-submission__fact">
      <span className="vision2-submission__fact-label">{label}</span>
      <span className="vision2-submission__fact-value">{children}</span>
    </div>
  )
}

function Pair({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="vision2-submission__field">
      <span className="vision2-submission__field-label">{label}</span>
      <span className={muted ? 'vision2-submission__field-value vision2-submission__field-value--muted' : 'vision2-submission__field-value'}>
        {value}
      </span>
    </div>
  )
}

/** Submission record opened from the vision 2 submissions list. Synthetic data only. */
export function SubmissionPanel({
  row,
  position,
  total,
  onClose,
  onPrevious,
  onNext,
}: {
  row: SubmissionRow
  position: number
  total: number
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <aside className="vision2-detail" aria-label="Submission detail">
      <div className="vision2-detail__bar">
        <button type="button" className="icon-btn" aria-label="Back to submissions" onClick={onClose}>
          <img src={leftPanelClose} alt="" width={20} height={20} />
        </button>
        <button type="button" className="icon-btn" aria-label="Previous submission" disabled={position <= 1} onClick={onPrevious}>
          <img src={arrowBack} alt="" width={20} height={20} />
        </button>
        <button type="button" className="icon-btn" aria-label="Next submission" disabled={position >= total} onClick={onNext}>
          <img src={arrowBack} alt="" width={20} height={20} className="vision2-icon-flip" />
        </button>
      </div>
      <div className="vision2-submission">
        <header className="vision2-submission__head">
          <h2 className="vision2-submission__title">Submission detail</h2>
          <div className="vision2-submission__tools">
            <button type="button" className="icon-btn" aria-label="Next submission" disabled={position >= total} onClick={onNext}>
              <img src={keyboardArrowDown} alt="" width={18} height={18} />
            </button>
            <button type="button" className="icon-btn" aria-label="Previous submission" disabled={position <= 1} onClick={onPrevious}>
              <img src={keyboardArrowUp} alt="" width={18} height={18} />
            </button>
            <span className="vision2-submission__count">
              <span>{position}</span>
              <span className="vision2-submission__count-sep">/</span>
              <span className="vision2-submission__count-total">{total}</span>
            </span>
            <span className="vision2-submission__divider" aria-hidden />
            <button type="button" className="icon-btn" aria-label="Compare submission">
              <img src={splitSwap} alt="" width={20} height={20} />
            </button>
            <button type="button" className="icon-btn" aria-label="View claim form PDF">
              <img src={viewPreview} alt="" width={20} height={20} />
            </button>
          </div>
        </header>

        <div className="vision2-submission__facts">
          <Fact label="ID">{row.id}</Fact>
          <Fact label="Created">{row.created}</Fact>
          <Fact label="Submitted">{row.submitted}</Fact>
          <Fact label="Status">
            <span className={`submissions-widget__status submissions-widget__status--${row.status}`}>
              <img src={STATUS_ICON[row.status]} alt="" width={16} height={16} />
              {row.statusLabel}
            </span>
          </Fact>
          <Fact label="Total Charges">{row.charges}</Fact>
          <Fact label="Index">
            <span className={`submissions-widget__index submissions-widget__index--${row.index}`}>
              {row.index === 'primary' ? 'Primary' : 'Secondary'}
            </span>
          </Fact>
          <Fact label="Payer">{row.payer}</Fact>
          <Fact label="Member ID">{row.memberId}</Fact>
          <Fact label="Type">{row.type}</Fact>
          <Fact label="Method">{row.method}</Fact>
        </div>

        <h3 className="vision2-submission__section-title">Basic Information</h3>
        <section className="vision2-submission__block" aria-labelledby="submission-patient-title">
          <h4 id="submission-patient-title" className="vision2-submission__block-title">Patient</h4>
          <div className="vision2-submission__card">
            <Pair label="First Name" value="Cole" />
            <Pair label="Insurance Company" value={row.payer} />
            <Pair label="Last Name" value="Crawford" />
            <Pair label="Termination Date" value="No termination date" muted />
            <Pair label="Date of Birth" value="04/02/2012" />
            <Pair label="Address" value="16691 Boston Pkwy" />
            <Pair label="Gender" value="Male" />
            <Pair label="City" value="Clive" />
            <Pair label="Relationship" value="Child" />
            <Pair label="State" value="IA" />
            <Pair label="Member ID" value={row.memberId} />
            <Pair label="Zipcode" value="50325" />
            <Pair label="Group Number" value="76412766" />
          </div>
        </section>

        <section className="vision2-submission__block" aria-labelledby="submission-eligibility-title">
          <h4 id="submission-eligibility-title" className="vision2-submission__block-title">Eligibility Central</h4>
          <div className="vision2-submission__card">
            <Pair label="Payer Name" value={row.payer} />
            <Pair label="Company Type" value="Commercial" />
            <Pair label="Policy Number" value={row.memberId} />
            <Pair label="Service Type" value="Professional" />
            <Pair label="Relationship" value="Child" />
            <Pair label="Group Number" value="76412766" />
            <Pair label="Provider" value="Nicholas Grimoskas" />
          </div>
        </section>

        <section className="vision2-submission__block" aria-labelledby="submission-providers-title">
          <h4 id="submission-providers-title" className="vision2-submission__block-title">Providers</h4>
          <div className="vision2-submission__card vision2-submission__card--provider">
            <div className="vision2-submission__badge">
              <Badge variant="rendering">Rendering</Badge>
            </div>
            <Pair label="Name" value="Nicholas Grimoskas" />
            <Pair label="Address" value="850 43rd Ave Ste 100" />
            <Pair label="Provider" value="(309) 762-8890" />
            <Pair label="Address 2" value="—" muted />
          </div>
        </section>
      </div>
    </aside>
  )
}
