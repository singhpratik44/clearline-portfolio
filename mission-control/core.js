/* APERTURE MISSION • CAUSAL LOOM
 * Deterministic, local-only meeting → proposal → approval → task → outcome engine.
 * This module has no fetch, DOM, network, mail, calendar write or storage side effects.
 */
(function(root){
"use strict";
const MAX={projects:35,meetings:100,tasks:250,proposals:150,events:1200};
const STATES=["todo","doing","done"];
const rx=/^[a-z0-9][a-z0-9_-]{2,70}$/i;
function str(v,max=320){return typeof v==="string"?v.replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max):"";}
function iso(v){if(!v)return null;const n=Date.parse(v);return Number.isFinite(n)?new Date(n).toISOString():null;}
function day(v){return typeof v==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T00:00:00Z"))?v:null;}
function newId(prefix){return prefix+"-"+(root.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)+Date.now().toString(36)).replace(/[^a-z0-9-]/gi,"").slice(0,50);}
function assert(test,msg){if(!test)throw Error(msg);}
const clone=o=>JSON.parse(JSON.stringify(o));
function blank(){return {schema:"aperture-mission-v1",sample:false,projects:[],meetings:[],tasks:[],proposals:[],events:[]};}
function normalize(raw){
 assert(raw&&typeof raw==="object"&&!Array.isArray(raw),"Expected a mission data object.");
 const out=blank();out.sample=raw.sample===true;
 for(const key of ["projects","meetings","tasks","proposals","events"]){
  const arr=raw[key]||[];
  assert(Array.isArray(arr)&&arr.length<=MAX[key],"Invalid or oversized "+key+" collection.");
  const ids=new Set();
  out[key]=arr.map((item,i)=>{
   assert(item&&typeof item==="object"&&!Array.isArray(item),"Invalid "+key+" row "+(i+1));
   const id=str(item.id,72);assert(rx.test(id)&&!ids.has(id),"Invalid/duplicate "+key+" id");
   ids.add(id);
   if(key==="projects"){
    const name=str(item.name,120);assert(name,"Project name required");
    return {id,name,goal:str(item.goal,550),owner:str(item.owner,90),createdAt:iso(item.createdAt)||"2026-11-10T00:00:00.000Z"};
   }
   if(key==="meetings"){
    const title=str(item.title,130),projectId=str(item.projectId,72),startsAt=iso(item.startsAt);
    assert(title&&projectId&&startsAt,"Meeting requires title, project and valid start time");
    return {id,projectId,title,startsAt,owner:str(item.owner,90),agenda:str(item.agenda,1600),notes:str(item.notes,2800),durationMinutes:Math.min(240,Math.max(15,Math.round(Number(item.durationMinutes)||45)))};
   }
   if(key==="tasks"){
    const title=str(item.title,180),projectId=str(item.projectId,72),status=STATES.includes(item.status)?item.status:"todo";
    assert(title&&projectId,"Task requires title and project");
    const blockers=Array.isArray(item.blockedBy)?[...new Set(item.blockedBy.map(x=>str(x,72)))].slice(0,20):[];
    return {id,projectId,meetingId:str(item.meetingId,72)||null,proposalId:str(item.proposalId,72)||null,title,owner:str(item.owner,90),
     due:day(item.due),status,blockedBy:blockers,source:str(item.source,500),
     createdAt:iso(item.createdAt)||"2026-11-10T00:00:00.000Z",completedAt:status==="done"?iso(item.completedAt)||"2026-11-10T00:00:00.000Z":null};
   }
   if(key==="proposals"){
    const meetingId=str(item.meetingId,72),projectId=str(item.projectId,72),title=str(item.title,180),owner=str(item.owner,90),source=str(item.source,850);
    assert(meetingId&&projectId&&title&&owner&&source,"A proposal needs a meeting, project, owner, and cited note");
    const status=item.status==="approved"?"approved":"pending";
    return {id,meetingId,projectId,title,owner,source,due:day(item.due),status,
     createdAt:iso(item.createdAt)||"2026-11-10T00:00:00.000Z",
     reviewedAt:status==="approved"?iso(item.reviewedAt):null,
     reviewer:status==="approved"?str(item.reviewer,100):null};
   }
   return {id,at:iso(item.at)||"2026-11-10T00:00:00.000Z",kind:str(item.kind,60),actor:str(item.actor,100),detail:str(item.detail,500),ref:str(item.ref,72)};
  });
 }
 const projects=new Set(out.projects.map(p=>p.id)),meetings=new Map(out.meetings.map(m=>[m.id,m])),tasks=new Map(out.tasks.map(t=>[t.id,t])),props=new Map(out.proposals.map(p=>[p.id,p]));
 for(const m of out.meetings)assert(projects.has(m.projectId),"Unknown meeting project");
 for(const t of out.tasks){
  assert(projects.has(t.projectId),"Unknown task project");
  assert(!t.meetingId||meetings.has(t.meetingId),"Unknown source meeting");
  assert(!t.proposalId||props.has(t.proposalId),"Unknown task proposal");
  assert(!t.blockedBy.includes(t.id),"Task cannot depend on itself");
  for(const b of t.blockedBy)assert(tasks.has(b),"Unknown predecessor task");
 }
 for(const p of out.proposals)assert(meetings.has(p.meetingId)&&projects.has(p.projectId)&&meetings.get(p.meetingId).projectId===p.projectId,"Invalid proposal source");
 const visiting=new Set(),done=new Set();
 function visit(id){if(done.has(id))return;assert(!visiting.has(id),"Dependency cycle detected");visiting.add(id);
  for(const b of tasks.get(id).blockedBy)visit(b);
  visiting.delete(id);done.add(id);
 }
 for(const t of out.tasks)visit(t.id);
 const attached=new Set();
 for(const t of out.tasks)if(t.proposalId){assert(props.get(t.proposalId).status==="approved","Task references unapproved proposal");assert(!attached.has(t.proposalId),"Duplicate task for same approved decision");attached.add(t.proposalId);}
 for(const p of out.proposals)if(p.status==="approved")assert(attached.has(p.id),"Approved proposal must have a linked task");
 return out;
}
function sample(){
 const s={
 schema:"aperture-mission-v1",sample:true,
 projects:[
  {id:"p-atlas",name:"ATLAS / Revenue Engine",goal:"Turn legitimate inquiries into verified commercial conversations.",owner:"Operations Lead"},
  {id:"p-orbit",name:"ORBIT / Partnerships",goal:"Validate a permissioned partner pilot with a measurable outcome.",owner:"Partnerships Lead"},
  {id:"p-signal",name:"SIGNAL / Delivery",goal:"Release a measurable pilot only after agreed operational gates.",owner:"Delivery Lead"}],
 meetings:[
  {id:"m-atlas",projectId:"p-atlas",title:"Revenue pulse / Weekly",startsAt:"2026-11-12T18:00:00Z",owner:"Operations Lead",agenda:"Lead response gaps; acquisition sources; overdue decisions.",notes:"Demo notes only: identify the three largest follow-up delays.",durationMinutes:35},
  {id:"m-orbit",projectId:"p-orbit",title:"Partner pilot / Scope",startsAt:"2026-11-13T21:00:00Z",owner:"Partnerships Lead",agenda:"Consent; buyer constraints; referral attribution; acceptance.",notes:"Demo notes only: all outreach must await written permission.",durationMinutes:45},
  {id:"m-signal",projectId:"p-signal",title:"Release gate / Validation",startsAt:"2026-11-16T17:30:00Z",owner:"Delivery Lead",agenda:"Quality gates; minimum evidence; rollback criteria.",notes:"Demo notes only: run regression tests before publication.",durationMinutes:30},
  {id:"m-cross",projectId:"p-orbit",title:"Portfolio review / Dependencies",startsAt:"2026-11-18T19:00:00Z",owner:"Program Lead",agenda:"Cross-project capacity; partner blockers; release sequence.",notes:"Demo notes only: capacity must be assessed jointly.",durationMinutes:50}],
 tasks:[
  {id:"t-lead",projectId:"p-atlas",title:"Audit unresponded inquiries",owner:"Operations Lead",due:"2026-11-13",status:"doing",blockedBy:[],source:"Synthetic operational planning scenario."},
  {id:"t-map",projectId:"p-atlas",title:"Map lead handoff owners",owner:"Operations Lead",due:"2026-11-15",status:"todo",blockedBy:["t-lead"],source:"Synthetic planning dependency."},
  {id:"t-permission",projectId:"p-orbit",title:"Document partner permission requirements",owner:"Partnerships Lead",due:"2026-11-12",status:"doing",blockedBy:[],source:"Synthetic partner requirements."},
  {id:"t-contract",projectId:"p-orbit",title:"Draft scope and attribution rule",owner:"Partnerships Lead",due:"2026-11-19",status:"todo",blockedBy:["t-permission"],source:"Synthetic planning dependency."},
  {id:"t-pilot",projectId:"p-orbit",title:"Define pilot evaluation checkpoints",owner:"Program Lead",due:"2026-11-22",status:"todo",blockedBy:["t-contract","t-map"],source:"Synthetic cross-project dependency."},
  {id:"t-tests",projectId:"p-signal",title:"Run deterministic release tests",owner:"Delivery Lead",due:"2026-11-13",status:"doing",blockedBy:[],source:"Synthetic engineering task."},
  {id:"t-ship",projectId:"p-signal",title:"Prepare release candidate",owner:"Delivery Lead",due:"2026-11-17",status:"todo",blockedBy:["t-tests"],source:"Synthetic release dependency."},
  {id:"t-results",projectId:"p-signal",title:"Set outcome comparison baseline",owner:"Analyst",due:"2026-11-23",status:"todo",blockedBy:["t-ship","t-pilot"],source:"Synthetic cross-project evidence gate."}
 ],proposals:[{id:"q-permissions",meetingId:"m-orbit",projectId:"p-orbit",title:"Draft partner approval checklist",owner:"Partnerships Lead",source:"Synthetic demo meeting notes: permission is required before outreach.",due:"2026-11-14",status:"pending"}],events:[]
 };
 return normalize(s);
}
function stamp(){return new Date().toISOString();}
function apply(state,fn,kind,actor,detail,ref){
 const next=clone(normalize(state));fn(next);
 next.events.push({id:newId("e"),at:stamp(),kind,actor:str(actor,100)||"Local operator",detail:str(detail,500),ref:str(ref,72)});
 if(next.events.length>MAX.events)next.events.splice(0,next.events.length-MAX.events);
 return normalize(next);
}
function addProject(s,input){
 const name=str(input?.name,120),owner=str(input?.owner,90);
 assert(name,"Project name is required.");
 return apply(s,next=>next.projects.push({id:newId("p"),name,goal:str(input?.goal,550),owner,createdAt:stamp()}),"project_created",owner,"Project created: "+name,"");
}
function addMeeting(s,input){
 const title=str(input?.title,130),projectId=str(input?.projectId,72),startsAt=iso(input?.startsAt);
 assert(title&&projectId&&startsAt,"Meeting title, project and valid time are required.");
 assert(s.projects.some(p=>p.id===projectId),"Select a valid project.");
 const meetingId=newId("m");
 return apply(s,next=>next.meetings.push({id:meetingId,title,projectId,startsAt,owner:str(input.owner,90),agenda:str(input.agenda,1600),notes:str(input.notes,2800),durationMinutes:Math.min(240,Math.max(15,Number(input.durationMinutes)||45))}),"meeting_created",input.owner,"Meeting created: "+title,meetingId);
}
function updateMeeting(s,id,patch){
 const m=s.meetings.find(x=>x.id===id);assert(m,"Unknown meeting");
 const notes=str(patch?.notes,2800),agenda=str(patch?.agenda,1600);
 return apply(s,next=>{const row=next.meetings.find(x=>x.id===id);row.notes=notes;row.agenda=agenda;},"meeting_notes_updated",m.owner,"Meeting notes and agenda updated",id);
}
function propose(s,input){
 const m=s.meetings.find(x=>x.id===input?.meetingId);assert(m,"Select an existing meeting.");
 const title=str(input.title,180),owner=str(input.owner,90),source=str(input.source,850),due=day(input.due);
 assert(title&&owner&&source,"Action proposal needs a title, owner, and exact evidence/note excerpt.");
 const pid=newId("q");
 return apply(s,next=>next.proposals.push({id:pid,meetingId:m.id,projectId:m.projectId,title,owner,source,due,status:"pending",createdAt:stamp(),reviewedAt:null,reviewer:null}),
  "action_proposed",owner,"Draft only: "+title,pid);
}
function approve(s,id,reviewer,confirmed){
 assert(confirmed===true,"Explicit local approval checkbox is required.");
 const p=s.proposals.find(q=>q.id===id);assert(p&&p.status==="pending","Only pending action proposals can be approved once.");
 const actor=str(reviewer,100);assert(actor,"An accountable human reviewer is required.");
 const taskId=newId("t");
 return apply(s,next=>{
  const q=next.proposals.find(a=>a.id===id);q.status="approved";q.reviewedAt=stamp();q.reviewer=actor;
  next.tasks.push({id:taskId,projectId:q.projectId,meetingId:q.meetingId,proposalId:q.id,title:q.title,owner:q.owner,
   due:q.due,status:"todo",blockedBy:[],source:q.source,createdAt:stamp(),completedAt:null});
 },"action_approved",actor,"Internal task created from approved proposal; no external action authorized.",id);
}
function addTask(s,input){
 const projectId=str(input?.projectId,72),title=str(input?.title,180),owner=str(input?.owner,90);
 assert(s.projects.some(p=>p.id===projectId)&&title,"Select a valid project and title.");
 const id=newId("t");
 return apply(s,next=>next.tasks.push({id,projectId,meetingId:null,proposalId:null,title,owner,due:day(input.due),status:"todo",blockedBy:[],source:str(input.source,500),createdAt:stamp(),completedAt:null}),"task_created",owner,"Manual task created",id);
}
function addDependency(s,taskId,prereqId,actor){
 assert(taskId!==prereqId&&s.tasks.some(t=>t.id===taskId)&&s.tasks.some(t=>t.id===prereqId),"Select two distinct existing tasks.");
 return apply(s,next=>{const t=next.tasks.find(t=>t.id===taskId);
 assert(t.status!=="done","Reopen completed tasks before changing dependencies.");
 assert(!t.blockedBy.includes(prereqId),"Dependency already exists.");
 t.blockedBy.push(prereqId);
 },"dependency_added",actor,"Task "+taskId+" requires "+prereqId,taskId);
}
function status(s,id,to,actor){
 assert(STATES.includes(to),"Unsupported task status.");
 const task=s.tasks.find(t=>t.id===id);assert(task,"Unknown task");
 if(to==="done")assert(task.blockedBy.every(x=>s.tasks.find(t=>t.id===x)?.status==="done"),"Cannot complete while predecessors are unfinished.");
 return apply(s,next=>{const t=next.tasks.find(x=>x.id===id);t.status=to;t.completedAt=to==="done"?stamp():null;},"task_status_changed",actor,"Task "+id+" → "+to,id);
}
function metrics(s,now=new Date()){
 const data=normalize(s),tmap=new Map(data.tasks.map(t=>[t.id,t]));
 const today=new Date(now).toISOString().slice(0,10);
 const soon=new Date(new Date(today+"T00:00:00Z").getTime()+7*86400000).toISOString().slice(0,10);
 const open=data.tasks.filter(t=>t.status!=="done");
 const blocked=open.filter(t=>t.blockedBy.some(id=>tmap.get(id)?.status!=="done"));
 const ready=open.filter(t=>t.blockedBy.every(id=>tmap.get(id)?.status==="done"));
 const overdue=open.filter(t=>t.due&&t.due<today);
 const dueSoon=open.filter(t=>t.due&&t.due>=today&&t.due<=soon);
 const upcoming=data.meetings.filter(m=>m.startsAt>=new Date(now).toISOString()).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
 return {totalProjects:data.projects.length,totalMeetings:data.meetings.length,totalTasks:data.tasks.length,
 open:open.length,done:data.tasks.length-open.length,blocked:blocked.length,ready:ready.length,overdue:overdue.length,
 dueSoon:dueSoon.length,pendingApprovals:data.proposals.filter(p=>p.status==="pending").length,upcoming:upcoming.length,
 blockedIds:blocked.map(t=>t.id),readyIds:ready.map(t=>t.id),overdueIds:overdue.map(t=>t.id),today};
}
function chain(s){
 const data=normalize(s),byId=new Map(data.tasks.map(t=>[t.id,t])),memo=new Map();
 function distance(t){
  if(memo.has(t.id))return memo.get(t.id);
  const deps=t.blockedBy.map(id=>byId.get(id)).filter(x=>x.status!=="done");
  const val=deps.length?1+Math.max(...deps.map(distance)):1;
  memo.set(t.id,val);return val;
 }
 return data.tasks.filter(t=>t.status!=="done").map(t=>({id:t.id,remainingPredecessorDepth:distance(t)})).sort((a,b)=>b.remainingPredecessorDepth-a.remainingPredecessorDepth);
}
function meetingBrief(s,id){
 const data=normalize(s),m=data.meetings.find(m=>m.id===id);assert(m,"Unknown meeting");
 const p=data.projects.find(p=>p.id===m.projectId);
 const tasks=data.tasks.filter(t=>t.projectId===p.id&&t.status!=="done").slice(0,8);
 const decisions=data.proposals.filter(t=>t.meetingId===m.id);
 return [
 "APERTURE / MEETING MISSION BRIEF",p.name+" • "+m.title,"When: "+m.startsAt+" | Owner: "+(m.owner||"Unassigned"),
 "GOAL: "+(p.goal||"Not set"),"AGENDA: "+(m.agenda||"Not set"),"SOURCE NOTES: "+(m.notes||"Not entered"),
 "OPEN DEPENDENCIES",...tasks.map(t=>"- "+t.title+" ["+t.status+"] → "+(t.blockedBy.join(", ")||"no predecessors")),
 "DECISION PROPOSALS",...decisions.map(q=>"- "+q.title+" | "+q.status+" | evidence: "+q.source),
 "No outside attendance, invite, mail or project write has occurred."
 ].join("\n\n");
}
function calendarFile(m){
 const event=iso(m?.startsAt);assert(event,"Meeting requires a valid start.");
 const start=new Date(event),minutes=Math.min(240,Math.max(15,Number(m.durationMinutes)||45));
 const end=new Date(start.getTime()+minutes*60000);
 const icsDate=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
 const escape=v=>str(v,1100).replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
 const uid=(m.id||"meeting")+"@aperture.local";
 return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//APERTURE//Meeting Planner//EN","BEGIN:VEVENT","UID:"+uid,
  "DTSTAMP:"+icsDate(new Date()),"DTSTART:"+icsDate(start),"DTEND:"+icsDate(end),
  "SUMMARY:"+escape(m.title||"APERTURE meeting"),"DESCRIPTION:"+escape(m.agenda||""),
  "END:VEVENT","END:VCALENDAR",""].join("\r\n");
}
root.ApertureMission={MAX,STATES,str,iso,day,blank,normalize,sample,addProject,addMeeting,updateMeeting,propose,approve,addTask,addDependency,status,metrics,chain,meetingBrief,calendarFile};
if(typeof module!=="undefined"&&module.exports)module.exports=root.ApertureMission;
})(typeof globalThis!=="undefined"?globalThis:this);
