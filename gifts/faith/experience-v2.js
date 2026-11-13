/* APERTURE Gift Lab v2. No backend, contact harvesting, auto-sending, or payment gate. */
(() => {
"use strict";
const $=id=>document.getElementById(id);
const reveal=$("v2Reveal"), certificate=$("v2Certificate"), next=$("v2Next");
if(!reveal||!certificate||!next)return;
const actions=window.APERTURE_GIFT_ACTIONS||[];
const lookup=new Map(actions.map(a=>[a.id,a]));
let selected=null, completed=null, previousFocus=null, chain=0;
const storageKey="aperture-gift-v2-chain";
try{chain=Math.min(999,Math.max(0,Number(sessionStorage.getItem(storageKey))||0))}catch(_){}
const safe=s=>String(s||"").trim().slice(0,50);
const actionId=()=>{const kind=$("giftKind").textContent;const m=kind.match(/Gift (\d{3})\/100/);return m&&lookup.has(m[1])?m[1]:null};
const dedication=()=>{const to=safe($("recipient").value),from=safe($("sender").value);return {to,from};};
const label=()=>{const {to,from}=dedication();return to?(from?"For "+to+" · From "+from:"For "+to):(from?"From "+from:"A gift for you");};
const message=(a,url)=>"A little gift for you: "+a.title+". Open it, try one meaningful action, then pass the kindness along if you wish. "+url;
function fragmentLink(id){
  const p=new URLSearchParams();p.set("g",id);
  const {to,from}=dedication();
  if(to)p.set("to",to);if(from)p.set("from",from);
  return location.origin+location.pathname+"#"+p.toString();
}
function freshGift(exclude){
  const candidates=actions.filter(a=>a.id!==exclude);
  if(!candidates.length)return null;
  const i=window.crypto&&crypto.getRandomValues?(()=>{const x=new Uint32Array(1);crypto.getRandomValues(x);return x[0]%candidates.length})():Math.floor(Math.random()*candidates.length);
  return candidates[i];
}
function closeReveal(){
  reveal.hidden=true;document.body.style.overflow="";
  if(previousFocus&&previousFocus.isConnected&&typeof previousFocus.focus==="function")previousFocus.focus();
  else $("giftTitle").setAttribute("tabindex","-1"),$("giftTitle").focus();
}
function openReveal(a){
  selected=a;previousFocus=document.activeElement;
  $("v2RevealTo").textContent=label();
  $("v2RevealTitle").textContent=a.title;
  $("v2RevealTheme").textContent=a.category;
  reveal.hidden=false;document.body.style.overflow="hidden";
  $("v2Open").focus();
}
function clearCompleted(){
  certificate.hidden=true;next.hidden=true;completed=null;
}
function makeCertificate(a){
  const {to,from}=dedication();
  const date=new Intl.DateTimeFormat(undefined,{year:"numeric",month:"long",day:"numeric"}).format(new Date());
  $("v2CertificateTo").textContent=to||"A person who chose kindness";
  $("v2CertificateGiftName").textContent=a.title;
  $("v2CertificateDate").textContent=date;
  $("v2CertificateFrom").textContent=from?"A gift from "+from:"An APERTURE × Clearline experience";
  $("v2CertificateNote").textContent="I completed a real act of "+a.category.toLowerCase()+".";
  $("v2NextTitle").textContent="Your gift can keep moving.";
  $("v2NextDescription").textContent="Pass this same experience to someone who wants it, or surprise them with a different one. Nothing is sent until you choose a recipient and press Send.";
  certificate.hidden=false;next.hidden=false;
  completed={...a,date,to,from};
  $("v2Chain").textContent=String(chain);
}
function drawCertificate(){
  if(!completed)return;
  const a=completed,w=1080,h=1350,c=document.createElement("canvas");c.width=w;c.height=h;
  const g=c.getContext("2d");if(!g)throw Error("Canvas unavailable");
  const bg=g.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#10372c");bg.addColorStop(.65,"#275f4a");bg.addColorStop(1,"#9e7644");g.fillStyle=bg;g.fillRect(0,0,w,h);
  g.strokeStyle="#e6c991";g.lineWidth=6;g.strokeRect(44,44,w-88,h-88);
  for(let i=0;i<5;i++){g.beginPath();g.arc(840,300,110+i*100,0,Math.PI*2);g.strokeStyle="rgba(247,221,155,"+(.2-i*.03)+")";g.lineWidth=3;g.stroke();}
  const write=(text,x,y,font,color,maxWidth,lineHeight,maxLines)=>{
    g.font=font;g.fillStyle=color;g.textAlign="center";const words=String(text).split(/\s+/);let line="",count=0;
    for(const word of words){const trial=line?line+" "+word:word;if(g.measureText(trial).width>maxWidth&&line){g.fillText(line,x,y);y+=lineHeight;line=word;count++;if(count>=maxLines)return y;}else line=trial;}
    if(line&&count<maxLines){g.fillText(line,x,y);y+=lineHeight;}return y;
  };
  write("APERTURE  ×  CLEARLINE",w/2,160,"bold 34px system-ui","#f7dca8",900,44,1);
  write("✦",w/2,335,"150px Georgia,serif","#f5d99e",900,150,1);
  write("CERTIFICATE OF KINDNESS",w/2,470,"bold 36px system-ui","#f2d39b",920,50,1);
  let y=write(a.to||"A person who chose kindness",w/2,575,"bold 68px Georgia,serif","#ffffff",870,83,3)+36;
  y=write("Completed: "+a.title,w/2,y,"44px Georgia,serif","#fff8e8",880,64,4)+42;
  write("A real act of "+a.category.toLowerCase(),w/2,Math.min(y,1030),"34px system-ui","#f5e6c7",880,50,2);
  write(a.date,w/2,1145,"32px system-ui","#fff3da",900,42,1);
  write(a.from?"Gifted by "+a.from:"Made with care, shared freely",w/2,1205,"29px system-ui","#f5e0bd",900,42,1);
  const link=document.createElement("a");link.download="aperture-certificate-"+a.id+".png";link.href=c.toDataURL("image/png");document.body.append(link);link.click();link.remove();
}
async function copy(t){
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(t);return;}
  const ta=document.createElement("textarea");ta.value=t;ta.style.position="fixed";ta.style.opacity="0";document.body.append(ta);ta.select();const ok=document.execCommand("copy");ta.remove();if(!ok)throw Error("Clipboard not available");
}
function feedback(t){$("v2Status").textContent=t;}
async function share(id){
  const a=lookup.get(id);if(!a)return;
  const link=fragmentLink(id);
  if(navigator.share){
    try{await navigator.share({title:"A gift of "+a.category,text:"An activity for you: "+a.title,url:link});feedback("Share sheet closed. Only your chosen app can confirm whether the message was delivered.");}
    catch(e){feedback(e.name==="AbortError"?"Sharing cancelled.":"Share sheet unavailable. Try Copy link.");}
  }else{try{await copy(message(a,link));feedback("Gift message copied. You choose where to send it.");}catch(_){feedback("Copy unavailable. You can share this link: "+link);}}
}
function nextGift(){
  if(!completed)return;
  const a=freshGift(completed.id);if(!a)return;
  $("v2NextGiftTitle").textContent=a.title;
  $("v2NextGiftTitle").dataset.giftId=a.id;
  $("v2NextGiftTitle").hidden=false;
}
function increment(){
  chain=Math.min(999,chain+1);$("v2Chain").textContent=String(chain);
  try{sessionStorage.setItem(storageKey,String(chain))}catch(_){}
}
document.addEventListener("aperture:gift-opened",e=>{
  const a=lookup.get(e.detail?.id);if(!a)return;
  clearCompleted();openReveal(a);
});
document.addEventListener("aperture:gift-completed",e=>{
  const a=lookup.get(e.detail?.id);if(!a)return;
  makeCertificate(a);increment();certificate.scrollIntoView({block:"start",behavior:"smooth"});
});
$("v2Open").addEventListener("click",closeReveal);
$("v2Skip").addEventListener("click",closeReveal);
reveal.addEventListener("keydown",e=>{
  if(e.key==="Escape"){e.preventDefault();closeReveal();return;}
  if(e.key==="Tab"){const focusable=[...reveal.querySelectorAll("button:not([disabled])")];if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
$("v2DownloadCertificate").addEventListener("click",()=>{try{drawCertificate();feedback("Certificate image prepared. You choose whether to save or send it.");}catch(_){feedback("Could not generate the image in this browser. Try Print certificate.");}});
$("v2PrintCertificate").addEventListener("click",()=>window.print());
$("v2PassSame").addEventListener("click",()=>{if(completed)share(completed.id);});
$("v2SurpriseNext").addEventListener("click",()=>{nextGift();const id=$("v2NextGiftTitle").dataset.giftId;if(id)share(id);});
$("v2CopyNext").addEventListener("click",async()=>{if(!completed)return;const a=freshGift(completed.id);if(!a)return;try{await copy(message(a,fragmentLink(a.id)));feedback("A different gift was copied. Send it to someone who would welcome it.");}catch(_){feedback("Copy unavailable. Try the Share button.");}});
if(!$("giftPanel").hidden){const id=actionId();if(id)openReveal(lookup.get(id));}
$("v2NewGift").addEventListener("click",()=>{
  clearCompleted();$("surprise").click();
});
})();