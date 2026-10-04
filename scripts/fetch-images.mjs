#!/usr/bin/env node
// Downloads official store artwork for the games we cover, at build time.
//
// For each game in content/game-images.json this asks Steam for the game's
// first screenshot (full size and thumbnail), saves both to public/images/games/
// and records what was saved in content/image-manifest.json. Pages only show an
// image that is listed in the manifest, so a failed download never breaks a page
// and never fails the build.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'images', 'games');
const manifestPath = path.join(root, 'content', 'image-manifest.json');

async function download(url, file) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 2000) throw new Error(`unexpectedly small file from ${url}`);
  await writeFile(path.join(outDir, file), bytes);
}

async function fetchGame(slug, appId) {
  const response = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`,
    { signal: AbortSignal.timeout(20000) }
  );
  if (!response.ok) throw new Error(`appdetails ${response.status}`);
  const details = (await response.json())?.[appId]?.data;
  if (!details) throw new Error('no store data');

  const shot = details.screenshots?.[0];
  const full = shot?.path_full || details.header_image;
  const thumb = shot?.path_thumbnail || details.header_image;
  if (!full || !thumb) throw new Error('no artwork listed');

  await download(full, `${slug}.jpg`);
  await download(thumb, `${slug}-thumb.jpg`);
  return [`/images/games/${slug}.jpg`, `/images/games/${slug}-thumb.jpg`];
}

const files = [];
try {
  const games = JSON.parse(await readFile(path.join(root, 'content', 'game-images.json'), 'utf8'));
  await mkdir(outDir, { recursive: true });
  for (const [slug, game] of Object.entries(games)) {
    try {
      files.push(...(await fetchGame(slug, String(game.steam_app_id))));
      console.log(`images: saved ${slug}`);
    } catch (error) {
      console.warn(`images: skipped ${slug} (${error.message})`);
    }
  }
} catch (error) {
  console.warn(`images: skipped all (${error.message})`);
}

await writeFile(manifestPath, JSON.stringify({ files }, null, 2) + '\n');
console.log(`images: ${files.length} files available`);
