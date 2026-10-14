#!/usr/bin/env node
// Fails (exit 1) if any tool dataset in content/tools breaks the verified-data rules.
// A stale or too-small dataset is not an error: the tool page simply stays hidden.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validateDataset, isPublishable } from '../lib/tools/validate.mjs';

const dir = join(process.cwd(), 'content', 'tools');
if (!existsSync(dir)) { console.log('check-tool-data: no content/tools directory, nothing to check'); process.exit(0); }

let failed = false;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  let ds;
  try { ds = JSON.parse(readFileSync(join(dir, file), 'utf8')); }
  catch (e) { console.error(`✗ ${file}: invalid JSON (${e.message})`); failed = true; continue; }
  const problems = validateDataset(ds);
  if (problems.length) {
    failed = true;
    console.error(`✗ ${file}: ${problems.length} problem(s)`);
    for (const p of problems) console.error(`   - ${p}`);
  } else {
    console.log(`✓ ${file}: ${ds.rows.length} verified row(s), ${isPublishable(ds) ? 'PUBLIC' : 'hidden (too few rows or stale)'}`);
  }
}
process.exit(failed ? 1 : 0);
