import { useState, type ReactNode } from 'react'
import {
  paymentsArrowDropDown,
  submissionAccountCircle,
  submissionRule,
  submissionsError,
  submissionsPaid,
  submissionsRejected,
  viewPreview,
} from '../assets/icons'
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
