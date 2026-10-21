import { useState, type ReactNode } from 'react'
import {
  activityMinus,
  keyboardArrowDown2,
  remittanceDataObject,
  remittancePdf,
  submissionsPaid,
} from '../assets/icons'
import { REMITTANCE_ROWS, type RemittanceRow } from './remittancesData'

type Adjustment = { code: string; amount: string }

type ServiceLine = {
  code: string
  dos: string
  rev: string
  units: string
  charges: string
  allowed: string
  contAdj: string
  insPaid: string
  coins: string
  deductible: string
  adjustments: Adjustment[]
  remarks: string[]
}

/** Synthetic demo remittance content — not real PHI/PII. */
const SERVICE_LINES: ServiceLine[] = [
  {
    code: '97110',
    dos: '09/25/2026',
    rev: '-',
    units: '1',
    charges: '$68.00',
    allowed: '-',
    contAdj: '$43.00',
    insPaid: '-',
    coins: '-',
    deductible: '-',
    adjustments: [
      { code: 'CO-45', amount: '$43.00' },
      { code: 'PI-252', amount: '$25.00' },
    ],
    remarks: ['M127'],
  },
  {
    code: '97140',
    dos: '09/25/2026',
    rev: '-',
    units: '1',
    charges: '$67.00',
    allowed: '-',
    contAdj: '$67.00',
    insPaid: '-',
    coins: '-',
    deductible: '-',
    adjustments: [{ code: 'CO-45', amount: '$67.00' }],
    remarks: [],
  },
  {
    code: '97530',
    dos: '09/25/2026',
    rev: '-',
    units: '1',
    charges: '$70.00',
    allowed: '-',
    contAdj: '-',
    insPaid: '-',
    coins: '-',
    deductible: '-',
    adjustments: [{ code: 'PI-252', amount: '$70.00' }],
    remarks: ['M127'],
  },
]

const ADJUSTMENT_DETAILS = [
  {
    code: 'CO-45',
    description:
      'Charge exceeds fee schedule/maximum allowable or contracted/legislated fee arrangement. Usage: This adjustment amount cannot equal the total service or claim charge amount; and must not duplicate provider adjustment amounts (payments and contractual reductions) that have resulted from prior payer(s) adjudication. (Use only with Group Codes PR or CO depending upon liability)',
  },
  {
    code: 'PI-252',
    description:
      'An attachment/other documentation is required to adjudicate this claim/service. At least one Remark Code must be provided (may be comprised of either the NCPDP Reject Reason Code, or Remittance Advice Remark Code that is not an ALERT).',
  },
]

const REMARK_DETAILS = [
  { code: 'M127', description: 'Missing patient medical record for this service.' },
]

const COLUMNS: { key: keyof ServiceLine; label: string; end?: boolean }[] = [
  { key: 'dos', label: 'Date of Service' },
  { key: 'rev', label: 'Rev' },
  { key: 'units', label: 'Units Paid' },
  { key: 'charges', label: 'Charges', end: true },
  { key: 'allowed', label: 'Allowed', end: true },
  { key: 'contAdj', label: 'Cont. Adj.', end: true },
  { key: 'insPaid', label: 'Ins. Paid', end: true },
  { key: 'coins', label: 'Coins', end: true },
  { key: 'deductible', label: 'Deductible', end: true },
]

function MetaItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="submission-detail__meta-item">
      <span className="submission-detail__meta-label">{label}</span>
      <span className="submission-detail__meta-value">{children}</span>
    </div>
  )
}

function CodeDetails({
  title,
  items,
}: {
  title: string
  items: { code: string; description: string }[]
}) {
  return (
    <section className="remittance-detail__codes">
      <h4 className="remittance-detail__codes-title">{title}</h4>
      {items.map((item) => (
        <div key={item.code} className="remittance-detail__code-row">
          <span className="remittance-detail__code">{item.code}:</span>
          <p className="remittance-detail__code-text">{item.description}</p>
        </div>
      ))}
    </section>
  )
}

export function RemittanceDetail({
  recordIndex,
  row: rowOverride,
  paidBy = 'UMR',
}: {
  recordIndex: number
  row?: RemittanceRow
  paidBy?: string
}) {
  const row = rowOverride ?? REMITTANCE_ROWS[recordIndex] ?? REMITTANCE_ROWS[0]
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  function toggleLine(code: string) {
    setCollapsed((current) => ({ ...current, [code]: !current[code] }))
  }

  const summary = [
    { label: 'Payer Control Number', value: '26272518894' },
    { label: 'Check Number', value: row.checkNumber },
    { label: 'Check Date', value: row.checkDate },
    { label: 'Total Charges', value: '$205.00' },
    { label: 'Patient Responsibility', value: '-' },
  ]

  return (
    <div className="submission-detail remittance-detail">
      <header className="submission-detail__header">
        <div className="submission-detail__title-row">
          <h3 className="submission-detail__title remittance-detail__title">
            Check #:{' '}
            <span className="remittance-detail__check" role="link" tabIndex={0}>
              {row.checkNumber}
            </span>
            <span className="submissions-widget__index submissions-widget__index--primary">
              Primary
            </span>
          </h3>
          <div className="submission-detail__title-actions">
            <button type="button" className="icon-btn" aria-label="View raw remittance data" title="Raw Data">
              <img src={remittanceDataObject} alt="" width={20} height={20} />
            </button>
            <button type="button" className="icon-btn" aria-label="View remittance PDF" title="View PDF">
              <img src={remittancePdf} alt="" width={20} height={20} />
            </button>
          </div>
        </div>
        <div className="submission-detail__meta remittance-detail__meta">
          <MetaItem label="Check Date">{row.checkDate}</MetaItem>
          <MetaItem label="Posting Status">
            <span className="remittances-widget__badge">
              <img src={submissionsPaid} alt="" width={16} height={16} />
              {row.status}
            </span>
          </MetaItem>
          <MetaItem label="Deposit Verified">
            <span className="remittances-widget__badge">
              <img
                src={row.depositVerified === 'N/A' ? activityMinus : submissionsPaid}
                alt=""
                width={16}
                height={16}
              />
              {row.depositVerified}
            </span>
          </MetaItem>
          <div className="remittance-detail__meta-sent">
            <MetaItem label="Sent To">
              <span className="remittance-detail__truncate" title={row.sentTo}>
                {row.sentTo}
              </span>
            </MetaItem>
          </div>
          <MetaItem label="Paid By">{paidBy}</MetaItem>
          <MetaItem label="Source">{row.sourceLabel}</MetaItem>
          <MetaItem label="Imported Date">{row.importedDate}</MetaItem>
        </div>
      </header>

      <div className="remittance-detail__overview">
        <dl className="remittance-detail__payee">
          <div><dt>Payee:</dt> <dd>Rock Valley Physical Therapy</dd></div>
          <div><dt>Tax ID:</dt> <dd>363311720</dd></div>
          <div><dt>NPI:</dt> <dd>1245373166</dd></div>
          <div><dt>Patient:</dt> <dd>Cole Crawford</dd></div>
          <div><dt>ID:</dt> <dd>{row.memberId}</dd></div>
        </dl>
        <section className="remittance-detail__summary" aria-label="Remittance summary">
          <h4 className="remittance-detail__summary-title">Summary</h4>
          {summary.map((item) => (
            <div key={item.label} className="remittance-detail__summary-row">
              <span className="remittance-detail__summary-label">{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
          <div className="remittance-detail__summary-row remittance-detail__summary-row--total">
            <span>Total Paid to Provider</span>
            <span>-</span>
          </div>
        </section>
      </div>

      <div className="remittance-detail__table-wrap">
        <table className="remittance-detail__table">
          <thead>
            <tr>
              <th className="remittance-detail__th remittance-detail__sticky" scope="col">
                Procedure
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={
                    column.end
                      ? 'remittance-detail__th remittance-detail__end'
                      : 'remittance-detail__th'
                  }
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERVICE_LINES.map((line) => {
              const open = !collapsed[line.code]
              return [
                <tr key={line.code} className="remittance-detail__line">
                  <td className="remittance-detail__td remittance-detail__sticky">
                    <button
                      type="button"
                      className="remittance-detail__line-toggle"
                      aria-expanded={open}
                      aria-label={`${open ? 'Hide' : 'Show'} adjustments for ${line.code}`}
                      onClick={() => toggleLine(line.code)}
                    >
                      <img
                        src={keyboardArrowDown2}
                        alt=""
                        width={18}
                        height={18}
                        className={open ? 'remittance-detail__caret--open' : undefined}
                      />
                    </button>
                    {line.code}
                  </td>
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className={
                        column.end
                          ? 'remittance-detail__td remittance-detail__end'
                          : 'remittance-detail__td'
                      }
                    >
                      {line[column.key] as string}
                    </td>
                  ))}
                </tr>,
                open ? (
                  <tr key={`${line.code}-adj`} className="remittance-detail__adj-row">
                    <td colSpan={COLUMNS.length + 1}>
                      <div className="remittance-detail__adj">
                        <span className="remittance-detail__adj-label">Other Adjustments:</span>
                        {line.adjustments.map((adj) => (
                          <span key={adj.code} className="remittance-detail__chip">
                            {adj.code} | {adj.amount}
                          </span>
                        ))}
                        {line.remarks.length > 0 ? (
                          <>
                            <span className="remittance-detail__adj-label remittance-detail__adj-label--remarks">
                              Remarks:
                            </span>
                            {line.remarks.map((remark) => (
                              <span key={remark} className="remittance-detail__chip">
                                {remark}
                              </span>
                            ))}
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : null,
              ]
            })}
          </tbody>
        </table>
      </div>

      <CodeDetails title="Other Adjustments Details" items={ADJUSTMENT_DETAILS} />
      <CodeDetails title="Remark Details" items={REMARK_DETAILS} />
    </div>
  )
}
