/* APERTURE CAUSAL LOOM — local meeting / project operating interface.
   No network access or automatic external actions. */
(function(root){
"use strict";
const C=root.ApertureMission,V=root.ApertureMissionVault;
if(!C||!V)throw Error("Mission engine is unavailable");
const $=id=>document.getElementById(id);
const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const dateTime=x=>x?new Date(x).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"}):"Not set";
const shortDate=x=>x?new Date(x+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"}):"No deadline";
let state=C.sample(),selected=null,scope="all",history=[],jumpTo="project-module";
const selectedRow=()=>!selected?null:(selected.kind==="meeting"?state.meetings:selected.kind==="task"?state.tasks:selected.kind==="proposal"?state.proposals:state.projects).find(x=>x.id===selected.id)||null;
const pby=id=>state.projects.find(p=>p.id===id);
const mby=id=>state.meetings.find(m=>m.id===id);
const tby=id=>state.tasks.find(t=>t.id===id);
const inScope=id=>scope==="all"||scope===id;
function toast(msg,bad=false){
 const t=$("toast");t.textContent=String(msg||"").slice(0,400);t.className="toast show"+(bad?" error":"");
 clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.className="toast",3300);
}
function notify(){
 root.dispatchEvent(new CustomEvent("aperture:mission-changed"));
}
function select(kind,id){selected={kind,id};inspector();meetingList();taskList();proposalList();notify();}
function dirty(msg){
 $("privacy-state").textContent=(state.sample?"SYNTHETIC DEMO WITH CHANGES":"PRIVATE IN MEMORY")+" · UNSAVED";
 toast(msg||"Local change recorded. Encrypted save is optional.");
}
function change(action,msg){
 try{const prev=state;state=C.normalize(action(state));history.push(prev);if(history.length>15)history.shift();
  render();dirty(msg);return true;
 }catch(e){toast(e.message||String(e),true);return false;}
}
function options(id,items,fmt,blank){
 const el=$(id),before=el.value;el.replaceChildren();
 if(blank){const x=node("option",null,blank);x.value="";el.append(x);}
 for(const item of items){const x=node("option",null,fmt(item));x.value=item.id;el.append(x);}
 if(items.some(i=>i.id===before))el.value=before;
}
function controls(){
 options("filter-project",state.projects,p=>p.name);
 const el=$("filter-project"),all=node("option",null,"ALL PROJECTS");all.value="all";el.insertBefore(all,el.firstChild);
 if(scope!=="all"&&!state.projects.some(p=>p.id===scope))scope="all";el.value=scope;
 for(const id of ["meeting-project","task-project","calendar-project"])options(id,state.projects,p=>p.name,"Choose project");
 options("proposal-meeting",state.meetings,m=>m.title+" / "+(pby(m.projectId)?.name||""),"Choose source meeting");
 for(const id of ["dep-task","dep-blocker"])options(id,state.tasks,t=>t.title,"Choose task");
}
function stats(){
 const x=C.metrics(state),visible=state.tasks.filter(t=>inScope(t.projectId)),projectMeetings=state.meetings.filter(m=>inScope(m.projectId));
 const ready=visible.filter(t=>x.readyIds.includes(t.id)).length,blocked=visible.filter(t=>x.blockedIds.includes(t.id)).length;
 $("stat-meetings").textContent=projectMeetings.length;$("stat-ready").textContent=ready;$("stat-blocked").textContent=blocked;
 $("stat-overdue").textContent=visible.filter(t=>x.overdueIds.includes(t.id)).length+" overdue";
 $("stat-proposals").textContent=state.proposals.filter(q=>inScope(q.projectId)&&q.status==="pending").length;
 $("stat-upcoming").textContent=x.upcoming+" upcoming across portfolio";
 $("risk-box").dataset.risk=String(blocked>0||x.overdue>0);
 $("meeting-count").textContent=projectMeetings.length+" PORTALS";$("task-count").textContent=visible.length+" ACTIONS";
 $("proposal-count").textContent=state.proposals.filter(q=>inScope(q.projectId)&&q.status==="pending").length+" PENDING";
 $("undo").disabled=!history.length;
 $("canvas-scope").textContent=scope==="all"?"ALL PROJECTS":pby(scope)?.name||"PROJECT";
 $("canvas-meta").textContent=state.tasks.length+" ACTIONS / "+state.meetings.length+" MEETING PORTALS";
}
function item(kind,obj,title,sub,extra){
 const row=node("div","item"+(selected?.kind===kind&&selected.id===obj.id?" selected":""));
 const b=node("button","title-button");b.type="button";
 b.append(node("span","title",title),node("span","subline",sub));
 b.addEventListener("click",()=>select(kind,obj.id));row.append(b);
 if(extra)row.append(extra);else row.append(node("span","pill",kind.toUpperCase()));
 return row;
}
function meetingList(){
 const parent=$("meeting-list");parent.replaceChildren();
 const ms=state.meetings.filter(m=>inScope(m.projectId)).sort((a,b)=>a.startsAt.localeCompare(b.startsAt));
 if(!ms.length)parent.append(node("div","empty","No meetings in this view. Compose a meeting to begin."));
 for(const m of ms)parent.append(item("meeting",m,m.title,(pby(m.projectId)?.name||"")+" / "+dateTime(m.startsAt)));
 const active=selected?.kind==="meeting"?selectedRow():null;
 $("meeting-editor").disabled=!active;$("save-notes").disabled=!active;
 $("download-brief").disabled=!active;$("download-ics").disabled=!active;$("prep-meeting").disabled=!active;
 $("meeting-editor").value=active?.notes||"";
}
function taskList(){
 const parent=$("task-list"),m=C.metrics(state);parent.replaceChildren();
 const visible=state.tasks.filter(t=>inScope(t.projectId)).sort((a,b)=>Number(m.blockedIds.includes(b.id))-Number(m.blockedIds.includes(a.id))||(a.due||"9999").localeCompare(b.due||"9999"));
 if(!visible.length)parent.append(node("div","empty","No tasks yet. Create a manual task or approve a meeting proposal."));
 for(const t of visible){
  const blocked=m.blockedIds.includes(t.id);
  const group=node("div","task-actions");
  group.append(node("span","pill"+(blocked?" block":t.status==="done"?" ready":""),t.status==="done"?"DONE":blocked?"BLOCKED":t.status==="doing"?"IN MOTION":"READY"));
  const b=node("button","tiny-btn",t.status==="done"?"Reopen":t.status==="doing"?"Complete":"Start");
  b.type="button";b.title=blocked?"Must complete predecessor tasks first":"Update local task status";
  b.addEventListener("click",()=>change(s=>C.status(s,t.id,t.status==="done"?"todo":t.status==="doing"?"done":"doing","Local operator"),"Task status updated locally."));
  group.append(b);
  parent.append(item("task",t,t.title,(pby(t.projectId)?.name||"")+" / "+(t.owner||"No owner")+" / "+shortDate(t.due),group));
 }
}
function proposalList(){
 const parent=$("proposal-list");parent.replaceChildren();
 const props=state.proposals.filter(p=>inScope(p.projectId)).sort((a,b)=>a.status.localeCompare(b.status));
 if(!props.length)parent.append(node("div","empty","No action proposals yet. Anchor a draft to a meeting and source note."));
 for(const q of props){
  const group=node("div","task-actions");group.append(node("span","pill"+(q.status==="approved"?" ready":""),q.status.toUpperCase()));
  if(q.status==="pending"){
   const b=node("button","tiny-btn","Review + approve");b.type="button";
   b.addEventListener("click",()=>{
    const actor=$("reviewer").value.trim(),checked=$("approve-check").checked;
    if(!actor||!checked){toast("Enter a reviewer and check internal task creation authorization.",true);return;}
    const seen=new Set(state.tasks.map(t=>t.id));
    if(change(s=>C.approve(s,q.id,actor,checked),"Approved locally: a linked internal task was created; no external action occurred.")){
      const t=state.tasks.find(t=>!seen.has(t.id));if(t)select("task",t.id);$("approve-check").checked=false;
    }
   });group.append(b);
  }
  parent.append(item("proposal",q,q.title,(mby(q.meetingId)?.title||"")+" / "+q.owner,group));
 }
}
function inspector(){
 let row=selectedRow();
 if(!row&&state.meetings.length){const m=state.meetings.find(x=>inScope(x.projectId))||state.meetings[0];selected={kind:"meeting",id:m.id};row=m;}
 const body=$("inspector-body");body.replaceChildren();
 const fact=(label,text)=>{const d=node("div","lens-fact");d.append(node("b",null,label),node("p",null,text||"Not established"));body.append(d);};
 if(!row){
  $("inspector-title").textContent="A universe waiting to happen.";$("inspector-subtitle").textContent="Create your first meeting and project.";
  fact("FIRST MOVE","Make a project, set a goal, and prepare a meeting whose decisions can become accountable work.");
  $("inspector-next").textContent="Every event will become part of the causal system.";jumpTo="project-module";return;
 }
 $("inspector-title").textContent=row.title||row.name;
 $("inspector-subtitle").textContent=selected.kind.toUpperCase()+" / "+(pby(row.projectId)?.name||"CAUSAL ROOT");
 if(selected.kind==="meeting"){
  fact("WHEN",dateTime(row.startsAt));fact("FACILITATOR",row.owner);fact("AGENDA",row.agenda);
  fact("SOURCE NOTES",row.notes);fact("DECISIONS",state.proposals.filter(q=>q.meetingId===row.id).length+" proposal(s) linked");
  $("inspector-next").textContent="Record notes and propose an evidence-backed action after review.";jumpTo="meeting-module";
 }else if(selected.kind==="task"){
  const blockers=row.blockedBy.filter(id=>tby(id)?.status!=="done").map(id=>tby(id)?.title||id);
  fact("OWNER",row.owner);fact("DUE",shortDate(row.due));fact("STATUS",row.status.toUpperCase());
  fact("UNFINISHED PREDECESSORS",blockers.join(" • ")||"None");fact("EVIDENCE",row.source);
  $("inspector-next").textContent=blockers.length?"Complete the predecessors first.":"An owner may advance this task locally.";jumpTo="project-module";
 }else if(selected.kind==="proposal"){
  fact("SOURCE MEETING",mby(row.meetingId)?.title);fact("CITED NOTE",row.source);fact("OWNER",row.owner);fact("DECISION STATE",row.status);
  fact("SIDE EFFECTS","No calendar, email, finance, or external project changes authorized.");
  $("inspector-next").textContent="A named human must explicitly approve internal task creation.";jumpTo="decision-module";
 }else{
  fact("PROJECT GOAL",row.goal);fact("ACCOUNTABLE OWNER",row.owner);
  fact("TASKS",state.tasks.filter(t=>t.projectId===row.id).length+" work threads");
  $("inspector-next").textContent="Add a meeting or task and connect dependencies.";jumpTo="project-module";
 }
}
function activity(){
 const list=$("activity-log");list.replaceChildren();
 const events=state.events.slice(-14).reverse();
 if(!events.length){list.append(node("div","empty","The local activity trail will appear as meetings, tasks and reviews change."));return;}
 for(const e of events){
  const card=node("div","logitem"),dot=node("span","dot"),detail=node("div");
  detail.append(node("b",null,e.kind.replace(/_/g," ").toUpperCase()),
   node("p",null,e.detail),node("small",null,dateTime(e.at)+" / "+e.actor));
  card.append(dot,detail);list.append(card);
 }
}
function render(){
 state=C.normalize(state);
 if(selected&&!selectedRow())selected=null;
 controls();stats();inspector();meetingList();taskList();proposalList();activity();notify();
}
function download(name,body,mime){
 const blob=new Blob([body],{type:mime||"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1800);
}
function brief(){
 const m=C.metrics(state),chain=C.chain(state).slice(0,8),lines=[
 "# APERTURE / Project and Meeting Brief","",state.sample?"SYNTHETIC DEMONSTRATION — NOT A BUSINESS REPORT":"PRIVATE LOCAL WORKSPACE — SOURCE VERIFICATION REQUIRED",
 "","As of "+new Date().toISOString(),
 "Projects "+m.totalProjects+"; Meetings "+m.totalMeetings+"; Ready "+m.ready+"; Blocked "+m.blocked+"; Pending approvals "+m.pendingApprovals,
 "","## Longest open predecessor chains"];
 for(const item of chain){
  const t=tby(item.id);lines.push("- "+t.title+" — "+(t.owner||"Unassigned")+" — depth "+item.remainingPredecessorDepth+" — due "+(t.due||"TBD"));
 }
 lines.push("","## Upcoming meetings");
 for(const mt of state.meetings.filter(x=>x.startsAt>=new Date().toISOString()).sort((a,b)=>a.startsAt.localeCompare(b.startsAt)))lines.push("- "+mt.title+" — "+mt.startsAt);
 lines.push("","## Proposed decisions");
 for(const q of state.proposals.filter(x=>x.status==="pending"))lines.push("- "+q.title+" / owner "+q.owner+" / evidence "+q.source);
 lines.push("","No outside calendar, email, finance or project API actions executed.");
 return lines.join("\n");
}
function forms(){
 $("project-form").addEventListener("submit",e=>{
  e.preventDefault();const ids=new Set(state.projects.map(p=>p.id));
  if(change(s=>C.addProject(s,{name:$("project-name").value,goal:$("project-goal").value,owner:$("project-owner").value}),"Project added.")){
   const p=state.projects.find(p=>!ids.has(p.id));if(p){scope=p.id;render();select("project",p.id);}
   e.target.reset();$("project-create").open=false;
  }
 });
 $("meeting-form").addEventListener("submit",e=>{
  e.preventDefault();const ids=new Set(state.meetings.map(m=>m.id));
  const raw=$("meeting-time").value,start=raw?new Date(raw):null;
  if(!start||!Number.isFinite(start.getTime())){toast("Choose a valid meeting date and time.",true);return;}
  if(change(s=>C.addMeeting(s,{title:$("meeting-title").value,projectId:$("meeting-project").value,startsAt:start.toISOString(),owner:$("meeting-owner").value,agenda:$("meeting-agenda").value}),"Meeting created locally; no invitation sent.")){
   const m=state.meetings.find(m=>!ids.has(m.id));if(m)select("meeting",m.id);
   e.target.reset();$("meeting-create").open=false;
  }
 });
 $("task-form").addEventListener("submit",e=>{
  e.preventDefault();const ids=new Set(state.tasks.map(t=>t.id));
  if(change(s=>C.addTask(s,{title:$("task-title").value,projectId:$("task-project").value,owner:$("task-owner").value,due:$("task-due").value}),"Manual work created.")){
   const t=state.tasks.find(t=>!ids.has(t.id));if(t)select("task",t.id);e.target.reset();$("task-create").open=false;
  }
 });
 $("proposal-form").addEventListener("submit",e=>{
  e.preventDefault();const ids=new Set(state.proposals.map(q=>q.id));
  if(change(s=>C.propose(s,{meetingId:$("proposal-meeting").value,title:$("proposal-title").value,source:$("proposal-source").value,owner:$("proposal-owner").value,due:$("proposal-due").value}),"Decision draft created; not approved.")){
   const q=state.proposals.find(q=>!ids.has(q.id));if(q)select("proposal",q.id);e.target.reset();e.target.closest("details").open=false;
  }
 });
 $("dep-form").addEventListener("submit",e=>{
  e.preventDefault();const id=$("dep-task").value;
  if(change(s=>C.addDependency(s,id,$("dep-blocker").value,$("dep-owner").value),"Causal dependency recorded.")){
   select("task",id);e.target.reset();$("dep-create").open=false;
  }
 });
 $("save-notes").addEventListener("click",()=>{
  const m=selected?.kind==="meeting"?selectedRow():null;if(!m){toast("Select a meeting first.",true);return;}
  change(s=>C.updateMeeting(s,m.id,{agenda:m.agenda,notes:$("meeting-editor").value}),"Meeting notes saved locally.");
 });
 $("download-brief").addEventListener("click",()=>{
  const m=selected?.kind==="meeting"?selectedRow():null;if(!m){toast("Select a meeting first.",true);return;}
  download("aperture-"+m.id+"-brief.txt",C.meetingBrief(state,m.id));toast("Private meeting brief downloaded.");
 });
 $("prep-meeting").addEventListener("click",()=>{
  const m=selected?.kind==="meeting"?selectedRow():null;
  if(!m){toast("Select a meeting to prepare.",true);return;}
  try{
   const report=root.ApertureMeetingIntelligence.prepare(state,m.id);
   download("aperture-"+m.id+"-meeting-intelligence.md",report.markdown,"text/markdown");
   toast("Private, source-aware meeting preparation generated locally. No external service contacted.");
  }catch(err){toast(err.message||String(err),true);}
 });
 $("download-ics").addEventListener("click",()=>{
  const m=selected?.kind==="meeting"?selectedRow():null;if(!m){toast("Select a meeting first.",true);return;}
  download("aperture-"+m.id+".ics",C.calendarFile(m),"text/calendar;charset=utf-8");toast("Calendar file downloaded; invitation not sent.");
 });
}
function interactions(){
 $("filter-project").addEventListener("change",e=>{scope=e.target.value;render();});
 $("inspector-action").addEventListener("click",()=>$(jumpTo).scrollIntoView({behavior:root.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}));
 $("load-demo").addEventListener("click",()=>{
  if(!state.sample&&state.projects.length&&!root.confirm("Replace unsaved private work with synthetic demo data?"))return;
  history.push(state);state=C.sample();scope="all";selected=null;render();$("privacy-state").textContent="SYNTHETIC DEMO · NOT SAVED";toast("Illustrative workspace loaded, no real customer records.");
 });
 $("reset-workspace").addEventListener("click",()=>{
  if(!root.confirm("Clear in-memory workspace? Encrypted stored data and backups are unaffected."))return;
  history.push(state);state=C.blank();scope="all";selected=null;render();dirty("Local workspace cleared.");
 });
 $("undo").addEventListener("click",()=>{if(!history.length)return;state=history.pop();scope="all";selected=null;render();dirty("Local change reversed. Re-save vault if needed.");});
 $("export-json").addEventListener("click",()=>{download("aperture-private-mission.json",JSON.stringify(state,null,2),"application/json");toast("Private snapshot downloaded. Never commit it to public GitHub.");});
 $("export-report").addEventListener("click",()=>{download("aperture-weekly-brief.md",brief(),"text/markdown");toast("Brief generated locally; not sent.");});
 let calendarDraft=[];
 $("calendar-file").addEventListener("change",async e=>{
  const file=e.target.files?.[0];calendarDraft=[];$("calendar-confirm").checked=false;$("calendar-commit").disabled=true;
  if(!file)return;
  try{
   if(file.size>1024*1024)throw Error("Calendar import limit: 1 MB.");
   const result=root.ApertureCalendarBridge.parse(await file.text());
   calendarDraft=root.ApertureCalendarBridge.preview(result.events,state.meetings);
   const duplicates=calendarDraft.filter(x=>x.duplicate).length;
   const eligible=calendarDraft.filter(x=>!x.duplicate);
   const view=$("calendar-preview");view.replaceChildren();
   view.append(node("strong",null,eligible.length+" new · "+duplicates+" duplicates · "+result.skipped+" skipped (unsupported/cancelled)"));
   view.append(node("p",null,result.notice));
   for(const ev of calendarDraft.slice(0,30)){
    view.append(node("p",null,(ev.duplicate?"DUPLICATE — ":"REVIEW — ")+ev.title+" / "+dateTime(ev.startsAt)));
   }
   if(calendarDraft.length>30)view.append(node("p",null,"Only first 30 shown; import includes all eligible events. Use a smaller file for detailed review."));
   $("calendar-commit").disabled=!eligible.length;
  }catch(err){$("calendar-preview").textContent=err.message||String(err);toast(err.message||String(err),true);}
 });
 $("calendar-commit").addEventListener("click",()=>{
  const projectId=$("calendar-project").value;
  if(state.sample){toast("Clear the synthetic demo and create a private project before importing real calendar events.",true);return;}
  if(!$("calendar-confirm").checked){toast("Review and confirm the calendar preview first.",true);return;}
  if(!state.projects.some(p=>p.id===projectId)){toast("Choose a valid project.",true);return;}
  const eligible=root.ApertureCalendarBridge.preview(calendarDraft,state.meetings).filter(e=>!e.duplicate);
  if(!eligible.length){toast("No new events to import.",true);return;}
  const before=state;
  try{
   let next=state;
   for(const e of eligible)next=C.addMeeting(next,{title:e.title,projectId,startsAt:e.startsAt,agenda:e.agenda,owner:e.owner});
   state=C.normalize(next);history.push(before);if(history.length>15)history.shift();
   calendarDraft=[];$("calendar-file").value="";$("calendar-confirm").checked=false;$("calendar-commit").disabled=true;
   $("calendar-preview").textContent=eligible.length+" reviewed calendar events imported to local workspace. No invitations sent.";
   render();dirty(eligible.length+" meetings imported locally. Save encrypted vault to retain them.");
  }catch(err){state=before;toast(err.message||String(err),true);}
 });
 $("import-json").addEventListener("change",async e=>{
  const f=e.target.files?.[0];e.target.value="";if(!f)return;
  try{if(f.size>2*1024*1024)throw Error("Private file limit is 2MB.");
   const incoming=C.normalize(JSON.parse(await f.text()));
   if(!state.sample&&state.projects.length&&!root.confirm("Replace unsaved records with this private file?"))return;
   history.push(state);state=incoming;scope="all";selected=null;render();dirty("Imported private snapshot locally; nothing uploaded.");
  }catch(err){toast(err.message||String(err),true);}
 });
 $("vault-save").addEventListener("click",async()=>{
  try{if($("vault-pass").value!==$("vault-repeat").value)throw Error("Passphrase confirmation differs.");
   await V.write(await V.seal(state,$("vault-pass").value));$("vault-pass").value="";$("vault-repeat").value="";
   $("privacy-state").textContent="SAVED IN LOCAL ENCRYPTED VAULT · LOCKED ON RELOAD";toast("Private vault encrypted and saved on this device.");
  }catch(err){toast(err.message||String(err),true);}
 });
 $("vault-open").addEventListener("click",async()=>{
  try{const locked=await V.read();if(!locked)throw Error("No encrypted local vault exists.");
   const incoming=C.normalize(await V.open(locked,$("vault-pass").value));
   if(!state.sample&&state.projects.length&&!root.confirm("Replace unsaved work with encrypted vault?"))return;
   history.push(state);state=incoming;scope="all";selected=null;render();
   $("vault-pass").value="";$("vault-repeat").value="";$("privacy-state").textContent="VAULT OPENED IN MEMORY · RE-SAVE AFTER EDITS";
   toast("Private vault decrypted in memory.");
  }catch(err){toast(err.message||String(err),true);}
 });
 $("vault-delete").addEventListener("click",async()=>{
  if(!root.confirm("Delete this device's encrypted mission vault permanently? Backups and in-memory records remain."))return;
  try{await V.clear();toast("Encrypted local vault deleted.");}catch(err){toast(err.message||String(err),true);}
 });
}
forms();interactions();render();
$("privacy-state").textContent="SYNTHETIC DEMO · NOT SAVED · NO REAL RECORDS EMBEDDED";
root.ApertureMissionUI={getState:()=>C.normalize(state),getSelected:()=>selected,select,scope:()=>scope,render};
})(typeof globalThis!=="undefined"?globalThis:this);
