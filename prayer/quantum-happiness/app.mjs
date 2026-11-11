import {states,contexts,lenses,routeMoment,creativePair,normalizeTask,serializeJournal} from "../../assets/moment-engine.mjs";
const el=(id)=>document.getElementById(id);
const KEY="aperture-quantum-happiness-v1";
function readStore(){try{const v=JSON.parse(localStorage.getItem(KEY)||"{}");return v&&typeof v==="object"?v:{}}catch{return {}}}
let stored=readStore();
let tasks=Array.isArray(stored.tasks)?stored.tasks.slice(0,40).map(normalizeTask).filter(t=>t.title):[];
let mood=states[stored.mood]?stored.mood:"steady";
let context=contexts[stored.context]?stored.context:"quiet";
let lensId=lenses.some(x=>x.id===stored.lens)?stored.lens:"presence";
let quiet=stored.quiet===true;
let journal=serializeJournal(stored.journal||{});
function persist(){try{localStorage.setItem(KEY,JSON.stringify({tasks,mood,context,lens:lensId,quiet,journal}));return true}catch{return false}}
function report(target,success,error){el(target).textContent=persist()?success:error}
function setLens(id){const lens=lenses.find(x=>x.id===id)||lenses[0];lensId=lens.id;el("lensName").textContent=lens.name;el("lensQuestion").textContent=lens.question;el("lensPractice").textContent=lens.practice;document.querySelectorAll(".orbit-node").forEach(n=>n.setAttribute("aria-pressed",n.dataset.id===lensId?"true":"false"));document.querySelectorAll(".orbit-node").forEach(n=>n.classList.toggle("active",n.dataset.id===lensId));persist()}
for(const lens of lenses){const b=document.createElement("button");b.type="button";b.className="orbit-node";b.dataset.id=lens.id;b.setAttribute("aria-label","Explore "+lens.name);const symbol=document.createElement("span");symbol.className="symbol";symbol.textContent=lens.symbol;b.append(symbol,document.createTextNode(lens.name));b.addEventListener("click",()=>setLens(lens.id));el("orbitNodes").append(b)}
setLens(lensId);
for(const [key,obj] of Object.entries(states)){const b=document.createElement("button");b.type="button";b.className="chip";b.dataset.mood=key;b.textContent=({"overwhelmed":"Too many inputs","energized":"Full of ideas","tired":"Need rest","steady":"Here and steady"})[key];b.addEventListener("click",()=>{mood=key;refresh()});el("states").append(b)}
el("context").value=context;
el("context").addEventListener("change",()=>{context=el("context").value;refresh()});
function refresh(){
  const r=routeMoment({state:mood,context,tasks});
  el("recommendTitle").textContent=r.title;
  el("recommendText").textContent=r.message;
  el("recommendAction").textContent=r.action;
  el("recommendGratitude").textContent=r.gratitude;
  el("contextPrompt").textContent=contexts[context].prompt;
  document.querySelectorAll("[data-mood]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mood===mood?"true":"false"));
  persist();
}
const uuid=()=>("m-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8));
function taskButton(name,title,action){const b=document.createElement("button");b.type="button";b.textContent=name;b.setAttribute("aria-label",title);b.addEventListener("click",action);return b}
function renderTasks(){
  const list=el("taskList");list.replaceChildren();
  if(!tasks.length){const p=document.createElement("p");p.className="muted";p.textContent="Your parking space is empty. That is perfectly fine.";list.append(p)}
  else tasks.forEach(t=>{
    const row=document.createElement("div");row.className="taskrow"+(t.done?" done":"");
    const name=document.createElement("span");name.className="name";name.textContent=t.title;
    const small=document.createElement("span");small.className="fine";small.textContent=t.effort+"m";
    const done=taskButton(t.done?"Undo":"Done",(t.done?"Mark not done: ":"Mark done: ")+t.title,()=>{
      tasks=tasks.map(x=>x.id===t.id?{...x,done:!x.done}:x);renderTasks();refresh()});
    const del=taskButton("×","Remove: "+t.title,()=>{
      tasks=tasks.filter(x=>x.id!==t.id);renderTasks();refresh()});
    row.append(name,small,done,del);list.append(row)
  });
}
el("taskForm").addEventListener("submit",event=>{
  event.preventDefault();
  const title=el("taskInput").value.trim();
  if(!title)return;
  if(tasks.length>=40){el("taskStatus").textContent="Parking lot full. Release an idea to add another.";return}
  tasks.push(normalizeTask({id:uuid(),title,importance:el("importance").value,effort:el("effort").value}));
  el("taskInput").value="";renderTasks();refresh();
  el("taskStatus").textContent="Captured. You can let it wait.";
});
renderTasks();
function updateQuiet(){document.body.classList.toggle("sensory-low",quiet);el("sensory").setAttribute("aria-pressed",quiet?"true":"false");el("sensory").textContent=quiet?"Restore visuals":"Quiet visuals";persist()}
el("sensory").addEventListener("click",()=>{quiet=!quiet;updateQuiet()});
updateQuiet();
let counter=1;el("create").addEventListener("click",()=>{
const pair=creativePair(counter++*17);el("creativePair").textContent=pair[0]+" + "+pair[1]+"\nWhat could they teach each other?";
});
let breathTimeout=null,breathIsOn=false,inhale=false;
function stopBreathing(){breathIsOn=false;clearTimeout(breathTimeout);breathTimeout=null;el("breathOrb").classList.remove("inhale");el("breathCue").textContent="Pause whenever you like.";el("breathe").textContent="Start 4-in / 6-out guide"}
function nextBreath(){if(!breathIsOn)return;inhale=!inhale;el("breathCue").textContent=inhale?"Inhale gently, if comfortable":"Exhale slowly, if comfortable";el("breathOrb").classList.toggle("inhale",inhale&&!quiet&&!matchMedia("(prefers-reduced-motion:reduce)").matches);breathTimeout=setTimeout(nextBreath,inhale?4000:6000)}
el("breathe").addEventListener("click",()=>{if(breathIsOn){stopBreathing()}else{breathIsOn=true;inhale=false;el("breathe").textContent="Stop guide";nextBreath()}});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&breathIsOn)stopBreathing()});
el("journalText").value=journal.text||"";
el("saveJournal").addEventListener("click",()=>{
 journal=serializeJournal({kind:context,text:el("journalText").value,savedAt:new Date().toISOString()});
 report("journalStatus","Saved locally on this device. Not encrypted.","Browser storage unavailable. Export your reflection instead.");
});
el("exportJournal").addEventListener("click",()=>{
 const text=el("journalText").value;
 const out=["APERTURE · A Quiet Journey","Quantum Happiness — Private reflection","",text,"","---","Saved entries are private to your browser profile until exported."];const blob=new Blob([out.join("\n")],{type:"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="aperture-reflection.txt";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 el("journalStatus").textContent="Export prepared. Check your downloads.";
});
el("deleteJournal").addEventListener("click",()=>{
 if(!confirm("Delete your saved reflection on this device?"))return;
 journal=serializeJournal({kind:context,text:"",savedAt:""});el("journalText").value="";
 report("journalStatus","Saved reflection deleted.","Deletion couldn't be stored. Check browser storage permissions.");
});
const chapterThemes=[
"Arrive","Notice","Listen","Appreciate","Wonder","Accept","Rest","Name what matters","Ask for help","Practice patience","Tell the truth","Begin again",
"Choose one thing","Make room","Build gentle rhythms","Honor boundaries","Cultivate curiosity","Keep learning","Respond with care","Repair where possible","Persist wisely","Recover fully","Notice growth","Release pressure",
"Make an offering","Serve without ego","Listen deeply","Care for others","Care for your community","Use your gifts","Share learning","Celebrate others","Support repair","Protect wonder","Practice stewardship","Arrive again"
];
for(let m=1;m<=36;m++){const o=document.createElement("option");o.value=String(m);o.textContent="Chapter "+String(m).padStart(2,"0")+" — "+chapterThemes[m-1];el("chapter").append(o)}
el("chapter").addEventListener("change",()=>{
const m=Number(el("chapter").value),year=Math.ceil(m/12),theme=chapterThemes[m-1];
el("chapterPrompt").textContent="Year "+year+": "+theme+". What might this mean in one ordinary moment of your life? You are free to revisit chapters in any order."
});
el("chapter").value="1";el("chapter").dispatchEvent(new Event("change"));
refresh();
