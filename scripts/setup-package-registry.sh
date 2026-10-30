#!/usr/bin/env bash
set -euo pipefail

# Sets up local read access to @getathelas packages on GitHub Packages
# (published from github.com/getathelas/commure-ui).
#
# No shared tokens: each person authenticates with their own GitHub
# identity via the gh CLI. The token lives in the system keychain and is
# exposed as NODE_AUTH_TOKEN at shell startup, which scripts/registry.npmrc reads — nothing is
# written to disk in plaintext.
#
# Usage: bash scripts/setup-package-registry.sh   (run it in your own terminal)

bold() { printf '\033[1m%s\033[0m\n' "$1"; }

# CI provides NODE_AUTH_TOKEN via workflow env — nothing to do.
if [ -n "${CI:-}" ]; then
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  bold "The GitHub CLI (gh) is required."
  echo "Install it with: brew install gh"
  exit 1
fi

if ! gh auth status -h github.com >/dev/null 2>&1; then
  bold "Logging you into GitHub (opens your browser)..."
  gh auth login -h github.com -w
fi

if ! gh auth status -h github.com 2>&1 | grep -q "read:packages"; then
  bold "Adding the read:packages scope to your GitHub session (opens your browser)..."
  gh auth refresh -h github.com -s read:packages
fi

if ! gh auth token -h github.com >/dev/null 2>&1; then
  echo "Could not read a token from gh after login. Run 'gh auth status' to debug." >&2
  exit 1
fi

case "${SHELL:-}" in
  */zsh) profile="${ZDOTDIR:-$HOME}/.zshrc" ;;
  */bash) profile="$HOME/.bashrc" ;;
  *) profile="$HOME/.profile" ;;
esac

export_line='export NODE_AUTH_TOKEN="$(gh auth token -h github.com 2>/dev/null)"'
if ! grep -qF "NODE_AUTH_TOKEN" "$profile" 2>/dev/null; then
  {
    printf '\n# GitHub Packages auth for @getathelas (added by scripts/setup-package-registry.sh)\n'
    printf '%s\n' "$export_line"
  } >>"$profile"
  bold "Added NODE_AUTH_TOKEN to $profile"
else
  bold "NODE_AUTH_TOKEN already configured in $profile — leaving it as is."
fi

bold "Done. Open a new terminal (or run: source $profile), then run setup again."
