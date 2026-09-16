import { useState, type KeyboardEvent } from 'react'
import appealChevronDown from '../assets/figma/appeal-chevron-down.svg'
import appealCoverAi from '../assets/figma/appeal-cover-ai.svg'
import appealDelete from '../assets/figma/appeal-delete.svg'
import appealRestart from '../assets/figma/appeal-restart.svg'
import { AppealWidgetForms } from './AppealWidgetForms'

const ARGUMENT_ACTIONS = [
  'Shorter',
  'Cite the Oswetry Score',
  'Add the LCD Reference',
  'Firmer Tone',
]

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

const CONTENT_PARAGRAPHS = [
  {
    id: 'p1',
    title: 'Paragraph 1',
    body: 'The attached documentation supports the medical necessity of the skilled physical therapy services provided on 07/09/2026. The patient presents with lumbar radiculopathy, thoracolumbar scoliosis, weakness, and pain in the right lower extremity, leading to significant functional limitations in standing tolerance, gait, and lifting.',
  },
  {
    id: 'p2',
    title: 'Paragraph 2',
    body: 'The disputed services (CPT 97110 and CPT 97140 and CPT 97530) were specifically selected to address these deficits: therapeutic exercise to restore strength and range of motion, and manual therapy to reduce pain and improve segmental mobility. The daily note documents progression of exercises as tolerated and a continued need for skilled intervention that cannot be safely performed independently.',
  },
  {
    id: 'p3',
    title: 'Paragraph 3',
    body: 'These services are consistent with the applicable LCD for outpatient physical therapy and with the plan of care certified by the referring provider. We respectfully request that the denial be overturned and the services reprocessed for payment.',
  },
  {
    id: 'p4',
    title: 'Paragraph 4',
    body: 'Authorization for the disputed services (CPT 97110 and CPT 97140 and CPT 97530) was obtained prior to the date of service. Authorization #AUTH-88213 was issued on 07/28/2026 with an effective window covering 07/09/2026, as shown in the enclosed approval letter. The services rendered match the authorized CPT codes and units. We request that the claim be reprocessed against the active authorization on file.',
  },
  {
    id: 'p5',
    title: 'Paragraph 5',
    body: 'The disputed service (CPT 97110 and CPT 97140 and CPT 97530) was reimbursed below the contracted rate. Under the participating provider agreement effective 01/01/2026, the allowed amount for this code is $92.40 per unit. The remit reflects an allowed amount of $61.00, an underpayment of $300.13. We request that the claim be reprocessed at the contracted rate and the outstanding balance of $300.13 be remitted.',
  },
  {
    id: 'p6',
    title: 'Paragraph 6',
    body: 'We request that you reprocess and pay $300.13 within the appeal window ending 11/16/2026. Enclosures: BCBSAZ Provider Appeal Form, CMS-1500 (claim form), EOB / Remit 08/18/2026, Daily Note 07-09-2026.mdx, Auth Approval AUTH-88213.pdf, BCBSAZ Rate Sheet 2026.pdf',
  },
]

function ArgumentActions() {
  return (
    <div className="appeal-cover__actions">
      {ARGUMENT_ACTIONS.map((label) => (
        <button key={label} type="button" className="btn btn--secondary">
          {label}
        </button>
      ))}
    </div>
  )
}

function ArgumentPrompt({ title, prompt }: { title: string; prompt: string }) {
  return (
    <section className="appeal-cover__argument-section">
      <h4>{title}</h4>
      <div className="appeal-cover__prompt">
        <img src={appealCoverAi} alt="" width={20} height={20} />
        <p>
          <strong>Prompt: </strong>
          {prompt}
        </p>
        <button type="button" className="appeal-cover__extra">
          <span aria-hidden>+</span>
          Instructions
        </button>
      </div>
    </section>
  )
}

function ArgumentCard({ onHighlight }: { onHighlight: (id: string | null) => void }) {
  const [open, setOpen] = useState(true)

  return (
    <section
      id="appeal-section-argument"
      className={open ? 'appeal-cover__card' : 'appeal-cover__card appeal-cover__card--collapsed'}
      aria-labelledby="appeal-cover-arguments-title"
      {...(!open
        ? {
            role: 'button',
            tabIndex: 0,
            'aria-expanded': false,
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
      <header className="appeal-cover__card-header">
        {open ? (
          <button
            type="button"
            className="appeal-cover__card-toggle"
            aria-expanded
            aria-controls="appeal-cover-arguments"
            onClick={() => setOpen(false)}
          >
            <span id="appeal-cover-arguments-title">Argument</span>
            <img
              src={appealChevronDown}
              alt=""
              width={20}
              height={20}
              className="appeal-submission__chevron appeal-submission__chevron--up"
            />
          </button>
        ) : (
          <div className="appeal-cover__card-toggle">
            <span id="appeal-cover-arguments-title">Argument</span>
            <img src={appealChevronDown} alt="" width={20} height={20} />
          </div>
        )}
        <button
          type="button"
          className="appeal-cover__library"
          onClick={(event) => event.stopPropagation()}
        >
          Library
        </button>
      </header>
      {open ? (
        <div id="appeal-cover-arguments" className="appeal-cover__arguments">
          {ARGUMENTS.map((argument) => (
            <ArgumentPrompt key={argument.title} {...argument} />
          ))}
          <div id="appeal-section-content" className="appeal-cover__content-body">
            <h4 className="appeal-cover__content-label">Content</h4>
            {CONTENT_PARAGRAPHS.map((paragraph) => (
              <ContentParagraph key={paragraph.id} {...paragraph} onHighlight={onHighlight} />
            ))}
          </div>
          <div className="appeal-cover__divider" role="separator" />
          <div className="appeal-cover__ask-block">
            <ArgumentActions />
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ContentParagraph({
  id,
  title,
  body,
  onHighlight,
}: {
  id: string
  title: string
  body: string
  onHighlight: (id: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <section
      className="appeal-cover__paragraph"
      onMouseEnter={() => onHighlight(id)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(id)}
      onBlur={() => onHighlight(null)}
    >
      <div className="appeal-cover__paragraph-header">
        <button
          type="button"
          className="appeal-cover__paragraph-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span>{title}</span>
          <img
            src={appealChevronDown}
            alt=""
            width={20}
            height={20}
            className={
              open
                ? 'appeal-submission__chevron appeal-submission__chevron--up'
                : 'appeal-submission__chevron'
            }
          />
        </button>
        <div className="appeal-cover__paragraph-actions">
          <button
            type="button"
            className="appeal-cover__icon-btn"
            aria-label={`Delete ${title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={appealDelete} alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            className="appeal-cover__icon-btn"
            aria-label={`Regenerate ${title}`}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={appealRestart} alt="" width={20} height={20} />
          </button>
        </div>
      </div>
      {open ? (
        <textarea
          className="appeal-cover__textarea"
          defaultValue={body}
          aria-label={title}
        />
      ) : null}
    </section>
  )
}

function CoverLetterPage({ activePiece }: { activePiece: string | null }) {
  function pieceClass(id: string) {
    return activePiece === id
      ? 'appeal-cover__letter-piece appeal-cover__letter-piece--active'
      : 'appeal-cover__letter-piece'
  }

  return (
    <article className="appeal-cover__page" aria-label="Generated appeal cover letter preview">
      <header className="appeal-cover__letterhead">
        <strong>Ridgeview Physical Therapy</strong>
        <span>123 Health Way, Suite 200</span>
        <span>Austin, TX 78704</span>
        <span>(512) 555-0187</span>
      </header>

      <div className="appeal-cover__letter-body">
        <p>
          Date: 09/08/2026
          <br />
          To: BCBS Arizona · Appeals / Medical Review Department
        </p>
        <p>Subject: First-level appeal · Request for Claim Review · 22169011 / SUB-9077110</p>
        <p>
          Patient: Jz Testform Test · DOB 11/22/1971
          <br />
          Member ID: XZA88213307 · Group: AZ-0092 · Primary payer
          <br />
          Payer ICN: 2026230118804 · Date of service: 07/09/2026
          <br />
          Services: 97110 ×2, 97140 ×2, 97530 ×1 · Billed: $361.23
          <br />
          Denial: Medical necessity (CO-50); Prior authorization (CO-197); Underpayment /
          contracted rate (CO-45) · Remit 08/18/2026
        </p>
        <p>
          Dear Appeals / Medical Review Department,
          <br />
          We are appealing the denial of the services listed above and respectfully request
          reconsideration.
        </p>
        <p className={pieceClass('p1')}>
          The attached documentation supports the medical necessity of the skilled physical therapy
          services provided on 07/09/2026. The patient presents with lumbar radiculopathy,
          thoracolumbar scoliosis, weakness, and pain in the right lower extremity, leading to
          significant functional limitations in standing tolerance, gait, and lifting.
        </p>
        <div className="appeal-cover__letter-group">
          <p className={pieceClass('p2')}>
            The disputed services (CPT 97110 and CPT 97140 and CPT 97530) were specifically selected
            to address these deficits: therapeutic exercise to restore strength and range of motion,
            and manual therapy to reduce pain and improve segmental mobility. The daily note
            documents progression of exercises as tolerated and a continued need for skilled
            intervention that cannot be safely performed independently.
          </p>
          <p className={pieceClass('p3')}>
            These services are consistent with the applicable LCD for outpatient physical therapy
            and with the plan of care certified by the referring provider. We respectfully request
            that the denial be overturned and the services reprocessed for payment.
          </p>
        </div>
        <div className={`appeal-cover__letter-group ${pieceClass('p4')}`}>
          <p>
            Authorization for the disputed services (CPT 97110 and CPT 97140 and CPT 97530) was
            obtained prior to the date of service. Authorization #AUTH-88213 was issued on
            07/28/2026 with an effective window covering 07/09/2026, as shown in the enclosed
            approval letter.
          </p>
          <p>
            The services rendered match the authorized CPT codes and units. We request that the
            claim be reprocessed against the active authorization on file.
          </p>
        </div>
        <div className={`appeal-cover__letter-group ${pieceClass('p5')}`}>
          <p>
            The disputed service (CPT 97110 and CPT 97140 and CPT 97530) was reimbursed below the
            contracted rate. Under the participating provider agreement effective 01/01/2026, the
            allowed amount for this code is $92.40 per unit. The remit reflects an allowed amount of
            $61.00, an underpayment of $300.13.
          </p>
          <p>
            We request that the claim be reprocessed at the contracted rate and the outstanding
            balance of $300.13 be remitted.
          </p>
        </div>
        <div className={`appeal-cover__letter-group ${pieceClass('p6')}`}>
          <p>
            We request that you reprocess and pay $300.13 within the appeal window ending
            11/16/2026.
          </p>
          <p>
            Enclosures: BCBSAZ Provider Appeal Form, CMS-1500 (claim form), EOB / Remit 08/18/2026,
            Daily Note 07-09-2026.mdx, Auth Approval AUTH-88213.pdf, BCBSAZ Rate Sheet 2026.pdf
          </p>
        </div>
        <p>
          Sincerely,
          <br />
          Appeals Team
          <br />
          Ridgeview Physical Therapy
        </p>
      </div>
    </article>
  )
}

/** Synthetic Figma prototype content — no real patient data. */
export function AppealCoverLetter() {
  const [activePiece, setActivePiece] = useState<string | null>(null)

  return (
    <div className="appeal-cover">
      <section className="appeal-cover__controls">
        <ArgumentCard onHighlight={setActivePiece} />
        <AppealWidgetForms />
      </section>
      <section className="appeal-cover__preview">
        <CoverLetterPage activePiece={activePiece} />
      </section>
    </div>
  )
}
