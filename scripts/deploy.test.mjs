import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { deploymentConfig, assertBuildIdentity, validateArchiveEntries, uploadArtifact, main } from './deploy.mjs';

test('patched parent-scoped matchers retain their required runtime APIs', () => {
  const require = createRequire(import.meta.url);
  const estree = createRequire(require.resolve('@typescript-eslint/typescript-estree'));
  assert.equal(estree('minimatch').minimatch('src/home.ts', '**/*.ts', { dot: true }), true);
  assert.equal(estree('minimatch').minimatch('src/home.js', '**/*.ts', { dot: true }), false);
  const archive = createRequire(require.resolve('archiver'));
  const walker = createRequire(archive.resolve('readdir-glob'));
  const matcher = new (walker('minimatch').Minimatch)('**/*.ts', { dot: true });
  assert.equal(matcher.match('src/.internal.ts'), true);
  assert.equal(matcher.match('src/file.js'), false);
  const layout = createRequire(require.resolve('@ant-design/pro-layout'));
  assert.equal(layout('path-to-regexp').match('/products/:id')('/products/example').params.id, 'example');
});

test('Archiver 8 named ZipArchive produces a real ZIP stream', async () => {
  const { ZipArchive } = await import('archiver');
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const chunks = [];
  const completed = new Promise((resolve, reject) => {
    archive.on('data', chunk => chunks.push(chunk));
    archive.on('end', resolve);
    archive.on('error', reject);
  });
  archive.append('<html>fixture</html>', { name: 'index.html' });
  await archive.finalize();
  await completed;
  const bytes = Buffer.concat(chunks);
  assert.equal(bytes.subarray(0, 4).toString('hex'), '504b0304');
  assert.equal(bytes.includes(Buffer.from('index.html')), true);
});

const config = () => deploymentConfig({ TARUVI_SITE_URL: 'https://insurance.taruvi.cloud/', TARUVI_APP_SLUG: 'hmg-studio' });
test('default dry-run does not build, upload, read real env or expose credentials', async () => {
  const output = [];
  const exitCode = await main([], {
    loadEnvironment: async () => ({ TARUVI_SITE_URL: 'https://insurance.taruvi.cloud', TARUVI_APP_SLUG: 'hmg-studio', TARUVI_API_KEY: 'test-private-key' }),
    prepare: () => assert.fail('dry-run built an artifact'),
    fetcher: () => assert.fail('dry-run made a request'),
    log: value => output.push(value),
  });
  assert.equal(exitCode, 0);
  assert.equal(JSON.parse(output[0]).status, 'dry_run');
  assert.equal(output.join('').includes('test-private-key'), false);
});
test('requires a public HTTPS site and a single safe app slug', () => {
  assert.equal(config().siteUrl, 'https://insurance.taruvi.cloud');
  for (const url of ['http://example.com', 'https://user:secret@example.com', 'https://example.com/?token=x', 'https://example.com/path']) {
    assert.throws(() => deploymentConfig({ TARUVI_SITE_URL: url, TARUVI_APP_SLUG: 'hmg-studio' }));
  }
  assert.throws(() => deploymentConfig({ TARUVI_SITE_URL: 'https://example.com', TARUVI_APP_SLUG: '../other' }));
});
test('rejects a build for another site or app', () => {
  assert.doesNotThrow(() => assertBuildIdentity(config(), { siteUrl: config().siteUrl, appSlug: 'hmg-studio' }));
  assert.throws(() => assertBuildIdentity(config(), { siteUrl: config().siteUrl, appSlug: 'other' }));
  assert.throws(() => assertBuildIdentity(config(), { siteUrl: 'https://other.example.com', appSlug: 'hmg-studio' }));
});
test('rejects missing entrypoint, unsafe paths, env files and known credential bytes', () => {
  const good = [{ path: 'index.html', bytes: Buffer.from('<html/>') }];
  assert.doesNotThrow(() => validateArchiveEntries(good, 'test-private-key'));
  for (const path of ['../oops', '/absolute', 'a\\b', 'nested/.env.local']) {
    assert.throws(() => validateArchiveEntries([...good, { path, bytes: Buffer.from('x') }]));
  }
  assert.throws(() => validateArchiveEntries([]));
  assert.throws(() => validateArchiveEntries([...good, { path: 'assets/app.js', bytes: Buffer.from('test-private-key') }], 'test-private-key'));
});
test('existing worker upload uses the configured site and never creates another worker', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (calls.length === 1) return { ok: true, json: async () => ({ data: { default_frontend_worker_slug: 'existing-worker' } }) };
    return { ok: true, json: async () => ({ data: { slug: 'existing-worker', app: 'hmg-studio' } }) };
  };
  const result = await uploadArtifact(config(), Buffer.from('zip'), 'test-private-key', fetcher);
  assert.equal(result.status, 'upload_accepted_needs_verification');
  assert.equal(calls.length, 4);
  assert.equal(calls[1].options.method, undefined);
  assert.equal(calls[2].options.method, 'PATCH');
  assert.equal(calls[2].options.body.get('set_active'), 'true');
  assert.equal(calls[2].url, 'https://insurance.taruvi.cloud/api/cloud/frontend_workers/existing-worker/');
  assert.equal(calls[0].options.redirect, 'error');
  assert.equal(calls[1].options.redirect, 'error');
});
test('missing or mismatched worker stops before upload', async () => {
  for (const settings of [{ default_frontend_worker_slug: '../other' }, { default_frontend_worker_slug: 'other' }]) {
    let count = 0;
    const fetcher = async () => { count++; return { ok: true, json: async () => ({ data: settings }) }; };
    await assert.rejects(uploadArtifact({ ...config(), workerSlug: 'expected' }, Buffer.from('zip'), 'key', fetcher));
    assert.equal(count, 1);
  }
  let calls = 0;
  await assert.rejects(uploadArtifact(config(), Buffer.from('zip'), 'key', async () => {
    calls++;
    return { ok: true, json: async () => ({ data: { default_frontend_worker_slug: null } }) };
  }));
  assert.equal(calls, 1);
});
test('null default requires an explicitly selected worker with a verified app association', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    const data = calls.length === 1 ? { default_frontend_worker_slug: null } : { slug: 'hmg-studio', app: 'hmg-studio' };
    return { ok: true, json: async () => ({ data }) };
  };
  const result = await uploadArtifact({ ...config(), workerSlug: 'hmg-studio' }, Buffer.from('zip'), 'key', fetcher);
  assert.equal(result.workerSlug, 'hmg-studio');
  assert.equal(calls.length, 4);
  assert.equal(calls[1].options.method, undefined);
  assert.equal(calls[2].options.method, 'PATCH');
});
test('foreign, unassociated and mismatched worker identities never receive an upload', async () => {
  for (const defaultSlug of [null, 'hmg-studio']) {
    for (const worker of [{ slug: 'hmg-studio', app: 'other-app' }, { slug: 'hmg-studio', app: null }, { slug: 'hmg-studio' }, { slug: 'other', app: 'hmg-studio' }]) {
      const calls = [];
      const fetcher = async (url, options) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({ data: calls.length === 1 ? { default_frontend_worker_slug: defaultSlug } : worker }) };
      };
      await assert.rejects(uploadArtifact({ ...config(), workerSlug: 'hmg-studio' }, Buffer.from('zip'), 'key', fetcher));
      assert.equal(calls.length, 2);
      assert.equal(calls.some(call => call.options.method === 'PATCH'), false);
    }
  }
});
test('HTTP failures are sanitized and writes are never retried', async () => {
  let count = 0;
  const fetcher = async () => {
    count++;
    if (count === 1) return { ok: true, json: async () => ({ data: { default_frontend_worker_slug: 'worker' } }) };
    if (count === 2) return { ok: true, json: async () => ({ data: { slug: 'worker', app: 'hmg-studio' } }) };
    return { ok: false, status: 403, text: async () => 'test-private-key' };
  };
  await assert.rejects(uploadArtifact(config(), Buffer.from('zip'), 'test-private-key', fetcher), /HTTP 403/);
  assert.equal(count, 3);
});
test('archive size is bounded before any network call', async () => {
  let called = false;
  await assert.rejects(uploadArtifact(config(), Buffer.alloc(10 * 1024 * 1024 + 1), 'key', async () => { called = true; }));
  assert.equal(called, false);
});
