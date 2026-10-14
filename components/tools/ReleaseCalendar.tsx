'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_ZONES, unlockInstant, formatInZone, countdown } from '@/lib/tools/release-time.mjs';
import type { BaseRow } from '@/lib/tools/types';

export interface ReleaseRow extends BaseRow {
  game: string;
  platform: string;
  unlock_rule: 'simultaneous' | 'midnight-local';
  unlock_at_utc?: string | null;
  release_date?: string | null;
  preload_at_utc?: string | null;
  install_size_gb?: number | null;
}

function useTimeZone() {
  // Server render uses UTC; the visitor's zone is applied after hydration.
  const [tz, setTz] = useState('UTC');
  useEffect(() => {
    try { setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'); } catch { /* keep UTC */ }
  }, []);
  return [tz, setTz] as const;
}

function SourceLinks({ ids }: { ids: number[] }) {
  return (
    <span className="text-xs text-muted-foreground">
      {ids.map((id, i) => (
        <a key={id} href={`#source-${id}`} className="underline-offset-2 hover:underline">[{i + 1}]</a>
      ))}
    </span>
  );
}

function Row({ row, tz, now }: { row: ReleaseRow; tz: string; now: Date | null }) {
  const unlock = unlockInstant(row, tz) as Date;
  const left = (now ? countdown(unlock, now) : null) as { days: number; hours: number; minutes: number } | null;
  return (
    <tr className="border-b align-top">
      <td className="py-3 pr-4 font-medium">{row.game}</td>
      <td className="py-3 pr-4 text-muted-foreground">{row.platform}</td>
      <td className="py-3 pr-4">
        {formatInZone(unlock, tz)}
        {row.unlock_rule === 'midnight-local' && <span className="block text-xs text-muted-foreground">Midnight local time</span>}
        {left && <span className="block text-xs text-primary">in {left.days}d {left.hours}h {left.minutes}m</span>}
      </td>
      <td className="py-3 pr-4">{row.preload_at_utc ? formatInZone(new Date(row.preload_at_utc), tz) : '—'}</td>
      <td className="py-3 pr-4">{row.install_size_gb ? `${row.install_size_gb} GB` : '—'}</td>
      <td className="py-3"><SourceLinks ids={row.fact_ids} /></td>
    </tr>
  );
}

function Table({ rows, tz, now, caption }: { rows: ReleaseRow[]; tz: string; now: Date | null; caption: string }) {
  if (!rows.length) return null;
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="mb-2 text-left text-xl font-semibold">{caption}</caption>
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Game</th>
            <th className="py-2 pr-4 font-medium">Platform</th>
            <th className="py-2 pr-4 font-medium">Unlocks</th>
            <th className="py-2 pr-4 font-medium">Preload</th>
            <th className="py-2 pr-4 font-medium">Install size</th>
            <th className="py-2 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>{rows.map((r) => <Row key={r.id} row={r} tz={tz} now={now} />)}</tbody>
      </table>
    </div>
  );
}

export function ReleaseCalendar({ upcoming, released }: { upcoming: ReleaseRow[]; released: ReleaseRow[] }) {
  const [tz, setTz] = useTimeZone();
  // null on the server and first client render, so the countdown never causes a hydration mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const zones = useMemo(() => {
    const list = [...DEFAULT_ZONES] as { label: string; tz: string }[];
    if (!list.some((z) => z.tz === tz)) list.unshift({ label: `Your time zone (${tz})`, tz });
    return list;
  }, [tz]);

  return (
    <div className="mt-8">
      <label className="text-sm font-medium" htmlFor="tz">Show times for</label>
      <select id="tz" value={tz} onChange={(e) => setTz(e.target.value)} className="ml-3 rounded-md border bg-background px-3 py-2 text-sm">
        <option value="UTC">UTC</option>
        {zones.map((z) => <option key={z.tz} value={z.tz}>{z.label}</option>)}
      </select>
      <Table rows={upcoming} tz={tz} now={now} caption="Upcoming" />
      <Table rows={released} tz={tz} now={now} caption="Recently released" />
    </div>
  );
}
