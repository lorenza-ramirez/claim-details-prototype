import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import appealBackup from '../assets/figma/appeal-backup.svg'
import appealClose from '../assets/figma/appeal-close.svg'
import appealRadioSelected from '../assets/figma/appeal-radio-selected.svg'
import appealRadioUnselected from '../assets/figma/appeal-radio-unselected.svg'
import { widgetArrowDown } from '../assets/icons'
import { AppealDocumentationWidget } from './AppealGeneralInformation'
import { AppealPdfBar, AppealPreviewTabs, type AppealPreviewTab } from './AppealPreviewChrome'
import { AppealFieldFocusProvider, AppealFormField } from './AppealWidgetForms'
import { ClaimDetailsSplitContent } from './ClaimDetailsSplitContent'

type MappedField = {
  label: string
  value: string
}

/** Synthetic prototype values based on the provided payer-form reference; no real PHI/PII. */
const MAPPED_FIELDS: MappedField[] = [
  { label: "Today's date", value: '09/08/2026' },
  { label: "Member's ID number", value: 'XZA88213307' },
  { label: 'Plan type', value: 'Medical' },
  { label: "Member's group number", value: 'AZ-0092' },
  { label: "Member's first name", value: 'Jz' },
  { label: "Member's last name", value: 'Testform Test' },
  { label: "Member's birthdate", value: '11/22/1971' },
  { label: 'Provider name', value: 'Dr. Kevin Murar, DPT' },
  { label: 'TIN / NPI', value: '84-2210987 / 1841234567' },
  { label: 'Provider group', value: 'Athelas WPT Physical Therapy' },
  { label: 'Contact name and title', value: 'Maria Lopez, Billing Manager' },
  {
    label: 'Contact address',
    value: '1200 Market St, Suite 400, San Francisco, CA 94102',
  },
  { label: 'Contact phone', value: '(415) 555-0142' },
  { label: 'Contact fax', value: '(415) 555-0143' },
  { label: 'Contact email', value: 'appeals@athelaswpt.com' },
  { label: 'Claim ID number(s)', value: '2026230118804' },
  { label: 'Reference / authorization number', value: 'AUTH-88213' },
  { label: 'Service date(s)', value: '07/09/2026' },
  { label: 'Initial denial notification date', value: '08/18/2026' },
  { label: 'CPT / HCPCS service being disputed', value: '97110, 97140, 97530' },
]

const PREVIEW_GROUPS = [
  MAPPED_FIELDS.slice(0, 4),
  MAPPED_FIELDS.slice(4, 7),
  MAPPED_FIELDS.slice(7, 10),
  MAPPED_FIELDS.slice(10, 11),
  MAPPED_FIELDS.slice(11, 12),
  MAPPED_FIELDS.slice(12, 15),
  MAPPED_FIELDS.slice(15, 18),
  MAPPED_FIELDS.slice(18, 19),
  MAPPED_FIELDS.slice(19, 20),
]

function FormPreview({ activeField }: { activeField: string | null }) {
  return (
    <div className="payer-form__paper">
      <div className="payer-form__brand">bcbs</div>
      <h3>Practitioner and Provider Complaint and Appeal Request</h3>

      <div className="payer-form__preview-fields">
        {PREVIEW_GROUPS.map((group, groupIndex) => (
          <div
            key={group[0].label}
            className={`payer-form__preview-group payer-form__preview-group--${
              groupIndex === 7 ? 2 : group.length
            }`}
          >
            {group.map((field) => (
              <div
                key={field.label}
                className={
                  activeField === field.label
                    ? 'payer-form__preview-field payer-form__preview-field--active'
                    : 'payer-form__preview-field'
                }
              >
                <span>{field.label}</span>
                <strong>{field.value}</strong>
              </div>
            ))}
            {groupIndex === 7 ? (
              <div className="payer-form__preview-field payer-form__preview-field--blank">
                <span>Reconsideration denial notification date(s)</span>
                <strong>—</strong>
              </div>
            ) : null}
          </div>
        ))}
        <div className="payer-form__preview-explanation">
          <span>Explanation of your request</span>
          <p>
            Authorization #AUTH-88213 for the disputed services was in effect on 07/09/2026.
            Please overturn the denial and reprocess the enclosed appeal.
          </p>
        </div>
      </div>
      <footer>Mail: BCBSAZ Appeals, PO Box 13466, Phoenix, AZ 85002</footer>
    </div>
  )
}

type ChangeFormReason = 'have-form' | 'plan' | 'revision'

const CHANGE_FORM_REASONS: {
  id: ChangeFormReason
  title: string
  description: string
}[] = [
  {
    id: 'have-form',
    title: 'I have the correct form:',
    description: 'Prefer to use a personal form.',
  },
  {
    id: 'plan',
    title: 'Wrong form for this plan:',
    description: 'Right payer, wrong line of business.',
  },
  {
    id: 'revision',
    title: 'Payer published a new revision:',
    description: 'The form we fill is out of date.',
  },
]

function ChangePayerFormDialog({ onClose }: { onClose: () => void }) {
  const [reason, setReason] = useState<ChangeFormReason>('have-form')
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <div className="appeal-prompt-dialog-layer">
      <button
        type="button"
        className="appeal-prompt-dialog__backdrop"
        aria-label="Close change payer form"
        onClick={onClose}
      />
      <section
        className="appeal-prompt-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payer-form-change-title"
      >
        <header className="appeal-prompt-dialog__header">
          <h2 id="payer-form-change-title">Change Payer Form</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="appeal-prompt-dialog__close"
            aria-label="Close change payer form"
            title="Close"
            onClick={onClose}
          >
            <img src={appealClose} alt="" width={20} height={20} />
          </button>
        </header>

        <div className="appeal-prompt-dialog__body">
          <div className="payer-form__change-upload">
            <span className="appeal-docs__upload-icon">
              <img src={appealBackup} alt="" width={20} height={20} />
            </span>
            <p>
              drop files here or <button type="button">Browse Files</button>
            </p>
          </div>
          <p className="payer-form__change-hint">
            Upload your new form and our team will map it and notify you
          </p>
          <p className="payer-form__change-reason-label">Reason</p>
          <div className="payer-form__change-options" role="radiogroup" aria-label="Reason">
            {CHANGE_FORM_REASONS.map((option) => {
              const checked = reason === option.id
              return (
                <label key={option.id} className="payer-form__change-option">
                  <input
                    type="radio"
                    name="payer-form-change-reason"
                    value={option.id}
                    checked={checked}
                    onChange={() => setReason(option.id)}
                  />
                  <img
                    src={checked ? appealRadioSelected : appealRadioUnselected}
                    alt=""
                    width={28}
                    height={28}
                  />
                  <span>
                    <strong>{option.title}</strong> {option.description}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <footer className="appeal-prompt-dialog__footer appeal-prompt-dialog__footer--end">
          <button
            type="button"
            className="btn btn--tertiary appeal-prompt-dialog__cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Save
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  )
}

export function AppealPayerForm() {
  const [activePreview, setActivePreview] = useState<AppealPreviewTab>('package')
  const [activeField, setActiveField] = useState<string | null>(null)
  const [fieldsOpen, setFieldsOpen] = useState(true)
  const [changeFormOpen, setChangeFormOpen] = useState(false)

  return (
    <div className="payer-form">
      <section
        className={
          fieldsOpen
            ? 'payer-form__fields'
            : 'payer-form__fields payer-form__fields--collapsed'
        }
        aria-labelledby="payer-form-fields-title"
      >
        <header className="payer-form__fields-header">
          <button
            type="button"
            className="payer-form__fields-toggle"
            aria-expanded={fieldsOpen}
            aria-controls="payer-form-fields-body"
            onClick={() => setFieldsOpen((open) => !open)}
          >
            <img
              src={widgetArrowDown}
              alt=""
              width={16}
              height={16}
              className={
                fieldsOpen
                  ? 'payer-form__fields-chevron payer-form__fields-chevron--open'
                  : 'payer-form__fields-chevron'
              }
            />
            <span>
              <h3 id="payer-form-fields-title">Payer form fields</h3>
              <p>BCBSAZ Provider Appeal Form</p>
            </span>
          </button>
          <div className="payer-form__fields-actions">
            <button
              type="button"
              className="btn btn--action-bar"
              onClick={() => setChangeFormOpen(true)}
            >
              Change payer form
            </button>
          </div>
        </header>

        {fieldsOpen ? (
          <div id="payer-form-fields-body" className="payer-form__fields-body">
            <AppealFieldFocusProvider onActiveFieldChange={setActiveField}>
              <form
                className="payer-form__field-grid"
                onSubmit={(event) => event.preventDefault()}
              >
                {MAPPED_FIELDS.map((field) => (
                  <AppealFormField
                    key={field.label}
                    label={field.label}
                    value={field.value}
                    fieldId={field.label}
                  />
                ))}
              </form>
            </AppealFieldFocusProvider>
          </div>
        ) : null}
      </section>

      <section className="payer-form__preview" aria-label="Payer form preview">
        <AppealPreviewTabs value={activePreview} onChange={setActivePreview} />
        {activePreview === 'package' ? <AppealPdfBar /> : null}
        <div
          id={`appeal-preview-panel-${activePreview}`}
          className={
            activePreview === 'package'
              ? 'appeal-cover__preview-content'
              : 'appeal-cover__preview-content appeal-cover__preview-content--flush'
          }
          role="tabpanel"
          aria-labelledby={`appeal-preview-tab-${activePreview}`}
        >
          {activePreview === 'package' ? (
            <FormPreview activeField={activeField} />
          ) : activePreview === 'claim' ? (
            <ClaimDetailsSplitContent />
          ) : (
            <AppealDocumentationWidget
              sectionId="payer-preview-documentation"
              variant="attached"
              hideHeader
            />
          )}
        </div>
      </section>

      {changeFormOpen ? <ChangePayerFormDialog onClose={() => setChangeFormOpen(false)} /> : null}
    </div>
  )
}
