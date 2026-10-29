import { useMemo, useState } from 'react'
import { moreHoriz, paymentsChevronRight, paymentsFilter, search, submissionsSortDown } from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { recordIsOpen, useWidgetView, WidgetViewButtons } from './widgetView'

type DocCategory = 'patient' | 'case' | 'chartNote' | 'fax' | 'imaging'
type DocKind = 'pdf' | 'doc' | 'sheet' | 'note'

type DocumentationRow = {
  id: string
  name: string
  category: DocCategory
  date: string
  tags: string[]
  kind: DocKind
  actor: string
  action: string
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
        kind: 'pdf',
        actor: 'You',
        action: 'opened',
      },
      {
        id: 'imaging',
        name: 'order-IMAGING-2026-10-19.pdf',
        category: 'patient',
        date: '10/19/2026',
        tags: ['EHR Order IMAGING'],
        kind: 'doc',
        actor: 'Athelas',
        action: 'edited',
      },
      {
        id: 'dme',
        name: 'order-DME-2026-10-19.pdf',
        category: 'patient',
        date: '10/19/2026',
        tags: ['EHR Order DME'],
        kind: 'sheet',
        actor: 'Colossus',
        action: 'imported',
      },
      {
        id: 'claim-form',
        name: 'cms-1500-2026-10-19.pdf',
        category: 'patient',
        date: '10/19/2026',
        tags: ['Claim form'],
        kind: 'pdf',
        actor: 'You',
        action: 'opened',
      },
    ],
  },
  {
    id: 'case',
    label: 'Case',
    count: 5,
    rows: [
      {
        id: 'prior-auth',
        name: 'prior-auth-request-2026-10-14.pdf',
        category: 'case',
        date: '10/14/2026',
        tags: ['Prior auth'],
        kind: 'doc',
        actor: 'Athelas',
        action: 'edited',
      },
    ],
  },
  {
    id: 'chartNote',
    label: 'Chart Note',
    count: 31,
    rows: [
      {
        id: 'daily-note',
        name: 'daily-note-2026-10-14.pdf',
        category: 'chartNote',
        date: '10/14/2026',
        tags: ['Chart note'],
        kind: 'note',
        actor: 'You',
        action: 'opened',
      },
    ],
  },
  {
    id: 'fax',
    label: 'Fax',
    count: 30,
    rows: [
      {
        id: 'payer-fax',
        name: 'payer-correspondence-2026-10-12.pdf',
        category: 'fax',
        date: '10/12/2026',
        tags: ['Fax'],
        kind: 'pdf',
        actor: 'Colossus',
        action: 'imported',
      },
    ],
  },
  {
    id: 'imaging',
    label: 'Imaging Order',
    count: 4,
    rows: [
      {
        id: 'lumbar-order',
        name: 'imaging-order-lumbar-2026-10-19.pdf',
        category: 'imaging',
        date: '10/19/2026',
        tags: ['Imaging order'],
        kind: 'sheet',
        actor: 'Athelas',
        action: 'created',
      },
    ],
  },
]

const TOTAL = GROUPS.reduce((sum, group) => sum + group.count, 0)

type GallerySection = 'patient' | 'medical' | 'claim' | 'fax'

const GALLERY_SECTIONS: { id: GallerySection; label: string }[] = [
  { id: 'patient', label: 'Patient' },
  { id: 'medical', label: 'Medical file' },
  { id: 'claim', label: 'Claim' },
  { id: 'fax', label: 'Fax' },
]

const GALLERY_SECTION: Record<string, GallerySection> = {
  procedure: 'patient',
  dme: 'patient',
  imaging: 'medical',
  'daily-note': 'medical',
  'lumbar-order': 'medical',
  'claim-form': 'claim',
  'prior-auth': 'claim',
  'payer-fax': 'fax',
}

export const DOCUMENT_ROWS = GROUPS.flatMap((group) =>
  group.rows.map((row) => ({ ...row, type: group.label })),
)

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
  onOpenRecord,
  selectable = false,
  selectedIds = [],
  onSelectedChange,
  layout = 'table',
  searchQuery = '',
}: {
  title?: string
  hideHeader?: boolean
  /** When set, a row opens this handler instead of the shared side drawer. */
  onOpenRecord?: (index: number) => void
  selectable?: boolean
  selectedIds?: string[]
  onSelectedChange?: (ids: string[]) => void
  layout?: 'table' | 'cards'
  searchQuery?: string
}) {
  const [openGroups, setOpenGroups] = useState<Set<DocCategory>>(() => new Set(['patient']))
  const [galleryOpen, setGalleryOpen] = useState<Set<GallerySection>>(
    () => new Set(['patient', 'medical', 'claim', 'fax']),
  )
  const { view, openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen
  const records = useMemo(() => GROUPS.flatMap((group) => group.rows.map((row) => row.name)), [])

  function openRecord(name: string) {
    if (onOpenRecord) {
      const index = records.indexOf(name)
      if (index >= 0) onOpenRecord(index)
      return
    }
    openSide('documentation', title, name, records)
  }

  function toggleGallery(id: GallerySection) {
    setGalleryOpen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const attachmentQuery = searchQuery.trim().toLowerCase()
  const visibleAttachments = DOCUMENT_ROWS.filter((row) => {
    if (!attachmentQuery) return true
    return (
      row.name.toLowerCase().includes(attachmentQuery) ||
      row.tags.some((tag) => tag.toLowerCase().includes(attachmentQuery))
    )
  })

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
      className={[
        isOpen || hideHeader ? 'documentation-widget' : 'documentation-widget claim-widget--collapsed',
        selectable ? 'documentation-widget--selectable' : '',
        layout === 'cards' ? 'documentation-widget--cards' : '',
      ]
        .filter(Boolean)
        .join(' ')}
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

      {showBody && layout === 'cards' ? (
        <div id={contentId} className="attachment-gallery">
          {attachmentQuery && visibleAttachments.length === 0 ? (
            <p className="attachment-gallery__empty">No attachments match.</p>
          ) : null}
          {GALLERY_SECTIONS.map((section) => {
            const rows = visibleAttachments.filter((row) => (GALLERY_SECTION[row.id] ?? 'patient') === section.id)
            if (attachmentQuery && rows.length === 0) return null
            const expanded = galleryOpen.has(section.id)
            return (
              <section key={section.id} className="attachment-section" aria-label={section.label}>
                <button
                  type="button"
                  className="attachment-section__header"
                  aria-expanded={expanded}
                  onClick={() => toggleGallery(section.id)}
                >
                  <Icon
                    src={paymentsChevronRight}
                    size={16}
                    className={
                      expanded
                        ? 'documentation-widget__chevron documentation-widget__chevron--open'
                        : 'documentation-widget__chevron'
                    }
                  />
                  <span className="attachment-section__label">{section.label}</span>
                  <span className="documentation-widget__count">{rows.length}</span>
                </button>
                {expanded ? (
                  <div className="attachment-cards">
                    {rows.map((row) => (
                      <AttachmentCard
                        key={row.id}
                        row={row}
                        open={recordIsOpen(view, 'documentation', row.name)}
                        onOpen={() => openRecord(row.name)}
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      ) : null}
      {showBody && layout === 'table' ? (
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
              {selectable ? (
                <span className="documentation-widget__cell" role="columnheader">
                  <span className="visually-hidden">Select</span>
                </span>
              ) : null}
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
                          className={[
                            'documentation-widget__row widget-table-row',
                            recordIsOpen(view, 'documentation', row.name) ? 'widget-table-row--open' : '',
                            selectedIds.includes(row.id) ? 'vision2-row--selected' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
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
                          {selectable ? (
                            <span className="documentation-widget__cell" role="cell">
                              <button
                                type="button"
                                className={
                                  selectedIds.includes(row.id) ? 'vision2-check vision2-check--on' : 'vision2-check'
                                }
                                aria-label={
                                  selectedIds.includes(row.id)
                                    ? `Deselect attachment ${row.name}`
                                    : `Select attachment ${row.name}`
                                }
                                aria-pressed={selectedIds.includes(row.id)}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  const next = selectedIds.includes(row.id)
                                    ? selectedIds.filter((item) => item !== row.id)
                                    : [...selectedIds, row.id]
                                  onSelectedChange?.(next)
                                }}
                              />
                            </span>
                          ) : null}
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const ACTOR_COLOR: Record<string, string> = {
  You: '#7b61ff',
  Athelas: '#1a73e8',
  Colossus: '#188038',
}

function shortWhen(date: string) {
  const [month, day] = date.split('/')
  const name = MONTHS[Number(month) - 1]
  if (!name || !day) return date
  return `${name} ${Number(day)}`
}

function AttachmentCard({
  row,
  open,
  onOpen,
}: {
  row: DocumentationRow & { type: string }
  open: boolean
  onOpen: () => void
}) {
  return (
    <div
      className={['attachment-card', open ? 'attachment-card--open' : ''].filter(Boolean).join(' ')}
      role="button"
      tabIndex={0}
      aria-current={open ? 'true' : undefined}
      aria-label={`Open attachment ${row.name}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
    >
      <div className="attachment-card__head">
        <FileGlyph kind={row.kind} />
        <span className="attachment-card__name" title={row.name}>
          {row.name.replace(/\.[^.]+$/, '')}
        </span>
        <button
          type="button"
          className="attachment-card__more"
          aria-label={`More actions for ${row.name}`}
          onClick={(event) => event.stopPropagation()}
        >
          <img src={moreHoriz} alt="" width={18} height={18} />
        </button>
      </div>
      <div className="attachment-card__sheet" aria-hidden>
        <DocPreview kind={row.kind} title={row.name} />
      </div>
      <div className="attachment-card__foot">
        <span
          className="attachment-card__avatar"
          style={{ background: ACTOR_COLOR[row.actor] ?? '#5c5c5c' }}
        >
          {row.actor.slice(0, 1)}
        </span>
        <span className="attachment-card__meta">
          {row.actor} {row.action} · {shortWhen(row.date)}
        </span>
      </div>
    </div>
  )
}

function FileGlyph({ kind }: { kind: DocKind }) {
  const color = kind === 'sheet' ? '#188038' : kind === 'doc' ? '#1a73e8' : kind === 'note' ? '#f9ab00' : '#d93025'
  return (
    <svg className="attachment-card__glyph" width="18" height="18" viewBox="0 0 20 20" aria-hidden>
      <path
        fill={color}
        d="M5.2 1.6h6.1L16.4 6.6V17.2c0 .7-.6 1.2-1.2 1.2H5.2c-.7 0-1.2-.5-1.2-1.2V2.8c0-.7.5-1.2 1.2-1.2Z"
      />
      <path fill="#fff" fillOpacity="0.45" d="M11.2 1.7v4.8h4.9" />
      {kind === 'sheet' ? (
        <path
          fill="none"
          d="M6.4 9.2h7.2M6.4 11.4h7.2M6.4 13.6h7.2M8.8 8.2v6.4M11.4 8.2v6.4"
          stroke="#fff"
          strokeWidth="0.8"
        />
      ) : (
        <path
          fill="none"
          d="M6.3 9.4h7.4M6.3 11.6h7.4M6.3 13.8h4.6"
          stroke="#fff"
          strokeWidth="1"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

function DocPreview({ kind, title }: { kind: DocKind; title: string }) {
  if (kind === 'sheet') {
    return (
      <div className="attachment-preview attachment-preview--sheet">
        {Array.from({ length: 5 }, (_, row) => (
          <div key={row} className="attachment-preview__row">
            {Array.from({ length: 4 }, (_, cell) => (
              <span key={cell} className="attachment-preview__cell" />
            ))}
          </div>
        ))}
      </div>
    )
  }
  if (kind === 'note') {
    return <p className="attachment-preview attachment-preview--zoom">{title.replace(/\.[^.]+$/, '')}</p>
  }
  if (kind === 'doc') {
    return (
      <div className="attachment-preview">
        <span className="attachment-preview__heading" />
        <span className="attachment-preview__line" />
        <span className="attachment-preview__line attachment-preview__line--short" />
        <span className="attachment-preview__bullet" />
        <span className="attachment-preview__bullet" />
        <span className="attachment-preview__bullet attachment-preview__bullet--short" />
      </div>
    )
  }
  return (
    <div className="attachment-preview">
      <span className="attachment-preview__heading" />
      <span className="attachment-preview__line" />
      <span className="attachment-preview__line" />
      <span className="attachment-preview__line attachment-preview__line--short" />
      <span className="attachment-preview__line" />
      <span className="attachment-preview__line attachment-preview__line--mid" />
    </div>
  )
}
