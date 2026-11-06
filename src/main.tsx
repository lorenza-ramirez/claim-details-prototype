import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  return path === "" ? "/" : path;
}

const PREVIOUS_PAGES = new Set(["/", "/vision", "/vision2", "/vision2027"]);
const root = createRoot(document.getElementById("root")!);

if (PREVIOUS_PAGES.has(currentPath())) {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  void Promise.all([
    import("@getathelas/ui/globals.css"),
    import("./styles.css"),
    import("@getathelas/ui"),
  ]).then(([, , ui]) => {
    const { CommureProvider } = ui;
    root.render(
      <StrictMode>
        <CommureProvider>
          <App />
        </CommureProvider>
      </StrictMode>,
    );
  });
}
