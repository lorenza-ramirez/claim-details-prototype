import { useState } from 'react'
import {
  keyboardArrowDown,
  paymentsFilter,
  propsChipClose,
  propsHealth,
  propsPerson,
  propsStageProgress,
  propsStatusWarning,
  submissionsError,
  submissionsPaid,
  viewMenu,
} from '../assets/icons'

/** Synthetic demo queue — not real PHI/PII. */
const FILTERS = [
  { id: 'patient', icon: propsPerson, field: 'Patient', value: 'Cole Crawford' },
  { id: 'insurance', icon: propsHealth, field: 'Insurance (Primary)', value: 'UNITED HEALTHCARE' },
]

type SimilarClaim = {
  id: string
  provider: string
  dateOfService: string
  assignee: string
}

type SimilarGroup = {
  id: string
  label: string
  icon: string
  amount: string
  count: number
  claims: SimilarClaim[]
}

const GROUPS: SimilarGroup[] = [
  {
    id: 'errors',
    label: 'Submission Errors',
    icon: submissionsError,
    amount: '$7,816.58',
    count: 2,
    claims: [
      { id: '22316802', provider: 'Nicholas Grimoskas', dateOfService: '04/29/2026', assignee: 'W' },
      { id: '22316815', provider: 'Nicholas Grimoskas', dateOfService: '03/10/2026', assignee: 'W' },
    ],
  },
  {
    id: 'review',
    label: 'Needs Initial Review',
    icon: propsStatusWarning,
    amount: '$3,954.82',
    count: 14,
    claims: [],
  },
  {
    id: 'clear',
    label: 'No Action Needed',
    icon: submissionsPaid,
    amount: '$3,604.16',
    count: 27,
    claims: [],
  },
]

export function SimilarClaimsWidget() {
  const [filters, setFilters] = useState(FILTERS)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ errors: true })
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const visibleIds = GROUPS.flatMap((group) => (openGroups[group.id] ? group.claims.map((claim) => claim.id) : []))
  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => checked[id])

  function toggleGroup(id: string) {
    setOpenGroups((current) => ({ ...current, [id]: !current[id] }))
  }

  function toggleAll(next: boolean) {
    setChecked((current) => {
      const updated = { ...current }
      for (const id of visibleIds) updated[id] = next
      return updated
    })
  }

  return (
    <div className="similar-claims">
      <div className="similar-claims__toolbar">
        <button type="button" className="btn btn--secondary similar-claims__tool">
          <img src={paymentsFilter} alt="" width={16} height={16} />
          Filter
        </button>
        <button type="button" className="btn btn--secondary similar-claims__tool similar-claims__display">
          <img src={viewMenu} alt="" width={16} height={16} />
          Display
          <span className="similar-claims__display-dot" aria-hidden />
        </button>
      </div>

      {filters.length > 0 ? (
        <div className="similar-claims__filters">
          {filters.map((filter) => (
            <div key={filter.id} className="similar-claims__chip">
              <span className="similar-claims__chip-field">
                <img src={filter.icon} alt="" width={16} height={16} />
                {filter.field}
              </span>
              <span className="similar-claims__chip-op">
                includes any of
                <img src={keyboardArrowDown} alt="" width={16} height={16} />
              </span>
              <span className="similar-claims__chip-value">
                {filter.value}
                <img src={keyboardArrowDown} alt="" width={16} height={16} />
              </span>
              <button
                type="button"
                className="similar-claims__chip-remove"
                aria-label={`Remove ${filter.field} filter`}
                onClick={() => setFilters((current) => current.filter((item) => item.id !== filter.id))}
              >
                <img src={propsChipClose} alt="" width={16} height={16} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="similar-claims__table-wrap">
        <table className="similar-claims__table">
          <thead>
            <tr>
              <th className="similar-claims__th similar-claims__th--check" scope="col">
                <input
                  type="checkbox"
                  className="similar-claims__check"
                  aria-label="Select all visible claims"
                  checked={allChecked}
                  onChange={(event) => toggleAll(event.target.checked)}
                />
              </th>
              <th className="similar-claims__th" scope="col">Claim ID</th>
              <th className="similar-claims__th" scope="col">Status</th>
              <th className="similar-claims__th" scope="col">Stage</th>
              <th className="similar-claims__th" scope="col">Provider</th>
              <th className="similar-claims__th" scope="col">Date of Service</th>
              <th className="similar-claims__th" scope="col">Assignee</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => {
              const open = Boolean(openGroups[group.id])
              return (
                <GroupRows
                  key={group.id}
                  group={group}
                  open={open}
                  checked={checked}
                  onToggle={() => toggleGroup(group.id)}
                  onCheck={(id, next) => setChecked((current) => ({ ...current, [id]: next }))}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GroupRows({
  group,
  open,
  checked,
  onToggle,
  onCheck,
}: {
  group: SimilarGroup
  open: boolean
  checked: Record<string, boolean>
  onToggle: () => void
  onCheck: (id: string, next: boolean) => void
}) {
  return (
    <>
      <tr className="similar-claims__group">
        <td className="similar-claims__td similar-claims__td--check">
          <input type="checkbox" className="similar-claims__check" aria-label={`Select ${group.label}`} disabled />
        </td>
        <td className="similar-claims__td" colSpan={6}>
          <button
            type="button"
            className="similar-claims__group-toggle"
            aria-expanded={open}
            onClick={onToggle}
          >
            <img
              src={keyboardArrowDown}
              alt=""
              width={18}
              height={18}
              className={open ? 'similar-claims__chevron similar-claims__chevron--open' : 'similar-claims__chevron'}
            />
            <img src={group.icon} alt="" width={16} height={16} />
            <span className="similar-claims__group-label">{group.label}</span>
            <span className="similar-claims__group-meta">
              {group.amount}
              <span aria-hidden> | </span>
              {group.count}
            </span>
          </button>
        </td>
      </tr>
      {open
        ? group.claims.map((claim) => (
            <tr key={claim.id} className="similar-claims__row">
              <td className="similar-claims__td similar-claims__td--check">
                <input
                  type="checkbox"
                  className="similar-claims__check"
                  aria-label={`Select claim ${claim.id}`}
                  checked={Boolean(checked[claim.id])}
                  onChange={(event) => onCheck(claim.id, event.target.checked)}
                />
              </td>
              <td className="similar-claims__td">{claim.id}</td>
              <td className="similar-claims__td">
                <span className="similar-claims__status">
                  <img src={group.icon} alt="" width={16} height={16} />
                  {group.label}
                </span>
              </td>
              <td className="similar-claims__td">
                <span className="properties-badge properties-badge--icon properties-badge--stage">
                  <img src={propsStageProgress} alt="" width={16} height={16} />
                  Payer 1
                </span>
              </td>
              <td className="similar-claims__td">{claim.provider}</td>
              <td className="similar-claims__td">{claim.dateOfService}</td>
              <td className="similar-claims__td">
                <span className="similar-claims__avatar" aria-label={`Assignee ${claim.assignee}`}>
                  {claim.assignee}
                </span>
              </td>
            </tr>
          ))
        : null}
    </>
  )
}
