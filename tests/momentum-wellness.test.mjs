import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
const ROOT=new URL('../',import.meta.url);
const html=readFileSync(new URL('../wellness/index.html',import.meta.url),'utf8');
test('Momentum storefront has live product paths and all pricing tiers',()=>{
 for(const link of ['https://buy.stripe.com/dRmdRbfEW27OfMo2RH6kg1f','https://buy.stripe.com/28E6oJgJ0dQw7fS1ND6kg1g','https://buy.stripe.com/28E4gB8cu8wcfMo8c16kg1h']) assert.ok(html.includes(link),link);
 for(const amount of ['$7','$17','$27','46','MOMENTUM5']) assert.ok(html.toLowerCase().includes(amount.toLowerCase()),amount);
});
test('Momentum 10 pillars and free preview are visible',()=>{
 for(const id of ['starter-form','result-days','shop','copy-plan'])assert.ok(html.includes('id="'+id+'"'));
 assert.equal((html.match(/class="pillar"/g)||[]).length,10);
 assert.ok(html.includes('Your choices are processed in this browser only'));
});
test('wellness scripts parse without syntax errors',()=>{
 const matches=[...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert.ok(matches.length>=2);
 const runtime=matches[matches.length-1][1];
 assert.doesNotThrow(()=>new Function(runtime));
 assert.ok(!runtime.includes('fetch('));
 assert.ok(!runtime.includes('localStorage'));
 assert.ok(!runtime.includes('sessionStorage'));
});
test('sitemap contains route and public repo does not expose paid content',()=>{
 const sitemap=readFileSync(new URL('../sitemap.xml',import.meta.url),'utf8');
 assert.ok(sitemap.includes('https://singhpratik44.github.io/clearline-portfolio/wellness/'));
 for(const name of ['01_Smart_Plate_7_Day_Planner.pdf','02_21_Day_Momentum_Reset.pdf','03_30_Day_Consistency_Journal.pdf','04_10_Pillar_Wellness_Playbook.pdf','Momentum_Complete_Bundle.zip']) assert.ok(!existsSync(new URL('../wellness/'+name,import.meta.url)),name);
});
test('site describes manual delivery and does not promise specific weight loss',()=>{
 assert.ok(html.includes('one business day'));
 assert.ok(html.includes('We manually verify payment'));
 assert.ok(html.includes('No. We don\'t promise'));
 assert.ok(html.includes('not medical'));
});
