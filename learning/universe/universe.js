(() => {
"use strict";
/* APERTURE Learning Universe — projected 3D coordinates + discrete learning-time dimension.
   No WebGL dependency, tracking, accounts, network requests, or student records. */
const $ = id => document.getElementById(id);
const families = [
  {name:"Creative Worlds",color:"#f3bc89"},
  {name:"Code Builders",color:"#9bdeb5"},
  {name:"AI Frontiers",color:"#bdb8f8"},
  {name:"Engineering & Systems",color:"#83d3e9"},
  {name:"Real-World Creators",color:"#f1da88"}
];
const chapters = [
  {label:"DISCOVER",title:"Follow the spark",intro:"Begin with the question that captures their imagination."},
  {label:"BUILD",title:"Make the first thing",intro:"Use live instruction to turn the idea into working code."},
  {label:"UNDERSTAND",title:"Explain what works",intro:"Test, debug, discuss and build real independence."},
  {label:"CREATE",title:"Own the next chapter",intro:"Present a project, reflect and choose a new ambition."}
];
const tracks = [
  {id:"scratch-stories",name:"Scratch & Interactive Stories",family:0,icon:"🎭",min:7,summary:"Create animated characters and stories that respond to choices.",steps:["Imagine a character and the world they live in.","Use Scratch blocks to animate a scene and add an interaction.","Debug events, timing and branching logic; explain the behavior.","Share an original interactive story and the choices behind it."],capstone:"An interactive animation or original story with meaningful player choices.",demo:"story"},
  {id:"roblox-worlds",name:"Roblox Worldbuilding",family:0,icon:"🧱",min:10,summary:"Design worlds, levels and game mechanics.",steps:["Invent a world with a goal for its player.","Build a level and try a simple interactive mechanic in Roblox Studio.","Playtest the logic, identify problems and refine difficulty.","Demonstrate a functioning 3D level or gameplay prototype."],capstone:"An original Roblox level or game mechanic that a student can explain.",demo:"arcade"},
  {id:"minecraft-makers",name:"Minecraft Engineering",family:0,icon:"⛏️",min:7,summary:"Explore logic and creative engineering through build challenges.",steps:["Choose a puzzle or building problem in a Minecraft world.","Create a mechanism or structure with clear rules.","Test inputs, outputs and what happens when something fails.","Give a guided demonstration of the build and design decisions."],capstone:"An engineered Minecraft creation with a written or verbal explanation.",demo:"arcade"},
  {id:"3d-game-design",name:"Game Design & 3D Art",family:0,icon:"🎮",min:11,summary:"Make playable experiences using design, movement and visual storytelling.",steps:["Imagine a player experience and sketch the game's main loop.","Prototype movement, scoring or an original 3D environment.","Evaluate playability, test bugs and adjust the experience.","Present an original playable prototype and design notes."],capstone:"A playable game prototype with a clear explanation of its mechanics.",demo:"arcade"},
  {id:"python-adventures",name:"Python Foundations",family:1,icon:"🐍",min:10,summary:"Learn core programming through useful scripts and imaginative projects.",steps:["Choose a practical problem or interactive story to code.","Use Python variables, conditions and loops to build behavior.","Test different inputs and explain how functions improve the program.","Present an original, working Python project."],capstone:"A Python program that solves a small problem and can be explained.",demo:"story"},
  {id:"web-creators",name:"Websites & Web Apps",family:1,icon:"🌐",min:11,summary:"Create responsive browser experiences for real people.",steps:["Decide who a website should help and what it should do.","Build a page in HTML and CSS, then add JavaScript interaction.","Test usability, mobile layout and accessible controls.","Show a working website and explain design choices."],capstone:"An original responsive webpage or small web application.",demo:"story"},
  {id:"mobile-prototypes",name:"App & Interface Design",family:1,icon:"📱",min:11,summary:"Turn everyday problems into clickable app prototypes.",steps:["Choose a user need and sketch an app idea.","Create screens and connect a simple interaction.","Test navigation and gather feedback ethically.","Present a clickable prototype and the reasoning behind it."],capstone:"An interactive mobile-first app concept with a clear user journey.",demo:"story"},
  {id:"data-detectives",name:"Data Science",family:1,icon:"📊",min:11,summary:"Answer questions using data, visualizations and careful reasoning.",steps:["Ask a question that a safe dataset can help answer.","Organize the data and create a useful chart.","Check misleading patterns, missing information and uncertainty.","Present an evidence-aware data story."],capstone:"A data visualization with honest interpretations and limitations.",demo:"ai"},
  {id:"ai-literacy",name:"AI Literacy & Responsible Use",family:2,icon:"🧠",min:10,summary:"Explore how models work, where they fail and how people remain responsible.",steps:["Ask what an AI model might recognize—and what it might miss.","Experiment with a transparent, small classifier.","Compare predictions, test limitations and discuss privacy.","Present an evaluation and responsible-use guide."],capstone:"A documented AI literacy experiment and explanation of its limits.",demo:"ai"},
  {id:"machine-learning",name:"Machine Learning Lab",family:2,icon:"🧪",min:14,summary:"Build and evaluate small, appropriate predictive models.",steps:["Define a prediction question with an ethical, age-appropriate dataset.","Train or simulate a basic supervised model.","Test reliability, errors, limitations and bias.","Present a model card and the evidence behind its results."],capstone:"A small machine-learning experiment with test results and caveats.",demo:"ai"},
  {id:"ai-agents",name:"AI Agents & Automation",family:2,icon:"🤖",min:14,summary:"Design safe automated workflows with human oversight.",steps:["Choose a safe, narrow workflow that might benefit from automation.","Build rule-based or supervised tool steps with explicit permissions.","Inspect failures, review decisions and require approval when appropriate.","Demonstrate a bounded prototype and its audit trail."],capstone:"A human-supervised automation prototype with documented rules.",demo:"ai"},
  {id:"computer-vision",name:"Computer Vision",family:2,icon:"📷",min:14,summary:"Discover how computers process images and why results can mislead.",steps:["Identify a safe visual pattern to study.","Explore simple image features or a small image classifier.","Test unusual examples and privacy or bias concerns.","Present a visual-recognition experiment and its limitations."],capstone:"An illustrative computer vision demo with thoughtful error analysis.",demo:"ai"},
  {id:"robotics",name:"Robotics & Automation",family:3,icon:"🦾",min:10,summary:"Design systems that sense, decide and act.",steps:["Invent a robot to respond to a practical need.","Build control logic in a simulation or supervised kit.","Test edge cases and improve its behavior.","Demonstrate a prototype or simulation and explain the control rules."],capstone:"A simple robotics or control-system prototype.",demo:"arcade"},
  {id:"electronics",name:"Circuits & Inventing",family:3,icon:"💡",min:11,summary:"Combine inputs, components and logic in safe engineering experiments.",steps:["Imagine a useful device and define its purpose.","Simulate a small, age-appropriate circuit.","Test behavior, constraints and a design adjustment.","Present a simulation or supervised engineering build."],capstone:"A documented electronic circuit simulation or supervised prototype.",demo:"arcade"},
  {id:"cyber-citizenship",name:"Cybersecurity & Digital Citizenship",family:3,icon:"🛡️",min:10,summary:"Practice privacy, account security and ethical defensive thinking.",steps:["Notice where personal information might be exposed.","Design a practical privacy or digital-safety checklist.","Test protective decisions through safe scenarios.","Present a student-friendly digital safety resource."],capstone:"A defensive-security learning artifact with actionable habits.",demo:"story"},
  {id:"math-simulations",name:"Math & Physics Simulations",family:3,icon:"📐",min:11,summary:"Turn mathematical ideas into interactive experiments.",steps:["Ask a math or science question that can be modeled.","Build a simulation with adjustable variables.","Compare prediction and observation; explain assumptions.","Present the simulation and the model's limitations."],capstone:"An interactive math or science simulation with explanation.",demo:"arcade"},
  {id:"sports-analytics",name:"Basketball & Sports Analytics",family:4,icon:"🏀",min:11,summary:"Combine love of sport with programming, statistics and strategy.",steps:["Choose a basketball or sport question to measure.","Visualize safe, public or fictional game data.","Discuss sample size, uncertainty and interpretation.","Present a small sports-analysis dashboard or strategy tool."],capstone:"A sports analytics prototype with evidence-based insights.",demo:"ai"},
  {id:"climate-tech",name:"Climate & Community Technology",family:4,icon:"🌎",min:11,summary:"Explore environmental and community needs through thoughtful coding.",steps:["Find a community or environmental question worth exploring.","Study an appropriate dataset and prototype a useful tool.","Review limitations, tradeoffs and affected people.","Present a community technology idea and supporting evidence."],capstone:"A climate or community data project with documented assumptions.",demo:"ai"},
  {id:"music-media-code",name:"Music, Art & Creative Coding",family:4,icon:"🎨",min:7,summary:"Create original interactive art, animation and digital media.",steps:["Imagine a visual, musical or storytelling idea.","Code motion, patterns or interactive art elements.","Adjust variables, improve the experience and explain choices.","Present an original creative-computing piece."],capstone:"An original digital artwork or creative coding project.",demo:"story"},
  {id:"startup-builders",name:"Young Product Builders",family:4,icon:"🚀",min:14,summary:"Turn an idea into a user-tested digital prototype.",steps:["Identify a specific user need and a small problem.","Build an app or digital product prototype.","Gather appropriate feedback and refine the solution.","Present a functional prototype and rationale."],capstone:"An original digital product prototype and design explanation.",demo:"story"}
];
const canvas = $("universe-canvas"), context = canvas.getContext("2d",{alpha:true});
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = {rotation:.58, tilt:-.13, zoom:1, stage:0, visualStage:0, selected:tracks[3].id, world:"all", query:"", points:[], w:0,h:0, dpr:1, pointer:null,playTimer:null, tween:null, refreshQueued:false};
const trackById = new Map(tracks.map(t=>[t.id,t]));
const sanitizeId = id=>trackById.has(id)?id:tracks[3].id;
const sceneScale = () => Math.max(.65,Math.min(state.w/680,state.h/480))*state.zoom;
const stopStory = () => {
  if(state.playTimer!==null){clearInterval(state.playTimer);state.playTimer=null;}
  $("play-icon").textContent="▶";$("play-label").textContent="Play the story";
};
const cssColor=(hex,opacity)=>{const n=parseInt(hex.slice(1),16);return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+opacity+")";};
const visible = t=> (state.world==="all"||String(t.family)===state.world) && (!state.query||[t.name,t.summary,families[t.family].name].join(" ").toLowerCase().includes(state.query));
function raw3D(t,time){
  // 3 spatial coordinates are meaningful: each family occupies a sector in 3D,
  // and the four specializations form a small constellation around that sector.
  const familyAngle=(t.family/5)*Math.PI*2-Math.PI/2;
  const local=tracks.filter(x=>x.family===t.family).findIndex(x=>x.id===t.id);
  const theta=local*Math.PI/2+.18*t.family;
  const expansion=.72+time*.16;
  const cx=175*Math.cos(familyAngle),cz=175*Math.sin(familyAngle);
  return {
    x:(cx+58*Math.cos(theta))*expansion,
    y:(local-1.5)*53*expansion + (time-1.5)*26,
    z:(cz+56*Math.sin(theta))*expansion
  };
}
function projection(x,y,z){
  const cosY=Math.cos(state.rotation),sinY=Math.sin(state.rotation);
  const xx=x*cosY-z*sinY,zz=x*sinY+z*cosY;
  const cosX=Math.cos(state.tilt),sinX=Math.sin(state.tilt);
  const yy=y*cosX-zz*sinX,depth=y*sinX+zz*cosX;
  const perspective=740/Math.max(290,740-depth);
  const scale=sceneScale()*perspective;
  return {x:state.w/2+xx*scale,y:state.h/2+yy*scale,z:depth,scale};
}
const p3=t=>{const p=raw3D(t,state.visualStage);return {...projection(p.x,p.y,p.z),track:t};};
function drawConnection(a,b,color,alpha,width=1){
  context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);
  context.lineWidth=width;context.strokeStyle=cssColor(color,alpha);context.stroke();
}
function render(){
  if(!context)return;
  const w=state.w,h=state.h;
  context.clearRect(0,0,w,h);
  // Orienting rings and axes provide spatial depth without WebGL.
  const center=projection(0,0,0);
  for(let ring=1;ring<=3;ring++){
    const pts=[];for(let k=0;k<=84;k++){const theta=k*2*Math.PI/84;pts.push(projection(95*ring*Math.cos(theta),0,95*ring*Math.sin(theta)));}
    context.beginPath();pts.forEach((p,i)=>i?context.lineTo(p.x,p.y):context.moveTo(p.x,p.y));
    context.strokeStyle="rgba(143,219,212,"+(.12-(ring-1)*.02)+")";context.lineWidth=1;context.stroke();
  }
  const points=tracks.filter(visible).map(p3).sort((a,b)=>a.z-b.z);
  // Connected learning worlds: spokes and edges within each constellation.
  for(const t of tracks.filter(visible)){
    const point=points.find(p=>p.track.id===t.id);
    if(!point)continue;
    drawConnection(center,point,families[t.family].color,t.id===state.selected?.30:.075,t.id===state.selected?1.6:.8);
  }
  for(let family=0;family<5;family++){
    const group=points.filter(p=>p.track.family===family);
    for(let i=0;i<group.length;i++)
      for(let j=i+1;j<group.length;j++)
        drawConnection(group[i],group[j],families[family].color,.12,.7);
  }
  // The fourth dimension becomes visible as a ghosted four-stage trajectory.
  const chosen=trackById.get(state.selected);
  if(chosen&&visible(chosen)){
    const traj=[0,1,2,3].map(t=>{const v=raw3D(chosen,t);return projection(v.x,v.y,v.z);});
    for(let i=0;i<3;i++)drawConnection(traj[i],traj[i+1],"#e9f0b6",.8,2.2);
    traj.forEach((p,i)=>{
      context.beginPath();context.arc(p.x,p.y,i===state.stage?6:3.2,0,Math.PI*2);
      context.fillStyle=i===state.stage?"#fff6c9":"rgba(230,237,175,.56)";
      context.fill();
    });
  }
  points.forEach(p=>{
    const t=p.track,chosen=t.id===state.selected;
    const color=chosen?"#e7f5bc":families[t.family].color;
    const r=Math.max(3.2,(chosen?9:5.1)*Math.max(.7,p.scale));
    context.beginPath();context.arc(p.x,p.y,r*2.5,0,Math.PI*2);
    const glow=context.createRadialGradient(p.x,p.y,0,p.x,p.y,r*2.5);
    glow.addColorStop(0,cssColor(color,chosen?.36:.24));glow.addColorStop(1,cssColor(color,0));
    context.fillStyle=glow;context.fill();
    context.beginPath();context.arc(p.x,p.y,r,0,Math.PI*2);context.fillStyle=color;context.fill();
    context.lineWidth=chosen?2:1.2;context.strokeStyle=chosen?"#fff9d9":"rgba(255,255,255,.53)";context.stroke();
    if(chosen||p.scale>.9){
      context.font=(chosen?"bold ":"")+"11px system-ui, sans-serif";
      context.textBaseline="middle";
      context.fillStyle=chosen?"#f8ffd6":"rgba(225,242,237,.87)";
      const text=chosen?t.name:(t.name.length>15?t.name.slice(0,13)+"…":t.name);
      const off=r+7;
      context.fillText(text,p.x+off,p.y-7,chosen?235:135);
    }
  });
  // Hit testing uses projected locations matching the current drawing.
  state.points=points;
}
function requestRender(){
  if(state.refreshQueued)return;
  state.refreshQueued=true;
  requestAnimationFrame(()=>{state.refreshQueued=false;render();});
}
function resize(){
  const box=canvas.getBoundingClientRect();
  if(box.width<=0||box.height<=0)return;
  state.dpr=Math.min(window.devicePixelRatio||1,2);
  state.w=box.width;state.h=box.height;
  canvas.width=Math.round(state.w*state.dpr);canvas.height=Math.round(state.h*state.dpr);
  context.setTransform(state.dpr,0,0,state.dpr,0,0);render();
}
function updateSelection(){
  const t=trackById.get(state.selected),f=families[t.family],c=chapters[state.stage];
  $("detail-family").textContent=f.name.toUpperCase();
  $("detail-symbol").textContent=t.icon;
  $("detail-title").textContent=t.name;
  $("detail-description").textContent=t.summary;
  $("detail-world").textContent=f.name;
  $("detail-start").textContent="Suggested ages "+t.min+"+";
  $("detail-chapter-label").textContent="CHAPTER 0"+(state.stage+1)+" · "+c.label;
  $("detail-chapter-title").textContent=c.title+".";
  $("detail-chapter-description").textContent=t.steps[state.stage];
  $("detail-capstone").textContent=t.capstone;
  $("view-pathway").href="../catalog/?track="+encodeURIComponent(t.id)+"#pathway";
  $("view-demo").href="../projects/#"+t.demo;
  $("scene-stage").textContent="CHAPTER 0"+(state.stage+1)+" · "+c.label;
  $("timeline-caption").textContent="0"+(state.stage+1)+" / "+c.title;
  [...document.querySelectorAll("[data-chapter]")].forEach(b=>{
    if(Number(b.dataset.chapter)===state.stage)b.setAttribute("aria-current","step");
    else b.removeAttribute("aria-current");
  });
  $("chapter-slider").value=String(state.stage);
  [...$("track-list").querySelectorAll("button")].forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.track===t.id)));
}
function select(id){
  state.selected=sanitizeId(id);updateSelection();requestRender();
}
function animateVisualStage(next){
  if(state.tween!==null)cancelAnimationFrame(state.tween);
  const origin=state.visualStage,first=performance.now(),duration=reducedMotion?0:520;
  if(duration===0){state.visualStage=next;requestRender();return;}
  function tick(now){
    const t=Math.min(1,(now-first)/duration),eased=t*t*(3-2*t);
    state.visualStage=origin+(next-origin)*eased;requestRender();
    if(t<1)state.tween=requestAnimationFrame(tick);else state.tween=null;
  }
  state.tween=requestAnimationFrame(tick);
}
function setStage(s,fromPlay=false){
  state.stage=Math.max(0,Math.min(3,Math.round(s)));
  if(!fromPlay)stopStory();
  updateSelection();animateVisualStage(state.stage);
}
function startStory(){
  if(state.playTimer!==null){stopStory();return;}
  setStage(0,true);
  $("play-icon").textContent="Ⅱ";$("play-label").textContent="Pause";
  state.playTimer=setInterval(()=>{
    if(document.hidden){stopStory();return;}
    if(state.stage>=3){stopStory();return;}
    setStage(state.stage+1,true);
  },2300);
}
const setRotation=delta=>{state.rotation+=delta;requestRender();};
$("orbit-left").addEventListener("click",()=>setRotation(-.29));
$("orbit-right").addEventListener("click",()=>setRotation(.29));
$("zoom-in").addEventListener("click",()=>{state.zoom=Math.min(1.8,state.zoom*1.14);requestRender();});
$("zoom-out").addEventListener("click",()=>{state.zoom=Math.max(.55,state.zoom/1.14);requestRender();});
$("reset-camera").addEventListener("click",()=>{state.rotation=.58;state.tilt=-.13;state.zoom=1;requestRender();});
$("previous-chapter").addEventListener("click",()=>setStage(state.stage-1));
$("next-chapter").addEventListener("click",()=>setStage(state.stage+1));
$("chapter-slider").addEventListener("input",e=>setStage(Number(e.target.value)));
$("play-story").addEventListener("click",startStory);
[...document.querySelectorAll("[data-chapter]")].forEach(b=>b.addEventListener("click",()=>setStage(Number(b.dataset.chapter))));
const pointFromEvent=e=>{const rect=canvas.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top};};
canvas.addEventListener("pointerdown",e=>{
  if(e.button!==0&&e.pointerType==="mouse")return;
  const p=pointFromEvent(e);
  state.pointer={id:e.pointerId,x:p.x,y:p.y,startX:p.x,startY:p.y,moved:false};
  try{canvas.setPointerCapture(e.pointerId);}catch(err){}
});
canvas.addEventListener("pointermove",e=>{
  const d=state.pointer;if(!d||e.pointerId!==d.id)return;
  const p=pointFromEvent(e),dx=p.x-d.x,dy=p.y-d.y;
  if(Math.abs(p.x-d.startX)+Math.abs(p.y-d.startY)>8)d.moved=true;
  if(d.moved){state.rotation+=dx*.006;state.tilt=Math.max(-.85,Math.min(.85,state.tilt-dy*.0035));requestRender();}
  d.x=p.x;d.y=p.y;
});
canvas.addEventListener("pointerup",e=>{
  const d=state.pointer;if(!d||e.pointerId!==d.id)return;
  if(!d.moved){
    const p=pointFromEvent(e);
    let best=null,bestDist=27;
    for(const node of state.points){
      const dist=Math.hypot(node.x-p.x,node.y-p.y);
      if(dist<bestDist){bestDist=dist;best=node;}
    }
    if(best)select(best.track.id);
  }
  state.pointer=null;
});
canvas.addEventListener("pointercancel",()=>state.pointer=null);
canvas.addEventListener("wheel",e=>{
  e.preventDefault();state.zoom=Math.max(.55,Math.min(1.8,state.zoom*(e.deltaY>0?.94:1.06)));requestRender();
},{passive:false});
function buildList(){
  const list=$("track-list");list.replaceChildren();
  tracks.forEach(t=>{
    const b=document.createElement("button");b.type="button";b.dataset.track=t.id;
    b.setAttribute("aria-label","Explore "+t.name+" in the 4D universe");
    b.append(document.createTextNode(t.icon+" "+t.name));
    b.addEventListener("click",()=>{select(t.id);});
    list.append(b);
  });
  filterList();
}
function filterList(){
  state.world=$("world-filter").value;state.query=$("track-search").value.toLowerCase().trim();
  let count=0,first=null;
  [...$("track-list").querySelectorAll("button")].forEach(b=>{
    const t=trackById.get(b.dataset.track),show=visible(t);
    b.hidden=!show;if(show){count++;if(!first)first=t;}
  });
  $("track-count").textContent=count+" of 20 specializations shown. Choose one to explore its story.";
  const active=trackById.get(state.selected);
  if(first&&(!active||!visible(active)))state.selected=first.id;
  if(count===0)$("scene-hint").textContent="No matches. Clear the search or choose a different learning world.";
  else $("scene-hint").textContent="Drag or swipe to orbit · tap a star to explore";
  updateSelection();requestRender();
}
$("world-filter").addEventListener("change",filterList);
$("track-search").addEventListener("input",filterList);
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopStory();});
if(typeof ResizeObserver!=="undefined")new ResizeObserver(resize).observe(canvas);
else window.addEventListener("resize",resize);
const initial=new URLSearchParams(location.search).get("track");
if(initial&&trackById.has(initial))state.selected=initial;
buildList();
resize();
})();