const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const release = require('./release.cjs');
const version = fs.readFileSync('pubspec.yaml', 'utf8').match(/^version: (.+)$/m)[1];
const tag = `v${version}`;

function fixture({ sha, refStatus = 404, pubStatus = 404, dispatchError } = {}) {
  const calls = [];
  const repo = { owner: 'VietHoangTran', repo: 'flutter_admob_native_ads' };
  const args = {
    context: { repo, sha: 'tested-commit' },
    core: { notice() {} },
    fetchImpl: async (url) => {
      calls.push(['check', url]);
      return { ok: pubStatus === 200, status: pubStatus };
    },
    github: { rest: {
      git: {
        getRef: async () => {
          if (sha) return { data: { object: { sha } } };
          throw Object.assign(new Error('getRef failed'), { status: refStatus });
        },
        createRef: async (input) => { calls.push(['tag', input]); },
      },
      actions: {
        createWorkflowDispatch: async (input) => {
          calls.push(['dispatch', input]);
          if (dispatchError) throw new Error('dispatch failed');
        },
      },
    } },
  };
  return { args, calls, repo };
}

test('new version tags the tested SHA and explicitly dispatches on that tag', async () => {
  const { args, calls, repo } = fixture();
  await release(args);
  assert.deepEqual(calls, [
    ['check', `https://pub.dev/api/packages/flutter_admob_native_ads/versions/${encodeURIComponent(version)}`],
    ['tag', { ...repo, ref: `refs/tags/${tag}`, sha: 'tested-commit' }],
    ['dispatch', { ...repo, workflow_id: 'publish.yml', ref: tag }],
  ]);
});

test('retry dispatches the existing tag at the same SHA without recreating it', async () => {
  const { args, calls } = fixture({ sha: 'tested-commit' });
  await release(args);
  assert.deepEqual(calls.map(([name]) => name), ['check', 'dispatch']);
});

test('existing tag at a different SHA is never moved or published', async () => {
  const { args, calls } = fixture({ sha: 'older-commit' });
  await release(args);
  assert.deepEqual(calls, []);
});

test('published version skips tag creation and dispatch', async () => {
  const { args, calls } = fixture({ pubStatus: 200 });
  await release(args);
  assert.deepEqual(calls.map(([name]) => name), ['check']);
});

test('GitHub permission failure cannot be mistaken for a missing tag', async () => {
  const { args, calls } = fixture({ refStatus: 403 });
  await assert.rejects(release(args), /getRef failed/);
  assert.deepEqual(calls, []);
});

test('pub.dev outage does not create a tag or dispatch a release', async () => {
  const { args, calls } = fixture({ pubStatus: 503 });
  await assert.rejects(release(args), /HTTP 503/);
  assert.deepEqual(calls.map(([name]) => name), ['check']);
});

test('dispatch failure is reported so the same tag can be retried', async () => {
  const { args } = fixture({ dispatchError: true });
  await assert.rejects(release(args), /dispatch failed/);
});

test('invalid version fails before any GitHub or pub.dev mutation', async (t) => {
  const { args, calls } = fixture();
  t.mock.method(fs, 'readFileSync', () => 'version: 1.2.3-rc.1\n');
  await assert.rejects(release(args), /stable major.minor.patch/);
  assert.deepEqual(calls, []);
});

test('podspec version mismatch fails before release', async (t) => {
  const { args, calls } = fixture();
  const read = fs.readFileSync;
  t.mock.method(fs, 'readFileSync', (path, encoding) =>
    path.endsWith('.podspec') ? "s.version = '0.0.0'" : read(path, encoding));
  await assert.rejects(release(args), /podspec version must match/);
  assert.deepEqual(calls, []);
});

test('missing release notes fail before release', async (t) => {
  const { args, calls } = fixture();
  const read = fs.readFileSync;
  t.mock.method(fs, 'readFileSync', (path, encoding) =>
    path === 'CHANGELOG.md' ? '# Changelog\n' : read(path, encoding));
  await assert.rejects(release(args), /dated release section/);
  assert.deepEqual(calls, []);
});

for (const candidate of ['1.2.3', '1.2.3+4']) {
  test(`preserves full version ${candidate} in tags and dispatch with a base podspec`, async (t) => {
    const { args, calls, repo } = fixture();
    const files = {
      'pubspec.yaml': `version: ${candidate}\n`,
      'ios/flutter_admob_native_ads.podspec': "s.version = '1.2.3'",
      'CHANGELOG.md': `## [${candidate}] - 2026-11-12\n`,
    };
    t.mock.method(fs, 'readFileSync', (path) => files[path]);
    await release(args);
    assert.deepEqual(calls, [
      ['check', `https://pub.dev/api/packages/flutter_admob_native_ads/versions/${encodeURIComponent(candidate)}`],
      ['tag', { ...repo, ref: `refs/tags/v${candidate}`, sha: 'tested-commit' }],
      ['dispatch', { ...repo, workflow_id: 'publish.yml', ref: `v${candidate}` }],
    ]);
  });
}

test('publish workflow verifies the full version including the build suffix', () => {
  const workflow = fs.readFileSync('.github/workflows/publish.yml', 'utf8');
  const block = workflow.match(/      - name: Verify tag matches pubspec version\n        run: \|\n([\s\S]*?)(?=\n      - name:)/)[1];
  const script = block.split('\n').map((line) => line.slice(10)).join('\n');
  const run = (ref) => execFileSync('bash', ['-e', '-c', script], {
    env: { ...process.env, GITHUB_REF_NAME: ref },
    stdio: 'pipe',
  });
  assert.doesNotThrow(() => run(tag));
  const wrongVersion = version.includes('+') ? version.split('+')[0] : `${version}+1`;
  assert.throws(() => run(`v${wrongVersion}`));
});
