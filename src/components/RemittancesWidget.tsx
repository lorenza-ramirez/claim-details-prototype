import {
  submissionsPaid,
  submissionsSortDown,
} from '../assets/icons'
import { useWidgetView, WidgetViewButtons } from './widgetView'

type RemittanceRow = {
  checkNumber: string
  checkDate: string
  insPaid: string
  prAmount: string
  otherPr: string
  status: string
  depositVerified: string
  sentTo: string
  memberId: string
  source: string
  importedDate: string
}

/** Synthetic demo remittances — not real PHI/PII. */
const ROWS: RemittanceRow[] = [
  {
    checkNumber: 'ARC680055',
    checkDate: '07/21/2026',
    insPaid: '$234.34',
    prAmount: '$234.34',
    otherPr: '$234.34',
    status: 'Posted',
    depositVerified: 'Verified',
    sentTo: 'NF-GEICO',
    memberId: 'BQ60358Y',
    source: 'EOB',
    importedDate: '07/21/2026',
  },
  {
    checkNumber: 'ARC680102',
    checkDate: '06/14/2026',
    insPaid: '$189.00',
    prAmount: '$45.00',
    otherPr: '$0.00',
    status: 'Posted',
    depositVerified: 'Verified',
    sentTo: 'NF-GEICO',
    memberId: 'BQ60358Y',
    source: '835',
    importedDate: '06/15/2026',
  },
  {
    checkNumber: 'ARC679944',
    checkDate: '05/02/2026',
    insPaid: '$110.50',
    prAmount: '$20.00',
    otherPr: '$12.00',
    status: 'Posted',
    depositVerified: 'Pending',
    sentTo: 'NF-GEICO',
    memberId: 'BQ60358Y',
    source: 'EOB',
    importedDate: '05/03/2026',
  },
]

export function RemittancesWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  const { openSide } = useWidgetView()
  const records = ROWS.map((row) => row.checkNumber)

  function openRecord(checkNumber: string) {
    openSide('remittances', 'Remittances', checkNumber, records)
  }

  return (
    <section
      className="remittances-widget"
      {...(hideHeader
        ? { 'aria-label': 'Remittances' }
        : { 'aria-labelledby': 'remittances-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="remittances-widget__title-row">
          <h3 id="remittances-widget-title" className="remittances-widget__title">
            Remittances
          </h3>
          <WidgetViewButtons
            widgetId="remittances"
            title="Remittances"
            className="remittances-widget__actions"
          />
        </header>
      )}

      <div className="remittances-widget__table-wrap">
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
                key={`${row.checkNumber}-${row.checkDate}`}
                className="widget-table-row"
                tabIndex={0}
                role="button"
                aria-label={`Open remittance ${row.checkNumber}`}
                onClick={() => openRecord(row.checkNumber)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRecord(row.checkNumber)
                  }
                }}
              >
                <td className="remittances-widget__td">{row.checkNumber}</td>
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
                    <img src={submissionsPaid} alt="" width={16} height={16} />
                    {row.depositVerified}
                  </span>
                </td>
                <td className="remittances-widget__td remittances-widget__td--truncate">
                  <span>{row.sentTo}</span>
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
    </section>
  )
}
