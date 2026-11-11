import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';

const require=createRequire(import.meta.url);
const {evaluate}=require('../sports-os/revenue-recovery/pilot.js');
const {score,rank,draft,validate}=require('../sports-os/revenue-recovery/prospects.js');
const {analyze,sampleRows}=require('../sports-os/revenue-recovery/engine.js');
const folder='sports-os/revenue-recovery/';
const registry=JSON.parse(readFileSync(folder+'prospects-2026-11-10.json','utf8'));

test('phase 1 offer: working page, explicit authorization, no fake checkout and a hypothetical calculator',()=>{
  const html=readFileSync(folder+'pilot.html','utf8');
  for(const id of ['intake-form','org','authority','offer-preview','members','monthly','exceptions','scenario-value','save-brief'])
    assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/14-day/i);
  assert.match(html,/Research-stage offer/);
  assert.match(html,/No customer has purchased/);
  assert.match(html,/privacy\/security review/);
  assert.match(html,/src="pilot\.js"/);
  assert.doesNotMatch(html,/https:\/\/(?:buy|checkout)\.stripe\.com/);
  assert.equal(evaluate(120,150,5),900);
  assert.equal(evaluate(100,100,0),0);
  assert.throws(()=>evaluate(100,-1,10));
});

test('phase 1 fictional audit matches actual synthetic engine values and labels',()=>{
  const report=analyze(sampleRows('2026-11-10'),'2026-11-10');
  const html=readFileSync(folder+'sample-audit.html','utf8');
  assert.equal(report.metrics.accounts,10);
  assert.equal(report.metrics.past_due_cents,105400);
  assert.equal(report.metrics.failed_members,2);
  assert.equal(report.metrics.renewal_members,6);
  assert.match(html,/\$1,054/);
  assert.match(html,/FICTIONAL SAMPLE DATA/);
  assert.match(html,/NOT RECOVERED MONEY/);
  assert.match(html,/disputed \$249/);
  assert.match(html,/payment-card data/);
});

test('phase 2 registry has 24 distinct official locations across 20 prospective buying groups',()=>{
  assert.equal(registry.schema_version,1);
  const records=validate(registry);
  assert.equal(records.length,24);
  assert.equal(new Set(records.map(r=>r.id)).size,24);
  assert.equal(new Set(records.map(r=>r.buyer_group)).size,20);
  assert.equal(registry.network_count,8);
  assert.ok(records.every(x=>x.pain_verified===false&&x.contacted===false));
  assert.ok(records.every(x=>x.billing_provider.startsWith('Unknown')));
  assert.ok(records.every(x=>x.verified_on==='2026-11-10'));
  assert.ok(records.every(x=>score(x)>=0));
});

test('one buyer group is selected only once and sources determine rank, not synthetic purchases',()=>{
  const top=rank(registry.records,5);
  assert.equal(top.length,5);
  assert.equal(new Set(top.map(x=>x.buyer_group)).size,5);
  assert.equal(top[0].buyer_group,'SoCal Elite Sports');
  for(let i=1;i<top.length;i++)assert.ok(score(top[i-1])>=score(top[i]));
});

test('drafts make no ungrounded buying or payment recovery claims',()=>{
  const top=rank(registry.records,5);
  const texts=top.map(draft);
  for(const item of texts){
    assert.match(item,/UNSENT DRAFT/);
    assert.match(item,/I don't know whether/);
    assert.match(item,/Fictional|fictional|Sample report|illustration/);
    assert.match(item,/No email|no message|Nothing has been sent/);
    assert.doesNotMatch(item,/\b(we recovered|your missed payments|you lost revenue)\b/i);
  }
  const markdown=readFileSync(folder+'OUTREACH_DRAFTS_5.md','utf8');
  assert.equal((markdown.match(/^## \d\./gm)||[]).length,5);
  assert.match(markdown,/0 messages sent/);
});

test('no private intake or outreach transmission, disk persistence, or unsafe JS rendering',()=>{
  for(const file of ['pilot.js','prospects.js']){
    const js=readFileSync(folder+file,'utf8');
    assert.doesNotThrow(()=>new vm.Script(js));
    assert.doesNotMatch(js,/\b(localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket)\b/);
    assert.doesNotMatch(js,/\.innerHTML\s*=/);
    assert.doesNotMatch(js,/navigator\.sendBeacon|\.postMessage\(|emailjs|smtp/i);
    if(file==='pilot.js')assert.doesNotMatch(js,/\bfetch\s*\(/);
  }
  const html=readFileSync(folder+'prospects.html','utf8');
  assert.match(html,/20 distinct buying groups/);
  assert.match(html,/No messages were sent/);
  assert.match(html,/src="prospects\.js"/);
  assert.doesNotMatch(html,/buy\.stripe\.com/);
});

test('public lead records are well-formed and block malicious source URLs',()=>{
  const clone=structuredClone(registry);
  clone.records[0].source_url='https://attacker.invalid/business';
  assert.throws(()=>validate(clone));
  const second=structuredClone(registry);
  second.records[0].contacted=true;
  assert.throws(()=>validate(second));
  const third=structuredClone(registry);
  third.records[1].business_email='not-an-email';
  assert.throws(()=>validate(third));
  assert.ok(readFileSync(folder+'BUYER_RESEARCH_2026-11-10.md','utf8').includes('Verified overdue billing incidents at these businesses: 0'));
});
