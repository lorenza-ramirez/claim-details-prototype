import { useEffect, useRef, useState } from 'react'
import {
  paymentsDangerous,
  restartAlt,
  reviewCelebration,
  reviewDocumentScannerWhite,
  reviewNotifications,
  reviewOpenInNew,
  reviewSave,
  reviewSkipNext,
  reviewWarning,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { WidgetViewButtons } from './widgetView'

export type ReviewStage = 'idle' | 'progress' | 'errors' | 'passed'

type IssueKind = 'block' | 'warning' | 'notification'

type ReviewIssue = {
  id: string
  kind: IssueKind
  title: string
  body: string
  actionLabel: string
  actionIcon: string
  skippable?: boolean
}

/** Synthetic demo review data — not real PHI/PII. */
const ISSUES: ReviewIssue[] = [
  {
    id: 'block-npi',
    kind: 'block',
    title: 'Missing referring NPI',
    body: 'Referring NPI or taxonomy cannot be empty. Correct the claim and resubmit.',
    actionLabel: 'Open Rule',
    actionIcon: reviewOpenInNew,
  },
  {
    id: 'warn-cpt-1',
    kind: 'warning',
    title: 'Evaluation CPT required',
    body: 'Service units are 2 or fewer without an evaluation CPT (97161–97164). Add the appropriate code if applicable.',
    actionLabel: 'Skip',
    actionIcon: reviewSkipNext,
    skippable: true,
  },
  {
    id: 'warn-cpt-2',
    kind: 'warning',
    title: 'Evaluation CPT required',
    body: 'Service units are 2 or fewer without an evaluation CPT (97161–97164). Add the appropriate code if applicable.',
    actionLabel: 'Skip',
    actionIcon: reviewSkipNext,
    skippable: true,
  },
  {
    id: 'note-dup',
    kind: 'notification',
    title: 'Possible duplicate',
    body: 'Same rendering provider, patient, and date of service as Claim #5846415',
    actionLabel: 'Open Claim',
    actionIcon: reviewOpenInNew,
  },
]

const CHECK_LABELS = [
  'Checking payer rules...',
  'Checking coding rules...',
  'Checking duplicates...',
  'Checking NPI / taxonomy...',
]

const SECTION_META: { kind: IssueKind; label: string; icon: string }[] = [
  { kind: 'block', label: 'Blocks', icon: paymentsDangerous },
  { kind: 'warning', label: 'Warnings', icon: reviewWarning },
  { kind: 'notification', label: 'Notification', icon: reviewNotifications },
]

function Icon({
  src,
  size = 22,
  className,
}: {
  src: string
  size?: number
  className?: string
}) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className ? `icon ${className}` : 'icon'}
      draggable={false}
    />
  )
}

function PrimaryButton({
  label,
  onClick,
  loading = false,
  disabled = false,
}: {
  label: string
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className={`review-btn review-btn--primary${loading ? ' review-btn--loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="review-btn__spinner" aria-hidden />
      ) : (
        <Icon src={reviewDocumentScannerWhite} size={16} />
      )}
      {label}
    </button>
  )
}

function TertiaryAction({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: string
  onClick?: () => void
}) {
  return (
    <button type="button" className="review-tertiary" onClick={onClick}>
      {label}
      <Icon src={icon} size={16} />
    </button>
  )
}

function IssueRow({
  issue,
  icon,
  onSkip,
}: {
  issue: ReviewIssue
  icon: string
  onSkip?: () => void
}) {
  return (
    <div className="review-issue">
      <Icon src={icon} size={22} className="review-issue__icon" />
      <div className="review-issue__copy">
        <p className="review-issue__title">{issue.title}</p>
        <p className="review-issue__body">{issue.body}</p>
      </div>
      <TertiaryAction
        label={issue.actionLabel}
        icon={issue.actionIcon}
        onClick={issue.skippable ? onSkip : undefined}
      />
    </div>
  )
}

export function ReviewWidget({
  hideHeader = false,
  initialStage = 'idle',
}: {
  hideHeader?: boolean
  initialStage?: ReviewStage
}) {
  const [stage, setStage] = useState<ReviewStage>(initialStage)
  const [skipped, setSkipped] = useState<Record<string, boolean>>({})
  const [checkIndex, setCheckIndex] = useState(0)
  const runCountRef = useRef(0)
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen

  useEffect(() => {
    if (stage !== 'progress') {
      setCheckIndex(0)
      return
    }
    setCheckIndex(0)
    const tick = window.setInterval(() => {
      setCheckIndex((value) => {
        if (value >= CHECK_LABELS.length - 1) return value
        return value + 1
      })
    }, 700)
    const done = window.setTimeout(() => {
      const next = runCountRef.current === 0 ? 'errors' : 'passed'
      runCountRef.current += 1
      setStage(next)
    }, CHECK_LABELS.length * 700 + 500)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [stage])

  const visibleIssues = ISSUES.filter((issue) => !skipped[issue.id])
  const progressPct = Math.round(((checkIndex + 1) / CHECK_LABELS.length) * 100)
  const statusLabel = CHECK_LABELS[checkIndex] ?? CHECK_LABELS[0]
  const sections = SECTION_META.map((section) => ({
    ...section,
    items: visibleIssues.filter((issue) => issue.kind === section.kind),
  })).filter((section) => section.items.length > 0)

  function startReview() {
    setSkipped({})
    setStage('progress')
  }

  return (
    <section
      className={[
        'review-widget',
        `review-widget--${stage}`,
        isOpen || hideHeader ? '' : 'claim-widget--collapsed',
      ]
        .filter(Boolean)
        .join(' ')}
      {...(hideHeader
        ? { 'aria-label': 'Review' }
        : { 'aria-labelledby': 'review-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="review-widget__title-row">
          <ClaimWidgetTitle
            collapsible={collapsible}
            open={open}
            onToggle={toggle}
            title="Review"
            titleId="review-widget-title"
            titleClassName="review-widget__title"
            controlsId={contentId}
          />
          <WidgetViewButtons
            widgetId="review"
            title="Review"
            className="review-widget__actions"
          />
        </header>
      )}

      {showBody ? (
      <div id={contentId} className="review-widget__body">
        {stage === 'idle' ? (
          <div className="review-banner review-banner--idle">
            <Icon src={reviewSave} size={22} />
            <div className="review-banner__copy">
              <p className="review-banner__title">Save &amp; Review</p>
              <p className="review-banner__desc">Your claim has 2 active changes.</p>
            </div>
            <PrimaryButton label="Save & Review" onClick={startReview} />
          </div>
        ) : null}

        {stage === 'progress' ? (
          <div className="review-banner review-banner--progress">
            <Icon src={restartAlt} size={22} />
            <div className="review-banner__copy review-banner__copy--progress">
              <p className="review-banner__title">{statusLabel}</p>
              <div
                className="review-progress-bar"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
                aria-label={statusLabel}
              >
                <span
                  className="review-progress-bar__fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <PrimaryButton label="Save & Review" loading />
          </div>
        ) : null}

        {stage === 'errors' ? (
          <div className="review-panel">
            <div className="review-panel__header">
              <div className="review-banner__copy">
                <p className="review-banner__title">Validation Failed</p>
                <p className="review-banner__desc">
                  {visibleIssues.length} issue
                  {visibleIssues.length === 1 ? '' : 's'} need attention
                </p>
              </div>
              <PrimaryButton label="Review Again" onClick={startReview} />
            </div>

            <div className="review-panel__sections">
              {sections.map((section, sectionIndex) => (
                <div key={section.kind} className="review-section">
                  {sectionIndex > 0 ? <hr className="review-divider" /> : null}
                  <p className="review-section__label">{section.label}</p>
                  {section.items.map((issue) => (
                    <IssueRow
                      key={issue.id}
                      issue={issue}
                      icon={section.icon}
                      onSkip={
                        issue.skippable
                          ? () =>
                              setSkipped((prev) => ({
                                ...prev,
                                [issue.id]: true,
                              }))
                          : undefined
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {stage === 'passed' ? (
          <div className="review-banner review-banner--passed">
            <Icon src={reviewCelebration} size={22} />
            <div className="review-banner__copy">
              <p className="review-banner__title">Validation Passed</p>
              <p className="review-banner__desc">No submission errors found</p>
            </div>
            <PrimaryButton
              label="Submit"
              onClick={() => {
                runCountRef.current = 0
                setStage('idle')
              }}
            />
          </div>
        ) : null}
      </div>
      ) : null}
    </section>
  )
}
