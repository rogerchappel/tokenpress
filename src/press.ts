import { detectAdapter, extractCommand, extractExitCode, extractPaths, isDecisionLine, isErrorLine } from "./detect.js";
import { redactLine } from "./redact.js";
import { scoreReason } from "./score.js";
import type { CommandBlock, EvidenceLine, PressedTranscript, PressOptions } from "./types.js";

function uniq(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function evidence(lineNumber: number, text: string, reason: string, score: number): EvidenceLine {
  return { lineNumber, text, reason, score };
}

function rankEvidence(lines: EvidenceLine[], maxEvidence: number): EvidenceLine[] {
  const byKey = new Map<string, EvidenceLine>();
  for (const line of lines) {
    const key = `${line.lineNumber}:${line.reason}:${line.text}`;
    const existing = byKey.get(key);
    if (!existing || line.score > existing.score) byKey.set(key, line);
  }
  return [...byKey.values()]
    .sort((a, b) => b.score - a.score || a.lineNumber - b.lineNumber)
    .slice(0, maxEvidence)
    .sort((a, b) => a.lineNumber - b.lineNumber);
}

export function pressTranscript(input: string, options: PressOptions = {}): PressedTranscript {
  const redact = options.redactSecrets !== false;
  const adapter = detectAdapter(input, options.adapter ?? "auto");
  const rawLines = input.replace(/\r\n/g, "\n").split("\n");
  const commands: CommandBlock[] = [];
  const errors: EvidenceLine[] = [];
  const decisions: EvidenceLine[] = [];
  const paths: string[] = [];
  const evidenceLines: EvidenceLine[] = [];

  rawLines.forEach((raw, index) => {
    const lineNumber = index + 1;
    const text = redact ? redactLine(raw) : raw;
    const command = extractCommand(text);
    if (command) {
      const block: CommandBlock = { lineNumber, command, nearbyErrors: [] };
      commands.push(block);
      evidenceLines.push(evidence(lineNumber, text, "command", scoreReason("command")));
    }

    const exitCode = extractExitCode(text);
    if (exitCode !== undefined && commands.length > 0) {
      commands[commands.length - 1]!.exitCode = exitCode;
    }

    if (isErrorLine(text)) {
      const item = evidence(lineNumber, text, "error", scoreReason("error"));
      errors.push(item);
      evidenceLines.push(item);
      if (commands.length > 0) commands[commands.length - 1]!.nearbyErrors.push(item);
    }

    if (isDecisionLine(text)) {
      const item = evidence(lineNumber, text, "decision", scoreReason("decision"));
      decisions.push(item);
      evidenceLines.push(item);
    }

    const foundPaths = extractPaths(text);
    paths.push(...foundPaths);
    if (options.includePathEvidence === true && foundPaths.length > 0) {
      evidenceLines.push(evidence(lineNumber, text, "path", scoreReason("path")));
    }
  });

  const maxEvidence = options.maxEvidenceLines ?? 40;
  const ranked = rankEvidence(evidenceLines, maxEvidence);
  const keptLineNumbers = new Set(ranked.map((item) => item.lineNumber));
  const inputLines = rawLines.length === 1 && rawLines[0] === "" ? 0 : rawLines.length;

  return {
    adapter,
    inputLines,
    keptLines: keptLineNumbers.size,
    compressionRatio: inputLines === 0 ? 0 : Number((keptLineNumbers.size / inputLines).toFixed(3)),
    summary: {
      failedCommands: commands.filter((command) => command.exitCode !== undefined && command.exitCode !== 0).length,
      errorCount: errors.length,
      decisionCount: decisions.length,
      pathCount: uniq(paths).length
    },
    commands,
    errors,
    paths: uniq(paths),
    decisions,
    evidence: ranked,
    warnings: inputLines === 0 ? ["Input was empty."] : []
  };
}
