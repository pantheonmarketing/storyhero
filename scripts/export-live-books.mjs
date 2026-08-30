import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const LIVE_ORIGIN = 'https://skillboss-worker-ghgfom9u.heyboss.live';
const BOOK_IDS = [
  'c87e8b84-d24b-4b4f-af96-421a5ca2b040',
  '24a4767a-5a78-4a3a-9c05-6ab0115db9d5',
  'defc199b-aa44-4006-a836-dd416615a1b4',
  '336f795e-bdca-470e-a0e2-479b29d95ee9',
  'cf0683ce-8022-49a6-8f46-14ac9b1344a9',
  '007e8c40-abab-4a7f-a40b-03d175b88b56',
  '38e0f8a5-b298-4750-93e7-c1379a42a264',
];

const root = new URL('../migration/legacy-books/', import.meta.url);
const outputRoot = decodeURIComponent(root.pathname.replace(/^\/(?:([A-Za-z]:))/, '$1'));
const mediaRoot = join(outputRoot, 'media');
await mkdir(mediaRoot, { recursive: true });

const books = [];
const downloads = [];

for (const id of BOOK_IDS) {
  const response = await fetch(`${LIVE_ORIGIN}/api/share/${id}`);
  if (!response.ok) throw new Error(`Could not export book ${id}: HTTP ${response.status}`);
  const book = await response.json();
  const urls = new Set([
    book.cover_url,
    ...book.pages.flatMap((page) => [page.image_url, page.audio_url_th, page.audio_url_en]),
  ].filter(Boolean));
  const media = {};
  for (const url of urls) {
    const sourceName = basename(new URL(url).pathname) || `${crypto.randomUUID()}.bin`;
    const localName = `${id}/${sourceName}`;
    media[url] = localName.replace(/\\/g, '/');
    downloads.push({ url, localName });
  }
  books.push({ ...book, migration_media: media });
}

const queue = [...downloads];
let downloaded = 0;
async function worker() {
  while (queue.length) {
    const item = queue.shift();
    const response = await fetch(item.url);
    if (!response.ok) throw new Error(`Media download failed (${response.status}): ${item.url}`);
    const destination = join(mediaRoot, item.localName);
    await mkdir(join(destination, '..'), { recursive: true });
    await writeFile(destination, new Uint8Array(await response.arrayBuffer()));
    downloaded += 1;
  }
}
await Promise.all(Array.from({ length: 6 }, () => worker()));

const exportData = {
  exported_at: new Date().toISOString(),
  source: LIVE_ORIGIN,
  owner_email: 'yoniwe@gmail.com',
  books,
};
await writeFile(join(outputRoot, 'export.json'), JSON.stringify(exportData, null, 2), 'utf8');
console.log(`Exported ${books.length} books and downloaded ${downloaded} unique media files.`);
