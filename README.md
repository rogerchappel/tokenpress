# TokenPress

**The log juicer for tired agents.** TokenPress squeezes noisy terminal transcripts into lean, evidence-preserving context blocks so the next human or agent can see the commands, errors, paths, and decisions without rereading the whole scrollback swamp.

It is local-first, deterministic, and deliberately unglamorous: no telemetry, no hidden network calls, no credential hunting, no "AI summary" magic. Just practical compression for terminal-heavy work.

## Why

Agent sessions and CI logs get huge fast. Most of the useful context is not prose — it is the command that ran, the error that failed, the path that matters, and the decision that explains the next move. TokenPress keeps those signals and trims the rest.

## Install

TokenPress is distributed through this repository's GitHub releases, not the
npm registry. The unscoped `tokenpress` name on npm belongs to another project;
do not use `npm install -g tokenpress`.

```bash
npm install -g https://github.com/rogerchappel/tokenpress/releases/download/v0.1.0/tokenpress-0.1.0.tgz
tokenpress --version
```

The installed executable remains `tokenpress`. Release v0.1.0 predates the
scoped package identity and its asset is named `tokenpress-0.1.0.tgz`. Starting
with the next release, npm's scoped-package filename is used; for example,
v0.2.0 will be `rogerchappel-tokenpress-0.2.0.tgz`.

For local development:

```bash
git clone https://github.com/rogerchappel/tokenpress.git
cd tokenpress
npm install
npm run build
```

## Quickstart

```bash
tokenpress inspect ./fixtures/sample --output ./out
cat agent.log | tokenpress inspect --adapter openclaw
node dist/cli.js transcript.log --format json > report.json
```

Example Markdown output:

```markdown
# TokenPress Report

- Adapter: openclaw
- Input lines: 12
- Evidence lines kept: 7

## Summary
- Failed commands: 1
- Errors: 1
- Decisions: 1
- Unique paths: 2

## Commands
- L2: `npm test` (exit 1)

## Errors
- L6: Error: expected report at ./out/tokenpress.md
```

## CLI

```bash
tokenpress inspect [path] [--format markdown|json] [--output file-or-dir]
tokenpress [path] [--format markdown|json]
```

Options:

- `--adapter auto|plain|openclaw|codex` — parser hint; default is `auto`.
- `--format markdown|json` — report format; default is `markdown`.
- `--output, -o <path>` — write to a file or directory.
- `--max-lines <number>` — cap retained evidence lines.
- `--path-evidence` — keep lines that only mention relevant paths.
- `--no-redact` — keep secrets visible; useful only for private local debugging.

Directory inputs prefer `transcript.log`, `transcript.txt`, `sample.log`, or `sample.txt`, then fall back to the first sorted `.log`/`.txt` file. See `docs/adapters.md` for adapter details.

## Library

```js
import { pressTranscript, renderMarkdown } from "@rogerchappel/tokenpress";

const pressed = pressTranscript(logText, { adapter: "openclaw" });
console.log(renderMarkdown(pressed));
```

## Safety

TokenPress reads only the path or stdin you provide. It does not upload logs, call LLMs, execute transcript commands, or phone home. Common secret-looking values are redacted by default, including GitHub/OpenAI-style tokens, bearer values, AWS access keys, npm tokens, emails, and `token=...`/`password=...` pairs.

## Attribution

TokenPress was inspired by the public idea space around [`tokenjuice`](https://github.com/vincentkoc/tokenjuice), but it is a fresh implementation with a different scope: deterministic local transcript compaction for agent/developer workflows.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm run smoke
bash scripts/validate.sh
```

## Release package check

```bash
npm run package:smoke
npm run release:check
```

The package smoke builds a real npm tarball, installs it into a temporary
prefix, invokes the packaged `tokenpress` executable, verifies its version and
help output, and checks the release-candidate file set. It does not publish.

## License

MIT
