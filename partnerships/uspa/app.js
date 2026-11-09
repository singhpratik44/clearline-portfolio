/* APERTURE Athlete Partnership Lab — independent, public demonstration.
   No network requests or real student data. Browser-local operator workspace only. */
(() => {
  "use strict";
  const BASE = "aperture-uspa-v1";
  const STAGES = ["Research", "Contact ready", "Introduced", "Meeting", "Qualified referral", "Enrolled"];
  const stageOrder = Object.fromEntries(STAGES.map((name, i) => [name, i]));
  const samplePartners = [
    { id:"demo-1", org:"Example Coastal Basketball Club", sport:"Basketball", region:"Orange County", fit:"Team travel creates scheduling questions", stage:"Research", demo:true },
    { id:"demo-2", org:"Example Pacific Swim Academy", sport:"Swimming", region:"Southern California", fit:"Early morning training and national competitions", stage:"Contact ready", demo:true },
    { id:"demo-3", org:"Example Southland Soccer Academy", sport:"Soccer", region:"Los Angeles County", fit:"Families evaluating flexible school models", stage:"Introduced", demo:true },
    { id:"demo-4", org:"Example Regional Tennis Center", sport:"Tennis", region:"California", fit:"Travel-intensive competitions", stage:"Research", demo:true }
  ];
  const PILOT = [
    { title:"Agree on scope", tasks:["Confirm Manny's preferred referral arrangement and audience", "Approve co-branding and communication language (if any)", "Specify consent, eligibility, attribution, and referral handoff", "Agree on compensation terms or document that no fee is promised"] },
    { title:"Build infrastructure", tasks:["Verify 25 potential organizations against public sources", "Document each organization's actual need before outreach", "Review referral email, partner one-pager, and family FAQ", "Establish admissions handoff and monthly reporting owner"] },
    { title:"Run a controlled pilot", tasks:["Get approval before contacting any organization on USPA's behalf", "Prioritize warm connections and qualified partner conversations", "Direct interested families to authorized admissions staff", "Record de-identified stage counts, not student records"] },
    { title:"Review the evidence", tasks:["Reconcile introductions against mutually confirmed activity", "Review consent, response quality, friction, and drop-off", "Decide whether to stop, repeat, or expand", "Consider paid software work only after a demonstrated need"] }
  ];
  const scenarios = {
    standard: { title:"Standard training week", hours:[56,25,14,10,14,49], guidance:"In this model, the learner has a stable training routine. Academic blocks remain protected; any school-specific expectations must be confirmed with actual educators, not guessed by the tool.", rows:[["Mon","Coursework focus","3–5 PM"],["Tue","Training + review","4–7 PM"],["Wed","Coursework / coach check-in","2–5 PM"],["Thu","Training + recovery","4–7 PM"],["Fri","Assignments / planning","2–5 PM"],["Weekend","Competition and flexible study","Varies"]] },
    travel: { title:"Tournament / travel week", hours:[56,23,14,22,14,39], guidance:"Travel increases load. Move flexible work only with authorized academic guidance; check connectivity, time zones, fatigue, and whether deadlines can actually change.", rows:[["Mon","Front-load essential coursework","2–5 PM"],["Tue","Training + travel prep","4–7 PM"],["Wed","Travel block / offline work","Varies"],["Thu","Tournament + short review","Varies"],["Fri","Tournament / recovery","Varies"],["Weekend","Travel home + reset","Varies"]] },
    exam: { title:"Assessment week", hours:[56,35,9,8,14,46], guidance:"This scenario allocates more study time and less training. Check actual assessment dates, accommodations, and coach approval rather than assuming the student can reschedule obligations.", rows:[["Mon","Focused preparation","2–6 PM"],["Tue","Assessment preparation","2–6 PM"],["Wed","Assessment / recovery","Varies"],["Thu","Light training","5–6 PM"],["Fri","Review and submissions","2–5 PM"],["Weekend","Recovery + next-week planning","Varies"]] }
  };
  const categories = [
    ["Sleep", "#d2e67d"],["Academic focus","#f3ac6c"],["Training","#89b7aa"],["Travel","#8895bf"],["Meals / recovery","#d7a1ac"],["Other / flexible","#576567"]
  ];
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const storage = (() => { try { const key = BASE + "-probe"; localStorage.setItem(key,"1"); localStorage.removeItem(key); return localStorage; } catch(_) { return null; } })();
  function read(key, fallback) { if(!storage) return fallback; try { const value = JSON.parse(storage.getItem(BASE + ":" + key)); return value == null ? fallback : value; } catch(_) { return fallback; } }
  function write(key, value) { if(!storage) return; try { storage.setItem(BASE + ":" + key, JSON.stringify(value)); } catch(_) { toast("Storage unavailable; export your work."); } }
  const stored = read("partners",[]);
  let partners = [...samplePartners, ...(Array.isArray(stored) ? stored.filter(p => p && !p.demo && typeof p.org === "string").map(p => ({...p, stage:STAGES.includes(p.stage)?p.stage:"Research"})) : [])];
  let checks = read("checks",{});
  if(!checks || typeof checks !== "object" || Array.isArray(checks)) checks = {};
  let activeDoc = "email";
  let toastTimer;
  function toast(message) { const el = $("#toast"); if(!el) return; el.textContent = message; el.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"),2700); }
  function go(view) {
    if(!["overview","network","athlete","kit","pilot"].includes(view)) return;
    $$("[data-panel]").forEach(panel => panel.hidden = panel.dataset.panel !== view);
    $$("[data-view]").forEach(button => { const active=button.dataset.view===view; button.classList.toggle("active",active); if(active) button.setAttribute("aria-current","page"); else button.removeAttribute("aria-current"); });
    const url = new URL(location.href); url.hash = view; history.replaceState(null,"",url);
    $("#main").scrollIntoView({behavior:"smooth",block:"start"});
  }
  $$("[data-view]").forEach(b => b.addEventListener("click",()=>go(b.dataset.view)));
  $$("[data-go]").forEach(b => b.addEventListener("click",()=>go(b.dataset.go)));
  function metrics() {
    const actual=partners.filter(p=>!p.demo);
    return { researched: actual.length, contact:actual.filter(p=>stageOrder[p.stage]>=1).length, introductions:actual.filter(p=>stageOrder[p.stage]>=2).length, meetings:actual.filter(p=>stageOrder[p.stage]>=3).length, referrals:actual.filter(p=>stageOrder[p.stage]>=4).length, enrolled:actual.filter(p=>stageOrder[p.stage]>=5).length };
  }
  function renderMetrics() {
    const m=metrics();
    const items=[["ORGANIZATIONS ADDED",m.researched],["CONTACT READY +",m.contact],["INTRODUCED +",m.introductions],["MEETING +",m.meetings]];
    const root=$("#stats"); root.replaceChildren();
    items.forEach(([name,value])=>{const el=document.createElement("div");el.className="metric";const a=document.createElement("p");a.className="overline";a.textContent=name;const b=document.createElement("strong");b.textContent=String(value).padStart(2,"0");const c=document.createElement("span");c.textContent="Operator-entered · not independently verified";el.append(a,b,c);root.append(el);});
    $("#kpi-research").textContent=m.researched+" non-demo recorded";
    $("#kpi-meeting").textContent=m.meetings+" stage-reached (not verified)";
    $("#kpi-referral").textContent=m.referrals+" stage-reached (not verified)";
  }
  function label(tag,text,cls) { const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=text;return el; }
  function renderNetwork() {
    const filter=$("#stage-filter").value;
    const list=partners.filter(p=>filter==="all"||p.stage===filter);
    const body=$("#network-rows");body.replaceChildren();
    for(const p of list) {
      const tr=document.createElement("tr");
      const org=document.createElement("td");org.append(label("strong",p.org),label("small",p.region+(p.demo?" • EXAMPLE ONLY":" • local workspace")));
      const sport=label("td",p.sport);
      const stage=document.createElement("td"), sel=document.createElement("select");sel.className="stage";sel.setAttribute("aria-label","Stage for "+p.org);
      STAGES.forEach(s=>{const opt=document.createElement("option");opt.textContent=s;opt.value=s;sel.append(opt);});
      sel.value=p.stage;sel.addEventListener("change",()=>{p.stage=sel.value;savePartners();renderMetrics();toast("Stage changed locally; not independently verified.");});stage.append(sel);
      const action=document.createElement("td"),btn=label("button","Remove","remove");btn.type="button";btn.setAttribute("aria-label","Remove "+p.org);btn.addEventListener("click",()=>{partners=partners.filter(item=>item.id!==p.id);savePartners();renderNetwork();renderMetrics();toast("Removed from local workspace.");});action.append(btn);
      tr.append(org,sport,stage,action);body.append(tr);
    }
    if(!list.length) {const tr=document.createElement("tr");const cell=label("td","No organizations match this stage. Add or select another filter.");cell.colSpan=4;tr.append(cell);body.append(tr);}
    $("#network-count").textContent=partners.filter(p=>!p.demo).length+" added / "+partners.filter(p=>p.demo).length+" example";
  }
  function savePartners() {write("partners",partners.filter(p=>!p.demo));}
  $("#partner-form").addEventListener("submit",e=>{
    e.preventDefault();
    const org=$("#org").value.trim().slice(0,80), region=$("#region").value.trim().slice(0,50);
    if(!org||!region) return toast("Provide organization and region.");
    if(partners.some(p=>p.org.toLowerCase()===org.toLowerCase()))return toast("Organization already listed.");
    const id = typeof crypto!=="undefined"&&crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+"-"+String(Math.floor(Math.random()*100000));
    partners.unshift({id,org,sport:$("#sport").value,region,fit:$("#fit").value.trim().slice(0,220),stage:"Research",demo:false});
    savePartners();$("#partner-form").reset();$("#stage-filter").value="all";renderNetwork();renderMetrics();toast("Organization added locally.");
  });
  $("#stage-filter").addEventListener("change",renderNetwork);
  function csvCell(value){return '"'+String(value??"").replace(/"/g,'""')+'"';}
  function download(content,filename,mime) {const blob=new Blob([content],{type:mime||"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $("#export-network").addEventListener("click",()=>{
    const rows=[["Organization","Sport","Region","Fit hypothesis","Stage","Demo"],...partners.map(p=>[p.org,p.sport,p.region,p.fit||"",p.stage,p.demo?"yes":"no"])];
    download(rows.map(row=>row.map(csvCell).join(",")).join("\r\n"),"aperture-partner-network.csv","text/csv;charset=utf-8");toast("CSV exported. Example records marked demo=yes.");
  });
  function renderAthlete(){
    const value=$("#scenario").value,c=scenarios[value]||scenarios.standard;
    $("#athlete-title").textContent=c.title;$("#scenario-guidance").textContent=c.guidance;
    const allocation=$("#allocation");allocation.replaceChildren();
    const old=$(".allocation-labels");if(old)old.remove();
    const legend=document.createElement("div");legend.className="allocation-labels";
    c.hours.forEach((hours,i)=>{const segment=document.createElement("div");segment.style.width=(hours/168*100)+"%";segment.style.background=categories[i][1];segment.title=categories[i][0]+": "+hours+" hours";allocation.append(segment);
      const item=document.createElement("span"),swatch=document.createElement("i");swatch.style.background=categories[i][1];item.append(swatch,document.createTextNode(categories[i][0]+": "+hours+"h"));legend.append(item);});
    allocation.insertAdjacentElement("afterend",legend);
    const schedule=$("#schedule");schedule.replaceChildren();
    c.rows.forEach(([day,task,time])=>{const row=document.createElement("div");row.className="schedule-row";row.append(label("strong",day),label("span",task),label("em",time));schedule.append(row);});
  }
  $("#scenario").addEventListener("change",renderAthlete);
  $("#export-schedule").addEventListener("click",()=>{
    const c=scenarios[$("#scenario").value],lines=["APERTURE • fictional student schedule",c.title,"",...categories.map(([name],i)=>name+": "+c.hours[i]+" hours/week"),"","Sample blocks:",...c.rows.map(row=>row.join(" — ")),"","Demonstration only. Verify all commitments with authorized adults and educators."];
    download(lines.join("\n"),"sample-athlete-schedule.txt");toast("Fictional schedule downloaded.");
  });
  function kitContext() {
    const org=$("#kit-org").value.trim()||"[PARTNER ORGANIZATION]", sport=$("#kit-sport").value;
    const needs={travel:"frequent travel and tournament commitments",training:"balancing training and coursework",transition:"families evaluating alternative school models","not-yet-known":"a need that we should first confirm together"};
    return {org,sport,need:needs[$("#kit-need").value]||needs.travel};
  }
  const kitBuilders={
    email:({org,sport,need})=>`SUBJECT: Exploring a student-athlete education conversation — ${org}

Hello ${org} team,

I work at the intersection of youth sports programs, STEM education leadership, and program operations. I'm reaching out to learn whether ${need} is a meaningful issue for your ${sport.toLowerCase()} families.

I'm independently exploring an athlete-education referral concept involving US Performance Academy (USPA), an online school that publicly describes flexible academic scheduling and Learning Coach support. I am not representing USPA, and no partnership or referral arrangement has been finalized.

If this need is relevant, would you be open to a brief discovery conversation? I'd first like to understand your families' actual constraints. Any future USPA introductions would follow an agreed referral process and the families' consent.

I can share a one-page overview and a short APERTURE workflow demonstration if useful.

Best,
Locane Singh
APERTURE / Clearline Group
Portfolio: https://singhpratik44.github.io/clearline-portfolio/

DRAFT — NOT SENT. Confirm details and authorization before use.`,
    onepager:({org,sport,need})=>`APERTURE / ATHLETE PARTNERSHIP CONCEPT
Prepared for: ${org}
Focus: ${sport}
Status: Independent concept. Not an official USPA offer.

THE QUESTION
Do families at ${org} struggle with ${need}?

THE HYPOTHESIS
If so, a thoughtful introduction to a flexible academic pathway may be useful. US Performance Academy publicly describes online academic courses, Learning Coach support, and partnerships with sports organizations. USPA alone can confirm admissions, program fit, tuition, eligibility, and terms.

WHAT APERTURE WOULD DO
1. Listen to your coaches and parents to validate the need.
2. Prepare a clear, factual summary of possible academic pathways.
3. With permission and signed scope, route interested families to authorized USPA staff.
4. Report de-identified engagement and handoff metrics.
5. Test whether optional schedule-coordination tools add value.

WHAT IS NOT PROPOSED
No guaranteed placement, NCAA eligibility, tuition discount, revenue share, data access, or official endorsement. No student records captured by this public demo.

PROPOSED FIRST STEP
15-minute discovery call to define the need and determine whether a formal introduction is appropriate.

Official resources: https://gouspa.org/uspa-partners/
APERTURE: https://singhpratik44.github.io/clearline-portfolio/`,
    agenda:({org,sport,need})=>`DISCOVERY CALL / ${org} / ${sport}
Duration: 20 minutes

00–03 | Why this conversation
- Understand the organization, age groups, season and travel rhythms

03–10 | Validate the problem
- Does ${need} cause real friction?
- Where do families currently turn for support?
- What education resources already work well?

10–15 | Explore pathways
- Describe what USPA publicly offers without promising admission or outcomes
- Identify who should own school-specific answers
- Ask whether a voluntary introduction could be useful

15–18 | Define safeguards
- Who approves outreach and messaging?
- What consent is needed?
- What measurable outcome matters?

18–20 | Agree next step
- No outreach or data transfer without authorization
- Record owner, date, and follow-up commitment

Call note: do not collect identifying student information into this public app.`,
    faq:({org,sport,need})=>`FAMILY DISCUSSION FAQ — ${org}
Independent APERTURE concept. Not USPA-approved copy.

Q: What is being explored?
A: Whether some ${sport.toLowerCase()} families facing ${need} would benefit from learning about flexible school options.

Q: What does US Performance Academy offer?
A: According to USPA's public site, it is an online school designed around student-athletes' training and travel schedules, with Learning Coach support. Confirm current course, grade, tuition, accreditation, and eligibility details directly with USPA.

Q: Are we an official partner?
A: No. APERTURE is discussing a potential referral arrangement, and no official partnership has been agreed.

Q: Will my student's information be shared?
A: Not through this demo. Any real referral would require a defined, consent-based process approved by the parties involved.

Q: Is USPA right for my student?
A: That decision belongs to your family and USPA admissions after a direct discussion. The APERTURE prototype does not advise on admissions or NCAA eligibility.

Q: Who answers academic and tuition questions?
A: USPA's authorized admissions team: https://gouspa.org/

Q: What is the next step?
A: If your family wants information, request an authorized introduction or contact USPA directly.`
  };
  function renderKit(){ const fn=kitBuilders[activeDoc]||kitBuilders.email;$("#kit-output").value=fn(kitContext()); }
  ["kit-org","kit-sport","kit-need"].forEach(id=>$("#"+id).addEventListener("input",renderKit));
  $$("[data-doc]").forEach(btn=>btn.addEventListener("click",()=>{activeDoc=btn.dataset.doc;$$("[data-doc]").forEach(b=>b.classList.toggle("active",b===btn));renderKit();}));
  $("#copy-kit").addEventListener("click",async()=>{
    const text=$("#kit-output").value;try {if(!navigator.clipboard) throw Error("No clipboard");await navigator.clipboard.writeText(text);toast("Draft copied; nothing sent.");}catch(_){$("#kit-output").focus();$("#kit-output").select();toast("Select and copy the draft manually.");}
  });
  $("#download-kit").addEventListener("click",()=>{download($("#kit-output").value,"aperture-"+activeDoc+"-draft.txt");toast("Draft downloaded.");});
  function renderPilot() {
    const root=$("#week-checklist");root.replaceChildren();
    PILOT.forEach((week,wi)=>{
      const wrap=document.createElement("article");wrap.className="week";wrap.append(label("p","WEEK 0"+(wi+1),"overline"),label("h3",week.title));
      week.tasks.forEach((task,ti)=>{
        const key=wi+"-"+ti,row=document.createElement("label");row.className="task-row";const input=document.createElement("input");input.type="checkbox";input.checked=!!checks[key];input.addEventListener("change",()=>{checks[key]=input.checked;write("checks",checks);updateCompletion();});
        row.append(input,document.createTextNode(task));wrap.append(row);
      });
      root.append(wrap);
    });
    const counter=label("small","","completion");root.prepend(counter);updateCompletion();
  }
  function updateCompletion(){const done=Object.values(checks).filter(Boolean).length;const el=$(".completion");if(el)el.textContent=Math.min(done,16)+" / 16 tasks manually checked — not independently verified";}
  renderMetrics();renderNetwork();renderAthlete();renderKit();renderPilot();
  const requested=location.hash.replace("#","");if(["overview","network","athlete","kit","pilot"].includes(requested)){go(requested);}
})();