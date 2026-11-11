import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {webcrypto, randomBytes} from "node:crypto";
import {gzipSync,gunzipSync} from "node:zlib";

// Synthetic nonproduction fixtures only. Never use or log live access tokens.
const encode=b=>Buffer.from(b).toString("base64url");
const decode=s=>Buffer.from(s,"base64url");
async function fixture(id,course,{compressed=true}={}){
 const raw=randomBytes(32),iv=randomBytes(12);
 const key=await webcrypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt"]);
 const payload=Buffer.from(JSON.stringify(course));
 const plaintext=compressed?gzipSync(payload):payload;
 const encrypted=await webcrypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:new TextEncoder().encode(id)},key,plaintext);
 return {key:encode(raw),pack:{schema:"clearline-course-v1",alg:"AES-256-GCM",codec:compressed?"gzip":"identity",nonce:encode(iv),ciphertext:encode(encrypted)}};
}
async function openFixture(id,key,pack){
 if(pack.schema!=="clearline-course-v1"||pack.alg!=="AES-256-GCM")throw Error("Unrecognized course format");
 const imported=await webcrypto.subtle.importKey("raw",decode(key),{name:"AES-GCM"},false,["decrypt"]);
 const decrypted=await webcrypto.subtle.decrypt({name:"AES-GCM",iv:decode(pack.nonce),additionalData:new TextEncoder().encode(id)},imported,decode(pack.ciphertext));
 const decoded=pack.codec==="identity"?Buffer.from(decrypted):gunzipSync(Buffer.from(decrypted));
 const course=JSON.parse(decoded.toString("utf8"));
 if(course.id!==id||!Array.isArray(course.lessons))throw Error("Unexpected course data");
 return course;
}
const ids=["roblox","minecraft","indie"];
test("All three synthetic pathway keys unlock their own gzip packs",async()=>{
 for(const id of ids){const course={id,lessons:[{title:"Synthetic fixture only"}]};const f=await fixture(id,course);assert.deepEqual(await openFixture(id,f.key,f.pack),course)}
});
test("Synthetic bundle unlocks three separate pathways",async()=>{
 const entries=await Promise.all(ids.map(async id=>({id,...await fixture(id,{id,lessons:[{title:id}]})})));
 const unlocked=await Promise.all(entries.map(e=>openFixture(e.id,e.key,e.pack)));
 assert.deepEqual(unlocked.map(c=>c.id),ids);
});
test("Wrong key, wrong pathway and corrupted ciphertext fail closed",async()=>{
 const f=await fixture("roblox",{id:"roblox",lessons:[]});
 await assert.rejects(openFixture("roblox",encode(randomBytes(32)),f.pack));
 await assert.rejects(openFixture("minecraft",f.key,f.pack));
 await assert.rejects(openFixture("roblox",f.key,{...f.pack,ciphertext:encode(randomBytes(60))}));
});
test("Invalid course schema and ID fail closed",async()=>{
 const f=await fixture("roblox",{id:"minecraft",lessons:[]},{compressed:false});
 await assert.rejects(openFixture("roblox",f.key,f.pack),/Unexpected course data/);
 await assert.rejects(openFixture("roblox",f.key,{...f.pack,schema:"unknown"}),/Unrecognized course format/);
});
test("Production reader keeps the tested cryptographic invariants",()=>{
 const reader=fs.readFileSync("code-the-game/learn/index.html","utf8");
 assert.match(reader,/additionalData:new TextEncoder\(\)\.encode\(id\)/);
 assert.match(reader,/AES-GCM/);
 assert.match(reader,/DecompressionStream\("gzip"\)/);
 assert.match(reader,/course\.id!==id/);
 assert.match(reader,/failed\.push\(id\)/);
});
