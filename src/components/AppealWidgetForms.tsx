import { createContext, useContext, useId, useState, type ReactNode } from 'react'
import appealFieldCalendar from '../assets/figma/appeal-field-calendar.svg'
import appealFieldClose from '../assets/figma/appeal-field-close.svg'
import appealFieldDropdown from '../assets/figma/appeal-field-dropdown.svg'
import { AppealWidget } from './AppealWidget'

const ActiveFieldContext = createContext<(fieldId: string | null) => void>(() => {})

/** Reports which appeal field has focus so a preview can highlight the matching content. */
export function AppealFieldFocusProvider({
  onActiveFieldChange,
  children,
}: {
  onActiveFieldChange: (fieldId: string | null) => void
  children: ReactNode
}) {
  return (
    <ActiveFieldContext.Provider value={onActiveFieldChange}>
      {children}
    </ActiveFieldContext.Provider>
  )
}

/** tabIndex lets a click land on the wrapper itself, so fields without an input still report focus. */
function useFieldHighlight(fieldId?: string) {
  const setActiveField = useContext(ActiveFieldContext)
  if (!fieldId) return null
  return {
    tabIndex: -1,
    onFocus: () => setActiveField(fieldId),
    onBlur: () => setActiveField(null),
  }
}

type FieldProps = {
  label: string
  value: string
  icon?: string
  alignEnd?: boolean
  fieldId?: string
  children?: ReactNode
}

export function AppealFormField({
  label,
  value,
  icon,
  alignEnd = false,
  fieldId,
  children,
}: FieldProps) {
  const id = useId()
  const highlight = useFieldHighlight(fieldId)

  return (
    <div className="appeal-form-field" {...highlight}>
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
  fieldId,
}: {
  label: string
  value: string
  options: string[]
  fieldId?: string
}) {
  const id = useId()
  const highlight = useFieldHighlight(fieldId)

  return (
    <div className="appeal-form-field" {...highlight}>
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

function AppealTagField({
  label,
  initialTags,
  fieldId,
}: {
  label: string
  initialTags: string[]
  fieldId?: string
}) {
  const [tags, setTags] = useState(initialTags)
  const highlight = useFieldHighlight(fieldId)

  return (
    <div className="appeal-form-field appeal-form-field--tags" {...highlight}>
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
  defaultOpen = true,
}: {
  id: string
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const titleId = useId()

  return (
    <AppealWidget
      id={id}
      title={title}
      titleId={titleId}
      defaultOpen={defaultOpen}
    >
      <form className="appeal-form-widget__grid" onSubmit={(event) => event.preventDefault()}>
        {children}
      </form>
    </AppealWidget>
  )
}

/** Synthetic prototype values transcribed from Figma; no real patient or provider data. */
export function AppealWidgetForms() {
  return (
    <>
      <AppealFormCard
        id="appeal-section-claim-denial"
        title="Claim and Denial Values"
        defaultOpen={false}
      >
        <AppealFormField label="Patient" value="Jz Testform Test" fieldId="patient" />
        <AppealFormField
          label="DOB"
          value="11/22/1971"
          icon={appealFieldCalendar}
          fieldId="dob"
        />
        <AppealFormField label="Member ID" value="XZA88213307" fieldId="member-id" />
        <AppealFormField label="Group Number" value="AZ-0092" fieldId="group-number" />
        <AppealFormField
          label="Claim / submission"
          value="22169011 / SUB-9077110"
          fieldId="claim-submission"
        />
        <AppealFormField
          label="Payer ICN"
          value="2026230118804"
          alignEnd
          fieldId="payer-icn"
        />
        <AppealFormField
          label="Date of service"
          value="07/09/2026"
          icon={appealFieldCalendar}
          fieldId="date-of-service"
        />
        <AppealTagField
          label="CPTs"
          initialTags={['97110 ×2', '97140 ×2', '97530 ×1']}
          fieldId="cpts"
        />
        <AppealFormField label="Billed" value="$361.23" alignEnd fieldId="billed" />
        <AppealTagField
          label="Denial Type"
          initialTags={['Medical necessity (CO-50)', 'Prior authorization (CO-197)']}
          fieldId="denial-type"
        />
        <AppealFormField
          label="Remit date"
          value="08/18/2026"
          icon={appealFieldCalendar}
          fieldId="remit-date"
        />
        <AppealFormField
          label="Appeal level"
          value="First-level appeal"
          fieldId="appeal-level"
        />
        <AppealSelectField
          label="Payer index"
          value="Primary"
          options={['Primary', 'Secondary']}
          fieldId="payer-index"
        />
        <AppealFormField
          label="Payer"
          value="BCBS Arizona · Appeals / Medical Review Department"
          fieldId="payer"
        />
        <AppealFormField
          label="Date"
          value="09/08/2026"
          icon={appealFieldCalendar}
          fieldId="date"
        />
      </AppealFormCard>
    </>
  )
}
