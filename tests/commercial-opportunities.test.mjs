import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const source=fs.readFileSync(new URL('commercial-4d/opportunities/engine.js',root),'utf8');
const context={globalThis:{}, URL, Date};
vm.runInNewContext(source,context);
const E=context.globalThis.AP4DOpportunity;
const sourceUrl='https://mail.google.com/mail/u/0/#all/1a1abc';
const sample={id:'verified-1',organization:'Example Partner',title:'Proposed referral discussion',kind:'partnership',stage:'responded',source_url:sourceUrl,last_evidence_at:'2026-11-09T21:00:00Z',evidence:'Human replied and invited a discussion.',terms:'Commission discussed but no agreement signed.',blockers:'No rate or written consent',proposed_next:'Request contractual terms',contract_value:null,terms_confirmed:false,status_confidence:'confirmed'};
test('imports validate required titles and enforce 150 record limit',()=>{
 const bundle=E.normalizeBundle({opportunities:[sample]});
 assert.equal(bundle.opportunities.length,1);
 assert.equal(bundle.opportunities[0].organization,'Example Partner');
 assert.throws(()=>E.normalizeBundle({opportunities:[{organization:'Nothing'}]}),/title/);
 assert.throws(()=>E.normalizeBundle({opportunities:Array.from({length:151},(_,i)=>({...sample,id:'dup'+i}))}),/Limit/);
 assert.throws(()=>E.normalizeBundle({opportunities:[sample,sample]}),/Duplicate/);
});
test('human reply and proposed commission never become booked revenue',()=>{
 const row=E.normalize({...sample,contract_value:25000,terms_confirmed:true,stage:'responded'},0);
 assert.equal(row.terms_confirmed,false);
 assert.equal(E.dashboard([row]).booked_contract_value,0);
 assert.equal(E.dashboard([row]).unknown_value,1);
});
test('booked valuation requires contracted stage, documented amount and evidence',()=>{
 const row=E.normalize({...sample,contract_value:25000,terms_confirmed:true,stage:'contracted'},0);
 assert.equal(row.terms_confirmed,true);
 assert.equal(E.dashboard([row]).booked_contract_value,25000);
 const incomplete=E.normalize({...sample,contract_value:25000,terms_confirmed:true,stage:'contracted',evidence:''},1);
 assert.equal(E.isPriced(incomplete),false);
});
test('external URL schemes are rejected and source links limited to known email hosts',()=>{
 assert.equal(E.safeURL('javascript:alert(1)'),'');
 assert.equal(E.safeURL('https://example.com/track?x=1'),'');
 assert.equal(E.safeURL(sourceUrl),sourceUrl);
});
test('what-if analysis cannot be counted as actual income',()=>{
 const row=E.normalize(sample,0);
 const s=E.scenario(row,{amount:10000,probability:.4,months:3});
 assert.equal(s.weighted_value,4000);
 assert.equal(s.booked_revenue,0);
 assert.equal(E.dashboard([row]).booked_contract_value,0);
 assert.throws(()=>E.scenario(row,{amount:10000,probability:1.2,months:3}),/Provide/);
});
test('research matching is deterministic and source-traceable',()=>{
 const registry=JSON.parse(fs.readFileSync(new URL('commercial-4d/research.json',root),'utf8')).studies;
 const row=E.normalize(sample,0);
 const a=E.researchFor(row,registry),b=E.researchFor(row,registry);
 assert.deepEqual(a.map(s=>s.id),b.map(s=>s.id));
 assert.ok(a.length>=3&&a.length<=4);
 assert.ok(a.every(s=>s.url.startsWith('https://')));
});
test('public static workspace includes no contact records, email data, auth secrets or uploads',()=>{
 const html=fs.readFileSync(new URL('commercial-4d/opportunities/index.html',root),'utf8');
 assert.match(html,/Import private opportunities JSON/);
 assert.match(html,/id="upload"/);
 assert.match(html,/id="network"/);
 assert.match(html,/No autonomous|Nothing you import is uploaded/);
 assert.doesNotMatch(html,/gouspa\.org|boominbusinesssolutions\.com|parry\.s\.2324@gmail\.com/);
 assert.doesNotMatch(html,/localStorage|sessionStorage|fetch\(["']https:\/\/mail\.google/);
 const src=fs.readFileSync(new URL('commercial-4d/opportunities/engine.js',root),'utf8');
 assert.doesNotMatch(src,/localStorage|sessionStorage|fetch\(/);
});
