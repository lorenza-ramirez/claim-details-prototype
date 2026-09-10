/** Synthetic demo data only — not real PHI/PII. */

export type ClaimStatus = 'Denied' | 'Submitted' | 'Paid' | 'Pending'

export interface ProcedureLine {
  line: number
  cpt: string
  description: string
  units: number
  charged: number
  allowed: number
  paid: number
  adjustment: number
  status: ClaimStatus
}

export interface TimelineEvent {
  id: string
  at: string
  actor: string
  label: string
  detail: string
}

export interface MockClaim {
  claimId: string
  encounterId: string
  status: ClaimStatus
  stage: string
  assignee: string
  dateOfService: string
  submittedAt: string
  patient: {
    name: string
    dob: string
    memberId: string
    address: string
  }
  primaryPayer: {
    name: string
    plan: string
    groupNumber: string
  }
  provider: {
    name: string
    npi: string
    taxonomy: string
    facility: string
  }
  diagnoses: { code: string; description: string }[]
  procedures: ProcedureLine[]
  financials: {
    charged: number
    allowed: number
    paid: number
    patientResponsibility: number
    balance: number
  }
  denial?: {
    code: string
    reason: string
    nextStep: string
  }
  timeline: TimelineEvent[]
}

export const mockClaim: MockClaim = {
  claimId: 'CLM-1048293',
  encounterId: 'ENC-582014',
  status: 'Denied',
  stage: 'Denial review',
  assignee: 'Alex Rivera',
  dateOfService: '2026-02-18',
  submittedAt: '2026-02-20',
  patient: {
    name: 'Jordan Avery',
    dob: '1987-06-14',
    memberId: 'MBR-X9K2-4410',
    address: '4800 Demo Lane, Austin, TX 78701',
  },
  primaryPayer: {
    name: 'Northstar Health Plan',
    plan: 'PPO Gold',
    groupNumber: 'GRP-77821',
  },
  provider: {
    name: 'Dr. Sam Okonkwo, MD',
    npi: '1999999999',
    taxonomy: '207Q00000X',
    facility: 'Lakeview Family Clinic',
  },
  diagnoses: [
    { code: 'M54.5', description: 'Low back pain' },
    { code: 'R51.9', description: 'Headache, unspecified' },
  ],
  procedures: [
    {
      line: 1,
      cpt: '99214',
      description: 'Office visit, established, moderate',
      units: 1,
      charged: 245,
      allowed: 180,
      paid: 0,
      adjustment: 65,
      status: 'Denied',
    },
    {
      line: 2,
      cpt: '97110',
      description: 'Therapeutic exercises, 15 min',
      units: 2,
      charged: 160,
      allowed: 120,
      paid: 0,
      adjustment: 40,
      status: 'Denied',
    },
  ],
  financials: {
    charged: 405,
    allowed: 300,
    paid: 0,
    patientResponsibility: 0,
    balance: 300,
  },
  denial: {
    code: 'CO-4',
    reason: 'Procedure code inconsistent with modifier or required modifier missing.',
    nextStep: 'Add modifier 59 on line 2 and resubmit, or appeal with clinical notes.',
  },
  timeline: [
    {
      id: '1',
      at: '2026-03-02 09:14',
      actor: 'Payer',
      label: 'Denial received',
      detail: 'ERA posted with CO-4 on both lines.',
    },
    {
      id: '2',
      at: '2026-02-21 16:02',
      actor: 'Clearinghouse',
      label: 'Accepted by payer',
      detail: 'Claim acknowledged; awaiting adjudication.',
    },
    {
      id: '3',
      at: '2026-02-20 11:28',
      actor: 'Alex Rivera',
      label: 'Claim submitted',
      detail: 'Electronic submission via primary payer channel.',
    },
    {
      id: '4',
      at: '2026-02-18 14:55',
      actor: 'System',
      label: 'Encounter coded',
      detail: 'Diagnoses and procedures locked for billing.',
    },
  ],
}

export const navSections = [
  { id: 'overview', label: 'Overview' },
  { id: 'patient', label: 'Patient' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'provider', label: 'Provider' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'procedures', label: 'Procedures' },
  { id: 'activity', label: 'Activity' },
] as const

export type NavSectionId = (typeof navSections)[number]['id']
