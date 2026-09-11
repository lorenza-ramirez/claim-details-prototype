import { useState } from 'react'
import { ActivityWidget } from './ActivityWidget'
import { ClaimDetailsWidget } from './ClaimDetailsWidget'
import { ClaimSummary } from './ClaimSummary'
import { DocumentationWidget } from './DocumentationWidget'
import { PaymentsWidget } from './PaymentsWidget'
import { RemittancesWidget } from './RemittancesWidget'
import { ReviewWidget } from './ReviewWidget'
import { SubmissionsWidget } from './SubmissionsWidget'
import { WidgetViewButtons, type WidgetViewId } from './widgetView'

type V2TabId =
  | 'review'
  | 'activity'
  | 'submissions'
  | 'remittances'
  | 'attachments'
  | 'payments'

const V2_TABS: { id: V2TabId; label: string }[] = [
  { id: 'review', label: 'Review' },
  { id: 'activity', label: 'Activity' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'remittances', label: 'Remittances' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'payments', label: 'Payments' },
]

const TAB_VIEW: Partial<Record<V2TabId, { widgetId: WidgetViewId; title: string }>> = {
  review: { widgetId: 'review', title: 'Review' },
  activity: { widgetId: 'activity', title: 'Activity' },
  submissions: { widgetId: 'submissions', title: 'Submissions' },
  remittances: { widgetId: 'remittances', title: 'Remittances' },
  attachments: { widgetId: 'documentation', title: 'Attachments' },
  payments: { widgetId: 'payments', title: 'Payments' },
}

export function ClaimV2Panel() {
  const [activeTab, setActiveTab] = useState<V2TabId>('review')
  const activeView = TAB_VIEW[activeTab]

  return (
    <div className="claim-v2">
      <ClaimSummary />

      <div className="claim-v2__details">
        <div className="claim-details-widget-wrap">
          <ClaimDetailsWidget />
        </div>
      </div>

      <div className="claim-v2__tabs">
        <div className="claim-v2__tab-list" role="tablist" aria-label="Claim sections">
          {V2_TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={isActive ? 'claim-v2__tab claim-v2__tab--active' : 'claim-v2__tab'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        {activeView ? (
          <WidgetViewButtons
            widgetId={activeView.widgetId}
            title={activeView.title}
            className="claim-v2__tab-actions"
          />
        ) : null}
      </div>

      <div className="claim-v2__content" role="tabpanel">
        {activeTab === 'review' ? (
          <div className="review-widget-wrap">
            <ReviewWidget hideHeader />
          </div>
        ) : null}
        {activeTab === 'activity' ? (
          <div className="activity-widget-wrap">
            <ActivityWidget hideHeader />
          </div>
        ) : null}
        {activeTab === 'submissions' ? (
          <div className="submissions-widget-wrap">
            <SubmissionsWidget hideHeader />
          </div>
        ) : null}
        {activeTab === 'remittances' ? (
          <div className="remittances-widget-wrap">
            <RemittancesWidget hideHeader />
          </div>
        ) : null}
        {activeTab === 'attachments' ? (
          <div className="documentation-widget-wrap">
            <DocumentationWidget title="Attachments" hideHeader />
          </div>
        ) : null}
        {activeTab === 'payments' ? (
          <div className="payments-widget-wrap">
            <PaymentsWidget hideHeader />
          </div>
        ) : null}
      </div>
    </div>
  )
}
