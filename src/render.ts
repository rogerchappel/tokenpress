import type { PressedTranscript } from "./types.js";

function list(values: string[]): string {
  return values.length === 0 ? "- None found" : values.map((value) => `- ${value}`).join("\n");
}

export function renderMarkdown(result: PressedTranscript): string {
  const lines: string[] = [];
  lines.push("# TokenPress Report", "");
  lines.push(`- Adapter: ${result.adapter}`);
  lines.push(`- Input lines: ${result.inputLines}`);
  lines.push(`- Evidence lines kept: ${result.keptLines}`);
  lines.push(`- Compression ratio: ${result.compressionRatio}`);
  lines.push("");
  lines.push("## Summary", "");
  lines.push(`- Failed commands: ${result.summary.failedCommands}`);
  lines.push(`- Errors: ${result.summary.errorCount}`);
  lines.push(`- Decisions: ${result.summary.decisionCount}`);
  lines.push(`- Unique paths: ${result.summary.pathCount}`);
  lines.push("");
  lines.push("## Commands", "");
  if (result.commands.length === 0) lines.push("- None found");
  for (const command of result.commands) {
    const suffix = command.exitCode === undefined ? "" : ` (exit ${command.exitCode})`;
    lines.push(`- L${command.lineNumber}: \`${command.command}\`${suffix}`);
  }
  lines.push("", "## Errors", "");
  lines.push(list(result.errors.map((item) => `L${item.lineNumber}: ${item.text}`)));
  lines.push("", "## Decisions", "");
  lines.push(list(result.decisions.map((item) => `L${item.lineNumber}: ${item.text}`)));
  lines.push("", "## Paths", "");
  lines.push(list(result.paths));
  lines.push("", "## Evidence", "");
  lines.push(list(result.evidence.map((item) => `L${item.lineNumber} [${item.reason}]: ${item.text}`)));
  if (result.warnings.length > 0) {
    lines.push("", "## Warnings", "", list(result.warnings));
  }
  return `${lines.join("\n")}\n`;
}

export function renderJson(result: PressedTranscript): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}
