/* APERTURE COMMERCIAL 4D • Deterministic decision-ready commercial plan.
 * No fetch, storage, DOM, model inference, sending or external side effects.
 * Deliberately distinguishes observed contract state from hypothesized revenue.
 */
(function(root){
"use strict";
const TYPES={
 partnership:{
  intent:"Test a permissioned referral or strategic partnership without suggesting that an agreement already exists.",
  milestones:[
   ["Discover", "Define partner ICP, decision owner, authorized scope, attribution model and written outreach restrictions.", "Counterparty response, approved contact map, proposed referral definitions"],
   ["Design", "Request signed commercial terms and consent procedures; draft one narrowly defined counterfactual pilot.", "Proposed agreement, approved messaging, opt-in and attribution test plan"],
   ["Validate", "Run only a separately approved partner test; reconcile legitimate leads, enrollments, payment rights and operational load.", "Approved test results, conversion ledger, actual invoice and payment evidence"]
  ],
  hard:["Written partner agreement","Partner approval for external outreach","Consent and attribution rules","Named referral and fulfillment owners"]
 },
 fractional_delivery:{
  intent:"Translate an implementation opportunity into a bounded, measurable delivery contract.",
  milestones:[
   ["Discover","Identify the customer-owned pain, implementation dependencies, baseline, constraints and accountable sponsor.","Meeting notes, approved baseline, project stakeholders"],
   ["Design","Define statement of work, acceptance gates, access boundaries, staffing and weekly release checkpoints.","SOW, budget, role ownership, evaluation set, test plan"],
   ["Validate","Execute only after separately signed authorization; compare delivered milestones to approved acceptance criteria.","Acceptance results, change approvals, verified client handoff"]
  ],
  hard:["Counterparty-approved scope/SOW","Access permissions and privacy controls","Delivery owner and capacity","Signed fee and acceptance terms"]
 },
 consulting:{
  intent:"Establish an implementation-focused paid consulting offer using measurable client outcomes.",
  milestones:[
   ["Discover","Obtain a buyer-verified operating problem, trusted financial baseline and decision maker.","Discovery notes, source KPI definitions, economic sponsor"],
   ["Design","Price the consulting scope, separate advisor tasks from implementation and validate labor and delivery costs.","Written proposal, cost assumptions, baseline measurement plan"],
   ["Validate","Execute a client-authorized plan and evaluate actual result against prior period and a simple baseline.","Client approval, outcomes register, written renewal decision"]
  ],
  hard:["Client-verified business problem","Signed commercial SOW","Owner and staffing allocation","Baseline and evaluation agreement"]
 },
 school_contract:{
  intent:"Design a school or youth-program contract with procurement and safety controls.",
  milestones:[
   ["Discover","Align with authorized school leader on program need, students served and measured outcomes.","School sponsor, procurement criteria, site requirements"],
   ["Design","Develop safeguarding, instructor staffing, insurance, pricing and attendance reporting proposal.","Site-approved scope, vendor requirements, privacy plan"],
   ["Validate","Deliver only under approved school agreement; measure attendance and learning/program outcomes responsibly.","Executed agreement, family consent policy, actual invoice evidence"]
  ],
  hard:["Authorized school buyer","Vendor/procurement clearance","Safeguarding and privacy rules","Signed program terms","Delivery-staff availability"]
 },
 paid_role:{
  intent:"Validate a paid role before treating job-posting compensation as contracted revenue.",
  milestones:[
   ["Discover","Confirm interview, actual role/site, hourly or contract rate and schedule directly with employer.","Original requisition, employer reply, calendar confirmation"],
   ["Design","Establish work authorization, onboarding requirements, scheduling and written rate; compare competing assignments.","Offer terms, location, shifts, travel and employment classification"],
   ["Validate","Complete agreed onboarding and obtain actual verified hours and pay schedule.","Offer, submitted timesheets, paystub/invoice"]
  ],
  hard:["Employer confirmation","Written compensation rate","Work location and schedule","Onboarding clearance"]
 },
 other:{
  intent:"Determine whether a commercial inquiry is qualified and appropriate to pursue.",
  milestones:[
   ["Discover","Identify the counterparty, decision owner, legitimate need and evidence.","Message, inquiry type, decision maker"],
   ["Design","Propose a measurable, priced scope under stated constraints.","Offer, approval requirements, source assumptions"],
   ["Validate","Verify signed agreement and measured outcomes; keep all external action human-controlled.","Signed terms, recorded outcomes"]
  ],
  hard:["Identity and authority","Source evidence","Agreed scope and price","Human approval"]
 }
};
const STAGES=["draft","outbound","auto_reply","responded","meeting_offered","screening_confirmed","negotiating","contracted","closed_lost","delivery_failed"];
const DEFAULT={fee:null,probability:null,directCost:null,acquisitionCost:null,deliveryHours:null,capacityHours:null,scope:"",metric:"",reviewer:"",permissionConfirmed:false,capacityConfirmed:false};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function num(v,min,max,name){
 if(v===null||v===undefined||v==="")return null;
 const n=Number(v);
 if(!Number.isFinite(n)||n<min||n>max)throw Error(name+" must be between "+min+" and "+max+".");
 return n;
}
function string(v,max){return typeof v==="string"?v.trim().slice(0,max):"";}
function normalize(a){
 const v={...DEFAULT,...(a&&typeof a==="object"?a:{})};
 return {
  fee:num(v.fee,0,100000000,"Hypothetical fee"),
  probability:num(v.probability,0,1,"Hypothetical win probability"),
  directCost:num(v.directCost,0,100000000,"Hypothetical delivery cost"),
  acquisitionCost:num(v.acquisitionCost,0,100000000,"Hypothetical acquisition cost"),
  deliveryHours:num(v.deliveryHours,0,100000,"Delivery hours"),
  capacityHours:num(v.capacityHours,0,100000,"Available monthly hours"),
  scope:string(v.scope,650),metric:string(v.metric,240),reviewer:string(v.reviewer,100),
  permissionConfirmed:v.permissionConfirmed===true,capacityConfirmed:v.capacityConfirmed===true
 };
}
function sources(row){
 const result=[];
 if(row?.source_url&&row?.evidence)result.push({id:"communication",text:"An original communication is linked and summarized.",verified:true});
 else result.push({id:"communication",text:"Original communication link and cited facts needed.",verified:false});
 if(row?.last_evidence_at)result.push({id:"freshness",text:"Evidence date recorded: "+row.last_evidence_at.slice(0,10),verified:true});
 else result.push({id:"freshness",text:"Evidence timestamp needed.",verified:false});
 if(row?.terms_confirmed===true&&row?.stage==="contracted")
  result.push({id:"agreement",text:"Signed commercial terms are marked verified by the imported record; independently inspect the source.",verified:true});
 else result.push({id:"agreement",text:"No verified signed contract or fee established.",verified:false});
 return result;
}
function stress(a){
 const known=["fee","probability","directCost","acquisitionCost","deliveryHours"].every(k=>a[k]!==null);
 if(!known)return {complete:false,missing:["fee","probability","directCost","acquisitionCost","deliveryHours"].filter(k=>a[k]===null),cases:[],note:"Unverified or missing economic inputs are intentionally not modeled as $0."};
 const factors=[["Downside",.60,1.15],["Base",1,1],["Upside",1.20,.93]];
 const cases=factors.map(([name,pFactor,cFactor])=>{
  const winProbability=clamp(a.probability*pFactor,0,1);
  const contributionIfWon=a.fee-a.directCost*cFactor;
  const expectedContribution=winProbability*contributionIfWon-a.acquisitionCost;
  const expectedHours=winProbability*a.deliveryHours;
  return {name,winProbability,contributionIfWon,expectedContribution,expectedHours,
    contributionPerReservedHour:a.deliveryHours>0?expectedContribution/a.deliveryHours:null};
 });
 return {complete:true,missing:[],cases,note:"Illustrative assumptions, not empirically calibrated probabilities. Cost assumed incurred if won; acquisition cost incurred regardless."};
}
function papers(row,studies,limit=10){
 if(!Array.isArray(studies))return [];
 const definitions={
 s01:["Competing executive alternatives","Hold contradictory allocation recommendations and evaluate their consequences using shared commercial constraints."],
 s02:["Typed enterprise state","Define roles, authority, budgets and dependency edges rather than rely on unstructured agent conversations."],
 s03:["Adaptive planning structure","Select the smallest planning protocol capable of handling this engagement's actual dependencies."],
 s04:["Plan-versus-execution controls","Record deviations between milestone commitments and measured results, then trigger bounded re-planning."],
 s05:["Selective plan repair","When one input changes, amend affected milestones without deleting earlier approved evidence."],
 s06:["Global operating invariants","Check that all concurrent opportunities collectively stay within cash, staffing and permissions."],
 s07:["Explicit authority mediation","Keep an external action behind an independent written approval and evidence gate."],
 s08:["Simple forecast baselines","Compare any sophisticated forecast against a conservative deterministic alternative."],
 s09:["Time-correct evaluation","Backtest only against evidence that existed on the actual decision date."],
 s10:["Least privilege","Restrict integrations to the exact allowed action and required time window."]
 };
 const hay=(String(row?.kind||"")+" "+String(row?.title||"")+" "+String(row?.blockers||"")+" "+String(row?.terms||"")).toLowerCase();
 const boosts={
  s01:/resource|capital|growth|profit|unit|budget/.test(hay)?4:1,
  s02:/enterprise|implementation|delivery|operations|erp/.test(hay)?4:1,
  s03:/complex|architecture|strategy|innovation|program/.test(hay)?3:1,
  s04:/pilot|delivery|operations|implementation|coach|program/.test(hay)?4:2,
  s05:/change|replan|project|pilot|implementation/.test(hay)?3:1,
  s06:/partner|referral|franchise|school|contract|operations/.test(hay)?5:2,
  s07:/contract|commission|permission|referral|approve|consent/.test(hay)?5:2,
  s08:/forecast|revenue|growth|profit|enrollment|sales/.test(hay)?4:1,
  s09:/forecast|outcome|conversion|evaluation|measure/.test(hay)?3:1,
  s10:/referral|data|privacy|consent|access|permission/.test(hay)?4:1
 };
 return studies.filter(s=>s&&typeof s==="object"&&/^https:\/\//.test(s.url||""))
 .map(s=>({id:s.id,title:s.title,date:s.date,source:s.source,url:s.url,
  finding:s.finding||"",limitation:s.publication_type||"Verify publication and benchmark status",
  method:(definitions[s.id]||["Evidence review","Evaluate the primary source before applying a change."])[1],
  mechanism:(definitions[s.id]||["Evidence review"])[0],
  relevance:boosts[s.id]||1,approval:"research_hypothesis_not_commercial_proof"}))
 .sort((a,b)=>b.relevance-a.relevance||a.id.localeCompare(b.id)).slice(0,clamp(Number(limit)||10,1,10));
}
function gates(row,a){
 const status=STAGES.includes(row?.stage)?row.stage:"draft";
 const evidence=!!(row?.source_url&&row?.evidence&&row?.last_evidence_at);
 const terms=!!(row?.terms_confirmed&&status==="contracted");
 const hasOwner=!!a.reviewer;
 const modelComplete=["fee","probability","directCost","acquisitionCost","deliveryHours"].every(k=>a[k]!==null);
 return [
  {key:"evidence",name:"Source evidence",ok:evidence,reason:evidence?"Dated correspondence available.":"A dated and sourced original message is required."},
  {key:"need",name:"Commercial need and scope",ok:!!a.scope,reason:a.scope?"User-defined problem and work scope provided.":"Enter a specific buyer problem and proposed deliverable."},
  {key:"measurement",name:"Success measure",ok:!!a.metric,reason:a.metric?"Measurable success criterion stated.":"Choose one observable commercial metric and baseline."},
  {key:"economics",name:"Model input coverage",ok:modelComplete,reason:modelComplete?"All illustrative finance inputs provided.":"Enter fee, probability, acquisition cost, delivery cost and hours or keep economics unavailable."},
  {key:"agreement",name:"Contract / payment terms",ok:terms,reason:terms?"Imported signed terms marked verified; inspect source.":"No confirmed signed contract; do not claim payment or authorization."},
  {key:"authority",name:"Counterparty permission",ok:a.permissionConfirmed,reason:a.permissionConfirmed?"User states authorization is documented; verify source.":"Commercial counterparty's approval is not recorded."},
  {key:"capacity",name:"Staffing and resources",ok:a.capacityConfirmed,reason:a.capacityConfirmed?"User marks delivery capacity checked.":"Delivery owner/capacity have not been confirmed."},
  {key:"reviewer",name:"Named accountable reviewer",ok:hasOwner,reason:hasOwner?"Planning reviewer named.":"A named decision owner is required."}
 ];
}
function plan(row,raw,studies=[]){
 if(!row||typeof row!=="object"||!row.id)throw Error("Select one source-backed opportunity.");
 const a=normalize(raw),type=TYPES[row.kind]||TYPES.other;
 const steps=type.milestones.map(([name,description,evidence],i)=>({
  phase:name,days:i===0?"0–30":i===1?"31–60":"61–90",
  description,evidence,planned_only:true,owner:a.reviewer||null,
  gate:i===0?"Source and stakeholder verification":i===1?"Owner-approved contract/pilot design":"Actual results and human-approved execution evidence"
 }));
 const g=gates(row,a),studyList=papers(row,studies,10);
 const economics=stress(a);
 return {schema:"aperture-commercial-plan-v2",model_version:"2.0.0",opportunity_id:row.id,
  organization:row.organization,title:row.title,kind:row.kind,stage:row.stage,
  source:{url:row.source_url||null,as_of:row.last_evidence_at||null,status_confidence:row.status_confidence||"unverified"},
  intent:type.intent,buyer_need:a.scope||null,success_metric:a.metric||null,
  assumptions:a,steps,hard_requirements:type.hard.slice(),gates:g,open_gates:g.filter(x=>!x.ok).map(x=>x.key),
  studies:studyList,economics,review_ready:g.filter(x=>["evidence","need","measurement","reviewer"].includes(x.key)).every(x=>x.ok),
  execution_authorized:false,executed_actions:0,realized_revenue:null,evidence_marked_contract_value:row.terms_confirmed&&row.stage==="contracted"?row.contract_value:null,
  caution:"This is planning analysis only. Studies suggest methods, not verified customer outcomes. Simulation estimates are assumptions. No proposal review authorizes any external action."
 };
}
function portfolio(rows,inputs){
 const seen=new Set(),plans=[];
 for(const row of Array.isArray(rows)?rows:[]){
  if(!row?.id||seen.has(row.id))continue;
  seen.add(row.id);
  plans.push(plan(row,inputs?.[row.id]||{},[]));
 }
 const contractCapacity=plans.filter(p=>p.stage==="contracted"&&p.evidence_marked_contract_value!==null&&p.assumptions.deliveryHours!==null).reduce((t,p)=>t+p.assumptions.deliveryHours,0);
 const pipelineDemand=plans.filter(p=>!(p.stage==="contracted"&&p.evidence_marked_contract_value!==null)&&p.assumptions.deliveryHours!==null).reduce((t,p)=>t+p.assumptions.deliveryHours,0);
 const approvedCapacity=plans.map(p=>p.assumptions.capacityHours).filter(n=>n!==null);
 const cap=approvedCapacity.length?Math.min(...approvedCapacity):null;
 return {count:plans.length,contract_capacity_hours:contractCapacity,
  hypothetical_pipeline_hours:pipelineDemand,available_monthly_capacity:cap,
  oversubscribed:cap!==null&&contractCapacity>cap,unknown_hour_coverage:plans.filter(p=>p.assumptions.deliveryHours===null).length,
  risk:cap===null?"Staff delivery capacity not quantified.":contractCapacity>cap?"Signed work exceeds available monthly capacity.":"No current signed-capacity conflict based on supplied assumptions.",
  note:"Hypothetical pipeline demand is not booked delivery; missing data is not zero."};
}
function markdown(p){
 const x=[];
 x.push("# APERTURE | Commercial 90-Day Decision Plan", "", "**"+p.organization+"** — "+p.title);
 x.push("","**Status:** "+p.stage+" · **Source date:** "+(p.source.as_of||"not established")+" · **Execution:** NOT AUTHORIZED");
 x.push("","## Commercial need",p.buyer_need||"Not yet supplied.","","## Objective",p.success_metric||"Not yet supplied.");
 x.push("","## Milestones");
 for(const s of p.steps)x.push("","### Days "+s.days+" — "+s.phase,s.description,"","Required evidence: "+s.evidence,"Gate: "+s.gate);
 x.push("","## Critical requirements",...p.hard_requirements.map(v=>"- "+v));
 x.push("","## Approval gates",...p.gates.map(g=>"- ["+(g.ok?"x":" ")+"] "+g.name+" — "+g.reason));
 x.push("","## Scenario assumptions",...Object.entries(p.assumptions).map(([k,v])=>"- "+k+": "+(v===null?"Not supplied":String(v))));
 if(p.economics.complete)x.push("","## Modelled expected contribution (not actual revenue)",...p.economics.cases.map(s=>"- "+s.name+": "+s.expectedContribution.toFixed(2)+" expected contribution; p="+(s.winProbability*100).toFixed(0)+"%"));
 x.push("","## Research methods — primary source review required",...p.studies.map(s=>"- "+s.title+" ("+s.date+"): "+s.url+" — "+s.method));
 x.push("","## Provenance","Original communication: "+(p.source.url||"Missing"),"",p.caution);
 return x.join("\n");
}
root.AP4DPlan={TYPES,DEFAULT,normalize,stress,papers,gates,plan,portfolio,markdown};
if(typeof module!=="undefined"&&module.exports)module.exports=root.AP4DPlan;
})(typeof globalThis!=="undefined"?globalThis:this);
