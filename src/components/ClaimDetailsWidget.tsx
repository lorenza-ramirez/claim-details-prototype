import { useEffect, useRef, useState, type ReactNode } from 'react'
import { submissionsPaid, touchApp } from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { WidgetViewButtons } from './widgetView'

/** Synthetic demo field values from Figma — not real PHI/PII. */
const details = {
  patient: 'Joshua Massicot',
  dateOfService: '09/01/2026',
  insurances: 'Wc-wegmans',
  providers: 'Timothy Bucklaew, Conor Kelly',
  diagnoses: 'M25.561, M25.562, M54.50, M25.511, M25.512, M54.2, M54.16',
  procedures: '97110, 97112, 97530, L3923, L3921, L3919, L3913, L3906, L3808',
  facility: 'Lattimore Pt Of Brownstone Newark',
  admissionType: 'Emergency',
  dischargeStatus: 'Discharged to home or self-care (routine discharge)',
  dischargeAt: '09/02/2026 20:23',
  typeOfCare: 'Independant part A',
  admissionSource: 'Non-Health Care Facility Point of Origin (Physician Referral)',
  admissionDate: '09/02/2026 12:30',
  currentIllnessDate: '09/02/2026 20:23',
  additionalInfo: 'Notes',
  initialTreatmentDate: '09/02/2026 20:23',
}

/** Synthetic patient hover card — Figma Claims 9024:126837. */
const patientInfo = {
  name: 'Joshua Massicot',
  patientId: '23050634',
  dateOfBirth: '01/25/1982',
  age: '44',
  gender: 'Male',
  site: 'Site Name',
  address: '391 BENTON ST, NY. 14620',
}

/** Synthetic insurance hover card — Figma Claims 9024:125533. */
const insuranceInfo = {
  payerName: 'Wc-wegmans',
  payerId: 'J3845',
  clearingHouse: 'Waystar',
  remainingVisits: '-',
  planStart: '01/19/2026',
  planEnd: '-',
  lastRun: '04/09/2026',
  ranBy: 'Myles Baumann',
  memberId: 'WC2025155829',
  relationship: 'Self',
  serviceType: 'Physical Therapy',
  groupNumber: 'G4036288',
  companyType: 'Workers Compensation',
  gender: 'Female',
  groupName: '-',
  provider: 'LATTIMORE PHYSICAL THERAPY',
}

type FieldProps = {
  label: string
  value: string
  link?: boolean
  truncateLabel?: boolean
}

function Field({ label, value, link = false, truncateLabel = false }: FieldProps) {
  return (
    <div className="claim-details-widget__field">
      <span
        className={
          truncateLabel
            ? 'claim-details-widget__label claim-details-widget__label--truncate'
            : 'claim-details-widget__label'
        }
      >
        {label}
      </span>
      {link ? (
        <button type="button" className="claim-details-widget__value claim-details-widget__value--link">
          <span className="claim-details-widget__value-text">{value}</span>
        </button>
      ) : (
        <span className="claim-details-widget__value">
          <span className="claim-details-widget__value-text">{value}</span>
        </span>
      )}
    </div>
  )
}

function useHoverPopover() {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  function clearCloseTimer() {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function show() {
    clearCloseTimer()
    setOpen(true)
  }

  function hide() {
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false)
      closeTimerRef.current = null
    }, 120)
  }

  return { open, show, hide }
}

function EnrichedHoverRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="enriched-hover__row">
      <span className="enriched-hover__label">{label}</span>
      <span className="enriched-hover__value">{value}</span>
    </div>
  )
}

function EnrichedHoverShell({
  id,
  title,
  wide,
  children,
  onMouseEnter,
  onMouseLeave,
}: {
  id: string
  title: string
  wide?: boolean
  children: ReactNode
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  return (
    <div
      id={id}
      role="tooltip"
      className={wide ? 'enriched-hover enriched-hover--wide' : 'enriched-hover'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="enriched-hover__header">
        <p className="enriched-hover__title">{title}</p>
      </div>
      <div className="enriched-hover__body">{children}</div>
      <div className="enriched-hover__footer">
        <img src={touchApp} alt="" width={20} height={20} />
        <span>Double click to edit</span>
      </div>
    </div>
  )
}

function HoverLinkField({
  label,
  value,
  popoverId,
  fieldClassName,
  popover,
}: {
  label: string
  value: string
  popoverId: string
  fieldClassName: string
  popover: (args: { open: boolean; show: () => void; hide: () => void }) => ReactNode
}) {
  const { open, show, hide } = useHoverPopover()

  return (
    <div className={fieldClassName} onMouseEnter={show} onMouseLeave={hide}>
      <span className="claim-details-widget__label">{label}</span>
      <button
        type="button"
        className="claim-details-widget__value claim-details-widget__value--link"
        aria-describedby={open ? popoverId : undefined}
      >
        <span className="claim-details-widget__value-text">{value}</span>
      </button>
      {popover({ open, show, hide })}
    </div>
  )
}

function PatientField({ value }: { value: string }) {
  return (
    <HoverLinkField
      label="Patient"
      value={value}
      popoverId="patient-info-popover"
      fieldClassName="claim-details-widget__field claim-details-widget__field--hover"
      popover={({ open, show, hide }) =>
        open ? (
          <EnrichedHoverShell
            id="patient-info-popover"
            title="Patient Information"
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <EnrichedHoverRow label="Name" value={patientInfo.name} />
            <EnrichedHoverRow label="Patient ID" value={patientInfo.patientId} />
            <EnrichedHoverRow label="Date of Birth" value={patientInfo.dateOfBirth} />
            <EnrichedHoverRow label="Age" value={patientInfo.age} />
            <EnrichedHoverRow label="Gender" value={patientInfo.gender} />
            <div className="enriched-hover__divider" aria-hidden />
            <EnrichedHoverRow label="Site" value={patientInfo.site} />
            <div className="enriched-hover__stack">
              <span className="enriched-hover__label">Address</span>
              <span className="enriched-hover__address">{patientInfo.address}</span>
            </div>
          </EnrichedHoverShell>
        ) : null
      }
    />
  )
}

function InsurancesField({ value }: { value: string }) {
  return (
    <HoverLinkField
      label="Insurances (1)"
      value={value}
      popoverId="insurance-info-popover"
      fieldClassName="claim-details-widget__field claim-details-widget__field--hover claim-details-widget__field--hover-end"
      popover={({ open, show, hide }) =>
        open ? (
          <EnrichedHoverShell
            id="insurance-info-popover"
            title="Primary Insurance"
            wide
            onMouseEnter={show}
            onMouseLeave={hide}
          >
            <div className="enriched-hover__badge">
              <img src={submissionsPaid} alt="" width={16} height={16} />
              <span>Active</span>
            </div>
            <EnrichedHoverRow label="Payer Name" value={insuranceInfo.payerName} />
            <EnrichedHoverRow label="Payer ID" value={insuranceInfo.payerId} />
            <EnrichedHoverRow label="Clearing House" value={insuranceInfo.clearingHouse} />
            <EnrichedHoverRow label="Remaining Visits" value={insuranceInfo.remainingVisits} />
            <EnrichedHoverRow label="Plan Start" value={insuranceInfo.planStart} />
            <EnrichedHoverRow label="Plan End" value={insuranceInfo.planEnd} />
            <EnrichedHoverRow label="Last Run" value={insuranceInfo.lastRun} />
            <EnrichedHoverRow label="Ran By" value={insuranceInfo.ranBy} />
            <div className="enriched-hover__divider" aria-hidden />
            <EnrichedHoverRow label="Member ID" value={insuranceInfo.memberId} />
            <EnrichedHoverRow label="Relationship" value={insuranceInfo.relationship} />
            <EnrichedHoverRow label="Service Type" value={insuranceInfo.serviceType} />
            <EnrichedHoverRow label="Group Number" value={insuranceInfo.groupNumber} />
            <EnrichedHoverRow label="Company Type" value={insuranceInfo.companyType} />
            <EnrichedHoverRow label="Gender" value={insuranceInfo.gender} />
            <EnrichedHoverRow label="Group Name" value={insuranceInfo.groupName} />
            <EnrichedHoverRow label="Provider" value={insuranceInfo.provider} />
          </EnrichedHoverShell>
        ) : null
      }
    />
  )
}

export function ClaimDetailsWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen

  return (
    <section
      className={
        isOpen || hideHeader
          ? 'claim-details-widget'
          : 'claim-details-widget claim-widget--collapsed'
      }
      {...(hideHeader
        ? { 'aria-label': 'Claim Details' }
        : { 'aria-labelledby': 'claim-details-widget-title' })}
    >
      {hideHeader ? null : (
      <header className="claim-details-widget__title-row">
        <ClaimWidgetTitle
          collapsible={collapsible}
          open={open}
          onToggle={toggle}
          title="Claim Details"
          titleId="claim-details-widget-title"
          titleClassName="claim-details-widget__title"
          controlsId={contentId}
        />
        <WidgetViewButtons
          widgetId="details"
          title="Claim Details"
          className="claim-details-widget__actions"
        />
      </header>
      )}

      {showBody ? (
      <div id={contentId} className="claim-widget__body">
      <div className="claim-details-widget__section">
        <div className="claim-details-widget__grid">
          <div className="claim-details-widget__col">
            <PatientField value={details.patient} />
            <Field label="Date Of Service" value={details.dateOfService} />
          </div>
          <div className="claim-details-widget__col">
            <InsurancesField value={details.insurances} />
            <Field label="Providers (2)" value={details.providers} link />
          </div>
        </div>
        <div className="claim-details-widget__grid">
          <div className="claim-details-widget__col">
            <Field label="Diagnoses (10)" value={details.diagnoses} link />
          </div>
          <div className="claim-details-widget__col">
            <Field label="Procedures (10)" value={details.procedures} link />
          </div>
        </div>
      </div>

      <div className="claim-details-widget__divider" aria-hidden />

      <div className="claim-details-widget__section claim-details-widget__section--spaced">
        <div className="claim-details-widget__grid">
          <div className="claim-details-widget__col claim-details-widget__col--gap">
            <Field label="Facility" value={details.facility} link />
            <Field label="Admission Type Code" value={details.admissionType} />
            <Field label="Discharge Status Code" value={details.dischargeStatus} truncateLabel />
            <Field label="Discharge Status Code" value={details.dischargeAt} truncateLabel />
          </div>
          <div className="claim-details-widget__col claim-details-widget__col--gap">
            <Field label="Type of care" value={details.typeOfCare} />
            <Field label="Admission Source Code" value={details.admissionSource} truncateLabel />
            <Field label="Admission Date" value={details.admissionDate} />
          </div>
        </div>
      </div>

      <div className="claim-details-widget__divider" aria-hidden />

      <div className="claim-details-widget__section claim-details-widget__section--spaced">
        <div className="claim-details-widget__grid">
          <div className="claim-details-widget__col claim-details-widget__col--gap">
            <Field label="Current Illness Date" value={details.currentIllnessDate} />
            <Field label="Additional Info" value={details.additionalInfo} />
          </div>
          <div className="claim-details-widget__col">
            <Field label="Initial Treatment Date" value={details.initialTreatmentDate} />
          </div>
        </div>
      </div>

      <div className="claim-details-widget__divider" aria-hidden />

      <p className="claim-details-widget__hint">
        <img src={touchApp} alt="" width={20} height={20} className="claim-details-widget__hint-icon" />
        <span>
          To get more claim details tap the card to open it (Dates &amp; Occurrences, Procedures &amp;
          Grouping, Values &amp; Conditions)
        </span>
      </p>
      </div>
      ) : null}
    </section>
  )
}
