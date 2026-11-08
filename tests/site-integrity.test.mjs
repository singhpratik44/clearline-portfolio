import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.cwd();
const rootFiles=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
const nested=['clearline','lab'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(x=>x.endsWith('.html')).map(x=>path.join(dir,x)));
const content=p=>fs.readFileSync(path.join(root,p),'utf8');

test('every public HTML page can return to the APERTURE hub',()=>{
  for(const file of rootFiles)assert.match(content(file),/src="assets\/aperture-shell\.js"/,file);
  for(const file of nested)assert.match(content(file),/src="\.\.\/assets\/aperture-shell\.js"/,file);
});

test('homepage is a complete navigable index, not a missing bundle mount',()=>{
  const home=content('index.html');
  assert.doesNotMatch(home,/app\.bundle\.js/);
  const projectCards=[...home.matchAll(/<article class="project"[^>]*>/g)];
  assert.equal(projectCards.length,19);
  const links=[...home.matchAll(/href="([^"]+)"/g)].map(x=>x[1]).filter(x=>!x.startsWith('#')&&!/^https?:|^mailto:/.test(x));
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
