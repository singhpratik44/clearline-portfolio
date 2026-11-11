import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=(path)=>fs.readFileSync(path,"utf8");
const reader=read("code-the-game/learn/index.html");
const studio=read("code-the-game/learn/studio-v3.js");
const other=read("code-the-game/learn/other-labs.js");
const arcade=read("code-the-game/playground/index.html");
const store=read("code-the-game/index.html");
const support=read("code-the-game/help/index.html");
const start=read("code-the-game/start/index.html");
const packs=["roblox","minecraft","indie"].map(id=>({id,data:JSON.parse(read("code-the-game/packs/"+id+".json"))}));
const scripts=[...reader.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(x=>x.trim());
test("Reader and interactive studio scripts are syntactically valid",()=>{
  assert.ok(scripts.length>0);
  scripts.forEach(s=>new vm.Script(s,{filename:"reader-inline.js"}));
  new vm.Script(studio,{filename:"studio-v3.js"});
  new vm.Script(other,{filename:"other-labs.js"});
  for(const script of [...arcade.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean))new vm.Script(script,{filename:"arcade.js"});
});
test("All purchased pathways retain encrypted packs and link-based unlock",()=>{
  assert.match(reader,/openPack\(id,params\.get\(id\)\)/);
  assert.match(reader,/crypto\.subtle\.decrypt/);
  assert.match(reader,/studio-v3\.js/);
  assert.match(reader,/other-labs\.js/);
  assert.match(reader,/createMissionBrief\(c,course,state\.lesson\)/);
  assert.match(reader,/ClearlineStudioV3\?\.render/);
  for(const {id,data} of packs){
    assert.equal(data.alg,"AES-256-GCM",id);
    assert.equal(data.schema,"clearline-course-v1",id);
    assert.match(data.nonce,/^[A-Za-z0-9_-]+$/);
    assert.ok(data.ciphertext.length>2000,id);
    assert.doesNotMatch(reader,new RegExp(data.ciphertext.slice(0,30)));
  }
});
test("Roblox has six distinct missions with explicit engine testing",()=>{
  assert.equal((studio.match(/"Debounce"|"Hazards"|"Checkpoints"|"Coins"|"Tweens"|"Finish gate"/g)||[]).length,6);
  assert.match(studio,/Verify in Roblox Studio/);
  assert.match(studio,/Self-reported test only/);
  assert.match(reader,/Mission 6/);
});
test("All 20 lessons have pathway-specific practice components",()=>{
  assert.match(other,/ClearlineOtherLabs/);
  assert.match(other,/Minecraft Education/);
  assert.match(other,/Godot 4/);
  assert.match(reader,/ClearlineOtherLabs\?\.render/);
});
test("Arcade contains keyboard and touch controls and a verifiably reachable finish",()=>{
  assert.match(arcade,/data-move="up"/);
  assert.match(arcade,/ArrowLeft/);
  assert.match(arcade,/COLLISION/);
  assert.match(arcade,/CHECKPOINT/);
  assert.match(arcade,/VICTORY/);
  assert.match(arcade,/model\.gems\.size===3/);
});
test("Storefront explicitly discloses requirements and no live sessions",()=>{
  assert.match(store,/No live coding sessions/);
  assert.match(store,/Minecraft Education with Code Builder/);
  assert.match(store,/code-the-game/);
  assert.match(store,/stripe\.com/);
});
test("Paid access keys are not embedded in public source",()=>{
  for(const key of ["aXYpgTcTiNCI8RFvlPoSj8ZXvqGNs0eTwR0zF_tF-3Q","uJIsSZ8WBq4_NXg93boGrXm24avJl87ASLpAyu9CxOg"]){
    assert.ok(!reader.includes(key)&&!studio.includes(key));
  }
});

test("Every advertised paid course has its exact live checkout destination",()=>{
  for(const u of ["14A5kFboG8wc7fSgIx6kg00","3cIbJ3dwO27O6bObod6kg01","dRmeVf0K2aEk0RufEt6kg02","cNi8wR78q27OcAc9g56kg03"]){assert.ok(store.includes("https://buy.stripe.com/"+u),u)}
});
test("Buyers can find purchase help, software prerequisites and free examples",()=>{
  assert.match(store,/href="help\//);
  assert.match(support,/lost the link/i);
  assert.match(support,/refund requests/i);
  assert.match(support,/Minecraft Education with Code Builder/i);
  assert.match(start,/Roblox Studio/);
  assert.match(start,/Godot 4/);
  assert.match(store,/href="start\//);
});

test("Store has working ecommerce affordances and honest fulfillment disclosures",()=>{
 const page=read("code-the-game/index.html");
 for(const id of ['id="search"','id="sort"','id="products"','id="cartBtn"','id="drawer"','data-filter="roblox"','data-filter="minecraft"','data-filter="godot"','data-filter="bundle"','data-save="roblox"','data-save="bundle"'])assert.ok(page.includes(id),id);
 for(const amount of ["$19","$29","$39","$59"])assert.ok(page.includes(amount),amount);
 assert.match(page,/Stripe-hosted checkout/);
 assert.match(page,/no customer accounts or automatic lost-link recovery/i);
 assert.match(page,/independent engine-version testing is still ongoing/i);
});

test("Detailed product pages are linked, accurately priced and include fulfillment guidance",()=>{
 const store=read("code-the-game/index.html");
 for(const [slug,price,checkout] of [["roblox",19,"14A5kFboG8wc7fSgIx6kg00"],["minecraft",29,"3cIbJ3dwO27O6bObod6kg01"],["godot",39,"dRmeVf0K2aEk0RufEt6kg02"]]){
  const page=read("code-the-game/"+slug+"/index.html");
  assert.ok(store.includes('href="'+slug+'/'),slug+" catalog link");
  assert.ok(page.includes("$"+price),slug+" price");
  assert.ok(page.includes("https://buy.stripe.com/"+checkout),slug+" checkout");
  assert.match(page,/Required software:/);
  assert.match(page,/refund requests are reviewed individually/i);
  assert.match(page,/independently tested/i);
 }
});

test("Bundle and privacy pages are published and reachable from catalog",()=>{
 const bundle=read("code-the-game/bundle/index.html");
 const privacy=read("code-the-game/privacy/index.html");
 const shop=read("code-the-game/index.html");
 assert.match(shop,/href="bundle\//);
 assert.match(shop,/href="privacy\//);
 assert.match(bundle,/\$59/);
 assert.match(bundle,/20 WRITTEN LESSONS/);
 assert.match(bundle,/https:\/\/buy\.stripe\.com\/cNi8wR78q27OcAc9g56kg03/);
 assert.match(bundle,/Minecraft Education with Code Builder/);
 assert.match(privacy,/local storage/);
 assert.match(privacy,/Stripe-hosted checkout/);
 assert.match(privacy,/private URL fragment/);
});

test("Reader handles partial bundle failures without logging private decryption errors",()=>{
 const reader=read("code-the-game/learn/index.html");
 assert.match(reader,/const failed=\[\]/);
 assert.match(reader,/failed\.push\(id\)/);
 assert.match(reader,/Some purchased pathways could not be unlocked/);
 assert.doesNotMatch(reader,/console\.error\("Course unlock failed for"/);
});
