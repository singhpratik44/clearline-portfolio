(function(){
"use strict";
const $=id=>document.getElementById(id);
const paths={
games:{name:"Game Creator",subtitle:"Design your own game world",tags:["Scratch","Roblox Studio","Variables","Game logic"],steps:[["Imagine your game","Sketch characters, controls and a rule for winning."],["Make a mechanic work","Build movement, events, scoring and collision behavior."],["Test and improve","Debug problems, playtest and add a meaningful new feature."],["Showcase your creation","Present the game and explain your code and design choices."]]},
apps:{name:"Python & App Builder",subtitle:"Make code useful",tags:["Python","Functions","Debugging","Apps"],steps:[["Start with a problem","Choose a practical app or a simple interactive story."],["Code the behavior","Use variables, branching logic, loops and simple functions."],["Test real inputs","Debug surprising cases and improve the user experience."],["Explain the solution","Present the app and document how it works."]]},
ai:{name:"AI Explorer",subtitle:"Understand, build and question AI",tags:["Python basics","Data","AI literacy","Human judgment"],steps:[["Understand a model","Use examples to explore patterns and simple classifications."],["Create a small experiment","Design a supervised, age-appropriate data or AI project."],["Evaluate the output","Check accuracy, bias, limitations and data privacy."],["Present findings","Explain what the model can and cannot reliably do."]]},
robotics:{name:"Inventor & Robotics",subtitle:"Turn ideas into engineered systems",tags:["Engineering design","Sensors","Logic","Iteration"],steps:[["Identify a need","Design a machine or system for a real problem."],["Build its logic","Model inputs, outputs, sensors or a simple simulation."],["Iterate and test","Find failures, improve reliability and explain tradeoffs."],["Demonstrate the invention","Show a prototype and communicate what works."]]},
creative:{name:"Creative Coding Studio",subtitle:"Code stories, art and animation",tags:["Scratch","Animation","Story logic","Creativity"],steps:[["Tell a story","Choose characters, scenes, mood and audience."],["Bring it to life","Use events, timing and loops for animated behavior."],["Add interactivity","Introduce choices, sound, responses and branching."],["Share the outcome","Show the interactive creation and reflect on refinements."]]}
};
const paceText={
weekly:"A weekly lesson supports a consistent, evolving project sequence, subject to scheduling and confirmed recurring terms.",
flexible:"A prepaid set of lessons lets a learner develop a longer project at an agreed pace; each lesson is billed at its own one-time price.",
explore:"One introductory lesson provides a starting goal and opportunity to assess future steps."
};
const experienceText={new:"Start with beginner-friendly concepts and plenty of live guidance.",some:"Build from familiar concepts toward new project challenges.",advanced:"Adapt the starting challenge to existing skills and encourage more independent problem-solving."};
const state={path:null,points:10,target:30,score:0,player:44,coin:53,format:"single",qty:4};
function plan(){
const key=$("interest").value,age=$("age").value,experience=$("experience").value,pace=$("pace").value;
const p=paths[key];state.path=p;
$("path-title").textContent=p.name+" · "+p.subtitle;
$("path-copy").textContent=(age==="4–6"?"Early learners require a suitability conversation before purchasing. ":"Ages "+age+". ")+experienceText[experience]+" "+paceText[pace];
$("path-pills").replaceChildren();
p.tags.forEach(x=>{const tag=document.createElement("span");tag.className="pill";tag.textContent=x;$("path-pills").append(tag);});
$("milestone-heading").textContent=p.name+" milestones";
$("milestone-list").replaceChildren();
p.steps.slice(0,3).forEach(([title,desc],index)=>{
const row=document.createElement("div");row.className="track-row";
const num=document.createElement("b");num.textContent=index+1;
const info=document.createElement("div"),head=document.createElement("strong"),text=document.createElement("p");
head.textContent=title;text.textContent=desc;info.append(head,text);row.append(num,info);$("milestone-list").append(row);
});
$("progress-heading").textContent=p.name+" progression";
renderProgress();
const subject="APERTURE Learning — "+p.name+" inquiry";
const body="Hello APERTURE Learning,\n\nI explored the "+p.name+" learning pathway on your website.\nAge group: "+age+"\nExperience: "+$("experience").selectedOptions[0].textContent+"\nPreferred cadence: "+$("pace").selectedOptions[0].textContent+"\n\nPlease share instructor availability and next steps.\n";
$("email-plan").href="mailto:parry.s.2324@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
$("copy-plan-status").textContent="Preview updated. Your selections stay in this browser tab.";
}
function planText(){
const age=$("age").value,p=state.path;
return "APERTURE Learning · Personalized pathway preview\n\nPathway: "+p.name+"\nAge group: "+age+"\nExperience: "+$("experience").selectedOptions[0].textContent+"\nCadence: "+$("pace").selectedOptions[0].textContent+"\n\n"+p.steps.map(([a,b],i)=>(i+1)+". "+a+" — "+b).join("\n")+"\n\nThis is an illustrative plan, adapted by an instructor. Each $65 payment purchases one 60-minute private lesson; weekly subscriptions require a separate confirmed payment link.\nWebsite: https://singhpratik44.github.io/clearline-portfolio/learning/";
}
async function copy(content,id){
try{await navigator.clipboard.writeText(content);$(id).textContent="Copied. Paste it into a message or notes.";}
catch(e){$(id).textContent="Clipboard access is unavailable. Try using your browser's Share menu or copy the displayed details.";}
}
["age","experience","interest","pace"].forEach(id=>$(id).addEventListener("change",plan));
$("copy-plan").addEventListener("click",()=>copy(planText(),"copy-plan-status"));

const ppos=[$("point-options"),$("target-options")];
ppos[0].querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.points=Number(button.dataset.points);ppos[0].querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));resetGame();}));
ppos[1].querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{state.target=Number(button.dataset.target);ppos[1].querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));resetGame();}));
function gameCode(){
return "let score = 0;\nconst pointsPerStar = "+state.points+";\nconst goal = "+state.target+";\n\nfunction collectStar() {\n  score += pointsPerStar;\n  if (score >= goal) {\n    celebrate();\n  }\n}\n// Move, collect, test, improve.";
}
function repaintGame(){
$("game-score").textContent="SCORE "+state.score;
$("game-target").textContent="GOAL "+state.target;
$("game-player").style.left=state.player+"%";
$("game-coin").style.left=state.coin+"%";
$("game-coin").hidden=state.score>=state.target;
$("game-code").textContent=gameCode();
}
function resetGame(){
state.score=0;state.player=44;state.coin=53;repaintGame();
$("game-status").textContent="Move beneath the star, then press Collect.";
}
function move(amount){if(state.score>=state.target)return;state.player=Math.max(0,Math.min(88,state.player+amount));repaintGame();}
function collect(){
if(state.score>=state.target){$("game-status").textContent="Goal reached. Reset to try new rules.";return;}
if(Math.abs(state.player-state.coin)>12){$("game-status").textContent="Not close enough. Move beneath the star before collecting.";return;}
state.score+=state.points;
if(state.score>=state.target){repaintGame();$("game-status").textContent="Challenge complete! You changed a variable and reached the target.";return;}
state.coin=10+Math.round(Math.random()*72);
repaintGame();$("game-status").textContent="Collected! Your score increased by "+state.points+". Chase the next star.";
}
$("move-left").addEventListener("click",()=>move(-10));
$("move-right").addEventListener("click",()=>move(10));
$("collect-star").addEventListener("click",collect);
$("game-reset").addEventListener("click",resetGame);
$("game-arena").addEventListener("keydown",e=>{
if(e.key==="ArrowLeft"){e.preventDefault();move(-10);}
else if(e.key==="ArrowRight"){e.preventDefault();move(10);}
else if(e.key===" "||e.key==="Enter"){e.preventDefault();collect();}
});
$("copy-code").addEventListener("click",()=>copy(gameCode(),"copy-code-status"));

const exampleChecks=["Can describe the project's goal","Can make one feature work","Can identify and fix a bug","Can explain an improvement or next step"];
function renderProgress(){
const root=$("progress-checks");root.replaceChildren();
exampleChecks.forEach((label,i)=>{
const line=document.createElement("label"),input=document.createElement("input"),text=document.createElement("span"),title=document.createElement("strong"),detail=document.createElement("small");
input.type="checkbox";input.dataset.index=String(i);input.addEventListener("change",updateProgress);
title.textContent=label;detail.textContent=state.path?state.path.steps[i][1]:"Illustrative learning milestone";text.append(title,detail);line.append(input,text);root.append(line);
});
updateProgress();
}
function updateProgress(){
const inputs=[...$("progress-checks").querySelectorAll("input")];
const count=inputs.filter(x=>x.checked).length,percent=Math.round(count/4*100);
$("progress-fill").style.width=percent+"%";
$("progressbar").setAttribute("aria-valuenow",String(percent));
$("progress-count").textContent=count+" of 4 milestones";
$("progress-percent").textContent=percent+"%";
$("progress-status").textContent=count===4?"Demo completed — this is an illustrative record, not actual learning data.":"Mark the steps to explore a sample progress report. Nothing is saved.";
}
$("reset-progress").addEventListener("click",()=>{renderProgress();$("progress-status").textContent="Sample reset. No student history was saved.";});
$("copy-progress").addEventListener("click",()=>{
const complete=[...$("progress-checks").querySelectorAll("input")].map((x,i)=>({checked:x.checked,label:exampleChecks[i]}));
const report="APERTURE Learning — sample progress report (demo only)\nPathway: "+state.path.name+"\n\n"+complete.map((x,i)=>(x.checked?"[x] ":"[ ] ")+x.label).join("\n")+"\n\nExample report only. In an actual lesson, an instructor would provide verified project evidence and next steps.";
copy(report,"progress-status");
});

const weeklyUrl="mailto:parry.s.2324@gmail.com?subject=APERTURE%20Weekly%20Coding%20Enrollment&body=Hello%20APERTURE%20Learning%2C%0A%0AI%20would%20like%20to%20request%20a%20recurring%20weekly%2060-minute%20coding%20lesson.%20Please%20confirm%20availability%2C%20weekly%20billing%2C%20missed-lesson%20and%20cancellation%20terms%2C%20and%20a%20separate%20secure%20Stripe%20subscription%20link.%0A";
function renderPrice(){
const f=state.format,count=f==="single"?1:f==="weekly"?1:state.qty,total=count*65;
$("pack-count-area").hidden=f!=="pack";
$("price-label").textContent=f==="weekly"?"Weekly recurring lesson request":f==="pack"?"Flexible prepaid lesson quantity":"One-time introductory lesson";
$("price-amount").innerHTML=f==="weekly"?'$65 <small>/ week</small>':"$"+total+' <small>one-time</small>';
$("bill-label").textContent=f==="weekly"?"Per week, if a subscription is later activated":"Total before any applicable tax";
$("bill-total").textContent="$"+total;
$("price-description").textContent=f==="weekly"?"One live private 60-minute lesson each week; recurring billing requires a separate Stripe link and confirmed policies.":f==="pack"?count+" private 60-minute lessons purchased once; no automatic subscription. These are full-price lessons, without a package discount.":"One live 60-minute private coding lesson and personalized project direction.";
$("purchase-cta").textContent=f==="weekly"?"Request weekly enrollment ↗":f==="pack"?"Open Stripe to select quantity ↗":"Open Stripe checkout ↗";
$("purchase-cta").href=f==="weekly"?weeklyUrl:"../#pricing";
$("purchase-status").textContent=f==="weekly"?"This is a weekly enrollment inquiry, not active recurring checkout.":f==="pack"?"If Stripe doesn't allow quantity changes, request a separate invoice for "+count+" lessons.":"Stripe's embedded purchase button is on the main tuition page.";
$("copy-quote").disabled=false;
document.querySelectorAll("[data-format]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.format===state.format)));
}
document.querySelectorAll("[data-format]").forEach(b=>b.addEventListener("click",()=>{state.format=b.dataset.format;renderPrice();}));
$("pack-count").addEventListener("input",e=>{state.qty=Number(e.target.value);$("pack-count-output").value=String(state.qty);renderPrice();});
$("copy-quote").addEventListener("click",()=>copy("APERTURE Learning tuition illustration\nFormat: "+(state.format==="weekly"?"Weekly recurring lesson request":state.format==="pack"?"Prepaid lesson pack":"One private lesson")+"\nLessons: "+(state.format==="pack"?state.qty:1)+"\nPrice per 60-minute lesson: $65\nAmount: $"+(state.format==="pack"?65*state.qty:65)+(state.format==="weekly"?" per week (subscription not yet active)":" one-time")+"\nScheduling and cancellation terms must be confirmed separately. Website: https://singhpratik44.github.io/clearline-portfolio/learning/","purchase-status"));
plan();resetGame();renderPrice();
})();