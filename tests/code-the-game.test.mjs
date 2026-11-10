import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const read=(path)=>fs.readFileSync(path,"utf8");
const reader=read("code-the-game/learn/index.html");
const studio=read("code-the-game/learn/studio-v3.js");
const store=read("code-the-game/index.html");
const packs=["roblox","minecraft","indie"].map(id=>({id,data:JSON.parse(read("code-the-game/packs/"+id+".json"))}));
const scripts=[...reader.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(x=>x.trim());
test("Reader and interactive studio scripts are syntactically valid",()=>{
  assert.ok(scripts.length>0);
  scripts.forEach(s=>new vm.Script(s,{filename:"reader-inline.js"}));
  new vm.Script(studio,{filename:"studio-v3.js"});
});
test("All purchased pathways retain encrypted packs and link-based unlock",()=>{
  assert.match(reader,/openPack\(id,params\.get\(id\)\)/);
  assert.match(reader,/crypto\.subtle\.decrypt/);
  assert.match(reader,/studio-v3\.js/);
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
