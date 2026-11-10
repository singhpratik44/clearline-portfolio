"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const state={jobs:[],saved:new Set()};
 const safeLink=url=>{try{const u=new URL(url);return u.protocol==="https:"&&["job-boards.greenhouse.io","workforcenow.adp.com","www.teamworkonline.com","careers.nba.com"].includes(u.hostname)?u.href:null}catch{return null}};
 const node=(tag,className,text)=>{const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=String(text);return x};
 const recency=item=>{
   if(item.status!=="confirmed-active"||!item.verified_at)return false;
   const date=Date.parse(item.verified_at);
   return Number.isFinite(date)&&date<=Date.now()+300000&&Date.now()-date<=7*24*3600*1000;
 };
 function save(){ $("metric-saved").textContent=String(state.saved.size);render()}
 function download(){
   const items=state.jobs.filter(x=>state.saved.has(x.id)).map(({id,title,employer,official_url,status,verified_at,location})=>({id,title,employer,official_url,status,verified_at,location}));
   const data={exported_at:new Date().toISOString(),note:"Research shortlist only. Confirm vacancy and eligibility on employer source before acting.",listings:items};
   const u=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
   const a=document.createElement("a");a.href=u;a.download="aperture-sports-shortlist.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),100);
 }
 function displayStatus(job){
   if(recency(job))return {text:"ATS confirmed · recheck before applying",cls:"ok"};
   if(job.status==="not-found")return {text:"ATS ID not found",cls:"no"};
   if(job.status==="confirmed-active")return {text:"Confirmation stale · review",cls:"warn"};
   return {text:"Review required",cls:"warn"};
 }
 function jobCard(job){
   const article=node("article","card");article.dataset.jobId=job.id;
   const row=node("div","row");const eyebrow=node("div","eyebrow",job.employer);
   const tag=displayStatus(job);const status=node("span","tag "+tag.cls,tag.text);row.append(eyebrow,status);
   const title=node("h3","",job.title);
   const meta=node("div","meta");
   [job.location,job.work_mode,job.type].filter(Boolean).forEach(x=>meta.append(node("span","pill",x)));
   const pay=node("p","muted",job.pay||"Pay not confirmed");
   const tags=node("div","tags");(job.skill_tags||[]).slice(0,6).forEach(x=>tags.append(node("span","pill",x)));
   const details=node("details","");const sum=node("summary","muted","Skills and source verification");
   const ul=node("ul","steps");(job.requirements||[]).forEach(v=>ul.append(node("li","",v)));
   const source=node("p","subtle",job.verification_note||"No independent source confirmation.");
   const checked=node("p","subtle","Source observed: "+(job.observed_on||"not recorded")+" · ATS check: "+(job.checked_at||"not recorded")+(job.verified_at?" · Matched: "+job.verified_at:""));
   details.append(sum,ul,source,checked);
   const actions=node("div","actions");
   const official=safeLink(job.official_url);
   if(official){const a=node("a","btn primary","Open official source ↗");a.href=official;a.rel="noopener noreferrer";a.target="_blank";actions.append(a)}
   const button=node("button","btn",state.saved.has(job.id)?"Remove from shortlist":"Save to shortlist");
   button.type="button";button.setAttribute("aria-pressed",String(state.saved.has(job.id)));
   button.addEventListener("click",()=>{state.saved.has(job.id)?state.saved.delete(job.id):state.saved.add(job.id);save()});
   actions.append(button);
   article.append(row,title,meta,pay,tags,details,actions);
   return article;
 }
 function filtered(){
   const text=$("query").value.trim().toLowerCase();
   const lane=$("lane").value, mode=$("mode").value, verification=$("verification").value;
   return state.jobs.filter(job=>{
     const haystack=[job.employer,job.title,job.location,job.sport,...(job.skill_tags||[])].join(" ").toLowerCase();
     return (!text||haystack.includes(text))&&(lane==="all"||job.category===lane)&&(mode==="all"||job.work_mode===mode)&&(verification==="all"||verification===job.status && (verification!=="confirmed-active"||recency(job)));
   });
 }
 function render(){
   const list=$("job-list");list.replaceChildren();
   const items=filtered();items.forEach(x=>list.append(jobCard(x)));
   $("empty-results").hidden=items.length>0;
 }
 function initData(data){
   if(data.schema_version!==2||!Array.isArray(data.listings))throw Error("Invalid registry schema");
   state.jobs=data.listings.filter(x=>typeof x.id==="string"&&typeof x.title==="string"&&typeof x.employer==="string"&&safeLink(x.official_url));
   $("metric-total").textContent=String(state.jobs.length);
   $("metric-verified").textContent=String(state.jobs.filter(recency).length);
   const date=data.generated_at?new Date(data.generated_at):null;
   $("feed-time").textContent=date&&Number.isFinite(date.valueOf())?"Snapshot: "+date.toLocaleDateString():"Source snapshot";
   $("feed-notice").textContent="ATS confirmations require an exact matching ID and title. All other listings require manual review; even confirmed roles can close without notice.";
   render();
 }
 async function load(){
   try{
     const res=await fetch("opportunities.json",{cache:"no-store"});
     if(!res.ok)throw Error("Opportunity feed not published");
     initData(await res.json());
   }catch{
     $("job-list").replaceChildren(node("div","empty","The verified opportunity feed could not be loaded. No listings are being presented as confirmed."));
     $("feed-time").textContent="Feed unavailable";
     $("feed-notice").textContent="Visit the NBA careers portal directly or retry after the next verified release.";
   }
 }
 ["query","lane","mode","verification"].forEach(id=>$(id).addEventListener(id==="query"?"input":"change",render));
 $("clear-filters").addEventListener("click",()=>{$("query").value="";["lane","mode","verification"].forEach(id=>$(id).value="all");render()});
 $("export-shortlist").addEventListener("click",download);
 load();
})();