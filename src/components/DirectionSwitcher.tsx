import { Card, SegmentedControl } from "@getathelas/ui";

type Props = {
  directions: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
};

// Floating switcher for flipping between design directions.
// Appears automatically once src/directions/index.ts lists two or more.
export function DirectionSwitcher({ directions, value, onChange }: Props) {
  return (
    <div className="direction-switcher" role="region" aria-label="Design directions">
      <Card floating padding="sm">
        <SegmentedControl
          size="sm"
          value={[value]}
          onValueChange={(next) => {
            // Ignore clicks that would leave nothing selected.
            if (next[0]) onChange(next[0]);
          }}
        >
          {directions.map((d) => (
            <SegmentedControl.Button key={d.id} value={d.id}>
              {d.name}
            </SegmentedControl.Button>
          ))}
        </SegmentedControl>
      </Card>
    </div>
  );
}
