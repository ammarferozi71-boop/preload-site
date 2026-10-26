import test from 'node:test';
import assert from 'node:assert/strict';
import {safeJsonLd} from '../lib/structured-data.mjs';
import {validRecord,editionMatrix,releaseTime,compatibility,comparePlans} from '../lib/decision-tools.mjs';
const now = new Date('2026-10-26T00:00:00Z');
const evidence={status:'confirmed',source_url:'https://manufacturer.test/spec',observed_at:'2026-10-25T00:00:00Z',expires_at:'2026-10-27T00:00:00Z'};
test('JSON-LD cannot terminate its script element',()=>{
 const value={headline:'</script><script>alert(1)</script>'};const encoded=safeJsonLd(value);
 assert.equal(encoded.includes('<'),false);assert.deepEqual(JSON.parse(encoded),value);
});
test('expired, uncertain and future records stay unavailable',()=>{
 assert.equal(validRecord({...evidence,expires_at:now.toISOString()},now),false);
 assert.equal(validRecord({...evidence,status:'conflicting'},now),false);
 assert.equal(validRecord({...evidence,observed_at:'2026-10-28T00:00:00Z'},now),false);
});
test('edition features preserve unknown inclusion and platform isolation',()=>{
 const result=editionMatrix([{...evidence,kind:'edition',game:'Game',platform:'PC',name:'Standard',includes:{DLC:null}},
 {...evidence,kind:'edition',game:'Game',platform:'Console',name:'Console',includes:{DLC:true}}],'Game','PC',now);
 assert.deepEqual(result.columns,['Standard']);assert.equal(result.rows[0].values[0],'Unknown');
});
test('timezone conversion preserves the instant and handles DST',()=>{
 const result=releaseTime('2026-11-01T06:30:00Z','America/New_York',now);
 assert.equal(result.utc,'2026-11-01T06:30:00.000Z');assert.match(result.local,/1:30:00/);
 assert.throws(()=>releaseTime('2026-11-01T06:30:00','UTC',now));
 assert.throws(()=>releaseTime('2026-11-01T06:30:00Z','Invalid/Zone',now));
 assert.throws(()=>releaseTime('2026-02-30T06:30:00Z','UTC',now));
});
test('matching sockets never imply CPU support',()=>{
 const cpu={...evidence,id:'cpu',socket:'A'},board={...evidence,socket:'A'};
 assert.equal(compatibility(cpu,board,now).status,'unknown');
 assert.equal(compatibility(cpu,{...board,socket:'B'},now).status,'incompatible');
 assert.equal(compatibility(cpu,{...board,supported_cpus:[{cpu_id:'cpu',minimum_bios:'F2',source_url:'https://manufacturer.test/support'}]},now).status,'listed_support');
});
test('plan comparison respects region currency and unknown annual pricing',()=>{
 const rows=comparePlans([{...evidence,kind:'subscription',name:'Plan',region:'US',currency:'USD',monthly_price:10,annual_price:null},
 {...evidence,kind:'subscription',name:'Other',region:'GB',currency:'GBP',monthly_price:8,annual_price:80}],'US','USD',now);
 assert.equal(rows.length,1);assert.equal(rows[0].effectiveMonthly,null);
});
