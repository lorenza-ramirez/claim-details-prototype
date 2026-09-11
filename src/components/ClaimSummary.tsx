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

/** Synthetic demo suggestion copy — not real PHI/PII. */
const SUGGESTION = {
  actionLabel: 'Add evaluation CPT code',
  title: 'Add Evaluation Code',
  reason:
    "The claim includes therapy units without a required evaluation CPT. Adding an evaluation code (97161–97164) aligns the claim with payer documentation rules and reduces the risk of a submission rejection.",
  reasonMore:
    'Verify the selected evaluation code against the chart note, then resubmit to WC-MEMIC.',
  changes: [
    { label: 'Procedure', value: '97110 only → 97161 + 97110' },
    { label: 'Units', value: '2 → 3' },
  ],
  moreChanges: [
    { label: 'Diagnosis link', value: 'Unlinked → M54.50' },
    { label: 'Modifier', value: 'None → GP' },
  ],
  sourceLink: 'Historical Eligibility Check',
}

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

function SuggestedActionHover() {
  const { open, show, hide } = useHoverPopover()
  const [reasonExpanded, setReasonExpanded] = useState(false)
  const [changesExpanded, setChangesExpanded] = useState(false)

  const visibleChanges = changesExpanded
    ? [...SUGGESTION.changes, ...SUGGESTION.moreChanges]
    : SUGGESTION.changes

  return (
    <div
      className="claim-summary__action-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        type="button"
        className="claim-summary__action"
        aria-describedby={open ? 'suggested-action-popover' : undefined}
        aria-expanded={open}
      >
        <span className="claim-summary__action-icon">
          <Icon src={checkCircle} size={14} />
        </span>
        {SUGGESTION.actionLabel}
      </button>

      {open ? (
        <div
          id="suggested-action-popover"
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
              <p className="suggestion-hover__action-title">{SUGGESTION.title}</p>
              <p className="suggestion-hover__reason">
                {SUGGESTION.reason}
                {reasonExpanded ? ` ${SUGGESTION.reasonMore}` : null}
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
              {SUGGESTION.sourceLink}
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
  return (
    <section className="claim-summary" aria-labelledby="claim-summary-title">
      <div className="claim-summary__inner">
        <div className="claim-summary__top">
          <header className="claim-summary__header">
            <SummaryEmblem />
            <h3 id="claim-summary-title" className="claim-summary__title">
              Claim Summary
            </h3>
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

          <p className="claim-summary__body">
            This $61.06 workers&apos; comp claim for{' '}
            <button type="button" className="claim-summary__link">
              DOS 06/24/2026
            </button>{' '}
            has a <span className="claim-summary__error">submission error </span>
            because it includes 2 units of{' '}
            <button type="button" className="claim-summary__link">
              CPT 97110
            </button>{' '}
            without a required evaluation code. Add the appropriate evaluation CPT code
            (97161–97164), verify it against the documentation, and resubmit the claim to WC-MEMIC.
          </p>
        </div>

        <div className="claim-summary__divider" aria-hidden />

        <p className="claim-summary__actions-label">Suggested Actions</p>

        <div className="claim-summary__actions">
          <SuggestedActionHover />
        </div>
      </div>
    </section>
  )
}
