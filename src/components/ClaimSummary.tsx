import {
  checkCircle,
  restartAlt,
  summarySparkleA,
  summarySparkleB,
  thumbDown,
  thumbUp,
} from '../assets/icons'

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
          <button type="button" className="claim-summary__action">
            <span className="claim-summary__action-icon">
              <Icon src={checkCircle} size={14} />
            </span>
            Add evaluation CPT code
          </button>
        </div>
      </div>
    </section>
  )
}
