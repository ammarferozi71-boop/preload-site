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

const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; site-build image fetcher)', Accept: '*/*' };

async function download(url, file) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 2000) throw new Error(`unexpectedly small file from ${url}`);
  await writeFile(path.join(outDir, file), bytes);
}

// Preferred source: the store API, which lists the game's screenshots.
async function fromStoreApi(slug, appId) {
  const response = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=en`,
    { headers, signal: AbortSignal.timeout(20000) }
  );
  if (!response.ok) throw new Error(`appdetails ${response.status}`);
  const details = (await response.json())?.[appId]?.data;
  if (!details) throw new Error('appdetails returned no data');

  const shot = details.screenshots?.[0];
  const full = shot?.path_full || details.header_image;
  const thumb = shot?.path_thumbnail || details.header_image;
  if (!full || !thumb) throw new Error('no artwork listed');

  await download(full, `${slug}.jpg`);
  await download(thumb, `${slug}-thumb.jpg`);
}

// Fallback: the game's header artwork straight from the image CDN.
async function fromCdn(slug, appId, extraUrls) {
  const candidates = [
    ...extraUrls,
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
    `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
    `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_616x353.jpg`,
  ];
  const errors = [];
  for (const url of candidates) {
    try {
      await download(url, `${slug}.jpg`);
      await download(url, `${slug}-thumb.jpg`);
      return;
    } catch (error) {
      errors.push(error.message);
    }
  }
  throw new Error(errors.join('; '));
}

async function fetchGame(slug, game) {
  const appId = String(game.steam_app_id);
  try {
    await fromStoreApi(slug, appId);
  } catch (apiError) {
    try {
      await fromCdn(slug, appId, game.image_urls || []);
    } catch (cdnError) {
      throw new Error(`${apiError.message}; then ${cdnError.message}`);
    }
  }
  return [`/images/games/${slug}.jpg`, `/images/games/${slug}-thumb.jpg`];
}

const files = [];
const log = [];
try {
  const games = JSON.parse(await readFile(path.join(root, 'content', 'game-images.json'), 'utf8'));
  await mkdir(outDir, { recursive: true });
  for (const [slug, game] of Object.entries(games)) {
    try {
      files.push(...(await fetchGame(slug, game)));
      log.push(`${slug}: saved`);
      console.log(`images: saved ${slug}`);
    } catch (error) {
      log.push(`${slug}: skipped (${error.message})`);
      console.warn(`images: skipped ${slug} (${error.message})`);
    }
  }
} catch (error) {
  log.push(`all skipped (${error.message})`);
  console.warn(`images: skipped all (${error.message})`);
}

await writeFile(manifestPath, JSON.stringify({ files, log, built_at: new Date().toISOString() }, null, 2) + '\n');
console.log(`images: ${files.length} files available`);
