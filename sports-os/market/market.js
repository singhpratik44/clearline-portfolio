/* APERTURE Sports Market v1 — original fan moments + existing gift checkouts + official scoreboard navigation.
   No hidden live-score requests, analytics, ad targeting, user registration, payments or session storage. */
"use strict";
(function(root){
 const LEAGUES=[
  {id:"nba",sport:"basketball",name:"NBA",icon:"🏀",url:"https://www.nba.com/games",detail:"Official professional basketball games and scores"},
  {id:"wnba",sport:"basketball",name:"WNBA",icon:"🏀",url:"https://www.wnba.com/schedule",detail:"Official women's basketball schedule and results"},
  {id:"nfl",sport:"football",name:"NFL",icon:"🏈",url:"https://www.nfl.com/scores",detail:"Official professional American football scores"},
  {id:"mlb",sport:"baseball",name:"MLB",icon:"⚾",url:"https://www.mlb.com/scores",detail:"Official baseball results and schedule"},
  {id:"nhl",sport:"hockey",name:"NHL",icon:"🏒",url:"https://www.nhl.com/scores",detail:"Official professional hockey scores"},
  {id:"mls",sport:"soccer",name:"MLS",icon:"⚽",url:"https://www.mlssoccer.com/schedule/scores",detail:"Official American professional soccer results"},
  {id:"ncaa",sport:"basketball",name:"NCAA basketball",icon:"🏀",url:"https://www.ncaa.com/scoreboard/basketball-men/d1",detail:"Official NCAA college basketball scores"}
 ];
 const ICON={basketball:"🏀",soccer:"⚽",football:"🏈",baseball:"⚾",hockey:"🏒",all:"🏆"};
 const OCCASION={
  win:{heading:"That was your moment.",message:"One incredible win. A thousand memories."},
  effort:{heading:"Look how far you've come.",message:"Growth is worth celebrating, on and off the court."},
  thanks:{heading:"Thanks for believing.",message:"Great coaches make room for everyone to grow."},
  birthday:{heading:"It's your game day.",message:"Wishing you a season of joy, friends and discovery."},
  team:{heading:"Better together.",message:"A team is built one act of kindness at a time."},
  comeback:{heading:"Your story isn't over.",message:"You kept going. That's something to celebrate."},
  season:{heading:"A season to remember.",message:"The best moments live beyond the final score."}
 };
 const ROADMAP=[
  {title:"Sponsor activation ledger",priority:"Next",detail:"Approval and date-based ad publication, checkout reconciliation, refunds and evidence."},
  {title:"Premium personalized moment",priority:"Next",detail:"Optional original PDF keepsake delivered only after verified payment."},
  {title:"Team license storefront",priority:"Next",detail:"Separate group licensing for original digital giftables; no assumed personal-use redistribution."},
  {title:"Game-day QR surprises",priority:"Test",detail:"QR fan dedication experience for youth clubs and family events with consent."},
  {title:"Licensed live scores",priority:"License gate",detail:"Use a commercial sports data provider with explicit publisher rights and secure server-side cache."},
  {title:"Own-footage highlight studio",priority:"Rights gate",detail:"Only user-licensed media; strong privacy, moderation and minors' safeguards."},
  {title:"Sponsor performance dashboard",priority:"After traffic",detail:"Opt-in, privacy-preserving counts of real public impressions/clicks, no invented views."},
  {title:"Affiliate sports gear",priority:"Agreement gate",detail:"Licensed merchant programs and disclosed commissions; no self-created referral earnings."},
  {title:"Club operations subscription",priority:"Buyer gate",detail:"Prove the first paid Revenue Recovery pilot before recurring automation."},
  {title:"Fan-to-team community challenges",priority:"Pilot",detail:"Original weekly participation cards and verified organizer partnerships."}
 ];
 const RECOMMENDED={
  thanks:["coach-appreciation","coach-practice","coach-session-cards","coach-team-bundle"],
  birthday:["basketball-party","hoop-gift-cards","basketball-dreambook","family-sports-night"],
  win:["basketball-iq","season-keepsake","team-culture","basketball-ultimate"],
  season:["season-keepsake","coach-season","basketball-scorekeeper"],
  comeback:["practice-progress","athlete-mindset-kids","athlete-mindset-teens"],
  effort:["practice-progress","athlete-mindset-kids","young-athlete-bundle"],
  team:["team-culture","captain-leadership","coach-team-bundle"]
 };
 const CATEGORY={
  basketball:["basketball","hoop","point guard","defens","offens","film","three-on-three","rookie","practice","coach","sports"],
  soccer:["soccer","multi-sport","all-sports"],
  coach:["coach","practice","session","film","team","defense","offense","scout"],
  athlete:["athlete","confidence","mindset","journal","practice","rookie","young","girl","captain"],
  team:["team","family","season","party","coach","bundle","collection","sports"]
 };
 function validHttps(value,allowlist){
  try{const x=new URL(value);return x.protocol==="https:"&&(!allowlist||allowlist.has(x.hostname))?x.href:null}catch{return null}
 }
 const allowedCheckoutHosts=new Set(["buy.stripe.com","checkout.stripe.com","book.stripe.com"]);
 const money=c=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(c/100);
 function products(catalogs,links){
  const out=[],seen=new Set();
  for(const catalog of catalogs){for(const p of catalog?.products||[]){
    if(!p||typeof p.sku!=="string"||seen.has(p.sku))continue;
    const checkout=validHttps(links?.[p.sku],allowedCheckoutHosts);
    if(!checkout||!Number.isInteger(p.price)||p.price<0)continue;
    seen.add(p.sku);out.push({...p,checkout});
  }}
  return out;
 }
 function filterProducts(all,{query="",category="all",sort="recommended",occasion="win",sport="basketball"}={}){
   const q=String(query).toLowerCase().trim();
   const preferred=RECOMMENDED[occasion]||[];
   const matched=all.filter(p=>{
     const hay=[p.name,p.description,p.age,p.category,p.sku].filter(Boolean).join(" ").toLowerCase();
     const fits=!q||hay.includes(q);
     if(!fits)return false;
     if(category==="all")return true;
     return CATEGORY[category]?.some(token=>hay.includes(token))||false;
   });
   const relevance=p=>{
     const name=(p.name+" "+p.sku).toLowerCase(),sportScore=token=>name.includes(token)?1:0;
     return (preferred.includes(p.sku)?50-preferred.indexOf(p.sku):0)+(sport==="soccer"?sportScore("soccer")*20:sport==="basketball"?sportScore("basketball")*20:0)+(p.kind==="bundle"?4:0);
   };
   matched.sort((a,b)=>{
     if(sort==="low")return a.price-b.price||a.name.localeCompare(b.name);
     if(sort==="high")return b.price-a.price||a.name.localeCompare(b.name);
     if(sort==="title")return a.name.localeCompare(b.name);
     return relevance(b)-relevance(a)||a.name.localeCompare(b.name);
   });
   return matched;
 }
 function cleanMoment(raw){
   const sport=ICON[raw?.sport]?raw.sport:"basketball";
   const occasion=OCCASION[raw?.occasion]?raw.occasion:"win";
   const safe=(x,max)=>String(x||"").replace(/<[^>]*>/g,"").replace(/[<>]/g,"").replace(/[\r\n\t]+/g," ").trim().slice(0,max);
   return {sport,occasion,recipient:safe(raw?.recipient,48),from:safe(raw?.from,48),message:safe(raw?.message,145)};
 }
 function momentText(m){
   const fallback=OCCASION[m.occasion];
   return {icon:ICON[m.sport],title:m.recipient?m.recipient+", "+fallback.heading:fallback.heading,message:m.message||fallback.message,from:m.from?"FROM "+m.from.toLocaleUpperCase():"APERTURE · AN ORIGINAL FAN GIFT"};
 }
 function encodeMoment(moment){
   return "#m="+encodeURIComponent(JSON.stringify(cleanMoment(moment)));
 }
 function decodeMoment(hash){
   if(typeof hash!=="string"||!hash.startsWith("#m=")||hash.length>1100)return null;
   try{let obj=JSON.parse(decodeURIComponent(hash.slice(3)));if(!obj||typeof obj!=="object"||Array.isArray(obj))return null;return cleanMoment(obj)}catch{return null}
 }
 function approvedPlacements(items,now){
   if(!Array.isArray(items))return [];
   return items.filter(p=>{
     if(!p||!["community","moment","presenter"].includes(p.surface))return false;
     if(!p.approved||!p.payment_verified||!p.approval_ref)return false;
     if(!p.starts_at||!p.ends_at)return false;
     const start=Date.parse(p.starts_at),end=Date.parse(p.ends_at);
     if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||now<start||now>=end)return false;
     if(!validHttps(p.url))return false;
     if(typeof p.name!=="string"||p.name.length>60||typeof p.headline!=="string"||p.headline.length>65||typeof p.description!=="string"||p.description.length>170)return false;
     return true;
   });
 }
 const API={LEAGUES,OCCASION,ROADMAP,products,filterProducts,cleanMoment,momentText,encodeMoment,decodeMoment,approvedPlacements,validHttps,money};
 if(typeof module!=="undefined"&&module.exports)module.exports=API;
 if(!root.document)return;
 const doc=root.document,$=id=>doc.getElementById(id),h=(tag,txt,cls)=>{const el=doc.createElement(tag);if(txt!==undefined)el.textContent=String(txt);if(cls)el.className=cls;return el;};
 const catalog=products([root.APERTURE_GIFT_LAB_SPORTS,root.APERTURE_GIFT_LAB_BASKETBALL,root.APERTURE_GIFT_LAB_BASKETBALL_EXTRA],root.APERTURE_GIFT_CHECKOUT||{});
 const ads=root.APERTURE_SPORTS_ADS||{packages:[],placements:[]};
 let currentMoment=decodeMoment(root.location.hash)||cleanMoment({sport:"basketball",occasion:"win"});
 const byName=new Map(catalog.map(p=>[p.sku,p]));
 const suggestion=()=>RECOMMENDED[currentMoment.occasion]?.find(x=>byName.has(x))||"";
 function makeAnchor(url,label,cls){
  const a=h("a",label,cls||"button small");a.href=url;a.rel="noopener noreferrer";if(/^https:\/\//.test(url))a.target="_blank";return a;
 }
 function displayLeagues(filter){
  const container=$("league-cards");container.replaceChildren();
  for(const lg of LEAGUES.filter(x=>filter==="all"||x.sport===filter)){
    const card=h("article",undefined,"panel featurecard"),ico=h("div",lg.icon);ico.className="icon";
    card.append(ico,h("div","LIVE RESULTS / OFFICIAL SOURCE","label"),h("h3",lg.name),h("p",lg.detail),makeAnchor(lg.url,"Open official scoreboard ↗"));
    container.append(card);
  }
 }
 function chooseLeague(filter){
  for(const b of doc.querySelectorAll("[data-league]"))b.setAttribute("aria-pressed",String(b.dataset.league===filter));displayLeagues(filter);
 }
 function applyMoment(m,writeUrl){
   currentMoment=cleanMoment(m);
   const view=momentText(currentMoment);
   $("sport").value=currentMoment.sport;$("occasion").value=currentMoment.occasion;
   $("recipient").value=currentMoment.recipient;$("from").value=currentMoment.from;$("message").value=currentMoment.message;
   $("moment-icon").textContent=view.icon;$("moment-title").textContent=view.title;$("moment-message").textContent=view.message;$("moment-from").textContent=view.from;
   $("moment-preview").setAttribute("aria-label","Original fan gift: "+view.title+" "+view.message);
   const product=byName.get(suggestion());
   $("moment-offer").replaceChildren();
   if(product){$("moment-offer").append(h("span","Matching original gift: "+product.name+" · "+money(product.price)+" · "),makeAnchor(product.checkout,"View checkout ↗",""))}
   else $("moment-offer").textContent="Explore our original sports gifts for a meaningful follow-up.";
   if(writeUrl)root.history.replaceState(null,"",root.location.pathname+root.location.search+encodeMoment(currentMoment));
   renderProducts();
 }
 function inputs(){return cleanMoment({sport:$("sport").value,occasion:$("occasion").value,recipient:$("recipient").value,from:$("from").value,message:$("message").value})}
 function momentUrl(){return root.location.origin+root.location.pathname+root.location.search+encodeMoment(currentMoment)}
 function productCard(p){
   const card=h("article",undefined,"panel product"),cover=h("div",p.emoji||"🎁","cover");
   cover.style.setProperty("--cover",typeof p.color==="string"&&/^#[0-9a-f]{3,8}$/i.test(p.color)?p.color:"#e3eadf");
   card.append(cover,h("div",p.kind==="bundle"?"DIGITAL COLLECTION":"DIGITAL ACTIVITY GIFT","label"),h("h3",p.name),h("p",p.description));
   const age=h("div",p.age+" · "+p.activityCount+" original activities","small");
   const bottom=h("div",undefined,"bottom"),price=h("strong",money(p.price),"price"),buy=makeAnchor(p.checkout,"Buy digital gift ↗","button small primary");
   buy.setAttribute("aria-label","Buy "+p.name+" with Stripe for "+money(p.price));
   bottom.append(price,buy);
   card.append(age,bottom,h("p","Public printables · Personal-use license · Not exclusive access","disclose"));
   return card;
 }
 function renderProducts(){
   const q=$("gift-search").value,category=$("gift-category").value,sort=$("gift-sort").value;
   const filtered=filterProducts(catalog,{query:q,category,sort,occasion:currentMoment.occasion,sport:currentMoment.sport});
   const container=$("gift-grid");container.replaceChildren();for(const p of filtered)container.append(productCard(p));
   $("gift-count").textContent=filtered.length+" of "+catalog.length+" existing paid digital sports gifts · Price shown in USD";
   $("catalog-count").textContent=catalog.length+" LINKED ORIGINAL GIFTS";
   $("gift-empty").hidden=filtered.length!==0;
 }
 function fillRoadmap(){
   const container=$("roadmap-cards");container.replaceChildren();
   for(const item of ROADMAP){const panel=h("article",undefined,"panel");
     panel.append(h("div",item.priority,"label"),h("h3",item.title),h("p",item.detail));container.append(panel)}
 }
 function sponsoredSlot(surface,host){
   const item=approvedPlacements(ads.placements,Date.now()).find(p=>p.surface===surface);
   const el=$(host);if(!el)return;el.replaceChildren();
   if(!item){
    el.append(h("span","OPEN SPONSOR PLACEMENT","adtag"),h("p","A family-safe brand could appear here after payment verification, creative approval and scheduling.","small"),makeAnchor("advertising.html","How sponsorship works","button small light"));
    return;
   }
   const link=makeAnchor(item.url,item.headline+" ↗","button small");
   link.rel="sponsored noopener noreferrer";
   el.append(h("span","ADVERTISEMENT / SPONSORED","adtag"),h("h3",item.name),h("p",item.description),link);
 }
 function displayAds(){
   const container=$("sponsor-products");container.replaceChildren();
   const packages=Array.isArray(ads.packages)?ads.packages:[];
   if(!packages.length){container.append(h("div","No verified advertising inventory available.","empty"));return;}
   for(const p of packages){
    const panel=h("article",undefined,"panel ad");
    panel.append(h("span","ADVERTISEMENT INVENTORY · ONE-TIME","adtag"),h("h3",p.name),h("p",p.description),h("div",money(p.price_cents),"price"),h("p","Subject to advertiser review and agreed scheduling; no guaranteed impressions, traffic or league endorsement.","small"));
    const buy=validHttps(p.checkout_url,allowedCheckoutHosts);
    if(buy)panel.append(makeAnchor(buy,"Purchase sponsor placement ↗","button primary"));
    else panel.append(makeAnchor("advertising.html","Advertising terms / contact","button light"));
    panel.append(makeAnchor("advertising.html","Terms & refunds","button small light"));container.append(panel);
   }
 }
 // Event wiring; any data in the URL fragment is intentionally user-controlled and is not transmitted to APERTURE.
 doc.querySelectorAll("[data-league]").forEach(b=>b.addEventListener("click",()=>chooseLeague(b.dataset.league)));
 $("moment-form").addEventListener("submit",e=>{e.preventDefault();applyMoment(inputs(),true);$("moment-feedback").textContent="Created locally. Ready to share—no personal details are sent to APERTURE."});
 ["sport","occasion","recipient","from","message"].forEach(id=>$(id).addEventListener("input",()=>applyMoment(inputs(),false)));
 $("surprise").addEventListener("click",()=>{const occasions=Object.keys(OCCASION),sports=Object.keys(ICON);const oc=occasions[Math.floor(Math.random()*occasions.length)],sp=sports[Math.floor(Math.random()*sports.length)];applyMoment({sport:sp,occasion:oc,recipient:"The MVP",from:"Someone cheering for you",message:""},true);$("moment-feedback").textContent="Surprise moment ready. No data sent."});
 $("reset-moment").addEventListener("click",()=>{applyMoment({sport:"basketball",occasion:"win"},true);$("moment-feedback").textContent="Moment reset."});
 $("copy-moment").addEventListener("click",async()=>{applyMoment(inputs(),true);try{await root.navigator.clipboard.writeText(momentUrl());$("moment-feedback").textContent="Link copied. It includes any names or message you entered."}catch{$("moment-feedback").textContent="Clipboard unavailable; copy this page's address manually."}});
 $("share-moment").addEventListener("click",async()=>{applyMoment(inputs(),true);const url=momentUrl();if(typeof root.navigator.share==="function"){try{await root.navigator.share({title:"An original APERTURE sports moment",text:momentText(currentMoment).title,url});$("moment-feedback").textContent="Share sheet opened."}catch{$("moment-feedback").textContent="Share canceled or unavailable."}}else{try{await root.navigator.clipboard.writeText(url);$("moment-feedback").textContent="Share link copied. You choose whom to send it to."}catch{$("moment-feedback").textContent="Copy this page's full address to share."}}});
 $("save-moment").addEventListener("click",()=>{applyMoment(inputs(),false);root.print()});
 ["gift-search","gift-category","gift-sort"].forEach(id=>$(id).addEventListener("input",renderProducts));
 root.addEventListener("hashchange",()=>{const restored=decodeMoment(root.location.hash);if(restored)applyMoment(restored,false)});
 // Sponsor placeholders: no sponsor is represented without proof of an approved, paid, time-bounded placement.
 const hero=doc.querySelector(".hero .shell");const heroSlot=h("aside",undefined,"panel ad");heroSlot.id="hero-sponsor-slot";heroSlot.style.marginTop="19px";hero.append(heroSlot);
 const momentContainer=$("moment-preview").parentElement;const momentSlot=h("aside",undefined,"panel ad");momentSlot.id="moment-sponsor-slot";momentSlot.style.marginTop="12px";momentContainer.append(momentSlot);
 const sponsorSection=$("sponsor-products");const communitySlot=h("aside",undefined,"panel ad");communitySlot.id="community-sponsor-slot";communitySlot.style.marginTop="14px";sponsorSection.after(communitySlot);
 const presentingSlot=h("aside",undefined,"panel ad");presentingSlot.id="presenter-sponsor-slot";presentingSlot.style.marginTop="14px";communitySlot.after(presentingSlot);
 chooseLeague("all");fillRoadmap();displayAds();sponsoredSlot("presenter","hero-sponsor-slot");sponsoredSlot("presenter","presenter-sponsor-slot");sponsoredSlot("community","community-sponsor-slot");sponsoredSlot("moment","moment-sponsor-slot");applyMoment(currentMoment,false);
})(typeof globalThis!=="undefined"?globalThis:this);