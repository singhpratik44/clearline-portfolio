/* APERTURE Partnership OS / V2
   Public-source opportunity intelligence with local-only operator tracking.
   No invented leads, no sending, no third-party integrations. */
(() => {
  "use strict";
  const CATALOG=Array.isArray(window.AP_PARTNERS)?window.AP_PARTNERS:[];
  const BY_ID=new Map(CATALOG.map(p=>[p.id,p]));
  const STORAGE_KEY="aperture-partnership-os-v2";
  const STAGES=["research","qualified","approved","sent","replied","negotiating","signed"];
  const STAGE_LABELS={research:"Research",qualified:"Qualified",approved:"Authorized",sent:"Outreach sent",replied:"Reply received",negotiating:"Negotiating",signed:"Signed agreement"};
  const DEFAULT=()=>({records:[],ledger:[],rate:100,auditHours:15,pilotHours:50});
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  let toastTimeout;
  function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove("show"),2500);}
  const storage=(()=>{try{localStorage.setItem(STORAGE_KEY+":test","1");localStorage.removeItem(STORAGE_KEY+":test");return localStorage;}catch(_){return null;}})();
  function getState(){
    if(!storage)return DEFAULT();
    try {
      const candidate=JSON.parse(storage.getItem(STORAGE_KEY)||"null");
      if(!candidate||!Array.isArray(candidate.records)||!Array.isArray(candidate.ledger))return DEFAULT();
      const records=candidate.records.filter(r=>r&&BY_ID.has(r.id)&&STAGES.includes(r.stage)).map(r=>({id:r.id,stage:r.stage,evidence:String(r.evidence||"").slice(0,450),notes:String(r.notes||"").slice(0,1200),authorized:!!r.authorized,signed:!!r.signed,updated:r.updated||""}));
      return {records,ledger:candidate.ledger.slice(-150).filter(e=>e&&typeof e.label==="string").map(e=>({time:String(e.time||""),label:e.label.slice(0,160),detail:String(e.detail||"").slice(0,320)})),rate:Number(candidate.rate)||100,auditHours:Number(candidate.auditHours)||15,pilotHours:Number(candidate.pilotHours)||50};
    } catch(_){return DEFAULT();}
  }
  let state=getState(),filter="all",term="",focus=CATALOG[0]?.id||"",editorId="",proposalId=focus;
  function persist(){if(!storage){toast("Browser storage unavailable. Data will not persist.");return;}try{storage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(_){toast("Browser storage is unavailable. Export your records.");}}
  function addLog(label,detail){state.ledger.unshift({time:new Date().toISOString(),label,detail});state.ledger=state.ledger.slice(0,150);persist();renderLedger();}
  function elem(tag,text,className){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=String(text);return el;}
  function addText(parent,tag,text,cls){const e=elem(tag,text,cls);parent.append(e);return e;}
  function dollars(x){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(x);}
  function download(text,name,type="text/plain;charset=utf-8"){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function csv(v){return '"'+String(v??"").replace(/"/g,'""')+'"';}
  function allViews(){
    $("#metric-sourced").textContent=CATALOG.length;
    $("#metric-money").textContent=CATALOG.filter(p=>p.direct).length;
    $("#metric-active").textContent=state.records.length;
    $("#metric-sent").textContent=state.records.filter(r=>STAGES.indexOf(r.stage)>=STAGES.indexOf("sent")).length;
  }
  function renderCards(){
    const target=$("#opportunity-cards");target.replaceChildren();
    const shown=CATALOG.filter(p=>(filter==="all"||p.lane===filter)&&(!term||[p.name,p.model,p.fact,p.need,p.package].join(" ").toLowerCase().includes(term))).sort((a,b)=>b.rank-a.rank);
    $("#market-empty").hidden=shown.length!==0;
    shown.forEach((p,i)=>{
      const card=elem("article",null,"opportunity"+(p.id===focus?" selected":""));
      const top=elem("div",null,"opp-top");addText(top,"span",String(i+1).padStart(2,"0")+" / "+p.lane.toUpperCase(),"opp-index");
      const score=elem("div",null,"opp-score");score.textContent=p.rank+" ";addText(score,"small","FIT / 100");top.append(score);card.append(top);
      addText(card,"h3",p.name);addText(card,"span",p.model,"opp-lane");
      addText(card,"p",p.reason);
      const bottom=elem("div",null,"opp-bottom");addText(bottom,"span",p.direct?"PUBLIC PAID PATH":"TERMS TO NEGOTIATE","opp-money");
      const btn=elem("button","Inspect ↗","small-button");btn.type="button";btn.setAttribute("aria-label","Inspect "+p.name);btn.addEventListener("click",()=>select(p.id));bottom.append(btn);card.append(bottom);target.append(card);
    });
  }
  function select(id){
    const p=BY_ID.get(id);if(!p)return;focus=id;renderCards();
    $("#detail-score").textContent=p.rank+"/100";
    $("#detail-name").textContent=p.name;$("#detail-model").textContent=p.model;$("#detail-fact").textContent=p.fact;
    $("#detail-thesis").textContent=p.thesis;$("#detail-money").textContent=p.money;$("#detail-first").textContent=p.first;$("#detail-source").href=p.url;
    const rec=state.records.find(r=>r.id===id);
    $("#detail-save").textContent=rec?"Open pipeline record ↗":"Add to pipeline +";
    $("#detail-save").onclick=()=>{if(!rec)saveNew(p.id);else openRecord(p.id);document.querySelector("#work").scrollIntoView({behavior:"smooth",block:"start"});};
    proposalId=id;$("#proposal-partner").value=id;renderProposal();
  }
  function saveNew(id){
    if(!BY_ID.has(id)||state.records.some(r=>r.id===id))return openRecord(id);
    const p=BY_ID.get(id);
    state.records.push({id,stage:"research",evidence:p.url,notes:"Official partnership page identified. Fit, scope, and compensation require direct confirmation.",authorized:false,signed:false,updated:new Date().toISOString()});
    addLog("Organization added",p.name+" — research stage. Public source only.");
    renderPipeline();allViews();openRecord(id);toast("Added to local research pipeline.");
  }
  function populateSelects(){
    for(const select of [$("#proposal-partner"),$("#record-partner")]){
      select.replaceChildren();
      if(select.id==="record-partner"){const empty=elem("option","Select a pipeline record");empty.value="";select.append(empty);}
      CATALOG.forEach(p=>{const o=elem("option",p.name);o.value=p.id;select.append(o);});
    }
    $("#proposal-partner").value=proposalId;
  }
  function openRecord(id){
    if(!state.records.some(r=>r.id===id)){saveNew(id);return;}
    editorId=id;const r=state.records.find(x=>x.id===id);
    $("#record-partner").value=id;$("#record-stage").value=r.stage;$("#record-evidence").value=r.evidence;$("#record-notes").value=r.notes;
    $("#record-authorized").checked=!!r.authorized;$("#record-signed").checked=!!r.signed;
    $("#record-status").textContent=STAGE_LABELS[r.stage].toUpperCase();
    $("#editor-hint").textContent="Record for "+BY_ID.get(id).name+". Stage changes here are self-reported; evidence is required for advancement.";
    $("#form-warning").textContent="";
    renderPipeline();
  }
  function renderPipeline(){
    const root=$("#pipeline-list");root.replaceChildren();
    if(!state.records.length){root.append(elem("p","No saved opportunities yet. Inspect a verified partner above and select Add to pipeline.","placeholder"));return;}
    for(const r of state.records){
      const p=BY_ID.get(r.id);if(!p)continue;const row=elem("button",null,"pipeline-item"+(editorId===r.id?" active":""));row.type="button";
      const a=elem("span");addText(a,"strong",p.name);addText(a,"small","Updated "+(r.updated?new Date(r.updated).toLocaleDateString("en-US"):"not recorded"));
      row.append(a,elem("span",STAGE_LABELS[r.stage],"stage-label"));row.addEventListener("click",()=>openRecord(r.id));root.append(row);
    }
  }
  function stageAllowed(newStage,evidence,notes,authorized,signed){
    if(newStage==="research")return "";
    if(evidence.length<8||notes.length<18)return "To advance, provide a specific evidence reference and at least 18 characters describing an actual observation.";
    if(STAGES.indexOf(newStage)>=STAGES.indexOf("approved")&&!authorized)return "Authorization confirmation is required before labeling outreach as approved, sent, replied or beyond.";
    if(newStage==="signed"&&!signed)return "A signed agreement must be confirmed in writing before selecting Signed agreement.";
    return "";
  }
  function handleSave(event){
    event.preventDefault();const id=$("#record-partner").value;
    if(!id||!BY_ID.has(id)||!state.records.some(r=>r.id===id)){toast("Add an organization before updating its evidence.");return;}
    const stage=$("#record-stage").value,evidence=$("#record-evidence").value.trim().slice(0,450),notes=$("#record-notes").value.trim().slice(0,1200),authorized=$("#record-authorized").checked,signed=$("#record-signed").checked;
    const warning=stageAllowed(stage,evidence,notes,authorized,signed);
    if(warning){$("#form-warning").textContent=warning;toast("Stage blocked: missing evidence or approval.");return;}
    const record=state.records.find(r=>r.id===id);const old=record.stage;
    Object.assign(record,{stage,evidence,notes,authorized,signed,updated:new Date().toISOString()});
    addLog("Operator stage update",BY_ID.get(id).name+": "+STAGE_LABELS[old]+" → "+STAGE_LABELS[stage]+". User-entered; no external verification.");
    renderPipeline();allViews();openRecord(id);toast("Record saved locally; external activity not verified.");
  }
  function renderEvidence(){
    const root=$("#source-register");root.replaceChildren();
    CATALOG.forEach((p,i)=>{
      const row=elem("div",null,"source-row"),main=elem("div");
      addText(main,"strong",String(i+1).padStart(2,"0")+". "+p.name);addText(main,"span","Official page · reviewed 2026-11-09 · "+p.lane);
      const a=elem("a","Primary source ↗");a.href=p.url;a.target="_blank";a.rel="noopener noreferrer";row.append(main,a);root.append(row);
    });
  }
  function renderLedger(){
    const root=$("#ledger");root.replaceChildren();
    if(!state.ledger.length){root.append(elem("p","No operator actions logged. Public source research does not count as outreach.","placeholder"));return;}
    state.ledger.slice(0,30).forEach(item=>{
      const row=elem("div",null,"ledger-entry");addText(row,"strong",item.label);addText(row,"small",(item.time?new Date(item.time).toLocaleString("en-US"):"Date not recorded")+" · "+item.detail);root.append(row);
    });
  }
  function pricing(){
    const rate=Number($("#rate").value),audit=Number($("#audit-hours").value),pilot=Number($("#pilot-hours").value);
    state.rate=rate;state.auditHours=audit;state.pilotHours=pilot;
    $("#rate-out").textContent=dollars(rate)+"/hr";$("#audit-hours-out").textContent=audit+"h";$("#pilot-hours-out").textContent=pilot+"h";
    $("#audit-price").textContent=dollars(audit*rate);$("#pilot-price").textContent=dollars(pilot*rate);$("#retainer-price").textContent=dollars(30*rate);
    persist();renderProposal();
  }
  function packageLine(kind,p){
    if(kind==="audit")return {
      title:"PAID DISCOVERY AND OPPORTUNITY AUDIT",
      price:dollars(state.auditHours*state.rate)+" proposed fixed fee, subject to negotiation",
      goals:["Interview authorized owners to define the problem and present the operating baseline.","Map the existing lead, family, club or program onboarding process.","Produce a source-backed opportunity matrix, risk register and 30-day pilot decision memo."],
      outcome:"Deliver a signed-off discovery report and a go/no-go decision. Do not promise enrollments or sales."
    };
    if(kind==="referral")return {
      title:"REFERRAL PARTNERSHIP DISCOVERY",
      price:"Compensation and qualifying referral definition to be negotiated in writing; no fee presumed",
      goals:["Agree who qualifies as a partner or family introduction and who owns final intake.","Write consent, representation, attribution, disputes and reporting rules.","If authorized, test a small batch of qualified introductions and reconcile outcomes with the provider."],
      outcome:"A documented and approved referral mechanism, not an assumed commission."
    };
    return {
      title:"90-DAY OPERATIONS PILOT",
      price:dollars(state.pilotHours*state.rate)+" proposed project fee, subject to scoped hours and negotiation",
      goals:["Days 01–30: Validate need, source-backed prospect map, workflow baseline, ownership and privacy permissions.","Days 31–60: Deliver reviewed operator playbooks, conduct explicitly authorized activity and log stage changes.","Days 61–90: Reconcile actual outcomes, publish process improvements and recommend expansion or stop."],
      outcome:"A tracked pilot with an authorized intake handoff and verified reporting. No enrollment or conversion guarantee."
    };
  }
  function makeProposal(){
    const p=BY_ID.get($("#proposal-partner").value)||CATALOG[0],kind=$("#proposal-kind").value,context=$("#proposal-angle").value.trim(),pkg=packageLine(kind,p);
    if(!p)return "No sourced opportunities available.";
    return [
      "APERTURE / CLEARLINE GROUP",
      "INDEPENDENT COMMERCIAL PROPOSAL — DRAFT FOR REVIEW",
      "Prepared for: "+p.name,
      "Approach: "+pkg.title,
      "Source checked: November 9, 2026",
      "",
      "WHY THIS CONVERSATION",
      "Public evidence: "+p.fact,
      "Primary source: "+p.url,
      "",
      "HYPOTHESIS — NOT AN ASSERTION ABOUT YOUR INTERNAL NEEDS",
      p.thesis,
      "",
      "KNOWN CONTEXT / IF VERIFIED",
      context||"None. A discovery conversation is needed before claiming a specific operational problem.",
      "",
      "WHAT I WOULD OWN",
      "My relevant experience includes multi-site STEM education and youth sports operations, curriculum design, staff leadership, partnerships and program measurement. I propose to contribute the following services under an agreed scope:",
      ...pkg.goals.map((item,i)=>String(i+1)+". "+item),
      "",
      "CANDIDATE MEASURES (DEFINE WITH YOUR TEAM)",
      "• Number of verified partner opportunities researched and qualified",
      "• Approved introductions and the timeliness of their handoff",
      "• Documented staff time, process friction and remediation",
      "• Provider-confirmed outcomes only where attribution and consent permit",
      "• Cost and time-to-delivery against an agreed baseline",
      "",
      "COMMERCIAL DISCUSSION",
      "Proposed structure: "+p.package,
      "Illustrative ask: "+pkg.price,
      "Public program terms (not a private offer to APERTURE): "+p.money,
      "All fee, approval, contracting, IP, privacy and delivery terms are open for negotiation.",
      "",
      "DISCOVERY QUESTIONS",
      ...p.questions.map((q,i)=>String(i+1)+". "+q),
      "",
      "DECISION / NEXT STEP",
      p.first,
      "Success gate: "+pkg.outcome,
      "",
      "BOUNDARIES",
      "No promise of admissions, revenue, scholarships, referrals or outcomes. No outreach on your behalf without authorization. No access to minor/student records without separate lawful, secured scope. APERTURE does not claim existing affiliation.",
      "",
      "Locane Singh",
      "APERTURE / Clearline Group",
      "Portfolio: https://singhpratik44.github.io/clearline-portfolio/",
      "Independent operating system: https://singhpratik44.github.io/clearline-portfolio/partnerships/",
      "",
      "NOT SENT. All claims, pricing and counterparties require human review."
    ].join("\n");
  }
  function renderProposal(){
    $("#proposal-text").value=makeProposal();
    $("#wordcount").textContent=$("#proposal-text").value.trim().split(/\s+/).length+" words";
  }
  for(const b of $$("[data-filter]"))b.addEventListener("click",()=>{filter=b.dataset.filter;$$("[data-filter]").forEach(x=>{const active=x===b;x.classList.toggle("active",active);x.setAttribute("aria-pressed",String(active));});renderCards();});
  $("#search").addEventListener("input",e=>{term=e.target.value.trim().toLowerCase();renderCards();});
  $("#record-partner").addEventListener("change",e=>{const id=e.target.value;if(!id){editorId="";$("#record-status").textContent="NO RECORD";return;}if(!state.records.some(r=>r.id===id)){saveNew(id);}else{openRecord(id);}});
  $("#pipeline-form").addEventListener("submit",handleSave);
  $("#rate").value=state.rate;$("#audit-hours").value=state.auditHours;$("#pilot-hours").value=state.pilotHours;
  ["rate","audit-hours","pilot-hours"].forEach(id=>$("#"+id).addEventListener("input",pricing));
  $("#proposal-partner").addEventListener("change",e=>{proposalId=e.target.value;select(proposalId);});
  ["proposal-kind","proposal-angle"].forEach(id=>$("#"+id).addEventListener("input",renderProposal));
  $("#generate").addEventListener("click",()=>{renderProposal();toast("Tailored proposal regenerated. Nothing sent.");});
  $("#copy").addEventListener("click",async()=>{
    try{await navigator.clipboard.writeText($("#proposal-text").value);toast("Draft copied; not sent.");}
    catch(_){$("#proposal-text").focus();$("#proposal-text").select();toast("Select and copy the draft manually.");}
  });
  $("#download").addEventListener("click",()=>{download($("#proposal-text").value,"aperture-"+$("#proposal-partner").value+"-proposal.txt");toast("Draft downloaded.");});
  $("#export").addEventListener("click",()=>{download(JSON.stringify({schema:"APERTURE_PARTNERSHIP_OS_V2",exported:new Date().toISOString(),...state},null,2),"aperture-partnership-workspace.json","application/json;charset=utf-8");toast("Local pipeline and ledger exported.");});
  $("#source-export").addEventListener("click",()=>{
    const rows=[["Organization","Sector","Source URL","Reviewed date","Public fact","Public commercial terms","APERTURE fit score"],...CATALOG.map(p=>[p.name,p.lane,p.url,"2026-11-09",p.fact,p.money,p.rank])];
    download(rows.map(row=>row.map(csv).join(",")).join("\r\n"),"aperture-verified-partnership-sources.csv","text/csv;charset=utf-8");toast("Source register exported.");
  });
  $("#clear-log").addEventListener("click",()=>{if(state.ledger.length&&!window.confirm("Clear local activity log? This does not change your saved records. Export a backup first if needed."))return;state.ledger=[];persist();renderLedger();toast("Local log cleared.");});
  populateSelects();renderCards();renderEvidence();renderLedger();renderPipeline();allViews();select(focus);
  if(state.records.length)openRecord(state.records[0].id);
  else{$("#record-partner").value="";$("#editor-hint").textContent="Select an organization from the market list to create its first evidence record.";$("#record-status").textContent="NO RECORD";}
  pricing();
})();