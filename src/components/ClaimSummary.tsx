import { useEffect, useRef, useState } from 'react'
import {
  aiGroup1,
  aiGroup2,
  checkCircle,
  keyboardArrowDown,
  paymentsChevronRight,
  thumbDown,
  thumbUp,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { AppealPackageModal } from './AppealPackageModal'

/** Synthetic demo suggestion copy — not real PHI/PII. */
const SUGGESTIONS = [
  {
    id: 'send-resubmission',
    actionLabel: 'Send prepared resubmission',
    title: 'Send Prepared Resubmission',
    reason:
      'United Medical Resources denied 97110 and 97530 under PI-252 with remark M127 (missing patient medical record). A medical record was already attached on September 25, 2026, and the prepared resubmission passed the clearinghouse check on October 16, 2026.',
    reasonMore:
      'Sending it with the attached record directly addresses the documentation denial.',
    changes: [
      { label: 'Submission', value: 'Resubmission · ready to send' },
      { label: 'Denial', value: 'PI-252 / RARC M127' },
    ],
    moreChanges: [
      { label: 'Attachment', value: 'Medical record (09/25/2026)' },
      { label: 'Payer', value: 'United Medical Resources' },
    ],
    sourceLink: 'Remittance 10/14/2026',
  },
  {
    id: 'review-fee-schedule',
    actionLabel: 'Review CO-45 adjustments',
    title: 'Review CO-45 Adjustments',
    reason:
      'CO-45 (charge exceeds fee schedule) was applied to the 97110 and 97140 lines. Confirm the billed amounts against the United Medical Resources contracted rates before resubmitting.',
    reasonMore:
      'CO-45 is a contractual adjustment and is not billable to the patient.',
    changes: [
      { label: 'Lines', value: '97110, 97140' },
      { label: 'Adjustment', value: 'CO-45 · $220.00' },
    ],
    moreChanges: [
      { label: 'Patient responsibility', value: '$0.00' },
    ],
    sourceLink: 'Fee schedule',
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

export function ClaimSummary({
  title = 'Claim Summary',
  hideToggle = false,
  defaultOpen = true,
}: {
  title?: string
  /** Option 2 moves open/close to the page action bar. */
  hideToggle?: boolean
  defaultOpen?: boolean
}) {
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen(defaultOpen, {
    excludeFromCollapseAll: true,
  })
  const [appealOpen, setAppealOpen] = useState(false)
  const showToggle = collapsible && !hideToggle
  const isOpen = !showToggle || open

  return (
    <section
      className={isOpen ? 'claim-summary' : 'claim-summary claim-widget--collapsed'}
      aria-labelledby="claim-summary-title"
    >
      <header className="claim-summary__header">
        <ClaimWidgetTitle
          collapsible={showToggle}
          open={open}
          onToggle={toggle}
          title={title}
          titleId="claim-summary-title"
          titleClassName="claim-summary__title"
          controlsId={contentId}
        />
        <button
          type="button"
          className="ai-tab claim-summary__ask"
          aria-label="Ask Athelas AI"
          title="Ask Athelas AI"
        >
          <span className="ai-mark" aria-hidden>
            <img src={aiGroup1} alt="" width={11} height={20} className="ai-mark__a" />
            <img src={aiGroup2} alt="" width={20} height={11} className="ai-mark__b" />
          </span>
          <span className="claim-summary__ask-label">Ask Athelas AI</span>
        </button>
      </header>

      {isOpen ? (
        <div id={contentId} className="claim-summary__content">
          <div className="claim-summary__details">
            <div className="claim-summary__section">
              <p className="claim-summary__section-title">Where things stand</p>
              <p className="claim-summary__body">
                This claim was <span className="claim-summary__error">fully denied</span>. Rock
                Valley Physical Therapy and Therapy Services billed United Medical Resources $205.00
                for three therapy procedures on September 25, 2026, and{' '}
                <span className="claim-summary__link" role="link" tabIndex={0}>
                  the initial claim sent on September 26, 2026
                </span>{' '}
                came back with a full denial.{' '}
                <span className="claim-summary__link" role="link" tabIndex={0}>
                  United Medical Resources&apos; remittance dated October 14, 2026
                </span>{' '}
                denied the 97110 and 97530 lines under PI-252 (documentation required) with remark
                M127 (missing patient medical record), and applied CO-45 (charge exceeds fee
                schedule) to the 97110 and 97140 lines. Nothing has been paid. Lorenza Ramirez has
                since prepared a resubmission that passed the clearinghouse check on October 16,
                2026, but it has not yet been sent.
              </p>
            </div>
            <div className="claim-summary__section">
              <p className="claim-summary__section-title">What to do next</p>
              <p className="claim-summary__body">
                Send the prepared resubmission to United Medical Resources. The denial was driven by
                PI-252 with remark M127 — the payer said the patient medical record was missing —
                but a medical record was already attached to the claim on September 25, 2026. The
                resubmission has cleared the clearinghouse check and is ready to go out; submitting
                it with the attached record directly addresses the documentation denial on the
                97110 and 97530 lines.
              </p>
            </div>
            <div className="claim-summary__feedback">
              <button type="button" className="icon-btn" aria-label="Good response" title="Good Response">
                <Icon src={thumbUp} size={20} />
              </button>
              <button type="button" className="icon-btn" aria-label="Bad response" title="Bad Response">
                <Icon src={thumbDown} size={20} />
              </button>
            </div>
          </div>

          <div className="claim-summary__suggested">
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
        </div>
      ) : null}
      {appealOpen ? <AppealPackageModal onClose={() => setAppealOpen(false)} /> : null}
    </section>
  )
}
