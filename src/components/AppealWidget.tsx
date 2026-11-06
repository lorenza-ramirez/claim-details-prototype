import { useState, type ReactNode } from 'react'
import { widgetArrowDown } from '../assets/icons'

export function AppealWidget({
  id,
  title,
  titleId,
  summary,
  children,
  defaultOpen = true,
  bodyClassName,
}: {
  id?: string
  title: string
  titleId: string
  summary?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  bodyClassName?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = `${titleId}-body`

  return (
    <section
      id={id}
      className={open ? 'appeal-widget' : 'appeal-widget appeal-widget--collapsed'}
      aria-labelledby={titleId}
    >
      <header className="appeal-widget__header">
        <button
          type="button"
          className="appeal-widget__toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="appeal-widget__title">
            <img
              src={widgetArrowDown}
              alt=""
              width={16}
              height={16}
              className={
                open
                  ? 'appeal-widget__chevron appeal-widget__chevron--open'
                  : 'appeal-widget__chevron'
              }
            />
            <h3 id={titleId}>{title}</h3>
          </span>
          {summary ? <span className="appeal-widget__summary">{summary}</span> : null}
        </button>
      </header>
      {open ? (
        <div
          id={bodyId}
          className={bodyClassName ? `appeal-widget__body ${bodyClassName}` : 'appeal-widget__body'}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}
