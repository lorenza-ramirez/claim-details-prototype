// Fake claim data for the claim workspace. Not real patients, providers, or staff.

export const CLAIM_ID = "22316691";

export type QueueClaim = { id: string; amount: string };

export const CLAIM_QUEUE: { label: string; total: string; claims: QueueClaim[] } = {
  label: "Sub. errors",
  total: "$2,816.58/20",
  claims: [
    { id: CLAIM_ID, amount: "$386.00" },
    { id: "22316702", amount: "$145.20" },
    { id: "22316715", amount: "$210.00" },
    { id: "22316728", amount: "$98.40" },
    { id: "22316733", amount: "$312.75" },
    { id: "22316741", amount: "$76.00" },
    { id: "22316756", amount: "$188.10" },
    { id: "22316762", amount: "$245.28" },
    { id: "22316779", amount: "$120.00" },
    { id: "22316784", amount: "$64.50" },
    { id: "22316790", amount: "$402.00" },
    { id: "22316805", amount: "$155.35" },
    { id: "22316818", amount: "$92.00" },
    { id: "22316823", amount: "$230.40" },
    { id: "22316837", amount: "$118.60" },
    { id: "22316842", amount: "$67.25" },
    { id: "22316851", amount: "$301.00" },
    { id: "22316866", amount: "$84.90" },
    { id: "22316874", amount: "$140.00" },
    { id: "22316889", amount: "$59.85" },
  ],
};

export type TagColor = "red" | "violet" | "green" | "neutral";

export const CLAIM_PROPERTIES: { label: string; value: string; color: TagColor }[] = [
  { label: "Status", value: "Needs initial review - 1 day", color: "red" },
  { label: "Stage", value: "Payer 1", color: "violet" },
  { label: "Assignee", value: "Elliot", color: "green" },
  { label: "Updated on", value: "08/13/2025 10:22AM", color: "neutral" },
  { label: "Updated by", value: "Colossus", color: "neutral" },
];

export const CLAIM_PROPERTIES_AFTER_TAGS: { label: string; value: string }[] = [
  { label: "Initial submission date", value: "Jul 01, 2025" },
  { label: "Imported insurances", value: "Primary: Aetna - PPO" },
  { label: "Submitted insurances", value: "Primary: Aetna - PPO" },
];

export const NEXT_CLAIM_ID = "22316702";

export type ClaimCase = {
  id: string;
  amount: string;
  payer: string;
  provider: string;
  serviceDate: string;
  submittedDate: string;
  remitDate: string;
  lines: string[];
  denial: string;
  problem: string;
  nextStep: string;
  action: { title: string; why: string; change: string; notice: string };
  properties: { label: string; value: string; color: TagColor }[];
  afterTags: { label: string; value: string }[];
};

type Scenario = Pick<ClaimCase, "payer" | "provider" | "lines" | "denial" | "problem" | "nextStep" | "action">;

const SCENARIOS: Scenario[] = [
  {
    payer: "Prairie Health Plan",
    provider: "Northshore Therapy Group",
    lines: ["97110", "97530"],
    denial: "CO-16 with remark N290 (missing or invalid referring provider)",
    problem: "The referring provider is missing.",
    nextStep:
      "Add the referring provider from the medical record to box 17 and resubmit. The procedure and diagnosis codes look correct as billed.",
    action: {
      title: "Add referring provider",
      why: "CO-16/N290: box 17 is empty. The medical record lists Dr. Morgan Reyes as the referring provider.",
      change: "Box 17: none → Dr. Morgan Reyes",
      notice: "Referring provider added to box 17.",
    },
  },
  {
    payer: "Lakeview Health Plan",
    provider: "Harbor Point Rehab",
    lines: ["97161", "97140"],
    denial: "CO-197 (precertification or authorization absent)",
    problem: "The prior authorization number is missing.",
    nextStep:
      "Add the prior authorization number from the referral to box 23 and resubmit. The rest of the claim looks correct as billed.",
    action: {
      title: "Add authorization number",
      why: "CO-197: box 23 is empty. The referral on file includes authorization AUTH-48213.",
      change: "Box 23: none → AUTH-48213",
      notice: "Authorization number added to box 23.",
    },
  },
  {
    payer: "Summit Care Insurance",
    provider: "Maple Grove Physical Therapy",
    lines: ["97110", "97112", "97140"],
    denial: "CO-4 with remark N519 (missing required therapy modifier)",
    problem: "The therapy modifier GP is missing.",
    nextStep: "Add modifier GP to each therapy line and resubmit. The diagnosis codes look correct as billed.",
    action: {
      title: "Add modifier GP",
      why: "CO-4/N519: the payer requires modifier GP on physical therapy codes. None of the lines carry it.",
      change: "Mod: none → GP",
      notice: "Modifier GP added to all therapy lines.",
    },
  },
];

export function nextClaimId(id: string): string | undefined {
  const claims = CLAIM_QUEUE.claims;
  const index = claims.findIndex((claim) => claim.id === id);
  return index >= 0 ? claims[index + 1]?.id : undefined;
}

export function claimCase(id: string): ClaimCase {
  const claims = CLAIM_QUEUE.claims;
  const index = Math.max(1, claims.findIndex((claim) => claim.id === id));
  const scenario = SCENARIOS[(index - 1) % SCENARIOS.length];
  const day = 7 + (index % 12);
  return {
    ...scenario,
    id,
    amount: claims[index]?.amount ?? "$0.00",
    serviceDate: `October ${day}, 2026`,
    submittedDate: `October ${day + 2}, 2026`,
    remitDate: `October ${day + 8}, 2026`,
    properties: [
      { label: "Status", value: `Needs initial review - ${1 + (index % 4)} days`, color: "red" },
      { label: "Stage", value: "Payer 1", color: "violet" },
      { label: "Assignee", value: "Elliot", color: "green" },
      { label: "Updated on", value: `10/${day + 8}/2026 09:05AM`, color: "neutral" },
      { label: "Updated by", value: "Colossus", color: "neutral" },
    ],
    afterTags: [
      { label: "Initial submission date", value: `Oct ${day + 2}, 2026` },
      { label: "Imported insurances", value: `Primary: ${scenario.payer}` },
      { label: "Submitted insurances", value: `Primary: ${scenario.payer}` },
    ],
  };
}

export function claimProperties(id: string) {
  if (id === CLAIM_ID) return { properties: CLAIM_PROPERTIES, afterTags: CLAIM_PROPERTIES_AFTER_TAGS };
  const { properties, afterTags } = claimCase(id);
  return { properties, afterTags };
}

export type Submission = {
  id: string;
  created: string;
  submitted: string;
  statusLabel: string;
  charges: string;
  payer: string;
  memberId: string;
  type: string;
  method: string;
  formType: string;
  submittedBy: string;
};

export const INITIAL_SUBMISSION: Submission = {
  id: CLAIM_ID,
  created: "10/09/2026",
  submitted: "10/09/2026",
  statusLabel: "Denied",
  charges: "$386.00",
  payer: "Iowa Blue Shield",
  memberId: "IBS10001",
  type: "Initial",
  method: "Waystar",
  formType: "CMS",
  submittedBy: "Colossus",
};

export const SUBMISSIONS: Submission[] = [
  {
    id: "70304059",
    created: "09/26/2026",
    submitted: "09/26/2026",
    statusLabel: "Denied",
    charges: "$205.00",
    payer: "United Medical Resources",
    memberId: "17949634",
    type: "Initial",
    method: "Waystar",
    formType: "CMS",
    submittedBy: "Unknown",
  },
  INITIAL_SUBMISSION,
];

export type Remittance = {
  id: string;
  checkNumber: string;
  checkDate: string;
  insPaid: string;
  prAmount: string;
  status: string;
  sentTo: string;
  memberId: string;
  source: string;
  importedDate: string;
};

export const IOWA_REMITTANCE: Remittance = {
  id: "ibs-835",
  checkNumber: "IBS20261014001",
  checkDate: "10/14/2026",
  insPaid: "$0.00",
  prAmount: "$0.00",
  status: "Posted",
  sentTo: "Iowa Blue Shield",
  memberId: "IBS10001",
  source: "835",
  importedDate: "10/14/2026",
};

export const REMITTANCES: Remittance[] = [
  IOWA_REMITTANCE,
  {
    id: "umr-835",
    checkNumber: "CE60205120213906278701523",
    checkDate: "10/14/2026",
    insPaid: "$0.00",
    prAmount: "$0.00",
    status: "Posted",
    sentTo: "United Medical Resources",
    memberId: "17949634",
    source: "835",
    importedDate: "10/14/2026",
  },
  {
    id: "umr-eob",
    checkNumber: "CE60205120213906278701523",
    checkDate: "10/14/2026",
    insPaid: "$0.00",
    prAmount: "$0.00",
    status: "Posted",
    sentTo: "United Medical Resources",
    memberId: "17949634",
    source: "EOB",
    importedDate: "10/15/2026",
  },
];

export type Payment = {
  id: string;
  label: string;
  kind: "Payer" | "Procedure";
  charges: string;
  paid: string;
  balance: string;
};

export const PAYMENTS: Payment[] = [
  { id: "primary", label: "Primary", kind: "Payer", charges: "$386.00", paid: "$0.00", balance: "$346.00" },
  { id: "97110", label: "97110", kind: "Procedure", charges: "$96.50", paid: "$0.00", balance: "$96.50" },
  { id: "97112", label: "97112", kind: "Procedure", charges: "$96.50", paid: "$0.00", balance: "$96.50" },
  { id: "97140", label: "97140", kind: "Procedure", charges: "$76.50", paid: "$0.00", balance: "$76.50" },
  { id: "97161", label: "97161", kind: "Procedure", charges: "$116.50", paid: "$0.00", balance: "$76.50" },
];

export type Attachment = {
  id: string;
  name: string;
  type: string;
  date: string;
  tag: string;
};

export const ATTACHMENTS: Attachment[] = [
  { id: "clinical-note", name: "ClinicalNote.pdf", type: "Chart note", date: "10/07/2026", tag: "Chart note" },
  { id: "claim-form", name: "cms-1500-2026-10-09.pdf", type: "Patient", date: "10/09/2026", tag: "Claim form" },
  { id: "procedure", name: "order-PROCEDURE-2026-10-07.pdf", type: "Patient", date: "10/07/2026", tag: "EHR order" },
  { id: "prior-auth", name: "prior-auth-request-2026-10-01.pdf", type: "Case", date: "10/01/2026", tag: "Prior auth" },
  { id: "payer-fax", name: "payer-correspondence-2026-10-15.pdf", type: "Fax", date: "10/15/2026", tag: "Fax" },
];

export type SimilarClaim = {
  id: string;
  status: string;
  stage: string;
  provider: string;
  dateOfService: string;
};

export const SIMILAR_CLAIMS: SimilarClaim[] = [
  { id: "22316802", status: "Submission errors", stage: "Payer 1", provider: "Dr. Jordan Lee", dateOfService: "04/29/2026" },
  { id: "22316815", status: "Submission errors", stage: "Payer 1", provider: "Dr. Jordan Lee", dateOfService: "03/10/2026" },
  { id: "22316828", status: "Needs initial review", stage: "Payer 1", provider: "Dr. Casey Morgan", dateOfService: "02/18/2026" },
];

export type ActivityEvent = { id: string; time: string; text: string };

export const ACTIVITY: ActivityEvent[] = [
  { id: "appointment", time: "3 weeks ago", text: "Appointment occurred" },
  { id: "record", time: "3 weeks ago", text: "Medical record attached to claim" },
  { id: "stage", time: "3 weeks ago", text: "Claim stage set to Payer 1" },
  { id: "submitted", time: "3 weeks ago", text: "Claim submitted for $386.00 to Iowa Blue Shield" },
  { id: "remit", time: "2 weeks ago", text: "Iowa Blue Shield remittance received: $0.00 paid (CO-16, M76)" },
  { id: "status", time: "2 weeks ago", text: "Claim status set to Full denials" },
  { id: "note-1", time: "2 days ago", text: "Sam Patel: The diagnosis looks incomplete. Preparing a correction." },
  { id: "note-2", time: "1 day ago", text: "Riley Chen: Acknowledged. Thanks for the update." },
];

export const DIAGNOSES: { code: string; description: string }[] = [
  { code: "M54.5", description: "Low back pain" },
  { code: "M62.81", description: "Muscle weakness (generalized)" },
  { code: "R26.2", description: "Difficulty in walking, not elsewhere classified" },
];

// Fields from the older claim-details screens, filled for this claim.
// Patient, provider, and address values are fake stand-ins.
export const CLAIM_DETAIL_GROUPS: { title: string; fields: [string, string][] }[] = [
  {
    title: "Claim",
    fields: [
      ["Billing provider", "Rock Valley Physical Therapy and Therapy Services"],
      ["Payer", "Iowa Blue Shield"],
      ["Date of service", "10/07/2026"],
      ["Place of service", "11 - Office"],
      ["Type of care", "Outpatient therapy"],
      ["Facility", "Rock Valley Physical Therapy and Therapy Services"],
      ["Total charges", "$386.00"],
    ],
  },
  {
    title: "Patient",
    fields: [
      ["Name", "Alex Rivera"],
      ["Patient ID", "48291"],
      ["Date of birth", "03/14/1986"],
      ["Age", "40"],
      ["Gender", "Female"],
      ["Address", "100 Demo Lane, Clive, IA 50325"],
    ],
  },
  {
    title: "Insurance",
    fields: [
      ["Payer name", "Iowa Blue Shield"],
      ["Member ID", "17949634"],
      ["Relationship", "Self"],
      ["Service type", "Physical therapy"],
      ["Group number", "100000"],
      ["Plan start", "01/01/2026"],
      ["Plan end", "—"],
      ["Clearinghouse", "Waystar"],
    ],
  },
  {
    title: "Provider",
    fields: [
      ["Name", "Dr. Jordan Lee"],
      ["Role", "Rendering"],
      ["Phone", "(555) 010-0142"],
      ["NPI", "1000000001"],
      ["Address", "100 Demo Lane, Clive, IA 50325"],
    ],
  },
  {
    title: "Additional details",
    fields: [
      ["Current illness date", "09/30/2026"],
      ["Initial treatment date", "09/30/2026"],
      ["Admission date", "—"],
      ["Discharge date", "—"],
      ["Admission type", "—"],
      ["Admission source", "—"],
      ["Discharge status", "—"],
      ["Prior authorization", "Not required by payer"],
      ["Supporting document", "ClinicalNote.pdf"],
      ["Attached", "10/07/2026"],
    ],
  },
];

export const PROCEDURES: { code: string; description: string; modifiers: string; charge: string }[] = [
  { code: "97110", description: "Therapeutic exercise", modifiers: "GP", charge: "$96.50" },
  { code: "97112", description: "Neuromuscular reeducation", modifiers: "GP", charge: "$96.50" },
  { code: "97140", description: "Manual therapy", modifiers: "GP", charge: "$96.50" },
  { code: "97161", description: "Physical therapy evaluation", modifiers: "GP", charge: "$96.50" },
];

export const CHAT_REPLIES: Record<string, string> = {
  "Why was 97140 adjudicated?":
    "Line 97140 was denied with 97110, 97112, and 97161. Iowa Blue Shield paid nothing and left the $346.00 balance open. The remittance dated October 14, 2026 lists CO-16 with remark M76: the diagnosis or condition information is missing, incomplete, or invalid.",
  "What changed in the resubmission?":
    "This claim has not been resubmitted. The initial claim went out on October 9, 2026, and the October 14 remittance denied all four lines. A resubmission would go out after the diagnosis is corrected.",
  "Resubmit to Iowa Blue Shield":
    "I can prepare a resubmission to Iowa Blue Shield after the diagnosis change is applied. The open balance is $346.00.",
};

export const DEFAULT_REPLY =
  "This claim was fully denied under CO-16 with remark M76 on lines 97110, 97112, 97140, and 97161. I can walk through the denial, the diagnosis codes, or the next step.";
