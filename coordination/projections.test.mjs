import test from 'node:test';
import assert from 'node:assert/strict';
import {append} from './ledger.mjs';
import {views,explain} from './projections.mjs';
const base={timestamp:'2026-10-19T00:00:00Z',evidence_urls:['https://example.org/role'],authority:'agent-proposal'};
test('one canonical ledger yields consistent job and build views',()=>{
 let text=append('',{...base,id:'job-1',agent:'jobs',entity_id:'role-a',kind:'verified',depends_on:[],summary:'Role requirement verified'});
 text=append(text,{...base,id:'build-1',agent:'build',entity_id:'feature-a',kind:'proposed',depends_on:['job-1'],summary:'Reusable feature proposal'});
 const result=views(text);
 assert.equal(result.events,2);assert.deepEqual(result.jobs,['job-1']);assert.deepEqual(result.build,['build-1']);
 assert.deepEqual(explain(text,'feature-a').map(x=>x.id),['job-1','build-1']);
 assert.deepEqual(views(text),views(text));
});
test('empty ledger has empty projections',()=>assert.deepEqual(views('').entities,[]));
