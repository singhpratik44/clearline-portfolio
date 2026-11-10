import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const main=read('learning/index.html');
const universe=read('learning/universe/index.html');
const uJs=read('learning/universe/universe.js');
const research=read('learning/research/index.html');
const review=read('learning/research/TEN_STUDIES_2026.md');
const portal=read('learning/portal/index.html');
const catalog=read('learning/catalog/index.html');
const studio=read('learning/studio/index.html');
const pJs=read('learning/portal/portal.js');
const cfg=read('learning/portal/config.js');

test('review contains ten distinct recent source studies and honest provenance',()=>{
 const links=[...research.matchAll(/<article class="paper"[\s\S]*?<a href="(https:\/\/[^"]+)"/g)].map(m=>m[1]);
 assert.equal(links.length,10,'expected exactly 10 paper cards');
 assert.equal(new Set(links).size,10,'source URLs must be unique');
 assert.equal(links.filter(x=>x.startsWith('https://arxiv.org/abs/')).length,9);
 assert.equal(links.filter(x=>x.startsWith('https://link.springer.com/article/')).length,1);
 assert.match(review,/Research preprint/);
 assert.match(review,/not a randomized effectiveness trial/i);
 assert.match(review,/not a systematic review/i);
 assert.doesNotMatch(research,/guarantees.*results/i);
});
test('all APERTURE learning entry points provide research provenance',()=>{
 assert.match(main,/href="research\/"/);
 assert.match(universe,/href="\.\.\/research\/"/);
 assert.match(portal,/href="\.\.\/research\/"/);
 assert.match(catalog,/href="\.\.\/research\/"/);
 assert.match(studio,/href="\.\.\/research\/"/);
});
test('professional styles are included, and existing Stripe button is preserved',()=>{
 assert.match(main,/class="ap-quality"/);
 assert.match(main,/product-ui\.css/);
 assert.match(catalog,/class="ap-quality"/);
 assert.match(studio,/class="ap-quality"/);
 assert.match(universe,/product-ui\.css/);
 assert.match(portal,/product-ui\.css/);
 assert.match(main,/buy_btn_1Ua6avRo2jpgx3bldwAjYy0p/);
 assert.ok(read('learning/product-ui.css').length>1000);
 assert.ok(read('learning/universe/product-ui.css').length>1000);
 assert.ok(read('learning/portal/product-ui.css').length>1000);
});
test('all dynamic learning universe selectors exist, dependencies mode is operable',()=>{
 const ids=[...universe.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,'no duplicate IDs');
 const referenced=[...uJs.matchAll(/\$\("([^"]+)"\)/g)].map(m=>m[1]);
 for(const id of referenced)assert.ok(ids.includes(id),'missing universe selector '+id);
 assert.match(universe,/id="toggle-dependencies"/);
 assert.match(universe,/id="dependency-links"/);
 assert.match(uJs,/foundations=!state\.foundations/);
 assert.match(uJs,/requestRender\(\)/);
 assert.doesNotThrow(()=>new Function(uJs));
});
test('secure portal remains fail-closed; examples remain labelled fictional',()=>{
 assert.match(cfg,/enabled:\s*false/);
 assert.match(portal,/id="setup-panel"/);
 assert.match(portal,/FICTIONAL LEARNER/);
 assert.match(portal,/NOT ACTUALLY VERIFIED/);
 assert.match(portal,/No actual student work/);
 assert.doesNotThrow(()=>new Function(pJs));
});
