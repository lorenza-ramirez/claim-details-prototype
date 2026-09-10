import { useState } from 'react'
import { ActivityWidget } from './ActivityWidget'
import { ClaimDetailsWidget } from './ClaimDetailsWidget'
import { ClaimSummary } from './ClaimSummary'
import { DocumentationWidget } from './DocumentationWidget'
import { PaymentsWidget } from './PaymentsWidget'
import { RemittancesWidget } from './RemittancesWidget'
import { SubmissionsWidget } from './SubmissionsWidget'

type V2TabId = 'overview' | 'submissions' | 'remittances' | 'attachments' | 'payments'

const V2_TABS: { id: V2TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'submissions', label: 'Submissions' },
  { id: 'remittances', label: 'Remittances' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'payments', label: 'Payments' },
]

export function ClaimV2Panel() {
  const [activeTab, setActiveTab] = useState<V2TabId>('overview')

  return (
    <div className="claim-v2">
      <div className="claim-v2__tabs" role="tablist" aria-label="Claim sections">
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

      <div className="claim-v2__content" role="tabpanel">
        {activeTab === 'overview' ? (
          <>
            <ClaimSummary />
            <div className="claim-widgets-stack">
              <div className="claim-details-widget-wrap">
                <ClaimDetailsWidget />
              </div>
              <div className="activity-widget-wrap">
                <ActivityWidget />
              </div>
            </div>
          </>
        ) : null}
        {activeTab === 'submissions' ? (
          <div className="submissions-widget-wrap">
            <SubmissionsWidget />
          </div>
        ) : null}
        {activeTab === 'remittances' ? (
          <div className="remittances-widget-wrap">
            <RemittancesWidget />
          </div>
        ) : null}
        {activeTab === 'attachments' ? (
          <div className="documentation-widget-wrap">
            <DocumentationWidget title="Attachments" />
          </div>
        ) : null}
        {activeTab === 'payments' ? (
          <div className="payments-widget-wrap">
            <PaymentsWidget />
          </div>
        ) : null}
      </div>
    </div>
  )
}
