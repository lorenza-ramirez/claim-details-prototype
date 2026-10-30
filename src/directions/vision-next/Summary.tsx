import { useState, type MouseEvent, type ReactNode } from "react";
import { Button, Card, Divider, IconButton, Link, Popover, Stack, Tag, Typography } from "@getathelas/ui";
import { TruncatedChip } from "../../components/not-in-ds/TruncatedChip";
import { CLAIM_ID, claimCase, type ClaimCase } from "../../mock/claim";

type Props = {
  claimId?: string;
  selected: "summary" | "action" | null;
  accepted: boolean;
  resubmitAccepted: boolean;
  onSelectSummary: () => void;
  onSelectAction: () => void;
  onOpenInitialSubmission: () => void;
  onOpenRemittance: () => void;
  onOpenDiagnosisCodes: () => void;
  onAccept: () => void;
  onAcceptResubmit: () => void;
  onViewMedicalRecord: () => void;
};

type Links = Pick<Props, "onOpenInitialSubmission" | "onOpenRemittance" | "onOpenDiagnosisCodes">;

type StatusReason = { title: string; detail: string };

type SummaryContent = {
  where: (links: Links) => ReactNode;
  next: (links: Links) => ReactNode;
  action: { title: string; why: ReactNode; change: string };
  resubmit: { title: string; why: string };
};

function ReasonBlock({ title, detail }: StatusReason) {
  const [open, setOpen] = useState(false);
  const preview = detail.length > 90 ? `${detail.slice(0, 90).trim()}...` : detail;
  return (
    <Stack direction="vertical" gap={1} padding={3}>
      <Typography variant="label-m">{title}</Typography>
      <Typography variant="body-s">{open ? detail : preview}</Typography>
      {detail.length > 90 ? (
        <Link
          href="#"
          color="accent"
          suffixIcon={open ? "keyboard_arrow_up" : "keyboard_arrow_down"}
          onClick={(event: MouseEvent) => {
            event.preventDefault();
            setOpen((value) => !value);
          }}
        >
          {open ? "Less" : "More"}
        </Link>
      ) : null}
    </Stack>
  );
}

function DeniedStatus({ reasons }: { reasons: StatusReason[] }) {
  return (
    <Popover>
      <Popover.Trigger
        openOnHover
        closeDelay={120}
        nativeButton={false}
        render={<Typography variant="body-m" color="fg-semantic-danger" render={<span style={{ cursor: "help" }} />} />}
      >
        denied
      </Popover.Trigger>
      <Popover.Content side="bottom" align="start" padding={false}>
        <div style={{ width: "22rem" }}>
          <Stack direction="horizontal" align="center" gap={2} padding={3}>
            <Typography variant="label-l">Status reason</Typography>
            <Stack.Item grow />
            <Tag color="red" size="sm" icon="cancel" label="Denied" />
          </Stack>
          {reasons.map((reason) => (
            <div key={reason.title}>
              <Divider />
              <ReasonBlock title={reason.title} detail={reason.detail} />
            </div>
          ))}
        </div>
      </Popover.Content>
    </Popover>
  );
}

function SummaryLink({ children, onOpen }: { children: ReactNode; onOpen: () => void }) {
  return (
    <Link
      href="#"
      color="accent"
      suffixIcon="arrow_outward"
      onClick={(event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onOpen();
      }}
    >
      {children}
    </Link>
  );
}

const FIRST_CLAIM_REASONS: StatusReason[] = [
  {
    title: "CO-16",
    detail:
      "Claim lacks information or has a billing error. Iowa Blue Shield denied lines 97110, 97112, 97140, and 97161, and nothing has been paid.",
  },
  {
    title: "M76",
    detail:
      "Missing, incomplete, or invalid diagnosis or condition. Review the diagnosis codes and correct whichever one the payer rejected before resubmitting.",
  },
];

const SUMMARIES: Record<string, SummaryContent> = {
  default: {
    where: (links) => (
      <>
        This claim was fully <DeniedStatus reasons={FIRST_CLAIM_REASONS} />. Rock Valley Physical Therapy and Therapy Services billed Iowa Blue Shield $386.00
        for four therapy lines on October 7, 2026.{" "}
        <SummaryLink onOpen={links.onOpenInitialSubmission}>The initial claim went out on October 9, 2026</SummaryLink>,
        and{" "}
        <SummaryLink onOpen={links.onOpenRemittance}>Iowa Blue Shield's remittance dated October 14, 2026</SummaryLink>{" "}
        denied all four lines — 97110, 97112, 97140, and 97161 — under CO-16 (claim lacks information or has a billing
        error) with remark M76 (missing, incomplete, or invalid diagnosis or condition). Nothing has been paid, and the
        full $346.00 balance remains open.
      </>
    ),
    next: (links) => (
      <>
        Review the <SummaryLink onOpen={links.onOpenDiagnosisCodes}>diagnosis codes</SummaryLink> submitted on this claim.
        Iowa Blue Shield's denial under CO-16 with remark M76 points specifically to a problem with the diagnosis or
        condition information, not the procedure codes themselves. Correct whichever diagnosis is missing, incomplete, or
        invalid and resubmit to Iowa Blue Shield. If all three codes look correct as submitted, contact the payer to
        confirm what specific information they require before resubmitting.
      </>
    ),
    action: {
      title: "Update 20680",
      why: (
        <>
          CO-4/N657: modifier 24 is an E/M-only modifier and is invalid on surgical CPT 20680. The hardware removal in
          the right forearm is unrelated to the prior 27650 surgery, so modifier 79 replaces 24. RT and XS stay as
          billed.
        </>
      ),
      change: "Mod: RT, XS, 24 → RT, XS, 79",
    },
    resubmit: {
      title: "Resubmit to Iowa Blue Shield",
      why: "The modifier change is ready. Resubmit the corrected claim to Iowa Blue Shield.",
    },
  },
};

const COUNT_WORDS = ["no", "one", "two", "three", "four", "five"];

function listLines(lines: string[]) {
  if (lines.length === 1) return lines[0];
  return `${lines.slice(0, -1).join(", ")}${lines.length > 2 ? "," : ""} and ${lines[lines.length - 1]}`;
}

function caseSummary(c: ClaimCase): SummaryContent {
  const count = COUNT_WORDS[c.lines.length] ?? String(c.lines.length);
  const all = c.lines.length === 2 ? "both lines" : `all ${count} lines`;
  return {
    where: () => (
      <>
        This claim was fully <DeniedStatus
          reasons={[
            {
              title: c.denial,
              detail: `${c.payer} denied ${listLines(c.lines)} on ${c.serviceDate}. ${c.problem} Nothing has been paid, and the full ${c.amount} balance remains open.`,
            },
            { title: c.action.title, detail: c.action.why },
          ]}
        />. {c.provider} billed {c.payer} {c.amount} for {count} therapy lines on{" "}
        {c.serviceDate}. The initial claim went out on {c.submittedDate}, and {c.payer}'s remittance dated {c.remitDate}{" "}
        denied {all} — {listLines(c.lines)} — under {c.denial}. Nothing has been paid, and the full {c.amount} balance
        remains open.
      </>
    ),
    next: () => <>{c.nextStep}</>,
    action: { title: c.action.title, why: c.action.why, change: c.action.change },
    resubmit: {
      title: `Resubmit to ${c.payer}`,
      why: `The correction is ready. Resubmit the corrected claim to ${c.payer}.`,
    },
  };
}

export function summaryFor(claimId?: string) {
  return claimId && claimId !== CLAIM_ID ? caseSummary(claimCase(claimId)) : SUMMARIES.default;
}

const selectedOutline = "2px solid var(--ds-color-border-accent-strong)";

export function Summary({
  claimId,
  selected,
  accepted,
  resubmitAccepted,
  onSelectSummary,
  onSelectAction,
  onOpenInitialSubmission,
  onOpenRemittance,
  onOpenDiagnosisCodes,
  onAccept,
  onAcceptResubmit,
  onViewMedicalRecord,
}: Props) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [actionFeedback, setActionFeedback] = useState<"up" | "down" | null>(null);
  const content = summaryFor(claimId);
  const links = { onOpenInitialSubmission, onOpenRemittance, onOpenDiagnosisCodes };

  return (
    <div
      onClick={onSelectSummary}
      style={{
        background: "var(--ds-color-accent-25)",
        border: "1px solid var(--ds-color-border-subtle)",
        borderRadius: "var(--ds-radius-round)",
        outline: selected === "summary" ? selectedOutline : undefined,
        cursor: "pointer",
      }}
    >
      <Stack direction="vertical" gap={3} paddingTop={2} paddingBottom={2} paddingHorizontal={4}>
        <Stack paddingVertical={1}>
          <Typography variant="label-l" render={<h2 style={{ margin: 0 }} />}>
            Summary
          </Typography>
        </Stack>
        <Stack direction="vertical" gap={2}>
          <Stack direction="vertical" gap={1}>
            <Typography variant="label-m">Where things stand</Typography>
            <Typography variant="body-m" render={<p style={{ margin: 0 }} />}>
              {content.where(links)}
            </Typography>
          </Stack>
          <Stack direction="vertical" gap={1}>
            <Typography variant="label-m">What to do next</Typography>
            <Typography variant="body-m" render={<p style={{ margin: 0 }} />}>
              {content.next(links)}
            </Typography>
          </Stack>
          <Stack direction="horizontal" gap={2} onClick={(event) => event.stopPropagation()}>
            <IconButton
              icon="thumb_up"
              size="sm"
              variant={feedback === "up" ? "subtle-accent" : "default"}
              aria-label="Good response"
              aria-pressed={feedback === "up"}
              onClick={() => setFeedback((value) => (value === "up" ? null : "up"))}
            />
            <IconButton
              icon="thumb_down"
              size="sm"
              variant={feedback === "down" ? "subtle-accent" : "default"}
              aria-label="Bad response"
              aria-pressed={feedback === "down"}
              onClick={() => setFeedback((value) => (value === "down" ? null : "down"))}
            />
          </Stack>
        </Stack>
      </Stack>

      <Divider />

      <Stack direction="vertical" gap={3} padding={4}>
        <Typography variant="label-s" color="fg-secondary">
          Suggested actions
        </Typography>

        <Stack direction="horizontal" gap={2} align="start">
          <Typography variant="label-s">1.</Typography>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              borderRadius: "var(--ds-radius-extra-soft)",
              outline: selected === "action" ? selectedOutline : undefined,
            }}
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
              onSelectAction();
            }}
          >
            <Card floating padding="md" radius="md">
              <Stack direction="vertical" gap={2}>
                <Stack direction="horizontal" align="center" gap={2}>
                  <Stack.Item grow>
                    <Stack direction="horizontal" align="center" gap={0.5}>
                      <Typography variant="label-m">{content.action.title}</Typography>
                      <IconButton
                        icon="thumb_up"
                        size="xs"
                        variant={actionFeedback === "up" ? "subtle-accent" : "default"}
                        aria-label="Like this suggestion"
                        aria-pressed={actionFeedback === "up"}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActionFeedback((value) => (value === "up" ? null : "up"));
                        }}
                      />
                      <IconButton
                        icon="thumb_down"
                        size="xs"
                        variant={actionFeedback === "down" ? "subtle-accent" : "default"}
                        aria-label="Dislike this suggestion"
                        aria-pressed={actionFeedback === "down"}
                        onClick={(event) => {
                          event.stopPropagation();
                          setActionFeedback((value) => (value === "down" ? null : "down"));
                        }}
                      />
                    </Stack>
                  </Stack.Item>
                  <Stack direction="horizontal" align="center" gap={0.5} onClick={(event) => event.stopPropagation()}>
                    <Button variant="tertiary" size="sm" icon="link" onClick={onViewMedicalRecord}>
                      View medical record
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={accepted}
                      onClick={onAccept}
                    >
                      {accepted ? "Accepted" : "Accept"}
                    </Button>
                  </Stack>
                </Stack>
                <Typography variant="body-s" render={<p style={{ margin: 0 }} />}>
                  <Typography variant="label-s">Why this action is suggested:</Typography> {content.action.why}
                </Typography>
                <Divider />
                <Stack direction="horizontal" align="center" gap={1} wrap="wrap">
                  <Typography variant="label-s">What will change:</Typography>
                  <span style={{ display: "flex", minWidth: 0, flex: "1 1 auto" }}>
                    <TruncatedChip label={content.action.change} />
                  </span>
                </Stack>
              </Stack>
            </Card>
          </div>
        </Stack>

        <Stack direction="horizontal" gap={2} align="start">
          <Typography variant="label-s">2.</Typography>
          <div style={{ flex: 1, minWidth: 0 }} onClick={(event: MouseEvent) => event.stopPropagation()}>
            <Card floating padding="md" radius="md">
              <Stack direction="vertical" gap={2}>
                <Stack direction="horizontal" align="center" gap={2}>
                  <Stack.Item grow>
                    <Typography variant="label-m">{content.resubmit.title}</Typography>
                  </Stack.Item>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!accepted || resubmitAccepted}
                    onClick={onAcceptResubmit}
                  >
                    {resubmitAccepted ? "Accepted" : "Accept"}
                  </Button>
                </Stack>
                <Typography variant="body-s" render={<p style={{ margin: 0 }} />}>
                  <Typography variant="label-s">Why this action is suggested:</Typography> {content.resubmit.why}
                </Typography>
              </Stack>
            </Card>
          </div>
        </Stack>
      </Stack>
    </div>
  );
}

export function ThreadNotice({
  title,
  description,
  nextAction,
}: {
  title: string;
  description: string;
  nextAction?: { title: string; description: string; accepted: boolean; onAccept: () => void };
}) {
  return (
    <Stack direction="vertical" gap={2}>
      <Typography variant="label-xs" color="fg-tertiary">
        Athelas AI
      </Typography>
      <Typography variant="body-m">{title}.</Typography>
      <Card floating padding="md" radius="md">
        <Stack direction="vertical" gap={3}>
          <Stack direction="horizontal" align="center" gap={2}>
            <Tag color="green" size="sm" label="Approved" />
            <Typography variant="body-s" color="fg-secondary">
              {description}
            </Typography>
          </Stack>
          {nextAction ? (
            <>
              <Divider />
              <Stack direction="vertical" gap={2}>
                <Typography variant="label-s" color="fg-secondary">
                  Next suggested action
                </Typography>
                <Stack direction="horizontal" align="center" gap={2}>
                  <Stack.Item grow>
                    <Typography variant="label-m">{nextAction.title}</Typography>
                  </Stack.Item>
                  <Button variant="secondary" size="sm" disabled={nextAction.accepted} onClick={nextAction.onAccept}>
                    {nextAction.accepted ? "Accepted" : "Accept"}
                  </Button>
                </Stack>
                <Typography variant="body-s" color="fg-secondary">
                  {nextAction.description}
                </Typography>
              </Stack>
            </>
          ) : null}
        </Stack>
      </Card>
    </Stack>
  );
}

export function NextClaimPrompt({
  claimId,
  choice,
  onLoad,
  onStay,
}: {
  claimId: string;
  choice: "load" | "stay" | null;
  onLoad: () => void;
  onStay: () => void;
}) {
  const next = claimCase(claimId);
  const count = COUNT_WORDS[next.lines.length] ?? String(next.lines.length);
  return (
    <Stack direction="vertical" gap={2}>
      <Typography variant="label-xs" color="fg-tertiary">
        Athelas AI
      </Typography>
      <Typography variant="body-m">This claim is updated. Load the next claim in the queue?</Typography>
      <Card floating padding="md" radius="md">
        <Stack direction="vertical" gap={2}>
          <Stack direction="horizontal" align="center" gap={2}>
            <Typography variant="label-m">Claim {claimId}</Typography>
            <Tag color="red" size="sm" label="Denied" />
            <Stack.Item grow />
            <Typography variant="label-s">{next.amount}</Typography>
          </Stack>
          <Typography variant="body-s" color="fg-secondary">
            {next.payer} denied {count} therapy lines on {next.serviceDate}. {next.problem}
          </Typography>
          {choice == null ? (
            <Stack direction="horizontal" gap={2}>
              <Button variant="primary" size="sm" onClick={onLoad}>
                Load next claim
              </Button>
              <Button variant="tertiary" size="sm" onClick={onStay}>
                Stay here
              </Button>
            </Stack>
          ) : (
            <Typography variant="body-s">
              {choice === "load" ? `Loaded claim ${claimId}.` : "Staying on this claim."}
            </Typography>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
