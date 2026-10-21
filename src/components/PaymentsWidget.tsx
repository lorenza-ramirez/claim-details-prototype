import { useState, type KeyboardEvent } from 'react'
import { paymentsChevronRight, paymentsSchedule, widgetArrowDown } from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'

/** Synthetic demo payments — not real PHI/PII. */
const LINE = {
  charges: '$245.28',
  paid: '-',
  pr: '-',
  adj: '-',
  balance: '$245.28',
}

const PROCEDURE = '97163'

function Icon({ src, size = 16 }: { src: string; size?: number }) {
  return <img src={src} alt="" width={size} height={size} draggable={false} />
}

function MoneyCells({ strong = false }: { strong?: boolean }) {
  return (
    <>
      <td className="payments-widget__td payments-widget__td--end">{LINE.charges}</td>
      <td className="payments-widget__td payments-widget__td--end">{LINE.paid}</td>
      <td className="payments-widget__td payments-widget__td--end">{LINE.pr}</td>
      <td className="payments-widget__td payments-widget__td--end">{LINE.adj}</td>
      <td
        className={
          strong
            ? 'payments-widget__td payments-widget__td--end payments-widget__td--balance payments-widget__td--strong'
            : 'payments-widget__td payments-widget__td--end payments-widget__td--balance'
        }
      >
        {LINE.balance}
      </td>
    </>
  )
}

function Chevron({
  open,
  label,
  onClick,
}: {
  open: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="payments-widget__expand"
      aria-expanded={open}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <Icon src={open ? widgetArrowDown : paymentsChevronRight} size={12} />
    </button>
  )
}

export function PaymentsWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  const [primaryOpen, setPrimaryOpen] = useState(false)
  const [proceduresOpen, setProceduresOpen] = useState(true)
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  const payerRecords = ['Primary', 'Total', PROCEDURE]

  function openRecord(label: string) {
    openSide('payments', 'Payments', label, payerRecords)
  }

  function rowProps(label: string, extraClass = '') {
    const recordOpen = recordIsOpen(view, 'payments', label)
    return {
      className: `${
        recordOpen
          ? 'payments-widget__payer-row widget-table-row widget-table-row--open'
          : 'payments-widget__payer-row widget-table-row'
      }${extraClass ? ` ${extraClass}` : ''}`,
      tabIndex: 0,
      role: 'button' as const,
      'aria-current': recordOpen ? ('true' as const) : undefined,
      'aria-label': `Open ${label}`,
      onClick: () => openRecord(label),
      onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openRecord(label)
        }
      },
    }
  }

  return (
    <section
      className={isOpen || hideHeader ? 'payments-widget' : 'payments-widget claim-widget--collapsed'}
      {...(hideHeader ? { 'aria-label': 'Payments' } : { 'aria-labelledby': 'payments-widget-title' })}
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
          <WidgetViewButtons widgetId="payments" title="Payments" className="payments-widget__actions" />
        </header>
      )}

      {showBody ? (
        <div id={contentId} className="claim-widget__body payments-widget__sections">
          <div>
            <h3 className="payments-widget__section-title">Per Payer</h3>
            <div className="payments-widget__sheet">
              <table className="payments-widget__payer-table">
                <thead>
                  <tr>
                    <th className="payments-widget__th payments-widget__th--toggle" scope="col">
                      <span className="sr-only">Expand</span>
                    </th>
                    <th className="payments-widget__th" scope="col">Payer</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Charges</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Paid</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">PR</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Adj.</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr {...rowProps('Primary')}>
                    <td className="payments-widget__td payments-widget__td--toggle">
                      <Chevron
                        open={primaryOpen}
                        label={primaryOpen ? 'Collapse Primary' : 'Expand Primary'}
                        onClick={() => setPrimaryOpen((value) => !value)}
                      />
                    </td>
                    <td className="payments-widget__td">
                      <span className="payments-widget__cell-start">
                        <Icon src={paymentsSchedule} size={18} />
                        <span>Primary</span>
                      </span>
                    </td>
                    <MoneyCells />
                  </tr>
                  <tr {...rowProps('Total', 'payments-widget__payer-row--total')}>
                    <td className="payments-widget__td payments-widget__td--toggle" />
                    <td className="payments-widget__td payments-widget__td--strong">Total</td>
                    <MoneyCells strong />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="payments-widget__section-title">Adjudication Detail</h3>
            <div className="payments-widget__sheet">
              <table className="payments-widget__payer-table">
                <thead>
                  <tr>
                    <th className="payments-widget__th payments-widget__th--toggle" scope="col">
                      <span className="sr-only">Expand</span>
                    </th>
                    <th className="payments-widget__th" scope="col">Procedure</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Charges</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Paid</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">PR</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Adj.</th>
                    <th className="payments-widget__th payments-widget__th--end" scope="col">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="payments-widget__group">
                    <td className="payments-widget__td payments-widget__td--toggle">
                      <Chevron
                        open={proceduresOpen}
                        label={
                          proceduresOpen
                            ? 'Collapse Unsubmitted Procedures'
                            : 'Expand Unsubmitted Procedures'
                        }
                        onClick={() => setProceduresOpen((value) => !value)}
                      />
                    </td>
                    <td className="payments-widget__td" colSpan={6}>
                      <span className="payments-widget__cell-start">
                        <span className="payments-widget__td--strong">Unsubmitted Procedures</span>
                        <span className="payments-widget__count">1</span>
                      </span>
                    </td>
                  </tr>
                  {proceduresOpen ? (
                    <tr {...rowProps(PROCEDURE)}>
                      <td className="payments-widget__td payments-widget__td--toggle">
                        <Icon src={paymentsChevronRight} size={12} />
                      </td>
                      <td className="payments-widget__td">
                        <span className="payments-widget__cell-start">
                          <Icon src={paymentsSchedule} size={18} />
                          <span>{PROCEDURE}</span>
                        </span>
                      </td>
                      <MoneyCells />
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
