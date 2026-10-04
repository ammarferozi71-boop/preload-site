#!/usr/bin/env node
// Adds (or updates) one article in content/launch.json from a Markdown draft.
//
// Usage:
//   node scripts/import-article.mjs draft.md --category games --tags a,b,c \
//     --hero /images/articles/x.webp --hero-alt "..." --hero-caption "Image: ..." \
//     [--featured] [--trending] [--date 2026-10-02T18:00:00Z]
//
// The draft uses "# TITLE", "# SLUG", "# META TITLE", "# META DESCRIPTION",
// "# ARTICLE BODY" and "# EXTERNAL SOURCES USED" sections. Only the body (up to
// the first "---" line) and the sources are published.

import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentPath = path.join(root, 'content', 'launch.json');

const [, , draftPath, ...rest] = process.argv;
if (!draftPath) {
  console.error('Usage: node scripts/import-article.mjs draft.md --category <slug> [options]');
  process.exit(1);
}
const opts = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith('--')) continue;
  const key = rest[i].slice(2);
  const next = rest[i + 1];
  if (next === undefined || next.startsWith('--')) opts[key] = true;
  else opts[key] = rest[++i];
}

const draft = readFileSync(draftPath, 'utf8').replace(/\r\n/g, '\n');

function section(name) {
  const start = draft.indexOf(`# ${name}\n`);
  if (start === -1) return '';
  const from = start + name.length + 3;
  const next = draft.slice(from).search(/\n# [A-Z][A-Z -]+\n/);
  return (next === -1 ? draft.slice(from) : draft.slice(from, from + next)).trim();
}

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/\*\*|[`'’"“”?:.,()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const title = section('TITLE');
const slug = section('SLUG');
const seoTitle = section('META TITLE');
const seoDescription = section('META DESCRIPTION');
let bodySource = section('ARTICLE BODY').split(/\n---\s*(\n|$)/)[0];

if (!title || !slug || !bodySource) {
  console.error('Draft needs TITLE, SLUG and ARTICLE BODY sections.');
  process.exit(1);
}

const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'));

const lines = bodySource.split('\n');
const body = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (/^\*\[(HERO )?IMAGE/.test(line)) continue;

  const heading = line.match(/^(#{2,4}) (.+)$/);
  if (heading) {
    const text = heading[2].trim();
    body.push({ type: 'heading', level: heading[1].length, text, id: slugify(text) });
    continue;
  }

  const image = line.match(/^!\[(.*)\]\((.+)\)$/);
  if (image) {
    const block = { type: 'image', url: image[2], alt: image[1] };
    const caption = (lines[i + 1] || '').match(/^\*([^*].*)\*$/);
    if (caption) {
      block.caption = caption[1];
      i++;
    }
    body.push(block);
    continue;
  }

  if (line.startsWith('|')) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
    i--;
    const cells = rows.filter((row) => !/^\|[\s:|-]+\|$/.test(row.trim())).map(splitRow);
    body.push({ type: 'table', headers: cells[0], rows: cells.slice(1) });
    continue;
  }

  if (/^- /.test(line)) {
    const items = [];
    while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2).trim());
    i--;
    body.push({ type: 'list', items });
    continue;
  }

  const paragraph = [line];
  while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#{2,4} |\||- |!\[)/.test(lines[i + 1])) {
    paragraph.push(lines[++i]);
  }
  // A fully bold first line followed by an answer is a question/answer pair.
  const question = paragraph[0].match(/^\*\*([^*]+)\*\*$/);
  if (question && paragraph.length > 1) {
    body.push({ type: 'heading', level: 3, text: question[1], id: slugify(question[1]) });
    body.push({ type: 'paragraph', text: paragraph.slice(1).join(' ') });
  } else {
    body.push({ type: 'paragraph', text: paragraph.join(' ') });
  }
}

const sources = section('EXTERNAL SOURCES USED')
  .split('\n')
  .map((line) => line.match(/^- (.+?):\s*(https?:\/\/\S+)\s*$/))
  .filter(Boolean)
  .map((match) => `[${match[1]}](${match[2]})`);
if (sources.length) {
  body.push({ type: 'heading', level: 2, text: 'Sources', id: 'sources' });
  body.push({ type: 'list', items: sources });
}

const data = JSON.parse(readFileSync(contentPath, 'utf8'));
const category = data.categories.find((c) => c.slug === opts.category);
if (!category) {
  console.error(`Unknown category "${opts.category}". Use one of: ${data.categories.map((c) => c.slug).join(', ')}`);
  process.exit(1);
}

const words = body
  .flatMap((block) => [block.text, ...(block.items || []), ...(block.rows || []).flat()])
  .filter(Boolean)
  .join(' ')
  .split(/\s+/).length;

const existing = data.articles.find((a) => a.slug === slug);
const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
const publishDate = opts.date || existing?.publish_date || now;

const article = {
  id: existing?.id || randomUUID(),
  title,
  slug,
  excerpt: seoDescription,
  hero_image: opts.hero || '',
  hero_image_alt: opts['hero-alt'] || title,
  hero_image_caption: opts['hero-caption'] || '',
  body,
  author_id: data.authors[0].id,
  category_id: category.id,
  tags: (opts.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
  publish_date: publishDate,
  updated_date: existing ? now : null,
  featured: Boolean(opts.featured),
  trending: Boolean(opts.trending),
  editor_choice: false,
  review_score: null,
  review_product: null,
  seo_title: seoTitle || title,
  seo_description: seoDescription,
  canonical_url: null,
  social_image: opts.social || opts.hero || null,
  reading_time: Math.max(1, Math.round(words / 220)),
  created_at: existing?.created_at || publishDate,
};

if (existing) data.articles[data.articles.indexOf(existing)] = article;
else data.articles.push(article);

writeFileSync(contentPath, JSON.stringify(data, null, 2) + '\n');
console.log(`${existing ? 'Updated' : 'Added'} /${category.slug}/${slug} (${body.length} blocks, ${words} words)`);
