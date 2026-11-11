"use strict";
/* In-browser commercial discovery worksheet. No data transmission, storage, network, or checkout. */
(function(root){
 const $=id=>root.document.getElementById(id);
 let prepared="";
 const money=v=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v);
 function evaluate(members,monthly,exceptionRate){
  if(!Number.isFinite(members)||!Number.isFinite(monthly)||!Number.isFinite(exceptionRate)||members<0||monthly<0||exceptionRate<0||exceptionRate>100)throw Error("Invalid assumptions");
  return Math.round(members*monthly*exceptionRate/100);
 }
 if(typeof module!=="undefined"&&module.exports)module.exports={evaluate};
 if(!root.document)return;
 function calc(){
   const members=Number($("members").value),fee=Number($("monthly").value),share=Number($("exceptions").value);
   $("members-value").textContent=members+" illustrative members";
   $("monthly-value").textContent=money(fee)+" hypothetical fee";
   $("exceptions-value").textContent=share+"% assumed exception share";
   $("scenario-value").textContent=money(evaluate(members,fee,share));
 }
 function resetPrepared(){
   prepared="";
   $("offer-preview").textContent="Complete the brief to see a local summary. This does not contact APERTURE or reserve an appointment.";
   $("copy-brief").disabled=true;$("save-brief").disabled=true;
 }
 function compose(){
   if(!$("intake-form").reportValidity())return;
   if(!$("authority").checked)return;
   const name=$("org").value.trim();
   if(name.length<2){$("intake-status").textContent="Enter an organization label.";return}
   prepared=[
     "APERTURE — REVENUE LEAKAGE DIAGNOSTIC / DISCOVERY BRIEF",
     "Research-stage offer • not an order, accepted agreement, or data transfer",
     "Organization: "+name,
     "Sector: "+$("sector").value,
     "Approximate membership scale: "+$("scale").value,
     "Key question: "+$("challenge").value,
     "",
     "Proposed scope: 14-day fixed-scope diagnosis of renewal and invoice exceptions.",
     "Hypothetical trial fee to discuss: $350 (not a checkout or agreed price).",
     "Available sample: https://singhpratik44.github.io/clearline-portfolio/sports-os/revenue-recovery/sample-audit.html",
     "",
     "Needed before start: named authorized owner; agreed deliverables and terms; appropriate data-processing safeguards; approved secure source access; delivery and invoicing arrangement.",
     "Never include individual member names, health information, payment-card data or child details in preliminary inquiry.",
     "No email, payment, booking or upload occurs through this page."
   ].join("\n");
   $("offer-preview").textContent=prepared;
   $("copy-brief").disabled=false;$("save-brief").disabled=false;
   $("intake-status").textContent="Draft prepared locally. No information has been sent.";
 }
 function download(){
   if(!prepared)return;
   const url=URL.createObjectURL(new Blob([prepared],{type:"text/plain;charset=utf-8"}));
   const a=root.document.createElement("a");a.href=url;a.download="aperture-pilot-discovery-brief.txt";root.document.body.append(a);a.click();a.remove();
   root.setTimeout(()=>URL.revokeObjectURL(url),150);
 }
 ["members","monthly","exceptions"].forEach(id=>$(id).addEventListener("input",calc));
 $("intake-form").addEventListener("submit",e=>{e.preventDefault();compose()});
 $("clear-brief").addEventListener("click",()=>{$("intake-form").reset();resetPrepared();$("intake-status").textContent="Cleared from page memory."});
 $("save-brief").addEventListener("click",download);
 $("copy-brief").addEventListener("click",async()=>{
   if(!prepared)return;
   try{await root.navigator.clipboard.writeText(prepared);$("intake-status").textContent="Copied locally. No email was sent."}
   catch{$("intake-status").textContent="Clipboard unavailable; download the text brief instead."}
 });
 calc();
})(typeof globalThis!=="undefined"?globalThis:this);