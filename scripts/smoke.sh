#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP_DIR="${TMPDIR:-/tmp}/tokenpress-smoke-$$"
trap 'rm -rf "$TMP_DIR"' EXIT
mkdir -p "$TMP_DIR"

node "$ROOT/dist/cli.js" --help >/dev/null
node "$ROOT/dist/cli.js" inspect "$ROOT/fixtures/sample" --output "$TMP_DIR" >/tmp/tokenpress-smoke.stdout 2>/tmp/tokenpress-smoke.stderr
test -s "$TMP_DIR/tokenpress.md"
grep -q "TokenPress Report" "$TMP_DIR/tokenpress.md"
grep -q "npm test" "$TMP_DIR/tokenpress.md"
node "$ROOT/dist/cli.js" "$ROOT/fixtures/sample/transcript.log" --format json > "$TMP_DIR/report.json"
node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); if(!r.commands.length || !r.errors.length || r.summary.failedCommands < 1) process.exit(1)' "$TMP_DIR/report.json"
node "$ROOT/dist/cli.js" "$ROOT/fixtures/sample/agent-session.log" --format json > "$TMP_DIR/agent-session.json"
node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); if(r.summary.failedCommands !== 1 || !r.decisions.length) process.exit(1)' "$TMP_DIR/agent-session.json"
printf 'tokenpress smoke ok\n'
