/**
 * Transparent policy benchmark, NOT a calibration or production outcome study.
 * Labels are hand-authored illustrative expectations, not empirical ground truth.
 * Baseline: review risk >= 0.7; otherwise use deterministic checks.
 * All cases are emitted to make disagreements inspectable.
 */
import { route, rank, plan } from './router.mjs';

const cases = [
  ['schema-validation',.7,.9,.2,.1,.1,.05,'deterministic'],
  ['duplicate-check',.6,.9,.1,.05,.05,.03,'deterministic'],
  ['privacy-pattern-check',.9,.8,.25,.15,.2,.25,'deterministic'],
  ['ci-status-check',.6,.7,.1,.1,.1,.05,'deterministic'],
  ['sha-read',.8,.9,.15,.15,.1,.12,'deterministic'],
  ['known-capacity-check',.8,.8,.35,.2,.2,.2,'deterministic'],
  ['ambiguous-requirement',.7,.8,.85,.2,.2,.1,'targeted-agent'],
  ['unclear-job-mapping',.6,.8,.7,.2,.3,.2,'targeted-agent'],
  ['unresolved-label',.7,.7,.65,.2,.25,.15,'targeted-agent'],
  ['ambiguous-low-heuristic',.7,.8,.5,.2,.25,.2,'targeted-agent'],
  ['uncertain-staffing',.8,.8,.9,.5,.5,.45,'simulation'],
  ['enrollment-downside',.9,.8,.75,.6,.5,.5,'simulation'],
  ['resource-constraint',.8,.7,.85,.5,.5,.6,'simulation'],
  ['moderate-uncertainty-high-impact',.9,.8,.65,.5,.5,.5,'simulation'],
  ['external-submission',.9,.8,.9,.4,.5,.95,'human-review'],
  ['production-deployment',.9,.9,.7,.4,.6,.9,'human-review'],
  ['privacy-sensitive-change',.9,.9,.5,.5,.6,.65,'human-review'],
].map(([id,impact,reuse,uncertaintyReduction,effort,verificationCost,risk,expected]) => ({
  id,impact,reuse,uncertaintyReduction,effort,verificationCost,risk,expected
}));

const baseline = candidate => candidate.risk >= .7 ? 'human-review' : 'deterministic';
const results = cases.map(c => {
  const routed = route(c);
  return {id:c.id, expected:c.expected, router:routed.mode, baseline:baseline(c),
    score:routed.score, routerMatch:routed.mode===c.expected, baselineMatch:baseline(c)===c.expected};
});
const count = key => results.filter(r=>r[key]).length;
const output = {
  disclaimer:'Hand-labeled synthetic policy examples; NOT calibrated accuracy, predictive performance, or operational gains.',
  sampleSize:results.length,
  routerMatches:count('routerMatch'),
  baselineMatches:count('baselineMatch'),
  routerMatchRate:Number((count('routerMatch')/results.length).toFixed(4)),
  baselineMatchRate:Number((count('baselineMatch')/results.length).toFixed(4)),
  routerModelCalls:cases.reduce((n,c)=>n+plan(c,{verified:true,modelBudget:1}).modelCalls,0),
  topRanked:rank(cases).slice(0,3).map(c=>({id:c.id,score:c.score,mode:c.mode})),
  mismatches:results.filter(r=>!r.routerMatch),
  cases:results
};
console.log(JSON.stringify(output,null,2));
