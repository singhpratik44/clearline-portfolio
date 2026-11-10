import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {webcrypto} from "node:crypto";
import {TextEncoder,TextDecoder} from "node:util";
const root=new URL("../",import.meta.url);
const source=fs.readFileSync(new URL("mission-control/core.js",root),"utf8");
const context={globalThis:{crypto:webcrypto,indexedDB:{}},TextEncoder,TextDecoder,atob,btoa,URL,Date};
vm.runInNewContext(source,context,{filename:"mission-control/core.js"});
const C=context.globalThis.ApertureMission;
const demo=()=>C.sample();
test("synthetic mission world is valid, isolated and has connected dependencies",()=>{
 const s=demo();
 assert.equal(s.sample,true);assert.equal(s.projects.length,3);
 assert.equal(s.meetings.length,4);assert.equal(s.tasks.length,8);
 assert.equal(s.proposals.length,1);
 assert.equal(s.proposals[0].status,"pending");
 assert.equal(C.metrics(s,new Date("2026-11-10T08:00:00Z")).blocked>0,true);
 assert.equal(C.chain(s).length,8);
 assert.doesNotThrow(()=>C.normalize(s));
});
test("meeting notes are explicit evidence and can be updated without modifying source",()=>{
 const s=demo();
 const copy=JSON.stringify(s);
 const updated=C.updateMeeting(s,"m-atlas",{agenda:"Evidence first",notes:"Verbatim: trial follow-up review"});
 assert.match(updated.meetings.find(m=>m.id==="m-atlas").notes,/Verbatim/);
 assert.match(C.meetingBrief(updated,"m-atlas"),/Evidence first/);
 assert.equal(JSON.stringify(s),copy);
 assert.ok(updated.events.some(e=>e.kind==="meeting_notes_updated"));
});
test("meeting action is a pending proposal until human review, then a linked local task",()=>{
 const s=C.propose(demo(),{meetingId:"m-atlas",title:"Validate inquiry intake",owner:"Program lead",source:"Recorded meeting note: measure response times",due:"2026-11-18"});
 const q=s.proposals[s.proposals.length-1];
 assert.equal(q.status,"pending");assert.ok(!s.tasks.some(t=>t.proposalId===q.id));
 assert.throws(()=>C.approve(s,q.id,"",true),/reviewer/);
 assert.throws(()=>C.approve(s,q.id,"Owner",false),/approval/);
 const reviewed=C.approve(s,q.id,"Human reviewer",true);
 assert.equal(reviewed.proposals.find(p=>p.id===q.id).status,"approved");
 const task=reviewed.tasks.find(t=>t.proposalId===q.id);
 assert.ok(task);assert.equal(task.meetingId,"m-atlas");
 assert.equal(task.source,q.source);
 assert.equal(reviewed.events.at(-1).kind,"action_approved");
 assert.match(reviewed.events.at(-1).detail,/no external action authorized/);
 assert.throws(()=>C.approve(reviewed,q.id,"Owner",true),/pending/);
});
test("dependency cycles and missing nodes are rejected",()=>{
 const s=demo();
 assert.throws(()=>C.addDependency(s,"t-lead","t-map","Owner"),/Dependency cycle/);
 assert.throws(()=>C.addDependency(s,"t-lead","does-not-exist","Owner"),/distinct existing/);
 const updated=C.addDependency(s,"t-contract","t-lead","Owner");
 assert.ok(updated.tasks.find(t=>t.id==="t-contract").blockedBy.includes("t-lead"));
});
test("blocked work cannot be completed until its prerequisites are done",()=>{
 const s=demo();
 assert.throws(()=>C.status(s,"t-pilot","done","Owner"),/predecessors/);
 const next=C.status(s,"t-lead","done","Owner");
 assert.equal(next.tasks.find(t=>t.id==="t-lead").status,"done");
 const ready=C.metrics(next,new Date("2026-11-10T08:00:00Z"));
 assert.ok(!ready.blockedIds.includes("t-map"));
});
test("overdue and ready work distinguish unknown from blocked",()=>{
 const s=demo();const m=C.metrics(s,new Date("2026-11-20T08:00:00Z"));
 assert.ok(m.overdue>=1);
 assert.ok(m.blocked>=1);
 assert.ok(m.ready>=1);
 assert.equal(m.totalTasks,m.done+m.open);
});
test("private import rejects duplicates and invalid references/cycles",()=>{
 const s=demo();
 assert.throws(()=>C.normalize({...s,projects:[...s.projects,s.projects[0]]}),/duplicate/);
 const bad=JSON.parse(JSON.stringify(s));bad.meetings[0].projectId="p-missing";
 assert.throws(()=>C.normalize(bad),/Unknown meeting project/);
 const huge={...s,events:Array.from({length:1500},(_,i)=>({...s.events[0],id:"evt-"+i}))};
 assert.throws(()=>C.normalize(huge),/oversized/);
});
test("generated meeting ICS is standalone and never transmits or invites",()=>{
 const s=demo();const ics=C.calendarFile(s.meetings[0]);
 assert.match(ics,/BEGIN:VCALENDAR/);assert.match(ics,/BEGIN:VEVENT/);
 assert.match(ics,/DTSTART:20261112T180000Z/);
 assert.match(ics,/END:VCALENDAR/);
 assert.doesNotMatch(ics,/ATTENDEE|ORGANIZER|METHOD:REQUEST/);
});
test("local vault is encrypted with a distinct namespace and decrypts correct passphrase",async()=>{
 const context2={globalThis:{crypto:webcrypto,indexedDB:{}},TextEncoder,TextDecoder,atob,btoa};
 vm.runInNewContext(fs.readFileSync(new URL("mission-control/vault.js",root),"utf8"),context2);
 const V=context2.globalThis.ApertureMissionVault;
 assert.ok(V);
 const envelope=await V.seal(demo(),"very secret mission phrase 2026");
 assert.ok(!JSON.stringify(envelope).includes("ATLAS / Revenue"));
 assert.equal(envelope.cipher,"AES-256-GCM");
 const obj=await V.open(envelope,"very secret mission phrase 2026");
 assert.equal(obj.projects.length,3);
 await assert.rejects(V.open(envelope,"other incorrect mission phrase"),/Wrong passphrase/);
 const vaultJs=fs.readFileSync(new URL("mission-control/vault.js",root),"utf8");
 assert.match(vaultJs,/aperture-mission-control-private-v1/);
 assert.doesNotMatch(vaultJs,/aperture-commercial-4d-private/);
});
test("research contains ten recent dated primary references with honest source statuses",()=>{
 const r=JSON.parse(fs.readFileSync(new URL("mission-control/research.json",root),"utf8"));
 assert.equal(r.studies.length,10);
 assert.equal(new Set(r.studies.map(s=>s.id)).size,10);
 for(const s of r.studies){
  assert.ok(s.date>="2026-07-01"&&s.date<="2026-11-10");
  assert.match(s.url,/^https:\/\/(arxiv\.org|proceedings\.mlr\.press|academic\.oup\.com)\//);
  assert.ok(s.meeting_impact.length>30&&s.caveat.length>30);
 }
 assert.equal(r.discovery_sources.length,9);
 assert.ok(r.discovery_sources.some(x=>x.name==="OpenReview"&&x.status.includes("not ingested")));
});
test("static UI wires every referenced field and has no private user data",()=>{
 const html=fs.readFileSync(new URL("mission-control/index.html",root),"utf8");
 const app=fs.readFileSync(new URL("mission-control/app.js",root),"utf8");
 const loom=fs.readFileSync(new URL("mission-control/loom.js",root),"utf8");
 for(const [name,code] of [["app.js",app],["loom.js",loom]]){
  assert.doesNotThrow(()=>new vm.Script(code),name+" JS syntax");
  const ids=[...code.matchAll(/\$\("([a-z0-9-]+)"\)/gi)].map(m=>m[1]);
  const missing=[...new Set(ids)].filter(id=>!html.includes('id="'+id+'"'));
  assert.deepEqual(missing,[],name+" references missing UI IDs");
 }
 assert.match(html,/CAUSAL LOOM/);
 assert.match(html,/src="\.\/loom\.js"/);
 assert.match(html,/id="meeting-form"/);
 assert.match(html,/id="proposal-form"/);
 assert.match(html,/id="dep-form"/);
 assert.match(html,/id="loom"/);
 assert.doesNotMatch(html,/gouspa\.org|gmail\.com\/mail|parry\.s\.2324|manny\.iloba/i);
 assert.doesNotMatch(app,/https:\/\/gmail\.googleapis\.com|gmail\.send|fetch\(/i);
 assert.match(loom,/fetch\("\.\/research\.json"/);
});
