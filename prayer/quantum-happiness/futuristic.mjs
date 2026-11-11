/* APERTURE Future Calm • optional interface enhancement.
   The shared Moment Engine remains the decision source of truth.
   This layer observes visible state, never sends data anywhere. */
const $=(id)=>document.getElementById(id);
const clean=(value)=>String(value||"").replace(/\s+/g," ").trim();
function initialize(){
  const start=$("protocolStart"),stop=$("protocolStop"),bar=$("protocolProgress"),clock=$("protocolClock"),instruction=$("protocolInstruction");
  const signal=$("signalStatus"),action=$("signalAction"),intention=$("heroIntention");
  if(!start||!stop||!bar||!clock||!instruction||!signal||!action||!intention) return;

  const instructions=[
    "Notice three ordinary details. Nothing needs fixing right now.",
    "Feel the ground beneath you, or simply observe your surroundings.",
    "Is there one thing you could genuinely appreciate? It's fine if not.",
    "Choose one small next step, a kind response, or a restorative pause."
  ];
  let running=false,interval=null,startAt=0,currentStep=-1;
  const format=(remaining)=>"00:"+String(Math.max(0,remaining)).padStart(2,"0");
  function clear(){
    if(interval!==null){clearInterval(interval);interval=null}
    running=false;
    start.classList.remove("hide");
    stop.classList.add("hide");
  }
  function frame(){
    if(!running)return;
    const elapsed=Math.min(60,Math.floor((Date.now()-startAt)/1000));
    const remaining=60-elapsed;
    bar.value=elapsed;
    clock.textContent=remaining===60?"01:00":format(remaining);
    clock.setAttribute("aria-label",remaining+" seconds remaining");
    const step=Math.min(3,Math.floor(elapsed/15));
    if(step!==currentStep){currentStep=step;instruction.textContent=instructions[step]}
    if(remaining===0){clear();instruction.textContent="The reset is complete. You can act, reflect, or simply stay here.";clock.textContent="00:00"}
  }
  start.addEventListener("click",()=>{
    if(running)return;
    running=true;startAt=Date.now();currentStep=-1;start.classList.add("hide");stop.classList.remove("hide");frame();
    interval=setInterval(frame,250);
  });
  stop.addEventListener("click",()=>{clear();bar.value=0;clock.textContent="01:00";instruction.textContent="You stopped the guide. Returning to the moment is enough."});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden&&running){clear();instruction.textContent="Paused when you left this page. Restart whenever you like.";bar.value=0;clock.textContent="01:00"}
  });

  function syncReadouts(){
    const active=document.querySelector('#states [data-mood][aria-pressed="true"]')?.dataset.mood||"steady";
    const modes={
      overwhelmed:"TOO MANY INPUTS",
      energized:"EXPLORING IDEAS",
      tired:"REST IS AVAILABLE",
      steady:"HERE & STEADY"
    };
    signal.textContent=modes[active]||modes.steady;
    action.textContent=clean($("recommendAction")?.textContent)||"Notice what is already here.";
    intention.textContent=clean($("lensName")?.textContent)||"Presence";
  }
  const sources=["states","recommendAction","lensName"];
  for(const id of sources){
    const node=$(id);
    if(node)new MutationObserver(syncReadouts).observe(node,id==="states"?{childList:true,subtree:true,attributes:true,attributeFilter:["aria-pressed"]}:{childList:true,subtree:true});
  }
  document.querySelectorAll("[data-lens-jump]").forEach(button=>{
    button.addEventListener("click",()=>{
      const id=button.getAttribute("data-lens-jump");
      const target=Array.from(document.querySelectorAll(".orbit-node")).find(n=>n.dataset.id===id);
      if(!target)return;
      target.click();
      $("orbit")?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});
      target.focus({preventScroll:true});
    });
  });
  syncReadouts();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});
else initialize();
