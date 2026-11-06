import { propsBlock } from '../assets/icons'
import { statusReasonFor } from '../data/statusReasons'
import { claimTypeForStatus } from './claimLayouts'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'

export function StatusReasonWidget({
  status,
  defaultOpen = false,
}: {
  status: string
  defaultOpen?: boolean
}) {
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen(defaultOpen)
  const isOpen = !collapsible || open
  const reason = statusReasonFor(status)
  const isDenial = claimTypeForStatus(status) === 'denials'

  return (
    <section
      className={isOpen ? 'status-reason-widget' : 'status-reason-widget claim-widget--collapsed'}
      aria-labelledby="status-reason-widget-title"
    >
      <header className="status-reason-widget__title-row">
        <ClaimWidgetTitle
          collapsible={collapsible}
          open={open}
          onToggle={toggle}
          title="Status reason"
          titleId="status-reason-widget-title"
          titleClassName="status-reason-widget__title"
          controlsId={contentId}
        />
      </header>

      {isOpen ? (
        <div id={contentId} className="status-reason-widget__body">
          <div className="status-reason-widget__status">
            {isDenial ? (
              <span className="properties-badge properties-badge--icon properties-badge--strong">
                <img src={propsBlock} alt="" width={16} height={16} />
                {status}
              </span>
            ) : (
              <span className="properties-badge properties-badge--strong">{status}</span>
            )}
            {reason.code ? <span className="status-reason-widget__code">{reason.code}</span> : null}
          </div>
          <p className="status-reason-widget__reason">{reason.reason}</p>
          <p className="status-reason-widget__detail">{reason.detail}</p>
          <p className="status-reason-widget__meta">
            {reason.source}
            <span aria-hidden> • </span>
            {reason.updated}
          </p>
        </div>
      ) : null}
    </section>
  )
}
