import { useCallback, useRef, useState } from 'react'
import { loadUserPreference, saveUserPreference } from '../services/userPreferences'
import type { V2TabId } from './ClaimV2Panel'
import {
  clampRatio,
  DEFAULT_TAB_ORDER,
  isTabId,
  SPLIT_DEFAULT_RATIO,
  type ClaimSplitState,
} from './claimSplitView'

export type ClaimType = 'denials' | 'initial-review' | 'ar-follow-up'
export type LayoutScope = ClaimType | 'all'

/** Claim status → layout claim type. Edit here to regroup statuses. */
export const STATUS_CLAIM_TYPE: Record<string, ClaimType> = {
  Denied: 'denials',
  'Full Denial': 'denials',
  'Full Denials': 'denials',
  'Partial Denial': 'denials',
  Rejected: 'denials',
  Pending: 'initial-review',
  'Initial review needed': 'initial-review',
  Draft: 'initial-review',
  Submitted: 'ar-follow-up',
  Paid: 'ar-follow-up',
  Underpaid: 'ar-follow-up',
}

const FALLBACK_CLAIM_TYPE: ClaimType = 'initial-review'

export function claimTypeForStatus(status: string): ClaimType {
  return Object.hasOwn(STATUS_CLAIM_TYPE, status) ? STATUS_CLAIM_TYPE[status] : FALLBACK_CLAIM_TYPE
}

export const SCOPE_LABEL: Record<LayoutScope, string> = {
  denials: 'Denials',
  'initial-review': 'Initial review',
  'ar-follow-up': 'AR follow-up',
  all: 'All claims',
}

const SCOPE_TOAST_SUBJECT: Record<LayoutScope, string> = {
  denials: 'Denied claims',
  'initial-review': 'Initial review claims',
  'ar-follow-up': 'AR follow-up claims',
  all: 'All claims',
}

export type ClaimLayout = {
  split: ClaimSplitState
  tabOrder: V2TabId[]
  propertiesOpen: boolean
  /** Summary rail. It stays open by default, including while the view is split. */
  summaryOpen: boolean
}

function singlePane(tab: V2TabId): ClaimSplitState {
  return { left: tab, right: null, focused: 'left', ratio: SPLIT_DEFAULT_RATIO }
}

const BASE_LAYOUT = {
  tabOrder: [...DEFAULT_TAB_ORDER],
  propertiesOpen: true,
  summaryOpen: true,
}

export const DEFAULT_LAYOUTS: Record<ClaimType, ClaimLayout> = {
  denials: {
    ...BASE_LAYOUT,
    split: { left: 'details', right: 'submissions', focused: 'left', ratio: SPLIT_DEFAULT_RATIO },
  },
  'initial-review': { ...BASE_LAYOUT, split: singlePane('details') },
  'ar-follow-up': { ...BASE_LAYOUT, split: singlePane('payments') },
}

export type LayoutPreferences = {
  layouts: Partial<Record<ClaimType, ClaimLayout>>
  /** Shared layout used for every claim type while `useForAll` is on. */
  allClaims: ClaimLayout | null
  useForAll: boolean
  /** Scopes that already showed the first-save toast. */
  toastShown: LayoutScope[]
  /** The side-by-side hint under the tabs has been dismissed. */
  splitHintDismissed: boolean
}

export const EMPTY_PREFERENCES: LayoutPreferences = {
  layouts: {},
  allClaims: null,
  useForAll: false,
  toastShown: [],
  splitHintDismissed: false,
}

const PREFERENCE_KEY = 'claim-layouts'
const CLAIM_TYPES = Object.keys(DEFAULT_LAYOUTS) as ClaimType[]
const SCOPES: LayoutScope[] = [...CLAIM_TYPES, 'all']

export function layoutsEqual(a: ClaimLayout, b: ClaimLayout) {
  return (
    a.split.left === b.split.left &&
    a.split.right === b.split.right &&
    a.split.focused === b.split.focused &&
    a.split.ratio === b.split.ratio &&
    a.propertiesOpen === b.propertiesOpen &&
    a.summaryOpen === b.summaryOpen &&
    a.tabOrder.length === b.tabOrder.length &&
    a.tabOrder.every((tab, index) => tab === b.tabOrder[index])
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function normalizeTabOrder(value: unknown): V2TabId[] {
  const saved = Array.isArray(value) ? value.filter(isTabId) : []
  const unique = [...new Set(saved)]
  return [...unique, ...DEFAULT_TAB_ORDER.filter((tab) => !unique.includes(tab))]
}

function normalizeLayout(value: unknown, fallback: ClaimLayout): ClaimLayout | null {
  if (!isRecord(value) || !isRecord(value.split) || !isTabId(value.split.left)) return null
  const { split } = value
  const left = split.left as V2TabId
  const right = isTabId(split.right) && split.right !== left ? split.right : null
  const ratio =
    typeof split.ratio === 'number' && Number.isFinite(split.ratio)
      ? clampRatio(split.ratio)
      : SPLIT_DEFAULT_RATIO
  return {
    split: { left, right, focused: right && split.focused === 'right' ? 'right' : 'left', ratio },
    tabOrder: normalizeTabOrder(value.tabOrder),
    propertiesOpen:
      typeof value.propertiesOpen === 'boolean' ? value.propertiesOpen : fallback.propertiesOpen,
    summaryOpen: typeof value.summaryOpen === 'boolean' ? value.summaryOpen : fallback.summaryOpen,
  }
}

function normalizePreferences(value: unknown): LayoutPreferences {
  if (!isRecord(value)) return EMPTY_PREFERENCES
  const layouts: LayoutPreferences['layouts'] = {}
  if (isRecord(value.layouts)) {
    for (const type of CLAIM_TYPES) {
      const layout = normalizeLayout(value.layouts[type], DEFAULT_LAYOUTS[type])
      if (layout) layouts[type] = layout
    }
  }
  const allClaims = normalizeLayout(value.allClaims, DEFAULT_LAYOUTS[FALLBACK_CLAIM_TYPE])
  return {
    layouts,
    allClaims,
    useForAll: value.useForAll === true && allClaims != null,
    toastShown: Array.isArray(value.toastShown)
      ? SCOPES.filter((scope) => (value.toastShown as unknown[]).includes(scope))
      : [],
    splitHintDismissed: value.splitHintDismissed === true,
  }
}

/** Removes the split view's earlier browser-only saves so they can't resurface. */
function clearLegacyLocalLayouts() {
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index)
      if (key?.startsWith('claim-split-view:')) window.localStorage.removeItem(key)
    }
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
  }
}

export async function loadLayoutPreferences(): Promise<LayoutPreferences> {
  clearLegacyLocalLayouts()
  return normalizePreferences(await loadUserPreference(PREFERENCE_KEY))
}

function resolveLayout(prefs: LayoutPreferences, type: ClaimType): ClaimLayout {
  if (prefs.useForAll && prefs.allClaims) return prefs.allClaims
  return prefs.layouts[type] ?? DEFAULT_LAYOUTS[type]
}

/**
 * Active layout for the open claim. The claim type is fixed when a claim opens,
 * so a mid-claim status change never swaps the layout under the user.
 */
export function useClaimLayouts(initialPrefs: LayoutPreferences, initialType: ClaimType) {
  const [prefs, setPrefs] = useState(initialPrefs)
  const [claimType, setClaimType] = useState(initialType)
  const [layout, setLayout] = useState(() => resolveLayout(initialPrefs, initialType))
  const [toast, setToast] = useState<string | null>(null)
  const prefsRef = useRef(prefs)
  const layoutRef = useRef(layout)
  const claimTypeRef = useRef(claimType)
  const dismissToast = useCallback(() => setToast(null), [])

  function persist(next: LayoutPreferences) {
    prefsRef.current = next
    setPrefs(next)
    saveUserPreference(PREFERENCE_KEY, next)
  }

  function show(next: ClaimLayout) {
    layoutRef.current = next
    setLayout(next)
  }

  /** Applies a user change and saves it for the active scope. */
  function updateLayout(change: (current: ClaimLayout) => ClaimLayout) {
    const current = layoutRef.current
    const next = change(current)
    if (layoutsEqual(next, current)) return
    show(next)
    const saved = prefsRef.current
    const type = claimTypeRef.current
    const scope: LayoutScope = saved.useForAll ? 'all' : type
    const firstSave = !saved.toastShown.includes(scope)
    persist({
      ...saved,
      ...(saved.useForAll
        ? { allClaims: next }
        : { layouts: { ...saved.layouts, [type]: next } }),
      toastShown: firstSave ? [...saved.toastShown, scope] : saved.toastShown,
    })
    if (firstSave) {
      setToast(`Saved. ${SCOPE_TOAST_SUBJECT[scope]} will open this way. Reset anytime.`)
    }
  }

  /** Loads the layout for a newly opened claim. Returns true when the layout changed. */
  function openClaim(type: ClaimType) {
    claimTypeRef.current = type
    setClaimType(type)
    const next = resolveLayout(prefsRef.current, type)
    const changed = !layoutsEqual(next, layoutRef.current)
    show(next)
    return changed
  }

  function resetCurrent() {
    const type = claimTypeRef.current
    const saved = prefsRef.current
    const next = DEFAULT_LAYOUTS[type]
    show(next)
    if (saved.useForAll) {
      persist({ ...saved, allClaims: next })
    } else {
      const layouts = { ...saved.layouts }
      delete layouts[type]
      persist({ ...saved, layouts })
    }
  }

  function setUseForAll(on: boolean) {
    const saved = prefsRef.current
    if (on === saved.useForAll) return
    if (on) {
      persist({ ...saved, useForAll: true, allClaims: layoutRef.current })
    } else {
      const next = { ...saved, useForAll: false }
      persist(next)
      show(resolveLayout(next, claimTypeRef.current))
    }
  }

  function dismissSplitHint() {
    const saved = prefsRef.current
    if (saved.splitHintDismissed) return
    persist({ ...saved, splitHintDismissed: true })
  }

  function resetAll() {
    persist({
      ...EMPTY_PREFERENCES,
      toastShown: prefsRef.current.toastShown,
      splitHintDismissed: prefsRef.current.splitHintDismissed,
    })
    show(DEFAULT_LAYOUTS[claimTypeRef.current])
  }

  const scope: LayoutScope = prefs.useForAll ? 'all' : claimType
  const hasSavedLayouts =
    prefs.useForAll || prefs.allClaims != null || Object.keys(prefs.layouts).length > 0

  return {
    layout,
    claimType,
    scope,
    scopeLabel: SCOPE_LABEL[scope],
    useForAll: prefs.useForAll,
    isCustomized: !layoutsEqual(layout, DEFAULT_LAYOUTS[claimType]),
    hasSavedLayouts,
    toast,
    dismissToast,
    updateLayout,
    openClaim,
    resetCurrent,
    setUseForAll,
    resetAll,
    splitHintDismissed: prefs.splitHintDismissed,
    dismissSplitHint,
  }
}

export type ClaimLayouts = ReturnType<typeof useClaimLayouts>
