import type { ReactNode } from "react";
import { Stack, Typography } from "@getathelas/ui";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

// Standard page: title and optional actions at the top, content below.
// Spacing uses the DS3.0 scale (12 = 48px page gutter, 8 = 32px, 2 = 8px).
export function PageLayout({ title, description, actions, children }: Props) {
  return (
    <Stack direction="vertical" gap={8} padding={12}>
      <Stack direction="horizontal" align="center" gap={4}>
        <Stack direction="vertical" gap={2}>
          <Typography variant="heading-l" render={<h1 />}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body-m" color="fg-secondary">
              {description}
            </Typography>
          )}
        </Stack>
        <Stack.Item grow />
        {actions}
      </Stack>
      {children}
    </Stack>
  );
}
