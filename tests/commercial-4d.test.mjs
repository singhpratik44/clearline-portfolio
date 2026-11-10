import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const js = fs.readFileSync(new URL('commercial-4d/model.js',root),'utf8');
const context = { globalThis:{} };
vm.runInNewContext(js,context,{filename:'commercial-4d/model.js'});
const M = context.globalThis.AP4DModel;
test('research evidence contains ten grounded dated primary sources',()=>{
 const r=JSON.parse(fs.readFileSync(new URL('commercial-4d/research.json',root),'utf8'));
 assert.equal(r.studies.length,10);
 assert.equal(new Set(r.studies.map(s=>s.id)).size,10);
 for(const p of r.studies){
  assert.match(p.date,/^2026-\d\d-\d\d$/);
  assert.match(p.url,/^https:\/\/(arxiv\.org|proceedings\.mlr\.press)\//);
  assert.ok(p.title.length>8&&p.aperture.length>18);
 }
});
test('synthetic scenario runs for all 24 months with finite outputs',()=>{
 const s=M.simulate({});
 assert.equal(s.history.length,25);
 assert.equal(s.history[0].cash,40000);
 for(const m of s.history){
  for(const k of ['cash','revenue','contribution','net','utilization','unserved'])assert.ok(Number.isFinite(m[k]),k+' @ '+m.month);
  assert.ok(m.utilization>=0&&m.utilization<=1.00000001);
  assert.ok(m.segments.reduce((n,v)=>n+v.hours,0)<=190+1e-7);
 }
});
test('capacity constraint holds even in upside with strong conversion lift',()=>{
 const s=M.simulate({scenario:'upside',capacity:70,closeLift:.5,network:.6,focus:'sport'});
 for(const m of s.history)assert.ok(m.segments.reduce((n,v)=>n+v.hours,0)<=70+1e-6);
 assert.ok(s.summary.flags.some(x=>x.includes('Capacity')||x.includes('demand')));
});
test('cash accounting reconciles with per-month net, not gross billings',()=>{
 const s=M.simulate({startingCash:22000,investment:7000});
 for(let t=1;t<s.history.length;t++)assert.ok(Math.abs(s.history[t].cash-(s.history[t-1].cash+s.history[t].net))<1e-7);
 assert.ok(Math.abs(s.summary.cumulativeNet-(s.summary.endingCash-22000))<1e-6);
});
test('market cases are distinct and downside does not outperform upside in cumulative revenue',()=>{
 const cases=M.variations({});
 assert.ok(cases.downside.summary.cumulativeRevenue<=cases.upside.summary.cumulativeRevenue+1e-8);
 assert.equal(cases.base.config.scenario,'base');
});
test('unsafe / NaN inputs are clamped and empty focus falls back to balanced',()=>{
 const c=M.normalize({capacity:-12,investment:'bad',scenario:'fictional',focus:'fictional'});
 assert.equal(c.capacity,20);assert.equal(c.investment,4500);assert.equal(c.scenario,'base');assert.equal(c.focus,'balanced');
});
test('published page includes model, research and explicit no-action guardrails',()=>{
 const html=fs.readFileSync(new URL('commercial-4d/index.html',root),'utf8');
 assert.match(html,/src="\.\/model\.js"/);
 assert.match(html,/fetch\("\.\/research\.json"/);
 assert.match(html,/No autonomous purchases, outreach, hiring or contract execution/);
 assert.match(html,/TIME \/ FOURTH DIMENSION/);
 assert.match(html,/id="universe"/);
});
