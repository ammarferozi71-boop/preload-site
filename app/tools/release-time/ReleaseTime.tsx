'use client';
import { useEffect, useState } from 'react';
import { releaseTime } from '@/lib/decision-tools.mjs';

export default function ReleaseTime() {
  const [instant,setInstant]=useState('');
  const [zone,setZone]=useState('UTC');
  const [now,setNow]=useState<Date|null>(null);
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(timer);},[]);
  let result:ReturnType<typeof releaseTime>|null=null,error='';
  if(instant&&now)try{result=releaseTime(instant,zone,now);}catch{error='Enter a valid timestamp with an offset, such as 2026-12-01T17:00:00Z.';}
  return <div className="space-y-6 rounded-xl border bg-card p-6">
    <p className="text-muted-foreground">Convert a publisher’s confirmed launch time. The converter uses the time you enter and does not verify a release announcement.</p>
    <label className="block font-medium">Confirmed launch timestamp<input className="mt-2 block w-full rounded border bg-background p-3" value={instant} onChange={e=>setInstant(e.target.value)} placeholder="YYYY-MM-DDTHH:MM:SSZ" aria-describedby="time-help" /></label>
    <p id="time-help" className="text-sm text-muted-foreground">Include Z for UTC, or an offset such as +05:00. A date without a timezone cannot identify a launch instant.</p>
    <label className="block font-medium">Your timezone<select className="mt-2 block w-full rounded border bg-background p-3" value={zone} onChange={e=>setZone(e.target.value)}>
      {['UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Berlin','Asia/Karachi','Asia/Kolkata','Asia/Tokyo','Australia/Sydney'].map(z=><option key={z}>{z}</option>)}
    </select></label>
    {error&&<p role="alert" className="text-red-700">{error}</p>}
    <div aria-live="polite">{result&&<><h2 className="text-xl font-semibold">{result.local}</h2><p className="mt-2">{result.occurred?'This supplied time has passed.':`${Math.floor(result.secondsRemaining/86400)} days, ${Math.floor(result.secondsRemaining%86400/3600)} hours, ${Math.floor(result.secondsRemaining%3600/60)} minutes remaining`}</p><p className="mt-2 text-sm text-muted-foreground">UTC: {result.utc}. Daylight saving is handled for the selected timezone.</p></>}</div>
  </div>;
}
