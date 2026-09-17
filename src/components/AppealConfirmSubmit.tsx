import { useState, type ReactNode } from 'react'
import appealAdd from '../assets/figma/appeal-add.svg'
import appealRadioSelected from '../assets/figma/appeal-radio-selected.svg'
import appealRadioUnselected from '../assets/figma/appeal-radio-unselected.svg'
import { keyboardArrowDown, keyboardArrowUp, widgetArrowDown } from '../assets/icons'
import { AppealPdfBar, AppealPreviewTabs } from './AppealPreviewChrome'

export type AppealSendChannel = 'fax' | 'mail' | 'download'

type ConfirmPreviewTab = 'summary' | 'package'

const CONFIRM_PREVIEW_TABS: { id: ConfirmPreviewTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'package', label: 'Package' },
]

export const APPEAL_SEND_ACTION_LABEL: Record<AppealSendChannel, string> = {
  fax: 'Send by fax',
  mail: 'Send by mail',
  download: 'Download packet',
}

type PacketAction = 'edit' | 'view' | 'remove'
type PacketKind = 'pdf' | 'doc'

type PacketDocument = {
  id: string
  name: string
  kind: PacketKind
  pages: number
  action: PacketAction
}

/** Synthetic prototype packet — no real PHI/PII. */
const INITIAL_PACKET: PacketDocument[] = [
  { id: 'cover', name: 'Cover letter', kind: 'doc', pages: 1, action: 'edit' },
  { id: 'payer-form', name: 'BCBSAZ Provider Appeal Form', kind: 'pdf', pages: 2, action: 'edit' },
  { id: 'cms', name: 'CMS-1500 (claim form)', kind: 'pdf', pages: 2, action: 'view' },
  { id: 'eob', name: 'EOB / Remit 08/18/2026', kind: 'pdf', pages: 1, action: 'view' },
  { id: 'note', name: 'Daily Note 07-09-2026.mdx', kind: 'doc', pages: 3, action: 'remove' },
  { id: 'auth', name: 'Auth Approval AUTH-88213.pdf', kind: 'pdf', pages: 2, action: 'remove' },
]

const ACTION_LABEL: Record<PacketAction, string> = {
  edit: 'Edit',
  view: 'View',
  remove: 'Remove',
}

const SEND_OPTIONS: { id: AppealSendChannel; label: string; detail: string }[] = [
  { id: 'fax', label: 'Fax', detail: "(602) 555-0199 · transmitted to the payer's appeal fax" },
  {
    id: 'mail',
    label: 'Mail sent by Athelas',
    detail: 'BCBSAZ Appeals, PO Box 13466, Phoenix, AZ 85002 · ~$1.05',
  },
  {
    id: 'download',
    label: 'Download — I send it myself',
    detail: 'Nothing is confirmed by Athelas · $0',
  },
]

function PacketFileIcon({ kind }: { kind: PacketKind }) {
  return (
    <span
      className={`documentation-widget__file-icon documentation-widget__file-icon--${kind}`}
      aria-hidden
    >
      {kind === 'pdf' ? 'PDF' : 'DOC'}
    </span>
  )
}

function PacketContentsWidget({
  packet,
  onMove,
  onRemove,
  onAdd,
}: {
  packet: PacketDocument[]
  onMove: (index: number, direction: -1 | 1) => void
  onRemove: (id: string) => void
  onAdd: () => void
}) {
  const [open, setOpen] = useState(true)
  const pageCount = packet.reduce((sum, document) => sum + document.pages, 0)

  return (
    <section
      className={open ? 'appeal-docs' : 'appeal-docs appeal-docs--collapsed'}
      aria-labelledby="appeal-packet-title"
    >
      <header className="appeal-docs__title-row">
        <button
          type="button"
          className="appeal-docs__toggle"
          aria-expanded={open}
          aria-controls="appeal-packet-body"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="appeal-submission__title-btn">
            <h3 id="appeal-packet-title">Packet contents</h3>
            <img
              src={widgetArrowDown}
              alt=""
              width={20}
              height={20}
              className={
                open
                  ? 'appeal-submission__chevron appeal-submission__chevron--up'
                  : 'appeal-submission__chevron'
              }
            />
          </span>
          <span className="appeal-docs__count">
            {packet.length} documents · {pageCount} pages
          </span>
        </button>
      </header>

      {open ? (
        <div id="appeal-packet-body" className="appeal-docs__body">
          <div className="appeal-docs__table-wrap">
            <table className="appeal-docs__table appeal-confirm__table">
              <thead>
                <tr>
                  <th className="appeal-docs__th appeal-confirm__th--order" scope="col">
                    #
                  </th>
                  <th className="appeal-docs__th appeal-docs__th--file" scope="col">
                    File
                  </th>
                  <th className="appeal-docs__th appeal-docs__th--end" scope="col">
                    Pages
                  </th>
                  <th className="appeal-docs__th appeal-docs__th--by" scope="col">
                    Order
                  </th>
                  <th className="appeal-docs__th appeal-docs__th--end" scope="col">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {packet.map((document, index) => (
                  <tr key={document.id}>
                    <td className="appeal-docs__td appeal-confirm__td--order">{index + 1}</td>
                    <td className="appeal-docs__td">
                      <div className="documentation-widget__file-cell">
                        <PacketFileIcon kind={document.kind} />
                        <span className="documentation-widget__file-name">{document.name}</span>
                      </div>
                    </td>
                    <td className="appeal-docs__td appeal-docs__td--end">{document.pages} pg</td>
                    <td className="appeal-docs__td">
                      <span className="appeal-confirm__move-group">
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Move ${document.name} up`}
                          title="Move up"
                          disabled={index === 0}
                          onClick={() => onMove(index, -1)}
                        >
                          <img src={keyboardArrowUp} alt="" width={20} height={20} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          aria-label={`Move ${document.name} down`}
                          title="Move down"
                          disabled={index === packet.length - 1}
                          onClick={() => onMove(index, 1)}
                        >
                          <img src={keyboardArrowDown} alt="" width={20} height={20} />
                        </button>
                      </span>
                    </td>
                    <td className="appeal-docs__td appeal-docs__td--end">
                      <button
                        type="button"
                        className="btn btn--tertiary appeal-confirm__row-action"
                        onClick={() => {
                          if (document.action === 'remove') onRemove(document.id)
                        }}
                      >
                        {ACTION_LABEL[document.action]}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="appeal-confirm__add">
            <button type="button" className="btn btn--accent-outline" onClick={onAdd}>
              <img src={appealAdd} alt="" width={14} height={14} />
              Add document
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function SendViaWidget({
  channel,
  onChannelChange,
}: {
  channel: AppealSendChannel
  onChannelChange: (channel: AppealSendChannel) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <section
      className={open ? 'appeal-submission' : 'appeal-submission appeal-submission--collapsed'}
      aria-labelledby="appeal-send-via-title"
    >
      <header className="appeal-submission__title-row">
        <button
          type="button"
          className="appeal-submission__title-btn"
          aria-expanded={open}
          aria-controls="appeal-send-via-body"
          onClick={() => setOpen((value) => !value)}
        >
          <h3 id="appeal-send-via-title">Send via</h3>
          <img
            src={widgetArrowDown}
            alt=""
            width={20}
            height={20}
            className={
              open
                ? 'appeal-submission__chevron appeal-submission__chevron--up'
                : 'appeal-submission__chevron'
            }
          />
        </button>
      </header>

      {open ? (
        <div
          id="appeal-send-via-body"
          className="appeal-submission__body appeal-confirm__send-options"
          role="radiogroup"
          aria-label="Send via"
        >
          {SEND_OPTIONS.map((option) => {
            const checked = channel === option.id
            return (
              <label key={option.id} className="appeal-submission__radio">
                <input
                  type="radio"
                  name="appeal-send-via"
                  value={option.id}
                  checked={checked}
                  onChange={() => onChannelChange(option.id)}
                />
                <img
                  src={checked ? appealRadioSelected : appealRadioUnselected}
                  alt=""
                  width={28}
                  height={28}
                />
                <span>
                  {option.label}
                  <span className="appeal-confirm__radio-detail">{option.detail}</span>
                </span>
              </label>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

function SummaryField({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="claim-details-split__field">
      <span className="claim-details-split__label">{label}</span>
      <span className="claim-details-split__value">
        <span className="claim-details-split__value-text">{value}</span>
        {note ? <span className="appeal-confirm__summary-note">{note}</span> : null}
      </span>
    </div>
  )
}

function SummarySubsection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div className="claim-details-split__subsection">
      <div className="claim-details-split__subsection-header">
        <button
          type="button"
          className="claim-details-split__subsection-toggle"
          aria-expanded={open}
          onClick={onToggle}
        >
          <img
            src={widgetArrowDown}
            alt=""
            width={20}
            height={20}
            className={
              open
                ? 'icon claim-details-split__chevron claim-details-split__chevron--open'
                : 'icon claim-details-split__chevron'
            }
          />
          <span>{title}</span>
        </button>
      </div>
      {open ? <div className="claim-details-split__block">{children}</div> : null}
    </div>
  )
}

function AppealSummaryPanel({
  channel,
  packet,
  pageCount,
}: {
  channel: AppealSendChannel
  packet: PacketDocument[]
  pageCount: number
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    submission: true,
    dispute: true,
    prompts: true,
    delivery: true,
  })

  const sectionKeys = ['submission', 'dispute', 'prompts', 'delivery'] as const
  const allExpanded = sectionKeys.every((key) => openSections[key])
  const selectedOption = SEND_OPTIONS.find((option) => option.id === channel)

  function toggle(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }))
  }

  function toggleAll() {
    const next = !allExpanded
    setOpenSections(() => Object.fromEntries(sectionKeys.map((key) => [key, next])))
  }

  return (
    <div className="claim-details-split appeal-confirm__summary">
      <section className="claim-details-split__section">
        <div className="claim-details-split__section-header">
          <h3 className="claim-details-split__section-title">Appeal Summary</h3>
          <button type="button" className="claim-details-split__expand-all" onClick={toggleAll}>
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <SummarySubsection
          title="Submission"
          open={openSections.submission}
          onToggle={() => toggle('submission')}
        >
          <div className="claim-details-split__grid">
            <div className="claim-details-split__col">
              <SummaryField label="Payer" value="BCBS Arizona" />
              <SummaryField label="Payer Index" value="Primary" />
              <SummaryField label="Submission" value="SUB-9077110" />
            </div>
            <div className="claim-details-split__col">
              <SummaryField label="Type" value="Appeal · level 1" />
              <SummaryField label="Reference" value="APL-22169811–1" />
              <SummaryField label="Deadline" value="11/16/2026" note="69 days left" />
            </div>
          </div>
        </SummarySubsection>

        <SummarySubsection
          title="What you are appealing"
          open={openSections.dispute}
          onToggle={() => toggle('dispute')}
        >
          <div className="claim-details-split__grid">
            <div className="claim-details-split__col">
              <SummaryField label="Disputing" value="$279.23" />
              <SummaryField label="Procedures" value="97110, 97140" />
            </div>
            <div className="claim-details-split__col">
              <SummaryField label="Denial type" value="Medical necessity, Prior authorization" />
              <SummaryField label="Ops tickets" value="Wrong payer form reported" />
            </div>
          </div>
        </SummarySubsection>

        <SummarySubsection
          title="Prompts"
          open={openSections.prompts}
          onToggle={() => toggle('prompts')}
        >
          <div className="claim-details-split__grid">
            <div className="claim-details-split__col">
              <SummaryField
                label="Medical necessity"
                value="Medical necessity v3"
                note="Athelas default"
              />
            </div>
            <div className="claim-details-split__col">
              <SummaryField
                label="Prior authorization"
                value="Prior authorization v2"
                note="Athelas default"
              />
            </div>
          </div>
        </SummarySubsection>

        <SummarySubsection
          title="Delivery"
          open={openSections.delivery}
          onToggle={() => toggle('delivery')}
        >
          <div className="claim-details-split__grid">
            <div className="claim-details-split__col">
              <SummaryField label="Sending via" value={selectedOption?.label ?? '—'} />
              <SummaryField label="Destination" value={selectedOption?.detail ?? '—'} />
            </div>
            <div className="claim-details-split__col">
              <SummaryField label="Documents" value={`${packet.length} documents`} />
              <SummaryField label="Pages" value={`${pageCount} pages`} />
            </div>
          </div>
        </SummarySubsection>
      </section>
    </div>
  )
}

function PackagePaper({ packet }: { packet: PacketDocument[] }) {
  const ranges = packet.reduce<{ id: string; name: string; start: number; end: number }[]>(
    (rows, document) => {
      const start = (rows.at(-1)?.end ?? 0) + 1
      rows.push({
        id: document.id,
        name: document.name,
        start,
        end: start + document.pages - 1,
      })
      return rows
    },
    [],
  )

  return (
    <div className="payer-form__paper appeal-confirm__paper">
      <header className="appeal-confirm__paper-header">
        <h3>Appeal package</h3>
        <p>BCBS Arizona · Appeal level 1 · SUB-9077110</p>
      </header>
      <dl className="appeal-confirm__paper-rows">
        {ranges.map((row) => (
          <div key={row.id} className="appeal-confirm__paper-row">
            <dt>{row.start === row.end ? `Page ${row.start}` : `Pages ${row.start}–${row.end}`}</dt>
            <dd>{row.name}</dd>
          </div>
        ))}
      </dl>
      <footer>Mail: BCBSAZ Appeals, PO Box 13466, Phoenix, AZ 85002</footer>
    </div>
  )
}

export function AppealConfirmSubmit({
  channel,
  onChannelChange,
}: {
  channel: AppealSendChannel
  onChannelChange: (channel: AppealSendChannel) => void
}) {
  const [packet, setPacket] = useState(INITIAL_PACKET)
  const [activePreview, setActivePreview] = useState<ConfirmPreviewTab>('summary')
  const [addedCount, setAddedCount] = useState(0)

  const pageCount = packet.reduce((sum, document) => sum + document.pages, 0)

  function moveDocument(index: number, direction: -1 | 1) {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= packet.length) return
    setPacket((current) => {
      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(nextIndex, 0, item)
      return next
    })
  }

  function addDocument() {
    const next = addedCount + 1
    setAddedCount(next)
    setPacket((current) => [
      ...current,
      {
        id: `added-${next}`,
        name: `Supporting document ${next}.pdf`,
        kind: 'pdf',
        pages: 1,
        action: 'remove',
      },
    ])
  }

  return (
    <div className="appeal-confirm">
      <div className="appeal-general appeal-confirm__controls">
        <PacketContentsWidget
          packet={packet}
          onMove={moveDocument}
          onRemove={(id) => setPacket((current) => current.filter((item) => item.id !== id))}
          onAdd={addDocument}
        />
        <SendViaWidget channel={channel} onChannelChange={onChannelChange} />
      </div>

      <section className="appeal-confirm__preview" aria-label="Appeal package preview">
        <AppealPreviewTabs
          value={activePreview}
          onChange={setActivePreview}
          tabs={CONFIRM_PREVIEW_TABS}
        />
        {activePreview === 'package' ? <AppealPdfBar pageCount={pageCount} /> : null}
        <div
          id={`appeal-preview-panel-${activePreview}`}
          className={
            activePreview === 'package'
              ? 'appeal-cover__preview-content'
              : 'appeal-cover__preview-content appeal-cover__preview-content--flush'
          }
          role="tabpanel"
          aria-labelledby={`appeal-preview-tab-${activePreview}`}
        >
          {activePreview === 'package' ? (
            <PackagePaper packet={packet} />
          ) : (
            <AppealSummaryPanel channel={channel} packet={packet} pageCount={pageCount} />
          )}
        </div>
      </section>
    </div>
  )
}
