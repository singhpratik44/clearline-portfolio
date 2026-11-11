import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {parseCsv,validateRows,sampleRows,analyze,proposal,toCsv}=require('../sports-os/revenue-recovery/engine.js');
const today='2026-11-10';
const sample=sampleRows(today);
test('synthetic sample is reproducible, deduplicated and financially coherent',()=>{
  assert.equal(sample.length,10);
  const report=analyze(sample,today);
  assert.equal(report.metrics.accounts,10);
  assert.equal(report.metrics.past_due_cents,14900+17900+24900+29900+7900+9900);
  assert.equal(report.metrics.failed_members,2);
  assert.ok(report.metrics.renewal_members>=3);
  assert.equal(new Set(report.signals.map(x=>x.id)).size,report.signals.length);
  assert.ok(report.signals.every(x=>x.evidence.invoice_id===x.invoice_id));
});
test('disputes and denied contact permissions block approval, no communication',()=>{
 const report=analyze(sample,today);
 const disputed=report.signals.find(x=>x.member_id==='M104');
 const denied=report.signals.find(x=>x.member_id==='M106');
 assert.ok(disputed?.blocked);
 assert.ok(denied?.blocked);
 assert.match(proposal(disputed).gate,/BLOCKED/);
 assert.match(proposal(disputed).execution,/NONE/);
 assert.match(proposal(denied).draft,/official/i);
});
test('CSV roundtrip handles CRLF quoting and refuses extra private columns',()=>{
 const csv=toCsv(sample);
 assert.equal(validateRows(parseCsv(csv)).length,10);
 assert.equal(parseCsv('member_id,invoice_id,due_date,balance_cents,payment_status,renewal_date,consent_status\n"M123","INV123","2026-11-10","123","open","","unknown"\n').length,1);
 assert.throws(()=>parseCsv(csv.replace('consent_status','email,consent_status')),/seven approved/);
 assert.throws(()=>parseCsv('member_id,invoice_id\nbroken'),/seven approved/);
});
test('financial input validation rejects duplicates, negatives, dates, paid balances and suspicious identifiers',()=>{
 const base={...sample[0]};
 assert.throws(()=>validateRows([base,base]),/unique/);
 assert.throws(()=>validateRows([{...base,balance_cents:'-100'}]),/Balance/);
 assert.throws(()=>validateRows([{...base,due_date:'2026-02-30'}]),/Invalid calendar/);
 assert.throws(()=>validateRows([{...base,member_id:'student@example.org'}]),/opaque/);
 assert.throws(()=>validateRows([{...base,payment_status:'paid'}]),/zero outstanding/);
 assert.throws(()=>validateRows([{...base,consent_status:'maybe'}]),/consent_status/);
});
test('renewals not treated as debt and paid invoices never generate debt signals',()=>{
 const report=analyze(sample,today);
 const paid=report.signals.filter(x=>x.member_id==='M107');
 assert.ok(paid.some(x=>x.kind==='renewal'));
 assert.ok(paid.every(x=>x.kind!=='past_due'&&x.kind!=='failed'));
 const renewal=report.signals.find(x=>x.kind==='renewal');
 assert.equal(renewal.amount_cents,0);
});
test('new public dashboard is integrated and accurately discloses non-production features',()=>{
 const html=readFileSync('sports-os/revenue-recovery/index.html','utf8');
 const js=readFileSync('sports-os/revenue-recovery/engine.js','utf8');
 for(const id of ['workspace','signal-rows','count-accounts','past-due','failed-count','renewal-count','proposal','ledger','approve','defer','reject','csv-input','erase-data']){
   assert.ok(html.includes('id="'+id+'"'),id);
 }
 assert.match(html,/DEMONSTRATION/);
 assert.match(html,/No Stripe account/);
 assert.match(html,/no customer data/);
 assert.match(html,/engine\.js/);
 assert.doesNotMatch(js,/\b(fetch|XMLHttpRequest|WebSocket|EventSource|localStorage|sessionStorage|indexedDB)\b/);
 assert.doesNotMatch(js,/\.innerHTML\s*=/);
});
