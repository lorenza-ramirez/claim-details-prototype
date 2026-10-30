import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  AIGlobalTabItem,
  AlertBadge,
  AppShell,
  Breadcrumb,
  Button,
  Card,
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
  Spinner,
  Stack,
  Tag,
  Typography,
  useToast,
} from "@getathelas/ui";
import {
  CHAT_REPLIES,
  CLAIM_ID,
  DEFAULT_REPLY,
  INITIAL_SUBMISSION,
  IOWA_REMITTANCE,
  claimCase,
  nextClaimId,
} from "../../mock/claim";
import { AddToChatMenu } from "../../components/not-in-ds/AddToChatMenu";
import { TruncatedChip } from "../../components/not-in-ds/TruncatedChip";
import { AssistantMessage, UserMessage } from "../../components/not-in-ds/AssistantMessage";
import { ChatComposer } from "../../components/not-in-ds/ChatComposer";
import { ActivityPanel, PropertiesPanel, QueuePanel, SourceDetail, SourceRail } from "./Panels";
import { NextClaimPrompt, Summary, ThreadNotice, summaryFor } from "./Summary";
import {
  ACTIVITY_SOURCE,
  type ActivityNote,
  DiagnosisCodes,
  SELECTABLE_SOURCES,
  SOURCES,
  SourceTable,
  recordSummary,
  sourceFacts,
  sourceInfo,
  type IconName,
  type ActivityChoice,
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
  | { kind: "assistant"; id: string; text: string }
  | { kind: "notice"; id: string; title: string; description: string; nextActionClaimId?: string }
  | { kind: "ask-next"; id: string; claimId: string; choice: "load" | "stay" | null }
  | { kind: "claim-summary"; id: string; claimId: string };

type DrawerView = { kind: "diagnosis" };
type DetailView = { source: SourceId; record?: RecordRef; section?: "diagnosis"; focus?: number };

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
  chips: [{ key: "action", label: "Update 20680", icon: "check_circle" }],
  facts: [
    "Suggested action: on CPT 20680, replace modifier 24 with modifier 79. RT and XS stay as billed. Reason: CO-4/N657, modifier 24 is invalid on this surgical code.",
  ],
};

type ClaimFlow = { summary: ComposerContext; action: ComposerContext; actionNotice: string; resubmitNotice: string };

function claimFlow(claimId: string): ClaimFlow {
  if (claimId === CLAIM_ID) {
    return {
      summary: SUMMARY_CONTEXT,
      action: ACTION_CONTEXT,
      actionNotice: "Modifier change applied to procedure 20680.",
      resubmitNotice: "Claim resubmitted to Iowa Blue Shield.",
    };
  }
  const c = claimCase(claimId);
  return {
    summary: {
      key: `summary:${claimId}`,
      title: "Summary selected",
      compare: false,
      chips: [{ key: "summary", label: `Claim ${claimId} summary`, icon: "description" }],
      facts: [
        `Claim ${claimId} was fully denied. ${c.payer} denied lines ${c.lines.join(", ")} under ${c.denial}. Nothing has been paid, and the ${c.amount} balance remains open.`,
      ],
    },
    action: {
      key: `action:${claimId}`,
      title: "Suggested action selected",
      compare: false,
      chips: [{ key: "action", label: c.action.title, icon: "check_circle" }],
      facts: [`Suggested action: ${c.action.title}. ${c.action.why}`],
    },
    actionNotice: c.action.notice,
    resubmitNotice: `Claim resubmitted to ${c.payer}.`,
  };
}

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

function noteBody(message: string): string | null {
  const prefixed = message.match(/^add a note:\s*(.*)$/i);
  if (prefixed) return prefixed[1].trim();
  if (widgetsAsked(message).length > 0) return null;
  if (/\b(defer|note|comment)\b/i.test(message)) return message;
  return null;
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
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState<{ text: string; top: number; left: number; above: boolean } | null>(null);
  const quoteRef = useRef(quote);
  quoteRef.current = quote;
  const dragSourceRef = useRef<SourceId | null>(null);
  const messageId = useRef(0);
  const noteTimer = useRef<number | null>(null);

  const [navOpen, setNavOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [activityOn, setActivityOn] = useState(false);
  const [activitySeen, setActivitySeen] = useState(false);
  const [activeClaim, setActiveClaim] = useState(CLAIM_ID);
  const [assistantOn, setAssistantOn] = useState(true);
  const [scribeOn, setScribeOn] = useState(false);

  const [drawer, setDrawer] = useState<DrawerView | null>(null);
  const [detail, setDetail] = useState<DetailView | null>(null);
  const [selected, setSelected] = useState<RecordRef[]>([]);
  const [pinnedContext, setPinnedContext] = useState<ComposerContext | null>(null);
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [feed, setFeed] = useState<ChatItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [chatDrop, setChatDrop] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [notes, setNotes] = useState<ActivityNote[]>([]);
  const [deferred, setDeferred] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [completedActions, setCompletedActions] = useState<
    Record<string, { action: boolean; resubmit: boolean }>
  >({});

  const liveContext = deriveContext(drawer, detail, selected);
  const composerContext =
    pinnedContext && pinnedContext.key !== dismissedKey
      ? pinnedContext
      : liveContext && liveContext.key !== dismissedKey
        ? liveContext
        : null;

  useEffect(() => {
    const chat = chatRef.current;
    if (chat && (feed.length > 0 || thinking)) chat.scrollTop = chat.scrollHeight;
  }, [feed, thinking]);

  useEffect(() => {
    return () => {
      if (noteTimer.current != null) window.clearTimeout(noteTimer.current);
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || drawer != null) return;
      setDetail((current) => {
        if (!current) return current;
        if (current.record && current.source !== "claim-details") return { source: current.source };
        return null;
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  function addQuote(text: string) {
    const label = text.length > 64 ? `${text.slice(0, 64)}…` : text;
    pinContext({
      key: `quote:${text}`,
      title: "Selection added",
      compare: false,
      chips: [{ key: "quote", label, icon: "format_quote" }],
      facts: [`Highlighted from the claim panel: ${text}`],
    });
    window.getSelection()?.removeAllRanges();
    setQuote(null);
  }

  const addQuoteRef = useRef(addQuote);
  addQuoteRef.current = addQuote;

  useEffect(() => {
    function readSelection() {
      const root = rightColumnRef.current;
      const selection = window.getSelection();
      if (!root || root.getBoundingClientRect().width < 8 || !selection || selection.isCollapsed || selection.rangeCount === 0) {
        setQuote(null);
        return;
      }
      const text = selection.toString().replace(/\s+/g, " ").trim();
      const range = selection.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const element = node instanceof Element ? node : node.parentElement;
      if (!text || !element || !root.contains(element)) {
        setQuote(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setQuote(null);
        return;
      }
      setQuote({
        text,
        top: rect.top,
        left: Math.min(Math.max(rect.left + rect.width / 2, 140), window.innerWidth - 140),
        above: rect.top >= 56,
      });
    }

    function onKey(event: KeyboardEvent) {
      if (!quoteRef.current) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") {
        event.preventDefault();
        addQuoteRef.current(quoteRef.current.text);
      }
    }

    document.addEventListener("selectionchange", readSelection);
    window.addEventListener("scroll", readSelection, true);
    window.addEventListener("resize", readSelection);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("selectionchange", readSelection);
      window.removeEventListener("scroll", readSelection, true);
      window.removeEventListener("resize", readSelection);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function focusPrompt(text?: string) {
    if (text != null) setPrompt(text);
    promptRef.current?.focus();
  }

  function pinContext(context: ComposerContext) {
    setDismissedKey(null);
    setPinnedContext(context);
    focusPrompt();
  }

  function selectActivity(item: ActivityChoice) {
    if (pinnedContext?.key === `activity:${item.id}`) {
      setPinnedContext(null);
      return;
    }
    pinContext({
      key: `activity:${item.id}`,
      title: "Activity selected",
      compare: false,
      chips: [{ key: item.id, label: item.label, icon: item.icon }],
      facts: [item.fact],
    });
  }

  function editNote(id: string, text: string) {
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    setNotes((current) => current.map((item) => (item.id === id ? { ...item, text } : item)));
    setPinnedContext((current) =>
      current?.key === `activity:${id}`
        ? { ...current, facts: [`${note.name}, ${note.time}: ${text}`] }
        : current,
    );
  }

  function deleteNote(id: string) {
    setNotes((current) => current.filter((item) => item.id !== id));
    setPinnedContext((current) => (current?.key === `activity:${id}` ? null : current));
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

    const note = message ? noteBody(message) : null;
    if (note) {
      postNote(message, note);
      return;
    }

    const comparing = chips.length > 1 && /compar/i.test(message);
    const asked = comparing ? [] : widgetsAsked(message);
    if (asked.includes("claim-details")) setDetail({ source: "claim-details" });
    if (asked.includes("activity")) {
      setActivityOn(true);
      setPropertiesOpen(true);
    }
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

  function postNote(message: string, note: string) {
    if (noteTimer.current != null) window.clearTimeout(noteTimer.current);
    setFeed((current) => [...current, { kind: "user", id: nextId("user"), text: message, chips: [] }]);
    setPrompt("");
    clearContext();
    setThinking(true);
    noteTimer.current = window.setTimeout(() => {
      noteTimer.current = null;
      setThinking(false);
      setFeed((current) => [
        ...current,
        { kind: "assistant", id: nextId("assistant"), text: "Note added. This claim is deferred." },
      ]);
      setNotes((current) => [
        ...current,
        { id: nextId("note"), name: "Elliot", initials: "EL", text: note, time: "Just now" },
      ]);
      setDeferred(true);
      setActivitySeen(true);
      setActivityOn(true);
      setPropertiesOpen(true);
    }, 1200);
  }

  function approveAction(claimId: string) {
    if (completedActions[claimId]?.action) return;
    setCompletedActions((current) => ({
      ...current,
      [claimId]: { action: true, resubmit: current[claimId]?.resubmit ?? false },
    }));
    setFeed((current) => [
      ...current,
      {
        kind: "notice",
        id: nextId("notice"),
        title: "Action approved",
        description: claimFlow(claimId).actionNotice,
        nextActionClaimId: claimId,
      },
    ]);
  }

  function approveResubmit(claimId: string) {
    if (completedActions[claimId]?.resubmit) return;
    setCompletedActions((current) => ({
      ...current,
      [claimId]: { action: current[claimId]?.action ?? true, resubmit: true },
    }));
    const next = nextClaimId(claimId);
    setFeed((current) => [
      ...current,
      { kind: "notice", id: nextId("notice"), title: "Action approved", description: claimFlow(claimId).resubmitNotice },
      next
        ? { kind: "ask-next", id: nextId("ask"), claimId: next, choice: null }
        : { kind: "assistant", id: nextId("assistant"), text: "That was the last claim in the queue. Nice work." },
    ]);
  }

  function chooseNextClaim(id: string, choice: "load" | "stay") {
    const ask = feed.find((item) => item.kind === "ask-next" && item.id === id);
    if (!ask || ask.kind !== "ask-next" || ask.choice) return;
    setFeed((current) => {
      const updated = current.map((item) => (item.kind === "ask-next" && item.id === id ? { ...item, choice } : item));
      if (choice === "stay") return updated;
      return [...updated, { kind: "claim-summary", id: nextId("summary"), claimId: ask.claimId }];
    });
    if (choice === "load") {
      setActiveClaim(ask.claimId);
      setDeferred(false);
      setDetail(null);
      setPinnedContext(null);
    }
  }

  function renderSummary(claimId: string) {
    const flow = claimFlow(claimId);
    return (
      <Summary
        claimId={claimId === CLAIM_ID ? undefined : claimId}
        selected={composerContext?.key === flow.summary.key ? "summary" : composerContext?.key === flow.action.key ? "action" : null}
        accepted={completedActions[claimId]?.action ?? false}
        resubmitAccepted={completedActions[claimId]?.resubmit ?? false}
        onSelectSummary={() => pinContext(flow.summary)}
        onSelectAction={() => pinContext(flow.action)}
        onOpenInitialSubmission={() => openRecord({ source: "submissions", id: INITIAL_SUBMISSION.id })}
        onOpenRemittance={() => openRecord({ source: "remittances", id: IOWA_REMITTANCE.id })}
        onOpenDiagnosisCodes={() => {
          setDrawer(null);
          setDismissedKey(null);
          setActivityOn(false);
          setPropertiesOpen(true);
          setDetail({ source: "claim-details", section: "diagnosis", focus: Date.now() });
        }}
        onAccept={() => approveAction(claimId)}
        onAcceptResubmit={() => approveResubmit(claimId)}
        onViewMedicalRecord={() => openRecord({ source: "attachments", id: "clinical-note" })}
      />
    );
  }

  function addWidget(source: SourceId) {
    if (source === "activity") {
      setActivityOn(true);
      setPropertiesOpen(true);
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
    setActivityOn(false);
    setPropertiesOpen(true);
    setDetail((current) => (current?.source === source && !current.record ? null : { source }));
  }

  function openRecord(record: RecordRef) {
    setDismissedKey(null);
    setActivityOn(false);
    setPropertiesOpen(true);
    setDetail({ source: record.source, record });
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

  function unavailable(label: string) {
    toast.add({ intent: "info", icon: "info", content: `${label} isn't part of this prototype yet` });
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
                variant="default"
                data-active={activityOn ? "true" : undefined}
                className="ds:data-[active=true]:bg-bg-state-base-active ds:hover:data-[active=true]:bg-bg-state-base-active-hover"
                aria-label={activityOn ? "Hide activity" : "Show activity"}
                aria-pressed={activityOn}
                onClick={() => {
                  setActivitySeen(true);
                  if (activityOn) {
                    setActivityOn(false);
                    setPropertiesOpen(false);
                    return;
                  }
                  setActivityOn(true);
                  setPropertiesOpen(true);
                }}
              />
            </AlertBadge>
            <IconButton
              icon="widgets"
              size="sm"
              variant="default"
              data-active={propertiesOpen && !activityOn ? "true" : undefined}
              className="ds:data-[active=true]:bg-bg-state-base-active ds:hover:data-[active=true]:bg-bg-state-base-active-hover"
              aria-label={propertiesOpen && !activityOn ? "Close panels" : "Show properties"}
              aria-pressed={propertiesOpen && !activityOn}
              onClick={() => {
                if (propertiesOpen && !activityOn) {
                  setDetail(null);
                  setActivityOn(false);
                  setPropertiesOpen(false);
                  return;
                }
                setActivityOn(false);
                setPropertiesOpen(true);
              }}
            />
            <Divider orientation="vertical" />
            <Menu onOpenChange={setActionsOpen}>
              <Menu.Trigger
                render={
                  <Button
                    variant="neutral"
                    size="sm"
                    icon={actionsOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    className="ds:flex-row-reverse"
                  >
                    Actions
                  </Button>
                }
              />
              <Menu.Content align="end">
                <Menu.Item onClick={() => unavailable("Review")}>
                  <Menu.Item.LeftIcon icon="fact_check" />
                  <Menu.Item.Label>Review</Menu.Item.Label>
                  <Menu.Item.Right>
                    <Shortcut shortcut="R" variant="box" />
                  </Menu.Item.Right>
                </Menu.Item>
                <Menu.Item onClick={() => unavailable("Preview")}>
                  <Menu.Item.LeftIcon icon="visibility" />
                  <Menu.Item.Label>Preview</Menu.Item.Label>
                  <Menu.Item.Right>
                    <Shortcut shortcut="P" variant="box" />
                  </Menu.Item.Right>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item onClick={() => unavailable("Mark as not intended to bill")}>
                  <Menu.Item.LeftIcon icon="download" />
                  <Menu.Item.Label>Mark as not intended to bill</Menu.Item.Label>
                </Menu.Item>
                <Menu.Item onClick={() => unavailable("Adjust")}>
                  <Menu.Item.LeftIcon icon="request_quote" />
                  <Menu.Item.Label>Adjust</Menu.Item.Label>
                </Menu.Item>
                <Menu.Item onClick={() => unavailable("Push to PR")}>
                  <Menu.Item.LeftIcon icon="payments" />
                  <Menu.Item.Label>Push to PR</Menu.Item.Label>
                </Menu.Item>
                <Menu.Item onClick={() => unavailable("Push to next payer")}>
                  <Menu.Item.LeftIcon icon="drive_file_move" />
                  <Menu.Item.Label>Push to next payer</Menu.Item.Label>
                </Menu.Item>
                <Menu.Separator />
                <Menu.Item
                  onClick={() => {
                    if (!deferred) {
                      toast.add({ intent: "info", icon: "info", content: "This claim is not deferred" });
                      return;
                    }
                    setDeferred(false);
                    toast.add({ intent: "success", icon: "check", content: "Deferral cancelled" });
                  }}
                >
                  <Menu.Item.LeftIcon icon="block" />
                  <Menu.Item.Label>Cancel deferral</Menu.Item.Label>
                </Menu.Item>
              </Menu.Content>
            </Menu>
            <Menu>
              <Menu.Trigger render={<IconButton icon="more_horiz" size="sm" aria-label="More actions" />} />
              <Menu.Content align="end">
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger>
                    <Menu.Item.LeftIcon icon="open_in_new" />
                    <Menu.Item.Label>Go to...</Menu.Item.Label>
                  </Menu.SubmenuTrigger>
                  <Menu.SubmenuContent>
                    <Menu.Item onClick={() => openSource("claim-details")}>
                      <Menu.Item.LeftIcon icon="visibility" />
                      <Menu.Item.Label>Claim details</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("RCM patient profile")}>
                      <Menu.Item.LeftIcon icon="insert_chart" />
                      <Menu.Item.Label>RCM patient profile</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("EHR patient profile")}>
                      <Menu.Item.LeftIcon icon="health_and_safety" />
                      <Menu.Item.Label>EHR patient profile</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("Appointment")}>
                      <Menu.Item.LeftIcon icon="calendar_today" />
                      <Menu.Item.Label>Appointment</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("Calendar")}>
                      <Menu.Item.LeftIcon icon="calendar_month" />
                      <Menu.Item.Label>Calendar</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("Visit note")}>
                      <Menu.Item.LeftIcon icon="assignment" />
                      <Menu.Item.Label>Visit note</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("Posting tool")}>
                      <Menu.Item.LeftIcon icon="account_balance" />
                      <Menu.Item.Label>Posting tool</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => openSource("remittances")}>
                      <Menu.Item.LeftIcon icon="receipt_long" />
                      <Menu.Item.Label>Remittances</Menu.Item.Label>
                    </Menu.Item>
                  </Menu.SubmenuContent>
                </Menu.SubmenuRoot>
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger>
                    <Menu.Item.LeftIcon icon="content_paste" />
                    <Menu.Item.Label>Copy</Menu.Item.Label>
                  </Menu.SubmenuTrigger>
                  <Menu.SubmenuContent>
                    <Menu.Item onClick={() => copy(window.location.href, "URL")}>
                      <Menu.Item.LeftIcon icon="link" />
                      <Menu.Item.Label>Copy URL</Menu.Item.Label>
                      <Menu.Item.Right>
                        <Shortcut shortcut={["mod", "C"]} variant="box" />
                      </Menu.Item.Right>
                    </Menu.Item>
                    <Menu.Item onClick={() => copy(activeClaim, "Claim ID")}>
                      <Menu.Item.LeftIcon icon="id_card" />
                      <Menu.Item.Label>Copy ID</Menu.Item.Label>
                      <Menu.Item.Right>
                        <Shortcut shortcut={["mod", "."]} variant="box" />
                      </Menu.Item.Right>
                    </Menu.Item>
                  </Menu.SubmenuContent>
                </Menu.SubmenuRoot>
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger>
                    <Menu.Item.LeftIcon icon="help" />
                    <Menu.Item.Label>Help</Menu.Item.Label>
                    <Menu.Item.Right>
                      <Shortcut shortcut="?" variant="box" />
                    </Menu.Item.Right>
                  </Menu.SubmenuTrigger>
                  <Menu.SubmenuContent>
                    <Menu.Item onClick={() => unavailable("Docs")}>
                      <Menu.Item.LeftIcon icon="menu_book" />
                      <Menu.Item.Label>Docs</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("Take a tour")}>
                      <Menu.Item.LeftIcon icon="menu_book" />
                      <Menu.Item.Label>Take a tour</Menu.Item.Label>
                    </Menu.Item>
                    <Menu.Item onClick={() => unavailable("Keyboard shortcuts")}>
                      <Menu.Item.LeftIcon icon="keyboard" />
                      <Menu.Item.Label>Keyboard shortcuts</Menu.Item.Label>
                      <Menu.Item.Right>
                        <Shortcut shortcut={["mod", "/"]} variant="box" />
                      </Menu.Item.Right>
                    </Menu.Item>
                  </Menu.SubmenuContent>
                </Menu.SubmenuRoot>
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
                  <AssistantMessage>{renderSummary(CLAIM_ID)}</AssistantMessage>

                  {feed.map((item) => {
                    if (item.kind === "user") {
                      return (
                        <UserMessage
                          key={item.id}
                          attachments={
                            item.chips.length ? (
                              <div style={{ width: "100%", minWidth: 0 }}>
                              <Stack direction="horizontal" wrap="wrap" gap={1}>
                                {item.chips.map((chip) => (
                                  <TruncatedChip key={chip.key} icon={chip.icon} label={chip.label} />
                                ))}
                              </Stack>
                              </div>
                            ) : null
                          }
                        >
                          {item.text}
                        </UserMessage>
                      );
                    }
                    if (item.kind === "notice") {
                      const nextAction = item.nextActionClaimId
                        ? summaryFor(item.nextActionClaimId).resubmit
                        : null;
                      return (
                        <AssistantMessage key={item.id}>
                          <ThreadNotice
                            title={item.title}
                            description={item.description}
                            nextAction={
                              nextAction && item.nextActionClaimId
                                ? {
                                    title: nextAction.title,
                                    description: nextAction.why,
                                    accepted: completedActions[item.nextActionClaimId]?.resubmit ?? false,
                                    onAccept: () => approveResubmit(item.nextActionClaimId!),
                                  }
                                : undefined
                            }
                          />
                        </AssistantMessage>
                      );
                    }
                    if (item.kind === "ask-next") {
                      return (
                        <AssistantMessage key={item.id}>
                          <NextClaimPrompt
                            claimId={item.claimId}
                            choice={item.choice}
                            onLoad={() => chooseNextClaim(item.id, "load")}
                            onStay={() => chooseNextClaim(item.id, "stay")}
                          />
                        </AssistantMessage>
                      );
                    }
                    if (item.kind === "claim-summary") {
                      return <AssistantMessage key={item.id}>{renderSummary(item.claimId)}</AssistantMessage>;
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
                  {thinking ? (
                    <AssistantMessage>
                      <Stack direction="horizontal" align="center" gap={2}>
                        <Spinner color="accent" />
                        <Typography variant="body-m" color="fg-secondary">
                          Thinking
                        </Typography>
                      </Stack>
                    </AssistantMessage>
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

            <SourceRail
              active={propertiesOpen && detail ? detail.source : null}
              propertiesActive={propertiesOpen && !activityOn && !detail}
              onSelect={openSource}
              onShowProperties={() => {
                setActivityOn(false);
                setDetail(null);
                setPropertiesOpen(true);
              }}
              onClose={() => {
                setDetail(null);
                setActivityOn(false);
                setPropertiesOpen(false);
              }}
              onDragSource={startDrag}
              onDragEnd={endDrag}
            />

            <ResizablePanel
              key={activityOn ? "activity" : detail ? "source" : "properties"}
              side="right"
              open={propertiesOpen}
              onOpenChange={setPropertiesOpen}
              hideRailWhenCollapsed
              defaultWidth={activityOn || !detail ? "25.75rem" : "35.25rem"}
              minWidth={activityOn || !detail ? "18rem" : "24rem"}
              maxWidth="44rem"
            >
              <div ref={rightColumnRef} style={{ height: "100%" }}>
              {activityOn ? (
                <ActivityPanel
                  notes={notes}
                  selectedId={pinnedContext?.key.startsWith("activity:") ? pinnedContext.key.slice("activity:".length) : null}
                  onSelect={selectActivity}
                  onEditNote={editNote}
                  onDeleteNote={deleteNote}
                />
              ) : detail ? (
                <SourceDetail
                  source={detail.source}
                  record={detail.record}
                  section={detail.section}
                  focus={detail.focus}
                  onOpenRecord={openRecord}
                  onBack={() => setDetail((current) => (current ? { source: current.source } : current))}
                  onAppeal={(record) =>
                    toast.add({
                      intent: "info",
                      icon: "gavel",
                      content: `Appeal for submission ${record.id} isn't part of this prototype yet`,
                    })
                  }
                  selectedIds={selectedIdsFor(detail.source)}
                  onToggleSelected={toggleSelected}
                />
              ) : (
                <PropertiesPanel
                  activeSource={null}
                  onOpenSource={openSource}
                  onDragSource={startDrag}
                  onDragEnd={endDrag}
                  onOpenLastSubmission={() => openRecord({ source: "submissions", id: INITIAL_SUBMISSION.id })}
                  onOpenAttachment={(id) => openRecord({ source: "attachments", id })}
                  deferred={deferred}
                  claimId={activeClaim}
                />
              )}
              </div>
            </ResizablePanel>
          </div>
        </div>

        {quote ? (
          <AddToChatMenu top={quote.top} left={quote.left} above={quote.above} onAdd={() => addQuote(quote.text)} />
        ) : null}

        <Drawer
          title="Diagnosis codes"
          open={drawer != null}
          onOpenChange={(open) => {
            if (!open) setDrawer(null);
          }}
        >
          <DiagnosisCodes />
        </Drawer>
      </AppShell.Main>
    </AppShell>
  );
}

function deriveContext(drawer: DrawerView | null, detail: DetailView | null, selected: RecordRef[]): ComposerContext | null {
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
  if (detail?.record) {
    const chip = recordChip(detail.record, false);
    const summary = recordSummary(detail.record);
    if (chip && summary) {
      return {
        key: `record:${chip.key}`,
        title: `${sourceInfo(detail.source).label} selected`,
        compare: false,
        chips: [chip],
        facts: summary.facts,
      };
    }
  }
  if (detail) {
    const info = sourceInfo(detail.source);
    return {
      key: `source:${detail.source}`,
      title: `${info.label} are selected`,
      compare: false,
      chips: [{ key: detail.source, label: info.label, icon: info.icon }],
      facts: sourceFacts(detail.source),
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
      <div style={{ width: "100%", minWidth: 0 }}>
      <Stack direction="horizontal" wrap="wrap" gap={1}>
        {context.chips.map((chip) => (
          <TruncatedChip
            key={chip.key}
            icon={chip.icon}
            label={chip.label}
            removable={chip.record != null}
            onRemove={chip.record ? () => onRemoveChip(chip.record!) : undefined}
          />
        ))}
      </Stack>
      </div>
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
