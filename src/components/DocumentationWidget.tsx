import { useMemo, useState } from 'react'
import { paymentsChevronRight, paymentsFilter, search, submissionsSortDown } from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'

type DocCategory = 'patient' | 'case' | 'chartNote' | 'fax' | 'imaging'

type DocumentationRow = {
  id: string
  name: string
  category: DocCategory
  date: string
  tags: string[]
}

type DocGroup = {
  id: DocCategory
  label: string
  count: number
  rows: DocumentationRow[]
}

/** Synthetic demo attachments — not real PHI/PII. Counts match the grouped list, not only the sample rows. */
const GROUPS: DocGroup[] = [
  {
    id: 'patient',
    label: 'Patient',
    count: 185,
    rows: [
      {
        id: 'procedure',
        name: 'order-PROCEDURE-2026-10-19.pdf',
        category: 'patient',
        date: '10/19/2026',
        tags: ['EHR Order PROCEDURE'],
      },
      {
        id: 'imaging',
        name: 'order-IMAGING-2026-10-19.pdf',
        category: 'patient',
        date: '10/19/2026',
        tags: ['EHR Order IMAGING'],
      },
      {
        id: 'dme',
        name: 'order-DME-2026-10-19.pdf',
        category: 'patient',
        date: '10/19/2026',
        tags: ['EHR Order DME'],
      },
    ],
  },
  { id: 'case', label: 'Case', count: 5, rows: [] },
  { id: 'chartNote', label: 'Chart Note', count: 31, rows: [] },
  { id: 'fax', label: 'Fax', count: 30, rows: [] },
  { id: 'imaging', label: 'Imaging Order', count: 4, rows: [] },
]

const TOTAL = GROUPS.reduce((sum, group) => sum + group.count, 0)

function Icon({
  src,
  size = 20,
  className = 'icon',
}: {
  src: string
  size?: number
  className?: string
}) {
  return <img src={src} alt="" className={className} width={size} height={size} draggable={false} />
}

function CategoryPill({ category, label }: { category: DocCategory; label: string }) {
  return <span className={`documentation-widget__pill documentation-widget__pill--${category}`}>{label}</span>
}

export function DocumentationWidget({
  title = 'Patient Attachments',
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
  const records = useMemo(() => GROUPS.flatMap((group) => group.rows.map((row) => row.name)), [])

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
        isOpen || hideHeader ? 'documentation-widget' : 'documentation-widget claim-widget--collapsed'
      }
      {...(hideHeader ? { 'aria-label': title } : { 'aria-labelledby': 'documentation-widget-title' })}
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
          <span className="documentation-widget__total">{TOTAL}</span>
          <WidgetViewButtons widgetId="documentation" title={title} className="documentation-widget__actions" />
        </header>
      )}

      {showBody ? (
        <div id={contentId} className="claim-widget__body">
          <div className="documentation-widget__heading">
            {hideHeader ? (
              <h3 className="documentation-widget__heading-title">
                Patient Attachments
                <span className="documentation-widget__total">{TOTAL}</span>
              </h3>
            ) : (
              <span />
            )}
            <div className="documentation-widget__toolbar-actions">
              <button type="button" className="icon-btn" aria-label="Search attachments">
                <Icon src={search} size={20} />
              </button>
              <button type="button" className="icon-btn" aria-label="Filter attachments">
                <Icon src={paymentsFilter} size={20} />
              </button>
            </div>
          </div>

          <div className="documentation-widget__grid" role="table" aria-label={title}>
            <div className="documentation-widget__row documentation-widget__row--head" role="row">
              <span className="documentation-widget__cell" role="columnheader">
                Name
              </span>
              <span className="documentation-widget__cell" role="columnheader">
                Type
              </span>
              <span
                className="documentation-widget__cell documentation-widget__cell--sort"
                role="columnheader"
                aria-sort="descending"
              >
                Document Date
                <Icon src={submissionsSortDown} size={16} className="documentation-widget__sort-icon" />
              </span>
              <span className="documentation-widget__cell" role="columnheader">
                Tags
              </span>
            </div>

            {GROUPS.map((group) => {
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
                      size={16}
                      className={
                        groupOpen
                          ? 'documentation-widget__chevron documentation-widget__chevron--open'
                          : 'documentation-widget__chevron'
                      }
                    />
                    <CategoryPill category={group.id} label={group.label} />
                    <span className="documentation-widget__count">{group.count}</span>
                  </button>

                  {groupOpen
                    ? group.rows.map((row) => (
                        <div
                          key={row.id}
                          className={
                            recordIsOpen(view, 'documentation', row.name)
                              ? 'documentation-widget__row widget-table-row widget-table-row--open'
                              : 'documentation-widget__row widget-table-row'
                          }
                          role="row"
                          tabIndex={0}
                          aria-current={recordIsOpen(view, 'documentation', row.name) ? 'true' : undefined}
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
                            <CategoryPill category={row.category} label={group.label} />
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
                      ))
                    : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}
