import type { ReactNode } from "react";
import { Card, Icon, Stack, Typography } from "@getathelas/ui";

// Missing from DS3.0: the AI "Message Element" (assistant emblem beside a message,
// or a right-aligned user bubble).
export function AssistantMessage({ children }: { children: ReactNode }) {
  return (
    <Stack direction="horizontal" align="end" gap={3}>
      <span style={{ color: "var(--ds-color-blue-500)", display: "inline-flex" }}>
        <Icon icon="athelas_ai" size={2.25} aria-hidden />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </Stack>
  );
}

export function UserMessage({ children, attachments }: { children?: ReactNode; attachments?: ReactNode }) {
  return (
    <Stack direction="vertical" align="end" gap={1}>
      <Typography variant="label-xs" color="fg-tertiary">
        You
      </Typography>
      <div style={{ maxWidth: "80%", minWidth: 0 }}>
        <Card padding="sm" radius="lg">
          <Stack direction="vertical" gap={2}>
            {attachments}
            {children ? <Typography variant="body-m">{children}</Typography> : null}
          </Stack>
        </Card>
      </div>
    </Stack>
  );
}
