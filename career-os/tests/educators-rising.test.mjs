import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const html=fs.readFileSync(new URL('../demos/educators-rising-implementation-lab/index.html',import.meta.url),'utf8');
function harness(){
 const ids=['metrics','project','detail','decisions','risks','resolve','reset','feedback'];
 const nodes=Object.fromEntries(ids.map(id=>[id,{innerHTML:'',value:'',disabled:false,textContent:'',onclick:null,onchange:null}]));
 const document={getElementById(id){assert.ok(nodes[id], 'Unknown DOM node '+id);return nodes[id]}};
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script,'Interactive script must exist');
 vm.runInNewContext(script,{document,JSON,Math,Number},{timeout:1500});
 return nodes;
}
test('prototype identifies Educators Rising and discloses simulated data',()=>{
 assert.match(html,/Educators Rising/);assert.match(html,/Synthetic sample data/);assert.match(html,/Not affiliated with Educators Rising/);
});
test('initial state renders three initiatives and two risks',()=>{
 const n=harness();assert.match(n.metrics.innerHTML,/At risk/);assert.match(n.metrics.innerHTML,/>2<\/h1>/);assert.equal(n.resolve.disabled,false);
});
test('resolving a dependency updates risk count and executive indicators',()=>{
 const n=harness();n.resolve.onclick();assert.match(n.metrics.innerHTML,/>1<\/h1>/);assert.equal(n.resolve.disabled,true);assert.match(n.feedback.textContent,/Simulated intervention recorded/);
});
test('selecting another initiative updates detail and reset restores state',()=>{
 const n=harness();n.project.onchange({target:{value:'1'}});assert.match(n.detail.innerHTML,/Member Experience/);n.resolve.onclick();assert.match(n.metrics.innerHTML,/>1<\/h1>/);n.reset.onclick();assert.match(n.metrics.innerHTML,/>2<\/h1>/);
});
test('unblocked initiative disables intervention',()=>{
 const n=harness();n.project.onchange({target:{value:'2'}});assert.equal(n.resolve.disabled,true);
});
