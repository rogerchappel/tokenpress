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
- Input lines: 14
- Evidence lines kept: 6
- Compression ratio: 0.429

## Summary

- Failed commands: 1
- Errors: 2
- Decisions: 2
- Unique paths: 6

## Commands

- L2: `npm test` (exit 1)
- L10: `npm run build`

## Errors

- L7: `Error: expected report at ./out/tokenpress.md`
- L11: `src/cli.ts:12:7 - error TS2322: Type 'string' is not assignable to type 'OutputFormat'.`

## Decisions

- L9: `Decision: keep V1 local-first and write markdown/json only.`
- L12: `TODO: preserve /tmp/demo/transcript.log and docs/PRD.md references.`

## Paths

- `./out/tokenpress.md`
- `/tmp/demo/transcript.log`
- `/Users/roger/dev/demo`
- `docs/PRD.md`
- `markdown/json`
- `src/cli.ts:12:7`

## Evidence

- L2 [command]: `$ npm test`
- L7 [error]: `Error: expected report at ./out/tokenpress.md`
- L9 [decision]: `Decision: keep V1 local-first and write markdown/json only.`
- L10 [command]: `$ npm run build`
- L11 [error]: `src/cli.ts:12:7 - error TS2322: Type 'string' is not assignable to type 'OutputFormat'.`
- L12 [decision]: `TODO: preserve /tmp/demo/transcript.log and docs/PRD.md references.`
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

Command exit codes are attached to the latest detected command only when a line explicitly says `exit code`, `exited code`, or `exited with code`. General application and HTTP `status` lines are preserved as ordinary transcript content and are not treated as process results.

Command detection recognizes `$` and `❯` prompts, contextual `user@host` shell prompts such as `root@build:/srv/app#` and `roger@devbox ~/project$`, and explicit `command:`, `cmd>`, or `shell:` prefixes. A bare `#` line, or ordinary prose containing `#` or `$`, is not a command; include the `user@host` shell context when preserving root commands in a transcript. Markdown reports wrap commands and transcript evidence in variable-length code spans, so embedded backticks, headings, and emphasis markers remain literal.

## Library

```js
import { pressTranscript, renderMarkdown } from "@rogerchappel/tokenpress";

const pressed = pressTranscript(logText, { adapter: "openclaw" });
console.log(renderMarkdown(pressed));
```

## Safety

TokenPress reads only the path or stdin you provide. It does not upload logs, call LLMs, execute transcript commands, or phone home. Common secret-looking values are redacted by default, including GitHub/OpenAI-style tokens, bearer values, AWS access keys, npm tokens, and emails. Assignments whose keys are `token`, `password`, `passwd`, `secret`, `api_key`/`api-key`, or `authorization` are also redacted when their values are unquoted, single-quoted, or double-quoted; matching quote delimiters are preserved in the report.

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
In GitHub Actions, `release:check` validates the package version against the
current ref only when `GITHUB_REF_TYPE` is `tag`; branch and pull-request refs
still run every other release-readiness check without being mistaken for tags.

## License

MIT
