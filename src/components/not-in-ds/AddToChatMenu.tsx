import { Card, Shortcut } from "@getathelas/ui";

// Missing from DS3.0: a menu that appears when text is highlighted.
type Props = {
  top: number;
  left: number;
  above: boolean;
  onAdd: () => void;
};

export function AddToChatMenu({ top, left, above, onAdd }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        transform: above ? "translate(-50%, calc(-100% - 0.5rem))" : "translate(-50%, 0.5rem)",
        zIndex: 30,
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <Card floating padding="sm" radius="md">
        <div
          role="button"
          tabIndex={0}
          onClick={onAdd}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onAdd();
          }}
          style={{ cursor: "pointer" }}
        >
          <Shortcut action="Add to chat" shortcut={["mod", "L"]} />
        </div>
      </Card>
    </div>
  );
}
