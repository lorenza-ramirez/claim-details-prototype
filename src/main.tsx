import "@getathelas/ui/globals.css";
import "./styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CommureProvider } from "@getathelas/ui";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CommureProvider>
      <App />
    </CommureProvider>
  </StrictMode>
);
