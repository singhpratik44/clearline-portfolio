(() => {
"use strict";
// Public launch: coding and game development only. Broader research paths remain archived / exploratory.
const codingIds=new Set(["scratch-stories","roblox-worlds","minecraft-makers","3d-game-design","python-adventures","web-creators","mobile-prototypes","music-media-code"]);
const tracks=(window.AP_SUBJECTS||[]).filter(t=>codingIds.has(t.id));
const grid=document.getElementById("program-grid");
const search=document.getElementById("program-search");
const counter=document.getElementById("program-count");
const noMatches=document.getElementById("program-empty");
const filterButtons=[...document.querySelectorAll("[data-family]")];
let family="all";
let expanded=false;
const expand=document.getElementById("show-all-subjects");
const expandHint=document.getElementById("subject-expand-hint");
const featured=["scratch-stories","roblox-worlds","minecraft-makers","python-adventures","web-creators","3d-game-design"];

const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
function render(){
 if(!grid)return;
 const q=search.value.trim().toLowerCase();
 const matching=tracks.filter(t=>(family==="all"||t.family===family)&&(!q||[t.title,t.summary,t.family,t.tools,t.output].join(" ").toLowerCase().includes(q)));
 const discoverMode=family==="all"&&!q;
 const display=discoverMode&&!expanded
   ? featured.map(id=>matching.find(t=>t.id===id)).filter(Boolean)
   : matching;
 grid.replaceChildren();
 display.forEach(t=>{
  const card=el("article","subject-card");
  const head=el("div","subject-head");
  head.append(el("span","subject-family",t.family),el("span","subject-age","Suggested "+t.min+"+"));
  const title=el("h3","",t.title);
  const description=el("p","",t.summary);
  const footer=el("div","subject-footer");
  const learn=el("a","","See the pathway ↗");
  learn.href="catalog/?track="+encodeURIComponent(t.id)+"#pathway";
  learn.setAttribute("aria-label","View "+t.title+" project roadmap");
  const book=el("a","subject-book","Lesson options ↗");
  book.href="book/?track="+encodeURIComponent(t.id);
  book.setAttribute("aria-label","Review lesson availability and Stripe checkout for "+t.title);
  footer.append(learn,book);card.append(head,title,description,footer);grid.append(card);
 });
 counter.textContent=display.length+" shown of "+tracks.length+" coding pathways"+(discoverMode&&!expanded?" · Featured starting interests":"");
 if(expand){
   expand.hidden=!discoverMode;
   expand.setAttribute("aria-expanded",String(expanded));
   expand.textContent=expanded?"Show six featured pathways ↑":"Browse all "+tracks.length+" coding pathways ↓";
   if(expandHint)expandHint.textContent=expanded?"Select any specialization for the full pathway and subject-specific lesson options.":"Choose a featured path, search by interest, or expand the entire catalog.";
 }
 noMatches.hidden=matching.length>0;
 filterButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.family===family)));
}
expand?.addEventListener("click",()=>{
 expanded=!expanded;render();
 if(!expanded)document.getElementById("programs")?.scrollIntoView({behavior:"auto",block:"start"});
});
const directPayment=document.querySelector(".direct-pay");
directPayment?.addEventListener("toggle",async()=>{
 if(!directPayment.open)return;
 const note=directPayment.querySelector("p");
 if(note)note.setAttribute("aria-live","polite");
 try{
   await window.AP_loadStripeCheckout();
 }catch(err){
   if(note)note.textContent="Secure Stripe checkout could not load. Please check your connection and use the subject lesson inquiry instead. No payment has been taken.";
 }
});
search?.addEventListener("input",render);
filterButtons.forEach(b=>b.addEventListener("click",()=>{family=b.dataset.family;render();}));
render();
})();