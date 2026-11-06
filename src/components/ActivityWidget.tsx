import type { ReactNode } from 'react'
import {
  activityAppointment,
  activityAttach,
  activityMic,
  appealInfo,
  propsBlock,
  propsStage,
  propsStageProgress,
  sendPanel,
  submissionsRejected,
} from '../assets/icons'
import { ClaimWidgetTitle, useClaimWidgetOpen } from './ClaimWidgetCollapse'

type Adornment =
  | { kind: 'icon'; src: string }
  | { kind: 'avatar'; src: string; alt: string }
  | { kind: 'initial'; letter: string; tone: 'blue' }

type ActivityLine = {
  id: string
  summary: string
  adornment?: Adornment
  body?: ReactNode
  time: string
  viewMore?: boolean
  last?: boolean
  note?: { initials: string; tone: 'lilac' | 'navy'; name: string; message: string }
  children?: { id: string; body: ReactNode }[]
}

function Pill({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <span className="activity-widget__pill">
      <img src={icon} alt="" width={14} height={14} />
      {children}
    </span>
  )
}

/** Synthetic demo activity — not real PHI/PII. */
const ITEMS: ActivityLine[] = [
  {
    id: 'appointment',
    summary: 'Appointment occurred, 3 weeks ago',
    adornment: { kind: 'icon', src: activityAppointment },
    time: '3 weeks ago',
    body: (
      <>
        <span className="activity-widget__strong">Appointment</span> occurred
      </>
    ),
  },
  {
    id: 'record-attached',
    summary: 'Medical record attached to claim, 3 weeks ago',
    adornment: { kind: 'icon', src: activityAttach },
    time: '3 weeks ago',
    body: (
      <>
        <span className="activity-widget__strong">Medical record</span> attached to claim
      </>
    ),
  },
  {
    id: 'stage',
    summary: 'Claim stage set to Payer 1, 3 weeks ago',
    adornment: { kind: 'icon', src: propsStage },
    time: '3 weeks ago',
    body: (
      <>
        Claim stage set to <Pill icon={propsStageProgress}>Payer 1</Pill>
      </>
    ),
  },
  {
    id: 'submitted',
    summary: 'Claim submitted for $205.00 to primary insurance UNITED MEDICAL RESOURCES, 20 days ago',
    adornment: { kind: 'icon', src: sendPanel },
    time: '20 days ago',
    viewMore: true,
    body: (
      <>
        Claim submitted for <span className="activity-widget__strong">$205.00</span> to primary
        insurance UNITED MEDICAL RESOURCES
      </>
    ),
  },
  {
    id: 'remit',
    summary: 'United Medical Resources remittance received: $0.00 paid, 2 days ago',
    adornment: { kind: 'icon', src: submissionsRejected },
    time: '2 days ago',
    viewMore: true,
    body: (
      <>
        <span className="activity-widget__strong">United Medical Resources</span> remittance
        received: <span className="activity-widget__strong">$0.00</span> paid (PI-252, CO-45)
      </>
    ),
  },
  {
    id: 'status',
    summary: 'Claim status set to Full Denials, 2 days ago',
    adornment: { kind: 'icon', src: propsBlock },
    time: '2 days ago',
    body: (
      <>
        Claim status set to <Pill icon={propsBlock}>Full Denials</Pill>
      </>
    ),
  },
  {
    id: 'note-tameka',
    summary: 'Tameka Jeffery noted the medical record was attached on 9/25, 2 days ago',
    time: '2 days ago',
    note: {
      initials: 'TJ',
      tone: 'lilac',
      name: 'Tameka Jeffery',
      message: 'Payer says the medical record is missing, but it was attached on 9/25. Preparing a resubmission.',
    },
  },
  {
    id: 'note-tawsif',
    summary: 'Tawsif Kaisar acknowledged the update, 1 day ago',
    time: '1 day ago',
    note: {
      initials: 'TK',
      tone: 'navy',
      name: 'Tawsif Kaisar',
      message: 'Acknowledged. Thanks for the update.',
    },
  },
  {
    id: 'resubmission',
    summary: 'A resubmission was prepared today, and the 10/16/2026 clearinghouse check passed',
    adornment: { kind: 'icon', src: appealInfo },
    time: 'Today',
    last: true,
    body: (
      <>
        <span className="activity-widget__strong">Lorenza Ramirez</span> prepared a resubmission
      </>
    ),
    children: [
      {
        id: 'resubmission-check',
        body: (
          <>
            <span className="activity-widget__strong">10/16/2026</span> clearinghouse check passed ·
            not yet sent
          </>
        ),
      },
    ],
  },
]

export function activitySummary(id: string) {
  return ITEMS.find((item) => item.id === id)?.summary ?? id
}

function AdornmentNode({ adornment }: { adornment: Adornment }) {
  if (adornment.kind === 'icon') {
    return <img src={adornment.src} alt="" width={16} height={16} className="activity-widget__icon" />
  }
  if (adornment.kind === 'avatar') {
    return (
      <span className="activity-widget__avatar">
        <img src={adornment.src} alt={adornment.alt} width={20} height={20} />
      </span>
    )
  }
  return (
    <span className="activity-widget__avatar activity-widget__avatar--blue" aria-hidden>
      {adornment.letter}
    </span>
  )
}

function Meta({ time, viewMore }: { time: string; viewMore?: boolean }) {
  return (
    <span className="activity-widget__meta">
      <span className="activity-widget__dot" aria-hidden>
        •
      </span>
      <span>{time}</span>
      {viewMore ? (
        <>
          <span className="activity-widget__dot" aria-hidden>
            •
          </span>
          <button type="button" className="activity-widget__link">
            View more
          </button>
        </>
      ) : null}
    </span>
  )
}

export function ActivityWidget({
  hideHeader = false,
  defaultOpen = true,
  selectable = false,
  selectedIds = [],
  onSelectedChange,
}: {
  hideHeader?: boolean
  defaultOpen?: boolean
  selectable?: boolean
  selectedIds?: string[]
  onSelectedChange?: (ids: string[]) => void
}) {
  const { open, contentId, toggle, collapsible } = useClaimWidgetOpen(defaultOpen)
  const isOpen = !collapsible || open
  const showBody = hideHeader || isOpen

  return (
    <section
      className={
        isOpen || hideHeader
          ? 'activity-widget'
          : 'activity-widget claim-widget--collapsed'
      }
      {...(hideHeader
        ? { 'aria-label': 'Activity' }
        : { 'aria-labelledby': 'activity-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="activity-widget__title-row">
          <ClaimWidgetTitle
            collapsible={collapsible}
            open={open}
            onToggle={toggle}
            title="Activity"
            titleId="activity-widget-title"
            titleClassName="activity-widget__title"
            controlsId={contentId}
          />
        </header>
      )}

      {showBody ? (
      <div id={contentId} className="activity-widget__body">
        <ol className="activity-widget__list">
          {ITEMS.map((item) => (
            <li
              key={item.id}
              className={[
                'activity-widget__item',
                item.last ? 'activity-widget__item--last' : '',
                selectedIds.includes(item.id) ? 'vision2-row--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {selectable ? (
                <button
                  type="button"
                  className={selectedIds.includes(item.id) ? 'vision2-check vision2-check--on' : 'vision2-check'}
                  aria-label={
                    selectedIds.includes(item.id)
                      ? `Deselect activity ${item.summary}`
                      : `Select activity ${item.summary}`
                  }
                  aria-pressed={selectedIds.includes(item.id)}
                  onClick={() => {
                    const next = selectedIds.includes(item.id)
                      ? selectedIds.filter((id) => id !== item.id)
                      : [...selectedIds, item.id]
                    onSelectedChange?.(next)
                  }}
                />
              ) : null}
              <div className="activity-widget__rail" aria-hidden>
                {item.adornment ? <AdornmentNode adornment={item.adornment} /> : null}
                {!item.last ? (
                  <span
                    className={
                      item.note
                        ? 'activity-widget__connector activity-widget__connector--full'
                        : 'activity-widget__connector'
                    }
                  />
                ) : null}
              </div>
              <div className="activity-widget__content">
                {item.note ? (
                  <div className="activity-widget__note">
                    <span
                      className={`activity-widget__avatar activity-widget__avatar--${item.note.tone}`}
                      aria-hidden
                    >
                      {item.note.initials}
                    </span>
                    <div className="activity-widget__note-body">
                      <p className="activity-widget__line">
                        <span className="activity-widget__strong">{item.note.name}</span>
                        <Meta time={item.time} />
                      </p>
                      <p className="activity-widget__note-message">{item.note.message}</p>
                    </div>
                  </div>
                ) : (
                  <p className="activity-widget__line">
                    {item.body}
                    <Meta time={item.time} viewMore={item.viewMore} />
                  </p>
                )}
                {item.children ? (
                  <ul className="activity-widget__children">
                    {item.children.map((child) => (
                      <li key={child.id} className="activity-widget__detail">
                        <p className="activity-widget__line activity-widget__line--child">{child.body}</p>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>

        <div className="activity-widget__comment">
          <p className="activity-widget__comment-placeholder">Leave a comment...</p>
          <div className="activity-widget__comment-actions">
            <button type="button" className="activity-widget__attach" aria-label="Attach file">
              <img src={activityAttach} alt="" width={18} height={18} />
            </button>
            <button type="button" className="activity-widget__dictate" aria-label="Dictate">
              <img src={activityMic} alt="" width={18} height={18} />
            </button>
          </div>
        </div>
      </div>
      ) : null}
    </section>
  )
}
