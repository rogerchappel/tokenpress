# TokenPress Tasks

## MVP

- [x] Scaffold a local-first TypeScript CLI package.
- [x] Parse terminal-heavy transcripts from files, directories, or stdin.
- [x] Preserve commands, errors, file paths, and decision lines as evidence.
- [x] Emit compact Markdown and JSON reports.
- [x] Include OpenClaw/Codex/plain adapter detection.
- [x] Redact common secret-looking values by default, including bearer/AWS/npm tokens.
- [x] Add fixture-backed library and CLI tests for parsing, redaction, rendering, and directory input.
- [x] Add a real CLI smoke script.
- [x] Document safety boundaries and source inspiration attribution.

## Release readiness

- [x] `npm run release:check` passes locally.
- [x] `bash scripts/validate.sh` passes locally.
- [x] Real CLI fixture smoke writes Markdown output.
- [x] GitHub description/topics configured for discovery.

## Follow-up backlog

- [ ] Add richer OpenClaw JSONL parsing when stable sample logs are available.
- [ ] Add configurable scoring profiles for CI logs, agent logs, and support logs.
- [ ] Add HTML report output after the Markdown/JSON API settles.
- [ ] Publish npm package only after human review and release tagging.
