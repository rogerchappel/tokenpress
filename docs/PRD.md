# tokenpress

Status: factory-mvp-complete
Decision: ship locally, hold npm publish for human release review

## Scorecard

Total: 76/100
Band: factory MVP
Last scored: 2026-05-02
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 16/20 | Agent/terminal transcripts routinely overflow useful context with command noise. |
| Demand signal | 10/20 | Adjacent `tokenjuice` interest plus Roger workflow need; still needs independent usage. |
| V1 buildability | 20/20 | Local deterministic CLI/library built with fixtures, tests, and smoke checks. |
| Differentiation | 11/15 | Evidence-preserving reports, adapter hints, default redaction, no AI/network dependency. |
| Agentic workflow leverage | 13/15 | Designed for handoff summaries, PR reviews, and session recovery. |
| Distribution potential | 6/10 | Clear README examples and fixture demos; needs real-world examples post-release. |

## Pitch

A terminal-output compactor that trims noisy agent logs into lean, evidence-preserving context blocks.

## Why It Matters

This is a renamed backlog idea inspired by an external repo/activity signal. It should be treated as a fresh OSS concept, not a copy of the source project. The first qualification pass should identify Roger-specific workflow value, defensible differentiation, and a tiny local-first V1.

## Qualification

### Pub Test

Can this be explained clearly in one sentence to local-first or agentic-tooling developers? Passes: "Squeezes noisy terminal/agent logs into small reports that keep commands, errors, paths, and decisions."

### Competitors / Adjacent Tools

- `tokenjuice` — source inspiration: https://github.com/vincentkoc/tokenjuice (TypeScript, stars/forks signal: 158).

### Star / Demand Signal

Seed signal from the linked public repository list shared by Roger on 2026-05-02. Re-check stars, forks, issues, and recent commits before promoting to ready.

### Real Problem

Long agent sessions and CI transcripts hide the handful of facts needed for handoff: what ran, what failed, where files live, and why a decision was made.

### V1 Buildability

Built as a deterministic TypeScript CLI/library over local files/stdin with no external calls.

## V1 Scope

- Parse terminal-heavy transcripts from files, directories, or stdin
- Preserve commands, errors, file paths, decisions, and compact summary metrics
- Emit compact Markdown/JSON summaries
- Adapters for OpenClaw/Codex/plain logs
- Redact common secret-looking values by default

## Out of Scope

- Copying the source repo name or implementation directly.
- Hidden network calls, credential scraping, telemetry, or publishing.
- Broad platform replacement in V1.

## CLI/API Sketch

```bash
tokenpress --help
tokenpress inspect ./fixtures/sample --output ./out
tokenpress fixtures/sample/codex.log --format json
cat agent.log | tokenpress inspect --adapter openclaw
```

## Verification

- Unit tests for fixture parsing, report generation, redaction, and directory input.
- CLI smoke test using local fixtures and real output files.
- README with install, quickstart, safety notes, and source attribution.
- No hidden network, credential, or publish behavior.

## Agent Prompt

Build `tokenpress` as a renamed, local-first OSS idea inspired by `tokenjuice`. Preserve attribution, avoid direct copying, and focus V1 on deterministic fixtures, clear safety boundaries, and practical agent/developer workflow value.
