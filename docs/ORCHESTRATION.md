# TokenPress Orchestration

TokenPress is intentionally boring to run: one local CLI, deterministic fixtures, no network, no telemetry, and no background agents.

## Local agent workflow

1. Run `npm install` once.
2. Run `npm run check`, `npm test`, `npm run build`, and `npm run smoke` before proposing changes.
3. For PR review, attach a sample `tokenpress inspect fixtures/sample --format markdown` report when parser behavior changes.
4. Keep tests fixture-backed. Do not require cloud logs, credentials, or live terminals.

## Safety boundaries

- TokenPress reads only the paths explicitly provided by the user.
- TokenPress redacts common secret-looking tokens by default.
- TokenPress never phones home, publishes reports, shells out, or uploads logs.
- `--no-redact` exists for local debugging only and should not be used in shared reports.

## Release gates

- `npm run release:check`
- `bash scripts/validate.sh`
- Manual smoke: `node dist/cli.js inspect fixtures/sample --output /tmp/tokenpress-real-smoke`
