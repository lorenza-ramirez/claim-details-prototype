import { useMemo, useState, type ReactNode } from 'react'

type Pivot = 'age' | 'status'
type Metric = 'balance' | 'count'
type Ranking = 'payer' | 'provider'

type ChartDatum = {
  id: string
  label: string
  shortLabel: ReactNode
  balance: number
  count: number
  tone: string
}

const AGE_DATA: ChartDatum[] = [
  { id: '0-30', label: '0–30 days', shortLabel: '0–30', balance: 92_140, count: 176, tone: 'fresh' },
  { id: '31-60', label: '31–60 days', shortLabel: '31–60', balance: 118_320, count: 219, tone: 'watch' },
  { id: '61-90', label: '61–90 days', shortLabel: '61–90', balance: 147_090, count: 254, tone: 'warning' },
  { id: '91-120', label: '91–120 days', shortLabel: '91–120', balance: 87_800, count: 153, tone: 'danger' },
  { id: '120-plus', label: '120+ days', shortLabel: '120+', balance: 41_850, count: 74, tone: 'critical' },
]

const STATUS_DATA: ChartDatum[] = [
  { id: 'full-denial', label: 'Full denial', shortLabel: <>Full<br />denial</>, balance: 178_400, count: 312, tone: 'critical' },
  { id: 'rejection', label: 'Rejection', shortLabel: 'Reject', balance: 112_300, count: 198, tone: 'watch' },
  { id: 'submission-error', label: 'Submission error', shortLabel: <>Sub<br />error</>, balance: 91_600, count: 164, tone: 'purple' },
  { id: 'partial-denial', label: 'Partial denial', shortLabel: <>Partial<br />denial</>, balance: 53_200, count: 87, tone: 'warning' },
  { id: 'decision-pending', label: 'Decision pending', shortLabel: <>Decision<br />pending</>, balance: 34_500, count: 76, tone: 'info' },
  { id: 'reconciliation', label: 'Reconciliation', shortLabel: 'Recon', balance: 17_200, count: 39, tone: 'neutral' },
]

const PAYER_ROWS = [
  { name: 'Aetna', count: 84, amount: 124_530 },
  { name: 'UB-Molina Iowa', count: 62, amount: 87_240 },
  { name: 'BCBS Federal', count: 47, amount: 71_900 },
  { name: 'Cigna', count: 39, amount: 58_105 },
  { name: 'UnitedHealthcare', count: 51, amount: 52_880 },
  { name: 'Humana', count: 28, amount: 34_220 },
  { name: 'Medicare Part B', count: 22, amount: 29_470 },
  { name: 'Kaiser Permanente', count: 15, amount: 18_890 },
]

const PROVIDER_ROWS = [
  { name: 'Provider group A', count: 98, amount: 136_240 },
  { name: 'Provider group B', count: 76, amount: 101_820 },
  { name: 'Provider group C', count: 64, amount: 82_460 },
  { name: 'Provider group D', count: 53, amount: 64_980 },
  { name: 'Provider group E', count: 41, amount: 47_700 },
  { name: 'Provider group F', count: 29, amount: 31_540 },
]

const WORKLIST_ROWS = [
  { id: 'CLM-1001', status: 'Full denial', age: '61–90', payer: 'Aetna', provider: 'Provider group A', balance: '$4,820', owner: 'Team A' },
  { id: 'CLM-1002', status: 'Rejection', age: '31–60', payer: 'UB-Molina Iowa', provider: 'Provider group B', balance: '$3,640', owner: 'Team B' },
  { id: 'CLM-1003', status: 'Submission error', age: '0–30', payer: 'BCBS Federal', provider: 'Provider group C', balance: '$2,975', owner: 'Team A' },
  { id: 'CLM-1004', status: 'Partial denial', age: '91–120', payer: 'Cigna', provider: 'Provider group D', balance: '$2,410', owner: 'Team C' },
  { id: 'CLM-1005', status: 'Decision pending', age: '0–30', payer: 'UnitedHealthcare', provider: 'Provider group E', balance: '$1,980', owner: 'Team B' },
  { id: 'CLM-1006', status: 'Full denial', age: '120+', payer: 'Humana', provider: 'Provider group F', balance: '$1,760', owner: 'Team C' },
]

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatChartValue(value: number, metric: Metric) {
  if (metric === 'count') return value.toLocaleString('en-US')
  return `$${Math.round(value / 1000)}k`
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon({ direction = 'up' }: { direction?: 'up' | 'down' | 'out' | 'right' }) {
  const path = {
    up: 'm7 14 5-5 5 5',
    down: 'm7 10 5 5 5-5',
    out: 'M7 17 17 7M8 7h9v9',
    right: 'M5 12h14m-7-7 7 7-7 7',
  }[direction]
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="metrics-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={value === option.value ? 'metrics-segmented__item metrics-segmented__item--active' : 'metrics-segmented__item'}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function KpiCard({
  label,
  value,
  detail,
  delta,
  tone,
  onClick,
}: {
  label: string
  value: string
  detail: string
  delta: string
  tone: 'success' | 'warning'
  onClick: () => void
}) {
  return (
    <button type="button" className={`metrics-kpi metrics-kpi--${tone}`} onClick={onClick}>
      <span className="metrics-kpi__label">
        {label}
        <ArrowIcon direction="out" />
      </span>
      <strong className="metrics-kpi__value">{value}</strong>
      <span className="metrics-kpi__detail">{detail}</span>
      <span className={`metrics-kpi__delta metrics-kpi__delta--${tone}`}>
        <ArrowIcon direction={tone === 'success' ? 'down' : 'up'} />
        {delta}
      </span>
    </button>
  )
}

function MetricsPanel({
  onClose,
  onFilter,
  onOpenAnalytics,
}: {
  onClose: () => void
  onFilter: (label: string) => void
  onOpenAnalytics: () => void
}) {
  const [pivot, setPivot] = useState<Pivot>('age')
  const [metric, setMetric] = useState<Metric>('balance')
  const [ranking, setRanking] = useState<Ranking>('payer')
  const [selectedBar, setSelectedBar] = useState<string | null>(null)

  const chartData = pivot === 'age' ? AGE_DATA : STATUS_DATA
  const maxValue = Math.max(...chartData.map((item) => item[metric]))
  const rankingRows = ranking === 'payer' ? PAYER_ROWS : PROVIDER_ROWS

  function selectBar(item: ChartDatum) {
    setSelectedBar(item.id)
    onFilter(`${pivot === 'age' ? 'Days open' : 'Status'}: ${item.label}`)
  }

  return (
    <aside className="claims-metrics-panel" aria-label="Claims metrics">
      <header className="claims-metrics-panel__header">
        <h2>Metrics</h2>
        <button type="button" className="claims-icon-button" aria-label="Close metrics panel" onClick={onClose}>
          <CloseIcon />
        </button>
      </header>

      <div className="claims-metrics-panel__scope">
        <span>Scoped to</span>
        <span className="claims-scope-tag">Workable Claims · 876</span>
      </div>

      <div className="metrics-kpi-grid">
        <KpiCard
          label="Open balance"
          value="$487.2k"
          detail="876 claims"
          delta="$18.4k this week"
          tone="success"
          onClick={() => onFilter('Open balance: all workable claims')}
        />
        <KpiCard
          label="At risk"
          value="$42.1k"
          detail="31 claims · filing ≤14 days"
          delta="Action needed"
          tone="warning"
          onClick={() => onFilter('At risk: filing within 14 days')}
        />
      </div>

      <section className="claims-metrics-section" aria-labelledby="breakdown-title">
        <h3 id="breakdown-title" className="sr-only">Claims breakdown</h3>
        <div className="claims-metrics-section__controls">
          <SegmentedControl
            label="Breakdown"
            value={pivot}
            options={[
              { value: 'age', label: 'Days open' },
              { value: 'status', label: 'Status' },
            ]}
            onChange={(next) => {
              setPivot(next)
              setSelectedBar(null)
            }}
          />
          <SegmentedControl
            label="Metric"
            value={metric}
            options={[
              { value: 'balance', label: 'Balance' },
              { value: 'count', label: 'Count' },
            ]}
            onChange={setMetric}
          />
        </div>

        <div className={`claims-metrics-chart claims-metrics-chart--${pivot}`}>
          {chartData.map((item) => {
            const value = item[metric]
            const height = Math.max(8, Math.round((value / maxValue) * 100))
            return (
              <button
                type="button"
                key={item.id}
                className={selectedBar === item.id ? 'claims-chart-bar claims-chart-bar--selected' : 'claims-chart-bar'}
                aria-label={`${item.label}: ${metric === 'balance' ? currency.format(value) : `${value} claims`}`}
                aria-pressed={selectedBar === item.id}
                onClick={() => selectBar(item)}
              >
                <span className="claims-chart-bar__stack">
                  <span className="claims-chart-bar__value">{formatChartValue(value, metric)}</span>
                  <span className={`claims-chart-bar__column claims-chart-bar__column--${item.tone}`} style={{ height: `${height}%` }} />
                </span>
                <span className="claims-chart-bar__label">{item.shortLabel}</span>
              </button>
            )
          })}
        </div>
        <p className="claims-metrics-chart__note">Click a bar to filter the worklist</p>
      </section>

      <section className="claims-metrics-section claims-metrics-section--ranking" aria-labelledby="ranking-title">
        <div className="claims-metrics-section__heading">
          <h3 id="ranking-title">Top {ranking === 'payer' ? 'payers' : 'providers'} by balance</h3>
          <SegmentedControl
            label="Ranking dimension"
            value={ranking}
            options={[
              { value: 'payer', label: 'Payer' },
              { value: 'provider', label: 'Provider' },
            ]}
            onChange={setRanking}
          />
        </div>
        <div className="claims-ranking-table" role="table" aria-label={`Top ${ranking}s by balance`}>
          <div className="claims-ranking-table__head" role="row">
            <span role="columnheader">{ranking === 'payer' ? 'Payer' : 'Provider'}</span>
            <span role="columnheader">Balance</span>
          </div>
          {rankingRows.map((row) => (
            <button
              type="button"
              className="claims-ranking-table__row"
              role="row"
              key={row.name}
              onClick={() => onFilter(`${ranking === 'payer' ? 'Payer' : 'Provider'}: ${row.name}`)}
            >
              <span className="claims-ranking-table__name" role="cell">
                {row.name} <small>· {row.count}</small>
              </span>
              <span className="claims-ranking-table__amount" role="cell">{currency.format(row.amount)}</span>
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="claims-metrics-panel__analytics" onClick={onOpenAnalytics}>
        View all in Analytics
        <ArrowIcon direction="right" />
      </button>
    </aside>
  )
}

export function ClaimsMetricsPage() {
  const [panelOpen, setPanelOpen] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Workable Claims')
  const [announcement, setAnnouncement] = useState('')

  const visibleRows = useMemo(() => {
    if (activeFilter.startsWith('Days open:')) {
      const age = activeFilter.replace('Days open: ', '').replace(' days', '')
      return WORKLIST_ROWS.filter((row) => row.age === age)
    }
    if (activeFilter.startsWith('Status:')) {
      const status = activeFilter.replace('Status: ', '').toLowerCase()
      return WORKLIST_ROWS.filter((row) => row.status.toLowerCase() === status)
    }
    if (activeFilter.startsWith('Payer:')) {
      const payer = activeFilter.replace('Payer: ', '')
      return WORKLIST_ROWS.filter((row) => row.payer === payer)
    }
    if (activeFilter.startsWith('Provider:')) {
      const provider = activeFilter.replace('Provider: ', '')
      return WORKLIST_ROWS.filter((row) => row.provider === provider)
    }
    return WORKLIST_ROWS
  }, [activeFilter])

  function applyFilter(label: string) {
    setActiveFilter(label)
    setAnnouncement(`Worklist filtered by ${label}`)
  }

  return (
    <div className="claims-page">
      <aside className="claims-page__sidebar" aria-label="Primary navigation">
        <div className="claims-page__brand">AIR</div>
        <nav>
          <button type="button">Home</button>
          <button type="button">Visits</button>
          <button type="button">Tasks</button>
          <span>Revenue Cycle</span>
          <button type="button">Encounters</button>
          <button type="button" className="is-active">Claims</button>
          <button type="button">Denials</button>
          <button type="button">Remittances</button>
        </nav>
        <div className="claims-page__site">Demo medical group</div>
      </aside>

      <main className="claims-page__main">
        <header className="claims-page__global-header">
          <span>Claims</span>
          <label className="claims-page__search">
            <span className="sr-only">Search claims</span>
            <input type="search" placeholder="Global Search" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="claims-page__ai-actions">
            <button type="button">Scribe</button>
            <button type="button">Athelas AI</button>
          </div>
        </header>

        <div className="claims-page__tabs">
          {['All Claims (876)', 'Workable Claims', 'My Claims', 'Denials'].map((tab) => (
            <button
              type="button"
              key={tab}
              className={tab === 'Workable Claims' ? 'is-active' : ''}
              onClick={() => tab === 'Workable Claims' && applyFilter('Workable Claims')}
            >
              {tab}
            </button>
          ))}
          <button type="button" className="claims-page__create">+ Create a Claim</button>
        </div>

        <div className="claims-page__workspace">
          <section className="claims-worklist" aria-label="Workable claims">
            <div className="claims-worklist__toolbar">
              <button type="button">☰&nbsp; Filter</button>
              <span className="claims-worklist__filter">
                {activeFilter}
                {activeFilter !== 'Workable Claims' ? (
                  <button type="button" aria-label="Clear filter" onClick={() => applyFilter('Workable Claims')}>×</button>
                ) : null}
              </span>
              {!panelOpen ? (
                <button type="button" className="claims-worklist__metrics-button" onClick={() => setPanelOpen(true)}>
                  Show metrics
                </button>
              ) : null}
            </div>
            <div className="claims-worklist__table" role="table" aria-label="Synthetic claim worklist">
              <div className="claims-worklist__head" role="row">
                <span role="columnheader">ID</span>
                <span role="columnheader">Status</span>
                <span role="columnheader">Age</span>
                <span role="columnheader">Payer</span>
                <span role="columnheader">Balance</span>
                <span role="columnheader">Assignee</span>
              </div>
              {visibleRows.length ? visibleRows.map((row) => (
                <button type="button" className="claims-worklist__row" role="row" key={row.id}>
                  <span role="cell">{row.id}</span>
                  <span role="cell"><i className={`claims-status claims-status--${row.status.toLowerCase().replaceAll(' ', '-')}`} />{row.status}</span>
                  <span role="cell">{row.age}</span>
                  <span role="cell">{row.payer}</span>
                  <span role="cell">{row.balance}</span>
                  <span role="cell">{row.owner}</span>
                </button>
              )) : (
                <div className="claims-worklist__empty">No sample claims match this aggregate filter.</div>
              )}
            </div>
          </section>

          {panelOpen ? (
            <MetricsPanel
              onClose={() => setPanelOpen(false)}
              onFilter={applyFilter}
              onOpenAnalytics={() => setAnnouncement('Analytics view opened from the metrics panel')}
            />
          ) : null}
        </div>
        <p className="sr-only" aria-live="polite">{announcement}</p>
      </main>
    </div>
  )
}
