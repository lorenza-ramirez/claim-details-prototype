import { useState } from 'react'
import {
  submissionsError,
  submissionsPaid,
  submissionsRejected,
  submissionsSortDown,
} from '../assets/icons'
import { AppealPackageModal } from './AppealPackageModal'
import { RecordCard } from './RecordCard'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'
import {
  SUBMISSION_RECORDS,
  SUBMISSION_ROWS as ROWS,
  type SubmissionRow,
  type SubmissionStatusKind as StatusKind,
} from './submissionsData'

const STATUS_ICON: Record<StatusKind, string> = {
  error: submissionsError,
  paid: submissionsPaid,
  denied: submissionsRejected,
}

export function SubmissionsWidget({
  hideHeader = false,
  onOpenRecord,
  sortOn = 'id',
  sortDescending = false,
  selectable = false,
  selectedIds,
  onSelectedChange,
  layout = 'table',
}: {
  hideHeader?: boolean
  /** When set, a row opens this handler instead of the shared side drawer. */
  onOpenRecord?: (index: number) => void
  sortOn?: 'id' | 'submitted'
  sortDescending?: boolean
  selectable?: boolean
  /** Controlled selection. When omitted, the widget keeps its own selection. */
  selectedIds?: string[]
  onSelectedChange?: (ids: string[]) => void
  layout?: 'table' | 'cards'
}) {
  const [appealOpen, setAppealOpen] = useState(false)
  const [localSelected, setLocalSelected] = useState<string[]>([])
  const selected = selectedIds ?? localSelected

  function toggleSelected(id: string) {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    if (onSelectedChange) onSelectedChange(next)
    else setLocalSelected(next)
  }
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  const records = SUBMISSION_RECORDS
  const ordered = ROWS.map((row, index) => ({ row, index }))
  if (sortDescending) ordered.reverse()

  function openRecord(index: number) {
    if (onOpenRecord) {
      onOpenRecord(index)
      return
    }
    openSide('submissions', 'Submissions', records[index], records)
  }

  return (
    <section
      className={[
        'submissions-widget',
        isOpen || hideHeader ? '' : 'claim-widget--collapsed',
        layout === 'cards' ? 'submissions-widget--cards' : '',
      ]
        .filter(Boolean)
        .join(' ')}
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

      {showBody && layout === 'cards' ? (
        <div id={contentId} className="submission-cards">
          {ordered.map(({ row, index }) => (
            <RecordCard
              key={`${row.id}-${row.created}-${index}`}
              title={row.id}
              label={`submission ${records[index]}`}
              open={recordIsOpen(view, 'submissions', records[index])}
              selected={selected.includes(row.id)}
              selectable={selectable}
              onOpen={() => openRecord(index)}
              onToggleSelected={() => toggleSelected(row.id)}
              action={{ label: 'Appeal', onClick: () => setAppealOpen(true) }}
              facts={submissionFacts(row)}
            />
          ))}
        </div>
      ) : null}
      {showBody && layout === 'table' ? (
      <div id={contentId} className="submissions-widget__table-wrap">
        <table className="submissions-widget__table">
          <thead>
            <tr>
              {selectable ? (
                <th className="submissions-widget__th submissions-widget__th--select" scope="col">
                  <span className="visually-hidden">Select</span>
                </th>
              ) : null}
              <th className="submissions-widget__th submissions-widget__th--id" scope="col">
                {sortOn === 'id' ? (
                  <>
                    <span>ID</span>
                    <img src={submissionsSortDown} alt="" width={16} height={16} />
                  </>
                ) : (
                  'ID'
                )}
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
                {sortOn === 'submitted' ? (
                  <img src={submissionsSortDown} alt="" width={16} height={16} />
                ) : null}
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
            {ordered.map(({ row, index }) => (
              <tr
                key={`${row.id}-${row.created}-${index}`}
                className={[
                  'widget-table-row',
                  recordIsOpen(view, 'submissions', records[index]) ? 'widget-table-row--open' : '',
                  selected.includes(row.id) ? 'submissions-widget__row--selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
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
                {selectable ? (
                  <td className="submissions-widget__td submissions-widget__td--select">
                    <button
                      type="button"
                      className={selected.includes(row.id) ? 'vision2-check vision2-check--on' : 'vision2-check'}
                      aria-label={selected.includes(row.id) ? `Deselect submission ${row.id}` : `Select submission ${row.id}`}
                      aria-pressed={selected.includes(row.id)}
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleSelected(row.id)
                      }}
                    />
                  </td>
                ) : null}
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

function submissionFacts(row: SubmissionRow) {
  return [
    { label: 'Created', value: row.created },
    { label: 'Submitted', value: row.submitted },
    {
      label: 'Status',
      children: (
        <span className={`submission-card__status submission-card__status--${row.status}`}>
          <img src={STATUS_ICON[row.status]} alt="" width={16} height={16} />
          {row.statusLabel}
        </span>
      ),
    },
    { label: 'Charges', value: row.charges },
    { label: 'Index', value: row.index === 'primary' ? 'Primary' : 'Secondary' },
    { label: 'Payer', value: row.payer },
    { label: 'Member ID', value: row.memberId },
    { label: 'Type', value: row.formType },
    { label: 'Method', value: row.method },
    { label: 'Submitted by', value: row.submittedBy },
  ]
}
