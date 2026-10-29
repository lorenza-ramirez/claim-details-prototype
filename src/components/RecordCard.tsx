import type { ReactNode } from 'react'

export type RecordCardFact = {
  label: string
  value?: string
  children?: ReactNode
}

export function RecordCard({
  title,
  label,
  open = false,
  selected = false,
  selectable = false,
  onOpen,
  onToggleSelected,
  action,
  facts,
}: {
  title: string
  /** Accessible name for the record, used in “Open …” and the checkbox. */
  label: string
  open?: boolean
  selected?: boolean
  selectable?: boolean
  onOpen: () => void
  onToggleSelected?: () => void
  action?: { label: string; onClick: () => void }
  facts: RecordCardFact[]
}) {
  return (
    <div
      className={[
        'submission-card',
        open ? 'submission-card--open' : '',
        selected ? 'submission-card--selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      aria-current={open ? 'true' : undefined}
      aria-label={`Open ${label}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <div className="submission-card__head">
        <div className="submission-card__title">
          {selectable ? (
            <button
              type="button"
              className={
                selected
                  ? 'vision2-check vision2-check--on submission-card__check'
                  : 'vision2-check submission-card__check'
              }
              aria-label={selected ? `Deselect ${label}` : `Select ${label}`}
              aria-pressed={selected}
              onClick={(event) => {
                event.stopPropagation()
                onToggleSelected?.()
              }}
            />
          ) : null}
          <span className="submission-card__id" title={title}>
            {title}
          </span>
        </div>
        {action ? (
          <button
            type="button"
            className="submission-card__appeal"
            onClick={(event) => {
              event.stopPropagation()
              action.onClick()
            }}
          >
            {action.label}
            <span className="submission-card__chevron" aria-hidden />
          </button>
        ) : null}
      </div>
      <div className="submission-card__divider" />
      <div className="submission-card__grid">
        {facts.map((fact) => (
          <div key={fact.label} className="submission-card__fact">
            <span className="submission-card__label">{fact.label}</span>
            {fact.children ?? <span className="submission-card__value">{fact.value}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
