import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

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

const output = run('npm', ['pack', '--json']);
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

const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
if (pack.name !== manifest.name || pack.version !== manifest.version) {
  console.error(`Packed identity mismatch: expected ${manifest.name}@${manifest.version}, got ${pack.name}@${pack.version}`);
  process.exit(1);
}

const sandbox = mkdtempSync(join(tmpdir(), 'tokenpress-package-smoke-'));
try {
  const tarball = join(process.cwd(), pack.filename);
  run('npm', ['install', '--global', '--prefix', sandbox, tarball]);
  const executable = join(sandbox, 'bin', 'tokenpress');
  const version = run(executable, ['--version']).trim();
  const help = run(executable, ['--help']);
  if (version !== manifest.version) {
    console.error(`Installed CLI version mismatch: expected ${manifest.version}, got ${version}`);
    process.exit(1);
  }
  if (!help.includes('TokenPress —') || !help.includes('tokenpress inspect')) {
    console.error('Installed CLI help does not identify this project.');
    process.exit(1);
  }
} finally {
  rmSync(sandbox, { recursive: true, force: true });
  rmSync(pack.filename, { force: true });
}

console.log(`Packed and invoked ${manifest.name}@${manifest.version}; ${required.length} required files are present.`);
