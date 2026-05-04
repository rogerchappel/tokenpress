import type { AdapterName } from "./types.js";

const COMMAND_PATTERNS = [
  /^\s*[$❯]\s+(.+)$/,
  /^\s*(?:\w+[\w.-]*@[^\s]+\s+)?[^\n]*[#$]\s+(.+)$/,
  /^\s*(?:command|cmd|shell)\s*[:>]\s*(.+)$/i
];

export function detectAdapter(text: string, requested: AdapterName = "auto"): Exclude<AdapterName, "auto"> {
  if (requested !== "auto") return requested;
  if (/tool_use|functions\.exec|<function=|Command exited with code/i.test(text)) return "openclaw";
  if (/^\s*(?:\[?codex\]?|reasoning|apply_patch)/im.test(text)) return "codex";
  return "plain";
}

export function extractCommand(line: string): string | undefined {
  for (const pattern of COMMAND_PATTERNS) {
    const match = pattern.exec(line);
    const command = match?.[1]?.trim();
    if (command) return command;
  }
  return undefined;
}

export function isErrorLine(line: string): boolean {
  return /\b(error|failed|failure|exception|traceback|panic|fatal|enoent|eacces|exit code [1-9]|code: 'ERR_|npm ERR!)\b/i.test(line);
}

export function isDecisionLine(line: string): boolean {
  return /\b(decision|decided|choose|chosen|selected|because|therefore|blocked|blocker|next step|todo|fixme)\b/i.test(line);
}

export function extractPaths(line: string): string[] {
  const matches = line.match(/(?:\.{0,2}\/|~\/|[A-Za-z]:\\|\/)[\w@./\\:=-]+/g) ?? [];
  return matches.map((value) => value.replace(/[),.;]+$/g, ""));
}

export function extractExitCode(line: string): number | undefined {
  const match = /(?:exit(?:ed)?(?: with)? code|status)\s*[:=]?\s*(\d+)/i.exec(line);
  return match?.[1] ? Number(match[1]) : undefined;
}
