export function scoreReason(reason: string): number {
  switch (reason) {
    case "command": return 100;
    case "error": return 95;
    case "decision": return 80;
    case "path": return 45;
    default: return 10;
  }
}
