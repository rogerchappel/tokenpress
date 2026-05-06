const REDACTIONS: Array<[RegExp, string]> = [
  [/\b(?:ghp|github_pat|sk|pk|xox[abprs])-[-_A-Za-z0-9]{12,}\b/g, "[redacted-token]"],
  [/(\bBearer\s+)([-._~+/A-Za-z0-9]+=*)/g, "$1[redacted-bearer]"],
  [/\bAKIA[0-9A-Z]{16}\b/g, "[redacted-aws-key]"],
  [/\bnpm_[A-Za-z0-9]{20,}\b/g, "[redacted-npm-token]"],
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[redacted-email]"],
  [/(\b(?:api[_-]?key|token|secret|password|passwd|authorization)\b\s*[:=]\s*)([^\s'"]+)/gi, "$1[redacted-secret]"]
];

export function redactLine(line: string): string {
  return REDACTIONS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), line);
}
