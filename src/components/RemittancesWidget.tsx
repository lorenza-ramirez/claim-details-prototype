import {
  activityMinus,
  submissionsPaid,
  submissionsSortDown,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import {
  REMITTANCE_RECORDS,
  REMITTANCE_ROWS as ROWS,
  remittanceRecordLabel as recordLabel,
} from './remittancesData'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'

export function RemittancesWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  function openRecord(label: string) {
    openSide('remittances', 'Remittances', label, REMITTANCE_RECORDS)
  }

  return (
    <section
      className={
        isOpen || hideHeader
          ? 'remittances-widget'
          : 'remittances-widget claim-widget--collapsed'
      }
      {...(hideHeader
        ? { 'aria-label': 'Remittances' }
        : { 'aria-labelledby': 'remittances-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="remittances-widget__title-row">
          <ClaimWidgetTitle
            collapsible={collapsible}
            open={open}
            onToggle={toggle}
            title="Remittances"
            titleId="remittances-widget-title"
            titleClassName="remittances-widget__title"
            controlsId={contentId}
          />
          <WidgetViewButtons
            widgetId="remittances"
            title="Remittances"
            className="remittances-widget__actions"
          />
        </header>
      )}

      {showBody ? (
      <div id={contentId} className="remittances-widget__table-wrap">
        <table className="remittances-widget__table">
          <thead>
            <tr>
              <th className="remittances-widget__th remittances-widget__th--check" scope="col">
                <span>Check #</span>
                <img src={submissionsSortDown} alt="" width={16} height={16} />
              </th>
              <th
                className="remittances-widget__th remittances-widget__th--date remittances-widget__th--end"
                scope="col"
              >
                Check Date
              </th>
              <th
                className="remittances-widget__th remittances-widget__th--amount remittances-widget__th--end"
                scope="col"
              >
                Ins. Paid
              </th>
              <th
                className="remittances-widget__th remittances-widget__th--amount remittances-widget__th--end"
                scope="col"
              >
                PR Amount
              </th>
              <th
                className="remittances-widget__th remittances-widget__th--amount remittances-widget__th--end"
                scope="col"
              >
                Other PR
              </th>
              <th className="remittances-widget__th remittances-widget__th--badge" scope="col">
                Status
              </th>
              <th className="remittances-widget__th remittances-widget__th--badge" scope="col">
                Deposit Verified
              </th>
              <th className="remittances-widget__th remittances-widget__th--sent" scope="col">
                Sent to
              </th>
              <th
                className="remittances-widget__th remittances-widget__th--member remittances-widget__th--end"
                scope="col"
              >
                Member ID
              </th>
              <th className="remittances-widget__th remittances-widget__th--source" scope="col">
                Source
              </th>
              <th
                className="remittances-widget__th remittances-widget__th--imported remittances-widget__th--end"
                scope="col"
              >
                Imported Date
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={recordLabel(row)}
                className={
                  recordIsOpen(view, 'remittances', recordLabel(row))
                    ? 'widget-table-row widget-table-row--open'
                    : 'widget-table-row'
                }
                tabIndex={0}
                role="button"
                aria-current={
                  recordIsOpen(view, 'remittances', recordLabel(row)) ? 'true' : undefined
                }
                aria-label={`Open remittance ${recordLabel(row)}`}
                onClick={() => openRecord(recordLabel(row))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRecord(recordLabel(row))
                  }
                }}
              >
                <td className="remittances-widget__td remittances-widget__td--truncate">
                  <span title={row.checkNumber}>{row.checkNumber}</span>
                </td>
                <td className="remittances-widget__td remittances-widget__td--end">{row.checkDate}</td>
                <td className="remittances-widget__td remittances-widget__td--end">{row.insPaid}</td>
                <td className="remittances-widget__td remittances-widget__td--end">{row.prAmount}</td>
                <td className="remittances-widget__td remittances-widget__td--end">{row.otherPr}</td>
                <td className="remittances-widget__td">
                  <span className="remittances-widget__badge">
                    <img src={submissionsPaid} alt="" width={16} height={16} />
                    {row.status}
                  </span>
                </td>
                <td className="remittances-widget__td">
                  <span className="remittances-widget__badge">
                    <img
                      src={row.depositVerified === 'N/A' ? activityMinus : submissionsPaid}
                      alt=""
                      width={16}
                      height={16}
                    />
                    {row.depositVerified}
                  </span>
                </td>
                <td className="remittances-widget__td remittances-widget__td--truncate">
                  <span title={row.sentTo}>{row.sentTo}</span>
                </td>
                <td className="remittances-widget__td remittances-widget__td--end">{row.memberId}</td>
                <td className="remittances-widget__td">
                  <button
                    type="button"
                    className="remittances-widget__link"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {row.source}
                  </button>
                </td>
                <td className="remittances-widget__td remittances-widget__td--end">
                  {row.importedDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}
    </section>
  )
}
