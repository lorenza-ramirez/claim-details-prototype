import { useState, type ComponentProps } from "react";
import {
  ActivityFeed,
  Avatar,
  Button,
  Checkbox,
  Grid,
  Icon,
  IconButton,
  Menu,
  Stack,
  TablePrimitives,
  Tag,
  Textarea,
  Typography,
} from "@getathelas/ui";
import type { IconProps } from "@getathelas/ui";
import {
  ACTIVITY,
  ATTACHMENTS,
  CLAIM_DETAIL_GROUPS,
  DIAGNOSES,
  PAYMENTS,
  PROCEDURES,
  REMITTANCES,
  SIMILAR_CLAIMS,
  SUBMISSIONS,
  INITIAL_SUBMISSION,
} from "../../mock/claim";

export type SourceId =
  | "claim-details"
  | "attachments"
  | "submissions"
  | "remittances"
  | "payments"
  | "appeals"
  | "similar-claims"
  | "activity";

export type IconName = IconProps["icon"];

export const SOURCES: { id: SourceId; label: string; icon: IconName }[] = [
  { id: "claim-details", label: "Claim details", icon: "description" },
  { id: "attachments", label: "Patient attachments", icon: "attach_file" },
  { id: "submissions", label: "Submissions", icon: "send" },
  { id: "remittances", label: "Remittances", icon: "request_quote" },
  { id: "payments", label: "Payments", icon: "account_balance" },
  { id: "appeals", label: "Appeals", icon: "gavel" },
  { id: "similar-claims", label: "Similar claims", icon: "dynamic_feed" },
];

export const ACTIVITY_SOURCE = { id: "activity" as const, label: "Activity", icon: "history" as IconName };

export function sourceInfo(id: SourceId) {
  return SOURCES.find((source) => source.id === id) ?? ACTIVITY_SOURCE;
}

export const SELECTABLE_SOURCES = new Set<SourceId>(["submissions", "remittances"]);

export type RecordRef = { source: SourceId; id: string };

// One-line label and facts for any record, used by drawers, context chips, and chat replies.
export function recordSummary({ source, id }: RecordRef): { title: string; chip: string; facts: string[] } | null {
  if (source === "submissions") {
    const row = [...SUBMISSIONS, INITIAL_SUBMISSION].find((item) => item.id === id);
    if (!row) return null;
    return {
      title: `Submission ${row.submitted}`,
      chip: `# ${row.id} | ${row.created} | ${row.statusLabel}`,
      facts: [
        `Submission ${row.id} was created ${row.created}, submitted ${row.submitted} to ${row.payer} for ${row.charges}, and is ${row.statusLabel.toLowerCase()}.`,
      ],
    };
  }
  if (source === "remittances") {
    const row = REMITTANCES.find((item) => item.id === id);
    if (!row) return null;
    return {
      title: `Remittance ${row.checkDate}`,
      chip: `${row.sentTo} | ${row.source} | ${row.checkDate}`,
      facts: [
        `Remittance ${row.checkNumber} (${row.source}) from ${row.sentTo} on ${row.checkDate} is ${row.status.toLowerCase()} and paid ${row.insPaid}.`,
      ],
    };
  }
  if (source === "payments") {
    const row = PAYMENTS.find((item) => item.id === id);
    if (!row) return null;
    return {
      title: `Payment ${row.label}`,
      chip: `${row.label} | ${row.kind} | ${row.charges}`,
      facts: [`Payment ${row.label} (${row.kind}) has charges ${row.charges}, paid ${row.paid}, and balance ${row.balance}.`],
    };
  }
  if (source === "attachments") {
    const row = ATTACHMENTS.find((item) => item.id === id);
    if (!row) return null;
    return {
      title: row.name,
      chip: row.name,
      facts: [`Attachment ${row.name} is a ${row.type.toLowerCase()} document dated ${row.date}.`],
    };
  }
  if (source === "similar-claims") {
    const row = SIMILAR_CLAIMS.find((item) => item.id === id);
    if (!row) return null;
    return {
      title: `Claim ${row.id}`,
      chip: `# ${row.id} | ${row.dateOfService} | ${row.status}`,
      facts: [`Similar claim ${row.id} is in ${row.status.toLowerCase()}, with date of service ${row.dateOfService} and provider ${row.provider}.`],
    };
  }
  return null;
}

export function sourceFacts(source: SourceId): string[] {
  if (source === "submissions") return SUBMISSIONS.flatMap((row) => recordSummary({ source, id: row.id })?.facts ?? []);
  if (source === "remittances") return REMITTANCES.flatMap((row) => recordSummary({ source, id: row.id })?.facts ?? []);
  if (source === "payments") return PAYMENTS.flatMap((row) => recordSummary({ source, id: row.id })?.facts ?? []);
  if (source === "attachments") return ATTACHMENTS.flatMap((row) => recordSummary({ source, id: row.id })?.facts ?? []);
  if (source === "similar-claims") return SIMILAR_CLAIMS.flatMap((row) => recordSummary({ source, id: row.id })?.facts ?? []);
  if (source === "activity") return ACTIVITY.map((event) => `${event.text}, ${event.time}.`);
  if (source === "appeals") return ["No appeals have been filed for this claim."];
  return [`Claim details are open.`];
}

type TableProps = {
  source: SourceId;
  onOpenRecord: (record: RecordRef) => void;
  selectedIds?: string[];
  onToggleSelected?: (record: RecordRef) => void;
  onAppeal?: (record: RecordRef) => void;
};

function SelectCell({
  record,
  selectedIds,
  onToggleSelected,
}: {
  record: RecordRef;
  selectedIds?: string[];
  onToggleSelected?: (record: RecordRef) => void;
}) {
  return (
    <TablePrimitives.Cell onClick={(event) => event.stopPropagation()}>
      <Checkbox
        aria-label={`Select ${record.id}`}
        checked={selectedIds?.includes(record.id) ?? false}
        onCheckedChange={() => onToggleSelected?.(record)}
      />
    </TablePrimitives.Cell>
  );
}

// The list view for a source: shown in chat widgets and in the source panel.
export function SourceTable({ source, onOpenRecord, selectedIds, onToggleSelected, onAppeal }: TableProps) {
  const selectable = SELECTABLE_SOURCES.has(source) && onToggleSelected != null;

  if (source === "claim-details") return <ClaimDetails />;
  if (source === "activity") return <ActivityList />;
  if (source === "appeals") {
    return (
      <Typography variant="body-s" color="fg-secondary">
        No appeals have been filed for this claim.
      </Typography>
    );
  }

  if (source === "submissions") {
    return (
      <TablePrimitives columns={`${selectable ? "max-content " : ""}max-content max-content minmax(0,1fr) max-content${onAppeal ? " max-content" : ""}`} size="compact" variant="fullPage">
        <TablePrimitives.Header>
          <TablePrimitives.Row>
            {selectable ? <TablePrimitives.Head aria-label="Select" /> : null}
            <TablePrimitives.Head>Submission</TablePrimitives.Head>
            <TablePrimitives.Head>Submitted</TablePrimitives.Head>
            <TablePrimitives.Head>Payer</TablePrimitives.Head>
            <TablePrimitives.Head>Status</TablePrimitives.Head>
            {onAppeal ? <TablePrimitives.Head aria-label="Actions" /> : null}
          </TablePrimitives.Row>
        </TablePrimitives.Header>
        <TablePrimitives.Body>
          {SUBMISSIONS.map((row) => {
            const record = { source, id: row.id };
            return (
              <TablePrimitives.Row key={row.id} interactive onClick={() => onOpenRecord(record)}>
                {selectable ? <SelectCell record={record} selectedIds={selectedIds} onToggleSelected={onToggleSelected} /> : null}
                <TablePrimitives.Cell># {row.id}</TablePrimitives.Cell>
                <TablePrimitives.Cell>{row.submitted}</TablePrimitives.Cell>
                <TablePrimitives.Cell truncate>{row.payer}</TablePrimitives.Cell>
                <TablePrimitives.Cell>
                  <Tag color="red" size="sm" icon="block" label={row.statusLabel} />
                </TablePrimitives.Cell>
                {onAppeal ? (
                  <TablePrimitives.Cell onClick={(event) => event.stopPropagation()}>
                    <Button variant="tertiary" size="sm" onClick={() => onAppeal(record)}>
                      Appeal
                    </Button>
                  </TablePrimitives.Cell>
                ) : null}
              </TablePrimitives.Row>
            );
          })}
        </TablePrimitives.Body>
      </TablePrimitives>
    );
  }

  if (source === "remittances") {
    return (
      <TablePrimitives columns={`${selectable ? "max-content " : ""}1fr max-content 1fr max-content`} size="compact" variant="fullPage">
        <TablePrimitives.Header>
          <TablePrimitives.Row>
            {selectable ? <TablePrimitives.Head aria-label="Select" /> : null}
            <TablePrimitives.Head>Payer</TablePrimitives.Head>
            <TablePrimitives.Head>Source</TablePrimitives.Head>
            <TablePrimitives.Head>Check date</TablePrimitives.Head>
            <TablePrimitives.Head>Paid</TablePrimitives.Head>
          </TablePrimitives.Row>
        </TablePrimitives.Header>
        <TablePrimitives.Body>
          {REMITTANCES.map((row) => {
            const record = { source, id: row.id };
            return (
              <TablePrimitives.Row key={row.id} interactive onClick={() => onOpenRecord(record)}>
                {selectable ? <SelectCell record={record} selectedIds={selectedIds} onToggleSelected={onToggleSelected} /> : null}
                <TablePrimitives.Cell truncate>{row.sentTo}</TablePrimitives.Cell>
                <TablePrimitives.Cell>{row.source}</TablePrimitives.Cell>
                <TablePrimitives.Cell>{row.checkDate}</TablePrimitives.Cell>
                <TablePrimitives.Cell>{row.insPaid}</TablePrimitives.Cell>
              </TablePrimitives.Row>
            );
          })}
        </TablePrimitives.Body>
      </TablePrimitives>
    );
  }

  if (source === "payments") {
    return (
      <TablePrimitives columns="1fr max-content max-content max-content max-content" size="compact" variant="fullPage">
        <TablePrimitives.Header>
          <TablePrimitives.Row>
            <TablePrimitives.Head>Name</TablePrimitives.Head>
            <TablePrimitives.Head>Kind</TablePrimitives.Head>
            <TablePrimitives.Head>Charges</TablePrimitives.Head>
            <TablePrimitives.Head>Paid</TablePrimitives.Head>
            <TablePrimitives.Head>Balance</TablePrimitives.Head>
          </TablePrimitives.Row>
        </TablePrimitives.Header>
        <TablePrimitives.Body>
          {PAYMENTS.map((row) => (
            <TablePrimitives.Row key={row.id} interactive onClick={() => onOpenRecord({ source, id: row.id })}>
              <TablePrimitives.Cell>{row.label}</TablePrimitives.Cell>
              <TablePrimitives.Cell>{row.kind}</TablePrimitives.Cell>
              <TablePrimitives.Cell>{row.charges}</TablePrimitives.Cell>
              <TablePrimitives.Cell>{row.paid}</TablePrimitives.Cell>
              <TablePrimitives.Cell>{row.balance}</TablePrimitives.Cell>
            </TablePrimitives.Row>
          ))}
        </TablePrimitives.Body>
      </TablePrimitives>
    );
  }

  if (source === "attachments") {
    return (
      <TablePrimitives columns="minmax(0, 1fr) max-content max-content" size="compact" variant="fullPage">
        <TablePrimitives.Header>
          <TablePrimitives.Row>
            <TablePrimitives.Head>Name</TablePrimitives.Head>
            <TablePrimitives.Head>Type</TablePrimitives.Head>
            <TablePrimitives.Head>Date</TablePrimitives.Head>
          </TablePrimitives.Row>
        </TablePrimitives.Header>
        <TablePrimitives.Body>
          {ATTACHMENTS.map((row) => (
            <TablePrimitives.Row key={row.id} interactive onClick={() => onOpenRecord({ source, id: row.id })}>
              <TablePrimitives.Cell truncate>{row.name}</TablePrimitives.Cell>
              <TablePrimitives.Cell>{row.type}</TablePrimitives.Cell>
              <TablePrimitives.Cell>{row.date}</TablePrimitives.Cell>
            </TablePrimitives.Row>
          ))}
        </TablePrimitives.Body>
      </TablePrimitives>
    );
  }

  return (
    <TablePrimitives columns="max-content 1fr 1fr max-content" size="compact" variant="fullPage">
      <TablePrimitives.Header>
        <TablePrimitives.Row>
          <TablePrimitives.Head>Claim</TablePrimitives.Head>
          <TablePrimitives.Head>Status</TablePrimitives.Head>
          <TablePrimitives.Head>Provider</TablePrimitives.Head>
          <TablePrimitives.Head>Date of service</TablePrimitives.Head>
        </TablePrimitives.Row>
      </TablePrimitives.Header>
      <TablePrimitives.Body>
        {SIMILAR_CLAIMS.map((row) => (
          <TablePrimitives.Row key={row.id} interactive onClick={() => onOpenRecord({ source, id: row.id })}>
            <TablePrimitives.Cell># {row.id}</TablePrimitives.Cell>
            <TablePrimitives.Cell truncate>{row.status}</TablePrimitives.Cell>
            <TablePrimitives.Cell truncate>{row.provider}</TablePrimitives.Cell>
            <TablePrimitives.Cell>{row.dateOfService}</TablePrimitives.Cell>
          </TablePrimitives.Row>
        ))}
      </TablePrimitives.Body>
    </TablePrimitives>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="vertical" gap={0.5}>
      <Typography variant="label-s" color="fg-secondary">
        {label}
      </Typography>
      <Typography variant="body-s">{value}</Typography>
    </Stack>
  );
}

export function RecordDetail({ record }: { record: RecordRef }) {
  const facts = recordFields(record);
  return (
    <Stack direction="vertical" gap={4}>
      {facts.map(([label, value]) => (
        <Fact key={label} label={label} value={value} />
      ))}
    </Stack>
  );
}

function recordFields({ source, id }: RecordRef): [string, string][] {
  if (source === "submissions") {
    const row = [...SUBMISSIONS, INITIAL_SUBMISSION].find((item) => item.id === id);
    if (!row) return [];
    return [
      ["Submission ID", row.id],
      ["Created", row.created],
      ["Submitted", row.submitted],
      ["Status", row.statusLabel],
      ["Charges", row.charges],
      ["Payer", row.payer],
      ["Member ID", row.memberId],
      ["Type", row.type],
      ["Method", row.method],
      ["Form type", row.formType],
      ["Submitted by", row.submittedBy],
    ];
  }
  if (source === "remittances") {
    const row = REMITTANCES.find((item) => item.id === id);
    if (!row) return [];
    return [
      ["Check number", row.checkNumber],
      ["Check date", row.checkDate],
      ["Insurance paid", row.insPaid],
      ["Patient responsibility", row.prAmount],
      ["Status", row.status],
      ["Payer", row.sentTo],
      ["Member ID", row.memberId],
      ["Source", row.source],
      ["Imported", row.importedDate],
      ["Adjustment", "CO-16, remark M76"],
    ];
  }
  if (source === "payments") {
    const row = PAYMENTS.find((item) => item.id === id);
    if (!row) return [];
    return [
      ["Name", row.label],
      ["Kind", row.kind],
      ["Charges", row.charges],
      ["Paid", row.paid],
      ["Balance", row.balance],
    ];
  }
  if (source === "attachments") {
    const row = ATTACHMENTS.find((item) => item.id === id);
    if (!row) return [];
    return [
      ["Name", row.name],
      ["Type", row.type],
      ["Document date", row.date],
      ["Tag", row.tag],
    ];
  }
  const row = SIMILAR_CLAIMS.find((item) => item.id === id);
  if (!row) return [];
  return [
    ["Claim ID", row.id],
    ["Status", row.status],
    ["Stage", row.stage],
    ["Provider", row.provider],
    ["Date of service", row.dateOfService],
  ];
}

export function DiagnosisCodes() {
  return (
    <TablePrimitives columns="max-content 1fr" size="compact" variant="fullPage">
      <TablePrimitives.Header>
        <TablePrimitives.Row>
          <TablePrimitives.Head>Code</TablePrimitives.Head>
          <TablePrimitives.Head>Description</TablePrimitives.Head>
        </TablePrimitives.Row>
      </TablePrimitives.Header>
      <TablePrimitives.Body>
        {DIAGNOSES.map((row) => (
          <TablePrimitives.Row key={row.code}>
            <TablePrimitives.Cell>
              <Typography variant="label-s" color="fg-accent">
                {row.code}
              </Typography>
            </TablePrimitives.Cell>
            <TablePrimitives.Cell>{row.description}</TablePrimitives.Cell>
          </TablePrimitives.Row>
        ))}
      </TablePrimitives.Body>
    </TablePrimitives>
  );
}

function DetailGroup({ title, fields }: { title: string; fields: [string, string][] }) {
  return (
    <Stack direction="vertical" gap={3}>
      <Typography variant="label-m">{title}</Typography>
      <Grid columns={2} gap={3}>
        {fields.map(([label, value]) => (
          <Fact key={label} label={label} value={value} />
        ))}
      </Grid>
    </Stack>
  );
}

function ClaimDetails() {
  const additional = CLAIM_DETAIL_GROUPS.find((group) => group.title === "Additional details");
  const groups = CLAIM_DETAIL_GROUPS.filter((group) => group.title !== "Additional details");

  return (
    <Stack direction="vertical" gap={5}>
      {groups.map((group) => (
        <DetailGroup key={group.title} title={group.title} fields={group.fields} />
      ))}
      <div data-section="diagnosis">
        <Stack direction="vertical" gap={3}>
          <Typography variant="label-m">Diagnosis codes</Typography>
          <DiagnosisCodes />
        </Stack>
      </div>
      <Stack direction="vertical" gap={3}>
        <Typography variant="label-m">Procedures</Typography>
        <TablePrimitives columns="max-content 1fr max-content max-content" size="compact" variant="fullPage">
          <TablePrimitives.Header>
            <TablePrimitives.Row>
              <TablePrimitives.Head>Code</TablePrimitives.Head>
              <TablePrimitives.Head>Description</TablePrimitives.Head>
              <TablePrimitives.Head>Modifiers</TablePrimitives.Head>
              <TablePrimitives.Head>Charge</TablePrimitives.Head>
            </TablePrimitives.Row>
          </TablePrimitives.Header>
          <TablePrimitives.Body>
            {PROCEDURES.map((row) => (
              <TablePrimitives.Row key={row.code}>
                <TablePrimitives.Cell>
                  <Typography variant="label-s" color="fg-accent">
                    {row.code}
                  </Typography>
                </TablePrimitives.Cell>
                <TablePrimitives.Cell>{row.description}</TablePrimitives.Cell>
                <TablePrimitives.Cell>{row.modifiers}</TablePrimitives.Cell>
                <TablePrimitives.Cell>{row.charge}</TablePrimitives.Cell>
              </TablePrimitives.Row>
            ))}
          </TablePrimitives.Body>
        </TablePrimitives>
      </Stack>
      {additional ? <DetailGroup title={additional.title} fields={additional.fields} /> : null}
    </Stack>
  );
}

export type ActivityNote = { id: string; name: string; initials: string; text: string; time: string };

export type ActivityChoice = { id: string; label: string; fact: string; icon: IconName };

function EditableNote({
  note,
  onEdit,
  onDelete,
}: {
  note: ActivityNote;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);

  if (editing) {
    return (
      <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
        <Stack direction="vertical" gap={2}>
          <Textarea
            aria-label="Edit note"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
          />
          <Stack direction="horizontal" gap={1}>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                setDraft(note.text);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!draft.trim()}
              onClick={() => {
                onEdit(note.id, draft.trim());
                setEditing(false);
              }}
            >
              Save note
            </Button>
          </Stack>
        </Stack>
      </div>
    );
  }

  return (
    <Stack direction="vertical" gap={1}>
      <ActivityFeed.Comment>{note.text}</ActivityFeed.Comment>
      <div onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
        <Menu>
          <Menu.Trigger
            render={<IconButton icon="more_horiz" size="xs" variant="default" aria-label={`Actions for note from ${note.name}`} />}
          />
          <Menu.Content>
            <Menu.Item
              onClick={() => {
                setDraft(note.text);
                setEditing(true);
              }}
            >
              <Menu.Item.LeftIcon icon="edit" />
              <Menu.Item.Label>Edit note</Menu.Item.Label>
            </Menu.Item>
            <Menu.Item danger onClick={() => onDelete(note.id)}>
              <Menu.Item.LeftIcon icon="delete" />
              <Menu.Item.Label>Delete note</Menu.Item.Label>
            </Menu.Item>
          </Menu.Content>
        </Menu>
      </div>
    </Stack>
  );
}

function ActivityChoiceItem({
  id,
  label,
  fact,
  chipIcon,
  selectedId,
  onSelect,
  ...props
}: {
  id: string;
  label: string;
  fact: string;
  chipIcon: IconName;
  selectedId?: string | null;
  onSelect?: (item: ActivityChoice) => void;
} & Omit<ComponentProps<typeof ActivityFeed.Item>, "onSelect">) {
  const selected = selectedId === id;
  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-pressed={onSelect ? selected : undefined}
      aria-label={onSelect ? `Select ${label}` : undefined}
      onClick={onSelect ? () => onSelect({ id, label, fact, icon: chipIcon }) : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect({ id, label, fact, icon: chipIcon });
              }
            }
          : undefined
      }
      style={
        onSelect
          ? {
              width: "100%",
              cursor: "pointer",
              borderRadius: "var(--ds-radius-semi-soft)",
              outline: selected ? "2px solid var(--ds-color-border-accent-strong)" : undefined,
            }
          : undefined
      }
    >
      <ActivityFeed.Item {...props} />
    </div>
  );
}

export function ActivityTimeline({
  notes = [],
  selectedId = null,
  onSelect,
  onEditNote,
  onDeleteNote,
}: {
  notes?: ActivityNote[];
  selectedId?: string | null;
  onSelect?: (item: ActivityChoice) => void;
  onEditNote?: (id: string, text: string) => void;
  onDeleteNote?: (id: string) => void;
}) {
  const choice = { selectedId, onSelect };
  return (
    <ActivityFeed>
      <ActivityChoiceItem
        {...choice}
        id="appointment"
        label="Appointment occurred"
        fact="Appointment occurred, 3 weeks ago."
        chipIcon="event"
        icon={<Icon icon="event" size={1} />}
        subject="Appointment"
        action="occurred"
        timestamp="3 weeks ago"
      />
      <ActivityChoiceItem
        {...choice}
        id="record"
        label="Medical record attached"
        fact="Medical record ClinicalNote.pdf was attached to the claim, 3 weeks ago."
        chipIcon="attach_file"
        icon={<Icon icon="attach_file" size={1} />}
        subject="Medical record"
        action="attached to claim"
        timestamp="3 weeks ago"
        content={<ActivityFeed.FileAttachment name="ClinicalNote.pdf" />}
      />
      <ActivityChoiceItem
        {...choice}
        id="stage"
        label="Stage set to Payer 1"
        fact="Claim stage was set to Payer 1, 3 weeks ago."
        chipIcon="flag"
        icon={<Icon icon="flag" size={1} />}
        subject={
          <>
            Claim stage set to <Tag color="neutral" size="sm" label="Payer 1" />
          </>
        }
        action=""
        timestamp="3 weeks ago"
      />
      <ActivityChoiceItem
        {...choice}
        id="submitted"
        label="Submitted for $386.00"
        fact="Claim submitted for $386.00 to Iowa Blue Shield, 3 weeks ago."
        chipIcon="send"
        icon={<Icon icon="send" size={1} />}
        subject="Claim submitted"
        action="for $386.00 to Iowa Blue Shield"
        timestamp="3 weeks ago"
      />
      <ActivityChoiceItem
        {...choice}
        id="remit"
        label="Remittance received"
        fact="Iowa Blue Shield remittance received: $0.00 paid (CO-16, M76), 2 weeks ago."
        chipIcon="request_quote"
        icon={<Icon icon="request_quote" size={1} />}
        subject="Iowa Blue Shield"
        action="remittance received: $0.00 paid (CO-16, M76)"
        timestamp="2 weeks ago"
      />
      <ActivityChoiceItem
        {...choice}
        id="status"
        label="Status set to Full denials"
        fact="Claim status was set to Full denials, 2 weeks ago."
        chipIcon="block"
        icon={<Icon icon="block" size={1} />}
        subject={
          <>
            Claim status set to <Tag color="red" size="sm" icon="block" label="Full denials" />
          </>
        }
        action=""
        timestamp="2 weeks ago"
      />
      <ActivityChoiceItem
        {...choice}
        id="note-sam"
        label="Note from Sam Patel"
        fact="Sam Patel, 2 days ago: The diagnosis looks incomplete. Preparing a correction."
        chipIcon="edit_note"
        icon={<Avatar label="SP" size="xs" />}
        subject="Sam Patel"
        action="left a note"
        timestamp="2 days ago"
        content={<ActivityFeed.Comment>The diagnosis looks incomplete. Preparing a correction.</ActivityFeed.Comment>}
      />
      <ActivityChoiceItem
        {...choice}
        id="note-riley"
        label="Note from Riley Chen"
        fact="Riley Chen, 1 day ago: Acknowledged. Thanks for the update."
        chipIcon="edit_note"
        icon={<Avatar label="RC" size="xs" />}
        subject="Riley Chen"
        action="left a note"
        timestamp="1 day ago"
        showConnector={notes.length > 0}
        content={<ActivityFeed.Comment>Acknowledged. Thanks for the update.</ActivityFeed.Comment>}
      />
      {notes.map((note, index) => (
        <ActivityChoiceItem
          {...choice}
          key={note.id}
          id={note.id}
          label={`Note from ${note.name}`}
          fact={`${note.name}, ${note.time}: ${note.text}`}
          chipIcon="edit_note"
          icon={<Avatar label={note.initials} size="xs" />}
          subject={note.name}
          action="left a note"
          timestamp={note.time}
          showConnector={index < notes.length - 1}
          content={
            onEditNote && onDeleteNote ? (
              <EditableNote note={note} onEdit={onEditNote} onDelete={onDeleteNote} />
            ) : (
              <ActivityFeed.Comment>{note.text}</ActivityFeed.Comment>
            )
          }
        />
      ))}
    </ActivityFeed>
  );
}

function ActivityList() {
  return <ActivityTimeline />;
}
