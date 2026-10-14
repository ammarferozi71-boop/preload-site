import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zoneOffsetMinutes, localMidnightUtc, unlockInstant, unlockTable, countdown, sortReleases, formatInZone } from '../lib/tools/release-time.mjs';

test('zone offsets, including daylight saving', () => {
  assert.equal(zoneOffsetMinutes('Asia/Karachi', new Date('2026-11-19T00:00:00Z')), 300);
  assert.equal(zoneOffsetMinutes('America/New_York', new Date('2026-07-01T12:00:00Z')), -240); // EDT
  assert.equal(zoneOffsetMinutes('America/New_York', new Date('2026-12-01T12:00:00Z')), -300); // EST
  assert.equal(zoneOffsetMinutes('Australia/Sydney', new Date('2026-12-01T00:00:00Z')), 660);  // AEDT
});

test('local midnight converts to the right UTC instant', () => {
  assert.equal(localMidnightUtc('2026-11-19', 'Asia/Karachi').toISOString(), '2026-11-18T19:00:00.000Z');
  assert.equal(localMidnightUtc('2026-11-19', 'America/Los_Angeles').toISOString(), '2026-11-19T08:00:00.000Z');
  assert.equal(localMidnightUtc('2026-11-19', 'UTC').toISOString(), '2026-11-19T00:00:00.000Z');
  // Day after US daylight saving ends (1 Nov 2026)
  assert.equal(localMidnightUtc('2026-11-02', 'America/New_York').toISOString(), '2026-11-02T05:00:00.000Z');
});

test('simultaneous unlock is the same instant everywhere', () => {
  const row = { id: 1, unlock_rule: 'simultaneous', unlock_at_utc: '2026-10-16T17:00:00Z' };
  const t = unlockTable(row, [{ label: 'PKT', tz: 'Asia/Karachi' }, { label: 'PT', tz: 'America/Los_Angeles' }]);
  assert.equal(t[0].iso, t[1].iso);
  assert.match(t[0].local, /22:00/);
  assert.match(t[1].local, /10:00/);
});

test('midnight-local unlock differs per zone', () => {
  const row = { id: 2, unlock_rule: 'midnight-local', release_date: '2026-11-19' };
  assert.notEqual(unlockInstant(row, 'Asia/Tokyo').toISOString(), unlockInstant(row, 'Europe/London').toISOString());
  assert.match(formatInZone(unlockInstant(row, 'Asia/Tokyo'), 'Asia/Tokyo'), /00:00/);
});

test('bad rows throw instead of showing a wrong time', () => {
  assert.throws(() => unlockInstant({ id: 3, unlock_rule: 'simultaneous' }, 'UTC'));
  assert.throws(() => unlockInstant({ id: 4, unlock_rule: 'midnight-local', release_date: '19/11/2026' }, 'UTC'));
  assert.throws(() => unlockInstant({ id: 5, unlock_rule: 'soon' }, 'UTC'));
});

test('countdown', () => {
  assert.deepEqual(countdown('2026-10-16T17:00:00Z', new Date('2026-10-15T15:30:00Z')), { days: 1, hours: 1, minutes: 30 });
  assert.equal(countdown('2026-10-01T00:00:00Z', new Date('2026-10-15T00:00:00Z')), null);
});

test('upcoming releases first, soonest first; released newest first', () => {
  const rows = [
    { id: 1, unlock_rule: 'midnight-local', release_date: '2026-11-19' },
    { id: 2, unlock_rule: 'simultaneous', unlock_at_utc: '2026-10-16T17:00:00Z' },
    { id: 3, unlock_rule: 'simultaneous', unlock_at_utc: '2026-10-01T17:00:00Z' },
  ];
  const { upcoming, released } = sortReleases(rows, new Date('2026-10-15T00:00:00Z'));
  assert.deepEqual(upcoming.map((r) => r.id), [2, 1]);
  assert.deepEqual(released.map((r) => r.id), [3]);
});
