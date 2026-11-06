/** Synthetic demo queue — not real PHI/PII. These are the claims that need a person. */

export type AttentionAction = {
  id: string
  label: string
}

export type AttentionLine = {
  code: string
  description: string
  outcome: string
}

export type AttentionClaim = {
  id: string
  title: string
  status: string
  tone: 'critical' | 'warning' | 'info' | 'neutral'
  payer: string
  balance: string
  standing: string
  next: string
  reason: string
  actions: AttentionAction[]
  lines: AttentionLine[]
}

export const ATTENTION_CLAIMS: AttentionClaim[] = [
  {
    id: '22316691',
    title: 'Diagnosis is blocking this denial',
    status: 'Full denial',
    tone: 'critical',
    payer: 'Iowa Blue Shield',
    balance: '$346.00',
    standing:
      'This claim was fully denied. Four therapy lines were billed at $386.00, the October 14 remittance paid nothing, and the $346.00 balance is still open. The payer used CO-16 with remark M76: the diagnosis or condition is missing, incomplete, or invalid.',
    next: 'Correct the diagnosis, then resubmit. The procedure codes are not what the denial is questioning.',
    reason: 'CO-16 · M76 · diagnosis or condition is invalid',
    actions: [
      { id: 'replace-diagnosis', label: 'Replace M54.5 with M54.50' },
      { id: 'remove-diagnosis', label: 'Remove the diagnosis' },
    ],
    lines: [
      { code: '97110', description: 'Therapeutic exercise', outcome: 'Denied' },
      { code: '97112', description: 'Neuromuscular re-education', outcome: 'Denied' },
      { code: '97140', description: 'Manual therapy', outcome: 'Denied' },
      { code: '97161', description: 'Physical therapy evaluation', outcome: 'Denied' },
    ],
  },
  {
    id: '22316702',
    title: 'Resubmission is ready to send',
    status: 'Partial denial',
    tone: 'warning',
    payer: 'United Medical Resources',
    balance: '$486.00',
    standing:
      'Lines 97110 and 97530 were denied under PI-252 with remark M127, which asks for the patient medical record. A record was already attached on September 25, and a prepared resubmission passed the clearinghouse check on October 16.',
    next: 'Send the prepared resubmission. The attached record is what this denial asked for.',
    reason: 'PI-252 · M127 · medical record was missing',
    actions: [{ id: 'send-resubmission', label: 'Send prepared resubmission' }],
    lines: [
      { code: '97110', description: 'Therapeutic exercise', outcome: 'Denied' },
      { code: '97530', description: 'Therapeutic activities', outcome: 'Denied' },
      { code: '97140', description: 'Manual therapy', outcome: 'Paid' },
    ],
  },
  {
    id: '22316756',
    title: 'Two diagnosis codes conflict',
    status: 'Submission error',
    tone: 'neutral',
    payer: 'Aetna',
    balance: '$2,975.00',
    standing:
      'The clearinghouse rejected this claim before the payer saw it. M54.50 and M54.42 were billed together, and ICD-10 Excludes1 says those codes cannot be on the same claim.',
    next: 'Drop the code that does not belong, then submit again. Nothing has been adjudicated yet.',
    reason: 'Excludes1 · M54.50 and M54.42 cannot be billed together',
    actions: [{ id: 'remove-conflict', label: 'Remove M54.42 and resubmit' }],
    lines: [
      { code: '97110', description: 'Therapeutic exercise', outcome: 'Not sent' },
      { code: '97140', description: 'Manual therapy', outcome: 'Not sent' },
    ],
  },
  {
    id: '22316715',
    title: 'Payer is waiting on a bill',
    status: 'Records requested',
    tone: 'info',
    payer: 'Cigna',
    balance: '$1,980.00',
    standing:
      'Cigna has the claim and will not decide it until an itemized bill is attached. The request has been open, and the balance stays untouched until the document goes out.',
    next: 'Attach the itemized bill. No coding change is suggested.',
    reason: 'Itemized bill requested',
    actions: [{ id: 'attach-bill', label: 'Attach itemized bill' }],
    lines: [
      { code: '97110', description: 'Therapeutic exercise', outcome: 'Pending' },
      { code: '97161', description: 'Physical therapy evaluation', outcome: 'Pending' },
    ],
  },
]
