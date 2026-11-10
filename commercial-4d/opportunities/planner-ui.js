/* APERTURE Commercial 4D — Planning Studio UI.
   The only network request is same-origin public research.json.
   Private rows and planning assumptions remain in memory or in opt-in vault.
 */
(function(root){
"use strict";
const P=root.AP4DPlan,E=root.AP4DOpportunity,W=root.AP4DWorkspace;
if(!P||!E||!W)throw Error("APERTURE planner requires the local-only opportunity modules.");
const el=id=>document.getElementById(id);
let assumptions={},studies=[],shownId="",current=null;
const value=n=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
const formatNum=n=>typeof n==="number"?new Intl.NumberFormat("en-US",{maximumFractionDigits:1}).format(n):"—";
const names={
 scope:"Buyer need / proposed deliverable",
 metric:"Outcome metric and baseline",
 reviewer:"Named decision reviewer",
 fee:"Hypothetical contract fee ($)",
 probability:"Hypothetical close probability (%)",
 directCost:"Hypothetical direct delivery cost ($)",
 acquisitionCost:"Hypothetical acquisition cost ($)",
 deliveryHours:"Estimated delivery hours",
 capacityHours:"Available monthly hours",
 permissionConfirmed:"External counterparty authorization checked",
 capacityConfirmed:"Staff and delivery capacity checked"
};
const controls={
 scope:"plan-scope",metric:"plan-metric",reviewer:"plan-reviewer",
 fee:"plan-fee",probability:"plan-probability",directCost:"plan-direct-cost",
 acquisitionCost:"plan-acquisition-cost",deliveryHours:"plan-hours",
 capacityHours:"plan-capacity",permissionConfirmed:"plan-permission",capacityConfirmed:"plan-staff"
};
const empty=()=>({...P.DEFAULT});
const dataFor=id=>P.normalize(assumptions[id]||empty());
function setInputs(next){
 if(!next||typeof next!=="object"||Array.isArray(next))throw Error("Invalid private plan data.");
 const out={};
 const ids=new Set(W.getRecords().map(r=>r.id));
 for(const [id,a] of Object.entries(next).slice(0,150)){
  if(!ids.has(id))continue;
  out[id]=P.normalize(a);
 }
 assumptions=out;shownId="";render();
}
function readControls(){
 const a={};
 for(const [key,id] of Object.entries(controls)){
  const node=el(id);
  if(key==="permissionConfirmed"||key==="capacityConfirmed")a[key]=node.checked;
  else if(["scope","metric","reviewer"].includes(key))a[key]=node.value;
  else if(node.value==="")a[key]=null;
  else a[key]=Number(node.value)/(key==="probability"?100:1);
 }
 return P.normalize(a);
}
function writeControls(a){
 for(const [key,id] of Object.entries(controls)){
  const node=el(id);
  if(key==="permissionConfirmed"||key==="capacityConfirmed")node.checked=a[key];
  else if(["scope","metric","reviewer"].includes(key))node.value=a[key]||"";
  else node.value=a[key]===null?"":String(a[key]*(key==="probability"?100:1));
 }
}
function note(text,bad=false){
 el("plan-status").textContent=text;
 el("plan-status").dataset.warning=bad?"true":"false";
}
function make(tag,text,cls){
 const node=document.createElement(tag);if(text!==undefined&&text!==null)node.textContent=String(text);
 if(cls)node.className=cls;
 return node;
}
function moneyOrUnknown(n){return n===null?"Not provided":value(n);}
function drawCases(plan){
 const parent=el("plan-cases");parent.replaceChildren();
 if(!plan.economics.complete){
  parent.append(make("p","Complete the hypothetical fee, win probability, direct cost, acquisition cost and delivery hours to compare stress cases. Missing is different from $0.","plan-muted"));
  return;
 }
 for(const item of plan.economics.cases){
  const card=make("div",null,"plan-case");
  card.append(make("span",item.name.toUpperCase(),"plan-case-label"),
    make("strong",value(item.expectedContribution)),
    make("small","Modeled expected contribution · p="+Math.round(item.winProbability*100)+"%"),
    make("small",formatNum(item.expectedHours)+" expected hours; "+moneyOrUnknown(item.contributionPerReservedHour)+" / reserved hour"));
  parent.append(card);
 }
 parent.append(make("p",plan.economics.note,"plan-muted plan-wide"));
}
function drawGates(plan){
 const parent=el("plan-checks");parent.replaceChildren();
 const passing=plan.gates.filter(g=>g.ok).length;
 el("plan-ready-count").textContent=passing+"/"+plan.gates.length+" evidence/assumption gates";
 for(const g of plan.gates){
  const card=make("div",null,"plan-gate");
  card.append(make("span",g.ok?"✓":"○",g.ok?"plan-check pass":"plan-check absent"));
  const info=make("div");info.append(make("strong",g.name),make("small",g.reason));card.append(info);parent.append(card);
 }
 const banner=el("plan-readiness");
 banner.textContent=plan.review_ready?
 "Planning review requirements met. Execution remains blocked without separate contractual authority and explicit action approval.":
 "Not ready for planning review. Add a dated source, commercial need, success measure and named reviewer.";
 banner.dataset.ready=plan.review_ready?"true":"false";
 el("plan-record").disabled=!plan.review_ready;
}
function drawMilestones(plan){
 const parent=el("plan-milestones");parent.replaceChildren();
 for(const s of plan.steps){
  const card=make("article",null,"plan-milestone");
  card.append(make("div","DAYS "+s.days+" / "+s.phase.toUpperCase(),"plan-kicker"),make("strong",s.description),
  make("p","Evidence: "+s.evidence),
  make("p","Decision gate: "+s.gate));
  parent.append(card);
 }
}
function drawStudies(plan){
 const parent=el("plan-studies");parent.replaceChildren();
 if(!plan.studies.length){
  parent.append(make("p","Research catalog is unavailable; source-backed study matches cannot be confirmed.","plan-muted"));
  return;
 }
 for(const [i,study] of plan.studies.entries()){
  const card=make("article",null,"plan-study");
  const heading=make("div",null,"plan-study-meta");
  heading.append(make("span",String(i+1).padStart(2,"0")+" / "+(study.source||"Primary paper")+" / "+(study.date||"Date unavailable")));
  const a=make("a",study.title+" ↗");a.href=study.url;a.rel="noopener noreferrer";a.target="_blank";
  card.append(heading,a,make("p","Application hypothesis: "+study.method));
  const foot=make("small","Not company evidence · Review the paper's methods and limitations before adoption.");
  card.append(foot);parent.append(card);
 }
}
function drawPortfolio(){
 const summary=P.portfolio(W.getRecords(),assumptions);
 el("plan-portfolio").replaceChildren();
 const rootBox=el("plan-portfolio");
 for(const [name,v] of [
  ["Commercial records",String(summary.count)],
  ["Signed work, estimated delivery hours",formatNum(summary.contract_capacity_hours)],
  ["Uncontracted pipeline, hypothetical hours",formatNum(summary.hypothetical_pipeline_hours)],
  ["Monthly capacity (smallest entered assumption)",formatNum(summary.available_monthly_capacity)],
  ["Opportunity hours without estimates",String(summary.unknown_hour_coverage)]
 ]){
  const row=make("div",null,"plan-portfolio-row");
  row.append(make("span",name),make("strong",v));rootBox.append(row);
 }
 rootBox.append(make("p",summary.risk+" "+summary.note,"plan-muted"));
}
function render(){
 const row=W.getSelected();drawPortfolio();
 if(!row){
  shownId="";
  el("plan-account").textContent="Select an opportunity above";
  el("plan-form").hidden=true;
  el("plan-results").hidden=true;
  note("Import the reviewed opportunity bundle and select an account.");
  return;
 }
 if(shownId!==row.id){shownId=row.id;writeControls(dataFor(row.id));}
 el("plan-form").hidden=false;el("plan-results").hidden=false;
 el("plan-account").textContent=row.organization+" / "+row.stage.replace(/_/g," ");
 try{
  current=P.plan(row,assumptions[row.id]||empty(),studies);
  el("plan-intent").textContent=current.intent;
  drawCases(current);drawGates(current);drawMilestones(current);drawStudies(current);
  el("plan-study-total").textContent=current.studies.length+" papers matched (review required)";
  if(!studies.length)note("Primary research register is unavailable. Planning is local and provisional.",true);
  else if(current.economics.complete)note("Scenario calculated deterministically. Hypothetical numbers are not booked revenue.");
  else note("Planning model is ready for grounded input. Nothing is executed or sent.");
 }catch(e){current=null;note("Planning inputs need correction: "+e.message,true);}
}
function changed(){
 const row=W.getSelected();if(!row)return;
 try{assumptions[row.id]=readControls();render();root.dispatchEvent(new CustomEvent("ap4d:plan-change",{detail:{id:row.id}}));}
 catch(e){note(e.message,true);}
}
for(const id of Object.values(controls)){
 const node=el(id);
 node.addEventListener(node.type==="checkbox"?"change":"input",changed);
}
function download(filename,content,mime){
 const blob=new Blob([content],{type:mime||"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
el("plan-export").addEventListener("click",()=>{
 if(!current){note("Select an opportunity and correct invalid inputs before export.",true);return;}
 download("aperture-"+current.opportunity_id.replace(/[^a-z0-9_-]/gi,"_").slice(0,60)+"-commercial-plan.md",P.markdown(current));
 note("Private research-backed decision memo downloaded. No external action was authorized.");
});
el("plan-record").addEventListener("click",async()=>{
 if(!current||!current.review_ready){note("Planning review prerequisites are incomplete.",true);return;}
 try{
  if(!el("plan-confirm").checked)throw Error("Confirm that this is a planning review only.");
  if(!root.AP4DSecureUI?.recordPlanReview)throw Error("Private approval ledger unavailable.");
  await root.AP4DSecureUI.recordPlanReview(current);
  el("plan-confirm").checked=false;
  note("Planning review recorded locally. Save encrypted vault to preserve it; execution is NOT authorized.");
 }catch(e){note(String(e?.message||e),true);}
});
el("plan-reset").addEventListener("click",()=>{
 const row=W.getSelected();if(!row)return;
 if(!root.confirm("Clear only this opportunity's hypothetical plan inputs? This does not delete original correspondence or recorded audit history."))return;
 delete assumptions[row.id];shownId="";render();root.dispatchEvent(new CustomEvent("ap4d:plan-change",{detail:{id:row.id}}));
 note("This opportunity's hypothetical plan inputs were reset.");
});
async function loadResearch(){
 try{
  const response=await fetch("../research.json",{cache:"no-store"});
  if(!response.ok)throw Error("Source registry unavailable");
  const data=await response.json();
  if(!Array.isArray(data.studies)||data.studies.length!==10)throw Error("Expected ten curated research papers.");
  studies=data.studies;
 }catch(e){studies=[];note("Research metadata unavailable: "+e.message,true);}
 render();
}
root.AP4DPlannerUI={render,getInputs:()=>JSON.parse(JSON.stringify(assumptions)),setInputs,getPlan:()=>current};
loadResearch();render();
})(typeof globalThis!=="undefined"?globalThis:this);
