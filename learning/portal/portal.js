/* APERTURE Learning: adult-only private parent / coach portfolio.
   Launch gate: all real data access DISABLED until config.enabled=true after
   database security, identity, and safeguarding tests. Never add service keys.
*/
(async function(){
"use strict";
const $=id=>document.getElementById(id);
const cfg=window.AP_PORTAL_CONFIG||{};
const status=(message,kind="")=>{const n=$("system-status");n.textContent=message;n.className="system-status"+(kind?" "+kind:"");};
const show=(id,visible)=>{$(id).hidden=!visible;};
const tracks=[
["scratch-stories","Scratch & Interactive Stories"],["roblox-worlds","Roblox Worldbuilding"],
["minecraft-makers","Minecraft Engineering"],["3d-game-design","Game Design & 3D Art"],
["python-adventures","Python Foundations"],["web-creators","Websites & Web Apps"],
["mobile-prototypes","App & Interface Design"],["data-detectives","Data Science"],
["ai-literacy","AI Literacy"],["machine-learning","Machine Learning Lab"],
["ai-agents","AI Agents & Automation"],["computer-vision","Computer Vision"],
["robotics","Robotics & Automation"],["electronics","Circuits & Inventing"],
["cyber-citizenship","Cybersecurity & Digital Citizenship"],
["math-simulations","Math & Physics Simulations"],["sports-analytics","Basketball & Sports Analytics"],
["climate-tech","Climate & Community Tech"],["music-media-code","Creative Coding"],
["startup-builders","Young Product Builders"]
];
const chapters=["Discover","Build","Understand","Create"];
let db=null,user=null,profiles=[],assignments=[],projects=[],submissions=[],reviews=[],pendingReviews=[],loadCount=0;
const safeId=id=>typeof id==="string"&&/^[a-f\d-]{36}$/i.test(id);
function make(tag,text,cls){const el=document.createElement(tag);if(text!==undefined&&text!==null)el.textContent=String(text);if(cls)el.className=cls;return el;}
function option(id,label){const o=document.createElement("option");o.value=id;o.textContent=label;return o;}
function replaceOptions(id,options,empty="Select…"){const node=$(id);node.replaceChildren(option("",empty));for(const [v,t] of options)node.append(option(v,t));}
function formatTime(s){try{return new Date(s).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});}catch(e){return "Date unavailable";}}
function apiError(e){return e?.message?String(e.message).slice(0,250):"An unexpected error occurred.";}
function submitDisabled(form,on){const button=form.querySelector('button[type="submit"]');if(button)button.disabled=on;}
function humanTrack(id){return tracks.find(t=>t[0]===id)?.[1]||"Learning specialization";}
function clearPrivate(){
 user=null;profiles=[];assignments=[];projects=[];submissions=[];reviews=[];pendingReviews=[];
 show("dashboard",false);show("auth-panel",true);$("user-label").textContent="";$("portfolio-list").replaceChildren(make("p","Sign in to view your private records.","subtext"));
 replaceOptions("project-learner",[]);replaceOptions("evidence-project",[]);replaceOptions("review-submission",[]);replaceOptions("data-learner",[]);
}
async function get(table,columns="*"){const {data,error}=await db.from(table).select(columns);if(error)throw error;return data||[];}
async function load(){
 const cycle=++loadCount;
 status("Checking your private, authenticated learning records…");
 try{
  const [p,a,ps,ss,rs]=await Promise.all([
   get("ap_learner_profiles"),get("ap_coach_assignments"),
   get("ap_projects"),get("ap_submissions"),get("ap_coach_reviews")
  ]);
  if(!user||cycle!==loadCount)return;
  profiles=p;assignments=a;projects=ps;submissions=ss;reviews=rs;
  render();status("Private workspace loaded. Records are only shown according to server-enforced permissions.");
 }catch(e){
  status("Unable to load private data. Check database policies and your permissions: "+apiError(e),"error");
 }
}
function guardianLearners(){return profiles.filter(p=>p.guardian_id===user?.id);}
function editableProjects(){const g=new Set(guardianLearners().map(p=>p.id));return projects.filter(p=>g.has(p.learner_id));}
function reviewed(submission){return reviews.find(r=>r.submission_id===submission.id);}
function reviewState(submission){
 const r=reviewed(submission);return r?(r.verdict==="verified"?"Verified by coach":"Revision requested"):"Awaiting coach review";
}
function render(){
 if(!user)return;
 const guardian=guardianLearners();
 const learnerChoices=guardian.map(p=>[p.id,p.display_alias+" ("+p.age_band+")"]);
 replaceOptions("project-learner",learnerChoices,"Choose your learner");
 replaceOptions("data-learner",learnerChoices,"Choose your learner");
 replaceOptions("evidence-project",editableProjects().map(p=>[p.id,p.title]),"Choose your project");
 show("guardian-controls",true);
 show("project-editor",guardian.length>0);
 show("evidence-editor",editableProjects().length>0);
 show("data-form",guardian.length>0);
 const canReview=new Set(assignments.filter(a=>a.coach_id===user.id&&a.active).map(a=>a.learner_id));
 pendingReviews=submissions.filter(s=>{
  const p=projects.find(p=>p.id===s.project_id);
  return p&&canReview.has(p.learner_id)&&!reviews.some(r=>r.submission_id===s.id&&r.coach_id===user.id);
 });
 show("coach-panel",canReview.size>0);
 replaceOptions("review-submission",pendingReviews.map(s=>{
  const p=projects.find(p=>p.id===s.project_id);
  return [s.id,(p?.title||"Project")+" · "+chapters[s.chapter-1]+" · "+formatTime(s.submitted_at)];
 }),"Choose an assigned submission");
 $("portfolio-list").replaceChildren();
 if(profiles.length===0)$("portfolio-list").append(make("p","No learner profiles are accessible to your account. Parents can create a private alias above. Coaches need an authorized assignment.","subtext"));
 for(const learner of profiles){
  const card=make("article",null,"learner-card"),head=make("div",null,"learner-title"),name=make("div"),title=make("h4",learner.display_alias),desc=make("p","Age group "+learner.age_band);
  name.append(title,desc);head.append(name,make("span",learner.guardian_id===user.id?"Guardian":"Assigned coach","tag"));card.append(head);
  const owned=projects.filter(p=>p.learner_id===learner.id);
  if(owned.length===0)card.append(make("p","No project work recorded yet.","subtext"));
  for(const project of owned){
   const section=make("section",null,"project-card");
   section.append(make("h5",project.title),make("p",humanTrack(project.track_id)),make("p",project.project_goal||"No project goal supplied."));
   const links=make("div",null,"links"),jump=make("a","Explore pathway in 4D ↗");
   jump.href="../universe/?track="+encodeURIComponent(project.track_id)+"#explore";
   const track=make("a","View specialization ↗");track.href="../catalog/?track="+encodeURIComponent(project.track_id)+"#pathway";
   links.append(jump,track);section.append(links);
   const entries=submissions.filter(s=>s.project_id===project.id).sort((a,b)=>new Date(a.submitted_at)-new Date(b.submitted_at));
   const completed=new Set(entries.filter(s=>reviews.some(r=>r.submission_id===s.id&&r.verdict==="verified")).map(s=>s.chapter));
   const progress=make("div",null,"progress-steps");
   chapters.forEach((chapter,index)=>{
    const step=make("div",null,"progress-step"+(completed.has(index+1)?" complete":""));
    step.append(make("strong",String(index+1).padStart(2,"0")),make("small",chapter));
    progress.append(step);
   });section.append(progress);
   if(entries.length===0)section.append(make("p","No evidence submitted yet. Progress is not inferred from lessons purchased.","subtext"));
   entries.forEach(s=>{
    const r=reviewed(s),item=make("div",null,"submission"),row=make("div",null,"submission-top");
    row.append(make("strong","Chapter "+s.chapter+" · "+chapters[s.chapter-1]));
    const flag=make("span",reviewState(s),r?(r.verdict==="verified"?"status-verified":"status-revise"):"status-awaiting");
    row.append(flag);item.append(row,make("small",formatTime(s.submitted_at)),make("p",s.evidence_note));
    if(s.artifact_path){
      const b=make("button","Open private artifact ↗");
      b.type="button";b.addEventListener("click",()=>openPrivateFile(s.artifact_path));
      item.append(b);
    }
    if(r){const note=make("div",null,"review-note");note.append(make("strong","Coach feedback: "),make("span",r.feedback));item.append(note);}
    section.append(item);
   });
   card.append(section);
  }
  $("portfolio-list").append(card);
 }
}
async function openPrivateFile(path){
 try{
  if(!user)throw Error("Sign in before opening a private file.");
  const {data,error}=await db.storage.from("aperture-learner-work").createSignedUrl(path,60);
  if(error)throw error;
  const opened=window.open(data.signedUrl,"_blank","noopener,noreferrer");
  if(!opened)status("Your browser blocked the private file window. Enable popups for this site and retry.","warning");
 }catch(e){status("Private file access was denied or unavailable: "+apiError(e),"error");}
}
function fillTracks(){replaceOptions("project-track",tracks,"Choose a specialization");}
function authorId(){
 if(!user?.id)throw Error("You are not signed in.");
 return user.id;
}
function guardianOwns(learner){return guardianLearners().some(p=>p.id===learner);}
function projectOwned(id){return editableProjects().find(p=>p.id===id);}
function validateFile(file){
 if(!file)return;
 const accepted={"application/pdf":"pdf","text/plain":"txt","image/png":"png"};
 const ext=file.name.split(".").pop()?.toLowerCase();
 if(!Object.prototype.hasOwnProperty.call(accepted,file.type)||accepted[file.type]!==ext)throw Error("Only PDF, TXT and PNG attachments are allowed.");
 if(file.size>5*1024*1024)throw Error("Files must be smaller than 5 MB.");
}
function randomUUID(){
 if(!crypto?.randomUUID)throw Error("Secure random identifiers are unavailable.");
 return crypto.randomUUID();
}
function eventHandlers(){
 $("auth-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget,email=form.elements.email.value.trim();
  submitDisabled(form,true);status("Requesting a secure adult sign-in link…");
  try{
   if(!email||email.length>254)throw Error("Enter a valid adult email.");
   const redirect=location.origin+location.pathname;
   const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:redirect,shouldCreateUser:true}});
   if(error)throw error;status("Check your email for a secure sign-in link. Use the same device/browser for the verification link.");
  }catch(err){status("Could not request sign-in: "+apiError(err),"error");}
  finally{submitDisabled(form,false);}
 });
 $("sign-out").addEventListener("click",async()=>{
  await db.auth.signOut();loadCount++;clearPrivate();status("Signed out; your private records are no longer displayed.");
 });
 $("refresh").addEventListener("click",load);
 $("learner-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;submitDisabled(form,true);
  try{
   const alias=form.elements.alias.value.trim(),age=form.elements.age_band.value;
   if(alias.length<2||alias.length>40)throw Error("Use a short, private learner alias.");
   if(!["4-6","7-10","11-13","14-17"].includes(age))throw Error("Select a supported age band.");
   const {error}=await db.from("ap_learner_profiles").insert({guardian_id:authorId(),display_alias:alias,age_band:age});
   if(error)throw error;form.reset();status("Private learner alias created.");await load();
  }catch(err){status("Could not create learner profile: "+apiError(err),"error");}
  finally{submitDisabled(form,false);}
 });
 $("project-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;submitDisabled(form,true);
  try{
   const learner=form.elements.learner_id.value,track=form.elements.track_id.value,title=form.elements.title.value.trim();
   if(!guardianOwns(learner))throw Error("Choose one of your own learner profiles.");
   if(!tracks.some(t=>t[0]===track))throw Error("Choose a supported specialization.");
   if(title.length<3||title.length>100)throw Error("Project title must be 3–100 characters.");
   const {error}=await db.from("ap_projects").insert({learner_id:learner,track_id:track,title,project_goal:form.elements.project_goal.value.trim(),created_by:authorId()});
   if(error)throw error;form.reset();status("Private project created.");await load();
  }catch(err){status("Could not create project: "+apiError(err),"error");}
  finally{submitDisabled(form,false);}
 });
 $("evidence-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;submitDisabled(form,true);
  try{
   if(!form.elements.consent.checked)throw Error("Guardian consent confirmation is required.");
   const projectId=form.elements.project_id.value,project=projectOwned(projectId);
   const chapter=Number(form.elements.chapter.value),note=form.elements.evidence_note.value.trim();
   const file=$("artifact-file").files?.[0];
   if(!project)throw Error("You can only submit evidence for your own learner.");
   if(!Number.isInteger(chapter)||chapter<1||chapter>4)throw Error("Choose a chapter.");
   if(note.length<15||note.length>3000)throw Error("Describe real work in 15–3000 characters.");
   validateFile(file);
   let path=null;
   if(file){
     const ext=file.name.split(".").pop().toLowerCase(),key=randomUUID()+"."+ext;
     const profile=profiles.find(p=>p.id===project.learner_id);
     if(!profile||profile.guardian_id!==authorId())throw Error("The project is not assigned to your guardian account.");
     path=[authorId(),profile.id,project.id,key].join("/");
     // Upload first; if database insertion fails, cleanup is best-effort and signed-in only.
     const {error}=await db.storage.from("aperture-learner-work").upload(path,file,{cacheControl:"60",upsert:false,contentType:file.type});
     if(error)throw error;
   }
   const {error}=await db.from("ap_submissions").insert({
     project_id:projectId,chapter,evidence_note:note,artifact_path:path,submitted_by:authorId()
   });
   if(error){
    if(path)await db.storage.from("aperture-learner-work").remove([path]).catch(()=>{});
    throw error;
   }
   form.reset();status("Evidence submitted privately. It is not verified until an assigned coach reviews it.");await load();
  }catch(err){status("Could not submit milestone: "+apiError(err),"error");}
  finally{submitDisabled(form,false);}
 });
 $("review-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;submitDisabled(form,true);
  try{
   const id=form.elements.submission_id.value,choice=form.elements.verdict.value,feedback=form.elements.feedback.value.trim();
   if(!pendingReviews.some(r=>r.id===id))throw Error("This submission is not assigned or is already reviewed.");
   if(!["verified","revise"].includes(choice)||feedback.length<15||feedback.length>2000)throw Error("Enter a valid verdict and constructive feedback.");
   const {error}=await db.from("ap_coach_reviews").insert({submission_id:id,coach_id:authorId(),verdict:choice,feedback});
   if(error)throw error;form.reset();status("Signed, immutable coach review recorded.");await load();
  }catch(err){status("Could not submit review: "+apiError(err),"error");}
  finally{submitDisabled(form,false);}
 });
 $("data-form").addEventListener("submit",async e=>{
  e.preventDefault();const form=e.currentTarget;submitDisabled(form,true);
  try{
   const learner=form.elements.learner_id.value,type=form.elements.request_type.value;
   if(!guardianOwns(learner)||!["delete","export","correct"].includes(type))throw Error("Select your own learner profile and request type.");
   const {error}=await db.from("ap_data_requests").insert({guardian_id:authorId(),learner_id:learner,request_type:type,request_note:form.elements.request_note.value.trim()});
   if(error)throw error;form.reset();status("Privacy request recorded for administrator processing. Records are not automatically removed.");await load();
  }catch(err){status("Could not record privacy request: "+apiError(err),"error");}
  finally{submitDisabled(form,false);}
 });
}
function setSession(session){
 const next=session?.user||null;
 if(!next){loadCount++;clearPrivate();return;}
 user=next;show("auth-panel",false);show("dashboard",true);$("user-label").textContent="Signed in as "+(user.email||"an authenticated adult");
 load();
}
const validUrl=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cfg.supabaseUrl||"");
const validKey=typeof cfg.supabasePublishableKey==="string"&&cfg.supabasePublishableKey.length>=25;
if(cfg.enabled!==true||!validUrl||!validKey){
 show("setup-panel",true);show("auth-panel",false);show("dashboard",false);
 status("Private student accounts are not yet activated. Explore the fictional example below; do not submit personal student information.","warning");
 return;
}
try{
 status("Connecting to the private guardian/coach authentication service…");
 // Load Supabase JS only when explicitly enabled by an operator after the security gates.
 const {createClient}=await import("https://esm.sh/@supabase/supabase-js@2.49.4");
 db=createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{
  auth:{
   storage:window.sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:"pkce"
  },
  global:{headers:{"x-client-info":"aperture-learning-portal"}}
 });
 fillTracks();eventHandlers();
 const {data,error}=await db.auth.getSession();
 if(error)throw error;
 db.auth.onAuthStateChange((event,session)=>{
   if(event==="SIGNED_OUT"){loadCount++;clearPrivate();status("Signed out. Public portfolio access remains disabled.");}
   else if(event==="SIGNED_IN"||event==="TOKEN_REFRESHED"||event==="INITIAL_SESSION"){
     // schedule outside auth callback to avoid nested Supabase auth deadlocks
     queueMicrotask(()=>setSession(session));
   }
 });
 setSession(data.session);
 if(!data.session)status("Secure portal enabled. Only parents/guardians and authorized coaches should sign in.");
}catch(err){
 show("setup-panel",true);show("auth-panel",false);show("dashboard",false);
 status("Secure portal unavailable. No student data was collected: "+apiError(err),"error");
}
})();