import type { MouseEvent } from "react";
import { Icon, type IconProps } from "@getathelas/ui";

// Missing from DS3.0: Chip has no way to keep its label on one line.
type Props = {
  label: string;
  icon?: IconProps["icon"];
  size?: "sm" | "md";
  variant?: "neutral" | "accent";
  removable?: boolean;
  onRemove?: () => void;
};

export function TruncatedChip({ label, icon, size = "sm", variant = "neutral", removable = false, onRemove }: Props) {
  return (
    <span
      title={label}
      className={[
        "ds:inline-flex ds:items-center ds:gap-1 ds:text-label-s",
        size === "sm" ? "ds:h-7 ds:rounded-soft ds:px-2" : "ds:h-9 ds:rounded-extra-soft ds:px-3",
        variant === "accent" ? "ds:bg-accent-subtle ds:text-fg-accent" : "ds:bg-bg-tp-dark-5 ds:text-fg-primary",
      ].join(" ")}
      style={{ maxWidth: "100%", minWidth: 0 }}
    >
      {icon ? (
        <span style={{ display: "inline-flex", flexShrink: 0 }}>
          <Icon icon={icon} size={1.125} />
        </span>
      ) : null}
      <span className="ds:truncate" style={{ minWidth: 0 }}>
        {label}
      </span>
      {removable ? (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          className="ds:inline-flex ds:cursor-pointer ds:items-center ds:justify-center ds:border-none ds:bg-transparent ds:p-0"
          style={{ flexShrink: 0 }}
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            onRemove?.();
          }}
        >
          <Icon icon="close" size={1.125} />
        </button>
      ) : null}
    </span>
  );
}

const TAG_BACKGROUNDS = {
  cyan: "ds:bg-bg-color-subtle-cyan",
  blue: "ds:bg-bg-color-subtle-blue",
  indigo: "ds:bg-bg-color-subtle-indigo",
  violet: "ds:bg-bg-color-subtle-violet",
  purple: "ds:bg-bg-color-subtle-purple",
  magenta: "ds:bg-bg-color-subtle-magenta",
  slate: "ds:bg-bg-color-subtle-slate",
  neutral: "ds:bg-bg-color-subtle-neutral",
  red: "ds:bg-bg-color-subtle-red",
  orange: "ds:bg-bg-color-subtle-orange",
  yellow: "ds:bg-bg-color-subtle-yellow",
  green: "ds:bg-bg-color-subtle-green",
  teal: "ds:bg-bg-color-subtle-teal",
} as const;

// Missing from DS3.0: Tag has no way to keep its label on one line.
export function TruncatedTag({ label, color }: { label: string; color: keyof typeof TAG_BACKGROUNDS }) {
  return (
    <span
      title={label}
      className={`ds:inline-flex ds:h-7 ds:items-center ds:rounded-soft ds:px-2 ds:text-label-s ds:text-fg-primary ${TAG_BACKGROUNDS[color]}`}
      style={{ maxWidth: "100%", minWidth: 0 }}
    >
      <span className="ds:truncate" style={{ minWidth: 0 }}>
        {label}
      </span>
    </span>
  );
}
