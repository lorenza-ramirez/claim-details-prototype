export type RemittanceRow = {
  checkNumber: string
  checkDate: string
  insPaid: string
  prAmount: string
  otherPr: string
  status: string
  depositVerified: string
  sentTo: string
  memberId: string
  source: string
  sourceLabel: string
  importedDate: string
}

/** Synthetic demo remittances — not real PHI/PII. */
export const REMITTANCE_ROWS: RemittanceRow[] = [
  {
    checkNumber: 'CE60205120213906278701523',
    checkDate: '10/14/2026',
    insPaid: '$0.00',
    prAmount: '$0.00',
    otherPr: '$0.00',
    status: 'Posted',
    depositVerified: 'N/A',
    sentTo: 'UNITED MEDICAL RESOURCES',
    memberId: '17949634',
    source: '835',
    sourceLabel: 'WAYSTAR',
    importedDate: '10/14/2026',
  },
  {
    checkNumber: 'CE60205120213906278701523',
    checkDate: '10/14/2026',
    insPaid: '$0.00',
    prAmount: '$0.00',
    otherPr: '$0.00',
    status: 'Posted',
    depositVerified: 'N/A',
    sentTo: 'UNITED MEDICAL RESOURCES',
    memberId: '17949634',
    source: 'EOB',
    sourceLabel: 'EOB',
    importedDate: '10/15/2026',
  },
]

export function remittanceRecordLabel(row: RemittanceRow) {
  return `${row.checkNumber} · ${row.source}`
}

export const REMITTANCE_RECORDS = REMITTANCE_ROWS.map(remittanceRecordLabel)

/** October 14 Iowa Blue Shield remittance from the vision summary. Not part of the remittances table. */
export const IOWA_BLUE_SHIELD_REMITTANCE: RemittanceRow = {
  checkNumber: 'IBS20261014001',
  checkDate: '10/14/2026',
  insPaid: '$0.00',
  prAmount: '$0.00',
  otherPr: '$0.00',
  status: 'Posted',
  depositVerified: 'N/A',
  sentTo: 'Iowa Blue Shield',
  memberId: 'IBS10001',
  source: '835',
  sourceLabel: 'WAYSTAR',
  importedDate: '10/14/2026',
}
