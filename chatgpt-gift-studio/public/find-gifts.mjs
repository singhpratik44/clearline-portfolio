// Product paths and listed USD prices come from APERTURE's item pages.
// All URLs are first-party and public. A preview is an illustrative scene.
const SITE = "https://singhpratik44.github.io/clearline-portfolio/";
const catalog = [
  {
    id:"holiday-thank-you", title:"Holiday Thank-You Postcards", price:0,
    path:"gifts/holiday-thank-you/index.html", preview:"thank-you-postcards",
    topics:["paper","art","gratitude","holiday","making"], people:["family","friend","teacher","coach"], occasions:["holiday","thanks"],
    detail:"It gives the recipient a hand-written message they can keep.",
    next:"Open the free postcard sheet, print one design, and finish the note by hand."
  },
  {
    id:"robot-quest", title:"Robot Quest: A Gift of Curiosity", price:0,
    path:"code-the-game/holiday/index.html#giftcard",
    topics:["robot","code","science","making","paper"], people:["child","teen","teacher","family"], occasions:["holiday","birthday"],
    detail:"A printable invitation gives the recipient four robot missions to try.",
    next:"Open the gift card, add a short invitation, and print it for the person who will take on the missions."
  },
  {
    id:"playable-postcards", title:"Playable Postcards", price:0,
    path:"creator-series.html#playable-postcards", preview:"game-creator",
    topics:["games","code","story","making"], people:["child","teen","friend","family"], occasions:["birthday","holiday","thanks"],
    detail:"The maker writes two choices and hides a different surprise behind each one.",
    next:"Build the two endings, play both, then choose whether to give the finished game to someone."
  },
  {
    id:"basketball-iq", title:"Basketball IQ Challenge Deck", price:15,
    path:"gifts/catalog.html#basketball-iq", preview:"gift-basketball-iq",
    topics:["basketball","strategy","paper"], people:["player","child","teen","family"], occasions:["holiday","birthday"],
    detail:"It turns basketball decisions into printable challenges a player can discuss away from the court.",
    next:"Review the individual deck and its use terms. Choose a first decision to try with the recipient."
  },
  {
    id:"extra-pass", title:"The Extra Pass", price:0, path:"gifts/sample/index.html#the-extra-pass",
    topics:["basketball","strategy"], people:["player","coach","family","child"], occasions:["holiday"],
    detail:"The recipient reads a single possession and chooses what to do with the ball.",
    next:"Open the free challenge, cover the suggested answer, and compare two possible reads."
  },
  {
    id:"court-to-code", title:"Court to Code", price:0, path:"creator-series.html#court-to-code", preview:"game-creator",
    topics:["basketball","code","making","games"], people:["player","child","teen","teacher"], occasions:["holiday"],
    detail:"It lets the recipient turn an on-court decision into a rule someone else can play.",
    next:"Choose a basketball decision, build the first two outcomes, and give someone a turn."
  },
  {
    id:"game", title:"Game Inventor Quest Deck", price:9, path:"gifts/catalog.html#game", preview:"gift-game",
    topics:["games","making","paper","strategy"], people:["child","teen","teacher"], occasions:["holiday","birthday"],
    detail:"Eight paper missions take a game idea from characters to a first playtest.",
    next:"Review the individual edition. Pick one mission and include a note challenging the recipient to invent a rule."
  },
  {
    id:"birthday", title:"Birthday Game Party Kit", price:12, path:"gifts/catalog.html#birthday", preview:"gift-birthday",
    topics:["games","making","party"], people:["child","family"], occasions:["birthday"],
    detail:"Eight activity stations and a host plan give a birthday group something to make and play together.",
    next:"Review the kit, choose the first station, and use its published instructions to plan the activity."
  },
  {
    id:"space", title:"Space Explorer STEM Missions", price:12, path:"gifts/catalog.html#space", preview:"gift-space",
    topics:["space","robot","science","making","paper"], people:["child","teacher","family"], occasions:["holiday","birthday"],
    detail:"Its printable space missions include designing a moon base and planning a rover route.",
    next:"Open the individual listing. Pick one mission and write the recipient a short astronaut briefing."
  },
  {
    id:"family", title:"Family Logic Game Night", price:15, path:"gifts/catalog.html#family", preview:"gift-family",
    topics:["strategy","games","puzzles","paper"], people:["family","friend","teen"], occasions:["holiday","birthday"],
    detail:"Ten logic puzzles come with hints and answers so the family can play together.",
    next:"Review the game-night edition, then choose a puzzle and invite someone to solve it with you."
  },
  {
    id:"future-coder", title:"Future Coder Pathway Planner", price:19, path:"gifts/catalog.html#coding-pathway", preview:"gift-coding-pathway",
    topics:["code","making","games","robot"], people:["child","teen","teacher"], occasions:["holiday","graduation"],
    detail:"Eight printable milestones help a young coder take an idea through to a project they can show.",
    next:"Review the planner, then let the recipient choose the project for the first milestone."
  },
  {
    id:"gallery-to-game", title:"Gallery to Game", price:0, path:"creator-series.html#gallery-to-game", preview:"art-beyond",
    topics:["art","games","story","making"], people:["child","teen","friend","family"], occasions:["holiday"],
    detail:"An artwork becomes the starting point for a game the recipient helps invent.",
    next:"Choose an artwork, borrow a shape or color, and turn it into the first playable choice."
  },
  {
    id:"maker-greeting", title:"Personal Greeting Maker", price:0, path:"gifts/featured/index.html#make", preview:"free-greeting",
    topics:["art","gratitude","paper","encouragement"], people:["friend","family","teacher","coach"], occasions:["holiday","birthday","thanks","graduation"],
    detail:"There is room for a personal message and a greeting the creator can choose to share.",
    next:"Write one specific thing you appreciate, preview the greeting, and decide whether to share it."
  },
  {
    id:"coach-appreciation", title:"Coach & Teammate Appreciation Awards", price:9, path:"gifts/catalog.html#coach-appreciation", preview:"gift-coach-appreciation",
    topics:["basketball","gratitude","encouragement","paper"], people:["coach","player","team"], occasions:["thanks","graduation"],
    detail:"Printable awards give a player or coach a place to name a contribution they noticed.",
    next:"Review the edition, then pick an award and describe a specific moment worth recognizing."
  },
  {
    id:"family-heritage", title:"Our Family Story Keepsake", price:15, path:"gifts/catalog.html#family-heritage", preview:"gift-family-heritage",
    topics:["story","paper","heritage","gratitude"], people:["family","grandparent"], occasions:["holiday","thanks"],
    detail:"Its family storytelling prompts turn memories into a shared keepsake.",
    next:"Review the individual workbook and choose the first memory you want to ask about."
  },
  {
    id:"coach-practice", title:"Coach's Practice Architect", price:29, path:"gifts/catalog.html#coach-practice", preview:"gift-coach-practice",
    topics:["basketball","coaching","strategy"], people:["coach"], occasions:["holiday","thanks"],
    detail:"It gives a basketball coach a printable way to plan the flow of a practice.",
    next:"Review the coach's edition and make sure its use terms fit the intended gift."
  },
  {
    id:"table-draft", title:"Thanksgiving Table Draft", price:0, path:"shop/seasonal/#table-draft",
    topics:["thanksgiving","table","holiday","paper","gratitude","games"],people:["family","friend","grandparent"],occasions:["holiday","thanks"],
    detail:"Fold printable place cards for Thanksgiving and use their gratitude and play prompts around the table.",
    next:"Print the free place cards and choose a gratitude prompt for the table."
  },
  {
    id:"game-day", title:"Game Day Color Lab", price:0, path:"shop/seasonal/#game-day",preview:"makeup",
    topics:["football","makeup","teamcolors","art","making"],people:["team","player","friend","teen"],occasions:["holiday","birthday"],
    detail:"A paper face chart and an original football play diagram let a fan design a game-day color palette.",
    next:"Open the free color lab and choose the team colors you want to try."
  },
  {
    id:"side-street", title:"Side Street City Atlas", price:0, path:"shop/seasonal/#side-street",preview:"city",
    topics:["city","maps","art","games","paper"],people:["child","teen","friend","family"],occasions:["holiday","birthday"],
    detail:"An original street-atlas poster includes a route challenge for someone who likes city maps or game worlds.",
    next:"Open the free city art print and trace your route through its streets."
  }
];

const vocabulary = {
  thanksgiving:/\b(thanksgiving|friendsgiving)\b/,
  table:/\b(dinner table|tablescape|tabletop|table activity|table game)\b/,
  football:/\b(football|tailgat(?:e|ing)|touchdown|gridiron)\b/,
  makeup:/\b(makeup|make-up|cosmetics?|eyeshadow|face paint)\b/,
  teamcolors:/\b(team colou?rs?|team palette|game day)\b/,
  city:/\b(city|cities|urban|town planning|streets?|open.world|grand theft auto|gta)\b/,
  maps:/\b(maps?|mapping|atlas|cartograph(?:y|er)|neighbou?rhoods?)\b/,
  basketball:/\b(basketball|hoops?|hoopers?|point guard|offense|defense|passing|shooting)\b/,
  strategy:/\b(strategy|strategies|tactics|decisions?|logic)\b/,
  paper:/\b(paper|printable|printing|handwritten|postcards?|stationery)\b/,
  art:/\b(art|arts|artwork|artist|drawing|painting|design|crafts?|crafting)\b/,
  gratitude:/\b(thanks|thank\s*you|gratitude|appreciation|thankful)\b/,
  holiday:/\b(holiday[s]?|christmas|hanukkah|diwali|kwanzaa|thanksgiving|festive|winter break|new year)\b/,
  making:/\b(making|makers?|build|building|creating|diy|invention|inventing|tinker(?:ing)?)\b/,
  games:/\b(games?|gaming|gamer|playable|playtesting|arcade)\b/,
  code:/\b(code|coding|coder|programming|scratch|python|makecode|godot)\b/,
  story:/\b(story|stories|storytelling|writing|mystery|reading)\b/,
  robot:/\b(robot|robots|robotic|robotics|rover|lego|mechanical)\b/,
  science:/\b(stem|science|scientific|engineering)\b/,
  space:/\b(space|astronomy|astronaut|moon|rocket|planets?)\b/,
  party:/\b(party|parties|celebration)\b/, puzzles:/\b(puzzles?|riddles?)\b/,
  heritage:/\b(heritage|ancestry|memories|family history)\b/,
  coaching:/\b(coach|coaching|practice plan|drills)\b/,
  encouragement:/\b(encouragement|motivational|confidence|recognition)\b/
};
const audiences = {
  child:/\b(children|child|kids?|younger|elementary|niece|nephew)\b/, teen:/\b(teen(s|ager|agers)?|tween[s]?|high school|middle school)\b/,
  friend:/\b(friends?|neighbor|colleague)\b/, family:/\b(famil(y|ies)|parents?|siblings?|household)\b/,
  grandparent:/\b(grandparents?|grandma|grandpa|grandmother|grandfather)\b/, teacher:/\b(teachers?|educator|classroom|instructor|librarian)\b/,
  coach:/\b(coaches|coach|trainer)\b/, player:/\b(player[s]?|hoopers?|athlete[s]?)\b/, team:/\b(team|teammates|club)\b/
};
const occasions = {
  holiday:vocabulary.holiday, birthday:/\b(birthday|bday)\b/, thanks:vocabulary.gratitude,
  graduation:/\b(graduat(e|ion|ing)|promotion|end of season)\b/
};
const names = {
  thanksgiving:"Thanksgiving",table:"table activities",teamcolors:"team colors",makeup:"makeup",city:"city design",maps:"maps",
  code:"coding", making:"making things", paper:"paper projects", heritage:"family history",
  robot:"robotics", games:"games", puzzles:"puzzles", holiday:"the holidays", thanks:"a thank-you",
  child:"a younger learner", teen:"a teen", friend:"a friend", family:"a family", teacher:"an educator",
  grandparent:"a grandparent", player:"a player", coach:"a coach", team:"a team"
};

function textOf(value) {
  if (Array.isArray(value)) return value.filter(v=>typeof v==="string").slice(0,20).join(" ").slice(0,1200).toLowerCase();
  return typeof value==="string" ? value.slice(0,1200).toLowerCase() : "";
}
function matched(vocab, text) {
  return Object.keys(vocab).filter(key=>vocab[key].test(text));
}
function budgetCap(input) {
  const value=input.budgetUsd ?? input.budget;
  if (value===undefined || value===null || value==="") return null;
  let cap=value;
  if (typeof value==="string") {
    if (/^\s*free\s*$/i.test(value)) return 0;
    const match=/^\s*(?:USD\s*|\$\s*)?(\d+(?:\.\d+)?)\s*(?:USD)?\s*$/i.exec(value);
    if (!match) throw new TypeError("Enter a nonnegative dollar cap for the gift budget.");
    cap=Number(match[1]);
  }
  if (typeof cap!=="number" || !Number.isFinite(cap) || cap<0) throw new TypeError("Enter a nonnegative dollar cap for the gift budget.");
  return cap;
}

// Enclosures are free activities the recipient can open immediately.
export function getCardActivities() {
  return catalog
    .filter(item => item.price === 0 && !["holiday-thank-you", "maker-greeting"].includes(item.id))
    .map(item => ({id: item.id, title: item.title, url: SITE + item.path}));
}

const cardActivityIds = new Set(getCardActivities().map(item => item.id));

export function findCatalogGifts(input={}) {
  const cap=budgetCap(input);
  const interestText=textOf(input.interests);
  const personText=[textOf(input.audience),textOf(input.recipient)].join(" ");
  const occasionText=textOf(input.occasion);
  const interests=matched(vocabulary,[interestText,personText,occasionText].join(" "));
  const people=matched(audiences,personText);
  const events=matched(occasions,[occasionText,interestText,personText].join(" "));
  const limit=Number.isInteger(input.limit) ? Math.min(3,Math.max(1,input.limit)) : 3;
  const ranked=catalog.filter(p=>cap===null || p.price<=cap).map((p,index)=>{
    const topics=interests.filter(x=>p.topics.includes(x));
    const who=people.filter(x=>p.people.includes(x));
    const event=events.filter(x=>p.occasions.includes(x));
    // A specific interest beats a broad format; a free option wins exact ties.
    const topicScore=topics.reduce((n,key)=>n+(["making","games","paper","holiday"].includes(key) ? 3 : 7),0);
    return {p,index,topics,who,event,score:topicScore + who.length*3 + event.length*2};
  });
  ranked.sort((a,b)=>b.score-a.score || Number(a.p.price>0)-Number(b.p.price>0) || a.index-b.index);
  // Avoid padding a targeted request with suggestions unrelated to its interests.
  const matches=ranked.filter(x=>x.topics.length);
  const selected=(matches.length ? matches : ranked).slice(0,limit);
  const recommendations=selected.map(({p,topics,who,event})=>{
    const reasons=[];
    if(topics.length) reasons.push(topics.slice(0,2).map(k=>names[k]||k).join(" and "));
    if(who.length) reasons.push("a gift for "+names[who[0]]);
    if(event.length && !topics.includes(event[0])) reasons.push(event[0]==="holiday" ? "holiday giving" : event[0]==="thanks" ? "a thank-you" : event[0]+" giving");
    const why=reasons.length ? "Matches "+reasons.join(", ")+". "+p.detail : p.detail;
    const r={id:p.id,title:p.title,priceUsd:p.price,why,url:SITE+p.path,nextStep:p.next};
    if (cardActivityIds.has(p.id)) r.cardMakerUrl=SITE+"gifts/holiday-thank-you/?activity="+encodeURIComponent(p.id);
    if (p.preview) r.previewUrl=SITE+"shop/3d/index.html#kit="+p.preview;
    return r;
  });
  return {currency:"USD",budgetUsd:cap,recommendations};
}
