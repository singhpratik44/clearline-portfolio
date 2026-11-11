/**
 * APERTURE research intelligence — deterministic, no external calls.
 * Data represents a curated starting register; metadata should be verified at ingestion.
 */
export const researchSources = Object.freeze([
  {id:"verifierbench",title:"VerifierBench",url:"https://arxiv.org/abs/2610.28679",type:"arxiv-preprint",month:"2026-10",capability:"Positive and negative verifier tests"},
  {id:"planning",title:"Agent Planning Benchmark",url:"https://arxiv.org/abs/2606.04874",type:"arxiv-preprint",month:"2026-06",capability:"Separate plan quality from execution quality"},
  {id:"mobilepa",title:"MobilePA-Bench",url:"https://arxiv.org/abs/2608.23035",type:"arxiv-preprint",month:"2026-08",capability:"Permission and ordering tests"},
  {id:"planbench",title:"PlanBench-XL",url:"https://arxiv.org/abs/2606.22388",type:"arxiv-preprint",month:"2026-06",capability:"Tool failure and recovery scenarios"},
  {id:"formulacode",title:"FormulaCode",url:"https://proceedings.mlr.press/v306/sehgal26a.html",type:"conference-proceedings",month:"2026",capability:"Multi-objective optimization checks"},
  {id:"herasys",title:"HeraSys",url:"https://proceedings.mlr.press/v306/li26fz.html",type:"conference-proceedings",month:"2026",capability:"Deterministic computation reuse"},
  {id:"autotool",title:"AutoTool",url:"https://proceedings.mlr.press/v306/zou26p.html",type:"conference-proceedings",month:"2026",capability:"Selective tool routing"},
  {id:"memory-distillation",title:"Agent Memory Distillation",url:"https://huggingface.co/papers/2608.07169",type:"paper-index",month:"2026-08",capability:"Reusable hierarchical procedures"},
  {id:"filesystem-memory",title:"Filesystem-Based Memory",url:"https://huggingface.co/papers/2607.26637",type:"paper-index",month:"2026-07",capability:"Memory provenance and freshness"},
  {id:"ui-oceanus",title:"UI-Oceanus",url:"https://openreview.net/forum?id=dZrf68g4dR",type:"openreview-record",month:"2026",capability:"State-transition verification"}
]);
export function canonicalResearchId(url) {
  const u = new URL(url);
  const arxiv = u.pathname.match(/\/(?:abs|pdf)\/(\d{4}\.\d{4,5})(?:v\d+)?/);
  if (arxiv && /(?:^|\.)arxiv\.org$/.test(u.hostname)) return "arxiv:"+arxiv[1];
  const doi = u.hostname === "doi.org" ? decodeURIComponent(u.pathname.slice(1)).toLowerCase() : u.searchParams.get("doi")?.toLowerCase();
  if (doi) return "doi:"+doi;
  return u.hostname.toLowerCase()+u.pathname.replace(/\/$/,"");
}
export function deduplicateResearch(items) {
  const seen = new Set();
  return items.filter(item => { const key = canonicalResearchId(item.url); if(seen.has(key)) return false; seen.add(key); return true; });
}
export function routeDecision({risk=0,uncertainty=0,hasDeterministicRule=false,requiresApproval=false}={}) {
  for (const x of [risk,uncertainty]) if(!Number.isFinite(x)||x<0||x>1) throw new RangeError("risk and uncertainty must be between 0 and 1");
  if(requiresApproval || risk>=0.7) return {mode:"human-approval",reason:"Consequential or explicitly gated action"};
  if(hasDeterministicRule && uncertainty<0.3) return {mode:"deterministic",reason:"Rule sufficiently specified"};
  return {mode:"targeted-analysis",reason:"Ambiguity requires bounded analysis; no autonomous execution"};
}
export function transition(state,event,{approved=false,consent=false}={}) {
  const edges={researched:{qualify:"qualified"},qualified:{requestApproval:"pending-approval"},"pending-approval":{authorize:"authorized"},authorized:{contact:"conversation"},conversation:{introduce:"introduction"},introduction:{handoff:"admissions-handoff"}};
  const next=edges[state]?.[event];
  if(!next) throw new Error("Invalid state transition");
  if(event==="authorize"&&!approved) throw new Error("Human approval required");
  if(event==="introduce"&&!consent) throw new Error("Consent required");
  return next;
}
