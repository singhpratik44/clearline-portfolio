(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const catalog = window.PreferenceKits;
  if (!Array.isArray(catalog) || !catalog.length) {
    $("load-error").hidden = false;
    return;
  }
  const byId = new Map(catalog.map(kit => [kit.id, kit]));
  const categories = [...new Set(catalog.map(kit => kit.category))].sort();
  const axes = ["a","b","c"];
  const query = new URLSearchParams(location.search);
  const embedded = query.get("embed") === "1";
  const validRef = value => typeof value === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(value);
  let referral = validRef(query.get("ref")) ? query.get("ref") : "";
  let kit, indices, scene;
  let viewAvailable = false;
  let currentOffers = [];
  const defaultKit = byId.get("city") || catalog[0];
  const guidance = {
    beauty:["Start the routine with one everyday look.", "Compare a soft-glam finish with your everyday routine.", "Plan a statement look for an evening setting."],
    city:["Trace one walk through the grid.", "Sketch how a neighbor could reach the central green.", "Choose a crossing that connects both sides of the river."],
    model:["Place the main seat first and check the walking route.", "Start with a desk, then check the space behind the chair.", "Leave room for the screen, controls, and a clear exit."],
    sports:["Choose a passing decision you can repeat.", "Pick one shot location and a repeatable starting position.", "Set a defensive cue and practice the first response."],
    gift:["Choose one message for the front of the card.", "Decide the order someone should try the cards.", "Choose the opening page someone will see first."],
    game:["Sketch the route from the maze entrance to the finish.", "Write the clue that leads a player to a different ending.", "Choose one variable whose effect a player can test."],
    art:["Try the court artwork at the viewer’s eye level.", "Choose where shape and color should draw attention first.", "Group works around one color or subject they share."],
    workflow:["Name the input and output for one repeatable task.", "Find one handoff between people or tools to review.", "Choose a checkpoint that lets the program owner spot a delay."],
    seasonal:["Start with one specific thing you appreciated.", "Choose a moment worth celebrating.", "Offer one concrete word of encouragement."],
    broadcast:["Choose the player detail the first shot should reveal.", "Plan the moment the audience needs to see clearly.", "Decide where the host, guest, and camera will stand."]
  };
  const nextSteps = {
    beauty:[
      ["Pick one rosy shade to anchor the look.","Use the peach shade as the reference when comparing products.","Choose which feature will carry the berry color."],
      ["For five minutes, choose one step to emphasize.","For ten minutes, plan a base and one accent.","For twenty minutes, reserve time to compare the finish under another light."]
    ],
    city:[
      ["Check where a resident can reach a basic service.","Pick a green space and trace a route to its entrance.","Mark the transfer between a home and a transit stop."],
      ["Compare the walking distance for two low-rise homes.","Compare access from a short and a tall building.","Check where taller buildings share street access."]
    ],
    model:[
      ["Trace one unobstructed route through the open plan.","Give each zone a purpose and check the path between them.","Check that the corner leaves space for someone to turn."],
      ["Compare the oak finish with the largest object in the room.","Use the grey surface to compare contrasts at the edges.","Test the sage finish beside a lighter and a darker object."]
    ],
    sports:[
      ["Pick a target you can check on your own.","Take turns as player and observer.","Give each player a role before replaying the drill."],
      ["Mark a practice boundary that fits the available driveway.","Keep the first repetition on one side of the half court.","Use the extra court space to test a transition."]
    ],
    gift:[
      ["Choose a first prompt one person can try independently.","Give each person a turn to respond.","Plan a turn order so everyone can contribute."],
      ["Check the reading order with the layout lying flat.","Decide what the first fold reveals.","Plan what the recipient sees when the box opens."]
    ],
    game:[
      ["Give the player one useful object to collect.","Write two choices that change the ending.","Name the resource the player needs to balance."],
      ["Make one complete turn before adding more.","Connect two scenes and test the transition.","Draw a map of the main route before adding branches."]
    ],
    art:[
      ["Check how much empty wall surrounds the single work.","Try one common spacing across three panels.","Choose an anchor work before arranging the gallery around it."],
      ["Look at the dark frame against the image edge.","Compare the oak frame with the wall color.","Check the contrast between a white frame and the wall."]
    ],
    workflow:[
      ["Write the handoff between two consecutive steps.","Decide which evidence sends work down each branch.","Identify when the parallel tasks can safely rejoin."],
      ["Name the decision owner at the checkpoint.","Give the two checkpoints distinct review questions.","Specify what evidence passes each of the three checkpoints."]
    ],
    seasonal:[
      ["Choose a short opening line for the paper design.","Set a short message against the starlight treatment.","Choose a plant or growth detail to echo in the message."],
      ["Keep the main line visible when the card stands.","Choose which thought appears after the fold.","Write a line the recipient might return to later."]
    ],
    broadcast:[
      ["Identify the detail that needs to fill the close-up.","Frame your subject and one piece of context.","Decide which background detail belongs in the wide shot."],
      ["Check the sightline across the court.","Place the desk so the host can face the camera.","Leave room for both people to face each other."]
    ]
  };
  function make(tag, text) {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    return item;
  }
  function addOption(select,value,text) {
    const option = make("option",text);
    option.value = value;
    select.append(option);
  }
  function readFragment() {
    const hash = new URLSearchParams(location.hash.slice(1));
    const params = hash.has("kit") ? hash : new URLSearchParams(location.search);
    const chosen = byId.get(params.get("kit")) || defaultKit;
    const picks = axes.map((axis, i) => {
      const value = params.get(axis);
      if (!/^\d{1,2}$/.test(value || "")) return 0;
      return Math.min(Number(value), chosen.options[i].values.length - 1);
    });
    return {chosen, picks};
  }
  const chosenValues = () => kit.options.map((axis,i) => axis.values[indices[i]]);
  function fragment() {
    const params = new URLSearchParams({kit:kit.id});
    axes.forEach((axis,i) => params.set(axis,String(indices[i])));
    return params.toString();
  }
  function configurationURL(asEmbed = false) {
    const url = location.protocol === "file:" ? new URL("https://singhpratik44.github.io/clearline-portfolio/shop/3d/index.html") : new URL(location.pathname,location.origin);
    if (asEmbed) url.searchParams.set("embed","1");
    if (referral) url.searchParams.set("ref",referral);
    url.hash = fragment();
    return url.href;
  }
  function persist(push = false) {
    try { history[push ? "pushState" : "replaceState"](null,"",configurationURL(embedded)); } catch {}
  }
  function filterKits() {
    const category = $("category").value;
    const available = catalog.filter(item => !category || item.category === category);
    const select = $("kit");
    select.replaceChildren();
    const groups = new Map();
    for (const row of available) {
      if (category) addOption(select,row.id,row.title);
      else {
        if (!groups.has(row.category)) {
          const optgroup = make("optgroup");optgroup.label=row.category;groups.set(row.category,optgroup);select.append(optgroup);
        }
        addOption(groups.get(row.category),row.id,row.title);
      }
    }
    $("kit-count").textContent = available.length + (available.length === 1 ? " kit" : " kits");
    return available;
  }
  function choices() {
    const zones = kit.options.map((axis, i) => {
      const field = make("fieldset");
      field.append(make("legend",axis.label));
      const group = make("div");group.className="choice-group";
      axis.values.forEach((value, j) => {
        const label = make("label"), input = make("input");
        label.className="choice";
        input.type="radio";input.name="pref-"+i;input.value=String(j);input.checked=indices[i]===j;
        input.addEventListener("change",() => {
          if (!input.checked) return;
          indices[i] = j;
          persist();
          drawSelection();
        });
        label.append(input, make("span",value));group.append(label);
      });
      field.append(group);
      return field;
    });
    $("option-list").replaceChildren(...zones);
  }
  function eligibleOffer(offer) {
    return !offer.match || offer.match.every((choice,axis) => choice === -1 || choice === indices[axis]);
  }
  const specificity = offer => (offer.match || []).filter(val => val !== -1).length;
  function offerURL(offer) {
    return new URL(offer.href, location.protocol === "file:" ? configurationURL() : location.href);
  }
  function paintOffers() {
    currentOffers = kit.offers.filter(eligibleOffer).sort((a,b) => specificity(b) - specificity(a));
    const rows = currentOffers.map(offer => {
      const li = make("li"), a = make("a", offer.title);a.href=offer.href;
      if (embedded) {a.target="_blank";a.rel="noopener";}
      li.append(a);
      if (specificity(offer)) {
        const matched = offer.match.flatMap((n,i) => n < 0 ? [] : [kit.options[i].values[n]]);
        const reason = make("span", "Matches " + matched.join(" and "));
        reason.className="match-reason";li.append(reason);
      }
      if (offer.note) li.append(make("p",offer.note));
      return li;
    });
    $("offers").replaceChildren(...rows);
  }
  function briefLines() {
    return [kit.title, kit.availability, "", ...kit.options.map((axis,i) => axis.label + ": " + axis.values[indices[i]]), "",
      $("specific-advice").textContent, "", "Explore this kit", ...currentOffers.map(o => o.title + " — " + offerURL(o).href),
      "", "Open this configuration", configurationURL(), "", "Concept visualization by APERTURE. The listing describes the available product, activity, or service."];
  }
  function refreshSharing() {
    const link = configurationURL(), embedURL = configurationURL(true);
    $("open-full").href = link;
    $("manual-link").value = link;
    const escapes = {"&":"&amp;", '"':"&quot;", "<":"&lt;", ">":"&gt;"};
    const attr = s => s.replace(/[&"<>]/g,c=>escapes[c]);
    $("embed-code").value = '<iframe src="' + attr(embedURL) + '" title="' + attr("APERTURE 3D Kit Studio — " + kit.title) + '" width="960" height="960" style="width:100%;max-width:100%;border:0" loading="lazy" referrerpolicy="no-referrer"></iframe>';
    const inquiry = $("inquire");
    inquiry.hidden = !/inquiry/i.test(kit.availability);
    if (!inquiry.hidden) {
      const inbox = /team license/i.test(kit.availability) ? "parry.s.2324@gmail.com" : "clearlinegroupllc@gmail.com";
      const note = ["Hello APERTURE,", "", "Could you share the scope, availability, and current terms for this kit?", "",
        kit.title, ...kit.options.map((axis,i) => axis.label + ": " + axis.values[indices[i]]), link];
      if (referral) note.push("Referral code: " + referral);
      inquiry.href = "mailto:" + inbox + "?subject=" + encodeURIComponent("APERTURE kit inquiry — " + kit.title) + "&body=" + encodeURIComponent(note.join("\n"));
    }
    paintPrint();
  }
  function paintPrint() {
    const sheet = $("print-sheet");sheet.replaceChildren(make("p","APERTURE / 3D Kit Studio"),make("h1",kit.title),make("p",kit.availability));
    sheet.append(make("h2","My preferences"));
    const prefs = make("ul");
    kit.options.forEach((axis,i) => prefs.append(make("li",axis.label + ": " + axis.values[indices[i]])));
    sheet.append(prefs,make("p",$("specific-advice").textContent),make("h2","Explore this kit"));
    for(const offer of currentOffers) {
      const row=make("p");row.append(make("strong",offer.title),make("small",offerURL(offer).href));sheet.append(row);
    }
    sheet.append(make("h2","Return to this model"),make("small",configurationURL()),make("p","Concept visualization by APERTURE. The listing describes the available activity, edition, or service."));
  }
  function drawSelection() {
    const values = chosenValues();
    $("kit-description").textContent=kit.description;
    $("model-title").textContent=kit.title;
    $("model-category").textContent=kit.category;
    $("availability").textContent=kit.availability;
    $("scene-description").textContent=kit.options.map((axis,i) => axis.label + ": " + values[i]).join(" · ")+".";
    $("model").setAttribute("aria-label","3D concept model for " + kit.title);
    const advice=[guidance[kit.type]?.[indices[0]],nextSteps[kit.type]?.[0][indices[1]],nextSteps[kit.type]?.[1][indices[2]]].filter(Boolean);
    $("specific-advice").textContent = advice.length ? advice.join(" ") : kit.description;
    $("action-status").textContent="";
    $("manual-copy").hidden=true;
    paintOffers();
    refreshSharing();
    try {
      if (scene && viewAvailable) {
        const spec=window.PreferenceModels.build(kit.type,indices);
        scene.render(spec);$("model").style.backgroundColor=spec.background || "";
      }
    } catch { unavailable(); }
  }
  function selectKit(next,picks,resetView) {
    kit=next;indices=[...picks];
    $("kit").value=kit.id;
    choices();drawSelection();
    if (resetView) scene?.reset();
  }
  function unavailable() {
    viewAvailable=false;
    $("model").hidden=true;
    $("view-controls").hidden=true;
    $("scene-angle").hidden=true;
    $("view-help").textContent="A text preview of your kit is shown below. All choices and resource links are available.";
  }
  function camera(info) {
    viewAvailable=info.available;
    if (!viewAvailable) {unavailable();return;}
    $("scene-angle").textContent=Math.round(info.yaw)+"° · "+Math.round(info.zoom*100)+"%";
  }
  function restore() {
    const {chosen,picks}=readFragment();
    if ($("category").value && $("category").value!==chosen.category) {$("category").value="";filterKits();}
    selectKit(chosen,picks,Boolean(kit && chosen!==kit));
  }
  async function copy(value,manual,success) {
    try {
      await navigator.clipboard.writeText(value);
      $("action-status").textContent=success;
    } catch {
      manual();$("action-status").textContent="Select and copy the highlighted text.";
    }
  }
  function download(text) {
    const link=make("a"), url=URL.createObjectURL(new Blob([text],{type:"text/plain;charset=utf-8"}));
    link.href=url;link.download="aperture-"+kit.id+"-brief.txt";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  $("studio").hidden=false;
  document.body.classList.toggle("embedded",embedded);$("embed-bar").hidden=!embedded;
  addOption($("category"),"","All collections");categories.forEach(c=>addOption($("category"),c,c));
  filterKits();
  $("ref-code").value=referral;
  try {scene=window.PreferenceScene.mount($("model"),camera);}
  catch {unavailable();}
  restore();
  $("category").onchange=() => {
    const available=filterKits();
    if (available.some(row=>row.id===kit.id)) {$("kit").value=kit.id;return;}
    selectKit(available[0],[0,0,0],true);persist(true);
  };
  $("kit").onchange=() => {selectKit(byId.get($("kit").value),[0,0,0],true);persist(true);};
  const cameraMoves={left:["rotate",-12],right:["rotate",12],up:["tilt",8],down:["tilt",-8],in:["zoom",1.15],out:["zoom",1/1.15],reset:["reset"]};
  for(const button of document.querySelectorAll("[data-view]")){
    button.onclick=()=>{const [fn,value]=cameraMoves[button.dataset.view];scene?.[fn](value);};
  }
  $("ref-code").oninput=() => {
    const input=$("ref-code"), value=input.value.trim();
    referral=validRef(value)?value:"";
    input.setCustomValidity(value && !referral ? "Use letters, numbers, hyphens, or underscores." : "");
    input.setAttribute("aria-invalid",String(Boolean(value && !referral)));
    $("ref-help").textContent=value && !referral ? "Use up to 40 letters, numbers, hyphens, or underscores. This code was omitted." :
      "The code travels with the link and any inquiry. This studio does not count visits.";
    persist();refreshSharing();
  };
  $("share-link").onclick=() => copy(configurationURL(),() => {
    $("manual-copy").hidden=false;$("manual-link").focus();$("manual-link").select();
  },"Studio link copied with your kit and choices.");
  $("copy-embed").onclick=()=>copy($("embed-code").value,()=>{
    $("embed-code").focus();$("embed-code").select();
  },"Embed code copied with your kit and choices.");
  $("download-brief").onclick=()=>{download(briefLines().join("\n")+"\n");$("action-status").textContent="Your kit brief is ready to download.";};
  $("print-brief").onclick=()=>window.print();
  window.addEventListener("hashchange",()=>{if (!location.hash || location.hash.startsWith("#kit=")) restore();});
  window.addEventListener("popstate",()=>{if (!location.hash || location.hash.startsWith("#kit=")) restore();});
})();
