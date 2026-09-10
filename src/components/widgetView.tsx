import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  dockToRight,
  expandContent,
  leftPanelClose,
  viewDoubleArrow,
  viewMenu,
  viewPreview,
} from '../assets/icons'

export type WidgetViewId =
  | 'details'
  | 'submissions'
  | 'documentation'
  | 'remittances'
  | 'payments'
  | 'activity'

export type WidgetViewMode = 'split' | 'full' | 'side'

export type WidgetViewState = {
  mode: WidgetViewMode
  widgetId: WidgetViewId
  title: string
  /** Optional record label when opening from a table row. */
  recordTitle?: string
}

type WidgetViewContextValue = {
  view: WidgetViewState | null
  openSplit: (widgetId: WidgetViewId, title: string) => void
  openFull: (widgetId: WidgetViewId, title: string) => void
  openSide: (widgetId: WidgetViewId, title: string, recordTitle?: string) => void
  close: () => void
}

const WidgetViewContext = createContext<WidgetViewContextValue | null>(null)

export function WidgetViewProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<WidgetViewState | null>(null)

  const openSplit = useCallback((widgetId: WidgetViewId, title: string) => {
    setView({ mode: 'split', widgetId, title })
  }, [])

  const openFull = useCallback((widgetId: WidgetViewId, title: string) => {
    setView({ mode: 'full', widgetId, title })
  }, [])

  const openSide = useCallback((widgetId: WidgetViewId, title: string, recordTitle?: string) => {
    setView({ mode: 'side', widgetId, title, recordTitle })
  }, [])

  const close = useCallback(() => {
    setView(null)
  }, [])

  const value = useMemo(
    () => ({ view, openSplit, openFull, openSide, close }),
    [view, openSplit, openFull, openSide, close],
  )

  return <WidgetViewContext.Provider value={value}>{children}</WidgetViewContext.Provider>
}

export function useWidgetView() {
  const ctx = useContext(WidgetViewContext)
  if (!ctx) {
    throw new Error('useWidgetView must be used within WidgetViewProvider')
  }
  return ctx
}

function Icon({
  src,
  size = 20,
  alt = '',
  className,
}: {
  src: string
  size?: number
  alt?: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      draggable={false}
    />
  )
}

/** Shared Split / Full hover actions for claim widgets. */
export function WidgetViewButtons({
  widgetId,
  title,
  className,
}: {
  widgetId: WidgetViewId
  title: string
  className: string
}) {
  const { openSplit, openFull } = useWidgetView()

  return (
    <div className={className}>
      <button
        type="button"
        className="icon-btn"
        aria-label="Split view"
        title="Split View"
        onClick={() => openSplit(widgetId, title)}
      >
        <Icon src={leftPanelClose} size={20} />
      </button>
      <button
        type="button"
        className="icon-btn"
        aria-label="Full page"
        title="Full Page"
        onClick={() => openFull(widgetId, title)}
      >
        <Icon src={expandContent} size={20} />
      </button>
    </div>
  )
}

/** Empty shell for split / full / side widget views (content TBD). */
export function WidgetViewPanel({
  mode,
  title,
  onClose,
  onOpenSide,
  onOpenSplit,
  onOpenFull,
}: {
  mode: WidgetViewMode
  title: string
  onClose: () => void
  onOpenSide?: () => void
  onOpenSplit?: () => void
  onOpenFull?: () => void
}) {
  const showSplitActions = mode === 'split'
  const showSideActions = mode === 'side'

  return (
    <aside
      className={`widget-view-panel widget-view-panel--${mode}`}
      aria-label={`${title} ${mode} view`}
    >
      <div className="panel-header widget-view-panel__header">
        {showSplitActions ? (
          <button
            type="button"
            className="icon-btn"
            aria-label="Close content"
            title="Close Content"
            onClick={onClose}
          >
            <Icon src={viewMenu} size={20} />
          </button>
        ) : null}
        <h2 className="panel-header__title">{title}</h2>
        {showSplitActions ? (
          <div className="widget-view-panel__header-actions">
            <button
              type="button"
              className="icon-btn icon-btn--outlined"
              aria-label="Preview submission"
              title="Preview Submission"
            >
              <Icon src={viewPreview} size={20} />
            </button>
            <span className="widget-view-panel__header-divider" aria-hidden />
            <button
              type="button"
              className="icon-btn icon-btn--outlined"
              aria-label="Side view"
              title="Side View"
              onClick={onOpenSide}
            >
              <Icon src={dockToRight} size={20} className="icon--flip-x" />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--outlined"
              aria-label={`Close ${title} split view`}
              title="Close"
              onClick={onClose}
            >
              <Icon src={viewDoubleArrow} size={20} />
            </button>
          </div>
        ) : showSideActions ? (
          <div className="widget-view-panel__header-actions">
            <button
              type="button"
              className="icon-btn icon-btn--outlined"
              aria-label="Split view"
              title="Split View"
              onClick={onOpenSplit}
            >
              <Icon src={leftPanelClose} size={20} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn--outlined"
              aria-label="Full page"
              title="Full Page"
              onClick={onOpenFull}
            >
              <Icon src={expandContent} size={20} />
            </button>
            <span className="widget-view-panel__header-divider" aria-hidden />
            <button
              type="button"
              className="icon-btn icon-btn--outlined"
              aria-label={`Close ${title} side view`}
              title="Close"
              onClick={onClose}
            >
              <Icon src={viewDoubleArrow} size={20} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="icon-btn"
            aria-label={`Close ${title} ${mode} view`}
            onClick={onClose}
          >
            <Icon src={dockToRight} size={18} />
          </button>
        )}
      </div>
      <div className="widget-view-panel__body" />
    </aside>
  )
}
