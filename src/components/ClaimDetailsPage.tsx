import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  aiGroup1,
  aiGroup2,
  avatar,
  circle,
  copy,
  dockToRight,
  home,
  keyboardArrowDown,
  keyboardArrowDown1,
  keyboardArrowDown2,
  keyboardArrowDown3,
  keyboardArrowUp,
  leftPanelClose,
  link,
  logo,
  moreHoriz,
  paymentsSchedule,
  propsCalendar,
  propsBlock,
  propsCancelSend,
  propsHealth,
  propsPerson,
  propsPersonAdd,
  propsSell,
  propsStageProgress,
  propsSyncDisabled,
  propsTagAdd,
  propsUpdate,
  receiptLong,
  removeSelection,
  search,
  send,
  settings,
  speaking,
  submissionsPaid,
  summaryPanel,
  supervisorAccount,
} from '../assets/icons'
import { ActivityWidget } from './ActivityWidget'
import { ClaimDetailsWidget } from './ClaimDetailsWidget'
import { PatientHoverCard } from './ClaimDetailsSplitContent'
import { ClaimSummary } from './ClaimSummary'
import {
  ClaimV2Aside,
  ClaimV2Panel,
  SUMMARY_DEFAULT_WIDTH,
} from './ClaimV2Panel'
import {
  claimTypeForStatus,
  loadLayoutPreferences,
  useClaimLayouts,
  type ClaimLayouts,
  type LayoutPreferences,
} from './claimLayouts'
import { useClaimSplitView } from './claimSplitView'
import { LayoutMenu } from './LayoutMenu'
import { Toast } from './Toast'
import { CLAIM_QUEUE } from '../data/claims'
import { ClaimWidgetsCollapseProvider } from './ClaimWidgetCollapse'
import { DocumentationWidget } from './DocumentationWidget'
import { PaymentsWidget } from './PaymentsWidget'
import { RemittancesWidget } from './RemittancesWidget'
import { ReviewWidget } from './ReviewWidget'
import { SubmissionsWidget } from './SubmissionsWidget'
import { useWidgetView, WidgetViewPanel, WidgetViewProvider } from './widgetView'

function Icon({
  src,
  size = 16,
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

function HelpIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.25" stroke="#454545" strokeWidth="1.25" />
      <path
        d="M6.4 6.2c0-1 .8-1.7 1.7-1.7s1.7.7 1.7 1.6c0 .7-.4 1.1-1 1.5-.6.4-.9.7-.9 1.4"
        stroke="#454545"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.4" r="0.7" fill="#454545" />
    </svg>
  )
}

function SidebarItem({
  label,
  icon,
  active = false,
  collapsed = false,
}: {
  label: string
  icon: string
  active?: boolean
  collapsed?: boolean
}) {
  return (
    <button
      type="button"
      className={active ? 'sidebar-item sidebar-item--active' : 'sidebar-item'}
      title={label}
      aria-label={label}
    >
      <Icon src={icon} size={16} />
      {!collapsed ? <span>{label}</span> : null}
    </button>
  )
}

function SidebarGroup({
  label,
  open,
  collapsed = false,
  children,
}: {
  label: string
  open: boolean
  collapsed?: boolean
  children?: ReactNode
}) {
  if (collapsed) {
    return <div className="sidebar-group sidebar-group--collapsed">{children}</div>
  }

  return (
    <div className="sidebar-group">
      <button type="button" className="sidebar-group__heading">
        <Icon src={circle} size={16} />
        <span>{label}</span>
        <Icon
          src={open ? keyboardArrowDown1 : keyboardArrowDown}
          size={20}
          className={open ? 'sidebar-group__chevron sidebar-group__chevron--open' : 'sidebar-group__chevron'}
        />
      </button>
      {open && children ? (
        <div className="sidebar-group__content">
          <div className="sidebar-group__rail" aria-hidden />
          <div className="sidebar-group__items">{children}</div>
        </div>
      ) : null}
    </div>
  )
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}
      aria-label="Primary navigation"
    >
      <div className="sidebar__logo">
        <img src={logo} alt="Air" className="sidebar__logo-img" width={53} height={32} />
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        <div className="sidebar__section">
          <SidebarItem label="Home" icon={home} collapsed={collapsed} />
          <SidebarItem label="Visits" icon={home} collapsed={collapsed} />
          <SidebarItem label="Tasks" icon={home} collapsed={collapsed} />
        </div>

        <SidebarGroup label="Medical Records" open={false} collapsed={collapsed} />

        <SidebarGroup label="Revenue Cycle" open collapsed={collapsed}>
          <SidebarItem label="Encounters" icon={home} collapsed={collapsed} />
          <SidebarItem label="Claims" icon={receiptLong} active collapsed={collapsed} />
          <SidebarItem label="Denials" icon={removeSelection} collapsed={collapsed} />
          <SidebarItem label="Remittances" icon={home} collapsed={collapsed} />
        </SidebarGroup>

        <SidebarGroup label="Reporting" open collapsed={collapsed}>
          <SidebarItem label="Practice Pulse" icon={home} collapsed={collapsed} />
          <SidebarItem label="EMR Reports" icon={home} collapsed={collapsed} />
          <SidebarItem label="AI Report Builder" icon={home} collapsed={collapsed} />
        </SidebarGroup>
      </nav>

      {!collapsed ? (
        <div className="site-card">
          <div className="site-card__row">
            <Icon src={supervisorAccount} size={16} />
            <span className="site-card__name">Athelas Air Medical</span>
          </div>
          <div className="site-card__meta">
            <span>ID:001</span>
            <span aria-hidden>•</span>
            <span>GLD: Jun 2026</span>
          </div>
          <button type="button" className="site-card__link">
            Stop Impersonating
          </button>
        </div>
      ) : null}

      <div className="sidebar__footer">
        <div className="avatar" aria-hidden>
          <img src={avatar} alt="" width={28} height={28} />
        </div>
        {!collapsed ? (
          <>
            <button type="button" className="icon-btn" aria-label="Settings">
              <Icon src={settings} size={16} />
            </button>
            <button type="button" className="icon-btn" aria-label="Help">
              <HelpIcon size={16} />
            </button>
          </>
        ) : null}
      </div>
    </aside>
  )
}

export function GlobalHeader({
  sidebarCollapsed,
  onToggleSidebar,
}: {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}) {
  return (
    <header className="global-header">
      <div className="global-header__left">
        <button
          type="button"
          className="icon-btn"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          onClick={onToggleSidebar}
        >
          <Icon src={dockToRight} size={16} />
        </button>
        <span className="global-header__crumb">Claims</span>
      </div>

      <div className="global-header__center">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Icon src={settings} size={16} />
        </button>
        <button type="button" className="search-trigger">
          <span className="search-trigger__label">
            <Icon src={search} size={18} />
            <span>Global Search</span>
          </span>
          <kbd>ctrl+K</kbd>
        </button>
      </div>

      <div className="global-header__right">
        <button type="button" className="icon-btn icon-btn--wide" aria-label="Profile">
          <Icon src={speaking} size={18} />
        </button>
        <button type="button" className="ai-tab">
          <svg
            className="icon"
            width={18}
            height={18}
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden
          >
            <rect x="7" y="2.5" width="4" height="8" rx="2" fill="#1132EE" />
            <path
              d="M4.5 8.5a4.5 4.5 0 0 0 9 0"
              stroke="#1132EE"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M9 13v2.5"
              stroke="#1132EE"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span>Scribe</span>
        </button>
        <button type="button" className="ai-tab">
          <span className="ai-mark" aria-hidden>
            <img src={aiGroup1} alt="" width={11} height={20} className="ai-mark__a" />
            <img src={aiGroup2} alt="" width={20} height={11} className="ai-mark__b" />
          </span>
          <span>Athelas AI</span>
        </button>
      </div>
    </header>
  )
}

type ClaimVersion = 'option1' | 'option2'

/** Option 1 is hidden for now; flip to bring the version toggle back. */
const SHOW_VERSION_TOGGLE = false

function VersionToggle({
  value,
  onChange,
}: {
  value: ClaimVersion
  onChange: (value: ClaimVersion) => void
}) {
  return (
    <div className="version-toggle" role="group" aria-label="Claim version">
      {(
        [
          ['option1', 'Option 1'],
          ['option2', 'Option 2'],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          className={
            value === id
              ? 'version-toggle__item version-toggle__item--active'
              : 'version-toggle__item'
          }
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function ClaimPageHeader({
  version,
  onVersionChange,
  fullViewTitle,
  onExitFullView,
  summaryOpen,
  onToggleSummary,
  claimId,
  claimPosition,
  claimCount,
  onNextClaim,
  onPreviousClaim,
  layoutMenu,
}: {
  version: ClaimVersion
  onVersionChange: (value: ClaimVersion) => void
  fullViewTitle?: string | null
  onExitFullView?: () => void
  summaryOpen?: boolean
  onToggleSummary?: () => void
  claimId: string
  claimPosition: number
  claimCount: number
  onNextClaim: () => void
  onPreviousClaim: () => void
  layoutMenu?: ReactNode
}) {
  return (
    <div className="claim-header">
      <div className="claim-header__left">
        {fullViewTitle ? (
          <nav className="claim-header__breadcrumb" aria-label="Claim breadcrumb">
            <button
              type="button"
              className="claim-header__crumb-link"
              onClick={onExitFullView}
            >
              {claimId}
            </button>
            <span className="claim-header__crumb-sep" aria-hidden>
              /
            </span>
            <span className="claim-header__crumb-current">{fullViewTitle}</span>
          </nav>
        ) : (
          <h1 className="claim-header__title">{claimId}</h1>
        )}
        <button type="button" className="icon-btn" aria-label="Copy link">
          <Icon src={link} size={20} />
        </button>
        <button type="button" className="icon-btn" aria-label="Copy ID">
          <Icon src={copy} size={20} />
        </button>
        <button type="button" className="icon-btn" aria-label="More actions">
          <Icon src={moreHoriz} size={20} />
        </button>
      </div>

      {SHOW_VERSION_TOGGLE ? <VersionToggle value={version} onChange={onVersionChange} /> : null}

      <div className="claim-header__right">
        {layoutMenu}
        <div className="page-controls">
          <button
            type="button"
            className="icon-btn"
            aria-label="Next claim"
            aria-keyshortcuts="J"
            title="Next claim (J)"
            disabled={claimPosition >= claimCount}
            onClick={onNextClaim}
          >
            <Icon src={keyboardArrowDown2} size={18} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label="Previous claim"
            aria-keyshortcuts="K"
            title="Previous claim (K)"
            disabled={claimPosition <= 1}
            onClick={onPreviousClaim}
          >
            <Icon src={keyboardArrowUp} size={18} />
          </button>
          <div
            className="page-index"
            role="status"
            aria-label={`Claim ${claimPosition} of ${claimCount}`}
          >
            <span className="page-index__current">{claimPosition}</span>
            <span className="page-index__sep">/</span>
            <span className="page-index__total">{claimCount}</span>
          </div>
        </div>

        <div className="claim-header__divider" aria-hidden />

        {onToggleSummary ? (
          <button
            type="button"
            className={
              summaryOpen
                ? 'icon-btn icon-btn--outlined claim-header__summary claim-header__summary--open'
                : 'icon-btn icon-btn--outlined claim-header__summary'
            }
            aria-pressed={summaryOpen}
            aria-label={summaryOpen ? 'Close summary' : 'Open summary'}
            title={summaryOpen ? 'Close summary' : 'Open summary'}
            onClick={onToggleSummary}
          >
            <Icon src={summaryPanel} size={18} />
          </button>
        ) : null}

        <button type="button" className="btn btn--secondary">
          Actions
          <Icon src={keyboardArrowDown3} size={14} />
        </button>
        <button type="button" className="btn btn--primary">
          <Icon src={send} size={14} />
          Submit
        </button>
      </div>
    </div>
  )
}

function ClaimOption1Panel() {
  return (
    <div className="claim-context">
      <div className="claim-context__canvas claim-cards" aria-label="Claim content">
        <ClaimSummary title="Summary" />
        <div className="claim-widgets-stack">
          <section className="review-widget-wrap">
            <ReviewWidget />
          </section>
          <section className="claim-details-widget-wrap">
            <ClaimDetailsWidget defaultOpen />
          </section>
          <section className="submissions-widget-wrap">
            <SubmissionsWidget />
          </section>
          <section className="documentation-widget-wrap">
            <DocumentationWidget />
          </section>
          <section className="remittances-widget-wrap">
            <RemittancesWidget />
          </section>
          <section className="payments-widget-wrap">
            <PaymentsWidget />
          </section>
          <section className="activity-widget-wrap">
            <ActivityWidget defaultOpen={false} />
          </section>
        </div>
      </div>
    </div>
  )
}

const HOVER_CLOSE_DELAY_MS = 120

/** Patient link whose hover card escapes the scrolling properties panel via a portal. */
function PatientHoverLink({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const linkRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  function open() {
    window.clearTimeout(closeTimer.current)
    const rect = linkRef.current?.getBoundingClientRect()
    if (rect) setPosition({ top: rect.bottom + 8, left: rect.left })
  }

  function scheduleClose() {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setPosition(null), HOVER_CLOSE_DELAY_MS)
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    const next = event.relatedTarget as Node | null
    if (next && (linkRef.current?.contains(next) || cardRef.current?.contains(next))) return
    scheduleClose()
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const isOpen = position != null
  useEffect(() => {
    if (!isOpen) return
    const close = () => setPosition(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={linkRef}
        type="button"
        className="properties-field__value properties-field__link"
        aria-haspopup="dialog"
        aria-expanded={position != null}
        onMouseEnter={open}
        onMouseLeave={scheduleClose}
        onFocus={open}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setPosition(null)
        }}
      >
        {children}
      </button>
      {position
        ? createPortal(
            <div
              ref={cardRef}
              className="suggestion-hover properties-patient-hover"
              role="dialog"
              aria-label="Patient details"
              style={{ top: position.top, left: position.left }}
              onMouseEnter={open}
              onMouseLeave={scheduleClose}
              onBlur={handleBlur}
            >
              <PatientHoverCard />
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

/** Synthetic demo property values from Figma — not real PHI/PII. */
export function PropertiesBody({
  status,
  className = 'properties-panel__body',
}: {
  status: string
  className?: string
}) {
  return (
    <div className={className}>
      <div className="properties-field">
        <span className="properties-field__label">Status</span>
        <div className="properties-tags">
          {claimTypeForStatus(status) === 'denials' ? (
            <span className="properties-badge properties-badge--icon properties-badge--strong">
              <img src={propsBlock} alt="" width={16} height={16} />
              {status}
            </span>
          ) : (
            <span className="properties-badge properties-badge--strong">{status}</span>
          )}
          <span className="properties-badge properties-badge--strong">3d</span>
        </div>
      </div>
      <div className="properties-field">
        <span className="properties-field__label">Stage</span>
        <span className="properties-badge properties-badge--icon properties-badge--stage">
          <img src={propsStageProgress} alt="" width={16} height={16} />
          Payer 1
        </span>
      </div>
      <div className="properties-field properties-field--compact">
        <span className="properties-field__label">Patient</span>
        <PatientHoverLink>Cole Crawford, 14</PatientHoverLink>
      </div>
      <div className="properties-field properties-field--compact">
        <span className="properties-field__label">Provider</span>
        <span className="properties-field__value">Nicholas Grimoskas</span>
      </div>
      <div className="properties-field properties-field--compact">
        <span className="properties-field__label">Date of Service</span>
        <span className="properties-field__value">Sep 25, 2026</span>
      </div>
      <div className="properties-field">
        <span className="properties-field__label">Assignee</span>
        <button
          type="button"
          className="properties-avatar properties-avatar--assignee"
          aria-label="Assignee: TB"
          title="TB"
        >
          TB
        </button>
      </div>
      <div className="properties-field">
        <span className="properties-field__label">Tags</span>
        <button type="button" className="icon-btn icon-btn--outlined" aria-label="Add tag" title="Add tag">
          <img src={propsTagAdd} alt="" width={18} height={18} />
        </button>
      </div>
      <div className="properties-field">
        <span className="properties-field__label">Insurance</span>
        <span className="properties-badge properties-badge--icon properties-badge--truncate">
          <img src={submissionsPaid} alt="" width={16} height={16} />
          <span className="properties-badge__text">UNITED MEDICAL RESOURCES</span>
        </span>
      </div>
      <div className="properties-field">
        <span className="properties-field__label">Submitted Insurance</span>
        <span className="properties-badge properties-badge--truncate">
          <span className="properties-badge__text">UNITED MEDICAL RESOURCES</span>
        </span>
      </div>

      <div className="properties-divider" aria-hidden />

      <div className="properties-field">
        <span className="properties-field__label">EHR Import Status</span>
        <span className="properties-badge properties-badge--icon">
          <img src={propsSyncDisabled} alt="" width={16} height={16} />
          Disabled
        </span>
      </div>
      <div className="properties-field properties-field--compact">
        <span className="properties-field__label">Last Updated</span>
        <span className="properties-field__value">Today at 11:28 AM</span>
      </div>
      <div className="properties-field properties-field--compact">
        <span className="properties-field__label">EHR Claim ID</span>
        <span className="properties-field__value">-</span>
      </div>
    </div>
  )
}

function PropertiesPanel({
  collapsed,
  onToggle,
  status,
}: {
  collapsed: boolean
  onToggle: () => void
  status: string
}) {
  if (collapsed) {
    return (
      <aside className="properties-panel properties-panel--collapsed" aria-label="Properties">
        <div className="properties-panel__rail">
          <button
            type="button"
            className="icon-btn"
            aria-label="Expand properties"
            title="Expand"
            onClick={onToggle}
          >
            <Icon src={leftPanelClose} size={24} className="icon--flip-x" />
          </button>
          <button type="button" className="icon-btn" aria-label="Cancel send" title="Cancel send">
            <Icon src={propsCancelSend} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Status" title="Status">
            <Icon src={paymentsSchedule} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Person" title="Person">
            <Icon src={propsPerson} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Clinical" title="Clinical">
            <Icon src={propsHealth} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Calendar" title="Calendar">
            <Icon src={propsCalendar} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Safety" title="Safety">
            <Icon src={propsHealth} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Add person" title="Add person">
            <Icon src={propsPersonAdd} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Updates" title="Updates">
            <Icon src={propsUpdate} size={24} />
          </button>
          <button type="button" className="icon-btn" aria-label="Billing" title="Billing">
            <Icon src={propsSell} size={24} />
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className="properties-panel" aria-label="Properties">
      <div className="panel-header panel-header--properties">
        <h2 className="panel-header__title">Properties</h2>
        <button
          type="button"
          className="icon-btn"
          aria-label="Collapse properties"
          title="Collapse"
          onClick={onToggle}
        >
          <Icon src={leftPanelClose} size={18} />
        </button>
      </div>
      <PropertiesBody status={status} />
    </aside>
  )
}

export function ClaimDetailsPage() {
  const [initialPrefs, setInitialPrefs] = useState<LayoutPreferences | null>(null)

  useEffect(() => {
    let active = true
    loadLayoutPreferences().then((prefs) => {
      if (active) setInitialPrefs(prefs)
    })
    return () => {
      active = false
    }
  }, [])

  // The saved layout must be known before the claim renders so it never shifts mid-claim.
  if (!initialPrefs) return <div className="app-shell" aria-busy="true" />
  return <ClaimDetailsPageLoaded initialPrefs={initialPrefs} />
}

function ClaimDetailsPageLoaded({ initialPrefs }: { initialPrefs: LayoutPreferences }) {
  const [version, setVersion] = useState<ClaimVersion>('option2')
  const [claimIndex, setClaimIndex] = useState(0)
  /** Record details collapse Properties for room; that isn't a saved layout choice. */
  const [propertiesForced, setPropertiesForced] = useState(false)
  const layouts = useClaimLayouts(initialPrefs, claimTypeForStatus(CLAIM_QUEUE[0].status))
  const propertiesCollapsed = propertiesForced || !layouts.layout.propertiesOpen

  return (
    <WidgetViewProvider
      allowDualSplit={version === 'option1'}
      onRecordOpen={version === 'option2' ? () => setPropertiesForced(true) : undefined}
    >
      <ClaimDetailsPageInner
        version={version}
        onVersionChange={setVersion}
        propertiesCollapsed={propertiesCollapsed}
        onToggleProperties={() => {
          setPropertiesForced(false)
          layouts.updateLayout((current) => ({ ...current, propertiesOpen: propertiesCollapsed }))
        }}
        layouts={layouts}
        claimIndex={claimIndex}
        onClaimOpened={(index) => {
          setClaimIndex(index)
          setPropertiesForced(false)
        }}
      />
      {layouts.toast ? <Toast message={layouts.toast} onDismiss={layouts.dismissToast} /> : null}
    </WidgetViewProvider>
  )
}

const LAYOUT_HIGHLIGHT_MS = 1600

function ClaimDetailsPageInner({
  version,
  onVersionChange,
  propertiesCollapsed,
  onToggleProperties,
  layouts,
  claimIndex,
  onClaimOpened,
}: {
  version: ClaimVersion
  onVersionChange: (value: ClaimVersion) => void
  propertiesCollapsed: boolean
  onToggleProperties: () => void
  layouts: ClaimLayouts
  claimIndex: number
  onClaimOpened: (index: number) => void
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { layout } = layouts
  const claim = CLAIM_QUEUE[claimIndex]
  const [summaryWidth, setSummaryWidth] = useState(SUMMARY_DEFAULT_WIDTH)
  const [layoutHighlight, setLayoutHighlight] = useState(false)
  const highlightTimer = useRef<number | undefined>(undefined)
  const split = useClaimSplitView(layout.split, (next) => {
    layouts.updateLayout((current) => ({ ...current, split: next }))
  })
  const [recordExpanded, setRecordExpanded] = useState(false)
  const [recordWidth, setRecordWidth] = useState<number | null>(null)
  const { view, close, openSide, openSplit, openFull, navigateRecord, closeSplitPane } =
    useWidgetView()

  const isFull = view?.mode === 'full'
  const isSplit = view?.mode === 'split'
  const isSide = view?.mode === 'side'
  const isDualSplit = isSplit && view?.secondary != null

  function renderSideOverlay() {
    if (!isSide || !view) return null
    return (
      <>
        <button
          type="button"
          className="widget-view-backdrop"
          aria-label="Close side view"
          onClick={close}
        />
        <WidgetViewPanel
          mode="side"
          title={view.recordTitle ?? view.title}
          widgetId={view.widgetId}
          onClose={close}
          onOpenSplit={() => openSplit(view.widgetId, view.title)}
          onOpenFull={() => openFull(view.widgetId, view.title)}
          recordIndex={view.recordIndex}
          recordCount={view.records?.length}
          onNavigateRecord={navigateRecord}
        />
      </>
    )
  }

  function renderSplitPanel() {
    if (!isSplit || !view) return null
    return (
      <WidgetViewPanel
        mode="split"
        title={view.title}
        widgetId={view.widgetId}
        onClose={() => closeSplitPane('primary')}
        onOpenSide={() => openSide(view.widgetId, view.title)}
      />
    )
  }

  function renderDualSplitPanels() {
    if (!isDualSplit || !view?.secondary) return null
    return (
      <>
        <WidgetViewPanel
          mode="split"
          title={view.title}
          widgetId={view.widgetId}
          onClose={() => closeSplitPane('primary')}
          onOpenSide={() => openSide(view.widgetId, view.title)}
        />
        <WidgetViewPanel
          mode="split"
          title={view.secondary.title}
          widgetId={view.secondary.widgetId}
          onClose={() => closeSplitPane('secondary')}
          onOpenSide={() => openSide(view.secondary!.widgetId, view.secondary!.title)}
        />
      </>
    )
  }

  const isV2Record = version === 'option2' && isSide && view != null
  const summaryOpen = layout.summaryOpen
  const summaryVisible = summaryOpen && !isV2Record
  const v2RecordFill = isV2Record && recordExpanded

  function setSummary(open: boolean) {
    layouts.updateLayout((current) => ({ ...current, summaryOpen: open }))
  }

  function toggleSummary() {
    if (isV2Record) {
      closeV2Record()
      setSummary(true)
      return
    }
    setSummary(!summaryOpen)
  }

  function closeV2Record() {
    setRecordExpanded(false)
    close()
  }

  function highlightLayoutButton() {
    window.clearTimeout(highlightTimer.current)
    setLayoutHighlight(false)
    window.requestAnimationFrame(() => setLayoutHighlight(true))
    highlightTimer.current = window.setTimeout(() => setLayoutHighlight(false), LAYOUT_HIGHLIGHT_MS)
  }

  function goToClaim(index: number) {
    if (index < 0 || index >= CLAIM_QUEUE.length || index === claimIndex) return
    const nextType = claimTypeForStatus(CLAIM_QUEUE[index].status)
    const typeChanged = nextType !== layouts.claimType
    closeV2Record()
    onClaimOpened(index)
    layouts.openClaim(nextType)
    if (typeChanged && !layouts.useForAll) highlightLayoutButton()
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (key !== 'j' && key !== 'k') return
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="combobox"]')) {
        return
      }
      if (document.querySelector('[aria-modal="true"]')) return
      event.preventDefault()
      goToClaim(claimIndex + (key === 'j' ? 1 : -1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  useEffect(() => () => window.clearTimeout(highlightTimer.current), [])

  const layoutMenu =
    version === 'option2' ? (
      <LayoutMenu
        label={layouts.scopeLabel}
        customized={layouts.isCustomized}
        highlight={layoutHighlight}
        resetLabel={`Reset ${layouts.scopeLabel} layout`}
        resetDisabled={!layouts.isCustomized}
        useForAll={layouts.useForAll}
        resetAllDisabled={!layouts.hasSavedLayouts && !layouts.isCustomized}
        onReset={layouts.resetCurrent}
        onToggleUseForAll={() => layouts.setUseForAll(!layouts.useForAll)}
        onResetAll={layouts.resetAll}
      />
    ) : null

  function renderV2Record() {
    if (!isV2Record || !view) return null
    return (
      <WidgetViewPanel
        mode="side"
        docked
        expanded={recordExpanded}
        onToggleExpand={() => setRecordExpanded((value) => !value)}
        width={recordWidth}
        onWidthChange={setRecordWidth}
        title={view.recordTitle ?? view.title}
        widgetId={view.widgetId}
        onClose={closeV2Record}
        recordIndex={view.recordIndex}
        recordCount={view.records?.length}
        onNavigateRecord={navigateRecord}
      />
    )
  }

  const propertiesPanel = (
    <PropertiesPanel
      collapsed={propertiesCollapsed}
      onToggle={onToggleProperties}
      status={claim.status}
    />
  )

  let stageContent: ReactNode
  if (isFull && view) {
    stageContent = (
      <>
        {propertiesPanel}
        <WidgetViewPanel
          mode="full"
          title={view.title}
          widgetId={view.widgetId}
          onClose={close}
        />
        {renderSideOverlay()}
      </>
    )
  } else if (version === 'option1') {
    stageContent = (
      <>
        {propertiesPanel}
        {isDualSplit ? (
          renderDualSplitPanels()
        ) : (
          <>
            <ClaimOption1Panel />
            {renderSplitPanel()}
          </>
        )}
        {renderSideOverlay()}
      </>
    )
  } else {
    stageContent = (
      <>
        {propertiesPanel}
        {v2RecordFill ? null : (
          <ClaimV2Panel
            split={split}
            tabOrder={layout.tabOrder}
            onTabOrderChange={(tabOrder) =>
              layouts.updateLayout((current) => ({ ...current, tabOrder }))
            }
            showSplitHint={!layouts.splitHintDismissed}
            onDismissSplitHint={layouts.dismissSplitHint}
          />
        )}
        {renderSplitPanel()}
        {summaryVisible ? (
          <ClaimV2Aside
            status={claim.status}
            width={summaryWidth}
            onWidthChange={setSummaryWidth}
          />
        ) : null}
        {renderV2Record()}
      </>
    )
  }

  return (
    <div className="app-shell">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="main-column">
        <GlobalHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        />
        <div className="content-row">
          <section className="app-canvas" aria-label="Claim details">
            <ClaimWidgetsCollapseProvider>
              <ClaimPageHeader
                version={version}
                onVersionChange={onVersionChange}
                fullViewTitle={isFull ? view?.title ?? null : null}
                onExitFullView={close}
                summaryOpen={version === 'option2' ? summaryVisible : undefined}
                onToggleSummary={version === 'option2' ? toggleSummary : undefined}
                claimId={claim.id}
                claimPosition={claimIndex + 1}
                claimCount={CLAIM_QUEUE.length}
                onNextClaim={() => goToClaim(claimIndex + 1)}
                onPreviousClaim={() => goToClaim(claimIndex - 1)}
                layoutMenu={layoutMenu}
              />
              <div className="canvas-body">
                <div className="canvas-stage" key={claim.id}>
                  {stageContent}
                </div>
              </div>
            </ClaimWidgetsCollapseProvider>
          </section>
        </div>
      </div>
    </div>
  )
}
