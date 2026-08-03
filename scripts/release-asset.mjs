import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const repository = 'https://github.com/rogerchappel/tokenpress';

export function releaseAssetFilename(name, version) {
  if (version === '0.1.0') return 'tokenpress-0.1.0.tgz';
  return `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`;
}

export function releaseInstallUrl(name, version) {
  return `${repository}/releases/download/v${version}/${releaseAssetFilename(name, version)}`;
}

export function verifyReadmeInstall(readme, name, version) {
  const match = readme.match(/npm install -g (https:\/\/github\.com\/rogerchappel\/tokenpress\/releases\/download\/v0\.1\.0\/[^\s`]+)/);
  if (!match) throw new Error('README must include the v0.1.0 GitHub release install command');
  const expected = releaseInstallUrl(name, '0.1.0');
  if (match[1] !== expected) throw new Error(`README release asset mismatch: expected ${expected}, got ${match[1]}`);
}

export function verifyPackedFilename(actual, name, version) {
  const expected = releaseAssetFilename(name, version);
  if (actual !== expected) throw new Error(`Packed release asset mismatch: expected ${expected}, got ${actual}`);
  return expected;
}

export function verifyReleaseTag(refName, refType, version) {
  // GITHUB_REF_NAME is also populated for branches and pull-request merge refs.
  // Only a tag-triggered workflow is a release context that must match package.json.
  if (refType !== 'tag') return;

  const expected = `v${version}`;
  if (refName !== expected) {
    throw new Error(`Release tag mismatch: expected ${expected}, got ${refName || '(absent)'}`);
  }
}

function main() {
  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  verifyReadmeInstall(readFileSync('README.md', 'utf8'), manifest.name, manifest.version);

  verifyReleaseTag(process.env.GITHUB_REF_NAME, process.env.GITHUB_REF_TYPE, manifest.version);

  const packedFilename = process.argv[2];
  if (packedFilename) {
    verifyPackedFilename(packedFilename, manifest.name, manifest.version);
    console.log(`asset=${packedFilename}`);
    console.log(`install_url=${releaseInstallUrl(manifest.name, manifest.version)}`);
  } else {
    console.log(`Verified documented release asset policy; next asset: ${releaseAssetFilename(manifest.name, manifest.version)}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
