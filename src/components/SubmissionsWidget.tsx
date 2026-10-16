import { useState } from 'react'
import {
  submissionsError,
  submissionsPaid,
  submissionsRejected,
  submissionsSortDown,
} from '../assets/icons'
import { AppealPackageModal } from './AppealPackageModal'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'
import {
  SUBMISSION_RECORDS,
  SUBMISSION_ROWS as ROWS,
  type SubmissionStatusKind as StatusKind,
} from './submissionsData'

const STATUS_ICON: Record<StatusKind, string> = {
  error: submissionsError,
  paid: submissionsPaid,
  denied: submissionsRejected,
}

export function SubmissionsWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  const [appealOpen, setAppealOpen] = useState(false)
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  const records = SUBMISSION_RECORDS

  function openRecord(index: number) {
    openSide('submissions', 'Submissions', records[index], records)
  }

  return (
    <section
      className={
        isOpen || hideHeader
          ? 'submissions-widget'
          : 'submissions-widget claim-widget--collapsed'
      }
      {...(hideHeader
        ? { 'aria-label': 'Submissions' }
        : { 'aria-labelledby': 'submissions-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="submissions-widget__title-row">
          <ClaimWidgetTitle
            collapsible={collapsible}
            open={open}
            onToggle={toggle}
            title="Submissions"
            titleId="submissions-widget-title"
            titleClassName="submissions-widget__title"
            controlsId={contentId}
          />
          <WidgetViewButtons
            widgetId="submissions"
            title="Submissions"
            className="submissions-widget__actions"
          />
        </header>
      )}

      {showBody ? (
      <div id={contentId} className="submissions-widget__table-wrap">
        <table className="submissions-widget__table">
          <thead>
            <tr>
              <th className="submissions-widget__th submissions-widget__th--id" scope="col">
                <span>ID</span>
                <img src={submissionsSortDown} alt="" width={16} height={16} />
              </th>
              <th
                className="submissions-widget__th submissions-widget__th--created submissions-widget__th--end"
                scope="col"
              >
                Created
              </th>
              <th
                className="submissions-widget__th submissions-widget__th--submitted submissions-widget__th--end"
                scope="col"
              >
                Submitted
              </th>
              <th className="submissions-widget__th submissions-widget__th--status" scope="col">
                Status
              </th>
              <th
                className="submissions-widget__th submissions-widget__th--charges submissions-widget__th--end"
                scope="col"
              >
                Total Charges
              </th>
              <th className="submissions-widget__th submissions-widget__th--index" scope="col">
                Index
              </th>
              <th className="submissions-widget__th submissions-widget__th--payer" scope="col">
                Payer
              </th>
              <th
                className="submissions-widget__th submissions-widget__th--member submissions-widget__th--end"
                scope="col"
              >
                Member ID
              </th>
              <th className="submissions-widget__th submissions-widget__th--type" scope="col">
                Type
              </th>
              <th className="submissions-widget__th submissions-widget__th--method" scope="col">
                Method
              </th>
              <th className="submissions-widget__th submissions-widget__th--action" scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, index) => (
              <tr
                key={`${row.id}-${row.created}-${index}`}
                className={
                  recordIsOpen(view, 'submissions', records[index])
                    ? 'widget-table-row widget-table-row--open'
                    : 'widget-table-row'
                }
                tabIndex={0}
                role="button"
                aria-current={recordIsOpen(view, 'submissions', records[index]) ? 'true' : undefined}
                aria-label={`Open submission ${records[index]}`}
                onClick={() => openRecord(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRecord(index)
                  }
                }}
              >
                <td className="submissions-widget__td">{row.id}</td>
                <td className="submissions-widget__td submissions-widget__td--end">{row.created}</td>
                <td className="submissions-widget__td submissions-widget__td--end">{row.submitted}</td>
                <td className="submissions-widget__td">
                  <span
                    className={`submissions-widget__status submissions-widget__status--${row.status}`}
                  >
                    <img src={STATUS_ICON[row.status]} alt="" width={16} height={16} />
                    {row.statusLabel}
                  </span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--end">{row.charges}</td>
                <td className="submissions-widget__td">
                  <span
                    className={`submissions-widget__index submissions-widget__index--${row.index}`}
                  >
                    {row.index === 'primary' ? 'Primary' : 'Secondary'}
                  </span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--truncate">
                  <span title={row.payer}>{row.payer}</span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--end">{row.memberId}</td>
                <td className="submissions-widget__td submissions-widget__td--truncate">
                  <span title={row.type}>{row.type}</span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--truncate">
                  <span title={row.method}>{row.method}</span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--action">
                  <button
                    type="button"
                    className="submissions-widget__appeal"
                    onClick={(event) => {
                      event.stopPropagation()
                      setAppealOpen(true)
                    }}
                  >
                    Appeal
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}
      {appealOpen ? <AppealPackageModal onClose={() => setAppealOpen(false)} /> : null}
    </section>
  )
}
