(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const all = selector => Array.from(document.querySelectorAll(selector));
  const routes = {
    game: {name:"Game", prompts:[
      "Decide what counts as a win. Change one tile so a player has to make a choice to get there.",
      "Write one rule on paper. Try to win both by following it and by trying to get around it.",
      "Give your Scratch sprite one move that suits your player's job. Change its distance and try again.",
      "Build an if/else that lets the same button help or hurt depending on where the player stands.",
      "Choose one number the game remembers. Put the player one step below the win condition and test it.",
      "Circle the Python list entry that represents a wall in your game. Predict what happens if it opens.",
      "Keep the starting board the same and close just one route. Compare the printed results.",
      "Credit a starting level and change what makes it challenging. Let a friend try both rules.",
      "Make one round with a clear start and ending. Cut one extra feature so another person can try it today.",
      "Give a visitor the controls. Watch one turn, then show the design decision that shaped it."]},
    story: {name:"Interactive story", prompts:[
      "Give the start and finish the names of two scenes. Place a clue a reader can discover between them.",
      "Write a rule for when the last scene can open. Try reaching it before and after finding its clue.",
      "Make a character greet the reader on a key press. Choose how its words or costume establish the mood.",
      "Write one decision with two believable endings. Let a reader try both and name the choice that mattered.",
      "Track what the character remembers. Make one line of dialogue depend on an earlier discovery.",
      "Label two tiles as scenes on paper. Find them in your Python list and predict which scene can be reached.",
      "Remove a bridge between scenes. Run the program and check which story locations the reader can still visit.",
      "Credit someone else's premise, then tell the same moment from a different character's point of view.",
      "Build a beginning, one choice, and two endings. Ask a reader whether the endings felt earned.",
      "Let two visitors choose different paths. Show them a line of dialogue you rewrote after hearing a reader."]},
    simulation: {name:"Simulation", prompts:[
      "Make a route for a delivery, an animal, or a water droplet. Decide what its stops represent.",
      "Choose one travel rule. Trace a trip by hand, then compare your prediction with the model.",
      "Make a Scratch sprite act like one part of your system. Show what a signal changes about its behavior.",
      "Choose a threshold, such as a water level. Give the model different behavior on the two sides of it.",
      "Name a quantity and its unit. Predict its value after two events, then inspect the variable.",
      "Represent roads, barriers, or habitats as a grid. Find one cell in both your diagram and Python.",
      "Choose one input and two settings. Record the predicted and observed output for each run.",
      "Credit the original model. Change one assumption and describe when the revised model could be useful.",
      "Make one input adjustable and one result visible. Explain a real-world detail the model leaves out.",
      "Ask a visitor to predict a result before they change the input. Use their explanation to spot a confusing control."]}
  };
  const lessons=all("[data-unit]");
  const readingTools=[
    ["Open Game Creator","../game-creator/index.html"], ["Open Game Creator","../game-creator/index.html"],
    ["Get a Scratch starter","starters/index.html"], ["Open project starters","starters/index.html"],
    ["Open project starters","starters/index.html"], ["Generate Python from my maze","../game-creator/index.html"],
    ["Generate Python from my maze","../game-creator/index.html"], ["Open the remix studio","studio/index.html"],
    ["Open my project studio","studio/index.html"], ["Open the family arcade kit","facilitator/index.html#arcade"]
  ];
  function selectedFromURL(){
    const params=new URLSearchParams(location.search);
    const hashUnit=location.hash.match(/^#unit-(\d+)$/);
    const value=Number(hashUnit ? hashUnit[1] : params.get("unit"));
    let track=params.get("track");
    if(!Object.hasOwn(routes,track)) {
      try {track=localStorage.getItem("aperture-academy-route");} catch {}
    }
    return {unit:Number.isInteger(value)&&value>=1&&value<=10 ? value : 1, track:Object.hasOwn(routes,track)?track:"game"};
  }
  let state=selectedFromURL();
  function persistURL(scroll, push){
    const url=new URL(location.href);
    url.searchParams.set("unit",state.unit);
    url.searchParams.set("track",state.track);
    if(scroll) url.hash="unit-"+state.unit;
    try { if(push) history.pushState({}, "", url); else history.replaceState({}, "", url); } catch {}
  }
  function paint(scroll=false){
    const route=routes[state.track];
    for(const link of all('a[data-open-studio]')) link.href="studio/index.html?track="+state.track;
    for(const el of all("[data-track]")) el.setAttribute("aria-pressed",String(el.dataset.track===state.track));
    for(const nav of all(".unit-nav")) nav.setAttribute("aria-current",String(Number(nav.dataset.jump)===state.unit));
    for(const article of lessons){
      const n=Number(article.dataset.unit);
      article.hidden=n!==state.unit;
      article.querySelector("[data-track-title]").textContent=route.name+" brief";
      article.querySelector("[data-track-prompt]").textContent=route.prompts[n-1];
      article.querySelector("[data-studio]").href="studio/index.html?unit="+n+"&track="+state.track;
    }
    if(scroll){const target=lessons[state.unit-1];target.focus({preventScroll:true});target.scrollIntoView({block:"start"});}
  }
  for(const el of all("[data-track]")) el.addEventListener("click",()=>{
    state.track=el.dataset.track;
    try{localStorage.setItem("aperture-academy-route",state.track);}catch{}
    persistURL(false,false);paint();
  });
  for(const el of all("[data-jump]")) el.addEventListener("click",e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    e.preventDefault(); state.unit=Number(el.dataset.jump); persistURL(true,true); paint(true);
  });
  for(const [i,article] of lessons.entries()){
    const link=document.createElement("a");
    link.textContent=readingTools[i][0]; link.href=readingTools[i][1]; link.className="text-link";
    article.querySelector(".unit-actions").append(link);
    if ([4,5,9,10].includes(i+1)) {
      const worldLink=document.createElement("a");
      worldLink.textContent="Build a branching world";
      worldLink.href="worlds/index.html";
      article.querySelector(".unit-actions").append(worldLink);
    }
  }
  function restore(){state=selectedFromURL();paint(/^#unit-\d+$/.test(location.hash));}
  window.addEventListener("popstate",restore);
  window.addEventListener("hashchange",restore);
  $("#print-book").hidden=false;
  $("#print-book").onclick=()=>window.print();
  paint(/^#unit-\d+$/.test(location.hash));

  // This cover and its editor link share the exact same tile data.
  const rows=["0000000000","0010000100","0010200100","0010000000","0000001100","0111010000","0000010020","0010000100","0010000100","0000000003"];
  const board=rows.join("").split("").map(Number);
  const destinations=[{spot:11,label:"near the start"},{spot:54,label:"at the fork"},{spot:86,label:"on the final bend"}];
  let step=0;
  function paintCover(){
    const seed=destinations[step];const map=board.slice();map[seed.spot]=2;
    const tiles=map.map((value,i)=>{
      const cell=document.createElement("span");
      const type=i===0?"start":value===1?"wall":value===2?"seed":value===3?"goal":"open";
      cell.className="cell "+type;
      cell.textContent=({start:"▸",goal:"⚑",seed:"✦"})[type]||"";
      cell.setAttribute("aria-hidden","true");return cell;
    });
    $("#draft-art").replaceChildren(...tiles);
    $("#draft-art").setAttribute("aria-label","Moonseed Run, a two-route maze. The movable seed is "+seed.label+".");
    $("#seed-status").textContent="Your last seed is "+seed.label+".";
    const level={v:1,title:"Moonseed Run",tiles:map.join("")};
    const token=btoa(JSON.stringify(level)).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");
    $("#open-draft").href="../game-creator/index.html#level="+token;
  }
  $("#move-seed").hidden=false;$("#move-seed").onclick=()=>{step=(step+1)%destinations.length;paintCover();};paintCover();
})();
