import {MAX_BACKUP_BYTES,fromB64,derive,encryptVault,decryptVault,randomSalt,parseBackup} from "./vault-crypto.mjs";
/* A Quiet Journey — private, offline-first three-year sanctuary.
   No network requests, cookies, analytics, remote authentication or third-party libraries. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const KEY = "aqj-local-encrypted-vault-v1";
const TODAY = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-"); };
const YEARS = ["NOTICE","PRACTICE","INTEGRATE"];
const FOCUSES = {
  truth: "truth and clarity",
  gratitude: "gratitude",
  seva: "service and compassion",
  courage: "courage and humility",
  stewardship: "stewardship and purpose",
  stillness: "stillness and attention"
};
const CHAPTERS = [
  ["The art of arriving","Begin where you are.","What is asking for your honest attention in this season?","Set aside a quiet moment to name one truthful intention."],
  ["A clearer window","Notice without judgment.","Which assumption are you ready to examine gently?","Listen before responding to one difficult situation."],
  ["The ground of truth","Make room for what is real.","Where does truth require more courage than appearance?","Write a fact separately from the story you tell about it."],
  ["Small gratitudes","Honor what is already here.","What has supported you that you rarely stop to appreciate?","Thank someone without expecting a response."],
  ["The practice of humility","Release the need to perform.","Where might you learn by admitting you do not know?","Ask a sincere question and listen to the answer."],
  ["The space between","Be present before acting.","What becomes clearer when you do not rush to fill silence?","Create one uninterrupted quiet interval today."],
  ["A softer response","Choose care under pressure.","Which relationship would benefit from patience?","Offer a thoughtful response rather than a quick reaction."],
  ["The limits of control","Distinguish care from control.","What responsibility is yours, and what cannot be forced?","Name one useful action and release one impossible demand."],
  ["Courage in motion","Take the next honest step.","What have you postponed because it is uncomfortable?","Make one small, responsible move toward it."],
  ["The ethics of enough","Hold resources with care.","Where can you be more transparent or fair?","Fulfill one concrete obligation you have made."],
  ["A life of service","Give without performance.","Who could benefit from your time and attention?","Offer practical help while respecting another person's dignity."],
  ["A year of noticing","Return and reflect.","What has changed in what you notice, not what you claim to have achieved?","Revisit a reflection and write what you now understand."],
  ["Practice over intention","Let intention become action.","Which value would someone recognize from your choices?","Choose a small repeatable action that expresses your value."],
  ["The discipline of listening","Hear what is difficult.","When do you listen only to prepare a reply?","Invite someone to finish their thought without interruption."],
  ["Truth in relationship","Speak clearly and gently.","What truth needs both honesty and compassion?","Say one thing directly and respectfully."],
  ["Generosity of attention","Give the gift of presence.","What has divided your attention from the people around you?","Offer someone ten minutes without distractions."],
  ["Repair and forgiveness","Make space for repair.","Where is an apology or boundary more useful than blame?","Consider a safe, respectful step toward repair."],
  ["A steadier rhythm","Build an honest cadence.","What kind of daily practice can you sustain without resentment?","Make your quiet time small enough to repeat."],
  ["Kindness under stress","Find gentleness in difficulty.","How might you respond to uncertainty with steadiness?","Pause before one stressful decision."],
  ["Service in community","Consider the whole.","Where do your decisions affect people you may never meet?","Support one local or shared need."],
  ["Learning through correction","Welcome a better understanding.","Which feedback would help you act more wisely?","Ask for constructive feedback and consider it carefully."],
  ["Stewardship in practice","Make responsibility visible.","What promise needs better follow-through?","Write down and honor a specific commitment."],
  ["A courageous kindness","Protect without hardening.","How can you practice courage without losing tenderness?","Do something helpful that requires a little courage."],
  ["The quiet repetition","Return to what matters.","What supports your practice when motivation fades?","Practice simply, whether or not it feels exceptional."],
  ["A year of practicing","Notice what your actions teach.","Which habits have been valuable and which need a new shape?","Reflect on actions, not streaks or external scores."],
  ["Living the question","Do not hurry the answer.","Which important question can remain open for now?","Spend time considering rather than resolving it."],
  ["A generous perspective","See beyond yourself.","Whose view have you not yet seriously considered?","Ask a person what they wish you understood."],
  ["Truth through change","Keep your center while changing.","What principle remains steady as circumstances shift?","Name a principle you want to practice today."],
  ["A practice of gratitude","Recognize quiet abundance.","Who or what helped bring you to this moment?","Offer specific thanks without turning it into a transaction."],
  ["Humility with strength","Hold conviction without ego.","When could being right become less important than being useful?","Seek understanding before defending a position."],
  ["Peace in unfinished work","Accept imperfection honestly.","What can you carry with care without solving immediately?","Give an unfinished concern a bounded place in your day."],
  ["A wider compassion","Let your circle expand.","Who is affected by a choice that feels personal?","Make one small decision with broader care."],
  ["Practical faithfulness","Honor small promises.","Which promise matters precisely because it is ordinary?","Complete a manageable responsibility."],
  ["Serving in the long view","Think beyond this moment.","What good can you sustain rather than announce?","Contribute quietly to something larger than yourself."],
  ["The wisdom of return","Begin again without shame.","What has this journey taught you about returning after pauses?","Offer yourself permission to restart today."],
  ["An open horizon","Leave space for becoming.","Which values should guide the next chapter of your life?","Write a letter to your future self, without predictions."],
  ["Three years, many beginnings","The journey remains open.","What would you keep, release, or begin anew?","Honor what was real. Choose your next simple practice."]
];
const state = { months:36, month:1, focus:"truth", minutes:10, start:TODAY(), vaultKey:null, vaultData:null, entryDay:TODAY(), world:"spiral" };
let sceneDraw = () => {};
let sceneStop = () => {};
const dateValid = s => /^\d{4}-\d\d-\d\d$/.test(s) && !Number.isNaN(new Date(s+"T12:00:00").getTime());
const pad = n => String(n).padStart(2,"0");
function chapterAt(month) {
  const index=(month-1)%36;
  const item=CHAPTERS[index];
  const yearIndex=Math.floor((month-1)/12);
  return {item, yearIndex, year:yearIndex+1, season:YEARS[yearIndex%3], localIndex:(month-1)%12+1};
}
function monthName(month) {
  const p=state.start.split("-").map(Number);
  const date=new Date(p[0],p[1]-1+month-1,1);
  return date.toLocaleDateString(undefined,{month:"long",year:"numeric"});
}
function updateYears() {
  const tabs=document.querySelector(".year-controls");
  tabs.replaceChildren();
  const count=Math.ceil(state.months/12);
  for(let i=0;i<count;i++) {
    const btn=document.createElement("button");
    btn.type="button";btn.className="year-tab"+(Math.floor((state.month-1)/12)===i?" is-active":"");
    btn.dataset.year=String(i);
    btn.textContent=pad(i+1)+" / "+YEARS[i%3];
    btn.setAttribute("aria-label","Explore year "+(i+1));
    btn.setAttribute("aria-pressed",String(Math.floor((state.month-1)/12)===i));
    btn.addEventListener("click",()=>setMonth(i*12+1));
    tabs.append(btn);
  }
}
function renderMonth() {
  const c=chapterAt(state.month);
  $("chapterTitle").textContent=c.item[0];
  $("reflectionTitle").textContent=c.item[1];
  $("reflectionPrompt").textContent=c.item[2]+" Consider it through "+FOCUSES[state.focus]+".";
  $("chapterAction").textContent=c.item[3];
  $("visualYear").textContent="YEAR "+c.year;
  $("visualMonth").textContent="MONTH "+pad(state.month);
  $("visualSubtitle").textContent=c.season;
  $("monthIndex").textContent="MONTH "+state.month+" / "+state.months;
  $("chapterDate").textContent=monthName(state.month);
  $("monthSlider").max=String(state.months);
  $("monthSlider").value=String(state.month);
  $("monthSlider").style.setProperty("--fill",String((state.month-1)/Math.max(state.months-1,1)*100)+"%");
  $("prevMonth").disabled=state.month===1;
  $("nextMonth").disabled=state.month===state.months;
  updateYears();updateTree();sceneDraw();
}
function setMonth(m){state.month=Math.max(1,Math.min(state.months,Number(m)||1));renderMonth();}
function showStatus(node,text){$(node).textContent=text;}
function applySettings() {
  const nextDate=$("startDate").value;
  if(!dateValid(nextDate)){showStatus("applyStatus","Choose a valid start date.");return;}
  state.months=Number($("duration").value);
  state.focus=$("focus").value;
  state.minutes=Number($("minutes").value);
  state.start=nextDate;
  setMonth(Math.min(state.month,state.months));
  if(state.vaultKey){state.vaultData.settings=settings();persistVault().then(()=>showStatus("applyStatus","Updated and encrypted in your private vault.")).catch(()=>showStatus("applyStatus","Changed in this tab, but could not save securely."));}
  else showStatus("applyStatus","Journey shaped. Unlock or create your private vault to save your choices.");
}
function settings(){return {months:state.months,focus:state.focus,minutes:state.minutes,start:state.start};}
function hydrateSettings(v){
  if(!v || ![12,36,60,120].includes(Number(v.months)) || !FOCUSES[v.focus] || ![5,10,20,40].includes(Number(v.minutes)) || !dateValid(v.start))return;
  state.months=Number(v.months);state.focus=v.focus;state.minutes=Number(v.minutes);state.start=v.start;
  $("duration").value=String(state.months);$("focus").value=state.focus;
  $("minutes").value=String(state.minutes);$("startDate").value=state.start;
$("spiralMode").addEventListener("click",()=>setWorld("spiral"));
$("treeMode").addEventListener("click",()=>setWorld("tree"));
$("spiralMode").addEventListener("click",()=>setWorld("spiral"));
$("treeMode").addEventListener("click",()=>setWorld("tree"));
  setMonth(Math.min(state.month,state.months));
}
function secureAvailable(){return !!(window.isSecureContext && window.crypto && crypto.subtle && crypto.getRandomValues);}
function readStored(){try{return localStorage.getItem(KEY);}catch(e){return null;}}
function writeStored(value){localStorage.setItem(KEY,value);}
function vaultObject(){try{const raw=readStored();return raw?parseBackup(raw):null;}catch(e){return null;}}
async function persistVault() {
  if(!state.vaultKey || !state.vaultData)throw new Error("Vault locked");
  state.vaultData.settings=settings();
  const old=vaultObject();
  if(!old)throw new Error("No existing vault");
  const v=await encryptVault(state.vaultKey,state.vaultData,fromB64(old.salt));
  writeStored(JSON.stringify(v));
}
function setVaultUI() {
  const existing=readStored()!==null,unlocked=!!state.vaultKey;
  $("vaultOpen").textContent=existing?"Unlock private vault":"Create private vault";
  $("vaultOpen").disabled=unlocked || !secureAvailable();
  $("vaultLock").disabled=!unlocked;
  $("vaultPassword").disabled=unlocked || !secureAvailable();
  $("journalText").disabled=!unlocked;
  $("practiceDone").disabled=!unlocked;
  $("saveEntry").disabled=!unlocked;
  $("exportVault").disabled=!existing;
  $("eraseVault").disabled=!existing;
  $("vaultState").textContent=unlocked?"Unlocked · Encrypted on this device":existing?"Locked · Your encrypted vault is on this device":"No vault yet · Nothing is stored";
  $("vaultHint").textContent=!secureAvailable()?"Encryption requires a secure HTTPS browser with Web Crypto support. Journaling is unavailable here.":existing?"Enter your passphrase to unlock. Lost passphrases cannot be recovered.":"Choose a passphrase of at least 12 characters. You must remember it: we cannot reset it.";
  if(!unlocked){$("journalText").value="";$("practiceDone").checked=false;showStatus("journalStatus","Unlock your vault to write.");$("entryList").replaceChildren();}
}
async function openVault(){
  if(!secureAvailable()){showStatus("vaultState","Secure browser encryption unavailable; no journaling data will be saved.");return;}
  const password=$("vaultPassword").value;
  if(password.length<12){showStatus("vaultState","Use a passphrase of at least 12 characters.");return;}
  $("vaultOpen").disabled=true;
  try{
    const old=vaultObject();
    if(old){
      const key=await derive(password,fromB64(old.salt));
      const data=await decryptVault(key,old);
      state.vaultKey=key;state.vaultData=data;hydrateSettings(data.settings);
    }else{
      if(readStored()){throw new Error("An existing vault is invalid. Export it before taking action.");}
      const salt=randomSalt();
      const key=await derive(password,salt);
      const data={settings:settings(),entries:{}};
      writeStored(JSON.stringify(await encryptVault(key,data,salt)));
      state.vaultKey=key;state.vaultData=data;
    }
    $("vaultPassword").value="";
    state.entryDay=TODAY();
    setVaultUI();loadEntry();renderEntries();
    showStatus("vaultState","Unlocked · Only encrypted data is stored in this browser.");
  }catch(e){showStatus("vaultState","Could not open vault. Check your passphrase, browser storage or backup.");}
  finally{if(!state.vaultKey)$("vaultOpen").disabled=false;}
}
function lockVault() {
  state.vaultKey=null;state.vaultData=null;
  $("vaultPassword").value="";
  setVaultUI();
}
function niceDay(day){const date=new Date(day+"T12:00:00");return dateValid(day)?date.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):day;}
function loadEntry(){
  if(!state.vaultData)return;
  const entry=state.vaultData.entries[state.entryDay]||{};
  $("journalDay").textContent=niceDay(state.entryDay).toUpperCase();
  $("journalText").value=typeof entry.text==="string"?entry.text:"";
  $("practiceDone").checked=entry.done===true;
  showStatus("journalStatus",entry.text?"Entry loaded in your private vault.":"Your words remain yours.");
}
function renderEntries(){
  const list=$("entryList");list.replaceChildren();
  if(!state.vaultData)return;
  const entries=Object.keys(state.vaultData.entries).filter(dateValid).sort().reverse().slice(0,18);
  if(!entries.length){const p=document.createElement("p");p.className="microcopy";p.textContent="Your saved reflections will appear here.";list.append(p);return;}
  for(const day of entries){
    const b=document.createElement("button");b.type="button";b.className="entry-card";
    const strong=document.createElement("strong"),span=document.createElement("span");
    strong.textContent=niceDay(day);
    span.textContent=state.vaultData.entries[day].text||"Quiet practice completed";
    b.append(strong,span);
    b.addEventListener("click",()=>{state.entryDay=day;loadEntry();$("journalText").focus();});
    list.append(b);
  }
  if(state.entryDay!==TODAY()){
    const today=document.createElement("button");today.type="button";today.className="entry-card";today.textContent="↗ Return to today's reflection";
    today.addEventListener("click",()=>{state.entryDay=TODAY();loadEntry();});
    list.prepend(today);
  }
}
async function saveEntry(){
  if(!state.vaultKey||!state.vaultData)return;
  const body=$("journalText").value.slice(0,5000);
  const done=$("practiceDone").checked;
  const previous=state.vaultData.entries[state.entryDay];
  state.vaultData.entries[state.entryDay]={text:body,done,updated:new Date().toISOString()};
  $("saveEntry").disabled=true;
  try{await persistVault();showStatus("journalStatus","Encrypted and saved on this device.");renderEntries();}
  catch(e){
    if(previous)state.vaultData.entries[state.entryDay]=previous;else delete state.vaultData.entries[state.entryDay];
    showStatus("journalStatus","Save failed. Storage may be full or blocked. Export an encrypted backup.");
  }finally{$("saveEntry").disabled=false;}
}
function exportVault(){
  const raw=readStored();if(!raw){showStatus("vaultState","No encrypted backup is available.");return;}
  const blob=new Blob([raw],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="a-quiet-journey-encrypted-"+TODAY()+".json";document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  showStatus("vaultState","Encrypted backup prepared. Store it safely with your passphrase.");
}
async function importVault(file){
  if(!file)return;
  try{
    if(state.vaultKey){showStatus("vaultState","Lock your current vault before restoring a backup.");return;}
    if(!secureAvailable())throw new Error("Secure browser cryptography unavailable");
    if(file.size>MAX_BACKUP_BYTES)throw new Error("Backup too large");
    const data=parseBackup(await file.text());
    const password=$("vaultPassword").value;
    if(password.length<12){showStatus("vaultState","Enter the original backup passphrase above before choosing a backup file.");return;}
    const key=await derive(password,fromB64(data.salt));
    const content=await decryptVault(key,data);
    if(readStored()!==null&&!confirm("This verified backup will replace the encrypted vault on this device. Export your current vault first. Continue?"))return;
    writeStored(JSON.stringify(data));
    state.vaultKey=key;state.vaultData=content;hydrateSettings(content.settings);
    state.entryDay=TODAY();$("vaultPassword").value="";
    setVaultUI();loadEntry();renderEntries();
    showStatus("vaultState","Backup decrypted, verified and restored. Your vault is unlocked.");
  }catch(e){showStatus("vaultState","Restore failed. Check your original passphrase, backup integrity and browser storage. No existing vault was replaced.");}
  finally{$("importVault").value="";}
}
function eraseVault(){
  if(readStored()===null)return;
  if(!confirm("Permanently erase this device's encrypted vault? This cannot be undone unless you have an encrypted backup."))return;
  try{localStorage.removeItem(KEY);lockVault();showStatus("vaultState","This device's encrypted vault has been erased.");}
  catch(e){showStatus("vaultState","Browser storage could not be cleared.");}
}

/* Living tree: time becomes branches. This is never a measure of spiritual merit. */
const SVG_NS="http://www.w3.org/2000/svg";
const treeMarks=[];
let treeReady=false;
function buildTree(){
  const svg=$("livingTree");if(!svg)return;
  const make=(type,attrs)=>{const el=document.createElementNS(SVG_NS,type);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el;};
  svg.append(make("circle",{cx:450,cy:265,r:180,class:"tree-halo"}));
  svg.append(make("ellipse",{cx:450,cy:455,rx:150,ry:12,class:"tree-ground"}));
  const group=make("g",{"stroke-linecap":"round",fill:"none"});svg.append(group);
  let seed=0;
  const rand=()=>{seed++;return ((Math.sin(seed*91.47)*7381.27)%1+1)%1;};
  function branch(x,y,length,angle,depth,stage){
    const a=angle+(rand()-.5)*.13;
    const x2=x+Math.sin(a)*length,y2=y-Math.cos(a)*length;
    const birth=Math.max(1,Math.min(36,stage));
    const path=make("path",{d:"M "+x.toFixed(1)+" "+y.toFixed(1)+" Q "+((x+x2)/2+Math.sin(a)*6).toFixed(1)+" "+((y+y2)/2).toFixed(1)+" "+x2.toFixed(1)+" "+y2.toFixed(1),class:"tree-branch","stroke-width":Math.max(1.2,depth*2)});
    group.append(path);treeMarks.push({el:path,birth});
    if(depth<=0){
      const leaf=make("circle",{cx:x2.toFixed(1),cy:y2.toFixed(1),r:(2+rand()*3).toFixed(1),class:"tree-leaf"});
      svg.append(leaf);treeMarks.push({el:leaf,birth});return;
    }
    const factor=.76+rand()*.045;
    branch(x2,y2,length*factor,a-(.29+rand()*.16),depth-1,stage+Math.round(4.5+rand()*1.8));
    branch(x2,y2,length*factor,a+(.29+rand()*.16),depth-1,stage+Math.round(4.5+rand()*1.8));
    if(depth>=3)branch(x2,y2,length*.53,a+(rand()-.5)*.28,depth-2,stage+Math.round(5+rand()*2));
  }
  branch(450,452,87,0,5,1);
  treeReady=true;
}
function updateTree(){
  if(!treeReady)return;
  const displayed=Math.min(36,Math.max(1,Math.round(state.month/state.months*36)));
  const season=(state.month-1)%12;
  const palette=season<3?"#a5d3ba":season<6?"#dfca95":season<9?"#dca783":"#a4c5e0";
  $("visual").style.setProperty("--tree-color",palette);
  for(const mark of treeMarks){
    mark.el.classList.toggle("tree-future",mark.birth>displayed);
    mark.el.classList.toggle("tree-present",mark.birth<=displayed);
  }
  $("livingTree").setAttribute("aria-label","Living tree illustrating month "+state.month+" of "+state.months+"; branches appear as time advances, not as a measure of spirituality");
}
function setWorld(mode){
  state.world=mode==="tree"?"tree":"spiral";
  const tree=state.world==="tree";
  $("visual").classList.toggle("tree-view",tree);
  $("treeMode").setAttribute("aria-pressed",String(tree));
  $("spiralMode").setAttribute("aria-pressed",String(!tree));
  $("sceneHint").textContent=tree?"Branches show time passing, not spiritual rank.":"Drag the 3D path; use the slider to travel through time.";
  sceneDraw();
}

function createScene(){
  const canvas=$("universe");
  let gl;try{gl=canvas.getContext("webgl",{alpha:true,antialias:false,powerPreference:"low-power",preserveDrawingBuffer:false});}catch(e){gl=null;}
  if(!gl){canvas.style.display="none";document.querySelector(".live-tag").textContent="LIVING TREE · 3D UNAVAILABLE";$("spiralMode").disabled=true;setWorld("tree");return;}
  const vertex=[
    "attribute float aT;","uniform float uRotation;","uniform float uProgress;","uniform float uAspect;","uniform float uStars;","uniform float uTime;",
    "varying float vGlow;","varying float vStar;",
    "void main(){",
    " float phase=aT*18.8495559+0.6;",
    " float radius=0.73+0.17*sin(aT*24.0);",
    " vec3 path=vec3(cos(phase)*radius,(aT-0.5)*3.15,sin(phase)*0.7);",
    " vec3 stars=vec3((fract(sin(aT*215.47)*4145.33)-0.5)*4.5,(fract(sin(aT*491.83)*7738.11)-0.5)*4.1,(fract(sin(aT*627.29)*1713.51)-0.5)*3.1);",
    " vec3 p=mix(path,stars,uStars);",
    " float c=cos(uRotation),s=sin(uRotation);",
    " vec3 q=vec3(p.x*c-p.z*s,p.y,p.x*s+p.z*c);",
    " float perspective=4.0/(5.1-q.z);",
    " gl_Position=vec4(q.x*perspective*0.68/max(uAspect,0.6),q.y*perspective*0.68,0.0,1.0);",
    " vGlow=uStars>0.5?0.3+0.4*fract(aT*29.0):mix(0.23,0.95,1.0-step(uProgress+0.001,aT));",
    " vStar=uStars;",
    " gl_PointSize=uStars>0.5?1.5:mix(2.1,4.6,1.0-step(uProgress+0.001,aT))*perspective;",
    "}"
  ].join("\n");
  const fragment=[
    "precision mediump float;","uniform float uPoints;","varying float vGlow;","varying float vStar;",
    "void main(){",
    " float alpha=vGlow;",
    " if(uPoints>0.5){float r=distance(gl_PointCoord,vec2(0.5));if(r>0.49)discard;alpha*=1.0-smoothstep(0.04,0.49,r);}",
    " vec3 color=mix(vec3(0.48,0.69,0.67),vec3(0.94,0.81,0.56),vGlow);",
    " gl_FragColor=vec4(color,alpha*(vStar>0.5?0.55:0.95));",
    "}"
  ].join("\n");
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
  let program;
  try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Shader link failed");}
  catch(e){canvas.style.display="none";document.querySelector(".live-tag").textContent="LIVING TREE · 3D UNAVAILABLE";$("spiralMode").disabled=true;setWorld("tree");return;}
  gl.useProgram(program);
  const count=721,values=new Float32Array(count);for(let i=0;i<count;i++)values[i]=i/(count-1);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,values,gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(program,"aT");gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,1,gl.FLOAT,false,0,0);
  const uni=name=>gl.getUniformLocation(program,name);
  const uRotation=uni("uRotation"),uProgress=uni("uProgress"),uAspect=uni("uAspect"),uStars=uni("uStars"),uPoints=uni("uPoints"),uTime=uni("uTime");
  let rotation=0.5,dragging=false,lastX=0,frame=0,last=0,dirty=true,stop=false,visible=false,observer=null;
  const reduceMotion=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function resize(){
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,window.innerWidth<700?1:1.5);
    const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr));
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);dirty=true;}
  }
  function schedule(){
    if(!frame&&!stop&&visible&&!document.hidden&&state.world==="spiral")frame=requestAnimationFrame(draw);
  }
  function draw(now){
    frame=0;
    if(stop||document.hidden||!visible||state.world!=="spiral")return;
    if(!reduceMotion&&now-last<33){schedule();return;}
    if(reduceMotion&&!dirty)return;
    last=now;dirty=false;resize();
    if(!reduceMotion&&!dragging)rotation+=0.0014;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.uniform1f(uRotation,rotation);gl.uniform1f(uProgress,state.month/state.months);
    gl.uniform1f(uAspect,canvas.width/canvas.height);
    gl.uniform1f(uTime,now/1000);
    gl.uniform1f(uStars,1);gl.uniform1f(uPoints,1);gl.drawArrays(gl.POINTS,0,count);
    gl.uniform1f(uStars,0);gl.uniform1f(uPoints,0);gl.drawArrays(gl.LINE_STRIP,0,count);
    gl.uniform1f(uPoints,1);gl.drawArrays(gl.POINTS,0,count);
    if(!reduceMotion)schedule();
  }
  sceneDraw=()=>{
    dirty=true;
    if(state.world!=="spiral"){cancelAnimationFrame(frame);frame=0;return;}
    schedule();
  };
  sceneStop=()=>{stop=true;cancelAnimationFrame(frame);frame=0;if(observer)observer.disconnect();};
  canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(!dragging)return;rotation+=(e.clientX-lastX)*0.007;lastX=e.clientX;dirty=true;});
  canvas.addEventListener("pointerup",()=>dragging=false);
  canvas.addEventListener("pointercancel",()=>dragging=false);
  if("ResizeObserver" in window)new ResizeObserver(()=>{resize();sceneDraw();}).observe(canvas);
  else window.addEventListener("resize",()=>{resize();sceneDraw();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{dirty=true;schedule();}});
  canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();stop=true;cancelAnimationFrame(frame);frame=0;canvas.style.display="none";$("spiralMode").disabled=true;document.querySelector(".live-tag").textContent="LIVING TREE · 3D PAUSED";setWorld("tree");});
  if("IntersectionObserver" in window){observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){dirty=true;schedule();}else{cancelAnimationFrame(frame);frame=0;}},{threshold:.05});observer.observe(canvas);}
  else visible=true;
  resize();schedule();
}
$("startDate").value=state.start;
$("apply").addEventListener("click",applySettings);
$("monthSlider").addEventListener("input",e=>setMonth(Number(e.target.value)));
$("prevMonth").addEventListener("click",()=>setMonth(state.month-1));
$("nextMonth").addEventListener("click",()=>setMonth(state.month+1));
$("vaultOpen").addEventListener("click",openVault);
$("vaultPassword").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();openVault();}});
$("vaultLock").addEventListener("click",lockVault);
$("saveEntry").addEventListener("click",saveEntry);
$("exportVault").addEventListener("click",exportVault);
$("importVault").addEventListener("change",e=>importVault(e.target.files[0]));
$("eraseVault").addEventListener("click",eraseVault);
window.addEventListener("pagehide",()=>{lockVault();sceneStop();});
buildTree();setVaultUI();renderMonth();createScene();
})();
