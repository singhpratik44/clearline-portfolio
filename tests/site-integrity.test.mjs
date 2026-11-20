import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.cwd();
const rootFiles=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
const nested=['clearline','lab'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(x=>x.endsWith('.html')).map(x=>path.join(dir,x)));
const content=p=>fs.readFileSync(path.join(root,p),'utf8');

test('standalone public pages have document structure, while shared-shell pages retain navigation',()=>{
  for(const file of rootFiles){
    const source=content(file);
    assert.match(source,/<html(?:\s|>)/i,file);
    assert.match(source,/<title>[^<]+<\/title>/i,file);
  }
  for(const file of nested)assert.match(content(file),/src="\.\.\/assets\/aperture-shell\.js"/,file);
  assert.match(content('sports-os/index.html'),/href="\.\.\/index\.html"/);
});

test('homepage is a complete navigable index, not a missing bundle mount',()=>{
  const home=content('index.html');
  assert.doesNotMatch(home,/app\.bundle\.js/);
  assert.match(home,/<main\b[^>]*id="main"/i,'Homepage must provide its main landmark');
  assert.match(home,/class="flagship-directory"/,'Homepage must expose the portfolio directory');
  assert.match(home,/href="#area-sports"/,'Directory must link to the sports section');
  assert.match(home,/APERTURE Athlete Command Center/,'Sports destination must be identified in the homepage');
  assert.match(home,/href="athlete-os\//,'Homepage must link to Athlete OS');
  const links=[...home.matchAll(/href="([^"]+)"/g)].map(x=>x[1]).filter(x=>!x.startsWith('#')&&!/^https?:|^mailto:|^tel:|^javascript:/i.test(x));
  for(const link of links){const normalized=decodeURIComponent(link.split(/[?#]/)[0]);const dest=normalized.endsWith('/')?normalized+'index.html':normalized;assert.ok(fs.existsSync(path.join(root,dest)),'Missing homepage link: '+link)}
});

test('shared navigation covers top-level and nested public work',()=>{
  const nav=content('assets/aperture-shell.js');
  new vm.Script(nav,{filename:'assets/aperture-shell.js'});
  for(const target of ['civilization-lab.html','basketball.html','coaching-journey.html','clearline/','lab/','governance.html','hire.html'])assert.ok(nav.includes(target),'Missing nav route '+target);
});

test('homepage search and filter script is valid JavaScript',()=>{
  const scripts=[...content('index.html').matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).filter(Boolean);
  assert.ok(scripts.length);
  for(const script of scripts)new vm.Script(script,{filename:'index-inline.js'});
});


test('mission operations work sample is documented, syntactically valid and explicitly sandboxed',()=>{
 const page=content('mission-operations.html');
 const scripts=[...page.matchAll(/<script>([\s\S]*?)<\/script>/g)];
 assert.equal(scripts.length,1,'One self-contained app script');
 new vm.Script(scripts[0][1],{filename:'mission-operations.html'});
 assert.match(page,/Simulation only/);
 assert.match(page,/URL\.createObjectURL/);
 assert.match(page,/if\(!feasible\(\)\)/);
 assert.match(content('README.md'),/\[Launch Mission Operations\]\(https:\/\/singhpratik44\.github\.io\/clearline-portfolio\/mission-operations\.html\)/);
});
