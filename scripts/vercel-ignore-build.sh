#!/usr/bin/env bash
set -u

log() {
  printf '[vercel-ignore] %s\n' "$*"
}

branch="${VERCEL_GIT_COMMIT_REF:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || printf 'unknown')}"
message="${VERCEL_GIT_COMMIT_MESSAGE:-$(git log -1 --pretty=%B 2>/dev/null || true)}"
current_sha="${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || true)}"
previous_sha="${VERCEL_GIT_PREVIOUS_SHA:-}"
environment="${VERCEL_ENV:-preview}"

# Preview deployments are explicit checkpoints, not a side effect of every push.
# Add [vercel-preview] to one commit after the relevant GitHub/browser gates are green.
if [[ "$environment" != "production" && "$branch" != "main" && "$branch" != "master" ]]; then
  if [[ "$message" != *"[vercel-preview]"* ]]; then
    log "skip preview on ${branch}: missing [vercel-preview] checkpoint marker"
    exit 0
  fi
fi

# Fail open for production or an explicit preview checkpoint when Vercel cannot
# provide a trustworthy comparison base. Missing history must never suppress a
# deployment that the release flow explicitly requested.
if [[ -z "$current_sha" || -z "$previous_sha" ]]; then
  log "build: comparison SHA unavailable"
  exit 1
fi

if [[ "$current_sha" == "$previous_sha" ]]; then
  log "skip: current commit already matches the last successful deployment"
  exit 0
fi

if ! git cat-file -e "${previous_sha}^{commit}" 2>/dev/null; then
  log "build: previous successful deployment SHA is not present in checkout"
  exit 1
fi

# Only product/runtime/build inputs should consume a Vercel build. Docs,
# handoff/badcase/progress files, GitHub workflows, evaluation artifacts, and
# browser-test scripts continue to use GitHub CI without creating previews.
relevant_paths=(
  src
  public
  api
  apps
  packages
  index.html
  package.json
  package-lock.json
  pnpm-lock.yaml
  yarn.lock
  bun.lock
  bun.lockb
  vercel.json
  vite.config.ts
  vite.config.js
  vite.config.mts
  vite.config.mjs
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  postcss.config.js
  postcss.config.cjs
  postcss.config.mjs
  tailwind.config.js
  tailwind.config.ts
)

if git diff --quiet "$previous_sha" "$current_sha" -- "${relevant_paths[@]}"; then
  log "skip: no deploy-relevant changes since the last successful deployment"
  exit 0
fi

log "build: deploy-relevant changes detected"
exit 1
