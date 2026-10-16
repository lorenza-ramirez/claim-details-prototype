export type SubmissionStatusKind = 'error' | 'paid' | 'denied'
export type SubmissionIndexKind = 'primary' | 'secondary'

export type SubmissionRow = {
  id: string
  created: string
  submitted: string
  status: SubmissionStatusKind
  statusLabel: string
  charges: string
  index: SubmissionIndexKind
  payer: string
  memberId: string
  type: string
  method: string
  submissionId: string
  formType: string
  submittedBy: string
}

/** Synthetic demo submissions — not real PHI/PII. */
export const SUBMISSION_ROWS: SubmissionRow[] = [
  {
    id: '70304059',
    created: '09/26/2026',
    submitted: '09/26/2026',
    status: 'denied',
    statusLabel: 'Denied',
    charges: '$205.00',
    index: 'primary',
    payer: 'UNITED MEDICAL RESOURCES',
    memberId: '17949634',
    type: 'Initial',
    method: 'Waystar',
    submissionId: '70304059',
    formType: 'CMS',
    submittedBy: 'Unknown',
  },
]

export const SUBMISSION_RECORDS = SUBMISSION_ROWS.map((row) => `${row.id} · ${row.created}`)
