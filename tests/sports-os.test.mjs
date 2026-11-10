import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('sports-os/index.html','utf8');
const js = readFileSync('sports-os/app.js','utf8');

test('sports OS public page includes accessible interactive modules and truthful limitations',()=>{
  for(const id of ['universe','plan','lab','organization','evidence','career-graph','time','role-tabs','practice-list','evidence-form']){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(html,/PUBLIC SANDBOX/);
  assert.match(html,/No live vacancies/);
  assert.match(html,/No login, cloud database, payment collection/);
  assert.match(html,/Sports psychology is not interchangeable/);
  assert.match(html,/prefers-reduced-motion/);
  assert.match(html,/href="\.\.\/basketball-os\.html"/);
  assert.match(html,/script defer src="app\.js"/);
});
test('sports OS JavaScript parses and does not make implicit network or persistence calls',()=>{
  assert.doesNotThrow(()=>new vm.Script(js));
  assert.doesNotMatch(js,/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(/);
  assert.doesNotMatch(js,/\b(?:localStorage|sessionStorage|indexedDB)\b/);
  assert.doesNotMatch(js,/\b(?:eval|innerHTML)\s*[(=]/);
});
class Element {
  constructor(tag='div'){
    this.tag=tag;this.children=[];this.listeners={};this.attributes={};this.dataset={};this.style={};
    this.value='';this.textContent='';this.className='';this.selectedOptions=[{textContent:''}];
    this.classList={toggle:()=>{}};
  }
  append(...children){this.children.push(...children)}
  appendChild(node){this.children.push(node);return node}
  replaceChildren(...children){this.children=[...children]}
  setAttribute(k,v){this.attributes[k]=v}
  addEventListener(k,cb){this.listeners[k]=cb}
  querySelector(selector){return this.children.find(c=>c.tag===selector)||null}
  fire(type,detail={}){const cb=this.listeners[type];if(cb)cb({target:this,preventDefault(){},...detail})}
  reset(){this.value=''}
  remove(){}
}
function init(){
  const elements={};
  for(const id of ['career-graph','time','time-output','background','sport','hours','stage-count','stage-year','stage-name','stage-description','stage-gate','stage-skills','plan-title','plan-grid','plan-message','download-plan','copy-plan','focus','age','duration','build-practice','practice-title','practice-list','download-practice','staff','ratio','sessions','staff-value','ratio-value','sessions-value','capacity','staff-hours','evidence-form','evidence-title','evidence-link','evidence-list','export-ledger']) elements[id]=new Element();
  const r=()=>['coach','mental','scout','ops'].map(role=>{const x=new Element('button');x.dataset.role=role;return x});
  const buttons=r();
  elements.time.value='0';elements.background.value='new';elements.sport.value='Basketball';elements.hours.value='6';
  elements.background.selectedOptions=[{textContent:'New to the field'}];
  elements.focus.value='decision';elements.focus.selectedOptions=[{textContent:'Decision-making'}];
  elements.age.value='12-15';elements.duration.value='60';
  elements.staff.value='6';elements.ratio.value='10';elements.sessions.value='3';
  const doc={
    getElementById:id=>{assert.ok(elements[id],'Unknown id '+id);return elements[id]},
    querySelectorAll:()=>buttons,
    createElement:tag=>new Element(tag),
    createElementNS:(ns,tag)=>new Element(tag),
    body:new Element('body')
  };
  const alerts=[];
  vm.runInNewContext(js,{document:doc,Date,Math,URL,Blob,setTimeout:()=>{},alert:s=>alerts.push(s),navigator:{}});
  return {elements,buttons,alerts};
}
test('role and time controls change the graph, milestone and 90-day plan',()=>{
  const {elements:e,buttons}=init();
  assert.equal(e['stage-name'].textContent,'Youth / assistant coach');
  assert.equal(e['plan-grid'].children.length,3);
  assert.equal(e['career-graph'].children.length,20); // title + four edges + five nodes + five labels + five year labels
  e.time.value='3';e.time.fire('input');
  assert.equal(e['stage-name'].textContent,'Director of coaching');
  assert.equal(e['time-output'].textContent,'YEARS 4–6+');
  buttons[1].fire('click');
  assert.equal(e['stage-name'].textContent,'Mental performance explorer');
  assert.match(e['stage-gate'].textContent,/licensure/);
  assert.match(e['plan-title'].textContent,/Mental performance/);
});
test('practice builder and organization simulation react to changes',()=>{
  const {elements:e}=init();
  assert.equal(e['practice-list'].children.length,5);
  const durations=e['practice-list'].children.map(x=>Number(x.children[0].textContent.split(' ')[0]));
  assert.equal(durations.reduce((a,b)=>a+b,0),60);
  e.duration.value='45';e['build-practice'].fire('click');
  assert.equal(e['practice-title'].textContent.startsWith('45-minute'),true);
  assert.equal(e.capacity.textContent,'180');
  e.staff.value='8';e.staff.fire('input');
  assert.equal(e.capacity.textContent,'240');
  assert.equal(e['staff-hours'].textContent,'24');
});
test('session evidence remains unverified and rejects insecure links',()=>{
  const {elements:e,alerts}=init();
  e['evidence-title'].value='Approved training sample';
  e['evidence-link'].value='https://example.org/evidence';
  e['evidence-form'].fire('submit');
  assert.match(e['evidence-list'].children[0].children[0].children[1].textContent,/NOT VERIFIED/);
  e['evidence-title'].value='Unsafe URL';e['evidence-link'].value='http://example.org/';
  e['evidence-form'].fire('submit');
  assert.equal(e['evidence-list'].children.length,1);
  assert.equal(alerts.length,1);
});

test('Sports V2 job discovery, profile and services pages exist with clear authority boundaries',()=>{
  for(const [page,markers] of [
    ['sports-os/opportunities.html',['Opportunity Intelligence','id="job-list"','opportunities.js','Needs review']],
    ['sports-os/profile.html',['Professional Portfolio Builder','id="profile-form"','Self-reported']],
    ['sports-os/marketplace.html',['Services Studio','id="scope-form"','not a live marketplace']],
  ]){
    const source=readFileSync(page,'utf8');
    for(const mark of markers)assert.ok(source.includes(mark),page+' missing '+mark);
    assert.match(source,/<meta name="viewport"/);
    assert.doesNotMatch(source,/https?:\/\/(js\.stripe\.com|checkout\.stripe\.com)/);
  }
  assert.match(html,/href="opportunities\.html"/);
  assert.match(html,/href="profile\.html"/);
  assert.match(html,/href="marketplace\.html"/);
});
test('all Sports V2 scripts parse and prohibit silently storing private profiles or sending outreach',()=>{
  for(const name of ['sports-os/opportunities.js','sports-os/profile.js','sports-os/marketplace.js']){
    const source=readFileSync(name,'utf8');
    assert.doesNotThrow(()=>new vm.Script(source),name);
    assert.doesNotMatch(source,/\b(localStorage|sessionStorage|indexedDB|XMLHttpRequest|WebSocket)\b/);
    assert.doesNotMatch(source,/\.innerHTML\s*=/);
  }
  assert.doesNotMatch(readFileSync('sports-os/profile.js','utf8'),/\bfetch\s*\(/);
  assert.doesNotMatch(readFileSync('sports-os/marketplace.js','utf8'),/\bfetch\s*\(/);
});
test('Sports opportunity feed has grounded unique IDs, allowed URLs and non-verified startup states',()=>{
  const data=JSON.parse(readFileSync('sports-os/opportunities.json','utf8'));
  assert.equal(data.schema_version,2);
  assert.ok(data.listings.length>=4);
  assert.equal(new Set(data.listings.map(j=>j.id)).size,data.listings.length);
  assert.ok(data.listings.every(j=>j.status==='review-required'&&j.verified_at===null));
  for(const j of data.listings){
    const u=new URL(j.official_url);
    assert.equal(u.protocol,'https:');
    assert.ok(['job-boards.greenhouse.io','www.teamworkonline.com','workforcenow.adp.com','careers.nba.com'].includes(u.hostname));
  }
});
