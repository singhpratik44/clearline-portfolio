(() => {
"use strict";
const tracks=window.AP_SUBJECTS||[];
const grid=document.getElementById("program-grid");
const search=document.getElementById("program-search");
const counter=document.getElementById("program-count");
const noMatches=document.getElementById("program-empty");
const filterButtons=[...document.querySelectorAll("[data-family]")];
let family="all";
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
function render(){
 if(!grid)return;
 const q=search.value.trim().toLowerCase();
 const matching=tracks.filter(t=>(family==="all"||t.family===family)&&(!q||[t.title,t.summary,t.family,t.tools,t.output].join(" ").toLowerCase().includes(q)));
 grid.replaceChildren();
 matching.forEach(t=>{
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
 counter.textContent=matching.length+" of "+tracks.length+" possible specialization pathways";
 noMatches.hidden=matching.length>0;
 filterButtons.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.family===family)));
}
search?.addEventListener("input",render);
filterButtons.forEach(b=>b.addEventListener("click",()=>{family=b.dataset.family;render();}));
render();
})();