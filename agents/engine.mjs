/**
 * APERTURE Agents v1 — deterministic, reviewable agent workflows.
 * Zero model/API calls, zero autonomous submissions, no persistent storage.
 * Run through the APERTURE public preview over HTTPS.
 */
export const AGENTS = Object.freeze([
  {id:"router",name:"Mission Router",role:"Classify authorized work and dependencies"},
  {id:"evidence",name:"Evidence Auditor",role:"Check sources, provenance and unsupported claims"},
  {id:"uspa",name:"Academic Tuition Analyst",role:"Compute sourced school tuition comparisons"},
  {id:"coding",name:"Coding Pathway Architect",role:"Plan skills, coaching hours and projects"},
  {id:"economics",name:"Value & Outcomes Modeler",role:"Separate calculations from predictions"},
  {id:"stories",name:"Student Impact Curator",role:"Stage verified-consent story records"},
  {id:"geo",name:"Network Intelligence Agent",role:"Compute proximity from imported public locations"},
  {id:"outreach",name:"Outreach Strategist",role:"Prepare proposals without sending"},
  {id:"risk",name:"Safeguarding & Brand Agent",role:"Protect learner privacy and affiliation truth"},
  {id:"qa",name:"Quality Assurance Agent",role:"Run deterministic regression and boundary checks"},
  {id:"release",name:"Human Approval Gate",role:"Hold consequential actions for user approval"}
]);
export const PRICE_SNAPSHOT = Object.freeze({
  source:"https://gouspa.org/truth-in-tuition/",
  note:"Public price snapshot from the prior APERTURE tuition research; confirm directly with USPA before presenting as a current binding offer.",
  middle:{annual:17140,semester:9430,application:50},
  high:{annual:19490,semester:10540,application:50},
  independentCourse:{base:1650,withLearningCoach:3250,application:null}
});
const SKILLS = Object.freeze({
  scratch:{label:"Creative coding",project:"Playable original game",phases:["Make a character respond to controls","Build a game loop and scoring","Test and explain the finished prototype"]},
  python:{label:"Python and data",project:"Functional Python project",phases:["Practice variables, functions and tests","Create a useful personal application","Debug and document how it works"]},
  web:{label:"Web and apps",project:"Accessible web application prototype",phases:["Design a user journey","Build responsive interactions","Test and publish with approval"]},
  robotics:{label:"Robotics",project:"Robotics / sensor demonstration",phases:["Plan mechanics and controls","Simulate or program sensors","Test reliability and explain results"]},
  games:{label:"Game development",project:"Playable original game",phases:["Design gameplay and rules","Implement core mechanic","Test with feedback and iterate"]},
  ai:{label:"Applied AI",project:"Responsible AI demonstration",phases:["Define a human purpose","Measure model quality and error","Add privacy and evaluation controls"]},
  apcs:{label:"AP Computer Science",project:"Algorithm and class-design portfolio",phases:["Practice core concepts","Solve timed problems","Review and correct errors"]},
  cyber:{label:"Cybersecurity foundations",project:"Defensive lab report",phases:["Threat-model a safe lab","Inspect authorized test data","Write a defensive report"]},
  sports:{label:"Sports analytics",project:"Player-development dashboard",phases:["Select measurable metrics","Analyze observed practice data","Visualize and explain limitations"]},
  agents:{label:"Advanced AI agents",project:"Governed, testable agent workflow",phases:["Define scope, inputs and owners","Add deterministic checks and approval gates","Test outputs and audit the ledger"]}
});
const EXTERNAL_ACTIONS=new Set(["send_email","submit_application","publish","purchase","charge","enroll","update_production"]);
function num(value,min,max,fallback){const n=Number(value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function bool(value){return value===true||value==="yes"||value==="true"}
function link(value){try{const u=new URL(String(value));return u.protocol==="https:"?u.href:null}catch(e){return null}}
function currency(value){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(value)}
function result(id,status,detail,data={}){return {agent:id,status,detail,data}}
function runRouter(x){
 const task=String(x.task||"").toLowerCase(),allowed=["uspa","coding","story","map","outreach","release"];
 if(!allowed.includes(task))return result("router","HOLD","No recognized task selected.");
 if(String(x.purpose||"").length>4000)return result("router","HOLD","Purpose exceeded the 4,000-character safe input limit.");
 return result("router","PASS","Authorized local analysis: "+task+". No third-party actions permitted.",{task});
}
function runEvidence(x){
 if(x.task==="uspa")return result("evidence","REVIEW","Tuition numbers reference an official USPA page, but this browser-only run has not refreshed the source or guaranteed current pricing.",{source:PRICE_SNAPSHOT.source,verification:"snapshot—not a current quote"});
 if(x.task==="story"){
   const url=link(x.storySource);
   return result("evidence",url?"REVIEW":"HOLD",url?"One HTTPS evidence link supplied; its contents and coaching connection still require editorial review.":"Student story lacks a valid HTTPS source. The case study cannot be published.",{source:url,coachingVerified:false});
 }
 if(x.task==="map")return result("evidence",x.records?.length?"REVIEW":"HOLD",x.records?.length?"Imported map coordinates are user-supplied community records, not verified relationships.":"Import public map records before calculating local opportunities.",{records:x.records?.length||0});
 return result("evidence","PASS","Calculations use explicit user inputs. Claims of measured savings, paid partnerships and guaranteed results are excluded.",{source:"user inputs"});
}
function runUspa(x){
 if(x.task!=="uspa")return result("uspa","SKIP","No academic tuition calculation requested.");
 const type=x.uspaProgram==="high"?"high":x.uspaProgram==="course"?"course":"middle",p=PRICE_SNAPSHOT[type],term=x.uspaTerm||"annual";
 let cost,fee=0,descriptor;
 if(type==="course"){
  const unit=bool(x.learningCoach)?PRICE_SNAPSHOT.independentCourse.withLearningCoach:PRICE_SNAPSHOT.independentCourse.base;
  const count=Math.round(num(x.credits,1,10,1));cost=unit*count;
  descriptor=count+" individual course credits; two at once maximum";
 }else{
  cost=term==="semester"?p.semester:term==="two"?p.semester*2:p.annual;
  fee=p.application;descriptor=type+" school · "+(term==="semester"?"semester":term==="two"?"two separate semesters":"year");
 }
 return result("uspa","REVIEW",descriptor+" — "+currency(cost)+" tuition"+(fee?" plus "+currency(fee)+" listed application fee":", no course fee asserted")+". Provider confirmation required.",{tuition:cost,fee,total:cost+fee,source:PRICE_SNAPSHOT.source,provider:"USPA",affiliation:"unverified exploratory"});
}
function runCoding(x){
 if(x.task!=="coding")return result("coding","SKIP","No coding plan requested.");
 const skill=SKILLS[x.skill]||SKILLS.python,hours=num(x.hours,1,200,1),rate=num(x.rate,1,500,65);
 const validExisting=hours===1&&rate===65;
 const weeks=hours/num(x.weeklyHours,0.5,40,2);
 const data={skill:skill.label,project:skill.project,phases:skill.phases,hours,rate,total:rate*hours,weeks:Math.ceil(weeks*10)/10,checkoutStatus:validExisting?"Existing general lesson; scope and availability must be confirmed":"Scenario only; not a live-priced package",purchaseLink:validExisting?"../learning/book/":null};
 return result("coding","PASS",currency(data.total)+" for "+hours+" coached hours of "+skill.label+". "+data.checkoutStatus,data);
}
function runEconomics(x,results){
 if(!["coding","uspa"].includes(x.task))return result("economics","SKIP","No financial estimate requested.");
 const coding=results.find(r=>r.agent==="coding")?.data,tuition=results.find(r=>r.agent==="uspa")?.data;
 if(x.task==="uspa"){
  const weeks=num(x.weeks,1,52,36);
  return result("economics","REVIEW",currency(tuition?.tuition||0)+" tuition across "+weeks+" user-assumed weeks; this is a budgeting ratio, not class hours or an hourly education rate.",{weeks,tuitionPerAssumedWeek:(tuition?.tuition||0)/weeks,noReturnClaim:true});
 }
 const baseline=num(x.baseline,0,1000,0),diff=Math.max(0,baseline-(coding?.hours||0));
 const timeValue=num(x.timeValue,0,1000,0);
 return result("economics","PASS","User-assumed baseline "+baseline+" self-study hours vs "+(coding?.hours||0)+" coached hours. Arithmetic difference "+diff+"h; not demonstrated savings or income.",{assumedDifference:diff,notMeasured:true,hypotheticalTimeEquivalent:diff*timeValue,incomeClaim:false});
}
function runStories(x){
 if(x.task!=="story")return result("stories","SKIP","No student story review requested.");
 const alias=String(x.alias||"").trim(),project=String(x.project||"").trim(),source=link(x.storySource),hasConsent=bool(x.consent),coaching=bool(x.coachingEvidence);
 let blockers=[];
 if(!project)blockers.push("missing project");
 if(!alias)blockers.push("missing permission-safe alias");
 if(!source)blockers.push("missing source");
 if(!hasConsent)blockers.push("missing documented publication consent");
 if(!coaching)blockers.push("coaching attribution not supported");
 const status=blockers.length?"HOLD":"REVIEW";
 return result("stories",status,blockers.length?"Cannot publish story: "+blockers.join(", ")+".":"Candidate has supplied consent and coaching evidence claims, but a human must verify them before publication.",{alias:alias.slice(0,80),project:project.slice(0,160),source,claimedConsent:hasConsent,claimedCoachingEvidence:coaching,publicationApproved:false,blockers});
}
function km(a,b){const rad=Math.PI/180,dl=(b.lat-a.lat)*rad,dn=(b.lng-a.lng)*rad,u=Math.sin(dl/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dn/2)**2;return 12742*Math.asin(Math.min(1,Math.sqrt(u)))}
function runGeo(x){
 if(x.task!=="map")return result("geo","SKIP","No network map model requested.");
 const rows=(Array.isArray(x.records)?x.records:[]).filter(r=>typeof r.lat==="number"&&typeof r.lng==="number"&&r.lat>=-90&&r.lat<=90&&r.lng>=-180&&r.lng<=180&&r.name).slice(0,400);
 if(!rows.length)return result("geo","HOLD","No valid public geocoded rows were supplied.",{pairs:[]});
 const a=rows.filter(r=>r.kind==="education"),b=rows.filter(r=>["coding","sports"].includes(r.kind)),pairs=[];
 for(const school of a)for(const other of b){const distance=km(school,other);if(distance<=5)pairs.push({school:school.name,program:other.name,distanceKm:Math.round(distance*10)/10})}
 pairs.sort((p,q)=>p.distanceKm-q.distanceKm);
 return result("geo",pairs.length?"REVIEW":"PASS",pairs.length+" hypothetical pairs within 5 km across "+a.length+" education sites and "+b.length+" coding/sports sites. Not partnerships.",{pairs:pairs.slice(0,25),radiusKm:5,partnershipsConfirmed:0,source:"user-provided public-directory CSV"});
}
function runOutreach(x){
 if(x.task!=="outreach")return result("outreach","SKIP","No outreach draft requested.");
 const target=String(x.target||"a local organization").trim().slice(0,150);
 const topic=String(x.purpose||"explore whether independent coding and academic-athlete pathways may fit your learners").trim().slice(0,400);
 const text="Subject: Exploring a useful education or sports-program connection\n\nHello,\n\nI lead APERTURE, an independent initiative connecting project-based computer science education, youth development, and responsible program operations. I'm reaching out to "+target+" to "+topic+".\n\nWould you be the right person for a brief conversation, or is there someone I should contact? I can share a concise example project and a proposed pathway for your review.\n\nThank you,\nAPERTURE / Clearline\n\nNote: This is an exploratory inquiry. No USPA, theCoderSchool, or Code Ninjas corporate partnership is being claimed.";
 return result("outreach","REVIEW","Created an exploratory outreach DRAFT only. No contact was searched, email sent or message scheduled.",{draft:text,sendAllowed:false});
}
function runRisk(x,results){
 const str=[x.purpose,x.target,x.alias,x.project].filter(Boolean).join(" ");
 const issues=[];
 if(/(?:\b(?:SSN|social security number|password|credit card number)\b)/i.test(str))issues.push("sensitive-data field detected");
 if(/(?:\b(?:official partner|USPA authorized|Code Ninjas corporate partner|theCoderSchool corporate partner)\b)/i.test(str))issues.push("unsupported partnership language");
 if(["publish","send_email","purchase","enroll"].includes(x.action))issues.push("external action requires separate approval");
 if(x.task==="story"&&!bool(x.consent))issues.push("child/study-case consent unverified");
 if(x.task==="story"&&!bool(x.coachingEvidence))issues.push("student coaching relationship unverified");
 const status=issues.length?"HOLD":"PASS";
 return result("risk",status,issues.length?"Held: "+issues.join("; ")+".":"No basic brand, publication or sensitive-data flags found. Manual expert review is still required for high-impact claims.",{issues,privacyFirst:true});
}
function runQa(x,results){
 const errors=[];
 for(const r of results)if(!["PASS","SKIP","REVIEW","HOLD"].includes(r.status))errors.push("invalid agent verdict");
 if(x.task==="coding"){const d=results.find(r=>r.agent==="coding")?.data;if(!d||d.total!==d.hours*d.rate)errors.push("coding invoice mismatch")}
 if(x.task==="uspa"){const d=results.find(r=>r.agent==="uspa")?.data;if(!d||d.total!==d.tuition+d.fee)errors.push("tuition subtotal mismatch")}
 if(x.task==="story"&&results.some(r=>r.agent==="stories"&&r.data.publicationApproved))errors.push("unsafe auto-publication");
 if(x.task==="outreach"&&results.some(r=>r.agent==="outreach"&&r.data.sendAllowed))errors.push("unsafe auto-send");
 return result("qa",errors.length?"HOLD":"PASS",errors.length?"Internal checks failed: "+errors.join("; "):"Internal arithmetic/side-effect gates passed. This is not a browser, mobile, security or third-party integration test.",{errors,browserTested:false});
}
function runRelease(x,results){
 const holds=results.filter(r=>r.status==="HOLD").map(r=>r.agent);
 const requested=EXTERNAL_ACTIONS.has(x.action)?x.action:null;
 const reasons=[...holds.map(id=>"blocked by "+id)];
 if(requested)reasons.push("external action "+requested+" not enabled in this preview");
 if(["story","outreach","release"].includes(x.task))reasons.push("human review is mandatory before external publication/outreach/release");
 return result("release","HOLD","No external action executed. "+(reasons.length?reasons.join("; "):"Human approval and live integration QA still required before public release."),{authorization:"required",holds,reasons,executedActions:0});
}
export function validateAtlasCsv(csv){
 const lines=String(csv||"").replace(/\r/g,"").split("\n").filter(Boolean);
 if(lines.length>1500)throw new Error("CSV exceeds 1,500 rows");
 const headers=lines.shift().split(",").map(x=>x.trim().replace(/^"|"$/g,"").toLowerCase());
 const ix=Object.fromEntries(headers.map((x,i)=>[x,i]));
 for(const key of ["name","category","latitude","longitude"])if(!(key in ix))throw new Error("Expected atlas CSV column: "+key);
 return lines.map(row=>{
  // OSM CSV export quotes every field; names with commas require a proper CSV decoder.
  let cols=[],cur="",quoted=false;
  for(let i=0;i<row.length;i++){const c=row[i];if(c==='"'&&quoted&&row[i+1]==='"'){cur+='"';i++}else if(c==='"'){quoted=!quoted}else if(c===','&&!quoted){cols.push(cur);cur=""}else cur+=c}
  cols.push(cur);
  const kind=cols[ix.category],lat=Number(cols[ix.latitude]),lng=Number(cols[ix.longitude]);
  if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
  return {name:String(cols[ix.name]||"").slice(0,150),kind,lat,lng};
 }).filter(Boolean).slice(0,400);
}
function stableData(x){
 const copy={...x};
 if(copy.records)copy.records={count:copy.records.length}; // ledger does not store location datasets or private text blobs
 if(copy.storySource)copy.storySource="[source redacted: view result]";
 if(copy.alias)copy.alias="[redacted]";
 if(copy.purpose)copy.purpose="[input omitted from ledger]";
 return copy;
}
async function hash(text){
 if(typeof crypto==="undefined"||!crypto.subtle)return null;
 const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
 return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
export async function runAgents(input){
 const x={...input},time=new Date().toISOString(),results=[],ledger=[];
 let previous=null;
 const sequence=[
  ()=>runRouter(x),
  ()=>runEvidence(x),
  ()=>runUspa(x),
  ()=>runCoding(x),
  ()=>runEconomics(x,results),
  ()=>runStories(x),
  ()=>runGeo(x),
  ()=>runOutreach(x),
  ()=>runRisk(x,results),
  ()=>runQa(x,results),
  ()=>runRelease(x,results)
 ];
 for(const act of sequence){
  const r=act();results.push(r);
  const payload={time,step:results.length,agent:r.agent,status:r.status,detail:r.detail,prevHash:previous};
  const digest=await hash(JSON.stringify(payload));
  ledger.push({...payload,digest});
  previous=digest;
 }
 const status=results.some(r=>r.status==="HOLD")?"HOLD":results.some(r=>r.status==="REVIEW")?"REVIEW":"PASS";
 return {version:"APERTURE-AGENTS-v1",generatedAt:time,status,inputs:stableData(x),results,ledger,ledgerDigest:previous,summary:{passed:results.filter(r=>r.status==="PASS").length,review:results.filter(r=>r.status==="REVIEW").length,held:results.filter(r=>r.status==="HOLD").length,skipped:results.filter(r=>r.status==="SKIP").length},effects:{emailsSent:0,payments:0,publications:0,submissions:0},productionReady:false};
}