import test from 'node:test';
import assert from 'node:assert/strict';
import { appendWithCas } from './github-store.mjs';
import { parseLedger } from './ledger.mjs';
const event = id => ({ id,timestamp:'2026-10-19T00:00:00Z',agent:'build',entity_id:'PR-2',kind:'proposed',evidence_urls:['https://github.com/singhpratik44/clearline-portfolio/pull/2'],depends_on:[],summary:'Implementation proposal',authority:'agent-proposal' });
function fakeStore() {
  let content='', version=0;
  return {
    read: async () => ({content,sha:String(version)}),
    write: async ({content:next,sha}) => { if(sha!==String(version)) throw Object.assign(Error('Conflict'),{status:409}); content=next;version++; },
    records:()=>parseLedger(content),
    conflict:()=>version++
  };
}
test('writes and deduplicates',async()=>{ const s=fakeStore();assert.equal((await appendWithCas(s,event('one'))).status,'appended');assert.equal((await appendWithCas(s,event('one'))).status,'already-recorded');assert.equal(s.records().length,1); });
test('retries stale SHA after refetch',async()=>{ const s=fakeStore();let first=true;const adapter={read:s.read,write:async x=>{if(first){first=false;s.conflict();}return s.write(x)}};assert.equal((await appendWithCas(adapter,event('two'))).attempts,2);assert.equal(s.records().length,1);});
test('fails closed on permanent conflict',async()=>{const s=fakeStore();const adapter={read:s.read,write:async()=>{throw Object.assign(Error('Conflict'),{status:409})}};await assert.rejects(appendWithCas(adapter,event('three'),{maxAttempts:2}),/Concurrent/);});
test('does not retry non-conflict failures',async()=>{const s=fakeStore();const adapter={read:s.read,write:async()=>{throw Error('Permission denied')}};await assert.rejects(appendWithCas(adapter,event('four')),/Permission denied/);});
