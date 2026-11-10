import {dailyPlan,STEP_TITLES} from "./daily-practice.mjs";

/**
 * A small deterministic daily experience. Personal reflections are never
 * transmitted. Completion is only encrypted on an explicit user action.
 */
export function initDailyPractice({state,today,persistVault,setMonth,chapters,loadEntry,renderEntries}) {
  const $=id=>document.getElementById(id);
  const planForToday=()=>dailyPlan({start:state.start,today:today(),months:state.months,focus:state.focus,minutes:state.minutes});
  let stepIndex=0;
  const humanTitles=["Arrive, as you are.","Approach the source.","Ask an honest question.","Put care into action.","Release what you cannot control."];
  const status=text=>{$("dailyStatus").textContent=text;};
  function render(){
    const plan=planForToday();
    const chapter=chapters[(plan.monthNumber-1)%chapters.length];
    const future=plan.status==="upcoming",finished=plan.status==="complete";
    $("dailyHeading").textContent=future?"Day 1 · Preview":finished?"Journey finished · Reflection":"Day "+plan.dayNumber+" of "+plan.totalDays;
    $("dailyMeta").textContent="YEAR "+plan.yearNumber+" · MONTH "+plan.monthNumber+" · "+plan.chapterPhase.toUpperCase()+" · "+(future?"Begins "+plan.start:finished?"Ended "+plan.end:"Today "+plan.dayISO);
    $("dailyArchLabel").textContent=plan.chapterPhase.toUpperCase();
    const step=plan.steps[stepIndex];
    $("dailyStepOverline").textContent=String(stepIndex+1).padStart(2,"0")+" / "+STEP_TITLES[stepIndex].toUpperCase();
    $("dailyStepTitle").textContent=humanTitles[stepIndex];
    $("dailyStepDescription").textContent=step.description;
    $("dailyStepDetail").textContent=step.detail;
    $("dailySideCopy").textContent="This month's invitation: "+chapter[1]+" "+plan.focusInvitation;
    $("dailySource").hidden=stepIndex!==1;
    for(const b of document.querySelectorAll("[data-daily-step]")){
      const active=Number(b.dataset.dailyStep)===stepIndex;
      b.classList.toggle("is-current",active);
      b.setAttribute("aria-pressed",String(active));
    }
    $("dailyPrev").disabled=stepIndex===0;
    $("dailyNext").hidden=stepIndex===4;
    $("dailyRecord").hidden=stepIndex!==4;
    $("dailyRecord").disabled=!plan.isCurrentDay;
    const entries=state.vaultData?.entries;
    const count=entries?Object.entries(entries).filter(([day,e])=>day>=plan.start&&day<plan.end&&e?.done===true).length:0;
    $("dailyRecordedCount").textContent=entries
      ? count+" day"+(count===1?"":"s")+" of practice recorded privately. This is a history, not a measure of spirituality."
      :"Your recorded practice days appear here only after unlocking the encrypted vault.";
    const recorded=!!entries?.[today()]?.done;
    $("dailyVaultSummary").textContent=entries?
      (recorded?"Today has been recorded in your encrypted journal.":"Your unlocked vault can record today's practice."):
      "Nothing from these steps is stored without an unlocked encrypted vault.";
    if(future)status("The commitment begins "+plan.start+". You may explore the steps, but cannot record the future.");
    else if(finished)status("Your chosen commitment has ended. You can reflect or select a new start date.");
    else if(recorded)status("Today is recorded. You can always return without a streak or score.");
    else status("Read, reflect, and live at your own pace. Recording is optional.");
  }
  function select(step){
    if(!Number.isInteger(step)||step<0||step>4)return;
    stepIndex=step;render();
  }
  async function record(){
    const plan=planForToday();
    if(!plan.isCurrentDay){status("Future days and completed journeys cannot be checked in.");return;}
    if(!state.vaultKey||!state.vaultData){
      status("To keep a private record, unlock or create your encrypted journal below. Nothing was saved.");
      return;
    }
    const day=today();
    const previous=state.vaultData.entries[day];
    if(previous?.done===true){status("Today has already been recorded. No duplicate was created.");return;}
    state.vaultData.entries[day]={...(previous||{}),text:typeof previous?.text==="string"?previous.text:"",done:true,updated:new Date().toISOString()};
    $("dailyRecord").disabled=true;
    try {
      await persistVault();
      if(state.entryDay===day)loadEntry();
      renderEntries();
      render();
      status("Today's practice was encrypted and recorded on this device.");
    } catch(e) {
      if(previous)state.vaultData.entries[day]=previous;else delete state.vaultData.entries[day];
      render();
      status("Saving failed. Your encrypted vault was not updated; check browser storage.");
    } finally {
      $("dailyRecord").disabled=false;
    }
  }
  for(const b of document.querySelectorAll("[data-daily-step]"))b.addEventListener("click",()=>select(Number(b.dataset.dailyStep)));
  $("dailyPrev").addEventListener("click",()=>select(stepIndex-1));
  $("dailyNext").addEventListener("click",()=>select(stepIndex+1));
  $("dailyRecord").addEventListener("click",record);
  $("dailyFindMonth").addEventListener("click",()=>{
    setMonth(planForToday().monthNumber);
    document.getElementById("timeline").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  });
  return {render,select};
}
