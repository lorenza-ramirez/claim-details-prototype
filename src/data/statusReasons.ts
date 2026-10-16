/** Synthetic demo status reasons — not real PHI/PII. Keyed by the raw claim status in `claims.ts`. */
export type StatusReason = {
  /** Payer or system code that drove the status, when there is one. */
  code?: string
  reason: string
  detail: string
  source: string
  updated: string
}

const FALLBACK: StatusReason = {
  reason: 'No reason recorded',
  detail: 'This status was set without a reason.',
  source: 'System',
  updated: 'Today',
}

export const STATUS_REASONS: Record<string, StatusReason> = {
  'Initial review needed': {
    reason: 'New claim awaiting first review',
    detail:
      'Created from the September 25, 2026 encounter. Coding and eligibility checks have not been run yet.',
    source: 'System',
    updated: 'Today',
  },
  Draft: {
    reason: 'Claim is incomplete',
    detail: 'The referring provider NPI is missing. The claim cannot be submitted until it is added.',
    source: 'Claim scrubber',
    updated: 'Today',
  },
  'Full Denials': {
    code: 'PI-252 · M127',
    reason: 'Documentation required',
    detail:
      'United Medical Resources denied 97110 and 97530 for a missing patient medical record. CO-45 was also applied to 97110 and 97140.',
    source: 'Remittance 10/14/2026',
    updated: '2 days ago',
  },
  'Partial Denial': {
    code: 'CO-45',
    reason: 'Charge exceeds fee schedule',
    detail: '97110 and 97140 were reduced to the contracted rate. The remaining lines were paid.',
    source: 'Remittance 10/14/2026',
    updated: '2 days ago',
  },
  Rejected: {
    code: 'A7:562',
    reason: 'Invalid subscriber ID',
    detail: 'The clearinghouse rejected the claim before it reached the payer.',
    source: 'Clearinghouse 277CA',
    updated: '1 day ago',
  },
  Submitted: {
    reason: 'Awaiting payer adjudication',
    detail: 'Accepted by the payer on September 27, 2026. No remittance has been received yet.',
    source: 'Clearinghouse 277CA',
    updated: '19 days ago',
  },
  Underpaid: {
    code: 'CO-45',
    reason: 'Paid below contracted rate',
    detail: '97530 was paid $42.00 below the expected amount.',
    source: 'Remittance 10/14/2026',
    updated: '2 days ago',
  },
  Paid: {
    reason: 'Paid in full',
    detail: 'All lines were paid at the contracted rate with no patient balance.',
    source: 'Remittance 10/14/2026',
    updated: '2 days ago',
  },
}

export function statusReasonFor(status: string): StatusReason {
  return Object.hasOwn(STATUS_REASONS, status) ? STATUS_REASONS[status] : FALLBACK
}
