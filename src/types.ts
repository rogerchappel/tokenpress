export type AdapterName = "auto" | "plain" | "openclaw" | "codex";
export type OutputFormat = "markdown" | "json";

export interface PressOptions {
  adapter?: AdapterName;
  maxEvidenceLines?: number;
  redactSecrets?: boolean;
  cwd?: string;
  includePathEvidence?: boolean;
}

export interface EvidenceLine {
  lineNumber: number;
  text: string;
  reason: string;
  score: number;
}

export interface CommandBlock {
  lineNumber: number;
  command: string;
  exitCode?: number;
  nearbyErrors: EvidenceLine[];
}

export interface PressedTranscript {
  adapter: Exclude<AdapterName, "auto">;
  inputLines: number;
  keptLines: number;
  compressionRatio: number;
  commands: CommandBlock[];
  errors: EvidenceLine[];
  paths: string[];
  decisions: EvidenceLine[];
  evidence: EvidenceLine[];
  warnings: string[];
}
