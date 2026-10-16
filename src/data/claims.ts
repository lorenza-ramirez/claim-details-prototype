/** Synthetic demo work queue — not real PHI/PII. Each claim reuses the same demo content. */
export type ClaimQueueItem = {
  id: string
  /** Raw claim status; grouped into layout claim types in `claimLayouts.ts`. */
  status: string
}

export const CLAIM_QUEUE: ClaimQueueItem[] = [
  { id: '22316715', status: 'Pending' },
  { id: '22316728', status: 'Draft' },
  { id: '22316691', status: 'Full Denials' },
  { id: '22316702', status: 'Partial Denial' },
  { id: '22316756', status: 'Rejected' },
  { id: '22316733', status: 'Submitted' },
  { id: '22316741', status: 'Underpaid' },
  { id: '22316760', status: 'Paid' },
]
