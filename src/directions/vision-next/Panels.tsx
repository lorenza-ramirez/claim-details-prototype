import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button, Card, Disclosure, Divider, Grid, Icon, IconButton, Sidebar, Stack, Typography } from "@getathelas/ui";
import { TruncatedChip, TruncatedTag } from "../../components/not-in-ds/TruncatedChip";
import {
  ATTACHMENTS,
  CLAIM_ID,
  claimProperties,
  CLAIM_QUEUE,
  INITIAL_SUBMISSION,
} from "../../mock/claim";
import { ActivityTimeline, RecordDetail, SELECTABLE_SOURCES, SOURCES, SourceTable, sourceInfo, type ActivityChoice, type ActivityNote, type RecordRef, type SourceId } from "./sources";

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
    <div style={{ minWidth: 0 }}>
      <Stack direction="vertical" gap={0.5} paddingHorizontal={2} paddingVertical={1.5}>
        <span style={{ color: "#666666" }}>
          <Typography variant="label-s">{label}</Typography>
        </span>
        <div style={{ maxWidth: "100%", minWidth: 0 }}>
          <Stack direction="horizontal" wrap="wrap" gap={2} align="center">
            {children}
          </Stack>
        </div>
      </Stack>
    </div>
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
  deferred?: boolean;
  claimId?: string;
};

export function PropertiesPanel({
  activeSource,
  onOpenSource,
  onDragSource,
  onDragEnd,
  onOpenLastSubmission,
  onOpenAttachment,
  deferred = false,
  claimId = CLAIM_ID,
}: PropertiesProps) {
  const [tags, setTags] = useState<string[]>(["Label"]);
  const { properties, afterTags } = claimProperties(claimId);
  const clinicalNote = ATTACHMENTS.find((item) => item.id === "clinical-note");

  return (
    <PanelFrame>
      <PanelScroll>
        <Stack direction="vertical" padding={1.5} gap={2}>
          <Disclosure header="Properties" size="sm" defaultOpen>
            <Grid columns={2} gap={0}>
              {properties.map((item) => (
                <Field key={item.label} label={item.label}>
                  <TruncatedTag
                    color={item.label === "Status" && deferred ? "violet" : item.color}
                    label={item.label === "Status" && deferred ? "Deferred" : item.value}
                  />
                </Field>
              ))}
              <Field label="Tags">
                {tags.map((tag, index) => (
                  <TruncatedChip
                    key={`${tag}-${index}`}
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
              {afterTags.map((item) => (
                <Field key={item.label} label={item.label}>
                  <TruncatedTag color="neutral" label={item.value} />
                </Field>
              ))}
            </Grid>
          </Disclosure>

          <Divider />

          <Stack direction="vertical" gap={1}>
            <SectionLabel>Sources</SectionLabel>
            <Stack paddingHorizontal={2}>
              <Typography variant="supportive" color="fg-tertiary">
                Drag and drop a source into the chat.
              </Typography>
            </Stack>
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

const TABLE_SOURCES = new Set<SourceId>(["submissions", "remittances", "payments", "attachments", "similar-claims"]);

// The right menu, collapsed to icons, once one source is open.
export function SourceRail({
  active,
  propertiesActive,
  onSelect,
  onShowProperties,
  onClose,
  onDragSource,
  onDragEnd,
  flushEnd = false,
}: {
  active: SourceId | null;
  propertiesActive: boolean;
  onSelect: (source: SourceId) => void;
  onShowProperties: () => void;
  onClose: () => void;
  onDragSource: (event: DragEvent, source: SourceId) => void;
  onDragEnd: () => void;
  /** Sit on the right edge of the claim frame. */
  flushEnd?: boolean;
}) {
  return (
    <div
      style={{
        height: "100%",
        flexShrink: 0,
        marginLeft: flushEnd ? "auto" : undefined,
        borderLeft: "1px solid var(--ds-color-border-subtle)",
        borderRight: flushEnd ? undefined : "1px solid var(--ds-color-border-subtle)",
      }}
    >
      <Stack direction="vertical" align="center" gap={3} paddingHorizontal={3} paddingTop={2} paddingBottom={3}>
        <IconButton icon="right_panel_close" size="sm" aria-label="Close panel" onClick={onClose} />
        <div
          style={{
            borderRadius: "var(--ds-radius-round)",
            outline: propertiesActive ? "2px solid var(--ds-color-border-accent-strong)" : undefined,
            outlineOffset: "1px",
          }}
        >
          <IconButton
            icon="page_info"
            size="sm"
            variant={propertiesActive ? "subtle-accent" : "default"}
            aria-label="Properties"
            aria-pressed={propertiesActive}
            onClick={onShowProperties}
          />
        </div>
        {SOURCES.map((source) => {
          const selected = source.id === active;
          return (
            <div
              key={source.id}
              draggable
              title="Open, or drag into the chat"
              onDragStart={(event) => onDragSource(event, source.id)}
              onDragEnd={onDragEnd}
              style={{
                borderRadius: "var(--ds-radius-round)",
                outline: selected ? "2px solid var(--ds-color-border-accent-strong)" : undefined,
                outlineOffset: "1px",
              }}
            >
              <IconButton
                icon={source.icon}
                size="sm"
                variant={selected ? "subtle-accent" : "default"}
                aria-label={source.label}
                aria-pressed={selected}
                onClick={() => onSelect(source.id)}
              />
            </div>
          );
        })}
      </Stack>
    </div>
  );
}

export function ActivityPanel({
  notes,
  selectedId,
  onSelect,
  onEditNote,
  onDeleteNote,
}: {
  notes: ActivityNote[];
  selectedId?: string | null;
  onSelect?: (item: ActivityChoice) => void;
  onEditNote: (id: string, text: string) => void;
  onDeleteNote: (id: string) => void;
}) {
  const latestNote = useRef<HTMLDivElement>(null);

  useEffect(() => {
    latestNote.current?.scrollIntoView({ block: "end" });
  }, [notes.length]);

  return (
    <PanelFrame>
      <PanelScroll>
        <Stack direction="vertical" gap={3} padding={3}>
          <ActivityTimeline
            notes={notes}
            selectedId={selectedId}
            onSelect={onSelect}
            onEditNote={onEditNote}
            onDeleteNote={onDeleteNote}
          />
          <div ref={latestNote} />
        </Stack>
      </PanelScroll>
    </PanelFrame>
  );
}

export function SourceDetail({
  source,
  record,
  section,
  focus,
  onOpenRecord,
  onBack,
  onAppeal,
  selectedIds,
  onToggleSelected,
}: {
  source: SourceId;
  record?: RecordRef;
  section?: "diagnosis";
  focus?: number;
  onOpenRecord: (record: RecordRef) => void;
  onBack: () => void;
  onAppeal: (record: RecordRef) => void;
  selectedIds: string[];
  onToggleSelected: (record: RecordRef) => void;
}) {
  const info = sourceInfo(source);
  const showTable = TABLE_SOURCES.has(source) && !record;
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (section !== "diagnosis" || focus == null) return;
    const container = scroller.current;
    const target = container?.querySelector("[data-section='diagnosis']");
    if (!container || !(target instanceof HTMLElement)) return;
    const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top, behavior: "smooth" });
  }, [section, focus]);

  return (
    <div ref={scroller} style={{ height: "100%", overflowY: "auto" }}>
      <Stack direction="vertical" gap={2} padding={3}>
        {record && source !== "claim-details" ? (
          <Stack direction="horizontal">
            <Button variant="tertiary" size="sm" icon="arrow_back" onClick={onBack}>
              Back to {info.label.toLowerCase()}
            </Button>
          </Stack>
        ) : (
          <Stack direction="horizontal" align="center" gap={2}>
            <Typography variant="label-s" color="fg-secondary">
              {info.label}
            </Typography>
            <Stack.Item grow />
            {showTable ? <IconButton icon="filter_list" size="sm" aria-label={`Filter ${info.label.toLowerCase()}`} /> : null}
          </Stack>
        )}
        {record ? (
          <RecordDetail record={record} />
        ) : (
          <SourceTable
            source={source}
            onOpenRecord={onOpenRecord}
            selectedIds={selectedIds}
            onToggleSelected={SELECTABLE_SOURCES.has(source) ? onToggleSelected : undefined}
            onAppeal={source === "submissions" ? onAppeal : undefined}
          />
        )}
      </Stack>
    </div>
  );
}
