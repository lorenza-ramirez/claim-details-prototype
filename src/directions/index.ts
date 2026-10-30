import type { ComponentType } from "react";
import { Direction1 } from "./direction-1";

export type Direction = {
  id: string;
  name: string;
  Screen: ComponentType;
};

// Each design direction gets its own folder and an entry here.
// To add one: copy the folder, then add a line, for example:
//   { id: "direction-2", name: "Direction 2", Screen: Direction2 },
export const directions: Direction[] = [
  { id: "direction-1", name: "Direction 1", Screen: Direction1 },
];
