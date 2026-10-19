/** Clearline minimum-cost deterministic routing. Scores are heuristics, never calibrated probabilities. */
const fields=['impact','reuse','uncertaintyReduction','effort','verificationCost','risk'];
export function score(candidate) {
  if (!candidate || typeof candidate !== 'object') throw Error('Candidate required');
  for (const f of fields) if(typeof candidate[f]!=='number'||!Number.isFinite(candidate[f])||candidate[f]<0||candidate[f]>1) throw Error('Invalid '+f);
  const benefit=candidate.impact*0.45+candidate.reuse*0.35+candidate.uncertaintyReduction*0.20;
  const cost=0.10+candidate.effort*0.40+candidate.verificationCost*0.30+candidate.risk*0.20;
  return Number((benefit/cost).toFixed(6));
}
export function route(candidate) {
  const s=score(candidate);
  if(candidate.risk>=0.7) return {mode:'human-review',score:s,reason:'high risk'};
  if(candidate.uncertaintyReduction>=0.7 && candidate.risk>=0.35) return {mode:'simulation',score:s,reason:'uncertain consequential choice'};
  if(candidate.uncertaintyReduction>=0.6) return {mode:'targeted-agent',score:s,reason:'unresolved uncertainty'};
  return {mode:'deterministic',score:s,reason:'bounded routine evaluation'};
}
export function rank(candidates,minimum=0.5) {
  if(!Array.isArray(candidates)||typeof minimum!=='number'||!Number.isFinite(minimum)||minimum<0) throw Error('Invalid ranking');
  const seen=new Set();
  return candidates.map(c=>{
    if(typeof c.id!=='string'||!c.id.trim()||seen.has(c.id)) throw Error('Invalid or duplicate candidate ID');
    seen.add(c.id);return {...c,...route(c)};
  }).filter(c=>c.score>=minimum).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
/** A gate is an explicit observed condition, not an inferred probability. */
export function plan(candidate,{verified=false,duplicate=false,approved=false,providerConfirmed=false,modelBudget=1}={}) {
  const decision=route(candidate);
  if(duplicate) return {...decision,action:'skip-duplicate',modelCalls:0};
  if(!verified) return {...decision,action:'verify-source',modelCalls:0};
  if(decision.mode==='human-review') return {...decision,action:approved?'prepare-authorized-action':'request-human-review',modelCalls:0};
  if(decision.mode==='simulation') return {...decision,action:'compare-counterfactuals',modelCalls:0};
  if(decision.mode==='targeted-agent') return {...decision,action:modelBudget>0?'smallest-available-model':'defer-model-budget',modelCalls:modelBudget>0?1:0};
  return {...decision,action:'run-deterministic',modelCalls:0};
}
/** Never infer provider submission from approval or a heuristic score. */
export function submissionState({approved=false,providerConfirmed=false}={}) {
  return providerConfirmed?'provider-confirmed':approved?'approved-not-confirmed':'awaiting-approval';
}
