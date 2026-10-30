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
