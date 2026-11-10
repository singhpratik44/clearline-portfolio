/* APERTURE CAUSAL LOOM • spatial, temporal, evidence-linked interactive view.
   Pure canvas rendering of local meeting/project data. Public research fetched same-origin. */
(function(root){
"use strict";
const M=root.ApertureMissionUI,C=root.ApertureMission;
if(!M||!C)throw Error("Mission workspace must initialize before causal visualization");
const $=id=>document.getElementById(id);
const canvas=$("loom"),ctx=canvas.getContext("2d");
let width=0,height=0,dpr=1,mode="all",horizon=28,hit=[],last=0,visible=true;
const gentle=!root.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shades={meeting:"#6ce4d4",proposal:"#bfa2ff",task:"#e3ff9a",blocked:"#fa9987"};
const make=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=String(content);return n;};
const researchCount=10;
function coordinates(){
 const state=M.getState(),scope=M.scope(),active=M.getSelected(),projects=state.projects.filter(p=>scope==="all"||p.id===scope).slice(0,7);
 const stat=C.metrics(state),base=Date.parse(new Date().toISOString().slice(0,10)+"T00:00:00Z");
 const nodes=[];const colliding=new Map();
 for(let i=0;i<projects.length;i++){
  const p=projects[i],events=[
   ...state.meetings.filter(m=>m.projectId===p.id).map(m=>({id:m.id,kind:"meeting",day:m.startsAt.slice(0,10),title:m.title})),
   ...state.proposals.filter(q=>q.projectId===p.id).map(q=>({id:q.id,kind:"proposal",day:q.due||q.createdAt.slice(0,10),title:q.title})),
   ...state.tasks.filter(t=>t.projectId===p.id).map(t=>({id:t.id,kind:"task",day:t.due||t.createdAt.slice(0,10),title:t.title}))
  ];
  for(const n of events){
   const delta=(Date.parse(n.day+"T00:00:00Z")-base)/86400000;
   const day=Math.max(-35,Math.min(120,delta));
   const angle=-Math.PI*.82+((day+35)/155)*Math.PI*1.80;
   const key=i+":"+Math.round(day/2),number=colliding.get(key)||0;colliding.set(key,number+1);
   const rx=Math.min(width*.40,width*.22+i*33),ry=Math.min(height*.34,height*.12+i*26);
   const spacing=number*13;
   const x=width*.50+Math.cos(angle)*rx-Math.sin(angle)*spacing;
   const y=height*.50+Math.sin(angle)*ry+Math.cos(angle)*spacing*.55;
   const blocked=n.kind==="task"&&stat.blockedIds.includes(n.id);
   nodes.push({...n,projectId:p.id,projectIndex:i,x,y,days:delta,
    color:blocked?shades.blocked:shades[n.kind],blocked,
    focused:active?.kind===n.kind&&active?.id===n.id,
    dimmed:delta>horizon,
    filtered:mode==="meetings"&&n.kind!=="meeting"||mode==="tasks"&&n.kind!=="task"||mode==="blocked"&&!blocked
   });
  }
 }
 return {projects,nodes:nodes.slice(0,95),stat};
}
function strokeLink(a,b,color,highlight){
 const cx=width*.50,cy=height*.50;
 ctx.beginPath();ctx.moveTo(a.x,a.y);
 ctx.bezierCurveTo(cx+(a.x-cx)*.20,cy+(a.y-cy)*.24,cx+(b.x-cx)*.20,cy+(b.y-cy)*.24,b.x,b.y);
 ctx.strokeStyle=color;ctx.lineWidth=highlight?2.6:1.4;ctx.globalAlpha=highlight?1:.52;ctx.stroke();ctx.globalAlpha=1;
}
function render(frame=0){
 if(!width||!height)return;
 const w=width,h=height,cx=w*.50,cy=h*.50;
 ctx.clearRect(0,0,w,h);
 const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.68);
 glow.addColorStop(0,"#234752");glow.addColorStop(.52,"#102734");glow.addColorStop(1,"#0a1723");
 ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 for(let i=0;i<90;i++){
  const x=((i*139.274)%997)/997*w,y=((i*283.631)%791)/791*h;
  ctx.fillStyle=i%7===0?"#b9e1ba55":"#9fc6d822";ctx.fillRect(x,y,i%7===0?1.5:1,i%7===0?1.5:1);
 }
 const {projects,nodes}=coordinates();
 for(let i=projects.length-1;i>=0;i--){
  const rx=Math.min(w*.40,w*.22+i*33),ry=Math.min(h*.34,h*.12+i*26);
  ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,-.10,0,Math.PI*2);
  ctx.setLineDash(i%2?[3,6]:[]);ctx.lineWidth=i===0?1.5:1;
  ctx.strokeStyle=["#7ed9cf60","#dfff8760","#bfa5ff4d","#ffbd9250"][i%4];ctx.stroke();ctx.setLineDash([]);
  if(w>620){
   ctx.font="750 9px ui-monospace,monospace";ctx.fillStyle="#9bc3ca";ctx.textAlign="left";
   ctx.fillText(projects[i].name.slice(0,27).toUpperCase(),20,122+i*20);
  }
 }
 const sweep=-Math.PI*.82+((horizon+35)/155)*Math.PI*1.80;
 ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(sweep)*Math.min(w*.45,380),cy+Math.sin(sweep)*Math.min(h*.38,190));
 ctx.strokeStyle="#dfff8790";ctx.lineWidth=1.8;ctx.stroke();
 const core=ctx.createRadialGradient(cx,cy,0,cx,cy,40);
 core.addColorStop(0,"#2e5549");core.addColorStop(1,"#112d35");
 ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2);ctx.fillStyle=core;ctx.fill();ctx.strokeStyle="#c5e9a09c";ctx.lineWidth=1.7;ctx.stroke();
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle="#dcff92";ctx.font="950 19px ui-monospace,monospace";ctx.fillText("A/",cx,cy-5);
 ctx.fillStyle="#b4cfd0";ctx.font="750 7px ui-monospace,monospace";ctx.fillText("ORIGIN",cx,cy+13);
 const by=new Map(nodes.map(n=>[n.id,n])),state=M.getState(),active=M.getSelected();
 for(const q of state.proposals){
  const a=by.get(q.meetingId),b=by.get(q.id);if(a&&b&&!a.filtered&&!b.filtered)strokeLink(a,b,"#bfa2ff",active?.id===a.id||active?.id===b.id);
 }
 for(const t of state.tasks){
  if(t.proposalId){const a=by.get(t.proposalId),b=by.get(t.id);if(a&&b&&!a.filtered&&!b.filtered)strokeLink(a,b,"#9ce3b3",active?.id===a.id||active?.id===b.id);}
  for(const id of t.blockedBy){const a=by.get(id),b=by.get(t.id);if(a&&b&&!a.filtered&&!b.filtered)strokeLink(a,b,"#ff958c",active?.id===a.id||active?.id===b.id);}
 }
 hit=[];
 for(const n of nodes){
  if(n.filtered)continue;
  const opacity=n.dimmed?.25:1;
  const radius=(n.kind==="meeting"?8:n.kind==="proposal"?6.5:6.5)*(n.focused?1.5:1);
  ctx.globalAlpha=opacity;
  const aura=ctx.createRadialGradient(n.x,n.y,1,n.x,n.y,radius*4);
  aura.addColorStop(0,n.color+"c0");aura.addColorStop(.37,n.color+"33");aura.addColorStop(1,n.color+"00");
  ctx.fillStyle=aura;ctx.beginPath();ctx.arc(n.x,n.y,radius*4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(n.x,n.y,radius,0,Math.PI*2);
  ctx.fillStyle=n.color;ctx.fill();ctx.strokeStyle=n.focused?"#ffffff":"#e1f6ee88";ctx.lineWidth=n.focused?3:1;ctx.stroke();
  if(n.focused||(n.kind==="meeting"&&w>680&&n.days<=horizon)){
   ctx.font="750 10px ui-monospace,monospace";ctx.textBaseline="bottom";
   ctx.textAlign=n.x>w*.68?"right":"left";ctx.fillStyle="#e4f5e9";
   ctx.fillText(n.title.slice(0,w>700?29:16),n.x+(n.x>w*.68?-11:11),n.y-9);
  }
  hit.push({kind:n.kind,id:n.id,x:n.x,y:n.y,r:Math.max(17,radius*2)});
 }
 ctx.globalAlpha=1;
 if(!nodes.length){
  ctx.textAlign="center";ctx.fillStyle="#d4ffd9";ctx.font="850 15px ui-monospace,monospace";
  ctx.fillText("CREATE A CAUSAL THREAD",cx,cy+61);
  ctx.font="12px system-ui";ctx.fillStyle="#9ebac2";ctx.fillText("MEETING  →  DECISION  →  EXECUTION",cx,cy+85);
 }
 ctx.fillStyle="#87b0b8";ctx.font="740 9px ui-monospace,monospace";ctx.textAlign="left";ctx.fillText("EVIDENCE / THEN",21,h-52);
 ctx.textAlign="right";ctx.fillText("FUTURE +"+horizon+"D",w-20,h-52);
}
function resize(){
 const r=canvas.getBoundingClientRect();
 if(!r.width||!r.height)return;
 width=r.width;height=r.height;dpr=Math.min(root.devicePixelRatio||1,2);
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 render();
}
canvas.addEventListener("pointerup",e=>{
 const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 const candidates=hit.filter(n=>Math.hypot(n.x-x,n.y-y)<=n.r);
 candidates.sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));
 if(candidates.length)M.select(candidates[0].kind,candidates[0].id);
});
for(const btn of document.querySelectorAll("[data-mode]"))btn.addEventListener("click",()=>{
 mode=btn.dataset.mode;
 document.querySelectorAll("[data-mode]").forEach(b=>b.setAttribute("aria-pressed",String(btn===b)));
 render();
});
$("horizon").addEventListener("input",e=>{horizon=Number(e.target.value);$("horizon-label").textContent="+"+horizon+" DAYS";render();});
root.addEventListener("aperture:mission-changed",render);
root.addEventListener("resize",resize,{passive:true});
if(root.ResizeObserver)new ResizeObserver(resize).observe(canvas);
function tick(time){
 if(!visible)return;
 if(gentle&&time-last>160){last=time;render(time);}
 root.requestAnimationFrame(tick);
}
document.addEventListener("visibilitychange",()=>{
 visible=!document.hidden;
 if(visible){render();if(gentle)root.requestAnimationFrame(tick);}
});
async function research(){
 const cards=$("papers");
 try{
  const response=await fetch("./research.json",{cache:"no-store"});
  if(!response.ok)throw Error("Research register HTTP "+response.status);
  const r=await response.json();
  if(!Array.isArray(r.studies)||r.studies.length!==researchCount)throw Error("Ten verified records expected.");
  cards.replaceChildren();
  r.studies.forEach((s,i)=>{
   const card=make("article","paper"),link=make("a",null,s.title+" ↗");
   link.href=s.url;link.target="_blank";link.rel="noopener noreferrer";
   card.append(make("span","number",String(i+1).padStart(2,"0")+" / "+s.date),link,make("p",null,s.meeting_impact),
    make("small",null,s.status.toUpperCase()+" / "+s.source),make("p","muted",s.caveat));
   cards.append(card);
  });
  $("research-count").textContent=r.studies.length+" STUDIES";
  $("sources").replaceChildren();
  for(const src of r.discovery_sources||[]){
   const a=make("a",null,src.name+" ↗");a.href=src.homepage;a.target="_blank";a.rel="noopener noreferrer";a.title=src.status;
   $("sources").append(a);
  }
 }catch(e){cards.replaceChildren(make("div","empty","Research metadata unavailable: "+e.message));$("research-count").textContent="UNAVAILABLE";}
}
resize();research();if(gentle)root.requestAnimationFrame(tick);
root.CausalLoomView={render,resize};
})(typeof globalThis!=="undefined"?globalThis:this);
