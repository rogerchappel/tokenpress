import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { pressTranscript, redactLine, renderMarkdown } from "../dist/index.js";

test("pressTranscript preserves commands, errors, paths, and decisions", async () => {
  const input = await readFile("fixtures/sample/transcript.log", "utf8");
  const result = pressTranscript(input);
  assert.equal(result.adapter, "openclaw");
  assert.equal(result.commands.length, 2);
  assert.ok(result.errors.some((line) => line.text.includes("Error:")));
  assert.ok(result.decisions.some((line) => line.text.includes("local-first")));
  assert.ok(result.paths.includes("/Users/roger/dev/demo"));
  assert.ok(result.paths.includes("./out/tokenpress.md"));
  assert.ok(result.evidence.length < result.inputLines);
  assert.equal(result.summary.failedCommands, 1);
  assert.equal(result.summary.errorCount, result.errors.length);
  assert.equal(result.summary.pathCount, result.paths.length);
});

test("pressTranscript redacts secret-looking values by default", () => {
  const result = pressTranscript("$ deploy\nError: api_key=supersecretvalue");
  assert.match(JSON.stringify(result), /\[redacted-secret\]/);
  assert.doesNotMatch(JSON.stringify(result), /supersecretvalue/);
});

test("renderMarkdown includes report sections", async () => {
  const input = await readFile("fixtures/sample/transcript.log", "utf8");
  const markdown = renderMarkdown(pressTranscript(input));
  assert.match(markdown, /# TokenPress Report/);
  assert.match(markdown, /## Summary/);
  assert.match(markdown, /Failed commands: 1/);
  assert.match(markdown, /## Commands/);
  assert.match(markdown, /## Evidence/);
});


test("optional path evidence keeps path-only lines", () => {
  const result = pressTranscript("plain line\nsee /tmp/tokenpress/report.md for output", { includePathEvidence: true });
  assert.ok(result.evidence.some((line) => line.reason === "path"));
});


test("evidence ranking avoids exact duplicate evidence entries", () => {
  const result = pressTranscript("$ npm test\nError: failed because ./out/report.md was missing", { includePathEvidence: true });
  const keys = result.evidence.map((line) => `${line.lineNumber}:${line.reason}:${line.text}`);
  assert.equal(new Set(keys).size, keys.length);
});


test("redaction covers common cloud and package tokens", () => {
  const redacted = redactLine("Authorization: Bearer abcdefghijklmnopqrstuvwxyz123456 AWS=AKIA1234567890ABCDEF npm_token=npm_abcdefghijklmnopqrstuvwxyz123456");
  assert.match(redacted, /\[redacted-bearer\]/);
  assert.match(redacted, /\[redacted-aws-key\]/);
  assert.match(redacted, /\[redacted-npm-token\]/);
  assert.doesNotMatch(redacted, /AKIA1234567890ABCDEF/);
});
