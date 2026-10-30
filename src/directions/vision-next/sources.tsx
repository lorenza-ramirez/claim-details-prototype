import { Checkbox, Stack, TablePrimitives, Tag, Typography } from "@getathelas/ui";
import type { IconProps } from "@getathelas/ui";
import {
  ACTIVITY,
  ATTACHMENTS,
  DIAGNOSES,
  PAYMENTS,
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

// The list view for a source: shown in chat widgets and in the source drawer.
export function SourceTable({ source, onOpenRecord, selectedIds, onToggleSelected }: TableProps) {
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
      <TablePrimitives columns={`${selectable ? "max-content " : ""}1fr 1fr 1fr max-content`} size="compact" variant="fullPage">
        <TablePrimitives.Header>
          <TablePrimitives.Row>
            {selectable ? <TablePrimitives.Head aria-label="Select" /> : null}
            <TablePrimitives.Head>Submission</TablePrimitives.Head>
            <TablePrimitives.Head>Submitted</TablePrimitives.Head>
            <TablePrimitives.Head>Payer</TablePrimitives.Head>
            <TablePrimitives.Head>Status</TablePrimitives.Head>
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

function ClaimDetails() {
  return (
    <Stack direction="vertical" gap={5}>
      <Stack direction="vertical" gap={3}>
        <Typography variant="label-m">Claim</Typography>
        <Fact label="Billing provider" value="Rock Valley Physical Therapy and Therapy Services" />
        <Fact label="Payer" value="Iowa Blue Shield" />
        <Fact label="Date of service" value="10/07/2026" />
        <Fact label="Total charges" value="$386.00" />
      </Stack>
      <Stack direction="vertical" gap={3}>
        <Typography variant="label-m">Diagnosis codes</Typography>
        <DiagnosisCodes />
      </Stack>
    </Stack>
  );
}

function ActivityList() {
  return (
    <Stack direction="vertical" gap={3}>
      {ACTIVITY.map((event) => (
        <Stack key={event.id} direction="horizontal" gap={3} align="start">
          <Stack.Item grow>
            <Typography variant="body-s">{event.text}</Typography>
          </Stack.Item>
          <Typography variant="supportive" color="fg-tertiary">
            {event.time}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
