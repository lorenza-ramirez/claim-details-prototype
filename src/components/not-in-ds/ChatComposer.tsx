import type { ReactNode } from "react";
import { Card, Divider, IconButton, Stack, Typography } from "@getathelas/ui";

// Missing from DS3.0: the AI "Composer" (text box with attach, dictate, and send).
type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  context?: ReactNode;
  inputRef?: React.Ref<HTMLTextAreaElement>;
};

export function ChatComposer({ value, onChange, onSubmit, placeholder = "Ask anything...", context, inputRef }: Props) {
  return (
    <Card padding={false} radius="lg">
      <Stack direction="vertical" gap={1}>
        {context ? (
          <>
            {context}
            <Divider />
          </>
        ) : null}
        <Stack direction="vertical" paddingTop={1} paddingLeft={3} paddingRight={2}>
          <Typography variant="body-s" render={<div />}>
            <textarea
              ref={inputRef}
              aria-label="Ask anything"
              rows={2}
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  onSubmit();
                }
              }}
              style={{
                display: "block",
                width: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                background: "transparent",
                color: "inherit",
                font: "inherit",
                padding: 0,
              }}
            />
          </Typography>
        </Stack>
        <Stack direction="horizontal" align="center" gap={1.5} padding={1.5}>
          <IconButton icon="attach_file" size="sm" aria-label="Attach file" />
          <Stack.Item grow />
          <IconButton icon="mic" size="sm" variant="subtle-accent" aria-label="Dictate" />
          <IconButton icon="arrow_upward" size="sm" variant="strong-accent" aria-label="Send" onClick={onSubmit} />
        </Stack>
      </Stack>
    </Card>
  );
}
