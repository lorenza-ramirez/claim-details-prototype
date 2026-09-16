import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  aiGroup1,
  aiGroup2,
  assuredWorkload,
  attachFile,
  avatar,
  checkCircle,
  circle,
  copy,
  docs,
  dockToRight,
  dynamicFeed,
  home,
  keyboardArrowDown,
  keyboardArrowDown1,
  keyboardArrowDown2,
  keyboardArrowDown3,
  keyboardArrowUp,
  leftPanelClose,
  link,
  logo,
  menu,
  monetizationOn,
  moreHoriz,
  paymentsSchedule,
  propsCalendar,
  propsCancelSend,
  propsHealth,
  propsPerson,
  propsPersonAdd,
  propsSell,
  propsUpdate,
  receiptLong,
  removeSelection,
  search,
  send,
  sendPanel,
  settings,
  sparkleA,
  sparkleB,
  speaking,
  supervisorAccount,
  tune,
  unfoldLess,
  unfoldMore,
} from '../assets/icons'
import { ActivityWidget } from './ActivityWidget'
import { ClaimDetailsWidget } from './ClaimDetailsWidget'
import { ClaimSummary } from './ClaimSummary'
import { ClaimV2Panel } from './ClaimV2Panel'
import {
  ClaimWidgetsCollapseProvider,
  useClaimWidgetsCollapseActions,
} from './ClaimWidgetCollapse'
import { DocumentationWidget } from './DocumentationWidget'
import { PaymentsWidget } from './PaymentsWidget'
import { RemittancesWidget } from './RemittancesWidget'
import { ReviewWidget } from './ReviewWidget'
import { SubmissionsWidget } from './SubmissionsWidget'
import { useWidgetView, WidgetViewPanel, WidgetViewProvider } from './widgetView'

type ContextNavId =
  | 'summary'
  | 'review'
  | 'details'
  | 'submissions'
  | 'documentation'
  | 'remittances'
  | 'payments'
  | 'activity'

const CONTEXT_NAV: {
  id: ContextNavId
  label: string
  icon?: string
  badge?: number
  sparkle?: boolean
}[] = [
  { id: 'summary', label: 'Claim Summary', sparkle: true },
  { id: 'review', label: 'Review', icon: checkCircle },
  { id: 'details', label: 'Claim Details', icon: docs },
  { id: 'submissions', label: 'Submissions', icon: sendPanel },
  { id: 'documentation', label: 'Documentation', icon: attachFile },
  { id: 'remittances', label: 'Remittances', icon: monetizationOn },
  { id: 'payments', label: 'Payments', icon: assuredWorkload },
  { id: 'activity', label: 'Activity', icon: dynamicFeed, badge: 1 },
]

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

function Sidebar({ collapsed }: { collapsed: boolean }) {
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

function GlobalHeader({
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

type ClaimVersion = 'current' | 'v1' | 'v2'

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
          ['current', 'Current'],
          ['v1', 'V1'],
          ['v2', 'V2'],
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
}: {
  version: ClaimVersion
  onVersionChange: (value: ClaimVersion) => void
  fullViewTitle?: string | null
  onExitFullView?: () => void
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
              22316691
            </button>
            <span className="claim-header__crumb-sep" aria-hidden>
              /
            </span>
            <span className="claim-header__crumb-current">{fullViewTitle}</span>
          </nav>
        ) : (
          <h1 className="claim-header__title">22316691</h1>
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

      <VersionToggle value={version} onChange={onVersionChange} />

      <div className="claim-header__right">
        <div className="page-controls">
          <button type="button" className="icon-btn" aria-label="Next claim">
            <Icon src={keyboardArrowDown2} size={18} />
          </button>
          <button type="button" className="icon-btn" aria-label="Previous claim">
            <Icon src={keyboardArrowUp} size={18} />
          </button>
          <div className="page-index" aria-label="Claim 1 of 30">
            <span className="page-index__current">1</span>
            <span className="page-index__sep">/</span>
            <span className="page-index__total">30</span>
          </div>
        </div>

        <div className="claim-header__divider" aria-hidden />

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

function SparkleIcon() {
  return (
    <span className="sparkle-icon" aria-hidden>
      <img src={sparkleA} alt="" width={14} height={20} className="sparkle-icon__a" />
      <img src={sparkleB} alt="" width={20} height={11} className="sparkle-icon__b" />
    </span>
  )
}

const SECTION_IDS: ContextNavId[] = [
  'summary',
  'review',
  'details',
  'submissions',
  'documentation',
  'remittances',
  'payments',
  'activity',
]

function sectionDomId(id: ContextNavId) {
  return `claim-section-${id}`
}

function widgetIdToNavId(widgetId: string | undefined): ContextNavId | null {
  if (!widgetId) return null
  if (SECTION_IDS.includes(widgetId as ContextNavId)) return widgetId as ContextNavId
  return null
}

function ContextIconBar({
  active,
  onSelect,
}: {
  active: ContextNavId
  onSelect: (id: ContextNavId) => void
}) {
  return (
    <nav className="context-icon-bar" aria-label="Claim sections">
      {CONTEXT_NAV.map((item) => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            type="button"
            className={
              isActive
                ? 'context-icon-bar__item context-icon-bar__item--active'
                : 'context-icon-bar__item'
            }
            aria-label={item.label}
            title={item.label}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(item.id)}
          >
            {item.sparkle ? <SparkleIcon /> : <Icon src={item.icon!} size={20} />}
            {item.badge != null ? (
              <span className="context-icon-bar__badge">{item.badge}</span>
            ) : null}
          </button>
        )
      })}
    </nav>
  )
}

function ClaimContextCollapseAllButton() {
  const { collapseAll, expandAll, anyOpen } = useClaimWidgetsCollapseActions()

  return (
    <button
      type="button"
      className="icon-btn icon-btn--outlined"
      aria-label={anyOpen ? 'Collapse all widgets' : 'Expand all widgets'}
      title={anyOpen ? 'Collapse all' : 'Expand all'}
      onClick={() => {
        if (anyOpen) collapseAll()
        else expandAll()
      }}
    >
      <Icon src={anyOpen ? unfoldLess : unfoldMore} size={20} />
    </button>
  )
}

function ClaimContextHeaderTools() {
  return (
    <div className="claim-context-section-header__tools">
      <ClaimContextCollapseAllButton />
      <button type="button" className="icon-btn icon-btn--outlined" aria-label="Tune claim context">
        <Icon src={tune} size={20} />
      </button>
    </div>
  )
}

function ClaimContextSectionHeader() {
  return (
    <div className="claim-context-section-header-wrap">
      <header className="claim-context-section-header">
        <h2 className="claim-context-section-header__title">Context</h2>
        <ClaimContextHeaderTools />
      </header>
    </div>
  )
}

function ClaimContextPanel({
  active,
  onSelect,
  navCollapsed,
  onToggleNav,
  layout = 'nav',
}: {
  active: ContextNavId
  onSelect: (id: ContextNavId) => void
  navCollapsed: boolean
  onToggleNav: () => void
  layout?: 'nav' | 'iconBar'
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const flyoutCloseTimer = useRef<number | null>(null)
  const [navFlyoutOpen, setNavFlyoutOpen] = useState(false)
  const activityBadge = CONTEXT_NAV.find((item) => item.id === 'activity')?.badge
  const isIconBar = layout === 'iconBar'

  useEffect(() => {
    const root = canvasRef.current
    if (!root) return

    const sections = SECTION_IDS.map((id) => document.getElementById(sectionDomId(id))).filter(
      (el): el is HTMLElement => el != null,
    )
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (!top?.target.id) return
        const navId = top.target.id.replace('claim-section-', '') as ContextNavId
        if (SECTION_IDS.includes(navId)) onSelect(navId)
      },
      {
        root,
        rootMargin: '-10% 0px -55% 0px',
        threshold: [0.15, 0.35, 0.55],
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [onSelect])

  useEffect(() => {
    if (!navCollapsed || isIconBar) setNavFlyoutOpen(false)
  }, [navCollapsed, isIconBar])

  useEffect(() => {
    return () => {
      if (flyoutCloseTimer.current != null) window.clearTimeout(flyoutCloseTimer.current)
    }
  }, [])

  function openNavFlyout() {
    if (flyoutCloseTimer.current != null) {
      window.clearTimeout(flyoutCloseTimer.current)
      flyoutCloseTimer.current = null
    }
    setNavFlyoutOpen(true)
  }

  function scheduleCloseNavFlyout() {
    if (flyoutCloseTimer.current != null) window.clearTimeout(flyoutCloseTimer.current)
    flyoutCloseTimer.current = window.setTimeout(() => {
      setNavFlyoutOpen(false)
      flyoutCloseTimer.current = null
    }, 120)
  }

  function handleNavSelect(id: ContextNavId) {
    onSelect(id)
    setNavFlyoutOpen(false)
    const target = document.getElementById(sectionDomId(id))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function renderNavItems() {
    return CONTEXT_NAV.map((item) => {
      const isActive = active === item.id
      return (
        <button
          key={item.id}
          type="button"
          className={
            isActive ? 'context-nav__item context-nav__item--active' : 'context-nav__item'
          }
          aria-current={isActive ? 'true' : undefined}
          onClick={() => handleNavSelect(item.id)}
        >
          <span className="context-nav__main">
            {item.sparkle ? <SparkleIcon /> : <Icon src={item.icon!} size={20} />}
            <span>{item.label}</span>
          </span>
          {item.badge != null ? (
            <span className="context-nav__badge">{item.badge}</span>
          ) : null}
        </button>
      )
    })
  }

  const canvas = (
    <div ref={canvasRef} className="claim-context__canvas" aria-label="Claim content">
      <section id={sectionDomId('summary')} className="claim-section">
        <ClaimSummary />
      </section>
      <div className="claim-widgets-stack">
        {isIconBar ? <ClaimContextSectionHeader /> : null}
        <section id={sectionDomId('review')} className="claim-section review-widget-wrap">
          <ReviewWidget />
        </section>
        <section id={sectionDomId('details')} className="claim-section claim-details-widget-wrap">
          <ClaimDetailsWidget />
        </section>
        <section id={sectionDomId('submissions')} className="claim-section submissions-widget-wrap">
          <SubmissionsWidget />
        </section>
        <section
          id={sectionDomId('documentation')}
          className="claim-section documentation-widget-wrap"
        >
          <DocumentationWidget />
        </section>
        <section id={sectionDomId('remittances')} className="claim-section remittances-widget-wrap">
          <RemittancesWidget />
        </section>
        <section id={sectionDomId('payments')} className="claim-section payments-widget-wrap">
          <PaymentsWidget />
        </section>
        <section id={sectionDomId('activity')} className="claim-section activity-widget-wrap">
          <ActivityWidget />
        </section>
      </div>
    </div>
  )

  if (isIconBar) {
    return (
      <div className="claim-context">
        <div className="claim-context__body">
          <ContextIconBar active={active} onSelect={handleNavSelect} />
          {canvas}
        </div>
      </div>
    )
  }

  return (
    <div className="claim-context claim-context--v1">
      <div className="panel-header">
        <div
          className="panel-header__menu-wrap"
          onMouseEnter={() => {
            if (navCollapsed) openNavFlyout()
          }}
          onMouseLeave={() => {
            if (navCollapsed) scheduleCloseNavFlyout()
          }}
        >
          <button
            type="button"
            className={
              navCollapsed
                ? 'icon-btn panel-header__menu'
                : 'icon-btn icon-btn--bordered panel-header__menu'
            }
            aria-label={navCollapsed ? 'Expand claim context nav' : 'Collapse claim context nav'}
            aria-expanded={!navCollapsed || navFlyoutOpen}
            aria-haspopup={navCollapsed ? 'menu' : undefined}
            onClick={onToggleNav}
            onFocus={() => {
              if (navCollapsed) openNavFlyout()
            }}
            onBlur={(event) => {
              if (!navCollapsed) return
              const next = event.relatedTarget
              if (next instanceof Node && event.currentTarget.parentElement?.contains(next)) {
                return
              }
              scheduleCloseNavFlyout()
            }}
          >
            <Icon src={menu} size={20} />
            {activityBadge != null ? (
              <span className="panel-header__menu-badge">{activityBadge}</span>
            ) : null}
          </button>
          {navCollapsed && navFlyoutOpen ? (
            <nav
              className="context-nav context-nav--floating"
              aria-label="Claim sections"
              onMouseEnter={openNavFlyout}
              onMouseLeave={scheduleCloseNavFlyout}
            >
              {renderNavItems()}
            </nav>
          ) : null}
        </div>
        <h2 className="panel-header__title">Claim Context</h2>
        <button type="button" className="icon-btn icon-btn--outlined" aria-label="Tune claim context">
          <Icon src={tune} size={20} />
        </button>
      </div>

      <div className="claim-context__body">
        {!navCollapsed ? (
          <nav className="context-nav" aria-label="Claim sections">
            {renderNavItems()}
          </nav>
        ) : null}
        {canvas}
      </div>
    </div>
  )
}

function PropertiesPanel({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <aside className="properties-panel properties-panel--collapsed" aria-label="Properties">
        <div className="properties-panel__rail">
          <button type="button" className="icon-btn" aria-label="Expand properties" title="Expand">
            <Icon src={leftPanelClose} size={24} />
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
        <button type="button" className="icon-btn" aria-label="Close properties panel">
          <Icon src={dockToRight} size={18} />
        </button>
      </div>
      <div className="properties-panel__body" />
    </aside>
  )
}

export function ClaimDetailsPage() {
  const [version, setVersion] = useState<ClaimVersion>('current')
  return (
    <WidgetViewProvider allowDualSplit={version === 'current'}>
      <ClaimDetailsPageInner version={version} onVersionChange={setVersion} />
    </WidgetViewProvider>
  )
}

function ClaimDetailsPageInner({
  version,
  onVersionChange,
}: {
  version: ClaimVersion
  onVersionChange: (value: ClaimVersion) => void
}) {
  const [activeNav, setActiveNav] = useState<ContextNavId>('summary')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contextNavCollapsed, setContextNavCollapsed] = useState(true)

  useEffect(() => {
    if (version === 'v1') setContextNavCollapsed(true)
  }, [version])
  const { view, close, openSide, openSplit, openFull, navigateRecord, closeSplitPane } =
    useWidgetView()

  const isFull = view?.mode === 'full'
  const isSplit = view?.mode === 'split'
  const isSide = view?.mode === 'side'
  const isDualSplit = isSplit && view?.secondary != null
  const fullViewNavId = widgetIdToNavId(view?.widgetId)

  function selectContextSection(id: ContextNavId) {
    setActiveNav(id)
    if (isFull) close()
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById(sectionDomId(id))?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    })
  }

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

  let stageContent: ReactNode
  if (version === 'current') {
    stageContent = (
      <>
        {isFull && view ? (
          <div className="claim-context claim-context--full-view">
            <div className="claim-context__body">
              <ContextIconBar
                active={fullViewNavId ?? activeNav}
                onSelect={selectContextSection}
              />
              <WidgetViewPanel
                mode="full"
                title={view.title}
                widgetId={view.widgetId}
                onClose={close}
              />
            </div>
          </div>
        ) : isDualSplit ? (
          renderDualSplitPanels()
        ) : (
          <>
            <ClaimContextPanel
              active={activeNav}
              onSelect={setActiveNav}
              navCollapsed={contextNavCollapsed}
              onToggleNav={() => setContextNavCollapsed((value) => !value)}
              layout="iconBar"
            />
            {renderSplitPanel()}
          </>
        )}
        <PropertiesPanel collapsed={isSplit} />
        {renderSideOverlay()}
      </>
    )
  } else if (isFull && view) {
    stageContent = (
      <>
        <WidgetViewPanel
          mode="full"
          title={view.title}
          widgetId={view.widgetId}
          onClose={close}
        />
        <PropertiesPanel collapsed={isSplit} />
        {renderSideOverlay()}
      </>
    )
  } else if (version === 'v2') {
    stageContent = (
      <>
        <ClaimV2Panel />
        {renderSplitPanel()}
        <PropertiesPanel collapsed={isSplit} />
        {renderSideOverlay()}
      </>
    )
  } else {
    stageContent = (
      <>
        <ClaimContextPanel
          active={activeNav}
          onSelect={setActiveNav}
          navCollapsed={contextNavCollapsed}
          onToggleNav={() => setContextNavCollapsed((value) => !value)}
          layout="nav"
        />
        {renderSplitPanel()}
        <PropertiesPanel collapsed={isSplit} />
        {renderSideOverlay()}
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
            {version === 'current' || version === 'v1' ? (
              <ClaimWidgetsCollapseProvider>
                <ClaimPageHeader
                  version={version}
                  onVersionChange={onVersionChange}
                  fullViewTitle={isFull ? view?.title ?? null : null}
                  onExitFullView={close}
                />
                <div className="canvas-body">
                  <div className="canvas-stage">{stageContent}</div>
                </div>
              </ClaimWidgetsCollapseProvider>
            ) : (
              <>
                <ClaimPageHeader
                  version={version}
                  onVersionChange={onVersionChange}
                  fullViewTitle={isFull ? view?.title ?? null : null}
                  onExitFullView={close}
                />
                <div className="canvas-body">
                  <div className="canvas-stage">{stageContent}</div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
