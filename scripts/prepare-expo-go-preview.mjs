// macOS/Linux preview only. The SDK 55 source project and its lockfile stay intact.
import { cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const preview = await mkdtemp(join(tmpdir(), 'outfit-expo54-'));
const expoVersion = '54.0.38';
const archive = execFileSync(
  'npm',
  ['pack', `expo@${expoVersion}`, '--pack-destination', preview, '--silent'],
  { encoding: 'utf8' },
)
  .trim()
  .split('\n')
  .at(-1);
const nativeVersions = JSON.parse(
  execFileSync('tar', ['-xOf', join(preview, archive), 'package/bundledNativeModules.json'], {
    encoding: 'utf8',
  }),
);
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
pkg.dependencies.expo = expoVersion;
for (const name of Object.keys(pkg.dependencies))
  if (nativeVersions[name]) pkg.dependencies[name] = nativeVersions[name];
pkg.devDependencies['@types/react'] = '~19.1.10';
// An explicit allowlist keeps .env files, credentials, caches and user data out.
for (const path of [
  'App.tsx',
  'index.ts',
  'tsconfig.json',
  'app.json',
  'src',
  'assets',
  'server',
  'tests',
]) {
  await cp(join(root, path), join(preview, path), { recursive: true });
}
await writeFile(join(preview, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
await writeFile(
  join(preview, 'PREVIEW.txt'),
  `Temporary SDK 54 preview of ${root}. Edit the original project, then prepare a new preview. No environment files copied.\n`,
);
console.log(`Preview: ${preview}`);
execFileSync('npm', ['install'], { cwd: preview, stdio: 'inherit' });
execFileSync('npx', ['expo', 'install', '--check'], { cwd: preview, stdio: 'inherit' });
console.log(`\nReady. Run:\ncd '${preview}'\nnpx expo start --go --lan --port 8083\n`);
