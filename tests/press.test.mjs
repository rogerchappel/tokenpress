import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { pressTranscript, renderMarkdown } from "../dist/index.js";

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
});

test("pressTranscript redacts secret-looking values by default", () => {
  const result = pressTranscript("$ deploy\napi_key=supersecretvalue\nError: nope");
  assert.match(JSON.stringify(result), /\[redacted-secret\]/);
  assert.doesNotMatch(JSON.stringify(result), /supersecretvalue/);
});

test("renderMarkdown includes report sections", async () => {
  const input = await readFile("fixtures/sample/transcript.log", "utf8");
  const markdown = renderMarkdown(pressTranscript(input));
  assert.match(markdown, /# TokenPress Report/);
  assert.match(markdown, /## Commands/);
  assert.match(markdown, /## Evidence/);
});


test("optional path evidence keeps path-only lines", () => {
  const result = pressTranscript("plain line\nsee /tmp/tokenpress/report.md for output", { includePathEvidence: true });
  assert.ok(result.evidence.some((line) => line.reason === "path"));
});
