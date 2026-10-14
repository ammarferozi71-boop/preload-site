// Preload release calendar logic. Pure functions, no dependencies, unit tested.
//
// A release row (from content/tools/release-calendar.json):
// { id, game, platform, unlock_rule: 'simultaneous' | 'midnight-local',
//   unlock_at_utc?: ISO string (required for 'simultaneous'),
//   release_date?: 'YYYY-MM-DD' (required for 'midnight-local'),
//   preload_at_utc?: ISO string | null, install_size_gb?: number | null,
//   status, as_of, fact_ids }

export const DEFAULT_ZONES = [
  { label: 'Los Angeles (PT)', tz: 'America/Los_Angeles' },
  { label: 'New York (ET)', tz: 'America/New_York' },
  { label: 'London (UK)', tz: 'Europe/London' },
  { label: 'Berlin (CET)', tz: 'Europe/Berlin' },
  { label: 'Karachi (PKT)', tz: 'Asia/Karachi' },
  { label: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
  { label: 'Sydney (AET)', tz: 'Australia/Sydney' },
];

/** Offset in minutes of a time zone at a given instant (positive east of UTC). */
export function zoneOffsetMinutes(tz, instant) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(instant).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - instant.getTime()) / 60000);
}

/** The UTC instant of local midnight on dateStr (YYYY-MM-DD) in tz. */
export function localMidnightUtc(dateStr, tz) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr || '')) throw new Error('release_date must be YYYY-MM-DD');
  const [y, m, d] = dateStr.split('-').map(Number);
  let guess = new Date(Date.UTC(y, m - 1, d));
  // Two passes handle zones whose offset differs between the guess and the answer (DST changes).
  for (let i = 0; i < 2; i++) guess = new Date(Date.UTC(y, m - 1, d) - zoneOffsetMinutes(tz, guess) * 60000);
  return guess;
}

/** The unlock instant (Date) of a release row in a given time zone. */
export function unlockInstant(row, tz) {
  if (row.unlock_rule === 'simultaneous') {
    const t = new Date(row.unlock_at_utc);
    if (Number.isNaN(t.getTime())) throw new Error(`row ${row.id}: unlock_at_utc missing for simultaneous unlock`);
    return t;
  }
  if (row.unlock_rule === 'midnight-local') return localMidnightUtc(row.release_date, tz);
  throw new Error(`row ${row.id}: unknown unlock_rule '${row.unlock_rule}'`);
}

/** Human-readable local time, e.g. "Thu 19 Nov 2026, 05:00". */
export function formatInZone(instant, tz, locale = 'en-GB') {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(instant);
}

/** Table rows: one entry per zone with the formatted local unlock time. */
export function unlockTable(row, zones = DEFAULT_ZONES) {
  return zones.map((z) => {
    const t = unlockInstant(row, z.tz);
    return { label: z.label, tz: z.tz, iso: t.toISOString(), local: formatInZone(t, z.tz) };
  });
}

/** Countdown parts from now to target; null once the time has passed. */
export function countdown(target, now = new Date()) {
  let ms = new Date(target).getTime() - now.getTime();
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86400000); ms -= days * 86400000;
  const hours = Math.floor(ms / 3600000); ms -= hours * 3600000;
  const minutes = Math.floor(ms / 60000);
  return { days, hours, minutes };
}

/** Upcoming first, then released, each sorted by unlock time (UTC instant or UTC midnight of the date). */
export function sortReleases(rows, now = new Date()) {
  const key = (r) => (r.unlock_rule === 'simultaneous' ? new Date(r.unlock_at_utc) : localMidnightUtc(r.release_date, 'UTC')).getTime();
  const upcoming = rows.filter((r) => key(r) > now.getTime()).sort((a, b) => key(a) - key(b));
  const released = rows.filter((r) => key(r) <= now.getTime()).sort((a, b) => key(b) - key(a));
  return { upcoming, released };
}
