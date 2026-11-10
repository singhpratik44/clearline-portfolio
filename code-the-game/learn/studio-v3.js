/* Clearline Code: mission-specific concept labs. Each simulation is illustrative, not Roblox execution. */
(function(){
"use strict";
const make=(parent,tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;parent.append(n);return n};
const ideas=[
["Debounce","Touched → Humanoid → cooldown → color change","What stops rapid duplicate touches?",["The Part's name","A boolean cooldown","The Part's material"],1],
["Hazards","Touched → find Humanoid → health = 0","Why filter for a Humanoid?",["Target actual character models","Make the lava glow","Disable physics"],0],
["Checkpoints","Player → RespawnLocation → SpawnLocation","Which object type is required?",["Folder","SpawnLocation","Generic Part"],1],
["Coins","PlayerAdded → leaderstats → score → pickup","What prevents duplicate awards?",["Part Color","The claimed flag","The camera"],1],
["Tweens","TweenInfo → time → target → reverse","What controls platform movement duration?",["TweenInfo time","BrickColor","Part Name"],0],
["Finish gate","Start → three coins → finish → elapsed time","What should stop an early finish?",["Fewer than three coins","Running too slowly","Touching the start"],0]
];
function render(parent,course,index){
 if(course.id!=="roblox"||index<0||index>=ideas.length)return false;
 const a=ideas[index],root=make(parent,"section","s3-root");
 make(root,"div","s3-eyebrow","BUILD LAB  /  "+String(index+1).padStart(2,"0")+" OF 06");
 make(root,"h3","Play with the concept");
 make(root,"p","s3-intro","A miniature, deterministic simulation. It does not run Roblox Studio or Luau code.");
 make(root,"p","s3-flow",a[1]);
 const question=make(root,"div","s3-section");make(question,"h4","",a[2]);
 const answers=make(question,"div","s3-answers"),feedback=make(question,"p","s3-feedback","");
 a[3].forEach((answer,i)=>{const btn=make(answers,"button","s3-answer",answer);btn.type="button";btn.onclick=()=>{Array.from(answers.children).forEach(x=>x.classList.remove("s3-chosen"));btn.classList.add("s3-chosen");feedback.textContent=i===a[4]?"✓ Correct. The same idea appears in your Roblox script.":"Try another. Trace the event, condition, and change.";feedback.dataset.correct=String(i===a[4])}});
 const sim=make(root,"div","s3-section");make(sim,"h4","","Experiment");
 const metrics=make(sim,"div","s3-metrics"),actions=make(sim,"div","s3-actions"),result=make(sim,"p","s3-feedback","");
 result.setAttribute("aria-live","polite");
 const stat=make(metrics,"div","s3-stat","");
 const btn=(text,fn)=>{const n=make(actions,"button","s3-control",text);n.type="button";n.onclick=fn;return n};
 if(index===0){
 let clock=0,last=-100,changes=0,cooldown=2;
 stat.textContent="Changes: 0 · Time: 0 s";
 const wrap=make(sim,"label","s3-label","Cooldown (seconds): ");
 const slider=make(wrap,"input");slider.type="range";slider.min="0";slider.max="5";slider.value="2";
 const display=make(wrap,"strong","","2");
 slider.oninput=()=>{cooldown=+slider.value;display.textContent=slider.value};
 btn("Touch pad",()=>{if(clock-last<cooldown){result.textContent="Repeat touch blocked by cooldown.";return}last=clock;changes++;stat.textContent="Changes: "+changes+" · Time: "+clock+" s";result.textContent="The touch event changed the color."});
 btn("Advance 1 second",()=>{clock++;stat.textContent="Changes: "+changes+" · Time: "+clock+" s";result.textContent="Simulated time advanced."});
 btn("Reset",()=>{clock=0;last=-100;changes=0;stat.textContent="Changes: 0 · Time: 0 s";result.textContent=""});
 } else if(index===1){
 let health=100;stat.textContent="Health: "+health;
 btn("Touch safe floor",()=>{result.textContent="No hazard event. Health unchanged."});
 btn("Touch Lava",()=>{health=0;stat.textContent="Health: 0";result.textContent="Hazard contact changed the Humanoid's health."});
 btn("Respawn",()=>{health=100;stat.textContent="Health: 100";result.textContent="Character restarted. The real SpawnLocation determines where."});
 } else if(index===2){
 let point="Start";stat.textContent="Respawn: "+point;
 btn("Touch checkpoint 1",()=>{point="Checkpoint 1";stat.textContent="Respawn: "+point;result.textContent="Stored new RespawnLocation."});
 btn("Touch checkpoint 2",()=>{point="Checkpoint 2";stat.textContent="Respawn: "+point;result.textContent="Progress updated."});
 btn("Die",()=>{result.textContent="Respawn at "+point+" (simulation only)."});
 } else if(index===3){
 let claimed=new Set();stat.textContent="Coins: 0";
 for(let i=1;i<=3;i++)btn("Collect "+i,()=>{if(claimed.has(i)){result.textContent="Already collected: no duplicate score.";return}claimed.add(i);stat.textContent="Coins: "+claimed.size;result.textContent="Pickup accepted. +1 coin."});
 btn("Reset",()=>{claimed=new Set();stat.textContent="Coins: 0";result.textContent=""});
 } else if(index===4){
 let pos=0;stat.textContent="Platform offset: 0";
 const l=make(sim,"label","s3-label","Tween duration: ");const slider=make(l,"input");slider.type="range";slider.min="1";slider.max="8";slider.value="3";const label=make(l,"strong","","3 s");slider.oninput=()=>label.textContent=slider.value+" s";
 btn("Complete tween",()=>{pos=pos?0:12;stat.textContent="Platform offset: "+pos;result.textContent="Reached endpoint. Real TweenService moves smoothly over "+slider.value+" seconds."});
 btn("Reset",()=>{pos=0;stat.textContent="Platform offset: 0";result.textContent=""});
 } else {
 let started=false,coins=0;stat.textContent="Coins: 0 · Not started";
 btn("Start",()=>{started=true;stat.textContent="Coins: "+coins+" · Running";result.textContent="Start event recorded."});
 btn("Collect coin",()=>{coins=Math.min(3,coins+1);stat.textContent="Coins: "+coins+(started?" · Running":" · Not started");result.textContent="+1 collectible."});
 btn("Finish",()=>{result.textContent=!started?"Blocked: start first.":coins<3?"Blocked: collect all three coins.":"Victory! The real script calculates elapsed time."});
 btn("Reset",()=>{started=false;coins=0;stat.textContent="Coins: 0 · Not started";result.textContent=""});
 }
 const evidence=make(root,"div","s3-section");
 make(evidence,"h4","","Verify in Roblox Studio");
 const c=make(evidence,"label","s3-check");
 const box=make(c,"input");box.type="checkbox";make(c,"span","","I tested this mission in Roblox Studio");
 const key="clearline-engine-verified-"+index;
 try{box.checked=localStorage.getItem(key)==="yes"}catch{}
 box.onchange=()=>{try{localStorage.setItem(key,box.checked?"yes":"no")}catch{}};
 make(evidence,"p","s3-disclaimer","Self-reported test only; this browser cannot verify the Roblox engine. Keep a screenshot or Studio Output log for evidence.");
 return true;
}
window.ClearlineStudioV3={render};
})();