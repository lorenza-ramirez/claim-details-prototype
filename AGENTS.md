# DS3.0 prototype rules

This is a design prototype built with Commure Design System 3.0 (DS3.0). The person you're working with is a designer, not an engineer. Explain things in plain language, keep momentum, and ask before anything risky.

## First session
- If `node_modules` doesn't exist, run `yarn setup` and explain what it's doing. If it fails, show the designer the message it prints and stop. Never work around a failed DS3.0 install with flags like `--force` or by building substitute components.
- If setup asks for `scripts/setup-package-registry.sh`, ask the designer to run it in their own terminal (it opens a browser to approve), then run setup again. Don't run it yourself.
- Then ask: what is this prototype called, and do you have a Figma link or description? Encourage one screen or section at a time.

## Where code goes
- Each design direction lives in its own folder: `src/directions/<direction-id>/`. Its main screen is `index.tsx`.
- Register directions in `src/directions/index.ts`. The direction switcher at the bottom of the page appears automatically once there are two or more.
- Page layout: `src/shell/PageLayout.tsx`. Fake data: `src/mock/`.
- Don't change `src/main.tsx`, `src/App.tsx`, or `src/components/DirectionSwitcher.tsx` unless the designer asks.

## Components
- Build all UI from `@getathelas/ui`. Before using a component or prop, check `docs/ds3-cheatsheet.md` or the component's Code tab at https://commure-ui.pages.dev/components (for example `/components/button?tab=code`). Never guess props.
- Use `Stack` for layout and `Typography` for all text instead of raw HTML elements and custom CSS.
- Never modify, copy, or restyle DS3.0 components.
- If DS3.0 has no component for what the design needs, build a simple version in `src/components/not-in-ds/`, name the file after what it is, and tell the designer it's missing from DS3.0.

## Styling
- Never hardcode colors, spacing, radii, or font sizes. Use component props (`gap`, `padding`, `variant`, `color`) and DS3.0 tokens such as `var(--color-bg-solid-1)`.
- No custom CSS unless the designer asks for it.
- Sentence case for all text. Never use all caps. Buttons start with a verb. One Primary button per view.

## Directions
- When the designer asks for a new direction, copy the current direction's folder to a new one (`direction-2`, `direction-3`, ...), register it, and make changes only in the new folder. Never modify an existing direction unless the designer names it.

## Checking your work
- Start the dev server with `yarn dev` in the background, open the local URL it prints, and take a screenshot to compare against the design.
- Claude Code: use Claude in Chrome. Don't use the built-in preview tool on macOS.
- Cursor: use the built-in browser.

## Saving and sharing
- When the designer says "save a checkpoint," commit everything locally with a short description of what changed. "Go back to the last checkpoint" means restore the last commit; confirm before discarding work.
- Never run `git push`. This folder is the designer's own copy and isn't connected to GitHub.
- To share, run `yarn share`. It uploads only the built `dist` folder to Vercel. The first time, make sure the Commure team is selected when Vercel asks for a scope.

## Data and secrets
- Use fake data from `src/mock/` only. Never add real patient, provider, or staff information, even if it appears in a Figma frame. Replace it with fake data and tell the designer.
- Never read, print, or edit `.npmrc`, `.env` files, or access tokens. If the designer pastes a token into the chat, tell them to revoke it and get a new one.
