import test from "node:test";
import assert from "node:assert/strict";
import {states,contexts,lenses,rankTasks,routeMoment,creativePair,normalizeTask,serializeJournal} from "../assets/moment-engine.mjs";

test("modes and domains provide grounded, non-clinical content",()=>{
  assert.equal(Object.keys(states).length,4);
  assert.equal(Object.keys(contexts).length,5);
  assert.equal(lenses.length,10);
  assert.equal(new Set(lenses.map(l=>l.id)).size,10);
  for (const v of Object.values(states)) assert.ok(v.title&&v.message&&v.gratitude);
});
test("tired mode honors rest rather than productivity",()=>{
 const x=routeMoment({state:"tired",context:"career",tasks:[{id:"a",title:"Send reply",effort:5,importance:3}]});
 assert.equal(x.taskId,null);
 assert.match(x.action,/rest|hydrate|support/i);
 assert.equal(x.restIsValid,true);
});
test("overload routes to a high-value, small action",()=>{
 const tasks=[{id:"large",title:"Build everything",effort:30,importance:3},{id:"small",title:"Prepare one sketch",effort:5,importance:3}];
 const x=routeMoment({state:"overwhelmed",tasks});
 assert.equal(x.taskId,"small");assert.match(x.action,/sketch/);
});
test("done tasks are excluded from recommendations",()=>{
 const x=rankTasks([{id:"done",title:"Already complete",done:true,importance:3,effort:5},{id:"next",title:"A new task",importance:2,effort:15}], "steady");
 assert.equal(x.length,1);assert.equal(x[0].id,"next");
});
test("all task inputs are normalized and no unintended HTML is interpreted",()=>{
 const x=normalizeTask({id:"x",title:"<img src=x onerror=alert(1)>",effort:17,importance:90});
 assert.equal(x.title,"<img src=x onerror=alert(1)>");
 assert.equal(x.effort,15);assert.equal(x.importance,3);
});
test("invalid state and context fall back to a safe decision",()=>{
 const x=routeMoment({state:"INVALID",context:"INVALID",tasks:[]});
 assert.match(x.action,/notice/i);assert.ok(x.gratitude.length>5);
});
test("creative pairs remain distinct and deterministic",()=>{
 for(let n=0;n<200;n++){const [a,b]=creativePair(n);assert.notEqual(a,b);assert.deepEqual(creativePair(n),[a,b])}
});
test("private journal serialization constrains untrusted text",()=>{
 const x=serializeJournal({kind:"<private>",text:"a".repeat(11000),savedAt:"2026-11-11"});
 assert.equal(x.text.length,10000);assert.equal(x.kind,"<private>");assert.equal(x.savedAt,"2026-11-11");
});
