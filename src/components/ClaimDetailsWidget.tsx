import { touchApp } from '../assets/icons'
import { WidgetViewButtons } from './widgetView'

/** Synthetic demo field values from Figma — not real PHI/PII. */
const details = {
  patient: 'Joshua Massicot',
  dateOfService: '09/01/2026',
  insurances: 'WC-Technology Insurance Co',
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

export function ClaimDetailsWidget() {
  return (
    <section className="claim-details-widget" aria-labelledby="claim-details-widget-title">
      <header className="claim-details-widget__title-row">
        <h3 id="claim-details-widget-title" className="claim-details-widget__title">
          Claim Details
        </h3>
        <WidgetViewButtons
          widgetId="details"
          title="Claim Details"
          className="claim-details-widget__actions"
        />
      </header>

      <div className="claim-details-widget__section">
        <div className="claim-details-widget__grid">
          <div className="claim-details-widget__col">
            <Field label="Patient" value={details.patient} link />
            <Field label="Date Of Service" value={details.dateOfService} />
          </div>
          <div className="claim-details-widget__col">
            <Field label="Insurances (2)" value={details.insurances} link />
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
    </section>
  )
}
