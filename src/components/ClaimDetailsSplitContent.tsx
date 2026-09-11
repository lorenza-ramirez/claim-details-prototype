import { useState, type ReactNode } from 'react'
import { paymentsArrowDropDown, submissionsPaid } from '../assets/icons'

function Icon({
  src,
  size = 16,
  alt = '',
  className,
}: {
  src: string
  size?: number
  alt?: string
  className?: string
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      draggable={false}
    />
  )
}

function Field({
  label,
  value,
  link = false,
  muted = false,
}: {
  label: string
  value: string
  link?: boolean
  muted?: boolean
}) {
  const display = value.trim() === '' ? '—' : value
  const isEmpty = display === '—'
  return (
    <div className="claim-details-split__field">
      <span className="claim-details-split__label">{label}</span>
      <span
        className={[
          'claim-details-split__value',
          link && !isEmpty ? 'claim-details-split__value--link' : '',
          (muted || isEmpty) && !link ? 'claim-details-split__value--muted' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="claim-details-split__value-text">{display}</span>
      </span>
    </div>
  )
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="claim-details-split__grid">{children}</div>
}

function FieldCol({ children }: { children: ReactNode }) {
  return <div className="claim-details-split__col">{children}</div>
}

function InfoBlock({ children }: { children: ReactNode }) {
  return <div className="claim-details-split__block">{children}</div>
}

function BlockDivider() {
  return <div className="claim-details-split__block-divider" aria-hidden />
}

function CollapsibleSubsection({
  title,
  open,
  onToggle,
  headerActions,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  headerActions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="claim-details-split__subsection">
      <div className="claim-details-split__subsection-header">
        <button
          type="button"
          className="claim-details-split__subsection-toggle"
          aria-expanded={open}
          onClick={onToggle}
        >
          <Icon
            src={paymentsArrowDropDown}
            size={20}
            className={
              open
                ? 'claim-details-split__chevron claim-details-split__chevron--open'
                : 'claim-details-split__chevron'
            }
          />
          <span>{title}</span>
        </button>
        {headerActions}
      </div>
      {open && children ? children : null}
    </div>
  )
}

function Badge({
  children,
  variant,
}: {
  children: ReactNode
  variant: 'primary' | 'active' | 'rendering' | 'supervising' | 'referring'
}) {
  return (
    <span className={`claim-details-split__badge claim-details-split__badge--${variant}`}>
      {variant === 'active' ? <Icon src={submissionsPaid} size={14} /> : null}
      {children}
    </span>
  )
}

export function ClaimDetailsSplitContent() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    patient: true,
    dateOfService: true,
    insurances: true,
    providers: true,
    facility: true,
    template: false,
    diagnoses: true,
    procedures: true,
    additionalDates: false,
    additionalInfo: false,
    authorizations: true,
  })

  const basicKeys = ['patient', 'dateOfService', 'insurances', 'providers', 'facility'] as const
  const procedureKeys = ['template', 'diagnoses', 'procedures'] as const
  const additionalKeys = ['additionalDates', 'additionalInfo', 'authorizations'] as const

  function areAllExpanded(keys: readonly string[]) {
    return keys.every((key) => openSections[key])
  }

  function toggle(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function toggleSectionAll(keys: readonly string[]) {
    const next = !areAllExpanded(keys)
    setOpenSections((prev) => {
      const updated = { ...prev }
      for (const key of keys) {
        updated[key] = next
      }
      return updated
    })
  }

  function SectionHeader({
    title,
    keys,
  }: {
    title: string
    keys: readonly string[]
  }) {
    const allExpanded = areAllExpanded(keys)
    return (
      <div className="claim-details-split__section-header">
        <h3 className="claim-details-split__section-title">{title}</h3>
        <button
          type="button"
          className="claim-details-split__expand-all"
          onClick={() => toggleSectionAll(keys)}
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
    )
  }

  return (
    <div className="claim-details-split">
      <section className="claim-details-split__section">
        <SectionHeader title="Basic Information" keys={basicKeys} />

        <CollapsibleSubsection
          title="Patient"
          open={openSections.patient}
          onToggle={() => toggle('patient')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Patient" value="Joshua Massicot" link />
                <Field label="First Name" value="Joshua" />
                <Field label="Last Name" value="Massicot" />
                <Field label="Patient ID" value="23050634" />
                <Field label="Date of Birth" value="01/25/1982" />
                <Field label="Age" value="44" />
                <Field label="Gender" value="Male" />
              </FieldCol>
              <FieldCol>
                <Field label="Site" value="Site Name" />
                <Field label="Address" value="391 BENTON ST, NY. 14620" />
                <Field label="City" value="NY" />
                <Field label="State" value="NY" />
                <Field label="ZIP Code" value="14620" />
                <Field label="Relationship" value="Self" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Date of Service"
          open={openSections.dateOfService}
          onToggle={() => toggle('dateOfService')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Type" value="Single Date of Service" />
                <Field label="Date of Service" value="09/01/2026" />
              </FieldCol>
              <FieldCol>
                <Field label="Place of Service" value="11 - Office" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Insurances"
          open={openSections.insurances}
          onToggle={() => toggle('insurances')}
          headerActions={
            <button type="button" className="claim-details-split__history-btn">
              History
            </button>
          }
        >
          <InfoBlock>
            <div className="claim-details-split__block-top">
              <div className="claim-details-split__badges">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="active">Active</Badge>
              </div>
              <Field label="Payer" value="Wc-wegmans" link />
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="Payer Name" value="Wc-wegmans" />
                <Field label="Payer ID" value="J3845" />
                <Field label="Clearing House" value="Waystar" />
                <Field label="Remaining Visits" value="—" muted />
                <Field label="Member ID" value="WC2025155829" />
                <Field label="Relationship" value="Self" />
              </FieldCol>
              <FieldCol>
                <Field label="Plan Start" value="01/19/2026" />
                <Field label="Plan End" value="—" muted />
                <Field label="Last Run" value="04/09/2026" />
                <Field label="Ran By" value="Myles Baumann" />
                <Field label="Company Type" value="Workers Compensation" />
                <Field label="Service Type" value="Physical Therapy" />
              </FieldCol>
            </FieldGrid>
            <BlockDivider />
            <FieldGrid>
              <FieldCol>
                <Field label="Group Number" value="G4036288" />
                <Field label="Group Name" value="—" muted />
              </FieldCol>
              <FieldCol>
                <Field label="Provider" value="LATTIMORE PHYSICAL THERAPY" />
                <Field label="Gender" value="Female" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Providers"
          open={openSections.providers}
          onToggle={() => toggle('providers')}
        >
          <InfoBlock>
            <div className="claim-details-split__block-top">
              <Badge variant="rendering">Rendering</Badge>
              <Field label="Name" value="Leanne Nothnagle" link />
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="Phone" value="(585) 582-0007" />
                <Field label="Fax" value="(585) 671-1991" />
                <Field label="NPI" value="—" muted />
                <Field label="Tax ID" value="161414257" />
              </FieldCol>
              <FieldCol>
                <Field label="Address" value="PO BOX 725" />
                <Field label="City" value="Mendon" />
                <Field label="State" value="NY" />
                <Field label="ZIP Code" value="14506" />
              </FieldCol>
            </FieldGrid>

            <BlockDivider />

            <div className="claim-details-split__block-top">
              <Badge variant="supervising">Supervising</Badge>
              <Field label="Name" value="Aaron Greer" link />
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="Phone" value="—" muted />
                <Field label="Fax" value="(585) 671-1991" />
                <Field label="NPI" value="1881725554" />
                <Field label="Tax ID" value="161414257" />
              </FieldCol>
              <FieldCol>
                <Field label="Address" value="PO BOX 725" />
                <Field label="City" value="Mendon" />
                <Field label="State" value="NY" />
                <Field label="ZIP Code" value="14506" />
              </FieldCol>
            </FieldGrid>

            <BlockDivider />

            <div className="claim-details-split__block-top">
              <Badge variant="referring">Referring</Badge>
              <Field label="Name" value="Valerie Gotie" link />
            </div>
            <FieldGrid>
              <FieldCol>
                <Field label="Phone" value="(585) 276-4380" />
                <Field label="Fax" value="(585) 320-1031" />
                <Field label="NPI" value="1194356188" />
                <Field label="Tax ID" value="—" muted />
              </FieldCol>
              <FieldCol>
                <Field label="Address" value="10 MIRACLE MILE DR" />
                <Field label="City" value="Rochester" />
                <Field label="State" value="NY" />
                <Field label="ZIP Code" value="14623" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Facility"
          open={openSections.facility}
          onToggle={() => toggle('facility')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Facility" value="Lattimore Pt Of Brownstone Newark" link />
                <Field label="Service NPI" value="1003928755" />
                <Field label="Place of Service" value="11 - Office" />
                <Field label="Admission Date" value="09/02/2026 12:30" />
              </FieldCol>
              <FieldCol>
                <Field label="Address" value="349 W COMMERCIAL ST STE 1275" />
                <Field label="Address 2" value="—" muted />
                <Field label="City" value="E Rochester" />
                <Field label="State" value="NY" />
                <Field label="ZIP Code" value="14445-2415" />
                <Field label="Discharge Date" value="09/02/2026 20:23" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>
      </section>

      <section className="claim-details-split__section">
        <SectionHeader title="Procedure Information" keys={procedureKeys} />

        <CollapsibleSubsection
          title="Template"
          open={openSections.template}
          onToggle={() => toggle('template')}
        >
          <InfoBlock>
            <Field label="Template" value="No Template Selected" muted />
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Diagnoses"
          open={openSections.diagnoses}
          onToggle={() => toggle('diagnoses')}
        >
          <InfoBlock>
            <div className="claim-details-split__table-wrap">
              <table className="claim-details-split__table">
                <thead>
                  <tr>
                    <th className="claim-details-split__th">Code</th>
                    <th className="claim-details-split__th">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="claim-details-split__td claim-details-split__td--link">
                      M25.561
                    </td>
                    <td className="claim-details-split__td">Pain in right knee</td>
                  </tr>
                  <tr>
                    <td className="claim-details-split__td claim-details-split__td--link">
                      M25.562
                    </td>
                    <td className="claim-details-split__td">Pain in left knee</td>
                  </tr>
                  <tr>
                    <td className="claim-details-split__td claim-details-split__td--link">M54.50</td>
                    <td className="claim-details-split__td">Low back pain, unspecified</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Procedures"
          open={openSections.procedures}
          onToggle={() => toggle('procedures')}
        >
          <InfoBlock>
            <div className="claim-details-split__table-wrap">
              <table className="claim-details-split__table claim-details-split__table--procedures">
                <thead>
                  <tr>
                    <th className="claim-details-split__th">Procedure</th>
                    <th className="claim-details-split__th">Modifiers</th>
                    <th className="claim-details-split__th">Diagnoses</th>
                    <th className="claim-details-split__th">Unit Charge</th>
                    <th className="claim-details-split__th">Count</th>
                    <th className="claim-details-split__th">Total Charge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="claim-details-split__td claim-details-split__td--link">97110</td>
                    <td className="claim-details-split__td">CQ</td>
                    <td className="claim-details-split__td">M25.561 +1 more</td>
                    <td className="claim-details-split__td">$72.00</td>
                    <td className="claim-details-split__td">3</td>
                    <td className="claim-details-split__td">$216.00</td>
                  </tr>
                  <tr>
                    <td className="claim-details-split__td claim-details-split__td--link">97112</td>
                    <td className="claim-details-split__td">CQ</td>
                    <td className="claim-details-split__td">M25.562 +1 more</td>
                    <td className="claim-details-split__td">$64.00</td>
                    <td className="claim-details-split__td">1</td>
                    <td className="claim-details-split__td">$64.00</td>
                  </tr>
                  <tr>
                    <td className="claim-details-split__td claim-details-split__td--link">97530</td>
                    <td className="claim-details-split__td">CQ</td>
                    <td className="claim-details-split__td">M54.50</td>
                    <td className="claim-details-split__td">$40.00</td>
                    <td className="claim-details-split__td">1</td>
                    <td className="claim-details-split__td">$40.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="claim-details-split__table-footer">
              Total Charges: <strong>$320.00</strong>
            </p>
          </InfoBlock>
        </CollapsibleSubsection>
      </section>

      <section className="claim-details-split__section">
        <SectionHeader title="Additional Claim Details" keys={additionalKeys} />

        <CollapsibleSubsection
          title="Additional Dates"
          open={openSections.additionalDates}
          onToggle={() => toggle('additionalDates')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Current Illness Date" value="09/02/2026 20:23" />
                <Field label="Initial Treatment Date" value="09/02/2026 20:23" />
              </FieldCol>
              <FieldCol>
                <Field label="Admission Date" value="09/02/2026 12:30" />
                <Field label="Discharge Date" value="09/02/2026 20:23" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Additional Information"
          open={openSections.additionalInfo}
          onToggle={() => toggle('additionalInfo')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Type of Care" value="Independant part A" />
                <Field label="Admission Type" value="Emergency" />
                <Field label="Additional Info" value="Notes" />
              </FieldCol>
              <FieldCol>
                <Field
                  label="Admission Source"
                  value="Non-Health Care Facility Point of Origin (Physician Referral)"
                />
                <Field
                  label="Discharge Status"
                  value="Discharged to home or self-care (routine discharge)"
                />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>

        <CollapsibleSubsection
          title="Authorizations"
          open={openSections.authorizations}
          onToggle={() => toggle('authorizations')}
        >
          <InfoBlock>
            <FieldGrid>
              <FieldCol>
                <Field label="Prior Auth Number" value="12345654321" />
                <Field label="Auth Type" value="Pre Certification" />
              </FieldCol>
              <FieldCol>
                <Field label="Effective Date" value="06/19/2025" />
                <Field label="Expiration Date" value="11/11/2025" />
              </FieldCol>
            </FieldGrid>
          </InfoBlock>
        </CollapsibleSubsection>
      </section>
    </div>
  )
}
