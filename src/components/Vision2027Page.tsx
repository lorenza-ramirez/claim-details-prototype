import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ATTENTION_CLAIMS } from '../data/attentionClaims'
import { ClaimsMetricsPage } from './ClaimsMetricsPage'

const CLAIM_COUNT = ATTENTION_CLAIMS.length

export function Vision2027Page() {
  const [open, setOpen] = useState(true)

  return (
    <>
      <div className="vision2027-worklist" inert={open ? true : undefined}>
        <ClaimsMetricsPage />
      </div>
      {open ? (
        <AttentionDialog onClose={() => setOpen(false)} />
      ) : (
        <button type="button" className="vision2027-reopen" onClick={() => setOpen(true)}>
          {CLAIM_COUNT} claims need attention
        </button>
      )}
    </>
  )
}

function AttentionDialog({ onClose }: { onClose: () => void }) {
  const shellRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const claim = ATTENTION_CLAIMS[index]
  const atStart = index === 0
  const atEnd = index === CLAIM_COUNT - 1

  useEffect(() => {
    const shell = shellRef.current
    const dialog = dialogRef.current
    if (!shell || !dialog) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.focus()
    const frame = shell

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setIndex((current) => Math.min(CLAIM_COUNT - 1, current + 1))
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setIndex((current) => Math.max(0, current - 1))
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable(frame)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [onClose])

  useEffect(() => {
    const shell = shellRef.current
    const dialog = dialogRef.current
    if (!shell || !dialog) return
    if (!shell.contains(document.activeElement)) dialog.focus()
  }, [index])

  function choose(actionId: string) {
    setChosen((current) => ({ ...current, [claim.id]: actionId }))
  }

  function explore() {
    window.location.assign(`/vision?claim=${encodeURIComponent(claim.id)}`)
  }

  return createPortal(
    <div className="v27-overlay" role="presentation" onMouseDown={onClose}>
      <div ref={shellRef} className="v27-shell" onMouseDown={(event) => event.stopPropagation()}>
        <div
          ref={dialogRef}
          id="v27-dialog"
          className="v27-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="v27-title"
          tabIndex={-1}
        >
        <div className="v27-stage">
          <article key={claim.id} className="v27-preview" aria-label={`Preview of claim ${claim.id}`}>
            <header className="v27-preview__header">
              <span className="v27-preview__id">{claim.id}</span>
              <span className={`v27-status v27-status--${claim.tone}`}>{claim.status}</span>
            </header>
            <p className="v27-preview__payer">{claim.payer}</p>
            <p className="v27-preview__balance">
              <span>Open balance</span>
              <strong>{claim.balance}</strong>
            </p>
            <ul className="v27-lines">
              {claim.lines.map((line) => (
                <li key={line.code}>
                  <span className="v27-lines__code">{line.code}</span>
                  <span className="v27-lines__name">{line.description}</span>
                  <span className="v27-lines__outcome">{line.outcome}</span>
                </li>
              ))}
            </ul>
            <p className="v27-preview__reason">{claim.reason}</p>
          </article>
        </div>

        <div className="v27-detail">
          <header className="v27-detail__top">
            <p className="v27-kicker">
              Needs attention · {index + 1} of {CLAIM_COUNT}
            </p>
            <button type="button" className="v27-close" aria-label="Close" onClick={onClose}>
              <CloseIcon />
            </button>
          </header>

          <div key={claim.id} className="v27-copy">
            <h2 id="v27-title">{claim.title}</h2>
            <p className="v27-meta">
              Claim {claim.id} · {claim.payer} · {claim.balance} open
            </p>

            <section className="v27-section" aria-labelledby="v27-summary-title">
              <h3 id="v27-summary-title">Summary</h3>
              <p>{claim.standing}</p>
              <p>{claim.next}</p>
            </section>

            <section className="v27-section" aria-labelledby="v27-actions-title">
              <h3 id="v27-actions-title">Suggested actions</h3>
              <div className="v27-actions">
                {claim.actions.map((action) => {
                  const selected = chosen[claim.id] === action.id
                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={selected ? 'v27-action v27-action--selected' : 'v27-action'}
                      aria-pressed={selected}
                      onClick={() => choose(action.id)}
                    >
                      {action.label}
                    </button>
                  )
                })}
              </div>
              {chosen[claim.id] ? (
                <p className="v27-chosen">Saved on this claim. Open the full record to finish it.</p>
              ) : null}
            </section>
          </div>

          <button type="button" className="btn btn--primary v27-explore" onClick={explore}>
            Explore more
          </button>
          <p className="sr-only" aria-live="polite">
            {claim.title}. Claim {index + 1} of {CLAIM_COUNT}.
          </p>
        </div>
        </div>

        <div className="v27-handles">
          <div className="v27-handle-row">
            <button
              type="button"
              className="v27-arrow v27-arrow--prev"
              aria-label="Previous claim"
              aria-controls="v27-dialog"
              disabled={atStart}
              onClick={() => setIndex((current) => current - 1)}
            >
              <Chevron direction="left" />
            </button>
            <button
              type="button"
              className="v27-arrow v27-arrow--next"
              aria-label="Next claim"
              aria-controls="v27-dialog"
              disabled={atEnd}
              onClick={() => setIndex((current) => current + 1)}
            >
              <Chevron direction="right" />
            </button>
          </div>
          <div className="v27-dots" role="tablist" aria-label="Claims that need attention">
            {ATTENTION_CLAIMS.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                className={dotIndex === index ? 'v27-dot v27-dot--active' : 'v27-dot'}
                aria-label={`${item.status}, claim ${item.id}`}
                aria-selected={dotIndex === index}
                aria-controls="v27-dialog"
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function focusable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hasAttribute('disabled'),
  )
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === 'left' ? 'm14 6-6 6 6 6' : 'm10 6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
