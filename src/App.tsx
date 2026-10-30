import { useEffect, useState } from "react";
import { directions } from "./directions";
import { DirectionSwitcher } from "./components/DirectionSwitcher";
import { VisionNext } from "./directions/vision-next";

// Standalone pages with their own URL, outside the direction switcher.
const PAGES: Record<string, () => React.JSX.Element> = {
  "/visionnext": VisionNext,
};

// The current direction is kept in the URL (#direction=direction-2),
// so refreshing the page or sharing a link keeps the same direction.
function directionFromUrl(): string {
  const match = window.location.hash.match(/direction=([\w-]+)/);
  const id = match?.[1];
  return directions.some((d) => d.id === id) ? id! : directions[0].id;
}

export function App() {
  const Page = PAGES[window.location.pathname.replace(/\/+$/, "").toLowerCase()];
  if (Page) return <Page />;
  return <Directions />;
}

function Directions() {
  const [currentId, setCurrentId] = useState(directionFromUrl);

  useEffect(() => {
    const onHashChange = () => setCurrentId(directionFromUrl());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const select = (id: string) => {
    window.location.hash = `direction=${id}`;
    setCurrentId(id);
  };

  const current = directions.find((d) => d.id === currentId) ?? directions[0];
  const Screen = current.Screen;

  return (
    <>
      <Screen />
      {directions.length > 1 && (
        <DirectionSwitcher directions={directions} value={current.id} onChange={select} />
      )}
    </>
  );
}
