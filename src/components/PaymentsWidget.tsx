import { useState } from 'react'
import {
  paymentsAddCircle,
  widgetArrowDown,
  paymentsChevronRight,
  paymentsDangerous,
  paymentsFilter,
  submissionsSortDown,
  tune,
} from '../assets/icons'
import { WidgetViewButtons, recordIsOpen, useWidgetView } from './widgetView'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'

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
  charges: '$205.00',
  paid: '-',
  pr: '-',
  adj: '-',
  balance: '$205.00',
}

const PROCEDURES: ProcedureLine[] = [
  {
    procedure: '97140',
    posted: '10/14/2026',
    charges: '$67.00',
    paid: '$0.00',
    pr: '-',
    adj: '-',
    writeOff: '-',
    memberId: '17949634',
    type: 'Initial',
  },
  {
    procedure: '97530',
    posted: '10/14/2026',
    charges: '$70.00',
    paid: '$0.00',
    pr: '-',
    adj: '-',
    writeOff: '-',
    memberId: '17949634',
    type: 'Initial',
  },
  {
    procedure: '97110',
    posted: '10/14/2026',
    charges: '$68.00',
    paid: '$0.00',
    pr: '-',
    adj: '-',
    writeOff: '-',
    memberId: '17949634',
    type: 'Initial',
  },
]

const DETAIL_FIELDS: { label: string; value: string }[] = [
  { label: 'Type', value: 'Remittance' },
  { label: 'Insurance', value: 'United Medical Resources' },
  { label: 'Check Number', value: 'CE60205120213906278701523' },
  { label: 'Check Date', value: '10-14-26' },
  { label: 'Source', value: '835 File Import' },
  { label: 'Claim Status Code', value: '4 - Denied' },
  { label: 'Coins', value: '-' },
  { label: 'Deductible', value: '-' },
  { label: 'Check #', value: 'CE60205120213906278701523' },
  { label: 'Check Date', value: '10/14/26' },
  { label: 'Remit Received', value: '10/14/26' },
  { label: 'Remit Source', value: '835' },
  { label: 'Posted By', value: 'Remit Posting Rule Engine' },
]

const CARCS = [
  {
    code: 'PI-252',
    description:
      'An attachment/other documentation is required to adjudicate this claim/service. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT).',
  },
  {
    code: 'CO-45',
    description:
      'Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement.',
  },
]

const RARCS = [
  {
    code: 'M127',
    description: 'Missing patient medical record for this service.',
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
  const { view, openSide } = useWidgetView()
  const [openProcedures, setOpenProcedures] = useState<Record<string, boolean>>({
    '97140': true,
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
                  recordOpen={recordIsOpen(view, 'payments', row.procedure)}
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
  recordOpen,
}: {
  row: ProcedureLine
  isOpen: boolean
  onToggle: () => void
  onOpenRecord: () => void
  recordOpen: boolean
}) {
  return (
    <>
      <tr
        className={
          recordOpen
            ? 'payments-widget__procedure-row widget-table-row widget-table-row--open'
            : 'payments-widget__procedure-row widget-table-row'
        }
        tabIndex={0}
        role="button"
        aria-current={recordOpen ? 'true' : undefined}
        aria-label={`Open procedure ${row.procedure}`}
        onClick={onOpenRecord}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onOpenRecord()
          }
        }}
      >
        <td className="payments-widget__td payments-widget__td--procedure">
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
                src={isOpen ? widgetArrowDown : paymentsChevronRight}
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
          <span title={row.writeOff}>{row.writeOff}</span>
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
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  const payerRecords = ['Primary', 'Total']

  function openPayer(label: string) {
    openSide('payments', 'Payments', label, payerRecords)
  }

  return (
    <section
      className={
        isOpen || hideHeader
          ? 'payments-widget'
          : 'payments-widget claim-widget--collapsed'
      }
      {...(hideHeader
        ? { 'aria-label': 'Payments' }
        : { 'aria-labelledby': 'payments-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="payments-widget__title-row">
          <ClaimWidgetTitle
            collapsible={collapsible}
            open={open}
            onToggle={toggle}
            title="Payments"
            titleId="payments-widget-title"
            titleClassName="payments-widget__title"
            controlsId={contentId}
          />
          <WidgetViewButtons
            widgetId="payments"
            title="Payments"
            className="payments-widget__actions"
          />
        </header>
      )}

      {showBody ? (
      <div id={contentId} className="claim-widget__body">
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
                  className={
                    recordIsOpen(view, 'payments', 'Primary')
                      ? 'payments-widget__payer-row widget-table-row widget-table-row--open'
                      : 'payments-widget__payer-row widget-table-row'
                  }
                  tabIndex={0}
                  role="button"
                  aria-current={recordIsOpen(view, 'payments', 'Primary') ? 'true' : undefined}
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
                          src={primaryOpen ? widgetArrowDown : paymentsChevronRight}
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
                  className={
                    recordIsOpen(view, 'payments', 'Total')
                      ? 'payments-widget__payer-row widget-table-row widget-table-row--open'
                      : 'payments-widget__payer-row widget-table-row'
                  }
                  tabIndex={0}
                  role="button"
                  aria-current={recordIsOpen(view, 'payments', 'Total') ? 'true' : undefined}
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
      </div>
      ) : null}
    </section>
  )
}
