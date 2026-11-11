/* APERTURE Moment Engine v1.0
 * Deterministic, zero-network, zero-model decision support.
 * No diagnosis or guaranteed outcome. Quantum is metaphor, not physics.
 */
export const states = Object.freeze({
  overwhelmed: {title:"Make space",message:"Too many possibilities do not require too many actions. Capture them, choose one, and let the others wait.",need:"Reduce inputs, then choose one small step.",breath:"Rest or a quieter place may help.",gratitude:"What support is available even if today is difficult?"},
  energized: {title:"Channel the spark",message:"Your energy is valuable. Give one experiment your full attention before opening another.",need:"Choose a meaningful experiment.",breath:"Enjoy the momentum without rushing.",gratitude:"Which possibility feels worth exploring?"},
  tired: {title:"Recovery is progress",message:"Rest is a legitimate choice. You do not have to earn it through productivity.",need:"Lower the load and restore energy.",breath:"Pause, hydrate, or seek a comfortable place.",gratitude:"What has supported you through today?"},
  steady: {title:"Stay with this moment",message:"You do not have to turn peace into another project. Notice what is already here.",need:"Choose freely whether to act or simply be.",breath:"Take in the stillness.",gratitude:"What ordinary detail deserves appreciation?"}
});
export const contexts = Object.freeze({
  quiet: {name:"A Quiet Journey",prompt:"What can I meet with honesty and kindness right now?",example:"A moment of quiet can be enough."},
  career: {name:"Career OS",prompt:"Which one step would move a real opportunity forward?",example:"Reply to the most time-sensitive message, then pause."},
  basketball: {name:"Basketball",prompt:"What helps me show up for the next possession or practice?",example:"Reset after an error; offer encouragement."},
  learning: {name:"Education",prompt:"What single question could I explore with curiosity?",example:"Try one small experiment and note the result."},
  civilization: {name:"Civilization Lab",prompt:"Who might be affected, and what evidence is missing?",example:"Check the people, trade-offs, and sources before acting."}
});
export const lenses = Object.freeze([
  {id:"presence",name:"Presence",symbol:"◉",question:"What do I notice without needing to change it?",practice:"Name three things you can see, two sensations, and one sound."},
  {id:"gratitude",name:"Gratitude",symbol:"♡",question:"What might I appreciate without denying what's hard?",practice:"Name one specific person, comfort, or possibility."},
  {id:"focus",name:"Focus",symbol:"◎",question:"What is worthy of my attention for the next ten minutes?",practice:"Set aside competing ideas and work on one small step."},
  {id:"persistence",name:"Persistence",symbol:"↗",question:"What is one gentle way to continue?",practice:"Reduce the step until you can begin without forcing yourself."},
  {id:"recovery",name:"Rest",symbol:"☾",question:"What needs replenishing rather than pushing?",practice:"Choose an achievable rest action without making it a performance."},
  {id:"creativity",name:"Wonder",symbol:"✧",question:"What happens if I combine two unexpected ideas?",practice:"Try a playful experiment without judging its usefulness."},
  {id:"kindness",name:"Love",symbol:"❋",question:"What would compassion and healthy boundaries look like?",practice:"Offer a small kindness without abandoning your needs."},
  {id:"learning",name:"Growth",symbol:"❃",question:"What could this moment teach me, without blame?",practice:"Record one observation and one question."},
  {id:"courage",name:"Courage",symbol:"◇",question:"Which small action expresses what I value?",practice:"Choose a reversible next step, or ask for help."},
  {id:"contribution",name:"Service",symbol:"✺",question:"What is one sustainable way I could contribute?",practice:"Listen, encourage, share knowledge, or care for your community."}
]);
export function normalizeTask(task) {
  const title = String(task?.title ?? "").trim().slice(0,160);
  const effort = [5,15,30].includes(Number(task?.effort)) ? Number(task.effort) : 15;
  const importance = Math.max(1,Math.min(3,Math.round(Number(task?.importance)||2)));
  return {id:String(task?.id ?? "").slice(0,80),title,effort,importance,done:Boolean(task?.done)};
}
export function rankTasks(tasks, state) {
  const valid = (Array.isArray(tasks)?tasks:[]).map(normalizeTask).filter(t=>t.title&&!t.done);
  if(state==="tired") return [];
  return valid.map(t=> {
    const smallStep = state==="overwhelmed"? (t.effort===5?4:t.effort===15?2:0) : (t.effort===15?2:1);
    const score=t.importance*5+smallStep;
    return {...t,score};
  }).sort((a,b)=>b.score-a.score||a.effort-b.effort||a.title.localeCompare(b.title));
}
export function routeMoment({state="steady",context="quiet",tasks=[]}={}){
  const mood=states[state]||states.steady;
  const domain=contexts[context]||contexts.quiet;
  const ranked=rankTasks(tasks,state);
  const rest=state==="tired";
  return {title:mood.title,message:mood.message,gratitude:mood.gratitude,contextPrompt:domain.prompt,
    action:rest?"Rest, hydrate, or ask for support. You can return later.":
      ranked.length?("Choose one: "+ranked[0].title):("Notice what matters. "+mood.need),
    taskId:ranked.length?ranked[0].id:null,alternatives:ranked.slice(1,3),restIsValid:true};
}
export function creativePair(seed=0){
  const ideas=["a basketball court","a garden","a library","a sunrise","a poem","a bridge","a compass","a constellation","a conversation","a classroom"];
  const n=Math.abs(Math.trunc(Number(seed)||0));
  const a=n%ideas.length,b=(Math.floor(n/ideas.length)+a+3)%ideas.length;
  return [ideas[a],ideas[b]];
}
export function serializeJournal(entry){
  const kind=String(entry?.kind||"moment").slice(0,50);
  const text=String(entry?.text||"").slice(0,10000);
  const savedAt=String(entry?.savedAt||"").slice(0,40);
  return {kind,text,savedAt};
}
