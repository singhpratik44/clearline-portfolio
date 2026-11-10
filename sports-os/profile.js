"use strict";
(function(){
 const $=id=>document.getElementById(id);
 let profile=null;
 const fields=["name","profession","location","bio","skills","evidence","credentials","url"];
 const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
 function secureLink(raw){
   if(!raw)return "";
   try{const u=new URL(raw);if(u.protocol!=="https:"||u.username||u.password)throw Error("https");return u.href}catch{return null}
 }
 function build(){
   if(!$("ack").checked||!$("profile-form").reportValidity())return null;
   const p={};
   for(const f of fields)p[f]=$(f).value.trim();
   p.url=secureLink(p.url);
   if(p.url===null){$("profile-message").textContent="Only HTTPS links without embedded credentials are accepted.";return null}
   p.skills=p.skills.split(",").map(s=>s.trim()).filter(Boolean).slice(0,15);
   p.credential_state="self-reported-unverified";
   p.published=false;
   p.generated_at=new Date().toISOString();
   return p;
 }
 function preview(){
   const p=build();if(!p)return;
   profile=p;
   $("profile-preview").replaceChildren();
   const list=[
     p.name,p.profession,p.location,"MISSION / APPROACH",p.bio,
     "SKILLS",p.skills.length?p.skills.join(" · "):"Not provided",
     "WORK SAMPLE / EVIDENCE",p.evidence||"Not provided",
     "CREDENTIALS · SELF-REPORTED",p.credentials||"Not provided",
     "PORTFOLIO URL",p.url||"Not provided",
     "All claims self-reported; no independent verification or employment endorsement."
   ];
   const preview=$("profile-preview");
   list.forEach((entry,i)=>{
     const n=document.createElement(i===0?"h3":i===1?"strong":"p");
     n.style.margin=i===0?"0 0 6px":"10px 0";
     if([3,5,7,9,11].includes(i))n.style.color="#deff75";
     n.textContent=entry;preview.append(n);
   });
   $("export-json").disabled=false;$("export-html").disabled=false;
   $("profile-message").textContent="Draft created locally. Review your claims before sharing.";
 }
 function file(name,body,mime){
   const u=URL.createObjectURL(new Blob([body],{type:mime||"text/plain"}));
   const a=document.createElement("a");a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),100);
 }
 function htmlExport(){
   if(!profile)return;
   const p=profile;
   const skillItems=p.skills.map(s=>"<li>"+esc(s)+"</li>").join("");
   const portfolioLink=p.url?'<p><a href="'+esc(p.url)+'" rel="noopener noreferrer">'+esc(p.url)+"</a></p>":"";
   const page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(p.name)+' — Sports Career Portfolio</title><style>body{font:16px/1.7 system-ui;margin:0;padding:35px;background:#091820;color:#eff7f2}main{max-width:850px;margin:auto}h1{font-size:clamp(36px,6vw,62px);line-height:1.1}h2{margin-top:33px;color:#d9ff72}a{color:#9edbdd}.note{border-left:3px solid #e4b57a;padding:12px 18px;background:#1f3238}li{margin:5px 0}</style></head><body><main><p>INDEPENDENT PROFESSIONAL PORTFOLIO</p><h1>'+esc(p.name)+'</h1><p>'+esc(p.profession)+' · '+esc(p.location)+'</p><h2>Approach</h2><p>'+esc(p.bio)+'</p><h2>Skills</h2><ul>'+skillItems+'</ul><h2>Experience / work sample</h2><p>'+esc(p.evidence||"Not provided")+'</p><h2>Credentials — self-reported</h2><p>'+esc(p.credentials||"Not provided")+'</p>'+portfolioLink+'<p class="note">All claims are self-reported, not independently verified. This portfolio does not attest licensure, endorsement or organizational affiliation.</p></main></body></html>';
   file("aperture-sports-profile.html",page,"text/html;charset=utf-8");
 }
 $("profile-form").addEventListener("submit",event=>{event.preventDefault();preview()});
 $("export-json").addEventListener("click",()=>{if(profile)file("aperture-sports-profile.json",JSON.stringify(profile,null,2),"application/json;charset=utf-8")});
 $("export-html").addEventListener("click",htmlExport);
 $("clear").addEventListener("click",()=>{
   $("profile-form").reset();profile=null;
   $("profile-preview").textContent="Session cleared. No profile data remains in this app.";
   $("export-json").disabled=true;$("export-html").disabled=true;
   $("profile-message").textContent="Cleared from this page's memory. Previously downloaded files are not erased.";
 });
})();
