/** Local-only operational decision report. No external side effects. */
import {useCases,evaluateUseCase} from "./use-cases.mjs";
import {evidenceGate} from "./evidence-quality.mjs";

export function prepareDecision({caseId,completed=[],evidence=[],now=new Date()}={}){
 const definition=useCases.find(x=>x.id===caseId);
 if(!definition)throw new RangeError("Unknown APERTURE use case");
 if(!Array.isArray(completed)||!Array.isArray(evidence))throw new TypeError("Invalid inputs");
 const task=evaluateUseCase(definition,completed);
 const proof=evidenceGate(evidence,{now});
 const blockers=[...task.missing.map(x=>"prerequisite:"+x),...(!proof.allowed?["evidence:"+proof.reason]:[])];
 if(definition.external)blockers.push("external-action:human-review-required");
 if(task.route==="human-approval"&&!blockers.some(x=>x.startsWith("external-action")))blockers.push("authorization:human-review-required");
 const ready=blockers.length===0&&task.mayProceed;
 return {schema:"aperture-decision/v1",case_id:caseId,domain:task.domain,task:task.task,route:task.route,
   status:ready?"READY_FOR_LOCAL_PREPARATION":"BLOCKED",blockers,evidence:proof.assessments,
   next_action:ready?"Prepare local draft only":"Resolve blockers and rerun evaluation",
   executed:false,external_actions_performed:0};
}
