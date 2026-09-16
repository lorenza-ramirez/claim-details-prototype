import { useEffect, useRef, useState } from 'react'
import {
  checkCircle,
  keyboardArrowDown,
  paymentsChevronRight,
  restartAlt,
  summarySparkleA,
  summarySparkleB,
  thumbDown,
  thumbUp,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { AppealPackageModal } from './AppealPackageModal'

/** Synthetic demo suggestion copy — not real PHI/PII. */
const SUGGESTIONS = [
  {
    id: 'review-dx',
    actionLabel: 'Review principal diagnosis',
    title: 'Review Principal Diagnosis',
    reason:
      'The claim was denied for an invalid or missing principal diagnosis (CARC 167, RARC MA63). CPT 97110 is billed with M54.2, F07.81, M54.6, and M54.50. Confirm which diagnosis is principal from the visit documentation.',
    reasonMore:
      'Match the principal diagnosis to the documented reason for the encounter, then resubmit to WC-OWCP.',
    changes: [
      { label: 'Principal DX', value: 'Unspecified → confirmed from note' },
      { label: 'Denial', value: 'CARC 167 / RARC MA63' },
    ],
    moreChanges: [
      { label: 'Chart note', value: 'Identify reason for visit' },
      { label: 'Payer', value: 'WC-OWCP / U.S. DOL' },
    ],
    sourceLink: 'Visit documentation',
  },
  {
    id: 'update-seq',
    actionLabel: 'Update diagnosis sequencing',
    title: 'Update Diagnosis Sequencing',
    reason:
      'Diagnosis order and procedure linkage may not identify a valid principal diagnosis for CPT 97110. Re-sequence M54.2, F07.81, M54.6, and M54.50 so the principal diagnosis leads the claim.',
    reasonMore:
      'Link 97110 to the corrected principal diagnosis, then resubmit to WC-OWCP.',
    changes: [
      { label: 'DX sequence', value: 'M54.2, F07.81, M54.6, M54.50' },
      { label: 'Linkage', value: '97110 → principal DX' },
    ],
    moreChanges: [
      { label: 'Principal DX', value: 'Move valid DX to position 1' },
      { label: 'Units', value: '97110 ×3 unchanged' },
    ],
    sourceLink: 'Claim diagnosis pointer',
  },
] as const

type Suggestion = (typeof SUGGESTIONS)[number]

function Icon({
  src,
  size = 20,
  alt = '',
}: {
  src: string
  size?: number
  alt?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className="icon"
      width={size}
      height={size}
      draggable={false}
    />
  )
}

function SummaryEmblem() {
  return (
    <span className="summary-emblem" aria-hidden>
      <img src={summarySparkleA} alt="" width={11} height={20} className="summary-emblem__a" />
      <img src={summarySparkleB} alt="" width={20} height={11} className="summary-emblem__b" />
    </span>
  )
}

function useHoverPopover(delayMs = 120) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current != null) window.clearTimeout(timer.current)
    }
  }, [])

  function show() {
    if (timer.current != null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    setOpen(true)
  }

  function hide() {
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setOpen(false)
      timer.current = null
    }, delayMs)
  }

  return { open, show, hide }
}

function SuggestedActionHover({ suggestion }: { suggestion: Suggestion }) {
  const { open, show, hide } = useHoverPopover()
  const [reasonExpanded, setReasonExpanded] = useState(false)
  const [changesExpanded, setChangesExpanded] = useState(false)
  const popoverId = `${suggestion.id}-popover`

  const visibleChanges = changesExpanded
    ? [...suggestion.changes, ...suggestion.moreChanges]
    : suggestion.changes

  return (
    <div
      className="claim-summary__action-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        className="claim-summary__action"
        aria-describedby={open ? popoverId : undefined}
        aria-expanded={open}
      >
        <span className="claim-summary__action-icon">
          <Icon src={checkCircle} size={14} />
        </span>
        {suggestion.actionLabel}
      </button>

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Why this action is suggested"
          className="suggestion-hover"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div className="suggestion-hover__header">
            <p className="suggestion-hover__header-title">Why this action is suggested</p>
          </div>

          <div className="suggestion-hover__body">
            <div className="suggestion-hover__block">
              <p className="suggestion-hover__action-title">{suggestion.title}</p>
              <p className="suggestion-hover__reason">
                {suggestion.reason}
                {reasonExpanded ? ` ${suggestion.reasonMore}` : null}
                {!reasonExpanded ? '…' : null}
              </p>
              {!reasonExpanded ? (
                <button
                  type="button"
                  className="suggestion-hover__more"
                  onClick={() => setReasonExpanded(true)}
                >
                  More
                  <Icon src={keyboardArrowDown} size={14} />
                </button>
              ) : null}
            </div>

            <div className="suggestion-hover__divider" aria-hidden />

            <div className="suggestion-hover__block">
              <p className="suggestion-hover__section-title">Changes</p>
              <div className="suggestion-hover__changes">
                {visibleChanges.map((change) => (
                  <div key={change.label} className="suggestion-hover__change">
                    <p className="suggestion-hover__change-label">{change.label}</p>
                    <p className="suggestion-hover__change-value">{change.value}</p>
                  </div>
                ))}
              </div>
              {!changesExpanded ? (
                <button
                  type="button"
                  className="suggestion-hover__more"
                  onClick={() => setChangesExpanded(true)}
                >
                  More
                  <Icon src={keyboardArrowDown} size={14} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="suggestion-hover__footer">
            <button type="button" className="suggestion-hover__link">
              {suggestion.sourceLink}
            </button>
            <div className="suggestion-hover__footer-actions">
              <button
                type="button"
                className="icon-btn"
                aria-label="Bad response"
                title="Bad Response"
              >
                <Icon src={thumbDown} size={20} />
              </button>
              <button type="button" className="suggestion-hover__accept">
                Accept
                <Icon src={paymentsChevronRight} size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ClaimSummary() {
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen(true, {
    excludeFromCollapseAll: true,
  })
  const [appealOpen, setAppealOpen] = useState(false)
  const isOpen = !collapsible || open

  return (
    <section
      className={isOpen ? 'claim-summary' : 'claim-summary claim-widget--collapsed'}
      aria-labelledby="claim-summary-title"
    >
      <div className="claim-summary__inner">
        <header className="claim-summary__header">
          <ClaimWidgetTitle
            collapsible={collapsible}
            open={open}
            onToggle={toggle}
            title="Claim Summary"
            titleId="claim-summary-title"
            titleClassName="claim-summary__title"
            controlsId={contentId}
            leading={<SummaryEmblem />}
          />
          <div className="claim-summary__feedback">
            <button type="button" className="icon-btn" aria-label="Good response" title="Good Response">
              <Icon src={thumbUp} size={20} />
            </button>
            <button type="button" className="icon-btn" aria-label="Bad response" title="Bad Response">
              <Icon src={thumbDown} size={20} />
            </button>
            <div className="claim-summary__feedback-divider" aria-hidden />
            <button type="button" className="icon-btn" aria-label="Regenerate summary" title="Regenerate">
              <Icon src={restartAlt} size={20} />
            </button>
          </div>
        </header>

        {isOpen ? (
          <div id={contentId} className="claim-widget__body">
            <p className="claim-summary__body">
              This $91.59 workers&apos; comp claim for{' '}
              <button type="button" className="claim-summary__link">
                DOS 08/17/2026
              </button>{' '}
              was <span className="claim-summary__error">fully denied</span> by WC-OWCP / U.S.
              Department of Labor for an invalid or missing principal diagnosis (CARC 167, RARC
              MA63).{' '}
              <button type="button" className="claim-summary__link">
                CPT 97110
              </button>{' '}
              was billed for 3 units with diagnoses including M54.2, F07.81, M54.6, and M54.50.
            </p>

            <div className="claim-summary__divider" aria-hidden />

            <p className="claim-summary__actions-label">Suggested Actions</p>

            <div className="claim-summary__actions">
              {SUGGESTIONS.map((suggestion) => (
                <SuggestedActionHover key={suggestion.id} suggestion={suggestion} />
              ))}
              <button
                type="button"
                className="claim-summary__action"
                onClick={() => setAppealOpen(true)}
              >
                <span className="claim-summary__action-icon">
                  <Icon src={checkCircle} size={14} />
                </span>
                Create an Appeal Package
              </button>
            </div>
          </div>
        ) : null}
      </div>
      {appealOpen ? <AppealPackageModal onClose={() => setAppealOpen(false)} /> : null}
    </section>
  )
}
