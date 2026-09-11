import { useEffect, useState, type ReactNode } from 'react'
import { restartAlt, summarySparkleA, summarySparkleB } from '../assets/icons'
import { WidgetViewButtons } from './widgetView'

export type ReviewStage = 'idle' | 'progress' | 'errors' | 'passed'

type IssueKind = 'block' | 'warning' | 'notification'

type ReviewIssue = {
  id: string
  kind: IssueKind
  code: string
  title: string
  body: string
  linkLabel?: string
  skippable?: boolean
}

/** Synthetic demo review data — not real PHI/PII. */
const ISSUES: ReviewIssue[] = [
  {
    id: 'block-85375',
    kind: 'block',
    code: '85375',
    title: 'Missing referring NPI',
    body: 'Referring NPI or taxonomy cannot be empty. Correct the claim and resubmit.',
  },
  {
    id: 'warn-846789',
    kind: 'warning',
    code: '846789',
    title: 'Evaluation CPT required',
    body: 'Service units are 2 or fewer without an evaluation CPT (97161–97164). Add the appropriate code if applicable.',
    skippable: true,
  },
  {
    id: 'note-dup',
    kind: 'notification',
    code: 'DUP',
    title: 'Possible duplicate',
    body: 'Same rendering provider, patient, and date of service as',
    linkLabel: 'Claim #5846415',
  },
]

const CHECKS = [
  'Payer rules',
  'Coding completeness',
  'Duplicate detection',
  'NPI / taxonomy',
]

function Emblem() {
  return (
    <span className="review-emblem" aria-hidden>
      <img src={summarySparkleA} alt="" width={11} height={20} className="review-emblem__a" />
      <img src={summarySparkleB} alt="" width={20} height={11} className="review-emblem__b" />
    </span>
  )
}

function KindLabel({ kind }: { kind: IssueKind }) {
  const label = kind === 'block' ? 'Block' : kind === 'warning' ? 'Warning' : 'Note'
  return <span className={`review-kind review-kind--${kind}`}>{label}</span>
}

function IssueRow({
  issue,
  onSkip,
}: {
  issue: ReviewIssue
  onSkip?: () => void
}) {
  return (
    <article className={`review-row review-row--${issue.kind}`}>
      <div className="review-row__rail" aria-hidden />
      <div className="review-row__main">
        <div className="review-row__top">
          <KindLabel kind={issue.kind} />
          <span className="review-row__code">Rule {issue.code}</span>
        </div>
        <h5 className="review-row__title">{issue.title}</h5>
        <p className="review-row__body">
          {issue.body}
          {issue.linkLabel ? (
            <>
              {' '}
              <button type="button" className="review-inline-link">
                {issue.linkLabel}
              </button>
              .
            </>
          ) : null}
        </p>
      </div>
      {issue.skippable && onSkip ? (
        <button type="button" className="review-row__skip" onClick={onSkip}>
          Skip
        </button>
      ) : null}
    </article>
  )
}

function StageHero({
  eyebrow,
  title,
  description,
  children,
  tone = 'neutral',
}: {
  eyebrow: string
  title: string
  description: ReactNode
  children?: ReactNode
  tone?: 'neutral' | 'progress' | 'danger' | 'success'
}) {
  return (
    <div className={`review-hero review-hero--${tone}`}>
      <p className="review-hero__eyebrow">{eyebrow}</p>
      <h4 className="review-hero__title">{title}</h4>
      <p className="review-hero__desc">{description}</p>
      {children ? <div className="review-hero__actions">{children}</div> : null}
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

  useEffect(() => {
    if (stage !== 'progress') {
      setCheckIndex(0)
      return
    }
    setCheckIndex(0)
    const tick = window.setInterval(() => {
      setCheckIndex((value) => {
        if (value >= CHECKS.length - 1) return value
        return value + 1
      })
    }, 600)
    const done = window.setTimeout(() => setStage('errors'), CHECKS.length * 600 + 400)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [stage])

  const visibleIssues = ISSUES.filter((issue) => !skipped[issue.id])
  const counts = {
    block: visibleIssues.filter((i) => i.kind === 'block').length,
    warning: visibleIssues.filter((i) => i.kind === 'warning').length,
    notification: visibleIssues.filter((i) => i.kind === 'notification').length,
  }
  const progressPct = Math.round(((checkIndex + 1) / CHECKS.length) * 100)
  const activeCheck = CHECKS[checkIndex] ?? CHECKS[0]

  return (
    <section
      className={`review-widget review-widget--${stage}`}
      {...(hideHeader
        ? { 'aria-label': 'Review' }
        : { 'aria-labelledby': 'review-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="review-widget__title-row">
          <Emblem />
          <h3 id="review-widget-title" className="review-widget__title">
            Review
          </h3>
          <WidgetViewButtons
            widgetId="review"
            title="Review"
            className="review-widget__actions"
          />
        </header>
      )}

      <div className="review-widget__body">
        {stage === 'idle' ? (
          <StageHero
            tone="neutral"
            eyebrow="Pending review"
            title="This claim has changes"
            description="Coding or payer details were updated since the last run. Review with Athelas Intelligence before submitting."
          >
            <button
              type="button"
              className="review-btn review-btn--primary"
              onClick={() => setStage('progress')}
            >
              Start review
            </button>
            <span className="review-hero__meta">Last run · 2 days ago</span>
          </StageHero>
        ) : null}

        {stage === 'progress' ? (
          <div className="review-progress">
            <StageHero
              tone="progress"
              eyebrow="Athelas Intelligence"
              title="Review in progress"
              description={
                <>
                  Checking submission readiness for <strong>Aetna PPO Medicare</strong>.
                </>
              }
            />
            <div
              className="review-progress__loader"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPct}
              aria-label={`Review progress: ${activeCheck}`}
            >
              <div className="review-progress__track">
                <span
                  className="review-progress__fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="review-progress__status">
                <span className="review-progress__step">
                  {checkIndex + 1}/{CHECKS.length}
                </span>
                <span className="review-progress__label">{activeCheck}</span>
              </div>
            </div>
          </div>
        ) : null}

        {stage === 'errors' ? (
          <div className="review-findings">
            <div className="review-findings__header">
              <div>
                <p className="review-findings__eyebrow">Validation failed</p>
                <h4 className="review-findings__title">
                  {visibleIssues.length} issue{visibleIssues.length === 1 ? '' : 's'} need attention
                </h4>
              </div>
              <button
                type="button"
                className="review-btn review-btn--secondary"
                onClick={() => {
                  setSkipped({})
                  setStage('progress')
                }}
              >
                <img src={restartAlt} alt="" width={14} height={14} className="icon" />
                Run again
              </button>
            </div>

            <div className="review-metrics" aria-label="Issue summary">
              <div className="review-metric review-metric--block">
                <span className="review-metric__value">{counts.block}</span>
                <span className="review-metric__label">Blocks</span>
              </div>
              <div className="review-metric review-metric--warning">
                <span className="review-metric__value">{counts.warning}</span>
                <span className="review-metric__label">Warnings</span>
              </div>
              <div className="review-metric review-metric--notification">
                <span className="review-metric__value">{counts.notification}</span>
                <span className="review-metric__label">Notes</span>
              </div>
            </div>

            <div className="review-findings__list">
              {visibleIssues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  onSkip={
                    issue.skippable
                      ? () => setSkipped((prev) => ({ ...prev, [issue.id]: true }))
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        {stage === 'passed' ? (
          <div className="review-passed">
            <StageHero
              tone="success"
              eyebrow="Ready to submit"
              title="Validation passed"
              description={
                <>
                  No blocking errors. This claim is ready for{' '}
                  <strong>United Healthcare</strong>.
                </>
              }
            >
              <button type="button" className="review-btn review-btn--primary">
                Submit claim
              </button>
              <button
                type="button"
                className="review-btn review-btn--ghost"
                onClick={() => setStage('progress')}
              >
                Review again
              </button>
            </StageHero>

            <div className="review-passed__notes">
              <p className="review-passed__notes-label">Still worth knowing</p>
              {ISSUES.filter((issue) => issue.kind === 'notification').map((issue) => (
                <IssueRow key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
