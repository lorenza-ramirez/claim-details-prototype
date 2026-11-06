import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve(".vercel/output");
const staticOutput = resolve(output, "static");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve("dist"), staticOutput, { recursive: true });
await writeFile(
  resolve(output, "config.json"),
  `${JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2,
  )}\n`,
);
