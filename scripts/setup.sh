#!/usr/bin/env bash
# Sets up a new DS3.0 prototype. Safe to run more than once.
# Run with: yarn setup   (or: bash scripts/setup.sh)

set -euo pipefail
cd "$(dirname "$0")/.."

TEMPLATE_REPO_NAME="ds3-prototype-starter"
REQUIRED_NODE_MAJOR=20

say() { printf "\n%s\n" "$1"; }
stop() { say "Setup stopped: $1"; exit 1; }

# 1. Node.js
if ! command -v node >/dev/null 2>&1; then
  stop "Node.js isn't installed. Install the LTS version from https://nodejs.org (or ask IT), then run setup again."
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
  stop "Node.js $NODE_MAJOR is too old. Install version $REQUIRED_NODE_MAJOR or newer from https://nodejs.org, then run setup again."
fi

# 2. yarn (comes with Node through Corepack)
if ! command -v yarn >/dev/null 2>&1; then
  say "Turning on yarn..."
  corepack enable >/dev/null 2>&1 || stop "Couldn't turn on yarn. Run 'npm install -g yarn' (or ask IT), then run setup again."
fi

# 3. Disconnect from the starter template, so work can't be pushed to it by accident.
#    A fresh copy of the template gets its own clean history.
if [ -d .git ] && git remote get-url origin 2>/dev/null | grep -q "$TEMPLATE_REPO_NAME"; then
  rm -rf .git
  say "Disconnected this copy from the starter template. Your work stays on your computer."
fi
if [ ! -d .git ]; then
  git init -q
fi
# Local-only identity for checkpoints, if none is set
git config user.name >/dev/null 2>&1 || git config user.name "DS3.0 prototype"
git config user.email >/dev/null 2>&1 || git config user.email "prototype@localhost"

# 4. DS3.0 package access (checks access without showing the token)
#    scripts/registry.npmrc reads the token from NODE_AUTH_TOKEN, which comes
#    from the designer's own GitHub login (see scripts/setup-package-registry.sh).
#    It's passed in only for these commands, so yarn never needs it otherwise.
say "Checking access to the DS3.0 package..."
export NPM_CONFIG_USERCONFIG="$PWD/scripts/registry.npmrc"
if [ -z "${NODE_AUTH_TOKEN:-}" ] && command -v gh >/dev/null 2>&1; then
  NODE_AUTH_TOKEN="$(gh auth token -h github.com 2>/dev/null || true)"
  export NODE_AUTH_TOKEN
fi
if [ -z "${NODE_AUTH_TOKEN:-}" ] || ! gh auth status -h github.com 2>&1 | grep -q "read:packages"; then
  stop "This computer isn't connected to GitHub for DS3.0 yet. In your own terminal (not the AI chat), run: bash scripts/setup-package-registry.sh   Then run setup again."
fi
if ! npm view @getathelas/ui version >/dev/null 2>&1; then
  stop "Your GitHub account can't download DS3.0 yet. Ask the DS owner for read access to getathelas/commure-ui, then run setup again."
fi

# 5. Install
say "Installing DS3.0 and the prototype tools. This takes a minute or two..."
yarn install --silent --non-interactive || stop "Install failed. Copy the error above into your help channel, without any tokens."

# 6. First checkpoint
if [ -z "$(git log --oneline -1 2>/dev/null || true)" ]; then
  git add -A
  git commit -qm "Start prototype from DS3.0 starter"
fi

say "All set. Start the prototype with: yarn dev"
