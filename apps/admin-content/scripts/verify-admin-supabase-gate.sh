#!/usr/bin/env bash
set -euo pipefail

EXPECTED_NODE_VERSION="${ADMIN_EXPECTED_NODE_VERSION:-v24.14.0}"
EXPECTED_SUPABASE_VERSION="${ADMIN_EXPECTED_SUPABASE_VERSION:-2.115.0}"
PORT_BASE="${ADMIN_SUPABASE_PORT_BASE:-56420}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$APP_ROOT/../.." && pwd)"
TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/aquaguide-admin-supabase-gate.XXXXXX")"
STATUS_JSON="$TMP_ROOT/status.json"

cleanup() {
  supabase stop --workdir "$TMP_ROOT" --no-backup >/dev/null 2>&1 || true
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT INT TERM

[[ "$(node -v)" == "$EXPECTED_NODE_VERSION" ]] || { echo "Node version drift: expected $EXPECTED_NODE_VERSION, got $(node -v)"; exit 1; }
[[ "$(supabase --version)" == "$EXPECTED_SUPABASE_VERSION" ]] || { echo "Supabase CLI drift: expected $EXPECTED_SUPABASE_VERSION, got $(supabase --version)"; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker is required for the ephemeral Supabase gate."; exit 1; }
python3 - "$PORT_BASE" <<'PY'
import socket, sys
base = int(sys.argv[1])
for port in (base, base + 1, base + 2):
    sock = socket.socket()
    try:
        sock.bind(('127.0.0.1', port))
    except OSError:
        raise SystemExit(f'Port {port} is busy; set ADMIN_SUPABASE_PORT_BASE to a free range.')
    finally:
        sock.close()
PY

supabase init --workdir "$TMP_ROOT" >/dev/null
mkdir -p "$TMP_ROOT/supabase/migrations"
python3 - "$TMP_ROOT/supabase/config.toml" "$PORT_BASE" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1]); base = int(sys.argv[2]); text = p.read_text()
text = text.replace('port = 54321', f'port = {base + 1}', 1)
text = text.replace('port = 54322', f'port = {base + 2}', 1)
text = text.replace('shadow_port = 54320', f'shadow_port = {base}', 1)
p.write_text(text)
PY
MIGRATIONS=(
  202607160001_core_schema.sql
  202608280001_species_seo_admin.sql
  202608280002_species_seo_group_inheritance.sql
  202608280003_species_seo_localized_name.sql
  202608280004_species_seo_index_strategy.sql
  202608280005_species_seo_revision_history.sql
  202608280006_species_seo_release_gate_probe.sql
  202608280007_species_seo_publish_readiness.sql
  20260901064408_species_seo_server_export_boundary.sql
)
for migration in "${MIGRATIONS[@]}"; do
  source_file="$REPO_ROOT/supabase/migrations/$migration"
  [[ -f "$source_file" ]] || { echo "Missing required migration: $migration"; exit 1; }
  cp "$source_file" "$TMP_ROOT/supabase/migrations/$migration"
done

EXCLUDES="realtime,storage-api,imgproxy,mailpit,postgres-meta,studio,edge-runtime,logflare,vector,supavisor"
echo "Starting ephemeral Supabase with pinned Admin migrations..."
START_LOG="$TMP_ROOT/supabase-start.log"
if ! supabase start --workdir "$TMP_ROOT" -x "$EXCLUDES" >"$START_LOG" 2>&1; then
  cat "$START_LOG"
  exit 1
fi
echo "Ephemeral Supabase started."
supabase status --workdir "$TMP_ROOT" -o json > "$STATUS_JSON" 2>/dev/null

cd "$APP_ROOT"
node scripts/test-local-supabase-gate.mjs --status "$STATUS_JSON" --project-id "$(basename "$TMP_ROOT")"
echo "Admin Supabase gate PASS; ephemeral database will now be destroyed."
