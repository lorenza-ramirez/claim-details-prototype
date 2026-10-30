# Maintaining the DS3.0 prototype starter

For the DS owner and whoever keeps this starter current. Designers don't need this file.

## How it works

- Each prototype is its own copy of this repo on the designer's computer. `yarn setup` disconnects the copy from this repo (fresh git history, no remote), so designer work can't be pushed here.
- DS3.0 comes from the `@getathelas/ui` and `@getathelas/tokens` packages, so prototypes use the same components as production.
- `AGENTS.md` holds all agent rules. Cursor reads it directly; Claude Code reads it through `CLAUDE.md`.
- Sharing uses `yarn share`, which builds locally and uploads only `dist/` to Vercel. Vercel never needs package access.

## Before rolling out

- [x] Move the starter to the getathelas org: it lives at `getathelas/ds3-prototype-starter` with internal visibility, so anyone in the Commure GitHub enterprise can copy it. Keep the name `ds3-prototype-starter`; `scripts/setup.sh` uses it to disconnect new copies. Archive the old `donlee-commure/ds3-prototype-starter` so nobody copies a stale version.
- [x] Package access: designers run `scripts/setup-package-registry.sh`, the same flow `sense_frontend` uses. It adds `read:packages` to their own `gh` login and exports it as `NODE_AUTH_TOKEN`. `scripts/registry.npmrc` points `@getathelas` at GitHub Packages and reads that variable, so it holds no secret. `scripts/setup.sh` passes it in with `NPM_CONFIG_USERCONFIG` only while checking and installing. It's deliberately not a root `.npmrc`: yarn 1 crashes on every command when a root `.npmrc` references an unset variable. The token is the designer's full `gh` login (not read-only), but it's individual, stored in the keychain, and dies when they leave the org.
- [ ] Decide how designers get read access to `getathelas/commure-ui` (org membership alone gives a 403), then name that contact in the README.
- [ ] Replace `"latest"` for `@getathelas/ui` and `@getathelas/tokens` in `package.json` with the current release version. Until then, `yarn.lock` pins every new prototype to the versions it was last tested with (ui 1.6.0, tokens 0.0.8).
- [ ] Confirm the React version DS3.0 supports (this starter uses React 19).
- [ ] Confirm whether DS3.0 needs fonts or icon fonts loaded in `index.html`, or whether `globals.css` covers them.
- [ ] Run `yarn setup && yarn dev` on a clean machine in both Claude Code and Cursor. The starter screen should render with DS3.0 styling.
- [ ] Vercel: confirm the Commure team scope designers should pick, and that deployment protection (Commure login required) is on for that team.
- [ ] Verify `.claude/settings.json` deny rules against current Claude Code docs.
- [ ] Decide whether to add the `sense-frontend` plugin from `getathelas/agent-skills`. It's built for production code, so test whether its conventions suit prototypes before enabling it in `.claude/settings.json`.

## Keeping it current

- **New DS3.0 release:** bump the versions in `package.json`, run `yarn setup` to refresh `yarn.lock` (a plain `yarn install` can't reach the private registry), run the starter, and update `docs/ds3-cheatsheet.md` if any props changed. Existing prototypes keep their versions until a designer asks the agent to update.
- **Recurring agent mistakes:** when designers report the same correction twice, add a rule to `AGENTS.md`. Keep it short; every line is read on every request.
- **Missing components:** collect what designers put in `src/components/not-in-ds/`. It's a direct signal for the DS3.0 roadmap.

## Safety notes

- `.npmrc` and `.env` files are gitignored, and agents are told never to read them. `scripts/registry.npmrc` is committed but holds no secret, only `${NODE_AUTH_TOKEN}`.
- Mock data in `src/mock/` must stay obviously fake.
- Agents are told never to `git push`; Claude Code also blocks it in `.claude/settings.json`.
