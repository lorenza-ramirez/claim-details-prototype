import { useMemo, useState } from 'react'
import {
  paymentsFilter,
  submissionsSortDown,
  tune,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'
import { useWidgetView, WidgetViewButtons } from './widgetView'

type DocCategory = 'all' | 'patient' | 'chartNote' | 'medicalFile' | 'fax'
type FileKind = 'pdf' | 'image' | 'doc'

type DocumentationRow = {
  id: string
  name: string
  kind: FileKind
  category: Exclude<DocCategory, 'all'>
  categoryLabel: string
  uploaded: string
  uploadedBy: string
  size: string
}

/** Synthetic demo documentation — not real PHI/PII. */
const ROWS: DocumentationRow[] = [
  {
    id: 'doc-1',
    name: 'Plan of Care_97161.pdf',
    kind: 'pdf',
    category: 'chartNote',
    categoryLabel: 'Chart Note',
    uploaded: '02/18/2026',
    uploadedBy: 'J. Alvarez',
    size: '248 KB',
  },
  {
    id: 'doc-2',
    name: 'Prior Auth_WC-MEMIC.pdf',
    kind: 'pdf',
    category: 'medicalFile',
    categoryLabel: 'Medical File',
    uploaded: '02/12/2026',
    uploadedBy: 'Remit Bot',
    size: '112 KB',
  },
  {
    id: 'doc-3',
    name: 'Therapy Progress Note_01-25.jpg',
    kind: 'image',
    category: 'chartNote',
    categoryLabel: 'Chart Note',
    uploaded: '01/26/2026',
    uploadedBy: 'M. Chen',
    size: '1.4 MB',
  },
  {
    id: 'doc-4',
    name: 'Appeal Letter_Initial.docx',
    kind: 'doc',
    category: 'fax',
    categoryLabel: 'Fax',
    uploaded: '01/08/2026',
    uploadedBy: 'J. Alvarez',
    size: '64 KB',
  },
  {
    id: 'doc-5',
    name: 'Patient Intake Forms.pdf',
    kind: 'pdf',
    category: 'patient',
    categoryLabel: 'Patient',
    uploaded: '01/10/2026',
    uploadedBy: 'Front Desk',
    size: '96 KB',
  },
]

const FILTERS: { id: DocCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'patient', label: 'Patient' },
  { id: 'chartNote', label: 'Chart Note' },
  { id: 'medicalFile', label: 'Medical File' },
  { id: 'fax', label: 'Fax' },
]

function Icon({
  src,
  size = 20,
  alt = '',
}: {
  src: string
  size?: number
  alt?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className="icon"
      width={size}
      height={size}
      draggable={false}
    />
  )
}

function FileTypeIcon({ kind }: { kind: FileKind }) {
  if (kind === 'pdf') {
    return (
      <span className="documentation-widget__file-icon documentation-widget__file-icon--pdf" aria-hidden>
        PDF
      </span>
    )
  }
  if (kind === 'image') {
    return (
      <span className="documentation-widget__file-icon documentation-widget__file-icon--image" aria-hidden>
        IMG
      </span>
    )
  }
  return (
    <span className="documentation-widget__file-icon documentation-widget__file-icon--doc" aria-hidden>
      DOC
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
  const [filter, setFilter] = useState<DocCategory>('all')
  const { openSide } = useWidgetView()
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen()
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen

  const rows = useMemo(
    () => (filter === 'all' ? ROWS : ROWS.filter((row) => row.category === filter)),
    [filter],
  )
  const records = useMemo(() => rows.map((row) => row.name), [rows])

  function openRecord(name: string) {
    openSide('documentation', title, name, records)
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
        <div className="documentation-widget__tabs" role="tablist" aria-label="Document categories">
          {FILTERS.map((item) => {
            const isActive = filter === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={
                  isActive
                    ? 'documentation-widget__tab documentation-widget__tab--active'
                    : 'documentation-widget__tab'
                }
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            )
          })}
        </div>
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

      <div className="documentation-widget__table-wrap">
        <table className="documentation-widget__table">
          <thead>
            <tr>
              <th className="documentation-widget__th documentation-widget__th--file" scope="col">
                <span>File</span>
                <img src={submissionsSortDown} alt="" width={16} height={16} />
              </th>
              <th className="documentation-widget__th documentation-widget__th--category" scope="col">
                Category
              </th>
              <th
                className="documentation-widget__th documentation-widget__th--date documentation-widget__th--end"
                scope="col"
              >
                Uploaded
              </th>
              <th className="documentation-widget__th documentation-widget__th--by" scope="col">
                Uploaded By
              </th>
              <th
                className="documentation-widget__th documentation-widget__th--size documentation-widget__th--end"
                scope="col"
              >
                Size
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="widget-table-row"
                tabIndex={0}
                role="button"
                aria-label={`Open document ${row.name}`}
                onClick={() => openRecord(row.name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openRecord(row.name)
                  }
                }}
              >
                <td className="documentation-widget__td">
                  <div className="documentation-widget__file-cell">
                    <FileTypeIcon kind={row.kind} />
                    <button
                      type="button"
                      className="documentation-widget__file-name"
                      onClick={(event) => {
                        event.stopPropagation()
                        openRecord(row.name)
                      }}
                    >
                      {row.name}
                    </button>
                  </div>
                </td>
                <td className="documentation-widget__td">{row.categoryLabel}</td>
                <td className="documentation-widget__td documentation-widget__td--end">
                  {row.uploaded}
                </td>
                <td className="documentation-widget__td">{row.uploadedBy}</td>
                <td className="documentation-widget__td documentation-widget__td--end">
                  {row.size}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      ) : null}
    </section>
  )
}
