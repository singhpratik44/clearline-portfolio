/* APERTURE 2.1 — Thirty-Six Chapter Constellation.
 * Browser-only presentation. The existing journey select is the canonical
 * selection control; we mirror it rather than building a competing state machine.
 * No analytics, network calls, AI invocation, or personal profile data.
 */
const $=id=>document.getElementById(id);
const STORAGE_KEY="aperture-quiet-journey-chapter-v1";
const years=[
 {name:"NOTICE",tag:"AWAKENING",description:"Pay attention to what is true, including difficulty and delight."},
 {name:"PRACTICE",tag:"INTEGRATION",description:"Find humane rhythms for focus, persistence, and recovery."},
 {name:"OFFER",tag:"CONTRIBUTION",description:"Explore care, gratitude, and service without abandoning yourself."}
];
const prompts=[
 "Arrive exactly as you are. What does this moment ask you to notice?",
 "What have you been moving past too quickly?",
 "Where could you listen before trying to solve?",
 "What small good can you genuinely appreciate today?",
 "What everyday detail still leaves room for wonder?",
 "Which circumstance could you acknowledge without pretending to like it?",
 "What would count as real rest for you today?",
 "Name one value worth protecting amid competing demands.",
 "Where could you ask for support rather than doing everything alone?",
 "What could patience make possible without requiring a perfect mood?",
 "Which truth would you like to express with care?",
 "What would beginning again look like without a streak or penalty?",
 "Which one meaningful action deserves the next few minutes?",
 "What can move from your mind into a parking list for later?",
 "Which tiny daily habit supports your actual capacity?",
 "What boundary might protect the attention you need?",
 "What question could you explore just for curiosity?",
 "What new idea have you encountered that shifts your perspective?",
 "What would a compassionate response look like here?",
 "Where is an opportunity to repair something without forcing an outcome?",
 "What smaller step would make persistence more sustainable?",
 "What needs renewal before you continue?",
 "What change do you notice without measuring your worth by it?",
 "What pressure can you release while keeping what matters?",
 "What can you offer freely, without treating kindness as a debt?",
 "How could you help without claiming credit or control?",
 "Whose perspective deserves your full attention?",
 "What would care look like within healthy boundaries?",
 "What might your community need that you can realistically provide?",
 "Which gift or skill could you share with humility?",
 "What learning could you pass along without expecting anything back?",
 "Whose effort or success could you celebrate?",
 "Where could you support repair rather than winning?",
 "How might you protect the wonder of another person?",
 "What resource or opportunity calls for thoughtful stewardship?",
 "Looking back, what does it mean to arrive again today?"
];
const lensTags={
 presence:"◉ PRESENCE · NOTICE WHAT IS HERE",
 gratitude:"♡ GRATITUDE · APPRECIATE HONESTLY",
 focus:"◎ FOCUS · CHOOSE ONE THING",
 persistence:"↗ PERSISTENCE · GENTLE CONTINUATION",
 recovery:"☾ REST · REPLENISH WITHOUT GUILT",
 creativity:"✧ WONDER · EXPLORE AN UNEXPECTED IDEA",
 kindness:"❋ LOVE · CARE WITH BOUNDARIES",
 learning:"❃ GROWTH · STAY CURIOUS",
 courage:"◇ COURAGE · CHOOSE WHAT MATTERS",
 contribution:"✺ SERVICE · CONTRIBUTE SUSTAINABLY"
};
function safeLoad(){
 try{const raw=Number(localStorage.getItem(STORAGE_KEY));return Number.isInteger(raw)&&raw>=1&&raw<=36?raw:1}
 catch{return 1}
}
function safeSave(value){try{localStorage.setItem(STORAGE_KEY,String(value))}catch{/* unsupported/private browsing */}}
function clamp(value){const n=Number(value);return Number.isInteger(n)?Math.max(1,Math.min(36,n)):1}
function init(){
 const select=$("chapter"),stars=$("uvStars"),number=$("uvYearNumber"),center=$("uvCenterName"),tag=$("uvCenterTag"),
 coord=$("uvCoordinate"),kicker=$("uvChapterKicker"),title=$("uvChapterTitle"),description=$("uvChapterDescription"),
 scrub=$("uvScrub"),prev=$("uvPrevious"),next=$("uvNext"),signal=$("lensSignal"),hero=$("heroIntention");
 if(!select||!stars||!number||!center||!tag||!coord||!kicker||!title||!description||!scrub||!prev||!next||!signal)return;
 let current=1,renderedYear=0;
 const chapterName=n=>{
  const option=select.querySelector('option[value="'+n+'"]');
  return option?.textContent?.split(" — ").slice(1).join(" — ")||"Chapter "+String(n).padStart(2,"0");
 };
 function buildYear(year){
  renderedYear=year;
  stars.replaceChildren();
  for(let index=0;index<12;index++){
   const month=(year-1)*12+index+1;
   const angle=(-Math.PI/2)+(Math.PI*2*index)/12;
   const b=document.createElement("button");
   b.type="button";
   b.className="uv-star";
   b.dataset.chapter=String(month);
   b.style.left=(50+41*Math.cos(angle)).toFixed(3)+"%";
   b.style.top=(50+38*Math.sin(angle)).toFixed(3)+"%";
   b.textContent=String(month).padStart(2,"0");
   b.setAttribute("aria-label","Chapter "+month+": "+chapterName(month));
   b.setAttribute("aria-current","false");
   b.title=chapterName(month);
   b.addEventListener("click",()=>choose(month));
   b.addEventListener("keydown",event=>{
    if(event.key==="ArrowRight"||event.key==="ArrowDown"){event.preventDefault();choose(Math.min(36,month+1),true)}
    if(event.key==="ArrowLeft"||event.key==="ArrowUp"){event.preventDefault();choose(Math.max(1,month-1),true)}
   });
   stars.append(b);
  }
 }
 function render(n){
  current=clamp(n);
  const year=Math.ceil(current/12);
  const item=years[year-1];
  if(renderedYear!==year)buildYear(year);
  number.textContent=String(year).padStart(2,"0");
  center.textContent=item.name;
  tag.textContent=item.tag;
  coord.textContent=String(current).padStart(2,"0")+" / 36";
  kicker.textContent="CHAPTER "+String(current).padStart(2,"0")+" / YEAR "+String(year).padStart(2,"0");
  title.textContent=chapterName(current);
  description.textContent=prompts[current-1];
  scrub.value=String(current);
  scrub.setAttribute("aria-valuetext","Chapter "+current+": "+chapterName(current));
  prev.disabled=current===1;
  next.disabled=current===36;
  document.querySelectorAll("[data-uv-year]").forEach(button=>{
   button.setAttribute("aria-pressed",String(year)===button.dataset.uvYear?"true":"false");
  });
  stars.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",b.dataset.chapter===String(current)?"true":"false"));
  safeSave(current);
 }
 function choose(n,restoreFocus=false){
  const target=clamp(n);
  select.value=String(target);
  select.dispatchEvent(new Event("change",{bubbles:true}));
  if(restoreFocus){
   const button=stars.querySelector('[data-chapter="'+target+'"]');
   button?.focus({preventScroll:true});
  }
 }
 select.addEventListener("change",()=>render(Number(select.value)));
 document.querySelectorAll("[data-uv-year]").forEach(button=>button.addEventListener("click",()=>{
  choose((Number(button.dataset.uvYear)-1)*12+1);
 }));
 scrub.addEventListener("input",()=>choose(Number(scrub.value)));
 prev.addEventListener("click",()=>choose(current-1));
 next.addEventListener("click",()=>choose(current+1));
 const saved=safeLoad();
 // Existing app may have initialized the old chapter dropdown. Reuse it.
 choose(saved);

 // Reflect an intentional choice in the entire scene without rapid auto-navigation.
 const lensTitle=$("lensName");
 function updateLens(){
  const selected=document.querySelector('.orbit-node[aria-pressed="true"]');
  const id=selected?.dataset.id||"presence";
  const tagText=lensTags[id]||lensTags.presence;
  document.documentElement.dataset.awLens=id;
  const visual=document.querySelector(".f-visual");
  if(visual)visual.dataset.lens=id;
  signal.textContent=tagText;
  if(hero)hero.textContent=lensTitle?.textContent||"Presence";
 }
 if(lensTitle)new MutationObserver(updateLens).observe(lensTitle,{childList:true,subtree:true});
 updateLens();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
else init();
