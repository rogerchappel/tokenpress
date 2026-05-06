import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = ["dist/cli.js"];

test("cli prints help", () => {
  const result = spawnSync(process.execPath, [...cli, "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /TokenPress/);
});

test("cli writes markdown report to output directory", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tokenpress-"));
  try {
    const result = spawnSync(process.execPath, [...cli, "inspect", "fixtures/sample", "--output", dir], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const report = await readFile(join(dir, "tokenpress.md"), "utf8");
    assert.match(report, /TokenPress Report/);
    assert.match(report, /npm test/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("cli emits json to stdout", () => {
  const result = spawnSync(process.execPath, [...cli, "fixtures/sample/codex.log", "--format", "json"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.adapter, "codex");
});


test("cli accepts directory inputs with a generic log file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tokenpress-generic-"));
  try {
    await writeFile(join(dir, "agent-session.log"), "$ npm test\nCommand exited with code 1\nError: boom", "utf8");
    const result = spawnSync(process.execPath, [...cli, dir, "--format", "json"], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.summary.failedCommands, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
