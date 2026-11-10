(function(){
"use strict";
const tracks=[
{id:"scratch-stories",title:"Scratch & Interactive Stories",family:"Creative Worlds",level:"starter",min:7,icon:"🎭",summary:"Build animated stories, expressive characters and interactive choices.",tools:"Scratch · animation · storytelling",spark:"Invent an original character and a world.",build:"Use events and sequences to animate a scene.",explain:"Debug timing, loops and decision blocks.",show:"Present an interactive story with multiple endings.",output:"A playable animated story or mini-game.",future:"A foundation for game design, programming logic and digital storytelling.",studio:"creative",demo:"story"},
{id:"roblox-worlds",title:"Roblox Worldbuilding",family:"Creative Worlds",level:"growing",min:10,icon:"🧱",summary:"Design environments and gameplay systems in Roblox Studio.",tools:"Roblox Studio · Luau concepts · 3D design",spark:"Imagine a world with a player goal.",build:"Model environments and create basic gameplay events.",explain:"Test behavior, fix bugs and balance challenges.",show:"Demonstrate a working level or game mechanic.",output:"An original 3D game prototype.",future:"Game engineering, level design and interactive 3D systems.",studio:"games",demo:"arcade"},
{id:"minecraft-makers",title:"Minecraft Engineering",family:"Creative Worlds",level:"starter",min:7,icon:"⛏️",summary:"Explore building systems, logic puzzles and age-appropriate automation.",tools:"Minecraft Education or approved edition · logic",spark:"Identify a world-building or logic challenge.",build:"Create a working structure, puzzle or mechanism.",explain:"Iterate designs and explain inputs and outputs.",show:"Present a build tour and design rationale.",output:"A documented interactive Minecraft creation.",future:"Computational thinking, systems design and engineering.",studio:"games",demo:"arcade"},
{id:"3d-game-design",title:"Game Design & 3D Art",family:"Creative Worlds",level:"growing",min:11,icon:"🎮",summary:"Make original playable experiences using game mechanics and visual design.",tools:"Game design · 3D models · testing",spark:"Choose a player experience and core loop.",build:"Prototype scoring, movement and interactions.",explain:"Playtest, evaluate difficulty and iterate.",show:"Share a short game prototype with a design brief.",output:"A mini playable game and documented design.",future:"Game development, UX and 3D digital production.",studio:"games",demo:"arcade"},
{id:"python-adventures",title:"Python Foundations",family:"Code Builders",level:"starter",min:10,icon:"🐍",summary:"Go from first variables to working original Python projects.",tools:"Python · conditions · loops · functions",spark:"Pick a puzzle, story or utility to create.",build:"Write working input and decision logic.",explain:"Find bugs and separate code into functions.",show:"Demonstrate an original script or interactive tool.",output:"A working Python program they can explain.",future:"Software engineering, data analysis and AI fundamentals.",studio:"apps",demo:"story"},
{id:"web-creators",title:"Websites & Web Apps",family:"Code Builders",level:"growing",min:11,icon:"🌐",summary:"Design and code useful, responsive websites and browser experiences.",tools:"HTML · CSS · JavaScript · accessibility",spark:"Find a person or problem the website could help.",build:"Create a page and add a meaningful interaction.",explain:"Test mobile layouts, feedback and accessibility.",show:"Show a responsive web project with source code.",output:"A simple original website or web app.",future:"Frontend engineering, product design and web portfolios.",studio:"apps",demo:"story"},
{id:"mobile-prototypes",title:"App & Interface Design",family:"Code Builders",level:"growing",min:11,icon:"📱",summary:"Design mobile-first app prototypes that solve real problems.",tools:"User flows · prototyping · interface logic",spark:"Choose a user and a task that matters.",build:"Sketch screens and build an interactive prototype.",explain:"Test usability and improve navigation.",show:"Present a clickable app concept and decisions.",output:"An interactive mobile app prototype.",future:"Product thinking, UX design and app development.",studio:"apps",demo:"story"},
{id:"data-detectives",title:"Data Science for Creators",family:"Code Builders",level:"growing",min:11,icon:"📊",summary:"Ask questions, explore patterns and communicate with charts.",tools:"Spreadsheets · Python when ready · data literacy",spark:"Choose a safe dataset and a real question.",build:"Clean, summarize and visualize a pattern.",explain:"Discuss missing data, uncertainty and misleading graphs.",show:"Publish a small, clearly explained data story.",output:"A data visualization project and written findings.",future:"Research, analytics and evidence-based decisions.",studio:"ai",demo:"ai"},
{id:"ai-literacy",title:"AI Literacy & Responsible Use",family:"AI Frontiers",level:"starter",min:10,icon:"🧠",summary:"Understand models, prompts, mistakes and ethical AI choices.",tools:"AI concepts · model evaluation · privacy",spark:"Ask what a model might know—and not know.",build:"Try a transparent toy classifier.",explain:"Compare examples and identify model limitations.",show:"Explain a model test and responsible-use rules.",output:"An annotated AI experiment and evaluation journal.",future:"Critical AI literacy and readiness for advanced AI work.",studio:"ai",demo:"ai"},
{id:"machine-learning",title:"Machine Learning Lab",family:"AI Frontiers",level:"advanced",min:14,icon:"🧪",summary:"Build and evaluate small models using safe, appropriate data.",tools:"Python · classification · train/test · evaluation",spark:"Define a prediction question and possible errors.",build:"Prepare a simple dataset and fit a basic model.",explain:"Evaluate performance and challenge assumptions.",show:"Present a model card with limitations and results.",output:"A small model experiment with documented evaluation.",future:"Applied ML research and data-centric AI engineering.",studio:"ai",demo:"ai"},
{id:"ai-agents",title:"AI Agents & Automation",family:"AI Frontiers",level:"advanced",min:14,icon:"🤖",summary:"Explore how tools and software workflows can be orchestrated responsibly.",tools:"Python foundations · workflows · human oversight",spark:"Choose a safe, bounded task for automation.",build:"Design a simple tool-using or rule-based workflow.",explain:"Test failure cases, permissions and human approvals.",show:"Demonstrate a supervised assistant prototype.",output:"An auditable, human-controlled mini-agent workflow.",future:"Automation systems, AI software and reliability thinking.",studio:"ai",demo:"ai"},
{id:"computer-vision",title:"Computer Vision Explorer",family:"AI Frontiers",level:"advanced",min:14,icon:"📷",summary:"Learn how computers represent images and why interpretations fail.",tools:"Pixels · features · image models · bias",spark:"Choose a safe visual classification problem.",build:"Experiment with simple image features or datasets.",explain:"Inspect errors, privacy and representativeness.",show:"Show a limited image-classification experiment.",output:"A documented visual recognition demonstration.",future:"Computer vision research and responsible machine perception.",studio:"ai",demo:"ai"},
{id:"robotics",title:"Robotics & Automation",family:"Engineering & Systems",level:"growing",min:10,icon:"🦾",summary:"Combine mechanical design, sensing and logic into working systems.",tools:"Sensors · logic · prototyping · robotics kits when available",spark:"Design a robot to solve a practical challenge.",build:"Model movement or control rules in a simulation.",explain:"Test edge cases and refine the design.",show:"Demonstrate an engineered prototype or simulation.",output:"A robotics or simulated control project.",future:"Mechatronics, robotics engineering and automation.",studio:"robotics",demo:"arcade"},
{id:"electronics",title:"Circuits & Inventing",family:"Engineering & Systems",level:"growing",min:11,icon:"💡",summary:"Discover circuits and computational devices through safe experiments.",tools:"Circuit simulation · inputs · outputs · microcontrollers when available",spark:"Identify a small device that could help someone.",build:"Design and simulate a safe circuit or control.",explain:"Test components, tolerances and constraints.",show:"Present a design, simulation or supervised build.",output:"A working simulation or age-appropriate electronics project.",future:"Embedded systems, engineering and physical computing.",studio:"robotics",demo:"arcade"},
{id:"cyber-citizenship",title:"Cybersecurity & Digital Citizenship",family:"Engineering & Systems",level:"starter",min:10,icon:"🛡️",summary:"Develop secure habits and understand defenses through safe examples.",tools:"Privacy · account security · threat awareness · ethical practice",spark:"Explore how personal information can be protected.",build:"Create a safe digital privacy or security checklist.",explain:"Identify risks and test protective decisions in scenarios.",show:"Demonstrate a security awareness project.",output:"A privacy or defensive-security learning artifact.",future:"Trust, defensive security and ethical technology.",studio:"apps",demo:"story"},
{id:"math-simulations",title:"Math, Physics & Simulations",family:"Engineering & Systems",level:"growing",min:11,icon:"📐",summary:"Make mathematical ideas visible with simulations and games.",tools:"Coordinates · probability · physics concepts · Python",spark:"Turn a real-world question into a model.",build:"Create a visual simulation with adjustable variables.",explain:"Compare predicted and observed behavior.",show:"Present a simulation and explain its assumptions.",output:"An interactive math or science simulation.",future:"Applied mathematics, engineering and scientific modeling.",studio:"robotics",demo:"arcade"},
{id:"sports-analytics",title:"Basketball & Sports Analytics",family:"Real-World Creators",level:"growing",min:11,icon:"🏀",summary:"Use coding and data to study strategy, shot selection and game decisions.",tools:"Statistics · charts · Python · basketball concepts",spark:"Pick a sports question that can be measured.",build:"Visualize safe, public or fictional performance data.",explain:"Check sample sizes, uncertainty and interpretation.",show:"Present a sports strategy dashboard or model.",output:"A sports analytics prototype and written explanation.",future:"Sports data science, scouting analysis and decision support.",studio:"ai",demo:"ai"},
{id:"climate-tech",title:"Climate & Community Tech",family:"Real-World Creators",level:"growing",min:11,icon:"🌎",summary:"Build data and simulation projects around community challenges.",tools:"Data · modeling · map thinking · ethics",spark:"Choose an environmental or local impact question.",build:"Explore safe datasets and sketch a practical tool.",explain:"Discuss tradeoffs, uncertainty and community needs.",show:"Share a climate or community design proposal.",output:"An evidence-aware community technology prototype.",future:"Civic technology, sustainable design and scientific inquiry.",studio:"ai",demo:"ai"},
{id:"music-media-code",title:"Music, Art & Creative Computing",family:"Real-World Creators",level:"starter",min:7,icon:"🎨",summary:"Use code to create motion, interactive art and original media.",tools:"Generative drawing · animation · creative logic",spark:"Invent a visual pattern, artwork or original sound idea.",build:"Program a responsive visual or interactive piece.",explain:"Adjust variables and describe creative decisions.",show:"Present an original interactive artwork.",output:"A digital art or creative coding portfolio piece.",future:"Creative technology, design and interactive media.",studio:"creative",demo:"story"},
{id:"startup-builders",title:"Young Product Builders",family:"Real-World Creators",level:"advanced",min:14,icon:"🚀",summary:"Turn an idea into a user-tested digital prototype with real constraints.",tools:"Product discovery · coding · design · user testing",spark:"Identify a small problem worth solving.",build:"Prototype a solution with a clear user journey.",explain:"Gather safe feedback and improve the design.",show:"Present a functional prototype and decision rationale.",output:"An original digital product prototype.",future:"Entrepreneurship, product engineering and community problem-solving.",studio:"apps",demo:"story"}
];
const families=["All worlds","Creative Worlds","Code Builders","AI Frontiers","Engineering & Systems","Real-World Creators"];
const $=id=>document.getElementById(id);
let family="All worlds",selected=null;
const ageLimit={"4-6":4,"7-10":7,"11-13":11,"14-17":14};
function agePass(t,age){
if(age==="all")return true;
if(age==="4-6")return t.id==="scratch-stories"||t.id==="music-media-code";
return ageLimit[age]>=t.min;
}
function experiencePass(t,x){return x==="all"||(x==="starter"&&t.level==="starter")||(x==="growing"&&t.level!=="advanced")||(x==="advanced"&&t.level==="advanced");}
function visibleTracks(){
const q=$("search").value.trim().toLowerCase(),age=$("age").value,x=$("experience").value;
return tracks.filter(t=>(family==="All worlds"||t.family===family)&&agePass(t,age)&&experiencePass(t,x)&&(!q||[t.title,t.summary,t.family,t.tools,t.future,t.output].join(" ").toLowerCase().includes(q)));
}
function element(tag,cls,content){
const node=document.createElement(tag);
if(cls)node.className=cls;
if(content!==undefined)node.textContent=content;
return node;
}
function renderCards(){
const result=visibleTracks(),container=$("cards");container.replaceChildren();
result.forEach(t=>{
const card=element("article","spec");card.id="track-"+t.id;
const top=element("div","top"),glyph=element("div","glyph",t.icon),kind=element("div","kind",t.family);
top.append(glyph,kind);
const title=element("h3","",t.title),body=element("p","",t.summary);
const bottom=element("div","bottom"),age=t.min===7?"7+":t.min+"+",difficulty=t.level==="starter"?"Starter":t.level==="growing"?"Building":"Advanced";
const meta=element("small","",age+" · "+difficulty),button=element("button","","Explore pathway ↗");
button.type="button";button.setAttribute("aria-label","Explore "+t.title+" pathway");button.addEventListener("click",()=>selectTrack(t.id,true));
bottom.append(meta,button);card.append(top,title,body,bottom);container.append(card);
});
$("result-count").textContent=result.length+" of "+tracks.length+" specializations";
$("no-results").hidden=result.length>0;
}
function renderFamilies(){
const row=$("families");row.replaceChildren();
families.forEach(name=>{
const b=element("button","",name);b.type="button";b.setAttribute("aria-pressed",String(name===family));
b.addEventListener("click",()=>{family=name;renderFamilies();renderCards();});
row.append(b);
});
}
function selectTrack(id,scroll){
const t=tracks.find(x=>x.id===id)||tracks[0];selected=t;
$("selection-label").textContent=t.family+" / SPECIALIZATION";
$("detail-title").textContent=t.title;
$("detail-description").textContent=t.summary+" This is a potential learning direction, customized to readiness, goals and available instructors.";
$("detail-output").textContent=t.output;
$("detail-future").textContent=t.future;
$("detail-meta").replaceChildren();
[t.min+"+ suggested",t.level==="advanced"?"Advanced foundation":t.level==="growing"?"Building skills":"Beginner-friendly",t.tools].forEach(x=>$("detail-meta").append(element("span","",x)));
[["1", "Imagine",t.spark],["2","Build",t.build],["3","Understand",t.explain],["4","Create",t.show]].forEach(([i,title,desc])=>{
$("step-"+i+"-title").textContent=title;$("step-"+i+"-desc").textContent=desc;
});
$("detail-note").textContent=(t.min>=14?"This is an advanced direction that may require Python fundamentals, appropriate tools and instructor assessment. ":"All pathways are adapted to developmental readiness and tool access. ")+"This is an illustrative learning roadmap—not a promise of completion in one lesson.";
const path=new URL("../studio/",location.href);path.searchParams.set("interest",t.studio);
path.searchParams.set("from",t.id);
$("studio-link").href=path.href;
$("lesson-link").href="../#pricing";
const subj="APERTURE Learning specialization: "+t.title;
const body="Hello APERTURE Learning,\n\nI'm interested in the "+t.title+" specialization and would like to discuss a customized learning pathway.\n\nPlease share the appropriate prerequisites, instructor availability and how lessons are scheduled.\n";
$("coach-link").href="mailto:parry.s.2324@gmail.com?subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(body);
$("copy-status").textContent="";
const url=new URL(location.href);url.searchParams.set("track",t.id);history.replaceState(null,"",url.pathname+url.search+url.hash);
if(scroll)$("pathway").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth",block:"start"});
}
$("copy-plan").addEventListener("click",async()=>{
const t=selected; if(!t)return;
const body="APERTURE Learning specialization roadmap\n\n"+t.title+"\n"+t.summary+"\nTools: "+t.tools+"\nRecommended starting age: "+t.min+"+\n\n1. Imagine: "+t.spark+"\n2. Build: "+t.build+"\n3. Understand: "+t.explain+"\n4. Create: "+t.show+"\n\nPotential project: "+t.output+"\nPossible longer-term direction: "+t.future+"\n\nOne private lesson costs $65 and does not include a full specialization. Schedule and readiness are confirmed separately.\n\nExplore: "+location.origin+location.pathname+"?track="+t.id;
try{await navigator.clipboard.writeText(body);$("copy-status").textContent="Roadmap copied. Share it with a parent or instructor.";}
catch(e){$("copy-status").textContent="Clipboard access is unavailable in this browser.";}
});
$("search").addEventListener("input",renderCards);
$("age").addEventListener("change",renderCards);
$("experience").addEventListener("change",renderCards);
renderFamilies();renderCards();
const queryId=new URLSearchParams(location.search).get("track");
selectTrack(tracks.some(t=>t.id===queryId)?queryId:"scratch-stories",false);
})();