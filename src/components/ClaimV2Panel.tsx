import { useEffect, useRef, useState } from 'react'
import type {
  CSSProperties,
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from 'react'
import appealClose from '../assets/figma/appeal-close.svg'
import { dockToRight, splitSwap } from '../assets/icons'
import { ActivityWidget } from './ActivityWidget'
import { ClaimDetailsSplitContent } from './ClaimDetailsSplitContent'
import { ClaimSummary } from './ClaimSummary'
import {
  otherSide,
  paneOf,
  SPLIT_DEFAULT_RATIO,
  SPLIT_MAX_RATIO,
  SPLIT_MIN_RATIO,
  type ClaimSplitView,
  type PaneSide,
} from './claimSplitView'
import { DocumentationWidget } from './DocumentationWidget'
import { PaymentsWidget } from './PaymentsWidget'
import { RemittancesWidget } from './RemittancesWidget'
import { ResizeHandle } from './ResizeHandle'
import { ReviewWidget } from './ReviewWidget'
import { SubmissionsWidget } from './SubmissionsWidget'

export type V2TabId =
  | 'details'
  | 'submissions'
  | 'remittances'
  | 'attachments'
  | 'payments'
  | 'appeals'
  | 'similar'

const V2_TABS: { id: V2TabId; label: string; notification?: boolean }[] = [
  { id: 'details', label: 'Claim Details' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'remittances', label: 'Remittances' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'payments', label: 'Payments' },
  { id: 'appeals', label: 'Appeals' },
  { id: 'similar', label: 'Similar Claims' },
]

const TAB_DRAG_TYPE = 'application/x-claim-tab'
const SIDE_LABEL: Record<PaneSide, string> = { left: 'Left', right: 'Right' }

function tabLabel(id: V2TabId) {
  return V2_TABS.find((tab) => tab.id === id)?.label ?? ''
}

function tabDomId(id: V2TabId) {
  return `claim-v2-tab-${id}`
}

function paneDomId(side: PaneSide) {
  return `claim-v2-pane-${side}`
}

/** Esc stays with dialogs, pickers and other open popups before it closes a pane. */
function escapeBelongsElsewhere(event: KeyboardEvent) {
  if (event.defaultPrevented) return true
  if (document.querySelector('[aria-modal="true"]')) return true
  const target = event.target instanceof Element ? event.target : null
  return Boolean(
    target?.closest('input, textarea, select, [role="combobox"], [aria-expanded="true"]'),
  )
}

function moveTab(order: V2TabId[], tab: V2TabId, target: V2TabId, after: boolean) {
  if (tab === target) return order
  const without = order.filter((id) => id !== tab)
  const index = without.indexOf(target) + (after ? 1 : 0)
  return [...without.slice(0, index), tab, ...without.slice(index)]
}

export function ClaimV2Panel({
  split,
  tabOrder,
  onTabOrderChange,
  showSplitHint,
  onDismissSplitHint,
}: {
  split: ClaimSplitView
  tabOrder: readonly V2TabId[]
  onTabOrderChange: (order: V2TabId[]) => void
  showSplitHint: boolean
  onDismissSplitHint: () => void
}) {
  const { state, isSplit, openTab, openBeside, closePane, setRatio } = split
  const focusedTab = state[state.focused] ?? state.left
  const tabs = tabOrder
    .map((id) => V2_TABS.find((tab) => tab.id === id))
    .filter((tab): tab is (typeof V2_TABS)[number] => tab != null)
  const [rovingTab, setRovingTab] = useState<V2TabId | null>(null)
  const [dragTab, setDragTab] = useState<V2TabId | null>(null)
  const [dropSide, setDropSide] = useState<PaneSide | null>(null)
  const [reorderTarget, setReorderTarget] = useState<{ tab: V2TabId; after: boolean } | null>(
    null,
  )
  const [resizing, setResizing] = useState(false)
  const tabRefs = useRef<Partial<Record<V2TabId, HTMLButtonElement | null>>>({})
  const panesRef = useRef<HTMLDivElement>(null)
  const tabStop = rovingTab ?? focusedTab

  useEffect(() => {
    if (!isSplit) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || escapeBelongsElsewhere(event)) return
      event.preventDefault()
      closePane(otherSide(state.focused))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSplit, state.focused, closePane])

  function moveTabFocus(id: V2TabId) {
    setRovingTab(id)
    tabRefs.current[id]?.focus()
  }

  function handleTabKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, id: V2TabId) {
    const index = tabs.findIndex((tab) => tab.id === id)
    const last = tabs.length - 1
    if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      const neighbor = tabs[index + (event.key === 'ArrowRight' ? 1 : -1)]
      if (neighbor) {
        onTabOrderChange(moveTab([...tabOrder], id, neighbor.id, event.key === 'ArrowRight'))
        window.requestAnimationFrame(() => tabRefs.current[id]?.focus())
      }
    } else if (event.key === 'ArrowRight') moveTabFocus(tabs[index === last ? 0 : index + 1].id)
    else if (event.key === 'ArrowLeft') moveTabFocus(tabs[index === 0 ? last : index - 1].id)
    else if (event.key === 'Home') moveTabFocus(tabs[0].id)
    else if (event.key === 'End') moveTabFocus(tabs[last].id)
    else if (event.key === 'Enter' && event.shiftKey) openBeside(id)
    else return
    event.preventDefault()
  }

  function handleTabDragOver(event: DragEvent<HTMLDivElement>, id: V2TabId) {
    if (!dragTab) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const rect = event.currentTarget.getBoundingClientRect()
    const after = event.clientX > rect.left + rect.width / 2
    if (reorderTarget?.tab !== id || reorderTarget.after !== after) {
      setReorderTarget({ tab: id, after })
    }
  }

  function handleTabDrop(event: DragEvent<HTMLDivElement>, id: V2TabId) {
    event.preventDefault()
    if (dragTab && reorderTarget?.tab === id) {
      onTabOrderChange(moveTab([...tabOrder], dragTab, id, reorderTarget.after))
    }
    endDrag()
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, id: V2TabId) {
    event.dataTransfer.setData(TAB_DRAG_TYPE, id)
    event.dataTransfer.setData('text/plain', tabLabel(id))
    event.dataTransfer.effectAllowed = 'move'
    // Mounting drop zones during dragstart cancels the drag in some browsers.
    window.requestAnimationFrame(() => setDragTab(id))
  }

  function endDrag() {
    setDragTab(null)
    setDropSide(null)
    setReorderTarget(null)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, side: PaneSide) {
    event.preventDefault()
    if (dragTab) openBeside(dragTab, side)
    endDrag()
  }

  const showDropZones = dragTab != null && (isSplit || dragTab !== state.left)

  return (
    <div className={isSplit ? 'claim-v2 claim-v2--split' : 'claim-v2'}>
      <div className="claim-v2__tabs">
        <div className="claim-v2__tab-list" role="tablist" aria-label="Claim sections">
          {tabs.map((tab) => {
            const pane = paneOf(state, tab.id)
            const isFocused = tab.id === focusedTab
            const className = ['claim-v2__tab']
            if (isFocused) className.push('claim-v2__tab--active')
            else if (pane) className.push('claim-v2__tab--open')
            if (dragTab === tab.id) className.push('claim-v2__tab--dragging')
            if (reorderTarget?.tab === tab.id && dragTab !== tab.id) {
              className.push(
                reorderTarget.after ? 'claim-v2__tab--drop-after' : 'claim-v2__tab--drop-before',
              )
            }
            return (
              <div
                key={tab.id}
                className={className.join(' ')}
                onDragOver={(event) => handleTabDragOver(event, tab.id)}
                onDragLeave={() =>
                  setReorderTarget((value) => (value?.tab === tab.id ? null : value))
                }
                onDrop={(event) => handleTabDrop(event, tab.id)}
              >
                <button
                  ref={(node) => {
                    tabRefs.current[tab.id] = node
                  }}
                  type="button"
                  role="tab"
                  id={tabDomId(tab.id)}
                  aria-selected={isFocused}
                  aria-controls={pane ? paneDomId(pane) : undefined}
                  aria-keyshortcuts="Shift+Enter Alt+ArrowLeft Alt+ArrowRight"
                  title="Drag or press Alt + arrow keys to reorder"
                  tabIndex={tab.id === tabStop ? 0 : -1}
                  className="claim-v2__tab-label"
                  draggable
                  onDragStart={(event) => handleDragStart(event, tab.id)}
                  onDragEnd={endDrag}
                  onFocus={() => setRovingTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                  onClick={(event) => {
                    if (event.shiftKey) openBeside(tab.id)
                    else openTab(tab.id)
                  }}
                >
                  {isSplit && pane ? (
                    <span
                      className={`claim-v2__tab-pane claim-v2__tab-pane--${pane}`}
                      title={`Open in ${pane} pane`}
                    >
                      <span className="visually-hidden">{`Open in ${pane} pane: `}</span>
                    </span>
                  ) : null}
                  {tab.label}
                </button>
                {pane ? null : (
                  <button
                    type="button"
                    className="icon-btn claim-v2__tab-beside"
                    aria-label={`Open ${tab.label} beside`}
                    title="Open beside (Shift + click)"
                    tabIndex={tab.id === tabStop ? 0 : -1}
                    onClick={() => openBeside(tab.id)}
                  >
                    <img src={dockToRight} alt="" width={16} height={16} draggable={false} />
                  </button>
                )}
                {tab.notification ? (
                  <span className="claim-v2__tab-dot" aria-label="New activity" />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {!isSplit && showSplitHint ? (
        <div className="claim-v2__hint" role="note">
          <span className="claim-v2__hint-icon" aria-hidden="true" />
          <p className="claim-v2__hint-text">
            Compare two sections side by side.{' '}
            <kbd className="claim-v2__hint-key">Shift</kbd> + click a tab, drag it onto the page,
            or hover it and click the split icon.
          </p>
          <button type="button" className="claim-v2__hint-dismiss" onClick={onDismissSplitHint}>
            Got it
          </button>
        </div>
      ) : null}

      <div
        ref={panesRef}
        className={resizing ? 'claim-v2__panes resize-handle-active' : 'claim-v2__panes'}
      >
        <ClaimV2Pane
          side="left"
          tab={state.left}
          split={split}
          style={isSplit ? { flex: `${state.ratio} 1 0` } : undefined}
        />
        {state.right ? (
          <>
            <SplitDivider
              ratio={state.ratio}
              containerRef={panesRef}
              onRatioChange={setRatio}
              onResizingChange={setResizing}
            />
            <ClaimV2Pane
              side="right"
              tab={state.right}
              split={split}
              style={{ flex: `${1 - state.ratio} 1 0` }}
            />
          </>
        ) : null}

        {showDropZones ? (
          <div className="claim-v2__drop-zones">
            {(['left', 'right'] as const).map((side) => (
              <div
                key={side}
                className={
                  dropSide === side
                    ? 'claim-v2__drop-zone claim-v2__drop-zone--over'
                    : 'claim-v2__drop-zone'
                }
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  if (dropSide !== side) setDropSide(side)
                }}
                onDragLeave={() => setDropSide((value) => (value === side ? null : value))}
                onDrop={(event) => handleDrop(event, side)}
              >
                <span className="claim-v2__drop-label">
                  <img src={dockToRight} alt="" width={16} height={16} draggable={false} />
                  {`Open on ${side}`}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ClaimV2Pane({
  side,
  tab,
  split,
  style,
}: {
  side: PaneSide
  tab: V2TabId
  split: ClaimSplitView
  style?: CSSProperties
}) {
  const { state, isSplit, focusPane, swapPanes, closePane } = split
  const className = ['claim-v2__pane']
  if (isSplit && state.focused === side) className.push('claim-v2__pane--focused')
  const title = tabLabel(tab)
  const titleId = `${paneDomId(side)}-title`
  return (
    <section
      id={paneDomId(side)}
      className={className.join(' ')}
      style={style}
      role="tabpanel"
      aria-labelledby={isSplit ? titleId : tabDomId(tab)}
      onPointerDownCapture={() => focusPane(side)}
      onFocusCapture={() => focusPane(side)}
    >
      {isSplit ? (
        <header className="claim-v2__pane-header">
          <h2 id={titleId} className="claim-v2__pane-title">
            <span className="visually-hidden">{`${SIDE_LABEL[side]} pane: `}</span>
            {title}
          </h2>
          <div className="claim-v2__pane-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Swap panes"
              title="Swap panes"
              onClick={swapPanes}
            >
              <img src={splitSwap} alt="" width={16} height={16} draggable={false} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Close ${title} pane`}
              title="Close pane"
              onClick={() => closePane(side)}
            >
              <img src={appealClose} alt="" width={16} height={16} draggable={false} />
            </button>
          </div>
        </header>
      ) : null}
      <div className="claim-v2__pane-body">
        <TabContent activeTab={tab} />
      </div>
    </section>
  )
}

function SplitDivider({
  ratio,
  containerRef,
  onRatioChange,
  onResizingChange,
}: {
  ratio: number
  containerRef: RefObject<HTMLDivElement | null>
  onRatioChange: (ratio: number) => void
  onResizingChange: (resizing: boolean) => void
}) {
  const percent = Math.round(ratio * 100)

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const container = containerRef.current
    if (!container) return
    event.preventDefault()
    const handle = event.currentTarget
    const rect = container.getBoundingClientRect()
    handle.setPointerCapture(event.pointerId)
    onResizingChange(true)

    const onMove = (moveEvent: globalThis.PointerEvent) => {
      onRatioChange((moveEvent.clientX - rect.left) / rect.width)
    }
    const onUp = () => {
      onResizingChange(false)
      handle.removeEventListener('pointermove', onMove)
      handle.removeEventListener('pointerup', onUp)
      handle.removeEventListener('pointercancel', onUp)
    }
    handle.addEventListener('pointermove', onMove)
    handle.addEventListener('pointerup', onUp)
    handle.addEventListener('pointercancel', onUp)
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.1 : 0.02
    if (event.key === 'ArrowLeft') onRatioChange(ratio - step)
    else if (event.key === 'ArrowRight') onRatioChange(ratio + step)
    else if (event.key === 'Home') onRatioChange(SPLIT_MIN_RATIO)
    else if (event.key === 'End') onRatioChange(SPLIT_MAX_RATIO)
    else if (event.key === 'Enter') onRatioChange(SPLIT_DEFAULT_RATIO)
    else return
    event.preventDefault()
  }

  return (
    <div
      className="claim-v2__divider"
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panes"
      aria-controls={`${paneDomId('left')} ${paneDomId('right')}`}
      aria-valuemin={SPLIT_MIN_RATIO * 100}
      aria-valuemax={SPLIT_MAX_RATIO * 100}
      aria-valuenow={percent}
      aria-valuetext={`Left pane ${percent}%, right pane ${100 - percent}%`}
      title="Drag to resize, double-click to reset"
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => onRatioChange(SPLIT_DEFAULT_RATIO)}
    />
  )
}

function TabContent({ activeTab }: { activeTab: V2TabId }) {
  return (
    <div className="claim-v2__content">
      {activeTab === 'details' ? (
        <div className="claim-v2__details">
          <ClaimDetailsSplitContent />
        </div>
      ) : null}
      {activeTab === 'submissions' ? (
        <div className="submissions-widget-wrap">
          <SubmissionsWidget hideHeader />
        </div>
      ) : null}
      {activeTab === 'remittances' ? (
        <div className="remittances-widget-wrap">
          <RemittancesWidget hideHeader />
        </div>
      ) : null}
      {activeTab === 'attachments' ? (
        <div className="documentation-widget-wrap">
          <DocumentationWidget title="Attachments" hideHeader />
        </div>
      ) : null}
      {activeTab === 'payments' ? (
        <div className="payments-widget-wrap">
          <PaymentsWidget hideHeader />
        </div>
      ) : null}
      {activeTab === 'appeals' ? (
        <p className="claim-v2__empty">No appeals have been filed for this claim.</p>
      ) : null}
      {activeTab === 'similar' ? (
        <p className="claim-v2__empty">No similar claims found.</p>
      ) : null}
    </div>
  )
}

export const SUMMARY_MIN_WIDTH = 320
export const SUMMARY_MAX_WIDTH = 720
export const SUMMARY_DEFAULT_WIDTH = 320

export function ClaimV2Aside({
  width = SUMMARY_DEFAULT_WIDTH,
  onWidthChange,
}: {
  width?: number
  onWidthChange?: (width: number) => void
}) {
  const [resizing, setResizing] = useState(false)
  const className = ['claim-v2-aside']
  if (resizing) className.push('resize-handle-active')

  return (
    <aside
      className={className.join(' ')}
      style={{ width }}
      aria-label="Claim summary and review"
    >
      {onWidthChange ? (
        <ResizeHandle
          width={width}
          min={SUMMARY_MIN_WIDTH}
          max={SUMMARY_MAX_WIDTH}
          label="Resize summary column"
          onWidthChange={onWidthChange}
          onReset={() => onWidthChange(SUMMARY_DEFAULT_WIDTH)}
          onResizingChange={setResizing}
        />
      ) : null}
      <div className="claim-v2-aside__scroll claim-cards">
        <ClaimSummary defaultOpen />
        <div className="review-widget-wrap">
          <ReviewWidget />
        </div>
        <ActivityWidget defaultOpen={false} />
      </div>
    </aside>
  )
}
