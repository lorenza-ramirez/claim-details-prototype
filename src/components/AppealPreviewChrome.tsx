import { useState } from 'react'
import pdfArrowDown from '../assets/figma/pdf-arrow-down.svg'
import pdfDownload from '../assets/figma/pdf-download.svg'
import pdfMoreVert from '../assets/figma/pdf-more-vert.svg'
import pdfPrint from '../assets/figma/pdf-print.svg'
import pdfZoomDropdown from '../assets/figma/pdf-zoom-dropdown.svg'
import pdfZoomIn from '../assets/figma/pdf-zoom-in.svg'
import pdfZoomOut from '../assets/figma/pdf-zoom-out.svg'

export type AppealPreviewTab = 'package' | 'claim' | 'documentation'

const PREVIEW_TABS: { id: AppealPreviewTab; label: string }[] = [
  { id: 'package', label: 'Package' },
  { id: 'claim', label: 'Claim Details' },
  { id: 'documentation', label: 'Documentation' },
]

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200]

export function AppealPreviewTabs<T extends string>({
  value,
  onChange,
  tabs,
}: {
  value: T
  onChange: (tab: T) => void
  tabs?: { id: T; label: string }[]
}) {
  const items = tabs ?? (PREVIEW_TABS as unknown as { id: T; label: string }[])

  return (
    <div className="appeal-cover__preview-tabs" role="tablist" aria-label="Appeal preview">
      {items.map((tab) => {
        const selected = value === tab.id
        return (
          <button
            key={tab.id}
            id={`appeal-preview-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`appeal-preview-panel-${tab.id}`}
            className={
              selected
                ? 'appeal-cover__preview-tab appeal-cover__preview-tab--active'
                : 'appeal-cover__preview-tab'
            }
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function AppealPdfBar({ pageCount = 2 }: { pageCount?: number }) {
  const [page, setPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  function stepZoom(delta: number) {
    const index = ZOOM_LEVELS.indexOf(zoom)
    const next = ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, Math.max(0, index + delta))]
    setZoom(next ?? 100)
  }

  return (
    <div className="appeal-pdf-bar" aria-label="PDF viewer">
      <div className="appeal-pdf-bar__group">
        <button
          type="button"
          className="icon-btn icon-btn--outlined"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          <img src={pdfArrowDown} alt="" width={20} height={20} className="appeal-pdf-bar__page-prev" />
        </button>
        <span className="appeal-pdf-bar__pages">
          {page} of {pageCount}
        </span>
        <button
          type="button"
          className="icon-btn icon-btn--outlined"
          aria-label="Next page"
          disabled={page >= pageCount}
          onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
        >
          <img src={pdfArrowDown} alt="" width={20} height={20} />
        </button>
      </div>

      <div className="appeal-pdf-bar__group appeal-pdf-bar__group--zoom">
        <button
          type="button"
          className="icon-btn"
          aria-label="Zoom out"
          disabled={zoom <= ZOOM_LEVELS[0]}
          onClick={() => stepZoom(-1)}
        >
          <img src={pdfZoomOut} alt="" width={20} height={20} />
        </button>
        <label className="appeal-pdf-bar__zoom">
          <span className="visually-hidden">Zoom</span>
          <select
            value={zoom}
            aria-label="Zoom level"
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            {ZOOM_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}%
              </option>
            ))}
          </select>
          <img src={pdfZoomDropdown} alt="" width={20} height={20} />
        </label>
        <button
          type="button"
          className="icon-btn"
          aria-label="Zoom in"
          disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
          onClick={() => stepZoom(1)}
        >
          <img src={pdfZoomIn} alt="" width={20} height={20} />
        </button>
      </div>

      <div className="appeal-pdf-bar__group appeal-pdf-bar__group--end">
        <button type="button" className="icon-btn" aria-label="Download" title="Download">
          <img src={pdfDownload} alt="" width={20} height={20} />
        </button>
        <button type="button" className="icon-btn" aria-label="Print" title="Print">
          <img src={pdfPrint} alt="" width={20} height={20} />
        </button>
        <button type="button" className="icon-btn" aria-label="More actions" title="More">
          <img src={pdfMoreVert} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  )
}
