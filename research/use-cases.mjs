/**
 * APERTURE practical use-case evaluation.
 * These are configurable examples, not live evaluations of private systems.
 * Each result is reproducible with the deterministic router.
 */
import {routeDecision} from "./aperture-intelligence.mjs";

export const useCases=Object.freeze([
  {id:"uspa-referral",domain:"Partnerships",task:"Send a school referral introduction",risk:.9,uncertainty:.35,hasDeterministicRule:false,requiresApproval:true,dependencies:["partner_agreement","school_consent","user_approval"],external:true},
  {id:"career-application",domain:"Career OS",task:"Submit a tailored job application",risk:.8,uncertainty:.2,hasDeterministicRule:true,requiresApproval:true,dependencies:["verified_listing","verified_resume","user_approval"],external:true},
  {id:"research-record",domain:"Research Intelligence",task:"Prepare a verified research record",risk:.1,uncertainty:.1,hasDeterministicRule:true,requiresApproval:false,dependencies:["source_verified"],external:false},
  {id:"practice-plan",domain:"APERTURE Sports",task:"Generate a sample practice plan",risk:.15,uncertainty:.1,hasDeterministicRule:true,requiresApproval:false,dependencies:["duration_set","constraints_set"],external:false},
  {id:"stripe-price",domain:"Clearline Commerce",task:"Change a live Stripe price",risk:.85,uncertainty:.2,hasDeterministicRule:true,requiresApproval:true,dependencies:["product_verified","pricing_approved","rollback_ready"],external:true}
]);
export function evaluateUseCase(def,completed=[]) {
  const missing=def.dependencies.filter(item=>!completed.includes(item));
  const decision=routeDecision(def);
  const mayProceed=missing.length===0&&decision.mode==="deterministic"&&!def.external;
  return {id:def.id,domain:def.domain,task:def.task,route:decision.mode,missing,mayProceed,
    status:mayProceed?"LOCAL_ONLY":missing.length?"BLOCKED_PREREQUISITES":decision.mode==="human-approval"?"REQUIRES_HUMAN_APPROVAL":"REQUIRES_REVIEW",
    note:"This evaluation never sends messages, submits applications, changes prices or invokes agents."};
}
