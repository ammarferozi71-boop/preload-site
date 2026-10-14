import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDataset, isPublishable, sourcesFor } from '../lib/tools/validate.mjs';

const NOW = new Date('2026-10-15T12:00:00Z');
const base = () => ({
  tool: 't', generated_at: '2026-10-15T06:00:00Z', max_age_days: 7, min_rows: 1,
  rows: [{ id: 1, status: 'verified', as_of: '2026-10-14', fact_ids: [5], price: 15, currency: 'USD' }],
  facts: { 5: { url: 'https://example.com/a', excerpt: 'Priced at $15.', tier: 'official', as_of: '2026-10-14' } },
});

test('valid dataset has no problems and is publishable', () => {
  assert.deepEqual(validateDataset(base(), NOW), []);
  assert.equal(isPublishable(base(), NOW), true);
});
test('unverified row is rejected', () => {
  const d = base(); d.rows[0].status = 'draft';
  assert.match(validateDataset(d, NOW).join(), /only verified rows/);
});
test('row without facts is rejected', () => {
  const d = base(); d.rows[0].fact_ids = [];
  assert.match(validateDataset(d, NOW).join(), /no fact_ids/);
});
test('fact id without a source record is rejected', () => {
  const d = base(); d.rows[0].fact_ids = [99];
  assert.match(validateDataset(d, NOW).join(), /fact 99 has no source record/);
});
test('community source is rejected', () => {
  const d = base(); d.facts[5].tier = 'community';
  assert.match(validateDataset(d, NOW).join(), /community/);
});
test('stale as_of is rejected', () => {
  const d = base(); d.rows[0].as_of = '2026-09-01';
  assert.match(validateDataset(d, NOW).join(), /older than 7 days/);
});
test('price without currency is rejected', () => {
  const d = base(); delete d.rows[0].currency;
  assert.match(validateDataset(d, NOW).join(), /currency/);
});
test('non-https source is rejected', () => {
  const d = base(); d.facts[5].url = 'http://x.com';
  assert.match(validateDataset(d, NOW).join(), /https/);
});
test('duplicate ids are rejected', () => {
  const d = base(); d.rows.push({ ...d.rows[0] });
  assert.match(validateDataset(d, NOW).join(), /duplicate id/);
});
test('too few rows keeps the tool hidden but is not an error', () => {
  const d = base(); d.min_rows = 3;
  assert.deepEqual(validateDataset(d, NOW), []);
  assert.equal(isPublishable(d, NOW), false);
});
test('empty dataset is valid and hidden', () => {
  const d = base(); d.rows = []; d.facts = {};
  assert.deepEqual(validateDataset(d, NOW), []);
  assert.equal(isPublishable(d, NOW), false);
});
test('dataset older than 14 days is hidden', () => {
  assert.equal(isPublishable(base(), new Date('2026-11-05T00:00:00Z')), false);
});
test('sourcesFor returns the source records', () => {
  const d = base();
  assert.equal(sourcesFor(d, d.rows[0])[0].url, 'https://example.com/a');
});
