"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const services={
   coach:{label:"Coach Career & Portfolio Sprint",outputs:["Competency and role-gap map","90-day professional portfolio plan","Evidence and eligibility register"],gate:"Verify all qualifications, staff/youth safety training and source rights."},
   club:{label:"Club Capacity & Retention Review",outputs:["Baseline staffing and participant-slots model","Retention and enrollment intervention map","Review gates with accountable owner"],gate:"Organization approval, data rights, safeguarding and financial assumptions."},
   youth:{label:"Youth Basketball Program Design",outputs:["Age-appropriate curriculum outline","Coach standards and progression measures","Safeguarding, access and evaluation checklist"],gate:"Qualified supervision, consent, parent/guardian policy and age-appropriate programming."},
   partner:{label:"Sports Partnership Operating Plan",outputs:["Rights and stakeholder map","Draft activation and sponsorship thesis","Evidence, ROI assumptions and decision checkpoints"],gate:"Contract, IP, partner authority and brand usage must be reviewed before claims or outreach."},
   mental:{label:"Mental Skills Education Blueprint",outputs:["Non-clinical education curriculum","Boundaries, referrals and credential review framework","Consent-aware group feedback plan"],gate:"No diagnosis, therapy, protected clinical titles or athlete health records; licensed oversight for clinical scope."}
 };
 let selected=null,prepared="";
 function renderSelected(){
   $("selected-service").textContent=selected?services[selected].label:"None selected";
   document.querySelectorAll("[data-select]").forEach(b=>{
     const isSelected=b.dataset.select===selected;
     b.textContent=isSelected?"Selected ✓":"Scope this project";
     b.setAttribute("aria-pressed",String(isSelected));
   });
 }
 function build(){
   if(!selected){$("scope-status").textContent="Select a project first.";return}
   if(!$("scope-form").reportValidity())return;
   if(!$("scope-confirm").checked)return;
   const service=services[selected];
   const client=$("client").value.trim();
   const objective=$("objective").value.trim();
   const metric=$("metric").value.trim();
   const weeks=Number($("window").value);
   if(!client||!objective||!metric)return;
   prepared=[
     "APERTURE SPORTS — PROPOSED STATEMENT OF WORK",
     "DRAFT ONLY · NOT A CONTRACT, PURCHASE, BOOKING OR ACCEPTANCE",
     "Client / organization label: "+client,
     "Service concept: "+service.label,
     "Planning horizon: "+weeks+" weeks",
     "Problem to solve: "+objective,
     "Outcome to measure: "+metric,
     "",
     "Proposed work products:",
     ...service.outputs.map((s,i)=>(i+1)+". "+s),
     "",
     "Evidence & authority gate: "+service.gate,
     "Commercial status: Scope review required. Provider, budget, price, timeline and terms are not agreed.",
     "No outreach, clinical service, sensitive athlete data, financial commitment or payment is authorized.",
     "Next decision: Review the scope with an authorized organization representative and qualified provider.",
     "Prepared: "+new Date().toISOString()
   ].join("\n");
   $("scope-preview").textContent=prepared;
   $("download").disabled=false;$("copy").disabled=false;
   $("scope-status").textContent="Draft prepared locally. No message has been sent.";
 }
 document.querySelectorAll("[data-select]").forEach(b=>b.addEventListener("click",()=>{
   selected=b.dataset.select;
   prepared="";$("scope-preview").textContent="Selected "+services[selected].label+". Complete the form and generate the draft.";
   $("download").disabled=true;$("copy").disabled=true;renderSelected();
   $("compose").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
 }));
 $("scope-form").addEventListener("submit",event=>{event.preventDefault();build()});
 $("reset").addEventListener("click",()=>{
   selected=null;prepared="";$("scope-form").reset();$("scope-preview").textContent="Draft cleared. No request was transmitted.";
   $("download").disabled=true;$("copy").disabled=true;$("scope-status").textContent="Cleared.";renderSelected()
 });
 $("download").addEventListener("click",()=>{
   if(!prepared)return;
   const u=URL.createObjectURL(new Blob([prepared],{type:"text/plain;charset=utf-8"}));
   const a=document.createElement("a");a.href=u;a.download="aperture-sports-draft-scope.txt";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),100);
 });
 $("copy").addEventListener("click",async()=>{
   if(!prepared)return;
   try{await navigator.clipboard.writeText(prepared);$("scope-status").textContent="Draft copied. Human review required before sharing."}
   catch{$("scope-status").textContent="Clipboard unavailable. Download the draft instead."}
 });
 renderSelected();
})();
