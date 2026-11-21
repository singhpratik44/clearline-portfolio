(() => {
  "use strict";
  const byId = id => document.getElementById(id);
  const create = (name, text) => {
    const el = document.createElement(name);
    el.textContent = text;
    return el;
  };
  const engine = window.WorldEngine;
  const starters = window.WorldStarters;
  let currentWorld;
  function drawMap(world, selected) {
    const map = byId("scene-atlas");
    if (!map) return;
    const names = new Map(world.scenes.map(scene => [scene.id, scene.name || "Untitled scene"]));
    map.replaceChildren(...world.scenes.map(scene => {
      const card = create("section", "");
      const pick = create("button", names.get(scene.id));
      pick.type = "button";
      pick.setAttribute("aria-current", String(selected === scene.id));
      pick.onclick = () => window.dispatchEvent(new CustomEvent("aperture:selectscene", {detail:{id:scene.id}}));
      const routes = create("ul","");
      for (const choice of scene.ending ? [] : scene.choices) {
        const target = names.get(choice.to) || "Choose a destination";
        routes.append(create("li", (choice.label || "Untitled choice") + " → " + target));
      }
      card.append(create("small", scene.id === world.start ? "Opening" : scene.ending ? "Ending" : "Scene"), pick, routes);
      return card;
    }));
  }
  window.addEventListener("aperture:worldchange", e => {
    currentWorld = e.detail.world;
    const details = byId("scene-atlas")?.closest("details");
    if(details) {
      details.ontoggle = () => { if(details.open) drawMap(currentWorld, e.detail.sceneId); };
      if(details.open) drawMap(currentWorld, e.detail.sceneId);
    }
    byId("manual-link")?.remove();
    if(byId("share-link-status")) byId("share-link-status").textContent = "";
  });
  const typeNames = ["Game", "Interactive story", "Simulation"];
  let selected = 0;
  function chooseExample(index) {
    selected = index;
    const world = starters[index];
    byId("sample-kind").textContent = typeNames[index]+" · "+world.scenes.length+" scenes";
    byId("sample-name").textContent = world.title;
    byId("sample-desc").textContent = world.description;
    byId("sample-cover").dataset.theme = index;
    byId("sample-cover").hidden = false;
    byId("arcade-player").hidden = true;
    Array.from(byId("arcade-picks").children).forEach((btn,i)=>btn.setAttribute("aria-pressed",String(i===index)));
  }
  starters.forEach((_,i)=>{
    const btn = create("button", typeNames[i]); btn.type="button";btn.onclick=()=>chooseExample(i);
    byId("arcade-picks").append(btn);
  });
  chooseExample(0);
  byId("play-example").onclick=()=>{
    byId("sample-cover").hidden=true;
    const player=byId("arcade-player");player.hidden=false;
    engine.mount(player,starters[selected]);
    player.tabIndex=-1;player.focus();
  };
  const anchorBase = location.protocol === "file:" ? "https://singhpratik44.github.io/clearline-portfolio/coding-lab/academy/worlds/index.html" : new URL("index.html",location.href).href;
  function pack(world) {
    const data = new TextEncoder().encode(JSON.stringify(world));
    if(data.length>9000) return "";
    return btoa(Array.from(data,b=>String.fromCharCode(b)).join("")).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");
  }
  byId("copy-world-link").onclick=async()=>{
    const status=byId("share-link-status");byId("manual-link")?.remove();
    const errors=engine.validate(currentWorld);
    if(errors.length){status.textContent=errors[0];return;}
    const token=pack(currentWorld);
    if(!token){status.textContent="This world is too large for a short browser link. Choose Download playable game to share it.";return;}
    const url=anchorBase+"#play="+token;
    try {await navigator.clipboard.writeText(url);status.textContent="Playable link copied. Your friend can open this version of your world.";}
    catch {
      const link=create("input","");link.type="text";link.id="manual-link";link.readOnly=true;link.value=url;
      link.setAttribute("aria-label","Playable link to copy");status.textContent="Select and copy your playable link.";
      status.after(link);link.focus();link.select();
    }
  };
  function sharedView(){
    const shared=location.hash.startsWith("#play=");
    byId("creator-page").hidden=shared; byId("shared").hidden=!shared;
    if(!shared)return;
    try{
      const token=location.hash.slice(6);
      if(!token||token.length>12000||!/^[A-Za-z0-9_-]+$/.test(token))throw Error("Invalid link");
      const bytes=Uint8Array.from(atob(token.replaceAll("-","+").replaceAll("_","/")),c=>c.charCodeAt(0));
      const world=JSON.parse(new TextDecoder().decode(bytes));
      if(engine.validate(world).length)throw Error("Incomplete world");
      byId("shared-title").textContent=world.title;
      byId("shared-summary").textContent=world.description||"";
      engine.mount(byId("shared-player"),world);
    }catch{
      byId("shared-title").textContent="This world link is incomplete";
      byId("shared-summary").textContent="Ask the creator for the full link or their downloaded playable game.";
      byId("shared-player").replaceChildren();
    }
  }
  window.addEventListener("hashchange",sharedView);sharedView();
  if(location.hash === "#bring-studio"){
    byId("studio-transfer").open = true;
    byId("bring-studio").scrollIntoView({block:"center"});
  }
  byId("bring-studio").onclick=()=>{
    const status=byId("transfer-status");let project;
    try {project=JSON.parse(localStorage.getItem("aperture-academy-studio-v1"));}catch{}
    const required=["scene","first","second","firstResult","secondResult"];
    if(!project||!required.every(k=>typeof project[k]==="string" && project[k].trim())){
      status.textContent="Open My studio on this device, write two choices and their outcomes, then return here.";return;
    }
    const end=(id,name,text)=>({id,name,text,ending:true,choices:[]});
    const world={title:String(project.title||"My two-choice world").slice(0,80),description:String(project.idea||"").slice(0,600),variable:"Discoveries",initial:0,start:"opening",
      scenes:[{id:"opening",name:"Opening",text:project.scene,ending:false,choices:[{label:project.first,to:"first",delta:1,need:0},{label:project.second,to:"second",delta:1,need:0}]},end("first","First outcome",project.firstResult),end("second","Second outcome",project.secondResult)]};
    window.dispatchEvent(new CustomEvent("aperture:importworld",{detail:{world}}));
    if(currentWorld?.title===world.title && currentWorld?.scenes?.[0]?.text===project.scene) byId("world-editor").scrollIntoView();
  };
})();
