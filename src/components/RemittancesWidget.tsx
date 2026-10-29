import {
  activityMinus,
  submissionsPaid,
  submissionsSortDown,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { RecordCard } from './RecordCard'
import {
  REMITTANCE_RECORDS,
  REMITTANCE_ROWS as ROWS,
  remittanceRecordLabel as recordLabel,
} from './remittancesData'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'

export function RemittancesWidget({
  hideHeader = false,
  onOpenRecord,
  selectable = false,
  selectedIds = [],
  onSelectedChange,
  layout = 'table',
}: {
  hideHeader?: boolean
  /** When set, a row opens this handler instead of the shared side drawer. */
  onOpenRecord?: (index: number) => void
  selectable?: boolean
  selectedIds?: string[]
  onSelectedChange?: (ids: string[]) => void
  layout?: 'table' | 'cards'
}) {
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  function openRecord(index: number) {
    if (onOpenRecord) {
      onOpenRecord(index)
      return
    }
    openSide('remittances', 'Remittances', recordLabel(ROWS[index]), REMITTANCE_RECORDS)
  }

  return (
    <section
      className={[
        'remittances-widget',
        isOpen || hideHeader ? '' : 'claim-widget--collapsed',
        layout === 'cards' ? 'remittances-widget--cards' : '',
      ]
        .filter(Boolean)
        .join(' ')}
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

      {showBody && layout === 'cards' ? (
        <div id={contentId} className="submission-cards">
          {ROWS.map((row, index) => {
            const id = recordLabel(row)
            const selected = selectedIds.includes(id)
            return (
              <RecordCard
                key={id}
                title={row.checkNumber}
                label={`remittance ${id}`}
                open={recordIsOpen(view, 'remittances', id)}
                selected={selected}
                selectable={selectable}
                onOpen={() => openRecord(index)}
                onToggleSelected={() => {
                  const next = selected ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]
                  onSelectedChange?.(next)
                }}
                facts={[
                  { label: 'Check Date', value: row.checkDate },
                  { label: 'Ins. Paid', value: row.insPaid },
                  { label: 'PR Amount', value: row.prAmount },
                  { label: 'Other PR', value: row.otherPr },
                  {
                    label: 'Status',
                    children: (
                      <span className="submission-card__status submission-card__status--paid">
                        <img src={submissionsPaid} alt="" width={16} height={16} />
                        {row.status}
                      </span>
                    ),
                  },
                  {
                    label: 'Deposit Verified',
                    children: (
                      <span className="submission-card__status">
                        <img
                          src={row.depositVerified === 'N/A' ? activityMinus : submissionsPaid}
                          alt=""
                          width={16}
                          height={16}
                        />
                        {row.depositVerified}
                      </span>
                    ),
                  },
                  { label: 'Sent to', value: row.sentTo },
                  { label: 'Member ID', value: row.memberId },
                  { label: 'Source', value: row.source },
                  { label: 'Imported Date', value: row.importedDate },
                ]}
              />
            )
          })}
        </div>
      ) : null}
      {showBody && layout === 'table' ? (
      <div id={contentId} className="remittances-widget__table-wrap">
        <table className="remittances-widget__table">
          <thead>
            <tr>
              {selectable ? (
                <th className="submissions-widget__th submissions-widget__th--select" scope="col">
                  <span className="visually-hidden">Select</span>
                </th>
              ) : null}
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
            {ROWS.map((row, index) => (
              <tr
                key={recordLabel(row)}
                className={[
                  'widget-table-row',
                  recordIsOpen(view, 'remittances', recordLabel(row)) ? 'widget-table-row--open' : '',
                  selectedIds.includes(recordLabel(row)) ? 'vision2-row--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                tabIndex={0}
                role="button"
                aria-current={
                  recordIsOpen(view, 'remittances', recordLabel(row)) ? 'true' : undefined
                }
                aria-label={`Open remittance ${recordLabel(row)}`}
                onClick={() => openRecord(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRecord(index)
                  }
                }}
              >
                {selectable ? (
                  <td className="submissions-widget__td submissions-widget__td--select">
                    <button
                      type="button"
                      className={
                        selectedIds.includes(recordLabel(row))
                          ? 'vision2-check vision2-check--on'
                          : 'vision2-check'
                      }
                      aria-label={
                        selectedIds.includes(recordLabel(row))
                          ? `Deselect remittance ${recordLabel(row)}`
                          : `Select remittance ${recordLabel(row)}`
                      }
                      aria-pressed={selectedIds.includes(recordLabel(row))}
                      onClick={(event) => {
                        event.stopPropagation()
                        const id = recordLabel(row)
                        const next = selectedIds.includes(id)
                          ? selectedIds.filter((item) => item !== id)
                          : [...selectedIds, id]
                        onSelectedChange?.(next)
                      }}
                    />
                  </td>
                ) : null}
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
