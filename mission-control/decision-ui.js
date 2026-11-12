/* APERTURE v7 / interactive cycle ledger. Explicit clicks only; no storage or external writes. */
(function(root){
"use strict";
const $=id=>document.getElementById(id),E=root.ApertureDecisionCycle,M=root.ApertureMissionUI;
if(!E||!M)throw Error("Decision engine or mission workspace unavailable");
let current=null,previous=null;
const make=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n;};
const add=(parent,head,body)=>{const el=make("div","logitem"),inner=make("div");inner.append(make("b",null,head),make("p",null,body));el.append(make("span","dot"),inner);parent.append(el);};
function render(){
 const sum=$("cycle-summary"),dec=$("cycle-decisions"),fut=$("cycle-futures");
 sum.replaceChildren();dec.replaceChildren();fut.replaceChildren();
 if(!current){$("cycle-count").textContent="NO CYCLE";$("export-cycle").disabled=true;return;}
 $("cycle-count").textContent="20 / 20";$("export-cycle").disabled=false;
 const m=current.metrics;
 add(sum,"LOCAL OBSERVATIONS",m.tasks+" tasks · "+m.done+" done · "+m.blocked+" blocked · "+m.overdue+" overdue · "+m.pending+" pending decisions");
 add(sum,"ALTERNATIVES",current.alternatives.map(x=>x.name+": "+x.outcome+" ("+x.reason+")").join(" | "));
 add(sum,"INTERNAL SUBACTIONS",current.subactions.map(x=>x.name+": "+x.status).join(" | "));
 add(sum,"LEARNING DELTA",current.delta?Object.entries(current.delta).map(([k,v])=>k+" "+(v>=0?"+":"")+v).join(" · "):"Cycle 001 baseline. No prior measurements; no observed learning yet.");
 if(current.sample)add(sum,"EVIDENCE LIMIT","SYNTHETIC DEMO — counts and results do not describe real operations.");
 for(const d of current.decisions)add(dec,String(d.number).padStart(2,"0")+" / "+d.name.toUpperCase()+" · "+d.evidenceStatus.toUpperCase(),d.answer+" [confidence: "+d.confidence+"]");
 for(const f of current.futureHorizons)add(fut,f.horizon.toUpperCase(),f.scenario+" — validate by: "+f.validation);
 $("cycle-status").textContent=current.cycleId+" · "+new Date(current.timestamp).toLocaleString()+" · IN MEMORY ONLY · EXPORT TO KEEP";
}
$("run-cycle").addEventListener("click",()=>{
 try{
  const next=E.evaluate(M.getState(),previous||current);
  previous=current||previous;current=next;render();
 }catch(e){$("cycle-status").textContent="Evaluation failed: "+(e.message||String(e));}
});
$("prior-cycle").addEventListener("change",async e=>{
 const f=e.target.files?.[0];e.target.value="";if(!f)return;
 try{
  if(f.size>250000)throw Error("Maximum cycle file size is 250 KB.");
  previous=E.validate(JSON.parse(await f.text()));
  current=null;render();
  $("cycle-status").textContent="Previous cycle loaded for comparison. Run a new cycle to compute observed metric changes.";
 }catch(err){$("cycle-status").textContent="Could not load previous cycle: "+(err.message||String(err));}
});
$("export-cycle").addEventListener("click",()=>{
 if(!current)return;
 const blob=new Blob([JSON.stringify(current,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob);
 const a=document.createElement("a");a.href=url;a.download="aperture-"+current.cycleId.toLowerCase()+".json";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
});
root.addEventListener("aperture:mission-changed",()=>{
 if(current)$("cycle-status").textContent="Workspace changed since the last cycle. Run again to refresh decisions; previous snapshot remains exportable.";
});
render();
})(typeof globalThis!=="undefined"?globalThis:this);
