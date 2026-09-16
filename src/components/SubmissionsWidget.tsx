import { useState } from 'react'
import {
  submissionsError,
  submissionsPaid,
  submissionsRejected,
  submissionsSortDown,
} from '../assets/icons'
import { AppealPackageModal } from './AppealPackageModal'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { useWidgetView, WidgetViewButtons } from './widgetView'

type StatusKind = 'error' | 'paid' | 'denied'
type IndexKind = 'primary' | 'secondary'

type SubmissionRow = {
  id: string
  created: string
  submitted: string
  status: StatusKind
  statusLabel: string
  charges: string
  index: IndexKind
  payer: string
  memberId: string
  type: string
  method: string
  appealEnabled: boolean
}

/** Synthetic demo submissions — not real PHI/PII. */
const ROWS: SubmissionRow[] = [
  {
    id: 'ARC680055',
    created: '07/21/2026',
    submitted: 'Not Submitted',
    status: 'error',
    statusLabel: 'Submission Error',
    charges: '$234.34',
    index: 'secondary',
    payer: 'NEW YORK MEDICAID - PHASE II',
    memberId: 'BQ60358Y',
    type: 'Initial',
    method: 'CHC',
    appealEnabled: false,
  },
  {
    id: 'ARC680055',
    created: '2/17/2026',
    submitted: '2/17/2026',
    status: 'paid',
    statusLabel: 'Paid',
    charges: '$234.34',
    index: 'primary',
    payer: 'United Healthcare',
    memberId: 'BQ60358Y',
    type: 'Resubmission',
    method: 'CHC',
    appealEnabled: false,
  },
  {
    id: 'ARC680055',
    created: '1/10/2026',
    submitted: '1/10/2026',
    status: 'denied',
    statusLabel: 'Denied',
    charges: '$234.34',
    index: 'primary',
    payer: 'United Healthcare',
    memberId: 'BQ60358Y',
    type: 'Initial',
    method: 'CHC',
    appealEnabled: true,
  },
]

const STATUS_ICON: Record<StatusKind, string> = {
  error: submissionsError,
  paid: submissionsPaid,
  denied: submissionsRejected,
}

export function SubmissionsWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  const [appealOpen, setAppealOpen] = useState(false)
  const { openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  const records = ROWS.map((row) => `${row.id} · ${row.created}`)

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
                className="widget-table-row"
                tabIndex={0}
                role="button"
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
                  <span>{row.payer}</span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--end">{row.memberId}</td>
                <td className="submissions-widget__td submissions-widget__td--truncate">
                  <span>{row.type}</span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--truncate">
                  <span>{row.method}</span>
                </td>
                <td className="submissions-widget__td submissions-widget__td--action">
                  <button
                    type="button"
                    className={
                      row.appealEnabled
                        ? 'submissions-widget__appeal'
                        : 'submissions-widget__appeal submissions-widget__appeal--disabled'
                    }
                    disabled={!row.appealEnabled}
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
