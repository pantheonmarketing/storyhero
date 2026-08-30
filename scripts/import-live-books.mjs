import { execFile } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const origin = String(process.env.STORYHERO_PUBLIC_ORIGIN || '').replace(/\/$/, '');
const dryRun = process.env.MIGRATION_DRY_RUN === '1';
const skipMedia = process.env.MIGRATION_SKIP_MEDIA === '1';
if (!/^https:\/\//.test(origin)) {
  throw new Error('Set STORYHERO_PUBLIC_ORIGIN to the deployed https:// StoryHero origin.');
}

const projectRoot = decodeURIComponent(new URL('../', import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, '$1'));
const archiveRoot = join(projectRoot, 'migration', 'legacy-books');
const wranglerCli = join(projectRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const archive = JSON.parse(await readFile(join(archiveRoot, 'export.json'), 'utf8'));
const ownerEmail = archive.owner_email;
const childByBook = new Map([
  ['38e0f8a5-b298-4750-93e7-c1379a42a264', 'legacy-child-meena'],
]);

function childIdFor(bookId) {
  return childByBook.get(bookId) || 'legacy-child-jonny';
}

function sql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function contentType(path) {
  const extension = extname(path).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.mp3') return 'audio/mpeg';
  if (extension === '.wav') return 'audio/wav';
  if (extension === '.ogg') return 'audio/ogg';
  return 'image/png';
}

const uniqueMedia = new Map();
for (const book of archive.books) {
  for (const localName of Object.values(book.migration_media || {})) {
    uniqueMedia.set(localName, join(archiveRoot, 'media', localName));
  }
}

const uploads = [...uniqueMedia.entries()];
const queue = [...uploads];
let uploaded = 0;
const runWrangler = (args, maxBuffer = 1024 * 1024) => run(
  process.execPath,
  [wranglerCli, ...args],
  { cwd: projectRoot, windowsHide: true, maxBuffer },
);
async function uploadWorker() {
  while (queue.length) {
    const [localName, localPath] = queue.shift();
    const key = `public/migrated/${localName.replace(/\\/g, '/')}`;
    await runWrangler([
      'r2', 'object', 'put', `storyhero-media-direct/${key}`,
      '--remote', `--file=${localPath}`, `--content-type=${contentType(localPath)}`,
    ]);
    uploaded += 1;
  }
}
if (!dryRun && !skipMedia) await Promise.all(Array.from({ length: 4 }, () => uploadWorker()));

function newUrl(book, oldUrl) {
  if (!oldUrl) return null;
  const localName = book.migration_media?.[oldUrl];
  if (!localName) throw new Error(`Missing archived media mapping for ${oldUrl}`);
  return `${origin}/media/public/migrated/${localName.replace(/\\/g, '/')}`;
}

function firstHero(book) {
  const page = book.pages.find((item) => item.idx > 0 && item.image_url) || book.pages.find((item) => item.image_url);
  return page ? newUrl(book, page.image_url) : newUrl(book, book.cover_url);
}

const jonnyBook = archive.books.find((book) => childIdFor(book.id) === 'legacy-child-jonny');
const meenaBook = archive.books.find((book) => childIdFor(book.id) === 'legacy-child-meena');
const statements = [
  `INSERT OR REPLACE INTO children (id,user_email,name,age,gender,photo_url,hero_url,hero_style,hero_regens) VALUES (${sql('legacy-child-jonny')},${sql(ownerEmail)},${sql('jonny')},5,${sql('boy')},${sql(firstHero(jonnyBook))},${sql(firstHero(jonnyBook))},${sql('watercolor')},0);`,
  `INSERT OR REPLACE INTO children (id,user_email,name,age,gender,photo_url,hero_url,hero_style,hero_regens) VALUES (${sql('legacy-child-meena')},${sql(ownerEmail)},${sql('น้องมีนา')},5,${sql('girl')},${sql(firstHero(meenaBook))},${sql(firstHero(meenaBook))},${sql('watercolor')},0);`,
];

for (const book of archive.books) {
  const coverUrl = newUrl(book, book.cover_url);
  statements.push(
    `INSERT OR REPLACE INTO books (id,user_email,child_id,story_id,title_th,title_en,status,pages_total,pages_done,cover_url,dedication,public_gallery,ready_email_sent,art_style,mode) VALUES (${sql(book.id)},${sql(ownerEmail)},${sql(childIdFor(book.id))},${sql(book.story_id)},${sql(book.title_th)},${sql(book.title_en)},'done',${book.pages.length},${book.pages.length},${sql(coverUrl)},${sql(book.dedication)},1,1,'watercolor','classic');`,
  );
  for (const page of book.pages) {
    const pageImageUrl = newUrl(book, page.image_url) || coverUrl;
    statements.push(
      `INSERT OR REPLACE INTO pages (book_id,idx,text_th,text_en,image_url,status,audio_url_th,audio_url_en) VALUES (${sql(book.id)},${Number(page.idx)},${sql(page.text_th)},${sql(page.text_en)},${sql(pageImageUrl)},'done',${sql(newUrl(book, page.audio_url_th))},${sql(newUrl(book, page.audio_url_en))});`,
    );
  }
}
const sqlPath = join(archiveRoot, 'import.sql');
await writeFile(sqlPath, statements.join('\n'), 'utf8');
if (!dryRun) {
  await runWrangler([
    'd1', 'execute', 'storyhero-db-direct', '--remote', `--file=${sqlPath}`,
  ], 10 * 1024 * 1024);
}

console.log(dryRun
  ? `Dry run prepared ${uploads.length} media uploads and ${archive.books.length} finished books.`
  : `${skipMedia ? 'Reused existing archived media' : `Uploaded ${uploaded} media files`} and imported ${archive.books.length} finished books.`);
