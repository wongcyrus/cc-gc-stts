import { build } from 'esbuild';
import { copyFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const outdir = 'dist';

rmSync(outdir, { recursive: true, force: true });
mkdirSync(outdir, { recursive: true });

await build({
  entryPoints: ['src/stts.ts', 'src/stts-mcp-server.ts', 'src/stts-daemon.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  outdir,
  minify: true,
  outExtension: { '.js': '.mjs' },
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  logLevel: 'info',
});

for (const html of ['stts_ui.html']) {
  copyFileSync(path.join('src', html), path.join(outdir, html));
}

const srcImgDir = path.join('src', 'img');
const distImgDir = path.join(outdir, 'img');
if (existsSync(srcImgDir)) {
  mkdirSync(distImgDir, { recursive: true });
  for (const imgFile of readdirSync(srcImgDir)) {
    copyFileSync(path.join(srcImgDir, imgFile), path.join(distImgDir, imgFile));
  }
}

console.log('Build complete: dist/stts.mjs, dist/stts-mcp-server.mjs, dist/stts-daemon.mjs');
