"use strict";
/* Public-source buyer intelligence. No email/CRM integration and no persistent lead data. */
(function(root){
 const sourceHosts=new Set(["www.thecoderschool.com","www.codeninjas.com","socalelite.org","www.soccershots.com"]);
 const billingWeight={explicit_recurring:35,monthly_program:25,year_round:12,seasonal_enrollment:8};
 function score(record){
   const b=billingWeight[record.billing_signal]||0;
   const multi=record.buyer_group==="Tri-Valley theCoderSchool group"||record.buyer_group==="SoCal Elite Sports"||record.buyer_group==="Soccer Shots Orange County";
   const region=["San Ramon","Walnut Creek","Pleasanton"].includes(record.city)?0:10;
   return b+(multi?20:0)+(record.business_email?15:0)+Math.min(3,Math.max(0,record.complexity_score||0))*5+region;
 }
 function rank(records,limit=5){
   const sorted=[...records].sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name));
   const seen=new Set();const out=[];
   for(const r of sorted){if(!seen.has(r.buyer_group)){seen.add(r.buyer_group);out.push(r)}if(out.length>=limit)break}
   return out;
 }
 function draft(record){
   const direct=record.business_email?"Official business email: "+record.business_email:"Official business contact: "+record.contact_url;
   const audience=record.contact_role||"authorized business operations decision-maker";
   return [
     "UNSENT DRAFT — HUMAN RECIPIENT/CHANNEL REVIEW REQUIRED",
     "Business: "+record.name,
     direct,
     "Suggested recipient role: "+audience,
     "Subject: Quick question about your "+(record.sector==="sports"?"program registration":"enrollment")+" workflow",
     "",
     "Hello,",
     "",
     "I work on APERTURE, a small operational diagnostic for youth programs. I saw that "+record.name+" publicly describes "+record.source_fact.charAt(0).toLowerCase()+record.source_fact.slice(1)+".",
     "",
     "I'm testing a 14-day review that helps an authorized operator reconcile registration, invoice and renewal exceptions, identify existing software coverage, and create a clear staff decision queue. It doesn't send payment reminders or handle charges.",
     "",
     "I don't know whether this is a problem for your organization. Would a brief call to learn how you handle these workflows be worthwhile? If your existing software already handles them well, that's equally valuable for us to understand.",
     "",
     "Here's a fictional illustration of the workflow (not a customer case study):",
     "https://singhpratik44.github.io/clearline-portfolio/sports-os/revenue-recovery/sample-audit.html",
     "",
     "Thank you,",
     "APERTURE",
     "",
     "Evidence source: "+record.source_url,
     "IMPORTANT: Nothing has been sent. Verify the actual authorized recipient, avoid duplicate contacts at the district level, and obtain explicit sending approval."
   ].join("\n");
 }
 function safeUrl(value){
   try{const u=new URL(value);return u.protocol==="https:"&&sourceHosts.has(u.hostname)?u.href:null}catch{return null}
 }
 function validate(data){
   if(data.schema_version!==1||!Array.isArray(data.records)||data.records.length!==20)throw Error("Unexpected prospect registry");
   if(new Set(data.records.map(r=>r.id)).size!==20)throw Error("Duplicate IDs");
   for(const r of data.records){
     if(!r.id||!r.name||!r.buyer_group||!r.source_fact||!safeUrl(r.source_url)||!safeUrl(r.contact_url)||r.pain_verified!==false||r.contacted!==false)throw Error("Invalid public-source research record");
     if(r.business_email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.business_email))throw Error("Bad public contact");
   }
   return data.records;
 }
 const API={score,rank,draft,safeUrl,validate};
 if(typeof module!=="undefined"&&module.exports)module.exports=API;
 if(!root.document)return;
 const $=id=>root.document.getElementById(id);
 const elem=(tag,content,className)=>{const e=root.document.createElement(tag);if(content!==undefined)e.textContent=String(content);if(className)e.className=className;return e};
 let records=[],chosen=null,prepared="";
 function download(filename,text,mime){
   const blob=new Blob([text],{type:mime||"text/plain;charset=utf-8"});
   const u=URL.createObjectURL(blob),a=elem("a");
   a.href=u;a.download=filename;root.document.body.append(a);a.click();a.remove();
   root.setTimeout(()=>URL.revokeObjectURL(u),150);
 }
 function viewDraft(id){
   const record=records.find(x=>x.id===id);if(!record)return;
   chosen=record;prepared=draft(record);
   $("draft").textContent=prepared;$("copy-draft").disabled=false;
   $("draft-status").textContent="Prepared for "+record.name+". No message has been sent.";
   $("draft").scrollIntoView({behavior:"instant",block:"nearest"});
 }
 function sourceLink(record){
   const a=elem("a","Official source ↗","btn small");a.href=safeUrl(record.source_url);a.target="_blank";a.rel="noopener noreferrer";return a;
 }
 function contactLine(record){
   return record.business_email?"Published business contact: "+record.business_email:"Business email not verified; use official website or published phone channel.";
 }
 function card(record,position=0,top=false){
   const article=elem("article",undefined,"p-card");article.dataset.recordId=record.id;
   const row=elem("div",undefined,"pair");
   const kind=elem("span",record.sector==="sports"?"YOUTH SPORTS":"CODING / ENRICHMENT","eyebrow");
   const badge=elem("span",(top?"#"+position+" · ":"")+score(record)+" HEURISTIC POINTS",top?"rank":"tag");
   row.append(kind,badge);
   const title=elem("h3",record.name),place=elem("p",record.city+" · "+record.buyer_group,"light");
   const proof=elem("p","Verified public operation: "+record.source_fact+".","evidence");
   const assumption=elem("p","NOT VERIFIED: unmet billing needs, overdue balances, buyer interest, decision authority or purchase intent.","warning");
   const channel=elem("p",contactLine(record),"small");
   const actions=elem("div",undefined,"actions"),prepare=elem("button","Prepare outreach","btn small primary");prepare.type="button";
   prepare.addEventListener("click",()=>viewDraft(record.id));
   actions.append(prepare,sourceLink(record));
   article.append(row,title,place,proof,assumption,channel,actions);
   return article;
 }
 function render(){
   const groups=new Set(records.map(r=>r.buyer_group));
   $("count-sites").textContent=String(records.length);
   $("count-groups").textContent=String(groups.size);
   $("count-problems").textContent=String(records.filter(x=>x.pain_verified).length);
   const best=rank(records);
   const top=$("top-prospects");top.replaceChildren();best.forEach((r,i)=>top.append(card(r,i+1,true)));
   renderDirectory();
 }
 function renderDirectory(){
   const text=$("search").value.trim().toLowerCase(),sector=$("sector").value,channel=$("verified-contact").value;
   const filtered=[...records].filter(r=>
    (!text||[r.name,r.city,r.buyer_group,r.source_fact].join(" ").toLowerCase().includes(text))
    &&(sector==="all"||sector===r.sector)
    &&(channel==="all"||(channel==="email"?Boolean(r.business_email):!r.business_email))
   ).sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name));
   const grid=$("prospect-directory");grid.replaceChildren();
   for(const r of filtered)grid.append(card(r));
   $("filtered-count").textContent=filtered.length+" of "+records.length+" records";
   $("no-results").hidden=filtered.length!==0;
 }
 function runExport(all){
   if(!records.length)return;
   if(all){download("aperture-buyer-evidence-2026-11-10.json",JSON.stringify({type:"public_research_only",observed_on:"2026-11-10",sent:0,records},null,2),"application/json");return}
   const top=rank(records);download("aperture-top-five-UNSENT-drafts.txt",top.map((r,i)=>"===== REVIEW DRAFT "+(i+1)+" / "+r.name+" =====\n"+draft(r)).join("\n\n"),"text/plain");
 }
 $("copy-draft").addEventListener("click",async()=>{
   if(!prepared)return;
   try{await root.navigator.clipboard.writeText(prepared);$("draft-status").textContent="Copied; do not send without explicit recipient/body/channel approval."}
   catch{$("draft-status").textContent="Clipboard unavailable. Use the export button."}
 });
 $("download-drafts").addEventListener("click",()=>runExport(false));
 $("export-data").addEventListener("click",()=>runExport(true));
 ["search","sector","verified-contact"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",renderDirectory));
 (async()=>{
   try{
     const response=await fetch("prospects-2026-11-10.json",{cache:"no-store"});
     if(!response.ok)throw Error("Evidence file unavailable");
     records=validate(await response.json());
     render();
   }catch(e){
     $("top-prospects").replaceChildren(elem("div","Research registry unavailable or unverified. No prospect names are displayed.","empty"));
     $("prospect-directory").replaceChildren();$("filtered-count").textContent="Source unavailable";
     $("draft-status").textContent="Unable to load source evidence; drafts disabled.";
   }
 })();
})(typeof globalThis!=="undefined"?globalThis:this);