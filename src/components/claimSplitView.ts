import type { V2TabId } from './ClaimV2Panel'

export type PaneSide = 'left' | 'right'

export type ClaimSplitState = {
  left: V2TabId
  /** `null` while a single pane is shown. */
  right: V2TabId | null
  focused: PaneSide
  /** Left pane share of the split, 0.25–0.75. */
  ratio: number
}

export const SPLIT_MIN_RATIO = 0.25
export const SPLIT_MAX_RATIO = 0.75
export const SPLIT_DEFAULT_RATIO = 0.5

export const DEFAULT_TAB_ORDER: readonly V2TabId[] = [
  'details',
  'submissions',
  'remittances',
  'attachments',
  'payments',
  'appeals',
  'similar',
]

export function clampRatio(value: number) {
  return Math.min(SPLIT_MAX_RATIO, Math.max(SPLIT_MIN_RATIO, value))
}

export function isTabId(value: unknown): value is V2TabId {
  return typeof value === 'string' && (DEFAULT_TAB_ORDER as readonly string[]).includes(value)
}

export function otherSide(side: PaneSide): PaneSide {
  return side === 'left' ? 'right' : 'left'
}

export function paneOf(state: ClaimSplitState, tab: V2TabId): PaneSide | null {
  if (state.left === tab) return 'left'
  if (state.right === tab) return 'right'
  return null
}

/** Pane actions over a split state owned by the saved claim layout. */
export function useClaimSplitView(
  state: ClaimSplitState,
  onChange: (next: ClaimSplitState) => void,
) {
  const isSplit = state.right != null

  function apply(next: ClaimSplitState) {
    if (
      next.left !== state.left ||
      next.right !== state.right ||
      next.focused !== state.focused ||
      next.ratio !== state.ratio
    ) {
      onChange(next)
    }
  }

  /** Shows a tab in the focused pane, or focuses the pane that already has it. */
  function openTab(tab: V2TabId) {
    const current = paneOf(state, tab)
    if (current) apply({ ...state, focused: current })
    else apply({ ...state, [state.focused]: tab })
  }

  /** Opens a tab in the other pane (or `side`), swapping instead of duplicating. */
  function openBeside(tab: V2TabId, side?: PaneSide) {
    if (state.right == null) {
      if (state.left === tab) return
      const target = side ?? 'right'
      apply(
        target === 'right'
          ? { ...state, right: tab, focused: 'right' }
          : { ...state, left: tab, right: state.left, focused: 'left' },
      )
      return
    }
    const target = side ?? otherSide(state.focused)
    const current = paneOf(state, tab)
    if (current === target) apply({ ...state, focused: target })
    else if (current) apply({ ...state, left: state.right, right: state.left, focused: target })
    else apply({ ...state, [target]: tab, focused: target })
  }

  function focusPane(side: PaneSide) {
    if (side === 'right' && state.right == null) return
    apply({ ...state, focused: side })
  }

  function swapPanes() {
    if (state.right == null) return
    apply({ ...state, left: state.right, right: state.left, focused: otherSide(state.focused) })
  }

  function closePane(side: PaneSide) {
    if (state.right == null) return
    apply({ ...state, left: side === 'left' ? state.right : state.left, right: null, focused: 'left' })
  }

  function setRatio(ratio: number) {
    apply({ ...state, ratio: clampRatio(ratio) })
  }

  return { state, isSplit, openTab, openBeside, focusPane, swapPanes, closePane, setRatio }
}

export type ClaimSplitView = ReturnType<typeof useClaimSplitView>
