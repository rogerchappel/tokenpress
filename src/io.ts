import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import type { OutputFormat } from "./types.js";

export async function readInput(path?: string): Promise<string> {
  if (!path || path === "-") {
    return new Promise<string>((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
  }
  const info = await stat(path);
  if (info.isDirectory()) {
    const candidates = ["transcript.log", "transcript.txt", "sample.log", "sample.txt"];
    for (const candidate of candidates) {
      try {
        return await readFile(join(path, candidate), "utf8");
      } catch {
        // try next fixture-like name
      }
    }
    throw new Error(`Directory input needs one of: ${candidates.join(", ")}`);
  }
  return readFile(path, "utf8");
}

export async function writeOutput(target: string | undefined, format: OutputFormat, content: string): Promise<string | undefined> {
  if (!target) return undefined;
  const extension = format === "json" ? ".json" : ".md";
  const looksLikeFile = extname(target) !== "" || basename(target).includes(".");
  const filePath = looksLikeFile ? target : join(target, `tokenpress${extension}`);
  await mkdir(looksLikeFile ? dirname(filePath) : target, { recursive: true });
  await writeFile(filePath, content, "utf8");
  return filePath;
}
