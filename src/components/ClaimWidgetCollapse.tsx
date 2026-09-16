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
import { paymentsArrowDropDown } from '../assets/icons'

type ClaimWidgetsCollapseApi = {
  openById: Record<string, boolean>
  register: (id: string, defaultOpen: boolean) => void
  unregister: (id: string) => void
  toggle: (id: string) => void
  collapseAll: () => void
  expandAll: () => void
  anyOpen: boolean
}

const ClaimWidgetsCollapseContext = createContext<ClaimWidgetsCollapseApi | null>(null)

export function ClaimWidgetsCollapseProvider({ children }: { children: ReactNode }) {
  const [openById, setOpenById] = useState<Record<string, boolean>>({})

  const register = useCallback((id: string, defaultOpen: boolean) => {
    setOpenById((prev) => {
      if (Object.prototype.hasOwnProperty.call(prev, id)) return prev
      return { ...prev, [id]: defaultOpen }
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setOpenById((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, id)) return prev
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
      for (const id of Object.keys(prev)) next[id] = false
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setOpenById((prev) => {
      const next: Record<string, boolean> = {}
      for (const id of Object.keys(prev)) next[id] = true
      return next
    })
  }, [])

  const anyOpen = Object.values(openById).some(Boolean)

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

export function useClaimWidgetOpen(defaultOpen = true) {
  const ctx = useContext(ClaimWidgetsCollapseContext)
  const id = useId()
  const contentId = useId()

  const register = ctx?.register
  const unregister = ctx?.unregister
  const toggleInContext = ctx?.toggle
  const openById = ctx?.openById

  useEffect(() => {
    if (!register || !unregister) return
    register(id, defaultOpen)
    return () => unregister(id)
  }, [id, defaultOpen, register, unregister])

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
      <img
        src={paymentsArrowDropDown}
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
      {leading}
      <h3 id={titleId} className={titleClassName}>
        {title}
      </h3>
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
