import { useMemo, useState } from 'react'
import {
  paymentsChevronRight,
  paymentsFilter,
  submissionsSortDown,
  tune,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'

type DocCategory = 'patient' | 'chartNote' | 'medicalFile'

type DocumentationRow = {
  id: string
  name: string
  category: DocCategory
  date: string
  tags: string[]
}

const CATEGORIES: { id: DocCategory; label: string }[] = [
  { id: 'patient', label: 'Patient' },
  { id: 'chartNote', label: 'Chart Note' },
  { id: 'medicalFile', label: 'Medical File' },
]

const CATEGORY_LABEL: Record<DocCategory, string> = {
  patient: 'Patient',
  chartNote: 'Chart Note',
  medicalFile: 'Medical File',
}

const FILE_PREFIX = 'Crawford_Cole_29126'
const NOTE_KINDS = ['Daily_Note', 'Progress_Note', 'Plan_of_Care']

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatDisplayDate(date: Date) {
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`
}

function formatFileDate(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
}

function generateRows(
  category: DocCategory,
  count: number,
  start: Date,
  stepDays: number,
  idPrefix: string,
): DocumentationRow[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() - index * stepDays)
    const kind = NOTE_KINDS[index % NOTE_KINDS.length]
    return {
      id: `${idPrefix}-${index}`,
      name: `${FILE_PREFIX}_${formatFileDate(date)}_${kind}.pdf`,
      category,
      date: formatDisplayDate(date),
      tags: ['EHR Backfill'],
    }
  })
}

/** Synthetic demo documentation — not real PHI/PII. */
const ROWS: DocumentationRow[] = [
  {
    id: 'patient-1',
    name: `${FILE_PREFIX}_20260527_Daily_Note.pdf`,
    category: 'patient',
    date: '10/13/2026',
    tags: ['EHR Backfill'],
  },
  {
    id: 'patient-2',
    name: 'RV Patient Benefits Letter 2026 for Cole Crawford.pdf',
    category: 'patient',
    date: '07/30/2026',
    tags: [],
  },
  {
    id: 'patient-3',
    name: `${FILE_PREFIX}_20260525_Progress_Note.pdf`,
    category: 'patient',
    date: '05/30/2026',
    tags: ['EHR Backfill'],
  },
  {
    id: 'patient-4',
    name: `${FILE_PREFIX}_20260525_Plan_of_Care.pdf`,
    category: 'patient',
    date: '05/30/2026',
    tags: ['EHR Backfill'],
  },
  ...generateRows('patient', 73, new Date(2026, 4, 20), 3, 'patient-gen'),
  ...generateRows('chartNote', 13, new Date(2026, 8, 25), 7, 'chart'),
  {
    id: 'medical-1',
    name: `${FILE_PREFIX}_20260925_Medical_Record.pdf`,
    category: 'medicalFile',
    date: '09/25/2026',
    tags: [],
  },
]

function Icon({
  src,
  size = 20,
  alt = '',
  className = 'icon',
}: {
  src: string
  size?: number
  alt?: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={size}
      height={size}
      draggable={false}
    />
  )
}

function CategoryPill({ category }: { category: DocCategory }) {
  return (
    <span className={`documentation-widget__pill documentation-widget__pill--${category}`}>
      {CATEGORY_LABEL[category]}
    </span>
  )
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 10.5V2.5M8 2.5L5.5 5M8 2.5L10.5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10.5V12.5C3 13.0523 3.44772 13.5 4 13.5H12C12.5523 13.5 13 13.0523 13 12.5V10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DocumentationWidget({
  title = 'Documentation',
  hideHeader = false,
}: {
  title?: string
  hideHeader?: boolean
}) {
  const [openGroups, setOpenGroups] = useState<Set<DocCategory>>(() => new Set(['patient']))
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen

  const groups = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        rows: ROWS.filter((row) => row.category === category.id),
      })).filter((group) => group.rows.length > 0),
    [],
  )
  const records = useMemo(() => ROWS.map((row) => row.name), [])

  function openRecord(name: string) {
    openSide('documentation', title, name, records)
  }

  function toggleGroup(id: DocCategory) {
    setOpenGroups((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section
      className={
        isOpen || hideHeader
          ? 'documentation-widget'
          : 'documentation-widget claim-widget--collapsed'
      }
      {...(hideHeader
        ? { 'aria-label': title }
        : { 'aria-labelledby': 'documentation-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="documentation-widget__title-row">
          <ClaimWidgetTitle
            collapsible={collapsible}
            open={open}
            onToggle={toggle}
            title={title}
            titleId="documentation-widget-title"
            titleClassName="documentation-widget__title"
            controlsId={contentId}
          />
          <WidgetViewButtons
            widgetId="documentation"
            title={title}
            className="documentation-widget__actions"
          />
        </header>
      )}

      {showBody ? (
      <div id={contentId} className="claim-widget__body">
      <div className="documentation-widget__toolbar">
        <div className="documentation-widget__toolbar-actions">
          <button type="button" className="icon-btn" aria-label="Upload document" title="Upload">
            <UploadIcon />
          </button>
          <button type="button" className="icon-btn" aria-label="Documentation settings">
            <Icon src={tune} size={20} />
          </button>
          <button type="button" className="icon-btn" aria-label="Filter documentation">
            <Icon src={paymentsFilter} size={20} />
          </button>
        </div>
      </div>

      <div className="documentation-widget__grid" role="table" aria-label={title}>
        <div className="documentation-widget__row documentation-widget__row--head" role="row">
          <span className="documentation-widget__cell" role="columnheader">Name</span>
          <span className="documentation-widget__cell" role="columnheader">Type</span>
          <span
            className="documentation-widget__cell documentation-widget__cell--sort"
            role="columnheader"
            aria-sort="descending"
          >
            Document Date
            <Icon
              src={submissionsSortDown}
              size={20}
              className="documentation-widget__sort-icon"
            />
          </span>
          <span className="documentation-widget__cell" role="columnheader">Tags</span>
        </div>

        {groups.map((group) => {
          const groupOpen = openGroups.has(group.id)
          return (
            <div key={group.id} className="documentation-widget__group" role="rowgroup">
              <button
                type="button"
                className="documentation-widget__group-header"
                aria-expanded={groupOpen}
                onClick={() => toggleGroup(group.id)}
              >
                <Icon
                  src={paymentsChevronRight}
                  size={20}
                  className={
                    groupOpen
                      ? 'documentation-widget__chevron documentation-widget__chevron--open'
                      : 'documentation-widget__chevron'
                  }
                />
                <CategoryPill category={group.id} />
                <span className="documentation-widget__count">{group.rows.length}</span>
              </button>

              {groupOpen ? (
                <div className="documentation-widget__group-rows">
                  {group.rows.map((row) => (
                    <div
                      key={row.id}
                      className={
                        recordIsOpen(view, 'documentation', row.name)
                          ? 'documentation-widget__row widget-table-row widget-table-row--open'
                          : 'documentation-widget__row widget-table-row'
                      }
                      role="row"
                      tabIndex={0}
                      aria-current={
                        recordIsOpen(view, 'documentation', row.name) ? 'true' : undefined
                      }
                      aria-label={`Open document ${row.name}`}
                      onClick={() => openRecord(row.name)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          openRecord(row.name)
                        }
                      }}
                    >
                      <span
                        className="documentation-widget__cell documentation-widget__cell--name"
                        role="cell"
                        title={row.name}
                      >
                        {row.name}
                      </span>
                      <span className="documentation-widget__cell" role="cell">
                        <CategoryPill category={row.category} />
                      </span>
                      <span className="documentation-widget__cell" role="cell">
                        {row.date}
                      </span>
                      <span className="documentation-widget__cell documentation-widget__tags" role="cell">
                        {row.tags.map((tag) => (
                          <span key={tag} className="documentation-widget__tag">
                            {tag}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
      </div>
      ) : null}
    </section>
  )
}
