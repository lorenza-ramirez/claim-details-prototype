import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import argumentAutoAwesome from '../assets/figma/argument-auto-awesome.svg'
import appealClose from '../assets/figma/appeal-close.svg'
import appealEdit from '../assets/figma/appeal-edit.svg'
import appealRestart from '../assets/figma/appeal-restart.svg'
import { AppealDocumentationWidget, type AppealDocument } from './AppealGeneralInformation'
import { AppealPdfBar, AppealPreviewTabs, type AppealPreviewTab } from './AppealPreviewChrome'
import { AppealWidget } from './AppealWidget'
import { AppealFieldFocusProvider, AppealWidgetForms } from './AppealWidgetForms'
import { ClaimDetailsSplitContent } from './ClaimDetailsSplitContent'

const ARGUMENTS = [
  {
    title: 'Medical Necessity',
    prompt:
      'You are drafting the argument section of a provider appeal letter contesting a medical-necessity denial. Argue clinical necessity from the chart note. Cite the documented objective findings, the functional limitations they cause, and the certified plan of care. Tie each disputed CPT to a specific deficit it addresses, and name the skilled element that makes the service one a licensed clinician had to perform. Reference documented progression across visits where the record supports it. Where the remit cites an LCD or plan policy, state how the documentation meets that policy on its own terms rather than arguing the policy. Close by requesting that the denial be overturned and the services reprocessed for payment. Do not invent findings that are not in the attached records.',
  },
  {
    title: 'Prior authorization',
    prompt:
      'You are drafting the argument section of a provider appeal letter contesting a precertification or authorization denial. Argue that authorization was obtained before the date of service, or that the plan does not require authorization for this service. Reference the authorization number, the issue date, and the effective window, and state plainly that the date of service falls inside it. Confirm that the CPT codes and unit counts rendered match the codes and units authorized. Where the plan exempts the service, cite the plan provision. Close by requesting the claim be reprocessed against the active authorization on file.',
  },
  {
    title: 'Underpayment / contracted rate',
    prompt:
      'You are drafting the argument section of a provider appeal letter contesting an underpayment against the contracted rate. Argue the contracted rate. Reference the participating provider agreement, its effective date, and the section that sets the allowed amount for the disputed code. State the contracted allowed amount per unit, the amount actually allowed on the remit, and the exact delta. Keep the arithmetic explicit so the adjuster can verify it without opening the contract. Close by requesting reprocessing at the contracted rate and remittance of the outstanding balance.',
  },
]

type CoverParagraph = {
  id: string
  title: string
  body: string
  promptTitle?: string
  defaultOpen?: boolean
}

const DEFAULT_PARAGRAPHS: CoverParagraph[] = [
  {
    id: 'p1',
    title: 'Paragraph 1',
    promptTitle: 'Medical Necessity',
    body: 'The attached documentation supports the medical necessity of the skilled physical therapy services provided on 07/09/2026. The patient presents with lumbar radiculopathy, thoracolumbar scoliosis, weakness, and pain in the right lower extremity, leading to significant functional limitations in standing tolerance, gait, and lifting. The disputed services (CPT 97110 and CPT 97140 and CPT 97530) were specifically selected to address these deficits: therapeutic exercise to restore strength and range of motion, and manual therapy to reduce pain and improve segmental mobility. These services are consistent with the applicable LCD for outpatient physical therapy and with the plan of care certified by the referring provider. We respectfully request that the denial be overturned and the services reprocessed for payment.',
  },
  {
    id: 'p2',
    title: 'Paragraph 2',
    promptTitle: 'Prior authorization',
    body: 'Authorization for the disputed services (CPT 97110 and CPT 97140 and CPT 97530) was obtained prior to the date of service. Authorization #AUTH-88213 was issued on 07/28/2026 with an effective window covering 07/09/2026, as shown in the enclosed approval letter. The services rendered match the authorized CPT codes and units. We request that the claim be reprocessed against the active authorization on file.',
  },
  {
    id: 'p3',
    title: 'Paragraph 3',
    promptTitle: 'Underpayment / contracted rate',
    body: 'The disputed service (CPT 97110 and CPT 97140 and CPT 97530) was reimbursed below the contracted rate. Under the participating provider agreement effective 01/01/2026, the allowed amount for this code is $92.40 per unit. The remit reflects an allowed amount of $61.00, an underpayment of $300.13. We request that the claim be reprocessed at the contracted rate and the outstanding balance of $300.13 be remitted.',
  },
]

function paragraphForPrompt(paragraphs: CoverParagraph[], promptTitle: string) {
  return paragraphs.find((paragraph) => paragraph.promptTitle === promptTitle)
}

function extraParagraphs(paragraphs: CoverParagraph[]) {
  return paragraphs.filter((paragraph) => !paragraph.promptTitle)
}

function orderedParagraphs(paragraphs: CoverParagraph[]) {
  const tied = ARGUMENTS.map((argument) => paragraphForPrompt(paragraphs, argument.title)).filter(
    (paragraph): paragraph is CoverParagraph => paragraph != null,
  )
  return [...tied, ...extraParagraphs(paragraphs)]
}

function documentTextFor(paragraphs: CoverParagraph[]) {
  return [
    'Dear Appeals / Medical Review Department,\nWe are appealing the denial of the services listed above and respectfully request reconsideration.',
    ...orderedParagraphs(paragraphs).map((paragraph) => paragraph.body),
    'We request that you reprocess and pay $300.13 within the appeal window ending 11/16/2026.\nEnclosures: BCBSAZ Provider Appeal Form, CMS-1500 (claim form), EOB / Remit 08/18/2026, Daily Note 07-09-2026.mdx, Auth Approval AUTH-88213.pdf, BCBSAZ Rate Sheet 2026.pdf',
    'Sincerely,\nAppeals Team\nRidgeview Physical Therapy',
  ].join('\n\n')
}

function ArgumentPrompt({
  title,
  prompt,
  onRestart,
}: {
  title: string
  prompt: string
  onRestart?: () => void
}) {
  const tooltipId = useId()
  const [showFull, setShowFull] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [draftInstructions, setDraftInstructions] = useState('')
  const [scope, setScope] = useState<'all' | 'one'>('all')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const displayedPrompt = instructions ? `${prompt} ${instructions}` : prompt

  function openDialog() {
    setShowFull(false)
    setDraftInstructions(instructions)
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
  }

  function savePrompt() {
    setInstructions(draftInstructions.trim())
    setDialogOpen(false)
  }

  useEffect(() => {
    if (!dialogOpen) return
    closeButtonRef.current?.focus()

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') closeDialog()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dialogOpen])

  return (
    <section
      className="appeal-cover__argument-section"
      onMouseEnter={() => setShowFull(true)}
      onMouseLeave={() => setShowFull(false)}
      onFocus={() => setShowFull(true)}
      onBlur={() => setShowFull(false)}
    >
      <div className="appeal-cover__prompt" aria-describedby={showFull ? tooltipId : undefined}>
        <span className="appeal-cover__prompt-icon">
          <img src={argumentAutoAwesome} alt="" width={20} height={20} />
        </span>
        <p>
          {displayedPrompt}
        </p>
        <button type="button" className="appeal-cover__edit" onClick={openDialog}>
          <img src={appealEdit} alt="" width={14} height={14} />
          Edit
        </button>
        {onRestart ? (
          <button
            type="button"
            className="appeal-cover__icon-btn"
            aria-label="Reset document text"
            title="Reset"
            onClick={onRestart}
          >
            <img src={appealRestart} alt="" width={20} height={20} />
          </button>
        ) : null}
      </div>
      {showFull ? (
        <div id={tooltipId} role="tooltip" className="appeal-cover__prompt-tip">
          <strong>{title} Prompt: </strong>
          {displayedPrompt}
        </div>
      ) : null}
      {dialogOpen
        ? createPortal(
            <div className="appeal-prompt-dialog-layer">
              <button
                type="button"
                className="appeal-prompt-dialog__backdrop"
                aria-label="Close prompt editor"
                onClick={closeDialog}
              />
              <section
                className="appeal-prompt-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${tooltipId}-dialog-title`}
              >
                <header className="appeal-prompt-dialog__header">
                  <h2 id={`${tooltipId}-dialog-title`}>Edit Base Prompt</h2>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    className="appeal-prompt-dialog__close"
                    aria-label="Close prompt editor"
                    title="Close"
                    onClick={closeDialog}
                  >
                    <img src={appealClose} alt="" width={20} height={20} />
                  </button>
                </header>

                <div className="appeal-prompt-dialog__body">
                  <div className="appeal-prompt-dialog__base-prompt">
                    <strong>{title} Prompt: </strong>
                    {prompt}
                  </div>

                  <div className="appeal-prompt-dialog__field">
                    <h3>Context passed automatically</h3>
                    <div className="appeal-prompt-dialog__chips">
                      {[
                        'Claim and submission',
                        'Encounter',
                        'CARC description off the remit',
                        'The documents you selected',
                      ].map((label) => (
                        <span key={label}>{label}</span>
                      ))}
                    </div>
                  </div>

                  <label className="appeal-prompt-dialog__field">
                    <span>Your additional instructions</span>
                    <textarea
                      value={draftInstructions}
                      placeholder="Appended to the base prompt"
                      onChange={(event) => setDraftInstructions(event.target.value)}
                    />
                  </label>

                  <fieldset className="appeal-prompt-dialog__scope">
                    <legend>Scope</legend>
                    <label>
                      <input
                        type="radio"
                        name={`${tooltipId}-scope`}
                        checked={scope === 'all'}
                        onChange={() => setScope('all')}
                      />
                      All payers
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`${tooltipId}-scope`}
                        checked={scope === 'one'}
                        onChange={() => setScope('one')}
                      />
                      One payer only
                    </label>
                  </fieldset>
                </div>

                <footer className="appeal-prompt-dialog__footer">
                  <button
                    type="button"
                    className="btn btn--accent-outline"
                    onClick={savePrompt}
                  >
                    Save as a Site Default
                  </button>
                  <div>
                    <button
                      type="button"
                      className="btn appeal-prompt-dialog__cancel"
                      onClick={closeDialog}
                    >
                      Cancel
                    </button>
                    <button type="button" className="btn btn--primary" onClick={savePrompt}>
                      Save
                    </button>
                  </div>
                </footer>
              </section>
            </div>,
            document.body,
          )
        : null}
    </section>
  )
}

function ArgumentCard({
  paragraphs,
}: {
  paragraphs: CoverParagraph[]
}) {
  const initialDocumentText = documentTextFor(paragraphs)
  const [documentText, setDocumentText] = useState(initialDocumentText)

  return (
    <AppealWidget
      id="appeal-section-argument"
      title="Reasoning"
      titleId="appeal-cover-reasoning-title"
      bodyClassName="appeal-cover__reasoning"
    >
      <ArgumentPrompt
        title={ARGUMENTS[0].title}
        prompt={ARGUMENTS[0].prompt}
        onRestart={() => setDocumentText(initialDocumentText)}
      />
      <label className="appeal-cover__document-field">
        <span>Document Text</span>
        <textarea
          value={documentText}
          aria-label="Document Text"
          onChange={(event) => setDocumentText(event.target.value)}
        />
      </label>
    </AppealWidget>
  )
}

function CoverLetterPage({
  activePiece,
  activeField,
  paragraphs,
}: {
  activePiece: string | null
  activeField: string | null
  paragraphs: CoverParagraph[]
}) {
  function pieceClass(id: string) {
    return activePiece === id
      ? 'appeal-cover__letter-piece appeal-cover__letter-piece--active'
      : 'appeal-cover__letter-piece'
  }

  function markClass(fieldId: string) {
    return activeField === fieldId
      ? 'appeal-cover__mark appeal-cover__mark--active'
      : 'appeal-cover__mark'
  }

  return (
    <article className="appeal-cover__page" aria-label="Generated appeal cover letter preview">
      <header className="appeal-cover__letterhead">
        <strong className={markClass('practice')}>Ridgeview Physical Therapy</strong>
        <span className={markClass('address')}>123 Health Way, Suite 200</span>
        <span className={markClass('address')}>Austin, TX 78704</span>
        <span className={markClass('phone')}>(512) 555-0187</span>
      </header>

      <div className="appeal-cover__letter-body">
        <p>
          Date: <span className={markClass('date')}>09/08/2026</span>
          <br />
          To:{' '}
          <span className={markClass('payer')}>
            BCBS Arizona · Appeals / Medical Review Department
          </span>
        </p>
        <p>
          Subject: <span className={markClass('appeal-level')}>First-level appeal</span> · Request
          for Claim Review ·{' '}
          <span className={markClass('claim-submission')}>22169011 / SUB-9077110</span>
        </p>
        <p>
          Patient: <span className={markClass('patient')}>Jz Testform Test</span> · DOB{' '}
          <span className={markClass('dob')}>11/22/1971</span>
          <br />
          Member ID: <span className={markClass('member-id')}>XZA88213307</span> · Group:{' '}
          <span className={markClass('group-number')}>AZ-0092</span> ·{' '}
          <span className={markClass('payer-index')}>Primary payer</span>
          <br />
          Payer ICN: <span className={markClass('payer-icn')}>2026230118804</span> · Date of
          service: <span className={markClass('date-of-service')}>07/09/2026</span>
          <br />
          Services: <span className={markClass('cpts')}>97110 ×2, 97140 ×2, 97530 ×1</span> ·
          Billed: <span className={markClass('billed')}>$361.23</span>
          <br />
          Denial:{' '}
          <span className={markClass('denial-type')}>
            Medical necessity (CO-50); Prior authorization (CO-197); Underpayment / contracted rate
            (CO-45)
          </span>{' '}
          · Remit <span className={markClass('remit-date')}>08/18/2026</span>
        </p>
        <p>
          Dear Appeals / Medical Review Department,
          <br />
          We are appealing the denial of the services listed above and respectfully request
          reconsideration.
        </p>
        {orderedParagraphs(paragraphs).map((paragraph) => (
          <p key={paragraph.id} className={pieceClass(paragraph.id)}>
            {paragraph.body.trim() || 'New paragraph — add copy in the argument list.'}
          </p>
        ))}
        <p>
          Sincerely,
          <br />
          <span className={markClass('signer')}>Appeals Team</span>
          <br />
          <span className={markClass('practice')}>Ridgeview Physical Therapy</span>
        </p>
      </div>
    </article>
  )
}

/** Cover letter page rendered with default content, for previews outside the Cover Letter step. */
export function AppealCoverLetterPage() {
  return <CoverLetterPage activePiece={null} activeField={null} paragraphs={DEFAULT_PARAGRAPHS} />
}

function CoverLetterDocumentPreview({
  document,
  onClose,
}: {
  document: AppealDocument
  onClose: () => void
}) {
  return (
    <article className="appeal-cover__doc" aria-label={`Document preview ${document.name}`}>
      <header className="appeal-cover__doc-header">
        <div className="appeal-cover__doc-heading">
          <span
            className={`documentation-widget__file-icon documentation-widget__file-icon--${
              document.kind === 'image' ? 'image' : document.kind
            }`}
            aria-hidden
          >
            {document.kind === 'pdf' ? 'PDF' : document.kind === 'image' ? 'IMG' : 'DOC'}
          </span>
          <div>
            <h3>{document.name}</h3>
            <p>
              {document.categoryLabel} · {document.uploaded} · {document.uploadedBy} ·{' '}
              {document.size}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="appeal-cover__doc-close"
          aria-label="Close document preview"
          title="Close"
          onClick={onClose}
        >
          <img src={appealClose} alt="" width={20} height={20} />
        </button>
      </header>
      <div className="appeal-cover__doc-page">
        <p className="appeal-cover__doc-kicker">{document.categoryLabel}</p>
        <h4>{document.name.replace(/\.[^.]+$/, '')}</h4>
        {document.kind === 'image' ? (
          <div className="appeal-cover__doc-image" aria-hidden>
            Therapy progress note preview
          </div>
        ) : null}
        <p>
          Synthetic prototype preview for this attached file. The record was uploaded on{' '}
          {document.uploaded} by {document.uploadedBy} ({document.size}).
        </p>
        <p>
          This view replaces the cover letter so the reviewer can confirm the selected enclosure
          without leaving the Cover Letter step. Close with the X to return to the letter.
        </p>
        {document.kind === 'pdf' ? (
          <p>
            Page 1 of 1 · PDF attachment included in the appeal package. No live file is loaded in
            this prototype.
          </p>
        ) : null}
        {document.kind === 'doc' ? (
          <p>
            Word enclosure included with the appeal package. Body copy in this preview is sample
            placeholder text only.
          </p>
        ) : null}
      </div>
    </article>
  )
}

/** Synthetic Figma prototype content — no real patient data. */
export function AppealCoverLetter() {
  const [activeDocument, setActiveDocument] = useState<AppealDocument | null>(null)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [activePreview, setActivePreview] = useState<AppealPreviewTab>('package')
  const paragraphs = DEFAULT_PARAGRAPHS

  return (
    <div className="appeal-cover">
      <section className="appeal-cover__controls">
        <AppealFieldFocusProvider onActiveFieldChange={setActiveField}>
          <AppealWidgetForms />
        </AppealFieldFocusProvider>
        <ArgumentCard paragraphs={paragraphs} />
      </section>
      <section className="appeal-cover__preview">
        <AppealPreviewTabs
          value={activePreview}
          onChange={(tab) => {
            setActivePreview(tab)
            if (tab !== 'documentation') setActiveDocument(null)
          }}
        />
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
            <CoverLetterPage
              activePiece={null}
              activeField={activeField}
              paragraphs={paragraphs}
            />
          ) : activePreview === 'claim' ? (
            <ClaimDetailsSplitContent />
          ) : activeDocument ? (
            <CoverLetterDocumentPreview
              document={activeDocument}
              onClose={() => setActiveDocument(null)}
            />
          ) : (
            <AppealDocumentationWidget
              sectionId="appeal-preview-documentation"
              variant="attached"
              hideHeader
              activeDocumentId={null}
              onOpenDocument={setActiveDocument}
            />
          )}
        </div>
      </section>
    </div>
  )
}
