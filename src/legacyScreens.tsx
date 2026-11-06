import legacyCss from "./index.css?inline";

if (!document.getElementById("legacy-styles")) {
  const style = document.createElement("style");
  style.id = "legacy-styles";
  style.textContent = legacyCss;
  document.head.appendChild(style);
}
import { ClaimDetailsPage } from "./components/ClaimDetailsPage";
import { VisionPage } from "./components/VisionPage";
import { Vision2Page } from "./components/Vision2Page";
import { Vision2027Page } from "./components/Vision2027Page";

const PREVIOUS_PAGES = {
  "/": ClaimDetailsPage,
  "/vision": VisionPage,
  "/vision2": Vision2Page,
  "/vision2027": Vision2027Page,
} as const;

export function LegacyScreens({ path }: { path: keyof typeof PREVIOUS_PAGES }) {
  const Page = PREVIOUS_PAGES[path];
  return <Page />;
}
