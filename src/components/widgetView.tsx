import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  dockToRight,
  expandContent,
  keyboardArrowDown2,
  keyboardArrowUp,
  leftPanelClose,
  viewDoubleArrow,
  viewMenu,
  viewPreview,
} from '../assets/icons'
import { ClaimDetailsSplitContent } from './ClaimDetailsSplitContent'

export type WidgetViewId =
  | 'details'
  | 'submissions'
  | 'documentation'
  | 'remittances'
  | 'payments'
  | 'activity'
  | 'review'

export type WidgetViewMode = 'split' | 'full' | 'side'

export type WidgetViewPane = {
  widgetId: WidgetViewId
  title: string
}

export type WidgetViewState = {
  mode: WidgetViewMode
  widgetId: WidgetViewId
  title: string
  /** Second split pane when dual-split is active (Current version). */
  secondary?: WidgetViewPane
  /** Optional record label when opening from a table row. */
  recordTitle?: string
  /** Sibling record labels for side-view prev/next navigation. */
  records?: string[]
  recordIndex?: number
}

type WidgetViewContextValue = {
  view: WidgetViewState | null
  openSplit: (widgetId: WidgetViewId, title: string) => void
  openFull: (widgetId: WidgetViewId, title: string) => void
  openSide: (
    widgetId: WidgetViewId,
    title: string,
    recordTitle?: string,
    records?: string[],
  ) => void
  navigateRecord: (delta: -1 | 1) => void
  close: () => void
  closeSplitPane: (pane: 'primary' | 'secondary') => void
}

const WidgetViewContext = createContext<WidgetViewContextValue | null>(null)

export function WidgetViewProvider({
  children,
  allowDualSplit = false,
}: {
  children: ReactNode
  allowDualSplit?: boolean
}) {
  const [view, setView] = useState<WidgetViewState | null>(null)

  useEffect(() => {
    if (allowDualSplit) return
    setView((current) => {
      if (!current?.secondary) return current
      return {
        mode: 'split',
        widgetId: current.widgetId,
        title: current.title,
      }
    })
  }, [allowDualSplit])

  const openSplit = useCallback(
    (widgetId: WidgetViewId, title: string) => {
      setView((current) => {
        if (
          allowDualSplit &&
          current?.mode === 'split' &&
          current.widgetId !== widgetId
        ) {
          if (current.secondary?.widgetId === widgetId) {
            return current
          }
          return {
            mode: 'split',
            widgetId: current.widgetId,
            title: current.title,
            secondary: { widgetId, title },
          }
        }

        if (current?.mode === 'split' && current.widgetId === widgetId && !current.secondary) {
          return current
        }

        return { mode: 'split', widgetId, title }
      })
    },
    [allowDualSplit],
  )

  const openFull = useCallback((widgetId: WidgetViewId, title: string) => {
    setView({ mode: 'full', widgetId, title })
  }, [])

  const openSide = useCallback(
    (widgetId: WidgetViewId, title: string, recordTitle?: string, records?: string[]) => {
      const list = records && records.length > 0 ? records : undefined
      let recordIndex: number | undefined
      if (list && recordTitle) {
        const match = list.indexOf(recordTitle)
        recordIndex = match >= 0 ? match : 0
      } else if (list) {
        recordIndex = 0
      }

      setView({
        mode: 'side',
        widgetId,
        title,
        recordTitle: list && recordIndex != null ? list[recordIndex] : recordTitle,
        records: list,
        recordIndex,
      })
    },
    [],
  )

  const navigateRecord = useCallback((delta: -1 | 1) => {
    setView((current) => {
      if (!current?.records || current.recordIndex == null) return current
      const nextIndex = current.recordIndex + delta
      if (nextIndex < 0 || nextIndex >= current.records.length) return current
      return {
        ...current,
        recordIndex: nextIndex,
        recordTitle: current.records[nextIndex],
      }
    })
  }, [])

  const close = useCallback(() => {
    setView(null)
  }, [])

  const closeSplitPane = useCallback((pane: 'primary' | 'secondary') => {
    setView((current) => {
      if (!current || current.mode !== 'split') return current
      if (pane === 'secondary') {
        if (!current.secondary) return current
        return {
          mode: 'split',
          widgetId: current.widgetId,
          title: current.title,
        }
      }
      if (current.secondary) {
        return {
          mode: 'split',
          widgetId: current.secondary.widgetId,
          title: current.secondary.title,
        }
      }
      return null
    })
  }, [])

  const value = useMemo(
    () => ({ view, openSplit, openFull, openSide, navigateRecord, close, closeSplitPane }),
    [view, openSplit, openFull, openSide, navigateRecord, close, closeSplitPane],
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
  widgetId,
  onClose,
  onOpenSide,
  onOpenSplit,
  onOpenFull,
  recordIndex,
  recordCount,
  onNavigateRecord,
}: {
  mode: WidgetViewMode
  title: string
  widgetId?: WidgetViewId
  onClose: () => void
  onOpenSide?: () => void
  onOpenSplit?: () => void
  onOpenFull?: () => void
  recordIndex?: number
  recordCount?: number
  onNavigateRecord?: (delta: -1 | 1) => void
}) {
  const showSplitActions = mode === 'split'
  const showSideActions = mode === 'side'
  const showRecordNav =
    showSideActions &&
    recordCount != null &&
    recordCount > 1 &&
    recordIndex != null &&
    onNavigateRecord

  const canGoPrev = showRecordNav && recordIndex > 0
  const canGoNext = showRecordNav && recordIndex < recordCount - 1

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
            {showRecordNav ? (
              <>
                <div className="page-controls widget-view-panel__record-nav">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Next record"
                    title="Next record"
                    disabled={!canGoNext}
                    onClick={() => onNavigateRecord(1)}
                  >
                    <Icon src={keyboardArrowDown2} size={18} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Previous record"
                    title="Previous record"
                    disabled={!canGoPrev}
                    onClick={() => onNavigateRecord(-1)}
                  >
                    <Icon src={keyboardArrowUp} size={18} />
                  </button>
                  <div
                    className="page-index"
                    aria-label={`Record ${recordIndex + 1} of ${recordCount}`}
                  >
                    <span className="page-index__current">{recordIndex + 1}</span>
                    <span className="page-index__sep">/</span>
                    <span className="page-index__total">{recordCount}</span>
                  </div>
                </div>
                <span className="widget-view-panel__header-divider" aria-hidden />
              </>
            ) : null}
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
      <div className="widget-view-panel__body">
        {widgetId === 'details' ? <ClaimDetailsSplitContent /> : null}
      </div>
    </aside>
  )
}
