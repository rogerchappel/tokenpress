#!/usr/bin/env node
import { readInput, writeOutput } from "./io.js";
import { pressTranscript } from "./press.js";
import { renderJson, renderMarkdown } from "./render.js";
import type { AdapterName, OutputFormat } from "./types.js";

interface CliOptions {
  input?: string;
  output?: string;
  format: OutputFormat;
  adapter: AdapterName;
  maxEvidenceLines: number;
  redactSecrets: boolean;
}

const HELP = `TokenPress — squeeze noisy terminal logs into evidence-preserving context blocks.

Usage:
  tokenpress inspect [path] [--format markdown|json] [--output file-or-dir]
  tokenpress [path] [--format markdown|json]

Examples:
  tokenpress inspect ./fixtures/sample --output ./out
  tokenpress transcript.log --format json
  cat agent.log | tokenpress inspect --adapter openclaw

Options:
  --adapter auto|plain|openclaw|codex  Parser hints (default: auto)
  --format markdown|json              Output format (default: markdown)
  --output, -o <path>                 Write report to a file or directory
  --max-lines <number>                Max evidence lines to keep (default: 40)
  --no-redact                         Keep secrets visible (not recommended)
  --help, -h                          Show help
  --version, -v                       Show version
`;

function readVersion(): string {
  return "0.1.0";
}

function parseArgs(argv: string[]): CliOptions | "help" | "version" {
  const args = [...argv];
  if (args[0] === "inspect") args.shift();
  const options: CliOptions = { format: "markdown", adapter: "auto", maxEvidenceLines: 40, redactSecrets: true };
  while (args.length > 0) {
    const arg = args.shift()!;
    if (arg === "--help" || arg === "-h") return "help";
    if (arg === "--version" || arg === "-v") return "version";
    if (arg === "--no-redact") {
      options.redactSecrets = false;
      continue;
    }
    if (arg === "--format") {
      const value = args.shift();
      if (value !== "markdown" && value !== "json") throw new Error("--format must be markdown or json");
      options.format = value;
      continue;
    }
    if (arg === "--adapter") {
      const value = args.shift();
      if (value !== "auto" && value !== "plain" && value !== "openclaw" && value !== "codex") throw new Error("--adapter must be auto, plain, openclaw, or codex");
      options.adapter = value;
      continue;
    }
    if (arg === "--output" || arg === "-o") {
      const value = args.shift();
      if (!value) throw new Error(`${arg} requires a path`);
      options.output = value;
      continue;
    }
    if (arg === "--max-lines") {
      const value = Number(args.shift());
      if (!Number.isInteger(value) || value < 1) throw new Error("--max-lines must be a positive integer");
      options.maxEvidenceLines = value;
      continue;
    }
    if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    if (options.input) throw new Error(`Unexpected extra argument: ${arg}`);
    options.input = arg;
  }
  return options;
}

export async function run(argv = process.argv.slice(2)): Promise<number> {
  try {
    const parsed = parseArgs(argv);
    if (parsed === "help") {
      process.stdout.write(HELP);
      return 0;
    }
    if (parsed === "version") {
      process.stdout.write(`${readVersion()}\n`);
      return 0;
    }
    const input = await readInput(parsed.input);
    const result = pressTranscript(input, {
      adapter: parsed.adapter,
      maxEvidenceLines: parsed.maxEvidenceLines,
      redactSecrets: parsed.redactSecrets
    });
    const rendered = parsed.format === "json" ? renderJson(result) : renderMarkdown(result);
    const outputPath = await writeOutput(parsed.output, parsed.format, rendered);
    if (outputPath) process.stderr.write(`wrote ${outputPath}\n`);
    else process.stdout.write(rendered);
    return result.warnings.length > 0 ? 1 : 0;
  } catch (error) {
    process.stderr.write(`tokenpress: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().then((code) => {
    process.exitCode = code;
  });
}
