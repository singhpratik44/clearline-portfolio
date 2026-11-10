(function(){
"use strict";
// Public sales catalog is coding-only. Keep the 20-track canonical data for legacy explorations.
const codingIds=new Set(["scratch-stories","roblox-worlds","minecraft-makers","3d-game-design","python-adventures","web-creators","mobile-prototypes","music-media-code"]);
const tracks=(window.AP_SUBJECTS||[]).filter(t=>codingIds.has(t.id));
const families=["All worlds","Creative Worlds","Code Builders","Real-World Creators"];
const $=id=>document.getElementById(id);
let family="All worlds",selected=null;
const ageLimit={"4-6":4,"7-10":7,"11-13":11,"14-17":14};
function agePass(t,age){
if(age==="all")return true;
if(age==="4-6")return t.id==="scratch-stories"||t.id==="music-media-code";
return ageLimit[age]>=t.min;
}
function experiencePass(t,x){return x==="all"||(x==="starter"&&t.level==="starter")||(x==="growing"&&t.level!=="advanced")||(x==="advanced"&&t.level==="advanced");}
function visibleTracks(){
const q=$("search").value.trim().toLowerCase(),age=$("age").value,x=$("experience").value;
return tracks.filter(t=>(family==="All worlds"||t.family===family)&&agePass(t,age)&&experiencePass(t,x)&&(!q||[t.title,t.summary,t.family,t.tools,t.future,t.output].join(" ").toLowerCase().includes(q)));
}
function element(tag,cls,content){
const node=document.createElement(tag);
if(cls)node.className=cls;
if(content!==undefined)node.textContent=content;
return node;
}
function renderCards(){
const result=visibleTracks(),container=$("cards");container.replaceChildren();
result.forEach(t=>{
const card=element("article","spec");card.id="track-"+t.id;
const top=element("div","top"),glyph=element("div","glyph",t.icon),kind=element("div","kind",t.family);
top.append(glyph,kind);
const title=element("h3","",t.title),body=element("p","",t.summary);
const bottom=element("div","bottom"),age=t.min===7?"7+":t.min+"+",difficulty=t.level==="starter"?"Starter":t.level==="growing"?"Building":"Advanced";
const meta=element("small","",age+" · "+difficulty),button=element("button","","Explore pathway ↗");
button.type="button";button.setAttribute("aria-label","Explore "+t.title+" pathway");button.addEventListener("click",()=>selectTrack(t.id,true));
bottom.append(meta,button);card.append(top,title,body,bottom);container.append(card);
});
$("result-count").textContent=result.length+" of "+tracks.length+" specializations";
$("no-results").hidden=result.length>0;
}
function renderFamilies(){
const row=$("families");row.replaceChildren();
families.forEach(name=>{
const b=element("button","",name);b.type="button";b.setAttribute("aria-pressed",String(name===family));
b.addEventListener("click",()=>{family=name;renderFamilies();renderCards();});
row.append(b);
});
}
function selectTrack(id,scroll){
const t=tracks.find(x=>x.id===id)||tracks[0];selected=t;
$("selection-label").textContent=t.family+" / SPECIALIZATION";
$("detail-title").textContent=t.title;
$("detail-description").textContent=t.summary+" This is a potential learning direction, customized to readiness, goals and available instructors.";
$("detail-output").textContent=t.output;
$("detail-future").textContent=t.future;
$("detail-meta").replaceChildren();
[t.min+"+ suggested",t.level==="advanced"?"Advanced foundation":t.level==="growing"?"Building skills":"Beginner-friendly",t.tools].forEach(x=>$("detail-meta").append(element("span","",x)));
[["1", "Imagine",t.spark],["2","Build",t.build],["3","Understand",t.explain],["4","Create",t.show]].forEach(([i,title,desc])=>{
$("step-"+i+"-title").textContent=title;$("step-"+i+"-desc").textContent=desc;
});
$("detail-note").textContent=(t.min>=14?"This is an advanced direction that may require Python fundamentals, appropriate tools and instructor assessment. ":"All pathways are adapted to developmental readiness and tool access. ")+"This is an illustrative learning roadmap—not a promise of completion in one lesson.";
const path=new URL("../studio/",location.href);path.searchParams.set("interest",t.studio);
path.searchParams.set("from",t.id);
$("studio-link").href=path.href;
$("universe-link").href="../universe/?track="+encodeURIComponent(t.id)+"#explore";
$("lesson-link").href="../book/?track="+encodeURIComponent(t.id);
const subj="APERTURE Learning specialization: "+t.title;
const body="Hello APERTURE Learning,\n\nI'm interested in the "+t.title+" specialization and would like to discuss a customized learning pathway.\n\nPlease share the appropriate prerequisites, instructor availability and how lessons are scheduled.\n";
$("coach-link").href="mailto:parry.s.2324@gmail.com?subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(body);
$("copy-status").textContent="";
const url=new URL(location.href);url.searchParams.set("track",t.id);history.replaceState(null,"",url.pathname+url.search+url.hash);
if(scroll)$("pathway").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"start"});
}
$("copy-plan").addEventListener("click",async()=>{
const t=selected; if(!t)return;
const body="APERTURE Learning specialization roadmap\n\n"+t.title+"\n"+t.summary+"\nTools: "+t.tools+"\nRecommended starting age: "+t.min+"+\n\n1. Imagine: "+t.spark+"\n2. Build: "+t.build+"\n3. Understand: "+t.explain+"\n4. Create: "+t.show+"\n\nPotential project: "+t.output+"\nPossible longer-term direction: "+t.future+"\n\nOne private lesson costs $65 and does not include a full specialization. Schedule and readiness are confirmed separately.\n\nExplore: "+location.origin+location.pathname+"?track="+t.id;
try{await navigator.clipboard.writeText(body);$("copy-status").textContent="Roadmap copied. Share it with a parent or instructor.";}
catch(e){$("copy-status").textContent="Clipboard access is unavailable in this browser.";}
});
$("search").addEventListener("input",renderCards);
$("age").addEventListener("change",renderCards);
$("experience").addEventListener("change",renderCards);
renderFamilies();renderCards();
const queryId=new URLSearchParams(location.search).get("track");
selectTrack(tracks.some(t=>t.id===queryId)?queryId:"scratch-stories",false);
})();