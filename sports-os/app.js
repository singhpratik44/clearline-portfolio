"use strict";
/*
 * APERTURE SPORTS / Career OS
 * Deterministic public demonstration. Career data is illustrative, not verified
 * as current hiring, licensing guidance, medical advice or compensation.
 * No network calls, external AI model, data persistence, mail or payments.
 */
(function(){
  const roleData = {
    coach: {
      label: "Coaching",
      stages: [
        {short:"Coach",name:"Youth / assistant coach",year:"NOW · FOUNDATION",description:"Create an inclusive, safe practice environment and develop a repeatable coaching philosophy.",skills:["Practice design","Communication","Player safety","Feedback loops"],gate:"Verify applicable safeguarding, background-screening, facility and league requirements before working with minors.",tasks:["Review applicable league safety policies; draft your coaching philosophy and scope of practice.","Build and pilot two age-appropriate sessions with permission and supervision.","Document session feedback, adjustments and a coaching portfolio sample."]},
        {short:"Lead coach",name:"Lead coach / program coordinator",year:"ILLUSTRATIVE · YEAR 1+",description:"Coordinate a season, develop assistant coaches and establish consistent player-development evidence.",skills:["Season planning","Staff coaching","Parent communication","Player progression"],gate:"Evidence of approved coaching experience, safe supervision and program-specific eligibility.",tasks:["Map a season plan, practice progression and coach responsibilities.","Pilot a training cycle with trackable developmental goals.","Collect consented feedback and present a season-retrospective report."]},
        {short:"Head coach",name:"Head coach / program director",year:"ILLUSTRATIVE · YEARS 2–3+",description:"Own program standards, tactical identity, player development and staff routines.",skills:["Team culture","Game analysis","Staff leadership","Program evaluation"],gate:"Validate leadership outcomes, policy compliance and the actual qualification requirements of any target program.",tasks:["Define a technical identity and staff decision rights.","Run a player-development audit using authorized, non-sensitive evidence.","Publish a 90-day program improvement thesis with measurable outcomes."]},
        {short:"Director",name:"Director of coaching",year:"ILLUSTRATIVE · YEARS 4–6+",description:"Lead multiple teams and coaches, standardize quality and manage organization-wide development.",skills:["Coach education","Quality assurance","Budgeting","Multi-team operations"],gate:"Confirm hiring authority, employment eligibility and actual organizational leadership requirements.",tasks:["Audit coach development and program consistency.","Model staffing, retention and coaching-quality interventions.","Present a scoped pilot with owner, approval gates and success metrics."]},
        {short:"Executive",name:"Athletic program executive",year:"ILLUSTRATIVE · YEAR 7+",description:"Lead the operating model, coaching leadership, partnerships and accountable long-term program growth.",skills:["Executive operations","Partnerships","Governance","Financial stewardship"],gate:"Senior roles vary widely; verify requisitions, experience criteria and financial responsibility independently.",tasks:["Map organization goals to evidence-backed operating metrics.","Design governance for coaching, athlete welfare and partner accountability.","Prepare an executive case study and independently verify target positions."]}
      ]
    },
    mental: {
      label:"Mental performance",
      stages:[
        {short:"Explore",name:"Mental performance explorer",year:"NOW · EXPLORATION",description:"Learn the distinction between general mental skills education and licensed clinical psychology.",skills:["Ethics","Communication","Research literacy","Boundaries"],gate:"Do not market clinical psychological services or use protected titles without the requisite licensure.",tasks:["Review official professional scope and ethics sources for your location.","Study evidence-based mental skills education without making treatment claims.","Create an educational resource clearly labeled non-clinical."]},
        {short:"Study",name:"Mental skills trainee",year:"ILLUSTRATIVE · YEAR 1+",description:"Build relevant education, supervised experience and a documented professional scope.",skills:["Goal-setting","Reflective practice","Supervision","Referral boundaries"],gate:"Check current official certification prerequisites and requirements; this demo does not determine eligibility.",tasks:["Compare verified training and supervision pathways.","Draft a consultation-boundaries and referral protocol for qualified review.","Build an educational workshop and collect non-clinical feedback."]},
        {short:"Practice",name:"Qualified mental performance consultant",year:"ILLUSTRATIVE · YEARS 2–3+",description:"Deliver mental performance education only within verified qualifications, consent and organizational policies.",skills:["Performance routines","Group facilitation","Consent","Outcome reflection"],gate:"Any credential claim (including CMPC) must be independently checked with the credentialing body.",tasks:["Prepare evidence for credential and professional-scope review.","Design a consent-aware non-clinical workshop.","Use aggregate feedback to refine the workshop, without health profiles."]},
        {short:"Lead",name:"Performance program lead",year:"ILLUSTRATIVE · YEARS 4–6+",description:"Coordinate education, referrals and professional support pathways inside a sports organization.",skills:["Program design","Qualified referrals","Team education","Privacy governance"],gate:"Clinical support must remain under appropriately licensed professionals and independent protocols.",tasks:["Map professional duties, referrals and restricted data boundaries.","Pilot a mental skills education series with qualified oversight.","Document a reviewed evidence and escalation framework."]},
        {short:"Director",name:"Director of performance services",year:"ILLUSTRATIVE · YEAR 7+",description:"Lead interdisciplinary services with clear clinical, training, licensing and privacy boundaries.",skills:["Interdisciplinary leadership","Risk controls","Program quality","Budgeting"],gate:"Do not assume clinical authority from an organizational title; verify each jurisdiction and role.",tasks:["Design an interdisciplinary service charter and governance process.","Define consent, referrals and clinical separation with licensed experts.","Present a verified-impact scorecard with only authorized aggregate data."]}
      ]
    },
    scout:{
      label:"Scouting & analysis",
      stages:[
        {short:"Analyst",name:"Video & performance analyst",year:"NOW · FOUNDATION",description:"Build a reproducible approach to film annotation and evidence-based player evaluation.",skills:["Film tagging","Data provenance","Basketball IQ","Reporting"],gate:"Secure permission to use film and respect league licensing, copyright and player privacy.",tasks:["Create a transparent scouting rubric and tagging taxonomy.","Annotate footage you have rights to use or use synthetic examples.","Publish a sample report with explicit uncertainty and limitations."]},
        {short:"Scout",name:"Regional / developmental scout",year:"ILLUSTRATIVE · YEAR 1+",description:"Observe players and produce consistent comparisons without overclaiming outcomes.",skills:["Talent observation","Context analysis","Report calibration","Ethics"],gate:"Verify access permissions, youth safeguarding and the actual requirements of any position.",tasks:["Build a standardized evaluation form and comparison controls.","Evaluate a small set of permissioned or fictional cases.","Compare predictions against follow-up evidence and document limitations."]},
        {short:"Lead scout",name:"Lead scout / analytics manager",year:"ILLUSTRATIVE · YEARS 2–3+",description:"Improve the team's scouting process, analyst quality and traceability of decisions.",skills:["Scouting leadership","Decision analysis","Data quality","Film operations"],gate:"Evaluation models must expose bias, conflicts, uncertainty and source rights.",tasks:["Audit evidence provenance and repeatability of scouting grades.","Test an alternative weighted rubric on fictional data.","Present an evidence-led decision memo with tradeoffs."]},
        {short:"Director",name:"Director of scouting",year:"ILLUSTRATIVE · YEARS 4–6+",description:"Coordinate regional pipelines, decision rights and multi-source talent assessments.",skills:["Talent pipeline","Organizational strategy","Stakeholder alignment","Recruitment governance"],gate:"Confirm league-specific eligibility, conflicts, data restrictions and access controls.",tasks:["Map scouting roles and evaluation handoffs.","Simulate recruiting priorities with constrained resources.","Prepare an executive talent-pipeline brief using authorized evidence."]},
        {short:"Personnel",name:"Player personnel executive",year:"ILLUSTRATIVE · YEAR 7+",description:"Connect talent decisions with long-term roster strategy and organizational accountability.",skills:["Roster strategy","Budget tradeoffs","Executive communication","Governance"],gate:"Professional roster, contract and labor decisions require specialized legal and league review.",tasks:["Define a decision register with ownership and review checkpoints.","Model roster scenarios with purely synthetic inputs.","Publish a strategic personnel portfolio without confidential data."]}
      ]
    },
    ops:{
      label:"Sports operations",
      stages:[
        {short:"Coordinator",name:"Team / program coordinator",year:"NOW · FOUNDATION",description:"Learn scheduling, participant support, logistics and safe operational execution.",skills:["Scheduling","Communication","Compliance","Measurement"],gate:"Verify organizational access, safeguarding protocols and job-specific operational requirements.",tasks:["Map an end-to-end participant or event workflow.","Build a schedule and exception-handling procedure.","Document bottlenecks and a low-risk improvement proposal."]},
        {short:"Manager",name:"Operations manager",year:"ILLUSTRATIVE · YEAR 1+",description:"Own reliable delivery across coaches, facilities, participants and partner expectations.",skills:["Staff planning","Incident response","Facilities","Service quality"],gate:"Budget and safety decisions must be approved by the real organization.",tasks:["Model weekly capacity and coach allocation.","Propose a consent-aware operational scorecard.","Run a small authorized process improvement and document results."]},
        {short:"Director",name:"Athletic / program director",year:"ILLUSTRATIVE · YEARS 2–3+",description:"Build sustainable programs with measurable service standards, retention and staff development.",skills:["Program P&L","Coach development","Partnerships","Quality assurance"],gate:"Verify actual financial accountability and qualification requirements for director roles.",tasks:["Create a program-level operating thesis with assumptions labeled.","Set measurable goals for safety, staffing and satisfaction.","Develop a 90-day pilot plan with approval checkpoints."]},
        {short:"GM",name:"Club general manager",year:"ILLUSTRATIVE · YEARS 4–6+",description:"Balance facility constraints, staffing, community value and financial sustainability.",skills:["Unit economics","Commercial strategy","Leadership","Risk management"],gate:"Commercial authority, data permissions and partner rights must be confirmed before external representations.",tasks:["Build an ethical pricing and capacity scenario.","Identify evidence-backed operational improvements.","Prepare a contract-ready scope of work and escalation map."]},
        {short:"Executive",name:"Sports operations executive",year:"ILLUSTRATIVE · YEAR 7+",description:"Lead multiple programs and strategic partnerships with clear ownership and verifiable impact.",skills:["Portfolio strategy","Enterprise governance","Financial controls","Partnership negotiation"],gate:"Executive advancement is highly variable; do not infer offers, earnings or authorization from this simulation.",tasks:["Design an organization-level strategy and decision ledger.","Build a multi-site operating model with transparent assumptions.","Present a board-level evidence pack for qualified review."]}
      ]
    }
  };

  const careerSvg = document.getElementById("career-graph");
  const roleButtons = Array.from(document.querySelectorAll("[data-role]"));
  const state = {role:"coach",stage:0,evidence:[],practice:[]};
  const YEARS = ["NOW","YEAR 1+","YEARS 2–3+","YEARS 4–6+","YEAR 7+"];
  const el = id => document.getElementById(id);
  const svgNS = "http://www.w3.org/2000/svg";
  const createSvg = (tag, attrs) => {
    const n = document.createElementNS(svgNS, tag);
    Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
    return n;
  };

  function setRole(role){
    if(!Object.prototype.hasOwnProperty.call(roleData,role)) return;
    state.role = role; state.stage = 0; el("time").value="0";
    roleButtons.forEach(b => {
      const active = b.dataset.role===role;
      b.classList.toggle("active",active);
      b.setAttribute("aria-pressed",String(active));
    });
    render();
  }
  function setStage(stage){
    state.stage = Math.max(0,Math.min(4,Number(stage)||0));
    el("time").value=String(state.stage);
    render();
  }
  function buildGraph(){
    careerSvg.replaceChildren(createSvg("title",{}));
    careerSvg.querySelector("title").textContent=roleData[state.role].label+" career pathway";
    const stages=roleData[state.role].stages;
    stages.forEach((s,i)=>{
      if(i===4)return;
      careerSvg.appendChild(createSvg("line",{x1:100+i*190,y1:103,x2:100+(i+1)*190,y2:103,class:"edge"+(i<state.stage?" passed":"")}));
    });
    stages.forEach((s,i)=>{
      const x=100+i*190;
      const grp=createSvg("g",{class:"node"+(i===state.stage?" active":i<state.stage?" passed":""),role:"button",tabindex:"0","aria-label":"Choose stage "+(i+1)+": "+s.name,"aria-pressed":String(i===state.stage)});
      grp.appendChild(createSvg("circle",{cx:x,cy:103,r:i===state.stage?31:26}));
      const number=createSvg("text",{x,y:109,"text-anchor":"middle"});
      number.textContent=String(i+1).padStart(2,"0");
      grp.appendChild(number);
      grp.addEventListener("click",()=>setStage(i));
      grp.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setStage(i)}});
      careerSvg.appendChild(grp);
      const label=createSvg("text",{x,y:166,"text-anchor":"middle",class:"label"+(i===state.stage?" selected":"")});
      label.textContent=s.short;
      careerSvg.appendChild(label);
      const year=createSvg("text",{x,y:193,"text-anchor":"middle",class:"label"});
      year.textContent=YEARS[i];
      careerSvg.appendChild(year);
    });
  }
  function renderStage(){
    const s=roleData[state.role].stages[state.stage];
    el("stage-count").textContent=String(state.stage+1).padStart(2,"0")+" / 05";
    el("time-output").textContent=YEARS[state.stage];
    el("stage-year").textContent=s.year;
    el("stage-name").textContent=s.name;
    el("stage-description").textContent=s.description;
    el("stage-gate").textContent=s.gate;
    const container=el("stage-skills");container.replaceChildren();
    s.skills.forEach(skill=>{const n=document.createElement("span");n.className="skill";n.textContent=skill;container.appendChild(n)});
  }
  function selectedPlan(){
    const s=roleData[state.role].stages[state.stage];
    const background=el("background").selectedOptions[0].textContent;
    const sport=el("sport").value;
    const weekly=Number(el("hours").value);
    return {
      lane:roleData[state.role].label,
      milestone:s.name,
      background,
      sport,
      weekly,
      tasks:s.tasks,
      gate:s.gate,
      estimate:"Illustrative, not a hiring or qualification guarantee"
    };
  }
  function renderPlan(){
    const p=selectedPlan();
    el("plan-title").textContent=p.lane+" · "+p.milestone;
    const grid=el("plan-grid");grid.replaceChildren();
    ["DAYS 01–30","DAYS 31–60","DAYS 61–90"].forEach((phase,i)=>{
      const card=document.createElement("div");card.className="plan-step";
      const eyebrow=document.createElement("div");eyebrow.className="phase";eyebrow.textContent=phase;
      const title=document.createElement("strong");title.textContent=["Establish the foundation","Build the work","Prove and review"][i];
      const body=document.createElement("p");body.textContent=p.tasks[i];
      const foot=document.createElement("p");foot.style.marginTop="10px";foot.textContent="Budget ~"+(p.weekly*4)+" hours in this phase. Adjust to actual obligations.";
      card.append(eyebrow,title,body,foot);grid.appendChild(card);
    });
  }
  function render(){buildGraph();renderStage();renderPlan()}
  function planText(){
    const p=selectedPlan();let text="APERTURE SPORTS — 90-DAY DEVELOPMENT PLAN\n";
    text+="Generated from user selections; illustrative, not a credential, job offer or medical service.\n\n";
    text+="Lane: "+p.lane+"\nTarget: "+p.milestone+"\nBackground: "+p.background+"\nSport: "+p.sport+"\nWeekly time: "+p.weekly+" hours\n\n";
    ["Days 1–30","Days 31–60","Days 61–90"].forEach((s,i)=>{text+=s+" (~"+(p.weekly*4)+" hours)\n"+p.tasks[i]+"\n\n"});
    text+="Evidence/approval gate:\n"+p.gate+"\n\nVerify all credentials, job openings, affiliations and third-party permissions independently.\n";
    return text;
  }
  function download(name,content,mime){
    const blob=new Blob([content],{type:mime||"text/plain;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement("a");anchor.href=url;anchor.download=name;
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  async function copyPlan(){
    try{
      if(!navigator.clipboard)throw Error("unavailable");
      await navigator.clipboard.writeText(planText());
      el("plan-message").textContent="Copied. Review before sharing.";
    }catch(e){el("plan-message").textContent="Clipboard unavailable. Use Download development plan."}
  }

  const drills={
    decision:["Ball-handling and vision warm-up","Two-choice passing reads","Small-sided advantage decisions","3-on-3 constraints and resets","Reflection: name the read and next adjustment"],
    shooting:["Movement, balance and form warm-up","Spot shooting with process feedback","Catch-and-shoot decision circuits","Game-speed contested shot selection","Reflection: shot quality, not just makes"],
    defense:["Stance and recovery warm-up","Closeout technique with safe spacing","Help-and-recover decision practice","Shell defense with communication goals","Reflection: early talk and rotations"],
    movement:["Dynamic movement and spacing","Cut-and-replace footwork","Five-out passing and movement","Small-sided spacing constraints","Reflection: where and why space opened"]
  };
  function buildPractice(){
    const focus=el("focus").value;
    const duration=Number(el("duration").value);
    const age=el("age").value;
    const weights=[.15,.2,.2,.3,.15];
    const mins=weights.map(x=>Math.round(x*duration));
    mins[4]=duration-mins.slice(0,4).reduce((a,b)=>a+b,0);
    let start=0;
    state.practice=drills[focus].map((name,i)=>{
      const item={start,min:mins[i],name};
      start+=mins[i];return item;
    });
    const label=el("focus").selectedOptions[0].textContent.toLowerCase();
    el("practice-title").textContent=duration+"-minute "+label+" session";
    const list=el("practice-list");list.replaceChildren();
    state.practice.forEach(entry=>{
      const item=document.createElement("li");
      const time=document.createElement("time");time.textContent=entry.min+" min";
      const span=document.createElement("span");span.textContent=entry.name+" · Ages "+age;
      item.append(time,span);list.appendChild(item);
    });
  }
  function practiceText(){
    return "APERTURE SPORTS — SAMPLE PRACTICE\n"+el("practice-title").textContent+
      "\nIllustrative coaching template. Check supervision, accessibility and local safeguarding requirements.\n\n"+
      state.practice.map(x=>x.min+" minutes — "+x.name).join("\n")+
      "\n\nPlayer outcomes: observe decisions, give specific feedback, adapt the next session.\n";
  }
  function renderCapacity(){
    const staff=Number(el("staff").value), ratio=Number(el("ratio").value),sessions=Number(el("sessions").value);
    el("staff-value").textContent=String(staff);
    el("ratio-value").textContent=String(ratio);
    el("sessions-value").textContent=String(sessions);
    el("capacity").textContent=String(staff*ratio*sessions);
    el("staff-hours").textContent=String(staff*sessions);
  }
  function renderEvidence(){
    const container=el("evidence-list");container.replaceChildren();
    if(!state.evidence.length){
      const p=document.createElement("p");p.className="note";p.style.marginTop="16px";
      p.textContent="No evidence added. All entries begin as self-reported / unverified.";
      container.appendChild(p);return;
    }
    state.evidence.forEach(entry=>{
      const row=document.createElement("div");row.className="ledger-row";
      const detail=document.createElement("div");
      const title=document.createElement("strong");title.textContent=entry.label;
      const secondary=document.createElement("small");
      secondary.textContent="SELF-REPORTED / NOT VERIFIED"+(entry.url?" · "+entry.url:"");
      detail.append(title,secondary);
      const remove=document.createElement("button");remove.type="button";
      remove.textContent="Remove";remove.setAttribute("aria-label","Remove "+entry.label);
      remove.addEventListener("click",()=>{state.evidence=state.evidence.filter(x=>x.id!==entry.id);renderEvidence()});
      row.append(detail,remove);container.appendChild(row);
    });
  }

  roleButtons.forEach(b=>b.addEventListener("click",()=>setRole(b.dataset.role)));
  el("time").addEventListener("input",e=>setStage(e.target.value));
  ["background","sport","hours"].forEach(id=>el(id).addEventListener("change",renderPlan));
  el("download-plan").addEventListener("click",()=>download("aperture-sports-90-day-plan.txt",planText()));
  el("copy-plan").addEventListener("click",copyPlan);
  el("build-practice").addEventListener("click",buildPractice);
  el("download-practice").addEventListener("click",()=>download("aperture-sports-practice.txt",practiceText()));
  ["staff","ratio","sessions"].forEach(id=>el(id).addEventListener("input",renderCapacity));
  el("evidence-form").addEventListener("submit",e=>{
    e.preventDefault();
    if(state.evidence.length>=25){alert("Limit 25 session entries. Export or remove some entries.");return}
    const label=el("evidence-title").value.trim();
    const raw=el("evidence-link").value.trim();
    if(!label)return;
    let url="";
    if(raw){try{const parsed=new URL(raw);if(parsed.protocol!=="https:"){alert("Only https:// reference links are accepted.");return}url=parsed.href}catch(err){alert("Please enter a valid https:// reference link.");return}}
    state.evidence.push({id:Date.now()+"-"+Math.random().toString(36).slice(2,8),label,url,status:"self-reported-unverified",added_at:new Date().toISOString()});
    e.target.reset();renderEvidence();
  });
  el("export-ledger").addEventListener("click",()=>{
    const payload={product:"APERTURE SPORTS",version:1,disclaimer:"Self-reported session evidence; not independently verified",records:state.evidence};
    download("aperture-sports-evidence.json",JSON.stringify(payload,null,2),"application/json;charset=utf-8");
  });

  buildPractice();renderCapacity();renderEvidence();render();
})();