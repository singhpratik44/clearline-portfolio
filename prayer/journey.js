(function(){
"use strict";
const $=id=>document.getElementById(id);
if(!$("commit-length"))return;
const focusContent={
truth:{title:"Truth over appearance",themes:["Listen before reacting","Observe what is true","Name one assumption","Speak with integrity","Accept correction","Act without performance","Review what matters"],prayer:"May truth become clearer than the image I wish to protect. Let me see reality with humility, and choose one honest action today.",action:"Write one true observation, then name one action that follows from it."},
peace:{title:"Steadiness through uncertainty",themes:["Arrive gently","Set down anxiety","Notice what is here","Release needless control","Choose a kind word","Rest without guilt","Return to stillness"],prayer:"Help me meet this day without being ruled by fear. May I choose steadiness, patience and care even when the outcome remains unknown.",action:"Pause, breathe naturally, and choose one situation where patience is possible."},
family:{title:"Love made practical",themes:["Remember loved ones","Listen with care","Offer gratitude","Repair where possible","Protect without controlling","Give time","Show up again"],prayer:"Let my care for those I love become patient attention and practical kindness. Help me offer what I can and release what I cannot control.",action:"Choose one respectful action that supports someone you love."},
stewardship:{title:"Earn, give and keep trust",themes:["Name the responsibility","Be transparent","Deliver what you promise","Keep honest records","Pay fairly","Make space for service","Review your commitments"],prayer:"May every resource entrusted to me be handled cleanly. Let me earn through real value, meet obligations, treat people fairly and use what comes with responsibility.",action:"Identify one specific step toward trustworthy stewardship today."},
service:{title:"Service without recognition",themes:["Notice a need","Make room to listen","Help without leverage","Respect dignity","Protect what is vulnerable","Give what is sustainable","Review the impact"],prayer:"Guide me toward useful, humble service. Let me pay attention to the people affected by my decisions, and help without turning generosity into a performance.",action:"Name one small act of service that preserves another person's dignity."},
courage:{title:"Courage with humility",themes:["Begin where you are","Face a difficult fact","Ask for support","Make a small decision","Take a responsible risk","Keep faith in uncertainty","Continue with patience"],prayer:"Give me courage for the work that is mine and humility about what is not. Let fear inform caution without deciding who I become.",action:"Choose one manageable action you have been postponing."}
};
const $opts={
length:$("commit-length"),focus:$("commit-focus"),minutes:$("commit-minutes"),start:$("commit-start"),save:$("save-local")
};
const key="quiet-journey-commitment-v1";
const state={length:7,focus:"truth",minutes:5,start:localDate(new Date()),done:[],selected:0,save:false,timerRunning:false,timerSeconds:300,timer:null};
function localDate(date){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");return y+"-"+m+"-"+d;}
function dateFor(day){const [y,m,d]=state.start.split("-").map(Number);const dt=new Date(y,m-1,d+day);return localDate(dt);}
function offsetOfToday(){
const today=new Date(),[y,m,d]=state.start.split("-").map(Number);
return Math.round((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())-Date.UTC(y,m-1,d))/86400000);
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function readState(){
try{const data=JSON.parse(localStorage.getItem(key)||"null");if(data&&data.optIn===true&&[7,21,40].includes(Number(data.length))&&focusContent[data.focus]&&[5,10,20].includes(Number(data.minutes))&&/^\d{4}-\d\d-\d\d$/.test(data.start)){
state.length=Number(data.length);state.focus=data.focus;state.minutes=Number(data.minutes);state.start=data.start;state.done=[...new Set((Array.isArray(data.done)?data.done:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<state.length))];state.save=true;state.selected=clamp(offsetOfToday(),0,state.length-1);
}
}catch(e){/* Browsers may block local storage. The journey still works in this tab. */}}
function persist(){
if(!state.save)return;
try{localStorage.setItem(key,JSON.stringify({optIn:true,length:state.length,focus:state.focus,minutes:state.minutes,start:state.start,done:state.done}));}
catch(e){$("commit-status").textContent="Local storage is unavailable. Your progress will stay in this tab only.";}
}
function toggleSave(enabled){
state.save=enabled;
if(enabled){persist();$("commit-status").textContent="This browser will remember the selected journey and checked-in days. Optional reflection text is never saved.";}
else{try{localStorage.removeItem(key);}catch(e){}$("commit-status").textContent="Device saving is off. Your check-ins remain in this tab until you leave.";}
}
function render(){
const todayIndex=offsetOfToday(),current=state.selected,focus=focusContent[state.focus];
$("journey-heading").textContent=focus.title;
$("current-day").textContent="DAY "+(current+1)+" / "+state.length;
$("practice-title").textContent=focus.themes[current%focus.themes.length];
$("practice-prayer").textContent=($("address").value||"God")+", "+focus.prayer;
$("practice-action").textContent=focus.action;
$("practice-duration").textContent=state.minutes+" minutes of quiet reflection";
$("practice-date").textContent=dateFor(current);
$("practice-intention").textContent=$("burden").value.trim()?"Personal intention: "+$("burden").value.trim():"Optional: add your own intention in the prayer section above.";
$("commit-checkin").checked=state.done.includes(current);
$("commit-checkin").disabled=current>todayIndex;
$("checkin-help").textContent=current>todayIndex?"This day has not arrived yet. You can preview its reflection but check in when the date comes.":current===todayIndex?"You can mark today's practice complete.":"Review and mark this earlier day's practice if it was actually completed.";
const grid=$("commit-days");grid.replaceChildren();
for(let i=0;i<state.length;i++){
const b=document.createElement("button");b.type="button";b.className="practice-day"+(i===todayIndex?" today":"");b.textContent=String(i+1);b.setAttribute("aria-label","Day "+(i+1)+", "+dateFor(i)+(state.done.includes(i)?", completed":""));b.setAttribute("aria-pressed",String(state.done.includes(i)));
b.title=dateFor(i);
b.addEventListener("click",()=>{state.selected=i;render();});
grid.append(b);
}
const count=state.done.length,percent=Math.round(count/state.length*100);
$("practice-bar").style.width=percent+"%";$("practice-count").textContent=count+" of "+state.length+" days completed";$("practice-percent").textContent=percent+"%";
$("commit-prev").disabled=current===0;$("commit-next").disabled=current===state.length-1;
$("timer-display").textContent=timeLabel(state.timerSeconds);
}
function timeLabel(seconds){return String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");}
function updateFromInputs(){
const old=state.length;
state.length=Number($opts.length.value);state.focus=$opts.focus.value;state.minutes=Number($opts.minutes.value);state.start=$opts.start.value||localDate(new Date());state.done=state.done.filter(i=>i<state.length);
state.selected=clamp(offsetOfToday(),0,state.length-1);
clearTimer();state.timerSeconds=state.minutes*60;
if(old!==state.length)$("commit-status").textContent="Duration updated. Existing checked-in days inside the new range remain marked; days outside it are discarded.";
persist();render();
}
function clearTimer(){
if(state.timer!==null){clearInterval(state.timer);state.timer=null;}
state.timerRunning=false;
$("timer-start").textContent="Begin quiet time";$("timer-status").textContent="A gentle timer for reflection; no sounds or notifications.";
}
function stopTimer(){clearTimer();state.timerSeconds=state.minutes*60;render();}
function tick(){
state.timerSeconds=Math.max(0,state.timerSeconds-1);
$("timer-display").textContent=timeLabel(state.timerSeconds);
if(state.timerSeconds===0){clearTimer();$("timer-status").textContent="Quiet time complete. You may mark your practice when you're ready.";}
}
function exportText(){
const focus=focusContent[state.focus];
return "A Quiet Journey — private commitment plan\n\nFocus: "+focus.title+"\nDuration: "+state.length+" days\nDaily quiet time: "+state.minutes+" minutes\nStart date: "+state.start+"\nProgress: "+state.done.length+" days completed\n\nToday's selected day: "+(state.selected+1)+" / "+state.length+"\nReflection: "+focus.themes[state.selected%focus.themes.length]+"\nPrayer: "+($("address").value||"God")+", "+focus.prayer+"\nPractice: "+focus.action+"\n\nCommitments: practice truth, respect others, honor financial obligations, keep honest records, and do not promise outcomes beyond our control.\n\nThis plan is for private reflection, not proof of a religious outcome. Participation is free and optional.";
}
async function copy(text,id){try{await navigator.clipboard.writeText(text);$(id).textContent="Copied. Your reflection is ready to paste.";}catch(e){$(id).textContent="Clipboard unavailable. You can select and copy the displayed text manually.";}}
function calendarExport(){
const start=state.start.replaceAll("-","");const ics=[
"BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//A Quiet Journey//Personal Prayer Practice//EN","CALSCALE:GREGORIAN",
"BEGIN:VEVENT","UID:quietjourney-"+start+"-"+state.length+"@aperture.local",
"DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""),
"DTSTART;VALUE=DATE:"+start,
"RRULE:FREQ=DAILY;COUNT="+state.length,
"SUMMARY:Private prayer and reflection",
"DESCRIPTION:"+state.minutes+" minutes of personal reflection. Free, private and optional.",
"TRANSP:TRANSPARENT","END:VEVENT","END:VCALENDAR"
].join("\r\n");
const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
link.href=url;link.download="quiet-journey-"+state.length+"-days.ics";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
$("commit-status").textContent="Calendar file prepared. Your calendar app controls whether you import it and set alerts.";
}
readState();
$opts.length.value=String(state.length);$opts.focus.value=state.focus;$opts.minutes.value=String(state.minutes);$opts.start.value=state.start;$opts.save.checked=state.save;
$opts.start.min="2024-01-01";$opts.start.max="2035-12-31";
Object.values($opts).slice(0,4).forEach(x=>x.addEventListener("change",updateFromInputs));
$opts.save.addEventListener("change",e=>toggleSave(e.target.checked));
$("commit-checkin").addEventListener("change",e=>{
const i=state.selected,valid=i<=offsetOfToday();
if(!valid){e.target.checked=false;return;}
if(e.target.checked&&!state.done.includes(i))state.done.push(i);
else if(!e.target.checked)state.done=state.done.filter(x=>x!==i);
state.done.sort((a,b)=>a-b);persist();render();
});
$("commit-prev").addEventListener("click",()=>{state.selected=Math.max(0,state.selected-1);render();});
$("commit-next").addEventListener("click",()=>{state.selected=Math.min(state.length-1,state.selected+1);render();});
$("commit-today").addEventListener("click",()=>{state.selected=clamp(offsetOfToday(),0,state.length-1);render();});
$("timer-start").addEventListener("click",()=>{
if(state.timerRunning){clearTimer();$("timer-status").textContent="Timer paused at "+timeLabel(state.timerSeconds)+".";return;}
if(state.timerSeconds===0)state.timerSeconds=state.minutes*60;
state.timerRunning=true;
$("timer-start").textContent="Pause";
$("timer-status").textContent="Be present. You can pause at any moment.";
state.timer=setInterval(tick,1000);
});
$("timer-reset").addEventListener("click",stopTimer);
$("copy-commitment").addEventListener("click",()=>copy(exportText(),"commit-status"));
$("download-calendar").addEventListener("click",calendarExport);
$("reset-commitment").addEventListener("click",()=>{
if(!confirm("Clear all checked-in days in this journey?"))return;
state.done=[];persist();render();$("commit-status").textContent="Check-ins cleared for this journey.";
});
$("address").addEventListener("change",render);
$("burden").addEventListener("input",render);
render();
})();