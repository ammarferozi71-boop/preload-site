// Pure source-backed tool logic. No network or database access.
export function validRecord(record, now = new Date()) {
  const observed = Date.parse(record.observed_at), expires = Date.parse(record.expires_at);
  return record.status === 'confirmed' && typeof record.source_url === 'string'
    && /^https:\/\//.test(record.source_url) && Number.isFinite(observed)
    && Number.isFinite(expires) && observed <= now.getTime() && expires > now.getTime();
}
export function editionMatrix(records, game, platform, now = new Date()) {
  const rows = records.filter(r => r.kind === 'edition' && r.game === game && r.platform === platform && validRecord(r, now));
  const features = [...new Set(rows.flatMap(r => Object.keys(r.includes || {})))].sort();
  return { columns: rows.map(r => r.name), rows: features.map(feature => ({
    feature, values: rows.map(r => typeof r.includes?.[feature] === 'boolean' ? (r.includes[feature] ? 'Included' : 'Not included') : 'Unknown')
  })), sources: rows.map(r => ({ name:r.name, url:r.source_url, observed:r.observed_at })) };
}
export function releaseTime(iso, zone, now = new Date()) {
  const parts = typeof iso === 'string' && iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/);
  if (!parts || !Number.isFinite(Date.parse(iso))) throw new Error('Supply an ISO timestamp with UTC offset.');
  const [,year,month,day,hour,minute,second] = parts.map((part,index) => index > 0 && index < 7 ? Number(part) : part);
  if (month < 1 || month > 12 || day < 1 || day > new Date(Date.UTC(year,month,0)).getUTCDate() || hour > 23 || minute > 59 || second > 59) throw new Error('Invalid calendar date or time.');
  const event = new Date(iso);
  const formatted = new Intl.DateTimeFormat('en-US', {timeZone:zone,dateStyle:'full',timeStyle:'long'}).format(event);
  return { local:formatted, utc:event.toISOString(), secondsRemaining:Math.max(0,Math.floor((event-now)/1000)), occurred:event<=now };
}
export function compatibility(cpu, board, now = new Date()) {
  if (![cpu,board].every(r => r && validRecord(r,now))) return {status:'unknown',reason:'Current manufacturer evidence is required.'};
  if (!cpu.socket || !board.socket) return {status:'unknown',reason:'Socket specifications are missing.'};
  if (cpu.socket !== board.socket) return {status:'incompatible',reason:'Manufacturer socket specifications differ.'};
  const support = (board.supported_cpus || []).find(r => r.cpu_id === cpu.id);
  if (!support || !/^https:\/\//.test(support.source_url || '') || !support.minimum_bios) return {status:'unknown',reason:'Matching sockets do not prove chipset or BIOS support.'};
  return {status:'listed_support',reason:'CPU appears on the supplied motherboard support list. Confirm installed BIOS, cooling, power and physical clearances.',
    minimum_bios:support.minimum_bios,source_url:support.source_url};
}
export function comparePlans(records, region, currency, now = new Date()) {
  return records.filter(r => r.kind === 'subscription' && r.region === region && r.currency === currency && validRecord(r,now))
    .map(r => ({name:r.name, monthly:r.monthly_price == null ? null : r.monthly_price,
      annual:r.annual_price == null ? null : r.annual_price,
      effectiveMonthly:r.annual_price == null ? null : Math.round(r.annual_price / 12 * 100)/100,
      source:r.source_url,observed:r.observed_at}))
    .filter(r => [r.monthly,r.annual].every(v => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0)));
}
