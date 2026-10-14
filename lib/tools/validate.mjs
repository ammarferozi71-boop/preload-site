// Shared tool-data validation (identical copy in every site repo).
// A tool dataset is written by the SEO engine from Supabase shared.tool_* tables
// (only rows with status 'verified') into content/tools/<tool>.json.
//
// Dataset shape:
// {
//   "tool": "release-calendar",
//   "generated_at": "2026-10-15T06:00:00Z",
//   "max_age_days": 7,            // a row's as_of may not be older than this
//   "min_rows": 3,                // the tool page stays hidden (404, no sitemap) below this
//   "rows": [ { "id": 1, "status": "verified", "as_of": "2026-10-15", "fact_ids": [12], ... } ],
//   "facts": { "12": { "url": "https://...", "excerpt": "exact words", "tier": "official", "as_of": "2026-10-15" } }
// }

const DAY = 24 * 60 * 60 * 1000;
const TIERS = new Set(['official', 'major_outlet', 'minor_outlet', 'community']);

/** Returns a list of human-readable problems. An empty list means the dataset is valid. */
export function validateDataset(ds, now = new Date()) {
  const problems = [];
  if (!ds || typeof ds !== 'object') return ['dataset is not an object'];
  if (typeof ds.tool !== 'string' || !ds.tool) problems.push('missing tool name');
  const generated = Date.parse(ds.generated_at);
  if (Number.isNaN(generated)) problems.push('generated_at is not a date');
  else if (generated > now.getTime() + DAY) problems.push('generated_at is in the future');
  if (!Number.isInteger(ds.max_age_days) || ds.max_age_days < 1) problems.push('max_age_days must be a positive integer');
  if (!Array.isArray(ds.rows)) return [...problems, 'rows must be an array'];
  const facts = ds.facts && typeof ds.facts === 'object' ? ds.facts : {};

  for (const [id, f] of Object.entries(facts)) {
    if (!f || typeof f.url !== 'string' || !/^https:\/\//.test(f.url)) problems.push(`fact ${id}: url must be https`);
    if (!f || typeof f.excerpt !== 'string' || f.excerpt.trim().length < 5) problems.push(`fact ${id}: missing source excerpt`);
    if (!f || !TIERS.has(f.tier)) problems.push(`fact ${id}: unknown source tier`);
    if (f && f.tier === 'community') problems.push(`fact ${id}: community sources cannot support tool data`);
  }

  const seen = new Set();
  ds.rows.forEach((row, i) => {
    const label = `row ${row && row.id !== undefined ? row.id : i}`;
    if (!row || typeof row !== 'object') { problems.push(`${label}: not an object`); return; }
    if (seen.has(row.id)) problems.push(`${label}: duplicate id`);
    seen.add(row.id);
    if (row.status !== 'verified') problems.push(`${label}: status is '${row.status}', only verified rows may be published`);
    if (!Array.isArray(row.fact_ids) || row.fact_ids.length === 0) problems.push(`${label}: no fact_ids`);
    else for (const fid of row.fact_ids) if (!facts[String(fid)]) problems.push(`${label}: fact ${fid} has no source record`);
    const asOf = Date.parse(row.as_of);
    if (Number.isNaN(asOf)) problems.push(`${label}: as_of is not a date`);
    else if (!Number.isNaN(generated) && Number.isInteger(ds.max_age_days) && generated - asOf > ds.max_age_days * DAY)
      problems.push(`${label}: as_of ${row.as_of} is older than ${ds.max_age_days} days`);
    if ('price' in row && row.price !== null && row.price !== undefined) {
      if (typeof row.price !== 'number' || row.price < 0) problems.push(`${label}: price must be a non-negative number`);
      if (typeof row.currency !== 'string' || !/^[A-Z]{3}$/.test(row.currency)) problems.push(`${label}: price needs a 3-letter currency`);
    }
  });
  return problems;
}

/** True when the dataset is valid, fresh enough and large enough for the tool page to be public. */
export function isPublishable(ds, now = new Date(), maxDatasetAgeDays = 14) {
  if (validateDataset(ds, now).length) return false;
  const minRows = Number.isInteger(ds.min_rows) ? ds.min_rows : 1;
  if (ds.rows.length < minRows) return false;
  return now.getTime() - Date.parse(ds.generated_at) <= maxDatasetAgeDays * DAY;
}

/** Sources for display: the fact records a row rests on. */
export function sourcesFor(ds, row) {
  return (row.fact_ids || []).map((id) => ds.facts[String(id)]).filter(Boolean);
}
