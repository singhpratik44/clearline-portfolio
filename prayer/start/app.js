"use strict";
const steps=[
{title:"Be here without pretending.",body:"Sit comfortably, if you can. Notice what is real. You do not need to earn a quiet moment.",prayer:"God, help me face this moment with honesty, humility and care."},
{title:"Listen to what matters.",body:"Choose one focus below. Read the words gently or use your own. You may sit silently instead.",prayer:""},
{title:"Let one small action follow.",body:"Choose one practical act you can take today. Not a promise of results; a way of making care visible.",prayer:""}
];
const focuses={
clarity:["Help me see the truth without fear or performance.","Name one fact clearly and take a responsible next step."],
gratitude:["May I recognize what has been given without entitlement.","Thank one person sincerely, without asking for anything."],
courage:["Give me courage to act with patience and humility.","Begin one manageable task you have been avoiding."],
family:["Help me listen and care without trying to control others.","Give someone your patient, undivided attention."],
service:["May I serve without seeking praise or leverage.","Offer one useful act that respects another person's dignity."]
};
let active=0;const $=id=>document.getElementById(id);
function render(){const focus=focuses[$("focus").value]||focuses.clarity;const step=steps[active];$("stepCount").textContent=String(active+1).padStart(2,"0")+" / "+["ARRIVE","REFLECT","ACT"][active];$("stepTitle").textContent=step.title;$("stepBody").textContent=step.body;$("stepPrayer").textContent=active===0?step.prayer:active===1?"God, "+focus[0]:focus[1];$("previous").disabled=active===0;$("next").textContent=active===2?"Start again ↻":"Continue →";$("stepStatus").textContent=active===2?"Take your time. You can return whenever you wish. Nothing was recorded.":"Nothing you select here is saved or sent.";}
$("focus").addEventListener("change",render);
$("previous").addEventListener("click",()=>{active=Math.max(0,active-1);render();});
$("next").addEventListener("click",()=>{active=active===2?0:active+1;render();});
$("share").addEventListener("click",async()=>{const target="https://singhpratik44.github.io/clearline-portfolio/prayer/start/";const status=$("shareStatus");try{if(navigator.share){await navigator.share({title:"A Quiet Journey — free five-minute reflection",text:"Five quiet minutes. One honest next step. Free and private.",url:target});status.textContent="Thanks for sharing thoughtfully.";return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(target);status.textContent="Link copied. Share it with someone who would welcome it.";return;}status.textContent="Share this link: "+target;}catch(err){if(err.name!=="AbortError")status.textContent="Share manually: "+target;}});
render();