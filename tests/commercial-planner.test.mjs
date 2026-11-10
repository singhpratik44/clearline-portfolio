import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {webcrypto} from "node:crypto";
import {TextEncoder} from "node:util";

const root=new URL("../",import.meta.url);
const context={globalThis:{crypto:webcrypto},TextEncoder,URL};
for(const file of ["commercial-4d/opportunities/plan-engine.js","commercial-4d/opportunities/audit.js"]){
 vm.runInNewContext(fs.readFileSync(new URL(file,root),"utf8"),context,{filename:file});
}
const P=context.globalThis.AP4DPlan,A=context.globalThis.AP4DAudit;
const research=JSON.parse(fs.readFileSync(new URL("commercial-4d/research.json",root),"utf8")).studies;
const row={id:"example-01",organization:"Example Partner",title:"Restricted referral proposal",kind:"partnership",
 stage:"meeting_offered",source_url:"https://mail.google.com/mail/u/0/#all/123abc123abc123a",last_evidence_at:"2026-11-09T22:15:00Z",
 evidence:"A human answered about a meeting.",status_confidence:"confirmed",terms_confirmed:false,contract_value:null,
 blockers:"Counterparty approval required for outreach."};
test("per-opportunity plans are deterministic, sourced, versioned and never action-authorized",()=>{
 const input={scope:"With the partner's permission, refer qualified, consenting families",metric:"Verified qualified referrals accepted by admissions per month",reviewer:"Human reviewer"};
 const p=P.plan(row,input,research);
 assert.equal(p.schema,"aperture-commercial-plan-v2");
 assert.equal(p.steps.length,3);assert.equal(p.review_ready,true);
 assert.equal(p.execution_authorized,false);assert.equal(p.executed_actions,0);
 assert.equal(p.realized_revenue,null);
 assert.ok(p.hard_requirements.some(x=>/approval/i.test(x)));
 assert.equal(p.studies.length,10);
 assert.deepEqual(p,P.plan(row,input,research));
 assert.equal(p.economics.complete,false);
 assert.ok(p.economics.missing.includes("fee"));
});
test("missing economic inputs do not become fabricated zero-dollar ROI",()=>{
 const p=P.plan(row,{scope:"A pilot",reviewer:"Human",metric:"Qualified leads"},research);
 assert.equal(p.economics.complete,false);
 assert.equal(p.economics.cases.length,0);
 assert.equal(p.assumptions.fee,null);
 assert.equal(p.assumptions.probability,null);
});
test("downside/base/upside cases are mathematically reconciled, including acquisition spending",()=>{
 const a=P.normalize({fee:10000,probability:.5,directCost:2500,acquisitionCost:500,deliveryHours:35});
 const s=P.stress(a);
 assert.equal(s.complete,true);assert.equal(s.cases.length,3);
 const base=s.cases[1];
 assert.equal(base.winProbability,.5);
 assert.equal(base.contributionIfWon,7500);
 assert.equal(base.expectedContribution,3250);
 assert.equal(base.expectedHours,17.5);
 assert.ok(s.cases[0].expectedContribution < base.expectedContribution);
 assert.ok(s.cases[2].expectedContribution > base.expectedContribution);
});
test("zero is valid but negatives and impossible probabilities are rejected",()=>{
 const zero=P.normalize({fee:0,probability:0,directCost:0,acquisitionCost:0,deliveryHours:0});
 assert.equal(P.stress(zero).complete,true);
 assert.equal(P.stress(zero).cases[1].expectedContribution,0);
 assert.throws(()=>P.normalize({probability:1.1}),/probability/);
 assert.throws(()=>P.normalize({directCost:-1}),/cost/);
});
test("contracted value is never implied by a meeting or by research",()=>{
 const data={...row,terms_confirmed:true,contract_value:20000};
 const p=P.plan(data,{scope:"Pilot",metric:"Accepted referrals",reviewer:"Human"},research);
 assert.equal(p.verified_revenue,null);
 assert.ok(p.open_gates.includes("agreement"));
 const signed=P.plan({...data,stage:"contracted"}, {scope:"Pilot",metric:"Accepted referrals",reviewer:"Human"},research);
 assert.equal(signed.evidence_marked_contract_value,20000);
 assert.equal(signed.realized_revenue,null);
 assert.ok(!signed.open_gates.includes("agreement"));
 assert.equal(signed.execution_authorized,false);
});
test("each study is primary-linked, relevance-ordered and labeled as a hypothesis",()=>{
 const studies=P.papers(row,research,10);
 assert.equal(studies.length,10);
 for(const s of studies){
  assert.ok(s.date?.startsWith("2026-"));
  assert.match(s.url,/^https:\/\/(?:arxiv\.org|proceedings\.mlr\.press)\//);
  assert.equal(s.approval,"research_hypothesis_not_commercial_proof");
  assert.ok(s.method.length>25);
 }
 for(let i=1;i<studies.length;i++)assert.ok(studies[i-1].relevance>=studies[i].relevance);
});
test("portfolio capacity separates signed commitments and unsigned pipeline",()=>{
 const contracted={...row,id:"contract-1",stage:"contracted",terms_confirmed:true,contract_value:10000};
 const hypothetical={...row,id:"pipeline-1"};
 const p=P.portfolio([contracted,hypothetical],{
  "contract-1":{deliveryHours:90,capacityHours:80},
  "pipeline-1":{deliveryHours:100}
 });
 assert.equal(p.count,2);
 assert.equal(p.contract_capacity_hours,90);
 assert.equal(p.hypothetical_pipeline_hours,100);
 assert.equal(p.available_monthly_capacity,80);
 assert.equal(p.oversubscribed,true);
});
test("markdown exports source, assumptions, approval gates and ten primary papers",()=>{
 const p=P.plan(row,{scope:"Partner referrals",metric:"Monthly attributable enrollments",reviewer:"Human"},research);
 const md=P.markdown(p);
 assert.match(md,/Execution:\*\* NOT AUTHORIZED/);
 assert.match(md,/Research methods/);
 assert.match(md,/Days 0–30/);
 assert.match(md,/Commercial need/);
 assert.equal((md.match(/https:\/\/arxiv.org\/abs\//g)||[]).length,8);
});
test("plan-reviewed event is hash-chained with no send action type",async()=>{
 assert.equal(A.TYPES.has("plan_reviewed"),true);
 assert.equal(A.TYPES.has("gmail_send"),false);
 const p=P.plan(row,{scope:"Referrals",metric:"Monthly attributable enrollments",reviewer:"Human"},research);
 const digest=await A.hash(p);
 const history=await A.append([],"plan_reviewed",{plan_digest:digest,authority:"planning_review_only"});
 assert.equal(await A.verify(history),true);
 assert.equal(history[0].payload.plan_digest,digest);
});
test("commercial planner UI is valid JavaScript and keeps user data off the public bundle",()=>{
 const source=fs.readFileSync(new URL("commercial-4d/opportunities/planner-ui.js",root),"utf8");
 assert.doesNotThrow(()=>new vm.Script(source));
 assert.doesNotMatch(source,/gmail\.send|localStorage|sessionStorage|mailto:/i);
 const html=fs.readFileSync(new URL("commercial-4d/opportunities/index.html",root),"utf8");
 assert.match(html,/id="commercial-plan-studio"/);
 assert.match(html,/src="\.\/plan-engine\.js"/);
 assert.match(html,/src="\.\/planner-ui\.js"/);
 assert.match(html,/Record reviewed plan/);
 assert.doesNotMatch(html,/manny\.iloba|parry\.s\.2324|boominbusinesssolutions\.com/);
});
