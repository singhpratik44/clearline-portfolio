(function(){
"use strict";
const $=id=>document.getElementById(id);
const button=$("generate-pathway");
if(!button)return;
const topics={
games:{title:"Game Creator",tools:"Scratch · Roblox Studio · Game design",start:"Create an interactive game scene, with controls and a goal.",build:"Introduce events, variables, loops, collisions and scoring; test and debug.",advance:"Design a multiplayer or multi-level game prototype; explain mechanics.",demo:"projects/#arcade"},
apps:{title:"Python & App Builder",tools:"Python · Logic · Projects",start:"Explore an interactive story or a simple command-line challenge.",build:"Use input, conditions, loops and functions to make a real program.",advance:"Build a small useful app with modular code, testing and documentation.",demo:"projects/#story"},
ai:{title:"AI Explorer",tools:"Data thinking · Python foundations · AI literacy",start:"Discover patterns and try a transparent, small classification example.",build:"Collect appropriate example data, inspect predictions and test errors.",advance:"Design a supervised AI-assisted project, documenting limits and fairness questions.",demo:"projects/#ai"},
robotics:{title:"Robotics & Engineering",tools:"Logic · Sensors · Design thinking",start:"Sketch a device that solves a real-life problem and define its rules.",build:"Use inputs, outputs and tests to prototype controller logic or a simulation.",advance:"Refine an engineering prototype and demonstrate how it works.",demo:"projects/#arcade"},
art:{title:"Creative Code & Storytelling",tools:"Scratch · Animation · Interactive stories",start:"Create a character, background and a short animated scene.",build:"Add decisions, interactions, timing, sound and simple logic.",advance:"Publish a family-approved interactive story with branching endings.",demo:"projects/#story"}
};
const details={
first:"The first milestone emphasizes confidence and simple concepts.",
some:"The first milestone builds on familiar skills and introduces a new challenge.",
ready:"The first milestone is adapted toward a more independent technical build."
};
function render(){
const age=$("learner-age").value,level=$("learner-skill").value,topic=$("learner-interest").value;
const t=topics[topic],veryYoung=age==="4-6";
$("pathway-name").textContent=t.title+" — "+(veryYoung?"early-learning inquiry":age+" years");
$("pathway-intro").textContent=(veryYoung?
"Early learners need individual suitability, shorter attention-span expectations and a guardian conversation before any purchase. ":
"Here is a sample progression for ages "+age+". ")+details[level]+" This preview is not a tested assessment or a pre-paid multi-session package.";
$("pathway-steps").replaceChildren();
const phases=[["Start","Session-one direction",t.start],["Build","Later milestones",t.build],["Advance","Longer-term goal",t.advance]];
for(const [label,heading,description] of phases){
const a=document.createElement("article"),strong=document.createElement("strong"),h=document.createElement("h4"),p=document.createElement("p");
strong.textContent=label;h.textContent=heading;p.textContent=description;a.append(strong,h,p);$("pathway-steps").append(a);
}
$("pathway-tools").textContent="Potential tools: "+t.tools;
$("pathway-sample").href=t.demo;
$("pathway-buy").hidden=veryYoung;
$("pathway-contact").textContent=veryYoung?"Ask about early-learner suitability ↗":"Email us about this pathway ↗";
const subject="APERTURE Learning pathway inquiry: "+t.title;
const body="Hello APERTURE Learning,\n\nI'm interested in a personalized "+t.title+" pathway.\nAge group: "+age+"\nExperience level: "+level+"\n\nPlease share availability and next steps. No student personal details are included.";
$("pathway-contact").href="mailto:parry.s.2324@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
$("pathway-result").hidden=false;
$("pathway-result").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"nearest"});
}
button.addEventListener("click",render);
})();