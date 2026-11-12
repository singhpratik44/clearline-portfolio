/* APERTURE Intelligence Engine v7 — transparent decision summaries, not hidden reasoning.
   Pure deterministic evaluation. No autonomous network, calendar, email or finance actions. */
(function(root){
"use strict";
const QUESTIONS=[
["Intent","What outcome are we optimizing?"],["Context","Which verified local facts matter?"],["Assumptions","What might be incorrect?"],["Constraints","What are the binding limits?"],["Problem","Is this the highest-value problem?"],["Research","What external evidence would change the plan?"],["Alternatives","Which distinct approaches exist?"],["Innovation","What unconventional approach is worth testing?"],["Systems","Which adjacent APERTURE projects benefit?"],["Experience","How can the interface respect human attention?"],["Priority","What is the best safe next step?"],["Decomposition","Which internal subactions can be done?"],["Automation","What can be deterministic?"],["Security","What permission gates apply?"],["Implementation","What concrete artifact should result?"],["Verification","What would independently prove success?"],["Measurement","Which metrics show progress?"],["Learning","What changed from the prior cycle?"],["Futures","What might change across four horizons?"],["Improvement","What next experiment should follow?"]
];
const date=x=>x?x.slice(0,10):"unknown";
function evaluate(raw,previous=null,at=new Date()){
 const C=root.ApertureMission;if(!C)throw Error("Mission core unavailable");
 const s=C.normalize(raw),m=C.metrics(s,at);
 const unresolved=s.tasks.filter(t=>t.status!=="done"),pending=s.proposals.filter(p=>p.status==="pending");
 const blockers=unresolved.filter(t=>m.blockedIds.includes(t.id));
 const overdue=unresolved.filter(t=>t.due&&t.due<date(at.toISOString()));
 const due=unresolved.filter(t=>t.due).sort((a,b)=>a.due.localeCompare(b.due));
 const next=overdue[0]||blockers[0]||due[0]||unresolved[0];
 const projects=s.projects.map(p=>p.name);
 const answers=[
 ["Improve meeting-to-decision-to-task traceability and reduce blocked commitments.", "local"],
 [s.projects.length+" projects; "+s.meetings.length+" meetings; "+s.tasks.length+" tasks; "+pending.length+" pending proposals.", "local"],
 ["Local task statuses and meeting notes are user-entered, not independently verified.", "caution"],
 ["No external writes, no credential persistence, no paid-model dependency; review required.", "policy"],
 [blockers.length+" blocked tasks and "+overdue.length+" overdue tasks suggest execution visibility is the immediate bottleneck.", "local"],
 ["Research register is curated, not a continuously verified feed. Validate new papers before changing practices.", "gap"],
 ["A: add more dashboards; B: evidence-linked decision ledger; C: external calendar automation. Prefer B until secure provider identity is available.", "hypothesis"],
 ["Use a causal graph with a 20-gate decision ledger and compare cycles rather than generate longer plans.", "hypothesis"],
 ["Reusable ledger can inform Commercial 4D, Career OS and learning programs; cross-project syncing is not implemented.", "hypothesis"],
 ["Keep a calm summary, progressive detail, accessible text, and optional exports.", "design"],
 [next?"Review "+next.title+" with owner "+(next.owner||"unassigned")+".":"Create a first project, meeting and explicit decision.", "local"],
 ["Compute status → inspect evidence → compare alternatives → draft proposal → human review → verify task outcome.", "plan"],
 ["Counts, blocker graph, overdue detection, deduplication and cycle diffs require zero model calls.", "verified"],
 ["Internal computation only. No outbound messages, calendar writes, money movement or implied authorization.", "policy"],
 ["Produce a versioned 20-decision snapshot and a downloadable audit-friendly cycle comparison.", "plan"],
 ["Run deterministic unit tests, mobile/desktop browser QA and published asset checks.", "plan"],
 ["Track open, blocked, overdue, pending, completed, and evidence coverage; do not claim causation from counts.", "local"],
 [previous?"Compare current counters with the last imported/evaluated snapshot; differences are observations, not proof of improvement.":"Cycle 001 baseline: no previous snapshot. Future learning requires later observed outcomes.", "local"],
 ["30d: close blockers; 90d: repeatable reviews; 1y: consented integrations; 5y: portable interoperable decision records. These are scenarios, not forecasts.", "scenario"],
 ["Next experiment: resolve one verified blocker and compare completion and evidence quality in the next cycle.", "hypothesis"]
 ];
 const metrics={projects:s.projects.length,meetings:s.meetings.length,tasks:s.tasks.length,done:s.tasks.filter(t=>t.status==="done").length,blocked:blockers.length,overdue:overdue.length,pending:pending.length,withSource:s.tasks.filter(t=>t.source&&t.source!=="Manual operator entry").length};
 const delta=previous&&previous.metrics?Object.fromEntries(Object.keys(metrics).map(k=>[k,metrics[k]-(Number(previous.metrics[k])||0)])):null;
 const decisions=QUESTIONS.map(([name,question],i)=>({number:i+1,name,question,answer:answers[i][0],evidenceStatus:answers[i][1],confidence:answers[i][1]==="verified"||answers[i][1]==="policy"?"high":answers[i][1]==="local"?"medium":"low"}));
 return {schema:"aperture-decision-cycle-v1",cycleId:"LOCAL-"+at.toISOString().replace(/\D/g,"").slice(0,14),timestamp:at.toISOString(),project:"Meeting Command Center",sample:s.sample,objective:"Build",budget:"minimal",metrics,delta,decisions,alternatives:[{name:"More dashboards",outcome:"defer",reason:"Adds display without stronger evidence."},{name:"Decision ledger",outcome:"selected",reason:"Reuses deterministic local engine; immediately testable."},{name:"External automation",outcome:"defer",reason:"Requires explicit provider consent and isolated production security."}],subactions:[{name:"Inspect current meeting/task graph",status:"computed"},{name:"Calculate blockers and overdue work",status:"computed"},{name:"Compare previous cycle metrics",status:delta?"computed":"baseline unavailable"},{name:"Generate decision and futures summaries",status:"computed"},{name:"External messages or calendar changes",status:"not authorized"}],futureHorizons:[{horizon:"30 days",scenario:"Improve owner accountability and clear verified blockers",validation:"Review task completion and provenance"},{horizon:"90 days",scenario:"Repeat decision reviews across projects",validation:"Compare repeated cycle snapshots"},{horizon:"1 year",scenario:"Integrate consented providers with durable identity",validation:"Security and provider contract tests"},{horizon:"5 years",scenario:"Portable, interoperable decision provenance",validation:"Independent portability and governance audit"}],limitations:["No independent validation of local task statuses","No automatic research retrieval or external actions","Browser-generated cycle must be exported for durable history"],projectNames:projects};
}
function validate(record){
 if(!record||record.schema!=="aperture-decision-cycle-v1"||!Array.isArray(record.decisions)||record.decisions.length!==20)throw Error("Invalid 20-decision cycle.");
 if(!record.metrics||typeof record.timestamp!=="string"||!Number.isFinite(Date.parse(record.timestamp)))throw Error("Invalid cycle metrics or timestamp.");
 return record;
}
root.ApertureDecisionCycle={evaluate,validate,questions:QUESTIONS.map(x=>x[0])};
})(typeof globalThis!=="undefined"?globalThis:this);
