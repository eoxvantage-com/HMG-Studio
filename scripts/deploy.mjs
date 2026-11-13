#!/usr/bin/env node
// Taruvi worker uploads can replace live files immediately. Default is dry-run.
// Official contract: https://docs.taruvibase.com/docs/products/frontend-workers/reference
import { createHash } from 'node:crypto';
import { createWriteStream, lstatSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MAX_ARCHIVE_BYTES = 10 * 1024 * 1024;
const RELEASE_FILE = 'taruvi-release.json';
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fail = (message) => { throw new Error(message); };

export function deploymentConfig(env) {
  let site;
  try { site = new URL(env.TARUVI_SITE_URL); } catch { fail('A valid TARUVI_SITE_URL is required.'); }
  if (site.protocol !== 'https:' || site.username || site.password || site.search || site.hash || site.pathname !== '/') {
    fail('Deployment requires a credential-free HTTPS site origin.');
  }
  const appSlug = env.TARUVI_APP_SLUG;
  if (typeof appSlug !== 'string' || !slugPattern.test(appSlug)) fail('A valid TARUVI_APP_SLUG is required.');
  const workerSlug = env.TARUVI_FRONTEND_WORKER_SLUG || undefined;
  if (workerSlug && !slugPattern.test(workerSlug)) fail('Invalid TARUVI_FRONTEND_WORKER_SLUG.');
  return { siteUrl: site.origin, appSlug, ...(workerSlug ? { workerSlug } : {}) };
}

export function assertBuildIdentity(config, artifact) {
  if (artifact?.siteUrl !== config.siteUrl || artifact?.appSlug !== config.appSlug) fail('Build site/app does not match deployment target.');
}

export function validateArchiveEntries(entries, privateKey = '') {
  if (!entries.some(({ path }) => path === 'index.html')) fail('Archive requires index.html at its root.');
  const paths = new Set();
  for (const { path, bytes } of entries) {
    if (!path || path.startsWith('/') || path.includes('\\') || path.split('/').some(part => !part || part === '..' || part === '.' || part.startsWith('.env')) || paths.has(path)) {
      fail('Unsafe or duplicate archive path.');
    }
    paths.add(path);
    if (privateKey && bytes.includes(Buffer.from(privateKey))) fail('Build contains deployment credential bytes.');
  }
}

function artifactEntries(directory, prefix = '') {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    const relative = prefix + name;
    const info = lstatSync(path);
    if (info.isSymbolicLink()) fail('Archive symlinks are not allowed.');
    if (info.isDirectory()) return artifactEntries(path, relative + '/');
    if (!info.isFile()) fail('Archive contains a non-file entry.');
    return [{ path: relative, bytes: readFileSync(path) }];
  });
}

async function requestJson(fetcher, config, key, path, options = {}) {
  let response;
  try {
    response = await fetcher(config.siteUrl + path, { ...options, redirect: 'error', signal: AbortSignal.timeout(60000), headers: { Authorization: `Api-Key ${key}` } });
  } catch { fail('Taruvi request failed; outcome may be uncertain. Do not blindly repeat an upload.'); }
  if (!response.ok) fail(`Taruvi request failed (HTTP ${response.status}).`);
  let result;
  try { result = await response.json(); } catch { fail('Taruvi returned an unreadable response.'); }
  if (result?.status === 'error') fail('Taruvi reported an operation error.');
  return result;
}

export async function uploadArtifact(config, zipBytes, privateKey, fetcher = fetch) {
  if (!privateKey) fail('TARUVI_API_KEY is required for upload, never as a command-line argument.');
  if (!zipBytes.length || zipBytes.length > MAX_ARCHIVE_BYTES) fail('Archive must be nonempty and no larger than 10 MiB.');
  const settings = await requestJson(fetcher, config, privateKey, `/api/apps/${config.appSlug}/settings/`);
  if (!settings?.data || typeof settings.data !== 'object') fail('App settings could not be verified.');
  const defaultSlug = settings.data.default_frontend_worker_slug;
  if (defaultSlug != null && (typeof defaultSlug !== 'string' || !slugPattern.test(defaultSlug))) fail('App default worker is invalid.');
  if (defaultSlug != null && config.workerSlug && config.workerSlug !== defaultSlug) fail('Configured worker does not match the app default worker.');
  // A missing default is not permission to infer a worker from the app name.
  // Require an explicit operator-selected slug and verify its association below.
  const workerSlug = defaultSlug ?? config.workerSlug;
  if (typeof workerSlug !== 'string' || !slugPattern.test(workerSlug)) fail('App has no default worker. Explicitly select an existing app-associated worker.');
  const path = `/api/cloud/frontend_workers/${workerSlug}/`;
  const before = await requestJson(fetcher, config, privateKey, path);
  if (before?.data?.slug !== workerSlug || before.data.app !== config.appSlug) fail('Worker identity or app association does not match the deployment target.');
  const form = new FormData();
  form.append('file', new Blob([zipBytes], { type: 'application/zip' }), `${config.appSlug}.zip`);
  form.append('set_active', 'true');
  // No automatic retries, worker creation, or assumed non-live staging.
  await requestJson(fetcher, config, privateKey, path, { method: 'PATCH', body: form });
  const worker = await requestJson(fetcher, config, privateKey, path);
  if (worker?.data?.slug !== workerSlug || worker.data.app !== config.appSlug) fail('Upload sent but worker identity/app association readback could not be verified.');
  // HTTP success + worker identity is not proof of completed build or UI health.
  return { status: 'upload_accepted_needs_verification', workerSlug };
}

async function prepare(config, env) {
  const { build } = await import('vite');
  await build({ root: ROOT, mode: 'production', plugins: [{
    name: 'hmg:verify-release-target',
    configResolved(resolved) {
      let baked;
      try { baked = deploymentConfig({ TARUVI_SITE_URL: JSON.parse(resolved.define.__TARUVI_SITE_URL__), TARUVI_APP_SLUG: JSON.parse(resolved.define.__TARUVI_APP_SLUG__) }); }
      catch { fail('Build public configuration could not be verified.'); }
      assertBuildIdentity(config, baked);
      if (!Array.isArray(resolved.envPrefix) || resolved.envPrefix.length || Object.keys(resolved.define).some(key => /API_KEY|SECRET|PASSWORD/i.test(key))) fail('Build environment exposure is not safe for release.');
    },
  }] });
  const dist = join(ROOT, 'dist');
  const entries = artifactEntries(dist).filter(entry => entry.path !== RELEASE_FILE);
  validateArchiveEntries(entries, env.TARUVI_API_KEY);
  const files = entries.map(entry => ({ path: entry.path, sha256: createHash('sha256').update(entry.bytes).digest('hex') }));
  writeFileSync(join(dist, RELEASE_FILE), JSON.stringify({ siteUrl: config.siteUrl, appSlug: config.appSlug, files }, null, 2) + '\n');
  const finalEntries = artifactEntries(dist);
  validateArchiveEntries(finalEntries, env.TARUVI_API_KEY);
  const manifest = JSON.parse(readFileSync(join(dist, RELEASE_FILE), 'utf8'));
  assertBuildIdentity(config, manifest);
  const actualFiles = finalEntries.filter(entry => entry.path !== RELEASE_FILE)
    .map(entry => ({ path: entry.path, sha256: createHash('sha256').update(entry.bytes).digest('hex') }));
  if (JSON.stringify(manifest.files) !== JSON.stringify(files) || JSON.stringify(actualFiles) !== JSON.stringify(files)) fail('Release files changed before packaging.');
  const { ZipArchive } = await import('archiver');
  const outDirectory = join(ROOT, '.cache', 'releases');
  mkdirSync(outDirectory, { recursive: true });
  const zipPath = join(outDirectory, `${config.appSlug}-${Date.now()}.zip`);
  const output = createWriteStream(zipPath, { flags: 'wx' });
  const archive = new ZipArchive({ zlib: { level: 9 } });
  const done = new Promise((resolveDone, reject) => {
    output.on('close', resolveDone); output.on('error', reject); archive.on('error', reject); archive.on('warning', reject);
  });
  archive.pipe(output);
  // Package the exact checked bytes, not reread files that could change afterward.
  for (const entry of finalEntries) archive.append(entry.bytes, { name: entry.path });
  await archive.finalize();
  await done;
  const bytes = readFileSync(zipPath);
  if (bytes.length > MAX_ARCHIVE_BYTES) { unlinkSync(zipPath); fail('Archive exceeds the 10 MiB Taruvi limit.'); }
  return { zipPath, bytes };
}

export async function main(args = process.argv.slice(2), dependencies = {}) {
  if (args.length > 1 || (args.length && !['--dry-run', '--prepare', '--upload'].includes(args[0]))) fail('Use --dry-run (default), --prepare, or --upload. Do not pass credentials as arguments.');
  const loadEnvironment = dependencies.loadEnvironment ?? (async () => {
    const { loadEnv } = await import('vite');
    return loadEnv('production', ROOT, '');
  });
  const log = dependencies.log ?? console.log;
  const env = await loadEnvironment();
  const config = deploymentConfig(env);
  if (!args.length || args[0] === '--dry-run') {
    log(JSON.stringify({ status: 'dry_run', ...config, builds: false, uploads: false }));
    return 0;
  }
  if (args[0] === '--upload' && !env.TARUVI_API_KEY) fail('TARUVI_API_KEY is required for upload.');
  const artifact = await (dependencies.prepare ?? prepare)(config, env);
  if (args[0] === '--prepare') {
    log(JSON.stringify({ status: 'prepared_not_uploaded', archive: artifact.zipPath, siteUrl: config.siteUrl, appSlug: config.appSlug }));
    return 0;
  }
  log('WARNING: This upload replaces live worker files. There is no non-live upload staging.');
  const result = await uploadArtifact(config, artifact.bytes, env.TARUVI_API_KEY, dependencies.fetcher);
  log(JSON.stringify(result));
  log('Verify the active completed build and app manually in Taruvi Console. Deployment is not yet confirmed.');
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => { process.exitCode = code; }).catch(() => {
    // Never echo server bodies, environment values, stack traces or credentials.
    console.error('Deployment stopped. Check configuration, artifact safety, and Taruvi Console; do not blindly retry uploads.');
    process.exitCode = 1;
  });
}
