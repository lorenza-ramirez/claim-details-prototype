import { useState } from 'react'
import {
  paymentsAddCircle,
  paymentsArrowDropDown,
  paymentsChevronRight,
  paymentsDangerous,
  paymentsFilter,
  paymentsSchedule,
  submissionsSortDown,
  tune,
} from '../assets/icons'
import { WidgetViewButtons, useWidgetView } from './widgetView'

type PaymentsTab = 'perPayer' | 'adjudication'

type ProcedureLine = {
  procedure: string
  posted: string
  charges: string
  paid: string
  pr: string
  adj: string
  writeOff: string
  memberId: string
  type: string
}

/** Synthetic demo payments — not real PHI/PII. */
const FINANCIALS = {
  charges: '$110.00',
  paid: '-',
  pr: '$110.00',
  adj: '-',
  balance: '$110.00',
}

const PROCEDURES: ProcedureLine[] = [
  {
    procedure: '234567',
    posted: '01/25/2026',
    charges: 'N/A',
    paid: 'N/A',
    pr: '-',
    adj: '-',
    writeOff: 'NEW YORK BLUE SHIELD OF ROCHESTER',
    memberId: '234567e5',
    type: 'Initial',
  },
  {
    procedure: '234568',
    posted: '01/25/2026',
    charges: 'N/A',
    paid: 'N/A',
    pr: '-',
    adj: '-',
    writeOff: 'NEW YORK BLUE SHIELD OF ROCHESTER',
    memberId: '234567e5',
    type: 'Initial',
  },
]

const DETAIL_FIELDS: { label: string; value: string }[] = [
  { label: 'Type', value: 'Remittance' },
  { label: 'Insurance', value: 'United Healthcare Insurance Company' },
  { label: 'Check Number', value: '25009B1000441986' },
  { label: 'Check Date', value: '01-09-25' },
  { label: 'Source', value: '835 File Import' },
  { label: 'Claim Status Code', value: '1' },
  { label: 'Coins', value: '$10.87' },
  { label: 'Deductible', value: '-' },
  { label: 'Check #', value: '-' },
  { label: 'Check Date', value: '09/15/25' },
  { label: 'Remit Received', value: '09/15/25' },
  { label: 'Remit Source', value: 'EOB Scan' },
  { label: 'Posted By', value: 'Remit Posting Rule Engine' },
]

const CARCS = [
  {
    code: 'CO-109',
    description:
      'Claim/service not covered by this payer/contractor. You must send the claim/service to the correct payer/contractor.',
  },
]

const RARCS = [
  {
    code: 'N130',
    description:
      'Consult plan benefit documents/guidelines for information about restrictions for this service.',
  },
  {
    code: 'N640',
    description: 'Exceeds number/frequency approved/allowed within time period.',
  },
]

function Icon({
  src,
  size = 20,
  alt = '',
}: {
  src: string
  size?: number
  alt?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className="icon"
      width={size}
      height={size}
      draggable={false}
    />
  )
}

function DetailBlock() {
  return (
    <div className="payments-widget__detail">
      <div className="payments-widget__detail-grid">
        {DETAIL_FIELDS.map((field, index) => (
          <div key={`${field.label}-${index}`} className="payments-widget__detail-field">
            <span className="payments-widget__detail-label">{field.label}</span>
            <span className="payments-widget__detail-value">{field.value}</span>
          </div>
        ))}
      </div>
      <div className="payments-widget__codes">
        <p className="payments-widget__codes-title">CARCs</p>
        {CARCS.map((item) => (
          <p key={item.code} className="payments-widget__code-line">
            <span className="payments-widget__code">{item.code}</span>
            <span className="payments-widget__code-sep"> | </span>
            <span>{item.description}</span>
          </p>
        ))}
      </div>
      <div className="payments-widget__codes">
        <p className="payments-widget__codes-title">RARCs</p>
        {RARCS.map((item) => (
          <p key={item.code} className="payments-widget__code-line">
            <span className="payments-widget__code">{item.code}</span>
            <span className="payments-widget__code-sep"> | </span>
            <span>{item.description}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

function PostingLedger() {
  const { openSide } = useWidgetView()
  const [openProcedures, setOpenProcedures] = useState<Record<string, boolean>>({
    '234567': true,
    '234568': true,
  })
  const records = PROCEDURES.map((row) => row.procedure)

  function toggleProcedure(id: string) {
    setOpenProcedures((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function openRecord(procedure: string) {
    openSide('payments', 'Payments', procedure, records)
  }

  return (
    <div className="payments-widget__ledger">
      <div className="payments-widget__ledger-header">
        <h4 className="payments-widget__ledger-title">Posting Ledger</h4>
        <div className="payments-widget__toolbar-actions">
          <button type="button" className="icon-btn" aria-label="Ledger settings">
            <Icon src={tune} size={20} />
          </button>
          <button type="button" className="icon-btn" aria-label="Filter ledger">
            <Icon src={paymentsFilter} size={20} />
          </button>
        </div>
      </div>

      <div className="payments-widget__ledger-table-wrap">
        <table className="payments-widget__ledger-table">
          <thead>
            <tr>
              <th className="payments-widget__th payments-widget__th--procedure" scope="col">
                <span>Procedure</span>
                <img src={submissionsSortDown} alt="" width={16} height={16} />
              </th>
              <th
                className="payments-widget__th payments-widget__th--end payments-widget__th--posted"
                scope="col"
              >
                Posted
              </th>
              <th
                className="payments-widget__th payments-widget__th--end payments-widget__th--num"
                scope="col"
              >
                Charges
              </th>
              <th
                className="payments-widget__th payments-widget__th--end payments-widget__th--num"
                scope="col"
              >
                Paid
              </th>
              <th
                className="payments-widget__th payments-widget__th--end payments-widget__th--num"
                scope="col"
              >
                PR
              </th>
              <th
                className="payments-widget__th payments-widget__th--end payments-widget__th--num"
                scope="col"
              >
                Adj.
              </th>
              <th
                className="payments-widget__th payments-widget__th--end payments-widget__th--writeoff"
                scope="col"
              >
                Write Off Adj. Type.
              </th>
              <th
                className="payments-widget__th payments-widget__th--end payments-widget__th--member"
                scope="col"
              >
                Member ID
              </th>
              <th className="payments-widget__th payments-widget__th--type" scope="col">
                Type
              </th>
            </tr>
          </thead>
          <tbody>
            {PROCEDURES.map((row) => {
              const isOpen = Boolean(openProcedures[row.procedure])
              return (
                <ProcedureRows
                  key={row.procedure}
                  row={row}
                  isOpen={isOpen}
                  onToggle={() => toggleProcedure(row.procedure)}
                  onOpenRecord={() => openRecord(row.procedure)}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProcedureRows({
  row,
  isOpen,
  onToggle,
  onOpenRecord,
}: {
  row: ProcedureLine
  isOpen: boolean
  onToggle: () => void
  onOpenRecord: () => void
}) {
  return (
    <>
      <tr
        className="payments-widget__procedure-row widget-table-row"
        tabIndex={0}
        role="button"
        aria-label={`Open procedure ${row.procedure}`}
        onClick={onOpenRecord}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenRecord()
          }
        }}
      >
        <td className="payments-widget__td">
          <div className="payments-widget__cell-start">
            <button
              type="button"
              className="payments-widget__expand"
              aria-expanded={isOpen}
              aria-label={isOpen ? `Collapse ${row.procedure}` : `Expand ${row.procedure}`}
              onClick={(event) => {
                event.stopPropagation()
                onToggle()
              }}
            >
              <img
                src={isOpen ? paymentsArrowDropDown : paymentsChevronRight}
                alt=""
                width={12}
                height={12}
              />
            </button>
            <span>{row.procedure}</span>
          </div>
        </td>
        <td className="payments-widget__td payments-widget__td--end">{row.posted}</td>
        <td className="payments-widget__td payments-widget__td--end">{row.charges}</td>
        <td className="payments-widget__td payments-widget__td--end">{row.paid}</td>
        <td className="payments-widget__td payments-widget__td--end">{row.pr}</td>
        <td className="payments-widget__td payments-widget__td--end">{row.adj}</td>
        <td className="payments-widget__td payments-widget__td--end payments-widget__td--truncate">
          <span>{row.writeOff}</span>
        </td>
        <td className="payments-widget__td payments-widget__td--end">{row.memberId}</td>
        <td className="payments-widget__td">{row.type}</td>
      </tr>
      {isOpen ? (
        <tr className="payments-widget__ledger-nested">
          <td colSpan={9}>
            <DetailBlock />
          </td>
        </tr>
      ) : null}
    </>
  )
}

export function PaymentsWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  const [tab, setTab] = useState<PaymentsTab>('perPayer')
  const [primaryOpen, setPrimaryOpen] = useState(true)
  const [secondaryOpen, setSecondaryOpen] = useState(false)
  const { openSide } = useWidgetView()
  const payerRecords = ['Primary', 'Secondary', 'Total']

  function openPayer(label: string) {
    openSide('payments', 'Payments', label, payerRecords)
  }

  return (
    <section
      className="payments-widget"
      {...(hideHeader
        ? { 'aria-label': 'Payments' }
        : { 'aria-labelledby': 'payments-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="payments-widget__title-row">
          <h3 id="payments-widget-title" className="payments-widget__title">
            Payments
          </h3>
          <WidgetViewButtons
            widgetId="payments"
            title="Payments"
            className="payments-widget__actions"
          />
        </header>
      )}

      <div className="payments-widget__toolbar">
        <div className="payments-widget__tabs" role="tablist" aria-label="Payments views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'perPayer'}
            className={
              tab === 'perPayer'
                ? 'payments-widget__tab payments-widget__tab--active'
                : 'payments-widget__tab'
            }
            onClick={() => setTab('perPayer')}
          >
            Per Payer
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'adjudication'}
            className={
              tab === 'adjudication'
                ? 'payments-widget__tab payments-widget__tab--active'
                : 'payments-widget__tab'
            }
            onClick={() => setTab('adjudication')}
          >
            Adjudication Detail
          </button>
        </div>
        <div className="payments-widget__toolbar-actions">
          <button type="button" className="icon-btn" aria-label="Payments settings">
            <Icon src={tune} size={20} />
          </button>
          <button type="button" className="icon-btn" aria-label="Filter payments">
            <Icon src={paymentsFilter} size={20} />
          </button>
        </div>
      </div>

      {tab === 'perPayer' ? (
        <div className="payments-widget__body">
          <div className="payments-widget__payer-table-wrap">
            <table className="payments-widget__payer-table">
              <thead>
                <tr>
                  <th className="payments-widget__th payments-widget__th--payer" scope="col">
                    <span>Payer</span>
                    <img src={submissionsSortDown} alt="" width={16} height={16} />
                  </th>
                  <th className="payments-widget__th payments-widget__th--end" scope="col">
                    Charges
                  </th>
                  <th className="payments-widget__th payments-widget__th--end" scope="col">
                    Paid
                  </th>
                  <th className="payments-widget__th payments-widget__th--end" scope="col">
                    PR
                  </th>
                  <th className="payments-widget__th payments-widget__th--end" scope="col">
                    Adj.
                  </th>
                  <th className="payments-widget__th payments-widget__th--end" scope="col">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className="payments-widget__payer-row widget-table-row"
                  tabIndex={0}
                  role="button"
                  aria-label="Open Primary payer"
                  onClick={() => openPayer('Primary')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPayer('Primary')
                    }
                  }}
                >
                  <td className="payments-widget__td">
                    <div className="payments-widget__cell-start">
                      <button
                        type="button"
                        className="payments-widget__expand"
                        aria-expanded={primaryOpen}
                        aria-label={primaryOpen ? 'Collapse Primary' : 'Expand Primary'}
                        onClick={(event) => {
                          event.stopPropagation()
                          setPrimaryOpen((value) => !value)
                        }}
                      >
                        <img
                          src={primaryOpen ? paymentsArrowDropDown : paymentsChevronRight}
                          alt=""
                          width={12}
                          height={12}
                        />
                      </button>
                      <img src={paymentsDangerous} alt="" width={18} height={18} />
                      <span className="payments-widget__payer-name">Primary</span>
                    </div>
                  </td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.charges}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.paid}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.pr}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.adj}</td>
                  <td className="payments-widget__td payments-widget__td--end payments-widget__td--strong">
                    {FINANCIALS.balance}
                  </td>
                </tr>
                {primaryOpen ? (
                  <tr className="payments-widget__payer-nested">
                    <td colSpan={6}>
                      <PostingLedger />
                    </td>
                  </tr>
                ) : null}

                <tr
                  className="payments-widget__payer-row widget-table-row"
                  tabIndex={0}
                  role="button"
                  aria-label="Open Secondary payer"
                  onClick={() => openPayer('Secondary')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPayer('Secondary')
                    }
                  }}
                >
                  <td className="payments-widget__td">
                    <div className="payments-widget__cell-start">
                      <button
                        type="button"
                        className="payments-widget__expand"
                        aria-expanded={secondaryOpen}
                        aria-label={secondaryOpen ? 'Collapse Secondary' : 'Expand Secondary'}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSecondaryOpen((value) => !value)
                        }}
                      >
                        <img
                          src={secondaryOpen ? paymentsArrowDropDown : paymentsChevronRight}
                          alt=""
                          width={12}
                          height={12}
                        />
                      </button>
                      <img src={paymentsSchedule} alt="" width={18} height={18} />
                      <span className="payments-widget__payer-name">Secondary</span>
                    </div>
                  </td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.charges}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.paid}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.pr}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.adj}</td>
                  <td className="payments-widget__td payments-widget__td--end payments-widget__td--strong">
                    {FINANCIALS.balance}
                  </td>
                </tr>
                {secondaryOpen ? (
                  <tr className="payments-widget__payer-nested">
                    <td colSpan={6}>
                      <PostingLedger />
                    </td>
                  </tr>
                ) : null}

                <tr
                  className="payments-widget__payer-row widget-table-row"
                  tabIndex={0}
                  role="button"
                  aria-label="Open Total payer"
                  onClick={() => openPayer('Total')}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      openPayer('Total')
                    }
                  }}
                >
                  <td className="payments-widget__td">
                    <div className="payments-widget__cell-start">
                      <span className="payments-widget__expand payments-widget__expand--spacer" />
                      <img src={paymentsAddCircle} alt="" width={18} height={18} />
                      <span className="payments-widget__payer-name">Total</span>
                    </div>
                  </td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.charges}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.paid}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.pr}</td>
                  <td className="payments-widget__td payments-widget__td--end">{FINANCIALS.adj}</td>
                  <td className="payments-widget__td payments-widget__td--end payments-widget__td--strong">
                    {FINANCIALS.balance}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="payments-widget__empty">
          <p>Adjudication Detail view coming soon.</p>
        </div>
      )}
    </section>
  )
}
