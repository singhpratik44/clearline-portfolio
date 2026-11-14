
import * as THREE from "https://esm.sh/three@0.169.0";
import { OrbitControls } from "https://esm.sh/three@0.169.0/examples/jsm/controls/OrbitControls.js";

const q = (s) => document.querySelector(s);
const qa = (s) => [...document.querySelectorAll(s)];
const stage = q("#stage"), status = q("#readoutText"), fps = q("#fps");
const pane = q("#drawer"), formGift = q("#giftForm"), formBrief = q("#briefForm");
const action = q("#action"), exportButton = q("#export");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let renderer, camera, orbit, scene, world, sun, train, ball, giftLid;
let current = "home", quality = "auto", motion = !reduced;
let cameraFlight = null, tour = null, shot = -1, giftOpened = false;
let last = performance.now(), frames = 0, fpsStart = performance.now(), angle = 0;
let cameraStops = [];

const copy = {
  home: { label:"SPATIAL STUDIO / REAL ESTATE", title:"Walk tomorrow.", accent:"before it exists.",
    description:"Explore a furnished concept residence. Tour its rooms, change perspective, and separate beautiful visualization from a verified construction plan.",
    warning:"Synthetic dimensions · No client property represented", action:"▶ Guided rooms", export:"Download client brief" },
  district: { label:"LIVING WORLDS / DISTRICT", title:"See a city", accent:"come alive.",
    description:"Explore a Mediterranean-inspired district with an animated train, shaded streets and a public plaza.",
    warning:"Procedural concept city · Not an actual development", action:"▶ Fly through", export:"Save scene image" },
  sports: { label:"LIVING WORLDS / BASKETBALL", title:"Every angle", accent:"changes the game.",
    description:"Study spacing, explore broadcast camera positions, and replay a demonstration shot from four perspectives.",
    warning:"Simulated court and ball path · Not real game footage", action:"● Replay shot", export:"Save scene image" },
  gifts: { label:"LIVING WORLDS / GIFTS", title:"A moment made", accent:"for someone.",
    description:"Write a personal message, open a little 3D garden, and take home a keepsake. Nothing is submitted or stored remotely.",
    warning:"Private in-browser preview · No payment or delivery", action:"✦ Open gift", export:"Download keepsake" }
};
const presets = {
  home:[
    ["Dollhouse",[17,16,19],[0,0,0]],
    ["Living",[0,4,13],[-3,1,0]],
    ["Kitchen",[11,6,-1],[3,1,-2]],
    ["Bedroom",[-12,5,-5],[-3,1,-3]]
  ],
  district:[
    ["Skyline",[66,55,78],[0,0,0]],
    ["Plaza",[19,16,22],[0,2,0]],
    ["Street",[-2,10,48],[0,2,7]],
    ["Train",[45,20,15],[22,9,0]]
  ],
  sports:[
    ["Broadcast",[23,15,23],[0,1,0]],
    ["Sideline",[23,6,1],[0,2,0]],
    ["Overhead",[0,42,.01],[0,0,0]],
    ["Baseline",[0,7,29],[0,2,0]]
  ],
  gifts:[
    ["Garden",[19,13,20],[0,3,0]],
    ["Gift",[8,6,9],[0,2,0]],
    ["Top view",[0,25,.01],[0,1,0]]
  ]
};

const material = (color,metalness=0,roughness=.77) => new THREE.MeshStandardMaterial({color,metalness,roughness});
function box(parent,x,y,z,w,h,d,color,metal=0){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), typeof color==="string"?material(color,metal):color);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(parent,x,y,z,rt,rb,h,color,segments=16){
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),typeof color==="string"?material(color):color);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function sphere(parent,x,y,z,r,color){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),typeof color==="string"?material(color):color);
  mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;
}
function stroke(parent,pts,color="#fff",closed=false){
  const geo = new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p)));
  const obj=new (closed?THREE.LineLoop:THREE.Line)(geo,new THREE.LineBasicMaterial({color}));
  parent.add(obj);return obj;
}
function ellipse(parent,cx,cz,rx,rz,y,color,start=0,end=Math.PI*2,n=60){
  const pts=[];for(let i=0;i<=n;i++){const t=start+(end-start)*i/n;pts.push([cx+rx*Math.cos(t),y,cz+rz*Math.sin(t)])}stroke(parent,pts,color);
}
function tree(x,z,s=1){
  cylinder(world,x,1.5*s,z,.19*s,.25*s,3*s,"#6e6046");
  const foliage=sphere(world,x,3.8*s,z,1.5*s,"#4c856d");foliage.scale.set(1.05,.8,1);
}
function base(color="#334b44",size=120){
  box(world,0,-.25,0,size,.5,size,color);
}
function clearWorld(){
  world.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const m=Array.isArray(o.material)?o.material:[o.material];m.forEach(v=>v.dispose())}});
  world.clear();train=null;ball=null;giftLid=null;giftOpened=false;
}
function buildHome(){
  scene.background.set("#111c2a");scene.fog=null;
  base("#24384a",65);
  box(world,0,.03,0,15,.17,11,"#ba936f");
  box(world,0,-.15,0,18,.18,14,"#b7aa95");
  const wall="#e8e3d8", wood="#b58e68";
  const w=(x,y,z,a,b,c,col=wall)=>box(world,x,y,z,a,b,c,col);
  w(-7.5,1.6,0,.25,3.2,11);w(7.5,1.6,0,.25,3.2,11);
  w(0,1.6,-5.5,15,3.2,.25);w(-5,1.6,5.5,5,3.2,.25);w(5,1.6,5.5,5,3.2,.25);
  w(0,1.6,0,.18,3.2,3.9);w(-3.7,1.6,-1.8,7.5,3.2,.16);w(4.4,1.6,1.7,6.2,3.2,.16);
  const glass=new THREE.MeshStandardMaterial({color:"#9fe0e5",transparent:true,opacity:.35,metalness:.22,roughness:.2,side:THREE.DoubleSide});
  w(-1.8,1.7,-5.36,3,1.6,.08,glass);w(4,1.7,-5.36,3.5,1.6,.08,glass);
  w(-3,1.5,5.39,3,1.9,.08,glass);w(2.5,1.5,5.39,3.2,1.9,.08,glass);
  w(-4,0.1,1.8,5,.06,3.8,"#d6c0a7"); // rug
  w(-4,0.48,3.15,3.8,.72,1.1,"#406b71");w(-5.4,.6,2,1.1,.8,1.4,"#406b71");
  w(-3.6,.33,1.4,1.7,.4,.85,"#977052");w(-3.6,.15,1.4,1.5,.1,.65,"#efe4d0");
  w(3.8,.46,2.9,3.7,.86,1.3,"#ac8568");w(3.8,.89,2.9,3.95,.12,1.45,"#e6c9a6");
  for(const x of [2.2,5.4])for(const z of [1.2,4.6]){w(x,.43,z,.55,.86,.6,"#d8cdb7")}
  w(-3.8,.31,-3.6,4.4,.6,2.7,"#9d755d");w(-3.8,.67,-3.6,4.55,.18,2.8,"#e8e0d3");
  w(-4.9,.75,-4.72,1.1,.55,.45,"#cfb48b");
  w(4.2,.5,-3.3,4.7,1,1.45,"#6e8d84");w(4.2,1.04,-3.3,4.8,.11,1.55,wood);
  w(1.65,1.35,-4.8,.8,2.5,.4,"#faf3e7");
  for(const z of [-4,4]){cylinder(world,6.3,.35,z,.45,.5,.7,"#9f7856");sphere(world,6.3,1.3,z,.8,"#668e70")}
  for(const x of [-5,0,5])sphere(world,x,3.3,0,.22,"#f8deb0");
}
function buildDistrict(){
  scene.background.set("#aec4c4");scene.fog=new THREE.Fog("#aec4c4",100,190);
  base("#7e9d83",200);
  const stone="#c3aa83",road="#5b6669";
  box(world,0,.02,0,27,.08,140,road);box(world,0,.03,0,140,.07,25,road);
  box(world,0,.12,0,34,.22,34,stone);
  cylinder(world,0,.63,0,6,6,.8,"#e7d8be",32);
  cylinder(world,0,1.1,0,4.7,4.7,.14,"#61bec7",32);
  cylinder(world,0,3.0,0,.5,.65,4,"#e7d8be");
  sphere(world,0,5.2,0,.7,"#99dae0");
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++){
    const x=i*27,z=j*27;if(Math.abs(x)<21&&Math.abs(z)<21)continue;
    const h=8+Math.abs((i*7+j*11)%7);
    box(world,x,h/2,z,15,h,14,(i+j)%3===0?"#f0d9bc":(i*j)%2===0?"#ede5d3":"#e1c0a0");
    box(world,x,h+.3,z,16,.55,15,"#ab6f59");
    for(const f of [3.3,6.8,10.3]){if(f>h-1)continue;for(const dx of [-4,0,4])box(world,x+dx,f,z+7.15,1.3,1.9,.14,"#4e8695")}
  }
  for(let i=0;i<24;i++){const a=i*Math.PI*2/24,r=44+(i%3)*13;tree(Math.cos(a)*r,Math.sin(a)*r,.7+(i%4)*.12)}
  const trackPts=[];for(let i=0;i<100;i++){const a=i/100*Math.PI*2;trackPts.push([46*Math.cos(a),.19,42*Math.sin(a)])}
  stroke(world,trackPts,"#d2dddb",true);
  train=new THREE.Group();world.add(train);
  box(train,0,1.3,0,6.2,2.5,3,"#bc694f");
  box(train,-.2,2.53,0,5.5,.1,3,"#eed8b6");
  for(const x of [-2,0,2])box(train,x,1.9,1.55,1.1,.75,.08,"#8cd5dc");
  for(const z of [-1,1])for(const x of [-2,2])cylinder(train,x,.22,z,.32,.32,.45,"#243d45");
}
function buildSports(){
  scene.background.set("#0c2230");scene.fog=null;
  base("#102e2d",100);
  box(world,0,.03,0,15,.22,28,"#b78c59");
  const yy=.17;
  stroke(world,[[-7.4,yy,-13.9],[7.4,yy,-13.9],[7.4,yy,13.9],[-7.4,yy,13.9]],"#faf0d9",true);
  stroke(world,[[-7.4,yy,0],[7.4,yy,0]],"#faf0d9");
  ellipse(world,0,0,1.9,1.9,yy,"#faf0d9");
  for(const side of [-1,1]){
    const z=side*14;
    box(world,0,2.9,z-side*.2,3.5,2,.12,"#eef5ea");
    box(world,0,1.95,z-side*2,.16,3.8,.18,"#ecf4eb");
    const hoop=new THREE.Mesh(new THREE.TorusGeometry(.72,.075,10,32),material("#e17a55",.3,.3));
    hoop.rotation.x=Math.PI/2;hoop.position.set(0,3.07,z-side*1.55);world.add(hoop);
    const z2=side*9.3;
    stroke(world,[[-2.4,yy,z2],[-2.4,yy,z],[2.4,yy,z],[2.4,yy,z2]],"#f9f2da");
    ellipse(world,0,z2,2.4,2.4,yy,"#f9f2da",0,Math.PI);
    ellipse(world,0,z,6.5,6.5,yy,"#f9f2da",side===1?Math.PI:0,side===1?2*Math.PI:Math.PI);
  }
  ball=sphere(world,0,1,6,.45,"#d36f3c");
  for(const x of [-6.5,6.5])for(const z of [-8,8]){
    cylinder(world,x,.85,z,.22,.25,1.7,"#406f80");sphere(world,x,2,z,.42,"#9ecfbb");
  }
}
function buildGifts(){
  scene.background.set("#2d3246");scene.fog=new THREE.Fog("#2d3246",65,120);
  base("#3c665e",100);
  cylinder(world,0,.2,0,9,9,.4,"#c8ad89",32);
  cylinder(world,0,.52,0,5.5,5.5,.28,"#7c9f87",32);
  for(let i=0;i<18;i++){const a=i*Math.PI*2/18;const r=12+(i%3)*1.8;
    tree(Math.cos(a)*r,Math.sin(a)*r,.55+(i%4)*.06);
  }
  for(let i=0;i<24;i++){const a=i*2.4,r=5.7+(i%4);sphere(world,Math.sin(a)*r,.5,Math.cos(a)*r,.24,i%2===0?"#f4c9cc":"#e9d39e")}
  cylinder(world,0,.8,0,3.3,3.6,.55,"#d7c6ad",32);
  box(world,0,1.85,0,3.1,1.7,3.1,"#af5679");
  giftLid=new THREE.Group();giftLid.position.set(0,2.75,0);world.add(giftLid);
  box(giftLid,0,0,0,3.5,.48,3.5,"#e4c38e");
  box(giftLid,0,.26,0,.42,.11,3.7,"#f9e9c7");box(giftLid,0,.26,0,3.7,.11,.42,"#f9e9c7");
  for(let i=0;i<12;i++){const a=i*Math.PI*2/12;const light=sphere(world,Math.cos(a)*7.9,3.6+(i%3)*.7,Math.sin(a)*7.9,.14,"#ffe2a5");
    light.userData.float=i;
  }
}

function animateTo(i,immediate=false){
  const stop=cameraStops[i];if(!stop)return;
  qa("#hotspots .chip").forEach((b,j)=>b.setAttribute("aria-pressed",String(i===j)));
  const from=camera.position.clone(), fromTarget=orbit.target.clone();
  const to=new THREE.Vector3(...stop[1]),target=new THREE.Vector3(...stop[2]);
  if(immediate){camera.position.copy(to);orbit.target.copy(target);orbit.update();cameraFlight=null}
  else cameraFlight={from,fromTarget,to,target,at:performance.now(),duration:1150};
}
function setScene(kind,keepQuery=false){
  if(!copy[kind])kind="home";
  current=kind;clearWorld();tour=null;shot=-1;cameraFlight=null;
  ({home:buildHome,district:buildDistrict,sports:buildSports,gifts:buildGifts})[kind]();
  cameraStops=presets[kind];
  q("#eyebrow").textContent=copy[kind].label;
  q("#headline").textContent=copy[kind].title;
  q("#accent").textContent=copy[kind].accent;
  q("#lede").textContent=copy[kind].description;
  q("#warning").textContent=copy[kind].warning;
  action.textContent=copy[kind].action;
  exportButton.textContent=copy[kind].export;
  qa("[data-scene]").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.scene===kind)));
  q("#hotspots").replaceChildren();
  cameraStops.forEach((p,i)=>{
    const b=document.createElement("button");b.className="chip";b.type="button";b.textContent=p[0];b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>{tour=null;action.textContent=copy[kind].action;animateTo(i)});q("#hotspots").append(b);
  });
  animateTo(0,true);
  q("#drawerTitle").textContent=kind==="gifts"?"Make it personal":kind==="home"?"Verified client brief":"Experience details";
  q("#drawerDesc").textContent=kind==="gifts"?"Recipient and message stay in this browser tab. A keepsake downloads to your device.":"Concept preview. Models do not replace verified measurements, technical reviews or licensed footage.";
  formGift.hidden=kind!=="gifts";formBrief.hidden=kind!=="home";
  q("#standardDetails").hidden=kind==="home"||kind==="gifts";
  q("#sceneDetail").textContent=kind==="district"?"Explore the district with a free camera. Train movement is procedural.":kind==="sports"?"Four camera presets and a simulated shot trajectory; no tracking or real footage.":"";
  status.textContent="Touch: drag to orbit · pinch to zoom";
  if(kind==="gifts")pane.hidden=false;else pane.hidden=true;
  if(!keepQuery){const u=new URL(location.href);u.searchParams.set("scene",kind);history.replaceState(null,"",u)}
}
function tell(message){
  const n=q("#notice");n.textContent=message;n.hidden=false;
  clearTimeout(tell.timer);tell.timer=setTimeout(()=>n.hidden=true,2600);
}
function startTour(){
  if(tour){tour=null;action.textContent=copy[current].action;tell("Tour stopped");return}
  tour={index:0,next:performance.now()+4200};animateTo(0);
  action.textContent="■ Stop tour";tell("Guided camera tour started");
}
function doAction(){
  if(current==="home"||current==="district"){startTour();return}
  if(current==="sports"){shot=performance.now();tell("Simulated shot trajectory — not game footage");return}
  giftOpened=!giftOpened;pane.hidden=false; q("#giftPreview").textContent=giftOpened?"Your moment is open.": "Your gift is ready to open.";
  tell(giftOpened?"Your gift has opened ✦":"Gift reset");
}
function downloadText(name,text,type="text/plain"){
  const blob=new Blob([text],{type}),a=document.createElement("a"),url=URL.createObjectURL(blob);
  a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function clientBrief(){
  const checked={floorPlan:q("#verifyPlan").checked,measurements:q("#verifyDimensions").checked,clientApproval:q("#verifyApproval").checked,mobileTest:q("#verifyPhone").checked};
  const brief={type:"APERTURE Spatial Studio client discovery brief",created:new Date().toISOString(),project:"Unspecified prospective client",model:"Synthetic concept residence, dimensions not verified",attestations:checked,
    note:"Checkboxes record visitor attestations; no independent inspection or verified measurement has been performed.",
    toVerify:["Real drawing","Scaled dimensions","Door/window locations","Accessibility requirements","Client usage rights","Real-device browser test","Proposal, scope and fee"]};
  downloadText("aperture-client-brief.json",JSON.stringify(brief,null,2),"application/json");
  tell("Client brief downloaded · attestations are not verification");
}
function keepsake(){
  const name=(q("#recipient").value.trim()||"Someone wonderful").slice(0,40);
  const msg=(q("#message").value.trim()||"May your next chapter be full of wonder.").slice(0,200);
  const c=document.createElement("canvas");c.width=1000;c.height=1200;const g=c.getContext("2d");
  const grad=g.createLinearGradient(0,0,800,1200);grad.addColorStop(0,"#153f43");grad.addColorStop(1,"#0d2032");
  g.fillStyle=grad;g.fillRect(0,0,1000,1200);
  for(let i=0;i<25;i++){const a=i*2.4,r=220+(i%5)*36;g.beginPath();g.arc(500+Math.cos(a)*r,450+Math.sin(a)*r,2+(i%3),0,Math.PI*2);g.fillStyle="#efd5a1";g.fill()}
  g.strokeStyle="#d7c19a";g.lineWidth=2;g.beginPath();g.arc(500,440,270,0,Math.PI*2);g.stroke();
  g.font="82px Georgia";g.fillStyle="#e4ca99";g.textAlign="center";g.fillText("✦",500,420);
  g.font="bold 24px sans-serif";g.fillStyle="#b6d8cd";g.fillText("APERTURE   /   A MOMENT FOR YOU",500,160);
  g.font="54px Georgia";g.fillStyle="#ffffff";g.fillText("For "+name,500,550);
  g.font="31px Georgia";g.fillStyle="#e8f0e9";
  const words=msg.split(/\s+/);let lines=[],line="";for(const word of words){const cand=line?line+" "+word:word;if(g.measureText(cand).width>750&&line){lines.push(line);line=word}else line=cand}if(line)lines.push(line);
  lines.slice(0,7).forEach((v,i)=>g.fillText(v,500,640+i*45));
  g.font="25px sans-serif";g.fillStyle="#a8d5c0";g.fillText("Made with care, saved privately to your device.",500,1090);
  c.toBlob(blob=>{if(!blob){tell("Could not create image");return}const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="aperture-personal-gift.png";a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);tell("Private keepsake downloaded")},"image/png");
}
function screenshot(){
  try{renderer.render(scene,camera);const a=document.createElement("a");a.download="aperture-"+current+"-scene.png";a.href=renderer.domElement.toDataURL("image/png");a.click();tell("Concept screenshot saved")}
  catch(e){tell("Screenshot unavailable on this device")}
}
function doExport(){if(current==="home")clientBrief();else if(current==="gifts")keepsake();else screenshot()}
function init(){
  const canvasSupport=document.createElement("canvas");
  if(!canvasSupport.getContext("webgl")&&!canvasSupport.getContext("experimental-webgl"))throw Error("WebGL not available");
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.08,350);
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance",preserveDrawingBuffer:true,alpha:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  stage.append(renderer.domElement);
  world=new THREE.Group();scene.add(world);
  scene.add(new THREE.HemisphereLight("#dbf2ff","#3c4a52",2.0));
  sun=new THREE.DirectionalLight("#fce9c5",2.7);sun.position.set(20,35,15);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-85,right:85,top:85,bottom:-85,near:.5,far:140});
  scene.add(sun);
  orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=true;orbit.dampingFactor=.06;orbit.maxPolarAngle=Math.PI/2.06;
  orbit.minDistance=4;orbit.maxDistance=190;orbit.screenSpacePanning=false;
  orbit.addEventListener("start",()=>{tour=null;cameraFlight=null;action.textContent=copy[current].action});
  const first=new URL(location.href).searchParams.get("scene");
  setScene(copy[first]?first:document.body.dataset.start||"home");
  if(reduced){q("#motion").textContent="Play motion";q("#motion").dataset.active="false"}
  qa("[data-scene]").forEach(b=>b.addEventListener("click",()=>setScene(b.dataset.scene)));
  action.addEventListener("click",doAction);exportButton.addEventListener("click",doExport);
  q("#details").addEventListener("click",()=>{pane.hidden=!pane.hidden;q("#details").setAttribute("aria-expanded",String(!pane.hidden))});
  q("#closeDrawer").addEventListener("click",()=>{pane.hidden=true;q("#details").setAttribute("aria-expanded","false")});
  q("#motion").addEventListener("click",()=>{motion=!motion;q("#motion").textContent=motion?"Pause motion":"Play motion";q("#motion").dataset.active=String(motion);tell(motion?"Motion resumed":"Motion paused")});
  q("#quality").addEventListener("click",()=>{quality=quality==="auto"?"eco":"auto";renderer.setPixelRatio(quality==="eco"?Math.min(devicePixelRatio,1):Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=quality!=="eco";q("#quality").textContent=quality==="eco"?"Eco quality":"Auto quality";tell("Quality: "+quality)});
  q("#share").addEventListener("click",async()=>{try{if(navigator.share)await navigator.share({title:"APERTURE Spatial Experience",url:location.href});else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);tell("Experience link copied")}else tell("Copy the browser address to share")}catch(e){/* share dismissed */}});
  q("#giftOpen").addEventListener("click",()=>{if(current==="gifts")doAction()});
  q("#downloadBrief").addEventListener("click",clientBrief);
  q("#downloadGift").addEventListener("click",keepsake);
  addEventListener("resize",resize);
  addEventListener("orientationchange",resize);
  addEventListener("keydown",e=>{
    if(e.key==="Escape"){pane.hidden=true;tour=null;return}
    if(/INPUT|TEXTAREA/.test(document.activeElement?.tagName||""))return;
    const k=Number(e.key);if(k>=1&&k<=4)setScene(["home","district","sports","gifts"][k-1]);
    if(e.key===" "){e.preventDefault();doAction()}
    if(e.key==="+"||e.key==="="){camera.position.multiplyScalar(.92);orbit.update()}
    if(e.key==="-"){camera.position.multiplyScalar(1.08);orbit.update()}
  });
  last=performance.now();requestAnimationFrame(tick);
}
function resize(){
  if(!renderer)return;
  const w=innerWidth,h=innerHeight;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
}
function tick(now){
  requestAnimationFrame(tick);
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(document.hidden)return;
  if(cameraFlight){
    let t=Math.min(1,(now-cameraFlight.at)/cameraFlight.duration);t=t*t*(3-2*t);
    camera.position.lerpVectors(cameraFlight.from,cameraFlight.to,t);
    orbit.target.lerpVectors(cameraFlight.fromTarget,cameraFlight.target,t);
    if(t>=1)cameraFlight=null;
  }
  if(tour&&now>tour.next){tour.index++;if(tour.index>=cameraStops.length){tour=null;action.textContent=copy[current].action;tell("Tour complete")}else{animateTo(tour.index);tour.next=now+4200}}
  if(current==="district"&&train&&motion){
    angle+=dt*.22;const x=Math.cos(angle)*46,z=Math.sin(angle)*42;
    train.position.set(x,0,z);train.rotation.y=-Math.atan2(Math.cos(angle)*42,-Math.sin(angle)*46);
  }
  if(current==="sports"&&ball){
    if(shot>=0){const t=Math.min(1,(now-shot)/2600);ball.position.set(0,1+5.8*4*t*(1-t),6-17.2*t);ball.rotation.z=t*8;if(t>=1)shot=-1}
    else ball.position.set(0,1,6);
  }
  if(current==="gifts"&&giftLid){
    giftLid.position.y+=(giftOpened?4.3:2.75-giftLid.position.y)*Math.min(dt*3,1);
    if(giftOpened&&giftLid.position.y>4.2)giftLid.rotation.z=Math.min(.25,giftLid.rotation.z+dt*.25);
    if(!giftOpened)giftLid.rotation.z=Math.max(0,giftLid.rotation.z-dt*.7);
  }
  if(motion&&current==="gifts")world.children.forEach(o=>{if(o.userData.float!==undefined)o.position.y+=Math.sin(now*.0018+o.userData.float)*.0014});
  orbit.update();renderer.render(scene,camera);
  frames++;if(now-fpsStart>1400){fps.textContent=Math.round(frames*1000/(now-fpsStart))+" FPS";frames=0;fpsStart=now}
}
try{init()}catch(e){console.error("APERTURE 3D initialization:",e);q("#fallback").classList.add("active");q("#readoutText").textContent="3D unavailable on this device";q("#fallbackMessage").textContent="This device or browser could not start the 3D renderer. Use a current browser with WebGL, or browse the accessible concept descriptions."}
