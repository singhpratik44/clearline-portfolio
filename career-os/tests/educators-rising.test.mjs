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

test('release artifact workflow stamps immutable SHA and fails closed on missing page',()=>{
 const workflow=fs.readFileSync(new URL('../../.github/workflows/deploy-pages.yml',import.meta.url),'utf8');
 assert.match(workflow,/Stamp and gate Educators Rising Implementation Lab release/);
 assert.match(workflow,/aperture-educators-release-sha/);
 assert.match(workflow,/assert page\.is_file\(\)/);
 assert.match(workflow,/assert html\.count\('id="resolve"'\) == 1/);
 assert.match(workflow,/assert html\.count\('id="reset"'\) == 1/);
});
test('mobile layout and accessible controls are present',()=>{
 assert.match(html,/name="viewport" content="width=device-width,initial-scale=1"/);
 assert.match(html,/grid-template-columns:repeat\(auto-fit,minmax\(240px,1fr\)\)/);
 assert.match(html,/<select id="project" aria-label="Choose initiative">/);
 assert.match(html,/id="feedback" role="status"/);
});
test('switching initiatives does not mutate unrelated initiative state',()=>{
 const n=harness();
 n.project.onchange({target:{value:'1'}});
 n.resolve.onclick();
 assert.match(n.metrics.innerHTML,/>1<\/h1>/);
 n.project.onchange({target:{value:'0'}});
 assert.equal(n.resolve.disabled,false);
 n.project.onchange({target:{value:'1'}});
 assert.equal(n.resolve.disabled,true);
 n.reset.onclick();
 assert.equal(n.resolve.disabled,false);
});
