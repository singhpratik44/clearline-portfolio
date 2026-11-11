"use strict";
const $ = id => document.getElementById(id);
const DAYS=Object.freeze([
 {title:"The ordinary gifts.",subtitle:"Noticing what is already here.",notice:"What small comfort, support, or ordinary moment have you overlooked today?",action:"Name one ordinary thing you appreciate, then care for it well.",prayer:"Help me notice the care already around me. Keep me humble enough to receive and generous enough to share.",quiet:"I can notice one ordinary kindness without needing to make the day perfect."},
 {title:"The people who carried us.",subtitle:"Specific thanks are more meaningful than a performance.",notice:"Who offered you patience, knowledge or care—perhaps quietly, without recognition?",action:"Thank one person for something specific, if doing so is welcome and safe.",prayer:"Help me remember the people whose ordinary kindness made a difference. Let my thanks be sincere, never a demand.",quiet:"Someone made a difference. I can acknowledge it without expecting anything back."},
 {title:"The work we rarely see.",subtitle:"Honoring invisible efforts.",notice:"Whose effort helped make your day possible: a caregiver, cleaner, teacher, neighbor or worker?",action:"Notice one often-overlooked contribution and respond with respect, fairness or a kind word.",prayer:"May I not take another person's work for granted. Help me honor effort and treat people justly.",quiet:"I can see the unseen work that supports daily life, and practice respect."},
 {title:"Gratitude on hard days.",subtitle:"Truth and thankfulness can coexist.",notice:"What is difficult today? Can you also name one small source of support without minimizing the difficulty?",action:"Offer yourself an honest pause. Reach out for support if needed; gratitude need not replace help.",prayer:"Help me speak honestly about pain, receive support without shame and notice any gentle good that is still present.",quiet:"I do not need to be grateful for harm. I can name what hurts and still notice support."},
 {title:"The dignity of enough.",subtitle:"Receiving without comparison.",notice:"What small provision, boundary or ordinary sufficiency helped you today?",action:"Care for something entrusted to you—your time, attention, belongings or relationships.",prayer:"Let contentment make me responsible, not complacent. Help me share fairly and act with integrity.",quiet:"I can acknowledge what is enough today while still working toward what matters."},
 {title:"When thanks becomes service.",subtitle:"Let care reach beyond our words.",notice:"Who might benefit from your attention today, and what would actually be helpful to them?",action:"Offer one consent-respecting act of service, without publicity or expecting repayment.",prayer:"Let my gratitude become useful care. Keep my service humble and respectful of others' wishes.",quiet:"I can carry thankfulness into one small, practical act of care."},
 {title:"The art of returning.",subtitle:"No perfect streak. No finish line.",notice:"What have you learned about what matters to you? What would you like to keep noticing?",action:"Choose one simple practice to return to when it is helpful. Missing a day changes nothing about your worth.",prayer:"Thank You for this moment of return. Help me stay truthful, grounded and willing to serve again.",quiet:"I can return when I choose. Gratitude is an invitation, not a score."}
]);
let active=0,validPreview=false;
const language = $("prayerLanguage");
function render(){
 const d=DAYS[active];
 $("dayNumber").textContent=String(active+1).padStart(2,"0")+" / 07";
 $("dayTitle").textContent=d.title;$("daySubtitle").textContent=d.subtitle;
 $("noticeText").textContent=d.notice;$("actionText").textContent=d.action;
 const style=language.value;
 $("prayerText").textContent=style==="quiet"?d.quiet:style==="waheguru"?"Waheguru, "+d.prayer:"God, "+d.prayer;
 for(const b of document.querySelectorAll("[data-day]"))b.setAttribute("aria-pressed",String(Number(b.dataset.day)===active));
 $("previousDay").disabled=active===0;$("nextDay").textContent=active===6?"Begin again ↻":"Next invitation →";
 $("dayStatus").textContent="Day "+(active+1)+" of seven. Each step is optional; no progress is tracked.";
}
document.querySelectorAll("[data-day]").forEach(btn=>btn.addEventListener("click",()=>{active=Number(btn.dataset.day);render();}));
language.addEventListener("change",render);
$("previousDay").addEventListener("click",()=>{active=Math.max(0,active-1);render();});
$("nextDay").addEventListener("click",()=>{active=(active+1)%DAYS.length;render();});
const fields=["person","specific","impact","hard"].map($);
const value=id=>$(id).value.trim();
function resetPreview(){validPreview=false;$("noteWrap").hidden=true;$("notePreview").textContent="";}
fields.forEach(el=>el.addEventListener("input",()=>{resetPreview();$("noteStatus").textContent="Changed text has not been copied or saved."; }));
function makePreview(){
 const person=value("person"),specific=value("specific"),impact=value("impact");
 // The optional difficulty field is intentionally excluded from shareable exports.
 const lines=[person?"To "+person+",":"To someone who made a difference,","",
   specific?"Thank you for "+specific+(/[.!?]$/.test(specific)?"":"."):"Thank you for the care you have shown.",
   impact?"It mattered to me because "+impact+( /[.!?]$/.test(impact)?"":"."):"I wanted to pause and acknowledge it.",
   "","With gratitude."];
 const note=lines.join("\n");
 $("notePreview").textContent=note;$("noteWrap").hidden=false;
 validPreview=true;
 $("noteStatus").textContent="Preview created on this device. Your optional difficulty reflection is not included.";
 $("notePreview").focus();
}
$("makeNote").addEventListener("click",makePreview);
$("clearNote").addEventListener("click",()=>{
 for(const el of fields)el.value="";
 resetPreview();$("noteStatus").textContent="All reflection fields and the preview have been cleared from this page.";
 $("person").focus();
});
$("copyNote").addEventListener("click",async()=>{
 if(!validPreview)return;
 const note=$("notePreview").textContent;
 try{if(!navigator.clipboard?.writeText)throw new Error("Copy unavailable");
  await navigator.clipboard.writeText(note);
  $("noteStatus").textContent="Copied to your clipboard. You control where it goes.";
 }catch{ $("noteStatus").textContent="Clipboard access is unavailable. Select the preview text and copy it manually."; }
});
$("printNote").addEventListener("click",()=>{
 if(!validPreview)return;
 document.body.classList.add("print-note");
 try{window.print();$("noteStatus").textContent="Print or Save as PDF opened locally."; }
 catch{$("noteStatus").textContent="Printing is unavailable on this device.";}
});
window.addEventListener("afterprint",()=>document.body.classList.remove("print-note"));
$("sharePage").addEventListener("click",async()=>{
 const url="https://singhpratik44.github.io/clearline-portfolio/prayer/gratitude/";
 const status=$("shareStatus");
 try{if(navigator.share){await navigator.share({title:"A Quiet Journey — Seven Days of Gratitude",text:"A free private practice of gratitude, truth and practical care.",url});status.textContent="Thank you for sharing the free practice.";return;}
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);status.textContent="Public page link copied. No personal notes were shared.";return;}
  status.textContent="Share the public page: "+url;
 }catch(e){if(e.name!=="AbortError")status.textContent="You can share this public link: "+url;}
});
render();