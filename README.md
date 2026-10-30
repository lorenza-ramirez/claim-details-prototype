# DS3.0 prototype starter

A clean starting point for vibe coding prototypes with real Commure Design System 3.0 components. Think of it like a new Figma file with the DS3.0 library already enabled: the components, page layout, fake data, and a direction switcher are ready, and the AI agent writes the code.

Full guide with screenshots and tips: [Notion: DS3.0 Prototype Starter](https://app.notion.com/p/3f8f92a633f280079475dd0185342892)

## Before you start (once)

- Claude Code or Cursor, using your company-approved account
- Access to the DS3.0 package (see below)
- Figma connected in your tool (see the Notion guide)
- Claude Code only: the Claude in Chrome extension, with Chrome open while you work

## Set up DS3.0 access (once per computer)

DS3.0 is a private package on GitHub. Your computer downloads it using your own GitHub login, so there's no token to create or copy.

You need:

- A GitHub account in the `getathelas` org with read access to `getathelas/commure-ui`. If you don't have it, ask the DS owner.
- The GitHub command-line tool. If you don't have it, install it with `brew install gh`.

Then, after you've copied the starter (step 2 below), run this in your own terminal, not the AI chat. It opens your browser once to approve:

```bash
bash scripts/setup-package-registry.sh
```

When it says "Done," tell the AI agent to run setup again. Every prototype after that works without this step.

If setup says your account "can't download DS3.0 yet," your login worked but you still need read access to `getathelas/commure-ui`. Ask the DS owner.

## Start a new prototype

1. Create an empty folder for your prototype and open it in Claude Code or Cursor. In Cursor, open the Agent with Cmd+I.
2. Paste this, with the starter's real URL:

   > Copy the DS3.0 prototype starter from https://github.com/getathelas/ds3-prototype-starter into this folder, then run `yarn setup` and follow the rules in AGENTS.md. Once it's set up, ask me what I want to build.

3. Approve the setup steps when asked. If setup stops, it tells you why in plain language. If GitHub isn't connected yet, it tells you to run the step above.
4. Share a Figma link to one screen or section, or describe what you want.

## While you work

| Say this | What happens |
|---|---|
| "I want to create a new direction" | A new copy of the screen appears in the switcher at the bottom. Nothing gets overwritten. |
| "Save a checkpoint" | Saves your progress on your computer. |
| "Go back to the last checkpoint" | Undoes changes since your last save. |
| "Share this prototype" | Publishes a snapshot link on Vercel for reviews. |

- Coming back later? Open the same folder and say "Pick up where we left off."
- Anything in `src/components/not-in-ds/` is something DS3.0 doesn't have yet. Tell the DS owner.
- Fake data only. Check Figma frames for real patient information before sharing them with the agent.
- Keep approval prompts on. Don't enable auto-accept or auto-run.

## What's in here

| Path | What it is |
|---|---|
| `src/directions/` | Your screens. One folder per design direction. |
| `src/shell/PageLayout.tsx` | Standard page layout with a title and actions. |
| `src/mock/` | Fake patients and other sample data. |
| `src/components/not-in-ds/` | Temporary components DS3.0 doesn't have yet. |
| `AGENTS.md` | Rules the agent follows (both tools read it). |
| `docs/ds3-cheatsheet.md` | Quick reference for DS3.0 components and tokens. |
| `MAINTAINERS.md` | For the DS team: how to keep this starter up to date. |
