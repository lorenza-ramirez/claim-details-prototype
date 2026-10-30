import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  AIGlobalTabItem,
  AlertBadge,
  AppShell,
  Breadcrumb,
  Button,
  Card,
  Chip,
  DictationBadge,
  Divider,
  Drawer,
  Icon,
  IconButton,
  Logo,
  Menu,
  ResizablePanel,
  SearchButton,
  Shortcut,
  Sidebar,
  Stack,
  Tag,
  Typography,
  useToast,
} from "@getathelas/ui";
import { CHAT_REPLIES, CLAIM_ID, DEFAULT_REPLY, INITIAL_SUBMISSION, IOWA_REMITTANCE } from "../../mock/claim";
import { AssistantMessage, UserMessage } from "../../components/not-in-ds/AssistantMessage";
import { ChatComposer } from "../../components/not-in-ds/ChatComposer";
import { PropertiesPanel, QueuePanel } from "./Panels";
import { Summary } from "./Summary";
import {
  ACTIVITY_SOURCE,
  DiagnosisCodes,
  RecordDetail,
  SELECTABLE_SOURCES,
  SOURCES,
  SourceTable,
  recordSummary,
  sourceFacts,
  sourceInfo,
  type IconName,
  type RecordRef,
  type SourceId,
} from "./sources";

type ContextChip = { key: string; label: string; icon: IconName; record?: RecordRef };

type ComposerContext = {
  key: string;
  title: string;
  chips: ContextChip[];
  facts: string[];
  compare: boolean;
};

type ChatItem =
  | { kind: "widget"; id: string; source: SourceId }
  | { kind: "user"; id: string; text: string; chips: ContextChip[] }
  | { kind: "assistant"; id: string; text: string };

type DrawerView = { kind: "source"; source: SourceId; record?: RecordRef } | { kind: "diagnosis" };

const SUMMARY_CONTEXT: ComposerContext = {
  key: "summary",
  title: "Summary selected",
  compare: false,
  chips: [{ key: "summary", label: "Claim summary", icon: "description" }],
  facts: [
    "This claim was fully denied. Iowa Blue Shield denied lines 97110, 97112, 97140, and 97161 under CO-16 with remark M76. Nothing has been paid, and the $346.00 balance remains open. The next step is to correct the diagnosis and resubmit.",
  ],
};

const ACTION_CONTEXT: ComposerContext = {
  key: "action",
  title: "Suggested action selected",
  compare: false,
  chips: [{ key: "action", label: "Replace M54.5 with M54.50", icon: "check_circle" }],
  facts: ["Suggested action: replace diagnosis M54.5 with M54.50 before resubmitting to Iowa Blue Shield."],
};

const WIDGET_ASKS: { id: SourceId; pattern: RegExp }[] = [
  { id: "claim-details", pattern: /\bclaim details?\b/i },
  { id: "similar-claims", pattern: /\bsimilar claims?\b/i },
  { id: "submissions", pattern: /\bsubmissions?\b/i },
  { id: "remittances", pattern: /\bremittances?\b/i },
  { id: "attachments", pattern: /\battachments?\b|\bdocumentation\b/i },
  { id: "payments", pattern: /\bpayments?\b/i },
  { id: "appeals", pattern: /\bappeals?\b/i },
  { id: "activity", pattern: /\bactivity\b/i },
];

function widgetsAsked(text: string): SourceId[] {
  return WIDGET_ASKS.flatMap(({ id, pattern }) => {
    const match = pattern.exec(text);
    return match ? [{ id, index: match.index }] : [];
  })
    .sort((a, b) => a.index - b.index)
    .map(({ id }) => id);
}

function widgetIntro(ids: SourceId[]) {
  const names = ids.map((id) => sourceInfo(id).label.toLowerCase());
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `These are the ${list} for this claim.`;
}

function replyFor(text: string) {
  return CHAT_REPLIES[text] ?? DEFAULT_REPLY;
}

function recordChip(record: RecordRef, removable: boolean): ContextChip | null {
  const summary = recordSummary(record);
  if (!summary) return null;
  return { key: `${record.source}:${record.id}`, label: summary.chip, icon: sourceInfo(record.source).icon, record: removable ? record : undefined };
}

export function VisionNext() {
  const toast = useToast();
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const dragSourceRef = useRef<SourceId | null>(null);
  const messageId = useRef(0);

  const [navOpen, setNavOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [activityOn, setActivityOn] = useState(false);
  const [activitySeen, setActivitySeen] = useState(false);
  const [activeClaim, setActiveClaim] = useState(CLAIM_ID);
  const [assistantOn, setAssistantOn] = useState(true);
  const [scribeOn, setScribeOn] = useState(false);

  const [drawer, setDrawer] = useState<DrawerView | null>(null);
  const [selected, setSelected] = useState<RecordRef[]>([]);
  const [pinnedContext, setPinnedContext] = useState<ComposerContext | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [feed, setFeed] = useState<ChatItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [chatDrop, setChatDrop] = useState(false);

  const liveContext = deriveContext(drawer, selected);
  const composerContext =
    pinnedContext && pinnedContext.key !== dismissedKey
      ? pinnedContext
      : liveContext && liveContext.key !== dismissedKey
        ? liveContext
        : null;

  useEffect(() => {
    const chat = chatRef.current;
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, [feed, activityOn]);

  function focusPrompt(text?: string) {
    if (text != null) setPrompt(text);
    promptRef.current?.focus();
  }

  function pinContext(context: ComposerContext) {
    setDismissedKey(null);
    setPinnedContext(context);
    focusPrompt();
  }

  function clearContext() {
    if (composerContext == null) return;
    if (composerContext === pinnedContext) {
      setPinnedContext(null);
      return;
    }
    if (composerContext.key.startsWith("selected:")) {
      setSelected([]);
      return;
    }
    setDismissedKey(composerContext.key);
  }

  function nextId(prefix: string) {
    messageId.current += 1;
    return `${prefix}-${messageId.current}`;
  }

  function send(text?: string) {
    const message = (text ?? prompt).trim();
    const chips = composerContext?.chips ?? [];
    const facts = composerContext?.facts ?? [];
    if (!message && chips.length === 0) return;

    const comparing = chips.length > 1 && /compar/i.test(message);
    const asked = comparing ? [] : widgetsAsked(message);
    if (asked.includes("claim-details")) setDrawer({ kind: "source", source: "claim-details" });
    if (asked.includes("activity")) setActivityOn(true);
    const toShow: SourceId[] = asked.filter((id) => id !== "claim-details" && id !== "activity");

    const reply = asked.length
      ? widgetIntro(asked)
      : comparing
        ? facts.join(" ")
        : chips.length
          ? `${replyFor(message)} This uses the selected context: ${facts.join(" ")}`
          : replyFor(message);

    setFeed((current) => {
      const withoutAsked = current.filter((item) => !(item.kind === "widget" && toShow.includes(item.source)));
      return [
        ...withoutAsked,
        { kind: "user", id: nextId("user"), text: message, chips },
        { kind: "assistant", id: nextId("assistant"), text: reply },
        ...toShow.map((source) => ({ kind: "widget" as const, id: nextId("widget"), source })),
      ];
    });
    if (chips.length) clearContext();
    setPrompt("");
  }

  function addWidget(source: SourceId) {
    if (source === "activity") {
      setActivityOn(true);
      return;
    }
    setFeed((current) =>
      current.some((item) => item.kind === "widget" && item.source === source)
        ? current
        : [...current, { kind: "widget", id: nextId("widget"), source }],
    );
  }

  function removeWidget(id: string) {
    setFeed((current) => current.filter((item) => item.id !== id));
  }

  function openSource(source: SourceId) {
    setDismissedKey(null);
    setDrawer((current) => (current?.kind === "source" && current.source === source && !current.record ? null : { kind: "source", source }));
  }

  function openRecord(record: RecordRef) {
    setDismissedKey(null);
    setDrawer({ kind: "source", source: record.source, record });
  }

  function toggleSelected(record: RecordRef) {
    setSelected((current) =>
      current.some((item) => item.source === record.source && item.id === record.id)
        ? current.filter((item) => !(item.source === record.source && item.id === record.id))
        : [...current, record],
    );
  }

  function selectedIdsFor(source: SourceId) {
    return selected.filter((item) => item.source === source).map((item) => item.id);
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.add({ intent: "success", icon: "check", content: `${label} copied` });
    } catch {
      toast.add({ intent: "danger", icon: "error", content: `Couldn't copy the ${label.toLowerCase()}` });
    }
  }

  function startDrag(event: DragEvent, source: SourceId) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", source);
    dragSourceRef.current = source;
  }

  function endDrag() {
    dragSourceRef.current = null;
    setChatDrop(false);
  }

  const activeSource = drawer?.kind === "source" ? drawer.source : null;
  const drawerTitle =
    drawer == null
      ? ""
      : drawer.kind === "diagnosis"
        ? "Diagnosis codes"
        : drawer.record
          ? (recordSummary(drawer.record)?.title ?? sourceInfo(drawer.source).label)
          : sourceInfo(drawer.source).label;

  return (
    <AppShell>
      <AppShell.Sidebar>
        <ResizablePanel open={navOpen} onOpenChange={setNavOpen} resizable={false} hideRailWhenCollapsed>
          <Sidebar>
            <Sidebar.Header>
              <Logo brand="athelas" />
            </Sidebar.Header>
            <Sidebar.Content>
              <Sidebar.Menu>
                <Sidebar.Item>
                  <Sidebar.Item.Icon icon="home" />
                  <Sidebar.Item.Label>Home</Sidebar.Item.Label>
                </Sidebar.Item>
                <Sidebar.Item>
                  <Sidebar.Item.Icon icon="event" />
                  <Sidebar.Item.Label>Visits</Sidebar.Item.Label>
                </Sidebar.Item>
                <Sidebar.Item>
                  <Sidebar.Item.Icon icon="task_alt" />
                  <Sidebar.Item.Label>Tasks</Sidebar.Item.Label>
                </Sidebar.Item>
              </Sidebar.Menu>
              <Sidebar.Separator />
              <Sidebar.Group defaultOpen>
                <Sidebar.Group.Label icon="payments">Revenue cycle</Sidebar.Group.Label>
                <Sidebar.Group.Content>
                  <Sidebar.Menu>
                    <Sidebar.Item>
                      <Sidebar.Item.Icon icon="assignment" />
                      <Sidebar.Item.Label>Encounters</Sidebar.Item.Label>
                    </Sidebar.Item>
                    <Sidebar.Item isActive>
                      <Sidebar.Item.Icon icon="receipt_long" />
                      <Sidebar.Item.Label>Claims</Sidebar.Item.Label>
                    </Sidebar.Item>
                    <Sidebar.Item>
                      <Sidebar.Item.Icon icon="block" />
                      <Sidebar.Item.Label>Denials</Sidebar.Item.Label>
                    </Sidebar.Item>
                    <Sidebar.Item>
                      <Sidebar.Item.Icon icon="request_quote" />
                      <Sidebar.Item.Label>Remittances</Sidebar.Item.Label>
                    </Sidebar.Item>
                  </Sidebar.Menu>
                </Sidebar.Group.Content>
              </Sidebar.Group>
              <Sidebar.Group defaultOpen>
                <Sidebar.Group.Label icon="analytics">Reporting</Sidebar.Group.Label>
                <Sidebar.Group.Content>
                  <Sidebar.Menu>
                    <Sidebar.Item>
                      <Sidebar.Item.Icon icon="monitor_heart" />
                      <Sidebar.Item.Label>Practice pulse</Sidebar.Item.Label>
                    </Sidebar.Item>
                    <Sidebar.Item>
                      <Sidebar.Item.Icon icon="bar_chart" />
                      <Sidebar.Item.Label>Reports</Sidebar.Item.Label>
                    </Sidebar.Item>
                  </Sidebar.Menu>
                </Sidebar.Group.Content>
              </Sidebar.Group>
            </Sidebar.Content>
          </Sidebar>
        </ResizablePanel>
      </AppShell.Sidebar>

      <AppShell.Header>
        <AppShell.HeaderLeft>
          <Sidebar.Item
            size="sm"
            aria-label={navOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((value) => !value)}
          >
            <Sidebar.Item.Icon icon="dock_to_right" />
          </Sidebar.Item>
          <Breadcrumb>
            <Breadcrumb.Item href="#">Claims</Breadcrumb.Item>
            <Breadcrumb.Page>{activeClaim}</Breadcrumb.Page>
          </Breadcrumb>
        </AppShell.HeaderLeft>
        <AppShell.HeaderMiddle>
          <Sidebar.Item size="sm" aria-label="Notifications">
            <Sidebar.Item.Icon icon="notifications" />
          </Sidebar.Item>
          <SearchButton label="Global search" endAddornment={<Shortcut shortcut={["ctrl", "K"]} />} />
        </AppShell.HeaderMiddle>
        <AppShell.HeaderRight>
          <AIGlobalTabItem icon="athelas_ai" pressed={assistantOn} onPressedChange={setAssistantOn}>
            Athelas AI
          </AIGlobalTabItem>
          <AIGlobalTabItem icon="scribe_ai_recording" pressed={scribeOn} onPressedChange={setScribeOn}>
            Scribe
          </AIGlobalTabItem>
          <DictationBadge aria-label="Toggle dictation" />
        </AppShell.HeaderRight>
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Stack direction="horizontal" align="center" gap={2} padding={3}>
            <IconButton
              icon="dock_to_right"
              size="sm"
              aria-label={queueOpen ? "Close claim list" : "Open claim list"}
              aria-expanded={queueOpen}
              onClick={() => setQueueOpen((value) => !value)}
            />
            <Divider orientation="vertical" />
            <Typography variant="label-s" render={<h1 style={{ margin: 0 }} />}>
              Claim {activeClaim}
            </Typography>
            <IconButton icon="link" size="sm" aria-label="Copy link" onClick={() => copy(window.location.href, "Link")} />
            <IconButton icon="content_copy" size="sm" aria-label="Copy claim ID" onClick={() => copy(activeClaim, "Claim ID")} />
            <Stack.Item grow />
            <AlertBadge variant="highlight" show={!activitySeen}>
              <IconButton
                icon="dynamic_feed"
                size="sm"
                variant={activityOn ? "subtle-accent" : "default"}
                aria-label={activityOn ? "Hide activity" : "Show activity"}
                aria-pressed={activityOn}
                onClick={() => {
                  setActivitySeen(true);
                  setActivityOn((value) => !value);
                }}
              />
            </AlertBadge>
            <IconButton
              icon="widgets"
              size="sm"
              variant={propertiesOpen ? "subtle-accent" : "default"}
              aria-label={propertiesOpen ? "Hide properties" : "Show properties"}
              aria-pressed={propertiesOpen}
              onClick={() => setPropertiesOpen((value) => !value)}
            />
            <Divider orientation="vertical" />
            <Menu>
              <Menu.Trigger render={<IconButton icon="more_horiz" size="sm" aria-label="More actions" />} />
              <Menu.Content align="end">
                <Menu.Item onClick={() => toast.add({ intent: "info", icon: "person", content: "Assign isn't part of this prototype yet" })}>
                  <Menu.Item.LeftIcon icon="person_add" />
                  <Menu.Item.Label>Assign claim</Menu.Item.Label>
                </Menu.Item>
                <Menu.Item onClick={() => focusPrompt("Add a note: ")}>
                  <Menu.Item.LeftIcon icon="edit_note" />
                  <Menu.Item.Label>Add note</Menu.Item.Label>
                </Menu.Item>
                <Menu.Item onClick={() => openSource("claim-details")}>
                  <Menu.Item.LeftIcon icon="description" />
                  <Menu.Item.Label>View claim details</Menu.Item.Label>
                </Menu.Item>
              </Menu.Content>
            </Menu>
          </Stack>
          <Divider />

          <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
            <ResizablePanel
              side="left"
              open={queueOpen}
              onOpenChange={setQueueOpen}
              hideRailWhenCollapsed
              defaultWidth="15.5rem"
              minWidth="12rem"
              maxWidth="22rem"
            >
              <QueuePanel activeId={activeClaim} onSelect={setActiveClaim} />
            </ResizablePanel>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minWidth: 0,
                outline: chatDrop ? "2px dashed var(--ds-color-border-accent-strong)" : undefined,
                outlineOffset: "-0.5rem",
              }}
              onDragOver={(event) => {
                if (!dragSourceRef.current) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = "copy";
                setChatDrop(true);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setChatDrop(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                const source = (event.dataTransfer.getData("text/plain") || dragSourceRef.current) as SourceId | null;
                endDrag();
                if (source && (SOURCES.some((item) => item.id === source) || source === "activity")) addWidget(source);
              }}
            >
              <div ref={chatRef} role="log" aria-label="Claim chat" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "100%", maxWidth: "62.5rem", margin: "0 auto" }}>
                <Stack direction="vertical" gap={6} paddingHorizontal={6} paddingVertical={3}>
                  <AssistantMessage>
                    <Summary
                      selected={composerContext?.key === "summary" ? "summary" : composerContext?.key === "action" ? "action" : null}
                      onSelectSummary={() => pinContext(SUMMARY_CONTEXT)}
                      onSelectAction={() => pinContext(ACTION_CONTEXT)}
                      onOpenInitialSubmission={() => openRecord({ source: "submissions", id: INITIAL_SUBMISSION.id })}
                      onOpenRemittance={() => openRecord({ source: "remittances", id: IOWA_REMITTANCE.id })}
                      onOpenDiagnosisCodes={() => setDrawer({ kind: "diagnosis" })}
                      onAccept={() =>
                        toast.add({ intent: "success", icon: "check_circle", content: "Diagnosis change applied to the claim" })
                      }
                      onResubmit={() => send("Resubmit to Iowa Blue Shield")}
                    />
                  </AssistantMessage>

                  {feed.map((item) => {
                    if (item.kind === "user") {
                      return (
                        <UserMessage
                          key={item.id}
                          attachments={
                            item.chips.length ? (
                              <Stack direction="horizontal" wrap="wrap" gap={1}>
                                {item.chips.map((chip) => (
                                  <Chip key={chip.key} size="sm" icon={chip.icon} label={chip.label} />
                                ))}
                              </Stack>
                            ) : null
                          }
                        >
                          {item.text}
                        </UserMessage>
                      );
                    }
                    if (item.kind === "assistant") {
                      return (
                        <AssistantMessage key={item.id}>
                          <Stack direction="vertical" gap={1}>
                            <Typography variant="label-xs" color="fg-tertiary">
                              Athelas AI
                            </Typography>
                            <Typography variant="body-m">{item.text}</Typography>
                          </Stack>
                        </AssistantMessage>
                      );
                    }
                    return (
                      <SourceWidget
                        key={item.id}
                        source={item.source}
                        onOpenSource={() => openSource(item.source)}
                        onRemove={() => removeWidget(item.id)}
                        onOpenRecord={openRecord}
                        selectedIds={selectedIdsFor(item.source)}
                        onToggleSelected={SELECTABLE_SOURCES.has(item.source) ? toggleSelected : undefined}
                      />
                    );
                  })}

                  {activityOn ? (
                    <SourceWidget
                      source="activity"
                      onOpenSource={() => openSource("activity")}
                      onRemove={() => setActivityOn(false)}
                      onOpenRecord={openRecord}
                    />
                  ) : null}
                </Stack>
                </div>
              </div>

              <Stack paddingHorizontal={6} paddingBottom={3} paddingTop={3}>
                <div style={{ width: "100%", maxWidth: "61rem", margin: "0 auto" }}>
                  <ChatComposer
                    inputRef={promptRef}
                    value={prompt}
                    onChange={setPrompt}
                    onSubmit={() => send()}
                    context={
                      composerContext ? (
                        <ContextBox context={composerContext} onClear={clearContext} onRemoveChip={toggleSelected} />
                      ) : null
                    }
                  />
                </div>
              </Stack>
            </div>

            <ResizablePanel
              side="right"
              open={propertiesOpen}
              onOpenChange={setPropertiesOpen}
              hideRailWhenCollapsed
              defaultWidth="25.75rem"
              minWidth="18rem"
              maxWidth="36rem"
            >
              <PropertiesPanel
                activeSource={activeSource}
                onOpenSource={openSource}
                onDragSource={startDrag}
                onDragEnd={endDrag}
                onOpenLastSubmission={() => openRecord({ source: "submissions", id: INITIAL_SUBMISSION.id })}
                onOpenAttachment={(id) => openRecord({ source: "attachments", id })}
              />
            </ResizablePanel>
          </div>
        </div>

        <Drawer
          title={drawerTitle}
          open={drawer != null}
          onOpenChange={(open) => {
            if (!open) setDrawer(null);
          }}
        >
          {drawer?.kind === "diagnosis" ? <DiagnosisCodes /> : null}
          {drawer?.kind === "source" ? (
            <Stack direction="vertical" gap={4}>
              {drawer.record && drawer.source !== "claim-details" ? (
                <Stack direction="horizontal">
                  <Button
                    variant="tertiary"
                    size="sm"
                    icon="arrow_back"
                    onClick={() => setDrawer({ kind: "source", source: drawer.source })}
                  >
                    Back to {sourceInfo(drawer.source).label.toLowerCase()}
                  </Button>
                </Stack>
              ) : null}
              {drawer.record ? (
                <RecordDetail record={drawer.record} />
              ) : (
                <SourceTable
                  source={drawer.source}
                  onOpenRecord={openRecord}
                  selectedIds={selectedIdsFor(drawer.source)}
                  onToggleSelected={SELECTABLE_SOURCES.has(drawer.source) ? toggleSelected : undefined}
                />
              )}
              <Stack direction="horizontal">
                <Button
                  variant="neutral"
                  size="sm"
                  icon="chat"
                  onClick={() => {
                    addWidget(drawer.source);
                    setDrawer(null);
                  }}
                >
                  Add {sourceInfo(drawer.source).label.toLowerCase()} to chat
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </Drawer>
      </AppShell.Main>
    </AppShell>
  );
}

function deriveContext(drawer: DrawerView | null, selected: RecordRef[]): ComposerContext | null {
  if (selected.length) {
    const chips = selected.flatMap((record) => recordChip(record, true) ?? []);
    const noun = selected.length === 1 ? "record" : "records";
    return {
      key: `selected:${chips.map((chip) => chip.key).join(",")}`,
      title: `${selected.length} selected ${noun}`,
      compare: selected.length > 1,
      chips,
      facts: selected.flatMap((record) => recordSummary(record)?.facts ?? []),
    };
  }
  if (drawer?.kind === "diagnosis") {
    return {
      key: "diagnosis",
      title: "Diagnosis codes selected",
      compare: false,
      chips: [{ key: "diagnosis", label: "Diagnosis codes", icon: "description" }],
      facts: ["The claim lists diagnoses M54.5, M62.81, and R26.2."],
    };
  }
  if (drawer?.kind === "source" && drawer.record) {
    const chip = recordChip(drawer.record, false);
    const summary = recordSummary(drawer.record);
    if (chip && summary) {
      return {
        key: `record:${chip.key}`,
        title: `${sourceInfo(drawer.source).label} selected`,
        compare: false,
        chips: [chip],
        facts: summary.facts,
      };
    }
  }
  if (drawer?.kind === "source") {
    const info = sourceInfo(drawer.source);
    return {
      key: `source:${drawer.source}`,
      title: `${info.label} selected`,
      compare: false,
      chips: [{ key: drawer.source, label: info.label, icon: info.icon }],
      facts: sourceFacts(drawer.source),
    };
  }
  return null;
}

function ContextBox({
  context,
  onClear,
  onRemoveChip,
}: {
  context: ComposerContext;
  onClear: () => void;
  onRemoveChip: (record: RecordRef) => void;
}) {
  return (
    <Stack direction="vertical" gap={2} paddingHorizontal={3} paddingVertical={2}>
      <Stack direction="horizontal" align="center" gap={2}>
        <Typography variant="label-s" color="fg-secondary">
          {context.title}
        </Typography>
        {context.compare ? <Tag color="blue" size="sm" label="Compare" /> : null}
        <Stack.Item grow />
        <IconButton icon="close" size="xs" aria-label="Clear selected context" onClick={onClear} />
      </Stack>
      <Stack direction="horizontal" wrap="wrap" gap={1}>
        {context.chips.map((chip) => (
          <Chip
            key={chip.key}
            size="sm"
            icon={chip.icon}
            label={chip.label}
            removable={chip.record != null}
            onRemove={chip.record ? () => onRemoveChip(chip.record!) : undefined}
          />
        ))}
      </Stack>
    </Stack>
  );
}

function SourceWidget({
  source,
  onOpenSource,
  onRemove,
  onOpenRecord,
  selectedIds,
  onToggleSelected,
}: {
  source: SourceId;
  onOpenSource: () => void;
  onRemove: () => void;
  onOpenRecord: (record: RecordRef) => void;
  selectedIds?: string[];
  onToggleSelected?: (record: RecordRef) => void;
}) {
  const info = source === "activity" ? ACTIVITY_SOURCE : sourceInfo(source);
  return (
    <Card padding="md" radius="lg">
      <Stack direction="vertical" gap={3}>
        <Stack direction="horizontal" align="center" gap={2}>
          <Icon icon={info.icon} color="fg-accent" />
          <Typography variant="label-m" render={<h2 style={{ margin: 0 }} />}>
            {info.label}
          </Typography>
          <Stack.Item grow />
          {source !== "activity" ? (
            <IconButton icon="open_in_full" size="sm" aria-label={`Open ${info.label.toLowerCase()}`} onClick={onOpenSource} />
          ) : null}
          <IconButton icon="close" size="sm" aria-label={`Remove ${info.label.toLowerCase()} from chat`} onClick={onRemove} />
        </Stack>
        <SourceTable source={source} onOpenRecord={onOpenRecord} selectedIds={selectedIds} onToggleSelected={onToggleSelected} />
      </Stack>
    </Card>
  );
}
