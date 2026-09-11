import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = ["dist/cli.js"];
const marker = "Example Markdown output:";
const fence = "```markdown";

function extractReadmeExample(readme) {
  const markerIndex = readme.indexOf(marker);
  assert.notEqual(markerIndex, -1, `README.md must keep the "${marker}" section`);
  const fenceIndex = readme.indexOf(fence, markerIndex);
  assert.notEqual(fenceIndex, -1, "README example must be fenced as a markdown code block");
  const bodyStart = fenceIndex + fence.length;
  assert.ok(
    readme.slice(bodyStart, bodyStart + 2) === "\r\n" || readme[bodyStart] === "\n",
    "README example fence must open on its own line",
  );
  const contentStart = readme[bodyStart] === "\r" ? bodyStart + 2 : bodyStart + 1;
  const endIndex = readme.indexOf("\n```", contentStart);
  assert.notEqual(endIndex, -1, "README example fence must close");
  return readme.slice(contentStart, endIndex);
}

test("README example matches the live inspect output for fixtures/sample", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tokenpress-readme-"));
  try {
    const result = spawnSync(process.execPath, [...cli, "inspect", "fixtures/sample", "--output", dir], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    const report = await readFile(join(dir, "tokenpress.md"), "utf8");
    const readme = await readFile("README.md", "utf8");
    const block = extractReadmeExample(readme);
    assert.equal(
      block,
      report.replace(/\n$/, ""),
      "README example output drifted from `node dist/cli.js inspect ./fixtures/sample`; regenerate the block from the current report",
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("README example shows no secret-looking fixture values", async () => {
  const readme = await readFile("README.md", "utf8");
  const block = extractReadmeExample(readme);
  assert.doesNotMatch(block, /abc123SHOULDREDACT/i, "README example leaked the raw fixture secret");
  assert.doesNotMatch(block, /api_key\s*=/i, "README example leaked a secret assignment");
});
