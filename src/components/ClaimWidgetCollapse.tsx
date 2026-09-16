import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { widgetArrowDown } from '../assets/icons'

type ClaimWidgetsCollapseApi = {
  openById: Record<string, boolean>
  register: (id: string, defaultOpen: boolean, excludeFromCollapseAll?: boolean) => void
  unregister: (id: string) => void
  toggle: (id: string) => void
  collapseAll: () => void
  expandAll: () => void
  anyOpen: boolean
}

const ClaimWidgetsCollapseContext = createContext<ClaimWidgetsCollapseApi | null>(null)

export function ClaimWidgetsCollapseProvider({ children }: { children: ReactNode }) {
  const [openById, setOpenById] = useState<Record<string, boolean>>({})
  const [skipCollapseAll, setSkipCollapseAll] = useState<Record<string, true>>({})

  const register = useCallback((id: string, defaultOpen: boolean, excludeFromCollapseAll = false) => {
    setOpenById((prev) => {
      if (Object.prototype.hasOwnProperty.call(prev, id)) return prev
      return { ...prev, [id]: defaultOpen }
    })
    if (excludeFromCollapseAll) {
      setSkipCollapseAll((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
    }
  }, [])

  const unregister = useCallback((id: string) => {
    setOpenById((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, id)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
    setSkipCollapseAll((prev) => {
      if (!prev[id]) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const toggle = useCallback((id: string) => {
    setOpenById((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }))
  }, [])

  const collapseAll = useCallback(() => {
    setOpenById((prev) => {
      const next: Record<string, boolean> = {}
      for (const id of Object.keys(prev)) {
        next[id] = skipCollapseAll[id] ? prev[id] : false
      }
      return next
    })
  }, [skipCollapseAll])

  const expandAll = useCallback(() => {
    setOpenById((prev) => {
      const next: Record<string, boolean> = {}
      for (const id of Object.keys(prev)) next[id] = true
      return next
    })
  }, [])

  const anyOpen = Object.entries(openById).some(([id, open]) => open && !skipCollapseAll[id])

  const value = useMemo(
    () => ({
      openById,
      register,
      unregister,
      toggle,
      collapseAll,
      expandAll,
      anyOpen,
    }),
    [openById, register, unregister, toggle, collapseAll, expandAll, anyOpen],
  )

  return (
    <ClaimWidgetsCollapseContext.Provider value={value}>
      {children}
    </ClaimWidgetsCollapseContext.Provider>
  )
}

export function useClaimWidgetsCollapseActions() {
  const ctx = useContext(ClaimWidgetsCollapseContext)
  if (!ctx) {
    throw new Error('useClaimWidgetsCollapseActions requires ClaimWidgetsCollapseProvider')
  }
  return {
    collapseAll: ctx.collapseAll,
    expandAll: ctx.expandAll,
    anyOpen: ctx.anyOpen,
  }
}

export function useClaimWidgetsCollapsible() {
  return useContext(ClaimWidgetsCollapseContext) != null
}

export function useClaimWidgetOpen(defaultOpen = false, options?: { excludeFromCollapseAll?: boolean }) {
  const ctx = useContext(ClaimWidgetsCollapseContext)
  const id = useId()
  const contentId = useId()
  const excludeFromCollapseAll = options?.excludeFromCollapseAll ?? false

  const register = ctx?.register
  const unregister = ctx?.unregister
  const toggleInContext = ctx?.toggle
  const openById = ctx?.openById

  useEffect(() => {
    if (!register || !unregister) return
    register(id, defaultOpen, excludeFromCollapseAll)
    return () => unregister(id)
  }, [id, defaultOpen, excludeFromCollapseAll, register, unregister])

  if (!ctx || !toggleInContext) {
    return {
      open: true,
      contentId,
      toggle: () => {},
      collapsible: false as const,
    }
  }

  return {
    open: openById?.[id] ?? defaultOpen,
    contentId,
    toggle: () => toggleInContext(id),
    collapsible: true as const,
  }
}

export function ClaimWidgetToggle({
  open,
  onToggle,
  title,
  titleId,
  titleClassName,
  controlsId,
  leading,
}: {
  open: boolean
  onToggle: () => void
  title: string
  titleId: string
  titleClassName: string
  controlsId: string
  leading?: ReactNode
}) {
  return (
    <button
      type="button"
      className="claim-widget__toggle"
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={onToggle}
    >
      {leading}
      <h3 id={titleId} className={titleClassName}>
        {title}
      </h3>
      <img
        src={widgetArrowDown}
        alt=""
        width={20}
        height={20}
        className={
          open
            ? 'icon claim-widget__chevron claim-widget__chevron--open'
            : 'icon claim-widget__chevron'
        }
        draggable={false}
      />
    </button>
  )
}

export function ClaimWidgetTitle({
  collapsible,
  open,
  onToggle,
  title,
  titleId,
  titleClassName,
  controlsId,
  leading,
}: {
  collapsible: boolean
  open: boolean
  onToggle: () => void
  title: string
  titleId: string
  titleClassName: string
  controlsId: string
  leading?: ReactNode
}) {
  if (collapsible) {
    return (
      <ClaimWidgetToggle
        open={open}
        onToggle={onToggle}
        title={title}
        titleId={titleId}
        titleClassName={titleClassName}
        controlsId={controlsId}
        leading={leading}
      />
    )
  }

  return (
    <>
      {leading}
      <h3 id={titleId} className={titleClassName}>
        {title}
      </h3>
    </>
  )
}
