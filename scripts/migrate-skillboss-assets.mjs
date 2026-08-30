import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';

const root = new URL('../', import.meta.url);
const rootPath = decodeURIComponent(root.pathname.replace(/^\/(?:([A-Za-z]:))/, '$1'));
const publicDir = join(rootPath, 'public', 'legacy');
const sourceRoot = join(rootPath, 'src');
const urlPattern = /https:\/\/assets\.skillboss\.co\/[A-Za-z0-9._~%+-]+/g;

async function walk(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) files.push(...await walk(path));
    else if (/\.(?:ts|tsx|css|html)$/.test(entry)) files.push(path);
  }
  return files;
}

const sourceFiles = [join(rootPath, 'index.html'), ...await walk(sourceRoot)];
const contents = new Map();
const urls = new Set();
for (const file of sourceFiles) {
  const content = await readFile(file, 'utf8');
  contents.set(file, content);
  for (const url of content.match(urlPattern) || []) urls.add(url);
}

await mkdir(publicDir, { recursive: true });
const queue = [...urls];
let downloaded = 0;

async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const name = basename(new URL(url).pathname);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed ${response.status}: ${url}`);
    await writeFile(join(publicDir, name), new Uint8Array(await response.arrayBuffer()));
    downloaded += 1;
  }
}

await Promise.all(Array.from({ length: 8 }, () => worker()));

let changed = 0;
for (const [file, content] of contents) {
  const next = content.replace(urlPattern, (url) => `/legacy/${basename(new URL(url).pathname)}`);
  if (next !== content) {
    await writeFile(file, next, 'utf8');
    changed += 1;
  }
}

console.log(`Downloaded ${downloaded} assets and updated ${changed} source files.`);
