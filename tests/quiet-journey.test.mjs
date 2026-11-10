import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
const html=readFileSync(new URL("../prayer/three-year/index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../prayer/three-year/app.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../prayer/three-year/styles.css",import.meta.url),"utf8");
const crypto=readFileSync(new URL("../prayer/three-year/vault-crypto.mjs",import.meta.url),"utf8");
const original=readFileSync(new URL("../prayer/index.html",import.meta.url),"utf8");
test("standalone journey scripts parse",()=>{ assert.doesNotThrow(()=>new Script(js.replace(/^import [^\n]+\n/gm,""),{filename:"prayer/three-year/app.js"})); });
test("three-year journey has accessible timeline and all core controls",()=>{
  for(const token of ['id="universe"','id="monthSlider"','id="duration"','value="36" selected','id="focus"','id="startDate"','id="vaultOpen"','id="journalText"','id="exportVault"','id="importVault"','id="eraseVault"','id="saveEntry"','id="treeMode"','id="spiralMode"','id="livingTree"']) assert.ok(html.includes(token),"Missing "+token);
  assert.equal((js.match(/\["/g)||[]).length>36,true);
  assert.ok(js.includes("const CHAPTERS = ["));
  assert.ok(js.includes("setMonth("));
});
test("privacy by default: local encrypted vault with strict CSP",()=>{
  assert.match(html,/connect-src 'none'/);
  assert.match(html,/script-src 'self'/);
  assert.match(crypto,/PBKDF2/);assert.match(crypto,/AES-GCM/);assert.match(crypto,/250000/);
  assert.match(crypto,/crypto\.getRandomValues/);
  assert.match(js,/vaultPassword/);
  assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|firebase|supabase/i);
  assert.doesNotMatch(html,/<script[^>]+src="https?:\/\//i);
  assert.doesNotMatch(html,/<link[^>]+href="https?:\/\//i);
});
test("original prayer journey links to the new journey without removing original functionality",()=>{
  assert.match(original,/href="\.\/three-year\/"/);
  assert.match(original,/id="commitment"/);
  assert.match(original,/id="journey"/);
});
test("responsive and reduced-motion accommodations present",()=>{
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(css,/max-width:700px/);
  assert.match(css,/\.mobile-nav/);
  assert.match(css,/\.tree-present/);
  assert.match(js,/IntersectionObserver/);
  assert.match(html,/class="skip"/);
  assert.match(js,/visibilitychange/);
  assert.match(html,/type="module" src="\.\/app\.js"/);
  assert.match(js,/import .*vault-crypto\.mjs/);
  assert.match(js,/import .*daily-ui\.mjs/);
  assert.match(html,/id="daily"/);
  assert.match(html,/id="dailyRecord"/);
  assert.match(html,/id="dailySource"/);
});
