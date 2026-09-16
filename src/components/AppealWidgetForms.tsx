import { useId, useState, type ReactNode } from 'react'
import { widgetArrowDown } from '../assets/icons'
import appealFieldCalendar from '../assets/figma/appeal-field-calendar.svg'
import appealFieldClose from '../assets/figma/appeal-field-close.svg'
import appealFieldDropdown from '../assets/figma/appeal-field-dropdown.svg'
import appealFieldPhone from '../assets/figma/appeal-field-phone.svg'

type FieldProps = {
  label: string
  value: string
  icon?: string
  alignEnd?: boolean
  children?: ReactNode
}

function AppealFormField({ label, value, icon, alignEnd = false, children }: FieldProps) {
  const id = useId()

  return (
    <div className="appeal-form-field">
      {children ?? (
        <div className="appeal-form-field__control">
          {icon && icon !== appealFieldCalendar ? (
            <img className="appeal-form-field__icon" src={icon} alt="" width={20} height={20} />
          ) : null}
          <input
            id={id}
            className={alignEnd ? 'appeal-form-field__input appeal-form-field__input--end' : 'appeal-form-field__input'}
            type="text"
            defaultValue={value}
            aria-label={label}
          />
          {icon === appealFieldCalendar ? (
            <img className="appeal-form-field__icon" src={icon} alt="" width={20} height={20} />
          ) : null}
        </div>
      )}
      <label className="appeal-form-field__label" htmlFor={id}>
        {label}
      </label>
    </div>
  )
}

function AppealSelectField({
  label,
  value,
  options,
}: {
  label: string
  value: string
  options: string[]
}) {
  const id = useId()

  return (
    <div className="appeal-form-field">
      <select id={id} className="appeal-form-field__input appeal-form-field__select" defaultValue={value}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <img
        className="appeal-form-field__select-icon"
        src={appealFieldDropdown}
        alt=""
        width={20}
        height={20}
      />
      <label className="appeal-form-field__label" htmlFor={id}>
        {label}
      </label>
    </div>
  )
}

function AppealTagField({ label, initialTags }: { label: string; initialTags: string[] }) {
  const [tags, setTags] = useState(initialTags)

  return (
    <div className="appeal-form-field appeal-form-field--tags">
      <div className="appeal-form-field__tags" aria-label={label}>
        {tags.map((tag) => (
          <span key={tag} className="appeal-form-field__tag">
            <span>{tag}</span>
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => setTags((current) => current.filter((item) => item !== tag))}
            >
              <img src={appealFieldClose} alt="" width={16} height={16} />
            </button>
          </span>
        ))}
      </div>
      <button type="button" className="appeal-form-field__dropdown" aria-label={`Open ${label} options`}>
        <img src={appealFieldDropdown} alt="" width={20} height={20} />
      </button>
      <span className="appeal-form-field__label">{label}</span>
    </div>
  )
}

function AppealFormCard({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const bodyId = useId()

  return (
    <section
      id={id}
      className={open ? 'appeal-form-widget' : 'appeal-form-widget appeal-form-widget--collapsed'}
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="appeal-form-widget__toggle"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
      >
        <h3 id={titleId}>{title}</h3>
        <img
          src={widgetArrowDown}
          alt=""
          width={20}
          height={20}
          className={open ? 'appeal-form-widget__chevron appeal-form-widget__chevron--open' : 'appeal-form-widget__chevron'}
        />
      </button>
      {open ? (
        <form id={bodyId} className="appeal-form-widget__grid" onSubmit={(event) => event.preventDefault()}>
          {children}
        </form>
      ) : null}
    </section>
  )
}

/** Synthetic prototype values transcribed from Figma; no real patient or provider data. */
export function AppealWidgetForms() {
  return (
    <>
      <AppealFormCard id="appeal-section-claim-denial" title="Claim and Denial Values">
        <AppealFormField label="Patient" value="Jz Testform Test" />
        <AppealFormField label="DOB" value="11/22/1971" icon={appealFieldCalendar} />
        <AppealFormField label="Member ID" value="XZA88213307" />
        <AppealFormField label="Group Number" value="AZ-0092" />
        <AppealFormField label="Claim / submission" value="22169011 / SUB-9077110" />
        <AppealFormField label="Payer ICN" value="2026230118804" alignEnd />
        <AppealFormField label="Date of service" value="07/09/2026" icon={appealFieldCalendar} />
        <AppealTagField label="CPTs" initialTags={['97110 ×2', '97140 ×2', '97530 ×1']} />
        <AppealFormField label="Billed" value="$361.23" alignEnd />
        <AppealTagField
          label="Denial Type"
          initialTags={['Medical necessity (CO-50)', 'Prior authorization (CO-197)']}
        />
        <AppealFormField label="Remit date" value="08/18/2026" icon={appealFieldCalendar} />
        <AppealFormField label="Appeal level" value="First-level appeal" />
        <AppealSelectField label="Payer index" value="Primary" options={['Primary', 'Secondary']} />
        <AppealFormField
          label="Payer"
          value="BCBS Arizona · Appeals / Medical Review Department"
        />
        <AppealFormField label="Date" value="09/08/2026" icon={appealFieldCalendar} />
      </AppealFormCard>

      <AppealFormCard id="appeal-section-from" title="From · site defaults">
        <AppealFormField label="Practice" value="Athelas WPT Physical Therapy" />
        <AppealFormField label="Provider" value="Dr. Kevin Murar, DPT" />
        <AppealFormField label="NPI" value="1841234567" alignEnd />
        <AppealFormField label="TIN" value="84-2210987" alignEnd />
        <AppealFormField
          label="Address"
          value="1200 Market St, Suite 400, San Francisco, CA 94102"
        />
        <AppealFormField label="Phone" value="(415) 555-0142" icon={appealFieldPhone} />
        <AppealFormField label="Phone" value="(415) 555-0143" icon={appealFieldPhone} />
        <AppealFormField label="Signer" value="Maria Lopez, Billing Manager" />
      </AppealFormCard>

      <AppealFormCard id="appeal-section-request" title="Request">
        <AppealFormField label="Requested Action" value="reprocess and pay $300.13" />
        <AppealFormField
          label="Filing window"
          value="within the appeal window ending 11/16/2026"
        />
        <AppealFormField label="Tracking ref" value="APL-22169011-1" />
      </AppealFormCard>
    </>
  )
}
