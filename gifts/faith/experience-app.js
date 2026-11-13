/* APERTURE × Clearline — 100 active, free gift experiences.
   No server calls, accounts, uploads, analytics, or automatic messaging. */
(() => {
"use strict";
const actions=Array.isArray(window.APERTURE_GIFT_ACTIONS)?window.APERTURE_GIFT_ACTIONS:[];
const $=id=>document.getElementById(id);
const panel=$("giftPanel"),all=$("allGifts"),status=$("giftStatus"),category=$("category"),search=$("search");
if(!panel||!all||!category||!search||actions.length!==100){
  if($("count"))$("count").textContent="The collection could not be loaded. Please reload this page.";
  return;
}
const byId=new Map(actions.map(x=>[x.id,x]));
const completed=new Set();
let sequence=[],at=0,secondsLeft=90,interval=null,paused=false,mode="chosen";

function setStatus(s){status.textContent=s;}
function setShareStatus(s){$("shareInfo").textContent=s;}
function timerText(){
  $("timer").textContent=String(Math.floor(secondsLeft/60)).padStart(2,"0")+":"+String(secondsLeft%60).padStart(2,"0");
}
function stopTimer(){
  if(interval!==null){clearInterval(interval);interval=null;}
  paused=false;
  $("startTimer").textContent="Start a 90-second moment";
  $("pauseTimer").disabled=true;
  $("pauseTimer").textContent="Pause";
}
function resetTimer(){stopTimer();secondsLeft=90;timerText();}
function tick(){
  secondsLeft=Math.max(0,secondsLeft-1);timerText();
  if(secondsLeft===0){stopTimer();$("startTimer").disabled=true;setStatus("The optional 90-second moment has passed. You may keep going or mark your experience complete.");}
}
function randomIndex(n){
  if(n<=1)return 0;
  // Uniform rejection sampling when the browser supports cryptographic randomness.
  if(window.crypto&&typeof window.crypto.getRandomValues==="function"){
    const nums=new Uint32Array(1);
    const limit=4294967296-(4294967296%n);
    let x;
    do{window.crypto.getRandomValues(nums);x=nums[0]}while(x>=limit);
    return x%n;
  }
  return Math.floor(Math.random()*n);
}
function sample(count,exclude=[]){
  const excludeSet=new Set(exclude);
  const pool=actions.filter(a=>!excludeSet.has(a.id)).map(a=>a.id);
  const chosen=[];
  for(let i=0;i<count&&pool.length;i++){
    const p=randomIndex(pool.length);chosen.push(pool[p]);pool.splice(p,1);
  }
  return chosen;
}
function todaysId(){
  const d=new Date(),s=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  let hash=2166136261;
  for(const ch of s){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619)>>>0;}
  return actions[hash%actions.length].id;
}
function giftLabel(){
  const to=$("recipient").value.trim().slice(0,50),from=$("sender").value.trim().slice(0,50);
  return to?(from?"For "+to+" · From "+from:"For "+to):(from?"From "+from:"A gift for you");
}
function current(){return byId.get(sequence[at]);}
function showCurrent(scroll=true){
  const item=current();if(!item)return;
  resetTimer();$("startTimer").disabled=false;
  panel.hidden=false;
  $("giftKind").textContent=item.icon+" "+item.category+" · Gift "+item.id+"/100";
  $("giftStep").textContent=sequence.length>1?"Step "+(at+1)+" of "+sequence.length:"";
  $("dedication").textContent=giftLabel();
  $("giftTitle").textContent=item.title;
  $("giftMission").textContent=item.action;
  $("giftQuestion").textContent=item.reflect;
  $("privateNote").value="";
  $("nextStep").hidden=true;
  $("markDone").disabled=false;
  setStatus("Open your gift. Try the action in your own way, then mark it complete.");
  setShareStatus("Share the gift link with someone you choose. Names in a shared link are visible to anyone who has it.");
  if(scroll)panel.scrollIntoView({behavior:"smooth",block:"start"});
  document.dispatchEvent(new CustomEvent("aperture:gift-opened",{detail:{id:item.id}}));
}
function openSequence(ids,kind,scroll=true){
  const valid=ids.filter(id=>byId.has(id)).slice(0,3);
  if(!valid.length)return;
  sequence=[...new Set(valid)];
  at=0;mode=kind;showCurrent(scroll);
}
function updateProgress(){
  $("progress").textContent=completed.size+" of 100 experiences completed in this browser session";
}
function markDone(){
  const item=current();if(!item)return;
  completed.add(item.id);updateProgress();stopTimer();$("startTimer").disabled=true;
  document.dispatchEvent(new CustomEvent("aperture:gift-completed",{detail:{id:item.id}}));
  $("markDone").disabled=true;
  if(at<sequence.length-1){
    $("nextStep").hidden=false;
    setStatus("You tried “"+item.title+".” One more action is ready when you are.");
  }else{
    setStatus("Experience complete. You turned a little gift into a real action. Save or share the keepsake if you wish.");
  }
}
function makeLink(){
  if(!current())return "";
  const p=new URLSearchParams();
  if(sequence.length>1)p.set("seq",sequence.join(","));
  else p.set("g",current().id);
  const to=$("recipient").value.trim().slice(0,50),from=$("sender").value.trim().slice(0,50);
  if(to)p.set("to",to);if(from)p.set("from",from);
  // Keep dedications in URL fragments rather than sending them to the site server in a query.
  return location.origin+location.pathname+"#"+p.toString();
}
async function copy(text){
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text);
  const input=document.createElement("textarea");input.value=text;
  input.style.position="fixed";input.style.opacity="0";document.body.appendChild(input);input.select();
  const result=document.execCommand("copy");input.remove();if(!result)throw new Error("Clipboard unavailable");
}
function shareText(){const item=current();return item?"A little gift for you: “"+item.title+".” Open it and try one real-world action. "+makeLink():"";}
async function shareGift(){
  if(!current())return;
  if(navigator.share){
    try{await navigator.share({title:"A Gift That Moves · "+current().title,text:"A little experience of care, wonder, or kindness.",url:makeLink()});setShareStatus("Share sheet closed. Only your chosen app can confirm delivery.");}
    catch(e){setShareStatus(e.name==="AbortError"?"Sharing cancelled.":"Sharing unavailable. Use Copy gift link instead.");}
  }else{
    try{await copy(shareText());setShareStatus("Gift link copied. You can choose where to send it.");}
    catch(e){setShareStatus("Copy unavailable. You can share the URL shown in your browser.");}
  }
}
function drawGrid(){
  const term=search.value.trim().toLocaleLowerCase("en");
  const group=category.value;
  const shown=actions.filter(item=>(group==="all"||item.category===group)&&(!term||[item.title,item.action,item.reflect,item.category].join(" ").toLocaleLowerCase("en").includes(term)));
  all.replaceChildren();
  const fragment=document.createDocumentFragment();
  for(const item of shown){
    const b=document.createElement("button");b.type="button";b.className="choice-btn";b.dataset.giftId=item.id;
    b.setAttribute("aria-label","Open gift "+item.id+", "+item.title);
    const num=document.createElement("span");num.className="num";num.textContent=item.icon+"  "+item.id+" / 100";
    const name=document.createElement("span");name.className="title";name.textContent=item.title;
    const kind=document.createElement("span");kind.className="kind";kind.textContent=item.category;
    b.append(num,name,kind);fragment.appendChild(b);
  }
  all.appendChild(fragment);
  $("count").textContent=shown.length+" of 100 activities shown";
}
function writeWords(ctx,text,x,y,maxWidth,lineHeight,maxLines){
  let line="",drawn=0;
  const words=String(text).split(/\s+/);
  for(const word of words){
    const attempt=line?line+" "+word:word;
    if(ctx.measureText(attempt).width>maxWidth&&line){
      ctx.fillText(line,x,y);y+=lineHeight;drawn++;line=word;
      if(drawn>=maxLines)return y;
    }else line=attempt;
  }
  if(line&&drawn<maxLines){ctx.fillText(line,x,y);y+=lineHeight;}
  return y;
}
function exportCard(){
  const item=current();if(!item)return;
  try{
    const width=1080,height=1350,canvas=document.createElement("canvas");canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");
    const gradient=ctx.createLinearGradient(0,0,width,height);
    gradient.addColorStop(0,"#0c2822");gradient.addColorStop(.6,"#276550");gradient.addColorStop(1,"#967149");
    ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
    ctx.strokeStyle="rgba(240,215,150,.22)";ctx.lineWidth=4;
    for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(855,310,140+i*115,0,2*Math.PI);ctx.stroke();}
    ctx.textAlign="left";ctx.fillStyle="#f2d9a6";ctx.font="bold 34px system-ui";
    ctx.fillText("APERTURE  ×  CLEARLINE",76,130);
    ctx.fillStyle="#fff4db";ctx.font="42px system-ui";let y=255;
    y=writeWords(ctx,giftLabel(),76,y,915,57,2)+62;
    ctx.fillStyle="#f9deab";ctx.font="bold 31px system-ui";ctx.fillText(item.category.toUpperCase()+"  ·  "+item.id+"/100",76,y);y+=85;
    ctx.fillStyle="#ffffff";ctx.font="bold 76px Georgia,serif";
    y=writeWords(ctx,item.title,76,y,915,94,4)+54;
    ctx.fillStyle="#fff6e7";ctx.font="39px system-ui";
    y=writeWords(ctx,item.action,76,y,915,57,7)+45;
    if(y<1110){ctx.fillStyle="#e8d3aa";ctx.font="30px system-ui";writeWords(ctx,"Ask yourself: "+item.reflect,76,y,915,43,3);}
    ctx.fillStyle="#f8e7bc";ctx.font="bold 29px system-ui";ctx.fillText("100 FREE EXPERIENCES  •  GIFT THAT MOVES",76,1253);
    const link=document.createElement("a");link.download="aperture-gift-"+item.id+".png";link.href=canvas.toDataURL("image/png");
    document.body.append(link);link.click();link.remove();
    setStatus("Your shareable keepsake image was prepared. You can save, print, or send it yourself.");
  }catch(e){setStatus("This browser could not prepare the PNG. Use Print gift or Copy gift link instead.");}
}
for(const c of [...new Set(actions.map(x=>x.category))]){
  const o=document.createElement("option");o.value=c;o.textContent=c+" (10)";category.append(o);
}
$("surprise").addEventListener("click",()=>openSequence(sample(1),"random"));
$("randomThree").addEventListener("click",()=>openSequence(sample(3),"random-journey"));
$("today").addEventListener("click",()=>openSequence([todaysId()],"daily"));
$("guided").addEventListener("click",()=>openSequence(["001","041","021"],"guided"));
$("another").addEventListener("click",()=>openSequence(sample(1,current()?[current().id]:[]),"random"));
$("markDone").addEventListener("click",markDone);
$("nextStep").addEventListener("click",()=>{if(at<sequence.length-1){at++;showCurrent();}});
$("startTimer").addEventListener("click",()=>{
  if(interval!==null)return;
  if(secondsLeft<=0)secondsLeft=90;
  paused=false;$("pauseTimer").disabled=false;$("startTimer").disabled=true;
  $("startTimer").textContent="Moment in progress…";
  interval=setInterval(tick,1000);timerText();
  setStatus("Your optional 90-second moment has begun. Move at a pace that works for you.");
});
$("pauseTimer").addEventListener("click",()=>{
  if(interval!==null){
    clearInterval(interval);interval=null;paused=true;$("pauseTimer").textContent="Resume";$("startTimer").disabled=true;
    setStatus("Timer paused. Your practice can continue without counting down.");
  }else if(paused){
    paused=false;$("pauseTimer").textContent="Pause";interval=setInterval(tick,1000);
    setStatus("Timer resumed.");
  }
});
$("shareGift").addEventListener("click",shareGift);
$("copyGift").addEventListener("click",async()=>{
  if(!current())return;
  try{await copy(makeLink());setShareStatus("Your chosen gift link was copied. Share it with a recipient you choose.");}
  catch(e){setShareStatus("Clipboard unavailable. Copy this address from your browser: "+makeLink());}
});
$("smsGift").addEventListener("click",()=>{
  if(!current())return;
  const text=encodeURIComponent(shareText());
  const isiOS=/iPhone|iPad|iPod/.test(navigator.userAgent);
  location.href="sms:"+(isiOS?"&":"?")+"body="+text;
  setShareStatus("Your messaging app may open. You must select the recipient and press Send yourself.");
});
$("saveCard").addEventListener("click",exportCard);
$("printGift").addEventListener("click",()=>{if(current())window.print();});
$("copyReflection").addEventListener("click",async()=>{
  const item=current();if(!item)return;
  const note=$("privateNote").value.trim();
  const message="My experience: "+item.title+"\nAction: "+item.action+"\nMy reflection: "+(note||"I chose to make a little space for care today.");
  try{await copy(message);setStatus("Your reflection was copied. Nothing was sent.");}
  catch(e){setStatus("Copy unavailable. You can select and copy your private note manually.");}
});
category.addEventListener("change",drawGrid);
search.addEventListener("input",drawGrid);
all.addEventListener("click",e=>{
  const b=e.target.closest("[data-gift-id]");
  if(b&&all.contains(b))openSequence([b.dataset.giftId],"chosen");
});
$("recipient").addEventListener("input",()=>{if(current())$("dedication").textContent=giftLabel();});
$("sender").addEventListener("input",()=>{if(current())$("dedication").textContent=giftLabel();});
function loadGiftLink(){
  const fragment=location.hash.replace(/^#/,"");
  if(!fragment||!fragment.includes("="))return;
  const p=new URLSearchParams(fragment);
  const to=(p.get("to")||"").slice(0,50),from=(p.get("from")||"").slice(0,50);
  $("recipient").value=to;$("sender").value=from;
  const fromSequence=p.get("seq");
  const items=fromSequence?fromSequence.split(",").slice(0,3):[p.get("g")||""];
  const valid=items.filter(x=>/^\d{3}$/.test(x)&&byId.has(x));
  if(valid.length){
    openSequence(valid,valid.length>1?"shared-journey":"shared",false);
    requestAnimationFrame(()=>panel.scrollIntoView({behavior:"auto",block:"start"}));
  }
}
updateProgress();drawGrid();timerText();loadGiftLink();
window.addEventListener("hashchange",loadGiftLink);
})();