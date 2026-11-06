import { useMemo, useState } from 'react'
import appealDelete from '../assets/figma/appeal-delete.svg'
import appealEdit from '../assets/figma/appeal-edit.svg'
import appealRadioSelected from '../assets/figma/appeal-radio-selected.svg'
import appealRadioUnselected from '../assets/figma/appeal-radio-unselected.svg'
import { keyboardArrowDown, keyboardArrowUp, submissionsSortDown } from '../assets/icons'
import { AppealCoverLetterPage } from './AppealCoverLetter'
import { FormPreview } from './AppealPayerForm'
import { AppealPdfBar } from './AppealPreviewChrome'
import { AppealWidget } from './AppealWidget'

export type AppealDeliveryMethod = 'download' | 'email' | 'paper' | 'fax' | 'portal'

export const APPEAL_DELIVERY_ACTION_LABEL: Record<AppealDeliveryMethod, string> = {
  download: 'Download Package',
  email: 'Send Email',
  paper: 'Send by Paper Mail',
  fax: 'Send Fax',
  portal: 'Send',
}

const DELIVERY_OPTIONS: { id: AppealDeliveryMethod; label: string }[] = [
  { id: 'download', label: 'Download' },
  { id: 'email', label: 'Email' },
  { id: 'paper', label: 'Paper Mail' },
  { id: 'fax', label: 'Fax' },
  { id: 'portal', label: 'Uploaded to payer portal' },
]

type PacketDocument = {
  id: string
  name: string
  pages: number
}

const INITIAL_PACKET: PacketDocument[] = [
  { id: 'cover', name: 'Cover Letter', pages: 1 },
  { id: 'payer-form', name: 'Payer Form', pages: 1 },
  { id: 'doc-1', name: 'Doc 1', pages: 3 },
  { id: 'doc-2', name: 'Doc 2', pages: 4 },
  { id: 'doc-3', name: 'Doc 3', pages: 2 },
]

const SUMMARY_COLUMNS = [
  [
    ['ID', '9077110'],
    ['Created', '1/10/2026'],
    ['Member ID', 'BQ60358Y'],
    ['Payer', 'Aetna'],
    ['Payer Index', 'Primary'],
    ['Appeal Deadline', '10/20/2026 (42 days left)'],
    ['Type', 'Full appeal packet (Letter, form, documents)'],
  ],
  [
    ['Status', 'Denied'],
    ['Submitted', '1/10/2026'],
    ['Type', 'Initial'],
    ['Payer Form', 'Form required · mapped'],
    ['Denial type', 'Medical necessity, Prior authorization'],
    ['Appeal Destination', 'Payer portal / CHC, Fax, Mail sent by Athelas'],
  ],
] as const

function DeliveryWidget({
  method,
  onMethodChange,
}: {
  method: AppealDeliveryMethod
  onMethodChange: (method: AppealDeliveryMethod) => void
}) {
  return (
    <AppealWidget
      id="appeal-confirm-send"
      title="Send"
      titleId="appeal-confirm-send-title"
      bodyClassName="appeal-confirm-v2__widget-body"
    >
      <div className="appeal-confirm-v2__delivery-options" role="radiogroup" aria-label="Send">
        {DELIVERY_OPTIONS.map((option) => {
          const checked = method === option.id
          return (
            <label key={option.id} className="appeal-confirm-v2__delivery-option">
              <input
                type="radio"
                name="appeal-delivery-method"
                value={option.id}
                checked={checked}
                onChange={() => onMethodChange(option.id)}
              />
              <img
                src={checked ? appealRadioSelected : appealRadioUnselected}
                alt=""
                width={20}
                height={20}
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>

      {method === 'email' ? (
        <div className="appeal-confirm-v2__destination">
          <p>Destination</p>
          <input
            className="appeal-confirm-v2__field appeal-confirm-v2__field--half"
            type="email"
            aria-label="Email Address"
            placeholder="Email Address"
          />
        </div>
      ) : null}

      {method === 'fax' ? (
        <div className="appeal-confirm-v2__destination">
          <p>Destination</p>
          <input
            className="appeal-confirm-v2__field appeal-confirm-v2__field--half"
            type="tel"
            aria-label="Fax Number"
            placeholder="Fax Number"
          />
        </div>
      ) : null}

      {method === 'paper' ? (
        <div className="appeal-confirm-v2__destination">
          <p>Destination</p>
          <div className="appeal-confirm-v2__address-grid">
            {['Address 1', 'Address 2', 'City', 'State', 'Zipcode'].map((label) => (
              <input
                key={label}
                className="appeal-confirm-v2__field"
                type="text"
                aria-label={label}
                placeholder={label}
              />
            ))}
          </div>
        </div>
      ) : null}
    </AppealWidget>
  )
}

function SummaryWidget() {
  return (
    <AppealWidget
      id="appeal-confirm-summary"
      title="Summary"
      titleId="appeal-confirm-summary-title"
      bodyClassName="appeal-confirm-v2__widget-body"
    >
      <div className="appeal-confirm-v2__summary-grid">
        {SUMMARY_COLUMNS.map((column, index) => (
          <div key={index} className="appeal-confirm-v2__summary-column">
            {column.map(([label, value]) => (
              <div key={`${label}-${value}`} className="appeal-confirm-v2__summary-field">
                <span>{label}</span>
                <strong title={value}>{value}</strong>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AppealWidget>
  )
}

function PacketFileIcon() {
  return (
    <span className="documentation-widget__file-icon documentation-widget__file-icon--pdf">
      PDF
    </span>
  )
}

function PacketDocumentPage({
  document,
  pageInDocument,
}: {
  document: PacketDocument
  pageInDocument: number
}) {
  return (
    <article
      className="appeal-confirm-v2__doc-page"
      aria-label={`${document.name} page ${pageInDocument} of ${document.pages}`}
    >
      <header>
        <PacketFileIcon />
        <div>
          <h3>{document.name}</h3>
          <p>
            Page {pageInDocument} of {document.pages}
          </p>
        </div>
      </header>
      <p>
        Synthetic prototype preview. This enclosure is included in the appeal package in the order
        shown in the Content list.
      </p>
    </article>
  )
}

function ContentWidget({
  packet,
  onMove,
  onRemove,
}: {
  packet: PacketDocument[]
  onMove: (index: number, direction: -1 | 1) => void
  onRemove: (id: string) => void
}) {
  return (
    <AppealWidget
      id="appeal-confirm-content"
      title="Content"
      titleId="appeal-confirm-content-title"
      bodyClassName="appeal-confirm-v2__widget-body"
    >
      <div className="appeal-confirm-v2__table-wrap">
        <table className="appeal-confirm-v2__table">
          <thead>
            <tr>
              <th scope="col">
                <span>File</span>
                <img src={submissionsSortDown} alt="" width={16} height={16} />
              </th>
              <th scope="col">Pages</th>
              <th scope="col" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {packet.map((document, index) => (
              <tr key={document.id}>
                <td>
                  <span className="appeal-confirm-v2__file">
                    <PacketFileIcon />
                    <button type="button">{document.name}</button>
                  </span>
                </td>
                <td>{document.pages}</td>
                <td>
                  <span className="appeal-confirm-v2__row-actions">
                    <button type="button" aria-label={`Edit ${document.name}`}>
                      <img src={appealEdit} alt="" width={18} height={18} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${document.name}`}
                      onClick={() => onRemove(document.id)}
                    >
                      <img src={appealDelete} alt="" width={18} height={18} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${document.name} up`}
                      disabled={index === 0}
                      onClick={() => onMove(index, -1)}
                    >
                      <img src={keyboardArrowUp} alt="" width={18} height={18} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${document.name} down`}
                      disabled={index === packet.length - 1}
                      onClick={() => onMove(index, 1)}
                    >
                      <img src={keyboardArrowDown} alt="" width={18} height={18} />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppealWidget>
  )
}

export function AppealConfirmSubmitRedesign({
  method,
  onMethodChange,
}: {
  method: AppealDeliveryMethod
  onMethodChange: (method: AppealDeliveryMethod) => void
}) {
  const [packet, setPacket] = useState(INITIAL_PACKET)
  const [previewPage, setPreviewPage] = useState(1)

  // One entry per printed page, in packet order, so the pager mirrors the Content list.
  const pages = useMemo(
    () =>
      packet.flatMap((document) =>
        Array.from({ length: document.pages }, (_, index) => ({
          document,
          pageInDocument: index + 1,
        })),
      ),
    [packet],
  )

  const pageCount = pages.length
  const currentPage = Math.min(previewPage, Math.max(pageCount, 1))
  const current = pages[currentPage - 1]

  function moveDocument(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= packet.length) return
    setPacket((current) => {
      const next = [...current]
      const [document] = next.splice(index, 1)
      next.splice(nextIndex, 0, document)
      return next
    })
  }

  return (
    <div className="appeal-confirm-v2">
      <div className="appeal-general appeal-confirm-v2__controls">
        <DeliveryWidget method={method} onMethodChange={onMethodChange} />
        <SummaryWidget />
        <ContentWidget
          packet={packet}
          onMove={moveDocument}
          onRemove={(id) => setPacket((current) => current.filter((item) => item.id !== id))}
        />
      </div>

      <section className="appeal-confirm-v2__preview" aria-label="Appeal package preview">
        <AppealPdfBar pageCount={pageCount} page={currentPage} onPageChange={setPreviewPage} />
        <div className="appeal-confirm-v2__preview-canvas">
          {current ? (
            current.document.id === 'cover' ? (
              <AppealCoverLetterPage />
            ) : current.document.id === 'payer-form' ? (
              <FormPreview />
            ) : (
              <PacketDocumentPage
                document={current.document}
                pageInDocument={current.pageInDocument}
              />
            )
          ) : (
            <p className="appeal-confirm-v2__preview-empty">
              The package is empty. Add content to preview the appeal package.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
