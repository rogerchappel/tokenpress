import assert from 'node:assert/strict';
import test from 'node:test';
import {
  releaseAssetFilename,
  releaseInstallUrl,
  verifyPackedFilename,
  verifyReadmeInstall
} from '../scripts/release-asset.mjs';

test('preserves the filename of the existing v0.1.0 release asset', () => {
  assert.equal(releaseAssetFilename('@rogerchappel/tokenpress', '0.1.0'), 'tokenpress-0.1.0.tgz');
  assert.equal(
    releaseInstallUrl('@rogerchappel/tokenpress', '0.1.0'),
    'https://github.com/rogerchappel/tokenpress/releases/download/v0.1.0/tokenpress-0.1.0.tgz'
  );
});

test('future release assets match the filename produced by npm pack', () => {
  assert.equal(releaseAssetFilename('@rogerchappel/tokenpress', '0.2.0'), 'rogerchappel-tokenpress-0.2.0.tgz');
  assert.equal(verifyPackedFilename('rogerchappel-tokenpress-0.2.0.tgz', '@rogerchappel/tokenpress', '0.2.0'), 'rogerchappel-tokenpress-0.2.0.tgz');
  assert.throws(
    () => verifyPackedFilename('tokenpress-0.2.0.tgz', '@rogerchappel/tokenpress', '0.2.0'),
    /Packed release asset mismatch/
  );
});

test('fails when the documented release asset diverges from policy', () => {
  const good = 'npm install -g https://github.com/rogerchappel/tokenpress/releases/download/v0.1.0/tokenpress-0.1.0.tgz';
  assert.doesNotThrow(() => verifyReadmeInstall(good, '@rogerchappel/tokenpress', '0.1.0'));
  assert.throws(
    () => verifyReadmeInstall(good.replace('/tokenpress-0.1.0.tgz', '/rogerchappel-tokenpress-0.1.0.tgz'), '@rogerchappel/tokenpress', '0.1.0'),
    /README release asset mismatch/
  );
});
