import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root=process.cwd();
const content=p=>fs.readFileSync(path.join(root,p),"utf8");
const page=content("center/index.html");

test("The Center has a complete accessible free entry point",()=>{
  assert.match(page,/<html lang="en">/);
  assert.match(page,/<meta name="viewport"/);
  assert.match(page,/<main id="main">/);
  assert.match(page,/href="#main"/);
  assert.match(page,/prefers-reduced-motion:reduce/);
  assert.match(page,/No sign-in/);
  assert.match(page,/No paid access to prayer/);
  assert.match(page,/No spiritual score/);
  assert.match(page,/aria-live="polite"/);
  assert.match(content("index.html"),/href="center\/"/);
  assert.match(content("assets/aperture-shell.js"),/\["The Center","center\/"\]/);
});

test("all ten initiatives connect to concrete work and valid local project routes",()=>{
  const ids=[...page.matchAll(/class="mission" data-id="([^"]+)"/g)].map(x=>x[1]);
  const expected=["education","network","funding","sports","coding","gifts","experience","confidence","plugin","commerce"];
  assert.deepEqual(ids,expected);
  const scripts=[...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
  assert.equal(scripts.length,1);
  new vm.Script(scripts[0],{filename:"center/index.html"});
  const routes=["coding/","partnerships/","invest.html","basketball.html","gifts/","experience/","chatgpt-gift-studio/public/","shop/","prayer/start/","prayer/"];
  for(const route of routes){
    const target=route.endsWith("/")?route+"index.html":route;
    assert.ok(fs.existsSync(path.join(root,target)),"Missing project: "+route);
  }
  assert.match(page,/Do not claim directory approval/);
  assert.match(page,/Never sell divine favor/);
});

test("distinct optional faith lenses never replace the inclusive default",()=>{
  assert.match(page,/value="shared"/);
  assert.match(page,/value="sikh"/);
  assert.match(page,/value="christian"/);
  assert.match(page,/https:\/\/sgpc.net\/sikhism\/basic-articles\//);
  assert.match(page,/www.biblegateway.com\/passage/);
  assert.match(page,/No personal inputs or choices are sent to a server/);
  assert.doesNotMatch(page,/localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/);
});