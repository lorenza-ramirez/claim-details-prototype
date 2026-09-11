import type { ReactNode } from 'react'
import {
  activityAppointment,
  activityArrow,
  activityAthelas,
  activityAttach,
  activityBullseye,
  activityCheck,
  activityMic,
  activityMinus,
  activityPlus,
} from '../assets/icons'
import { WidgetViewButtons } from './widgetView'

type Adornment =
  | { kind: 'icon'; src: string }
  | { kind: 'avatar'; src: string; alt: string }
  | { kind: 'initial'; letter: string; tone: 'blue' }

type ActivityLine = {
  id: string
  adornment: Adornment
  body: ReactNode
  viewMore?: boolean
  last?: boolean
  children?: { id: string; icon: string; body: ReactNode }[]
}

/** Synthetic demo activity — not real PHI/PII. */
const ITEMS: ActivityLine[] = [
  {
    id: '1',
    adornment: { kind: 'icon', src: activityAppointment },
    body: (
      <>
        <span className="activity-widget__strong">Appointment</span> occurred
      </>
    ),
  },
  {
    id: '2',
    adornment: { kind: 'avatar', src: activityAthelas, alt: 'Athelas' },
    body: (
      <>
        <span className="activity-widget__strong">Athelas</span> created this claim
      </>
    ),
    viewMore: true,
  },
  {
    id: '3',
    adornment: { kind: 'icon', src: activityBullseye },
    body: (
      <>
        Claim marked <span className="activity-widget__strong">not ready to submit</span>
      </>
    ),
  },
  {
    id: '4',
    adornment: { kind: 'avatar', src: activityAthelas, alt: 'Athelas' },
    body: (
      <>
        <span className="activity-widget__strong">Athelas</span> updated this claims status to ⚠️{' '}
        <span className="activity-widget__strong">Unsupported by CHC</span> ⤵️{' '}
        <span className="activity-widget__strong">Payer 1</span>
      </>
    ),
  },
  {
    id: '5',
    adornment: { kind: 'icon', src: activityArrow },
    body: (
      <>
        Claim ownership <span className="activity-widget__strong">set to Athelas</span>
      </>
    ),
  },
  {
    id: '6',
    adornment: { kind: 'icon', src: activityArrow },
    body: (
      <>
        Claim set to ✏️ <span className="activity-widget__strong">Needs Initial Review</span>
      </>
    ),
  },
  {
    id: '7',
    adornment: { kind: 'avatar', src: activityAthelas, alt: 'Athelas' },
    body: (
      <>
        <span className="activity-widget__strong">Athelas</span> added procedure{' '}
        <span className="activity-widget__strong">1234543</span>
      </>
    ),
    viewMore: true,
  },
  {
    id: '8',
    adornment: { kind: 'avatar', src: activityAthelas, alt: 'Athelas' },
    body: (
      <>
        <span className="activity-widget__strong">Athelas</span> updated this claims status to ⚠️{' '}
        <span className="activity-widget__strong">Initial Review Required</span> ⤵️{' '}
        <span className="activity-widget__strong">Payer 1</span>
      </>
    ),
  },
  {
    id: '9',
    adornment: { kind: 'initial', letter: 'V', tone: 'blue' },
    body: (
      <>
        <span className="activity-widget__strong">Victor Vang</span> edited this claim
      </>
    ),
    viewMore: true,
    children: [
      {
        id: '9a',
        icon: activityPlus,
        body: <>Additional Claim Information set to&nbsp;-</>,
      },
      {
        id: '9b',
        icon: activityMinus,
        body: (
          <>
            Removed diagnosis codes: <span className="activity-widget__strong">M25.561</span>
          </>
        ),
      },
      {
        id: '9c',
        icon: activityPlus,
        body: (
          <>
            Added diagnosis codes:&nbsp;
            <span className="activity-widget__strong">M25.511</span>
          </>
        ),
      },
    ],
  },
  {
    id: '10',
    adornment: { kind: 'avatar', src: activityAthelas, alt: 'Athelas' },
    body: (
      <>
        <span className="activity-widget__strong">Athelas</span> added procedure{' '}
        <span className="activity-widget__strong">1234543</span>
      </>
    ),
    viewMore: true,
  },
  {
    id: '11',
    adornment: { kind: 'initial', letter: 'V', tone: 'blue' },
    body: (
      <>
        <span className="activity-widget__strong">Victor Vang</span> edited this claim
      </>
    ),
    viewMore: true,
  },
  {
    id: '12',
    adornment: { kind: 'icon', src: activityCheck },
    body: (
      <>
        Claim marked <span className="activity-widget__strong">ready to submit</span>
      </>
    ),
  },
  {
    id: '13',
    adornment: { kind: 'icon', src: activityBullseye },
    body: (
      <>
        Claim marked <span className="activity-widget__strong">not ready to submit</span>
      </>
    ),
    last: true,
  },
]

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

function Meta({ viewMore }: { viewMore?: boolean }) {
  return (
    <span className="activity-widget__meta">
      <span className="activity-widget__dot" aria-hidden>
        •
      </span>
      <span>3 months ago</span>
      {viewMore ? (
        <>
          <span className="activity-widget__dot" aria-hidden>
            •
          </span>
          <button type="button" className="activity-widget__link">
            View More
          </button>
        </>
      ) : null}
    </span>
  )
}

export function ActivityWidget({ hideHeader = false }: { hideHeader?: boolean }) {
  return (
    <section
      className="activity-widget"
      {...(hideHeader
        ? { 'aria-label': 'Activity' }
        : { 'aria-labelledby': 'activity-widget-title' })}
    >
      {hideHeader ? null : (
        <header className="activity-widget__title-row">
          <h3 id="activity-widget-title" className="activity-widget__title">
            Activity
          </h3>
          <WidgetViewButtons
            widgetId="activity"
            title="Activity"
            className="activity-widget__actions"
          />
        </header>
      )}

      <div className="activity-widget__body">
        <ol className="activity-widget__list">
          {ITEMS.map((item) => (
            <li
              key={item.id}
              className={
                item.last
                  ? 'activity-widget__item activity-widget__item--last'
                  : 'activity-widget__item'
              }
            >
              <div className="activity-widget__rail" aria-hidden>
                <AdornmentNode adornment={item.adornment} />
                {!item.last ? <span className="activity-widget__connector" /> : null}
              </div>
              <div className="activity-widget__content">
                <p className="activity-widget__line">
                  {item.body}
                  <Meta viewMore={item.viewMore} />
                </p>
                {item.children ? (
                  <ul className="activity-widget__children">
                    {item.children.map((child, index) => (
                      <li key={child.id} className="activity-widget__child">
                        <div className="activity-widget__rail activity-widget__rail--child" aria-hidden>
                          <img
                            src={child.icon}
                            alt=""
                            width={16}
                            height={16}
                            className="activity-widget__icon"
                          />
                          {index < item.children!.length - 1 ? (
                            <span className="activity-widget__connector" />
                          ) : null}
                        </div>
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
    </section>
  )
}
