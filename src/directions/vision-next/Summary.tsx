import { useState, type MouseEvent, type ReactNode } from "react";
import { Button, Card, Chip, Divider, IconButton, Link, Stack, Typography } from "@getathelas/ui";

type Props = {
  selected: "summary" | "action" | null;
  onSelectSummary: () => void;
  onSelectAction: () => void;
  onOpenInitialSubmission: () => void;
  onOpenRemittance: () => void;
  onOpenDiagnosisCodes: () => void;
  onAccept: () => void;
  onResubmit: () => void;
};

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

const selectedOutline = "2px solid var(--ds-color-border-accent-strong)";

export function Summary({
  selected,
  onSelectSummary,
  onSelectAction,
  onOpenInitialSubmission,
  onOpenRemittance,
  onOpenDiagnosisCodes,
  onAccept,
  onResubmit,
}: Props) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [actionLiked, setActionLiked] = useState(false);
  const [showChanges, setShowChanges] = useState(true);
  const [accepted, setAccepted] = useState(false);

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
              This claim was fully <Typography variant="body-m" color="fg-semantic-danger">denied</Typography>.
              Rock Valley Physical Therapy and Therapy Services billed Iowa Blue Shield $386.00 for four therapy lines
              on October 7, 2026.{" "}
              <SummaryLink onOpen={onOpenInitialSubmission}>The initial claim went out on October 9, 2026</SummaryLink>,
              and{" "}
              <SummaryLink onOpen={onOpenRemittance}>Iowa Blue Shield's remittance dated October 14, 2026</SummaryLink>{" "}
              denied all four lines — 97110, 97112, 97140, and 97161 — under CO-16 (claim lacks information or has a
              billing error) with remark M76 (missing, incomplete, or invalid diagnosis or condition). Nothing has been
              paid, and the full $346.00 balance remains open.
            </Typography>
          </Stack>
          <Stack direction="vertical" gap={1}>
            <Typography variant="label-m">What to do next</Typography>
            <Typography variant="body-m" render={<p style={{ margin: 0 }} />}>
              Review the <SummaryLink onOpen={onOpenDiagnosisCodes}>diagnosis codes</SummaryLink> submitted on this
              claim. Iowa Blue Shield's denial under CO-16 with remark M76 points specifically to a problem with the
              diagnosis or condition information, not the procedure codes themselves. Correct whichever diagnosis is
              missing, incomplete, or invalid and resubmit to Iowa Blue Shield. If all three codes look correct as
              submitted, contact the payer to confirm what specific information they require before resubmitting.
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
            <Card floating padding="sm" radius="lg">
              <Stack direction="vertical" gap={1}>
                <Stack direction="horizontal" align="center" gap={2}>
                  <Stack.Item grow>
                    <Typography variant="label-s">Replace M54.5 with M54.50</Typography>
                  </Stack.Item>
                  <Stack direction="horizontal" align="center" gap={2} onClick={(event) => event.stopPropagation()}>
                    <Button
                      variant="neutral"
                      size="sm"
                      icon="history"
                      aria-pressed={showChanges}
                      onClick={() => setShowChanges((value) => !value)}
                    >
                      Changes
                    </Button>
                    <Divider orientation="vertical" />
                    <IconButton
                      icon="thumb_up"
                      size="sm"
                      variant={actionLiked ? "strong-accent" : "subtle-accent"}
                      aria-label="Like this suggestion"
                      aria-pressed={actionLiked}
                      onClick={() => setActionLiked((value) => !value)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={accepted ? "check" : undefined}
                      disabled={accepted}
                      onClick={() => {
                        setAccepted(true);
                        onAccept();
                      }}
                    >
                      {accepted ? "Accepted" : "Accept"}
                    </Button>
                  </Stack>
                </Stack>
                <Typography variant="body-s">
                  The evaluation documents left knee pain and gait abnormality as treated conditions. Replace M62.81
                  with M25.562 and add R26.89 as a secondary diagnosis to support medical necessity.
                </Typography>
                {showChanges ? (
                  <Stack direction="vertical" gap={1}>
                    <Typography variant="label-s">What will change</Typography>
                    <Stack direction="horizontal">
                      <Chip variant="neutral" size="sm" label="Mod: RT, XS, 24 → RT, XS, 79" />
                    </Stack>
                  </Stack>
                ) : null}
              </Stack>
            </Card>
          </div>
        </Stack>

        <Stack direction="horizontal" gap={2} align="center">
          <Typography variant="label-s">2.</Typography>
          <div style={{ flex: 1, minWidth: 0 }} onClick={(event: MouseEvent) => event.stopPropagation()}>
            <Card floating padding="sm" radius="lg">
              <Stack direction="horizontal">
                <Button variant="primary" size="sm" icon="check_circle" onClick={onResubmit}>
                  Resubmit to Iowa Blue Shield
                </Button>
              </Stack>
            </Card>
          </div>
        </Stack>
      </Stack>
    </div>
  );
}
