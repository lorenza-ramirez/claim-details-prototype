import { useState, type DragEvent, type ReactNode } from "react";
import { Card, Chip, Disclosure, Divider, Grid, Icon, IconButton, Sidebar, Stack, Tag, Typography } from "@getathelas/ui";
import {
  ATTACHMENTS,
  CLAIM_PROPERTIES,
  CLAIM_PROPERTIES_AFTER_TAGS,
  CLAIM_QUEUE,
  INITIAL_SUBMISSION,
} from "../../mock/claim";
import { SOURCES, type SourceId } from "./sources";

// Fills the width of its ResizablePanel and scrolls on its own.
function PanelScroll({ children }: { children: ReactNode }) {
  return <div style={{ width: "var(--panel-width)", height: "100%", overflowY: "auto" }}>{children}</div>;
}

function PanelFrame({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", height: "100%" }}>{children}</div>;
}

export function QueuePanel({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <PanelFrame>
      <PanelScroll>
        <Stack direction="vertical" padding={1.5} gap={2}>
          <Stack direction="horizontal" align="center" gap={2} paddingHorizontal={2} paddingVertical={2}>
            <Icon icon="cancel_schedule_send" color="fg-semantic-danger" />
            <Typography variant="body-s" color="fg-secondary">
              {CLAIM_QUEUE.label} - {CLAIM_QUEUE.total}
            </Typography>
          </Stack>
          <Sidebar.Menu>
            {CLAIM_QUEUE.claims.map((claim) => (
              <Sidebar.Item key={claim.id} size="sm" isActive={claim.id === activeId} onClick={() => onSelect(claim.id)}>
                <Sidebar.Item.Label>Claim {claim.id}</Sidebar.Item.Label>
              </Sidebar.Item>
            ))}
          </Sidebar.Menu>
        </Stack>
      </PanelScroll>
      <Divider orientation="vertical" />
    </PanelFrame>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack direction="vertical" gap={0.5} paddingHorizontal={2} paddingVertical={1.5}>
      <Typography variant="label-s" color="fg-secondary">
        {label}
      </Typography>
      <Stack direction="horizontal" wrap="wrap" gap={2} align="center">
        {children}
      </Stack>
    </Stack>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Stack paddingHorizontal={2} paddingVertical={1}>
      <Typography variant="body-s" color="fg-tertiary">
        {children}
      </Typography>
    </Stack>
  );
}

type PropertiesProps = {
  activeSource: SourceId | null;
  onOpenSource: (source: SourceId) => void;
  onDragSource: (event: DragEvent, source: SourceId) => void;
  onDragEnd: () => void;
  onOpenLastSubmission: () => void;
  onOpenAttachment: (id: string) => void;
};

export function PropertiesPanel({
  activeSource,
  onOpenSource,
  onDragSource,
  onDragEnd,
  onOpenLastSubmission,
  onOpenAttachment,
}: PropertiesProps) {
  const [tags, setTags] = useState<string[]>(["Label"]);
  const clinicalNote = ATTACHMENTS.find((item) => item.id === "clinical-note");

  return (
    <PanelFrame>
      <Divider orientation="vertical" />
      <PanelScroll>
        <Stack direction="vertical" padding={1.5} gap={2}>
          <Disclosure header="Properties" size="sm" defaultOpen>
            <Grid columns={2} gap={0}>
              {CLAIM_PROPERTIES.map((item) => (
                <Field key={item.label} label={item.label}>
                  <Tag color={item.color} size="sm" label={item.value} />
                </Field>
              ))}
              <Field label="Tags">
                {tags.map((tag, index) => (
                  <Chip
                    key={`${tag}-${index}`}
                    size="sm"
                    icon="sell"
                    label={tag}
                    removable
                    onRemove={() => setTags((current) => current.filter((_, item) => item !== index))}
                  />
                ))}
                <IconButton
                  icon="add"
                  size="sm"
                  variant="subtle-accent"
                  aria-label="Add tag"
                  onClick={() => setTags((current) => [...current, `Label ${current.length + 1}`])}
                />
              </Field>
              {CLAIM_PROPERTIES_AFTER_TAGS.map((item) => (
                <Field key={item.label} label={item.label}>
                  <Tag color="neutral" size="sm" label={item.value} />
                </Field>
              ))}
            </Grid>
          </Disclosure>

          <Divider />

          <Stack direction="vertical" gap={1}>
            <SectionLabel>Sources</SectionLabel>
            <Sidebar.Menu>
              {SOURCES.map((source) => (
                <Sidebar.Item
                  key={source.id}
                  size="sm"
                  isActive={activeSource === source.id}
                  draggable
                  title="Open, or drag into the chat"
                  onClick={() => onOpenSource(source.id)}
                  onDragStart={(event) => onDragSource(event, source.id)}
                  onDragEnd={onDragEnd}
                >
                  <Sidebar.Item.Icon icon={source.icon} />
                  <Sidebar.Item.Label>{source.label}</Sidebar.Item.Label>
                </Sidebar.Item>
              ))}
            </Sidebar.Menu>
          </Stack>

          <Stack direction="vertical" gap={1}>
            <SectionLabel>Outputs</SectionLabel>
            <Sidebar.Menu>
              <Sidebar.Item size="sm" onClick={onOpenLastSubmission}>
                <Sidebar.Item.Icon icon="send" />
                <Sidebar.Item.Label>Last submission</Sidebar.Item.Label>
              </Sidebar.Item>
              {clinicalNote ? (
                <Sidebar.Item size="sm" onClick={() => onOpenAttachment(clinicalNote.id)}>
                  <Sidebar.Item.Icon icon="picture_as_pdf" />
                  <Sidebar.Item.Label>{clinicalNote.name}</Sidebar.Item.Label>
                </Sidebar.Item>
              ) : null}
            </Sidebar.Menu>
          </Stack>

          <Stack direction="vertical" gap={1}>
            <SectionLabel>Last submission</SectionLabel>
            <Card
              padding="lg"
              radius="lg"
              role="button"
              tabIndex={0}
              aria-label="Open last submission"
              onClick={onOpenLastSubmission}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onOpenLastSubmission();
              }}
            >
              <Stack direction="vertical" align="center" gap={2}>
                <Icon icon="description" size={2.5} color="fg-tertiary" />
                <Typography variant="label-s">cms-1500-{INITIAL_SUBMISSION.submitted.replaceAll("/", "-")}.pdf</Typography>
                <Typography variant="supportive" color="fg-tertiary">
                  Submitted to {INITIAL_SUBMISSION.payer}
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </Stack>
      </PanelScroll>
    </PanelFrame>
  );
}
