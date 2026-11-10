/* APERTURE Commercial 4D | Private opportunity planner.
   No network calls, storage, mail sends or external writes. Same-origin static script.
   Private records stay in browser memory and can only be exported by explicit click. */
(function(root){
"use strict";
const STAGES=["draft","outbound","auto_reply","responded","meeting_offered","screening_confirmed","negotiating","contracted","closed_lost","delivery_failed"];
const CATEGORIES=["partnership","fractional_delivery","consulting","school_contract","paid_role","other"];
const KEYS=["organization","title","stage","kind","source_url","last_evidence_at","evidence","terms","blockers","proposed_next","status_confidence"];
const LIMIT=150;
function clean(x,max=500){return typeof x==="string"?x.trim().slice(0,max):"";}
function safeURL(s){
 const value=clean(s,1500);
 try{const u=new URL(value);if(u.protocol==="https:"&&["mail.google.com","outlook.office.com","gmail.com"].includes(u.hostname))return u.href;}catch{}
 return "";
}
function stamp(s){const v=clean(s,40);const n=Date.parse(v);return v&&Number.isFinite(n)?new Date(n).toISOString():"";}
function normalize(raw,i){
 if(!raw||typeof raw!=="object"||Array.isArray(raw))throw Error("Invalid opportunity object at row "+(i+1));
 const title=clean(raw.title,160),organization=clean(raw.organization,120);
 if(!title||!organization)throw Error("Row "+(i+1)+" needs an organization and title.");
 const id=clean(raw.id,100)||("op-"+(i+1)),stage=STAGES.includes(raw.stage)?raw.stage:"draft";
 const kind=CATEGORIES.includes(raw.kind)?raw.kind:"other";
 const value=Number(raw.contract_value),hasValue=raw.contract_value!==null&&raw.contract_value!==undefined&&raw.contract_value!==""&&Number.isFinite(value)&&value>=0;
 const evidence=clean(raw.evidence,1400);
 const verifiedTerms=Boolean(raw.terms_confirmed&&evidence&&stage==="contracted"&&hasValue);
 const proposedProb=Number(raw.scenario_probability),hasProb=raw.scenario_probability!==null&&raw.scenario_probability!==undefined&&raw.scenario_probability!==""&&Number.isFinite(proposedProb)&&proposedProb>=0&&proposedProb<=1;
 const source=safeURL(raw.source_url);
 return {
  id,title,organization,stage,kind,source_url:source,
  last_evidence_at:stamp(raw.last_evidence_at),evidence,
  terms:clean(raw.terms,1600),blockers:clean(raw.blockers,1400),proposed_next:clean(raw.proposed_next,900),
  status_confidence:["confirmed","inferred","unverified"].includes(raw.status_confidence)?raw.status_confidence:"unverified",
  // Revenue is never booked because someone replied or proposed a price.
  contract_value:hasValue?value:null,terms_confirmed:verifiedTerms,
  scenario_probability:hasProb?proposedProb:null,
  decision_owner:clean(raw.decision_owner,120),
  planned_days:raw.planned_days===null?null:Number.isFinite(Number(raw.planned_days))?Math.max(0,Math.min(365,Math.floor(Number(raw.planned_days)))):null,
  gmail_thread_id:clean(raw.gmail_thread_id,48),
  message_ids:Array.isArray(raw.message_ids)?Array.from(new Set(raw.message_ids.filter(v=>typeof v==="string"&&/^[0-9a-f]{12,32}$/i.test(v)))).slice(0,200):[],
  last_synced_at:stamp(raw.last_synced_at),
  sync_reason:clean(raw.sync_reason,350),
  gmail_latest_excerpt:clean(raw.gmail_latest_excerpt,480)
 };
}
function normalizeBundle(input){
 const value=typeof input==="string"?JSON.parse(input):input;
 if(!value||!Array.isArray(value.opportunities))throw Error("Expected an object with an opportunities array.");
 if(value.opportunities.length>LIMIT)throw Error("Limit "+LIMIT+" records per import.");
 const list=value.opportunities.map(normalize);
 const ids=new Set();for(const row of list){if(ids.has(row.id))throw Error("Duplicate opportunity ID: "+row.id);ids.add(row.id);}
 return {schema:"aperture-commercial-private-v1",imported_at:new Date().toISOString(),opportunities:list};
}
function countByStage(list){return STAGES.reduce((a,s)=>{a[s]=list.filter(r=>r.stage===s).length;return a;},{});}
function isPriced(row){return row.terms_confirmed&&row.stage==="contracted"&&row.contract_value!==null;}
function dashboard(list){
 const stages=countByStage(list);return {
  records:list.length,responded:list.filter(r=>["responded","meeting_offered","screening_confirmed","negotiating","contracted"].includes(r.stage)).length,
  contracted:stages.contracted||0,booked_contract_value:list.filter(isPriced).reduce((s,r)=>s+r.contract_value,0),
  priced_contracts:list.filter(isPriced).length,unknown_value:list.filter(r=>!isPriced(r)).length,delivery_failures:stages.delivery_failed||0,
  gaps:list.filter(r=>!r.source_url||!r.evidence||!r.last_evidence_at).length
 };
}
function researchFor(row,studies,max=4){
 if(!Array.isArray(studies))return [];
 const weights={
  s01:{partnership:2,consulting:3,fractional_delivery:3,school_contract:2,paid_role:1},
  s02:{fractional_delivery:3,consulting:2,school_contract:2},
  s03:{fractional_delivery:2,consulting:2,school_contract:1},
  s04:{fractional_delivery:4,consulting:3,partnership:2,school_contract:3},
  s05:{fractional_delivery:3,consulting:2,partnership:2},
  s06:{partnership:4,consulting:3,fractional_delivery:4,school_contract:3},
  s07:{partnership:4,fractional_delivery:4,school_contract:3,consulting:3,paid_role:2},
  s08:{partnership:3,consulting:3,school_contract:2,paid_role:1},
  s09:{consulting:3,partnership:2,school_contract:2},
  s10:{partnership:3,fractional_delivery:4,consulting:2,school_contract:2}
 };
 return studies.map(s=>{
 const base=(weights[s.id]||{})[row.kind]||0;
 const detail=(row.title+" "+row.terms+" "+row.blockers).toLowerCase();
 let boost=0;if(/forecast|cash|roi|revenue/.test(detail)&&["s01","s08","s09"].includes(s.id))boost+=2;
 if(/approve|approval|referral|outreach|permission|contract/.test(detail)&&["s06","s07","s10"].includes(s.id))boost+=2;
 if(/deliver|pilot|implementation|execution/.test(detail)&&["s02","s04","s05"].includes(s.id))boost+=2;
 return {study:s,score:base+boost};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.study.id.localeCompare(b.study.id)).slice(0,Math.max(1,Math.min(10,max))).map(x=>x.study);
}
function decision(row){
 const tasks=[];
 if(row.stage==="delivery_failed")tasks.push("Verify deliverability and source address before any further contact.");
 if(row.stage==="outbound")tasks.push("Wait for a genuine response; do not count a sent message as a live commercial opportunity.");
 if(row.stage==="auto_reply")tasks.push("Identify the correct human owner; automated acknowledgement is not commercial interest.");
 if(row.stage==="responded"||row.stage==="meeting_offered")tasks.push("Clarify buyer need, authority, commercial scope and next decision.");
 if(row.stage==="negotiating")tasks.push("Validate partner economics, legal terms, attribution, permissions and approval owner.");
 if(row.stage==="screening_confirmed")tasks.push("Attend the confirmed screening and separately verify compensation and engagement terms.");
 if(row.stage==="contracted")tasks.push("Confirm the signed scope, payment schedule, delivery owner, capacity and reporting.");
 if(row.blockers)tasks.push("Resolve stated blocker: "+row.blockers);
 if(!row.terms_confirmed)tasks.push("Do not treat proposed or advertised compensation as contracted revenue.");
 tasks.push("Create one human-reviewed next action; no email or contract is executed by APERTURE.");
 return {title:row.proposed_next||tasks[0],tasks:tasks.slice(0,6),
  guards:["Evidence is sourced and dated","Commercial terms confirmed where applicable","Recipient/counterparty permissions confirmed","Responsible owner explicitly approves external action"]};
}
function scenario(row,override){
 const probability=Number(override?.probability);
 const amount=Number(override?.amount);
 const cycle=Number(override?.months);
 if(!Number.isFinite(probability)||probability<0||probability>1||!Number.isFinite(amount)||amount<0||!Number.isFinite(cycle)||cycle<0||cycle>36)throw Error("Provide a hypothetical amount, a probability between 0 and 1 and collection months between 0 and 36.");
 return {assumption_only:true,scenario_value:amount,weighted_value:amount*probability,collection_month:cycle,booked_revenue:0,warning:"Decision-support scenario. Never book forecast value as earned revenue without a signed agreement and verification."};
}
root.AP4DOpportunity={STAGES,CATEGORIES,KEYS,LIMIT,clean,safeURL,stamp,normalize,normalizeBundle,countByStage,isPriced,dashboard,researchFor,decision,scenario};
if(typeof module!=="undefined"&&module.exports)module.exports=root.AP4DOpportunity;
})(typeof globalThis!=="undefined"?globalThis:this);
