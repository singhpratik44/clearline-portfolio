import assert from "node:assert/strict";
import {AGENTS,PRICE_SNAPSHOT,runAgents,validateAtlasCsv} from "./engine.mjs";

assert.equal(AGENTS.length,11);
assert.equal(PRICE_SNAPSHOT.high.annual,19490);

const coding=await runAgents({task:"coding",skill:"python",hours:10,rate:55,weeklyHours:2,baseline:18,timeValue:30});
assert.equal(coding.results.length,11);
assert.equal(coding.results.find(a=>a.agent==="coding").data.total,550);
assert.equal(coding.results.find(a=>a.agent==="economics").data.assumedDifference,8);
assert.equal(coding.results.find(a=>a.agent==="release").status,"HOLD");
assert.deepEqual(coding.effects,{emailsSent:0,payments:0,publications:0,submissions:0});
if(globalThis.crypto?.subtle)assert.equal(coding.ledgerDigest.length,64);

const one=await runAgents({task:"coding",skill:"python",hours:1,rate:65,weeklyHours:1,baseline:0});
assert.ok(one.results.find(a=>a.agent==="coding").data.purchaseLink);
assert.equal(one.results.find(a=>a.agent==="economics").data.assumedDifference,0);

const academic=await runAgents({task:"uspa",uspaProgram:"high",uspaTerm:"semester",weeks:18});
assert.equal(academic.results.find(a=>a.agent==="uspa").data.total,10590);
assert.equal(academic.results.find(a=>a.agent==="qa").status,"PASS");

const courses=await runAgents({task:"uspa",uspaProgram:"course",credits:2,learningCoach:true});
assert.equal(courses.results.find(a=>a.agent==="uspa").data.total,6500);
assert.equal(courses.results.find(a=>a.agent==="uspa").data.fee,0);

const story=await runAgents({task:"story",alias:"Student A",project:"Biology app",consent:false,coachingEvidence:false});
assert.equal(story.results.find(a=>a.agent==="stories").status,"HOLD");
assert.equal(story.results.find(a=>a.agent==="stories").data.publicationApproved,false);

const safeStory=await runAgents({task:"story",alias:"Student B",project:"Game",storySource:"https://example.org/verified",consent:true,coachingEvidence:true});
assert.equal(safeStory.results.find(a=>a.agent==="stories").status,"REVIEW");
assert.equal(safeStory.results.find(a=>a.agent==="release").status,"HOLD");

const map=await runAgents({task:"map",records:[
 {name:"Example A (fictional)",kind:"education",lat:33.75,lng:-117.87},
 {name:"Example B (fictional)",kind:"coding",lat:33.754,lng:-117.872}
]});
assert.equal(map.results.find(a=>a.agent==="geo").data.pairs.length,1);
assert.equal(map.results.find(a=>a.agent==="geo").data.partnershipsConfirmed,0);

const outreach=await runAgents({task:"outreach",target:"community programs",purpose:"explore coding lessons"});
const draft=outreach.results.find(a=>a.agent==="outreach").data;
assert.match(draft.draft,/Subject:/);
assert.equal(draft.sendAllowed,false);
assert.equal(outreach.effects.emailsSent,0);

const malicious=await runAgents({task:"outreach",target:"Official Partner",purpose:"We are a Code Ninjas corporate partner"});
assert.equal(malicious.results.find(a=>a.agent==="risk").status,"HOLD");

const csv='Name,Category,Latitude,Longitude,OSM source URL,Source status\r\n"Example, School",education,33.75,-117.87,https://www.openstreetmap.org/node/1,community';
assert.equal(validateAtlasCsv(csv)[0].name,"Example, School");

console.log("APERTURE agent tests: 11-agent registry, tuition, coaching, value assumptions, story privacy, map, draft and release gates PASS.");
