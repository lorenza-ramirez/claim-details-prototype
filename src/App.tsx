import { lazy, Suspense, useEffect, useState } from "react";
import { directions } from "./directions";
import { DirectionSwitcher } from "./components/DirectionSwitcher";
import { VisionNext } from "./directions/vision-next";

const LegacyScreens = lazy(() =>
  import("./legacyScreens").then((module) => ({ default: module.LegacyScreens })),
);

const PREVIOUS_PAGES = ["/", "/vision", "/vision2", "/vision2027"] as const;
type PreviousPath = (typeof PREVIOUS_PAGES)[number];

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  return path === "" ? "/" : path;
}

function isPreviousPath(path: string): path is PreviousPath {
  return PREVIOUS_PAGES.some((page) => page === path);
}

// The current direction is kept in the URL (#direction=direction-2),
// so refreshing the page or sharing a link keeps the same direction.
function directionFromUrl(): string {
  const match = window.location.hash.match(/direction=([\w-]+)/);
  const id = match?.[1];
  return directions.some((d) => d.id === id) ? id! : directions[0].id;
}

export function App() {
  const path = currentPath();
  if (path === "/visionnext") return <VisionNext />;
  if (isPreviousPath(path)) {
    return (
      <Suspense fallback={null}>
        <LegacyScreens path={path} />
      </Suspense>
    );
  }
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
