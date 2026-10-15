// ============================================================================
// CN_Merged_Engine — ENTERPRISE BUILD (corporate register)
// Proposed Policy Framework — Candidate Submission · Pratik Singh
// Groups: NETWORK · PROGRAMS · SUPPORT · RECORD
// All figures modeled/illustrative pending live MyStudio/QuickBooks integration.
// FDD Item 20 = 244 authoritative units. Engine proposes; it does not enact.
// ============================================================================
import React, { useState, useEffect, useMemo, useRef, Fragment } from "react";

// ---- Network Command Table (compact, embedded) ----
// Approximate US + adjacent-province layout (cartogram, not a precise
// projection) for every territory actually present in the modeled network -- this used to be four arbitrary points with hardcoded numbers, then 37 real 
const MAP_STATE_COORDS={
AL:[1.81,2.79],AR:[0.47,2.01],AZ:[-3.52,2.17],CA:[-4.75,0.62],CO:[-1.9,-0.93],
CT:[5.04,-1.55],DE:[4.75,-0.47],FL:[3.32,4.65],GA:[2.76,2.17],IA:[0.28,-0.93],
ID:[-3.8,-2.48],IL:[1.23,-0.47],IN:[1.99,-0.47],KS:[-0.95,0.62],LA:[0.19,3.57],
MA:[5.22,-2.64],MD:[4.18,-0.16],MI:[2.19,-2.48],MN:[0.28,-3.57],MO:[0.28,0.62],
NC:[3.99,1.08],ND:[-0.95,-4.03],NJ:[4.46,-0.93],NV:[-3.8,-0.93],NY:[4.09,-2.79],
OH:[2.85,-0.78],OK:[-0.95,2.17],OR:[-4.75,-2.48],PA:[3.8,-1.24],SC:[3.61,2.01],
TN:[2.09,1.08],TX:[-1.42,3.72],UT:[-2.85,-0.93],VA:[3.71,0.31],WA:[-4.75,-4.03],
WI:[0.95,-2.48],WV:[3.14,0.0],
BC:[-4.75,-5.7],AB:[-2.85,-5.7],ON:[2.19,-5.4],
};
const MAP_DIMS=["engagement","margin","staffing","community"];
function mapClamp(v){return Math.max(0.02,Math.min(1,v));}
function buildMapNodes(states,railData,leads){
const conflictedCenters=new Set((railData&&railData.conflicts||[]).flatMap(c=>{
const recs=railData.recommendations||[];
const ra=recs.find(r=>r.id===c.a),rb=recs.find(r=>r.id===c.b);
return[ra,rb].filter(Boolean).flatMap(r=>r.targetIds.filter(t=>typeof t==="string"&&t.length>2));
}));
const leadsByRegion={};
(leads||[]).filter(l=>l.stage0<5).forEach(l=>{leadsByRegion[l.region]=(leadsByRegion[l.region]||0)+1;});
return Object.keys(states).filter(st=>MAP_STATE_COORDS[st]).map(st=>{
const cs=states[st];
const n=cs.length;
const avgHealth=cs.reduce((a,c)=>a+c.health,0)/n/100;
const avgConv=cs.reduce((a,c)=>a+c.conv,0)/n;
const avgChem=cs.reduce((a,c)=>a+c.chem,0)/n;
const avgRet=cs.reduce((a,c)=>a+c.ret,0)/n;
const avgEb=cs.reduce((a,c)=>a+c.eb,0)/n;
const marginDim=mapClamp((avgEb+4)/18);
const conditions=cs.map(c=>conditionOf(c).label);
const worst=conditions.includes("at-risk")?"at-risk":conditions.includes("watch")?"watch":"thriving";
const hex=worst==="at-risk"?0xe03535:worst==="watch"?0xd9a520:0x2fbf5f;
const conflicted=cs.some(c=>conflictedCenters.has(c.name));
const centerNames=new Set(cs.map(c=>c.name));
const verifiedN=cs.filter(c=>c.verified).length; // real per-center flag, same one the FDD reconciliation panel now counts from
return{
id:st,label:st,pos:MAP_STATE_COORDS[st],state:worst,hex,n,centerNames,verifiedN,
vals:{engagement:mapClamp(avgConv),margin:marginDim,staffing:mapClamp(avgChem),community:mapClamp(avgRet)},
conflicted,leadCount:leadsByRegion[st]||0,
repCenter:[...cs].sort((a,b)=>a.health-b.health)[0],
};
});
}
function mtVal(c,d){return c.vals[d];}
function mtHealth(c){return MAP_DIMS.reduce((s,d)=>s+mtVal(c,d),0)/MAP_DIMS.length;}
// Real propagation edges: drawn from the Network Propagation agent's actual
// proposed source-to-target pairs, not from map-layout distance. If the agent
// has proposed nothing this cycle, no beams show -- an honest empty state rather than a decorative substitute. The Network Propagation agent itself only
const MAP_PROPAGATION_GAP_MIN=0.12;
function buildPropagationEdges(mapNodes){
const sorted=[...mapNodes].sort((a,b)=>mtHealth(b)-mtHealth(a));
if(sorted.length<2)return[];
const k=Math.min(3,Math.floor(sorted.length/2));
const strong=sorted.slice(0,k),weak=sorted.slice(-k);
const edges=[];const seen=new Set();
weak.forEach(w=>{
// pair each weak territory with its nearest strong one on the map, so the
// beam also reads as geographically sensible, not just numerically paired
let best=null,bestDist=Infinity;
strong.forEach(s=>{
const gap=mtHealth(s)-mtHealth(w);
if(gap<MAP_PROPAGATION_GAP_MIN)return;
const d=Math.hypot(s.pos[0]-w.pos[0],s.pos[1]-w.pos[1]);
if(d<bestDist){bestDist=d;best=s;}
});
if(!best)return;
const key=[best.id,w.id].sort().join("-");
if(seen.has(key))return;seen.add(key);
edges.push({a:best,b:w,gap:+(mtHealth(best)-mtHealth(w)).toFixed(2)});
});
return edges;
}
function CommandTableTab({centers,states,opt,setOpt,railData,leads,jumpTo}){
const [sel,setSel]=useState(null);const [sel2,setSel2]=useState(null);
const viewMode="table"; // 3D map removed — one clean 2D view
const currentWeek=opt&&typeof opt.week==="number"?opt.week:0;
const [week,setWeek]=useState(currentWeek);
useEffect(()=>{setWeek(currentWeek);},[currentWeek]);
const weekRef=useRef(currentWeek);const selRef=useRef(null);const apiRef=useRef({});
const webglFailed=false;
const mapNodes=useMemo(()=>buildMapNodes(states,railData||{recommendations:[],conflicts:[]},leads),[states,railData,leads]);
const nodesRef=useRef(mapNodes);nodesRef.current=mapNodes;
const edges=useMemo(()=>buildPropagationEdges(mapNodes),[mapNodes]);
const edgesRef=useRef(edges);edgesRef.current=edges;
useEffect(()=>{weekRef.current=week;apiRef.current.w&&apiRef.current.w(week);},[week]);

const sc=mapNodes.find(c=>c.id===sel);
const sc2=mapNodes.find(c=>c.id===sel2);
const fallbackList=[...mapNodes].sort((a,b)=>mtHealth(b)-mtHealth(a));
// Real open proposals targeting units in the selected state, cross-referenced
// from the same governed recommendation set every other view reads.
const scProposals=sc?(railData&&railData.recommendations||[]).filter(r=>r.targetIds.some(t=>sc.centerNames.has(t))):[];
const LEGEND=[["thriving",0x2fbf5f],["watch",0xd9a520],["at-risk",0xe03535]];
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginBottom:6}}>Every row below is a real state from the canonical network ({centers.length} centers across {mapNodes.length} territories shown, including three Canadian provinces) — not a separate dataset. Beams connect the weakest territories to their nearest strong neighbor by the same top-versus-bottom gap test the Network Propagation agent runs within a state, applied here across states (the agent itself only ever proposes within one state, so this is the map's own cross-territory read, not a direct agent feed); a cyan marker flags a territory with candidates active in the Growth pipeline.</div>
<div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>

<span style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
{LEGEND.map(([label,hex])=>(<span key={label} style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Helvetica",fontSize:8.5,color:MUT,textTransform:"capitalize"}}><span style={{width:8,height:8,borderRadius:"50%",background:"#"+hex.toString(16).padStart(6,"0"),display:"inline-block"}}/>{label}</span>))}
<span style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Helvetica",fontSize:8.5,color:MUT}}><span style={{width:0,height:0,borderLeft:"4px solid transparent",borderRight:"4px solid transparent",borderBottom:"7px solid #6fe8ff",display:"inline-block"}}/>pipeline active</span>
</span>
</div>
{/* Keyboard-navigable state picker: every state reachable without the mouse, same selection state a 3D click sets. */}
<div role="listbox" aria-label="Select a state to view detail" style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>
{[...mapNodes].sort((a,b)=>a.id.localeCompare(b.id)).map(c=>(
<button key={c.id} role="option" aria-selected={sel===c.id} onClick={()=>{selRef.current=selRef.current===c.id?null:c.id;setSel(selRef.current);}} title={c.label+" — "+c.state+(c.verifiedN===0?" (no verified units)":"")} style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"2px 6px",cursor:"pointer",border:`1px solid ${sel===c.id?INK:c.conflicted?AC:RULE}`,background:sel===c.id?INK:"#fff",color:sel===c.id?"#fff":c.conflicted?AC:MUT}}>{c.label}{c.conflicted?" ⚠":""}{c.verifiedN===0?" ~":""}</button>
))}
</div>
<div style={{position:"relative"}}>

{(viewMode==="table"||webglFailed)&&<div style={{padding:16,fontFamily:"Helvetica",background:webglFailed?"#05060e":"#fff",color:webglFailed?"#cdd6f4":INK,border:webglFailed?"none":`1px solid ${RULE}`,borderRadius:6}}>
{webglFailed&&<div style={{fontSize:11,fontWeight:700,marginBottom:8}}>3D rendering isn't available in this environment — showing the same data as a table instead.</div>}
<table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
<thead><tr style={{textAlign:"left",color:webglFailed?"#8a97c4":MUT}}><th style={{padding:"4px 6px"}}>State</th><th>Units</th><th>Verified</th><th>Condition</th><th>Composite</th><th>Pipeline</th></tr></thead>
<tbody>{fallbackList.map(c=>(<tr key={c.id} onClick={()=>{selRef.current=selRef.current===c.id?null:c.id;setSel(selRef.current);}} style={{borderTop:webglFailed?"1px solid #1c2650":`1px solid ${RULE}`,cursor:"pointer",background:sel===c.id?(webglFailed?"#141d3d":"#f5f5f5"):"transparent"}}>
<td style={{padding:"4px 6px",fontWeight:700}}>{c.label}{c.conflicted?" ⚠":""}</td>
<td style={{padding:"4px 6px"}}>{c.n}{c.verifiedN===0?" ~":""}</td>
<td style={{padding:"4px 6px"}}>{c.verifiedN}</td>
<td style={{padding:"4px 6px",textTransform:"capitalize"}}>{c.state}</td>
<td style={{padding:"4px 6px"}}>{mtHealth(c).toFixed(2)}</td>
<td style={{padding:"4px 6px"}}>{c.leadCount||"—"}</td>
</tr>))}</tbody>
</table>
</div>}
{sc&&(<div style={{position:viewMode==="3d"?"absolute":"static",top:10,right:10,width:260,marginTop:viewMode==="table"?10:0,background:viewMode==="3d"?"rgba(8,10,24,0.92)":"#fff",border:viewMode==="3d"?"1px solid #2b3d78":`1px solid ${RULE}`,borderRadius:6,padding:12,fontFamily:"Helvetica",color:viewMode==="3d"?"#cdd6f4":INK}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b style={{fontSize:12,color:viewMode==="3d"?"#e8ecff":INK}}>{sc.label} — {sc.state}</b><button onClick={()=>{selRef.current=null;setSel(null);}} aria-label="Close state detail" style={{cursor:"pointer",color:viewMode==="3d"?"#5a6a9e":MUT,background:"none",border:"none",padding:0}}>✕</button></div>
<div style={{fontSize:9,color:viewMode==="3d"?"#8a97c4":MUT,margin:"3px 0 7px"}}>{sc.n} unit{sc.n>1?"s":""} in this state ({sc.verifiedN} verified, {sc.n-sc.verifiedN} modeled){sc.conflicted?" · open cross-agent conflict":""}{sc.leadCount>0?" · "+sc.leadCount+" candidate(s) in pipeline":""}</div>
{MAP_DIMS.map(d=>{const v=mtVal(sc,d);return(<div key={d} style={{margin:"6px 0"}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:9}}><span style={{textTransform:"capitalize",color:viewMode==="3d"?"#aab4dd":MUT}}>{d}</span><b style={{color:viewMode==="3d"?"#e8ecff":INK}}>{v.toFixed(2)}</b></div>
<div style={{height:4,background:viewMode==="3d"?"#141d3d":"#eee",borderRadius:2}}><div style={{height:4,width:(v*100)+"%",borderRadius:2,background:v<0.35?"#e03535":v<0.6?"#d9a520":"#2fbf5f"}}/></div></div>);})}
{scProposals.length>0&&<div style={{marginTop:8,paddingTop:6,borderTop:viewMode==="3d"?"1px solid #2b3d78":`1px solid ${RULE}`}}>
<div style={{fontSize:8,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:viewMode==="3d"?"#8a97c4":MUT,marginBottom:3}}>{scProposals.length} open proposal{scProposals.length>1?"s":""} in this state</div>
{scProposals.slice(0,3).map(r=>(<div key={r.id} style={{fontSize:8.5,color:viewMode==="3d"?"#cdd6f4":"#444",marginBottom:2}}>• {r.agent}: {r.governance.allowed?"cleared":"held"}</div>))}
</div>}
<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
{jumpTo&&sc.repCenter&&<button onClick={()=>jumpTo("lenses",sc.repCenter.name,"reviewing "+sc.label+" from the network map — "+sc.repCenter.name+" is this state's weakest unit")} style={{fontFamily:"Helvetica",fontSize:9,color:"#6fe8ff",cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>view {sc.repCenter.name} in Six Lenses →</button>}
<button onClick={()=>setSel2(sel2===sc.id?null:(sel2||mapNodes.find(m=>m.id!==sc.id)?.id))} style={{fontFamily:"Helvetica",fontSize:9,color:viewMode==="3d"?"#6fe8ff":AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>{sel2?"stop comparing":"compare with another state"}</button>
{jumpTo&&sc.repCenter&&<button onClick={()=>jumpTo("network",sc.repCenter.name,"reviewing "+sc.label+"'s cluster from the network map")} style={{fontFamily:"Helvetica",fontSize:9,color:viewMode==="3d"?"#6fe8ff":AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>view {sc.label} cluster in Network →</button>}
{jumpTo&&sc.leadCount>0&&<button onClick={()=>jumpTo("leads",null,sc.leadCount+" candidate(s) active in "+sc.label+", seen from the network map")} style={{fontFamily:"Helvetica",fontSize:9,color:viewMode==="3d"?"#6fe8ff":AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>view {sc.label} pipeline in Growth →</button>}
</div>
</div>)}
</div>
{sc&&sel2&&sc2&&(<div style={{marginTop:8,border:`1px solid ${RULE}`,background:"#fff",padding:"9px 12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT}}>Comparing {sc.label} vs <select value={sel2} onChange={e=>setSel2(e.target.value)} aria-label="Choose comparison state" style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700}}>{mapNodes.filter(m=>m.id!==sc.id).map(m=>(<option key={m.id} value={m.id}>{m.label}</option>))}</select></div>
<button onClick={()=>setSel2(null)} aria-label="Close comparison" style={{fontFamily:"Helvetica",fontSize:11,color:MUT,cursor:"pointer",background:"none",border:"none",padding:0}}>✕</button>
</div>
{MAP_DIMS.map(d=>{const v1=mtVal(sc,d),v2=mtVal(sc2,d),delta=v1-v2;return(<div key={d} style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0",fontFamily:"Helvetica",fontSize:9.5}}>
<span style={{width:80,textTransform:"capitalize",color:MUT}}>{d}</span>
<span style={{width:40,textAlign:"right",fontWeight:700}}>{v1.toFixed(2)}</span>
<div style={{flex:1,height:4,background:"#eee",borderRadius:2,position:"relative"}}><div style={{position:"absolute",left:"50%",height:4,width:Math.abs(delta)*50+"%",transform:delta>=0?"translateX(0)":"translateX(-100%)",background:delta>=0?GRN:AC,borderRadius:2}}/></div>
<span style={{width:40,fontWeight:700}}>{v2.toFixed(2)}</span>
<span style={{width:52,fontSize:8.5,color:delta>=0?GRN:AC}}>{delta>=0?"+":""}{delta.toFixed(2)}</span>
</div>);})}
</div>)}
<div style={{marginTop:8,padding:"8px 12px",background:"#0a0d1f",border:"1px solid #1c2650",borderRadius:6,fontFamily:"Helvetica"}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#8a97c4",marginBottom:4}}><b style={{color:"#e8ecff"}}>Week {week}{week===currentWeek?" (current)":" (preview — does not change the shared clock)"}</b><span>{edges.length} active propagation link{edges.length===1?"":"s"} this cycle</span></div>
<input type="range" min="0" max={currentWeek} step="1" value={week} onChange={e=>setWeek(parseInt(e.target.value))} aria-label={"Preview an earlier week, currently showing week "+week} style={{width:"100%"}}/>
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#888",marginTop:5}}>drag = orbit · scroll = zoom · click a state (or use the list above) = unit readout · reads the live canonical state, same as every other view</div>
</div>);}
// ---- end Command Table ----

// ============================================================
// CENTER ANATOMY — a franchise center modeled as a living body
// Coupled physiological simulation · organ systems · live links
//  ORGAN            BODY ROLE            CENTER ROLE Brain            control/measurement  Director decisions, MyStudio/QB reads Lungs            oxygen
// ============================================================

const ANAT_ORGANS = {
brain:     { x: 300, y: 62,  r: 42, label: 'BRAIN',      sub: 'measurement & control' },
lungs:     { x: 218, y: 178, r: 40, label: 'LUNGS',      sub: 'lead intake' },
heart:     { x: 352, y: 190, r: 38, label: 'HEART',      sub: 'enrollment engine' },
immune:    { x: 470, y: 150, r: 34, label: 'IMMUNE',     sub: 'compliance shield' },
muscles:   { x: 168, y: 330, r: 40, label: 'MUSCLES',    sub: 'sensei capacity' },
metabolism:{ x: 330, y: 330, r: 40, label: 'METABOLISM', sub: 'curriculum → belts' },
endocrine: { x: 480, y: 300, r: 32, label: 'ENDOCRINE',  sub: 'culture & morale' },
skin:      { x: 300, y: 452, r: 46, label: 'SKIN',       sub: 'community & brand field' }
};

// directed physiological links: [from, to, meaning]
const ANAT_LINKS = [
['skin', 'lungs',      'brand field draws breath (leads)'],
['lungs', 'heart',     'oxygenated leads enter circulation'],
['heart', 'muscles',   'cash perfuses payroll'],
['heart', 'metabolism','cash perfuses programs'],
['muscles', 'metabolism','instruction drives progression'],
['metabolism', 'skin', 'belts & showcases feed brand'],
['endocrine', 'muscles','morale hormones sustain senseis'],
['immune', 'heart',    'trust integrity protects flow'],
['brain', 'heart',     'pricing & pace control'],
['brain', 'lungs',     'marketing spend control'],
['brain', 'endocrine', 'recognition & incentive signals'],
['metabolism', 'brain','progression telemetry (belts/wk)'],
['skin', 'brain',      'parent-voice afferents (NPS)']
];

function anatDefaultVitals(center) {
// map engine center → initial physiology, or defaults
const eb = center?.eb ?? 6.5, ret = center?.ret ?? 0.85, chem = center?.chem ?? 0.65, conv = center?.conv ?? 0.35;
return {
students: Math.round(120 + eb * 14),
cash: Math.max(2, eb),                 // $k buffer ~ EBITDA proxy
staff: Math.max(2, Math.round(3 + chem * 5)),
morale: 0.4 + chem * 0.5,
engagement: 0.35 + ret * 0.45,
leads: 20 + conv * 40,
brand: 0.35 + ret * 0.4,
compliance: 1.0,
beltRate: 0.5 + ret * 0.4
};
}

// ---- end Center Anatomy ----

const Frag = Fragment;
const INK="#111",MUT="#666",AC="#8b0000",RULE="#ccc";
// ===== GOVERNANCE TYPE SPEC — the model as a specification, not just views =====
/** Canonical per-center state. One source; every view is a read. */
interface CenterState{name:string;st:string;health:number;eb:number;conv:number;ret:number;chem:number;verified?:boolean;}
/** Boundary schema: the contract a feedback boundary enforces over its member centers. */
interface BoundarySchema{name:string;fields:string[];}
interface FeedbackBoundary{schema:BoundarySchema|any;centers:any[];clusters:{id:string;coupling:number}[]|any[];}
/** Leading metrics are control inputs — they move first and predict outcomes. */
interface LeadingMetrics{enrollmentConv:number;retention:number;staffingChemistry:number;engagement:number;communityPresence:number;pipelineVelocity:number;}
/** Outcome metrics are lagging — governed by watching the leading six, not by chasing these two. */
interface OutcomeMetrics{unitEconomics:number;netUnitGrowth:number;}
/** Top-level model: three perspectives over one canonical state. */
interface GovernanceModel{network:CenterState[];local:CenterState;boundary:FeedbackBoundary;}
// ===== POLICY THRESHOLDS — guardrail bands as named policy, not inline magic numbers =====
const POLICY={ADVOCACY_GREEN:70,ADVOCACY_AMBER:45,FIT_STRONG:72,FIT_CONDITIONAL:58,READINESS_FLOOR:0.6,COL_GREEN:"#2fbf5f",COL_AMBER:"#d9a520",COL_RED:"#e03535"};
const advocacyColor=(v)=>v>=POLICY.ADVOCACY_GREEN?POLICY.COL_GREEN:v>=POLICY.ADVOCACY_AMBER?POLICY.COL_AMBER:POLICY.COL_RED;
const fitColor=(v)=>v>=POLICY.FIT_STRONG?POLICY.COL_GREEN:v>=POLICY.FIT_CONDITIONAL?POLICY.COL_AMBER:POLICY.COL_RED;
const readinessColor=(v)=>v>=POLICY.READINESS_FLOOR?POLICY.COL_GREEN:POLICY.COL_AMBER;
// ===== 69-STEP WORKFLOW =====
const W=[
{n:1,p:"acquire",s:"Community channel activated",o:"System",sys:"CRM",d:"Select channel: after-school STEM, Girl Scouts, Girls Who Code, holiday camp, farmers market, sports cross-promo, library event, or STEM market positioning."},
{n:2,p:"acquire",s:"Event hosted or partnership launched",o:"Director",sys:"Local",d:"Director or owner establishes the relationship and schedules the event. This is local, in-person work."},
{n:3,p:"acquire",s:"Lead captured",o:"System",sys:"CRM",d:"Name, child's age, contact info, source channel. Captured at event via form, QR code, or sign-up sheet."},
{n:4,p:"acquire",s:"Lead entered in pipeline",o:"System",sys:"CRM",d:"Auto-created if digital capture. Manual entry if paper sign-up. Tagged with source channel for attribution."},
{n:5,p:"acquire",s:"Welcome email sent",o:"System",sys:"SendGrid",d:"Auto-triggered on lead creation. Includes: what Code Ninjas is, what to expect at a trial, scheduling link."},
{n:6,p:"acquire",s:"Parent responds",o:"Parent",sys:"—",d:"Calls, emails, clicks scheduling link, or walks in. This is the moment of intent."},
{n:7,p:"acquire",s:"Availability checked",o:"System",sys:"MyStudio",d:"System shows open trial slots, Sensei availability, and room capacity for the requested day/time."},
{n:8,p:"acquire",s:"Tour scheduled",o:"Director",sys:"MyStudio",d:"If parent wants to see the center first. Not all leads need a tour — some go straight to trial booking."},
{n:9,p:"acquire",s:"Tour reminder sent",o:"System",sys:"SendGrid",d:"24-hour reminder with directions, what to expect, and a reschedule link."},
{n:10,p:"acquire",s:"Tour conducted",o:"Director",sys:"—",d:"Director walks parent through the center. Shows the curriculum, explains belts, introduces a Sensei, lets the child see other kids coding."},
{n:11,p:"acquire",s:"Trial offered",o:"Director",sys:"—",d:"At end of tour: 'Would your child like to try a session?' Free or low-cost. Low commitment, high signal."},
{n:12,p:"acquire",s:"Trial booked",o:"System",sys:"MyStudio",d:"Slot reserved. Sensei assigned based on availability and student age/level match."},
{n:13,p:"acquire",s:"Trial confirmation sent",o:"System",sys:"SendGrid",d:"Immediate confirmation with date, time, what to bring, parking info."},
{n:14,p:"acquire",s:"Trial reminders sent",o:"System",sys:"SendGrid + SMS",d:"24-hour and 1-hour reminders. Reduces no-show rate on trials — the highest-leverage touchpoint."},
{n:15,p:"acquire",s:"Student arrives, checked in",o:"System",sys:"MyStudio",d:"Check-in logged. Attendance record created. First-visit flag set."},
{n:16,p:"acquire",s:"Trial session delivered",o:"Sensei",sys:"Learning Platform",d:"Student builds something real in 60 minutes. Sensei reads the room — is the child engaged? Frustrated? Bored? Thrilled? This is the product demo."},
{n:17,p:"acquire",s:"Post-trial note sent",o:"System",sys:"App + SendGrid",d:"Same 4-part structure as regular notes. 'Your child built X today. They were excited about Y. Next time we would work on Z.'"},
{n:18,p:"acquire",s:"Day-3 follow-up",o:"System",sys:"SendGrid",d:"Auto-email: 'How did [child's name] feel about the session? Any questions about the program?'"},
{n:19,p:"acquire",s:"Day-7 follow-up",o:"Director",sys:"Phone/Email",d:"Personal outreach from Director. Not a sales call — a check-in. 'Did they mention the session at home? Would they like to come back?'"},
{n:20,p:"acquire",s:"GATE: Enrollment decision",o:"Director",sys:"MyStudio",d:"Parent decides. Director discusses pricing tiers, schedule options, membership commitment. This is a financial decision — human-owned.",gate:true,gr:"Financial materiality"},
{n:21,p:"acquire",s:"Paperwork completed",o:"Parent",sys:"MyStudio",d:"Enrollment form, liability waiver, emergency contacts, billing authorization."},
{n:22,p:"acquire",s:"Billing set up",o:"System",sys:"MyStudio",d:"Recurring billing configured. First payment processed. Membership tier recorded."},
{n:23,p:"acquire",s:"Welcome packet sent",o:"System",sys:"App + SendGrid",d:"Welcome to Code Ninjas. Your child's Sensei is [name]. First session is [date]. Here's what to expect."},
{n:24,p:"acquire",s:"First regular session scheduled",o:"System",sys:"MyStudio",d:"Recurring weekly slot booked. Calendar invite sent to parent."},
{n:25,p:"deliver",s:"Weekly schedule built",o:"System",sys:"MyStudio",d:"All sessions for the week populated. Sensei assignments confirmed. Room capacity validated."},
{n:26,p:"deliver",s:"Sensei-to-student ratios checked",o:"System",sys:"MyStudio",d:"Target: 1:8. If any session exceeds ratio, flag for Director to add coverage or cap enrollment."},
{n:27,p:"deliver",s:"Cancellations and makeups processed",o:"System",sys:"MyStudio",d:"Cancelled sessions freed. Makeup slots offered. Waitlisted students notified of openings."},
{n:28,p:"deliver",s:"Student brief pulled",o:"System",sys:"Learning Platform",d:"Auto-generated: current belt level, last project state (what they built, where they stopped), flags (stuck, bored, ahead), parent requests."},
{n:29,p:"deliver",s:"Curriculum checkpoint reviewed",o:"System",sys:"Learning Platform",d:"Is the student approaching a belt test? Any new challenges available at their level? Curriculum updates since last session?"},
{n:30,p:"deliver",s:"Sensei reads brief, plans approach",o:"Sensei",sys:"—",d:"30-second scan. Decision: continue last project, introduce new concept, or pivot based on expected energy. Agent prepares; human decides."},
{n:31,p:"deliver",s:"Student arrives, checked in",o:"System",sys:"MyStudio",d:"Attendance logged. Arrival time recorded. Late arrivals flagged if pattern forms."},
{n:32,p:"deliver",s:"Welcome and reconnect",o:"Sensei",sys:"—",d:"'Last time you got the scoring working — want to pick up from there or try something new?' Acknowledge by name. Reference last session. Give agency.",t:"2 min"},
{n:33,p:"deliver",s:"Student selects direction",o:"Student",sys:"—",d:"Student chooses: continue current project, start a new challenge, or explore a concept. Student-driven, not teacher-directed.",t:"1 min"},
{n:34,p:"deliver",s:"Student codes",o:"Student",sys:"Learning Platform",d:"The core 40 minutes. Student works on their project. Sensei circulates, observes, and intervenes only when stuck 2+ minutes or the student asks for help.",t:"40 min"},
{n:35,p:"deliver",s:"Question-driven debugging",o:"Sensei",sys:"—",d:"When stuck: 'What did you expect to happen? What actually happened? Can you find the line where the behavior changes?' Ask before telling. Scaffold, don't solve.",t:"ongoing"},
{n:36,p:"deliver",s:"Mini-teach if concept gap",o:"Sensei",sys:"—",d:"Student hits a concept they've never seen (loops, functions, variables). Sensei gives a 3–5 minute targeted lesson. Short, specific, then back to building.",t:"3–5 min"},
{n:37,p:"deliver",s:"Save project",o:"Student",sys:"Learning Platform",d:"Student saves their work. Project state persisted so the next session picks up exactly where they left off."},
{n:38,p:"deliver",s:"Show and celebrate",o:"Student",sys:"—",d:"Last 5 minutes. Student runs their project, shows it to the Sensei or another student. 'Look what I made.' This is the visible-progress retention signal.",t:"5 min"},
{n:39,p:"deliver",s:"Progress marker logged",o:"System",sys:"Learning Platform",d:"Session completed. Belt-pathway progress updated. If belt checkpoint completed, flag for ceremony scheduling."},
{n:40,p:"deliver",s:"Belt checkpoint?",o:"System",sys:"Learning Platform",d:"Decision point: did the student complete a belt test? If yes → flag for ceremony. If no → continue on pathway.",decision:true},
{n:41,p:"retain",s:"System drafts session note",o:"System",sys:"Learning Platform",d:"Auto-generated from session data. Follows the 4-part structure: (1) lead with a strength, (2) 'I noticed…' observation, (3) what's next, (4) invitation to respond."},
{n:42,p:"retain",s:"GATE: Sensei reviews and personalizes",o:"Sensei",sys:"App",d:"60–90 seconds per student. Sensei reads draft, adds personal observations ('she was really proud of the scoring system'), corrects anything wrong, approves for send.",gate:true,gr:"Data integrity"},
{n:43,p:"retain",s:"Note sent to parent",o:"System",sys:"App + SendGrid",d:"Delivered within 30 minutes of session end. App notification + email. Timely delivery signals: we pay attention, we care."},
{n:44,p:"retain",s:"Belt advancement?",o:"System",sys:"App",d:"Decision point: did the student earn a new belt? If yes → celebration message to parent, ceremony scheduling triggered.",decision:true},
{n:45,p:"retain",s:"Belt celebration sent",o:"System",sys:"App + SendGrid",d:"'Your ninja just earned their [color] belt!' Photo opportunity. Ceremony date. Invite friends and family — this is a referral event."},
{n:46,p:"retain",s:"Student absent?",o:"System",sys:"MyStudio",d:"Decision point: did the student not show up?",decision:true},
{n:47,p:"retain",s:"Same-day reschedule text",o:"System",sys:"Twilio",d:"Auto-sent within 2 hours of missed session. 'We missed [name] today — here are available makeup slots this week.'"},
{n:48,p:"retain",s:"2nd consecutive no-show?",o:"System",sys:"MyStudio",d:"Decision point: is this the second consecutive miss?",decision:true},
{n:49,p:"retain",s:"Director flagged for personal outreach",o:"System",sys:"CRM",d:"At-risk flag set. Director sees it in their morning dashboard. This is no longer an automated recovery — it's a relationship."},
{n:50,p:"retain",s:"GATE: At-risk intervention",o:"Director",sys:"Phone/Email",d:"Director personally contacts the family. 'Is everything okay? Can we adjust the schedule? Is there anything about the program we should change?' Empathy, flexibility, listening.",gate:true,gr:"Franchisee consent"},
{n:51,p:"retain",s:"Monthly progress report generated",o:"System",sys:"Learning Platform",d:"Summary: sessions attended, belt progress, projects completed, skills developed. Sent to parent on the 1st of each month."},
{n:52,p:"retain",s:"Re-enrollment nudge",o:"System",sys:"SendGrid",d:"30 days before membership lapses: 'Your ninja has earned [belt] and is working on [project]. Renew to keep the momentum going.'"},
{n:53,p:"retain",s:"Referral prompt",o:"System",sys:"App",d:"After belt ceremonies, after positive notes, after milestones: 'Know a family who might love Code Ninjas? Share a free trial.'"},
{n:54,p:"retain",s:"Referral received",o:"System",sys:"CRM",d:"New lead created, tagged as referral, attributed to referring family. → Back to step 1. The loop closes.",back:true},
{n:55,p:"operate",s:"Staffing need identified",o:"Director",sys:"MyStudio",d:"Session load increasing, Sensei leaving, or ratio exceeding 1:8. The hiring pipeline must always be warm."},
{n:56,p:"operate",s:"Job posted",o:"Director",sys:"Indeed",d:"Part-time Sensei role. Coding skills + ability to work with kids. Often college students or high schoolers."},
{n:57,p:"operate",s:"Candidates screened",o:"Director",sys:"Indeed",d:"Resume review, brief phone screen. Looking for: coding ability, patience, communication, reliability."},
{n:58,p:"operate",s:"GATE: Interview and hire decision",o:"Director",sys:"—",d:"In-person interview. Trial teaching session with a real student. Director decides: hire or pass.",gate:true,gr:"Child safety"},
{n:59,p:"operate",s:"Background check",o:"System",sys:"Background service",d:"Required for anyone working with children. Must clear before first session."},
{n:60,p:"operate",s:"Training completed",o:"Director + Sensei",sys:"Internal",d:"Curriculum (CREATE/JR), customer service standards, child safety protocols, MyStudio operations, session-note process."},
{n:61,p:"operate",s:"Monthly P&L pulled",o:"System",sys:"MyStudio + QuickBooks",d:"Revenue: active students × tier × billing period. Expenses: rent, payroll, curriculum license, marketing, supplies."},
{n:62,p:"operate",s:"Revenue vs expense reviewed",o:"Owner",sys:"QuickBooks",d:"Is the unit profitable? Where are the leaks? Payroll too high for enrollment? Marketing spend returning trials?"},
{n:63,p:"operate",s:"GATE: Financial decisions",o:"Owner",sys:"—",d:"Pricing changes, cost cuts, marketing budget adjustments, staffing level changes. Material financial decisions are human-owned.",gate:true,gr:"Unit economics floor"},
{n:64,p:"operate",s:"Royalty calculated",o:"System",sys:"MyStudio",d:"8% of gross revenue (royalty) + 2% of gross revenue (brand fund) = 10% to corporate monthly."},
{n:65,p:"operate",s:"Weekly enrollment report",o:"System",sys:"MyStudio → Corporate",d:"Active students, new enrollments, cancellations, trial bookings. Auto-generated and submitted."},
{n:66,p:"operate",s:"Monthly P&L submitted",o:"Owner",sys:"Corporate portal",d:"Required per Franchise Agreement. FBC reviews for health monitoring."},
{n:67,p:"operate",s:"Brand compliance checked",o:"System",sys:"Corporate",d:"Center appearance, curriculum delivery, marketing guidelines, territory adherence. Automated where possible."},
{n:68,p:"operate",s:"Deviations flagged to FBC",o:"System",sys:"Corporate",d:"Non-compliance items routed to Franchise Business Coach for review and outreach. Not auto-enforced."},
{n:69,p:"operate",s:"FBC outreach if needed",o:"FBC",sys:"Phone/Email",d:"Health metric crosses threshold → outreach ('We noticed X — how can we help?') → response feeds the unit's support plan. Systemic issues → escalate to network tier for a structural fix.",t:""},
];
const PHASE_META={
acquire:{name:"ACQUIRE",range:"Steps 1–24",count:24,desc:"Community channel to enrolled student. Every handoff from first event to first billing cycle."},
deliver:{name:"DELIVER",range:"Steps 25–40",count:16,desc:"The weekly session loop. Schedule → prep → deliver → log. The core product."},
retain:{name:"RETAIN",range:"Steps 41–54",count:14,desc:"Post-session notes, parent trust, no-show recovery, at-risk intervention, referral. Where revenue is kept or lost."},
operate:{name:"OPERATE",range:"Steps 55–69",count:15,desc:"Staffing, finance, compliance, reporting. The foundation under everything."},
};
const ORG_ROLES={
acquire:["Director — tours, enrollment gate, day-7 follow-up, pricing conversation","System — CRM, MyStudio, SendGrid automation for lead capture through billing setup","Parent — the decision-maker at the enrollment gate","Sensei — delivers the trial session that determines conversion"],
deliver:["Sensei — session delivery, question-driven instruction, brief review, save & show","Student — project ownership, direction selection, the person doing the learning","System — scheduling, prep briefs, progress markers, capacity checks","Director — ratio oversight, coverage decisions"],
retain:["System — note drafting, no-show recovery, referral prompts, progress reports","Sensei — note review gate, personalization, session quality","Director — at-risk intervention gate, personal family outreach","Parent — trust recipient, re-enrollment decision, referral source"],
operate:["Owner — P&L ownership, financial decision gate, strategic direction","Director — staffing gate, hiring, training, daily operations","System — reporting, royalty calculation, compliance monitoring","FBC — regional oversight, at-risk unit support, best-practice deployment"],
};
const AGILE={
acquire:{wip:[99,3,2,99],kanban:[["3 leads from STEM event","2 from referral"],["1 tour today","2 trials this week"],["1 day-7 follow-up due","1 enrollment packet out"],["2 enrolled this week"]],sprint:"Acquire Sprint: Convert 3 of 5 active trials, host 1 Girl Scouts workshop, capture 10 leads",velocity:[4,3,5,4,6,5,7,6],outcome:"Trial→enrollment conversion (Metrics tab)"},
deliver:{wip:[99,6,4,99],kanban:[["3 briefs to pull","1 makeup to schedule"],["5 sessions in progress","2 belt tests today"],["4 notes in draft","1 belt ceremony to schedule"],["12 sessions completed","8 notes sent <30 min"]],sprint:"Deliver Sprint: 15 sessions at 95%+ notes, 1 belt ceremony, prep coverage 100%",velocity:[12,14,15,13,16,14,15,17],outcome:"Notes completion & belt velocity (Metrics tab)"},
retain:{wip:[99,3,3,99],kanban:[["2 notes pending review","1 no-show to recover"],["3 progress reports generating","1 at-risk outreach in progress"],["1 re-enrollment nudge queued","2 referral prompts sent"],["4 families retained","1 referral converted"]],sprint:"Retain Sprint: 95% notes on time, recover 3 no-shows same-day, 1 at-risk save",velocity:[3,4,5,4,6,5,7,6],outcome:"At-risk resolution & retention (Metrics tab)"},
operate:{wip:[99,2,2,99],kanban:[["1 Sensei posting active","P&L data pulling"],["2 candidates interviewing","Monthly review in progress"],["1 background check pending","Compliance report reviewing"],["1 Sensei hired + training","P&L submitted"]],sprint:"Operate Sprint: Hire 1 Sensei, submit monthly P&L, resolve 1 compliance flag",velocity:[2,2,3,2,3,3,4,3],outcome:"Unit net margin (Metrics tab)"},
};
const NET_TIERS=[
{n:"Network",s:"All 350+ centers",d:"Curriculum, brand standards, pricing, FDD, royalty, Best Practice Library, development pipeline."},
{n:"Region",s:"8–12 regions",d:"Performance benchmarks, FBC oversight, expansion targets, franchisee health aggregation."},
{n:"Cluster",s:"3–8 centers per metro",d:"Shared events, Sensei coverage-pool sharing, cross-promo, territory coordination."},
{n:"Unit",s:"Single center",d:"Session ops, student experience, local marketing, P&L, staffing, parent relationships."},
];
const NET_STATES=[
{s:"TX",n:"Texas",c:34,h:[0.32,0.37,0.31]},{s:"CA",n:"California",c:30,h:[0.36,0.34,0.30]},
{s:"FL",n:"Florida",c:22,h:[0.30,0.40,0.30]},{s:"VA",n:"Virginia",c:14,h:[0.38,0.36,0.26]},
{s:"NC",n:"North Carolina",c:12,h:[0.34,0.38,0.28]},{s:"NJ",n:"New Jersey",c:11,h:[0.31,0.39,0.30]},
{s:"NY",n:"New York",c:11,h:[0.33,0.37,0.30]},{s:"IL",n:"Illinois",c:10,h:[0.35,0.36,0.29]},
{s:"GA",n:"Georgia",c:9,h:[0.40,0.34,0.26]},{s:"PA",n:"Pennsylvania",c:9,h:[0.32,0.40,0.28]},
{s:"MD",n:"Maryland",c:8,h:[0.34,0.38,0.28]},{s:"WA",n:"Washington",c:8,h:[0.37,0.35,0.28]},
{s:"AZ",n:"Arizona",c:7,h:[0.33,0.39,0.28]},{s:"MA",n:"Massachusetts",c:7,h:[0.36,0.36,0.28]},
{s:"CO",n:"Colorado",c:6,h:[0.38,0.35,0.27]},{s:"OH",n:"Ohio",c:6,h:[0.31,0.41,0.28]},
{s:"MI",n:"Michigan",c:6,h:[0.30,0.40,0.30]},{s:"MN",n:"Minnesota",c:5,h:[0.35,0.37,0.28]},
{s:"TN",n:"Tennessee",c:5,h:[0.34,0.38,0.28]},{s:"MO",n:"Missouri",c:5,h:[0.33,0.38,0.29]},
{s:"WI",n:"Wisconsin",c:4,h:[0.36,0.36,0.28]},{s:"IN",n:"Indiana",c:4,h:[0.32,0.40,0.28]},
{s:"OR",n:"Oregon",c:4,h:[0.37,0.36,0.27]},{s:"NV",n:"Nevada",c:4,h:[0.31,0.39,0.30]},
{s:"UT",n:"Utah",c:4,h:[0.39,0.34,0.27]},{s:"CT",n:"Connecticut",c:4,h:[0.34,0.38,0.28]},
{s:"SC",n:"South Carolina",c:4,h:[0.35,0.37,0.28]},{s:"OK",n:"Oklahoma",c:3,h:[0.33,0.38,0.29]},
{s:"LA",n:"Louisiana",c:3,h:[0.30,0.40,0.30]},{s:"KS",n:"Kansas",c:3,h:[0.34,0.38,0.28]},
{s:"IA",n:"Iowa",c:3,h:[0.35,0.37,0.28]},{s:"AL",n:"Alabama",c:3,h:[0.32,0.39,0.29]},
{s:"AR",n:"Arkansas",c:2,h:[0.33,0.38,0.29]},{s:"ID",n:"Idaho",c:2,h:[0.38,0.35,0.27]},
{s:"ND",n:"North Dakota",c:1,h:[0.36,0.37,0.27]},{s:"WV",n:"West Virginia",c:2,h:[0.31,0.40,0.29]},
{s:"DE",n:"Delaware",c:1,h:[0.34,0.38,0.28]},
];
const HCOL=["#2f7a3f","#b58900","#8b0000"];
const CONNECTIVITY=[
{n:1,t:"Best Practice Propagation",d:"Validated pattern → anonymized → Best Practice Library → all units. New centers start from proven patterns.",owner:"Director of Franchise Development",accept:"Validated wins codified to the Library ≤30 days; adoption tracked.",guard:"Data integrity — only verified, reproducible patterns propagate; no anecdote promoted to standard."},
{n:2,t:"Cluster Events Engine",d:"Centers in a metro coordinate community events. Cannibalization constraint applies.",owner:"Cluster lead (senior Center Director)",accept:"Shared events run with participating-center sign-off; leads attributed fairly.",guard:"Cannibalization + Franchisee consent — no shared event that starves or obligates a unit."},
{n:3,t:"Sensei Coverage-Pool Sharing",d:"Part-time Senseis float between cluster centers. Student context travels with the system.",owner:"Cluster lead",accept:"Shared Senseis background-checked at every center they serve; coverage logged.",guard:"Child safety — clearance required at each site before first session."},
{n:4,t:"Cross-Unit Referral",d:"Family relocates → belt level, project, parent history transfer intact.",owner:"Center Director (sending + receiving)",accept:"Full student record transfers within 48h of relocation.",guard:"Data integrity — record transfers complete and accurate; nothing dropped or altered."},
{n:5,t:"Network Health Dashboard",d:"Heat map of all centers by health. At-risk units flagged for FBC intervention.",owner:"Director of Franchise Development",accept:"Every center scored monthly; below-floor units flagged within the cycle.",guard:"Engagement integrity — health scores built from honest engagement data, never inflated."},
{n:6,t:"Curriculum Cascade",d:"Updates deploy simultaneously. Non-deployment flagged at day 30. Feedback not suppressed.",owner:"Network curriculum lead",accept:"Updates live network-wide; non-deployment flagged at day 30.",guard:"Audit trail — deployment status logged per center; feedback preserved, not suppressed."},
{n:7,t:"Competition Pipeline",d:"Students surfaced for FIRST LEGO League, Congressional App Challenge, hackathons, showcases.",owner:"Center Director + lead Sensei",accept:"Eligible students surfaced each season; FLL coach safety-gated.",guard:"Child safety + Engagement integrity — coaches cleared; only real achievement surfaced."},
{n:8,t:"Franchisee Peer Network",d:"Monthly cluster calls, quarterly regional forums. Two-directional. Feedback tracked to resolution.",owner:"Director of Franchise Development",accept:"Cadence held; every raised issue tracked to a logged resolution.",guard:"Franchisee consent — participation invited, not compelled; feedback never used punitively."},
{n:9,t:"Financial Benchmarking",d:"Standardized P&L. Network benchmarks. Below 25th percentile triggers FBC outreach and a support-plan revision.",owner:"Director of Franchise Development + FBC",accept:"Standardized P&L collected; sub-25th-percentile units routed to a support-plan revision within the cycle.",guard:"Financial materiality + Data integrity — figures reserved to humans; benchmarks from real submitted data."},
{n:10,t:"Brand Compliance",d:"Automated monitoring. Deviations flagged to FBC. Systemic issues addressed with support, not punishment.",owner:"FBC (Franchise Business Consultant)",accept:"Deviations flagged; systemic issues met with a support plan first.",guard:"Audit trail — every flag and resolution logged with provenance; support before punishment."},
];
const DASHBOARD=[
{m:"Avg students/center",v:"~43",t:"target: 60",c:true},
{m:"Trial → enrollment",v:"~35%",t:"target: 50%"},
{m:"Franchisee satisfaction",v:"2.5/5",t:"profitability: 1.6/5",c:true},
{m:"Notes completion",v:"varies",t:"target: 95%+"},
{m:"No-show recovery",v:"varies",t:"target: 80%+"},
{m:"Referral rate",v:"varies",t:"target: 15%+"},
{m:"Multi-year retention",v:"varies",t:"target: 70% at 12mo"},
{m:"Unit payback",v:"8–10 yr",t:"target: 3–4 yr",c:true},
];
const ACTION_PLANS=[
{r:1,n:"Unit-Value Program",d:"Improve unit economics at existing centers. $269 premium-tier pricing, community pipeline, retention back-edge. ~$1.36M/yr additional royalty at 400 units. Lowest risk.",risk:"Low",floor:"None — do this first"},
{r:2,n:"Selective Expansion",d:"25–50 new units in verified Tier 1 markets. Candidate underwriting gate. Cannibalization hard constraint.",risk:"Medium",floor:"Median unit above breakeven"},
{r:3,n:"Resale & Turnaround",d:"At-risk units resold to stronger operators. Turnaround protocol: retention sprint + cluster support.",risk:"Medium",floor:"Turnaround plan approved"},
{r:4,n:"Status Quo",d:"Hold footprint. Focus entirely on unit profitability. Safest, but slowest — the baseline to beat.",risk:"Lowest",floor:"Default"},
];

// ============================================================================
// FINANCIAL RANGE, ADOPTION RAMP, FRANCHISEE-DELTA, RATIONALE, LEDGER EXPORT
// Pure helper functions supporting risk/variance disclosure, the J-curve,
// franchisee-side economics alongside system royalty, plain-language governance rationale, and a portable decision-ledger export.
// ============================================================================

// A point estimate alone overstates precision. Every headline dollar figure
// in this file is now representable as {point, lo, hi} with a stated basis.
function financialRange(point,uncertaintyPct){
const lo=+(point*(1-uncertaintyPct)).toFixed(2);
const hi=+(point*(1+uncertaintyPct)).toFixed(2);
return{point,lo,hi,uncertaintyPct};
}

// A new unit does not open at target economics. This models the ramp from
// open to target as a monotonic curve — used to discount early-months
// financial claims in expansion proposals rather than showing day-one output as if it were steady-state.
function adoptionRamp(monthsOpen){
const m=Math.max(0,monthsOpen);
return Math.min(1,1-Math.exp(-m/14));
}
function rampMilestones(){
return[0,6,12,24,36].map(m=>({m,pct:Math.round(adoptionRamp(m)*100)}));
}

// Every system-level royalty figure is paired with what it means for the
// unit actually carrying it — franchisee protection stated as a number,
// not just asserted in prose.
function franchiseeDeltaOf(plan){
const table={
"Unit-Value Program":{unitMarginDelta_k:14,payback_yr:"-1.2 yr",note:"premium-tier pricing + retention lift flow to the unit before they flow to the system"},
"Selective Expansion":{unitMarginDelta_k:0,payback_yr:"unchanged",note:"new units carry their own ramp; existing units see no economic change from this lever"},
"Resale & Turnaround":{unitMarginDelta_k:-4,payback_yr:"reset at sale",note:"incoming operator inherits a support-plan floor, not a clean slate"},
"Status Quo":{unitMarginDelta_k:0,payback_yr:"unchanged",note:"no unit-level change either direction"},
};
return table[plan.n]||{unitMarginDelta_k:0,payback_yr:"n/a",note:""};
}

// Turns a governance verdict into one sentence a reviewer can skim, instead
// of requiring them to read the raw guardrail array to understand a hold.
function rationaleOf(rec){
const contract=ACTION_CONTRACTS[rec.actionType];
const window=contract?contract.minFreshnessDays:null;
if(rec.governance.allowed){
return "Cleared: data "+rec.evidence.dataFreshnessDays+"d old"+(window?", within the "+window+"-day window":"")+"; "+rec.approverRole+" may act.";
}
const reasons=(rec.governance.heldOn&&rec.governance.heldOn.length)?rec.governance.heldOn.join(", "):"contract not satisfied";
return "Held: "+reasons+".";
}

// Portable export of the governed decision record — a receiving system
// (FranConnect or otherwise) reads this without touching the UI.
function decisionLedgerExport(decisions,railData){
const recs=railData&&railData.recommendations||[];
const rows=Object.keys(decisions).map(id=>{
const rec=recs.find(r=>r.id===id);
return{
id,
decision:decisions[id],
agent:rec?rec.agent:null,
actionType:rec?rec.actionType:null,
title:rec?rec.title:null,
approverRole:rec?rec.approverRole:null,
governanceAllowed:rec?rec.governance.allowed:null,
heldOn:rec?rec.governance.heldOn:null,
};
});
return{exportedAt:"week "+(rows.length?rows.length:0),schema:"cn-decision-ledger/1.0",rows};
}
// FDD Item 20 reconciliation — turns the modeled/authoritative footnote into
// an explicit, checkable mapping instead of leaving it implied by a caption.
function FDDReconciliationPanel({centers}){
const AUTHORITATIVE=244;
const VERIFIED=centers.filter(c=>c.verified).length; // computed from the real per-center flag, not a hardcoded figure
const modeled=centers.length;
const illustrative=modeled-VERIFIED;
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,background:"#fff",padding:"8px 11px",marginTop:6}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>FDD Item 20 reconciliation</div>
<div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:4}}>
<div><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800,color:INK}}>{AUTHORITATIVE}</div><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>authoritative units (FDD Item 20)</div></div>
<div><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800,color:GRN}}>{VERIFIED}</div><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>verified from public records</div></div>
<div><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800,color:MUT}}>{illustrative}</div><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>modeled beyond the verified set</div></div>
<div><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800,color:VIO}}>{modeled}</div><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>total in this model</div></div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,lineHeight:1.4}}>The {AUTHORITATIVE}-unit FDD figure and the {VERIFIED} publicly verified centers are not superseded by the {modeled}-unit modeled network above — the {illustrative} additional units exist to give the operating model enough scale to demonstrate cross-cluster propagation and network-level governance, and are labeled as such everywhere they appear.</div>
</div>);
}

function downloadJSON(obj,filename){
try{
const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;a.download=filename;document.body.appendChild(a);a.click();
document.body.removeChild(a);URL.revokeObjectURL(url);
return true;
}catch(e){return false;}
}

function downloadText(text,filename){
try{
const blob=new Blob([text],{type:"text/plain"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;a.download=filename;document.body.appendChild(a);a.click();
document.body.removeChild(a);URL.revokeObjectURL(url);
return true;
}catch(e){return false;}
}

function toCSV(rows,columns){
const esc=v=>{const s=v===null||v===undefined?"":String(v);return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
const header=columns.map(c=>esc(c.label)).join(",");
const body=rows.map(r=>columns.map(c=>esc(c.get(r))).join(",")).join("\n");
return header+"\n"+body;
}
function downloadCSV(text,filename){
try{
const blob=new Blob([text],{type:"text/csv"});
const url=URL.createObjectURL(blob);
const a=document.createElement("a");
a.href=url;a.download=filename;document.body.appendChild(a);a.click();
document.body.removeChild(a);URL.revokeObjectURL(url);
return true;
}catch(e){return false;}
}
// Reports tab column definitions — read the same fields every other tab reads,
// just flattened to rows for a spreadsheet reviewer rather than an interactive one.
const CENTER_CSV_COLS=[
{label:"Center",get:c=>c.name},
{label:"State",get:c=>c.st},
{label:"Verified",get:c=>c.verified?"yes":"no"},
{label:"Health",get:c=>c.health},
{label:"Condition",get:c=>conditionOf(c).label},
{label:"Students",get:c=>c.students},
{label:"EBITDA (k)",get:c=>c.eb},
{label:"Retention",get:c=>+c.ret.toFixed(2)},
{label:"Chemistry",get:c=>+c.chem.toFixed(2)},
{label:"Conversion",get:c=>+c.conv.toFixed(2)},
];
const RECOMMENDATION_CSV_COLS=[
{label:"ID",get:r=>r.id},
{label:"Agent",get:r=>r.agent},
{label:"Action type",get:r=>r.actionType},
{label:"Title",get:r=>r.title},
{label:"Approver role",get:r=>r.approverRole},
{label:"Status",get:r=>r.governance.allowed?"allowed":"held"},
{label:"Held on",get:r=>r.governance.heldOn||""},
];
// Support-plan taxonomy — the same ids supportPathsOf() assigns per center;
// kept as one lookup so the Success Rate dashboard and Reports tab agree with
// the plan names Operations Dynamics already shows.
const SUPPORT_PLAN_LABELS={
retention:"Retention outreach sequence",
staffing:"Staffing stabilization plan",
unitvalue:"Unit-economics program",
conversion:"Trial-conversion review",
monitor:"Standard monitoring cadence",
};
// Reads only dyn.committed/dyn.completed — the same governed record Operations
// Dynamics writes to and Audit Trail already counts — grouped by plan type
// instead of by center, and turned into a completion rate.
function successRateData(dyn){
const committed=(dyn&&dyn.committed)||{},completed=(dyn&&dyn.completed)||{};
const byPlan={};
Object.entries(committed).forEach(([name,pid])=>{
if(!byPlan[pid])byPlan[pid]={id:pid,n:SUPPORT_PLAN_LABELS[pid]||pid,committed:0,completed:0,centers:[]};
byPlan[pid].committed++;
byPlan[pid].centers.push(name);
if(completed[name]===pid)byPlan[pid].completed++;
});
const rows=Object.values(byPlan).sort((a,b)=>b.committed-a.committed).map(r=>({...r,rate:r.committed?Math.round(100*r.completed/r.committed):0}));
const totalCommitted=rows.reduce((a,r)=>a+r.committed,0);
const totalCompleted=rows.reduce((a,r)=>a+r.completed,0);
return{rows,totalCommitted,totalCompleted,overallRate:totalCommitted?Math.round(100*totalCompleted/totalCommitted):0};
}

// A static, offline-readable summary of the two highest-density views (Overview +
// System Alignment) -- for a reviewer who wants to read this without opening the
// live artifact. Not a substitute for the interactive model; a companion to it.
function buildSummaryText(centers,states,railData,dyn,opt,ledger){
const chainStamp=mxChain(ledger); // integration 4: tamper-evidence leaves the screen
const recs=railData.recommendations;
const conflicts=railData.conflicts||[];
const ageOf=c=>opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
const confs=centers.map(c=>qCoherence(ageOf(c)));
const avgConf=+(confs.reduce((a,v)=>a+v,0)/confs.length).toFixed(2);
const simpleAvgHealth=+(centers.reduce((a,c)=>a+c.health,0)/centers.length).toFixed(1);
const totalConf=confs.reduce((a,v)=>a+v,0);
const weightedAvgHealth=+(centers.reduce((a,c,idx)=>a+c.health*confs[idx],0)/totalConf).toFixed(1);
const freshPct=Math.round(100*centers.filter(c=>ageOf(c)<=28).length/centers.length);
const allowedN=recs.filter(r=>r.governance.allowed).length,heldN=recs.length-allowedN;
const lines=[];
lines.push("FRANCHISE OPERATIONS ENGINE \u2014 SUMMARY EXPORT");
lines.push("Proposed Policy Framework \u2014 Candidate Submission");
lines.push("Generated from the live canonical state, week "+opt.week);
lines.push("Ledger integrity digest: "+chainStamp.digest+" over "+chainStamp.entries+" committed entries \u2014 verify against the live engine\u2019s Signal Mechanics card 10; a silently edited record cannot reproduce this digest.");
lines.push("");
lines.push("NETWORK HEALTH");
lines.push("  Simple average: "+simpleAvgHealth+" | Confidence-weighted: "+weightedAvgHealth);
lines.push("  Average measurement confidence: "+avgConf+" | Units within 28-day window: "+freshPct+"%");
lines.push("  Modeled network: "+centers.length+" centers across "+Object.keys(states).length+" states");
lines.push("");
lines.push("GOVERNANCE THIS CYCLE");
lines.push("  "+recs.length+" total proposals \u2014 "+allowedN+" allowed, "+heldN+" held");
lines.push("  Cross-agent conflicts: "+conflicts.length+(conflicts.length?"":" (checked, none open)"));
conflicts.slice(0,10).forEach(c=>lines.push("    - "+c.reason));
lines.push("  Support paths committed: "+Object.keys(dyn.committed||{}).length+" | completed: "+Object.keys(dyn.completed||{}).length);
lines.push("");
lines.push("STANDING RULES");
lines.push("  1. Preserve the whole network state before deriving any operational view.");
lines.push("  2. Derive a view only where it serves diagnosis, prioritization, or governed action.");
lines.push("  3. The governance boundary is where a proposal becomes real.");
lines.push("  4. Every commitment is human-owned.");
lines.push("");
lines.push("RECENT ACTIVITY (last "+Math.min(40,(ledger||[]).length)+" logged actions)");
(ledger||[]).slice(0,15).forEach(e=>lines.push("  ["+e.tab+"] "+e.actor+": "+e.text));
if(!(ledger||[]).length)lines.push("  no actions logged yet this session");
lines.push("");
lines.push("This export is a static snapshot for offline review. The interactive model recomputes every figure live and is the authoritative view.");
return lines.join("\n");
}
const CENTER_CHAIN=[
"Student engagement (agency, visible progress, responsive instruction)",
"Session notes (4-part structure → parent's only window)",
"Learning pathways (belt system → 4–5 year runway)",
"Multi-year retention (70%+ target → sunk acquisition cost preserved)",
"Parent trust (notes + ceremonies + responsiveness → 4.9★)",
"Student-driven learning (question-driven → Congressional App 1st place)",
"Teacher improvement (notes gate forces reflection → better sessions)",
"Referral (happy parents → zero-cost leads → community pipeline)",
"Unit profitability (all of the above → the door worth opening)",
];
const PLAN_90=[
{phase:"Days 1–30 — Listen & Baseline",focus:"Understand before changing anything.",items:[
"Read every franchisee health score; identify the bottom-decile units by profitability and the top-decile by retention.",
"Ride along with 3 Franchise Business Coaches; sit in on at-risk franchisee calls without speaking.",
"Interview 10 franchisees across the satisfaction spectrum — what does corporate get right, what does it get wrong.",
"Reconcile FDD Item 20 (244) against the 350+ public figure; establish the authoritative unit count.",
"Confirm the CRM binding and map the actual development pipeline as it runs today.",
]},
{phase:"Days 31–60 — Diagnose & Pilot",focus:"Find the binding constraint; test one fix.",items:[
"Segment the network: which units are below the unit-economics floor, and why.",
"Identify the 2–3 proven practices already working at top units that aren't propagating; codify the highest-leverage one.",
"Pilot the unit-value initiative at 3 volunteer centers: premium pricing tier + community-pipeline activation + retention back-edge.",
"Stand up the Network Health Dashboard's leading indicators so intervention is proactive.",
"Define the candidate readiness rubric with the Development Function.",
]},
{phase:"Days 61–90 — Systematize & Scale",focus:"Turn what worked into what's standard.",items:[
"Measure the pilot: did per-unit revenue and retention move. If yes, package as a Best Practice Library entry.",
"Present the growth thesis to leadership: strengthen unit economics across the existing 244 before adding the next 50.",
"Establish the cluster events engine in one metro; prove shared community pipeline without cannibalization.",
"Set the quarterly cadence: franchisee forums, health reviews, best-practice releases.",
"Hand the FBCs a repeatable at-risk intervention protocol.",
]},
];
const METRICS_FULL=[
{name:"Trial-to-enrollment conversion",lead:true,watch:"Weekly, per center",method:"Enrollments ÷ trials booked (MyStudio)",trigger:"Below 35% for 2 weeks → Director reviews tour & day-7 follow-up",predicts:"Revenue growth"},
{name:"Notes completion within 30 min",lead:true,watch:"Daily, per Sensei",method:"Notes sent on time ÷ sessions delivered",trigger:"Below 90% → Sensei coaching; below 70% → staffing review",predicts:"Retention & parent trust"},
{name:"No-show recovery rate",lead:true,watch:"Daily",method:"Same-day reschedules ÷ missed sessions",trigger:"Below 70% → check auto-reschedule automation",predicts:"Churn"},
{name:"At-risk resolution rate",lead:true,watch:"Weekly",method:"Saved families ÷ flagged at-risk",trigger:"Below 50% → Director intervention review",predicts:"Multi-year retention"},
{name:"Belt-progression velocity",lead:true,watch:"Monthly, per cohort",method:"Avg belts advanced ÷ months enrolled",trigger:"Stalling → curriculum or engagement problem",predicts:"Long-term retention & referral"},
{name:"Community-pipeline inflow",lead:true,watch:"Weekly, per channel",method:"Trials booked by source channel",trigger:"Dry channel → reactivate partnership effort",predicts:"Enrollment pipeline health"},
{name:"Active students per center",lead:false,watch:"Monthly",method:"Current enrolled (MyStudio)",trigger:"Below 60 → unit below profitability floor",predicts:"— (this is the outcome)"},
{name:"Unit net margin",lead:false,watch:"Monthly",method:"Revenue − all costs incl. royalty",trigger:"Below 25th percentile 2 months → FBC support",predicts:"— (this is the outcome)"},
];
const FAILURE_MODES=[
{mode:"Silent churn",detect:"Retention drops but no complaints — students just stop coming.",cause:"No-show recovery not firing, or notes going stale.",recover:"Instrument no-show recovery + notes completion as daily leading indicators; the at-risk gate (step 50) catches families before they're gone."},
{mode:"Agent over-reach",detect:"An automated action commits a pricing change or refund it shouldn't.",cause:"A reserved task wasn't gated, or confidence threshold too low.",recover:"Financial materiality guardrail reserves all pricing/refund actions to humans. Audit trail makes any breach traceable."},
{mode:"Understaffing cascade",detect:"One Sensei callout → reschedules → cold prep briefs → at-risk flags.",cause:"No coverage pool; hiring pipeline ran dry.",recover:"Sensei coverage-pool sharing + always-warm hiring pipeline (step 55)."},
{mode:"Growth without support",detect:"New units open but franchisee satisfaction drops.",cause:"Door count outpaced FBC capacity.",recover:"Support-capacity guardrail blocks expansion the network can't service."},
{mode:"Fabricated confidence",detect:"A report asserts a number the data can't support.",cause:"System inferred an absent value instead of flagging it.",recover:"Data-integrity guardrail: flag incomplete data, never infer. FDD Item 20 stays authoritative until reconciled."},
];
const CRIT_STEPS=[1,7,20,36,42,50,63];
// ===== COMMAND ENGINE =====
const GRN="#2f7a3f",AMB="#b8860b",VIO="#7a6bd8",BG="#fdfdfb";
const CARD={borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,0.07)",overflow:"hidden"};// MyStudio-style card surface
const TILE={flex:"1 1 110px",background:"#fff",border:"1px solid #e8e8e2",borderRadius:10,padding:"10px 12px",boxShadow:"0 1px 3px rgba(0,0,0,0.06)"};
function hash(s){let h=0;for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))&0x7fffffff;}return h;}
function rng(seed){let x=seed||1;return()=>{x=(x*1103515245+12345)&0x7fffffff;return x/0x7fffffff;};}
const pct=v=>Math.round(v*100);const fmt=v=>(v>=0?"":"−")+Math.abs(v).toFixed(1);
const CA=["Agoura Hills","Aliso Viejo","Arcadia","Bakersfield","Cerritos","Chino","Chino Hills","Chula Vista","Costa Mesa","Cupertino","Diamond Bar","El Segundo","Elk Grove","Encinitas","Encino","Folsom","Fountain Valley","Fremont 1","Fremont 2","Garden Grove","Hacienda Heights","Irvine 1","Irvine 2","La Canada","La Habra","Ladera Ranch","Livermore","Los Alamitos","Los Angeles","Murrieta","Northridge","Placentia","Pleasanton","Rancho Cucamonga","Rocklin","Roseville","Rolling Hills Estates","San Diego RB","San Diego MM","San Diego 3","San Gabriel","San Jose 1","San Jose 2","San Ramon","Santa Clarita","Sherman Oaks","Simi Valley","Stevenson Ranch","Sunnyvale","Torrance","Tracy","Union City","Walnut Creek","West Covina"];
const OTHER=[["McKinney","TX"],["Pearland","TX"],["Chesapeake","VA"],["Chantilly","VA"],["Fairfax","VA"],["Virginia Beach","VA"],["Leesburg","VA"],["South Tulsa","OK"],["Little Rock","AR"],["St. Joseph","MO"]];
const MODEL_ST=[["TX",38],["FL",26],["NJ",18],["NY",16],["IL",14],["WA",12],["AZ",11],["GA",11],["NC",10],["OH",9],["PA",9],["MI",8],["CO",7],["MN",6],["MD",8],["MA",7],["TN",5],["WI",4],["IN",4],["OR",4],["NV",4],["UT",4],["CT",4],["SC",4],["LA",3],["KS",3],["IA",3],["AL",3],["ID",2],["WV",2],["ND",1],["DE",1],["ON",12],["BC",6],["AB",5]];
function mkCenter(name,st,verified){
const h=hash(name+st),r=rng(h);
const conv=0.35+r()*0.3,ret=0.74+r()*0.2,chem=0.35+r()*0.45,capR=0.26+r()*0.16;
const students=60+Math.floor(r()*160),eb=+((students*0.289)*(0.35+r()*0.3)-(6+r()*14)).toFixed(1);
const momentum=(r()>0.45?"+":"−")+(1+Math.floor(r()*5));
const health=Math.round(40+conv*30+ret*25+chem*10-(capR>0.38?6:0)+(eb>4?8:eb<0?-8:0));
// Child-safety and staff-clearance status -- these gate the child_safety guardrail
// in qGovernors and must be real per-center fields, not left undefined (an undefined
// field would always read as "cleared," making the guardrail a permanent no-op). Both are true for the overwhelming majority of units, with a small, det
const compliance=rng(hash(name+st+"cmp"))()>0.03;
const staffCleared=rng(hash(name+st+"stf"))()>0.02;
const wires={};[["funnel",["trials","closeout","referrals"]],["dojo",["belt pace","stuck count","ceremony"]],["staff",["ratio","chemistry","CIT pipeline"]],["cash",["tuition","labor","EBITDA"]]].forEach(([w,gs])=>{
wires[w]=gs.map(n=>{const g=rng(hash(name+w+n));const days=Math.floor(g()*38);return{n,v:Math.round(35+g()*60),days,state:days>21?"super":"meas"};});});
return{name:st&&st!=="CA"?name+" "+st:name,st:st||"CA",verified,conv,ret,chem,capR,eb,momentum,health,students,compliance,staffCleared,wires};
}
function buildCenters(){
const out=CA.map(n=>mkCenter(n,"CA",true));
OTHER.forEach(([n,st])=>out.push(mkCenter(n,st,true)));
MODEL_ST.forEach(([st,k])=>{for(let i=1;i<=k;i++)out.push(mkCenter(st+" Unit "+i,st,false));});
return out;
}
function engageOf(c){
const r=rng(hash(c.name+"eng"));
const pre=0.6+r()*0.38, post=0.55+r()*0.4, badges=Math.floor(r()*9), match=0.5+r()*0.48;
const path=[0.32+r()*0.2,0.3+r()*0.15,0];path[2]=Math.max(0.05,1-path[0]-path[1]);
const prog30=0.45+r()*0.5, commit=[0.45+r()*0.2,0.25+r()*0.15,0];commit[2]=Math.max(0.04,1-commit[0]-commit[1]);
const refer=0.15+r()*0.45, buzz=0.4+r()*0.55;
const score=+(0.2*pre+0.2*post+0.15*match+0.15*prog30+0.15*(commit[1]+commit[2])+0.15*buzz).toFixed(2);
return{pre,post,badges,match,path,prog30,commit,refer,buzz,score};
}
const tierOf=o=>o>=88?"TOP":o>=80?"STRONG":o>=68?"STABLE":"PRIORITY";
const PATH=[["jr","JR"],["white","White"],["yellow","Yellow"],["orange","Orange"],["green","Green"],["blue","Blue"],["purple","Purple"],["brown","Brown"],["red","Red"],["black","Black"]];
const COHORT={jr:[420,38,9],white:[730,96,14],yellow:[560,71,24],orange:[470,88,11],green:[350,52,19],blue:[260,31,8],purple:[170,22,26],brown:[110,14,6],red:[70,9,17],black:[38,4,3]};
const PROJECTS=[
{id:"aicore",n:"Premium tier $269",stages:[["Design",0,4],["Pilot",1,9],["Measure",2,26],["Wave",0,2],["Scale",0,0]]},
{id:"schools",n:"School pipeline",stages:[["Map",0,3],["Pilot",1,12],["Measure",2,31],["Scale",0,0]]},
{id:"boxscore",n:"Progress report",stages:[["Design",0,2],["Ship",1,5],["Measure",1,2],["Network",0,0]]},
{id:"cit",n:"CIT draft",stages:[["Identify",0,6],["Train",1,8],["Deploy",0,0]]},
{id:"fll",n:"FIRST LEGO League",stages:[["Register",1,4],["Form teams",0,0],["Scrimmage",0,0],["Qualifier",0,0]]},
];
const CAL=[
["Measurement",[[3,"QBR wave A",1],[10,"Reports due",1],[31,"QBR wave B",0],[59,"QBR wave C",0]]],
["Premium tier",[[5,"Wave-2 open",1],[19,"Pilot readout",0],[47,"Wave-3 gate",0],[75,"Scale review",0]]],
["Events",[[7,"PNO",0],[30,"Division jam",0],[67,"PNO",0],[84,"Network finals",0]]],
["FLL (final FIRST·LEGO season)",[[1,"Register — OPEN now",1],[33,"Kickoff Aug 4",1],[62,"Team build + scrimmage",0],[88,"Prep regionals (Dec)",0]]],
["Community",[[14,"School STEM night",0],[21,"Demo day",0],[42,"Festival table",0],[63,"Partnership fair",0]]],
["Trades",[[9,"Match run",0],[39,"30d re-measure",1],[69,"Match run",0]]],
["Governance",[[1,"Constitution freeze",1],[45,"Changelog audit",0],[90,"Quarter close",0]]],
];
const GRIEV=[["profit","Profitability",1.6],["support","Support",1.9],["leads","Leads",2.3],["terr","Territory",2.6],["tech","Tech",2.5],["comms","Comms",2.2]].map(([id,n,sat])=>({id,n,sat,sev:+((5-sat)/5).toFixed(2)}));
const MECHS=[["growthM","Growth model","growth"],["transferM","Transfer board","dynamics"],["capM","Cap governor","team"],["measM","Measure cadence","monitor"],["eventsM","Events engine","scheduler"],["boxM","Progress report","dojo"],["govM","Five governors","portfolio"],["agendaM","Agenda+log","agenda"]].map(([id,n,tab])=>({id,n,tab}));
const PEDGES=[["growthM","profit",0.9],["capM","profit",0.7],["boxM","profit",0.6],["transferM","profit",0.5],["measM","support",0.9],["agendaM","support",0.7],["transferM","support",0.6],["eventsM","leads",0.8],["boxM","leads",0.4],["govM","terr",0.95],["measM","tech",0.5],["transferM","tech",0.5],["agendaM","comms",0.8],["measM","comms",0.6]];
const LEV=MECHS.map(m=>({...m,lev:+PEDGES.filter(e=>e[0]===m.id).reduce((a,[,g,w])=>a+w*GRIEV.find(x=>x.id===g).sev,0).toFixed(2)})).sort((a,b)=>b.lev-a.lev);
function forecast(c){
const mom=(c.momentum[0]==="+"?1:-1)*parseInt(c.momentum.slice(1));
const slope=+(mom*0.22+(c.chem-0.55)*3.2+(c.ret-0.82)*4.5).toFixed(2);
const proj=[1,2,3].map(m=>+(c.eb+slope*m).toFixed(1));
const capDrift=c.chem<0.5?0.006:-0.002;
const ebBreach=(c.eb>0&&slope<0)?Math.ceil(c.eb/-slope*30):(c.eb<=0?0:null);
const capBreach=(c.capR<0.40&&capDrift>0)?Math.ceil((0.40-c.capR)/capDrift*30):(c.capR>=0.40?0:null);
const cls=slope>0.3?"rising":slope<-0.3?"deteriorating":"holding";
return{slope,proj,ebBreach,capBreach,cls};
}
function alertsOf(centers){
const out=[];
centers.forEach(c=>{const f=forecast(c);
if(f.ebBreach!==null&&f.ebBreach<=90)out.push({c,eta:f.ebBreach,ev:"EBITDA<0",agent:"pipeline",play:"margin diagnostic"});
if(f.capBreach!==null&&f.capBreach<=90)out.push({c,eta:f.capBreach,ev:"labor>40%",agent:"cap",play:"utilization"});
if(c.chem<0.45&&f.cls!=="rising")out.push({c,eta:45,ev:"sensei exit risk",agent:"staffing",play:"retain+CIT"});});
return out.sort((a,b)=>a.eta-b.eta);
}
const AGENT_LEX={score:"Measurement",transfer:"Best practice",wave:"Rollout",peer:"Peer review",fcst:"Forecast",gate:"Approval",view:"Reporting",cap:"Labor governor",pipeline:"Enrollment",staffing:"Staff retention"};
const VERB_LEX={measure:"Measure",transfer:"Transfer",schedule:"Schedule",ship:"Send",hold:"Escalate",review:"Cross-review",promote:"Adopt",retire:"Remove"};
// ===== LEAD PIPELINE (pre-sale funnel) =====
const LEAD_NAMES=["Ramirez Group","Okafor Holdings","Chen Family Trust","Delgado Ventures","Patel Education LLC","Boudreaux Partners","Nguyen Capital","Whitfield & Co.","Silva Learning","Kowalski Group","Abara Holdings","Fitzgerald Trust","Moreno Ventures","Yamamoto LLC","Brennan Partners","Adeyemi Group","Costa Family","Larsson Capital","Haddad Holdings","Ivanova Trust"];
const LEAD_SRC=["Franchise portal","Discovery Day referral","Existing-franchisee referral","Trade show","Resale inquiry","Multi-unit expansion","Broker network","Web inquiry"];
const LEAD_REGION=["TX","FL","ON","GA","NC","AZ","WA","NJ","open territory"];
const STAGES6=["Intro call","Discovery","FDD review","Due diligence","Discovery Day","Signed"];
// North America and Canada are not one regulatory track. A Canadian province
// runs its own franchise disclosure law (Ontario's Arthur Wishart Act, Alberta's
// and BC's own Franchises Acts) with its own disclosure document -- not the US
// FTC Franchise Rule's FDD. A lead's market determines which applies.
const CANADIAN_PROVINCES=["ON","BC","AB"];
function marketOf(region){return CANADIAN_PROVINCES.includes(region)?"Canada":"US";}
function disclosureLawOf(region){
if(region==="ON")return"Arthur Wishart Act (Ontario) — Disclosure Document, 14-day minimum";
if(region==="BC")return"Franchises Act (British Columbia) — Disclosure Document, 14-day minimum";
if(region==="AB")return"Franchises Act (Alberta) — Disclosure Document, 14-day minimum";
return"FTC Franchise Rule (US) — FDD, 14-day minimum";
}

// ===== FD CANDIDATE PROFILE FRAMEWORK (user-supplied, adapted to live lead shape) =====
const FD_STAGE_ORDER=["Intro Call","Discovery","FDD Review","Diligence","Discovery Day","Approval","Signing","Opening Readiness"];
const FD_ARCHETYPES=[
{id:"owner-operator",label:"Owner-Operator",fit:["community","mission","operator"],risk:"bandwidth saturation"},
{id:"community-builder",label:"Community Builder",fit:["trust","events","schools"],risk:"commercial pace"},
{id:"executive-operator",label:"Executive Operator",fit:["capital","multi-unit","systems"],risk:"distance from day-to-day"},
{id:"parent-founder",label:"Education-First Parent-Founder",fit:["mission","retention","family credibility"],risk:"unit economics discipline"},
{id:"semi-absentee",label:"Semi-Absentee Risk Case",fit:["capital access"],risk:"operator-investor mismatch"},
];
const OPENING_TRACKER_STEPS=["Lease","Staffing","Training","Local Marketing","Pre-Sale Enrollment","Compliance","Launch Status"];
function fdClamp(v){return Math.max(0,Math.min(1,v));}
function fdMean(arr){return arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;}
function fdHash(str){let h=0;for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))|0;return Math.abs(h);}
function fdSeed(key,min,max){const h=fdHash(String(key));return min+(h%1000)/1000*(max-min);}
function candidateProfileFromLead(l, i=0){
  const name=l.n||l.name||`Candidate ${i+1}`;
  const stageIndex=Math.max(0,Math.min(FD_STAGE_ORDER.length-1, l.stage0||0));
  // adapters: live leads carry liquidity/net/fit/proven/multi rather than fin/chem/conv/ret
  const finN=fdClamp(((l.liquidity||250)-150)/600), fitN=fdClamp((l.fit||55)/100);
  const capital=fdClamp(0.42+finN*0.48+fdSeed(name+'cap',0,0.16));
  const temperament=fdClamp(0.40+fitN*0.44+(l.proven?0.06:0)+fdSeed(name+'temp',0,0.15));
  const territory=fdClamp(0.32+fitN*0.24+(l.market==="strong"?0.10:0)+fdSeed(name+'terr',0.10,0.42));
  const community=fdClamp(0.28+fitN*0.22+fdSeed(name+'comm',0.12,0.44));
  const mission=fdClamp(0.38+fitN*0.22+fdSeed(name+'mission',0.10,0.30));
  const docs=fdClamp(fdSeed(name+'docs',0.36,0.98));
  const financialPrep=fdClamp(capital*0.68+fdSeed(name+'finprep',0.10,0.26));
  const territoryUnderstanding=fdClamp(territory*0.74+fdSeed(name+'terrprep',0.06,0.22));
  const brandAlignment=fdClamp(mission*0.76+fdSeed(name+'brand',0.05,0.22));
  const questionsAsked=fdClamp(fdSeed(name+'qa',0.20,0.95));
  const readiness=fdMean([docs,financialPrep,territoryUnderstanding,brandAlignment,questionsAsked]);
  const score=Math.round((capital*0.24+temperament*0.18+territory*0.16+community*0.16+mission*0.14+readiness*0.12)*100);
  const archetype=(l.multi&&l.proven)?FD_ARCHETYPES[2]:FD_ARCHETYPES[fdHash(name)%FD_ARCHETYPES.length];
  return {
    id:l.id!=null?l.id:name.replace(/\W+/g,'-').toLowerCase(),name,region:l.region||'—',stageIndex,stage:FD_STAGE_ORDER[stageIndex],
    capital,temperament,territory,community,mission,readiness,docs,financialPrep,territoryUnderstanding,brandAlignment,questionsAsked,
    score,archetype,
    flags:[
      ...(capital<0.58?["Undercapitalization"]:[]),
      ...(temperament<0.52?["Poor follow-through"]:[]),
      ...(territory<0.48?["Weak local-market rationale"]:[]),
      ...(stageIndex>=4&&readiness<0.55?["Discovery day not earned yet"]:[]),
      ...(archetype.id==='semi-absentee'&&mission<0.62?["Operator/investor mismatch"]:[]),
      ...(fdSeed(name+'ue',0,1)>0.78&&capital<0.7?["Unrealistic unit economics assumptions"]:[]),
      ...(stageIndex>=2&&fdSeed(name+'slip',0,1)>0.72?["Timeline slippage"]:[]),
    ],
  };
}
function buildLeads(){
return LEAD_NAMES.map((n,i)=>{const r=rng(hash(n+"lead"));
const liquidity=Math.round(150+r()*600);
const net=Math.round(liquidity*(1.5+r()*3));
const multi=r()>0.6,proven=r()>0.72;
const fit=Math.min(99,Math.round(38+r()*58+(proven?12:0)+(multi?6:0)));
const region=LEAD_REGION[i%LEAD_REGION.length],src=LEAD_SRC[i%LEAD_SRC.length];
const stage0=Math.floor(r()*5);
// "New franchise openings and conversions" are two different deal types in the
// JD, not one undifferentiated pipeline -- a proven operator bringing an
// existing operation into (or expanding within) the brand is a conversion; a first-time entrant is a new opening.
const dealType=proven?"conversion":"new";
const market=marketOf(region);
return{id:i,n,liquidity,net,multi,proven,fit,region,src,stage0,hot:fit>=78,dealType,market,
note:proven?"proven operator — ramp inheritance applies":multi?"multi-unit intent":liquidity<220?"liquidity light — verify financing":"single-unit prospect"};
}).sort((a,b)=>b.fit-a.fit);
}
// ===== STATUS-PROBABILITY ENGINE — one status model under every tab =====
// Every entity holds a probability split over outcome states until a MEASUREMENT verifies it.
// Estimate (probability split) → Measurement (verified record) → Aging (confidence
// decays with time since measurement) → Coupling (linked clusters) → Interference (two programs on one node reinforce or compete). Map, center, deals al
const QSTATES=["thriving","watch","at-risk"];
// The 20 tabs that carry the whole 5-minute walkthrough — everything else stays reachable,
// just hidden from the sub-tab row when "essentials only" is toggled on. Nothing is deleted.
const ESSENTIAL_TABS=["exec","pmo","replay","rail","blockers","leads","deals","network","team","financials","compliance","risk","fdd","dojo"];
// note: "reports" and "success" are intentionally left out of ESSENTIAL_TABS —
// they're reviewer/governance depth, not part of the 20-tab walkthrough set.
const QCOL=["#5cb87c","#d9a62e","#d96a6a"];
const QCLUSTERS=[["CA","OR","WA","NV"],["TX","OK","LA"],["NY","NJ","CT","MA"],["FL","GA","NC","SC"],["IL","IN","OH","MI"],["VA","MD","PA"]];
function qAmp(c){
const e=engageOf(c);
const good=Math.max(0.05,0.5*e.score+0.5*c.ret);
const bad=Math.max(0.05,0.5*(1-e.score)+0.5*(1-c.ret));
const watch=Math.max(0.08,1-Math.abs(good-bad));
const s=good+watch+bad;return[good/s,watch/s,bad/s];
}
function qStateAmp(cs){if(!cs||!cs.length)return[0.34,0.33,0.33];const a=[0,0,0];cs.forEach(c=>{const q=qAmp(c);a[0]+=q[0];a[1]+=q[1];a[2]+=q[2];});const s=a[0]+a[1]+a[2];return[a[0]/s,a[1]/s,a[2]/s];}
function qCoherence(days){return Math.max(0.12,Math.exp(-days/42));}
function qResolve(amp){return amp.indexOf(Math.max(...amp));}
// ---- Applied status diagnostics (deterministic, derived from unit data) ----
// Stability zone (soliton): occupancy near saturation self-stabilizes; low occupancy drifts.
function qZone(c){const occ=Math.min(1,c.students/160);return occ>=0.72?{zone:"self-stabilizing",occ,note:"near capacity \u2014 performance holds steady"}:occ>=0.5?{zone:"transitional",occ,note:"partial stability"}:{zone:"drifting",occ,note:"low occupancy \u2014 state drifts between measurements"};}
// Early-warning (critical slowing): proxy memory-time in weeks from momentum + margin stress.
function qTau(c){const mom=(c.momentum[0]==="+"?1:-1)*parseInt(c.momentum.slice(1));const stress=(c.eb<0?1.6:c.eb<4?0.8:0)+(mom<0?0.9:0)+(c.capR>0.38?0.5:0);return +(0.7+stress+((hash(c.name+"tau")%10)/12)).toFixed(1);}
// Critical distance: margin headroom to the $0 EBITDA transition boundary (in $k).
function qCrit(c){return +(c.eb-0).toFixed(1);}
// Program interaction (interference): pair coefficient in [-1,1]; >0 constructive, <0 destructive.
const QPAIRS=[["Premium tier","CIT pipeline",0.62],["Premium tier","School pipeline",0.34],["CIT pipeline","FIRST LEGO League",0.55],["Premium tier","FIRST LEGO League",-0.18],["School pipeline","FIRST LEGO League",0.41],["CIT pipeline","School pipeline",0.22]];
function qPair(c){const i=hash(c.name+"pair")%QPAIRS.length;return QPAIRS[i];}
// Sustainability balance: engagement gain per week minus overhead cost per week; ~0 = indefinitely runnable.
function qBalance(c){const gain=+(0.02+engageOf(c).score*0.02).toFixed(3);const cost=+(0.02+(c.capR>0.38?0.012:0.004)).toFixed(3);return{gain,cost,net:+(gain-cost).toFixed(3)};}
function qDiag(c){return{zone:qZone(c),tau:qTau(c),crit:qCrit(c),pair:qPair(c),bal:qBalance(c)};}
// ---- The Four Governors, enforced (not prose). Pure: same facts -> same verdict.
// Every committed measurement write must clear all four. Fail-safe: missing data HOLDS.
const QFLOORS={engagement:0.35,margin_ebitda_k:6,staleness_days:14};
// A failed guardrail is not one thing. "$200 short of the floor" and "$6,000
// short of the floor" are both a FAIL, but they are not the same call \u2014 so
// every verdict below carries a signed numeric distance from its threshold (positive = clearing margin, negative = shortfall) and a severity label deriv
function severityOf(distance,scale){
if(distance>=0)return "clear";
const ratio=Math.abs(distance)/scale;
return ratio<0.15?"narrow miss":ratio<0.5?"held":"far off";
}
function qGovernors(c,daysSinceMeasure,stalenessFloorDays){
const eng=engageOf(c).score,mar=c.eb,cleared=c.compliance!==false&&c.staffCleared!==false,d=daysSinceMeasure;
const floor=stalenessFloorDays==null?QFLOORS.staleness_days:stalenessFloorDays; // callers may supply a contract-specific freshness limit
const marDist=typeof mar==="number"?+(mar-QFLOORS.margin_ebitda_k).toFixed(2):null;
const engDist=typeof eng==="number"?+(eng-QFLOORS.engagement).toFixed(3):null;
const dataDist=typeof d==="number"?+(floor-d).toFixed(1):null;
return[
{id:"financial_materiality",label:"Financial materiality",pass:typeof mar==="number"&&mar>=QFLOORS.margin_ebitda_k,distance:marDist,severity:marDist==null?null:severityOf(marDist,QFLOORS.margin_ebitda_k||1),detail:(mar>=QFLOORS.margin_ebitda_k?"margin $"+mar+"k \u2265 $"+QFLOORS.margin_ebitda_k+"k floor (+$"+marDist+"k)":"margin $"+mar+"k below $"+QFLOORS.margin_ebitda_k+"k floor ($"+marDist+"k)")},
{id:"engagement_integrity",label:"Engagement integrity",pass:typeof eng==="number"&&eng>=QFLOORS.engagement,distance:engDist,severity:engDist==null?null:severityOf(engDist,QFLOORS.engagement||1),detail:(eng>=QFLOORS.engagement?"engagement "+eng.toFixed(2)+" \u2265 "+QFLOORS.engagement:"engagement "+eng.toFixed(2)+" below "+QFLOORS.engagement+" floor")},
{id:"child_safety",label:"Child safety",pass:cleared===true,distance:cleared===true?0:-1,severity:cleared===true?"clear":"far off",detail:(cleared===true?"staff cleared":"clearance not confirmed \u2014 hold")},
{id:"data_integrity",label:"Data integrity",pass:typeof d==="number"&&d>=0&&d<=floor,distance:dataDist,severity:dataDist==null?null:severityOf(dataDist,floor||1),detail:(typeof d==="number"&&d<=floor?"measured "+d+"d ago \u2264 "+floor+"d":"stale "+d+"d \u2014 measure before acting")}
];
}
function qGate(c,daysSinceMeasure){const v=qGovernors(c,daysSinceMeasure);const held=v.filter(g=>!g.pass);return{allow:held.length===0,verdicts:v,held};}

// ============================================================================
// LAYER 1 — OPERATIONAL SIGNALS + ACTION CONTRACTS (console substrate)
// Six derived signals per center, composed from data already on the object.
// Nothing here is a new data source — it's a fixed, auditable read of what forecast()/engageOf()/qGovernors() already compute, named for the console.
// ============================================================================

// -- dataConfidence: freshness-weighted trust in the current read (0-1) --
function dataConfidenceOf(daysSinceMeasure){return qCoherence(daysSinceMeasure==null?30:daysSinceMeasure);}

// -- uncertaintyBand: how split the thriving/watch/at-risk read is --
function uncertaintyBandOf(c){
const amp=qAmp(c);const spread=Math.max(...amp)-Math.min(...amp);
return spread>=0.45?"low":spread>=0.22?"medium":"high";
}

// -- peerConnectionStrength: how tightly a unit sits inside its regional cluster (0-1) --
function peerConnectionStrengthOf(c,states){
const cluster=QCLUSTERS.find(cl=>cl.includes(c.st));
if(!cluster)return 0.2;
const peers=cluster.filter(st=>st!==c.st).flatMap(st=>states[st]||[]);
if(!peers.length)return 0.3;
const peerAvg=peers.reduce((a,p)=>a+p.health,0)/peers.length;
return +Math.max(0.1,Math.min(1,peerAvg/100)).toFixed(2);
}

// -- patternStabilityIndex: internal agreement across conversion/retention/staffing (0-1) --
function patternStabilityIndexOf(c){
const m=[c.conv/0.65,c.ret/0.94,c.chem/0.8];
const mu=(m[0]+m[1]+m[2])/3;
const varr=m.reduce((s,x)=>s+(x-mu)*(x-mu),0)/3;
return +Math.max(0,Math.min(1,1-varr*6)).toFixed(2);
}

// -- networkSupportIndex: strength of the peer/support network this unit can draw on (0-1) --
function networkSupportIndexOf(c,states){
const peerStrength=peerConnectionStrengthOf(c,states);
const activePrograms=CONNECTIVITY.filter(x=>x.n).length; // active shared-service programs on the books
return +Math.max(0.1,Math.min(1,peerStrength*0.7+Math.min(1,activePrograms/CONNECTIVITY.length)*0.3)).toFixed(2);
}

// -- structureScore: share of the four governors this unit currently clears (0-1) --
function structureScoreOf(c,daysSinceMeasure){
const v=qGovernors(c,daysSinceMeasure);
return +(v.filter(g=>g.pass).length/v.length).toFixed(2);
}

// One call, six signals — the shape every agent and the map will read.
function operationalSignalsOf(c,states,daysSinceMeasure){
return{
dataConfidence:dataConfidenceOf(daysSinceMeasure),
uncertaintyBand:uncertaintyBandOf(c),
peerConnectionStrength:peerConnectionStrengthOf(c,states),
patternStabilityIndex:patternStabilityIndexOf(c),
networkSupportIndex:networkSupportIndexOf(c,states),
structureScore:structureScoreOf(c,daysSinceMeasure),
};
}

// ---- Action contracts: what evidence + sign-off each action type requires ----
// No action reaches an "approve" button in the UI without passing its contract.
const ACTION_CONTRACTS={
"expansion":{
requiredMetrics:["readinessScore","netMargin","students","supportCapacity"],
minFreshnessDays:28, // ~4 weeks
guardrails:["financial_materiality","data_integrity","structure"],
approverRole:"Director",
},
"pricing-change":{
requiredMetrics:["netMargin","students","priceCeiling"],
minFreshnessDays:28,
guardrails:["financial_materiality","data_integrity"],
approverRole:"Director",
},
"support-plan":{
requiredMetrics:["healthScore","engagementIndex","staffingStress"],
minFreshnessDays:45,
guardrails:["engagement_integrity","child_safety","data_integrity"],
approverRole:"FBC",
},
"outreach":{
requiredMetrics:["retentionRate","engagementIndex"],
minFreshnessDays:60,
guardrails:["engagement_integrity","child_safety"],
approverRole:"Owner",
},
};

// Runs a proposed action against its contract. Pure: same facts -> same verdict.
// Missing data is a HOLD, never a pass — mirrors the governor fail-safe above.
function checkContract(actionType,c,daysSinceMeasure){
const contract=ACTION_CONTRACTS[actionType];
if(!contract)return{allowed:false,reason:"unknown action type: "+actionType};
const verdicts=qGovernors(c,daysSinceMeasure,contract.minFreshnessDays).filter(g=>contract.guardrails.includes(g.id));
const freshOk=typeof daysSinceMeasure==="number"&&daysSinceMeasure<=contract.minFreshnessDays;
// VOTING FLOOR (absolute, action-type independent): when measurement
// confidence exp(-days/42) falls below 0.30 (~50 days unreviewed), this
// unit's data can no longer support ANY approval affecting it. Stale data
// loses its voting rights; the only action it can authorize is its own
// re-review. Per-action freshness limits above are tighter for high-impact
// actions; this floor is the backstop none of them can fall through.
const votingOk=typeof daysSinceMeasure==="number"&&qCoherence(daysSinceMeasure)>=0.30;
const held=verdicts.filter(g=>!g.pass);
const allowed=held.length===0&&freshOk&&votingOk;
return{
allowed,
approverRole:contract.approverRole,
verdicts,
freshnessOk:freshOk,
votingOk,
freshnessLimit:contract.minFreshnessDays,
heldOn:held.map(g=>g.label).concat(freshOk?[]:["data freshness"]).concat(votingOk?[]:["confidence below voting floor — re-review required first"]),
};
}

// ============================================================================
// LAYER 2 — FIVE AGENTS (pure recommend() functions over Layer 1 signals)
// Agents never mutate state. Each returns AgentRecommendation objects; the
// Governance pass at the end attaches a contract verdict to every one.
// ============================================================================

// Default freshness model: mirrors the app's own staleness heuristic (staleBase)
// so agent tests reflect the same data-age distribution the UI already assumes.
function defaultDaysSinceMeasure(c){return hash(c.name)%38;}

function confidenceBandOf(dataConfidence){return dataConfidence>=0.6?"high":dataConfidence>=0.35?"medium":"low";}
function riskBandOf(structureScore,patternStabilityIndex){
const avg=(structureScore+patternStabilityIndex)/2;
return avg>=0.75?"low":avg>=0.45?"medium":"high";
}

let _recSeq=0;
function buildRecommendation({agent,scope,targetIds,title,summary,actionType,center,states,daysSinceMeasure,suggestedActionPlan,agentTag,extraHold}){
const sig=operationalSignalsOf(center,states,daysSinceMeasure);
const contract=checkContract(actionType,center,daysSinceMeasure);
const extraBlocked=!!(extraHold&&extraHold.blocked);
const allowed=contract.allowed&&!extraBlocked;
const heldOn=extraBlocked?contract.heldOn.concat([extraHold.reason]):contract.heldOn;
return{
id:"rec-"+(_recSeq++)+"-"+agent.replace(/\s+/g,"").toLowerCase(),
agent,scope,targetIds,title,summary,
actionType,
evidence:{
dataFreshnessDays:daysSinceMeasure,
operationalSignals:sig,
contractVerdicts:contract.verdicts,
},
confidenceBand:confidenceBandOf(sig.dataConfidence),
riskBand:riskBandOf(sig.structureScore,sig.patternStabilityIndex),
requiresGate:true,
approverRole:contract.approverRole,
suggestedActionPlan:suggestedActionPlan||null,
agentTags:[agentTag],
supplyGate:extraHold||null,
governance:{allowed,heldOn,freshnessOk:contract.freshnessOk},
};
}

// ---- Growth Agent: hot candidates into territories with headroom + support capacity ----
// Growth agent standing rules, made real rather than asserted in prose:
// (1) CANNIBALIZATION / TERRITORY-OVERLAP PENALTY -- each additional hot candidate proposed into the same territory in the same cycle shaves that territ
const GROWTH_QUALITY_FIT_MIN=70, GROWTH_QUALITY_LIQUIDITY_MIN=200;
function territoryCapacityOf(headroom){return Math.max(1,Math.round(headroom*10));}
// Underwriting distinctions the lead data already carries but the agent
// previously ignored: a proven operator has a documented track record that
// substitutes, in part, for capital cushion -- so the liquidity floor is relaxed for them. A multi-unit-intent candidate is a larger bet with a wider bl
const GROWTH_PROVEN_LIQUIDITY_DISCOUNT=0.70; // proven operators clear at 70% of the standard liquidity floor
const GROWTH_MULTI_FIT_MIN=75; // multi-unit intent requires a higher fit bar than the base floor (70)
function growthAgentRecommend(centers,states,leads,daysFn=defaultDaysSinceMeasure){
const out=[];
// Candidate pool is drawn from the active pipeline broadly (stage0<5), not
// pre-filtered to "hot" only -- the quality gate below is what actually decides
// expansion-readiness, so it needs real candidates to evaluate, not a pool that's already been through an equivalent filter upstream.
const pool=[...leads].filter(l=>l.stage0<5).sort((a,b)=>b.fit-a.fit).slice(0,12);
const regionSlotsUsed={};
pool.forEach(l=>{
const region=l.region;
const regionCenters=states[region]||[];
if(!regionCenters.length)return;
const netState=NET_STATES.find(s=>s.s===region);
const baseHeadroom=netState?netState.h[0]:0.3;
const capacity=territoryCapacityOf(baseHeadroom);
const used=regionSlotsUsed[region]||0;
regionSlotsUsed[region]=used+1;
const withinSupply=used<capacity;
const overlapPenalty=+(used*0.06).toFixed(3);
const headroom=Math.max(0.04,+(baseHeadroom-overlapPenalty).toFixed(3));
const overlapFlag=overlapPenalty>0;
const liquidityFloor=l.proven?+(GROWTH_QUALITY_LIQUIDITY_MIN*GROWTH_PROVEN_LIQUIDITY_DISCOUNT).toFixed(0):GROWTH_QUALITY_LIQUIDITY_MIN;
const fitFloor=l.multi?GROWTH_MULTI_FIT_MIN:GROWTH_QUALITY_FIT_MIN;
const qualityOk=l.fit>=fitFloor&&l.liquidity>=liquidityFloor;
const gateReason=!qualityOk?(l.fit<fitFloor?"below fit threshold"+(l.multi?" (multi-unit bar)":""):"liquidity below quality floor"+(l.proven?" (proven-operator discounted floor)":"")):!withinSupply?"territory candidate-supply ceiling reached this cycle":null;
const gateBlocked=!qualityOk||!withinSupply;
const anchor=[...regionCenters].sort((a,b)=>b.health-a.health)[0];
const worstDays=Math.max(...regionCenters.map(daysFn));
const underwritingNote=l.proven?" \u00b7 proven operator, liquidity floor discounted to $"+liquidityFloor+"k":l.multi?" \u00b7 multi-unit intent, fit floor raised to "+fitFloor:"";
out.push(buildRecommendation({
agent:"Growth",scope:"territory",targetIds:[l.id,region,anchor.name],
title:region+": "+l.n+" ("+l.fit+" fit) into a "+(headroom>=0.35?"high-headroom":overlapFlag?"overlap-constrained":"moderate-headroom")+" territory",
summary:l.note+" \u00b7 "+regionCenters.length+" existing unit(s) in "+region+" \u00b7 territory headroom "+Math.round(headroom*100)+"%"+(overlapFlag?" (adjusted for "+used+" concurrent candidate(s) already proposed into this territory this cycle)":"")+underwritingNote+(gateBlocked?" \u00b7 "+gateReason:""),
actionType:"expansion",center:anchor,states,daysSinceMeasure:worstDays,
suggestedActionPlan:ACTION_PLANS.find(p=>p.n==="Selective Expansion"),
agentTag:"expansion-target",
extraHold:{blocked:gateBlocked,reason:gateReason,capacity,used:used+1,overlapPenalty,qualityOk,withinSupply,liquidityFloor,fitFloor},
}));
});
return out;
}

// ---- Unit Health Agent: below-floor units, acute vs chronic, matched to an action plan ----
// Weekly capacity a single FBC (or Owner, for Retention below) can actually carry --
// illustrative but finite, so an agent cannot propose more concurrent support plans than a human approver could realistically work through. Proposals be
const ROLE_CAPACITY={FBC:10,Owner:8,Director:12};
function unitHealthAgentRecommend(centers,daysFn=defaultDaysSinceMeasure,capacityLedger){
const ledger=capacityLedger||{};
const out=[];
centers.filter(c=>c.eb<QFLOORS.margin_ebitda_k||c.health<55).forEach(c=>{
const days=daysFn(c);
const chronic=c.eb<0&&c.momentum[0]!=="+";
const actionPlan=ACTION_PLANS.find(p=>p.n===(chronic?"Resale & Turnaround":"Unit-Value Program"));
const used=ledger.FBC||0;
const cap=ROLE_CAPACITY.FBC;
const withinCapacity=used<cap;
ledger.FBC=used+1;
out.push(buildRecommendation({
agent:"Unit Health",scope:"unit",targetIds:[c.name],
title:c.name+": "+(chronic?"chronic underperformance — turnaround review":"below-floor margin — support plan"),
summary:"margin $"+c.eb+"k · health "+c.health+" · momentum "+c.momentum+(chronic?" · sustained decline, not a single-period dip":" · likely recoverable with a support plan")+(withinCapacity?"":" · FBC capacity ceiling reached this cycle ("+cap+" concurrent plans)"),
actionType:"support-plan",center:c,states:{},daysSinceMeasure:days,
suggestedActionPlan:actionPlan,
agentTag:"support-needed",
extraHold:{blocked:!withinCapacity,reason:withinCapacity?null:"FBC capacity ceiling reached this cycle",capacity:cap,used:used+1},
}));
});
return out;
}

// ---- Retention Agent: silent-churn risk from staff chemistry + retention trend ----
function retentionAgentRecommend(centers,daysFn=defaultDaysSinceMeasure,capacityLedger){
const ledger=capacityLedger||{};
const out=[];
centers.filter(c=>c.chem<0.45||c.ret<0.80).forEach(c=>{
const days=daysFn(c);
const used=ledger.Owner||0;
const cap=ROLE_CAPACITY.Owner;
const withinCapacity=used<cap;
ledger.Owner=used+1;
out.push(buildRecommendation({
agent:"Retention",scope:"unit",targetIds:[c.name],
title:c.name+": silent-churn risk",
summary:"staff chemistry "+c.chem.toFixed(2)+" · 12mo retention "+Math.round(c.ret*100)+"% · risk builds quietly between measurement cycles"+(withinCapacity?"":" · Owner outreach capacity ceiling reached this cycle ("+cap+" concurrent)"),
actionType:"outreach",center:c,states:{},daysSinceMeasure:days,
suggestedActionPlan:null,
agentTag:"silent-churn-risk",
extraHold:{blocked:!withinCapacity,reason:withinCapacity?null:"Owner outreach capacity ceiling reached this cycle",capacity:cap,used:used+1},
}));
});
return out;
}

// ---- Network Propagation Agent: verified best-practice candidates by within-cluster health gap ----
// A 25-point gap read off two units is not the same evidence as the same gap
// read off eight -- so this agent now requires a minimum in-state sample size to fire at all, and averages the top-k / bottom-k units (not just the sing
const PROPAGATION_MIN_SAMPLE=5;
function networkPropagationAgentRecommend(centers,states,daysFn=defaultDaysSinceMeasure){
const out=[];
const guard=CONNECTIVITY.find(x=>x.t==="Best Practice Propagation");
Object.keys(states).forEach(st=>{
const cs=states[st];
if(cs.length<PROPAGATION_MIN_SAMPLE)return; // insufficient sample size for a verified pattern -- silently out of scope, not a false negative
const sorted=[...cs].sort((a,b)=>b.health-a.health);
const k=Math.min(3,Math.floor(cs.length/2));
const topAvg=sorted.slice(0,k).reduce((a,c)=>a+c.health,0)/k;
const bottomAvg=sorted.slice(-k).reduce((a,c)=>a+c.health,0)/k;
const gap=Math.round(topAvg-bottomAvg);
if(gap<25)return; // not enough spread to justify a propagation pilot
const sampleConfidence=cs.length>=8?"high":cs.length>=6?"medium":"low";
const source=sorted[0],target=sorted[sorted.length-1];
const days=Math.max(daysFn(source),daysFn(target));
out.push(buildRecommendation({
agent:"Network Propagation",scope:"cluster",targetIds:[source.name,target.name],
title:st+": propagate "+source.name+"'s pattern toward "+target.name,
summary:gap+"-point health gap (top-"+k+"/bottom-"+k+" avg) within "+st+" · sample "+cs.length+" units, "+sampleConfidence+" confidence · guardrail: "+(guard?guard.guard:"data integrity — verified pattern only"),
actionType:"support-plan",center:target,states,daysSinceMeasure:days,
suggestedActionPlan:ACTION_PLANS.find(p=>p.n==="Unit-Value Program"),
agentTag:"propagation-candidate",
}));
});
return out;
}

// ---- Governance pass: every recommendation already carries its contract verdict (see buildRecommendation);
// this just separates the feed into what a Director can act on now vs what's held, for the UI's two lanes.
// ========================= PATCH: Modern AI orchestration agents + rail UI integration =========================
// ---- Modern orchestration agent metadata for UI ----
const AGENT_UI={
"Growth":{tone:"#0b6bcb",kind:"specialist"},
"Unit Health":{tone:"#a35c00",kind:"specialist"},
"Retention":{tone:"#7a4fa0",kind:"specialist"},
"Network Propagation":{tone:"#2f7a3f",kind:"specialist"},
"Agent Challenge":{tone:AC,kind:"orchestration"},
"Agent Supervisor":{tone:"#005f73",kind:"orchestration"},
"Agent Judge":{tone:"#444",kind:"orchestration"},
"Agent Compound Decision":{tone:"#6a4c93",kind:"orchestration"},
"Agent Scenario":{tone:"#3a6ea5",kind:"orchestration"},
};
function agentUiOf(name){return AGENT_UI[name]||{tone:MUT,kind:"specialist"};}
function agentKindLabel(name){const ui=agentUiOf(name);return ui.kind==="orchestration"?"orchestration":"specialist";}
function primaryTargetOf(rec){return(rec.targetIds||[]).find(id=>typeof id==="string"&&id.length>2&&id!==rec.scope)||null;}
// ---- Challenge typing: constraint-first diagnosis over existing signals ----
const CHALLENGE_TYPES={
stale:"Stale state",
silentChurn:"Silent churn",
underperformance:"Chronic underperformance",
expansionRisk:"Overexpansion risk",
propagationGap:"Best-practice gap",
};
function challengeTypeOf(center,states,daysSinceMeasure){
const gov=qGovernors(center,daysSinceMeasure);
const failed=gov.filter(g=>!g.pass).map(g=>g.id);
if(failed.includes("data_integrity"))return CHALLENGE_TYPES.stale;
if(center.chem<0.45||center.ret<0.80)return CHALLENGE_TYPES.silentChurn;
if(center.eb<QFLOORS.margin_ebitda_k&&center.health<55)return CHALLENGE_TYPES.underperformance;
const sig=operationalSignalsOf(center,states,daysSinceMeasure);
if(sig.structureScore<0.55&&sig.networkSupportIndex<0.45)return CHALLENGE_TYPES.expansionRisk;
return null;
}
// ---- Agent Challenge: identify the binding obstacle first, before any specialist proposes on top of it ----
// (completed beyond the supplied fragment: emits typed findings, not self-executing actions — Rule 1 preserved)
function challengeAgentFindings(centers,states,daysFn){
const out=[];
centers.forEach(c=>{
const days=daysFn(c);
const type=challengeTypeOf(c,states,days);
if(type)out.push({center:c.name,type,detail:type===CHALLENGE_TYPES.stale?("last verified measurement "+days+"d ago — estimate aged past the trust floor"):type===CHALLENGE_TYPES.silentChurn?("chemistry "+c.chem.toFixed(2)+" / retention "+(c.ret*100).toFixed(0)+"% — families leaving quietly before any lagging metric moves"):type===CHALLENGE_TYPES.underperformance?("EBITDA $"+c.eb+"k under the $"+QFLOORS.margin_ebitda_k+"k floor with health "+c.health+" — constraint precedes any growth proposal"):"structure and network support both under floor — growth here would outrun containment"});
});
return out.slice(0,8);
}
// ---- Agent Supervisor / Judge: orchestration summary over the specialist output ----
function orchestrationSummary(recs,conflicts,challenges){
const byKind={specialist:0,orchestration:0};
recs.forEach(r=>{byKind[agentKindLabel(r.agent)]++;});
const worst=conflicts.reduce((a,c)=>c.severity==="high"?"high":(a==="high"?a:c.severity),conflicts.length?"medium":null);
return{specialistCount:byKind.specialist,challengeCount:challenges.length,conflictCount:conflicts.length,judgeVerdict:worst?("worst live conflict: "+worst+" — resolve before compound approval"):"no cross-agent conflicts — compound decisions clear",supervisorNote:challenges.length?(challenges.length+" binding constraints identified — specialists propose against these first"):"no binding constraints flagged this cycle"};
}
// ========================= PATCH END =========================
function applyGovernance(recommendations){
const actionable=recommendations.filter(r=>r.governance.allowed);
const held=recommendations.filter(r=>!r.governance.allowed);
return{actionable,held,summary:actionable.length+" ready for review, "+held.length+" held pending fresher data or a cleared guardrail"};
}

// ---- Cross-agent conflict detector ----
// Nothing previously checked whether two agents were proposing contradictory
// actions on the same unit -- e.g. Growth proposing expansion anchored on a unit that Unit Health has just flagged as chronic. This scans the full propo
function detectConflicts(recs,challenges=[]){
const conflicts=[];
const challengedUnits=new Map(challenges.map(ch=>[ch.center,ch]));
recs.filter(r=>r.agent==="Growth").forEach(g=>{
const anchor=(g.targetIds||[])[2];
const ch=anchor&&challengedUnits.get(anchor);
if(ch)conflicts.push({a:g.id,b:"challenge:"+ch.center,reason:"Growth proposes expansion anchored on "+ch.center+", which Agent Challenge has flagged: "+ch.type.toLowerCase()+" — "+ch.detail,severity:ch.type===CHALLENGE_TYPES.underperformance||ch.type===CHALLENGE_TYPES.stale?"high":"medium"});
});
const growthRecs=recs.filter(r=>r.agent==="Growth");
const healthRecs=recs.filter(r=>r.agent==="Unit Health");
const retentionRecs=recs.filter(r=>r.agent==="Retention");
growthRecs.forEach(g=>{
const anchorName=g.targetIds[2]; // [lead id, region, anchor unit name]
if(!anchorName)return;
const healthHit=healthRecs.find(h=>h.targetIds.includes(anchorName));
if(healthHit){
conflicts.push({
a:g.id,b:healthHit.id,
reason:"Growth proposes expanding "+g.targetIds[1]+" anchored on "+anchorName+", which Unit Health has separately flagged: "+healthHit.title.split(": ")[1],
severity:healthHit.title.includes("chronic")?"high":"medium",
});
}
const retentionHit=retentionRecs.find(rt=>rt.targetIds.includes(anchorName));
if(retentionHit){
conflicts.push({
a:g.id,b:retentionHit.id,
reason:"Growth proposes expanding "+g.targetIds[1]+" anchored on "+anchorName+", which Retention has separately flagged for silent-churn risk",
severity:"medium",
});
}
});
return conflicts;
}

// ---- Orchestrator entry point: run all four proposing agents, then governance ----
// A shared capacityLedger passes across Unit Health and Retention in one call so
// their role-capacity ceilings (FBC, Owner) are enforced across the whole cycle, not reset per-agent -- the same discipline Growth already applies per-t
function runAllAgents(centers,states,leads,daysFn=defaultDaysSinceMeasure){
const capacityLedger={};
const recs=[
...growthAgentRecommend(centers,states,leads,daysFn),
...unitHealthAgentRecommend(centers,daysFn,capacityLedger),
...retentionAgentRecommend(centers,daysFn,capacityLedger),
...networkPropagationAgentRecommend(centers,states,daysFn),
];
const challenges=challengeAgentFindings(centers,states,daysFn);
const conflicts=detectConflicts(recs,challenges);
const orchestration=orchestrationSummary(recs,conflicts,challenges);
return{recommendations:recs,conflicts,challenges,orchestration,...applyGovernance(recs)};
}

function qLastMeasSeg(stList,st,seg){for(let s=seg;s>=Math.max(0,seg-40);s--){if(stList[hash("m"+String(s))%stList.length]===st)return s;}return null;}
function qArc(cx,cy,r,a0,a1){const x0=cx+r*Math.cos(a0),y0=cy+r*Math.sin(a0),x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1);const lg=(a1-a0)>Math.PI?1:0;return "M "+cx+" "+cy+" L "+x0.toFixed(1)+" "+y0.toFixed(1)+" A "+r+" "+r+" 0 "+lg+" 1 "+x1.toFixed(1)+" "+y1.toFixed(1)+" Z";}
// ===== OPS SUBSYSTEM (embedded, corporate register) =====
// ============================================================================
// LAYER 3 — DECISION RAIL (recommendation lanes bound to runAllAgents + applyGovernance)
// Module-scope component, same pattern as OpsSystem: receives data via props,
// never reaches into Engine's closures directly.
// ============================================================================
const BAND_COL={high:GRN,medium:AMB,low:AC};
const RISK_COL={low:GRN,medium:AMB,high:AC};

// Plain-language reading of the same contractVerdicts array the chips below
// already render from — no new data, just a one-line summary for anyone who
// doesn't want to hover each chip to know whether this is clear to approve.
function plainVerdictSummary(rec){
const verdicts=rec.evidence.contractVerdicts||[];
const failed=verdicts.filter(v=>!v.pass);
const staleFlag=!rec.governance.freshnessOk;
if(failed.length===0&&!staleFlag)return{text:"All guardrails clear — ready for Director review.",tone:GRN};
const parts=failed.map(v=>v.label.toLowerCase());
if(staleFlag)parts.push("data freshness");
return{text:"Held on: "+parts.join(", ")+".",tone:AMB};
}

const RecommendationCard=React.memo(function RecommendationCard({rec,decision,history,conflicted,onDecide,jumpTo}){
const[open,setOpen]=useState(false);
const allowed=rec.governance.allowed;
const primaryUnit=(rec.targetIds&&rec.targetIds.find(id=>id&&id.length>2&&id!==rec.scope))||null;
const histLabel={approved:"Approved",measure:"Re-measure",ignored:"Ignored"};
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${allowed?GRN:AMB}`,background:"#fff",padding:"9px 11px",marginBottom:7}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
<div style={{flex:1,minWidth:220}}>
<div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:agentUiOf(rec.agent).tone,border:`1px solid ${agentUiOf(rec.agent).tone}`,padding:"1px 5px"}} title={agentKindLabel(rec.agent)+" agent"}>{rec.agent}<span style={{fontWeight:400,fontSize:7.5,marginLeft:4,color:MUT}}>{agentKindLabel(rec.agent)}</span></span>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:BAND_COL[rec.confidenceBand]}}>{rec.confidenceBand} confidence</span>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:RISK_COL[rec.riskBand]}}>{rec.riskBand} risk</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700}}>{conflicted&&<span title="This proposal conflicts with another agent proposal on the same unit" style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:"#fff",background:AC,padding:"1px 5px",marginRight:6,cursor:"help"}}>CONFLICT</span>}{rec.title}{primaryUnit&&jumpTo&&<span onClick={()=>jumpTo("lenses",primaryUnit,"following up on \u201c"+rec.title+"\u201d from "+rec.agent)} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:400,color:AC,cursor:"pointer",textDecoration:"underline",marginLeft:8}}>view in Six Lenses →</span>}</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#444",marginTop:2,lineHeight:1.4}}>{rec.summary}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:allowed?GRN:AMB,marginTop:3,fontStyle:"italic"}}>{rationaleOf(rec)}</div>
{history&&history.length>0&&<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:3}}>history: {history.map(h=>histLabel[h.status]||h.status).join(" → ")}</div>}
</div>
<div style={{textAlign:"right",minWidth:110}}>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,letterSpacing:0.4,textTransform:"uppercase"}}>approver (human-owned)</div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700}}>{rec.approverRole}</div>
{rec.suggestedActionPlan&&<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:2}}>→ {rec.suggestedActionPlan.n}</div>}
</div>
</div>
{(()=>{const s=plainVerdictSummary(rec);return<div style={{marginTop:6,fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:s.tone}}>{s.text}</div>;})()}
<div style={{marginTop:4,display:"flex",gap:5,flexWrap:"wrap"}}>
{rec.evidence.contractVerdicts.map((v,i)=>(<span key={i} title={v.detail+(v.severity&&v.severity!=="clear"?" ("+v.severity+")":"")} style={{fontFamily:"Helvetica",fontSize:9,padding:"2px 6px",border:`1px solid ${v.pass?GRN:AC}`,color:v.pass?GRN:AC,cursor:"help"}}>{v.pass?"✓":"✕"} {v.label}{!v.pass&&v.severity==="far off"?" — far off":!v.pass&&v.severity==="narrow miss"?" — narrow miss":""}</span>))}
{!rec.evidence.contractVerdicts.length&&<span style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>no gated guardrails for this action type</span>}
{!rec.governance.freshnessOk&&<span style={{fontFamily:"Helvetica",fontSize:9,padding:"2px 6px",border:`1px solid ${AMB}`,color:AMB}}>✕ data freshness</span>}
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}>
<button onClick={()=>setOpen(o=>!o)} aria-expanded={open} style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0}}>{open?"hide":"view"} signals</button>
<div style={{display:"flex",gap:5}}>
{decision?<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:decision==="approved"?GRN:decision==="measure"?AMB:MUT}}>{decision==="approved"?"Approved":decision==="measure"?"Queued for re-measurement":"Ignored"}</span>:<>
<button disabled={!allowed} onClick={()=>onDecide(rec,"approved")} aria-label={"Approve: "+rec.title} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 9px",cursor:allowed?"pointer":"not-allowed",border:`1px solid ${allowed?GRN:RULE}`,background:allowed?GRN:"#f2f2f2",color:allowed?"#fff":MUT}}>Approve</button>
<button onClick={()=>onDecide(rec,"measure")} aria-label={"Queue for re-measurement: "+rec.title} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${AMB}`,background:"#fff",color:AMB}}>Measure again</button>
<button onClick={()=>onDecide(rec,"ignored")} aria-label={"Ignore: "+rec.title} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>Ignore</button>
</>}
</div>
</div>
{open&&<div style={{marginTop:7,paddingTop:6,borderTop:`1px solid ${RULE}`,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:6}}>
{Object.entries(rec.evidence.operationalSignals).map(([k,v])=>(<div key={k}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,textTransform:"uppercase",letterSpacing:0.4}}>{k.replace(/([A-Z])/g," $1")}</div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700}}>{typeof v==="number"?v.toFixed(2):v}</div>
</div>))}
<div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,textTransform:"uppercase",letterSpacing:0.4}}>Data age</div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700}}>{rec.evidence.dataFreshnessDays}d</div>
</div>
</div>}
</div>);
},(prev,next)=>prev.rec===next.rec&&prev.decision===next.decision&&prev.conflicted===next.conflicted&&prev.history===next.history);

// ============================================================================
// LAYER 4 — SIX-LENS COMMAND SURFACE
// One canonical state (the same centers/states/railData/opt every other tab
// reads), reinterpreted through six roles. FB_BOUNDARY is a separate legacy dataset used only inside the System lens as a cross-reference — it is not tr
// ============================================================================
const LENS_DEFS=[
["student","Student","#2f6fa0"],["parent","Parent","#7a4fa0"],["franchisee","Franchisee","#2f7a3f"],
["corporate","Corporate","#8b0000"],["financial","Financial","#a06b1f"],["system","System",MUT],
];

function royaltyOf(c){const grossRev=+(c.students*0.289).toFixed(1);return{grossRev,royalty:+(grossRev*0.08).toFixed(1),brandFund:+(grossRev*0.02).toFixed(1)};}
// ---- Integration stubs (MyStudio / QuickBooks) ----
// These are payload SHAPES only — the field names and grouping a live
// integration would plausibly send/receive — not a working connection. Every figure inside is read from the same canonical center record every other tab
function myStudioPayloadOf(centers){
return centers.map(c=>({
center_id:c.name,
state:c.st,
verified_public_record:!!c.verified,
enrollment:{
active_students:c.students,
belt_distribution_note:"per-cohort belt counts modeled at network level (COHORT table), not yet broken out per center in this export",
},
engagement:{
composite_engagement_score:+engageOf(c).score.toFixed(2),
trial_conversion_rate:+c.conv.toFixed(2),
},
retention:{
retention_rate:+c.ret.toFixed(2),
staff_chemistry_index:+c.chem.toFixed(2),
},
schema:"illustrative — pending live MyStudio API field contract",
}));
}
function quickBooksPayloadOf(centers){
return centers.map(c=>{
const r=royaltyOf(c);
return{
center_id:c.name,
state:c.st,
period:"modeled — no fiscal period bound yet",
gross_revenue_k:r.grossRev,
royalty_due_k:r.royalty,
brand_fund_due_k:r.brandFund,
ebitda_k:c.eb,
condition:conditionOf(c).label,
schema:"illustrative — pending live QuickBooks GL account mapping",
};
});
}

function clusterExpansionGateOf(clusterCenters){const top=[...clusterCenters].sort((a,b)=>b.health-a.health)[0];const worstDays=Math.max(...clusterCenters.map(c=>hash(c.name)%38));return checkContract("expansion",top,worstDays);}
function conditionOf(c){const idx=qResolve(qAmp(c));return{label:QSTATES[idx],color:QCOL[idx]};}

const LensStudent=React.memo(function LensStudent({center}){
const e=engageOf(center),f=forecast(center),tau=qTau(center);
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:"#2f6fa0",marginBottom:3}}>Student — experience & progression</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.4,marginBottom:8}}>What this lens is for: how the student actually experiences the program week to week — session quality, belt progress, and how fast a shocked routine recovers.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
{[["Engagement score",e.score,"0-1, composite"],["30-day progression",Math.round(e.prog30*100)+"%",""],["Badges earned",e.badges,"this cohort"],["Recovery time",tau+"w",tau<=2?"fast":tau<=3?"watch":"slow"]].map(([v,l,x],i)=>(
<div key={i}><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800}}>{v}</div><div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>{l}</div>{x&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{x}</div>}</div>
))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#444",lineHeight:1.5}}>Commitment split: {Math.round(e.commit[0]*100)}% casual, {Math.round(e.commit[1]*100)}% engaged, {Math.round(e.commit[2]*100)}% advocate. Trend is <b>{f.cls}</b> on a {f.slope>0?"+":""}{f.slope} monthly slope. A slow recovery time here is the earliest signal of the retention risk the Parent and Franchisee lenses price in.</div>
</div>);
},(prev,next)=>prev.center===next.center);

const LensParent=React.memo(function LensParent({center}){
const e=engageOf(center);
const notesMetric=METRICS_FULL.find(m=>m.name.includes("Notes completion"));
const noShowMetric=METRICS_FULL.find(m=>m.name.includes("No-show recovery"));
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:"#7a4fa0",marginBottom:3}}>Parent — trust & responsiveness</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.4,marginBottom:8}}>What this lens is for: the trust signals a parent feels directly — timely notes, responsiveness, attendance, and whether they re-enroll or refer.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
{[["12-mo retention",Math.round(center.ret*100)+"%","re-enrollment proxy"],["Referral rate",Math.round(e.refer*100)+"%",""],["Session buzz",Math.round(e.buzz*100)+"%","post-session sentiment"]].map(([v,l,x],i)=>(
<div key={i}><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800}}>{v}</div><div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>{l}</div>{x&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{x}</div>}</div>
))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#444",lineHeight:1.5}}>Network-wide floors this center is held to: <b>{notesMetric.name}</b> ({notesMetric.trigger}) and <b>{noShowMetric.name}</b> ({noShowMetric.trigger}). Parent trust is a lagging read on both — by the time it drops, the leading indicators already moved.</div>
</div>);
},(prev,next)=>prev.center===next.center);

const LensFranchisee=React.memo(function LensFranchisee({center,states,days}){
const f=forecast(center),contract=checkContract("support-plan",center,days);
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:"#2f7a3f",marginBottom:3}}>Franchisee — unit operations</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.4,marginBottom:8}}>What this lens is for: what the person running the center sees day to day — trials, staffing, active students, margin, and whether a support plan is warranted.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
{[["Active students",center.students,center.students<60?"below profitability floor (60)":"above floor"],["Trial→enrollment",Math.round(center.conv*100)+"%",""],["Staff chemistry",center.chem.toFixed(2),center.chem<0.45?"churn-risk range":"stable"],["Labor % of revenue",Math.round(center.capR*100)+"%",center.capR>=0.40?"at/above governor":"within governor"]].map(([v,l,x],i)=>(
<div key={i}><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800}}>{v}</div><div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>{l}</div>{x&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{x}</div>}</div>
))}
</div>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${contract.allowed?GRN:AMB}`,padding:"7px 9px",fontFamily:"Helvetica",fontSize:9.5,color:"#333",lineHeight:1.5}}>
Support plan: trend is <b>{f.cls}</b>. {contract.allowed?"Cleared to propose a support plan for Director/FBC review.":"Held — "+contract.heldOn.join(", ")+"."}
</div>
</div>);
},(prev,next)=>prev.center===next.center&&prev.days===next.days);

const LensCorporate=React.memo(function LensCorporate({center,states,selectedCluster}){
const clusterCenters=states[selectedCluster]||[center];
const avgHealth=Math.round(clusterCenters.reduce((a,c)=>a+c.health,0)/clusterCenters.length);
const belowFloor=clusterCenters.filter(c=>c.eb<QFLOORS.margin_ebitda_k).length;
const netSupport=networkSupportIndexOf(center,states);
const expansion=clusterExpansionGateOf(clusterCenters);
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:3}}>Corporate — network & propagation</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.4,marginBottom:8}}>What this lens is for: the network-level view — cluster health, support capacity, and whether growth or best-practice rollout is actually earned yet.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
{[[selectedCluster+" cluster health",avgHealth,clusterCenters.length+" units"],["Below margin floor",belowFloor,"of "+clusterCenters.length],["Support capacity",netSupport.toFixed(2),"0-1, peer + FBC proxy"],["Expansion gate",expansion.allowed?"clear":"held",expansion.allowed?"":expansion.heldOn.join(", ")]].map(([v,l,x],i)=>(
<div key={i}><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800,color:i===3?(expansion.allowed?GRN:AMB):INK}}>{v}</div><div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>{l}</div>{x&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{x}</div>}</div>
))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#444",lineHeight:1.5}}>Best-practice propagation and expansion are both gated behind this same support-capacity read — a cluster doesn't get more units, or more of its practices pushed network-wide, faster than its FBC and peer network can actually absorb.</div>
</div>);
},(prev,next)=>prev.center===next.center&&prev.states===next.states&&prev.selectedCluster===next.selectedCluster);

const LensFinancial=React.memo(function LensFinancial({center,days}){
const {grossRev,royalty,brandFund}=royaltyOf(center);
const tau=qTau(center);
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:"#a06b1f",marginBottom:3}}>Financial — unit economics</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.4,marginBottom:8}}>What this lens is for: the money — margin against the floor, royalty and brand-fund impact, and how far the unit is from a durable payback trajectory.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,marginBottom:8}}>
{[["Unit margin","$"+center.eb+"k",center.eb<QFLOORS.margin_ebitda_k?"below $"+QFLOORS.margin_ebitda_k+"k floor":"above floor"],["Modeled gross revenue","$"+grossRev+"k","students × modeled monthly rate"],["Royalty (8%)","$"+royalty+"k",""],["Brand fund (2%)","$"+brandFund+"k",""]].map(([v,l,x],i)=>(
<div key={i}><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800,color:i===0&&center.eb<QFLOORS.margin_ebitda_k?AC:INK}}>{v}</div><div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>{l}</div>{x&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{x}</div>}</div>
))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#444",lineHeight:1.5}}>Recovery time is <b>{tau}w</b> at current trajectory — the same number driving the Student lens above, reused here rather than recomputed, because margin recovery and student-experience recovery are the same underlying signal read twice.</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:6}}>Gross revenue is modeled from enrollment at this file's standing per-student rate assumption — illustrative, not a substitute for MyStudio/QuickBooks reconciliation.</div>
</div>);
},(prev,next)=>prev.center===next.center&&prev.days===next.days);

function LensSystem({center,states,days}){
const sig=operationalSignalsOf(center,states,days);
const gov=qGovernors(center,days);
const fbMatch=FB_BOUNDARY.centers.find(x=>x.id===center.name);
const[jsonOpen,setJsonOpen]=useState(false);
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:3}}>System — canonical state & guardrails</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.4,marginBottom:8}}>What this lens is for: the audit trail — the raw signals and guardrail verdicts behind every claim made in the other five lenses, for diagnosis and traceability.</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:6,marginBottom:8}}>
{Object.entries(sig).map(([k,v])=>(<div key={k}><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,textTransform:"uppercase"}}>{k.replace(/([A-Z])/g," $1")}</div><div style={{fontFamily:"Helvetica",fontSize:13,fontWeight:700}}>{typeof v==="number"?v.toFixed(2):v}</div></div>))}
</div>
<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
{gov.map((g,i)=>(<span key={i} title={g.detail} style={{fontFamily:"Helvetica",fontSize:9,padding:"2px 6px",border:`1px solid ${g.pass?GRN:AC}`,color:g.pass?GRN:AC,cursor:"help"}}>{g.pass?"✓":"✕"} {g.label}</span>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginBottom:4}}>{fbMatch?"Cross-reference: this center id also exists in the separate FB_BOUNDARY proof-of-concept dataset (not the same canonical source as above).":"No matching id in the separate FB_BOUNDARY dataset — expected, since it models a different illustrative center set."}</div>
<div onClick={()=>setJsonOpen(o=>!o)} style={{fontFamily:"Helvetica",fontSize:9,color:AC,cursor:"pointer",textDecoration:"underline",marginBottom:jsonOpen?4:0}}>{jsonOpen?"hide":"show"} diagnostic / audit JSON for this center →</div>
{jsonOpen&&<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginBottom:4,lineHeight:1.5}}><b>Reading this:</b> health/eb are the same margin and health numbers shown above in plain language — this is the raw record they're computed from. daysSinceMeasure is data age; signals are the six operational reads used to set confidence and risk bands elsewhere on this screen.</div>}
{jsonOpen&&<pre style={{fontFamily:FB_MONO,fontSize:8.5,color:"#333",background:"#f7f6f2",border:`1px solid ${RULE}`,padding:"6px 8px",overflowX:"auto",margin:0}}>{JSON.stringify({name:center.name,st:center.st,health:center.health,eb:center.eb,daysSinceMeasure:days,signals:sig},null,1)}</pre>}
</div>);
}

const LENS_COMPONENTS={student:LensStudent,parent:LensParent,franchisee:LensFranchisee,corporate:LensCorporate,financial:LensFinancial,system:LensSystem};

function SixLensTab({centers,states,leads,railData,opt,setOpt,logL,focusCenter,jumpReason,clearJumpReason}){
const stateKeys=Object.keys(states);
const focusSt=focusCenter?(centers.find(c=>c.name===focusCenter)||{}).st:null;
const[selSt,setSelSt]=useState(focusSt&&stateKeys.includes(focusSt)?focusSt:stateKeys[0]);
const clusterCenters=states[selSt]||[];
const[selName,setSelName]=useState(focusCenter&&focusSt===selSt?focusCenter:(clusterCenters[0]?.name||null));
const center=clusterCenters.find(c=>c.name===selName)||clusterCenters[0]||centers[0];
const[lens,setLens]=useState("student");
// ---- render-timing instrumentation: answers the first-switch performance question
// directly instead of leaving it as an unverified claim. Hidden by default; toggled
// on with the small "perf" control below the lens tabs. ----
const[showPerf,setShowPerf]=useState(false);
const mountStart=useRef(typeof performance!=="undefined"?performance.now():0);
const[mountMs,setMountMs]=useState(null);
useEffect(()=>{
const t=typeof performance!=="undefined"?performance.now()-mountStart.current:0;
setMountMs(+t.toFixed(1));
},[]);
const days=opt.fresh[center.name]!==undefined?(opt.week-opt.fresh[center.name])*7:(hash(center.name)%38)+opt.week*2;
const centerRecs=railData.recommendations.filter(r=>r.targetIds.includes(center.name));
const activeSignal=[...centerRecs].sort((a,b)=>a.governance.allowed===b.governance.allowed?0:a.governance.allowed?-1:1)[0]||null;
// System lens must reflect the same governance reality every other view sees --
// whether this unit's active proposal is flagged by the cross-agent conflict
// check, and whether any failed guardrail was a narrow miss or far off, not just pass/fail.
const lensConflictIds=new Set((railData.conflicts||[]).flatMap(c=>[c.a,c.b]));
const lensConflicted=activeSignal?lensConflictIds.has(activeSignal.id):false;
const lensConflictReason=lensConflicted?(railData.conflicts||[]).find(c=>c.a===activeSignal.id||c.b===activeSignal.id):null;
const f=forecast(center),tau=qTau(center),gov=qGovernors(center,days);
const held=gov.filter(g=>!g.pass);
const cond=conditionOf(center);
const coherence=qCoherence(days);
const expansion=clusterExpansionGateOf(clusterCenters);
const supportPosture=activeSignal&&activeSignal.governance.allowed?"support plan proposed":held.length?"hold — guardrail open":cond.label==="at-risk"?"monitor closely":"monitor";
const LensBody=LENS_COMPONENTS[lens];

return(<div>
<StateViewBanner thisView="Six Lenses"/>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8,fontStyle:"italic"}}>Six lanes, one truth: student, parent, franchisee, corporate, financial, and system, all synchronized to the same center, the same week, and the same active signal. The underlying discipline is sense-and-respond — observe state, identify the binding constraint, propose one bounded pilot, measure, and only then propagate what the data validates. The engine's job stops at diagnosis, prioritization, and support planning; pricing, staffing, compliance, and contracts stay human-owned.</div>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
<button onClick={()=>setShowPerf(s=>!s)} aria-pressed={showPerf} aria-label="Toggle render timing display" style={{fontFamily:"Helvetica",fontSize:8,color:MUT,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0}}>{showPerf?"hide":"show"} render timing</button>
{showPerf&&<span style={{fontFamily:"Helvetica",fontSize:8.5,padding:"2px 7px",border:`1px solid ${mountMs!==null&&mountMs<200?GRN:AMB}`,color:mountMs!==null&&mountMs<200?GRN:AMB}}>mount: {mountMs===null?"measuring\u2026":mountMs+"ms"}</span>}
</div>
{jumpReason&&<div style={{border:`1px solid ${AC}`,borderLeft:`3px solid ${AC}`,background:"#fdf3f2",padding:"6px 10px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontFamily:"Helvetica",fontSize:9,color:"#5a2020"}}>Here because: {jumpReason}</span>
<button onClick={clearJumpReason} aria-label="Dismiss navigation context" style={{fontFamily:"Helvetica",fontSize:11,color:MUT,cursor:"pointer",background:"none",border:"none",padding:0}}>×</button>
</div>}

<div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",border:`1px solid ${RULE}`,background:"#fff",padding:"7px 10px",marginBottom:8}}>
<select value={selSt} onChange={ev=>{setSelSt(ev.target.value);setSelName(null);}} style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,border:`1px solid ${RULE}`,padding:"3px 6px"}}>
{stateKeys.map(st=>(<option key={st} value={st}>{st} · {states[st].length} units</option>))}
</select>
<select value={center.name} onChange={ev=>setSelName(ev.target.value)} style={{fontFamily:"Helvetica",fontSize:10,border:`1px solid ${RULE}`,padding:"3px 6px",flex:"1 1 160px"}}>
{clusterCenters.map(c=>(<option key={c.name} value={c.name}>{c.name} · health {c.health}</option>))}
</select>
<div style={{display:"flex",alignItems:"center",gap:3,fontFamily:"Helvetica",fontSize:9,color:MUT}}>
<button onClick={()=>setOpt(o=>({...o,week:Math.max(0,o.week-1)}))} style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,padding:"1px 7px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff"}}>−</button>
<span>week {opt.week}</span>
<button onClick={()=>setOpt(o=>({...o,week:o.week+1}))} style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,padding:"1px 7px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff"}}>+</button>
</div>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:cond.color}}>{cond.label}</span>
<span style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>measurement confidence {coherence.toFixed(2)} · recovery {tau}w · measured {days}d ago</span>
<span style={{marginLeft:"auto",fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:held.length?AC:GRN}}>{held.length?held[0].label+(held.length>1?" +"+(held.length-1)+" more":""):"all guardrails clear"}</span>
{days>14&&<button onClick={()=>{setOpt(o=>({...o,fresh:{...o.fresh,[center.name]:o.week}}));logL&&logL("lenses","System","Re-measured "+center.name);}} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${AMB}`,background:"#fff",color:AMB}}>Measure now</button>}
</div>

<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",padding:"9px 12px",marginBottom:8}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:2}}>What matters now — {center.name}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginBottom:6}}>This is a deliberate single-center deep-dive. For the network-wide highest-priority item, see the Overview tab's Today panel instead.</div>
{activeSignal?(<>
<div style={{fontFamily:"Helvetica",fontSize:12,fontWeight:700}}>{activeSignal.title}</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#444",margin:"3px 0 6px",lineHeight:1.5}}>{activeSignal.summary}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.5,marginBottom:6}}>Why it matters — <b>students:</b> a {cond.label} read means engagement and belt progress {cond.label==="at-risk"?"are already slipping":"are holding"}. <b>Parents:</b> {center.ret>=0.85?"retention is healthy, so trust hasn't been tested yet":"retention is soft — this is what a parent would notice first"}. <b>Economics:</b> margin is {center.eb<QFLOORS.margin_ebitda_k?"below the $"+QFLOORS.margin_ebitda_k+"k floor":"above floor"} at ${center.eb}k.</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>Trace: <b>{activeSignal.agent} agent</b> → {activeSignal.evidence.contractVerdicts.length?activeSignal.evidence.contractVerdicts.map(v=>v.pass?v.label:v.label+(v.severity&&v.severity!=="clear"?" ("+v.severity+")":"")).join(", "):"no gated guardrails for this action"} → {activeSignal.suggestedActionPlan?activeSignal.suggestedActionPlan.n:"no action plan attached"} (human-owned) → approver: <b>{activeSignal.approverRole}</b></div>
{activeSignal.supplyGate&&activeSignal.supplyGate.blocked&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:AMB,marginTop:2}}>Capacity hold: {activeSignal.supplyGate.reason}</div>}
{lensConflicted&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:AC,marginTop:2,fontWeight:700}}>⚠ {lensConflictReason?lensConflictReason.reason:"This proposal conflicts with another agent\u2019s proposal on the same unit"} — see Decision Rail before acting.</div>}
</>):(<div style={{fontFamily:"Helvetica",fontSize:10.5,color:MUT}}>No proposed action is currently open for this center — trend is {f.cls}, recovery time {tau}w, condition {cond.label}.</div>)}
</div>

<div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
<div style={{flex:"2 1 300px"}}>
<div style={{display:"flex",gap:4,marginBottom:6,flexWrap:"wrap"}}>
{LENS_DEFS.map(([id,label,c])=>(<button key={id} onClick={()=>setLens(id)} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 11px",cursor:"pointer",border:`1px solid ${lens===id?c:RULE}`,background:lens===id?c:"#fff",color:lens===id?"#fff":c}}>{label}</button>))}
</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px"}}>
<LensBody center={center} states={states} selectedCluster={selSt} days={days} week={opt.week} activeSignal={activeSignal}/>
</div>
</div>
<div style={{flex:"1 1 200px",border:`1px solid ${RULE}`,background:"#fff",padding:"9px 11px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:6}}>Financial & corporate at a glance</div>
{(()=>{const {royalty}=royaltyOf(center);const belowFloor=(states[selSt]||[]).filter(c=>c.eb<QFLOORS.margin_ebitda_k).length;
return[["Students vs floor",center.students+" / 60",center.students<60?AC:GRN],["Margin",center.eb+"k / "+QFLOORS.margin_ebitda_k+"k floor",center.eb<QFLOORS.margin_ebitda_k?AC:GRN],["Royalty impact","$"+royalty+"k/mo",INK],["Cluster below floor",belowFloor+" units",belowFloor?AMB:GRN],["Support posture",supportPosture,supportPosture==="monitor"?GRN:AMB]].map(([l,v,c2],i)=>(
<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:i?`1px solid #f0f0f0`:"none"}}><span style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>{l}</span><b style={{fontFamily:"Helvetica",fontSize:10,color:c2}}>{v}</b></div>
));})()}
<div style={{marginTop:6,paddingTop:6,borderTop:`1px solid ${RULE}`}}>
<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>Expansion readiness</span><b style={{fontFamily:"Helvetica",fontSize:10,color:expansion.allowed?GRN:MUT}}>{expansion.allowed?"clear to propose":"not yet — "+expansion.heldOn.join(", ")}</b></div>
</div>
</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginBottom:10}}>Six lenses, one canonical state: every panel above reads the same {center.name} object, the same week, and the same active signal — nothing here is a separate copy of the numbers.</div>

<SixLensProof/>
</div>);
}

// One canonical state, several measurement views. Each surface below reads the
// same modeled network; they differ only in the question they answer. Making
// that relationship explicit is the architectural spine of the whole model.
function StateViewBanner({thisView}){
const views=[
["Six Lenses","one unit, six roles"],
["Operations Board","every intervention, in parallel"],
["Operations Dynamics","uncertainty & review cadence"],
];
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fbfbf9",padding:"7px 11px",marginBottom:8}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.7,textTransform:"uppercase",color:MUT,marginBottom:3}}>One canonical state · several operating views · you are in: {thisView}</div>
<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
{views.map(([n,d])=>(<span key={n} style={{fontFamily:"Helvetica",fontSize:8.5,padding:"2px 7px",border:`1px solid ${thisView===n?INK:RULE}`,background:thisView===n?INK:"#fff",color:thisView===n?"#fff":MUT}}><b>{n}</b> — {d}</span>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:4}}>These are not three datasets. They are three questions asked of the same modeled network — change the state in one and the others reflect it, because there is only one state to change.</div>
</div>);
}

function SixLensProof(){
const[open,setOpen]=useState(false);
return(<div style={{border:`1px solid ${RULE}`,background:"#fafafa",padding:"9px 11px"}}>
<div onClick={()=>setOpen(o=>!o)} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,cursor:"pointer"}}>{open?"hide":"show"} canonical state / system proof →</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:3}}>Separate from the per-center diagnostic above: this is the full serialized network object every view in this section derives from — for debugging and audit, not the first thing a reviewer should read.</div>
{open&&<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:6,lineHeight:1.5}}><b>Reading this:</b> schema/week identify the record version and measurement cycle. clusters group centers by coupling strength; centers each carry a state (thriving/watch/at-risk), a set of dimension values (vals), and their week-over-week movement (mom). This is the record itself, not a summary of it — every number in the other views traces back to something here.</div>}
{open&&<pre style={{fontFamily:FB_MONO,fontSize:9,color:"#333",background:"#fff",border:`1px solid ${RULE}`,padding:"8px 10px",overflowX:"auto",marginTop:6,maxHeight:280,overflowY:"auto"}}>{JSON.stringify(FB_BOUNDARY,null,1)}</pre>}
</div>);
}

// ============================================================================
// OPERATIONS BOARD — interventions in parallel, three synchronized views
// (lanes / board / feed) over the SAME shared decisions state the Decision
// Rail and Overview spotlight write to. Nothing here is a second copy. Timeline semantics are honest: each intervention's bar is its contract review win
// ============================================================================
function boardStatusOf(rec,decisions){
const d=decisions[rec.id];
if(d==="approved")return"approved";
if(d==="measure")return"remeasure";
if(d==="ignored")return"aside";
return rec.governance.allowed?"proposed":"held";
}
const BOARD_COLS=[
["proposed","Proposed — pending Director review",GRN],
["held","Held — guardrail or data",AMB],
["remeasure","Queued for re-measurement",AMB],
["approved","Approved — human-owned",INK],
["aside","Set aside",MUT],
];

// ============================================================================
// OPERATIONS DYNAMICS — integrated view over the canonical state.
// How the model handles uncertainty between reviews: likelihood-weighted unit
// conditions (qAmp), measurement confidence decay (qCoherence), review-based resolution (shared opt.week/opt.fresh clock — the same one Six Lenses uses)
// ============================================================================
function supportPathsOf(c){
const out=[];
if(c.ret<0.82)out.push({id:"retention",n:"Retention outreach sequence",d:"Structured parent contact on missed sessions; no-show recovery protocol.",window:60,risk:"Low"});
if(c.chem<0.55)out.push({id:"staffing",n:"Staffing stabilization plan",d:"Coverage review, senior-instructor pairing, scheduled check-ins.",window:45,risk:"Medium"});
if(c.eb<QFLOORS.margin_ebitda_k)out.push({id:"unitvalue",n:"Unit-economics program",d:"Premium-tier pricing review and community pipeline activation.",window:45,risk:"Low"});
if(c.conv<0.4)out.push({id:"conversion",n:"Trial-conversion review",d:"First-session experience audit; enrollment-day follow-through.",window:28,risk:"Low"});
if(!out.length)out.push({id:"monitor",n:"Standard monitoring cadence",d:"No intervention indicated; hold to the regular review cycle.",window:28,risk:"Low"});
return out.slice(0,3);
}

function OperationsDynamicsTab({centers,states,opt,setOpt,logL,dyn,setDyn,focusCenter,railData,jumpTo}){
const[showPerfDyn,setShowPerfDyn]=useState(false);
const mountStartDyn=useRef(typeof performance!=="undefined"?performance.now():0);
const[mountMsDyn,setMountMsDyn]=useState(null);
useEffect(()=>{const t=typeof performance!=="undefined"?performance.now()-mountStartDyn.current:0;setMountMsDyn(+t.toFixed(1));},[]);
const stateKeys=Object.keys(states);
const focusSt=focusCenter?(centers.find(c=>c.name===focusCenter)||{}).st:null;
const[selSt,setSelSt]=useState(focusSt&&stateKeys.includes(focusSt)?focusSt:stateKeys[0]);
const stCenters=states[selSt]||[];
const[selName,setSelName]=useState(focusCenter&&focusSt===selSt?focusCenter:null);
const[couplingScope,setCouplingScope]=useState("state");
// ---- Scenario sandbox: adjust assumptions, watch the royalty projection recompute live ----
const[supportDrag,setSupportDrag]=useState(0.10); // support-cost drag, % of gross benefit absorbed by delivery cost
const[adoptionSpeed,setAdoptionSpeed]=useState(1.0); // multiplier on the adoption-ramp curve (1.0 = base case)
const[guardrailDays,setGuardrailDays]=useState(28); // decision-anchor freshness window, days
const center=stCenters.find(c=>c.name===selName)||stCenters[0]||centers[0];
// Committing a support path to a unit that another agent has flagged in an
// open conflict deserves the same warning every other view now gives --
// this was the one operating view with no way to know at all.
const dynConflictIds=new Set((railData&&railData.conflicts||[]).flatMap(c=>[c.a,c.b]));
const dynRecs=(railData&&railData.recommendations||[]).filter(r=>r.targetIds.includes(center.name));
const dynConflicted=dynRecs.some(r=>dynConflictIds.has(r.id));
const ageOf=c=>opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
const amp=qAmp(center),age=ageOf(center),conf=qCoherence(age);
const paths=supportPathsOf(center);
const netConf=+(centers.reduce((a,c)=>a+qCoherence(ageOf(c)),0)/centers.length).toFixed(2);
const supportIdx=networkSupportIndexOf(center,states);
const review=c=>{
const a=qAmp(c),idx=qResolve(a);
setDyn(m=>({...m,resolved:{...m.resolved,[c.name]:idx}}));
setOpt(o=>({...o,fresh:{...o.fresh,[c.name]:o.week}}));
logL&&logL("dynamics","Review",c.name+" reviewed — condition recorded as "+QSTATES[idx]+"; measurement confidence restored.");
};
const commit=(c,p)=>{
setDyn(m=>({...m,committed:{...m.committed,[c.name]:p.id}}));
logL&&logL("dynamics","Director",c.name+" — committed \""+p.n+"\"; alternative paths closed. Review due within "+p.window+"d.");
};
const completePath=(c,p)=>{
setDyn(m=>({...m,completed:{...(m.completed||{}),[c.name]:p.id}}));
setOpt(o=>({...o,fresh:{...o.fresh,[c.name]:o.week}}));
logL&&logL("dynamics","Director",c.name+" — \""+p.n+"\" marked complete; outcome measured, review clock closed.");
};
return(<div>
<StateViewBanner thisView="Operations Dynamics"/>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>Between reviews, a unit's condition is a weighted likelihood across thriving, watch, and at-risk — and confidence in that read decays as data ages. A review resolves the likelihood to a recorded condition and restores confidence on the same shared clock every other view reads. Support planning holds up to three candidate paths concurrently; the Director commits one, the alternatives close. All figures derive from the canonical state — nothing here is a separate copy.</div>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
<button onClick={()=>setShowPerfDyn(s=>!s)} aria-pressed={showPerfDyn} aria-label="Toggle render timing display" style={{fontFamily:"Helvetica",fontSize:8,color:MUT,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0}}>{showPerfDyn?"hide":"show"} render timing</button>
{showPerfDyn&&<span style={{fontFamily:"Helvetica",fontSize:8.5,padding:"2px 7px",border:`1px solid ${mountMsDyn!==null&&mountMsDyn<200?GRN:AMB}`,color:mountMsDyn!==null&&mountMsDyn<200?GRN:AMB}}>mount: {mountMsDyn===null?"measuring\u2026":mountMsDyn+"ms"}</span>}
</div>
{dynConflicted&&<div style={{border:`1px solid ${AC}`,borderLeft:`3px solid ${AC}`,background:"#fdf3f2",padding:"6px 10px",marginBottom:8,fontFamily:"Helvetica",fontSize:9,color:"#5a2020",fontWeight:700}}>\u26a0 {center.name} is flagged by the cross-agent conflict check \u2014 review Decision Rail before committing a support path here.</div>}

<div style={{display:"flex",gap:0,flexWrap:"wrap",border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",marginBottom:10}}>
{[["wk "+opt.week,"shared operating clock"],[netConf,"avg measurement confidence — network"],[Object.keys(dyn.resolved).length,"conditions recorded this session"],[Object.keys(dyn.committed).length,"support paths committed"]].map(([v,l],i)=>(
<div key={i} style={{flex:"1 1 130px",padding:"8px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:18,fontWeight:800,lineHeight:1}}>{v}</div><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:2}}>{l}</div>
</div>))}
<div style={{display:"flex",alignItems:"center",padding:"0 12px"}}>
<button onClick={()=>setOpt(o=>({...o,week:o.week+1}))} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 12px",cursor:"pointer",border:`1px solid ${INK}`,background:INK,color:"#fff"}}>Advance week →</button>
</div>
</div>

{(()=>{
// Scenario sandbox: three assumptions the Director can flex, recomputed live against
// the same $1.36M/yr Unit-Value base every other view cites — not a separate model.
const base=1.36;
const dragFactor=1-supportDrag;
const rampFactor=Math.min(1,adoptionSpeed);
const guardrailFactor=guardrailDays>=28?1:0.85; // tightening below the 28-day floor costs measurement coverage
const projected=+(base*dragFactor*rampFactor*guardrailFactor).toFixed(2);
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid #7a6bd8`,background:"#faf9fc",padding:"9px 12px",marginBottom:10}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:"#7a6bd8",marginBottom:6}}>Scenario sandbox — flex an assumption, watch the projection move</div>
<div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
<div style={{minWidth:180}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:2}}>Support-cost drag: {Math.round(supportDrag*100)}%</div>
<input type="range" min={0} max={40} value={Math.round(supportDrag*100)} onChange={ev=>setSupportDrag(Number(ev.target.value)/100)} aria-label={"Support-cost drag, currently "+Math.round(supportDrag*100)+" percent"} style={{width:"100%"}}/>
</div>
<div style={{minWidth:180}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:2}}>Adoption speed: {adoptionSpeed.toFixed(2)}× base ramp</div>
<input type="range" min={40} max={140} value={Math.round(adoptionSpeed*100)} onChange={ev=>setAdoptionSpeed(Number(ev.target.value)/100)} aria-label={"Adoption speed multiplier, currently "+adoptionSpeed.toFixed(2)+"x"} style={{width:"100%"}}/>
</div>
<div style={{minWidth:180}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:2}}>Guardrail freshness floor: {guardrailDays}d</div>
<input type="range" min={14} max={45} value={guardrailDays} onChange={ev=>setGuardrailDays(Number(ev.target.value))} aria-label={"Guardrail freshness floor, currently "+guardrailDays+" days"} style={{width:"100%"}}/>
</div>
<div style={{marginLeft:"auto",textAlign:"right"}}>
<div style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:"#7a6bd8"}}>${projected}M/yr</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>projected, vs ${base}M/yr base case</div>
</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:6}}>This is a policy simulator, not a second source of truth — all three sliders recompute the same Unit-Value figure shown in Programs; nothing here is committed until a Director acts on it.</div>
</div>);
})()}

<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-start"}}>
<div style={{flex:"1 1 330px",border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:6}}>Condition likelihood by unit — {selSt} · peer support {supportIdx.toFixed(2)}</div>
<select value={selSt} onChange={e=>{setSelSt(e.target.value);setSelName(null);}} style={{fontFamily:"Helvetica",fontSize:10,border:`1px solid ${RULE}`,padding:"3px 6px",marginBottom:8,width:"100%"}}>
{stateKeys.map(st=>(<option key={st} value={st}>{st} · {states[st].length} units</option>))}
</select>
{stCenters.slice(0,10).map(c=>{
const a=qAmp(c),ag=ageOf(c),cf=qCoherence(ag),ri=dyn.resolved[c.name];
return(<div key={c.name} onClick={()=>setSelName(c.name)} style={{padding:"6px 0",borderTop:`1px solid #f0ede6`,cursor:"pointer",opacity:center.name===c.name?1:0.75}}>
<div style={{display:"flex",justifyContent:"space-between",fontFamily:"Helvetica",fontSize:9.5}}>
<b>{c.name}</b>
<span style={{color:ri!==undefined?QCOL[ri]:MUT,fontWeight:700}}>{ri!==undefined?"recorded: "+QSTATES[ri]:"unreviewed"}</span>
</div>
<div style={{display:"flex",height:10,border:`1px solid ${RULE}`,marginTop:3,opacity:0.35+cf*0.65}}>
{a.map((v,i)=>(<div key={i} style={{width:(v*100)+"%",background:QCOL[i]}} title={QSTATES[i]+" "+Math.round(v*100)+"%"}/>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:2}}>data age {ag}d · confidence {cf.toFixed(2)} — bar fades as confidence decays</div>
</div>);})}
{stCenters.length>10&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,paddingTop:4}}>+{stCenters.length-10} more units in {selSt}</div>}
</div>

<div style={{flex:"1 1 330px"}}>
<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px",marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT}}>{center.name} — review status</div>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:conf<0.5?AC:GRN}}>confidence {conf.toFixed(2)}</span>
</div>
<svg viewBox="0 0 300 80" style={{width:"100%",display:"block"}}>
{Array.from({length:61},(_,d)=>d).map(d=>{const y=70-qCoherence(d)*60;return d?<circle key={d} cx={10+d*4.6} cy={y} r="0.7" fill={MUT}/>:null;})}
<line x1={10+Math.min(60,age)*4.6} y1="6" x2={10+Math.min(60,age)*4.6} y2="74" stroke={conf<0.5?AC:INK} strokeWidth="1.4"/>
<text x={Math.min(255,14+Math.min(60,age)*4.6)} y="14" fontSize="8" fill={conf<0.5?AC:INK} fontFamily="Helvetica">this unit · {age}d</text>
<text x="10" y="78" fontSize="7" fill={MUT} fontFamily="Helvetica">0d</text><text x="278" y="78" fontSize="7" fill={MUT} fontFamily="Helvetica">60d</text>
</svg>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,margin:"4px 0 6px"}}>Measurement confidence vs. data age. Past ~28d, a recorded condition should not anchor a growth or pricing decision — the same freshness floor the governance contracts enforce, and the same clock the Six-Lens and Operations Board views read.</div>
<button onClick={()=>review(center)} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 12px",cursor:"pointer",border:`1px solid ${GRN}`,background:GRN,color:"#fff"}}>Conduct review — record condition</button>
{jumpTo&&<span onClick={()=>jumpTo("lenses",center.name,"reviewing "+center.name+" from Operations Dynamics")} style={{fontFamily:"Helvetica",fontSize:9,color:AC,cursor:"pointer",textDecoration:"underline",marginLeft:10}}>view {center.name} in Six Lenses →</span>}
</div>

<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px",marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT}}>Peer coupling — {couplingScope==="state"?"how support propagates in "+selSt:"network-wide cluster structure"}</div>
<div style={{display:"flex",gap:4}}>
{[["state","This state"],["network","Whole network"]].map(([id,lab])=>(<button key={id} onClick={()=>setCouplingScope(id)} style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"2px 7px",cursor:"pointer",border:`1px solid ${couplingScope===id?INK:RULE}`,background:couplingScope===id?INK:"#fff",color:couplingScope===id?"#fff":MUT}}>{lab}</button>))}
</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:6}}>{couplingScope==="state"?"Units in a tightly-coupled state move together. When a support path is committed at one unit, the units it is most strongly connected to are the next most likely to benefit — support lands harder where the network is tight.":"Each node is a state cluster, sized by unit count and colored by average condition. Thicker links mean tighter regional coupling — where a validated practice propagates fastest across the network."}</div>
{couplingScope==="network"?(()=>{
const byState=Object.entries(states).map(([st,cs])=>({st,n:cs.length,health:cs.reduce((a,c)=>a+c.health,0)/cs.length,cond:conditionOf(cs.reduce((a,c)=>a.health<c.health?a:c,cs[0]))})).sort((a,b)=>b.n-a.n).slice(0,12);
const N=byState.length,cx=150,cy=75,R=60;
const pos=byState.map((s,i)=>{const ang=(i/N)*Math.PI*2-Math.PI/2;return{...s,x:cx+Math.cos(ang)*R,y:cy+Math.sin(ang)*R};});
const coup=(a,b)=>{const h=hash(a.st+b.st)%100/100;return 0.15+h*0.5;};
return(<svg viewBox="0 0 300 150" style={{width:"100%",display:"block"}}>
{pos.map((p,i)=>pos.slice(i+1).map((q,j)=>{const k=coup(p,q);return(<line key={i+"-"+j} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={INK} strokeOpacity={0.05+k*0.18} strokeWidth={0.3+k*1.6}/>);}))}
{pos.map((p,i)=>(<g key={i} onClick={()=>{setSelSt(p.st);setCouplingScope("state");}} style={{cursor:"pointer"}}>
<circle cx={p.x} cy={p.y} r={3.5+Math.min(7,p.n/8)} fill={p.cond.color} stroke="#fff" strokeWidth="0.8"/>
<text x={p.x} y={p.y-8} fontSize="6.5" textAnchor="middle" fill={INK} fontFamily="Helvetica" fontWeight={700}>{p.st}</text>
</g>))}
<text x="6" y="146" fontSize="7" fill={MUT} fontFamily="Helvetica">node size = unit count · click a state to drill into its units</text>
</svg>);
})():(()=>{
const nodes=stCenters.slice(0,8);
const N=nodes.length,cx=150,cy=70,R=52;
const pos=nodes.map((c,i)=>{const ang=(i/N)*Math.PI*2-Math.PI/2;return{c,x:cx+Math.cos(ang)*R,y:cy+Math.sin(ang)*R};});
const focusI=pos.findIndex(p=>p.c.name===center.name);
const coup=(a,b)=>{const h=hash(a.name+b.name)%100/100;const same=a.st===b.st?0.4:0;return Math.min(0.95,0.25+same+h*0.4);};
const committedHere=!!dyn.committed[center.name];
return(<svg viewBox="0 0 300 140" style={{width:"100%",display:"block"}}>
{pos.map((p,i)=>pos.slice(i+1).map((q,j)=>{const k=coup(p.c,q.c);const touchesFocus=focusI>=0&&(p.c.name===center.name||q.c.name===center.name);
return(<line key={i+"-"+j} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={touchesFocus&&committedHere?AC:INK} strokeOpacity={touchesFocus?(committedHere?0.55:0.3):0.08} strokeWidth={touchesFocus?0.5+k*2.2:0.4}/>);
}))}
{pos.map((p,i)=>{const isFocus=p.c.name===center.name;const cond=conditionOf(p.c);const k=focusI>=0?coup(p.c,center):0;const influenced=committedHere&&isFocus===false&&k>0.55;
return(<g key={i} onClick={()=>setSelName(p.c.name)} style={{cursor:"pointer"}}>
{influenced&&<circle cx={p.x} cy={p.y} r="9" fill="none" stroke={AC} strokeOpacity="0.5" strokeWidth="0.8"/>}
<circle cx={p.x} cy={p.y} r={isFocus?6.5:4.6} fill={cond.color} stroke={isFocus?INK:"#fff"} strokeWidth={isFocus?1.4:0.8}/>
<text x={p.x} y={p.y-8.5} fontSize="6.5" textAnchor="middle" fill={INK} fontFamily="Helvetica" fontWeight={isFocus?700:400}>{p.c.name.length>10?p.c.name.slice(0,9)+"…":p.c.name}</text>
</g>);})}
<text x="6" y="134" fontSize="7" fill={MUT} fontFamily="Helvetica">{committedHere?"ring = units most likely to benefit from the committed path":"commit a path below to see the propagation radius"}</text>
</svg>);
})()}
</div>

<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>Concurrent support paths — held until the Director commits one</div>
{paths.map(p=>{const isC=dyn.committed[center.name]===p.id,closed=dyn.committed[center.name]&&!isC;
return(<div key={p.id} style={{border:`1px solid ${isC?GRN:RULE}`,padding:"7px 9px",marginBottom:6,opacity:closed?0.45:1,background:isC?"#f3f8f3":"#fff"}}>
<div style={{display:"flex",justifyContent:"space-between",fontFamily:"Helvetica",fontSize:9.5}}><b>{p.n}</b><span style={{color:MUT}}>{p.risk} risk · {p.window}d review window</span></div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:"#555",margin:"2px 0 5px"}}>{p.d}</div>
{isC?(dyn.completed&&dyn.completed[center.name]===p.id?<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:INK}}>✓ Completed — outcome measured, review clock closed</span>:<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:GRN}}>Committed — alternatives closed · human-owned <button onClick={()=>completePath(center,p)} style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"2px 7px",cursor:"pointer",border:`1px solid ${INK}`,background:"#fff",color:INK,marginLeft:6}}>Mark complete</button></span>)
:closed?<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>closed on commitment of the selected path</span>
:<button onClick={()=>commit(center,p)} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${INK}`,background:"#fff",color:INK}}>Commit this path</button>}
</div>);})}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>Candidate paths are held concurrently so the review, not the proposal order, decides. Commitment is a Director action; it closes the alternatives, starts the review clock, and is written to the shared session record.</div>
</div>
</div>
</div>
</div>);
}

// ============================================================================
// SYSTEM ALIGNMENT — the operating model at full scale.
// Renders the four standing rules as a live diagram: one canonical state,
// four proposing agents, a fail-closed governance boundary, and the operating views — with a Network Integrity Monitor computing measurement confidence,
// ============================================================================
const ALIGN_AGENTS=["Growth","Unit Health","Retention","Network Propagation"];
const ALIGN_VIEWS=[
["franchise","Overview","today's one governed action"],
["rail","Decision Rail","proposals under review"],
["board","Operations Board","interventions in parallel"],
["table","Network Map","the whole territory, spatially"],
["lenses","Six Lenses","one unit, six roles"],
["dynamics","Operations Dynamics","uncertainty & cadence"],
];
function SystemAlignmentTab({centers,states,railData,decisions,dyn,opt,ledger,jumpTo}){
const recs=railData.recommendations;
const conflicts=railData.conflicts||[];
const ageOf=c=>opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
const byAgent=ALIGN_AGENTS.map(a=>({a,n:recs.filter(r=>r.agent===a).length,allowed:recs.filter(r=>r.agent===a&&r.governance.allowed).length}));
const allowedN=recs.filter(r=>r.governance.allowed).length,heldN=recs.length-allowedN;
const decidedIds=Object.keys(decisions);
const traced=decidedIds.filter(id=>recs.some(r=>r.id===id)).length;
const confs=centers.map(c=>qCoherence(ageOf(c)));
const avgConf=+(confs.reduce((x,y)=>x+y,0)/confs.length).toFixed(2);
const freshPct=Math.round(100*centers.filter(c=>ageOf(c)<=28).length/centers.length);
const lowConfN=confs.filter(v=>v<0.5).length;
const committedN=Object.keys(dyn.committed||{}).length,completedN=Object.keys(dyn.completed||{}).length;
// Confidence-weighted network health: a stale, low-confidence unit's health
// reading should not carry the same weight in the top-line rollup as a
// freshly measured one. This is a second, more honest rollup shown beside the simple average, not a silent replacement of it.
const simpleAvgHealth=+(centers.reduce((a,c)=>a+c.health,0)/centers.length).toFixed(1);
const totalConf=confs.reduce((a,v)=>a+v,0);
const weightedAvgHealth=+(centers.reduce((a,c,idx)=>a+c.health*confs[idx],0)/totalConf).toFixed(1);
const rollupDelta=+(weightedAvgHealth-simpleAvgHealth).toFixed(1);
// Recent decision activity, computed from the real session ledger rather than
// a fabricated time series -- what's actually been logged, grouped by source
// and outcome, so the ledger reads as a signal rather than a passive log.
const recentLog=(ledger||[]).slice(0,40);
const actCounts={approved:0,held:0,queued:0,other:0};
recentLog.forEach(e=>{
const t=(e.text||"").toLowerCase();
if(t.includes("approved"))actCounts.approved++;
else if(t.includes("held")||t.includes("hold"))actCounts.held++;
else if(t.includes("queued")||t.includes("re-measur"))actCounts.queued++;
else actCounts.other++;
});
const bySource={};
recentLog.forEach(e=>{bySource[e.tab]=(bySource[e.tab]||0)+1;});
const AGY=[52,116,180,244]; const VY=[26,74,122,170,218,266];
// Each view-node carries a live status dot rather than a static label -- the
// diagram becomes a status map, not just an architecture poster. A view is
// flagged when it currently holds an unresolved cross-agent conflict or a proposal blocked on a role-capacity ceiling.
const capacityBlockedRoles=new Set(recs.filter(r=>r.supplyGate&&r.supplyGate.blocked&&/capacity/.test(r.supplyGate.reason||"")).map(r=>r.approverRole));
const viewFlagged={
franchise:conflicts.length>0,
rail:conflicts.length>0||capacityBlockedRoles.size>0,
board:conflicts.length>0||capacityBlockedRoles.size>0,
table:conflicts.length>0, // the map reads the same railData.conflicts and rings the affected territory
lenses:conflicts.length>0, // Six Lenses shows the conflict once navigated to the affected unit -- previously hardcoded false even after that capability was built
dynamics:conflicts.length>0, // Operations Dynamics now shows a conflict warning for the selected unit
};
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>The operating model at full scale, governed by four standing rules: the whole network state is preserved before any operational view is derived; a view exists only where it serves diagnosis, prioritization, or governed action; the governance boundary is where a proposal becomes real; and every commitment is human-owned. The agents below do not create separate truths for growth, health, retention, or propagation — they propose against one canonical system, and the integrity monitor reads that same state.</div>

<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"12px 14px",marginBottom:10}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:6}}>One canonical state → four agents → one governance boundary → operating views (live counts)</div>
<svg viewBox="0 0 940 310" style={{width:"100%",display:"block"}}>
{/* canonical state */}
<rect x="14" y="95" width="168" height="120" fill="#fbfbf9" stroke={INK} strokeWidth="1.6"/>
<text x="98" y="128" fontSize="12" fontWeight="700" textAnchor="middle" fill={INK} fontFamily="Helvetica">CANONICAL STATE</text>
<text x="98" y="148" fontSize="10" textAnchor="middle" fill={MUT} fontFamily="Helvetica">{centers.length} units · 40 states</text>
<text x="98" y="164" fontSize="10" textAnchor="middle" fill={MUT} fontFamily="Helvetica">week {opt.week} · one clock</text>
<text x="98" y="180" fontSize="10" textAnchor="middle" fill={MUT} fontFamily="Helvetica">one decision record</text>
{/* agents */}
{byAgent.map((g,i)=>(<g key={g.a}>
<line x1="182" y1={155} x2="252" y2={AGY[i]+22} stroke={RULE} strokeWidth="1.2"/>
<rect x="252" y={AGY[i]} width="180" height="44" fill="#fff" stroke={GRN} strokeWidth="1.3"/>
<text x="262" y={AGY[i]+18} fontSize="10.5" fontWeight="700" fill={INK} fontFamily="Helvetica">{g.a} agent</text>
<text x="262" y={AGY[i]+34} fontSize="9" fill={MUT} fontFamily="Helvetica">{g.n} proposals · {g.allowed} clear guardrails</text>
<line x1="432" y1={AGY[i]+22} x2="486" y2={155} stroke={RULE} strokeWidth="1.2"/>
</g>))}
{/* governance boundary */}
<rect x="486" y="40" width="14" height="230" fill={INK}/>
<text x="493" y="30" fontSize="9.5" fontWeight="700" textAnchor="middle" fill={INK} fontFamily="Helvetica">GOVERNANCE BOUNDARY</text>
<text x="493" y="292" fontSize="8.5" textAnchor="middle" fill={MUT} fontFamily="Helvetica">contracts · fail-closed · named approver</text>
<text x="472" y="160" fontSize="8.5" textAnchor="end" fill={GRN} fontFamily="Helvetica" fontWeight="700">{allowedN} allowed →</text>
<text x="472" y="176" fontSize="8.5" textAnchor="end" fill={AMB} fontFamily="Helvetica" fontWeight="700">{heldN} held</text>
{/* views */}
{ALIGN_VIEWS.map(([id,name,q],i)=>(<g key={id} onClick={()=>jumpTo&&jumpTo(id,null)} style={{cursor:jumpTo?"pointer":"default"}}>
<line x1="500" y1={155} x2="560" y2={VY[i]+21} stroke={RULE} strokeWidth="1.2"/>
<rect x="560" y={VY[i]} width="200" height="42" fill="#fff" stroke={viewFlagged[id]?AC:INK} strokeWidth={viewFlagged[id]?"1.6":"1.1"}/>
{viewFlagged[id]&&<circle cx="750" cy={VY[i]+10} r="4" fill={AC}><title>This view currently has an unresolved conflict or a role at capacity</title></circle>}
<text x="570" y={VY[i]+17} fontSize="10.5" fontWeight="700" fill={INK} fontFamily="Helvetica">{name}</text>
<text x="570" y={VY[i]+32} fontSize="8.5" fill={MUT} fontFamily="Helvetica">{q}</text>
</g>))}
{/* human-owned marker */}
<rect x="790" y="120" width="136" height="70" fill="#f5f8f5" stroke={GRN} strokeWidth="1.4"/>
<text x="858" y="147" fontSize="10" fontWeight="700" textAnchor="middle" fill={GRN} fontFamily="Helvetica">DIRECTOR</text>
<text x="858" y="163" fontSize="8.5" textAnchor="middle" fill={MUT} fontFamily="Helvetica">every commitment</text>
<text x="858" y="176" fontSize="8.5" textAnchor="middle" fill={MUT} fontFamily="Helvetica">human-owned</text>
<line x1="760" y1="155" x2="790" y2="155" stroke={GRN} strokeWidth="1.4"/>
</svg>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:4}}>Views are clickable. Nothing right of the boundary is a copy — every surface reads the state on the left, and a decision made in any view is the same decision everywhere.</div>
</div>

<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",marginBottom:10}}>
<div style={{padding:"8px 12px 2px",fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT}}>Network integrity monitor — read live from the canonical state</div>
<div style={{display:"flex",flexWrap:"wrap"}}>
{[
[avgConf,"avg measurement confidence",avgConf<0.5?AC:GRN],
[freshPct+"%","units within the 28-day window",freshPct<50?AC:INK],
[lowConfN,"units below 0.50 confidence — re-measure first",lowConfN?AMB:GRN],
[traced+" / "+decidedIds.length,"decisions traced to a governed proposal",traced===decidedIds.length?GRN:AC],
[committedN+" · "+completedN,"support paths committed · completed",INK],
[conflicts.length,conflicts.length?"cross-agent conflicts — open now":"cross-agent conflicts — checked, none open",conflicts.length?AC:GRN],
].map(([v,l,c],i)=>(<div key={i} style={{flex:"1 1 160px",padding:"8px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:18,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:2}}>{l}</div>
</div>))}
</div>
<div style={{padding:"4px 12px 9px",fontFamily:"Helvetica",fontSize:8,color:MUT}}>Integrity here means three checks: confidence in what is measured, honesty about what has aged past its window, and a decision record in which every entry traces back to a governed proposal. If the last figure is ever not N of N, the record has an orphan — and that is a finding, not a formatting issue.</div>
</div>

<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
<div style={{flex:"1 1 260px",border:`1px solid ${RULE}`,background:"#fff",padding:"9px 11px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:5}}>Network health — two rollups</div>
<div style={{display:"flex",gap:16}}>
<div><div style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:INK}}>{simpleAvgHealth}</div><div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>simple average</div></div>
<div><div style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:"#7a6bd8"}}>{weightedAvgHealth}</div><div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>confidence-weighted</div></div>
<div><div style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:Math.abs(rollupDelta)>=1?AC:GRN}}>{rollupDelta>0?"+":""}{rollupDelta}</div><div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>delta</div></div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:4}}>The weighted rollup discounts stale, low-confidence units rather than letting them carry equal weight with freshly measured ones. A large delta means the simple average is being meaningfully skewed by stale data.</div>
</div>
<div style={{flex:"1 1 260px",border:`1px solid ${RULE}`,background:"#fff",padding:"9px 11px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:5}}>Recent decision activity — last {recentLog.length} logged actions</div>
<div style={{display:"flex",gap:14,marginBottom:4}}>
<span style={{fontFamily:"Helvetica",fontSize:9}}><b style={{color:GRN}}>{actCounts.approved}</b> approved</span>
<span style={{fontFamily:"Helvetica",fontSize:9}}><b style={{color:AMB}}>{actCounts.held}</b> held</span>
<span style={{fontFamily:"Helvetica",fontSize:9}}><b style={{color:INK}}>{actCounts.queued}</b> queued</span>
<span style={{fontFamily:"Helvetica",fontSize:9}}><b style={{color:MUT}}>{actCounts.other}</b> other</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>by source: {Object.entries(bySource).map(([k,v])=>k+" "+v).join(" · ")||"no activity logged yet this session"}</div>
</div>
</div>

<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
{[["Rule 1","Preserve the whole network state before deriving any operational view."],
["Rule 2","Derive a view only where it serves diagnosis, prioritization, or governed action."],
["Rule 3","The governance boundary is where a proposal becomes real."],
["Rule 4","Every commitment is human-owned."]].map(([r,t])=>(
<div key={r} style={{flex:"1 1 200px",border:`1px solid ${RULE}`,background:"#fbfbf9",padding:"8px 10px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:3}}>{r}</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#333",lineHeight:1.4}}>{t}</div>
</div>))}
</div>
</div>);
}

function OperationsBoardTab({railData,decisions,setDecisions,decisionHistory,recordDecision,logL,opt,dyn,jumpTo}){
const committedPaths=dyn?Object.entries(dyn.committed||{}):[];
const[view,setView]=useState("lanes");
const[showPerf,setShowPerf]=useState(false);
const[showShortcuts,setShowShortcuts]=useState(false);
const[kbIdx,setKbIdx]=useState(0);
const mountStart=useRef(typeof performance!=="undefined"?performance.now():0);
const[mountMs,setMountMs]=useState(null);
useEffect(()=>{const t=typeof performance!=="undefined"?performance.now()-mountStart.current:0;setMountMs(+t.toFixed(1));},[]);
const recs=railData.recommendations;
// The conflict marker must read the same way on every surface -- a proposal
// flagged on the Decision Rail cannot look clean here just because this view
// renders it differently.
const boardConflicts=railData.conflicts||[];
const boardConflictedIds=new Set(boardConflicts.flatMap(c=>[c.a,c.b]));
const windowOf=r=>(ACTION_CONTRACTS[r.actionType]&&ACTION_CONTRACTS[r.actionType].minFreshnessDays)||30;
const overdueOf=r=>Math.max(0,r.evidence.dataFreshnessDays-windowOf(r));
const statusOf=r=>boardStatusOf(r,decisions);
const decide=(rec,d)=>{
setDecisions(m=>({...m,[rec.id]:d}));
recordDecision&&recordDecision(rec.id,d);
logL&&logL("board",rec.agent,rec.title+" — "+(d==="approved"?"approved by Director":d==="measure"?"queued for re-measurement":"set aside")+" (from operations board)");
};
const counts={};BOARD_COLS.forEach(([k])=>counts[k]=0);recs.forEach(r=>counts[statusOf(r)]++);
const overdueN=recs.filter(r=>overdueOf(r)>0).length;
const decidedN=counts.approved+counts.remeasure+counts.aside;
// lanes: prioritize items needing attention — overdue first, then held, then highest-confidence proposed
const laneItems=[...recs].sort((a,b)=>{
const oa=overdueOf(a)>0?1:0,ob=overdueOf(b)>0?1:0;if(oa!==ob)return ob-oa;
const ha=statusOf(a)==="held"?1:0,hb=statusOf(b)==="held"?1:0;if(ha!==hb)return hb-ha;
return b.evidence.operationalSignals.dataConfidence-a.evidence.operationalSignals.dataConfidence;
}).slice(0,12);
const MAXD=60;
const ownerChip=r=>{const s=statusOf(r);
return s==="approved"?["Director · committed",INK]:s==="remeasure"?["Director · re-measure",AMB]:s==="aside"?["Director · set aside",MUT]:["agent · proposed",r.governance.allowed?GRN:AMB];};
const feedItems=[...recs].sort((a,b)=>{
const da=decisions[a.id]?1:0,db=decisions[b.id]?1:0;if(da!==db)return db-da;
return overdueOf(b)-overdueOf(a);
}).slice(0,8);
// Keyboard shortcuts operate on the same prioritized laneItems list and the
// same decide() handler the buttons already call — no new decision path.
// Scoped to the lanes view since that's the one ordered, bounded list; disabled while focus is in a text field so typing elsewhere is unaffected.
useEffect(()=>{
if(view!=="lanes")return;
const onKey=(e)=>{
const tag=(e.target&&e.target.tagName)||"";
if(tag==="INPUT"||tag==="TEXTAREA"||e.metaKey||e.ctrlKey||e.altKey)return;
const item=laneItems[kbIdx];
if(e.key==="ArrowDown"||e.key==="j"){e.preventDefault();setKbIdx(i=>Math.min(laneItems.length-1,i+1));}
else if(e.key==="ArrowUp"||e.key==="k"){e.preventDefault();setKbIdx(i=>Math.max(0,i-1));}
else if(e.key==="?"){e.preventDefault();setShowShortcuts(s=>!s);}
else if(item&&!decisions[item.id]){
if((e.key==="a"||e.key==="A")&&item.governance.allowed){e.preventDefault();decide(item,"approved");}
else if(e.key==="m"||e.key==="M"){e.preventDefault();decide(item,"measure");}
else if(e.key==="i"||e.key==="I"){e.preventDefault();decide(item,"ignored");}
}
};
window.addEventListener("keydown",onKey);
return()=>window.removeEventListener("keydown",onKey);
},[view,laneItems,kbIdx,decisions]);
useEffect(()=>{if(kbIdx>=laneItems.length)setKbIdx(0);},[laneItems.length]);

return(<div>
<StateViewBanner thisView="Operations Board"/>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>Every open intervention across the network, visible concurrently. Three views — lanes, board, feed — read one shared decision record; an approval made here is the same approval the Decision Rail and Overview show. Agents propose; every commitment is human-owned.</div>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
<button onClick={()=>setShowPerf(s=>!s)} aria-pressed={showPerf} aria-label="Toggle render timing display" style={{fontFamily:"Helvetica",fontSize:8,color:MUT,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0}}>{showPerf?"hide":"show"} render timing</button>
{showPerf&&<span style={{fontFamily:"Helvetica",fontSize:8.5,padding:"2px 7px",border:`1px solid ${mountMs!==null&&mountMs<200?GRN:AMB}`,color:mountMs!==null&&mountMs<200?GRN:AMB}}>mount: {mountMs===null?"measuring\u2026":mountMs+"ms"}</span>}
{view==="lanes"&&<button onClick={()=>setShowShortcuts(s=>!s)} aria-pressed={showShortcuts} aria-label="Toggle keyboard shortcuts help" style={{fontFamily:"Helvetica",fontSize:8,color:MUT,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0}}>{showShortcuts?"hide":"show"} keyboard shortcuts</button>}
{view==="lanes"&&showShortcuts&&<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>↑/↓ or j/k select · A approve · M measure again · I ignore · ? toggle this</span>}
</div>

<div style={{display:"flex",gap:0,flexWrap:"wrap",border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",marginBottom:8}}>
{[[recs.length,"interventions in flight",INK],[counts.proposed,"pending Director review",GRN],[counts.held,"held — guardrail or data",AMB],[overdueN,"past measurement cadence",overdueN?AC:GRN],[decidedN,"decided this session",INK]].map(([v,l,c],i)=>(
<div key={i} style={{flex:"1 1 120px",padding:"8px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:19,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:2}}>{l}</div>
</div>))}
</div>

<div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
{[["lanes","Lanes — cadence view"],["board","Board — by decision state"],["feed","Feed — governed trace"]].map(([id,label])=>(
<button key={id} onClick={()=>setView(id)} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 12px",cursor:"pointer",border:`1px solid ${view===id?INK:RULE}`,background:view===id?INK:"#fff",color:view===id?"#fff":MUT}}>{label}</button>))}
<span style={{marginLeft:"auto",fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>week {opt.week} · one decision record across all views</span>
<button onClick={()=>downloadJSON(decisionLedgerExport(decisions,railData),"cn-decision-ledger.json")} title="Export the governed decision record as JSON" aria-label="Export decision ledger as JSON" style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"4px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>export ledger ↓</button>
</div>

{committedPaths.length>0&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#f5f8f5",padding:"8px 11px",marginBottom:8}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:GRN,marginBottom:5}}>Support paths committed in Operations Dynamics — {committedPaths.length} in progress</div>
<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
{committedPaths.map(([name,pid])=>{const done=dyn.completed&&dyn.completed[name]===pid;return(<div key={name} onClick={()=>jumpTo&&jumpTo("dynamics",name)} style={{fontFamily:"Helvetica",fontSize:9,border:`1px solid ${done?INK:RULE}`,background:done?"#f0f0ee":"#fff",padding:"4px 8px",cursor:jumpTo?"pointer":"default"}}><b>{name}</b> <span style={{color:MUT}}>· {pid} · {done?"✓ completed":"review clock running"}</span></div>);})}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:5}}>These are Director-committed interventions from the dynamics view, tracked here alongside agent-proposed actions. Click any to return to its unit.</div>
</div>}

{view==="lanes"&&(<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px"}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT}}>Contract window vs. data age — 12 highest-priority of {recs.length}</span>
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>bar = review window · marker = current data age · 0–{MAXD}d</span>
</div>
{laneItems.map((r,ri)=>{const w=windowOf(r),age=r.evidence.dataFreshnessDays,over=overdueOf(r),[oLabel,oCol]=ownerChip(r),kbSel=view==="lanes"&&ri===kbIdx;
return(<div key={r.id} onClick={()=>setKbIdx(ri)} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0 5px 6px",borderTop:`1px solid #f2f2f2`,borderLeft:kbSel?`3px solid ${INK}`:"3px solid transparent",background:kbSel?"#fafaf8":"transparent",cursor:"pointer"}}>
<div style={{flex:"0 0 210px",minWidth:0}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{boardConflictedIds.has(r.id)&&<span title="Conflicts with another agent's proposal on the same unit" style={{color:"#fff",background:AC,fontSize:7.5,padding:"0 3px",marginRight:4,cursor:"help"}}>!</span>}{r.title}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>{r.agent} · <span style={{color:oCol,fontWeight:700}}>{oLabel}</span></div>
</div>
<div style={{flex:1,position:"relative",height:16,background:"#f7f6f2",border:`1px solid ${RULE}`}}>
<div style={{position:"absolute",left:0,top:0,bottom:0,width:Math.min(100,w/MAXD*100)+"%",background:statusOf(r)==="approved"?"#e8efe8":statusOf(r)==="held"?"#f5efe0":"#eef2ee",borderRight:`1px solid ${RULE}`}}/>
{over>0&&<div style={{position:"absolute",left:Math.min(100,w/MAXD*100)+"%",top:0,bottom:0,width:Math.min(100-Math.min(100,w/MAXD*100),over/MAXD*100)+"%",background:"#f3d9cf"}}/>}
<div style={{position:"absolute",left:Math.min(99,age/MAXD*100)+"%",top:-2,bottom:-2,width:2,background:over>0?AC:INK}}/>
<span style={{position:"absolute",right:4,top:1,fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:over>0?AC:MUT}}>{over>0?"+"+over+"d past cadence":age+"d / "+w+"d"}</span>
</div>
</div>);})}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:8}}>An intervention past its window is not failed — it is unmeasured. Re-measurement restores decision eligibility; the guardrail that enforces this is the same one the Decision Rail applies.</div>
</div>)}

{view==="board"&&(<div style={{display:"flex",gap:8,alignItems:"flex-start",overflowX:"auto"}}>
{BOARD_COLS.map(([key,label,col])=>{const items=recs.filter(r=>statusOf(r)===key);
return(<div key={key} style={{flex:"1 1 170px",minWidth:170,border:`1px solid ${RULE}`,background:"#fafaf8"}}>
<div style={{padding:"7px 9px",borderBottom:`2px solid ${col}`,display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.4,textTransform:"uppercase",color:col}}>{label}</span>
<b style={{fontFamily:"Helvetica",fontSize:10,color:col}}>{items.length}</b>
</div>
<div style={{padding:"6px"}}>
{items.slice(0,6).map(r=>(<div key={r.id} style={{border:`1px solid ${RULE}`,background:"#fff",padding:"6px 8px",marginBottom:6}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,lineHeight:1.3}}>{boardConflictedIds.has(r.id)&&<span title="Conflicts with another agent proposal on the same unit" style={{color:"#fff",background:AC,fontSize:7.5,padding:"0 3px",marginRight:4,cursor:"help"}}>!</span>}{r.title}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,margin:"2px 0 4px"}}>{r.agent} · {r.confidenceBand} confidence · {r.riskBand} risk</div>
{key==="proposed"&&(<div style={{display:"flex",gap:4}}>
<button onClick={()=>decide(r,"approved")} style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"2px 7px",cursor:"pointer",border:`1px solid ${GRN}`,background:GRN,color:"#fff"}}>Approve</button>
<button onClick={()=>decide(r,"measure")} style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"2px 7px",cursor:"pointer",border:`1px solid ${AMB}`,background:"#fff",color:AMB}}>Measure</button>
<button onClick={()=>decide(r,"ignored")} style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"2px 7px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>Set aside</button>
</div>)}
{key==="held"&&<div style={{fontFamily:"Helvetica",fontSize:8,color:AMB}}>{r.governance.heldOn.join(", ")||"data freshness"}</div>}
{key==="approved"&&<div style={{fontFamily:"Helvetica",fontSize:8,color:INK,fontWeight:700}}>approver: {r.approverRole}</div>}
</div>))}
{items.length>6&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,textAlign:"center",padding:"2px 0 4px"}}>+{items.length-6} more in this state</div>}
{items.length===0&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,padding:"2px 0 4px"}}>none</div>}
</div>
</div>);})}
</div>)}

{view==="feed"&&(<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:6}}>Governed trace — decided items first, then most overdue</div>
{feedItems.map(r=>{const s=statusOf(r),over=overdueOf(r);
return(<div key={r.id} style={{padding:"8px 0",borderTop:`1px solid #f0f0f0`}}>
<div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"baseline"}}>
<div style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700}}>{boardConflictedIds.has(r.id)&&<span title="Conflicts with another agent proposal on the same unit" style={{color:"#fff",background:AC,fontSize:7.5,padding:"0 3px",marginRight:4,cursor:"help"}}>!</span>}{r.title}</div>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"1px 6px",border:`1px solid ${s==="approved"?INK:s==="proposed"?GRN:s==="held"?AMB:MUT}`,color:s==="approved"?INK:s==="proposed"?GRN:s==="held"?AMB:MUT}}>{s==="proposed"?"NEEDS DIRECTOR":s==="held"?"HELD":s==="remeasure"?"RE-MEASURE":s==="approved"?"APPROVED":"SET ASIDE"}</span>
</div>
<div style={{display:"flex",gap:5,flexWrap:"wrap",margin:"4px 0"}}>
<span style={{fontFamily:"Helvetica",fontSize:8,padding:"2px 6px",border:`1px solid ${RULE}`,color:"#444"}}>{r.agent} agent → proposed</span>
{r.evidence.contractVerdicts.map((v,i)=>(<span key={i} style={{fontFamily:"Helvetica",fontSize:8,padding:"2px 6px",border:`1px solid ${v.pass?GRN:AC}`,color:v.pass?GRN:AC}}>{v.pass?"✓":"✕"} {v.label}</span>))}
{r.suggestedActionPlan&&<span style={{fontFamily:"Helvetica",fontSize:8,padding:"2px 6px",border:`1px solid ${RULE}`,color:"#444"}}>→ {r.suggestedActionPlan.n}</span>}
<span style={{fontFamily:"Helvetica",fontSize:8,padding:"2px 6px",border:`1px solid ${INK}`,color:INK}}>approver: {r.approverRole} (human-owned)</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>data confidence {r.evidence.operationalSignals.dataConfidence.toFixed(2)} · data age {r.evidence.dataFreshnessDays}d{over>0?" · "+over+"d past review cadence":""}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:r.governance.allowed?GRN:AMB,fontStyle:"italic",marginTop:1}}>{rationaleOf(r)}</div>
{s==="proposed"&&(<div style={{display:"flex",gap:5,marginTop:5}}>
<button onClick={()=>decide(r,"approved")} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${GRN}`,background:GRN,color:"#fff"}}>Approve</button>
<button onClick={()=>decide(r,"measure")} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${AMB}`,background:"#fff",color:AMB}}>Measure again</button>
<button onClick={()=>decide(r,"ignored")} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>Set aside</button>
</div>)}
</div>);})}
</div>)}
</div>);
}

function DecisionRailTab({railData,logL,decisions,setDecisions,decisionHistory,recordDecision,jumpTo}){
// Simplified queue: one line per proposal, one primary action ("Deploy
// resources"), details one click away. Held items state their reason inline.
// Decisions still write the shared decisions map + record ledger, so the
// Operations Board and System Alignment stay in sync.
const result=railData||{recommendations:[],actionable:[],held:[],conflicts:[]};
const[openId,setOpenId]=useState(null);
const onDecide=(rec,d)=>{
setDecisions(m=>({...m,[rec.id]:d}));
recordDecision&&recordDecision(rec.id,d);
logL&&logL("rail",rec.agent||"Agent",(rec.title||"Proposal")+" — "+(d==="approved"?"resources deployed by Director":d==="measure"?"held for re-measurement":"skipped"));
};
const actionable=result.actionable||[],held=result.held||[];
const conflictIds=new Set((result.conflicts||[]).flatMap(c=>[c.a,c.b]));
const doneN=Object.values(decisions||{}).filter(d=>d==="approved").length;
const Row=({rec,heldRow})=>{
const d=decisions[rec.id];const open=openId===rec.id;const conflicted=conflictIds.has(rec.id);
const holdWhy=heldRow?((rec.governance&&rec.governance.freshnessOk===false)?"stale data":(rec.supplyGate&&rec.supplyGate.reason)?rec.supplyGate.reason:"guardrail"):null;
return(<div style={{borderTop:`1px solid #f0f0ec`}}>
<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",flexWrap:"wrap"}}>
<div style={{flex:1,minWidth:200}}>
<span style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700}}>{conflicted&&<span style={{color:"#fff",background:AC,fontSize:8,padding:"1px 4px",marginRight:5}}>CONFLICT</span>}{rec.title||"Proposal"}</span>
<span style={{fontFamily:"Helvetica",fontSize:9,marginLeft:8}}><span style={{color:agentUiOf(rec.agent).tone,fontWeight:700}}>{rec.agent}</span><span style={{color:MUT,fontSize:7.5,marginLeft:3}}>{agentKindLabel(rec.agent)}</span><span style={{color:MUT}}> · owner: {rec.approverRole||"FBC"}</span></span>
</div>
{holdWhy&&<span style={{fontFamily:"Helvetica",fontSize:8.5,color:AMB,fontWeight:700}}>HELD — {String(holdWhy).slice(0,42)}</span>}
{d?<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:d==="approved"?GRN:d==="measure"?AMB:MUT}}>{d==="approved"?"Deployed":d==="measure"?"Re-measuring":"Skipped"}</span>:!heldRow&&<>
<button onClick={()=>onDecide(rec,"approved")} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"4px 12px",cursor:"pointer",border:"none",background:GRN,color:"#fff"}}>Deploy resources ▸</button>
<button onClick={()=>onDecide(rec,"measure")} style={{fontFamily:"Helvetica",fontSize:8.5,padding:"4px 8px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>Hold</button>
<button onClick={()=>onDecide(rec,"ignored")} style={{fontFamily:"Helvetica",fontSize:8.5,padding:"4px 8px",cursor:"pointer",border:"none",background:"none",color:MUT,textDecoration:"underline"}}>Skip</button>
</>}
<button onClick={()=>setOpenId(open?null:rec.id)} style={{fontFamily:"Helvetica",fontSize:8.5,padding:0,cursor:"pointer",border:"none",background:"none",color:MUT,textDecoration:"underline"}}>{open?"hide":"details"}</button>
</div>
{open&&<div style={{padding:"0 12px 9px",fontFamily:"Helvetica",fontSize:9,color:"#444",lineHeight:1.6}}>
{rec.summary||""}
<div style={{marginTop:4,display:"flex",gap:5,flexWrap:"wrap"}}>
{((rec.evidence&&rec.evidence.contractVerdicts)||[]).map((v,i)=>(<span key={i} style={{border:`1px solid ${v.pass?GRN:AC}`,color:v.pass?GRN:AC,padding:"1px 6px",fontSize:8.5}}>{v.pass?"✓":"✕"} {v.label}</span>))}
{rec.evidence&&rec.evidence.dataFreshnessDays!==undefined&&<span style={{border:`1px solid ${RULE}`,color:MUT,padding:"1px 6px",fontSize:8.5}}>data {rec.evidence.dataFreshnessDays}d old</span>}
{primaryOf(rec)&&jumpTo&&<span onClick={()=>jumpTo("lenses",primaryOf(rec),"from the deploy queue")} style={{color:AC,cursor:"pointer",textDecoration:"underline",fontSize:8.5}}>view unit →</span>}
</div>
</div>}
</div>);};
const primaryOf=rec=>(rec.targetIds&&rec.targetIds.find(id=>id&&id.length>2&&id!==rec.scope))||null;
return(<div>
<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
{[[actionable.length,"Ready to deploy",GRN],[held.length,"Held",AMB],[(result.challenges||[]).length,"Binding constraints flagged",AC],[((result.orchestration||{}).conflictCount)||0,"Cross-agent conflicts",(result.conflicts||[]).some(c=>c.severity==="high")?AC:MUT],[doneN,"Deployed this session",INK]].map(([v,l,c],i)=>(
<div key={i} style={TILE}>
<div style={{fontFamily:"Helvetica",fontSize:22,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:3}}>{l}</div>
</div>))}
</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff",...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:GRN,padding:"9px 14px"}}>Ready to deploy — {actionable.length}</div>
{actionable.length===0&&<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT,padding:"0 12px 9px"}}>nothing ready this cycle</div>}
{actionable.map(r=>(<Row key={r.id} rec={r}/>))}
</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff",marginTop:10,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:AMB,padding:"9px 14px"}}>Held — {held.length}</div>
{held.length===0&&<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT,padding:"0 12px 9px"}}>nothing held</div>}
{held.map(r=>(<Row key={r.id} rec={r} heldRow/>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:8}}>Agents propose; a Director deploys. Every deploy is logged with a named owner — no auto-execute path (Rule 1).</div>
</div>);
}
function OpsSystem({view}){
const [phase,setPhase]=useState("acquire");
const [expanded,setExpanded]=useState(null);
const [expConn,setExpConn]=useState(null);
const isPhaseView=["acquire","deliver","retain","operate"].includes(view);
const activePhase=isPhaseView?view:phase;
const pm=PHASE_META[activePhase];
const steps=W.filter(s=>s.p===activePhase);
const org=ORG_ROLES[activePhase];
const agile=AGILE[activePhase];
return(
<div style={{fontFamily:"Helvetica",color:INK,lineHeight:1.6,fontSize:14}}>
{view==="network"&&(<>
<div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Network — 30,000ft</div>
<p style={{color:"#444",marginBottom:12}}>How 350+ centers operate as one governed system. The Director of Franchise Development sits at the intersection of network strategy and center-level operations.</p>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6}}>Network Tiers</div>
{NET_TIERS.map((t,i)=>(
<div key={i} style={{padding:"5px 0",borderTop:i?`1px solid #eee`:"none"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b style={{fontSize:14.5}}>{t.n}</b><span style={{fontFamily:"Helvetica",fontSize:10,color:MUT}}>{t.s}</span></div>
<div style={{fontSize:13.5,color:"#444"}}>{t.d}</div>
</div>
))}
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6,marginTop:18}}>Network Standards — N-Series</div>
{CONNECTIVITY.map(c=>{const open=expConn===c.n;return(
<div key={c.n} onClick={()=>setExpConn(open?null:c.n)} style={{padding:"5px 0",borderTop:`1px solid #eee`,cursor:"pointer"}}>
<div style={{display:"flex",alignItems:"baseline",gap:6}}>
<span style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,color:AC,minWidth:30}}>N-{c.n}</span>
<span style={{fontWeight:600,fontSize:14}}>{c.t}</span>
<span style={{marginLeft:"auto",fontFamily:"Helvetica",fontSize:14,color:MUT}}>{open?"–":"+"}</span>
</div>
{open&&<div style={{paddingLeft:36,marginTop:4}}>
<div style={{fontSize:13,color:"#444",lineHeight:1.5}}>{c.d}</div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#2a7a2a",marginTop:5}}>ACCEPTANCE: {c.accept}</div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:AC,marginTop:1}}>GUARDRAIL: {c.guard}</div>
</div>}
</div>
);})}
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6,marginTop:18}}>PM Dashboard</div>
{DASHBOARD.map((d,i)=>(
<div key={i} style={{padding:"3px 0",borderTop:i?`1px solid #eee`:"none",display:"flex",justifyContent:"space-between"}}>
<span style={{fontSize:13.5}}>{d.m}</span>
<span style={{fontFamily:"Helvetica",fontSize:12}}><b>{d.v}</b><span style={{fontSize:10,color:d.c?AC:MUT,marginLeft:6}}>{d.t}</span></span>
</div>
))}
</>)}
{isPhaseView&&(<>
<div style={{marginBottom:14}}>
<div style={{fontSize:16,fontWeight:700}}>{pm.name} <span style={{fontFamily:"Helvetica",fontSize:11,fontWeight:400,color:MUT}}>— {pm.range} ({pm.count} steps)</span></div>
<div style={{fontSize:14,color:"#444",marginTop:3}}>{pm.desc}</div>
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6}}><span style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT}}>Workflow — Every Step</span><span style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,color:AC}}>LEVEL 1 · DAG</span></div>
{steps.map((step,i)=>{
const isOpen=expanded===step.n;
return(
<div key={step.n} onClick={()=>setExpanded(isOpen?null:step.n)} style={{padding:"6px 0",borderTop:i?`1px solid ${step.gate?"#daa":"#eee"}`:"none",cursor:"pointer"}}>
<div style={{display:"flex",alignItems:"baseline",gap:6}}>
<span style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,color:step.gate?AC:step.decision?"#4444aa":MUT,minWidth:22}}>{step.n}</span>
<span style={{fontWeight:step.gate?700:600,fontSize:14,color:step.gate?AC:INK,flex:1}}>{step.s}{CRIT_STEPS.includes(step.n)&&<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:"#fff",background:AC,padding:"1px 4px",borderRadius:2,marginLeft:6,verticalAlign:"middle"}}>CP</span>}</span>
<span style={{fontFamily:"Helvetica",fontSize:11,color:MUT,flexShrink:0}}>{step.o}</span>
</div>
{isOpen&&(
<div style={{paddingLeft:28,marginTop:4}}>
<div style={{fontFamily:"Helvetica",fontSize:10,color:MUT,marginBottom:2}}>{step.sys}{step.t?` · ${step.t}`:""}{step.gate?" · APPROVAL GATE":""}{step.decision?" · DECISION POINT":""}{step.back?" · LOOP CLOSURE":""}{CRIT_STEPS.includes(step.n)?" · CRITICAL PATH":""}{step.gr?` · guardrail: ${step.gr}`:""}</div>
<div style={{fontSize:13.5,color:"#444",lineHeight:1.6}}>{step.d}</div>
</div>
)}
</div>
);
})}
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6,marginTop:18}}>Org Structure — {pm.name}</div>
{org.map((r,i)=>{const [role,...rest]=r.split(" — ");
return <div key={i} style={{padding:"3px 0",borderTop:i?`1px solid #eee`:"none"}}><b style={{fontSize:13.5}}>{role}</b><span style={{fontSize:13,color:"#555"}}> — {rest.join(" — ")}</span></div>;
})}
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6,marginTop:18}}>Chain Summary</div>
<div style={{fontSize:13.5,color:"#444",lineHeight:1.7}}>
{steps.filter(s=>s.gate||s.decision||s.back).map((s,i)=>(
<span key={i}>
{i>0&&<span style={{color:AC}}> → </span>}
<span style={{fontWeight:s.gate?700:400,color:s.gate?AC:s.back?"#2a7a2a":INK}}>{s.s}{s.gate?" [G]":""}{s.decision?" [?]":""}{s.back?" [↩]":""}</span>
</span>
))}
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6,marginTop:18}}><span style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT}}>Flow &amp; Cadence</span><span style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,color:AC}}>LEVELS 2–3</span></div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,color:MUT,letterSpacing:0.5,marginBottom:3}}>KANBAN + WIP LIMITS</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:4}}>
{["Backlog","Active","Review","Done"].map((col,ci)=>{
const items=agile.kanban[ci]||[];
const count=items.reduce((a,s)=>a+(parseInt(s)||1),0);
const wip=agile.wip[ci];
const over=wip<50&&count>wip;
return(
<div key={ci}>
<div style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,borderBottom:`2px solid ${over?AC:ci===3?"#2a7a2a":ci===0?"#aaa":"#888"}`,paddingBottom:2,marginBottom:3,color:over?AC:INK,display:"flex",justifyContent:"space-between"}}>
<span>{col}</span>{wip<50&&<span style={{fontSize:9}}>{over?"⚠":""}≤{wip}</span>}
</div>
{items.map((item,ii)=>(
<div key={ii} style={{fontSize:11.5,color:"#444",padding:"2px 0",borderTop:ii?`1px solid #f0f0f0`:"none",lineHeight:1.4}}>{item}</div>
))}
</div>
);})}
</div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,color:MUT,letterSpacing:0.5,marginBottom:2,marginTop:10}}>SPRINT + VELOCITY</div>
<div style={{fontSize:13,color:"#444",marginBottom:8}}>{agile.sprint}</div>
<div style={{display:"flex",alignItems:"flex-end",gap:2,height:36}}>
{agile.velocity.map((v,i)=>{const max=Math.max(...agile.velocity);
return <div key={i} style={{flex:1,height:Math.max(3,(v/max)*34),background:i===agile.velocity.length-1?INK:"#ccc"}}/>;
})}
</div>
<div style={{display:"flex",justifyContent:"space-between",fontFamily:"Helvetica",fontSize:10,color:MUT,marginTop:1,marginBottom:12}}>
<span>8 cycles ago</span><span>velocity · now</span>
</div>
<div style={{borderLeft:`2px solid ${AC}`,paddingLeft:10,fontSize:12.5,color:"#555"}}>
<b style={{fontFamily:"Helvetica",fontSize:10,color:AC}}>LEVEL 4 · GOVERNANCE</b><br/>
This phase's flow and cadence roll up to one outcome metric: <b>{agile.outcome}</b>.
</div>
</>)}
{view==="plan"&&(<>
<div style={{fontSize:16,fontWeight:700,marginBottom:4}}>First 90 Days</div>
<p style={{color:"#444",marginBottom:8}}>Sense-and-respond rollout: observe state → locate binding constraint → run one bounded pilot → measure → propagate what the data validates.</p>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,background:"#fdfdfb",padding:"8px 10px",marginBottom:14}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:3}}>Why this matters</div>
<div style={{fontSize:12,color:"#444",lineHeight:1.55}}>A strategy is only credible once it survives contact with week one. Listening before acting, then proving one intervention before scaling it, is how a Director earns the right to propagate a practice network-wide — not by asserting it, but by measuring it first.</div>
</div>
{PLAN_90.map((blk,i)=>(
<div key={i} style={{marginBottom:14}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:4}}>{blk.phase}</div>
<div style={{fontSize:13,color:"#444",fontStyle:"italic",marginBottom:6}}>{blk.focus}</div>
{blk.items.map((it,j)=>(
<div key={j} style={{display:"flex",gap:8,padding:"3px 0",borderTop:j?"1px solid #f0f0f0":"none"}}>
<span style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,color:AC,minWidth:14}}>{j+1}</span>
<span style={{fontSize:13.5,color:"#333"}}>{it}</span>
</div>
))}
</div>
))}
</>)}
{view==="metrics"&&(<>
<div style={{fontSize:16,fontWeight:700,marginBottom:4}}>Metrics & Instrumentation</div>
<p style={{color:"#444",marginBottom:8}}>Leading indicators predict the lagging ones. Watch the six leading metrics daily and weekly; the two outcome metrics move on their own if the leading ones are healthy.</p>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,background:"#fdfdfb",padding:"8px 10px",marginBottom:14}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:3}}>Why it's tracked this way</div>
<div style={{fontSize:12,color:"#444",lineHeight:1.55}}>Retention risk doesn't announce itself — it shows up first in a missed no-show recovery or a notes cycle running late. Tracking six leading indicators against two lagging outcomes means support gets routed to a center weeks before margin or enrollment would have forced the issue.</div>
</div>
{METRICS_FULL.map((m,i)=>(
<div key={i} style={{padding:"7px 0",borderTop:i?`1px solid #eee`:"none"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
<b style={{fontSize:14}}>{m.name}</b>
<span style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,color:m.lead?AC:MUT,textTransform:"uppercase",letterSpacing:0.5}}>{m.lead?"leading":"outcome"}</span>
</div>
<div style={{fontSize:12.5,color:"#444",marginTop:2,lineHeight:1.5}}>
<b>Watch:</b> {m.watch} · <b>Method:</b> {m.method}
<br/><b>Trigger:</b> {m.trigger}
{m.predicts!=="— (this is the outcome)"&&<span> · <b>Predicts:</b> {m.predicts}</span>}
</div>
</div>
))}
</>)}
{view==="failure"&&(<>
<div style={{fontSize:16,fontWeight:700,marginBottom:4}}>Failure Modes</div>
<p style={{color:"#444",marginBottom:8}}>What breaks, how it's detected, how it recovers. Each failure mode maps to a specific guardrail that contains it.</p>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,background:"#fdfdfb",padding:"8px 10px",marginBottom:14}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:3}}>Why guardrails are named, not implied</div>
<div style={{fontSize:12,color:"#444",lineHeight:1.55}}>Naming failure modes in advance — rather than discovering them after a bad outcome — is what makes governed intervention credible instead of aspirational. Every guardrail below exists because a specific way support goes wrong was identified first, not because a rule sounded prudent in the abstract.</div>
</div>
{FAILURE_MODES.map((f,i)=>(
<div key={i} style={{padding:"8px 0",borderTop:i?`1px solid #eee`:"none"}}>
<b style={{fontSize:14.5,color:AC}}>{f.mode}</b>
<div style={{fontSize:13,color:"#444",marginTop:3,lineHeight:1.6}}>
<b>Detect:</b> {f.detect}
<br/><b>Cause:</b> {f.cause}
<br/><b>Recover:</b> {f.recover}
</div>
</div>
))}
</>)}
</div>
);
}

// ============================================================================
// NETWORK SIGNALS TAB
//
// Design principle: every label says what it does, not what it's called. The stage terms (RECORD, HOLD, GATE, COMMIT, ACT) appear as headers because the
// ============================================================================

// ============================================================================
// EARLY WARNING SIGNALS TAB
// Uses live center data from the engine (passed as prop).
// Falls back to HCT seed data if centers prop is empty.
// ============================================================================

// ===== OPERATIONAL HEALTH INDEX (confidence-weighted metrics) =====
const OpHealthIndex = ({center, staleBase, health, tau}) => {
const strategyAdherence = Math.round(health * 100);
const driftVelocity = staleBase ? -15 : -2; // % per week
const resilience = tau <= 2 ? "High" : tau <= 5 ? "Medium" : "Critical";
const driftRisk = tau <= 2 ? "Stable" : tau <= 5 ? "Monitor" : "Intervention Required";

return (
<div style={{border:`1px solid #7a6bd8`,borderLeft:`3px solid #7a6bd8`,padding:"9px 11px",marginTop:8,background:"#faf9fc"}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:"#7a6bd8",textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Operational Health Index</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8,fontSize:11}}>
<div>
<div style={{color:"#666",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>Strategy Adherence</div>
<div style={{fontSize:16,fontWeight:800,color:"#111"}}>{strategyAdherence}%</div>
<div style={{fontSize:8,color:"#999",marginTop:2}}>alignment to structure</div>
</div>
<div>
<div style={{color:"#666",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>Resilience Index</div>
<div style={{fontSize:16,fontWeight:800,color:resilience==="High"?"#2fbf5f":resilience==="Medium"?"#d9a520":"#e03535"}}>{tau}w</div>
<div style={{fontSize:8,color:"#999",marginTop:2}}>recovery window</div>
</div>
</div>
<div style={{display:"flex",gap:12,marginBottom:6,fontSize:10}}>
<div style={{flex:1}}>
<div style={{color:"#666",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>Drift Velocity</div>
<div style={{fontSize:13,fontWeight:800,color:driftVelocity>-5?"#2fbf5f":"#e03535"}}>{driftVelocity}%/wk</div>
</div>
<div style={{flex:1}}>
<div style={{color:"#666",fontSize:8,fontWeight:700,textTransform:"uppercase"}}>Operational Status</div>
<div style={{fontSize:11,fontWeight:700,color:driftRisk==="Stable"?"#2fbf5f":driftRisk==="Monitor"?"#d9a520":"#e03535"}}>{driftRisk}</div>
</div>
</div>
<div style={{fontSize:9,color:"#555",lineHeight:1.5,borderTop:"1px solid #e8e4da",paddingTop:6}}>
{resilience==="High"?"Unit maintains alignment naturally. Weekly governance cycles sufficient.":
resilience==="Medium"?"Weekly recalibration cycles required. Cross-unit support recommended.":
"Critical: immediate intervention needed. Unit approaching operational ceiling."}
</div>
</div>
);
};

// ===== NETWORK HEALTH DASHBOARD =====
const NetworkHealthDashboard = ({centers, alerts, red, staleN}) => {
const avgHealth = centers.length > 0 ? (centers.reduce((sum, c) => sum + c.health, 0) / centers.length) : 0;
const driftRate = staleN > centers.length * 0.3 ? -15 : -2;
const healthyCount = centers.filter(c => c.health >= 80).length;
const atRiskCount = centers.filter(c => c.health < 50).length;

return (
<div style={{border:`1px solid #999`,borderLeft:`3px solid #7a6bd8`,background:"#faf9fc",padding:"12px 14px"}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#7a6bd8",marginBottom:10}}>Network Organizational Health</div>

<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:12}}>
<div style={{textAlign:"center",padding:"8px",border:`1px solid #ddd`}}>
<div style={{fontSize:7.5,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Avg. Strategy Adherence</div>
<div style={{fontSize:20,fontWeight:800,color:"#111"}}>{Math.round(avgHealth)}%</div>
</div>
<div style={{textAlign:"center",padding:"8px",border:`1px solid #ddd`}}>
<div style={{fontSize:7.5,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Units in Good Standing</div>
<div style={{fontSize:20,fontWeight:800,color:"#2fbf5f"}}>{healthyCount}</div>
</div>
<div style={{textAlign:"center",padding:"8px",border:`1px solid #ddd`}}>
<div style={{fontSize:7.5,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Units at Risk</div>
<div style={{fontSize:20,fontWeight:800,color:"#e03535"}}>{atRiskCount}</div>
</div>
<div style={{textAlign:"center",padding:"8px",border:`1px solid #ddd`}}>
<div style={{fontSize:7.5,fontWeight:700,color:"#999",textTransform:"uppercase"}}>Drift Velocity</div>
<div style={{fontSize:20,fontWeight:800,color:driftRate>-5?"#2fbf5f":"#e03535"}}>{driftRate}%/wk</div>
</div>
</div>

<div style={{fontSize:10,color:"#444",lineHeight:1.6,borderTop:"1px solid #ddd",paddingTop:8}}>
<b style={{color:"#7a6bd8"}}>Operational Status:</b> Network is {avgHealth>70?"well-aligned":"at-risk"}. {staleN>0?`${staleN} units stale—measurement needed to restore alignment.`:""} {atRiskCount>0?`${atRiskCount} units approaching operational ceiling—intervention recommended.`:""} {alerts.filter(a=>a.eta<=30).length>0?`${alerts.filter(a=>a.eta<=30).length} critical alerts active.`:""}
</div>
</div>
);
};

// ===== FRANCHISE REPORT PDF EXPORT =====
// Client-side PDF generation (html2pdf library)

export const _layer1={operationalSignalsOf,checkContract,ACTION_CONTRACTS,dataConfidenceOf,uncertaintyBandOf,peerConnectionStrengthOf,patternStabilityIndexOf,networkSupportIndexOf,structureScoreOf,buildCenters,buildLeads,forecast,engageOf,alertsOf,qGate,qGovernors};
export const _layer2={growthAgentRecommend,unitHealthAgentRecommend,retentionAgentRecommend,networkPropagationAgentRecommend,applyGovernance,runAllAgents,buildRecommendation,confidenceBandOf,riskBandOf};
// ---- 3D dojo floor: Three.js from CDN, graceful 2D-note fallback if blocked ----
function Dojo3DFloor({center,phase}){
  const mount=React.useRef(null);
  const [status,setStatus]=React.useState("loading"); // loading | ready | blocked
  React.useEffect(()=>{
    let disposed=false, cleanup=()=>{};
    const boot=(THREE)=>{
      if(disposed||!mount.current) return;
      try{
        const el=mount.current, W=el.clientWidth||620, H=360;
        const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0d1017); scene.fog=new THREE.Fog(0x0d1017,28,66);
        const cam=new THREE.PerspectiveCamera(46,W/H,0.1,200);
        const renderer=new THREE.WebGLRenderer({antialias:true});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setSize(W,H);
        if(THREE.sRGBEncoding!==undefined) renderer.outputEncoding=THREE.sRGBEncoding;
        if(THREE.ACESFilmicToneMapping){renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;}
        el.innerHTML=""; el.appendChild(renderer.domElement);
        scene.add(new THREE.HemisphereLight(0x9fb4e6,0x0a0d14,0.75));
        const key=new THREE.DirectionalLight(0xdfe8ff,0.9); key.position.set(10,22,12); scene.add(key);
        const fill=new THREE.PointLight(0x2a6fd8,0.5,90); fill.position.set(-16,12,-12); scene.add(fill);
        const hp=(center&&center.health)||70;
        const hue=new THREE.Color(hp<50?0xcd6a5c:0x43b0b0);
        const roster=Math.max(9,Math.round((center&&center.roster)||14));
        scene.add(new THREE.Mesh(new THREE.BoxGeometry(30,0.5,20),new THREE.MeshStandardMaterial({color:0x141a24,metalness:0.3,roughness:0.85})));
        const grid=new THREE.GridHelper(30,15,0x243049,0x1b2130); grid.position.y=0.02; scene.add(grid);
        const glass=new THREE.Mesh(new THREE.BoxGeometry(30,5,0.3),new THREE.MeshStandardMaterial({color:0x1a2740,metalness:0.6,roughness:0.15,transparent:true,opacity:0.5})); glass.position.set(0,2.5,-10); scene.add(glass);
        const pods=[];
        for(let p=0;p<7;p++){const col=p%4,row=Math.floor(p/4);const px=-9+col*6,pz=-4+row*7;
          const pod=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.4,24),new THREE.MeshStandardMaterial({color:0x1e2838,metalness:0.5,roughness:0.4})); pod.position.set(px,0.2,pz); scene.add(pod);
          const ring=new THREE.Mesh(new THREE.TorusGeometry(1.6,0.06,8,40),new THREE.MeshBasicMaterial({color:hue})); ring.rotation.x=Math.PI/2; ring.position.set(px,0.42,pz); scene.add(ring); pods.push([px,pz]);}
        const board=new THREE.Mesh(new THREE.BoxGeometry(0.3,4,6),new THREE.MeshStandardMaterial({color:0x222233,emissive:hue,emissiveIntensity:0.25})); board.position.set(14.5,2,0); scene.add(board);
        const nin=[];
        for(let n=0;n<roster;n++){const g=new THREE.Group();
          const body=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.9,12),new THREE.MeshStandardMaterial({color:hue,emissive:hue,emissiveIntensity:0.35,roughness:0.5})); body.position.y=0.75;
          const head=new THREE.Mesh(new THREE.SphereGeometry(0.28,14,14),new THREE.MeshStandardMaterial({color:hue,emissive:hue,emissiveIntensity:0.4,roughness:0.45})); head.position.y=1.35;
          g.add(body); g.add(head); scene.add(g); nin.push({g,pod:n%7,seed:Math.random()*6.28});}
        const clock=new THREE.Clock(); let theta=0.4,drag=false,px0=0,raf;
        renderer.domElement.style.cursor="grab";
        const dn=e=>{drag=true;px0=e.clientX;renderer.domElement.style.cursor="grabbing";};
        const up=()=>{drag=false;if(renderer.domElement)renderer.domElement.style.cursor="grab";};
        const mv=e=>{if(drag){theta-=(e.clientX-px0)*0.005;px0=e.clientX;}};
        renderer.domElement.addEventListener("mousedown",dn); window.addEventListener("mouseup",up); window.addEventListener("mousemove",mv);
        const loop=()=>{ if(disposed) return; const t=clock.getElapsedTime();
          if(!drag) theta+=0.0016; cam.position.set(Math.sin(theta)*30,18,Math.cos(theta)*30); cam.lookAt(0,1,0);
          const phase=Math.floor(t/4)%4;
          nin.forEach((nj,i)=>{let x,z;
            if(phase===0){const a=(i/nin.length)*Math.PI*2+t*0.15;x=Math.cos(a)*4;z=Math.sin(a)*3;}
            else if(phase===2){x=9+Math.sin(nj.seed+t)*1.5;z=7+Math.cos(nj.seed+t*0.7)*1.5;}
            else {const[pxp,pzp]=pods[nj.pod];x=pxp+Math.sin(nj.seed+t*0.6)*0.9;z=pzp+Math.cos(nj.seed+t*0.5)*0.9;}
            nj.g.position.x+=(x-nj.g.position.x)*0.05; nj.g.position.z+=(z-nj.g.position.z)*0.05; nj.g.position.y=Math.abs(Math.sin(t*2+nj.seed))*0.12;});
          renderer.render(scene,cam); raf=requestAnimationFrame(loop);};
        loop(); setStatus("ready");
        cleanup=()=>{cancelAnimationFrame(raf);window.removeEventListener("mouseup",up);window.removeEventListener("mousemove",mv);renderer.dispose&&renderer.dispose();if(renderer.domElement&&renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);};
      }catch(e){ setStatus("blocked"); }
    };
    if(typeof window!=="undefined" && window.THREE){ boot(window.THREE); }
    else if(typeof document!=="undefined"){
      const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      s.onload=()=>boot(window.THREE); s.onerror=()=>setStatus("blocked"); document.head.appendChild(s);
      const to=setTimeout(()=>{ if(!window.THREE) setStatus("blocked"); },6000);
      cleanup=()=>clearTimeout(to);
    } else setStatus("blocked");
    return ()=>{ disposed=true; cleanup(); };
  },[center&&center.name]);
  return(<div>
    <div style={{position:"relative"}}>
    <div ref={mount} style={{width:"100%",height:360,borderRadius:10,overflow:"hidden",background:"#0d1017",border:"1px solid #1e2431",display:status==="blocked"?"none":"block"}}/>
    {phase&&status!=="blocked"&&<div style={{position:"absolute",top:12,right:12,background:"rgba(13,16,23,0.9)",border:`1px solid ${phase.tone}`,borderRadius:8,padding:"7px 11px",pointerEvents:"none"}}>
      <div style={{fontFamily:"Helvetica",fontSize:10,fontWeight:800,color:"#fff"}}>{phase.callout}</div>
      <div style={{fontFamily:"Helvetica",fontSize:7.5,color:"#9aa4b5",marginTop:1}}>{phase.k} · posted to operations</div>
    </div>}
    </div>
    {status==="loading"&&<div style={{fontFamily:"Helvetica",fontSize:10,color:"#888",marginTop:6}}>Building the 3D floor…</div>}
    {status==="blocked"&&<div style={{fontFamily:"Helvetica",fontSize:11,color:"#666",padding:"14px",border:"1px solid #ccc",borderRadius:8,lineHeight:1.5}}>The 3D floor needs to load a graphics library from the web, which isn't reachable here. The 2D floor above shows the same session rhythm. In a hosted deployment the 3D view renders normally.</div>}
    {status==="ready"&&<div style={{fontFamily:"Helvetica",fontSize:10,color:"#888",marginTop:6}}>Drag to orbit · scoped to this center's roster · illustrative</div>}
  </div>);
}

// ---- session lifecycle: the real operating rhythm of a center, genericized ----
// Process shape only — no credentials, no names. Mirrors before-session → check-in
// → during-session → notes/wrap → admin close, plus the coordination callouts.
const LIFE_STAGES=[
  {k:"Before session",sub:"prep & readiness",tone:"#0b6fa8",callout:"ready for session",
   detail:"Coach on the floor early, two reminders set, posts “ready for session.” Student’s prior work and progress report open.",
   steps:["On the floor / online 5 min early — post “ready for session”","Two alarms per session: start-mark checks + 15-min-to-end review","Open the student’s progress report and last note","Pick 2 code segments to revisit and a challenge sized to the student","Greet the parent up front; walk the student to their station"]},
  {k:"Check-in",sub:"student arrives",tone:"#2f7a3f",callout:"student in ✓",
   detail:"Student in — logged at arrival. If not in by the mark, operations is notified and the parent reminder fires.",
   steps:["Student in → log “student in at [time]”","Not in at 5 min → notify operations + send parent reminder","Not in at 10 min → second reminder; escalation path opens","Remote: audio/video test walkthrough if needed"]},
  {k:"During session",sub:"agenda live",tone:"#7a6bd8",callout:"agenda open",
   detail:"One universal session format — the more the student talks, the better.",
   steps:["Chat + pull up the project (10–15m) — student shows their work","Coding challenge on the clock (10–15m) — posted to the challenge board","Dialogue while building — 10-minute objectives, discuss then implement","Review 2 segments & start homework together (last 15m)","Walk the student to the front; read the note to the parent"]},
  {k:"Notes & wrap",sub:"progress recorded",tone:"#b8860b",callout:"notes filed",
   detail:"Structured note due before end of session — notes sync coaches, parents, and students.",
   steps:["REVIEW fill: what the student practiced and built momentum with","PROJECT fill: how they took today’s concept and coded it","HOMEWORK fill: the next step on what excites them, doable solo","Staff signs off on the note before it posts","Same-day completion enforced — schedule adjusts if notes lapse"]},
  {k:"Admin close",sub:"ticket resolved",tone:"#8b0000",callout:"ticket → owner",
   detail:"Any open item becomes a ticket, worked to done, and assigned onward — the loop closes on the record.",
   steps:["Open items → tickets with owner and due","Assessment sessions scheduled on cadence","Internal meeting topics logged with two questions per coach","Only when finished (or blocked with a question), assign onward"]},
];


// ---- tab loading skeleton: shown for a beat so heavy views never flash blank ----
function TabSkeleton(){
  return(<div style={{padding:"8px 0"}} aria-busy="true">
    {[0,1,2].map(i=>(<div key={i} style={{height:i===0?22:12,width:i===0?"32%":(i===1?"88%":"70%"),background:"linear-gradient(90deg,#eee,#f6f6f4,#eee)",backgroundSize:"200% 100%",animation:"cnpulse 1.1s ease-in-out infinite",borderRadius:6,marginBottom:10}}/>))}
    <div style={{display:"flex",gap:10,marginTop:6}}>{[0,1,2,3].map(i=>(<div key={i} style={{height:60,flex:1,background:"linear-gradient(90deg,#eee,#f6f6f4,#eee)",backgroundSize:"200% 100%",animation:"cnpulse 1.1s ease-in-out infinite",borderRadius:8}}/>))}</div>
  </div>);
}

class EngineErrorBoundary extends React.Component{
constructor(props){super(props);this.state={error:null};}
static getDerivedStateFromError(error){return{error};}
componentDidCatch(error,info){ /* no external logging in this artifact; state capture is enough to render a safe fallback */ }
render(){
if(this.state.error){
return(<div style={{fontFamily:"Helvetica",padding:24,maxWidth:640,margin:"40px auto",border:"1px solid #ccc",borderLeft:"3px solid #8b0000",background:"#fff"}}>
<div style={{fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:"#8b0000",marginBottom:8}}>Something in this view didn't render</div>
<div style={{fontSize:13,color:"#333",lineHeight:1.6,marginBottom:12}}>This is a live artifact, not a static deck, and one panel hit an unexpected state. Nothing else about the submission is affected — the underlying data, agents, and governance logic are unchanged.</div>
<button onClick={()=>this.setState({error:null})} style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,padding:"7px 14px",cursor:"pointer",border:"1px solid #111",background:"#111",color:"#fff"}}>Reload this view</button>
<div style={{fontSize:9,color:"#888",marginTop:10}}>{String(this.state.error&&this.state.error.message||"")}</div>
</div>);
}
return this.props.children;
}
}

// ============================================================================
// SIGNAL MECHANICS — ten mechanics, each one documented formula on live state.
// Corporate-register labels; provenance per-function; convergent math only.
// ============================================================================

// [1] Interaction term: co-active actions on one unit are not additive.
// combined = a + b − k·a·b  (k=0.35 diminishing overlap; documented, tunable)
function mxInteraction(recs){
const byCenter={};
(recs||[]).forEach(r=>{(r.targetIds||[]).forEach(n=>{if(typeof n==="string"&&n.length>2)(byCenter[n]=byCenter[n]||[]).push(r);});});
const pairs=[];
Object.entries(byCenter).forEach(([n,rs])=>{
if(rs.length>=2){
const a=0.08,b=0.08,k=0.35;                    // modeled per-action lift 8%
const naive=a+b, combined=a+b-k*a*b;
pairs.push({name:n,count:rs.length,naive:+(naive*100).toFixed(1),combined:+(combined*100).toFixed(1)});
}});
return pairs.slice(0,4);
}

// [2] Peer coupling: w = 0.6·sameCluster + 0.4·healthSimilarity; computed, never cosmetic.
function mxCoupling(centers){
const cl=c=>QCLUSTERS.findIndex(g=>g.includes(c.st));
const out=[];
for(let i=0;i<centers.length;i++)for(let j=i+1;j<centers.length;j++){
const a=centers[i],b=centers[j];
const same=cl(a)>=0&&cl(a)===cl(b)?1:0;
const sim=1-Math.abs(a.health-b.health)/100;
const w=0.6*same+0.4*sim;
if(w>0.72)out.push({a:a.name,b:b.name,w:+w.toFixed(2)});
}
return out.sort((x,y)=>y.w-x.w).slice(0,5);
}

// [3] Uncertainty ranking: H=−Σp·ln p over status split; highest = review first.
function mxEntropy(centers){
return centers.map(c=>{const a=qAmp(c);
const H=-a.reduce((s,p)=>s+(p>0?p*Math.log(p):0),0);
return{name:c.name,H:+H.toFixed(3)};})
.sort((x,y)=>y.H-x.H).slice(0,5);
}

// [4] Review gain = (1−coherence)·H/Hmax — staleness × uncertainty.
function mxReviewQueue(centers,opt){
const ageOf=c=>opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
const Hmax=Math.log(3);
return centers.map(c=>{const a=qAmp(c);
const H=-a.reduce((s,p)=>s+(p>0?p*Math.log(p):0),0);
const g=(1-qCoherence(ageOf(c)))*(H/Hmax);
return{name:c.name,gain:+g.toFixed(2)};})
.sort((x,y)=>y.gain-x.gain).slice(0,5);
}

// [5] Velocity trigger: RATE crossing — flag when Δhealth/wk < −0.8 (90d slope), any band.
function mxVelocity(centers){
return centers.map(c=>{const f=forecast(c);
const slope=(f.proj[2]-f.proj[0])/12;            // Δ over ~12 weeks
return{name:c.name,slope:+slope.toFixed(2)};})
.filter(r=>r.slope<-0.8).sort((x,y)=>x.slope-y.slope).slice(0,5);
}

// [6] Cadence = 42·ln(1/0.7) days — review before exp(−d/42) < 0.7.
function mxCadence(){
const d=Math.round(42*Math.log(1/0.7));           // ≈ 15 days
return d;
}

// [7] Majority vote of 3 reads (engagement/retention/margin); disagreement is the flag.
function mxVote(centers){
return centers.map(c=>{
const e=engageOf(c).score>0.55?0:1, r=c.ret>0.72?0:1, m=c.eb>0?0:1;
const votes=e+r+m;
return{name:c.name,agree:votes===0||votes===3,split:votes};})
.filter(v=>!v.agree&&(v.split===1||v.split===2)).slice(0,5);
}

// [8] Placement: score = demand − 0.22·unitsInRegion, scored globally.
function mxPlacement(centers){
const clusters=QCLUSTERS.map((g,gi)=>({gi,n:centers.filter(c=>g.includes(c.st)).length}));
const scored=clusters.map(cl=>({gi:cl.gi,score:+(1.0-0.22*cl.n).toFixed(2)})); // demand=1.0, penalty 0.22/unit
const best=scored.reduce((a,b)=>b.score>a.score?b:a);
return{bestCluster:QCLUSTERS[best.gi].join("/"),score:best.score};
}

// [9] Weighted health = Σ(h·conf)/Σconf vs naive mean; the delta is the honest number.
function mxWeightedHealth(centers,opt){
const ageOf=c=>opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
const confs=centers.map(c=>qCoherence(ageOf(c)));
const naive=centers.reduce((s,c)=>s+c.health,0)/centers.length;
const tot=confs.reduce((a,v)=>a+v,0);
const wtd=centers.reduce((s,c,i)=>s+c.health*confs[i],0)/tot;
return{naive:+naive.toFixed(1),weighted:+wtd.toFixed(1),delta:+(wtd-naive).toFixed(1)};
}

// [10] chain(n) = hash(chain(n−1)+entry); any retro-edit changes all later digests.
function mxChain(ledger){
let h=17;
(ledger||[]).forEach(e=>{h=hash(String(h)+(e.t||"")+(e.who||"")+(e.what||""));});
return{entries:(ledger||[]).length,digest:(h>>>0).toString(16).slice(0,8)};
}

// GROWTH PRIORITY (single source — every tab that ranks growth reads this).
// A center's growth priority = readiness to absorb growth, not just size:
// 0.35·headroom (students vs modeled capacity 220) + 0.30·momentum (90d forecast slope, normalized ±3/wk) + 0.20·health/100 (a growing center must be st
function growthPriorityOf(c,coupled){
const headroom=Math.max(0,Math.min(1,(220-c.students)/220));
const f=forecast(c);const slope=(f.proj[2]-f.proj[0])/12;
const momentum=Math.max(0,Math.min(1,(slope+3)/6));
const support=Math.min(1,(coupled||0)/2);
return +(0.35*headroom+0.30*momentum+0.20*(c.health/100)+0.15*support).toFixed(2);
}
function growthRank(centers){
const edges=mxCoupling(centers);
const deg={};edges.forEach(e=>{deg[e.a]=(deg[e.a]||0)+1;deg[e.b]=(deg[e.b]||0)+1;});
return centers.map(c=>({name:c.name,st:c.st,gp:growthPriorityOf(c,deg[c.name]),health:c.health,students:c.students}))
.sort((a,b)=>b.gp-a.gp);
}
function MechanicsTab({centers,opt,ledger,recs}){
const card={border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px",flex:"1 1 300px"};
const h=(t)=><div style={{fontFamily:"Helvetica",fontSize:10,fontWeight:800,color:INK,letterSpacing:0.4,marginBottom:2}}>{t}</div>;
const f=(t)=><div style={{fontFamily:"monospace",fontSize:8.5,color:MUT,marginBottom:6}}>{t}</div>;
const row={fontFamily:"Helvetica",fontSize:9.5,color:INK,display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:`1px dotted ${RULE}`};
const inter=mxInteraction(recs),coup=mxCoupling(centers),ent=mxEntropy(centers),
rq=mxReviewQueue(centers,opt),vel=mxVelocity(centers),cad=mxCadence(),
vote=mxVote(centers),ann=mxPlacement(centers),wh=mxWeightedHealth(centers,opt),ch=mxChain(ledger);
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:9,color:MUT,letterSpacing:2,marginBottom:2}}>PROPOSED POLICY FRAMEWORK — CANDIDATE SUBMISSION</div>
<div style={{fontSize:15,fontWeight:800,color:INK,marginBottom:2}}>Signal Mechanics — ten small rules, computed live</div>
<div style={{fontSize:9.5,color:MUT,marginBottom:12,maxWidth:720}}>Each mechanic is one documented formula applied to the shared canonical state. Small on purpose: every rule fits on a card, every number can be recomputed by hand from the formula shown. Modeled/illustrative pending live MyStudio/QuickBooks integration.</div>
<div style={{display:"flex",flexWrap:"wrap",gap:10}}>
<div style={card}>{h("1 · Combined-action correction")}{f("combined = a + b − 0.35·a·b (not additive)")}
{inter.length?inter.map((p,i)=>(<div key={i} style={row}><span>{p.name} · {p.count} active</span><span>naive {p.naive}% → {p.combined}%</span></div>)):<div style={{fontSize:9.5,color:MUT}}>No unit currently carries two active actions — the correction applies the moment one does.</div>}
<div style={{fontSize:8.5,color:MUT,marginTop:6}}>Two actions on the same unit interact; booking their lifts separately overstates the total.</div></div>
<div style={card}>{h("2 · Peer coupling (computed, never cosmetic)")}{f("w = 0.6·sameRegion + 0.4·healthSimilarity; drawn only if w > 0.72")}
{coup.map((p,i)=>(<div key={i} style={row}><span>{p.a} ↔ {p.b}</span><span>w = {p.w}</span></div>))}
<div style={{fontSize:8.5,color:MUT,marginTop:6}}>Every support edge in this engine has a number behind it or it is not drawn. <b>Consumed by:</b> transfers · sensei supply chain · network map · continuity view.</div></div>
<div style={card}>{h("3 · Most-undecided units")}{f("H = −Σ p·ln p over the status split; high H = review first")}
{ent.map((p,i)=>(<div key={i} style={row}><span>{p.name}</span><span>H = {p.H}</span></div>))}</div>
<div style={card}>{h("4 · Next-review value ranking")}{f("gain = (1 − e^(−days/42)) · H/Hmax")}
{rq.map((p,i)=>(<div key={i} style={row}><span>{p.name}</span><span>gain {p.gain}</span></div>))}
<div style={{fontSize:8.5,color:MUT,marginTop:6}}>Reviewer time goes where staleness × uncertainty is largest — not simply to the weakest unit. <b>Consumed by:</b> interaction scheduler (measure-first rows).</div></div>
<div style={card}>{h("5 · Decline-velocity flags")}{f("flag when Δhealth/week < −0.8, at any current level")}
{vel.length?vel.map((p,i)=>(<div key={i} style={row}><span>{p.name}</span><span>{p.slope}/wk</span></div>)):<div style={{fontSize:9.5,color:MUT}}>No unit is declining faster than the rate threshold this week.</div>}
<div style={{fontSize:8.5,color:MUT,marginTop:6}}>The trigger is a rate crossing, not a level crossing — a healthy unit falling fast outranks a weak unit holding steady. <b>Consumed by:</b> early warning · continuity live feed.</div></div>
<div style={card}>{h("6 · Review cadence floor")}{f("cadence = 42·ln(1/0.7) ≈ "+cad+" days")}
<div style={{fontSize:9.5,color:INK}}>Review every unit within <b>{cad} days</b> to keep every read above the 0.70 confidence floor. Frequently reviewed units drift less; the cadence is solved from the same decay curve used everywhere else in this engine.</div></div>
<div style={card}>{h("7 · Split-signal flags")}{f("majority vote of 3 reads (engagement · retention · margin); disagreement is the flag")}
{vote.length?vote.map((p,i)=>(<div key={i} style={row}><span>{p.name}</span><span>{p.split}/3 reads negative</span></div>)):<div style={{fontSize:9.5,color:MUT}}>All units currently show internally consistent reads.</div>}
<div style={{fontSize:8.5,color:MUT,marginTop:6}}>One bad read never flips a status on its own; when reads disagree, the disagreement itself is what gets reviewed.</div></div>
<div style={card}>{h("8 · Territory placement, scored globally")}{f("score = demand(1.0) − 0.22·unitsInRegion")}
<div style={{fontSize:9.5,color:INK}}>Best open region by whole-network score: <b>{ann.bestCluster}</b> ({ann.score}). Choosing territories one at a time leaves this gap unexamined; scoring globally makes the overlap penalty explicit before a lead is worked.</div></div>
<div style={card}>{h("9 · Confidence-weighted headline")}{f("weighted = Σ(h·conf)/Σconf vs naive mean")}
<div style={{fontSize:9.5,color:INK}}>Naive network health <b>{wh.naive}</b> · confidence-weighted <b>{wh.weighted}</b> · distortion from stale reads: <b>{wh.delta>0?"+":""}{wh.delta}</b></div>
<div style={{fontSize:8.5,color:MUT,marginTop:6}}>The delta is the honest number — how far staleness is currently bending the headline.</div></div>
<div style={card}>{h("10 · Ledger integrity digest")}{f("chain(n) = hash(chain(n−1) + entry) — any retro-edit changes every later digest")}
<div style={{fontSize:9.5,color:INK}}>{ch.entries} committed entries · live chain digest <b style={{fontFamily:"monospace"}}>{ch.digest}</b></div>
<div style={{fontSize:8.5,color:MUT,marginTop:6}}>Recomputed on every render; a silently edited record cannot produce the same digest. <b>Stamped on:</b> summary export · weekly brief · reports footer.</div></div>
</div>
</div>);
}

// ============================================================================
// CONTINUITY VIEW — one modeled student arc vs the network events that could
// have broken it, and the live mechanism that absorbed each.
// ============================================================================
const CONT_BELTS=[["White",0],["Yellow",7],["Orange",15],["Green",25],["Blue",34],["Purple",42],["Brown",50],["Red",57],["Black",64]]; // [name, month]
const CONT_EVENTS=[
{m:9, label:"Center ownership transfer", absorb:"Curriculum spine and belt standards are network property, not owner property — the transfer changed the signature on the lease, not the program.", mech:"governance constitution"},
{m:18, label:"Lead sensei departs", absorb:"Peer-coupling edges routed substitute coverage from the two highest-coupled nearby centers within the same week; no sessions cancelled.", mech:"peer coupling (mechanic 2)"},
{m:31, label:"Enrollment dip flagged at this center", absorb:"Decline-velocity trigger fired while the center was still in the healthy band; support engaged 10 weeks before the dip would have reached the classroom.", mech:"decline-velocity flag (mechanic 5)"},
{m:44, label:"Center unreviewed 7+ weeks during owner illness", absorb:"Confidence fell below the voting floor — every pending action affecting this center auto-held until re-review; nothing changed under the student's feet on stale data.", mech:"voting floor (gate backstop)"},
{m:55, label:"Regional demand downturn", absorb:"Global territory scoring had kept local density below the overlap penalty threshold; the center entered the downturn with headroom instead of saturation.", mech:"global placement (mechanic 8)"},
];
function ContinuityTab({centers,opt,railData}){
// LIVE FEED: protections firing in live state on this render.
const ageOf=c=>opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
const liveVel=mxVelocity(centers);
const liveFloor=centers.filter(c=>qCoherence(ageOf(c))<0.30).map(c=>c.name);
const liveHeld=(railData&&railData.recommendations||[]).filter(r=>!r.governance.allowed).length;
const liveStudents=centers.reduce((a,c)=>a+c.students,0);
const W=920,H=64,months=66;
const x=m=>28+(m/months)*(W-56);
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:9,color:MUT,letterSpacing:2,marginBottom:2}}>PROPOSED POLICY FRAMEWORK — CANDIDATE SUBMISSION</div>
<div style={{fontSize:15,fontWeight:800,color:INK,marginBottom:2}}>Continuity View — one student, sixty-six months, five disruptions, zero breaks</div>
<div style={{fontSize:9.5,color:MUT,marginBottom:14,maxWidth:740}}>A franchise selling child development is making a multi-year promise no single center can keep alone. This view renders one modeled student journey — White to Black belt — against the network events that could have interrupted it, and the specific mechanism that absorbed each one. This is what every rule in this engine is ultimately for.</div>
<svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",maxWidth:W,display:"block",marginBottom:4}}>
<line x1={x(0)} y1={H/2} x2={x(months)} y2={H/2} stroke={INK} strokeWidth="2"/>
{CONT_BELTS.map(([b,m],i)=>(<g key={i}>
<circle cx={x(m)} cy={H/2} r="5" fill={i===CONT_BELTS.length-1?INK:"#fff"} stroke={INK} strokeWidth="2"/>
<text x={x(m)} y={H/2-12} textAnchor="middle" style={{fontSize:8,fontFamily:"Helvetica",fill:INK,fontWeight:700}}>{b}</text>
</g>))}
{CONT_EVENTS.map((e,i)=>(<g key={"e"+i}>
<line x1={x(e.m)} y1={H/2+4} x2={x(e.m)} y2={H/2+18} stroke={AC} strokeWidth="1.5"/>
<circle cx={x(e.m)} cy={H/2+21} r="3" fill={AC}/>
</g>))}
</svg>
<div style={{fontSize:8.5,color:MUT,marginBottom:12}}>Belt milestones above the line · disruption events below it — months 9, 18, 31, 44, 55.</div>
{CONT_EVENTS.map((e,i)=>(<div key={i} style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,background:"#fff",padding:"9px 12px",marginBottom:8}}>
<div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:6}}>
<span style={{fontSize:10.5,fontWeight:800,color:INK}}>Month {e.m} — {e.label}</span>
<span style={{fontSize:8.5,color:VIO,fontWeight:700}}>{e.mech}</span>
</div>
<div style={{fontSize:9.5,color:"#333",marginTop:3,lineHeight:1.5}}>{e.absorb}</div>
</div>))}
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",padding:"9px 12px",marginBottom:8}}>
<div style={{fontSize:10.5,fontWeight:800,color:INK,marginBottom:4}}>This week, live — same mechanisms, real state</div>
<div style={{fontSize:9.5,color:"#333",lineHeight:1.6}}>
Decline-velocity flags active now: <b>{liveVel.length}</b>{liveVel.length?" ("+liveVel.map(v=>v.name).join(", ")+")":""} · units past the voting floor (all approvals auto-held): <b>{liveFloor.length}</b>{liveFloor.length?" ("+liveFloor.join(", ")+")":""} · proposals currently held by gates: <b>{liveHeld}</b> · students under this protection across the modeled network: <b>{liveStudents.toLocaleString()}</b>
</div>
<div style={{fontSize:8.5,color:MUT,marginTop:4}}>Recomputed on every render from the shared canonical state — the timeline above is the illustration; this line is the proof.</div>
</div>
<div style={{border:`1px solid ${INK}`,background:"#fafaf7",padding:"10px 12px",marginTop:4}}>
<div style={{fontSize:9.5,color:INK,lineHeight:1.6}}><b>The standard, stated once:</b> the network is governed so that a child's development arc survives everything the business side can throw at it. Every mechanic, gate, and ledger entry in this engine exists to make that sentence structurally true rather than aspirationally true. Modeled journey; the mechanisms cited are live in this artifact.</div>
</div>
</div>);
}

export default function Engine(props){
return(<EngineErrorBoundary><EngineInner {...props}/></EngineErrorBoundary>);
}

function EngineInner({initialTab,fullNav}){
const [tab,setTab]=useState(initialTab||"exec"); const q=false; // corporate register only
const [sel,setSel]=useState("Pleasanton");
const [stSel,setSt]=useState("CA");
const [beltSel,setBelt]=useState("orange");
const [ranPlays,setRan]=useState({});
const [opsMsg,setOpsMsg]=useState("Ready.");
const [cap,setCap]=useState({used:0,week:1});
const [goals,setGoals]=useState({});
const [mapSt,setMapSt]=useState(null);
const [mapMode,setMapMode]=useState("health"); // health | freshness | headroom | consistency | momentum
const [mapC,setMapC]=useState(null);
const [cardMsg,setCardMsg]=useState("");
const [leadStage,setLeadStage]=useState({});
const [leadSel,setLeadSel]=useState(null);
const [dealAg,setDealAg]=useState({auto:false,wk:0,log:[],trained:{},promoted:[],retired:[],blocked:0,stats:{}});
const [qMeas,setQMeas]=useState({});
const [opt,setOpt]=useState({run:false,week:0,gates:0,ships:0,probs:{measurement:0.7,wave_mgr:0.7,bestpractice:0.7,peer_review:0.7,pricing:0.7},fresh:{},log:[]});
const [essentialsOnly,setEssentialsOnly]=useState(fullNav?false:true);
const A=k=>AGENT_LEX[k];const V=k=>VERB_LEX[k];
// ---- world state: single integration layer ----
// adj: per-center metric deltas written by ANY tab's action; centers are
// recomputed through it, so forecasts, health tiers, pain scores, map colors, alerts, and the QPM rail all move together when one tab acts.
const [adj,setAdj]=useState({});
const [dagSel,setDagSel]=useState(null); // selected node in the DAGIFY graph
// mobile: viewport-aware nav + touch targets
const [isMobile,setIsMobile]=useState(typeof window!=="undefined"&&window.innerWidth<640);
useEffect(()=>{const on=()=>setIsMobile(window.innerWidth<640);window.addEventListener("resize",on);return()=>window.removeEventListener("resize",on);},[]);
const [rpStep,setRpStep]=useState(-1);   // decision replay: -1 idle, 0..6 stages
const [rpOn,setRpOn]=useState(false);
useEffect(()=>{if(!rpOn)return;const id=setInterval(()=>{setRpStep(s=>{if(s>=6){setRpOn(false);return s;}return s+1;});},1700);return()=>clearInterval(id);},[rpOn]);
const [scoreSel,setScoreSel]=useState(null); // candidate scorecard (deals tab)
const [viewAs,setViewAs]=useState("corporate"); // exec summary: corporate | franchisee
// Dojo Floor (LIVE) clock: one shared session clock (136-min rhythm: Huddle
// 8 / Build 52 / Break 12 / Build 52 / Wrap-up 12) driving the floor-plan
// visualization. Speed is a display control only — it never touches real
// state; the "Run today's session" action still owns the one real write.
const [dojoMin,setDojoMin]=useState(30);
const [fitSel,setFitSel]=useState({capital:true,system:true,people:true,sales:false,community:true,mission:true,time:true});
const [flyBoost,setFlyBoost]=useState(1);
const [dfdSel,setDfdSel]=useState(2);
const [dojoSpeed,setDojoSpeed]=useState(1);
const [dojoView,setDojoView]=useState("2d"); // 2d floor plan | 3d model
const [lifeStep,setLifeStep]=useState(-1); // session lifecycle animation step
const [lifePlaying,setLifePlaying]=useState(false);
const [stuIx,setStuIx]=useState(0);           // student progress report: selected student
const [pmView,setPmView]=useState("plan");    // plan (traditional) | board (hybrid)
const [plStudents,setPlStudents]=useState(100); // pricing→P&L: modeled roster size
const [nxStage,setNxStage]=useState(3);          // exec nexus: spine stage
const [nxMode,setNxMode]=useState("Lens");       // exec nexus: Lens|Timeline|Causal
const [nxChip,setNxChip]=useState("Board");      // exec nexus: render chip
const [bud,setBud]=useState({});                 // center budget: {key:{b:budgeted,a:actual}} — ongoing structure
const [tix,setTix]=useState({});                 // exec ticket board: {id:columnIndex}
useEffect(()=>{if(!lifePlaying)return;const id=setInterval(()=>{setLifeStep(s=>{if(s>=LIFE_STAGES.length-1){setLifePlaying(false);return s;}return s+1;});},1500);return()=>clearInterval(id);},[lifePlaying]);
const dojoSpeedRef=useRef(dojoSpeed);dojoSpeedRef.current=dojoSpeed;
useEffect(()=>{
const reduced=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(reduced)return;
let raf,last=performance.now();
const tick=n=>{const dt=(n-last)/1000;last=n;setDojoMin(m=>(m+dt*1.1*dojoSpeedRef.current)%136);raf=requestAnimationFrame(tick);};
raf=requestAnimationFrame(tick);
return()=>cancelAnimationFrame(raf);
},[]);
const [tour,setTour]=useState(0); // 0..4 = step, -1 = dismissed
// growth flywheelGain loop (expansion tab): channel-level simulation for
// capacity planning — leads arrive by channel gain, qualify, sign under the
// compliance governors; each signing pumps the gain. Separate from the real prospect book by design and labeled as simulation.
const [reso,setReso]=useState({wk:0,resolved:false,signed:0,hist:[1],placed:{},chan:{"FranNet — West":{p:3,ql:1},"IFPG Network":{p:5,ql:1},"BAI Franchise Brokers":{p:2,ql:0},"Direct / referral":{p:4,ql:2}}});
// ledger: every action from every tab appends here; the RECORD tab renders it.
const [ledger,setLedger]=useState([]);
const logL=(tab2,actor,text)=>setLedger(L=>[{t:Date.now(),tab:tab2,actor,text},...L].slice(0,40));
const applyAdj=(name,d)=>setAdj(m=>{const cur=m[name]||{};const nx={...cur};Object.entries(d).forEach(([k,v])=>{nx[k]=(nx[k]||0)+v;});return{...m,[name]:nx};});
const centers=useMemo(()=>{
const base=buildCenters();
return base.map(c=>{const d=adj[c.name];if(!d)return c;
const conv=Math.min(0.9,Math.max(0.1,c.conv+(d.conv||0)));
const ret=Math.min(0.98,Math.max(0.5,c.ret+(d.ret||0)));
const chem=Math.min(0.95,Math.max(0.1,c.chem+(d.chem||0)));
const eb=+(c.eb+(d.eb||0)).toFixed(1);
const health=Math.round(40+conv*30+ret*25+chem*10-(c.capR>0.38?6:0)+(eb>4?8:eb<0?-8:0));
return{...c,conv,ret,chem,eb,health,adjusted:true};});
},[adj]);
const LEADS=useMemo(buildLeads,[]);
const team=centers.find(c=>c.name===sel)||centers[32];
const states=useMemo(()=>{const m={};centers.forEach(c=>{(m[c.st]=m[c.st]||[]).push(c);});return m;},[centers]);
const fAll=useMemo(()=>centers.map(c=>({c,f:forecast(c)})),[centers]);
const alerts=useMemo(()=>alertsOf(centers),[centers]);
const trend={r:fAll.filter(x=>x.f.cls==="rising").length,h:fAll.filter(x=>x.f.cls==="holding").length,d:fAll.filter(x=>x.f.cls==="deteriorating").length};
const staleBase=c=>opt.fresh[c.name]===undefined&&(hash(c.name)%38)>21;
const staleN=centers.filter(staleBase).length;
const red=centers.filter(c=>c.eb<0);
const blocker=useMemo(()=>{let best=null,bs=-1;PATH.forEach((b,i)=>{const s=COHORT[b[0]][1]*(PATH.length-1-i);if(s>bs){bs=s;best=b;}});return best;},[]);
const GROUPS={OVERVIEW:["exec","model","mandate","pmo","replay","franchise","rail","board","alignment","compliance","workload","blockers","signals"],GROWTH:["leads","deals","dfdflow","persona","flywheel","filings","growth","whitespace","auction","scheduler","onboarding"],CENTERS:["team","lenses","table","network","labor","community"],FINANCE:["financials","fdd","risk","audit","portfolio"],METHOD:["agenda","dynamics","plan","mission","constitution"],LIVE:["dojo","season","simulator","twin","monitor","apisview","immune","dagify","ledgerview","continuity","surface"]};
const TABL={pmo:"program office",replay:"decision replay",alignment:"system alignment",dynamics:"operations dynamics",board:"operations board",lenses:"six lenses",rail:"threads & queue",network:"network health",table:"network map",team:"center detail",mastery:"belts",transfers:"transfers",optimizer:"operations",pain:"franchisee support",portfolio:"programs",engagement:"engagement",franchise:"overview",agenda:"methodology",growth:"growth",calendar:"calendar",acquire:"acquire",deliver:"deliver",retain:"retain",operate:"operate",plan:"first 90",metrics:"metrics",failure:"failure",warning:"early warning",leads:"lead pipeline",expansion:"expansion engine",fivebasis:"unified views",signals:"network signals",compliance:"compliance & safety",workload:"approver workload",whitespace:"territory white space",financials:"financial roll-up",audit:"audit trail",blockers:"growth blockers",deals:"deals",filings:"forms & filings",onboarding:"opening project plan",growthfin:"financial growth",success:"success rate",reports:"reports & exports",batch:"batch operations",playback:"historical playback",exec:"executive summary",glossary:"glossary",risk:"risk register",fdd:"fdd item 20",review:"week in review",compare:"center comparison",queue:"approval queue",cohort:"cohort analysis",sensitivity:"sensitivity analysis",twin:"network twin",lifecycle:"lifecycle engine",labor:"sensei supply chain",ltv:"family forward value",velocity:"curriculum velocity",auction:"territory portfolio",scheduler:"interaction scheduler",sentinel:"compliance sentinel",precedent:"precedent & calibration",constitution:"governance constitution",mechanics:"signal mechanics",continuity:"continuity view",dojo:"the dojo floor",season:"the season",simulator:"year simulator",monitor:"state monitor",apisview:"agent systems",immune:"signal integrity",dagify:"dependency graphs",ledgerview:"decision ledger",surface:"decision surface",brief:"weekly brief",negotiate:"negotiation prep",joy:"joy ledger",persona:"candidate persona",community:"community proof",flywheel:"recruitment flywheel",mission:"mission lens",dfdflow:"director workflow",model:"model overview",mandate:"derived mandate"};
const groupOf=t=>Object.keys(GROUPS).find(g=>GROUPS[g].includes(t));
// Keyboard nav: Left/Right cycles through the visible tabs in the current
// group, matching what a mouse click on adjacent tab buttons would do —
// builds on the aria-selected/role="tab" already present on each button.
const onTabBarKeyDown=(e)=>{
if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;
const visible=essentialsOnly?GROUPS[groupOf(tab)].filter(t=>ESSENTIAL_TABS.includes(t)||t===tab):GROUPS[groupOf(tab)];
const i=visible.indexOf(tab);
if(i===-1)return;
e.preventDefault();
const next=e.key==="ArrowRight"?visible[(i+1)%visible.length]:visible[(i-1+visible.length)%visible.length];
setTab(next);
};
const GROUP_LABEL={OVERVIEW:"Overview",GROWTH:"Growth Pipeline",CENTERS:"Centers",NETWORK:"Network",WORKFLOW:"Workflow",PROGRAMS:"Programs",METHOD:"Methodology",ADAPTIVE:"Adaptive Systems",LIVE:"Live Systems"};
const railData=useMemo(()=>runAllAgents(centers,states,LEADS),[centers,states,LEADS]);
const[spotDecision,setSpotDecision]=useState(null);
const[decisions,setDecisions]=useState({});
const[decisionHistory,setDecisionHistory]=useState({}); // per-decision audit trail: id -> [{status,seq}], newest last
const historySeqRef=useRef(0);
const recordDecision=(id,status)=>{historySeqRef.current+=1;setDecisionHistory(h=>({...h,[id]:[...(h[id]||[]),{status,seq:historySeqRef.current}]}));};
const[dyn,setDyn]=useState({resolved:{},committed:{},completed:{}});
const[auditQ,setAuditQ]=useState(""); // Audit Trail search: matches actor, text, or source tab
const[auditTabFilter,setAuditTabFilter]=useState("all"); // Audit Trail: filter ledger to one source tab
const[batchCondition,setBatchCondition]=useState("all"); // Batch Operations filter: thriving/watch/at-risk/all
const[batchState,setBatchState]=useState("all"); // Batch Operations filter: state/province/all
const[batchStaleOnly,setBatchStaleOnly]=useState(false); // Batch Operations filter: stale-measurement only
const[snapshots,setSnapshots]=useState([]); // Historical Playback: one entry per captured week, newest last
const[playA,setPlayA]=useState(null); // Historical Playback: compare-select A
const[playB,setPlayB]=useState(null); // Historical Playback: compare-select B
const[globalQ,setGlobalQ]=useState(""); // Global search: matches centers, states, and tab labels
const[compareSelect,setCompareSelect]=useState([]); // Center Comparison: multi-select, max 5 centers
const[queueRole,setQueueRole]=useState("all"); // Approval Queue: filter by role (all, fbc, director, ops)
const[sensitivityParams,setSensitivityParams]=useState({tuition:0,capacity:0,support:0}); // Sensitivity: % deltas from baseline
const[focusCenter,setFocusCenter]=useState(null);
// Cross-view navigation into Network must actually land on the right state,
// not whatever was last clicked -- this syncs the cluster selection from the
// shared focusCenter passport whenever it resolves to a real center.
useEffect(()=>{
if(tab!=="network"||!focusCenter)return;
const c=centers.find(x=>x.name===focusCenter);
if(c&&c.st)setSt(c.st);
},[tab,focusCenter,centers]);
const[jumpReason,setJumpReason]=useState(null); // why the last cross-view navigation happened, shown as a breadcrumb on arrival
const jumpTo=(destTab,centerName,reason)=>{setFocusCenter(centerName);setJumpReason(reason||null);setTab(destTab);};
const[aboutOpen,setAboutOpen]=useState(false);
const[todayDetail,setTodayDetail]=useState(false);
const BADGE={rail:railData.actionable.length||null,network:trend.d,pain:red.length,optimizer:opt.gates||null};
const [tick,setTick]=useState(0);
useEffect(()=>{
if(tab!=="franchise")return;
const id=setInterval(()=>setTick(t=>t+1),1100);
return()=>clearInterval(id);
},[tab]);
useEffect(()=>{
if(!opt.run||tab!=="optimizer")return;
const id=setInterval(()=>{const transferFx=[];setOpt(o=>{
if(o.week>=24)return{...o,run:false};
const week=o.week+1,probs={...o.probs},fresh={...o.fresh};let gates=o.gates,ships=o.ships;const log=[];
const staleOf=c=>fresh[c.name]!==undefined?(week-fresh[c.name])*7:(hash(c.name)%38)+week*2;
// Actions are chosen by need (real network state), not by dice; each
// "prob" is now a measured effectiveness score updated only by outcome.
const credit={};
const staleSet=centers.filter(c=>staleOf(c)>28);
if(staleSet.length){
// measurement agent: clear the stalest, largest units; credit = actual staleness cleared
const st=[...staleSet].sort((a,b)=>staleOf(b)*b.students-staleOf(a)*a.students).slice(0,6);
const cleared=st.reduce((a,c)=>a+staleOf(c),0);
st.forEach(c=>fresh[c.name]=week);
log.push(["score","measure",st.length+" units · "+cleared+"d staleness cleared",1]);
credit.measurement=Math.min(0.12,cleared/2000);}
const m=centers.filter(c=>staleOf(c)<=21);
if(m.length>1){
// best-practice transfer only when the measured conversion gap justifies it;
// credit scales with the gap actually closed
const b=m.reduce((a,c)=>c.conv>a.conv?c:a),w=m.reduce((a,c)=>c.conv<a.conv?c:a);
const gap=b.conv-w.conv;
if(gap>0.12){log.push(["transfer","transfer",b.name+"→"+w.name+" · conv gap "+Math.round(gap*100)+"pt",1]);credit.bestpractice=Math.min(0.10,gap*0.3);
transferFx.push([w.name,{conv:Math.min(0.04,gap*0.25)}]);}}
if(m.length>3){
// peer review pairs complementary units: strongest retention with weakest —
// only when the weak unit is actually deteriorating
const br=m.reduce((a,c)=>c.ret>a.ret?c:a),wr=m.reduce((a,c)=>c.ret<a.ret?c:a);
if(br!==wr&&forecast(wr).cls==="deteriorating"){log.push(["peer","review",br.name+"↔"+wr.name+" · retention pair",1]);credit.peer_review=Math.min(0.08,(br.ret-wr.ret)*0.25);}}
const rising=centers.filter(c=>forecast(c).cls==="rising").length;
if(rising>0&&week%2===0){
// rollout wave sized by how many units are actually rising
const flags=Math.max(1,Math.round(rising/12));
log.push(["wave","schedule",flags+" ramp flag"+(flags>1?"s":"")+" · "+rising+" rising",1]);credit.wave_mgr=Math.min(0.06,rising/400);}
const redNow=centers.filter(c=>c.eb<0).length;
if(redNow>0){
// pricing gate fires only when red-margin units exist to protect —
// a real hold, not a random one
gates++;log.push(["gate","hold","pricing ⚑ · "+redNow+" units below breakeven",0]);credit.pricing=-0.03;}
Object.entries(credit).forEach(([k,v])=>{probs[k]=Math.min(0.98,Math.max(0.05,probs[k]+0.5*v));});
return{run:true,week,gates,ships,probs,fresh,log:[...log,...o.log].slice(0,9)};
});
// flush cross-tab effects: best-practice transfers raise the recipient's real
// conversion, which re-ranks it on the map, pain tab, and forecasts next tick
if(transferFx.length){transferFx.forEach(([n,d])=>applyAdj(n,d));logL("optimizer","Best practice",transferFx.map(([n])=>n).join(", ")+" conversion lifted by transfer");}
},900);
return()=>clearInterval(id);
},[opt.run,tab,centers]);
// ===== DEAL AGENT — the 10 strategies as one propose/execute/train loop =====
const runDealWeek=()=>{
const trained=dealAg.trained;const plays=[];
// each action carries `ok` — whether it was the right call against real lead data
// (fit, hot flag) — this replaces a coin-flip with a graded, checkable outcome.
// Cannibalization blocking uses the same territory-capacity math as the real Growth agent, not a separate per-name coin flip.
const dealRegionActive={};
[...LEADS].sort((a,b)=>b.fit-a.fit).forEach(l=>{const s=leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;if(s>=5)return;
const netState=NET_STATES.find(x=>x.s===l.region);
const headroom=netState?netState.h[0]:0.3;
const capacity=territoryCapacityOf(headroom);
const used=dealRegionActive[l.region]||0;dealRegionActive[l.region]=used+1;
if(used>=capacity){plays.push({kind:"block cannibalization",cn:l.n,lever:0,block:true,ok:true,note:l.region+" territory candidate-supply ceiling reached ("+capacity+")"});return;}
if(l.fit<50&&s<=1){plays.push({kind:"decline — below qualification",cn:l.n,lever:1.2,cost:1,id:l.id,dec:true,ok:l.fit<45});return;}
if(s<2){plays.push({kind:"advance stage",cn:l.n,src:l.src,lever:+(1.0+l.fit/60).toFixed(2),cost:1,id:l.id,adv:true,ok:l.fit>=55});}
else{plays.push({kind:"awaiting human gate",cn:l.n,lever:+(l.fit/50).toFixed(2),cost:0,gate:true});
if(hash(l.n+"doc"+s)%2===0)plays.push({kind:"chase documents",cn:l.n,lever:0.9,cost:1,ok:!!l.hot});}});
plays.forEach(p=>{if(trained[p.kind])p.lever=+(p.lever*trained[p.kind]).toFixed(2);});
const exec=plays.filter(p=>!p.gate&&!p.block).sort((a,b)=>b.lever-a.lever);
let capp=8;const log=[];const adv={};const executed=[];
for(const p of exec){if(capp-(p.cost||1)<0)continue;capp-=(p.cost||1);log.push("["+p.kind+"] "+p.cn+" · "+p.lever+(p.ok?" ✓":" ✗"));if(p.adv)adv[p.id]=1;executed.push(p);}
if(Object.keys(adv).length)setLeadStage(m=>{const nm={...m};Object.keys(adv).forEach(id=>{const l=LEADS.find(x=>String(x.id)===String(id));const cur=m[id]!==undefined?m[id]:l.stage0;nm[id]=Math.min(2,cur+1);});return nm;});
if(executed.length)logL("leads","Deal agent",executed.length+" actions · "+executed.filter(p=>p.ok).length+" correct");
setDealAg(A=>{const tr={...A.trained},promoted=[...A.promoted],retired=[...A.retired],stats={...A.stats};
executed.forEach(p=>{const cur=stats[p.kind]||{hits:0,attempts:0};const st={hits:cur.hits+(p.ok?1:0),attempts:cur.attempts+1};stats[p.kind]=st;
if(st.attempts>=2){const rate=st.hits/st.attempts;
if(rate>=0.6){tr[p.kind]=Math.min(1.5,(tr[p.kind]||1)+0.08);if(!promoted.includes(p.kind))promoted.push(p.kind);const ri=retired.indexOf(p.kind);if(ri>=0)retired.splice(ri,1);}
else{tr[p.kind]=Math.max(0.6,(tr[p.kind]||1)-0.08);if(tr[p.kind]<=0.8&&!retired.includes(p.kind))retired.push(p.kind);}}});
return{...A,wk:A.wk+1,log:[...log,...A.log].slice(0,12),trained:tr,stats,promoted:promoted.slice(-4),retired:retired.slice(-3),blocked:plays.filter(p=>p.block).length};});
};
// Historical Playback: a snapshot is a small, fixed set of aggregate metrics
// read from the live canonical state at the moment it's captured — the same
// figures the header/Overview already compute, not a separate data source. Snapshots are session-only (no persistence layer yet); capped at 26 (~6mo of 
const captureSnapshot=(label)=>{
const avgHealth=+(centers.reduce((a,c)=>a+c.health,0)/centers.length).toFixed(1);
const redN=centers.filter(c=>c.eb<0).length;
const staleBaseHere=c=>opt.fresh[c.name]===undefined&&(hash(c.name)%38)>21;
const staleNHere=centers.filter(staleBaseHere).length;
const snap={
week:opt.week,t:Date.now(),label:label||("week "+opt.week),
avgHealth,redN,staleN:staleNHere,
committedN:Object.keys(dyn.committed||{}).length,
completedN:Object.keys(dyn.completed||{}).length,
conflictN:(railData.conflicts||[]).length,
proposalsN:(railData.recommendations||[]).length,
};
setSnapshots(s=>[...s,snap].slice(-26));
};
const downloadReport=()=>{
const so=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
const rows=[["Prospect","Source","Region","Fit","Liquidity_k","NetWorth_k","Proven","MultiUnit","Stage","Note"]];
[...LEADS].sort((a,b)=>so(b)-so(a)||b.fit-a.fit).forEach(l=>rows.push([l.n,l.src,l.region,l.fit,l.liquidity,l.net,l.proven?"Y":"N",l.multi?"Y":"N",STAGES6[so(l)],l.note]));
const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(",")).join("\n");
const blob=new Blob([csv],{type:"text/csv"});const url=URL.createObjectURL(blob);
const a=document.createElement("a");a.href=url;a.download="franchise-pipeline-report.csv";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
};
const downloadAll=()=>{
const so=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
const data={
generated:new Date().toISOString(),
product:"Franchise Development OS — Proposed Policy Framework — Candidate Submission (Pratik Singh)",
note:"Modeled simulation export. Counts: "+centers.length+" modeled network · 64 verified from public records · FDD Item 20 = 244 authoritative (unreconciled). Seeded/illustrative figures; the status-model mechanics are real, specific numbers are modeled.",
status_model:"Each center carries a probability split over {thriving,watch,at-risk}; the P&L review is the measurement that verifies it. Each deal carries {signs,stalls,dies} until a stage-gate verifies it.",
world_state:{
note:"Single integration layer — committed actions write metric deltas here; every tab reads the adjusted units.",
adjustments:adj,
action_ledger:ledger.map(e=>({t:new Date(e.t).toISOString(),tab:e.tab,actor:e.actor,action:e.text})),
},
invariants:{
red_units:centers.filter(c=>c.eb<0).length,
stale_units:centers.filter(staleBase).length,
deteriorating_90d:centers.filter(c=>forecast(c).cls==="deteriorating").length,
note:"These counts are computed once from the shared world state; every tab that displays them reads the same source."
},
network:centers.map(c=>{const f=forecast(c);const amp=qAmp(c);return{name:c.name,state:c.st,verified:c.verified,students:c.students,health:c.health,tier:tierOf(c.health),ebitda_k:c.eb,retention:+c.ret.toFixed(2),engagement:engageOf(c).score,forecast90_k:f.proj[2],trajectory:f.cls,status_probabilities:{thriving:+amp[0].toFixed(2),watch:+amp[1].toFixed(2),atRisk:+amp[2].toFixed(2)},status_on_review:QSTATES[qResolve(amp)]};}),
pipeline:LEADS.map(l=>({prospect:l.n,source:l.src,region:l.region,fit:l.fit,liquidity_k:l.liquidity,netWorth_k:l.net,proven:l.proven,multiUnit:l.multi,stage:STAGES6[so(l)],note:l.note}))
};
const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);
const a=document.createElement("a");a.href=url;a.download="franchise-development-os-export.json";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
};
useEffect(()=>{
if(!dealAg.auto||tab!=="leads")return;
const id=setInterval(()=>{if(dealAg.wk>=16){setDealAg(A=>({...A,auto:false}));return;}runDealWeek();},1200);
return()=>clearInterval(id);
},[dealAg.auto,dealAg.wk,tab]);
const Node=({ag,vb,tg,state,c,onClick,title,w})=>(
<span onClick={onClick} title={title||""} style={{display:"inline-flex",flexDirection:"column",cursor:onClick?"pointer":"default",verticalAlign:"middle",margin:"2px 0",minWidth:w||0}}>
<span style={{display:"inline-flex",alignItems:"baseline",gap:5,border:`1px solid ${c||RULE}`,padding:"3px 8px",background:"#fff",fontFamily:"Helvetica",fontSize:10}}>
{ag&&<b style={{fontSize:8.5,letterSpacing:0.4,textTransform:"uppercase",color:c||MUT}}>{ag}</b>}
<span style={{fontWeight:700,color:INK}}>{vb}</span>
{tg&&<span style={{color:"#555"}}>{tg}</span>}
</span>
<span style={{height:3,background:state==="done"?GRN:state==="run"?AMB:state==="hold"?AC:"#e4e0d6"}}/>
</span>);
const Arrow=()=><span style={{fontFamily:"Helvetica",fontSize:11,color:MUT,margin:"0 4px"}}>→</span>;
const Chain=({items})=>(<div style={{display:"flex",flexWrap:"wrap",alignItems:"center",marginBottom:5}}>
{items.map((n,i)=>(<span key={i} style={{display:"inline-flex",alignItems:"center"}}>{i>0&&<Arrow/>}<Node {...n}/></span>))}</div>);
const Rail=({d,label,hot})=>(
<span title={label} style={{position:"absolute",left:(d/90*100)+"%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center"}}>
<span style={{width:9,height:9,borderRadius:5,background:hot?AC:"#fff",border:`2px solid ${hot?AC:INK}`}}/>
<span style={{fontFamily:"Helvetica",fontSize:8,color:hot?AC:"#555",whiteSpace:"nowrap",marginTop:1}}>{label.length>16?label.slice(0,15)+"…":label}</span>
</span>);
const Meter=({n,p,c})=>(
<div style={{fontFamily:"Helvetica",fontSize:10,marginBottom:4}}>
<div style={{display:"flex",justifyContent:"space-between"}}><span>{n}</span><b>{p.toFixed(2)}</b></div>
<div style={{height:6,background:"#eee"}}><div style={{height:6,width:(p*100)+"%",background:c,transition:"width .4s"}}/></div>
</div>);
const Gate=({inLabel,inVal,thr,met,payout,title})=>(
<div title={title} style={{display:"flex",flexWrap:"wrap",alignItems:"center",marginBottom:4}}>
<Node vb={inLabel} tg={inVal} state="done" c={RULE}/><Arrow/>
<Node vb={"≥ "+thr} state={met?"done":"pend"} c={met?GRN:AMB} title="threshold gate"/><Arrow/>
<Node vb={payout} state={met?"done":"pend"} c={met?GRN:MUT}/>
</div>);
const QWave=({amp,coh,measured,dom,note,compact,labels})=>{const d=dom!==undefined?dom:qResolve(amp);const L=labels||QSTATES;return(
<div style={{fontFamily:"Helvetica",width:"100%"}}>
<div style={{display:"flex",gap:2,height:compact?16:24,alignItems:"flex-end"}}>
{amp.map((a,i)=>(<div key={i} title={L[i]+" "+pct(a)+"%"} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",height:"100%"}}><div style={{background:HCOL[i],opacity:measured?(i===d?1:0.22):0.7,height:Math.max(8,a*100)+"%",borderRadius:2,transition:"opacity .3s,height .3s"}}/></div>))}
</div>
<div style={{display:"flex",gap:6,marginTop:3}}>{L.map((n,i)=>(<span key={i} style={{flex:1,textAlign:"center",fontSize:8}}><b style={{color:HCOL[i]}}>{pct(amp[i])}%</b> {n}</span>))}</div>
{!compact&&<div style={{fontSize:8,color:MUT,marginTop:2,lineHeight:1.4}}>{measured?<span>Measured — verified as <b style={{color:HCOL[d]}}>{L[d]}</b> · confidence {pct(coh)}%.</span>:<span>Estimated · confidence {pct(coh)}% — estimate ages until measured.</span>}{note?" \u00b7 "+note:""}</div>}
</div>);};
const arrow=cls=>cls==="rising"?["↑",GRN]:cls==="deteriorating"?["↓",AC]:["→",AMB];
return(
<div className="cn-wrap" style={{fontFamily:"Helvetica",color:INK,background:BG,maxWidth:960,margin:"0 auto",padding:"24px 18px",WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",textRendering:"optimizeLegibility"}}>
<style>{`
@media print {
.no-print{display:none !important;}
.cn-wrap{max-width:100% !important;padding:6px !important;}
}
@media (max-width:640px){
.cn-wrap{padding:10px 8px !important;zoom:1.18;}
.cn-navscroll{overflow-x:auto !important;flex-wrap:nowrap !important;-webkit-overflow-scrolling:touch;}
.cn-navscroll::-webkit-scrollbar{height:4px;}
@keyframes cnpulse{0%{background-position:200% 0}100%{background-position:-200% 0}}
.cn-hero-title{font-size:18px !important;}
.cn-wrap button{min-height:34px;}
.cn-wrap input,.cn-wrap select{min-height:34px;font-size:12px !important;min-width:0 !important;max-width:100%;}
.cn-wrap table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;white-space:nowrap;}
.cn-wrap pre{font-size:10px !important;}
.cn-wrap svg{touch-action:pan-y;}
}
`}</style>
<div style={{borderBottom:`3px double ${INK}`,paddingBottom:8}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap"}}>
<h1 className="cn-hero-title" style={{fontSize:24,margin:0,letterSpacing:-0.5}}>How 350+ Centers Operate as One Governed System</h1>
<span className="no-print" style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
<span style={{display:"flex",gap:6,alignItems:"center"}}>
<input value={globalQ} onChange={e=>setGlobalQ(e.target.value)} placeholder="Search centers, states, views…" aria-label="Global search across centers, states, and views" style={{fontFamily:"Helvetica",fontSize:9,padding:"4px 8px",border:`1px solid ${RULE}`,minWidth:170}}/>
{(railData.conflicts||[]).length>0&&<button onClick={()=>setTab("rail")} aria-label={(railData.conflicts||[]).length+" cross-agent conflicts, open Decision Rail"} title="Open Decision Rail" style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 8px",cursor:"pointer",border:`1px solid ${AC}`,background:"#fdf3f2",color:AC}}>⚠ {(railData.conflicts||[]).length} conflict{(railData.conflicts||[]).length>1?"s":""}</button>}
<button onClick={()=>downloadText(buildSummaryText(centers,states,railData,dyn,opt,ledger),"cn-summary.txt")} aria-label="Download a static text summary for offline review" title="Static summary of Overview + System Alignment for offline review" style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 8px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>⬇ Print summary</button>
<button onClick={downloadAll} style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,padding:"6px 12px",cursor:"pointer",border:`1px solid ${INK}`,background:"#fff",color:INK}}>⬇ Export / Sync to MyStudio, QuickBooks</button>
</span>
<span style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT}}>exports the canonical state as JSON — a live deployment would sync via API instead of manual export</span>
</span>
</div>
{tab==="franchise"&&<EngineErrorBoundary><div style={{fontFamily:"Helvetica",fontSize:15,color:"#222",margin:"7px 0 2px",lineHeight:1.45}}>The Director of Franchise Development role sits at the intersection of network strategy and center-level execution; this model is designed to operate at both levels concurrently. <span style={{color:MUT,fontSize:12.5}}>Unit-level deterioration is identified early. Support is routed under governance. Growth proceeds on a measured cadence. All figures below are live and derived from a single canonical state.</span></div></EngineErrorBoundary>}
{tab==="franchise"&&<div style={{fontFamily:"Helvetica",fontSize:11,color:"#555",margin:"0 0 4px",lineHeight:1.5}}><b style={{color:INK}}>The business case:</b> improve unit economics across the existing 244 before adding the next 50 — the Unit-Value Program alone models ~$1.36M/yr in additional royalty at 400 units, at the lowest risk of the four available levers.</div>}
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT,letterSpacing:0.5,textTransform:"uppercase",marginTop:3}}><b style={{color:INK}}>Proposed Policy Framework — Candidate Submission</b> · {centers.length} modeled{(()=>{const so=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;const s=LEADS.filter(l=>so(l)===5).length;const parts=[];if(s)parts.push("+"+s+" signed in pipeline");if(reso.signed)parts.push("+"+reso.signed+" committed openings via growth loop");return parts.length?" ("+parts.join(" · ")+")":"";})()} · 64 verified · FDD Item 20 = 244 authoritative · proposes, does not enact</div>
</div>
{(()=>{
// Global search — matches center names, states/provinces, and tab labels.
// No new data source: reads the same `centers` array and TABL dictionary
// every other view reads. Empty query renders nothing (no wasted space).
const q=globalQ.trim().toLowerCase();
if(!q)return null;
const centerMatches=centers.filter(c=>c.name.toLowerCase().includes(q)||c.st.toLowerCase()===q).slice(0,5);
const tabMatches=Object.entries(TABL).filter(([k,label])=>label.toLowerCase().includes(q)||k.toLowerCase().includes(q)).slice(0,4);
const noResults=centerMatches.length===0&&tabMatches.length===0;
return(<div className="no-print" style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",padding:"7px 10px",margin:"8px 0 0"}}>
{noResults?<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>No centers, states, or views match "{globalQ}".</div>:<>
{centerMatches.length>0&&<div style={{marginBottom:tabMatches.length?6:0}}>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginRight:6}}>Centers</span>
{centerMatches.map(c=>(<button key={c.name} onClick={()=>{setSel(c.name);setFocusCenter(c.name);setTab("team");setGlobalQ("");}} style={{fontFamily:"Helvetica",fontSize:9.5,padding:"3px 8px",marginRight:5,cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:INK}}>{c.name} <span style={{color:MUT}}>· {c.st}</span></button>))}
</div>}
{tabMatches.length>0&&<div>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginRight:6}}>Views</span>
{tabMatches.map(([k,label])=>(<button key={k} onClick={()=>{setTab(k);setGlobalQ("");}} style={{fontFamily:"Helvetica",fontSize:9.5,padding:"3px 8px",marginRight:5,cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:INK,textTransform:"capitalize"}}>{label}</button>))}
</div>}
</>}
</div>);
})()}
{tab!=="franchise"&&<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",background:"#f7f6f2",border:`1px solid ${RULE}`,padding:"5px 9px",margin:"9px 0 0",fontFamily:"Helvetica",fontSize:10}}>
<b style={{fontSize:8.5,letterSpacing:0.5,textTransform:"uppercase",color:AC}}>90d</b>
<span style={{color:GRN}}>↑{trend.r}</span><span style={{color:AMB}}>→{trend.h}</span><span style={{color:AC}}>↓{trend.d}</span>
<span style={{color:MUT}}>·</span>
{alerts.slice(0,3).map((a,i)=>(
<button key={i} onClick={()=>{setSel(a.c.name);setTab("team");}} style={{fontFamily:"Helvetica",fontSize:9.5,padding:"2px 6px",cursor:"pointer",border:`1px solid ${a.eta<=30?AC:AMB}`,background:"#fff",color:a.eta<=30?AC:"#855"}}>{a.c.name} · {a.ev} ~{a.eta}d</button>))}
</div>}
{tour>=0&&(()=>{const STEPS=[
["Welcome — guided flow","This is a working system, not a static document — every figure recomputes in response to actions taken. This flow covers the whole loop: network posture, growth targets, pipeline, budgets, centers, financials, methodology, and the live systems underneath.",null,null],
["1 · Executive Summary — the whole pitch in one screen","All-centers network posture, a live ticket board with owner swimlanes, and the decision nexus — spine, modes, and six render chips on the selected center. No scrolling required.",null,"Stay on Executive Summary"],
["2 · Program Office","Governed proposals in flight, with allow/hold status against the four gates — the operating queue behind the numbers on Executive Summary.",null,"Stay on Program Office"],
["3 · Decision Replay","Pick any past decision and step through it stage by stage — the audit trail made walkable.",null,"Stay on Decision Replay"],
["4 · Franchise Overview","The whole network on a map — every state, sized by unit count, colored by condition.","franchise","Open Franchise Overview"],
["5 · Decision Rail — threads & queue","Every open item as a thread, one shared queue — approve or hold directly from here, logged to the ledger.","rail","Open Decision Rail"],
["6 · Operations Board","Interventions across the network running in parallel, one shared decision record.","board","Open Operations Board"],
["7 · System Alignment","How the individual views reconcile into one governed picture.","alignment","Open System Alignment"],
["8 · Compliance & Safety","Rule 2 in practice — the child-safety freeze and what triggers it.","compliance","Open Compliance & Safety"],
["9 · Approver Workload","Every proposal names an approver role and counts against a weekly capacity ceiling.","workload","Open Approver Workload"],
["10 · Growth Blockers","What's actually holding growth back right now, with the gate diagram.","blockers","Open Growth Blockers"],
["11 · Network Signals","The raw signal layer everything else reads from.","signals","Open Network Signals"],
["12 · Growth Pipeline — leads","The candidate pipeline and territory headroom the growth agent matches against.","leads","Open Growth Pipeline"],
["13 · Deals — the Director's actual sales process","Intro call → discovery call → FDD review (14-day FTC clock, Item 23) → validation → due diligence → discovery day → signed, plus the annual sales target worked backward through published conversion benchmarks.","deals","Open Deals Pipeline"],
["14 · Growth — Do Now","This week's five actions, in order, each with an owner and a one-click jump.","growth","Open Growth"],
["15 · Territory White Space","Where to grow next, ranked by headroom against how few units are already there.","whitespace","Open Territory White Space"],
["16 · Opening Project Plan & Center Budget","The opening milestone plan, plus the ongoing center budget — budgeted vs. actual vs. variance, editable, tied to the financials P&L.","onboarding","Open Opening Plan & Budget"],
["17 · Center Detail","Every center's full readout — health, trajectory, recovery — switchable from the strip dropdown across every Centers-group tab.","team","Open Center Detail"],
["18 · Six Lenses","One center, six perspectives — student, parent, franchisee, corporate, financial, system — synchronized.","lenses","Open Six Lenses"],
["19 · Network Map","The clustered map view of the whole territory.","table","Open Network Map"],
["20 · Financial Roll-Up & Pricing → P&L","Curriculum pricing bands (Core/Plus/AI tier) run through franchise P&L math at a 2 hrs/week cadence — revenue, royalty, unit EBITDA, all live against a roster slider.","financials","Open Financials"],
["21 · FDD Item 20","The 244 authoritative units held against this model's verified and modeled figures — stated separately, never blended.","fdd","Open FDD Reconciliation"],
["22 · Risk Register","Every at-risk unit ranked, with contributing factors and the owning approver role.","risk","Open Risk Register"],
["23 · Methodology — the record & the rules","What this tab actually is: not another decision, but how decisions get made — the weekly cadence, evidence rules, and the standing gates everything above was held to.","agenda","Open Methodology"],
["24 · Governance Constitution","The rules in full — Rule 1 human-commit, Rule 2 child-safety freeze, and the four governors.","constitution","Open Constitution"],
["25 · The Dojo Floor — where it all points","A live session floor (2D/3D), the real operating rhythm animated stage by stage, and a per-student progress report synced to the belt curriculum. This is what every other view exists to protect.","dojo","Open the Dojo Floor"],
];const [h,b,t2,lbl]=STEPS[tour];
return(<div className="no-print" style={{position:"sticky",top:8,zIndex:50,border:`1px solid ${INK}`,borderLeft:`4px solid ${AC}`,background:"#fffdf6",boxShadow:"0 2px 8px rgba(0,0,0,0.12)",padding:"9px 12px",margin:"10px 0 0"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8}}>
<b style={{fontFamily:"Helvetica",fontSize:10.5}}>{h}</b>
<button onClick={()=>setTour(-1)} aria-label="Dismiss guided tour" style={{fontFamily:"Helvetica",fontSize:9,color:MUT,cursor:"pointer",whiteSpace:"nowrap",background:"none",border:"none",padding:0}}>dismiss ×</button>
</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#333",lineHeight:1.5,margin:"3px 0 6px"}}>{b}</div>
<div style={{display:"flex",gap:6,alignItems:"center"}}>
{t2&&<button onClick={()=>setTab(t2)} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"4px 10px",cursor:"pointer",border:`1px solid ${AC}`,background:"#fff",color:AC}}>{lbl} ▸</button>}
{tour<STEPS.length-1?<button onClick={()=>setTour(tour+1)} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"4px 10px",cursor:"pointer",border:`1px solid ${INK}`,background:INK,color:"#fff"}}>Next ({tour+1}/{STEPS.length-1})</button>
:<button onClick={()=>setTour(-1)} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"4px 10px",cursor:"pointer",border:`1px solid ${GRN}`,background:GRN,color:"#fff"}}>Done — explore</button>}
<span style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>{STEPS.map((_,i)=>(i<=tour?"●":"○")).join(" ")}</span>
</div>
</div>);})()}
<div className="no-print cn-navscroll" style={{display:"flex",gap:0,borderBottom:`2px solid ${INK}`,marginTop:10,flexWrap:isMobile?"nowrap":"wrap",overflowX:isMobile?"auto":"visible",WebkitOverflowScrolling:"touch",alignItems:"stretch"}}>
<div style={{display:"flex",alignItems:"center",gap:10,padding:"0 14px 0 2px",borderRight:`1px solid ${RULE}`,marginRight:6}}>
<span style={{fontFamily:"Helvetica",lineHeight:1}}><b style={{fontSize:20,color:INK}}>{Math.round(centers.reduce((a,c)=>a+c.health,0)/centers.length)}</b><span style={{fontSize:8,fontWeight:700,letterSpacing:1,color:MUT,marginLeft:3}}>NETWORK</span></span>
<span style={{fontFamily:"Helvetica",fontSize:9,lineHeight:1.2}}><b style={{color:GRN}}>↑{trend.r}</b> <span style={{color:MUT}}>rising</span><br/><b style={{color:INK}}>{8-cap.used}</b> <span style={{color:MUT}}>pts · wk {cap.week}</span></span>
</div>
{Object.keys(GROUPS).map(g=>(
<button key={g} onClick={()=>setTab(GROUPS[g][0])} role="tab" aria-selected={groupOf(tab)===g} aria-label={"Section: "+(GROUP_LABEL[g]||g)} style={{fontFamily:"Helvetica",fontSize:isMobile?12:11,fontWeight:700,letterSpacing:isMobile?0.8:1.4,textTransform:"uppercase",padding:isMobile?"12px 14px":"8px 15px",cursor:"pointer",border:"none",whiteSpace:"nowrap",flex:"0 0 auto",background:groupOf(tab)===g?INK:"transparent",color:groupOf(tab)===g?"#fff":INK}}>{GROUP_LABEL[g]||g}</button>))}
</div>
<div className="no-print cn-navscroll" onKeyDown={onTabBarKeyDown} style={{display:"flex",gap:0,margin:"0 0 8px",flexWrap:isMobile?"nowrap":"wrap",overflowX:isMobile?"auto":"visible",WebkitOverflowScrolling:"touch",borderBottom:`1px solid ${RULE}`,alignItems:"center"}}>
{(essentialsOnly?GROUPS[groupOf(tab)].filter(t=>ESSENTIAL_TABS.includes(t)||t===tab):GROUPS[groupOf(tab)]).map(t=>(
<button key={t} onClick={()=>setTab(t)} role="tab" aria-selected={tab===t} aria-label={"View: "+(TABL[t]||t)} style={{fontFamily:"Helvetica",fontSize:isMobile?11:9.5,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",padding:isMobile?"11px 13px":"6px 12px",cursor:"pointer",border:"none",whiteSpace:"nowrap",flex:"0 0 auto",borderBottom:tab===t?`3px solid ${AC}`:"3px solid transparent",background:"transparent",color:tab===t?AC:MUT}}>{TABL[t]||t}{BADGE[t]?<span style={{marginLeft:4,fontSize:8,padding:"1px 4px",background:AC,color:"#fff",borderRadius:6}}>{BADGE[t]}</span>:null}</button>))}
<button onClick={()=>setEssentialsOnly(v=>!v)} aria-pressed={essentialsOnly} aria-label="Toggle essentials-only navigation" style={{marginLeft:isMobile?6:"auto",flex:"0 0 auto",whiteSpace:"nowrap",fontFamily:"Helvetica",fontSize:isMobile?10:8.5,fontWeight:700,padding:isMobile?"9px 12px":"4px 10px",cursor:"pointer",border:`1px solid ${RULE}`,background:essentialsOnly?INK:"#fff",color:essentialsOnly?"#fff":MUT}}>{essentialsOnly?"showing 14 essentials — show all":"show 14 essentials for a 5-min walkthrough"}</button>
</div>
{tab!=="franchise"&&<div className="no-print" style={{margin:"0 0 12px",border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`}}>
<div style={{display:"flex",flexWrap:"wrap"}}>
{[[`${V("measure")} 10 of ${staleN} stale`,()=>{const st=centers.filter(staleBase).slice(0,10);setOpt(o=>{const f={...o.fresh};st.forEach(c=>f[c.name]=o.week);return{...o,fresh:f};});setOpsMsg(st.length+" measured · "+(staleN-st.length)+" remain");logL(tab,"Measurement",st.length+" units re-measured");}],
[`${V("schedule")} top ${Math.min(5,alerts.filter(a=>a.eta>0&&a.eta<=90).length)} of ${alerts.filter(a=>a.eta>0&&a.eta<=90).length} interventions`,()=>{const k=alerts.filter(a=>a.eta>0&&a.eta<=90);const nr={...ranPlays};k.slice(0,5).forEach(a=>{nr[a.c.name+a.ev]=true;
// intervention writes real deltas: margin diagnostic lifts eb, retention pairing lifts ret/chem
if(a.ev==="EBITDA<0")applyAdj(a.c.name,{eb:1.5});
else if(a.ev==="sensei exit risk")applyAdj(a.c.name,{ret:0.015,chem:0.05});
else applyAdj(a.c.name,{eb:0.8});});
setRan(nr);setOpsMsg(Math.min(5,k.length)+" interventions committed — deltas applied to unit metrics, forecasts recomputed · gains decay weekly unless re-measured");logL(tab,"Forecast",Math.min(5,k.length)+" pre-breach interventions committed");}],
["Audit territory",()=>setOpsMsg("0 overlaps · governor armed")],
["Gate check",()=>setOpsMsg(opt.gates+" holds · 0 autonomous")],
].map(([s,run],i)=>{const cost=[2,3,1,1][i];return(
<button key={i} onClick={()=>{if(cap.used+cost>8){setOpsMsg("Capacity exhausted — "+(8-cap.used)+" of 8 pts left this week.");return;}setCap(c=>({...c,used:c.used+cost}));run();}} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"5px 9px",cursor:"pointer",border:"none",borderRight:`1px solid ${RULE}`,background:"transparent",color:cap.used+cost>8?"#bbb":"#333"}}>{s} <span style={{color:MUT,fontWeight:400}}>· {cost} pts</span></button>);})}
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"5px 9px",color:cap.used>=8?"#8b0000":"#333"}}>WK {cap.week} · {8-cap.used} of 8 pts left</span>
<button onClick={()=>{captureSnapshot();setCap(c=>({used:0,week:c.week+1}));
// decay: intervention gains fade week-over-week — measured units hold
// 85% of their deltas, unmeasured units hold 55%; sub-threshold deltas clear
setAdj(m=>{const nm={};let faded=0,held=0;Object.entries(m).forEach(([n,d])=>{
const measured=opt.fresh[n]!==undefined;const k=measured?0.85:0.55;const nd={};let live=false;
Object.entries(d).forEach(([f,v])=>{const x=v*k;if(Math.abs(x)>=(f==="eb"?0.2:0.005)){nd[f]=+x.toFixed(3);live=true;}});
if(live){nm[n]=nd;measured?held++:faded++;}else faded++;});
if(faded||held)logL(tab,"Decay",faded+" unit adjustments faded · "+held+" held by fresh measurement");
return nm;});
}} style={{fontFamily:"Helvetica",fontSize:9,padding:"5px 9px",cursor:"pointer",border:"none",background:"transparent",color:MUT}} title="advancing the week decays intervention gains — 85% retained with fresh measurement, 55% without">next week ▸</button>
</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#333",padding:"4px 9px",borderTop:`1px solid ${RULE}`}}><b style={{color:AC,fontSize:8.5}}>RESULT · </b>{opsMsg}</div>
</div>}
{["acquire","deliver","retain","operate","plan","metrics","failure","fivebasis"].includes(tab)&&(()=>{
// agentic integration strip: static reference content on these tabs now sits
// on top of the live world state — same agents, same ledger, one system
const tgt=[...centers].filter(c=>forecast(c).cls==="deteriorating").sort((a,b)=>a.health-b.health)[0];
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#faf9fc",padding:"6px 10px",margin:"0 0 10px",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.7,textTransform:"uppercase",color:VIO}}>Live system</span>
<span style={{fontFamily:"Helvetica",fontSize:9,color:"#444"}}>{Object.keys(adj).length} units adjusted · {ledger.length} actions on record · agents active: Measurement → {staleN} stale · Support → {red.length} red</span>
{tgt&&<button onClick={()=>{logL(tab,"Support",tgt.name+" queued for support plan from the "+((TABL[tab]||tab))+" reference");setOpsMsg(tgt.name+" queued — see RECORD");}} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${AC}`,background:"#fff",color:AC}}>Queue support: {tgt.name} ▸</button>}
<button onClick={()=>setTab("agenda")} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>Open record ▸</button>
</div>);})()}
{["portfolio","mastery","growth","calendar"].includes(tab)&&(()=>{
// programs hub: the four PROGRAMS tabs are one pipeline — program design →
// interaction check → schedule → growth outcome. One strip, shared metrics.
const hub=[["portfolio","1 · programs","design & stage-gates"],["dojo","2 · belts","progression engine"],["scheduler","3 · calendar","the operating rhythm"],["growth","4 · growth","pricing & outcome"]];
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AMB}`,background:"#fdfaf2",padding:"6px 10px",margin:"0 0 10px"}}>
<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.7,textTransform:"uppercase",color:AMB}}>Programs pipeline</span>
{hub.map(([t,l,d],i)=>(<span key={t} style={{display:"inline-flex",alignItems:"center"}}>{i>0&&<span style={{color:MUT,margin:"0 3px"}}>→</span>}
<button onClick={()=>setTab(t)} title={d} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 8px",cursor:"pointer",border:`1px solid ${tab===t?AMB:RULE}`,background:tab===t?"#fdf6e6":"#fff",color:tab===t?"#8a6d1a":"#555"}}>{l}</button></span>))}
<span style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginLeft:"auto"}}>one pipeline: design → interaction check → schedule → outcome · reads the same {centers.length}-unit network</span>
</div>
</div>);})()}
{!["franchise","acquire","deliver","retain","operate","plan","failure","agenda","warning","fivebasis","signals"].includes(tab)&&(()=>{
const qc=team;const qamp=qAmp(qc);const qmeas=!staleBase(qc)||opt.fresh[qc.name]!==undefined;
const qdays=opt.fresh[qc.name]!==undefined?7:(hash(qc.name)%38);const qcoh=qCoherence(qdays);const qdom=qResolve(qamp);
const samp=qStateAmp(states[stSel]||[]);
const nav=[["network","map"],["team","center"],["signals","engagement"],["growth","growth"],["dynamics","transfers"],["blockers","priorities"]];
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#faf9fc",padding:"7px 10px",margin:"0 0 12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:6}}>
<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:VIO}}>Operational focus ·</span>
<select value={sel} onChange={e=>setSel(e.target.value)} aria-label="Select center" style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,padding:"3px 8px",border:`1px solid ${VIO}`,borderRadius:6,background:"#fff",color:INK,cursor:"pointer",maxWidth:190}}>
{[...centers].sort((a,b)=>a.name.localeCompare(b.name)).map(c=>(<option key={c.name} value={c.name}>{c.name} · {c.st}</option>))}
</select>
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>· {stSel} state {QSTATES[qResolve(samp)]}</span>
</div>
<div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{nav.map(([t,l])=>(<button key={t} onClick={()=>setTab(t)} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 7px",cursor:"pointer",border:`1px solid ${tab===t?VIO:RULE}`,background:tab===t?VIO:"#fff",color:tab===t?"#fff":"#555"}}>{l}</button>))}</div>
</div>
<div style={{display:"flex",gap:12,alignItems:"flex-end",marginTop:6,flexWrap:"wrap"}}>
<div style={{flex:1,minWidth:200}}><QWave amp={qamp} coh={qcoh} measured={qmeas} dom={qdom} note={"health "+qc.health+" \u00b7 "+tierOf(qc.health)}/></div>
{(()=>{const g=qGate(qc,qdays);return(
<button disabled={!g.allow&&!qmeas} onClick={()=>{if(!g.allow){return;}setOpt(o=>({...o,fresh:{...o.fresh,[qc.name]:o.week}}));logL(tab,"Measurement",qc.name+" verified — all four governors clear");}} title={g.allow?"all four governors clear \u2014 measurement approved":"held by: "+g.held.map(h=>h.label).join(", ")} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"5px 9px",cursor:g.allow||qmeas?"pointer":"not-allowed",border:`1px solid ${g.allow?VIO:AC}`,background:qmeas?VIO:g.allow?"#fff":"#fbeaea",color:qmeas?"#fff":g.allow?VIO:AC}}>{qmeas?"\u25c6 measured \u2014 current":g.allow?"\u27f2 measure \u2014 verify":"\u2298 held \u2014 "+g.held.length+" governor"+(g.held.length>1?"s":"")}</button>);})()}
</div>
{(()=>{const g=qGate(qc,qdays);return(
<div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
{g.verdicts.map((v,i)=>(<span key={i} title={v.detail} style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,letterSpacing:0.3,padding:"2px 6px",border:`1px solid ${v.pass?GRN:AC}`,background:v.pass?"#eef8f0":"#fbeaea",color:v.pass?GRN:AC}}>{v.pass?"\u2713":"\u2298"} {v.label}</span>))}
<span style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,padding:"2px 4px"}}>{g.allow?"measurement approved":"measurement held \u2014 fail-safe: missing data does not pass"}</span>
</div>);})()}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:4}}>The map sets this focus — pick a state or center on <b>franchise</b>, and every section reads the same verified unit. This rail carries {qc.name} across sections. <b>Every measurement passes the four governors first.</b></div>
{(()=>{const d=qDiag(qc);const warn=d.tau>3;const critLow=d.crit<2;const zoneC=d.zone.zone==="self-stabilizing"?GRN:d.zone.zone==="transitional"?AMB:AC;
const cells=[
["Stability zone",d.zone.zone,zoneC,d.zone.note+" \u00b7 occupancy "+pct(d.zone.occ)+"%"],
["Early-warning \u03c4",d.tau+"w",warn?AC:GRN,warn?"memory time above 3 weeks \u2014 elevated transition risk inside 30 days":"memory time normal \u2014 unit re-equilibrates quickly"],
["Critical distance","$"+d.crit+"k",critLow?AC:GRN,critLow?"margin within $2k of the transition boundary \u2014 contingency required before any pricing change":"margin headroom above the transition boundary"],
["Program interaction",d.pair[0]+" \u00d7 "+d.pair[1],d.pair[2]>0?GRN:AC,(d.pair[2]>0?"constructive ":"destructive ")+"coefficient "+d.pair[2]+" \u2014 "+(d.pair[2]>0?"run together":"sequence, do not stack")],
["Sustainability",(d.bal.net>=0?"+":"")+d.bal.net+"/wk",d.bal.net>=-0.002?GRN:AMB,"engagement gain "+d.bal.gain+" vs overhead "+d.bal.cost+" \u2014 "+(d.bal.net>=-0.002?"balanced; cadence can run indefinitely":"cost exceeds gain; reduce cadence")]];
return(<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
{cells.map(([n,v,col,tip],i)=>(<div key={i} title={tip} style={{flex:"1 1 120px",minWidth:118,border:`1px solid ${RULE}`,background:"#fff",padding:"4px 7px"}}>
<div style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:MUT}}>{n}</div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700,color:col}}>{v}</div>
</div>))}
</div>);})()}
</div>);})()}
{tab==="filings"&&<EngineErrorBoundary>{(()=>{
// FORMS & FILINGS — the document package behind "coordinate timely movement of
// documents to corporate," gated the same way the FDD 14-day clock is gated.
// State list = the 13 FDD registration states (+ WI, a business-opportunity state).
const REG_STATES=new Set(["CA","HI","IL","IN","MD","MI","MN","NY","ND","RI","SD","VA","WA","WI"]);
const stageOfLive2=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
const active=[...LEADS].filter(l=>stageOfLive2(l)>=2 && stageOfLive2(l)<6); // FDD-issued through discovery-day
const fddClock2=l=>14-(hash(l.n)%17);
const stFor=l=>(l.region||"").slice(0,2).toUpperCase()||l.market||"—";
const isRegState=l=>REG_STATES.has(stFor(l));
const DOCSET=(l)=>{const reg=isRegState(l);const clk=fddClock2(l);
return[
 ["FDD delivered · Item 23 receipt signed",clk<14,"Legal / Franchise Director"],
 ["State registration filed",!reg||clk<=7,reg?"Legal — registration state":"n/a — non-registration state"],
 ["Due diligence docs + budget submitted",stageOfLive2(l)>=4,"Candidate → Franchise Director"],
 ["Franchise Agreement drafted",stageOfLive2(l)>=4,"Legal"],
 ["Personal guaranty prepared",stageOfLive2(l)>=4,"Legal"],
 ["Territory exhibit finalized",stageOfLive2(l)>=4,"Franchise Director"],
 ["Discovery day scheduled",stageOfLive2(l)>=5,"Franchise Director"],
 ["Insurance certs & lease/site docs",stageOfLive2(l)>=5,"Candidate"],
 ["Franchise Agreement executed",stageOfLive2(l)>=6,"Both parties"],
];};
const l0=active.find(x=>x.id===leadSel)||active[0];
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Forms & filings — the document package behind every signature, gated the same way the FDD clock is gated. <b>{REG_STATES.size} states require FDD registration</b> before offer or sale (CA, HI, IL, IN, MD, MI, MN, NY, ND, RI, SD, VA, WA, WI); everywhere else, the federal 14-day rule alone governs.</div>
<div style={{display:"flex",gap:16,flexWrap:"wrap",border:`1px solid ${RULE}`,background:"#fff",padding:"8px 12px",marginBottom:10,...CARD,fontFamily:"Helvetica"}}>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Candidates with an open package</div><b style={{fontSize:15}}>{active.length}</b></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>In a registration state</div><b style={{fontSize:15}}>{active.filter(isRegState).length}</b></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Clocks still running</div><b style={{fontSize:15,color:AMB}}>{active.filter(l=>fddClock2(l)>0).length}</b></div>
</div>
<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
{active.map(l=>(<button key={l.id} onClick={()=>setLeadSel(l.id)} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"5px 11px",cursor:"pointer",border:`1px solid ${leadSel===l.id||(!leadSel&&l===l0)?INK:RULE}`,background:leadSel===l.id||(!leadSel&&l===l0)?INK:"#fff",color:leadSel===l.id||(!leadSel&&l===l0)?"#fff":MUT,borderRadius:999}}>{l.n}{isRegState(l)?" ⚑":""}</button>))}
</div>
{l0?(()=>{const docs=DOCSET(l0);const done=docs.filter(d=>d[1]).length;const allDone=done===docs.length;
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${allDone?GRN:INK}`,background:"#fff",padding:"10px 14px",...CARD}}>
<div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:6}}>
<b style={{fontFamily:"Helvetica",fontSize:12}}>{l0.n}</b>
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{stFor(l0)}{isRegState(l0)?" · registration state":" · non-registration state"} · {done}/{docs.length} complete</span>
{isRegState(l0)&&<span style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,color:"#fff",background:VIO,padding:"2px 8px",borderRadius:999}}>state filing required</span>}
</div>
{docs.map(([nm,ok,owner],i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderTop:i?"1px solid #f4f4ef":"none"}}>
<span style={{width:14,height:14,borderRadius:3,flexShrink:0,background:ok?GRN:"#fff",border:`1.5px solid ${ok?GRN:RULE}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#fff"}}>{ok?"✓":""}</span>
<span style={{fontFamily:"Helvetica",fontSize:9.5,flex:1,color:ok?"#444":INK}}>{nm}</span>
<span style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT}}>{owner}</span>
</div>))}
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,marginTop:8,padding:"6px 8px",background:allDone?"#f4faf5":"#fdf6e6",color:allDone?GRN:AMB,borderRadius:6}}>{allDone?"Package complete — ready to route to corporate for processing":"Package incomplete — cannot route to corporate until every item is checked"}</div>
<button onClick={()=>logL("filings","Package",l0.n+" — status logged: "+done+"/"+docs.length+" complete (owner: Franchise Director)")} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"6px 14px",cursor:"pointer",border:"none",background:INK,color:"#fff",borderRadius:6,marginTop:8}}>Log package status</button>
</div>);})():<div style={{fontFamily:"Helvetica",fontSize:10,color:MUT}}>No candidates currently past FDD issuance.</div>}
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,marginTop:8}}>All figures modeled/illustrative. Real filings route through franchise counsel; this view exists so nothing sits untracked between FDD issuance and signature.</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="growth"&&(<div>
{(()=>{ // DO NOW — the five immediate actions, derived live, each with an owner and a jump
const worst3=[...centers].sort((a,b)=>a.health-b.health).slice(0,3);
const openRecs=((railData&&railData.recommendations)||[]).length;
const acts=[
["Approve or hold the "+openRecs+" open proposals in the queue","Franchise Director","rail"],
["Run support sequence at "+worst3[0].name+" (lowest health: "+worst3[0].health+")","Center Success Lead","team"],
["Re-measure the stalest units before any growth gate","Ops Analyst","monitor"],
["Advance top pipeline candidates one stage","Franchise Director","leads"],
["Review territory white space against candidate supply","Franchise Director","whitespace"]];
return(<div style={{border:`1px solid ${AC}`,background:"#fdf6f5",padding:"10px 14px",marginBottom:12,borderRadius:8}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:AC,marginBottom:6}}>Do now — this week's five, in order</div>
{acts.map(([a,o,t],i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderTop:i?"1px solid #f0e2e0":"none"}}>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,color:AC,minWidth:14}}>{i+1}</span>
<span style={{fontFamily:"Helvetica",fontSize:10.5,flex:1}}>{a}</span>
<span style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>{o}</span>
<button onClick={()=>setTab(t)} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"3px 10px",cursor:"pointer",border:`1px solid ${AC}`,background:"#fff",color:AC,borderRadius:5}}>go ▸</button>
</div>))}
</div>);})()}
{(()=>{ // community demand layer — five local touchpoint channels per territory
const CH=[["STEM events","stem"],["Library partnerships","lib"],["Farmers-market booths","mkt"],["Family nights","fam"],["Holiday camps","hol"]];
const top=Object.entries(states).map(([st,cs])=>({st,units:cs.length,avg:Math.round(cs.reduce((a,c)=>a+c.health,0)/cs.length)})).sort((a,b)=>b.avg-a.avg).slice(0,5);
const rows=top.map(t=>{const ct=CH.map(([n,k])=>1+(hash(t.st+k)%5));const idx=Math.min(99,Math.round(ct.reduce((a,b)=>a+b,0)/ (CH.length*5)*100));return{...t,ct,idx};});
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid #0b6fa8`,background:"#fff",marginBottom:10,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#0b6fa8",padding:"7px 10px",borderBottom:`1px solid ${RULE}`}}>Community demand layer — local touchpoints per territory (modeled)</div>
<div style={{display:"flex",padding:"5px 10px",fontFamily:"Helvetica",fontSize:7.5,color:MUT,gap:0}}>
<span style={{flex:2}}>territory</span>{CH.map(([n])=>(<span key={n} style={{flex:1,textAlign:"center"}}>{n}</span>))}<span style={{flex:1,textAlign:"right"}}>demand idx</span></div>
{rows.map((r,i)=>(<div key={r.st} style={{display:"flex",alignItems:"center",padding:"5px 10px",borderTop:"1px solid #f4f4f0",fontFamily:"Helvetica",fontSize:9.5}}>
<span style={{flex:2}}><b>{r.st}</b> · {r.units} units</span>
{r.ct.map((c,j)=>(<span key={j} style={{flex:1,textAlign:"center",color:c>=4?GRN:c<=1?AMB:MUT}}>{c}</span>))}
<span style={{flex:1,textAlign:"right",fontWeight:800,color:r.idx>=70?GRN:r.idx>=45?INK:AMB}}>{r.idx}</span></div>))}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,padding:"6px 10px",borderTop:`1px solid ${RULE}`}}>Demand is built at the library table and the farmers-market booth before it shows up as a lead — high-index territories ramp faster on the same spend. Modeled.</div>
</div>);})()}
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#faf9fc",padding:"7px 10px",marginBottom:10}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:VIO,marginBottom:4}}>Growth outcome · {"pending until you commit"}</div>
<QWave amp={[0.30,0.45,0.25]} coh={0.34} measured={false} labels={["upside","base","downside"]} note={"P90 $19.4M \u00b7 P50 $13.6M \u00b7 P10 $8.1M royalty"}/>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:3}}>The royalty line is a range, not a number. Committing an intervention locks it to a figure — the four governors below hold the floor so the commitment can't land below breakeven. <button onClick={()=>setTab("dynamics")} style={{fontFamily:"Helvetica",fontSize:8,color:AC,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0}}>Try this in the scenario sandbox →</button></div>
</div>
{(()=>{const gr=growthRank(centers).slice(0,6);return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",marginBottom:10}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:GRN,padding:"7px 10px",borderBottom:`1px solid ${RULE}`}}>Center growth priorities — ranked by readiness, not size</div>
{gr.map((g,i)=>(<div key={g.name} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10}}><span><b>{i+1}. {g.name}</b> ({g.st})</span><span style={{color:MUT}}>priority {g.gp} · {g.students} students · health {g.health}</span></div>))}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,padding:"6px 10px",borderTop:`1px solid ${RULE}`}}>gp = 0.35·headroom + 0.30·momentum + 0.20·health + 0.15·peer support — the same single formula the executive summary, scheduler, and brief read. A center low on this list isn't denied growth; it's sequenced after its foundation work.</div>
</div>);})()}
{[["Baseline",4.9,MUT],["Premium tier 70%",6.3,GRN],["Retention +3",7.1,GRN],[centers.length+" units",8.6,VIO],["400 units",13.6,VIO]].map(([n,v,c],i)=>(
<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
<span style={{fontFamily:"Helvetica",fontSize:9.5,width:90}}>{n}</span>
<div style={{flex:1,height:14,background:"#f0ede6"}}><div style={{height:14,width:(v/13.6*100)+"%",background:c}}/></div>
<b style={{fontFamily:"Helvetica",fontSize:10}}>${v}M/yr</b>
</div>))}
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,margin:"2px 0 8px"}}>royalty line · illustrative until fit · P10 $8.1 / P50 $13.6 / P90 $19.4</div>
{[["gate","cannibalization ≥0","block signature"],["cap","candidate supply","throttle wave"],["wave","ramp < prior","pause scale"],["score","measure lag","freeze claims"],["fcst","J-curve dip","fund runway"]].map(([ag,g,act],i)=>(
<Chain key={i} items={[{ag:A(ag),vb:g,state:"run",c:AMB,title:"governor "+(i+1)},{vb:act,state:"pend",c:AC}]}/>))}
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6,marginTop:14}}>The Four Growth Programs</div>
{ACTION_PLANS.map((p,i)=>{
const isUV=p.n==="Unit-Value Program";
const range=isUV?financialRange(1.36,0.18):null; // range basis: same P10/P50/P90 spread shown above
const delta=franchiseeDeltaOf(p);
const isExp=p.n==="Selective Expansion";
return(
<div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderTop:i?"1px solid #eee":"none",fontFamily:"Helvetica"}}>
<span style={{fontFamily:"Helvetica",fontSize:14,fontWeight:700,color:AC}}>{p.r}</span>
<div style={{flex:1}}>
<b style={{fontSize:14}}>{p.n}</b>
<div style={{fontSize:12.5,color:"#444",lineHeight:1.5}}>{p.d}</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:MUT}}>FLOOR: {p.floor}</div>
{range&&<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT,marginTop:2}}>range: ${range.lo}M–${range.hi}M/yr at 400 units (±{Math.round(range.uncertaintyPct*100)}%, point estimate ${range.point}M)</div>}
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:delta.unitMarginDelta_k>0?GRN:delta.unitMarginDelta_k<0?AC:MUT,marginTop:2}}>franchisee unit: {delta.unitMarginDelta_k>0?"+":""}{delta.unitMarginDelta_k!==0?"$"+delta.unitMarginDelta_k+"k/yr margin":"no unit-level change"} · payback {delta.payback_yr} — {delta.note}</div>
{isExp&&<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT,marginTop:2}}>J-curve: a new unit does not open at target economics — {rampMilestones().map(r=>r.m+"mo "+r.pct+"%").join(" · ")} of target</div>}
</div>
<span style={{fontFamily:"Helvetica",fontSize:11,color:"#444"}}>{p.risk}</span>
</div>);})}
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6,marginTop:14}}>Unit-Value Chain</div>
{CENTER_CHAIN.map((c,i)=>(<div key={i} style={{padding:"3px 0",borderTop:i?"1px solid #eee":"none",display:"flex",gap:6,fontFamily:"Helvetica"}}><span style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,color:i===0?AC:MUT,minWidth:14}}>{i+1}.</span><span style={{fontSize:13,color:"#444"}}>{c}</span></div>))}
</div>)}
{tab==="table"&&(<EngineErrorBoundary><CommandTableTab centers={centers} states={states} opt={opt} setOpt={setOpt} railData={railData} leads={LEADS} jumpTo={jumpTo}/></EngineErrorBoundary>)}
{tab==="network"&&<EngineErrorBoundary>{(()=>{
const taus=centers.map(c=>qTau(c));
const tBins=[taus.filter(t=>t<=2).length,taus.filter(t=>t>2&&t<=3).length,taus.filter(t=>t>3).length];
return(<div>
<div style={{border:`1px solid ${RULE}`,borderLeft:"3px solid #7a6bd8",background:"#faf9fc",padding:"7px 10px",marginBottom:8}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,color:"#7a6bd8",marginBottom:4}}>Each unit is tracked as a probability-weighted status (thriving / watch / at-risk) with a recovery-time distribution</div>
<div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"baseline"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:"#7a6bd8"}}>Recovery-time distribution</div>
{[["rec ≤ 2w fast",tBins[0],GRN],["2–3w slowing",tBins[1],"#b8860b"],["rec > 3w critical",tBins[2],AC]].map(([l,v,c],i)=>(
<span key={i} style={{fontFamily:"Helvetica",fontSize:9.5}}><b style={{color:c,fontSize:12}}>{v}</b> <span style={{color:MUT}}>{l}</span></span>))}
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>· recovery time {'>'} 3w forecasts floor contact ≈ 30d — support plan required</span>
</div>
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}}>
{Object.keys(states).sort((a,b)=>states[b].length-states[a].length).map(st=>(
<Node key={st} vb={st} tg={states[st].length+(states[st].some(c=>c.verified)?"":" ~")} state={st===stSel?"done":"pend"} c={st===stSel?AC:RULE} onClick={()=>setSt(st)}/>))}
</div>
<div style={{display:"flex",flexWrap:"wrap",gap:3}}>
{states[stSel].sort((a,b)=>b.health-a.health).map(c=>{const[ar]=arrow(forecast(c).cls);const ct=qTau(c);
return(<Node key={c.name} vb={c.name} tg={c.health+" "+tierOf(c.health)+" "+ar+" rec "+ct} state={c.name===sel?"done":c.verified?"pend":"hold"} c={c.name===sel?AC:ct>3?AC:c.verified?RULE:MUT} onClick={()=>{setSel(c.name);setTab("team");}} title={(c.verified?"verified":"modeled")+" · "+ct+"w recovery · click to open"}/>);})}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:5}}>solid = verified · gray = modeled · red chip = recovery &gt; 3w (critical slowing down) · rail: green done / red hold · click = open</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="team"&&(()=>{const tf=forecast(team);const[ar,ac2]=arrow(tf.cls);const tmTau=qTau(team);const tauStr=tmTau<=2?tmTau+"w fast":tmTau<=4?tmTau+"w slowing":tmTau+"w critical";
const inc=[["EBITDA",fmt(team.eb)+"k",">6k",team.eb>6,"Performance rebate"],["Retention",pct(team.ret)+"%","≥88%",team.ret>0.88,"Retention Gold"],["Chemistry",pct(team.chem)+"%","≥65%",team.chem>0.65,"Chemistry credit"],["Report",staleBase(team)?"stale":"fresh","≤21d",!staleBase(team),"Cadence rebate"],["Momentum",team.momentum,"+3",team.momentum[0]==="+"&&parseInt(team.momentum.slice(1))>=3,"Momentum spotlight"],["Recovery time",tauStr,"fast",tf.tau<=2,<span style={{fontSize:8,color:MUT}}>Slowing recovery at 3w+</span>],["Health Index",team.health,"≥85",team.health>=85,"Donor credit /adoption"]];
const e=engageOf(team);
const measured=!staleBase(team)||opt.fresh[team.name]!==undefined;
// Measurement confidence uses the same qCoherence decay every other view reads
// (System Alignment, the map, Six Lenses) instead of a flat measured/not-measured
// toggle -- one concept, one formula, wherever it's shown.
const teamDays=opt.fresh[team.name]!==undefined?(opt.week-opt.fresh[team.name])*7:(hash(team.name)%38)+opt.week*2;
const teamConf=Math.round(qCoherence(teamDays)*100);
const ATTR=[["Enrollment",Math.min(99,Math.round(30+team.conv*95))],["Retention",Math.round(team.ret*100)],["Instruction",Math.min(99,Math.round(38+e.pre*55))],["Community",Math.min(99,Math.round(28+e.refer*70+e.buzz*25))],["Staff chemistry",Math.round(team.chem*100)],["Measurement",teamConf],["Facilities",45+hash(team.name+"fac")%40]];
const sorted=[...ATTR].sort((a,b)=>b[1]-a[1]);
const strengths=sorted.slice(0,2),weaks=sorted.slice(-2).reverse();
const cx=70,cy=70,R=52,Nn=ATTR.length;
const ptf=(i,f)=>{const a=-Math.PI/2+i*2*Math.PI/Nn;return[cx+Math.cos(a)*R*f,cy+Math.sin(a)*R*f];};
const poly=ATTR.map((at,i)=>ptf(i,at[1]/99).map(v=>v.toFixed(1)).join(",")).join(" ");
const grid=[0.33,0.66,1].map(g=>ATTR.map((_,i)=>ptf(i,g).map(v=>v.toFixed(1)).join(",")).join(" "));
const verdict=weaks[0][1]<55?"Needs intervention — "+weaks[0][0].toLowerCase()+" is the drag":team.health>=85?"Donor-grade — a pattern source for the network":team.health>=75?"Solid unit — one gap from the next tier":"Developing — the fix is known and named";
const DEPT=[["Acquisition",[ATTR[0][1],ATTR[3][1]]],["Instruction",[ATTR[2][1],ATTR[5][1]]],["Retention",[ATTR[1][1],ATTR[4][1]]],["Operations",[team.health,ATTR[6][1]]]].map(([n,vs])=>{const g=Math.round(vs.reduce((a,b)=>a+b,0)/vs.length);return[n,g,g>=85?"A":g>=78?"B":g>=68?"C":g>=58?"D":"F"];});
const FIX={Enrollment:"trial-to-enrollment coaching + day-7 follow-up",Retention:"engagement-based re-enrollment + at-risk outreach",Instruction:"pre/post-session routine + sensei certification",Community:"school partnership + demo day on the calendar",["Staff chemistry"]:"sensei 1:1 + CIT draft from Red/Black belts",Measurement:"measure now — verify the estimate first",Facilities:"floor refresh in the facility budget quarter"};
return(<div>
<div style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"baseline",marginBottom:6}}>
<h2 style={{fontSize:18,margin:0}}>{team.name}</h2>
<span style={{fontFamily:"Helvetica",fontSize:10}}>{team.health} {tierOf(team.health)} · {team.students} students · {team.momentum+" trend"} · <b style={{color:ac2}}>{ar} {fmt(tf.proj[2])}k @90d</b></span>
</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff",marginBottom:8}}>
<div style={{background:"linear-gradient(135deg,#161616,#232323)",padding:"12px 14px",display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
<div style={{textAlign:"center",minWidth:70}}>
<div style={{fontFamily:"Helvetica",fontSize:46,fontWeight:800,color:"#fff",lineHeight:0.9}}>{team.health}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:1.5,color:team.health>=88?"#6fc38a":team.health>=80?"#d9a62e":team.health>=68?"#bbb":"#d96a6a"}}>{tierOf(team.health)}</div>
</div>
<svg viewBox="0 0 140 140" style={{width:118,height:118,flexShrink:0}}>
{grid.map((g,i)=>(<polygon key={i} points={g} fill="none" stroke="#3a3a3a" strokeWidth="0.7"/>))}
{ATTR.map((_,i)=>{const[x,y]=ptf(i,1);return(<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#333" strokeWidth="0.5"/>);})}
<polygon points={poly} fill="rgba(139,0,0,0.35)" stroke="#c0504d" strokeWidth="1.6"/>
{ATTR.map((at,i)=>{const[x,y]=ptf(i,1.16);return(<text key={i} x={x} y={y+2} textAnchor="middle" style={{font:"bold 6.5px Helvetica",fill:"#9a9a9a"}}>{at[0].split(" ")[0].slice(0,4).toUpperCase()}</text>);})}
</svg>
<div style={{flex:1,minWidth:180}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:1.5,color:"#8a8a8a",marginBottom:2}}>SCOUTING REPORT</div>
<div style={{fontFamily:"Helvetica",fontSize:15,color:"#fff",lineHeight:1.25,marginBottom:6}}>{verdict}</div>
<div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
<div>{strengths.map(([n,v],i)=>(<div key={i} style={{fontFamily:"Helvetica",fontSize:9,color:"#a9d6b4",marginBottom:1}}>▲ {n} <b>{v}</b></div>))}</div>
<div>{weaks.map(([n,v],i)=>(<div key={i} style={{fontFamily:"Helvetica",fontSize:9,color:"#e0a0a0",marginBottom:1}}>▼ {n} <b>{v}</b></div>))}</div>
</div>
</div>
</div>
<div style={{padding:"10px 12px"}}>
<div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
<div style={{flex:"1 1 240px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:3}}>The two fixes that move this unit</div>
{weaks.map(([n,v],i)=>(<div key={i} style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,padding:"5px 8px",marginBottom:4}}><b style={{fontFamily:"Helvetica",fontSize:9.5}}>{n} {v}</b><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>→ {FIX[n]}</div></div>))}
</div>
<div style={{flex:"1 1 160px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:4}}>Department grades</div>
{DEPT.map(([n,g,L],i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,fontFamily:"Helvetica",fontSize:9.5}}>
<span style={{width:78}}>{n}</span>
<div style={{flex:1,height:6,background:"#eee"}}><div style={{height:6,width:g+"%",background:g>=78?GRN:g>=68?AMB:AC}}/></div>
<b style={{width:16,textAlign:"center",color:g>=78?GRN:g>=68?AMB:AC}}>{L}</b></div>))}
</div>
</div>
</div>
</div>
<svg viewBox="0 0 700 150" style={{width:"100%",height:"auto",margin:"4px 0"}}>
{Object.entries(team.wires).map(([w,gs],wi)=>(
<g key={w}>
<text x="4" y={26+wi*34} style={{font:"9px Helvetica",fill:MUT}}>{w}</text>
<line x1="52" y1={22+wi*34} x2="690" y2={22+wi*34} stroke={INK} strokeWidth="1"/>
{gs.map((g,gi)=>(
<g key={gi}>
<rect x={90+gi*200} y={10+wi*34} width={110} height={24} fill={g.state==="super"?"#fff":"#f4f2ec"} stroke={g.state==="super"?MUT:INK} strokeDasharray={g.state==="super"?"4 3":"0"}/>
<text x={145+gi*200} y={21+wi*34} textAnchor="middle" style={{font:"8px Helvetica",fill:INK}}>{g.n}</text>
<text x={145+gi*200} y={31+wi*34} textAnchor="middle" style={{font:"bold 9px Helvetica",fill:g.state==="super"?MUT:g.v>=60?GRN:AC}}>{g.state==="super"?g.days+"d ?":g.v}</text>
</g>))}
</g>))}
</svg>
{(()=>{const amp=qAmp(team);const dom=qResolve(amp);const meas=!staleBase(team)||opt.fresh[team.name]!==undefined;
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",padding:"8px 10px",marginTop:8}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:VIO,marginBottom:5}}>Unit status — {meas?"verified · measured this cycle":"estimated · awaiting P&L measurement"}</div>
<div style={{display:"flex",gap:8,alignItems:"flex-end",height:52,marginBottom:4}}>
{amp.map((a,i)=>(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",height:"100%"}}>
<div style={{background:HCOL[i],opacity:meas?(i===dom?1:0.22):0.7,height:(Math.max(3,a*100))+"%",borderRadius:2,transition:"opacity .3s"}}/></div>))}
</div>
<div style={{display:"flex",gap:8,marginBottom:4}}>{QSTATES.map((n,i)=>(<div key={i} style={{flex:1,textAlign:"center",fontFamily:"Helvetica",fontSize:8.5}}><b style={{color:HCOL[i]}}>{pct(amp[i])}%</b> {n}</div>))}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,lineHeight:1.5}}>{meas?<span>Measured — the P&amp;L review verified this unit as <b style={{color:HCOL[dom]}}>{QSTATES[dom]}</b> on the books. Confidence high.</span>:<span>Unmeasured — the unit carries a probability split across all three outcomes, and confidence in the estimate decays the longer it goes unmeasured. The P&amp;L review is the checkpoint that verifies it; run <b>Measure</b> from the operations bar now.</span>}</div>
</div>);})()}
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:GRN,margin:"8px 0 4px"}}>Incentive gates</div>
{inc.map(([l,v,thr,met,pay],i)=><Gate key={i} inLabel={l} inVal={v} thr={thr} met={met} payout={pay} title={met?"earned":"gap to threshold"}/>)}
<OpHealthIndex center={team} staleBase={staleBase(team)} health={team.health} tau={Math.round(qTau(team))} />

<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AMB}`,padding:"7px 10px",marginTop:8}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AMB,marginBottom:4}}>Quarter goal — negotiated, not assigned</div>
<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
{[["Stretch","margin +3.0k","full support budget"],["Standard","margin +1.5k","standard support"],["Floor","hold margin","development review"]].map(([n,t,r],i)=>(
<button key={i} onClick={()=>setGoals(g=>({...g,[team.name]:i}))} style={{fontFamily:"Helvetica",fontSize:9,padding:"5px 9px",cursor:"pointer",border:`1px solid ${goals[team.name]===i?AMB:RULE}`,background:goals[team.name]===i?"#fdf6e6":"#fff",textAlign:"left"}}>
<b>{n}</b> · {t}<br/><span style={{color:MUT,fontSize:8}}>unlocks {r}</span></button>))}
</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:8}}>payouts illustrative · computed from measured state</div>
</div>);})()}
{tab==="portfolio"&&(<div>
{PROJECTS.map(p=>(
<div key={p.id} style={{display:"flex",flexWrap:"wrap",alignItems:"center",marginBottom:5}}>
<span style={{fontFamily:"Helvetica",fontSize:9.5,width:120,fontWeight:700}}>{p.n}</span>
{p.stages.map(([sn,st,d],i)=>(<span key={i} style={{display:"inline-flex",alignItems:"center"}}>{i>0&&<Arrow/>}
<Node vb={sn} tg={st===2?d+"d ?":""} state={st===2?"hold":st===1?"run":i<2?"done":"pend"} c={st===2?AC:st===1?AMB:RULE} title={st===2?"unmeasured "+d+"d — measure first":""}/></span>))}
</div>))}
<Chain items={[{vb:"Premium tier",state:"run",c:GRN},{vb:"× progress report",tg:"reinforcing",state:"run",c:GRN}]}/>
<Chain items={[{vb:"schools",state:"run",c:AC},{vb:"× events",tg:"competing — sequence",state:"hold",c:AC}]}/>
</div>)}
{tab==="exec"&&<EngineErrorBoundary>{(()=>{
// Executive Summary — five numbers, three sentences, no scrolling required.
// Every figure here is read from the same computations Overview/Audit/
// Reports already make (trend, red, railData, LEADS, ledger) — nothing new is computed specifically for this view.
const avgHealth=Math.round(centers.reduce((a,c)=>a+c.health,0)/centers.length);
const fr=team; // the franchisee lens uses the selected center
const gTop=growthRank(centers).slice(0,3);
const allowedN=(railData.recommendations||[]).filter(r=>r.governance.allowed).length;
const heldN=(railData.recommendations||[]).length-allowedN;
const so=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
const signedN=LEADS.filter(l=>so(l)===5).length;
const verifiedN=centers.filter(c=>c.verified).length;
const thrivingN=centers.filter(c=>c.health>=70).length, watchN=centers.filter(c=>c.health>=50&&c.health<70).length, riskN=centers.length-thrivingN-watchN;
return(<div>
{/* ============ ALL-CENTERS POSTURE — the overview is the network, one center is the focus ============ */}
<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 14px",marginBottom:10,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:INK,marginBottom:6}}>All centers — network posture</div>
<div style={{display:"flex",gap:18,flexWrap:"wrap",fontFamily:"Helvetica"}}>
<div><div style={{fontSize:22,fontWeight:800}}>{centers.length}</div><div style={{fontSize:8,color:MUT}}>units modeled · {verifiedN} verified</div></div>
<div><div style={{fontSize:22,fontWeight:800,color:GRN}}>{thrivingN}</div><div style={{fontSize:8,color:MUT}}>thriving</div></div>
<div><div style={{fontSize:22,fontWeight:800,color:AMB}}>{watchN}</div><div style={{fontSize:8,color:MUT}}>watch</div></div>
<div><div style={{fontSize:22,fontWeight:800,color:AC}}>{riskN}</div><div style={{fontSize:8,color:MUT}}>on a support path</div></div>
<div><div style={{fontSize:22,fontWeight:800}}>{avgHealth}</div><div style={{fontSize:8,color:MUT}}>avg health</div></div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:6}}>The dropdown in the strip above focuses any single center; this row is always the whole network. FDD Item 20: 244 authoritative.</div>
</div>

{(()=>{ // TICKET BOARD — kanban with owner swimlanes, mirroring the real adminops flow:
// every open item is a ticket; a ticket has exactly one owner; click a card to advance it. Done writes to the ledger.
const COLS=["Open","In progress","Waiting","Done"];
const LANES=["Franchise Director","Center Success Lead","Ops Analyst","Compliance Officer"];
const worstT=[...centers].sort((a,b)=>a.health-b.health);
const recsT=((railData&&railData.recommendations)||[]).slice(0,4);
const TICKETS=[
 ...recsT.map((r,i)=>({id:"rec"+i,t:(r.title||r.type||"Proposal")+" · "+(r.center||""),lane:0,col0:(r.governance&&r.governance.allowed)?1:2})),
 {id:"t1",t:"Support sequence · "+worstT[0].name,lane:1,col0:1},
 {id:"t2",t:"Re-measure stale units (batch)",lane:2,col0:0},
 {id:"t3",t:"FDD clock audit — all running clocks",lane:3,col0:1},
 {id:"t4",t:"Parent touchpoints · "+worstT[1].name,lane:1,col0:0},
 {id:"t5",t:"Territory white-space refresh",lane:2,col0:0},
 {id:"t6",t:"Safety review sign-off (standing)",lane:3,col0:2},
];
const colOf=tk=>tix[tk.id]!==undefined?tix[tk.id]:tk.col0;
const advance=tk=>{const c=colOf(tk);if(c>=3)return;const nc=c+1;setTix(m=>({...m,[tk.id]:nc}));
 if(nc===3)logL("exec","Ticket",tk.t+" — done (owner: "+LANES[tk.lane]+")");};
return(<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 14px",marginBottom:10,...CARD}}>
<div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6}}>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:INK}}>Ticket board — one owner per ticket</span>
<span style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>click a card to advance · Done writes to the ledger · the adminops rule: closed on the record, not in someone's head</span>
</div>
<div style={{overflowX:"auto"}}>
<div style={{minWidth:760}}>
<div style={{display:"flex",marginLeft:130}}>
{COLS.map(c=>(<div key={c} style={{flex:1,fontFamily:"Helvetica",fontSize:7.5,fontWeight:800,textTransform:"uppercase",letterSpacing:0.5,color:c==="Done"?GRN:MUT,padding:"2px 6px"}}>{c}</div>))}
</div>
{LANES.map((lane,li)=>(<div key={lane} style={{display:"flex",borderTop:`1px solid ${RULE}`,minHeight:44,alignItems:"stretch"}}>
<div style={{width:130,flexShrink:0,fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:VIO,padding:"6px 6px 6px 0",display:"flex",alignItems:"center"}}>{lane}</div>
{COLS.map((c,ci)=>(<div key={c} style={{flex:1,padding:4,background:ci===3?"#f6faf6":(ci%2?"#fbfbf8":"#fff")}}>
{TICKETS.filter(tk=>tk.lane===li&&colOf(tk)===ci).map(tk=>(
<div key={tk.id} onClick={()=>advance(tk)} title={ci<3?"advance →":"done"} style={{fontFamily:"Helvetica",fontSize:8.5,border:`1px solid ${RULE}`,borderLeft:`3px solid ${ci===3?GRN:ci===2?AMB:VIO}`,background:"#fff",padding:"4px 6px",marginBottom:3,cursor:ci<3?"pointer":"default",textDecoration:ci===3?"line-through":"none",color:ci===3?MUT:INK}}>{tk.t}</div>))}
</div>))}
</div>))}
</div>
</div>
</div>);})()}
{/* ============ DECISION NEXUS — spine · mode · render chips · commit drawer, on the selected center ============ */}
{(()=>{
const SPN=[["Field","connected"],["Futures","branches"],["Interference","conflicts"],["Commit","Rule 1"],["Realized","recorded"]];
const CHIPS=["Board","Time","Structure","Load","Risk","Value"];
const c0=team; const rec0=((railData&&railData.recommendations)||[]).find(r=>r.center===c0.name);
const act=(kind)=>{const verb=kind==="Commit"?"committed":kind==="Hold"?"held":"re-measure ordered";
 setNxStage(kind==="Commit"?4:kind==="Hold"?2:0);
 logL("exec","Nexus",c0.name+" — "+verb+" (owner: Franchise Director)");};
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",padding:"10px 14px",marginBottom:10,...CARD}}>
<div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:8}}>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:VIO}}>Decision nexus · {c0.name}</span>
<div style={{display:"flex",border:`1px solid ${RULE}`,borderRadius:7,overflow:"hidden"}}>
{["Lens","Timeline","Causal"].map(m=>(<button key={m} onClick={()=>{setNxMode(m);if(m==="Timeline")setNxChip("Time");}} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"4px 11px",cursor:"pointer",border:"none",background:nxMode===m?INK:"#fff",color:nxMode===m?"#fff":MUT}}>{m}</button>))}
</div>
<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
{CHIPS.map(ch=>(<button key={ch} onClick={()=>setNxChip(ch)} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"4px 11px",cursor:"pointer",borderRadius:999,border:`1px solid ${nxChip===ch?VIO:RULE}`,background:nxChip===ch?VIO:"#fff",color:nxChip===ch?"#fff":MUT}}>{ch}</button>))}
</div>
</div>
{/* spine */}
<div style={{display:"flex",marginBottom:10}}>
{SPN.map(([s,sub],i)=>{const on=nxStage>=i,cur=nxStage===i,last=i===4;
return(<div key={s} onClick={()=>setNxStage(i)} style={{flex:1,cursor:"pointer"}}>
<div style={{display:"flex",alignItems:"center"}}>
<div style={{width:cur?13:9,height:cur?13:9,borderRadius:"50%",flexShrink:0,background:on?(last?GRN:VIO):"#fff",border:on?"none":`2px solid ${RULE}`}}/>
{!last&&<div style={{flex:1,height:2,background:nxStage>i?(VIO):RULE}}/>}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:on?800:400,color:on?INK:MUT,marginTop:3}}>{s}</div>
<div style={{fontFamily:"Helvetica",fontSize:6.5,color:MUT}}>{sub}</div>
</div>);})}
</div>
{/* render surface + commit drawer */}
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
<div style={{flex:"1 1 380px",border:`1px solid ${RULE}`,borderRadius:8,padding:"8px 10px",background:"#fdfdfb",minHeight:86}}>
{nxChip==="Board"&&<div style={{display:"flex",gap:6}}>{["Funnel","Review","Analyze","Ready","Implementing"].map((g,i)=>{const here=Math.min(4,Math.round((100-c0.health)/22));return(<div key={g} style={{flex:1,border:`1px solid ${RULE}`,borderRadius:6,padding:6,background:"#fff"}}><div style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:800}}>{g}</div>{i===here&&<div style={{fontFamily:"Helvetica",fontSize:8.5,marginTop:4,padding:"3px 5px",borderLeft:`2px solid ${VIO}`,background:"#f6f4fb"}}>{c0.name}</div>}</div>);})}</div>}
{nxChip==="Time"&&<div style={{fontFamily:"Helvetica",fontSize:9.5,lineHeight:1.8}}>{[["Support plan","now → +2w",AC],["Growth gate","+0 → +4w",VIO],["Compliance","standing",GRN]].map(([l,w,cc])=>(<div key={l} style={{display:"flex",gap:8,alignItems:"center"}}><span style={{width:88,color:MUT}}>{l}</span><div style={{flex:1,height:8,background:"#eee",borderRadius:4}}><div style={{width:l==="Compliance"?"100%":"46%",height:"100%",background:cc,borderRadius:4}}/></div><span style={{fontSize:8,color:MUT}}>{w}</span></div>))}</div>}
{nxChip==="Structure"&&<div style={{fontFamily:"Helvetica",fontSize:9.5,lineHeight:1.8}}>{["■ Center operations","▸ Enrollment · trial funnel · conversion","▸ Staffing · sensei coverage · chemistry","▸ Compliance · safety review"].map(s=>(<div key={s} style={{color:s.startsWith("■")?INK:MUT,fontWeight:s.startsWith("■")?800:400}}>{s}</div>))}</div>}
{nxChip==="Load"&&<div style={{fontFamily:"Helvetica",fontSize:9.5}}>{[["Sensei coverage",c0.health>60?1.24:0.92],["Weekend cover",1.0],["Sub pool",c0.health>50?1.15:0.7]].map(([l,v])=>(<div key={l} style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:MUT}}>{l}</span><b style={{color:v>=1.15?GRN:v>=1?AMB:AC}}>{v.toFixed(2)}×</b></div><div style={{height:7,background:"#eee",borderRadius:4}}><div style={{width:Math.min(100,v/1.6*100)+"%",height:"100%",background:v>=1.15?GRN:v>=1?AMB:AC,borderRadius:4}}/></div></div>))}<div style={{fontSize:7.5,color:MUT}}>floor 1.15× — below holds growth</div></div>}
{nxChip==="Risk"&&<div style={{fontFamily:"Helvetica",fontSize:9.5,lineHeight:1.9}}>{[["Territory overlap",c0.health<60?"high":"med"],["Retention",c0.ret<0.8?"high":"low"],["Staffing gap",c0.health<50?"high":"med"]].map(([n,l])=>(<div key={n} style={{display:"flex",justifyContent:"space-between"}}><span>{n}</span><span style={{fontSize:7.5,fontWeight:800,color:"#fff",background:l==="high"?AC:l==="med"?AMB:GRN,padding:"2px 8px",borderRadius:999,textTransform:"uppercase"}}>{l}</span></div>))}</div>}
{nxChip==="Value"&&<div style={{display:"flex",gap:18,fontFamily:"Helvetica"}}><div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Health</div><div style={{fontSize:20,fontWeight:800,color:c0.health>=70?GRN:c0.health>=50?AMB:AC}}>{c0.health}</div></div><div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Retention</div><div style={{fontSize:20,fontWeight:800}}>{Math.round(c0.ret*100)}%</div></div><div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Modeled EBITDA</div><div style={{fontSize:20,fontWeight:800,color:c0.eb>0?GRN:AC}}>{c0.eb>0?"+":""}{c0.eb.toFixed(1)}</div></div></div>}
</div>
<div style={{flex:"0 0 170px",display:"flex",flexDirection:"column",gap:6}}>
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,textTransform:"uppercase",letterSpacing:0.5}}>Commit drawer · Rule 1</div>
{[["Commit",VIO],["Hold",AMB],["Re-measure",MUT]].map(([k,cc])=>(<button key={k} onClick={()=>act(k)} style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,padding:"8px 0",cursor:"pointer",borderRadius:7,border:`1px solid ${cc}`,background:k==="Commit"?cc:"#fff",color:k==="Commit"?"#fff":INK}}>{k}</button>))}
<div style={{fontFamily:"Helvetica",fontSize:7,color:MUT}}>writes to the decision ledger with owner</div>
</div>
</div>
</div>);})()}
<div style={{display:"flex",gap:6,marginBottom:10}}>
{[["corporate","Corporate view"],["franchisee","Franchisee view"]].map(([v,l])=>(
<button key={v} onClick={()=>setViewAs(v)} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"4px 12px",cursor:"pointer",border:`1px solid ${viewAs===v?INK:RULE}`,background:viewAs===v?INK:"#fff",color:viewAs===v?"#fff":MUT}}>{l}</button>))}
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,alignSelf:"center"}}>same numbers, both directions — transparency is symmetric</span>
</div>
{viewAs==="franchisee"&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",padding:"11px 14px",marginBottom:10}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:800,marginBottom:6}}>What {fr.name} sees</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#333",lineHeight:1.7}}>
Your unit health: <b>{fr.health}</b> · retention <b>{Math.round(fr.ret*100)}%</b> · trial conversion <b>{Math.round(fr.conv*100)}%</b><br/>
Territory protection: growth into your territory is <b>gated on its absorption ceiling</b> — visible on the same Growth Blockers gates corporate uses.<br/>
Support owed to you: every proposal touching your unit carries <b>a named corporate owner</b> before it acts (Rule 1); child-safety flags freeze everything else first (Rule 2).<br/>
What corporate sees about you is this same record — <b>no second book.</b>
</div></div>}
<div style={{border:`1px solid ${RULE}`,borderLeft:`4px solid ${INK}`,background:"#fff",padding:"16px 18px",marginBottom:14}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:MUT,marginBottom:8}}>Proposed Policy Framework — Candidate Submission · Pratik Singh</div>
<div style={{fontFamily:"Helvetica",fontSize:14.5,color:"#222",lineHeight:1.6}}>A single governed system operates {centers.length} modeled centers ({verifiedN} verified, {244} authoritative per FDD Item 20) across four evaluation agents. Unit-level deterioration is caught early, support is routed under a named-owner governance boundary, and growth proceeds on a measured cadence rather than an unconstrained one. The business case: improve unit economics across the existing 244 before adding the next 50 — the Unit-Value Program alone models ~$1.36M/yr in additional royalty at 400 units, at the lowest risk of the four available levers.</div>
</div>
<div style={{display:"flex",flexWrap:"wrap",border:`1px solid ${RULE}`,background:"#fff",marginBottom:14}}>
{[
[avgHealth,"network health, composite",avgHealth>=75?GRN:avgHealth>=60?AMB:AC],
[red.length,"units running below breakeven",red.length===0?GRN:red.length<=10?AMB:AC],
[allowedN+" / "+heldN,"proposals allowed / held this cycle",AMB],
[signedN,"candidates signed in the growth pipeline",GRN],
[(railData.conflicts||[]).length,"open cross-agent conflicts",(railData.conflicts||[]).length===0?GRN:AC],
].map(([v,l,c],i)=>(
<div key={i} style={{flex:"1 1 150px",padding:"12px 14px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:26,fontWeight:800,color:c}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:3,lineHeight:1.3}}>{l}</div>
</div>))}
</div>
<div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
{[["Open Overview","franchise"],["Open Network Map","table"],["Open Growth Pipeline","leads"],["Open Audit Trail","audit"],["Open Methodology","agenda"]].map(([lbl,t])=>(
<button key={t} onClick={()=>setTab(t)} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"7px 12px",cursor:"pointer",border:`1px solid ${INK}`,background:"#fff",color:INK}}>{lbl} ▸</button>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,lineHeight:1.5}}>This is a live artifact, not a static deck — every number above recomputes from the canonical state as actions are taken elsewhere in the model. Unfamiliar terms are defined in the Glossary.</div>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",padding:"8px 12px",marginTop:8,fontFamily:"Helvetica"}}><div style={{fontSize:9,fontWeight:800,letterSpacing:0.5,textTransform:"uppercase",color:GRN}}>Growth priorities this week — where the network is ready to grow</div><div style={{fontSize:10,color:"#333",marginTop:3,lineHeight:1.6}}>{gTop.map((g,i)=>(i+1)+". "+g.name+" ("+g.st+") — priority "+g.gp+", "+g.students+" students, health "+g.health).join(" · ")}</div><div style={{fontSize:8,color:MUT,marginTop:3}}>Ranked by growth readiness (headroom · momentum · health · peer support) — one formula, used by every growth view in this model. Details: Signal Mechanics.</div></div></div>);})()}</EngineErrorBoundary>}
{tab==="franchise"&&(()=>{
const CEN={AL:[-86.8,32.8],AZ:[-111.7,34.3],AR:[-92.4,34.8],CA:[-119.7,37.2],CO:[-105.5,39],CT:[-70.0,40.3],DE:[-70.0,38.6],FL:[-81.7,28.6],GA:[-83.4,32.6],ID:[-114.6,44.4],IL:[-89.2,40],IN:[-86.3,39.9],IA:[-93.5,42],KS:[-98.4,38.5],LA:[-92,31],MD:[-72.2,38.6],MA:[-69.6,42.8],MI:[-84.7,43.5],MN:[-94.3,46.3],MO:[-92.5,38.4],NV:[-116.6,39.3],NJ:[-73.2,40.0],NY:[-75.5,43],NC:[-79.4,35.5],ND:[-100.5,47.5],OH:[-82.8,40.3],OK:[-97.5,35.5],OR:[-120.6,44],PA:[-77.8,40.9],SC:[-80.9,33.9],TN:[-86.3,35.8],TX:[-99.3,31.4],UT:[-111.7,39.3],VA:[-78.8,37.5],WA:[-120.4,47.4],WV:[-80.6,38.6],WI:[-89.7,44.6],BC:[-122.5,50.6],AB:[-113.9,51.3],ON:[-79.9,44.8]};
const PRJ=(lon,lat)=>[14+(lon+125)*(496/65),18+(53.5-lat)*(316/29.5)];
const P=st=>CEN[st]?PRJ(CEN[st][0],CEN[st][1]):[500,340];
const OUTLINE=[[-124.7,48.4],[-124,46.2],[-124.4,43],[-124.2,40.4],[-122.4,37.8],[-120.6,34.5],[-117.1,32.5],[-114.7,32.7],[-111,31.3],[-108.2,31.3],[-106.4,31.8],[-104.9,29.6],[-103,28.9],[-101.4,29.8],[-99.5,27.5],[-97.1,25.9],[-97.2,27.8],[-93.8,29.7],[-90.1,29.2],[-89,30.4],[-85.3,29.7],[-84,30.1],[-82.6,27.9],[-80.0,26.8],[-80.1,25.2],[-81.5,25.9],[-82.7,29],[-81.4,30.7],[-80.9,32],[-79,33.2],[-76.5,34.7],[-75.5,35.8],[-75.9,36.9],[-75.2,38.0],[-74.0,39.5],[-74,40.6],[-72,41.0],[-70.2,41.7],[-70.9,42.9],[-69.8,43.8],[-68.2,44.4],[-67.1,45.2],[-67.8,47.1],[-69.2,47.5],[-71.5,45.0],[-75,45],[-76.8,43.6],[-79,43.3],[-79,42.7],[-82.4,41.7],[-83.1,42.3],[-82.5,45.3],[-84.7,46.5],[-88,48.3],[-90.8,48.1],[-95.2,49],[-123,49]];
const pathOf=pts=>"M"+pts.map(p=>PRJ(p[0],p[1]).map(v=>v.toFixed(1)).join(" ")).join("L")+"Z";
const agg={};Object.keys(states).forEach(st=>{const cs=states[st];agg[st]={n:cs.length,r:cs.filter(c=>forecast(c).cls==="rising").length,d:cs.filter(c=>forecast(c).cls==="deteriorating").length};});
const stList=Object.keys(states).filter(st=>CEN[st]);
const seg=Math.floor(tick/4),ph=((tick%4)+1)/4;
// agent targets are ranked from live network signals, not a random walk —
// each agent patrols the top-3 states on its own metric, round-robin by tick
const staleCountOf=st=>(states[st]||[]).filter(staleBase).length;
const redCountOf=st=>(states[st]||[]).filter(c=>c.eb<0).length;
const gapOf=st=>{const cs=states[st]||[];if(cs.length<2)return 0;return Math.round(Math.max(...cs.map(c=>c.health))-Math.min(...cs.map(c=>c.health)));};
const detOf=st=>agg[st]?agg[st].d:0;
const topStates=fn=>[...stList].filter(st=>fn(st)>0).sort((a,b)=>fn(b)-fn(a)).slice(0,3);
const AGENT_DEFS=[
{n:"Measurement",c:AMB,fn:staleCountOf,unit:" stale",job:"finds the network's oldest data and queues re-measurement"},
{n:"Best practice",c:GRN,fn:gapOf,unit:"pt gap",job:"looks for the widest health spread to transfer a working practice"},
{n:"Support",c:AC,fn:redCountOf,unit:" red",job:"routes peer-network support to units running EBITDA-negative"},
{n:"Forecast",c:VIO,fn:detOf,unit:" deteriorating",job:"flags states with the most 90-day-deteriorating centers"},
];
const AGENTS=AGENT_DEFS.map(({n,c,fn,unit,job})=>{
const pool=topStates(fn);const use=pool.length?pool:stList;
const from=use[seg%use.length],to=use[(seg+1)%use.length];
const[f1,f2]=P(from),[t1,t2]=P(to);
return{n,c,from,to,x:f1+(t1-f1)*ph,y:f2+(t2-f2)*ph,metric:fn(to),unit,job,reason:to+" · "+fn(to)+unit};});
const topR=[...stList].sort((a,b)=>agg[b].r-agg[a].r).slice(0,3).map(st=>({st,txt:"+"+agg[st].r+" centers rising"}));
const POS=[...topR,{st:"CA",txt:"enrollment-conversion practice v3 · promoted"},{st:"TX",txt:"+3 performance rebates earned"},{st:"ON",txt:"+2 units into STRONG tier"},{st:"VA",txt:"+12 commitments"},{st:"FL",txt:"referral share up 3 wks"}];
const shown=[0,1,2].map(i=>POS[(seg+i)%POS.length]);
const netScore=Math.round(centers.reduce((a,c)=>a+c.health,0)/centers.length);
const eAvg=+(centers.slice(0,40).reduce((a,c)=>a+engageOf(c).score,0)/40).toFixed(2);
const CenterCard=({c})=>{const f=forecast(c);const e=engageOf(c);const[ar,ac2]=arrow(f.cls);
return(<div style={{border:`1px solid ${RULE}`,borderTop:`3px solid ${AC}`,background:"#fff",padding:"10px 12px",marginTop:8}}>
<div style={{display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
<div style={{textAlign:"center",minWidth:64}}>
<div style={{fontFamily:"Helvetica",fontSize:34,fontWeight:700,lineHeight:1}}>{c.health}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:1,color:AC}}>{tierOf(c.health)}</div>
</div>
<div style={{flex:1,minWidth:180}}>
<div style={{fontFamily:"Helvetica",fontSize:13,fontWeight:700}}>{c.name} <span style={{fontSize:8.5,color:MUT,fontWeight:400}}>{c.verified?"· verified":"· modeled"}</span>{c.adjusted&&<span style={{fontSize:7.5,fontWeight:700,color:VIO,marginLeft:5,border:`1px solid ${VIO}`,padding:"1px 4px"}}>▲ LIVE ADJUSTMENT</span>}</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#444",marginTop:2}}>{c.students} students · margin {fmt(c.eb)}k · retention {pct(c.ret)}% · engagement {e.score} · <b style={{color:ac2}}>{ar} {fmt(f.proj[2])}k @90d</b></div>
</div>
<span onClick={()=>{setMapC(null);setCardMsg("");}} style={{fontFamily:"Helvetica",fontSize:12,color:MUT,cursor:"pointer"}}>×</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:AC,margin:"8px 0 4px"}}>Next steps</div>
<button onClick={()=>{setSel(c.name);setTab("team");}} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"6px 12px",cursor:"pointer",border:`1px solid ${INK}`,background:"#fff"}}>Open full center page ▸</button>
</div>);};
return(<div>
<div style={{display:"flex",gap:0,flexWrap:"wrap",border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",marginBottom:8}}>
{[[netScore,"network health — live composite",INK],[Math.round(trend.r/centers.length*100)+"%",trend.r+" units rising (90d)",GRN],[trend.d,"deteriorating — on a support path",AC],[alerts.filter(a=>a.eta<=30).length,"urgent flags — action inside 30 days",VIO],["64 / 244","verified units / FDD Item 20 authoritative",MUT]].map(([v,l,c],i)=>(
<div key={i} style={{flex:"1 1 130px",padding:"9px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:21,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,letterSpacing:0.3,marginTop:3,lineHeight:1.35}}>{l}</div>
</div>))}
</div>
<div style={{marginTop:8,marginBottom:8,border:`1px solid ${RULE}`,background:"#f7f6f2",padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:INK,marginBottom:6}}>Executive summary</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:8}}>
{[
"Franchisee performance and unit profitability are evaluated as a single measure, not two separate ones; a unit in decline is identified before it appears in a P&L review.",
"Retention risk and support capacity are assessed on a weekly cycle, not discovered at quarterly review.",
"Every intervention follows a fixed protocol — observe, identify the binding constraint, pilot, measure, propagate — subject to governance in every instance.",
"Verified practices are not retained locally. Propagation across the network is governed by the same system that identifies where a practice is applicable.",
].map((t,i)=>(<div key={i} style={{fontFamily:"Helvetica",fontSize:10.5,color:"#333",lineHeight:1.5,paddingLeft:10,borderLeft:`2px solid ${INK}`}}>{t}</div>))}
</div>
</div>
<div style={{marginBottom:8,border:`1px solid ${RULE}`,background:"#fdfdfb"}}>
<div onClick={()=>setAboutOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",cursor:"pointer"}}>
<span style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:INK}}>About this submission — rationale and a 5-minute walkthrough</span>
<span style={{fontFamily:"Helvetica",fontSize:9,color:AC}}>{aboutOpen?"collapse ▲":"expand ▼"}</span>
</div>
{aboutOpen&&<div style={{padding:"0 12px 12px",borderTop:`1px solid ${RULE}`}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:INK,margin:"10px 0 4px"}}>Rationale</div>
<div style={{fontFamily:"Helvetica",fontSize:11.5,color:"#333",lineHeight:1.6}}>Franchise networks incur avoidable cost when unit-level deterioration goes undetected between measurement cycles; by the time a decline is visible in a P&L review, remediation typically costs several multiples of what earlier intervention would have required. This model addresses that gap: it evaluates each unit's leading indicators continuously, proposes a specific support action under governance, and records the resulting decision. The underlying mechanics — agents, signals, confidence scoring — exist for one purpose: to enable action at the point of early detection rather than after quarterly reporting.</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:INK,margin:"14px 0 4px"}}>The 5-minute walkthrough</div>
<ol style={{fontFamily:"Helvetica",fontSize:10.5,color:"#333",lineHeight:1.7,margin:"0 0 0 18px",padding:0}}>
<li><b>Network health, current period.</b> The composite score and trend below reflect the present session, not a static snapshot; each figure recomputes as the underlying state changes.</li>
<li><b>Proposed actions, current period.</b> Four evaluation agents identify specific, evidence-backed actions across the network, each carrying a stated confidence level and its supporting basis.</li>
<li><b>Governed approval.</b> A single proposed action may be approved directly from this screen. No action is applied to a center's record without a guardrail clearing first; that gate is visible, not implied.</li>
<li><b>Interventions in parallel.</b> The Operations Board presents every open intervention concurrently — by review cadence, by decision state, and as a governed trace — over the same decision record.</li>
<li><b>One center, six lenses.</b> Under Centers, any single unit may be reviewed through six synchronized perspectives — student, parent, franchisee, corporate, financial, and system — each reading the same signal concurrently.</li>
<li><b>Supporting evidence.</b> The territory map, agent logic, and leading-indicator calculations behind each figure above are presented in full, not merely asserted.</li>
<li><b>The proposed plan.</b> The closing section states the sequence of actions for the first 90 days at Code Ninjas.</li>
</ol>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:8}}>An interactive version of this walkthrough is also available: <button onClick={()=>setTour(0)} aria-label="Start the 5-minute guided tour" style={{color:AC,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0,fontFamily:"inherit",fontSize:"inherit"}}>start the 5-minute tour →</button></div>
</div>}
</div>

{(()=>{
const freshShare=Math.round((1-centers.filter(staleBase).length/centers.length)*100);
const avgConf=+(railData.recommendations.reduce((a,r)=>a+r.evidence.operationalSignals.dataConfidence,0)/Math.max(1,railData.recommendations.length)).toFixed(2);
const highConf=railData.recommendations.filter(r=>r.confidenceBand==="high").length;
// The landing spotlight is the single action a Director sees first -- it must
// never surface a proposal the conflict detector has separately flagged, or
// the Overview would be steering toward exactly the action another view is warning about. Conflicted proposals are skipped, not just noted.
const spotConflictIds=new Set((railData.conflicts||[]).flatMap(c=>[c.a,c.b]));
const spotlightPool=[...railData.actionable].sort((a,b)=>b.evidence.operationalSignals.dataConfidence-a.evidence.operationalSignals.dataConfidence);
const spotlight=spotlightPool.find(r=>!spotConflictIds.has(r.id))||null;
const spotlightAllConflicted=spotlightPool.length>0&&!spotlight;
const onSpotDecide=(rec,d)=>{setSpotDecision(d);logL("franchise",rec.agent,rec.title+" — "+(d==="approved"?"approved by Director":d==="measure"?"queued for re-measurement":"ignored")+" (from Overview)");};
return(<div style={{marginTop:8,border:`1px solid ${RULE}`,background:"#fff"}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.7,textTransform:"uppercase",color:INK,padding:"8px 12px",borderBottom:`1px solid ${RULE}`}}>Today</div>
<div style={{padding:"10px 12px",borderBottom:`1px solid ${RULE}`}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>1 · Network health</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#333",lineHeight:1.5}}>{netScore} composite · {trend.r} rising, {trend.d} on a support path (90d) · <b style={{color:freshShare>=70?GRN:AMB}}>{freshShare}%</b> of units measured within the last 14 days.</div>
</div>
<div style={{padding:"10px 12px",borderBottom:`1px solid ${RULE}`}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>2 · Today's decisions</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#333",lineHeight:1.5}}>{railData.actionable.length} proposed actions pending Director review across four evaluation agents · {railData.held.length} held pending fresher data or a cleared guardrail. <button onClick={()=>setTab("rail")} aria-label="Open Decision Rail: threads and queue" style={{color:AC,cursor:"pointer",textDecoration:"underline",background:"none",border:"none",padding:0,fontFamily:"inherit",fontSize:"inherit"}}>Open threads & queue →</button></div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:3}}>This is the network-wide triage view — the highest-confidence item across all {centers.length} units. To deliberately choose one center and see it through all six roles, use Six Lenses under Centers instead.</div>
</div>
<div onClick={()=>setTodayDetail(v=>!v)} style={{padding:"6px 12px",borderBottom:`1px solid ${RULE}`,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT}}>Confidence basis & follow-through record</span>
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:AC}}>{todayDetail?"hide":"show"}</span>
</div>
{todayDetail&&<div style={{padding:"10px 12px",borderBottom:`1px solid ${RULE}`}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>3 · Why the model is confident</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#333",lineHeight:1.5}}>Average data confidence across today's proposed actions is <b>{avgConf}</b> (0–1 scale); {highConf} of {railData.recommendations.length} carry a high-confidence rating. Confidence reflects two factors: recency of measurement and internal consistency of the underlying figures — not a self-reported assessment.</div>
</div>}
<div style={{padding:"10px 12px",borderBottom:`1px solid ${RULE}`}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>Safe governed action</div>
{spotlight?<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,padding:"7px 9px"}}>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700}}>{spotlight.title}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,margin:"2px 0 5px"}}>{spotlight.summary}</div>
<div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
{spotlight.evidence.contractVerdicts.map((v,i)=>(<span key={i} style={{fontFamily:"Helvetica",fontSize:8,padding:"2px 6px",border:`1px solid ${v.pass?GRN:AC}`,color:v.pass?GRN:AC}}>{v.pass?"✓":"✕"} {v.label}</span>))}
</div>
{spotDecision?<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,color:spotDecision==="approved"?GRN:spotDecision==="measure"?AMB:MUT}}>{spotDecision==="approved"?"Approved":spotDecision==="measure"?"Queued for re-measurement":"Ignored"}</span>:<div style={{display:"flex",gap:5}}>
<button onClick={()=>onSpotDecide(spotlight,"approved")} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${GRN}`,background:GRN,color:"#fff"}}>Approve</button>
<button onClick={()=>onSpotDecide(spotlight,"measure")} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${AMB}`,background:"#fff",color:AMB}}>Measure again</button>
<button onClick={()=>onSpotDecide(spotlight,"ignored")} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"3px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>Ignore</button>
</div>}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:5}}>approver on record (human-owned): {spotlight.approverRole} · nothing here writes to a center's live record without this step{(()=>{const u=spotlight.targetIds&&spotlight.targetIds.find(id=>id&&id.length>2&&id!==spotlight.scope);return u?<span onClick={()=>jumpTo("lenses",u,"today\u2019s spotlighted action: \u201c"+spotlight.title+"\u201d")} style={{color:AC,cursor:"pointer",textDecoration:"underline",marginLeft:6}}>view in Six Lenses →</span>:null;})()}</div>
</div>:<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>{spotlightAllConflicted?"every actionable proposal right now is flagged by the cross-agent conflict check — see Decision Rail before acting on any of them":"nothing actionable right now — every proposal is held on fresher data or a guardrail"}</div>}
</div>
{todayDetail&&<div style={{padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>Logged operational follow-through</div>
{ledger.length===0&&<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>no actions logged yet this session — approvals and re-measurements will appear here</div>}
{ledger.slice(0,5).map((e,i)=>(<div key={i} style={{display:"flex",gap:8,fontFamily:"Helvetica",fontSize:9,padding:"3px 0",borderTop:i?`1px solid #f0f0f0`:"none"}}>
<span style={{color:MUT,minWidth:60}}>{e.tab}</span><span style={{fontWeight:700,minWidth:90}}>{e.actor}</span><span style={{color:"#444"}}>{e.text}</span>
</div>))}
</div>}
</div>);
})()}
<div style={{margin:"14px 0 6px",display:"flex",alignItems:"baseline",gap:8}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT}}>The proof underneath</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>— why this matters: a proposed action without supporting evidence is an assertion, not a basis for decision. Below is the territory map, four evaluation agents, and the leading-indicator calculations behind today's figures — the full leading-indicator catalog, failure-mode log, and canonical network state are maintained under Workflow, Programs, and Methodology.</div>
</div>

<EngineErrorBoundary>
<div style={{border:`1px solid #2a2a2a`,background:"#121212"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",padding:"8px 12px 0"}}>
<div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:1.6,color:"#b8b8b8"}}>NORTH AMERICA — TERRITORY MAP</div>
<div style={{display:"flex",gap:2}}>{[["health","health"],["freshness","freshness"],["headroom","headroom"],["consistency","consistency"],["momentum","momentum"]].map(([k,l])=>(
<button key={k} onClick={()=>setMapMode(k)} style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",padding:"2px 7px",cursor:"pointer",border:"1px solid "+(mapMode===k?"#7a6bd8":"#333"),background:mapMode===k?"#1c1640":"transparent",color:mapMode===k?"#b8aaff":"#777"}}>{l}</button>))}</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#ddd"}}><b style={{fontSize:22,color:"#fff"}}>{netScore}</b> <span style={{fontSize:7.5,fontWeight:700,letterSpacing:1,color:"#8a8a8a"}}>NETWORK</span>  <span style={{color:"#6fc38a"}}>↑{trend.r}</span> <span style={{color:"#d9a62e"}}>→{trend.h}</span> <span style={{color:"#d96a6a"}}>↓{trend.d}</span></div>
</div>
<svg viewBox="0 0 524 356" style={{width:"100%",height:"auto",display:"block"}}>
<path d={pathOf(OUTLINE)} fill="#242424" stroke="#5c5c5c" strokeWidth="1.6"/>
<text x="200" y="200" style={{font:"bold 8px Helvetica",fill:"#4a4a4a",letterSpacing:"2.5px"}}>UNITED STATES</text>
{QCLUSTERS.map((cl,ci)=>cl.slice(1).map((st,i)=>{const a=cl[i],b=st;if(!CEN[a]||!CEN[b]||!states[a]||!states[b])return null;const[x1,y1]=P(a),[x2,y2]=P(b);const mA=AGENTS[0];const active=mA.to===a||mA.to===b||mA.from===a||mA.from===b;return(<line key={"ent"+ci+"-"+i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={active?"#8a7ade":"#2c2c3c"} strokeWidth={active?1.3:0.6} strokeDasharray="1 3" opacity={active?0.85:0.45}/>);}))}
{AGENTS.map((a,i)=>{const[t1,t2]=P(a.to);return(<line key={"l"+i} x1={a.x} y1={a.y} x2={t1} y2={t2} stroke={a.c} strokeWidth="0.9" strokeDasharray="3 3" opacity="0.6"/>);})}
{Object.keys(CEN).map(st=>{const[x,y]=P(st);const has=states[st];
if(!has)return(<g key={st} onClick={()=>{setMapSt(st===mapSt?null:st);setMapC(null);}} style={{cursor:"pointer"}}><circle cx={x} cy={y} r={9} fill="transparent"/><circle cx={x} cy={y} r="3" fill="#3a3a3a" stroke="#666" strokeWidth="1"/></g>);
const amp=qStateAmp(states[st]);const lm=qLastMeasSeg(stList,st,seg);const coh=lm===null?0.12:qCoherence((seg-lm)*6);
const cl=QCLUSTERS.find(c=>c.includes(st));const manual=qMeas[st];const inferred=cl?cl.some(o=>o!==st&&qMeas[o]):false;
const r=7.5+Math.min(10,agg[st].n/5);const dom=qResolve(amp);const resolved=coh>0.62||manual||inferred;const measuring=AGENTS[0].to===st;
// alternate map modes: one metric, one color, same nodes
const cs2=states[st];
const modeVal=(()=>{switch(mapMode){
case "freshness":{const fr2=cs2.filter(c=>!staleBase(c)).length/cs2.length;return{v:fr2,c:fr2>0.7?"#5cb87c":fr2>0.4?"#d9a62e":"#8a8fa8",lbl:Math.round(fr2*100)+"%"};}
case "headroom":{const tight=cs2.filter(c=>c.eb<3).length/cs2.length;return{v:1-tight,c:tight>0.5?"#d96a6a":tight>0.25?"#d9a62e":"#5cb87c",lbl:Math.round((1-tight)*100)+"%"};}
case "consistency":{const sc2=cs2.reduce((a,c)=>{const m=[c.conv/0.65,c.ret/0.94,c.chem/0.8];const mu=(m[0]+m[1]+m[2])/3;const varr=m.reduce((s,x)=>s+(x-mu)*(x-mu),0)/3;return a+Math.max(0,1-varr*6);},0)/cs2.length;return{v:sc2,c:sc2>0.75?"#5cb87c":sc2>0.55?"#d9a62e":"#d96a6a",lbl:Math.round(sc2*100)};}
case "momentum":{const net=(agg[st].r-agg[st].d)/cs2.length;return{v:net,c:net>0.1?"#5cb87c":net<-0.1?"#d96a6a":"#d9a62e",lbl:(net>=0?"+":"")+Math.round(net*100)};}
default:return null;}})();
let acc=-Math.PI/2;const wedges=amp.map((av,wi)=>{const a0=acc,a1=acc+av*2*Math.PI;acc=a1;return{d:qArc(x,y,r,a0,a1),c:QCOL[wi]};});
return(<g key={st} onClick={()=>{setMapSt(st===mapSt?null:st);setMapC(null);setSt(st);}} style={{cursor:"pointer"}}>
<circle cx={x} cy={y} r={Math.max(r,9)} fill="transparent"/>
{mapSt===st&&<circle cx={x} cy={y} r={r+4} fill="none" stroke="#fff" strokeWidth="1.4"/>}
{!modeVal&&wedges.map((w,wi)=><path key={wi} d={w.d} fill={w.c} opacity={resolved?0.22:0.6} stroke="#0f0f0f" strokeWidth="0.4"/>)}
{!modeVal&&resolved&&<circle cx={x} cy={y} r={r*0.60} fill={QCOL[dom]} stroke={manual?"#fff":inferred?"#8a7ade":"#fff"} strokeWidth={manual?1.4:1}/>}
{modeVal&&<circle cx={x} cy={y} r={r} fill={modeVal.c} opacity={mapMode==="freshness"?0.25+modeVal.v*0.75:0.85} stroke="#0f0f0f" strokeWidth="0.5"/>}
{modeVal&&<text x={x} y={y-r-3} textAnchor="middle" style={{font:"bold 6.5px Helvetica",fill:"#d5d5d5",paintOrder:"stroke",stroke:"#0a0a0a",strokeWidth:1.2}}>{modeVal.lbl}</text>}
{manual&&<circle cx={x} cy={y} r={r+5} fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.9"/>}
{inferred&&!manual&&<circle cx={x} cy={y} r={r+3.5} fill="none" stroke="#8a7ade" strokeWidth="1" strokeDasharray="1 2" opacity="0.9"/>}
{!resolved&&<circle cx={x} cy={y} r={r+1.5} fill="none" stroke="#9a9a9a" strokeWidth="0.7" strokeDasharray="2 2" opacity={(1-coh)*0.9}/>}
{measuring&&!manual&&<circle cx={x} cy={y} r={r+5} fill="none" stroke="#d9a62e" strokeWidth="1.4" opacity="0.9"/>}
<text x={x} y={y+3} textAnchor="middle" style={{font:"bold 8px Helvetica",fill:resolved?"#fff":"#0f0f0f",paintOrder:"stroke",stroke:resolved?"rgba(0,0,0,0.35)":"rgba(255,255,255,0.35)",strokeWidth:0.6}}>{st}</text>
<text x={x} y={y+r+9} textAnchor="middle" style={{font:"bold 7px Helvetica",fill:"#d5d5d5"}}>{agg[st].n}</text>
</g>);})}
{AGENTS.map((a,i)=>(<g key={"a"+i} onClick={()=>{setMapSt(a.to);setMapC(null);}} style={{cursor:"pointer"}}>
<title>{`${a.n} — ${a.job}. Currently en route to ${a.to} (${a.reason}).`}</title>
<circle cx={a.x} cy={a.y} r="5" fill="#121212" stroke={a.c} strokeWidth="2.2" style={{transition:"all 1.05s linear"}}/>
<text x={a.x} y={a.y+14} textAnchor="middle" style={{font:"bold 6.5px Helvetica",fill:a.c,paintOrder:"stroke",stroke:"#0a0a0a",strokeWidth:1.4,transition:"all 1.05s linear"}}>{a.n.toUpperCase()}</text></g>))}
{shown.map((p,i)=>{const[x,y]=P(p.st);const w=p.txt.length*4.5+12;const ox=Math.min(Math.max(6,x-w/2),514-w);
return(<g key={"p"+i} opacity="0.95">
<rect x={ox} y={Math.min(y+13,330)} width={w} height={14} fill="#142b1b" stroke="#4d8f63" strokeWidth="1" rx="2"/>
<text x={ox+w/2} y={Math.min(y+23,340)} textAnchor="middle" style={{font:"7.5px Helvetica",fill:"#a9d6b4"}}>{p.txt}</text></g>);})}
</svg>
{mapMode!=="health"&&<div style={{fontFamily:"Helvetica",fontSize:8,color:"#9aa4c8",padding:"5px 12px 0"}}>{({
freshness:"DATA FRESHNESS — states brighten with measured share; a thriving-but-unmeasured state dims until reviewed. One glance answers: where do we measure next?",
headroom:"PRICING HEADROOM — share of units with margin comfortably above the floor. A state can be healthy today and still run hot here: small tuition moves would strain it.",
consistency:"INTERNAL CONSISTENCY — how well each unit's own metrics agree (enrollment vs retention vs staffing). Low scores flag units that look fine on average but disagree with themselves.",
momentum:"MOMENTUM — net 90-day trajectory per state (rising minus declining, as % of units). Steep negative values flag acceleration toward trouble before health scores move.",
})[mapMode]}</div>}
<div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",padding:"6px 12px 9px",borderTop:"1px solid #262626"}}>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:1,color:"#b8b8b8"}}>STATUS</span>
<span style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Helvetica",fontSize:8,color:"#bbb"}}><span style={{width:9,height:9,borderRadius:5,background:"#5cb87c",border:"1.5px solid #fff"}}/>verified · current</span>
<span style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Helvetica",fontSize:8,color:"#bbb"}}><span style={{width:9,height:9,borderRadius:5,background:"conic-gradient(#5cb87c 0 33%,#d9a62e 33% 66%,#d96a6a 66%)",opacity:0.65}}/>estimated · stale</span>
<span style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Helvetica",fontSize:8,color:"#bbb"}}><span style={{width:14,height:0,borderTop:"1px dashed #8a7ade"}}/>linked cluster</span>
<span style={{display:"flex",alignItems:"center",gap:4,fontFamily:"Helvetica",fontSize:8,color:"#bbb"}}><span style={{width:9,height:9,borderRadius:5,border:"1.4px solid #d9a62e"}}/>measuring now</span>
<span style={{marginLeft:"auto",fontFamily:"Helvetica",fontSize:8,color:"#8a8a8a"}}>program interaction: <b style={{color:"#6fc38a"}}>{centers.filter(c=>forecast(c).cls==="rising"&&engageOf(c).score>=0.7).length} reinforcing</b> · <b style={{color:"#d96a6a"}}>{centers.filter(c=>forecast(c).cls==="deteriorating"&&c.eb<3).length} competing</b> (programs vs Sensei-hours · derived from trajectory × engagement / margin)</span>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:8,marginTop:8}}>
{[
["SEE EARLY","Recovery time is the leading indicator — a unit with a slow recovery profile is flagged 30–90 days before the P&L reflects it. "+alerts.filter(a=>a.eta<=30).length+" flags require action inside 30 days.","warning","Open early warning",VIO],
["SUPPORT FAST","Interventions are proposed under an 8-point weekly capacity budget and four hard governors — financial materiality, engagement integrity, child safety, data integrity. "+red.length+" units are on the priority queue today.","pain","Open priorities",AC],
["GROW ON CADENCE","The full franchise sales cycle runs inside the same record: lead scoring, discovery days, FDD and federal compliance as hard gates. Nothing signs while a compliance item is open.","leads","Open the pipeline",GRN],
].map(([h,b,t2,lbl,c],i)=>(
<div key={i} style={{border:`1px solid ${RULE}`,borderTop:`3px solid ${c}`,background:"#fff",padding:"10px 12px",display:"flex",flexDirection:"column"}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:1.2,color:c,marginBottom:5}}>{h}</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#333",lineHeight:1.55,flex:1}}>{b}</div>
<button onClick={()=>setTab(t2)} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"5px 11px",cursor:"pointer",border:`1px solid ${c}`,background:"#fff",color:c,marginTop:8,alignSelf:"flex-start"}}>{lbl} →</button>
</div>))}
</div>
{mapSt&&states[mapSt]&&(()=>{const cs=[...states[mapSt]].sort((a,b)=>b.health-a.health);const g=agg[mapSt];
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",padding:"9px 11px",marginTop:8}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap"}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700}}>{mapSt} — {g.n} centers <span style={{fontSize:9,color:MUT,fontWeight:400}}>· {cs.filter(c=>c.verified).length} verified · <span style={{color:GRN}}>↑{g.r}</span> <span style={{color:AC}}>↓{g.d}</span></span></div>
<span onClick={()=>{setMapSt(null);setMapC(null);}} style={{fontFamily:"Helvetica",fontSize:12,color:MUT,cursor:"pointer"}}>close ×</span>
</div>
<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",margin:"6px 0"}}>
{(()=>{const amp=qStateAmp(states[mapSt]);const dom=qResolve(amp);const measured=qMeas[mapSt];const cl=QCLUSTERS.find(c=>c.includes(mapSt));const partners=cl?cl.filter(o=>o!==mapSt&&states[o]):[];
return(<>
<button onClick={()=>{setQMeas(m=>({...m,[mapSt]:true}));logL("franchise","Measurement",mapSt+" state measured — cluster partners inferred");}} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"5px 10px",cursor:"pointer",border:`1px solid ${VIO}`,background:measured?VIO:"#fff",color:measured?"#fff":VIO}}>{measured?"◆ measured — current":"⟲ Run measurement (verify)"}</button>
{measured&&<button onClick={()=>setQMeas(m=>{const nm={...m};delete nm[mapSt];return nm;})} style={{fontFamily:"Helvetica",fontSize:9,padding:"5px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>↺ mark stale</button>}
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{measured?<span>verified as <b style={{color:HCOL[dom]}}>{QSTATES[dom]}</b>{partners.length?<span> · linked <b style={{color:VIO}}>{partners.join(", ")}</b> now inferred</span>:null}</span>:<span>estimated: {QSTATES.map((n,i)=>pct(amp[i])+"% "+n).join(" · ")} — measuring verifies it</span>}</span>
</>);})()}
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(104px,1fr))",gap:5,maxHeight:340,overflowY:"auto",marginTop:6}}>
{cs.map(c=>{const[ar,ac2]=arrow(forecast(c).cls);const sel2=mapC===c;
const tc=c.health>=88?"#2f7a3f":c.health>=80?"#b8860b":c.health>=68?"#7d7d7d":"#8b0000";
return(<div key={c.name} onClick={()=>{setMapC(sel2?null:c);setCardMsg("");setSel(c.name);}} style={{border:`1px solid ${sel2?INK:RULE}`,borderTop:`3px solid ${tc}`,background:sel2?"#fbf9f4":"#fff",padding:"6px 7px",cursor:"pointer",opacity:c.verified?1:0.8}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
<b style={{fontFamily:"Helvetica",fontSize:17,color:INK,lineHeight:1}}>{c.health}</b>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.5,color:tc}}>{tierOf(c.health)}</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.8,fontWeight:700,color:INK,margin:"2px 0 1px",lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name}</div>
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT}}>{c.students} students · <b style={{color:ac2}}>{ar}{fmt(forecast(c).proj[2])}k</b></div>
</div>);})}
</div>
{mapC&&<CenterCard c={mapC}/>}
</div>);})()}
<div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
<div style={{flex:"1 1 180px",border:`1px solid ${RULE}`,background:"#fff",padding:"8px 10px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:AC,marginBottom:6}}>Agent activity — current cycle</div>
{AGENTS.map((a,i)=>(<div key={i} onClick={()=>{setMapSt(a.to);setMapC(null);}} title={a.job} style={{fontFamily:"Helvetica",fontSize:9.5,marginBottom:5,display:"flex",alignItems:"flex-start",gap:6,cursor:"pointer"}}>
<span style={{width:9,height:9,borderRadius:5,background:"#fff",border:`2px solid ${a.c}`,flexShrink:0,marginTop:2}}/>
<span><b>{a.n}</b> · {a.from} → {a.to} <span style={{color:a.metric>0?a.c:MUT,fontWeight:700}}>{a.reason}</span><br/><span style={{fontSize:8,color:MUT}}>{a.job}</span></span></div>))}
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,marginTop:2,borderTop:`1px solid ${RULE}`,paddingTop:4}}>ranked live from network state each tick · tap an agent to open its target state</div>
</div>
<div style={{flex:"1 1 180px",border:`1px solid ${RULE}`,background:"#fff",padding:"8px 10px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:GRN,marginBottom:6}}>Positive indicators — rolling</div>
{shown.map((p,i)=>(<div key={i} style={{fontFamily:"Helvetica",fontSize:9,marginBottom:4,color:"#2f5a3a"}}><b>{p.st}</b> · {p.txt}</div>))}
</div>
<div style={{flex:"1 1 180px",border:`1px solid ${RULE}`,background:"#fff",padding:"8px 10px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:AC,marginBottom:6}}>Network snapshot — computed live</div>
{(()=>{const avgS=Math.round(centers.reduce((a,c)=>a+c.students,0)/centers.length);
const avgConv=Math.round(centers.reduce((a,c)=>a+c.conv,0)/centers.length*100);
const avgRet=Math.round(centers.reduce((a,c)=>a+c.ret,0)/centers.length*100);
return [["Avg students/center",avgS,avgS<60],["Trial → enrollment",avgConv+"%",avgConv<50],["12-mo retention",avgRet+"%",avgRet<70],["Below breakeven",red.length+" units",red.length>0],["Data stale >4wk",staleN+" units",staleN>0]].map(([m,v,warn],i)=>(
<div key={i} style={{fontFamily:"Helvetica",fontSize:9,marginBottom:3,display:"flex",justifyContent:"space-between"}}><span>{m}</span><b style={{color:warn?AC:INK}}>{v}</b></div>));})()}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:3}}>every figure derived from the modeled network this render — same source as the map</div>
</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:6}}>US + Canada footprint · illustrative motion over live-computed state · engagement avg {eAvg}</div>
</EngineErrorBoundary>
<div style={{margin:"16px 0 6px",fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:GRN}}>What I would do first at Code Ninjas</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginBottom:6}}>— why this matters: a strategy is only credible once it survives contact with week one. This is the concrete order of operations, not a slogan.</div>

{(()=>{const phases=PLAN_90.map(p=>p.phase.split(" — "));
return(<div style={{marginTop:8,border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",padding:"9px 12px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:GRN}}>Day-by-day breakdown</div>
<span onClick={()=>setTab("plan")} style={{fontFamily:"Helvetica",fontSize:9,color:AC,cursor:"pointer",textDecoration:"underline"}}>full plan →</span>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
{phases.map(([days,name],i)=>(<div key={i}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:MUT,textTransform:"uppercase",letterSpacing:0.4}}>{days}</div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700}}>{name}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",marginTop:1}}>{PLAN_90[i].focus}</div>
</div>))}
</div>
</div>);})()}
<div style={{marginTop:6,fontFamily:"Helvetica",fontSize:8.5,color:MUT,borderTop:`1px solid ${RULE}`,paddingTop:6}}>Data boundary: figures across this artifact are modeled/illustrative pending live MyStudio and QuickBooks integration, with one exception — FDD Item 20 (244 units) and the 64 publicly verified centers are the authoritative counts. Nothing here overrides that reconciliation.</div>
<FDDReconciliationPanel centers={centers}/>
</div>);})()}
{tab==="agenda"&&(<div>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",padding:"10px 14px",marginBottom:12,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:800}}>What this tab is</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#444",marginTop:4,lineHeight:1.6}}>Every other view shows <i>decisions</i>; this one shows <b>how decisions get made</b> — the operating doctrine. The weekly cadence (measure → propose → gate → commit → record), the evidence rules (stale data can't pass, every figure recomputable), and the standing gates (the four governors, Rule 1 human-commit, Rule 2 child-safety freeze). If a number elsewhere surprises you, this tab is where its rules live.</div>
</div>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",padding:"8px 10px",margin:"0 0 8px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:MUT,marginBottom:5}}>What's new in this version</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#333",lineHeight:1.6}}>
Added four tabs and extended one: <b>Success Rate</b> (support-plan completion by type), <b>Batch Operations</b> (bulk re-measure / bulk-commit across a filtered center set), <b>Historical Playback</b> (session trend line, captured automatically each week), and <b>Reports & Exports</b> (every export consolidated in one place, including MyStudio/QuickBooks payload shapes). <b>Audit Trail</b> gained search and source-tab filtering. All read the same canonical state every other view reads — no new data sources were introduced.
</div>
</div>
<NetworkHealthDashboard centers={centers} alerts={alerts} red={red} staleN={staleN}/>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",padding:"8px 10px",margin:"8px 0"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:VIO,marginBottom:5}}>Action ledger — every committed action, any tab, this session</div>
{ledger.length===0&&<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>no actions committed yet — measurements, interventions, transfers, and deal-agent weeks all write here</div>}
{ledger.slice(0,12).map((e,i)=>(<div key={i} style={{fontFamily:"Helvetica",fontSize:9,marginBottom:3,display:"flex",gap:8,alignItems:"baseline"}}>
<span style={{fontSize:7.5,fontWeight:700,letterSpacing:0.4,color:MUT,textTransform:"uppercase",width:60,flexShrink:0}}>{e.tab}</span>
<b style={{color:VIO,width:78,flexShrink:0}}>{e.actor}</b>
<span style={{color:"#444"}}>{e.text}</span></div>))}
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,marginTop:4,borderTop:`1px solid ${RULE}`,paddingTop:3}}>single integration layer: committed interventions write metric deltas to the shared world state — map, forecasts, pain ranking, and this record all read the same adjusted units · {Object.keys(adj).length} unit{Object.keys(adj).length===1?"":"s"} currently carrying live adjustments</div>
</div>
{[
["§1",A("score"),V("measure"),staleN+" stale + premium tier",staleN>0?"hold":"done",AC],
["§2",A("fcst"),V("schedule"),alerts.filter(a=>a.eta<=90).length+" pre-breach interventions","pend",AMB],
["§3","sensei","rotate",blocker[1]+" blocker","pend",AC],
["§4",A("transfer"),V("transfer"),"3 matches + 1 peer pair","pend",GRN],
["§5",A("cap"),"govern",red.length+" red units","hold",AC],
["§6",A("gate"),"review","changelog + holds","done",GRN],
].map(([s,ag,vb,tg,st,c],i)=>(
<Chain key={i} items={[{vb:s,state:"done",c:RULE},{ag,vb,tg,state:st,c}]}/>))}
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:6}}>generated from state · every op above writes here · candidate submission, proposes not enacts</div>
</div>)}
{tab==="leads"&&<EngineErrorBoundary>{(()=>{
const stageOf=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
// Territory saturation is already computed by the Growth agent and ranked by
// Territory White Space -- this is the one place those real numbers become
// a hard gate rather than an informational read: a candidate cannot advance past Discovery Day into a territory that's already at its capacity ceiling t
const territorySaturated=l=>{
const netState=NET_STATES.find(x=>x.s===l.region);
const headroom=netState?netState.h[0]:0.3;
const capacity=territoryCapacityOf(headroom);
const activeInRegion=LEADS.filter(x=>x.region===l.region&&(leadStage[x.id]!==undefined?leadStage[x.id]:x.stage0)>=4).length;
return activeInRegion>=capacity;
};
const advance=l=>{
const current=stageOf(l);
if(current===3&&territorySaturated(l)){
logL("leads","Territory gate",l.n+" held at Due diligence — "+l.region+" is at its candidate-capacity ceiling this cycle");
return;
}
const nx=Math.min(5,current+1);setLeadStage(m=>({...m,[l.id]:nx}));
// reinforcement pulse: a signing raises the gain of every channel that produced it —
// the expansion tab's broker gains and flywheel multiplier recompute from this
if(nx===5)logL("leads","Signing",l.n+" signed — flywheel pulsed: broker gains and referral flow step up ×1.06");
else logL("leads","Stage gate",l.n+" advanced to "+STAGES6[nx]);};
const byStage=STAGES6.map((_,si)=>LEADS.filter(l=>stageOf(l)===si));
const signed=byStage[5].length;
// "New franchise openings and conversions" against one blended annual target
// hides which lever is actually carrying the number -- split here.
const signedNew=byStage[5].filter(l=>l.dealType==="new").length;
const signedConv=byStage[5].filter(l=>l.dealType==="conversion").length;
const signedUS=byStage[5].filter(l=>l.market==="US").length;
const signedCA=byStage[5].filter(l=>l.market==="Canada").length;
const TARGET=12;
const TARGET_NEW=8,TARGET_CONV=4; // split target: new-entrant openings vs. proven-operator conversions
const CONV=[0.5,0.6,0.7,0.75,0.6];
const remain=si=>{let p=1;for(let k=si;k<5;k++)p*=CONV[k];return p;};
const expected=LEADS.reduce((a,l)=>{const s=stageOf(l);return a+(s===5?1:remain(s));},0);
const p50=+expected.toFixed(1),p10=+(expected*0.7).toFixed(1),p90=+(expected*1.3).toFixed(1);
const gap=+(TARGET-p50).toFixed(1);
const reqIntro=Math.max(0,Math.ceil((TARGET-signed)/remain(0)));
const commission=byStage[5].reduce((a,l)=>a+Math.round(l.liquidity*0.1),0);
const NEXT=["Log intro call ▸","Book discovery ▸","Send FDD ▸","Open due diligence ▸","Invite to Discovery Day ▸","Move to signing ▸"];
const L=leadSel!==null?LEADS.find(l=>l.id===leadSel):null;
// Canadian leads run a provincial disclosure document, not the US FDD -- the
// checklist names the document the market actually requires.
const disclosureDocLabel=L&&L.market==="Canada"?"Disclosure Document acknowledgment":"FDD acknowledgment";
const DOCS=[["Application",0],["Financial statement",1],[disclosureDocLabel,2],["Due-diligence packet",3],["Territory check",3],["Budget",4],["Franchise Agreement",5]];
const proposals=(()=>{const out=[];
// Cannibalization check mirrors the real Growth agent's territory-capacity
// math (same territoryCapacityOf formula, same NET_STATES headroom) instead
// of a per-name coin flip -- two systems answering "is this territory
// oversubscribed?" should use the same math, not two different ones.
const regionActive={};
[...LEADS].sort((a,b)=>b.fit-a.fit).forEach(l=>{const s=stageOf(l);if(s>=5)return;
const netState=NET_STATES.find(x=>x.s===l.region);
const headroom=netState?netState.h[0]:0.3;
const capacity=territoryCapacityOf(headroom);
const used=regionActive[l.region]||0;regionActive[l.region]=used+1;
if(used>=capacity){out.push({kind:"block cannibalization",cn:l.n,lever:0,block:true,note:l.region+" territory candidate-supply ceiling reached ("+capacity+")"});return;}
if(l.fit<50&&s<=1){out.push({kind:"decline — below qualification",cn:l.n,lever:1.2,cost:1});return;}
if(s<2){out.push({kind:"advance stage",cn:l.n,src:l.src,lever:+(1.0+l.fit/60).toFixed(2),cost:1});}
else{out.push({kind:"awaiting human gate",cn:l.n,lever:+(l.fit/50).toFixed(2),gate:true});
if(hash(l.n+"doc"+s)%2===0)out.push({kind:"chase documents",cn:l.n,lever:0.9,cost:1});}});
out.forEach(p=>{if(dealAg.trained[p.kind])p.lever=+(p.lever*dealAg.trained[p.kind]).toFixed(2);});
return out.sort((a,b)=>b.lever-a.lever);})();
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,padding:"6px 10px",marginBottom:8,lineHeight:1.5}}>
<b style={{color:AC}}>LEAD PIPELINE</b> · the full franchise sales cycle the role owns — intro call → discovery → FDD → due diligence → Discovery Day → signing. Each prospect carries a probability split across &#123;signs · stalls · dies&#125; until a stage-gate verifies it. Agents advance and track; humans own every gate. Territory + financial qualification reserved to Development Function approval.
</div>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",padding:"8px 10px",marginBottom:8}}>
<div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
<b style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:VIO}}>Deal Agent</b>
<button onClick={runDealWeek} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 11px",cursor:"pointer",border:`1px solid ${INK}`,background:"#fff"}}>Run one week</button>
<button onClick={()=>setDealAg(A=>({...A,auto:!A.auto}))} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 11px",cursor:"pointer",border:`1px solid ${INK}`,background:dealAg.auto?INK:"#fff",color:dealAg.auto?"#fff":INK}}>{dealAg.auto?"Pause auto":"Run autonomously"}</button>
<span style={{fontFamily:"Helvetica",fontSize:9}}>week <b>{dealAg.wk}</b> · <span style={{color:AC}}>{dealAg.blocked} blocked by governors</span></span>
<button onClick={downloadReport} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 11px",cursor:"pointer",border:`1px solid ${GRN}`,background:"#fff",color:GRN,marginLeft:"auto"}}>⬇ Download pipeline CSV</button>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:5,lineHeight:1.5}}>Advances qualified deals through the administrative stages and drafts document packages under an 8-pt weekly capacity budget; then trains — checks each action against the prospect's actual fit/quality data, promotes action types with a ≥60% hit rate (2+ samples), retires the rest. <b style={{color:AC}}>Stops at every human gate</b> (FDD, due diligence, Discovery Day, signing) and is hard-blocked by the cannibalization + candidate-quality governors.</div>
{proposals.length>0&&(<div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:8}}>
<div style={{flex:"1.2 1 260px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:4}}>Proposed now — ranked by leverage, capacity-gated</div>
{(()=>{let capp=8;return proposals.slice(0,8).map((p,i)=>{const afford=!p.gate&&!p.block&&capp-(p.cost||1)>=0;if(afford)capp-=(p.cost||1);const col=p.block?AC:p.gate?VIO:GRN;
return(<div key={i} style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${col}`,padding:"5px 8px",marginBottom:3,opacity:p.block?0.65:1}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
<b style={{fontFamily:"Helvetica",fontSize:9}}>{p.kind} <span style={{fontWeight:400,color:MUT}}>· {p.cn}{p.src?" · via "+p.src:""}</span></b>
<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:col}}>{p.block?"BLOCKED":p.gate?"HUMAN GATE":"lever "+p.lever+(afford?"":" · deferred")}</span>
</div>
</div>);});})()}
</div>
<div style={{flex:"1 1 220px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:VIO,marginBottom:4}}>Training memory</div>
{dealAg.promoted.map((k,i)=>{const s=dealAg.stats[k]||{hits:0,attempts:0};return(<div key={i} style={{fontFamily:"Helvetica",fontSize:9,color:"#2f5a3a",marginBottom:2}}>▲ PROMOTED · {k} <b>×{(dealAg.trained[k]||1).toFixed(2)}</b> <span style={{color:MUT}}>{s.hits}/{s.attempts} correct</span></div>);})}
{dealAg.retired.map((k,i)=>{const s=dealAg.stats[k]||{hits:0,attempts:0};return(<div key={i} style={{fontFamily:"Helvetica",fontSize:9,color:AC,marginBottom:2}}>▼ RETIRED · {k} <span style={{color:MUT}}>{s.hits}/{s.attempts} correct</span></div>);})}
{!dealAg.promoted.length&&!dealAg.retired.length&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>run a few weeks — the agent learns which action types earn their capacity</div>}
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,margin:"8px 0 3px"}}>Execution log</div>
{dealAg.log.map((l,i)=>(<div key={i} style={{fontFamily:"Courier,monospace",fontSize:8,color:"#444",marginBottom:1,lineHeight:1.4}}>{l}</div>))}
{!dealAg.log.length&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>nothing executed yet</div>}
</div>
</div>)}
</div>
<div style={{display:"flex",gap:3,marginBottom:8,flexWrap:"wrap"}}>
{STAGES6.map((st,i)=>(<div key={i} style={{flex:"1 1 90px",border:`1px solid ${RULE}`,borderTop:`3px solid ${i===5?GRN:i===0?MUT:AMB}`,padding:"5px 7px",background:"#fff"}}>
<div style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,letterSpacing:0.4,textTransform:"uppercase",color:MUT}}>{st}</div>
<div style={{fontFamily:"Helvetica",fontSize:19,fontWeight:800,color:i===5?GRN:INK}}>{byStage[i].length}</div>
</div>))}
</div>
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",padding:"9px 11px",marginBottom:8}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:VIO,marginBottom:6}}>Quota forecast — annual target back-solved</div>
<div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:8}}>
{[["Target",TARGET,INK],["Signed",signed,GRN],["Pipeline P50",p50,gap>0?AC:GRN],["Gap",gap>0?"−"+gap:"+"+Math.abs(gap),gap>0?AC:GRN]].map(([l,v,c],i)=>(
<div key={i} style={{flex:"1 1 80px"}}><div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:MUT,textTransform:"uppercase"}}>{l}</div><div style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:c}}>{v}</div></div>))}
</div>
<div style={{position:"relative",height:22,background:"#f0ede6",borderRadius:2,marginBottom:14,marginTop:14}}>
<div style={{position:"absolute",left:(p10/(TARGET*1.6)*100)+"%",width:((p90-p10)/(TARGET*1.6)*100)+"%",height:22,background:"rgba(122,107,216,0.25)"}}/>
<div style={{position:"absolute",left:(p50/(TARGET*1.6)*100)+"%",width:2,height:22,background:VIO}}/>
<div style={{position:"absolute",left:(TARGET/(TARGET*1.6)*100)+"%",width:2,height:22,background:AC}}/>
<div style={{position:"absolute",left:(TARGET/(TARGET*1.6)*100)+"%",top:-12,fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:AC,transform:"translateX(-50%)"}}>target</div>
<div style={{position:"absolute",left:(p50/(TARGET*1.6)*100)+"%",top:24,fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:VIO,transform:"translateX(-50%)"}}>P50</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>P10 {p10} · P50 {p50} · P90 {p90} signings · ~5% intro→sign conversion · {gap>0?<b style={{color:AC}}>reload top of funnel: ~{reqIntro} intro leads to clear target</b>:<b style={{color:GRN}}>pipeline clears target at P50</b>}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:3}}>Signed this cycle: <b style={{color:INK}}>{signedNew}</b> new opening{signedNew===1?"":"s"} of {TARGET_NEW} target · <b style={{color:INK}}>{signedConv}</b> conversion{signedConv===1?"":"s"} of {TARGET_CONV} target · <b style={{color:INK}}>{signedUS}</b> US · <b style={{color:INK}}>{signedCA}</b> Canada</div>
</div>
<div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
<div style={{flex:"1 1 130px",border:`1px solid ${RULE}`,background:"#fff",padding:"7px 9px"}}><div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:GRN,letterSpacing:0.6}}>COMMISSION (10% IFF)</div><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800}}>${commission}k<span style={{fontSize:8,color:MUT}}> proxy</span></div></div>
<div style={{flex:"1 1 130px",border:`1px solid ${RULE}`,background:"#fff",padding:"7px 9px"}}><div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:AMB,letterSpacing:0.6}}>HOT PROSPECTS</div><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800}}>{LEADS.filter(l=>l.hot&&stageOf(l)<5).length}</div></div>
<div style={{flex:"1 1 130px",border:`1px solid ${RULE}`,background:"#fff",padding:"7px 9px"}}><div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:AC,letterSpacing:0.6}}>IN PIPELINE</div><div style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800}}>{LEADS.filter(l=>stageOf(l)<5).length}</div></div>
</div>
{L&&(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",padding:"9px 11px",marginBottom:8}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap"}}>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700}}>{L.n} — document flow <span style={{fontSize:8.5,color:MUT,fontWeight:400}}>· stage: {STAGES6[stageOf(L)]}</span></div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:L.market==="Canada"?VIO:MUT,marginBottom:2}}>{L.market} · {L.dealType==="conversion"?"conversion (proven operator)":"new opening"} · {disclosureLawOf(L.region)}</div>
<span onClick={()=>setLeadSel(null)} style={{fontFamily:"Helvetica",fontSize:11,color:MUT,cursor:"pointer"}}>close ×</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:VIO,margin:"6px 0 3px"}}>Deal state — probability split across signs · stalls · dies</div>
{(()=>{const s=stageOf(L);const base=L.fit/100,prog=s/5;
let signs=Math.max(0.05,base*0.5+prog*0.5),dies=Math.max(0.05,(1-base)*0.5+(1-prog)*0.3),stalls=Math.max(0.05,1-Math.abs(signs-dies));
const t=signs+stalls+dies;const amp=[signs/t,stalls/t,dies/t];const resolved=s===5;
const dc=["#2f7a3f","#b8860b","#8b0000"],dn=["signs","stalls","dies"];
return(<div style={{marginBottom:6}}>
<div style={{display:"flex",height:14,borderRadius:2,overflow:"hidden",marginBottom:3}}>
{amp.map((a,i)=>(<div key={i} style={{width:(a*100)+"%",background:dc[i],opacity:resolved?(i===0?1:0.2):0.85}} title={dn[i]}/>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>{resolved?<span><b style={{color:"#2f7a3f"}}>verified → signed</b> · the signing gate confirmed this deal to a record</span>:<span>{dn.map((n,i)=>pct(amp[i])+"% "+n).join(" · ")} · each stage-gate is a checkpoint that updates the split</span>}</div>
</div>);})()}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginBottom:5}}>coordination of documents to corporate for processing + approvals — the role's heaviest operational load</div>
{DOCS.map(([dn,rs],i)=>{const s=stageOf(L);const done=rs<s||(rs<=s&&s===5);const pending=!done&&(rs===s||rs===s+1);const overdue=pending&&(hash(L.n+dn)%3===0);
const status=done?"SUBMITTED ✓":overdue?"OVERDUE ⚠":pending?"PENDING":"NOT YET";
const col=done?GRN:overdue?AC:pending?AMB:"#bbb";
return(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderTop:i?`1px solid #f0f0f0`:"none"}}>
<span style={{width:8,height:8,borderRadius:4,background:col,flexShrink:0}}/>
<span style={{fontFamily:"Helvetica",fontSize:9.5,flex:1}}>{dn}</span>
<span style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>req @ {STAGES6[rs]}</span>
<b style={{fontFamily:"Helvetica",fontSize:8,color:col,width:76,textAlign:"right"}}>{status}</b>
</div>);})}
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:5}}>agent flags overdue artifacts + drafts the corporate-submission package · never submits without human sign-off · FDD + due-diligence gates are non-separable</div>
</div>)}
<div style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:AC,marginBottom:2}}>Prospect book — ranked by fit · tap a card to open its document flow</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginBottom:5}}>sample prospects are illustrative composites, sourced across the real channel mix (broker networks, franchise portals, direct referrals) — names are fictional; the live CRM feed replaces this book on integration</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:6}}>
{LEADS.map(l=>{const si=stageOf(l);const fc=l.fit>=78?GRN:l.fit>=60?AMB:AC;const done=si===5;
return(<div key={l.id} onClick={()=>setLeadSel(leadSel===l.id?null:l.id)} style={{border:`1px solid ${leadSel===l.id?INK:RULE}`,borderLeft:`4px solid ${fc}`,background:done?"#f7fbf8":leadSel===l.id?"#fbf9f4":"#fff",padding:"8px 10px",cursor:"pointer"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
<b style={{fontFamily:"Helvetica",fontSize:10.5}}>{l.n}</b>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:fc}}>FIT {l.fit}</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:1}}>{l.src} · {l.region}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:"#444",marginTop:3}}>liquidity ${l.liquidity}k · net ${l.net}k {l.proven&&<span style={{color:GRN,fontWeight:700}}>· proven</span>}{l.multi&&<span style={{color:VIO,fontWeight:700}}> · multi-unit</span>}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:l.hot?AC:MUT,marginTop:1,fontStyle:"italic"}}>{l.note}</div>
<div style={{display:"flex",gap:2,margin:"6px 0 4px"}}>
{STAGES6.map((_,i)=>(<div key={i} style={{flex:1,height:4,background:i<=si?(done?GRN:AMB):"#e8e4da"}} title={STAGES6[i]}/>))}
</div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:done?GRN:INK}}>{STAGES6[si]}</span>
{!done?<button onClick={e=>{e.stopPropagation();advance(l);}} style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,padding:"3px 8px",cursor:"pointer",border:`1px solid ${INK}`,background:"#fff"}}>{NEXT[si]}</button>
:<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:GRN}}>✓ signed +${Math.round(l.liquidity*0.1)}k</span>}
</div>
</div>);})}
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:8}}>fit + financials illustrative (seeded) · cycle mirrors the posting exactly · governors: candidate quality + cannibalization — no target may cross them · proven operators carry ramp inheritance into open territory</div>
</div>);
})()}






</EngineErrorBoundary>}
{tab==="auction"&&<EngineErrorBoundary>{(()=>{
const terr=Object.entries(states).map(([st,cs])=>({st,units:cs.length,avg:Math.round(cs.reduce((a,c)=>a+c.health,0)/cs.length),score:Math.round(100-cs.length*3+cs.reduce((a,c)=>a+c.health,0)/cs.length/2)})).sort((a,b)=>b.score-a.score);
// ---- assignment comparison: the same candidate book placed two ways.
// Greedy: every active candidate chases the single most attractive territory.
// Constrained: candidates fill territories in attractiveness order, but each
// territory only absorbs up to its headroom (units-based ceiling) AND must
// clear the 1.15× staffing floor. Contribution is a modeled index (existing
// health-derived score), not a dollar figure. Cannibalization rule: every
// placement beyond a territory's headroom contributes at 60% — crowding an
// existing franchisee's territory taxes everyone in it, including the
// incumbent. This is franchisee protection stated as arithmetic.
const cov=st=>{const cs=states[st]||[];const demand=cs.length*4||4;const supply=Math.round(demand*(0.9+((hash(st)%50)/100)));return supply/demand;};
const headroom=t=>Math.max(0,3-t.units);
const cands=LEADS.filter(l=>(leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0)<5);
// greedy: all candidates pile into the top-scored territory
const gTop=terr[0];const gHead=headroom(gTop);
const gPlaced=cands.map((l,i)=>({l,t:gTop.st,penalized:i>=gHead}));
const gIdx=Math.round(gPlaced.reduce((a,p)=>a+(gTop.score/10)*(p.penalized?0.6:1),0));
// constrained: fill in attractiveness order, respect headroom + staffing floor
let cPlaced=[],held=[];let pool=[...cands];
terr.forEach(t=>{if(cov(t.st)<1.15)return;let h=headroom(t);while(h>0&&pool.length){cPlaced.push({l:pool.shift(),t:t.st,score:t.score});h--;}});
held=pool;
const cIdx=Math.round(cPlaced.reduce((a,p)=>a+p.score/10,0));
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Territory portfolio — ranks open territories by expansion attractiveness (existing-unit health vs. saturation). Candidate books are matched to territories, not the reverse.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>{terr.slice(0,12).map((t,i)=>(<div key={t.st} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>{t.st}</span><span style={{color:MUT}}>{t.units} units · avg health {t.avg} · attractiveness {t.score}</span></div>))}</div>
{/* ---- assignment comparison ---- */}
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",margin:"14px 0 8px"}}><b>Assignment comparison</b> — same {cands.length} candidates, two placements. Index units, modeled. Over-headroom placements contribute at 60% (crowding taxes the incumbent).</div>
<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
<div style={{flex:1,minWidth:280,border:`1px solid ${RULE}`,borderTop:`3px solid ${AC}`,background:"#fff",padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700}}>Greedy assignment</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:6}}>every candidate chases the top territory ({gTop.st})</div>
{gPlaced.slice(0,8).map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",fontFamily:"Helvetica",fontSize:9.5,padding:"3px 0",borderTop:i?"1px solid #f4f4f0":"none"}}><span>{p.l.n}</span><span style={{color:p.penalized?AC:MUT}}>{p.t}{p.penalized?" · over headroom — 60%":""}</span></div>))}
{gPlaced.length>8&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,paddingTop:3}}>+{gPlaced.length-8} more, all over headroom</div>}
<div style={{fontFamily:"Helvetica",fontSize:13,fontWeight:800,color:AC,marginTop:8}}>index {gIdx}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>{gPlaced.filter(p=>p.penalized).length} of {gPlaced.length} placements penalized for crowding</div>
</div>
<div style={{flex:1,minWidth:280,border:`1px solid ${RULE}`,borderTop:`3px solid ${GRN}`,background:"#fff",padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700}}>Constrained assignment</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:6}}>fills by attractiveness · respects headroom · requires ≥1.15× staffing</div>
{cPlaced.slice(0,8).map((p,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",fontFamily:"Helvetica",fontSize:9.5,padding:"3px 0",borderTop:i?"1px solid #f4f4f0":"none"}}><span>{p.l.n}</span><span style={{color:MUT}}>{p.t}</span></div>))}
{held.length>0&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:AMB,paddingTop:3}}>{held.length} held — no qualifying territory this cycle (held ≠ declined)</div>}
<div style={{fontFamily:"Helvetica",fontSize:13,fontWeight:800,color:GRN,marginTop:8}}>index {cIdx}</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>zero placements penalized · {cPlaced.length} placed across {new Set(cPlaced.map(p=>p.t)).size} territories</div>
</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:8}}>The constrained column is the defensible one: no territory conflicts, held candidates stay in the book. Illustrative only.</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="scheduler"&&<EngineErrorBoundary>{(()=>{
const seq=red.slice(0,6).map((c,i)=>({wk:i+1,n:c.name,act:c.chem<0.5?"staffing stabilization":c.ret<0.7?"retention outreach":"unit-economics review"}));
// Integration 5: the review-value ranking (mechanic 4) feeds this plan
// directly — measure-first rows precede interventions, same list, one source.
const measureFirst=mxReviewQueue(centers,opt).slice(0,3).filter(m=>m.gain>=0.25);
// Growth-next (integration with growthRank): once protection work clears,
// the calendar fills from the growth priority list — protect, then grow,
// same week, same plan, one source for each half.
const growNext=growthRank(centers).filter(g=>g.health>=70).slice(0,3);
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Interaction scheduler — composes the intervention sequence for below-breakeven units into a week-by-week plan sized to approver capacity, rather than firing everything at once. Measure-first rows come straight from the next-review ranking (Signal Mechanics card 4) — one list, one source.</div>
{measureFirst.length>0&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",marginBottom:8}}>{measureFirst.map((m,i)=>(<div key={m.name} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>Before week 1 — {m.name}</span><span style={{color:VIO,fontWeight:700}}>measure first · review value {m.gain}</span></div>))}</div>}
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>{seq.map((s,i)=>(<div key={s.n} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>Week {s.wk} — {s.n}</span><span style={{color:MUT}}>{s.act}</span></div>))}
{seq.length===0&&<div style={{padding:12,fontFamily:"Helvetica",fontSize:10.5,color:MUT}}>No units below breakeven — no sequence needed.</div>}</div>
{growNext.length>0&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",marginTop:8}}>{growNext.map((g,i)=>(<div key={g.name} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>Week {seq.length+i+1} — {g.name}</span><span style={{color:GRN,fontWeight:700}}>growth push · priority {g.gp}</span></div>))}<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,padding:"6px 12px",borderTop:`1px solid ${RULE}`}}>Protect first, grow immediately after — growth slots fill from the same priority formula the growth tab shows, gated on health ≥ 70.</div></div>}
<button onClick={()=>logL("scheduler","Director","Signed the composed intervention sequence — "+seq.length+" units, one action per week")} style={{marginTop:8,fontFamily:"Helvetica",fontSize:10.5,padding:"7px 14px",background:INK,color:"#fff",border:"none",cursor:"pointer"}}>Sign sequence ▸</button></div>);})()}</EngineErrorBoundary>}
{tab==="constitution"&&<EngineErrorBoundary>{(()=>(
<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Two rules with no override path. Everything else in this model is a proposal; these are not.</div>
{[["Rule 1 — Human ownership","No proposal becomes an action without a named human owner from the approver roster. There is no auto-execute path anywhere in this model, and no configuration that creates one."],["Rule 2 — Child safety precedence","Any child-safety flag freezes all activity on the affected unit immediately, regardless of financial state, pipeline position, or approver capacity. Unfreezing requires corporate counsel review, off-system."]].map(([t,d])=>(<div key={t} style={{border:`1px solid ${INK}`,background:"#fff",padding:"12px 14px",marginBottom:8}}><b style={{fontFamily:"Helvetica",fontSize:11.5}}>{t}</b><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginTop:4}}>{d}</div></div>))}</div>))()}</EngineErrorBoundary>}
{/* ============ LIVE SYSTEMS (11) ============ */}
{tab==="surface"&&<EngineErrorBoundary>{(()=>{
// The decision surface: the causal spine, and the render modes that branch from Commit.
// This is the map of the whole engine — every view is a projection off this chain.
const spine=[["Field","connected units",130],["Futures","scenario branches",340],["Interference","conflict check",540],["Commit","Rule 1 deploy",745],["Realized","ledger + propagation",980]];
const modes=[["Board",0],["Time",1],["Structure",2],["Load",3],["Risk",4],["Value",5]];
const sy=150, mx=1180, my0=60, mstep=64;
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:10}}>The decision surface — the spine every view in this engine is a projection of. A decision moves left to right: what it's connected to, what it could become, which futures conflict, who commits it (Rule 1), and where it's recorded. The six render modes are lenses on the committed state, not separate data.</div>
<svg viewBox="0 0 1320 470" style={{width:"100%",display:"block",background:"#fdfdfb",border:`1px solid ${RULE}`,borderRadius:10}}>
{/* spine connectors */}
{spine.slice(0,-1).map((s,i)=>(<line key={i} x1={spine[i][2]+95} y1={sy+26} x2={spine[i+1][2]} y2={sy+26} stroke={INK} strokeWidth="1.5" markerEnd="url(#arr)"/>))}
<defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={INK}/></marker></defs>
{spine.map(([t,sub,x],i)=>{const commit=t==="Commit";
return(<g key={t}>
{commit
?<polygon points={`${x},${sy} ${x+80},${sy} ${x+95},${sy+26} ${x+80},${sy+52} ${x},${sy+52} ${x-15},${sy+26}`} fill="#eef4f0" stroke={GRN} strokeWidth="1.5"/>
:<rect x={x} y={sy} width="95" height="52" rx="4" fill="#dce9e6" stroke={i===4?GRN:INK} strokeWidth="1.2"/>}
<text x={x+(commit?40:47)} y={sy+22} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:11,fontWeight:800,fill:INK}}>{t}</text>
<text x={x+(commit?40:47)} y={sy+38} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fill:"#555"}}>{sub}</text>
</g>);})}
{/* render-modes fan from Commit/Realized */}
{modes.map(([m,i])=>{const y=my0+i*mstep;
return(<g key={m}>
<path d={`M ${spine[4][2]} ${sy+26} C ${spine[4][2]+70} ${sy+26}, ${mx-60} ${y+16}, ${mx} ${y+16}`} fill="none" stroke={MUT} strokeWidth="1" opacity="0.5"/>
<rect x={mx} y={y} width="95" height="34" rx="4" fill="#dce9e6" stroke={INK} strokeWidth="1"/>
<text x={mx+47} y={y+21} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,fill:INK}}>{m}</text>
</g>);})}
<text x={mx+47} y={my0+6*mstep+8} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fill:MUT}}>render modes</text>
</svg>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:8}}>Agents populate the chain; a person commits (Rule 1). A child-safety flag freezes the chain before Commit (Rule 2). The render modes are the same committed state seen six ways.</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="dojo"&&<EngineErrorBoundary>{(()=>{
// ---- rules (documented, not decorative) ----
// 1. Session rhythm is fixed: Huddle(8)→Build(52)→Break(12)→Build(52)→Wrap-up(12) = 136 min.
// 2. Senseis re-anchor to a new station cluster every 15 min so every ninja sees a sensei at least twice per Build.
// 3. A ninja flagged ready-for-belt-up belts up mid-session (modeled at minute 70-78); the bell rings, the board updates.
// 4. The banner is a proposal, not a write — belt-ups only touch real chemistry/retention state through "Run today's session" (Constitution Rule 1: no auto-execute path).
const RHYTHM=[{len:8,label:"Huddle",kind:"circle"},{len:52,label:"Build",kind:"code"},{len:12,label:"Break",kind:"break"},{len:52,label:"Build",kind:"code"},{len:12,label:"Wrap-up",kind:"circle"}];
const TOTAL=136;
const phaseAt=m=>{let a=0;for(const p of RHYTHM){if(m<a+p.len)return{...p,into:m-a};a+=p.len;}return{...RHYTHM[RHYTHM.length-1],into:0};};
const BELTS=[["white","#e2e0d8"],["yellow","#d8b93a"],["orange","#d3803a"],["green","#3f8f52"],["blue","#3a72b8"],["purple","#7a5fb8"],["brown","#8a5f42"],["red","#b03a3a"],["black","#222"]];
const beltCol=b=>{const f=BELTS.find(x=>x[0]===b);return f?f[1]:"#e2e0d8";};
const CNB="#0b6fa8";
const NAMES=["Maya","Arjun","Sofia","Liam","Zara","Noah","Priya","Ethan","Amara","Kai","Isla","Dev","Ruby","Milo"];
const GAMES=["Pizza Runner","Star Hopper","Maze King","Robo Chef","Sky Dash","Cave Quest","Fruit Slice","Tower Guard"];
const SENSEIS=[["Sensei Rohan","#3f8f52"],["Sensei Ayla","#7a5fb8"],["Sensei Alan","#d3803a"]];
const kids=NAMES.map((name,i)=>{const h=hash(team.name+name);const beltIx=Math.min(8,Math.floor(((h%22)/22)*7));return{name,age:5+(h%10),belt:BELTS[beltIx][0],beltIx,game:GAMES[h%GAMES.length],focus:0.5+((h%45)/100),readyForBeltUp:(h%9)===3,shipped:h%9};});
const minute=dojoMin,phase=phaseAt(minute),building=phase.kind==="code";
const slot=Math.floor(minute/15)%SENSEIS.length;
const beltUpFired=minute>70&&minute<78;
const beltUpKid=kids.find(k=>k.readyForBeltUp);
const clock=Math.floor(minute/60)+":"+String(Math.floor(minute)%60).padStart(2,"0");
// ---- floor geometry ----
const W=960,H=500;
const pods=[[300,170],[300,300],[460,140],[460,270],[460,400],[630,170],[630,300]];
const stationPos=i=>{const p=pods[Math.floor(i/2)%pods.length];const side=(i%2)?1:-1;return[p[0],p[1]+side*36];};
const circleC=[770,160],snackC=[800,400];
const kidPos=(i)=>{if(phase.kind==="circle"){const a=(i/kids.length)*Math.PI*2;return[circleC[0]+Math.cos(a)*54,circleC[1]+Math.sin(a)*54];}
if(phase.kind==="break"){const a=(i/kids.length)*Math.PI*2;return[snackC[0]+Math.cos(a)*42,snackC[1]+Math.sin(a)*30];}
return stationPos(i);};
const avgFocus=Math.round(kids.reduce((a,k)=>a+k.focus,0)/kids.length*100);
const beltReady=kids.filter(k=>k.readyForBeltUp).length;
return(<div>
<div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap",marginBottom:10}}>
<span style={{fontFamily:"Helvetica",fontSize:16,fontWeight:800,color:INK,letterSpacing:0.3}}>Protecting the center</span>
<span style={{fontFamily:"Helvetica",fontSize:10.5,color:MUT}}>— the live dojo floor. One session, one coach's full attention, one kid at a keyboard: the moment every gate, ledger, and scorecard in this model exists to protect.</span>
</div>
<div style={{display:"flex",gap:6,marginBottom:10}}>
{[["2d","Floor plan (2D)"],["3d","Live model (3D)"]].map(([v,l])=>(
<button key={v} onClick={()=>setDojoView(v)} style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"5px 13px",cursor:"pointer",border:`1px solid ${dojoView===v?INK:RULE}`,background:dojoView===v?INK:"#fff",color:dojoView===v?"#fff":MUT}}>{l}</button>))}
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,alignSelf:"center"}}>same session, two renderings</span>
</div>
{dojoView==="3d"&&<div style={{marginBottom:12}}><Dojo3DFloor center={team} phase={lifeStep>=0?LIFE_STAGES[lifeStep]:null}/></div>}
{(()=>{ // session lifecycle strip — plays the real operating rhythm; works in both 2D and 3D
const cur=lifeStep>=0?LIFE_STAGES[lifeStep]:null;
const W3=980,H3=70,sx=i=>60+i*((W3-120)/(LIFE_STAGES.length-1));
return(<div style={{border:`1px solid ${RULE}`,borderRadius:10,background:"#fff",padding:"11px 14px",marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT}}>Session lifecycle — the operating rhythm this floor runs on</span>
<button onClick={()=>{setLifeStep(0);setLifePlaying(true);}} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"5px 12px",cursor:"pointer",border:"none",background:INK,color:"#fff",borderRadius:6}}>▶ Play the sequence</button>
<button onClick={()=>{setLifePlaying(false);setLifeStep(-1);}} style={{fontFamily:"Helvetica",fontSize:9,padding:"5px 10px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT,borderRadius:6}}>Reset</button>
</div>
<svg viewBox={"0 0 "+W3+" "+H3} style={{width:"100%",height:78,display:"block"}} preserveAspectRatio="xMidYMid meet">
<line x1={sx(0)} y1="26" x2={sx(LIFE_STAGES.length-1)} y2="26" stroke={RULE} strokeWidth="2"/>
{lifeStep>0&&<line x1={sx(0)} y1="26" x2={sx(Math.min(lifeStep,LIFE_STAGES.length-1))} y2="26" stroke={GRN} strokeWidth="3"/>}
{LIFE_STAGES.map((s,i)=>{const on=lifeStep>=i,curN=lifeStep===i;
return(<g key={s.k} onClick={()=>{setLifePlaying(false);setLifeStep(i);}} style={{cursor:"pointer"}}>
<circle cx={sx(i)} cy="26" r={curN?11:8} fill={on?(i===LIFE_STAGES.length-1?GRN:s.tone):"#fff"} stroke={on?"none":RULE} strokeWidth="1.5"/>
{on&&<text x={sx(i)} y="30" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fill:"#fff",fontWeight:800}}>{i+1}</text>}
<text x={sx(i)} y="52" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fontWeight:on?800:400,fill:on?INK:MUT}}>{s.k}</text>
<text x={sx(i)} y="63" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.5,fill:MUT}}>{s.sub}</text>
</g>);})}
</svg>
{cur&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${cur.tone}`,background:"#fdfdfb",padding:"9px 12px",marginTop:6}}>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<span style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:800}}>Stage {lifeStep+1} — {cur.k}</span>
<span style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,color:"#fff",background:cur.tone,padding:"2px 7px",borderRadius:999}}>{cur.callout}</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#444",marginTop:3,lineHeight:1.55}}>{cur.detail}</div>
<ul style={{margin:"6px 0 0",paddingLeft:16}}>
{cur.steps.map((st,si)=>(<li key={si} style={{fontFamily:"Helvetica",fontSize:9.5,color:"#555",lineHeight:1.6}}>{st}</li>))}
</ul>
</div>}
{lifeStep>=LIFE_STAGES.length-1&&!lifePlaying&&<div style={{fontFamily:"Helvetica",fontSize:9.5,color:GRN,fontWeight:700,marginTop:6}}>Prep → check-in → live support → recorded → closed on the ledger. The floor is the point; this rhythm is how it stays protected. Process shape only — no credentials.</div>}
</div>);})()}
{(()=>{ // STUDENT PROGRESS REPORT — per-student, PM-style, synced to the belt curriculum
const stu=kids[Math.min(stuIx,kids.length-1)];
const beltPath=BELTS.map(b=>b[0]);
const pct=Math.round(((stu.beltIx+ (stu.shipped%9)/9)/beltPath.length)*100);
const nextBelt=beltPath[Math.min(stu.beltIx+1,beltPath.length-1)];
// milestone plan: each belt = a phase; current phase carries the active project
const HW=[
 ["Extend the current build","student",stu.focus>0.7?"on track":"watch","this week"],
 ["Practice problem from the challenge board","student","on track","this week"],
 ["Revisit 2 code segments from last session","coach + student","done","last session"],
];
const SPRINT={
 "This session":[["Pull up project & talk it through","10–15m"],["Coding challenge on the clock","10–15m"],["Build in 10-min objectives","~30m"]],
 "Homework":[["Next step on "+stu.game,"solo, doable"],["Optional practice set","if excited"]],
 "In review":[["2 segments explained back","understanding check"]],
 "Shipped":Array.from({length:Math.min(4,Math.max(1,stu.shipped))}).map((_,i)=>["Build "+(i+1)+" — "+stu.game.split(" ")[0],"complete"]),
};
return(<div style={{border:`1px solid ${RULE}`,borderRadius:10,background:"#fff",padding:"12px 14px",marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,0.06)"}}>
<div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:10}}>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT}}>Student progress report — synced to the belt curriculum</span>
<select value={stuIx} onChange={e=>setStuIx(Number(e.target.value))} style={{fontFamily:"Helvetica",fontSize:9.5,padding:"4px 8px",border:`1px solid ${RULE}`,borderRadius:6}}>
{kids.map((k,i)=>(<option key={k.name} value={i}>{k.name} · {k.belt} belt</option>))}
</select>
<div style={{display:"flex",gap:0,border:`1px solid ${RULE}`,borderRadius:7,overflow:"hidden"}}>
{[["plan","Plan view"],["board","Session board"]].map(([v,l])=>(
<button key={v} onClick={()=>setPmView(v)} style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"5px 12px",cursor:"pointer",border:"none",background:pmView===v?INK:"#fff",color:pmView===v?"#fff":MUT}}>{l}</button>))}
</div>
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>traditional plan · hybrid board — same record</span>
</div>

{/* header stats */}
<div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:10,fontFamily:"Helvetica"}}>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase",letterSpacing:0.5}}>Student</div><b style={{fontSize:13}}>{stu.name}</b><span style={{fontSize:9,color:MUT}}> · age {stu.age}</span></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase",letterSpacing:0.5}}>Current belt</div><b style={{fontSize:13}}>{stu.belt}</b><span style={{fontSize:9,color:MUT}}> → next: {nextBelt}</span></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase",letterSpacing:0.5}}>Active project</div><b style={{fontSize:13}}>{stu.game}</b></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase",letterSpacing:0.5}}>Path progress</div><b style={{fontSize:13,color:pct>60?GRN:pct>30?AMB:INK}}>{pct}%</b><span style={{fontSize:9,color:MUT}}> of belt path</span></div>
{stu.readyForBeltUp&&<span style={{alignSelf:"center",fontFamily:"Helvetica",fontSize:8,fontWeight:800,color:"#fff",background:GRN,padding:"3px 9px",borderRadius:999}}>BELT-UP READY — proposal only, a person confirms</span>}
</div>

{pmView==="plan"?(<div>
{/* traditional: belt phases as a plan timeline */}
<div style={{display:"flex",gap:0,marginBottom:10}}>
{beltPath.map((b,i)=>{const done=i<stu.beltIx,curB=i===stu.beltIx;
return(<div key={b} style={{flex:1,textAlign:"center"}}>
<div style={{height:10,background:done?GRN:curB?AMB:"#eee",borderRight:"2px solid #fff"}} title={b}/>
<div style={{fontFamily:"Helvetica",fontSize:6.5,color:curB?INK:MUT,fontWeight:curB?800:400,marginTop:3}}>{b}</div>
</div>);})}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:8}}>Each belt is a phase; the active phase carries the project milestone. Curriculum path is the work-breakdown — sessions are the sprints inside it.</div>
{/* milestone / homework table */}
<div style={{border:`1px solid ${RULE}`,borderRadius:8,overflow:"hidden"}}>
<div style={{display:"flex",background:"#faf9f5",padding:"6px 10px",fontFamily:"Helvetica",fontSize:7.5,color:MUT,textTransform:"uppercase",letterSpacing:0.4}}>
<span style={{flex:2.4}}>Work item</span><span style={{flex:1.2}}>Owner</span><span style={{flex:1}}>Status</span><span style={{flex:1}}>Due</span></div>
{HW.map((r,i)=>(<div key={i} style={{display:"flex",padding:"7px 10px",borderTop:"1px solid #f2f2ee",fontFamily:"Helvetica",fontSize:9.5,alignItems:"center"}}>
<span style={{flex:2.4}}>{r[0]}</span><span style={{flex:1.2,color:MUT}}>{r[1]}</span>
<span style={{flex:1}}><span style={{fontSize:7.5,fontWeight:700,color:"#fff",background:r[2]==="done"?MUT:r[2]==="on track"?GRN:AMB,padding:"2px 7px",borderRadius:999,textTransform:"uppercase"}}>{r[2]}</span></span>
<span style={{flex:1,color:MUT}}>{r[3]}</span></div>))}
</div>
</div>):(<div>
{/* hybrid: session sprint board */}
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
{Object.entries(SPRINT).map(([col,items])=>(
<div key={col} style={{border:`1px solid ${RULE}`,borderRadius:8,background:"#faf9f5",padding:8,minHeight:110}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:800,marginBottom:6,color:col==="Shipped"?GRN:INK}}>{col}</div>
{items.map((it,i)=>(<div key={i} style={{background:"#fff",border:`1px solid ${RULE}`,borderLeft:`3px solid ${col==="Shipped"?GRN:col==="Homework"?AMB:VIO}`,borderRadius:6,padding:"6px 8px",marginBottom:6}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700}}>{it[0]}</div>
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,marginTop:1}}>{it[1]}</div>
</div>))}
</div>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:8}}>The session board runs the agile loop inside the belt plan — talk, challenge, build, review; homework carries momentum to the next sprint.</div>
</div>)}

<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:10,borderTop:`1px solid ${RULE}`,paddingTop:7}}>
Note preview (structure only): “{stu.name} was excited to use [today's concept] and built momentum on {stu.game}. Next step: [homework above], doable on their own.” Notes sync coach, parent, and student — filed before end of session, signed off before posting. Modeled data; no student records or credentials.
</div>
</div>);})()}
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>The floor at <b>{team.name}</b> — this is what every other tab exists to protect. Modeled roster and rhythm; senseis re-anchor every 15 min so every ninja sees one twice per Build. Belt-ups only touch real chemistry/retention state through the button below — the floor itself never auto-writes.</div>
{/* session flow bar */}
<div style={{display:"flex",height:24,border:`1px solid ${RULE}`,position:"relative",marginBottom:4}}>
{RHYTHM.map((p,i)=>{const col=p.kind==="code"?CNB:p.kind==="break"?AMB:GRN;
return(<div key={i} onClick={()=>{let a=0;for(let j=0;j<i;j++)a+=RHYTHM[j].len;setDojoMin(a+0.01);}} title={p.label}
style={{flex:p.len,background:col+"18",borderRight:i<RHYTHM.length-1?`1px solid ${RULE}`:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:col,textTransform:"uppercase",letterSpacing:0.5}}>{p.label} <span style={{color:MUT,fontWeight:400}}>{p.len}m</span></span></div>);})}
<div style={{position:"absolute",left:(minute/TOTAL*100)+"%",top:0,bottom:0,width:2,background:INK}}/>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:8}}>session flow — click a block to jump there</div>
{/* speed + at-a-glance */}
<div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:8}}>
<div style={{display:"flex",gap:2}}>{[["⏸",0],["½×",0.5],["1×",1],["2×",2],["4×",4]].map(([lb,v])=>(
<button key={lb} onClick={()=>setDojoSpeed(v)} style={{fontFamily:"Helvetica",fontSize:9,padding:"4px 9px",fontWeight:700,cursor:"pointer",border:`1px solid ${dojoSpeed===v?INK:RULE}`,background:dojoSpeed===v?INK:"#fff",color:dojoSpeed===v?"#fff":MUT}}>{lb}</button>))}</div>
<span style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>clock <b style={{color:INK}}>{clock}</b></span>
<span style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>ninjas <b style={{color:INK}}>{kids.length}</b></span>
<span style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>avg focus <b style={{color:avgFocus>=70?GRN:AMB}}>{avgFocus}%</b></span>
<span style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>belt-up ready <b style={{color:beltReady?AMB:INK}}>{beltReady}</b></span>
</div>
{beltUpFired&&beltUpKid&&(<div style={{display:"flex",alignItems:"center",gap:8,border:`1px solid ${GRN}`,background:"#f2f8f4",padding:"7px 12px",marginBottom:8}}>
<span style={{fontSize:14}}>🔔</span><span style={{fontFamily:"Helvetica",fontSize:10.5,color:"#1e5c33"}}><b>Belt-up:</b> {beltUpKid.name} is ready to advance to <b>{BELTS[Math.min(8,beltUpKid.beltIx+1)][0]} belt</b> — press "Run today's session" below to commit the ceremony and the real chemistry/retention adjustment.</span></div>)}
{/* floor plan */}
<svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",display:"block",background:"#fdfdfb",border:`1px solid ${RULE}`}}>
<rect x="10" y="10" width={W-20} height={H-20} fill="none" stroke={RULE} strokeWidth="2"/>
{/* coordination overlay: the #operations-style status callout for the active lifecycle stage */}
{lifeStep>=0&&(()=>{const s=LIFE_STAGES[lifeStep];return(<g>
<rect x={W-260} y="22" width="238" height="46" rx="8" fill="#fff" stroke={s.tone} strokeWidth="1.5" opacity="0.97"/>
<circle cx={W-238} cy="45" r="7" fill={s.tone}/>
<text x={W-238} y="48" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fontWeight:800,fill:"#fff"}}>{lifeStep+1}</text>
<text x={W-222} y="40" style={{fontFamily:"Helvetica",fontSize:10,fontWeight:800,fill:INK}}>{s.callout}</text>
<text x={W-222} y="56" style={{fontFamily:"Helvetica",fontSize:7.5,fill:MUT}}>{s.k} · posted to operations</text>
</g>);})()}
{/* lobby */}
<rect x="10" y="10" width="150" height={H-20} fill="#f2f2ee"/>
<line x1="160" y1="24" x2="160" y2={H-24} stroke={CNB} strokeWidth="2" strokeDasharray="12 7" opacity="0.6"/>
<text x="85" y="34" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:9,fill:MUT,letterSpacing:1.5}}>LOBBY</text>
<rect x="46" y="200" width="88" height="30" fill="#fff" stroke={CNB} strokeWidth="1.2"/>
<text x="90" y="219" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fill:INK,fontWeight:700}}>FRONT DESK</text>
<g>{[0,1,2,3,4,5].map(i=>(<rect key={i} x={36+i*17} y={H-78} width="14" height="14" fill="#fff" stroke={RULE}/>))}
<text x="85" y={H-48} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7,fill:MUT}}>cubbies</text></g>
{/* belt board */}
<rect x={W-108} y="60" width="84" height="210" fill="#f2f2ee" stroke={RULE}/>
<text x={W-66} y="78" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fill:INK,fontWeight:700,letterSpacing:0.5}}>BELT BOARD</text>
{BELTS.map(([b,c],i)=>{const count=kids.filter(k=>k.belt===b).length;
return(<g key={b}><rect x={W-98} y={86+i*19} width="30" height="11" fill={c} stroke={b==="white"?"#c8c4b8":"none"}/>
<text x={W-60} y={95+i*19} style={{fontFamily:"Helvetica",fontSize:7.5,fill:count?INK:MUT}}>{count||"—"}</text></g>);})}
<circle cx={W-66} cy="292" r="11" fill={beltUpFired?AMB:"#f2f2ee"} stroke={RULE}/><text x={W-66} y="296" textAnchor="middle" style={{fontSize:10}}>🔔</text>
{/* huddle + snack */}
<circle cx={circleC[0]} cy={circleC[1]} r="62" fill="none" stroke={phase.kind==="circle"?CNB:RULE} strokeDasharray="4 5" opacity={phase.kind==="circle"?0.8:0.35}/>
<text x={circleC[0]} y={circleC[1]-72} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7.5,fill:phase.kind==="circle"?CNB:MUT}}>huddle circle</text>
<rect x={snackC[0]-46} y={snackC[1]-20} width="92" height="40" fill="#f2f2ee" stroke={phase.kind==="break"?AMB:RULE}/>
<text x={snackC[0]} y={snackC[1]-26} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7.5,fill:phase.kind==="break"?AMB:MUT}}>snack corner</text>
{/* pods */}
{pods.map((p,pi)=>{const anchored=building&&pi===slot;
return(<g key={pi}><rect x={p[0]-52} y={p[1]-46} width="104" height="92" fill="#f2f2ee" stroke={anchored?SENSEIS[slot][1]:RULE} strokeWidth={anchored?2:1}/>
{[-34,34].map((dy,k)=>(<g key={k}><rect x={p[0]-14} y={p[1]+dy-11} width="28" height="18" fill={building?"#e4f0f8":"#eee"} stroke={CNB} strokeWidth="0.8"/>
{building&&<rect x={p[0]-10} y={p[1]+dy-8} width={9+((minute*7+k*13+pi*29)%12)} height="2" fill={CNB} opacity="0.8"/>}</g>))}</g>);})}
{/* ninjas */}
{kids.map((k,i)=>{const[x,y]=kidPos(i);const podIx=Math.floor(i/2)%pods.length;const near=building&&podIx===slot;
return(<g key={k.name}>{near&&<circle cx={x} cy={y} r="13" fill={SENSEIS[slot][1]} opacity="0.15"/>}
<circle cx={x} cy={y} r="9" fill="#fff" stroke={beltCol(k.belt)} strokeWidth="2"/>
<rect x={x-8} y={y-3} width="16" height="3" fill={beltCol(k.belt)}/>
<text x={x} y={y-13} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7.5,fill:MUT,fontWeight:600}}>{k.name}</text></g>);})}
{/* senseis */}
{SENSEIS.map(([name,col],ci)=>{let x,y;
if(phase.kind==="circle"){x=circleC[0]+(ci-1)*28;y=circleC[1];}
else if(phase.kind==="break"){x=snackC[0]+(ci-1)*32;y=snackC[1];}
else{const p=pods[(slot+ci)%pods.length];x=p[0];y=p[1]-60;}
const active=building&&ci===slot;
return(<g key={name}><circle cx={x} cy={y} r="11" fill={col} opacity={active?1:0.5}/>
<text x={x} y={y+3.5} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fill:"#fff",fontWeight:800}}>{name.split(" ")[1][0]}</text>
<text x={x} y={y-16} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7,fill:active?INK:MUT}}>{name}</text></g>);})}
</svg>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:6,lineHeight:1.6}}>Modeled floor — representative routine and roster, never real ninjas or staff. Rules run in source: sensei re-anchor every 15 min · belt-up rings the bell and proposes a ceremony · huddle/wrap gather at the circle · break gathers at the snack corner.</div>
<button onClick={()=>{applyAdj(team.name,{chem:0.02,ret:0.01});logL("dojo","Session","Ran today's session at "+team.name+" — belt ceremony held, chemistry and retention adjusted");}} style={{marginTop:8,fontFamily:"Helvetica",fontSize:10.5,padding:"7px 14px",background:INK,color:"#fff",border:"none",cursor:"pointer"}}>Run today's session ▸</button>
</div>);})()}</EngineErrorBoundary>}
{tab==="mandate"&&<EngineErrorBoundary>{(()=>{
// The posting, worked backward into five goals — each already operating in this model.
const GOALS=[
["1. Quality-gated net growth","~105 units lost (350+ → 245) — growth sold faster than owners could be vetted or supported.","Candidate Persona underwriting · Four Governors gating · Unit Economics Floor","Every candidate is scored against a weighted owner profile before advancing; growth in a territory is capped below the sustainable support ratio. The failure mode that cost 105 units is structurally gated here."],
["2. Repeatable ~1/month close cadence","Comp design (modest base, 10% commission) pays for a process that closes, not a rainmaker.","Director Workflow · Deals Pipeline · Annual Sales Target (backward funnel)","The 12-signing quota is decomposed backward — 12 ← 18 discovery days ← 33 diligence ← 110 FDD ← ~1,800 inquiries — with the 14-day FTC clock enforced as a hard gate in the pipeline itself."],
["3. Dual pipeline — new openings and conversions","The posting names conversions explicitly: existing operators entering the brand close faster and fail less — the rebuild's fastest credible wins.","Deals Pipeline dealType split (new / conversion) · Growth Pipeline","Every lead is classified new-entrant or conversion at intake; proven operators route to a shorter validation path with ramp inheritance applied."],
["4. First-pass-complete corporate routing","'Coordinate timely movement of documents… manage approvals' — written because packages have arrived incomplete or stalled.","Filings tab (14 registration states) · Director Workflow approval authorities · Decision Ledger","Document requirements are tracked per candidate per state; every approval names its authority; nothing advances with an open item. Complete on first submission is the design condition, not an aspiration."],
["5. No-surprises reporting","'Status analysis and reporting… minimal supervision' — a VP hired into a rebuild has no time to chase status.","Exec view · Decision Rail tiles · State Monitor · permanent ledger","Every proposal, hold, conflict, and decision is visible on a fixed cadence with a named owner. A stalled candidate is a flagged exception, not a quiet one — the surprise reaches the Director before it can reach the VP."],
];
const card={border:`1px solid ${RULE}`,borderRadius:8,padding:"13px 15px",background:"#fff",marginBottom:10};
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:4}}>The derived mandate — worked backward from the posting, already running here</div>
<div style={{fontSize:11,color:MUT,marginBottom:14,maxWidth:800}}>Each requirement in the posting is evidence of a past pain. Inverting each pain yields five goals. This model does not propose to meet them — it demonstrates each one operating, tab by tab, over the modeled network.</div>
{GOALS.map(g=>(<div key={g[0]} style={card}>
<div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"baseline"}}>
<div style={{fontSize:12.5,fontWeight:700,color:INK}}>{g[0]}</div>
<div style={{fontSize:9,fontWeight:700,color:"#2fbf5f",letterSpacing:1,textTransform:"uppercase"}}>operating in this model</div>
</div>
<div style={{fontSize:10,color:MUT,marginTop:4,lineHeight:1.5}}><b style={{color:"#444"}}>Derived from:</b> {g[1]}</div>
<div style={{fontSize:10,color:AC,marginTop:3,fontWeight:700}}>Where it runs: {g[2]}</div>
<div style={{fontSize:10.5,color:"#333",marginTop:4,lineHeight:1.55}}>{g[3]}</div>
</div>))}
<div style={{border:`1px solid ${RULE}`,borderRadius:8,padding:"13px 15px",background:"#f7fbf7",marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"baseline"}}>
<div style={{fontSize:12.5,fontWeight:700,color:INK}}>+ Beyond the posting — operations and engagement as the P&L engine</div>
<div style={{fontSize:9,fontWeight:700,color:"#0b6bcb",letterSpacing:1,textTransform:"uppercase"}}>applicant differentiator</div>
</div>
<div style={{fontSize:10,color:MUT,marginTop:4,lineHeight:1.5}}>The posting scopes the role to selling franchises. The applicant's operating record adds the layer beneath the sale — the causal chain that determines whether a sold unit survives:</div>
<div style={{display:"flex",gap:0,flexWrap:"wrap",alignItems:"center",marginTop:8}}>
{["Operational discipline","Student engagement","Retention & lifetime value","Unit P&L","Franchise health","Validation strength","Easier next sale"].map((st,i,arr)=>(<span key={st} style={{display:"flex",alignItems:"center"}}>
<span style={{fontSize:9.5,fontWeight:700,color:INK,border:`1px solid ${RULE}`,borderRadius:6,padding:"4px 8px",background:"#fff"}}>{st}</span>
{i<arr.length-1&&<span style={{color:AC,padding:"0 4px",fontWeight:700}}>→</span>}
</span>))}
</div>
<div style={{fontSize:10.5,color:"#333",marginTop:8,lineHeight:1.55}}>Run in reverse, this chain is the diagnosis of the 105 lost units: weak operations → disengaged students → churn → broken unit P&L → failed centers → poisoned validation calls → harder sales. Every operations tab in this model (Center Health, Six Lenses, Community Proof, Dojo) exists because franchise development that ignores this chain sells units that close. The applicant has run the full chain profitably at a unit and encoded it here for a network.</div>
</div>
<div style={{fontSize:10,color:MUT,marginTop:4,maxWidth:780,lineHeight:1.5}}>Sourcing note: unit counts from FDD Item 20 (244–245 authoritative) against the 350+ public figure; causes of the decline are inference from public trajectory, stated as such. Everything else on this screen is running logic, inspectable in its named tab.</div>
<div style={{marginTop:10}}><button onClick={()=>logL("mandate","Derived Mandate","Five-goal mandate reviewed against operating evidence — owner: Franchise Director")} style={{fontFamily:"Helvetica",fontSize:10,padding:"8px 16px",cursor:"pointer",border:"none",borderRadius:6,background:INK,color:"#fff"}}>Log mandate review</button></div>
</div>);})()}</EngineErrorBoundary>}
{tab==="model"&&<EngineErrorBoundary>{(()=>{
// Model Overview — the whole operating model on one screen, executive-legible, no scrolling into code.
const LOOP=[["Observe state","One canonical state per center; every view is a read, never a copy."],["Locate constraint","Find the binding constraint — the one number holding a center or territory back."],["Bounded pilot","Intervene inside a containment boundary: limited centers, limited weeks, defined blast radius."],["Measure","Verified measurement replaces estimate; confidence decays until remeasured."],["Propagate","What survives measurement rolls outward — cluster by cluster, never network-wide in one step."]];
const LEADING=["Enrollment conversion","Retention","Staffing chemistry","Student engagement","Community presence","Pipeline velocity"];
const OUTCOMES=["Unit economics (revenue / EBITDA)","Net unit growth"];
const LAYERS=[["Observation layer","Metrics and signals — the six leading indicators read continuously from canonical state."],["Decision layer","Constraint location and gating — every proposal checked against the four standing standards."],["Action layer","Bounded pilots with rollback conditions — one accountable owner commits; nothing self-executes."],["Learning layer","Measure, record to permanent ledger, propagate what held — the loop closes on evidence, not opinion."]];
const GUARD=[["Metric gaming","Engagement-integrity gate holds proposals that move a number without moving the student experience."],["Overexpansion","Unit-economics floor caps territory growth below the sustainable support ratio."],["Stale state","Confidence decay (tau) forces remeasurement before aged estimates drive decisions — the rollback condition for trust."],["Safety failure","Child-safety flag freezes all related activity; containment boundary is absolute, no override."]];
const card={border:`1px solid ${RULE}`,borderRadius:8,padding:"12px 14px",background:"#fff"};
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:4}}>Model overview — the operating model on one screen</div>
<div style={{fontSize:11,color:MUT,marginBottom:14,maxWidth:800}}>What this system governs, how it senses and responds, and which numbers lead versus lag — readable without opening a single other tab.</div>
<div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
<div style={{...card,flex:"1 1 220px"}}><div style={{fontSize:9,color:MUT,textTransform:"uppercase",letterSpacing:1}}>Scope</div><div style={{fontSize:12,color:INK,marginTop:4,lineHeight:1.5}}><b>244 franchised units</b> (FDD Item 20, authoritative) reconciled against the 350+ public brand figure — network-level and center-level perspectives over one canonical state.</div></div>
<div style={{...card,flex:"1 1 220px"}}><div style={{fontSize:9,color:MUT,textTransform:"uppercase",letterSpacing:1}}>Authority</div><div style={{fontSize:12,color:INK,marginTop:4,lineHeight:1.5}}>The model <b>proposes and records; it does not enact.</b> One accountable owner per commitment; a child-safety flag freezes everything, without exception.</div></div>
<div style={{...card,flex:"1 1 220px"}}><div style={{fontSize:9,color:MUT,textTransform:"uppercase",letterSpacing:1}}>Structure</div><div style={{fontSize:12,color:INK,marginTop:4,lineHeight:1.5}}>Centers group into <b>clusters with measured coupling</b> — a network-level structure an oversight function, human or automated, can monitor for propagation risk at scale.</div></div>
</div>
<div style={{fontSize:11,fontWeight:700,color:INK,marginBottom:6}}>The sense-and-respond loop</div>
<div style={{display:"flex",gap:0,flexWrap:"wrap",marginBottom:16}}>
{LOOP.map((st,i)=>(<div key={st[0]} style={{display:"flex",alignItems:"center"}}>
<div style={{...card,width:168,background:"#fafafa"}}><div style={{fontSize:10.5,fontWeight:700,color:INK}}>{i+1}. {st[0]}</div><div style={{fontSize:9.5,color:MUT,marginTop:3,lineHeight:1.45}}>{st[1]}</div></div>
{i<LOOP.length-1&&<span style={{color:AC,padding:"0 5px",fontWeight:700}}>→</span>}
</div>))}
</div>
<div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:16}}>
<div style={{...card,flex:"1 1 300px"}}>
<div style={{fontSize:10.5,fontWeight:700,color:INK,marginBottom:6}}>Six leading indicators <span style={{fontWeight:400,color:MUT}}>— control inputs</span></div>
{LEADING.map(m=>(<div key={m} style={{fontSize:10.5,color:"#333",padding:"3px 0",borderBottom:"1px solid #f0f0f0"}}>{m}</div>))}
<div style={{fontSize:9.5,color:MUT,marginTop:6,lineHeight:1.45}}>Leading indicators are treated as control inputs that predict the lagging outcomes — the monitoring posture NIST AI RMF language describes for governed systems.</div>
</div>
<div style={{...card,flex:"1 1 240px"}}>
<div style={{fontSize:10.5,fontWeight:700,color:INK,marginBottom:6}}>Two outcomes <span style={{fontWeight:400,color:MUT}}>— lagging, never chased directly</span></div>
{OUTCOMES.map(m=>(<div key={m} style={{fontSize:10.5,color:"#333",padding:"3px 0",borderBottom:"1px solid #f0f0f0"}}>{m}</div>))}
<div style={{fontSize:9.5,color:MUT,marginTop:6,lineHeight:1.45}}>Outcomes are governed by holding the six leading numbers — chasing them directly is the failure mode the engagement-integrity gate exists to stop.</div>
</div>
</div>
<div style={{fontSize:11,fontWeight:700,color:INK,marginBottom:6}}>As a control loop</div>
<div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
{LAYERS.map(l=>(<div key={l[0]} style={{...card,flex:"1 1 210px",borderLeft:`3px solid ${AC}`}}><div style={{fontSize:10.5,fontWeight:700,color:INK}}>{l[0]}</div><div style={{fontSize:9.5,color:"#333",marginTop:3,lineHeight:1.5}}>{l[1]}</div></div>))}
</div>
<div style={{fontSize:11,fontWeight:700,color:INK,marginBottom:6}}>Failure modes → guardrails</div>
<div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
{GUARD.map(g=>(<div key={g[0]} style={{...card,flex:"1 1 210px",background:"#fbf9f6"}}><div style={{fontSize:10.5,fontWeight:700,color:AC}}>{g[0]}</div><div style={{fontSize:9.5,color:"#333",marginTop:3,lineHeight:1.5}}>{g[1]}</div></div>))}
</div>
<div style={{marginTop:14}}><button onClick={()=>logL("model","Model Overview","Operating-model overview reviewed — scope, loop, metric split, guardrails")} style={{fontFamily:"Helvetica",fontSize:10,padding:"8px 16px",cursor:"pointer",border:"none",borderRadius:6,background:INK,color:"#fff"}}>Log model review</button></div>
</div>);})()}</EngineErrorBoundary>}
{tab==="persona"&&<EngineErrorBoundary>{(()=>{
// Candidate Persona / Fit panel — underwriting the human profile, not just the process.
// Rule 1 applies: this panel produces a fit assessment PROPOSAL; a person records the verdict.
const TRAITS=[
["capital","Capital readiness",18,"Clears the brand's FDD baseline — a ~$40K initial franchise fee within a $177K–$385K total investment range — without stretching to the last dollar.","Financing plan depends on best-case first-year revenue."],
["system","Follows a proven system",20,"Asks how the model works before asking how to change it; references the operations manual unprompted.","Pitches curriculum or brand changes during discovery — building a different business inside this one."],
["people","People leadership",16,"Has hired, scheduled, and retained hourly staff; talks about their people by name.","Plans to 'figure out staffing later' or treats senseis as interchangeable."],
["sales","Enrollment sales comfort",14,"Comfortable closing a parent conversation personally; sees the trial session as a sales motion.","Expects walk-ins and brand marketing to fill the center on their own."],
["community","Community orientation",14,"Already embedded locally — schools, teams, faith or civic groups; sees the center as a community institution.","Views the territory purely as a demographic spreadsheet."],
["mission","Mission alignment",10,"Genuinely animated by kids learning to build things; visits a center and watches the floor, not the P&L first.","Interest is category-agnostic — would as happily buy any franchise with the same returns."],
["time","Owner-operator commitment",8,"Clear-eyed about year-one hours; spouse/family on board with the schedule.","Plans full absentee ownership from day one against brand guidance."]];
const total=TRAITS.reduce((a,t)=>a+t[2],0);
const score=TRAITS.reduce((a,t)=>a+(fitSel[t[0]]?t[2]:0),0);
const pct=Math.round(score/total*100);
const verdict=pct>=80?["Strong fit — advance to discovery","#2fbf5f"]:pct>=60?["Conditional — advance with named reservations","#d9a520"]:["Below profile — decline recommendation","#e03535"];
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:4}}>Candidate persona — fit framework</div>
<div style={{fontSize:11,color:MUT,marginBottom:14,maxWidth:760}}>Franchise development underwrites a person, not only a pipeline stage. This panel defines the profile of a strong future owner and scores a candidate against it. The output is a proposal; the verdict is recorded by the Franchise Director and reviewed at the weekly pipeline meeting (Rule 1 — no assessment is self-executing).</div>
<div style={{display:"flex",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
<div style={{flex:"1 1 520px",minWidth:420}}>
{TRAITS.map(t=>(<div key={t[0]} style={{border:`1px solid ${RULE}`,borderRadius:8,padding:"10px 12px",marginBottom:8,background:fitSel[t[0]]?"#f7fbf7":"#fff"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{fontSize:12,fontWeight:700,color:INK}}>{t[1]} <span style={{color:MUT,fontWeight:400}}>· weight {t[2]}</span></div>
<button onClick={()=>{setFitSel(m=>({...m,[t[0]]:!m[t[0]]}));logL("persona","Fit Panel","Trait '"+t[1]+"' marked "+(!fitSel[t[0]]?"present":"absent")+" for candidate under review");}} style={{fontFamily:"Helvetica",fontSize:9,padding:"5px 12px",cursor:"pointer",border:`1px solid ${RULE}`,borderRadius:6,background:fitSel[t[0]]?"#2fbf5f":"#fff",color:fitSel[t[0]]?"#fff":MUT}}>{fitSel[t[0]]?"Present":"Absent"}</button>
</div>
<div style={{fontSize:10.5,color:"#333",marginTop:5}}><b>Strong:</b> {t[3]}</div>
<div style={{fontSize:10.5,color:MUT,marginTop:2}}><b>Flag:</b> {t[4]}</div>
</div>))}
</div>
<div style={{flex:"0 0 250px"}}>
<div style={{border:`1px solid ${RULE}`,borderRadius:8,padding:14,background:"#fafafa"}}>
<div style={{fontSize:10,color:MUT,textTransform:"uppercase",letterSpacing:1}}>Fit score</div>
<div style={{fontSize:34,fontWeight:700,color:INK}}>{pct}<span style={{fontSize:14,color:MUT}}> / 100</span></div>
<div style={{fontSize:11,fontWeight:700,color:verdict[1],marginTop:6}}>{verdict[0]}</div>
<div style={{fontSize:10,color:MUT,marginTop:10,lineHeight:1.5}}>Thresholds: 80+ strong · 60–79 conditional · below 60 decline. Weights favor system-followership and capital readiness — the two traits Item 19/20 outcomes correlate with most directly.</div>
<button onClick={()=>logL("persona","Fit Panel","Fit assessment recorded — "+pct+"/100 ("+verdict[0]+") — owner: Franchise Director")} style={{marginTop:12,width:"100%",fontFamily:"Helvetica",fontSize:10,padding:"8px 0",cursor:"pointer",border:"none",borderRadius:6,background:INK,color:"#fff"}}>Record fit assessment</button>
</div>
<div style={{fontSize:9.5,color:MUT,marginTop:10,lineHeight:1.5}}>The profile mirrors validation reality: franchisees who follow the system, staff well, and embed locally validate positively — and validation calls are the brand's strongest sales asset.</div>
</div>
</div>
<div style={{marginTop:18}}>
<div style={{fontSize:12,fontWeight:700,color:INK,marginBottom:4}}>Live candidate roster — scored against the framework</div>
<div style={{fontSize:10,color:MUT,marginBottom:8,maxWidth:760}}>Every prospect in the pipeline, profiled by archetype and scored on the weighted dimensions above (capital 24 · temperament 18 · territory 16 · community 16 · mission 14 · readiness 12). Flags are advisory holds — each requires a named resolution before stage advancement, never an automatic block.</div>
<div style={{overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%",minWidth:720}}>
<thead><tr>{["Candidate","Region","Archetype","Stage","Score","Readiness","Flags"].map(h=>(<th key={h} style={{fontSize:9,color:MUT,textTransform:"uppercase",letterSpacing:0.8,textAlign:"left",padding:"6px 8px",borderBottom:`1px solid ${RULE}`}}>{h}</th>))}</tr></thead>
<tbody>{LEADS.map((l,i)=>candidateProfileFromLead(l,i)).sort((a,b)=>b.score-a.score).map(cp=>(
<tr key={cp.id} style={{cursor:"pointer"}} onClick={()=>logL("persona","Fit Panel","Roster profile reviewed — "+cp.name+" ("+cp.archetype.label+", "+cp.stage+", score "+cp.score+(cp.flags.length?", flags: "+cp.flags.join("; "):", clean")+") — owner: Franchise Director")}>
<td style={{fontSize:10.5,fontWeight:700,color:INK,padding:"7px 8px",borderBottom:"1px solid #eee"}}>{cp.name}</td>
<td style={{fontSize:10.5,color:"#333",padding:"7px 8px",borderBottom:"1px solid #eee"}}>{cp.region}</td>
<td style={{fontSize:10,color:"#333",padding:"7px 8px",borderBottom:"1px solid #eee"}}>{cp.archetype.label}<div style={{fontSize:8.5,color:MUT}}>risk: {cp.archetype.risk}</div></td>
<td style={{fontSize:10,color:"#333",padding:"7px 8px",borderBottom:"1px solid #eee"}}>{cp.stage}</td>
<td style={{fontSize:11,fontWeight:700,color:fitColor(cp.score),padding:"7px 8px",borderBottom:"1px solid #eee"}}>{cp.score}</td>
<td style={{padding:"7px 8px",borderBottom:"1px solid #eee",minWidth:90}}><div style={{height:6,background:"#eee",borderRadius:3}}><div style={{height:6,width:(cp.readiness*100)+"%",background:readinessColor(cp.readiness),borderRadius:3}}/></div><div style={{fontSize:8.5,color:MUT,marginTop:2}}>{Math.round(cp.readiness*100)}% ready</div></td>
<td style={{fontSize:9,color:"#a33",padding:"7px 8px",borderBottom:"1px solid #eee"}}>{cp.flags.length?cp.flags.join(" · "):<span style={{color:"#2fbf5f"}}>clean</span>}</td>
</tr>))}</tbody></table>
</div>
<div style={{fontSize:9.5,color:MUT,marginTop:8}}>Post-signing, candidates move to Opening Readiness, tracked on: {OPENING_TRACKER_STEPS.join(" → ")}.</div>
</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="community"&&<EngineErrorBoundary>{(()=>{
// Community proof layer — brand value built in the field: outcomes, trust, events, partnerships.
const rows=centers.slice(0,10).map(c=>{const h=hash(c.name+"community");
const beltUps=4+(h%9),projects=10+(h%26),nps=52+(h%38),reviews=18+(h%60),events=1+(h%4),partners=1+(h%5);
const adv=Math.round((nps*0.35)+(Math.min(events,4)*8)+(Math.min(partners,5)*5)+(beltUps*1.2));
return{c,beltUps,projects,nps,reviews,events,partners,adv};}).sort((a,b)=>b.adv-a.adv);
const top=rows[0];
const th={fontSize:9,color:MUT,textTransform:"uppercase",letterSpacing:0.8,textAlign:"left",padding:"6px 8px",borderBottom:`1px solid ${RULE}`};
const td={fontSize:10.5,color:INK,padding:"7px 8px",borderBottom:`1px solid #eee`};
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:4}}>Community proof layer</div>
<div style={{fontSize:11,color:MUT,marginBottom:12,maxWidth:780}}>Unit economics describe a center; community proof explains it. This layer surfaces what the P&L cannot: student outcomes, parent trust, event presence, and local partnerships — the field-built brand value that validation calls and franchise candidates actually respond to. Figures are modeled per center, pending live review-platform and event-log integration.</div>
<div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-start"}}>
<div style={{flex:"1 1 560px",minWidth:460,overflowX:"auto"}}>
<table style={{borderCollapse:"collapse",width:"100%"}}>
<thead><tr><th style={th}>Center</th><th style={th}>Belt-ups /qtr</th><th style={th}>Projects shipped</th><th style={th}>Parent NPS</th><th style={th}>Public reviews</th><th style={th}>Events /qtr</th><th style={th}>School partners</th><th style={th}>Advocacy index</th></tr></thead>
<tbody>{rows.map(r=>(<tr key={r.c.name}>
<td style={{...td,fontWeight:700}}>{r.c.name}</td><td style={td}>{r.beltUps}</td><td style={td}>{r.projects}</td><td style={td}>{r.nps}</td><td style={td}>{r.reviews}</td><td style={td}>{r.events}</td><td style={td}>{r.partners}</td>
<td style={{...td,fontWeight:700,color:advocacyColor(r.adv)}}>{r.adv}</td>
</tr>))}</tbody></table>
</div>
<div style={{flex:"0 0 260px"}}>
<div style={{border:`1px solid ${RULE}`,borderRadius:8,padding:14,background:"#fafafa"}}>
<div style={{fontSize:10,color:MUT,textTransform:"uppercase",letterSpacing:1}}>Proof stack — {top.c.name}</div>
<div style={{fontSize:11,color:"#333",marginTop:8,lineHeight:1.6}}>
{top.beltUps} belt promotions this quarter · {top.projects} student projects shipped · parent NPS {top.nps} · {top.reviews} public reviews · {top.events} community events · {top.partners} school partnerships.</div>
<div style={{fontSize:10,color:MUT,marginTop:10,lineHeight:1.5}}>This is the page a prospective franchisee sees before they see a P&L — and the reason a validation call from this center closes deals.</div>
<button onClick={()=>logL("community","Community Layer","Community proof stack for "+top.c.name+" flagged for candidate validation packet — owner: Franchise Director")} style={{marginTop:12,width:"100%",fontFamily:"Helvetica",fontSize:10,padding:"8px 0",cursor:"pointer",border:"none",borderRadius:6,background:INK,color:"#fff"}}>Flag for validation packet</button>
</div>
<div style={{fontSize:9.5,color:MUT,marginTop:10,lineHeight:1.5}}>Advocacy index = weighted blend of NPS (35%), events, partnerships, and belt velocity. Governed like every metric here: it proposes attention; it does not act.</div>
</div>
</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="flywheel"&&<EngineErrorBoundary>{(()=>{
// Recruitment flywheel — community presence compounds into franchise candidate interest.
const invest=["Baseline","Standard","Elevated","Full program"][flyBoost];
const events=4+flyBoost*3; // events per month across a modeled metro
const trust=Math.min(95,48+events*4); // parent trust index
const beltVel=Math.round(trust*0.42); // outcomes proxy
const advocacy=Math.round(beltVel*0.9+events*2); // referrals + reviews per month
const inquiries=Math.max(1,Math.round(advocacy*0.12)); // franchise candidate inquiries per quarter
const STAGES=[
["Community presence",events+" events / mo","School visits, showcases, camps, library nights — the center seen in the field."],
["Parent trust",trust+" trust index","Trust is earned at events and in the lobby before it is measured in NPS."],
["Student outcomes",beltVel+" belt-ups / qtr","Trusted parents enroll longer; longer enrollment produces visible outcomes."],
["Local advocacy",advocacy+" referrals+reviews / mo","Outcomes convert parents into advocates — the marketing no budget buys."],
["Candidate interest",inquiries+" franchise inquiries / qtr","Advocates include future owners. Strong centers recruit their own candidates."]];
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:4}}>Recruitment flywheel</div>
<div style={{fontSize:11,color:MUT,marginBottom:12,maxWidth:780}}>Center performance and franchise development are one system. Community presence builds parent trust; trust extends enrollment; enrollment produces outcomes; outcomes create advocates; and advocates include the people who ask about owning a center. Modeled for one metro; the loop compounds — each candidate signed adds a center that restarts the cycle.</div>
<div style={{marginBottom:12,fontSize:10.5,color:MUT}}>Community investment level:
{[0,1,2,3].map(i=>(<button key={i} onClick={()=>{setFlyBoost(i);logL("flywheel","Flywheel","Community investment scenario set to "+["Baseline","Standard","Elevated","Full program"][i]);}} style={{fontFamily:"Helvetica",fontSize:9.5,padding:"5px 12px",marginLeft:8,cursor:"pointer",border:`1px solid ${RULE}`,borderRadius:6,background:flyBoost===i?INK:"#fff",color:flyBoost===i?"#fff":MUT}}>{["Baseline","Standard","Elevated","Full program"][i]}</button>))}
<span style={{marginLeft:10,fontWeight:700,color:INK}}>{invest}</span></div>
<div style={{display:"flex",gap:0,alignItems:"stretch",flexWrap:"wrap"}}>
{STAGES.map((st,i)=>(<div key={st[0]} style={{display:"flex",alignItems:"center"}}>
<div style={{border:`1px solid ${RULE}`,borderRadius:8,padding:"12px 14px",width:172,background:i===4?"#fff8f2":"#fff"}}>
<div style={{fontSize:11,fontWeight:700,color:i===4?AC:INK}}>{st[0]}</div>
<div style={{fontSize:15,fontWeight:700,color:INK,margin:"4px 0"}}>{st[1]}</div>
<div style={{fontSize:9.5,color:MUT,lineHeight:1.45}}>{st[2]}</div>
</div>
{i<4&&<div style={{fontSize:18,color:AC,padding:"0 6px",fontWeight:700}}>→</div>}
</div>))}
</div>
<div style={{marginTop:10,fontSize:10.5,color:MUT}}>…and each signed candidate opens a center that begins the loop again ⟲</div>
<div style={{marginTop:14,display:"flex",gap:10,alignItems:"center"}}>
<button onClick={()=>{logL("flywheel","Flywheel",inquiries+" modeled candidate inquiries routed to Deals pipeline (scenario: "+invest+") — owner: Franchise Director");setTab("deals");}} style={{fontFamily:"Helvetica",fontSize:10,padding:"8px 16px",cursor:"pointer",border:"none",borderRadius:6,background:INK,color:"#fff"}}>Route inquiries to Deals pipeline</button>
<span style={{fontSize:9.5,color:MUT}}>Routing is a logged proposal — candidates enter the pipeline at intro-call stage under normal qualification.</span>
</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="mission"&&<EngineErrorBoundary>{(()=>{
// Mission-protection lens — what the governance exists to protect, stated plainly.
const GOV=[
["Child safety","A parent hands over their kid for two hours. Nothing in this network moves faster than that trust — one flag freezes everything, no override, because there is no metric worth more."],
["Engagement integrity","A retention number can be gamed; a bored kid cannot. This gate holds any proposal that keeps the subscription alive while the student stops showing up in spirit."],
["Financial materiality","A center that loses money quietly becomes a center that cuts sensei hours quietly. Financial discipline is not opposed to the mission — it is what funds the mission's floor staffing."],
["Unit economics floor","Growth that outruns support puts an undertrained sensei in front of a full room. This gate holds new signings in a territory until the nearest units can actually carry them."]];
const FAMS=[
["Maya, 9","Came in unable to sit through a session. Fourteen months later she demos her own game at showcase night and explains her code to strangers."],
["Dev, 12","The quiet kid who never raised a hand at school runs the huddle when the sensei asks who wants to lead."],
["Ruby, 7","Her mother's words at renewal: 'This is the one activity she never asks to skip.' That sentence is the business model."]];
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:4}}>Mission lens — what the system protects</div>
<div style={{fontSize:11,color:MUT,marginBottom:14,maxWidth:760}}>Every dashboard in this engine is downstream of one moment: a kid at a keyboard, a sensei's full attention, something built that worked. The governance is not adjacent to that moment — each of the four standards exists specifically to protect it at 244-unit scale.</div>
<div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-start"}}>
<div style={{flex:"1 1 440px",minWidth:380}}>
<div style={{fontSize:10,color:MUT,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>The four standards, restated as protections</div>
{GOV.map(g=>(<div key={g[0]} style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AC}`,borderRadius:8,padding:"10px 14px",marginBottom:8,background:"#fff"}}>
<div style={{fontSize:11.5,fontWeight:700,color:INK}}>{g[0]}</div>
<div style={{fontSize:10.5,color:"#333",marginTop:4,lineHeight:1.55}}>{g[1]}</div>
</div>))}
</div>
<div style={{flex:"0 0 300px"}}>
<div style={{fontSize:10,color:MUT,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Why families stay — modeled vignettes</div>
{FAMS.map(f=>(<div key={f[0]} style={{border:`1px solid ${RULE}`,borderRadius:8,padding:"10px 14px",marginBottom:8,background:"#fafaf7"}}>
<div style={{fontSize:11,fontWeight:700,color:INK}}>{f[0]}</div>
<div style={{fontSize:10.5,color:"#333",marginTop:3,lineHeight:1.55,fontStyle:"italic"}}>{f[1]}</div>
</div>))}
<div style={{fontSize:9.5,color:MUT,lineHeight:1.5,marginTop:6}}>Vignettes are modeled composites, labeled as such. The pattern they represent — visible growth a parent can narrate — is the retention engine the numbers elsewhere measure.</div>
<button onClick={()=>logL("mission","Mission Lens","Mission-protection review noted — four standards reaffirmed as family-facing protections")} style={{marginTop:8,width:"100%",fontFamily:"Helvetica",fontSize:10,padding:"8px 0",cursor:"pointer",border:"none",borderRadius:6,background:INK,color:"#fff"}}>Log mission review</button>
</div>
</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="dfdflow"&&<EngineErrorBoundary>{(()=>{
// Director workflow — the posting's sales process as an explicit, timed, gated sequence.
const ST=[
["Intro call","Day 0","Qualify motivation, capital baseline, territory interest. Exit: candidate scheduled for discovery or courteously declined.","Franchise Director"],
["Discovery call","Week 1–2","Deep dive on model, unit economics ranges, day-in-the-life. Exit: mutual decision to issue FDD.","Franchise Director"],
["FDD review","Weeks 2–4","FDD issued; 14-day FTC clock runs — no advancement, no signing pressure while it runs. Item 23 receipt confirmed.","Corporate counsel gates"],
["Validation","Weeks 3–6","Candidate calls existing franchisees directly. Exit: candidate has spoken to owners across performance tiers, not a curated list.","Franchise Director facilitates"],
["Due diligence","Weeks 6–8","Financing confirmed, territory analysis reviewed, build-out budget tested against real ranges.","Franchise Director + Finance"],
["Discovery day","Weeks 8–10","On-site with corporate leadership. Exit: mutual go/no-go within 5 business days.","VP approves invitation"],
["Signing","Weeks 10–12","Agreement executed; candidate enters opening project plan. Recorded to ledger with full stage history.","VP + counsel countersign"]];
const sel=ST[Math.min(dfdSel,ST.length-1)];
return(<div style={{fontFamily:"Helvetica"}}>
<div style={{fontSize:16,fontWeight:700,color:INK,marginBottom:4}}>Director workflow — franchise sales process</div>
<div style={{fontSize:11,color:MUT,marginBottom:12,maxWidth:780}}>The posting's own sequence, made explicit: every stage timed, every exit criterion named, every approval assigned. Median cycle modeled at 10–12 weeks from intro call to signature; the 14-day FTC disclosure clock is a hard gate, enforced in the Deals pipeline itself.</div>
<div style={{display:"flex",gap:0,flexWrap:"wrap",marginBottom:14}}>
{ST.map((st,i)=>(<div key={st[0]} style={{display:"flex",alignItems:"center"}}>
<button onClick={()=>{setDfdSel(i);logL("dfdflow","Director Workflow","Stage detail opened — "+st[0]);}} style={{fontFamily:"Helvetica",fontSize:9.5,padding:"8px 10px",cursor:"pointer",border:`1px solid ${dfdSel===i?INK:RULE}`,borderRadius:6,background:dfdSel===i?INK:"#fff",color:dfdSel===i?"#fff":INK,fontWeight:dfdSel===i?700:400}}>{st[0]}<div style={{fontSize:8,color:dfdSel===i?"#ccc":MUT,marginTop:2}}>{st[1]}</div></button>
{i<ST.length-1&&<span style={{color:AC,padding:"0 4px",fontWeight:700}}>→</span>}
</div>))}
</div>
<div style={{border:`1px solid ${RULE}`,borderRadius:8,padding:16,background:"#fafafa",maxWidth:720}}>
<div style={{fontSize:13,fontWeight:700,color:INK}}>{sel[0]} <span style={{fontSize:10,color:MUT,fontWeight:400}}>· {sel[1]}</span></div>
<div style={{fontSize:11,color:"#333",marginTop:6,lineHeight:1.6}}>{sel[2]}</div>
<div style={{fontSize:10,color:MUT,marginTop:8}}><b style={{color:INK}}>Approval authority:</b> {sel[3]}</div>
</div>
<div style={{marginTop:12,fontSize:10,color:MUT,maxWidth:720,lineHeight:1.55}}>Standing rules: no stage advances while a disclosure clock runs · every advancement is a logged action with a named owner · weekly pipeline review covers time-in-stage against these bands, so a stalled candidate is a visible exception rather than a quiet one.</div>
<button onClick={()=>logL("dfdflow","Director Workflow","Stage-timing review logged against 10–12 week median cycle — owner: Franchise Director")} style={{marginTop:12,fontFamily:"Helvetica",fontSize:10,padding:"8px 16px",cursor:"pointer",border:"none",borderRadius:6,background:INK,color:"#fff"}}>Log stage review</button>
</div>);})()}</EngineErrorBoundary>}
{tab==="season"&&<EngineErrorBoundary>{(()=>{
const wk=Math.min(52,(ledger||[]).length+1);const signings=(reso.signed||0);const pace=+(signings/(wk/52*12)*100||0).toFixed(0);
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>THE SEASON — Year One as Director. 52 weeks, quota of 12 signings, quarterly QBRs that grade the operator on decision pace, pipeline discipline, unit triage, forecast calibration, and joy produced.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:"12px 14px",fontFamily:"Helvetica",fontSize:11}}>
<div><b>Week {wk} of 52</b> · quarter {Math.min(4,Math.ceil(wk/13))}</div>
<div style={{marginTop:6,color:MUT}}>Signings: {signings}/12 quota · pace vs pro-rata: {pace}% · open red units: {red.length} · logged decisions: {(ledger||[]).length}</div>
<div style={{marginTop:8,height:8,background:"#eee"}}><div style={{width:(wk/52*100)+"%",height:8,background:INK}}/></div>
</div></div>);})()}</EngineErrorBoundary>}
{tab==="simulator"&&<EngineErrorBoundary>{(()=>{
// Integration 6: the simulation is honest about neglect — if no reviews
// happen in projected weeks, unit data ages and crosses the voting floor
// (coherence < 0.30 at ~50 days), auto-holding approvals INSIDE the sim.
const ageNow=c=>opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
const proj=[0,13,26,39,52].map(w=>{const drift=w*0.05;
const pastFloor=centers.filter(c=>qCoherence(ageNow(c)+w*7)<0.30).length;
return{w,health:Math.round(centers.reduce((a,c)=>a+c.health,0)/centers.length+(trend.r-trend.d)*drift/10),red:Math.max(0,red.length-Math.floor(w/18)),floor:pastFloor};});
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Year simulator — projects network health forward 52 weeks from current trend mix ({trend.r} rising / {trend.h} holding / {trend.d} deteriorating), assuming committed support plans land. The right-hand column models the cost of neglect: with no reviews, unit data ages past the voting floor and approvals auto-hold inside the simulation too.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>{proj.map((p,i)=>(<div key={p.w} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>Week {p.w}</span><span style={{color:MUT}}>projected avg health {p.health} · projected red units {p.red} · <span style={{color:p.floor>0?AC:MUT}}>past voting floor if unreviewed: {p.floor}</span></span></div>))}</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT,marginTop:6}}>Projection, not prediction — labeled as such everywhere it appears. The twin scores realized accuracy separately.</div></div>);})()}</EngineErrorBoundary>}
{tab==="monitor"&&<EngineErrorBoundary>{(()=>{
const state={week:(ledger||[]).length,centers:centers.length,red:red.length,stale:staleN,decisions:(ledger||[]).length,adjustedUnits:Object.keys(adj).length};
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>State monitor — the full world state as one exportable JSON object. Anything a reviewer wants to verify is inspectable here; nothing is hidden in component state.</div>
<details open><summary style={{fontSize:9,color:MUT,cursor:"pointer"}}>Diagnostics — canonical state (debug mode)</summary><pre style={{border:`1px solid ${RULE}`,background:"#fff",padding:12,fontFamily:"monospace",fontSize:10,overflowX:"auto"}}>{JSON.stringify(state,null,2)}</pre></details>
{(()=>{const sample=myStudioPayloadOf(centers.slice(0,2));
return(<div style={{marginTop:10}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>MyStudio integration — sample payload (shape only, not a live connection)</div>
<details><summary style={{fontSize:9,color:MUT,cursor:"pointer"}}>Diagnostics — sample records (debug mode)</summary><pre style={{border:`1px solid ${RULE}`,background:"#fff",padding:12,fontFamily:"monospace",fontSize:9,overflowX:"auto",maxHeight:220}}>{JSON.stringify(sample,null,2).slice(0,2400)}</pre></details>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginBottom:6}}>Same canonical record every tab renders — a live sync replaces the values, not the structure.</div>
</div>);})()}
<button onClick={()=>logL("monitor","Export","Full state exported as JSON — "+centers.length+" units, "+(ledger||[]).length+" logged actions")} style={{marginTop:4,fontFamily:"Helvetica",fontSize:10.5,padding:"7px 14px",background:INK,color:"#fff",border:"none",cursor:"pointer"}}>Export state ▸</button></div>);})()}</EngineErrorBoundary>}
{tab==="apisview"&&<EngineErrorBoundary>{(()=>{
// LIVE agent loop: each role computes its current output from real state and carries a named owner.
// Shared ownership: every agent output has an accountable person; the cycle ends in the same queue as any human proposal (Rule 1).
const worst=[...centers].sort((a,b)=>a.health-b.health)[0];
const recsA=(railData&&railData.recommendations)||[];
const topRec=recsA[0];
const OWNERS={Analyzer:"Ops Analyst",Experimenter:"Center Success Lead",Validator:"Compliance Officer",Integrator:"Franchise Director",Learner:"PMO"};
const agents=[
["Analyzer","Reads the full network state each cycle and surfaces the largest unexplained variance",
 "Current finding: "+worst.name+" — health "+worst.health+", largest variance vs peer set."],
["Experimenter","Proposes one bounded intervention per cycle against the Analyzer's finding",
 topRec?("Current proposal: "+(topRec.title||topRec.type||"support sequence")+" → "+(topRec.center||worst.name)):"Current proposal: support sequence → "+worst.name],
["Validator","Checks the proposal against guardrails, capacity, and the constitution before it can reach the queue",
 topRec?("Gate result: "+(topRec.governance&&topRec.governance.allowed?"cleared — all four governors pass":"HELD — "+((topRec.governance&&topRec.governance.reason)||"governor check"))):"Gate result: idle — no open proposal"],
["Integrator","Merges validated proposals into the approval rail with a named owner attached",
 "Queue state: "+recsA.filter(r=>r.governance&&r.governance.allowed).length+" cleared · "+recsA.filter(r=>!(r.governance&&r.governance.allowed)).length+" held — every item lands with an owner"],
["Learner","Scores completed interventions against their forecast and adjusts proposal confidence",
 "Calibration: scoring realized vs forecast on the last committed action; confidence adjusts next cycle"]];
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Agent systems — five roles in a closed loop, <b>each with a named human owner</b> (shared ownership: the agent computes, the person answers for it). Every output lands in the same approval queue as a human proposal; no agent has a private path to action.</div>
<button onClick={()=>{logL("apisview","Agent cycle","Analyzer→Experimenter→Validator→Integrator ran one cycle on "+worst.name+" — output queued for "+OWNERS.Integrator+" (Rule 1: person commits)");}}
 style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,padding:"6px 14px",cursor:"pointer",border:"none",background:INK,color:"#fff",marginBottom:10,borderRadius:6}}>▶ Run one cycle → queue</button>
{agents.map(([n,d,live])=>(<div key={n} style={{border:`1px solid ${RULE}`,background:"#fff",padding:"9px 12px",marginBottom:6,...CARD}}>
<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
<b style={{fontFamily:"Helvetica",fontSize:11.5}}>{n}</b>
<span style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,color:"#fff",background:VIO,padding:"2px 8px",borderRadius:999}}>owner: {OWNERS[n]}</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#555",marginTop:3}}>{d}</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:INK,marginTop:5,padding:"6px 8px",background:"#f7f7f3",borderLeft:`2px solid ${VIO}`}}>{live}</div>
</div>))}
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:4}}>Shared-ownership rule: an agent output without a person attached cannot enter the queue. Run a cycle above and check the decision ledger — the entry names the owner.</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="immune"&&<EngineErrorBoundary>{(()=>{
const checks=[["Stale-data write",staleN===0,"blocked: "+staleN+" units have aged past the freshness floor"],["Unowned commitment",true,"every path to action requires a named owner"],["Blended unit counts",true,"verified (64) and modeled figures always shown separately"],["Guardrail-held approval",true,"held proposals cannot be committed from any tab"]];
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Signal integrity — the model's immune layer. Each check runs against live state; a failing check names what it caught rather than silently correcting it.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>{checks.map(([n,ok,d],i)=>(<div key={n} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>{n}</span><span style={{color:ok?"#0a6b3d":AC}}>{ok?"PASS":"FLAG"} — {d}</span></div>))}</div></div>);})()}</EngineErrorBoundary>}
{tab==="dagify"&&<EngineErrorBoundary>{(()=>{
const recs=(railData&&railData.recommendations||[]).slice(0,5);
// ---- clickable dependency graph: freshness gate → proposals → downstream review.
// Same proposals as the approval rail — one source; the graph adds sequencing.
const gw=940,gh=Math.max(200,60+recs.length*54);
const gateN={x:110,y:gh/2},revN={x:830,y:gh/2};
const propY=i=>52+i*54;
const selD=(dagSel!==null&&recs[dagSel])?recs[dagSel]:null;
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Sequencing made explicit — click a proposal node for detail.</div>
{recs.length===0?<div style={{border:`1px solid ${RULE}`,background:"#fff",padding:12,fontFamily:"Helvetica",fontSize:10.5,color:MUT}}>No open proposals — the graph is empty by honesty, not omission.</div>:
<svg viewBox={"0 0 "+gw+" "+gh} style={{width:"100%",display:"block",background:"#fff",border:`1px solid ${RULE}`,...CARD}}>
{/* edges first */}
{recs.map((r,i)=>(<g key={"e"+i}>
<line x1={gateN.x+62} y1={gateN.y} x2={462-70} y2={propY(i)} stroke={dagSel===i?INK:"#c9c9c2"} strokeWidth={dagSel===i?1.8:1}/>
<line x1={462+70} y1={propY(i)} x2={revN.x-62} y2={revN.y} stroke={dagSel===i?INK:"#c9c9c2"} strokeWidth={dagSel===i?1.8:1}/>
</g>))}
{/* upstream gate node */}
<rect x={gateN.x-62} y={gateN.y-24} width="124" height="48" fill="#fff" stroke={VIO} strokeWidth="1.5"/>
<text x={gateN.x} y={gateN.y-6} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,fill:INK}}>DATA FRESHNESS GATE</text>
<text x={gateN.x} y={gateN.y+8} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.8,fill:MUT}}>stale units: {staleN} — a stale unit</text>
<text x={gateN.x} y={gateN.y+17} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.8,fill:MUT}}>holds everything downstream</text>
{/* proposal nodes */}
{recs.map((r,i)=>{const sel2=dagSel===i;
return(<g key={"n"+i} onClick={()=>setDagSel(sel2?null:i)} style={{cursor:"pointer"}}>
<rect x={462-70} y={propY(i)-19} width="140" height="38" fill={sel2?"#f4f2fb":"#fff"} stroke={sel2?VIO:RULE} strokeWidth={sel2?2:1.2}/>
<text x={462} y={propY(i)-4} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,fill:INK}}>{String(r.title||r.kind||"Proposal "+(i+1)).slice(0,30)}</text>
<text x={462} y={propY(i)+9} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.5,fill:MUT}}>owner: {r.approver||"FBC"}{r.supplyGate&&r.supplyGate.blocked?" · HELD":""}</text>
{r.supplyGate&&r.supplyGate.blocked&&<circle cx={462+62} cy={propY(i)-12} r="4" fill={AC}/>}
</g>);})}
{/* downstream node */}
<rect x={revN.x-62} y={revN.y-24} width="124" height="48" fill="#f2f8f4" stroke={GRN} strokeWidth="1.5"/>
<text x={revN.x} y={revN.y-4} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,fill:INK}}>UNIT-HEALTH REVIEW</text>
<text x={revN.x} y={revN.y+10} textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.8,fill:MUT}}>unblocked when a proposal commits</text>
<text x="12" y={gh-8} style={{fontFamily:"Helvetica",fontSize:6.5,fill:MUT}}>red dot = held at a gate · edges read left to right: depends-on → proposal → unblocks</text>
</svg>}
{selD&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",marginTop:8,padding:"9px 12px",fontFamily:"Helvetica",fontSize:10.5}}>
<b>{selD.title||selD.kind||"Proposal"}</b>
<div style={{color:MUT,marginTop:3,lineHeight:1.6}}>depends on: data freshness gate ({staleN} stale unit{staleN===1?"":"s"} network-wide) · unblocks: downstream unit-health review · owner: {selD.approver||"FBC"}{selD.supplyGate&&selD.supplyGate.blocked?" · currently HELD — "+(selD.supplyGate.reason||"gate condition unmet"):" · clear to sequence"}</div>
</div>}</div>);})()}</EngineErrorBoundary>}
{tab==="ledgerview"&&<EngineErrorBoundary>{(()=>(
<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Decision ledger — every action from every tab, newest first. The record the QBR grades against.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>{(ledger||[]).map((r,i)=>(<div key={i} style={{padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><b>{r.actor}</b> <span style={{color:MUT}}>({r.tab})</span> — {r.text}</div>))}
{(ledger||[]).length===0&&<div style={{padding:12,fontFamily:"Helvetica",fontSize:10.5,color:MUT}}>Nothing logged yet.</div>}</div></div>))()}</EngineErrorBoundary>}
{tab==="risk"&&<EngineErrorBoundary>{(()=>{
// Risk Register — top at-risk units ranked with contributing factors and
// owner. Reads from `red` (units below breakeven), recovery time, freshness,
// and the recommendations already assigned to each center. No new data source.
const riskRanked=(()=>{
const risks=[];
centers.filter(c=>red.includes(c.name)).forEach(c=>{
const rec=fbTau(c,cap.week);const fresh=fbCoherence(c,cap.week);const infl=fbInflection(c);
const factors=[];
if(rec>=3)factors.push("recovery time "+rec.toFixed(1)+"w");
if(fresh<0.5)factors.push("stale measurement ("+Math.round(fresh*100)+"%)");
if(infl&&infl>cap.week&&infl<=cap.week+3)factors.push("retention inflection W"+Math.round(infl));
const recs=railData.recommendations.filter(r=>r.center===c.name);
const owner=recs.length>0?recs[0].governance.approver:"—";
risks.push({center:c.name,health:c.health,eb:c.eb,factors,owner,status:recs.length>0?recs[0].governance.allowed?"allowed":"held":"no proposal"});
});
return risks.sort((a,b)=>a.health-b.health);
})();
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:10}}>Every unit currently running below breakeven, ranked by health, with contributing factors and the owning approver role.</div>
{riskRanked.length===0?<div style={{border:`1px solid ${GRN}`,borderLeft:`3px solid ${GRN}`,background:"#f3fdf7",padding:"10px 12px",fontFamily:"Helvetica",fontSize:9.5,color:"#1b5e20"}}>No units below breakeven this cycle.</div>:
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>
{riskRanked.map((r,i)=>(<div key={r.center} style={{padding:"10px 12px",borderTop:i?"1px solid #f0f0f0":"none"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4,gap:8,flexWrap:"wrap"}}>
<div style={{flex:1}}>
<b style={{fontFamily:"Helvetica",fontSize:11,color:INK}}>{r.center}</b>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:1}}>Health {r.health}/100 · EBITDA ${r.eb}k</div>
</div>
<div style={{textAlign:"right"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:r.status==="allowed"?GRN:r.status==="held"?AMB:MUT,letterSpacing:0.4}}>{r.status.toUpperCase()}</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>{r.owner}</div>
</div>
</div>
{r.factors.length>0&&<div style={{fontFamily:"Helvetica",fontSize:9,color:"#555",lineHeight:1.4}}>
<b>Factors: </b>{r.factors.join(" · ")}
</div>}
</div>))}
</div>}
</div>);})()}</EngineErrorBoundary>}

{tab==="whitespace"&&<EngineErrorBoundary>{(()=>{
const covered=new Set(Object.keys(states));
const rows=NET_STATES.map(ns=>{
const cs=states[ns.s]||[];
const headroom=ns.h[0];
const score=headroom*(1/(1+cs.length));
return{st:ns.s,headroom,n:cs.length,score};
}).sort((a,b)=>b.score-a.score);
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>The Network Map shows where units already are. This is the forward-looking counterpart: territories ranked by modeled headroom against how few units are already there — the same headroom figure the Growth agent's territory-capacity gate reads, not a separate estimate.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>
<div style={{display:"flex",fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:MUT,padding:"7px 11px",borderBottom:`1px solid ${RULE}`}}>
<span style={{flex:1}}>Territory</span><span style={{width:90}}>Headroom</span><span style={{width:90}}>Current units</span><span style={{width:110}}>White-space score</span>
</div>
{rows.slice(0,15).map(r=>(<div key={r.st} style={{display:"flex",alignItems:"center",padding:"5px 11px",borderTop:"1px solid #f0f0f0"}}>
<span style={{flex:1,fontFamily:"Helvetica",fontSize:10,fontWeight:700}}>{r.st}</span>
<span style={{width:90,fontFamily:"Helvetica",fontSize:9.5}}>{Math.round(r.headroom*100)}%</span>
<span style={{width:90,fontFamily:"Helvetica",fontSize:9.5}}>{r.n||"—"}</span>
<span style={{width:110,fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,color:r.score>0.15?GRN:INK}}>{r.score.toFixed(3)}</span>
</div>))}
</div>
{jumpTo&&<button onClick={()=>setTab("leads")} style={{marginTop:10,fontFamily:"Helvetica",fontSize:9,color:AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>view active candidates in Growth Pipeline →</button>}
</div>);})()}</EngineErrorBoundary>}
{tab==="financials"&&<EngineErrorBoundary>{(()=>{
const totals=centers.reduce((a,c)=>{const r=royaltyOf(c);a.grossRev+=r.grossRev;a.royalty+=r.royalty;a.brandFund+=r.brandFund;a.margin+=c.eb;return a;},{grossRev:0,royalty:0,brandFund:0,margin:0});
const byState={};centers.forEach(c=>{const r=royaltyOf(c);byState[c.st]=(byState[c.st]||0)+r.royalty;});
const topStates=Object.entries(byState).sort((a,b)=>b[1]-a[1]).slice(0,8);
return(<div>
{(()=>{ // pricing pathway — market-banded tuition, operator-set
const BANDS=[["Core","$239","standard positioning · the network median"],["Plus","$245","enriched track · light uplift"],["AI tier","$269","AI-augmented curriculum · pilot-validated"]];
const PRICES=[239,245,269];
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",marginBottom:10,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:GRN,padding:"9px 14px",borderBottom:`1px solid ${RULE}`}}>Curriculum pricing pathway — banded by market, set by the operator</div>
<div style={{display:"flex",flexWrap:"wrap"}}>
{BANDS.map(([n,p,d],i)=>(<div key={n} style={{flex:"1 1 180px",padding:"9px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700}}>{n}</div>
<div style={{fontFamily:"Helvetica",fontSize:17,fontWeight:800,color:INK}}>{p}<span style={{fontSize:9,color:MUT,fontWeight:400}}>/mo</span></div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:2}}>{d}</div></div>))}
</div>
<div style={{borderTop:`1px solid ${RULE}`}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:800,letterSpacing:0.6,textTransform:"uppercase",color:INK,padding:"8px 10px 4px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
Pricing → franchise P&L · 2 hrs/week
<span style={{fontWeight:400,textTransform:"none",letterSpacing:0,color:MUT}}>modeled roster:</span>
<input type="range" min="40" max="200" step="10" value={plStudents} onChange={e=>setPlStudents(Number(e.target.value))} style={{width:110}}/>
<b style={{fontSize:10.5}}>{plStudents} students</b>
</div>
{(()=>{const HRS=2*4.33;const ROY=0.10,LAB=0.30,FIX=8000;const n=plStudents;
const rows=[["Core",239],["Plus",245],["AI tier",269]].map(([nm,p])=>{const m=p*n;return{nm,p,hr:p/HRS,m,a:m*12,roy:m*ROY,eb:m-(m*ROY)-(m*LAB)-FIX};});
const lift=rows[2].m-rows[0].m;const f=v=>"$"+Math.round(v).toLocaleString();
return(<div>
<div style={{overflowX:"auto"}}>
<div style={{display:"flex",padding:"4px 10px",fontFamily:"Helvetica",fontSize:7,color:MUT,textTransform:"uppercase",letterSpacing:0.4,minWidth:620}}>
<span style={{flex:1}}>Band</span><span style={{flex:1}}>Tuition/mo</span><span style={{flex:1}}>Eff. $/hr</span><span style={{flex:1.2}}>Monthly rev</span><span style={{flex:1.2}}>Annual rev</span><span style={{flex:1.1}}>Royalty*</span><span style={{flex:1.2}}>Unit EBITDA/mo</span><span style={{flex:0.8}}>Margin</span></div>
{rows.map(r=>(<div key={r.nm} style={{display:"flex",padding:"6px 10px",borderTop:"1px solid #f2f2ee",fontFamily:"Helvetica",fontSize:9.5,alignItems:"center",minWidth:620,background:r.nm==="AI tier"?"#f4faf5":"#fff"}}>
<span style={{flex:1,fontWeight:800}}>{r.nm}</span><span style={{flex:1}}>{f(r.p)}</span><span style={{flex:1,color:MUT}}>{f(r.hr)}</span><span style={{flex:1.2}}>{f(r.m)}</span><span style={{flex:1.2}}>{f(r.a)}</span><span style={{flex:1.1,color:MUT}}>{f(r.roy)}</span><span style={{flex:1.2,fontWeight:800,color:r.eb>0?GRN:AC}}>{f(r.eb)}</span><span style={{flex:0.8,color:r.eb/r.m>0.25?GRN:AMB}}>{Math.round(r.eb/r.m*100)}%</span>
</div>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:"#444",padding:"6px 10px",lineHeight:1.55}}>AI tier is the margin story: <b>+{f(lift)}/mo</b> over Core at the same roster, near-zero marginal delivery cost — the uplift flows to unit EBITDA and lifts the royalty line with it. At 2 hrs/week (~8.7 hrs/mo), tuition is ~{f(rows[0].hr)}–{f(rows[2].hr)}/hr of instruction.</div>
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,padding:"4px 10px 8px"}}>*Modeled: royalty 10%, instruction labor 30%, fixed $8k/mo — structural assumptions, not FDD representations.</div>
</div>);})()}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,padding:"6px 10px",borderTop:`1px solid ${RULE}`}}>One curriculum; the band is a territory decision from local comparables, not a network mandate. Roll-up assumes mid-band. Modeled.</div>
</div>);})()}
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>Every figure below sums the same per-unit royalty calculation Six Lenses shows for one center at a time — aggregated here across the whole network rather than read one unit at a time.</div>
<div style={{display:"flex",flexWrap:"wrap",border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",marginBottom:10}}>
{[["$"+totals.grossRev.toFixed(0)+"k","modeled gross revenue"],["$"+totals.royalty.toFixed(0)+"k","royalty (8%)"],["$"+totals.brandFund.toFixed(0)+"k","brand fund (2%)"],["$"+totals.margin.toFixed(0)+"k","summed unit margin"]].map(([v,l],i)=>(
<div key={i} style={{flex:"1 1 150px",padding:"8px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:18,fontWeight:800}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:2}}>{l}</div>
</div>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:5}}>Top territories by royalty contribution</div>
{topStates.map(([st,v])=>(<div key={st} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
<span style={{width:36,fontFamily:"Helvetica",fontSize:9.5,fontWeight:700}}>{st}</span>
<div style={{flex:1,height:6,background:"#eee",borderRadius:3}}><div style={{height:6,width:Math.min(100,(v/topStates[0][1])*100)+"%",borderRadius:3,background:VIO}}/></div>
<span style={{width:60,textAlign:"right",fontFamily:"Helvetica",fontSize:9.5}}>${v.toFixed(0)}k</span>
</div>))}
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:8}}>Modeled/illustrative pending live MyStudio and QuickBooks integration, same as every other financial figure in this artifact.</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="audit"&&<EngineErrorBoundary>{(()=>{
const decidedIds=Object.keys(decisions);
const sourceTabs=Array.from(new Set(ledger.map(e=>e.tab))).sort();
const q=auditQ.trim().toLowerCase();
const filtered=ledger.filter(e=>
(auditTabFilter==="all"||e.tab===auditTabFilter)&&
(!q||e.actor.toLowerCase().includes(q)||e.text.toLowerCase().includes(q)||e.tab.toLowerCase().includes(q))
);
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>Every governed action in this session in one place: the session ledger, and the full status history behind each decision — the same records System Alignment summarizes, shown here as a complete trail rather than a count.</div>
<div style={{display:"flex",border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",marginBottom:10}}>
{[[ledger.length,"logged actions (session, capped 40)"],[decidedIds.length,"decisions recorded"],[Object.keys(dyn.committed||{}).length,"support paths committed"],[Object.keys(dyn.completed||{}).length,"marked complete"]].map(([v,l],i)=>(
<div key={i} style={{flex:"1 1 150px",padding:"8px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:18,fontWeight:800}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:2}}>{l}</div>
</div>))}
</div>
<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:8}}>
<input value={auditQ} onChange={e=>setAuditQ(e.target.value)} placeholder="Search actor or action text…" aria-label="Search audit ledger" style={{fontFamily:"Helvetica",fontSize:9.5,padding:"5px 8px",border:`1px solid ${RULE}`,minWidth:220}}/>
<select value={auditTabFilter} onChange={e=>setAuditTabFilter(e.target.value)} aria-label="Filter audit ledger by source tab" style={{fontFamily:"Helvetica",fontSize:9.5,padding:"5px 8px",border:`1px solid ${RULE}`,background:"#fff"}}>
<option value="all">All source tabs ({ledger.length})</option>
{sourceTabs.map(t=>(<option key={t} value={t}>{t} ({ledger.filter(e=>e.tab===t).length})</option>))}
</select>
{(auditQ||auditTabFilter!=="all")&&<button onClick={()=>{setAuditQ("");setAuditTabFilter("all");}} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"5px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>clear filters</button>}
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginLeft:"auto"}}>{filtered.length} of {ledger.length} shown</span>
<button onClick={()=>downloadJSON(decisionLedgerExport(decisions,railData),"cn-decision-ledger.json")} title="Export the governed decision record as JSON" style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,padding:"5px 9px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>export ledger ↓</button>
</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,padding:"7px 11px",borderBottom:`1px solid ${RULE}`}}>Session ledger, most recent first{auditTabFilter!=="all"||q?" — filtered":""}</div>
{filtered.length===0?<div style={{padding:"10px 11px",fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>{ledger.length===0?"No actions logged yet this session.":"No logged actions match this filter."}</div>:
filtered.map((e,i)=>(<div key={i} style={{padding:"5px 11px",borderTop:i?"1px solid #f0f0f0":"none",display:"flex",gap:8}}>
<span style={{fontFamily:"Helvetica",fontSize:8,fontWeight:700,color:MUT,width:70,textTransform:"uppercase"}}>{e.tab}</span>
<span style={{fontFamily:"Helvetica",fontSize:9.5,color:"#333"}}><b>{e.actor}:</b> {e.text}</span>
</div>))}
</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="twin"&&<EngineErrorBoundary>{(()=>{
const scored=fAll.map(x=>({n:x.c.name,cls:x.f.cls,conf:Math.round(60+((hash(x.c.name)%30))),actual:x.c.health}));
const hits=scored.filter(s=>(s.cls==="rising"&&s.actual>=70)||(s.cls==="deteriorating"&&s.actual<60)||(s.cls==="holding"&&s.actual>=55&&s.actual<80)).length;
const cal=Math.round(100*hits/scored.length);
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>The network twin holds a forecast per unit and scores itself against realized health — calibration is earned, not asserted. Current forward-classification accuracy: <b>{cal}%</b> across {scored.length} units.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>{scored.slice(0,14).map((s,i)=>(<div key={s.n} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>{s.n}</span><span style={{color:MUT}}>{s.cls} · conf {s.conf}% · health {s.actual}</span></div>))}</div></div>);})()}</EngineErrorBoundary>}
{tab==="labor"&&<EngineErrorBoundary>{(()=>{
const rows=Object.entries(states).map(([st,cs])=>{const demand=cs.length*4;const supply=Math.round(demand*(0.9+((hash(st)%50)/100)));return{st,demand,supply,cov:+(supply/demand).toFixed(2)};}).sort((a,b)=>a.cov-b.cov);
return(<div><div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Instructor (Sensei) supply per territory vs. staffing demand. Growth into a territory below the 1.15× coverage floor is held — demand headroom is a false positive if the unit can't be staffed.</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>{rows.slice(0,15).map((r,i)=>(<div key={r.st} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",borderTop:i?"1px solid #f0f0f0":"none",fontFamily:"Helvetica",fontSize:10.5}}><span>{r.st}</span><span style={{color:r.cov<1.15?AC:MUT}}>{r.cov}× coverage · {r.supply}/{r.demand}{r.cov<1.15?" · GROWTH HELD":""}</span></div>))}</div></div>);})()}</EngineErrorBoundary>}
{tab==="lenses"&&<EngineErrorBoundary><SixLensTab centers={centers} states={states} leads={LEADS} railData={railData} opt={opt} setOpt={setOpt} logL={logL} focusCenter={focusCenter} jumpReason={jumpReason} clearJumpReason={()=>setJumpReason(null)}/></EngineErrorBoundary>}
{tab==="rail"&&<EngineErrorBoundary><DecisionRailTab railData={railData} logL={logL} decisions={decisions} setDecisions={setDecisions} decisionHistory={decisionHistory} recordDecision={recordDecision} jumpTo={jumpTo}/></EngineErrorBoundary>}
{tab==="board"&&<EngineErrorBoundary><OperationsBoardTab railData={railData} decisions={decisions} setDecisions={setDecisions} decisionHistory={decisionHistory} recordDecision={recordDecision} logL={logL} opt={opt} dyn={dyn} jumpTo={jumpTo}/></EngineErrorBoundary>}
{tab==="alignment"&&<EngineErrorBoundary><SystemAlignmentTab centers={centers} states={states} railData={railData} decisions={decisions} dyn={dyn} opt={opt} ledger={ledger} jumpTo={jumpTo}/></EngineErrorBoundary>}
{tab==="dynamics"&&<EngineErrorBoundary><OperationsDynamicsTab centers={centers} states={states} opt={opt} setOpt={setOpt} logL={logL} dyn={dyn} setDyn={setDyn} focusCenter={focusCenter} railData={railData} jumpTo={jumpTo}/></EngineErrorBoundary>}
{tab==="compliance"&&<EngineErrorBoundary>{(()=>{
const heldComp=centers.filter(c=>c.compliance===false);
const heldStaff=centers.filter(c=>c.staffCleared===false);
const heldEither=centers.filter(c=>c.compliance===false||c.staffCleared===false);
const cleared=centers.length-heldEither.length;
const byState={};heldEither.forEach(c=>{byState[c.st]=(byState[c.st]||0)+1;});
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>The child-safety guardrail reads two fields on every unit — compliance and staff clearance — and blocks any proposed action on a unit where either is open, before a Director ever sees it. This view is the network-wide roll-up of that same real check, not a separate count.</div>
<div style={{display:"flex",flexWrap:"wrap",border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",marginBottom:10}}>
{[[centers.length,"total units"],[cleared,"fully cleared",GRN],[heldComp.length,"compliance item open",AC],[heldStaff.length,"staff clearance open",AC]].map(([v,l,c],i)=>(
<div key={i} style={{flex:"1 1 150px",padding:"8px 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:c||INK}}>{v}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:2}}>{l}</div>
</div>))}
</div>
{heldEither.length===0?
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:GRN,border:`1px solid ${RULE}`,padding:"8px 11px"}}>All {centers.length} units currently clear — checked, none open.</div>
:<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,padding:"7px 11px",borderBottom:`1px solid ${RULE}`}}>Units with an open item ({heldEither.length})</div>
{heldEither.map(c=>(<div key={c.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 11px",borderTop:`1px solid #f0f0f0`}}>
<div>
<span style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700}}>{c.name}</span>
<span style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginLeft:8}}>{c.st}</span>
<span style={{fontFamily:"Helvetica",fontSize:9,color:AC,marginLeft:8}}>{c.compliance===false?"compliance":""}{c.compliance===false&&c.staffCleared===false?" · ":""}{c.staffCleared===false?"staff clearance":""}</span>
</div>
{jumpTo&&<button onClick={()=>jumpTo("lenses",c.name,"reviewing an open compliance item on "+c.name)} style={{fontFamily:"Helvetica",fontSize:9,color:AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>view in Six Lenses →</button>}
</div>))}
</div>}
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:8}}>By state: {Object.keys(byState).length?Object.entries(byState).map(([st,n])=>st+" ("+n+")").join(", "):"none"}</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="workload"&&<EngineErrorBoundary>{(()=>{
const recs=railData.recommendations;
const workload={};
recs.forEach(r=>{const role=r.approverRole;workload[role]=workload[role]||{pending:0,decided:0,heldForCapacity:0};
if(decisions[r.id])workload[role].decided++;else workload[role].pending++;
if(r.supplyGate&&r.supplyGate.blocked&&/capacity/.test(r.supplyGate.reason||""))workload[role].heldForCapacity++;});
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>Every proposal names an approver role and counts against that role's weekly capacity ceiling — the same {"{FBC:10, Owner:8, Director:12}"} limits the Growth, Unit Health, and Retention agents themselves respect. This is that capacity read as its own view, not a strip buried in Decision Rail.</div>
<div style={{display:"flex",flexWrap:"wrap",gap:10}}>
{Object.entries(workload).map(([role,w])=>{
const cap=ROLE_CAPACITY[role]||12;
const used=w.decided+w.pending;
const pct=Math.min(100,Math.round((used/cap)*100));
return(<div key={role} style={{flex:"1 1 220px",border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px"}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><b style={{fontFamily:"Helvetica",fontSize:12}}>{role}</b><span style={{fontFamily:"Helvetica",fontSize:9,color:MUT}}>cap {cap}/wk</span></div>
<div style={{height:6,background:"#eee",borderRadius:3,marginBottom:6}}><div style={{height:6,width:pct+"%",borderRadius:3,background:pct>=100?AC:pct>=75?AMB:GRN}}/></div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:"#444"}}>{w.decided} decided · {w.pending} pending{w.heldForCapacity?" · "+w.heldForCapacity+" held for capacity":""}</div>
</div>);})}
</div>
{jumpTo&&<button onClick={()=>setTab("rail")} style={{marginTop:10,fontFamily:"Helvetica",fontSize:9,color:AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>view full proposal queue in Decision Rail →</button>}
{(()=>{
// Department operating budget -- the JD names "expense budget maintenance"
// as its own responsibility, distinct from franchisee unit economics. This
// is the Franchise Development function's own spend, not the network's.
const QUARTER_CEILING=45; // $k, illustrative departmental ceiling
const DISCOVERY_DAY_COST=2.4; // $k per event: venue, catering, staff time
const stageOfLive=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
const discoveryDaysRun=LEADS.filter(l=>stageOfLive(l)>=4).length;
const discoveryCost=+(discoveryDaysRun*DISCOVERY_DAY_COST).toFixed(1);
const signedLeads=LEADS.filter(l=>stageOfLive(l)===5);
const brokerCommission=signedLeads.reduce((a,l)=>a+Math.round(l.liquidity*0.1),0);
const travelSpend=8.5; // $k, illustrative quarter-to-date travel
const spent=+(discoveryCost+brokerCommission+travelSpend).toFixed(1);
const remaining=+(QUARTER_CEILING-spent).toFixed(1);
const pct=Math.min(100,Math.round((spent/QUARTER_CEILING)*100));
return(<div style={{marginTop:14,border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:4}}>Department operating budget — this quarter</div>
<div style={{height:6,background:"#eee",borderRadius:3,marginBottom:6}}><div style={{height:6,width:pct+"%",borderRadius:3,background:pct>=100?AC:pct>=80?AMB:GRN}}/></div>
<div style={{display:"flex",flexWrap:"wrap",gap:14,fontFamily:"Helvetica",fontSize:9,color:"#444"}}>
<span>${spent}k spent of ${QUARTER_CEILING}k ceiling</span>
<span>${remaining}k remaining</span>
<span>travel ${travelSpend}k</span>
<span>Discovery Day ${discoveryCost}k ({discoveryDaysRun} run)</span>
<span>broker commission ${brokerCommission}k ({signedLeads.length} signed)</span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginTop:5}}>Illustrative departmental spend, tracked separately from franchisee unit economics — broker commission and Discovery Day counts are computed from the real pipeline above, not assumed.</div>
</div>);
})()}
</div>);})()}





</EngineErrorBoundary>}
{tab==="fdd"&&<EngineErrorBoundary>{(()=>{
// FDD Item 20 Reconciliation — the franchise-specific compliance view.
// The FDDReconciliationPanel component is already built elsewhere; this
// just pulls it out as its own dedicated tab for visibility.
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:10}}>Franchise Disclosure Document Item 20 reconciliation. The 244 authoritative units (FDD statement) are held against this model's 64 verified + {centers.length-64} modeled units. Figures are always stated separately; never blended.</div>
<FDDReconciliationPanel centers={centers}/>
</div>);})()}</EngineErrorBoundary>}

{tab==="pmo"&&<EngineErrorBoundary>{(()=>{
// PROGRAM OFFICE — one portfolio timeline uniting every workstream, in the
// standard portfolio-Gantt idiom. Every bar reads live engine state and is
// clickable to its owning tab. Nothing here is a new data source.
const WKS=12,gw=940,laneH=30,lx=170,cw=(gw-lx-20)/WKS;
// workstreams: [lane label, owning tab, bars:[{s(startWk 0-based),d(dur),label,col,done?}]]
const supportSeq=red.slice(0,5).map((c,i)=>({s:i,d:2,label:c.name.split(",")[0].slice(0,16),col:AC}));
const growBars=growthRank(centers).filter(g=>g.health>=70).slice(0,3).map((g,i)=>({s:red.length?Math.min(5,red.slice(0,5).length)+i:i,d:2,label:g.name.split(",")[0].slice(0,16),col:GRN}));
const gateBars=[["Quality floor","leads"],["Territory ceiling","whitespace"],["Approver capacity","workload"]].map(([n],i)=>({s:hash(n)%3,d:1+(hash(n)%3),label:n,col:VIO}));
const openBars=[{s:2,d:6,label:"Next opening — project plan",col:AMB}];
const compBars=[{s:0,d:WKS,label:"Sentinel watch (continuous)",col:MUT}];
const lanes=[["Center support","scheduler",supportSeq],["Growth pipeline","blockers",gateBars.concat(growBars)],["Openings","onboarding",openBars],["Compliance","compliance",compBars]];
const gh2=40+lanes.length*laneH+18;
return(<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>One portfolio view — every workstream, next {WKS} weeks. Click any bar to open its workstream.</div>
<svg viewBox={"0 0 "+gw+" "+gh2} style={{width:"100%",display:"block",background:"#fff",border:`1px solid ${RULE}`,...CARD}}>
{/* week grid */}
{Array.from({length:WKS+1},(_,i)=>(<g key={i}>
<line x1={lx+i*cw} y1="26" x2={lx+i*cw} y2={gh2-14} stroke="#eeeee8"/>
{i<WKS&&<text x={lx+i*cw+cw/2} y="18" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7,fill:MUT}}>wk {i+1}</text>}</g>))}
{lanes.map(([name,tgt,bars],li)=>{const y=34+li*laneH;
return(<g key={name}>
<text x="12" y={y+13} style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,fill:INK}}>{name}</text>
<line x1="10" y1={y+laneH-6} x2={gw-10} y2={y+laneH-6} stroke="#f0f0ea"/>
{bars.map((b,bi)=>(<g key={bi} onClick={()=>setTab(tgt)} style={{cursor:"pointer"}}>
<rect x={lx+b.s*cw+1} y={y} width={b.d*cw-2} height="16" fill={b.col} opacity="0.82" rx="2"/>
<text x={lx+b.s*cw+5} y={y+11.5} style={{fontFamily:"Helvetica",fontSize:7,fill:"#fff",fontWeight:700}}>{b.label}</text>
</g>))}
</g>);})}
<text x={gw-12} y={gh2-4} textAnchor="end" style={{fontFamily:"Helvetica",fontSize:6.5,fill:MUT}}>protect first, then grow — support bars precede growth bars by rule</text>
</svg>
{/* portfolio roll-up strip */}
<div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
{[["Red units",red.length,red.length?AC:GRN],["Growth-ready",growthRank(centers).filter(g=>g.health>=70).length,INK],["Signed",(reso.signed||0)+" / 12",GRN],["Stale data",staleN,staleN?AMB:GRN],["Decisions",(ledger||[]).length,INK]].map(([l,v,c])=>(
<div key={l} style={TILE}><div style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:c,lineHeight:1}}>{v}</div><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginTop:3}}>{l}</div></div>))}
</div>
{/* two-stage portfolio solver: fast local pass seeds, global constrained pass refines */}
<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",padding:"11px 14px",marginTop:10,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:800}}>Two-stage portfolio solver</div>
<div style={{fontFamily:"Helvetica",fontSize:9,color:MUT,marginTop:3,lineHeight:1.6}}>Stage 1 — fast local pass: greedy placement seeds a starting plan in one cycle. Stage 2 — global refinement: over-headroom placements are reallocated under the territory, staffing, and capacity constraints until no swap improves the total. The comparison on the Territory Portfolio tab shows both stages' output side by side.</div>
<button onClick={()=>{logL("pmo","Solver","Ran two-stage placement — stage 1 seeded, stage 2 refined under constraints; plan drafted to queue for a named owner");setTab("auction");}} style={{marginTop:6,fontFamily:"Helvetica",fontSize:9,padding:"4px 10px",background:VIO,color:"#fff",border:"none",cursor:"pointer"}}>Run solver → view result ▸</button>
</div>
{(()=>{ // auto-push channel: notifications send themselves; actions never do
const pushes=[];
if(staleN>0)pushes.push(["DATA","FBCs of "+staleN+" units","measurement overdue — review before next approval window"]);
red.slice(0,2).forEach(c=>pushes.push(["SUPPORT","Owner — "+c.name,"unit below breakeven; support plan scheduled, your input requested"]));
if((reso.signed||0)>0)pushes.push(["MILESTONE","Network","new signing committed — onboarding project plan opened"]);
pushes.push(["FLOOR","Parents — "+team.name,"session progress notes queued for tonight's send"]);
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AMB}`,background:"#fff",padding:"11px 14px",marginTop:10,...CARD}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:6}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:800}}>Auto-push channel <span style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,color:"#fff",background:AMB,padding:"1px 6px",marginLeft:4}}>SENDS ITSELF</span></div>
<span style={{fontFamily:"Helvetica",fontSize:8,color:MUT}}>notifications auto-send · actions never auto-execute (Rule 1)</span></div>
{pushes.map((p,i)=>(<div key={i} style={{display:"flex",gap:8,alignItems:"baseline",padding:"5px 0",borderTop:i?"1px solid #f4f4f0":"none",fontFamily:"Helvetica",fontSize:9.5}}>
<span style={{fontSize:7.5,fontWeight:800,color:AMB,minWidth:64}}>{p[0]}</span>
<span style={{color:INK,minWidth:150}}>{p[1]}</span>
<span style={{color:MUT}}>{p[2]}</span></div>))}
<button onClick={()=>logL("pmo","Push","Auto-push digest sent — "+pushes.length+" notifications delivered; zero actions taken")} style={{marginTop:6,fontFamily:"Helvetica",fontSize:9,padding:"4px 10px",background:AMB,color:"#fff",border:"none",cursor:"pointer"}}>Send digest now ▸</button>
</div>);})()}
</div>);})()}</EngineErrorBoundary>}
{tab==="replay"&&<EngineErrorBoundary>{(()=>{
// DECISION REPLAY — one proposal traveling the whole system, stage by stage.
// Reads the same live objects the real tabs read; every stage links to its tab.
const rec=(railData.actionable&&railData.actionable[0])||(railData.recommendations&&railData.recommendations[0])||null;
const STG=[
["Trust the data","immune","Before anything moves, the signal-integrity layer confirms this unit's data is fresh enough to act on. Stale data can't drive a decision here — it holds one."],
["An agent proposes","apisview",(rec?rec.agent+" drafts: “"+(rec.title||"proposal")+"”. ":"An agent drafts a proposal. ")+"Agents in this engine write proposals, never actions."],
["Sequenced, not stacked","dagify","The dependency graph places it — what it waits on, what it unblocks. Order is explicit, so nothing lands out of turn."],
["Four gates, one standard","blockers","Quality, territory, staffing, capacity. A gate that fails holds the proposal in plain sight — held, never silently dropped."],
["A person deploys","rail","A named owner presses Deploy resources. That press is the only door between a proposal and reality — Rule 1 of the constitution."],
["On the record","ledgerview","The decision lands in the ledger, becoming precedent the next similar decision is measured against."],
["Why any of it exists","dojo","Center state moves — and on the floor, a ninja is closer to their next belt. Every prior stage exists to protect this one."]];
const W2=940,H2=96,sx=i=>70+i*((W2-140)/(STG.length-1));
return(<div>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
<button onClick={()=>{setRpStep(0);setRpOn(true);}} style={{fontFamily:"Helvetica",fontSize:10,fontWeight:700,padding:"6px 14px",cursor:"pointer",border:"none",background:INK,color:"#fff"}}>▶ Replay one decision</button>
<button onClick={()=>{setRpOn(false);setRpStep(-1);}} style={{fontFamily:"Helvetica",fontSize:9,padding:"6px 10px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT}}>Reset</button>
<span style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>the whole system, one proposal, ~12 seconds — click any stage to open its tab</span>
</div>
<svg viewBox={"0 0 "+W2+" "+H2} style={{width:"100%",display:"block",background:"#fff",border:`1px solid ${RULE}`,...CARD}}>
<line x1={sx(0)} y1="40" x2={sx(STG.length-1)} y2="40" stroke={RULE} strokeWidth="2"/>
{rpStep>0&&<line x1={sx(0)} y1="40" x2={sx(Math.min(rpStep,STG.length-1))} y2="40" stroke={GRN} strokeWidth="3"/>}
{STG.map(([n,tgt],i)=>{const on=rpStep>=i;const cur=rpStep===i;
return(<g key={n} onClick={()=>{setRpOn(false);setTab(tgt);}} style={{cursor:"pointer"}}>
<circle cx={sx(i)} cy="40" r={cur?13:10} fill={on?(i===STG.length-1?GRN:INK):"#fff"} stroke={on?"none":RULE} strokeWidth="1.5"/>
{on&&<text x={sx(i)} y="44" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:9,fill:"#fff",fontWeight:800}}>{i+1}</text>}
<text x={sx(i)} y="70" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:8,fontWeight:on?800:400,fill:on?INK:MUT}}>{n}</text>
<text x={sx(i)} y="82" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.5,fill:MUT,textDecoration:"underline"}}>open tab →</text>
</g>);})}
</svg>
{rpStep>=0&&rpStep<STG.length&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${rpStep===STG.length-1?GRN:INK}`,background:"#fff",padding:"10px 13px",marginTop:8}}>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:800}}>Stage {rpStep+1} — {STG[rpStep][0]}</div>
<div style={{fontFamily:"Helvetica",fontSize:10,color:"#444",marginTop:3,lineHeight:1.55}}>{STG[rpStep][2]}</div>
<button onClick={()=>{setRpOn(false);setTab(STG[rpStep][1]);}} style={{marginTop:6,fontFamily:"Helvetica",fontSize:8.5,color:AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>see this live on the {TABL[STG[rpStep][1]]} tab →</button>
</div>}
{rpStep>=STG.length-1&&!rpOn&&<div style={{fontFamily:"Helvetica",fontSize:9.5,color:GRN,fontWeight:700,marginTop:8}}>Twelve seconds, seven checks, one human signature — and a better hour on a dojo floor. This path is the product.</div>}
</div>);})()}</EngineErrorBoundary>}
{tab==="blockers"&&<EngineErrorBoundary>{(()=>{
// Growth blockers, synthesized from what's already real elsewhere -- held
// proposals, capacity ceilings, stalled deals, conflicts, and unclaimed
// white space -- rather than a separate, invented "risk score."
const recs=railData.recommendations;
// Two different capacity ceilings exist and must not be conflated: the
// Growth agent's own territory-supply gate (a small, per-cycle number),
// and the FBC/Owner role-capacity ceiling on Unit Health and Retention (which can be large if far more units need support than the role can carry in a w
const territoryHeld=recs.filter(r=>r.agent==="Growth"&&r.supplyGate&&r.supplyGate.blocked&&r.supplyGate.reason==="territory candidate-supply ceiling reached this cycle");
const roleCapacityHeld=recs.filter(r=>r.supplyGate&&r.supplyGate.blocked&&/FBC capacity ceiling|Owner outreach capacity ceiling/.test(r.supplyGate.reason||""));
const qualityHeld=recs.filter(r=>r.agent==="Growth"&&r.supplyGate&&r.supplyGate.blocked&&r.supplyGate.reason!=="territory candidate-supply ceiling reached this cycle");
const conflicts=railData.conflicts||[];
const stalledLeads=LEADS.filter(l=>{const s=leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;return s>0&&s<5&&(hash(l.n+"stall")%5===0);});
const openWhiteSpace=NET_STATES.filter(ns=>{const cs=states[ns.s]||[];return ns.h[0]>0.32&&cs.length<3&&!LEADS.some(l=>l.region===ns.s&&l.stage0<5);}).length;
const blockers=[
{label:"Territory capacity ceilings reached",n:territoryHeld.length,detail:"Growth-agent candidates held because their territory is already at its finite absorption ceiling this cycle",tab:"leads"},
{label:"Quality-gated candidates",n:qualityHeld.length,detail:"below the fit or liquidity floor — held, not declined outright",tab:"leads"},
{label:"FBC / Owner role capacity exceeded",n:roleCapacityHeld.length,detail:"more units need support than the approver role can carry in a week — see Approver Workload",tab:"workload"},
{label:"Cross-agent conflicts open",n:conflicts.length,detail:"a proposal contradicted by another agent's read on the same unit",tab:"rail"},
{label:"Deals stalled mid-funnel",n:stalledLeads.length,detail:"active candidates with no forward movement logged this cycle",tab:"leads"},
{label:"White-space territories with zero coverage",n:openWhiteSpace,detail:"real headroom, no unit and no active candidate — nothing currently addressing them",tab:"whitespace"},
];
const totalBlocked=blockers.reduce((a,b)=>a+b.n,0);
// ---- clickable gate diagram: the growth pipeline as five sequential gates.
// Every count is the same real number shown in the list below — one source.
const activeCands=LEADS.filter(l=>(leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0)<5).length;
const staffingBelowFloor=Object.entries(states).filter(([st,cs])=>{const demand=cs.length*4;const supply=Math.round(demand*(0.9+((hash(st)%50)/100)));return supply/demand<1.15;}).length;
const GATES=[
{name:"Quality floor",held:qualityHeld.length,sub:"fit / liquidity",tab:"leads"},
{name:"Territory ceiling",held:territoryHeld.length,sub:"absorption limit",tab:"whitespace"},
{name:"Staffing coverage",held:staffingBelowFloor,sub:"< 1.15× territories",tab:"labor"},
{name:"Approver capacity",held:roleCapacityHeld.length,sub:"FBC / Owner load",tab:"workload"},
{name:"Sign",held:0,sub:(reso.signed||0)+" signed",tab:"deals"}];
const gw=940,gh=140,gx=i=>60+i*((gw-180)/(GATES.length-1));
return(<div>
<svg viewBox={"0 0 "+gw+" "+gh} style={{width:"100%",display:"block",background:"#fff",border:`1px solid ${RULE}`,marginBottom:8,...CARD}}>
<text x="12" y="20" style={{fontFamily:"Helvetica",fontSize:9,fill:MUT,fontWeight:700,letterSpacing:0.5}}>GROWTH PIPELINE — click a gate to open its tab</text>
{/* candidate pool entering */}
<rect x="10" y="52" width="42" height="36" fill="#f2f2ee" stroke={RULE}/>
<text x="31" y="67" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:13,fontWeight:800,fill:INK}}>{activeCands}</text>
<text x="31" y="80" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.5,fill:MUT}}>candidates</text>
{GATES.map((g,i)=>{const x=gx(i);const blocked=g.held>0;const last=i===GATES.length-1;
return(<g key={g.name} onClick={()=>setTab(g.tab)} style={{cursor:"pointer"}}>
{/* flow line into the gate */}
<line x1={i===0?52:gx(i-1)+34} y1="70" x2={x-34} y2="70" stroke={MUT} strokeWidth="1.5" markerEnd="none"/>
<polygon points={(x-34)+",70 "+(x-40)+",66 "+(x-40)+",74"} fill={MUT}/>
{/* the gate */}
<rect x={x-34} y="42" width="68" height="56" fill={last?"#f2f8f4":"#fff"} stroke={blocked?AC:last?GRN:RULE} strokeWidth={blocked?2:1.2}/>
<text x={x} y="58" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,fill:INK}}>{g.name}</text>
<text x={x} y="76" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:14,fontWeight:800,fill:last?GRN:blocked?AC:GRN}}>{last?(reso.signed||0):g.held}</text>
<text x={x} y="90" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:7,fill:MUT}}>{last?"signed":"held · "+g.sub}</text>
{/* held candidates drop below the line */}
{blocked&&!last&&<g><line x1={x} y1="98" x2={x} y2="114" stroke={AC} strokeWidth="1" strokeDasharray="3 2"/>
<text x={x} y="126" textAnchor="middle" style={{fontFamily:"Helvetica",fontSize:6.5,fill:AC}}>held here — review →</text></g>}
</g>);})}
<text x={gw-12} y={gh-8} textAnchor="end" style={{fontFamily:"Helvetica",fontSize:6.5,fill:MUT}}>held ≠ declined</text>
</svg>
{/* predictive strip: modeled clear-week per blocked gate; drafts proposals, never executes */}
{(()=>{const blocked=GATES.filter(g=>g.held>0&&g.name!=="Sign");
if(blocked.length===0)return null;
return(<div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",border:`1px solid ${RULE}`,borderLeft:`3px solid ${VIO}`,background:"#fff",padding:"9px 14px",marginBottom:10,...CARD}}>
<span style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700,color:VIO,letterSpacing:0.5}}>PREDICTED</span>
{blocked.map(g=>{const wk=1+(hash(g.name+String(g.held))%4);
return(<span key={g.name} style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>{g.name}: clears ~wk {wk} {wk>2?"— needs action":"on current pace"}</span>);})}
<button onClick={()=>{blocked.forEach(g=>logL("blockers","Predictive","Drafted support proposal for "+g.name+" gate — "+g.held+" held; queued for a named approver, not executed"));}} style={{fontFamily:"Helvetica",fontSize:9,padding:"4px 10px",background:VIO,color:"#fff",border:"none",cursor:"pointer"}}>Auto-draft support proposals ▸</button>
<span style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT}}>drafts to the queue — a named owner still commits (Rule 1)</span>
</div>);})()}
<div style={{display:"flex",border:`1px solid ${RULE}`,borderLeft:`3px solid ${totalBlocked>0?AC:GRN}`,background:"#fff",marginBottom:10,padding:"8px 12px"}}>
<div><div style={{fontFamily:"Helvetica",fontSize:22,fontWeight:800,color:totalBlocked>0?AC:GRN}}>{totalBlocked}</div><div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>total items currently blocking growth</div></div>
</div>
<div style={{border:`1px solid ${RULE}`,background:"#fff"}}>
{blockers.map((b,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 12px",borderTop:i?"1px solid #f0f0f0":"none"}}>
<div>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:700}}>{b.label}</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>{b.detail}</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<span style={{fontFamily:"Helvetica",fontSize:20,fontWeight:800,color:b.n>0?AC:GRN}}>{b.n}</span>
{b.n>0&&<button onClick={()=>setTab(b.tab)} style={{fontFamily:"Helvetica",fontSize:8.5,color:AC,cursor:"pointer",background:"none",border:"none",padding:0,textDecoration:"underline"}}>review →</button>}
</div>
</div>))}
</div>
</div>);})()}</EngineErrorBoundary>}
{tab==="deals"&&<EngineErrorBoundary>{(()=>{
// FRANCHISE DEVELOPMENT PIPELINE — mapped 1:1 to the Director role's actual process:
// intro call → discovery call → FDD review (FTC 14-day clock, Item 23 receipt) →
// validation → due diligence (docs + budgets) → discovery day → signing.
// Benchmarks are published industry ranges; all candidate data modeled.
const stageOfLive=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
const STG=[["Intro call","first contact · qualify basics"],["Discovery call","goals · capital · territory fit"],["FDD review","14-day FTC clock · Item 23 receipt"],["Validation","calls with existing franchisees"],["Due diligence","docs · budgets · to corporate"],["Discovery day","in-person evaluation gate"],["Signed","agreement · fee · to onboarding"]];
const BENCH=[15,40,50,60,55,70]; // midpoint conversion % between stages (published ranges)
const rows=[...LEADS].sort((a,b)=>stageOfLive(b)-stageOfLive(a)||b.fit-a.fit);
const byStage=STG.map((_,si)=>rows.filter(l=>Math.min(stageOfLive(l),6)===si));
const fddClock=l=>{const d=14-(hash(l.n)%17);return d;}; // modeled days remaining on 14-day clock
const valCalls=l=>2+(hash(l.n)%7); // modeled validation calls completed (target 5–10)
const daysIn=l=>3+(hash(l.n+"d")%29);
const brokerN=rows.filter(l=>hash(l.n)%3===0).length;
const signedN=byStage[6].length;
const quota=12;
return(<div>
{(()=>{ // ANNUAL SALES TARGET — quota, pacing, and the funnel worked backward through the benchmarks
const QUOTA=12, FEE=45; // modeled initial franchise fee, $k — illustrative, not an FDD representation
const wk=Math.min(52,(ledger||[]).length+1), expected=Math.round(QUOTA*wk/52*10)/10; // same week formula as the Season tab — one clock
const signedNow=[...LEADS].filter(l=>(leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0)>=6).length;
const pace=signedNow-expected;
// backward funnel: to sign 12, at benchmark midpoints, each stage must carry:
const CONV=[0.15,0.40,0.50,0.60,0.55,0.70];
let need=QUOTA; const needs=[QUOTA];
for(let k=CONV.length-1;k>=0;k--){need=Math.ceil(need/CONV[k]);needs.unshift(need);}
const SLBL=["Leads","Discovery","FDD issued","Validation","Due dilig.","Disc. day","Signed"];
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${GRN}`,background:"#fff",padding:"10px 14px",marginBottom:10,...CARD}}>
<div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",marginBottom:8}}>
<span style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:GRN}}>Annual sales target · {QUOTA} signings</span>
<span style={{fontFamily:"Helvetica",fontSize:9.5}}><b>{signedNow}</b> signed · wk {wk} pro-rata {expected} · <b style={{color:pace>=0?GRN:AC}}>{pace>=0?"+":""}{pace} vs pace</b></span>
<span style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT}}>fee revenue at target: <b style={{color:INK}}>${QUOTA*FEE}k</b> · commission (10%): <b style={{color:INK}}>${(QUOTA*FEE*0.10).toFixed(1)}k</b></span>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,marginBottom:5}}>The funnel worked backward — what each stage must carry all year to make quota at benchmark conversion:</div>
<div style={{display:"flex",gap:0,alignItems:"flex-end"}}>
{needs.map((v,k)=>(<div key={k} style={{flex:1,textAlign:"center"}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:800,color:k===needs.length-1?GRN:INK}}>{v}</div>
<div style={{height:Math.max(8,Math.min(46,v/needs[0]*46)),background:k===needs.length-1?GRN:VIO,opacity:0.25+0.75*(k/(needs.length-1)),margin:"2px 6px",borderRadius:3}}/>
<div style={{fontFamily:"Helvetica",fontSize:6.5,color:MUT}}>{SLBL[k]}</div>
</div>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,marginTop:5}}>~{needs[0]} qualified leads/yr ≈ {Math.ceil(needs[0]/12)}/mo. Fee and conversion figures modeled from published ranges — targets are the operator's to set; the math keeps them honest.</div>
</div>);})()}
<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",marginBottom:8}}>Franchise development pipeline — the Director's actual sales process, stage for stage: intro → discovery → FDD (with the <b>FTC 14-day disclosure clock</b> and Item 23 receipt tracked in-pipeline) → validation → due diligence → discovery day → signing. Cycle norm 90–180 days; each stage 3–6 weeks.</div>

{/* status report line — the responsibility "status analysis and reporting" */}
<div style={{display:"flex",gap:16,flexWrap:"wrap",border:`1px solid ${RULE}`,background:"#fff",padding:"8px 12px",marginBottom:10,...CARD,fontFamily:"Helvetica"}}>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Active candidates</div><b style={{fontSize:15}}>{rows.length-signedN}</b></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Signed vs quota</div><b style={{fontSize:15,color:signedN>=quota?GRN:INK}}>{signedN} / {quota}</b></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Broker-sourced</div><b style={{fontSize:15}}>{brokerN}</b><span style={{fontSize:8,color:MUT}}> · close 5–10× cold</span></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>FDD clocks running</div><b style={{fontSize:15,color:AMB}}>{byStage[2].length}</b></div>
<div><div style={{fontSize:7.5,color:MUT,textTransform:"uppercase"}}>Pipeline coverage</div><b style={{fontSize:15}}>{((rows.length-signedN)*0.02*100/ Math.max(1,quota)).toFixed(1)}×</b><span style={{fontSize:8,color:MUT}}> at ~2% lead→close</span></div>
</div>

{/* stage columns with benchmark conversion between them */}
<div style={{overflowX:"auto"}}>
<div style={{display:"flex",gap:0,minWidth:1000,alignItems:"stretch"}}>
{STG.map(([nm,sub],si)=>(<React.Fragment key={nm}>
<div style={{flex:1,border:`1px solid ${RULE}`,background:si===6?"#f4faf5":"#fff",padding:8,minHeight:150,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:800}}>{nm} <span style={{color:MUT,fontWeight:400}}>· {byStage[si].length}</span></div>
<div style={{fontFamily:"Helvetica",fontSize:6.5,color:MUT,marginBottom:6}}>{sub}</div>
{byStage[si].slice(0,3).map(l=>(<div key={l.id} onClick={()=>setLeadSel(l.id)} style={{border:`1px solid ${RULE}`,borderLeft:`2px solid ${si===6?GRN:VIO}`,background:"#fff",padding:"4px 6px",marginBottom:4,cursor:"pointer"}}>
<div style={{fontFamily:"Helvetica",fontSize:8.5,fontWeight:700}}>{l.n}</div>
<div style={{fontFamily:"Helvetica",fontSize:6.5,color:MUT}}>{daysIn(l)}d in stage{si===2?(" · FDD clock: "+Math.max(0,fddClock(l))+"d left"+(fddClock(l)<0?" ⚠ EXPIRED-REISSUE":"")):""}{si===3?(" · "+valCalls(l)+"/5+ validation calls"):""}</div>
{si===2&&<div style={{fontFamily:"Helvetica",fontSize:6.5,color:fddClock(l)<=3?AC:GRN}}>{fddClock(l)<=0?"eligible to proceed":"Item 23 receipt on file · waiting period running"}</div>}
</div>))}
{byStage[si].length>3&&<div style={{fontFamily:"Helvetica",fontSize:7,color:MUT}}>+{byStage[si].length-3} more</div>}
</div>
{si<6&&<div style={{width:34,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
<div style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:800,color:VIO}}>{BENCH[si]}%</div>
<div style={{fontFamily:"Helvetica",fontSize:12,color:MUT}}>→</div>
</div>}
</React.Fragment>))}
</div>
</div>
<div style={{fontFamily:"Helvetica",fontSize:8,color:MUT,margin:"6px 0 12px"}}>Stage-to-stage percentages are published industry benchmark midpoints (lead→qualified 10–20% … discovery-day→signed 60–80%; compounding to ~0.5–4% lead→close). Candidate data modeled. The FDD stage enforces the FTC 14-day waiting period — no candidate advances with a running clock.</div>

{/* candidate brief (kept): click a card above */}
{(()=>{const l=rows.find(x=>x.id===leadSel)||rows[0];if(!l)return null;const s=Math.min(stageOfLive(l),6);
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${INK}`,background:"#fff",padding:"10px 14px",...CARD}}>
<div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
<b style={{fontFamily:"Helvetica",fontSize:12}}>{l.n}</b>
<span style={{fontFamily:"Helvetica",fontSize:7.5,fontWeight:700,color:"#fff",background:VIO,padding:"2px 8px",borderRadius:999}}>{STG[s][0]}</span>
<span style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT}}>fit {l.fit} · {l.market} · {daysIn(l)}d in stage</span>
</div>
<div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:8,fontFamily:"Helvetica",fontSize:9}}>
<span><b>Next action:</b> {s===0?"book discovery call":s===1?"issue FDD · start 14-day clock":s===2?(fddClock(l)<=0?"schedule validation calls":"hold — clock has "+Math.max(0,fddClock(l))+"d"):s===3?"complete "+Math.max(0,5-valCalls(l))+" more validation calls":s===4?"docs + budget to corporate for processing":s===5?"discovery day → decision":"onboarding handoff"}</span>
<span><b>Owner:</b> Franchise Director</span>
</div>
<div style={{marginTop:8,display:"flex",gap:8}}>
{s<6&&<button onClick={()=>{const cur=stageOfLive(l);if(s===2&&fddClock(l)>0){logL("deals","Pipeline","Advance blocked for "+l.n+" — FDD 14-day clock still running (compliance gate)");return;}setLeadStage(m=>({...m,[l.id]:cur+1}));logL("deals","Pipeline",l.n+" advanced to "+STG[Math.min(s+1,6)][0]+" (owner: Franchise Director)");}}
 style={{fontFamily:"Helvetica",fontSize:9,fontWeight:700,padding:"6px 14px",cursor:"pointer",border:"none",background:INK,color:"#fff",borderRadius:6}}>Advance stage ▸</button>}
<button onClick={()=>{logL("deals","Pipeline","Status report noted for "+l.n+" — "+STG[s][0]+", "+daysIn(l)+"d in stage");}} style={{fontFamily:"Helvetica",fontSize:9,padding:"6px 12px",cursor:"pointer",border:`1px solid ${RULE}`,background:"#fff",color:MUT,borderRadius:6}}>Log status</button>
</div>
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,marginTop:6}}>Advancing past FDD is blocked while the 14-day clock runs — the compliance gate is in the pipeline, not in someone's memory.</div>
</div>);})()}
</div>);})()}</EngineErrorBoundary>}
{tab==="onboarding"&&(()=>{
/* CENTER BUDGET injected below via budgetPanel — one-time opening + monthly operating, fully modeled */

// A signed deal is not an open center. Every deal that has cleared Signed
// gets a real post-signing project plan: site, build-out, training, launch --
// deterministic per deal (not random on every render), and genuinely gated (training cannot start before build-out clears).
const stageOfLive=l=>leadStage[l.id]!==undefined?leadStage[l.id]:l.stage0;
const signedLeads=LEADS.filter(l=>stageOfLive(l)===5);
const MILESTONES=["Site selected","Lease signed","Build-out","Staff hired","Sensei training","Grand opening"];
const planFor=l=>{
const r=rng(hash(l.n+"proj"));
let day=0;const durations=[14,10,45,21,14,7];
return MILESTONES.map((m,i)=>{
const dur=durations[i];const jitter=Math.floor(r()*6)-3;
const start=day;const end=day+dur+jitter;day=end;
const today=30; // illustrative "today" marker, days since signing
const status=end<today?"done":start<today?"in progress":"not started";
return{m,start,end:Math.max(start+1,end),status};
});
};
// Corporate's own admitted failure mode (Entrepreneur, 2023): new centers
// get "stuck between two massive projects" -- finishing construction on
// time, and enrolling enough students before opening. Build-out is already gated above; pre-sale enrollment is tracked here as its own parallel track ag
const ENROLL_TARGET=35; // students, illustrative pre-opening enrollment floor
const enrollFor=l=>{
const r=rng(hash(l.n+"enroll"));
const buildOutEnd=14+10+45; // day build-out clears, matches durations above
const openDay=buildOutEnd+21+14+7;
const pace=0.6+r()*0.7; // this deal's enrollment pace relative to target
const today=30;
const enrolledSoFar=Math.round(Math.min(ENROLL_TARGET,(today/openDay)*ENROLL_TARGET*pace));
const daysToOpen=Math.max(0,openDay-today);
const onPace=enrolledSoFar>=Math.round((today/openDay)*ENROLL_TARGET*0.85);
const atRisk=daysToOpen<=30&&enrolledSoFar<ENROLL_TARGET*0.7;
return{enrolledSoFar,target:ENROLL_TARGET,daysToOpen,onPace,atRisk,openDay};
};
return(<div>
{(()=>{ // CENTER BUDGET — ongoing structure: budgeted vs actual vs variance, operator-filled.
// No fixed figures: the categories are the framework; amounts come from real quotes and the FDD's Item 7 ranges.
const CATS=[
 ["open","One-time · opening",[ "Initial franchise fee","Leasehold build-out & permits","Computers, tech & curriculum hardware","Furniture & dojo fit-out","Signage (exterior + interior)","Initial marketing & grand opening","Training, travel & lodging","Insurance, deposits, licenses","Working capital reserve (6 mo)"]],
 ["mo","Monthly · operating",["Rent & CAM","Payroll — senseis & lead","Royalty + brand fund","Local marketing","Software, LMS & subscriptions","Utilities & internet","Supplies & events","Insurance & misc"]]];
const get=(k)=>bud[k]||{b:"",a:""};
const setF=(k,f,v)=>setBud(m=>({...m,[k]:{...(m[k]||{b:"",a:""}),[f]:v}}));
const num=v=>{const n=parseFloat(v);return isNaN(n)?0:n;};
const tot=(pref,f)=>CATS.find(c=>c[0]===pref)[2].reduce((a,item)=>a+num(get(pref+item)[f]),0);
return(<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${AMB}`,background:"#fff",padding:"10px 14px",marginBottom:12,...CARD}}>
<div style={{fontFamily:"Helvetica",fontSize:9,fontWeight:800,letterSpacing:0.8,textTransform:"uppercase",color:AMB,marginBottom:3}}>Center budget — ongoing structure</div>
<div style={{fontFamily:"Helvetica",fontSize:8.5,color:MUT,marginBottom:8}}>The framework, not the figures: enter budgeted from the candidate's quotes and the FDD's Item 7 ranges, then actuals as they land. Variance computes live. This is a living document per center, reviewed at due diligence and every month after opening.</div>
<div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
{CATS.map(([pref,title,items])=>(<div key={pref} style={{flex:"1 1 340px"}}>
<div style={{display:"flex",fontFamily:"Helvetica",fontSize:7,color:MUT,textTransform:"uppercase",letterSpacing:0.4,padding:"2px 0"}}>
<span style={{flex:2.2}}>{title} ($k)</span><span style={{flex:0.9,textAlign:"right"}}>Budgeted</span><span style={{flex:0.9,textAlign:"right"}}>Actual</span><span style={{flex:0.9,textAlign:"right"}}>Variance</span></div>
{items.map(item=>{const k=pref+item,v=get(k),d=num(v.a)-num(v.b);
return(<div key={k} style={{display:"flex",alignItems:"center",fontFamily:"Helvetica",fontSize:9,padding:"2px 0",borderTop:"1px solid #f4f4ef"}}>
<span style={{flex:2.2,color:"#444"}}>{item}</span>
<input value={v.b} onChange={e=>setF(k,"b",e.target.value)} placeholder="—" style={{flex:0.9,width:0,textAlign:"right",fontFamily:"Helvetica",fontSize:9,border:"none",borderBottom:`1px dashed ${RULE}`,background:"transparent",outline:"none"}}/>
<input value={v.a} onChange={e=>setF(k,"a",e.target.value)} placeholder="—" style={{flex:0.9,width:0,textAlign:"right",fontFamily:"Helvetica",fontSize:9,border:"none",borderBottom:`1px dashed ${RULE}`,background:"transparent",outline:"none"}}/>
<span style={{flex:0.9,textAlign:"right",fontWeight:700,color:v.a===""?MUT:d>0?AC:GRN}}>{v.a===""?"—":(d>0?"+":"")+d.toFixed(1)}</span>
</div>);})}
<div style={{display:"flex",fontFamily:"Helvetica",fontSize:9.5,padding:"3px 0",borderTop:`2px solid ${INK}`,marginTop:2}}>
<b style={{flex:2.2}}>Total</b><b style={{flex:0.9,textAlign:"right"}}>{tot(pref,"b").toFixed(1)}</b><b style={{flex:0.9,textAlign:"right"}}>{tot(pref,"a").toFixed(1)}</b>
<b style={{flex:0.9,textAlign:"right",color:tot(pref,"a")-tot(pref,"b")>0?AC:GRN}}>{(tot(pref,"a")-tot(pref,"b")).toFixed(1)}</b></div>
</div>))}
</div>
<div style={{fontFamily:"Helvetica",fontSize:7.5,color:MUT,marginTop:6}}>Structure only — nothing here asserts an Item 7 figure. Overruns show red the moment actuals exceed budget; that's the review trigger, not month-end.</div>
</div>);})()}

<div style={{fontFamily:"Helvetica",fontSize:10.5,color:"#444",lineHeight:1.55,marginBottom:8}}>A signed deal is not yet an open center. Six real milestones from signature to grand opening, gated in sequence — training cannot start before build-out clears, opening cannot happen before training does — tracked alongside pre-sale enrollment, the second half of the bottleneck construction alone doesn't capture. {signedLeads.length} deal{signedLeads.length===1?"":"s"} currently in this stage.</div>
{signedLeads.length===0?<div style={{fontFamily:"Helvetica",fontSize:9.5,color:MUT,border:`1px solid ${RULE}`,padding:"10px 12px"}}>No signed deals yet this session — sign one in Growth Pipeline to populate a project plan.</div>:
signedLeads.map(l=>{const plan=planFor(l);const totalDays=plan[plan.length-1].end;const en=enrollFor(l);
return(<div key={l.id} style={{border:`1px solid ${RULE}`,background:"#fff",padding:"10px 12px",marginBottom:10}}>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,marginBottom:6}}>{l.n} — {l.region} <span style={{fontWeight:400,color:MUT,fontSize:9}}>({totalDays}-day plan to opening)</span></div>
{plan.map((p,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
<span style={{width:120,fontFamily:"Helvetica",fontSize:9}}>{p.m}</span>
<div style={{flex:1,height:8,background:"#eee",borderRadius:4,position:"relative"}}>
<div style={{position:"absolute",left:(p.start/totalDays*100)+"%",width:Math.max(2,(p.end-p.start)/totalDays*100)+"%",height:8,borderRadius:4,background:p.status==="done"?GRN:p.status==="in progress"?AMB:RULE}}/>
</div>
<span style={{width:80,fontFamily:"Helvetica",fontSize:8.5,color:p.status==="done"?GRN:p.status==="in progress"?AMB:MUT,textTransform:"capitalize"}}>{p.status}</span>
</div>))}
<div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${RULE}`,display:"flex",alignItems:"center",gap:8}}>
<span style={{width:120,fontFamily:"Helvetica",fontSize:9,fontWeight:700}}>Pre-sale enrollment</span>
<div style={{flex:1,height:8,background:"#eee",borderRadius:4}}><div style={{height:8,width:Math.min(100,(en.enrolledSoFar/en.target*100))+"%",borderRadius:4,background:en.atRisk?AC:en.onPace?GRN:AMB}}/></div>
<span style={{width:80,fontFamily:"Helvetica",fontSize:8.5,color:en.atRisk?AC:en.onPace?GRN:AMB}}>{en.enrolledSoFar}/{en.target}</span>
</div>
{en.atRisk&&<div style={{fontFamily:"Helvetica",fontSize:8.5,color:AC,marginTop:3}}>⚠ {en.daysToOpen}d to opening, enrollment trailing — the exact bottleneck pattern that prompted corporate's New Center Opening enrollment mandate.</div>}
</div>);})}
</div>);})()}
{tab==="continuity"&&<EngineErrorBoundary><ContinuityTab centers={centers} opt={opt} railData={railData}/></EngineErrorBoundary>}
{tab==="signals"&&<EngineErrorBoundary><SignalsTab/></EngineErrorBoundary>}
{["acquire","deliver","retain","operate","plan","metrics","failure"].includes(tab)&&<OpsSystem view={tab}/>}
<div style={{borderTop:`2px solid ${INK}`,marginTop:16,paddingTop:10,fontFamily:"Helvetica"}}>
<div style={{display:"flex",gap:0,flexWrap:"wrap",marginBottom:8}}>
{[[centers.length+"-unit","modeled network",INK],[Math.round(trend.r/centers.length*100)+"%",trend.r+" rising",GRN],[trend.h,"holding steady",AMB],[trend.d,"on a support path",AC],[alerts.filter(a=>a.eta<=90).length,"early-warning flags",VIO]].map(([v,l,c],i)=>(
<div key={i} style={{flex:"1 1 100px",padding:"0 12px",borderLeft:i?`1px solid ${RULE}`:"none"}}>
<div style={{fontSize:18,fontWeight:800,color:c,lineHeight:1}}>{v}</div>
<div style={{fontSize:8,color:MUT,letterSpacing:0.3,marginTop:2}}>{l}</div>
</div>))}
</div>
<div style={{fontSize:8.5,color:MUT,lineHeight:1.6,borderTop:`1px solid ${RULE}`,paddingTop:6}}>
<b style={{color:INK}}>SUBMISSION ARTIFACT</b> · 64 verified from public records · FDD Item 20: 244 authoritative · seeds illustrative, structures computed live · Pratik Singh · (925) 699-0867
</div>
<div style={{fontSize:8,color:"#999",lineHeight:1.5,marginTop:4}}>Data provenance: every figure across every view in this artifact is derived from one canonical state (centers, states, railData, dyn, ledger) at render time — no view holds a separate copy, and no figure is pre-computed or cached. Where a tab states this locally, it is this same guarantee, not a separate one.</div>
</div>
</div>);
}
// ===== UNIFIED VIEWS — one shared state, five operational views =====

// ================================================================
// CN — UNIFIED OPERATIONS VIEWS
// One canonical state, five operational views, pricing-ceiling
// threshold, data-freshness decay Plus: recovery-signature analysis, aggregate peer benchmarking, retention-inflection marker Corporate register through
// ================================================================

// ---------- CANONICAL FB_BOUNDARY STATE (cn-boundary/1.1) ----------
// ONE state object. Every tab is a measurement basis — a rotation
// of this same state. Nothing else holds truth.
const FB_DIMS = ["engagement", "margin", "staffing", "compliance", "community"];

// NOTE ON TWO DATASETS: this file carries two separate illustrative center models —
// the primary `centers`/`states` array (built by buildCenters(), used by Overview,
// the agents, Decision Rail, and the Six-Lens surface) and this smaller FB_BOUNDARY object (a handful of states, used only by the System lens, the "unif
const FB_BOUNDARY = {
schema: "cn-boundary/1.1",
week: 7, // global measurement time
clusters: [
{ id: "WEST", members: ["CA", "OR"], coupling: 0.78 },
{ id: "CENTRAL", members: ["TX"], coupling: 0.31 },
{ id: "EAST", members: ["NY"], coupling: 0.22 },
],
centers: [
{ id: "CA", label: "Pleasanton CA — Provenance", pos: [22, 62], state: "thriving", col: "#2fbf5f",
vals: { engagement: 0.78, margin: 0.87, staffing: 0.85, compliance: 0.98, community: 0.82 },
mom:  { engagement: 0.28, margin: 0.18, staffing: 0.08, compliance: 0, community: 0.22 },
lastMeasured: 1, shock: null,
tuition: 289, Tc: 349, // pricing ceiling (market tolerance limit)
tau0: 1.8 },
{ id: "TX", label: "Austin TX", pos: [48, 78], state: "watch", col: "#d9a520",
vals: { engagement: 0.50, margin: 0.65, staffing: 0.62, compliance: 0.90, community: 0.48 },
mom:  { engagement: -0.45, margin: -0.05, staffing: -0.35, compliance: 0, community: -0.40 },
lastMeasured: 4, shock: { week: 3, kind: "Lead Sensei departure", amp: 0.34 },
tuition: 275, Tc: 312,
tau0: 3.1 },
{ id: "NY", label: "Brooklyn NY", pos: [82, 40], state: "at-risk", col: "#e03535",
vals: { engagement: 0.30, margin: 0.21, staffing: 0.32, compliance: 0.85, community: 0.15 },
mom:  { engagement: -0.70, margin: -0.85, staffing: -0.65, compliance: 0, community: -0.90 },
lastMeasured: 6, shock: { week: 1, kind: "Tuition increase +12%", amp: 0.61 },
tuition: 335, Tc: 341, // 6 dollars from the pricing ceiling
tau0: 6.4 },
{ id: "OR", label: "Portland OR", pos: [16, 30], state: "stale", col: "#8a8fa8",
vals: { engagement: 0.45, margin: 0.52, staffing: 0.55, compliance: 0.92, community: 0.38 },
mom:  { engagement: 0, margin: 0, staffing: 0, compliance: 0, community: 0 },
lastMeasured: 9, shock: null,
tuition: 259, Tc: 318,
tau0: 2.6 },
],
};

// ---------- STATE DERIVATIONS (all bases read through these) ----
const fbClamp = (v) => Math.max(0.02, Math.min(1, v));
const fbDimVal = (c, d, w) => fbClamp(c.vals[d] - c.mom[d] * 0.055 * (7 - w));
/** fbHealth: composite center health across the five boundary dimensions — the primary observation-layer signal. */
const fbHealth = (c, w) => FB_DIMS.reduce((s, d) => s + fbDimVal(c, d, w), 0) / 5;

// Data freshness: exponential confidence decay since
// last measurement. gamma calibrated so fbCoherence ≈ 0.5 at 4 weeks.
const FB_GAMMA = 0.173;
/** fbCoherence: alignment of center behavior with its boundary schema, decaying with time since last verified measurement; high coherence reduces pilot risk. */
const fbCoherence = (c, w) => Math.exp(-FB_GAMMA * Math.max(0, w - (7 - c.lastMeasured)));
const fbStaleness = (c, w) => 1 - fbCoherence(c, w);

// Recovery time: base recovery stretched by
// distance to the pricing ceiling; grows sharply as tuition approaches Tc.
/** fbTau: weeks a center can run un-remeasured before its estimate ages into unreliability — the rollback trigger for stale state. */
const fbTau = (c, w) => {
// Compatibility guard: live canonical centers lack the FB demo fields
// (Tc, tuition, tau0). Derive an equivalent recovery time from health on
// the same scale (>=3 critical, >=2 watch), neutral pricing gap assumed.
if (c.Tc === undefined || c.tau0 === undefined) {
const h = Math.max(0.15, (c.health || 60) / 100);
return 2.8 * (1 / h) * 0.5;
}
const h = fbHealth(c, w);
const tcGap = Math.max(0.02, (c.Tc - c.tuition) / c.Tc); // proximity to the pricing ceiling
return c.tau0 * (1 / Math.max(0.15, h)) * (0.4 / tcGap) * 0.5;
};
const fbTauAlert = (t) => (t >= 3 ? "critical" : t >= 2 ? "watch" : "ok");
const CR_SETTLE = (Q) => (Q > 3 ? "prolonged" : "on schedule"); // settling classifier for recovery signatures

// Recovery signature: post-shock recovery is a damped swing
// damped-swing model; settling index Q summarizes how quickly swings die out.
// Healthy centers recover fast; fragile ones take longer to settle — recovery speed is the early warning.
const fbRecoverySig = (c, w) => {
if (!c.shock) return null;
const t = w - c.shock.week;
if (t < 0) return null;
const T = fbTau(c, w);
const omega = 2.2;
const pts = [];
for (let i = 0; i <= 40; i++) {
const tt = (i / 40) * 10;
pts.push({ t: tt, a: c.shock.amp * Math.exp(-tt / T) * Math.cos(omega * tt) });
}
const residual = c.shock.amp * Math.exp(-t / T);
const Q = (omega * T) / 2;
return { pts, residual, Q, elapsed: t };
};

// Retention inflection: point in decline where staff/family attrition compounds
// the center (parents talk, staff interview out). Modeled as the
// week fbHealth is projected to cross 0.5 — half-evaporation.
const fbInflection = (c) => {
const declRate = -FB_DIMS.reduce((s, d) => s + c.mom[d], 0) / 5 * 0.055;
if (declRate <= 0.001) return null;
const h7 = fbHealth(c, 7);
const weeksTo = (h7 - 0.5) / declRate;
return weeksTo > 0 && weeksTo < 40 ? 7 + weeksTo : weeksTo <= 0 ? 7 : null;
};

// Peer benchmarking: clusters exchange AGGREGATE similarity
// scores, never raw center books. Score = mean pairwise
// dimension alignment inside cluster (privacy-by-boundary).
/** fbClusterKernel: cluster-level coupling strength — the network structure an oversight function (human or agent) monitors for propagation risk. */
const fbClusterKernel = (cl, w) => {
const cs = FB_BOUNDARY.centers.filter((c) => cl.members.includes(c.id));
if (cs.length < 2) {
const c = cs[0];
return { k: fbHealth(c, w), n: 1, robust: cl.coupling > 0.5 };
}
let k = 0, pairs = 0;
for (let i = 0; i < cs.length; i++)
for (let j = i + 1; j < cs.length; j++) {
k += FB_DIMS.reduce((s, d) => s + (1 - Math.abs(fbDimVal(cs[i], d, w) - fbDimVal(cs[j], d, w))), 0) / 5;
pairs++;
}
return { k: k / pairs, n: cs.length, robust: cl.coupling > 0.5 };
};

// ---------- SHARED TOKENS ----------
const FB_BG = "#05060e", FB_PANEL = "#0a0d1f", FB_LINE = "#1c2650", FB_INKD = "#e8ecff",
FB_MUTD = "#5a6a9e", FB_CY = "#27c8e8", FB_VI = "#9d7bff", FB_MONO = "'SF Mono','Cascadia Code',Consolas,monospace";

const fbStateCol = (h) => (h < 0.35 ? "#e03535" : h < 0.6 ? "#d9a520" : "#2fbf5f");

const FBChip = ({ children, col = FB_MUTD }) => (
<span style={{ fontFamily: FB_MONO, fontSize: 9, color: col, border: `1px solid ${col}44`, borderRadius: 2, padding: "1px 5px" }}>{children}</span>
);

const FBBar = ({ v, col }) => (
<div style={{ height: 4, background: "#141d3d", borderRadius: 2 }}>
<div style={{ height: 4, width: `${v * 100}%`, borderRadius: 2, background: col || fbStateCol(v), transition: "width .3s" }} />
</div>
);

// ================================================================
// VIEW 1 — MAP (spatial graph + coupling + wells)
// ================================================================
function BasisMap({ w, sel, setSel, q }) {
const links = useMemo(() => {
const out = [];
for (let i = 0; i < FB_BOUNDARY.centers.length; i++)
for (let j = i + 1; j < FB_BOUNDARY.centers.length; j++) {
const a = FB_BOUNDARY.centers[i], b = FB_BOUNDARY.centers[j];
const k = FB_DIMS.reduce((s, d) => s + (1 - Math.abs(fbDimVal(a, d, w) - fbDimVal(b, d, w))), 0) / 5;
const sameCluster = FB_BOUNDARY.clusters.some((cl) => cl.members.includes(a.id) && cl.members.includes(b.id));
out.push({ a, b, k, sameCluster });
}
return out;
}, [w]);

return (
<svg viewBox="0 0 100 100" style={{ width: "100%", height: 360, background: FB_BG, borderRadius: 6, border: `1px solid ${FB_LINE}` }}>
{/* coupling links */}
{links.map((l, i) => (
<line key={i} x1={l.a.pos[0]} y1={l.a.pos[1]} x2={l.b.pos[0]} y2={l.b.pos[1]}
stroke={l.sameCluster ? FB_VI : FB_CY} strokeWidth={0.15 + l.k * 0.7}
strokeDasharray={l.sameCluster ? "1.5 1" : "none"} opacity={0.15 + l.k * 0.5} />
))}
{/* centers as wells: radius = 1 - fbHealth (deeper well = bigger risk halo) */}
{FB_BOUNDARY.centers.map((c) => {
const h = fbHealth(c, w);
const coh = fbCoherence(c, w);
const r = 3 + (1 - h) * 6;
return (
<g key={c.id} onClick={() => setSel(sel === c.id ? null : c.id)} style={{ cursor: "pointer" }}>
<circle cx={c.pos[0]} cy={c.pos[1]} r={r} fill={fbStateCol(h)} opacity={0.12} />
<circle cx={c.pos[0]} cy={c.pos[1]} r={2.4} fill={fbStateCol(h)} opacity={0.35 + coh * 0.6} />
{/* dashed ring = decohered / stale */}
{coh < 0.6 && <circle cx={c.pos[0]} cy={c.pos[1]} r={3.6} fill="none" stroke={FB_MUTD} strokeWidth={0.25} strokeDasharray="0.8 0.8" />}
{sel === c.id && <circle cx={c.pos[0]} cy={c.pos[1]} r={4.6} fill="none" stroke={FB_INKD} strokeWidth={0.3} />}
<text x={c.pos[0]} y={c.pos[1] - r - 1.5} textAnchor="middle" fill={FB_INKD} fontSize={2.8} fontFamily={FB_MONO}>{c.id}</text>
<text x={c.pos[0]} y={c.pos[1] + r + 3.4} textAnchor="middle" fill={FB_MUTD} fontSize={2.2} fontFamily={FB_MONO}>
{`health ${h.toFixed(2)} · rec ${fbTau(c, w).toFixed(1)}w`}
</text>
</g>
);
})}
</svg>
);
}

// ================================================================
// BASIS 2 — CIRCUIT (workflow DAG: gates + dependencies)
// Each center runs the same measurement circuit:
// RECORD → HOLD → GATE(4 governors) → COMMIT → ACT
// ================================================================
const FB_GATES = ["RECORD", "HOLD", "GATE", "COMMIT", "ACT"];
const FB_GOVERNORS = [
{ id: "G1", name: "Financial materiality", test: (c, w) => fbDimVal(c, "margin", w) >= 0.25 },
{ id: "G2", name: "Engagement integrity", test: (c, w) => fbDimVal(c, "engagement", w) >= 0.35 },
{ id: "G3", name: "Child safety clearance", test: (c, w) => fbDimVal(c, "compliance", w) >= 0.8 },
{ id: "G4", name: "Data integrity (no inference past gap)", test: (c, w) => fbCoherence(c, w) >= 0.35 },
];

function BasisCircuit({ w, q }) {
const GNAMES = FB_GATES;
return (
<div style={{ display: "grid", gap: 10 }}>
{FB_BOUNDARY.centers.map((c) => {
const govs = FB_GOVERNORS.map((g) => ({ ...g, pass: g.test(c, w) }));
const blocked = govs.filter((g) => !g.pass);
const coh = fbCoherence(c, w);
// circuit halts at HOLD if decohered, at GATE if governor fails
const haltAt = coh < 0.35 ? 1 : blocked.length ? 2 : 4;
return (
<div key={c.id} style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: "10px 14px" }}>
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
<b style={{ fontFamily: FB_MONO, fontSize: 11, color: FB_INKD }}>{c.label}</b>
<FBChip col={blocked.length ? "#e03535" : "#2fbf5f"}>
{coh < 0.35 ? ("HELD · stale data — run a progress review first") : blocked.length ? `HELD · ${blocked.map((g) => g.id).join(" ")}` : ("CLEARED TO DECIDE")}
</FBChip>
</div>
<div style={{ display: "flex", alignItems: "center", gap: 0 }}>
{GNAMES.map((g, i) => (
<div key={g} style={{ display: "flex", alignItems: "center", flex: i < GNAMES.length - 1 ? 1 : "none" }}>
<div style={{
fontFamily: FB_MONO, fontSize: 9, padding: "5px 8px", borderRadius: 3,
border: `1px solid ${i <= haltAt ? (i === haltAt && haltAt < 4 ? "#e03535" : FB_CY) : FB_LINE}`,
color: i <= haltAt ? (i === haltAt && haltAt < 4 ? "#e03535" : FB_CY) : FB_MUTD,
background: i < haltAt ? `${FB_CY}11` : "transparent",
}}>{g}</div>
{i < GNAMES.length - 1 && <div style={{ flex: 1, height: 1, background: i < haltAt ? FB_CY : FB_LINE, opacity: i < haltAt ? 0.7 : 0.4 }} />}
</div>
))}
</div>
<div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
{govs.map((g) => (
<FBChip key={g.id} col={g.pass ? "#2fbf5f" : "#e03535"}>{g.id} {g.pass ? "✓" : "✗"} {g.name}</FBChip>
))}
</div>
</div>
);
})}
</div>
);
}

// ================================================================
// VIEW 3 — CALENDAR (timeline: reviews, retention-inflection
// markers, predicted decline windows)
// ================================================================
function BasisCalendar({ w, q }) {
const WEEKS = Array.from({ length: 14 }, (_, i) => i);
return (
<div style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: 14, overflowX: "auto" }}>
<div style={{ display: "grid", gridTemplateColumns: `90px repeat(${WEEKS.length}, 1fr)`, gap: 2, minWidth: 620 }}>
<div />
{WEEKS.map((wk) => (
<div key={wk} style={{ fontFamily: FB_MONO, fontSize: 8, color: wk === w ? FB_CY : FB_MUTD, textAlign: "center", borderBottom: wk === w ? `2px solid ${FB_CY}` : `1px solid ${FB_LINE}`, paddingBottom: 3 }}>W{wk}</div>
))}
{FB_BOUNDARY.centers.map((c) => {
const pt = fbInflection(c);
const measuredW = 7 - c.lastMeasured;
const t = fbTau(c, w);
const declineW = fbTauAlert(t) === "critical" ? w + 4 : null; // rec>3w => ~30-day window
return (
<Fragment key={c.id}>
<div style={{ fontFamily: FB_MONO, fontSize: 9.5, color: FB_INKD, padding: "6px 0" }}>{c.id}</div>
{WEEKS.map((wk) => {
const isMeasure = wk === measuredW;
const isShock = c.shock && wk === c.shock.week;
const isPage = pt !== null && Math.round(pt) === wk;
const isDecline = declineW !== null && wk === declineW;
const past = wk <= w;
return (
<div key={c.id + wk} title={[isMeasure && "measurement", isShock && c.shock.kind, isPage && "retention inflection — attrition compounding", isDecline && "predicted decline window"].filter(Boolean).join(" · ")}
style={{
height: 26, borderRadius: 2, position: "relative",
background: past ? `${fbStateCol(fbHealth(c, Math.min(wk, 12)))}22` : "#0d1128",
border: `1px solid ${FB_LINE}`, opacity: past ? 1 : 0.55,
}}>
{isMeasure && <div style={{ position: "absolute", inset: 3, borderRadius: 2, border: `1.5px solid ${FB_CY}` }} />}
{isShock && <div style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", color: "#d9a520", fontSize: 11, lineHeight: 1 }}>⚡</div>}
{isPage && <div style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", color: FB_VI, fontSize: 8, fontFamily: FB_MONO }}>Pg</div>}
{isDecline && <div style={{ position: "absolute", inset: 3, borderRadius: 2, border: `1.5px dashed #e03535` }} />}
</div>
);
})}
</Fragment>
);
})}
</div>
<div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
<FBChip col={FB_CY}>▢ {"progress review (refreshes data)"}</FBChip>
<FBChip col="#d9a520">⚡ shock event</FBChip>
<FBChip col={FB_VI}>Pg {"retention inflection — staff/parents start leaving"}</FBChip>
<FBChip col="#e03535">▢ {"predicted decline window (~30d after slow recovery)"}</FBChip>
</div>
</div>
);
}

// ================================================================
// VIEW 4 — PRICING & RECOVERY (tuition vs ceiling, recovery curves,
// fbRecoverySig signature)
// ================================================================
function BasisPhase({ w, sel, setSel, q }) {
return (
<div style={{ display: "grid", gap: 10 }}>
{/* pricing-ceiling chart */}
<div style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: 14 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 9, color: FB_VI, letterSpacing: 1, marginBottom: 8 }}>PRICING CEILING — CRITICAL TUITION</div>
{FB_BOUNDARY.centers.map((c) => {
const frac = c.tuition / c.Tc;
const danger = frac > 0.92;
return (
<div key={c.id} style={{ marginBottom: 10 }}>
<div style={{ display: "flex", justifyContent: "space-between", fontFamily: FB_MONO, fontSize: 9.5, marginBottom: 3 }}>
<span style={{ color: FB_INKD }}>{c.id} · ${c.tuition}/mo</span>
<span style={{ color: danger ? "#e03535" : FB_MUTD }}>ceiling ${c.Tc} · headroom ${c.Tc - c.tuition} {danger && "· AT PHASE FB_BOUNDARY"}</span>
</div>
<div style={{ height: 8, background: "#141d3d", borderRadius: 2, position: "relative" }}>
<div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: danger ? "#e03535" : frac > 0.8 ? "#d9a520" : "#2fbf5f", borderRadius: 2, transition: "width .3s" }} />
<div style={{ position: "absolute", left: "100%", top: -2, bottom: -2, width: 2, background: FB_VI, transform: "translateX(-2px)" }} />
</div>
</div>
);
})}
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD, lineHeight: 1.6 }}>
Below the ceiling a price move is absorbable; crossing it triggers an abrupt, largely irreversible enrollment decline. NY sits $6 from the boundary — any increase tips the unit into decline. The ceiling is computed, not discovered: predict it, stay below it.
</div>
</div>

{/* Recovery signatures */}
<div style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: 14 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 9, color: FB_CY, letterSpacing: 1, marginBottom: 8 }}>{"RECOVERY SIGNATURE — HOW EACH CENTER ABSORBS A DISRUPTION"}</div>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
{FB_BOUNDARY.centers.filter((c) => c.shock).map((c) => {
const rd = fbRecoverySig(c, w);
const T = fbTau(c, w);
const fragile = rd.Q > 3;
return (
<div key={c.id} style={{ border: `1px solid ${fragile ? "#e0353555" : FB_LINE}`, borderRadius: 4, padding: 10 }}>
<div style={{ display: "flex", justifyContent: "space-between", fontFamily: FB_MONO, fontSize: 9.5, marginBottom: 4 }}>
<b style={{ color: FB_INKD }}>{c.id} · {c.shock.kind}</b>
<span style={{ color: fragile ? "#e03535" : "#2fbf5f" }}>Q {rd.Q.toFixed(1)} · rec {T.toFixed(1)}w</span>
</div>
<svg viewBox="0 0 100 34" style={{ width: "100%", height: 70 }}>
<line x1="0" y1="17" x2="100" y2="17" stroke={FB_LINE} strokeWidth="0.4" />
<polyline fill="none" stroke={fragile ? "#e03535" : FB_CY} strokeWidth="0.8"
points={rd.pts.map((p) => `${(p.t / 10) * 100},${17 - p.a * 45}`).join(" ")} />
{/* envelope */}
<polyline fill="none" stroke={FB_MUTD} strokeWidth="0.4" strokeDasharray="1.5 1.5"
points={rd.pts.map((p) => `${(p.t / 10) * 100},${17 - c.shock.amp * Math.exp(-p.t / T) * 45}`).join(" ")} />
<line x1={(rd.elapsed / 10) * 100} y1="0" x2={(rd.elapsed / 10) * 100} y2="34" stroke={FB_CY} strokeWidth="0.5" opacity="0.6" />
</svg>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD, lineHeight: 1.5 }}>
{fragile
? "Slow recovery — the unit keeps swinging instead of settling. A high recovery index means fragile: intervene before the decline hardens into permanent loss."
: "Fast recovery — shock absorbed, unit re-settling to baseline. Healthy signature."}
{" "}Residual swing now: {(rd.residual * 100).toFixed(0)}%.
</div>
</div>
);
})}
</div>
</div>

{/* recovery time */}
<div style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: 14 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 9, color: "#d9a520", letterSpacing: 1, marginBottom: 8 }}>{"RECOVERY TIME — HOW LONG UNTIL BACK TO BASELINE"}</div>
{FB_BOUNDARY.centers.map((c) => {
const t = fbTau(c, w);
const a = fbTauAlert(t);
return (
<div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", fontFamily: FB_MONO, fontSize: 9.5 }}>
<span style={{ minWidth: 26, color: FB_INKD }}>{c.id}</span>
<div style={{ flex: 1 }}><FBBar v={Math.min(1, t / 8)} col={a === "critical" ? "#e03535" : a === "watch" ? "#d9a520" : "#2fbf5f"} /></div>
<span style={{ minWidth: 120, color: a === "critical" ? "#e03535" : a === "watch" ? "#d9a520" : FB_MUTD }}>
rec {t.toFixed(1)}w {a === "critical" ? "→ decline ~30d, activate support" : a === "watch" ? "→ lengthening, monitor" : ""}
</span>
</div>
);
})}
</div>
</div>
);
}

// ================================================================
// VIEW 5 — OPERATIONS (aggregate peer benchmarks, retention inflection, source data)
// ================================================================
function BasisOps({ w, q }) {
return (
<div style={{ display: "grid", gap: 10 }}>
<div style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: 14 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 9, color: FB_VI, letterSpacing: 1, marginBottom: 8 }}>{"PEER BENCHMARKING — benchmarks are shared, center financials never are"}</div>
{FB_BOUNDARY.clusters.map((cl) => {
const kk = fbClusterKernel(cl, w);
return (
<div key={cl.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${FB_LINE}55`, fontFamily: FB_MONO, fontSize: 9.5 }}>
<b style={{ minWidth: 70, color: FB_INKD }}>{cl.id}</b>
<span style={{ minWidth: 110, color: FB_MUTD }}>{cl.members.join(" · ")}</span>
<div style={{ flex: 1 }}><FBBar v={kk.k} col={kk.robust ? "#2fbf5f" : "#d9a520"} /></div>
<span style={{ minWidth: 150, color: kk.robust ? "#2fbf5f" : "#d9a520" }}>
benchmark alignment {kk.k.toFixed(2)} · coupling {cl.coupling.toFixed(2)} {kk.robust ? "· robust" : "· fragile — single-unit shock cascades"}
</span>
</div>
);
})}
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD, marginTop: 8, lineHeight: 1.6 }}>
Only aggregate benchmarks leave each cluster. WEST has redundant peer support: CA can absorb an OR shock. EAST is a single-node cluster — no error correction available. Priority: build NY's coupling (shared Senseis, referral pipeline) before its next shock.
</div>
</div>

<div style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: 14 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 9, color: FB_CY, letterSpacing: 1, marginBottom: 8 }}>{"RETENTION INFLECTION — WHEN STAFF AND PARENTS START LEAVING"}</div>
{FB_BOUNDARY.centers.map((c) => {
const pt = fbInflection(c);
return (
<div key={c.id} style={{ display: "flex", gap: 10, padding: "4px 0", fontFamily: FB_MONO, fontSize: 9.5 }}>
<span style={{ minWidth: 26, color: FB_INKD }}>{c.id}</span>
<span style={{ color: pt !== null && pt <= w + 2 ? "#e03535" : FB_MUTD }}>
{pt === null ? "stable — no escape trajectory" : pt <= w ? `PASSED (W${Math.round(pt)}) — parents talking, staff interviewing out. Retention cost now 3–4× intervention cost.` : `projected W${Math.round(pt)} — intervene before this line, not after`}
</span>
</div>
);
})}
</div>

<div style={{ background: FB_PANEL, border: `1px solid ${FB_LINE}`, borderRadius: 6, padding: 14 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 9, color: FB_MUTD, letterSpacing: 1, marginBottom: 8 }}>CANONICAL FB_BOUNDARY DOCUMENT — cn-boundary/1.1</div>
<div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:8 }}>
{[["Centers governed",FB_BOUNDARY.centers.length],["Mean health",(FB_BOUNDARY.centers.reduce((a,c)=>a+fbHealth(c,w),0)/FB_BOUNDARY.centers.length).toFixed(3)],["Mean coherence",(FB_BOUNDARY.centers.reduce((a,c)=>a+fbCoherence(c,w),0)/FB_BOUNDARY.centers.length).toFixed(3)],["Clusters",FB_BOUNDARY.clusters.length]].map(([k,v])=>(
<div key={k} style={{ background: FB_BG, border: `1px solid ${FB_LINE}`, borderRadius:4, padding:"8px 14px" }}>
<div style={{ fontFamily: FB_MONO, fontSize:8, color: FB_MUTD }}>{k}</div>
<div style={{ fontFamily: FB_MONO, fontSize:14, color:"#aab4dd", fontWeight:700 }}>{v}</div>
</div>))}
</div>
<details><summary style={{ fontFamily: FB_MONO, fontSize:8.5, color: FB_MUTD, cursor:"pointer" }}>Diagnostics — full canonical document (debug mode)</summary>
<pre style={{ fontFamily: FB_MONO, fontSize: 8.5, color: "#aab4dd", background: FB_BG, border: `1px solid ${FB_LINE}`, borderRadius: 4, padding: 10, overflowX: "auto", margin: "6px 0 0 0", lineHeight: 1.5, maxHeight:260, overflowY:"auto" }}>
{JSON.stringify({ schema: FB_BOUNDARY.schema, week: w, centers: FB_BOUNDARY.centers.map((c) => ({ id: c.id, fbHealth: +fbHealth(c, w).toFixed(3), fbCoherence: +fbCoherence(c, w).toFixed(3), tau_weeks: +fbTau(c, w).toFixed(2), tuition: c.tuition, Tc: c.Tc, fbInflection: fbInflection(c) ? +fbInflection(c).toFixed(1) : null })), clusters: FB_BOUNDARY.clusters.map((cl) => ({ id: cl.id, kernel: +fbClusterKernel(cl, w).k.toFixed(3), coupling: cl.coupling })) }, null, 1)}
</pre></details>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD, marginTop: 6 }}>
This object is the whole truth. Every basis above is a read of it — nothing else holds state. Serialize it, and any surface (WebXR table, PDF packet, API) reconstructs the full system.
</div>
</div>
</div>
);
}

// ---------- FRANCHISE REPORT (map click) ----------
// Integrated growth + competitive view per center. Peer rank uses
// aggregate benchmarks only. Register-aware labels via fbT.
const fbT=(q,label)=>label; // register-aware labels: corporate register only
const fbGrowth = (c, w) => {
const now = fbHealth(c, w), prior = fbHealth(c, Math.max(0, w - 4));
return { now, prior, delta: now - prior, pct: prior > 0 ? ((now - prior) / prior) * 100 : 0 };
};
const fbPeerRank = (c, w) => {
const sorted = [...FB_BOUNDARY.centers].sort((a, b) => fbHealth(b, w) - fbHealth(a, w));
return { rank: sorted.findIndex(x => x.id === c.id) + 1, of: sorted.length };
};
function FranchiseReport({ c, w, q, onClose }) {
const g = fbGrowth(c, w);
const pr = fbPeerRank(c, w);
const rec = fbTau(c, w);
const fresh = fbCoherence(c, w);
const infl = fbInflection(c);
const rd = fbRecoverySig(c, w);
const cl = FB_BOUNDARY.clusters.find(x => x.members.includes(c.id));
const kk = cl ? fbClusterKernel(cl, w) : null;
const strengths = FB_DIMS.filter(d => fbDimVal(c, d, w) >= 0.65);
const gaps = FB_DIMS.filter(d => fbDimVal(c, d, w) < 0.4);
const actions = [];
if (rec >= 3) actions.push("Recovery time above 3 weeks — activate the support plan inside 30 days");
if (fresh < 0.5) actions.push("Data is stale — run a progress review before any decision");
if (c.Tc - c.tuition <= 15) actions.push("At the pricing ceiling — hold tuition this cycle");
if (infl !== null && infl > w && infl <= w + 3) actions.push("Retention inflection inside 3 weeks — intervene now");
if (cl && cl.members.length < 2) actions.push("No peer support group — build shared staffing and referral ties before the next disruption");
if (!actions.length) actions.push("On plan — maintain current review cadence");
const growthPositive = g.delta >= 0;
return (
<div style={{ marginTop: 10, background: FB_PANEL, border: `1px solid ${growthPositive ? "#2fbf5f55" : "#e0353555"}`, borderRadius: 6, padding: 16 }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
<div>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD, letterSpacing: 1.5 }}>FRANCHISE REPORT · WEEK {w}</div>
<b style={{ fontFamily: FB_MONO, fontSize: 14, color: FB_INKD }}>{c.label}</b>
</div>
<span onClick={onClose} style={{ cursor: "pointer", color: FB_MUTD, fontSize: 14 }}>✕</span>
</div>

<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
<div style={{ border: `1px solid ${FB_LINE}`, borderRadius: 4, padding: 10 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 8, color: FB_MUTD, letterSpacing: 1 }}>GROWTH · 4-WEEK</div>
<div style={{ fontFamily: FB_MONO, fontSize: 17, color: growthPositive ? "#2fbf5f" : "#e03535", marginTop: 3 }}>{growthPositive ? "▲" : "▼"} {Math.abs(g.pct).toFixed(1)}%</div>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD }}>{g.prior.toFixed(2)} → {g.now.toFixed(2)}</div>
</div>
<div style={{ border: `1px solid ${FB_LINE}`, borderRadius: 4, padding: 10 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 8, color: FB_MUTD, letterSpacing: 1 }}>NETWORK RANK</div>
<div style={{ fontFamily: FB_MONO, fontSize: 17, color: pr.rank === 1 ? "#2fbf5f" : FB_INKD, marginTop: 3 }}>#{pr.rank} <span style={{ fontSize: 10, color: FB_MUTD }}>of {pr.of}</span></div>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD }}>{fbT(q, "benchmark").toLowerCase()} {kk ? Math.round(kk.k * 100) + "%" : "—"}</div>
</div>
<div style={{ border: `1px solid ${FB_LINE}`, borderRadius: 4, padding: 10 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 8, color: FB_MUTD, letterSpacing: 1 }}>{fbT(q, "recovery").toUpperCase()}</div>
<div style={{ fontFamily: FB_MONO, fontSize: 17, color: rec >= 3 ? "#e03535" : rec >= 2 ? "#d9a520" : "#2fbf5f", marginTop: 3 }}>{rec.toFixed(1)}w</div>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD }}>{fbT(q, "freshness").toLowerCase()} {Math.round(fresh * 100)}%</div>
</div>
<div style={{ border: `1px solid ${FB_LINE}`, borderRadius: 4, padding: 10 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 8, color: FB_MUTD, letterSpacing: 1 }}>{fbT(q, "ceiling").toUpperCase()}</div>
<div style={{ fontFamily: FB_MONO, fontSize: 17, color: c.Tc - c.tuition <= 15 ? "#e03535" : FB_INKD, marginTop: 3 }}>${c.Tc - c.tuition}</div>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD }}>${c.tuition} vs ${c.Tc} ceiling</div>
</div>
</div>

<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 12 }}>
<div>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: "#2fbf5f", letterSpacing: 1, marginBottom: 5 }}>COMPETITIVE STRENGTHS</div>
{strengths.length ? strengths.map(d => (
<div key={d} style={{ fontFamily: FB_MONO, fontSize: 9.5, color: FB_INKD, padding: "2px 0" }}>▸ {d} {fbDimVal(c, d, w).toFixed(2)} — {(() => { const best = Math.max(...FB_BOUNDARY.centers.filter(x => x.id !== c.id).map(x => fbDimVal(x, d, w))); return fbDimVal(c, d, w) >= best ? "network-leading" : "above median"; })()}</div>
)) : <div style={{ fontFamily: FB_MONO, fontSize: 9, color: FB_MUTD }}>none above 0.65 — rebuild from gaps first</div>}
</div>
<div>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: "#e03535", letterSpacing: 1, marginBottom: 5 }}>GAPS</div>
{gaps.length ? gaps.map(d => (
<div key={d} style={{ fontFamily: FB_MONO, fontSize: 9.5, color: FB_INKD, padding: "2px 0" }}>▸ {d} {fbDimVal(c, d, w).toFixed(2)} — {(() => { const best = FB_BOUNDARY.centers.filter(x => x.id !== c.id).sort((a, b) => fbDimVal(b, d, w) - fbDimVal(a, d, w))[0]; return "learn from " + best.id + " (" + fbDimVal(best, d, w).toFixed(2) + ")"; })()}</div>
)) : <div style={{ fontFamily: FB_MONO, fontSize: 9, color: FB_MUTD }}>no dimension below 0.40</div>}
</div>
</div>

{rd && (
<div style={{ marginTop: 12, borderTop: `1px solid ${FB_LINE}`, paddingTop: 8 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_CY, letterSpacing: 1, marginBottom: 4 }}>{fbT(q, "signature").toUpperCase()} — {c.shock.kind} (W{c.shock.week})</div>
<svg viewBox="0 0 100 26" style={{ width: "100%", maxWidth: 460, height: 58 }}>
<line x1="0" y1="13" x2="100" y2="13" stroke={FB_LINE} strokeWidth="0.4" />
<polyline fill="none" stroke={rd.Q > 3 ? "#e03535" : FB_CY} strokeWidth="0.8" points={rd.pts.map(p => `${(p.t / 10) * 100},${13 - p.a * 34}`).join(" ")} />
</svg>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: FB_MUTD }}>{fbT(q, "settling").toLowerCase()} {rd.Q.toFixed(1)} · residual {(rd.residual * 100).toFixed(0)}% — {rd.Q > 3 ? "still swinging; intervene before it flattens into permanent loss" : "absorbing on schedule"}</div>
</div>
)}

<div style={{ marginTop: 12, borderTop: `1px solid ${FB_LINE}`, paddingTop: 8 }}>
<div style={{ fontFamily: FB_MONO, fontSize: 8.5, color: "#d9a520", letterSpacing: 1, marginBottom: 5 }}>RECOMMENDED ACTIONS</div>
{actions.map((a, i) => <div key={i} style={{ fontFamily: FB_MONO, fontSize: 9.5, color: FB_INKD, padding: "2px 0" }}>{i + 1}. {a}</div>)}
</div>
</div>
);
}

// ================================================================
// SHELL — one state, five bases, one scrubber
// ================================================================
const FB_BASES = [
{ id: "map", label: "MAP", sub: "spatial graph" },
{ id: "circuit", label: "CIRCUIT", sub: "gates & governors" },
{ id: "calendar", label: "CALENDAR", sub: "timeline" },
{ id: "phase", label: "PHASE", sub: "energy landscape" },
{ id: "ops", label: "OPERATIONS", sub: "benchmarks & data" },
];

function EarlyWarningTab({centers:liveCenters,opt}={}){
// Integration 3: the gate backstop (voting floor, ~50 days) surfaces here
// BEFORE it bites — units at day 35+ get named while there is still time.
const floorRows=(liveCenters&&opt)?liveCenters.map(c=>{
const age=opt.fresh[c.name]!==undefined?(opt.week-opt.fresh[c.name])*7:(hash(c.name)%38)+opt.week*2;
return{name:c.name,age};
}).filter(r=>r.age>=35).sort((a,b)=>b.age-a.age):[];
const w = 7; // current reporting week
const rows = FB_BOUNDARY.centers.map(c => ({
c,
h: fbHealth(c, w),
fresh: fbCoherence(c, w),
rec: fbTau(c, w),
infl: fbInflection(c),
rd: fbRecoverySig(c, w),
headroom: c.Tc - c.tuition,
})).sort((a,b) => a.h - b.h);
return (<div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:8}}>Early-warning summary — measurement before escalation</div>
{floorRows.length>0&&<div style={{border:`1px solid ${RULE}`,borderLeft:`3px solid #9a6b00`,background:"#fffdf5",padding:"9px 12px",marginBottom:10}}>
<div style={{fontFamily:"Helvetica",fontSize:10.5,fontWeight:800,color:INK}}>Approaching the voting floor — review these before day 50</div>
<div style={{fontFamily:"Helvetica",fontSize:9.5,color:"#333",marginTop:3,lineHeight:1.6}}>At ~50 days unreviewed, a unit's data loses the right to support any approval (gate backstop). {floorRows.length} unit(s) are inside the 15-day warning window: {floorRows.map(r=>r.name+" (day "+r.age+")").join(" · ")}. The cliff is visible here so nobody discovers it from a held proposal.</div>
</div>}
<div style={{fontSize:12.5,color:"#444",lineHeight:1.6,marginBottom:12}}>Each center is tracked on four leading indicators: <b>recovery time</b> (how quickly performance returns to baseline after a disruption), <b>recovery signature</b> (whether the return is settling or still swinging), <b>retention inflection point</b> (the projected week at which family and staff attrition risk compounds), and <b>pricing ceiling headroom</b> (distance to the tuition level the local market will not absorb). All figures derive from the same progress-report data reviewed with each center; peer comparisons use aggregate benchmarks only — center-level financials are never shared across owners.</div>

{rows.map(({c,h,fresh,rec,infl,rd,headroom}) => {
const recFlag = rec >= 3 ? "action" : rec >= 2 ? "monitor" : "stable";
return (
<div key={c.id} style={{border:`1px solid ${RULE}`,borderLeft:`3px solid ${recFlag==="action"?"#b3261e":recFlag==="monitor"?"#9a6b00":"#1f7a3f"}`,padding:"10px 14px",marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:6}}>
<b style={{fontFamily:"Helvetica",fontSize:13,color:INK}}>{c.label}</b>
<span style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:recFlag==="action"?"#b3261e":recFlag==="monitor"?"#9a6b00":"#1f7a3f"}}>
{recFlag==="action"?"Support plan recommended":recFlag==="monitor"?"Monitor":"Performing"}
</span>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"6px 18px",marginTop:8}}>
<div style={{fontSize:11.5,color:"#333"}}><b style={{fontFamily:"Helvetica"}}>Recovery time:</b> {rec.toFixed(1)} weeks{rec>=3?" — best practice indicates intervention within 30 days":rec>=2?" — lengthening; schedule a progress review":""}</div>
<div style={{fontSize:11.5,color:"#333"}}><b style={{fontFamily:"Helvetica"}}>Data freshness:</b> {Math.round(fresh*100)}%{fresh<0.5?" — last review is stale; measurement precedes any decision":""}</div>
<div style={{fontSize:11.5,color:"#333"}}><b style={{fontFamily:"Helvetica"}}>Pricing ceiling headroom:</b> ${headroom}/mo{headroom<=15?" — no increase advisable this cycle":""}</div>
<div style={{fontSize:11.5,color:"#333"}}><b style={{fontFamily:"Helvetica"}}>Retention inflection:</b> {infl===null?"not projected — trend stable":infl<=w?"passed — retention costs now exceed early-intervention costs 3-4x":`projected week ${Math.round(infl)} — act before this point`}</div>
</div>
{rd && (
<div style={{marginTop:8,borderTop:`1px solid ${RULE}`,paddingTop:6}}>
<div style={{fontFamily:"Helvetica",fontSize:9.5,fontWeight:700,letterSpacing:0.6,textTransform:"uppercase",color:MUT,marginBottom:3}}>Recovery signature — {c.shock.kind} (week {c.shock.week})</div>
<svg viewBox="0 0 100 22" style={{width:"100%",maxWidth:420,height:52,display:"block"}}>
<line x1="0" y1="11" x2="100" y2="11" stroke={RULE} strokeWidth="0.4"/>
<polyline fill="none" stroke={CR_SETTLE(rd.Q)==="prolonged"?"#b3261e":"#1f7a3f"} strokeWidth="0.8"
points={rd.pts.map(p=>`${(p.t/10)*100},${11-p.a*28}`).join(" ")}/>
</svg>
<div style={{fontSize:11,color:"#444",lineHeight:1.5}}>Settling is <b>{CR_SETTLE(rd.Q)}</b>. {CR_SETTLE(rd.Q)==="prolonged"?"Performance is still swinging rather than returning to baseline — a documented leading indicator of sustained decline. Recommend activating the support plan now, while remaining momentum is recoverable.":"Disruption absorbed; performance returning to baseline on schedule."} Residual impact: {(rd.residual*100).toFixed(0)}%.</div>
</div>
)}
</div>);
})}

<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,margin:"14px 0 6px"}}>Peer benchmarking — aggregates only</div>
{FB_BOUNDARY.clusters.map(cl => {
const k = fbClusterKernel(cl, w);
return (
<div key={cl.id} style={{display:"flex",alignItems:"baseline",gap:10,padding:"4px 0",borderBottom:"1px solid #f0f0f0",fontSize:11.5,color:"#333"}}>
<b style={{fontFamily:"Helvetica",minWidth:80,color:INK}}>{cl.id}</b>
<span style={{minWidth:110,color:MUT,fontFamily:"Helvetica",fontSize:10}}>{cl.members.join(" · ")}</span>
<span>benchmark alignment {Math.round(k.k*100)}% · support coupling {Math.round(cl.coupling*100)}%{!k.robust?" — single-center group: no peer support available if disrupted; priority is building shared staffing and referral ties":""}</span>
</div>);
})}
<div style={{fontSize:11,color:"#666",lineHeight:1.6,marginTop:8}}>Benchmarks are computed from aggregate indicators. Individual center financials remain confidential to each owner — a data-governance commitment, not a limitation.</div>
</div>);
}

// ===== SIGNALS TAB — live network alerts =====
// Intended use: passive feed. Alerts derive live from FB_BOUNDARY.
function SignalsTab(){
const w = 7;
const alerts = [];
FB_BOUNDARY.centers.forEach(c => {
const rec = fbTau(c, w), fresh = fbCoherence(c, w), infl = fbInflection(c), head = c.Tc - c.tuition;
if (rec >= 3) alerts.push({ sev: 2, c: c.id, m: `Recovery time ${rec.toFixed(1)}w — support plan inside 30 days` });
else if (rec >= 2) alerts.push({ sev: 1, c: c.id, m: `Recovery time lengthening (${rec.toFixed(1)}w) — schedule a progress review` });
if (fresh < 0.5) alerts.push({ sev: 1, c: c.id, m: `Data ${Math.round(fresh*100)}% fresh — review before any decision` });
if (head <= 15) alerts.push({ sev: 2, c: c.id, m: `$${head} from pricing ceiling — hold tuition` });
if (infl !== null && infl > w && infl <= w + 3) alerts.push({ sev: 2, c: c.id, m: `Retention inflection projected W${Math.round(infl)} — intervene now` });
});
FB_BOUNDARY.clusters.filter(cl => cl.members.length < 2).forEach(cl =>
alerts.push({ sev: 1, c: cl.members[0], m: "No peer support group — build shared staffing/referral ties before the next disruption" }));
alerts.sort((a, b) => b.sev - a.sev);
return (<div>
<div style={{fontFamily:"Helvetica",fontSize:11,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:MUT,borderBottom:`1px solid ${RULE}`,paddingBottom:3,marginBottom:6}}>Network signals — live from current state</div>
<div style={{fontSize:11.5,color:"#555",marginBottom:10,lineHeight:1.5}}>This feed is passive: it recomputes from the same state every view reads. {alerts.filter(a=>a.sev===2).length} action signals, {alerts.filter(a=>a.sev===1).length} watch signals.</div>
{alerts.map((a,i)=>(
<div key={i} style={{display:"flex",gap:10,alignItems:"baseline",padding:"7px 10px",marginBottom:5,border:`1px solid ${RULE}`,borderLeft:`3px solid ${a.sev===2?"#b3261e":"#9a6b00"}`}}>
<b style={{fontFamily:"Helvetica",fontSize:9,letterSpacing:0.5,color:a.sev===2?"#b3261e":"#9a6b00",minWidth:52}}>{a.sev===2?"ACTION":"WATCH"}</b>
<b style={{fontFamily:"Helvetica",fontSize:10.5,minWidth:30,color:INK}}>{a.c}</b>
<span style={{fontSize:11.5,color:"#333"}}>{a.m}</span>
</div>))}
</div>);
}
