import { spawnSync } from 'node:child_process';

const run = (command, args) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }

  return result.stdout;
};

run('npm', ['run', 'build']);

const output = run('npm', ['pack', '--dry-run', '--json']);
const [pack] = JSON.parse(output);
const packed = new Set(pack.files.map((file) => file.path));
const required = [
  'dist/cli.js',
  'dist/index.js',
  'dist/index.d.ts',
  'docs/adapters.md',
  'examples/openclaw-report.md',
  'fixtures/sample/transcript.log',
  'fixtures/sample/agent-session.log',
  'fixtures/sample/codex.log',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md'
];

const missing = required.filter((file) => !packed.has(file));
if (missing.length > 0) {
  console.error('Package tarball is missing release-candidate files:');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`Package tarball includes ${required.length} required release-candidate files.`);
