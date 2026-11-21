(() => {
  "use strict";

  const get = id => document.getElementById(id);
  const copy = object => JSON.parse(JSON.stringify(object));
  const engine = window.WorldEngine;
  const starters = [window.WorldBlank, ...window.WorldStarters];
  const storageKey = "aperture-world-workshop-v1";
  const sceneFields = {name:"scene-name", text:"scene-text"};
  const worldFields = {title:"world-title",description:"world-description",variable:"world-resource"};
  let world = copy(starters[1] || starters[0]);
  let selectedId = world.start;
  let previewNeedsRefresh = false;
  let hasStoredChanges = false;
  let storageProtection = false;
  let storageWorks = true;
  let hintIndex = 0;
  let playCount = 0;
  let edits = 0;

  const scene = () => world.scenes.find(item => item.id === selectedId);
  const tell = text => { get("world-message").textContent = text; };
  const option = (value, label) => new Option(label, value);
  const button = (text, action) => {
    const node = document.createElement("button");
    node.type = "button";
    node.textContent = text;
    node.addEventListener("click", action);
    return node;
  };
  function validation(value) {
    try { return engine.validate(value); }
    catch { return ["This file does not contain an APERTURE world."]; }
  }
  // In-progress fields can be empty when a learner closes the browser.
  // Validate a filled copy so unfinished wording never loses a whole draft.
  function usableDraft(value) {
    if (!value || !Array.isArray(value.scenes) || !value.scenes.length || value.scenes.length > 24) return false;
    const trial = copy(value);
    for (const key of Object.keys(worldFields)) {
      if (typeof trial[key] !== "string") return false;
      if (!trial[key].trim()) trial[key] = "Draft";
    }
    for (const s of trial.scenes) {
      if (!s || !Array.isArray(s.choices)) return false;
      for (const key of Object.keys(sceneFields)) {
        if (typeof s[key] !== "string") return false;
        if (!s[key].trim()) s[key] = "Draft";
      }
      for (const c of s.choices) {
        if (!c || typeof c.label !== "string") return false;
        if (!c.label.trim()) c.label = "Choice";
      }
      if (!s.ending && !s.choices.length) s.choices.push({label:"Continue",to:trial.start,need:0,delta:0});
    }
    return !validation(trial).length;
  }
  function restore() {
    let raw;
    try { raw = localStorage.getItem(storageKey); }
    catch { storageWorks = false; return; }
    if (!raw) return;
    try {
      const record = JSON.parse(raw);
      if (!usableDraft(record.world)) throw Error("Invalid draft");
      world = record.world;
      selectedId = world.scenes.some(s => s.id === record.selectedId) ? record.selectedId : world.start;
      hasStoredChanges = true;
    } catch {
      storageProtection = true;
      tell("There is an unreadable saved draft. Choose Use starter or Open project file to replace it. You can download this world at any time.");
    }
  }
  function save() {
    if (storageProtection) {
      get("world-save").textContent = "Download your project to keep it while the previous draft is protected.";
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify({world,selectedId}));
      storageWorks = true;
    } catch { storageWorks = false; }
    get("world-save").textContent = storageWorks ? "Saved in this browser on this device." : "Browser storage is unavailable. Download your editable project to keep it.";
  }
  function announceWorld() {
    window.dispatchEvent(new CustomEvent("aperture:worldchange",{detail:{world,sceneId:selectedId}}));
  }
  function changed() {
    hasStoredChanges = true;
    edits++;
    previewNeedsRefresh = true;
    get("preview-note").textContent = "Press Play from the start to try your latest edits.";
    save();
    announceWorld();
  }
  function labelFor(id) {
    const number = world.scenes.findIndex(item=>item.id===id);
    const target = world.scenes[number];
    return target ? (target.name.trim() || "Untitled scene "+(number+1)) : "Choose a destination";
  }
  function setDestinations(select, value) {
    select.replaceChildren(...world.scenes.map(s=>option(s.id,labelFor(s.id))));
    select.value = value;
  }
  function paintNav() {
    get("scene-list").replaceChildren(...world.scenes.map((s,i)=>{
      const node=button((i+1)+". "+labelFor(s.id),()=>selectScene(s.id,true));
      node.dataset.scene = s.id;
      if(s.id===selectedId) node.setAttribute("aria-current","step");
      const badge=document.createElement("small");
      badge.textContent=[s.id===world.start?"Start":"",s.ending?"Ending":""].filter(Boolean).join(" · ");
      if(badge.textContent) node.append(" ",badge);
      return node;
    }));
    setDestinations(get("world-start"),world.start);
    get("add-scene").disabled = world.scenes.length>=24;
    get("remove-scene").disabled = world.scenes.length<=1;
  }
  function newChoice(target) { return {label:"Keep exploring", to:target, need:0, delta:0}; }
  function makeField(label, control) {
    const outer=document.createElement("label");
    outer.append(label,control);
    return outer;
  }
  function integerField(value,min,max,update) {
    const input=document.createElement("input");
    input.type="number"; input.min=min; input.max=max; input.step=1; input.value=value;
    input.addEventListener("input",()=>{
      if(input.value!=="" && input.validity.valid) update(Number(input.value));
    });
    input.onchange=()=>{
      const n=input.value===""?0:Number(input.value);
      input.value=String(Math.max(min,Math.min(max,Number.isFinite(n)?Math.round(n):0)));
      update(Number(input.value));
    };
    return input;
  }
  function paintChoices() {
    const current=scene();
    get("choice-section").hidden = current.ending;
    get("add-choice").disabled = current.choices.length>=4;
    const cards = current.choices.map((choice,i)=>{
      const card=document.createElement("fieldset");card.className="choice-card";
      const legend=document.createElement("legend"); legend.textContent="Choice "+(i+1);
      const label=document.createElement("input");label.maxLength=100;label.value=choice.label;
      label.oninput=()=>{choice.label=label.value;changed();};
      const destination=document.createElement("select");destination.className="choice-target";setDestinations(destination,choice.to);
      destination.onchange=()=>{choice.to=destination.value;changed();};
      const rules=document.createElement("details");
      const summary=document.createElement("summary");summary.textContent="Resource rule";
      const pair=document.createElement("div");pair.className="field-pair";
      pair.append(
        makeField("Minimum needed (0–99)",integerField(choice.need,0,99,n=>{choice.need=n;changed();})),
        makeField("Change after choosing (−9 to 9)",integerField(choice.delta,-9,9,n=>{choice.delta=n;changed();}))
      );
      rules.append(summary,pair);
      const remove=button("Remove choice "+(i+1),()=>{
        if(!confirm("Remove this choice from the scene?"))return;
        current.choices.splice(i,1);changed();paintChoices();get("add-choice").focus();
      });
      remove.className="quiet";
      card.append(legend,makeField("Action on the button",label),makeField("Leads to",destination),rules,remove);
      return card;
    });
    get("choice-list").replaceChildren(...cards);
  }
  function draw() {
    for(const [k,id] of Object.entries(worldFields))get(id).value=world[k];
    get("world-initial").value=world.initial;
    const current=scene();
    for(const [k,id] of Object.entries(sceneFields))get(id).value=current[k];
    get("scene-ending").checked=current.ending;
    paintNav();paintChoices();announceWorld();
    get("coach-hint").textContent="Choose Get a project hint to look at the scene you are editing.";
  }
  function selectScene(id,focus) {
    if(!world.scenes.some(s=>s.id===id))return;
    selectedId=id;draw();if(hasStoredChanges)save();
    if(focus)get("scene-name").focus();
  }
  function play() {
    const errors=validation(world);
    if(errors.length){
      get("world-player").replaceChildren();
      get("preview-note").textContent="Before you play: "+errors[0];
      return;
    }
    engine.mount(get("world-player"),copy(world));
    previewNeedsRefresh=false;playCount++;
    get("preview-note").textContent="Playing this version from its opening scene.";
  }
  function replaceWorld(next) {
    if((hasStoredChanges||storageProtection)&&!confirm("Replace the world on this device? Download your editable project first if you want to keep it."))return false;
    world=copy(next);selectedId=world.start;playCount=0;edits=0;hintIndex=0;
    storageProtection=false;hasStoredChanges=true;
    draw();save();play();tell("Opened "+world.title+".");
    return true;
  }
  function pickHint() {
    const current=scene();
    const errors=validation(world);
    if(errors.length)return errors[0]+" What would make that part playable?";
    const audited=engine.audit(world);
    const hints=[
      ...audited,
      current.ending ? "What could a player point to in this ending that changed because of an earlier decision?"
        : "Read only the button labels in "+labelFor(selectedId)+". Can your partner predict how the choices differ?",
      current.choices.some(c=>c.need>0) ? "One path asks for a minimum amount. Can you reach it with exactly enough, then again with one too few?"
        : "Imagine a surprise consequence in this scene. Would changing the resource, the destination, or the wording communicate it best?",
      previewNeedsRefresh&&edits ? "You changed the draft since the last preview. Guess what will happen, then play from the start to check."
        : playCount ? "Let a partner choose without a hint. Which part of their route would you keep?" : "Predict a player's first move, then compare it with what they do."
    ];
    return hints[hintIndex++%hints.length];
  }
  function download(name,type,data) {
    const a=document.createElement("a");const url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function filename(ext) {
    return (world.title.trim().replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70)||"my-world")+"."+ext;
  }
  restore();
  get("world-starter").replaceChildren(...starters.map((s,i)=>option(String(i),i?s.title:"A blank world")));
  get("world-starter").value = String(Math.max(0,starters.findIndex(s=>s.title===world.title)));
  get("load-world").onclick=()=>replaceWorld(starters[Number(get("world-starter").value)]);
  for(const [k,id] of Object.entries(worldFields)) get(id).oninput=()=>{world[k]=get(id).value;changed();};
  for(const [k,id] of Object.entries(sceneFields)) get(id).oninput=()=>{
    scene()[k]=get(id).value;
    if(k==="name"){
      paintNav();
      document.querySelectorAll(".choice-target").forEach((el,i)=>setDestinations(el,scene().choices[i].to));
    }
    changed();
  };
  get("world-initial").oninput=()=>{
    const control=get("world-initial");
    if(control.value!==""&&control.validity.valid){world.initial=Number(control.value);changed();}
  };
  get("world-initial").onchange=()=>{get("world-initial").value=world.initial;};
  get("world-start").onchange=()=>{world.start=get("world-start").value;changed();paintNav();};
  get("add-scene").onclick=()=>{
    if(world.scenes.length>=24)return;
    let n=world.scenes.length+1;
    while(world.scenes.some(s=>s.id==="scene-"+n))n++;
    selectedId="scene-"+n;
    world.scenes.push({id:selectedId,name:"New scene "+n,text:"What happens in this part of your world?",ending:false,choices:[newChoice(world.start)]});
    changed();draw();get("scene-name").focus();get("scene-name").select();
  };
  get("remove-scene").onclick=()=>{
    if(world.scenes.length<2)return;
    const remaining=world.scenes.filter(s=>s.id!==selectedId);
    const fallback=world.start===selectedId?remaining[0].id:world.start;
    const affected=remaining.flatMap(s=>s.choices).filter(c=>c.to===selectedId).length;
    const detail=affected?" Its "+affected+" incoming choice(s) will lead to “"+labelFor(fallback)+"”.":"";
    if(!confirm("Remove “"+labelFor(selectedId)+"”?"+detail))return;
    for(const s of remaining)for(const c of s.choices)if(c.to===selectedId)c.to=fallback;
    world.scenes=remaining;world.start=fallback;selectedId=fallback;
    changed();draw();get("scene-name").focus();
  };
  get("scene-ending").onchange=()=>{
    const current=scene(),ending=get("scene-ending").checked;
    if(ending&&current.choices.length&&!confirm("Make this an ending and remove this scene’s outgoing choices?")){
      get("scene-ending").checked=false;return;
    }
    current.ending=ending;current.choices=ending?[]:[newChoice(world.start)];
    changed();draw();
  };
  get("add-choice").onclick=()=>{
    const current=scene();if(current.ending||current.choices.length>=4)return;
    current.choices.push(newChoice(world.scenes.find(s=>s.id!==selectedId)?.id||selectedId));
    changed();paintChoices();get("choice-list").lastElementChild.querySelector("input").focus();
  };
  get("test-world").onclick=play;
  get("next-hint").onclick=()=>{get("coach-hint").textContent=pickHint();};
  get("export-game").onclick=()=>{
    const errors=validation(world);if(errors.length){tell("Before sharing: "+errors[0]);return;}
    download(filename("html"),"text/html;charset=utf-8",engine.exportHTML(world));tell("Playable file prepared. Open it in a browser to play.");
  };
  get("export-project").onclick=()=>{
    download(filename("json"),"application/json",JSON.stringify({format:"aperture-world",version:1,world},null,2));
    tell("Editable project prepared. You or a friend can open it with Open project file.");
  };
  get("import-project").onclick=()=>get("world-file").click();
  get("world-file").onchange=async()=>{
    const file=get("world-file").files[0];get("world-file").value="";if(!file)return;
    if(file.size>512000){tell("Choose a project file smaller than 500 KB.");return;}
    try{
      const record=JSON.parse(await file.text());
      if(record?.format!=="aperture-world"||record.version!==1||!usableDraft(record.world)){tell("This is not a supported APERTURE world project. Your current world is still open.");return;}
      replaceWorld(record.world);
    }catch{tell("This file could not be opened. Your current world is still open.");}
  };
  window.addEventListener("aperture:importworld",event=>{
    const next=event.detail?.world;
    const errors=validation(next);
    if(errors.length){tell("This Studio scene could not be brought in. "+errors[0]);return;}
    if(replaceWorld(next))get("scene-name").focus();
  });
  window.addEventListener("aperture:selectscene",e=>selectScene(e.detail?.id,true));
  draw();play();
  if(!storageProtection)get("world-save").textContent=storageWorks?(hasStoredChanges?"Restored your world from this browser.":"Edits save in this browser. Download a project to keep a separate copy."):"Browser storage is unavailable. Download your editable project to keep it.";
})();
