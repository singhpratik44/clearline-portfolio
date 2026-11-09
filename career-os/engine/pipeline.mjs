/** APERTURE Career OS: auditable prototype-first application gate.
 * Pure deterministic checks. No network, credentials, sending, or automatic approval.
 */
export const STAGES = Object.freeze(['DISCOVERED','NEEDS_VERIFIED','BUILT','TESTED','LIVE_VERIFIED','DRAFTED','APPROVAL_NEEDED','APPROVED','SENT','ATS_APPLIED']);
export const REQUIRED = Object.freeze({
 NEEDS_VERIFIED:['postingUrl','postingCheckedAt','needsSources','fitEvidence'],
 BUILT:['sourceCommit','demoPath'],
 TESTED:['testRunUrl','testPassed'],
 LIVE_VERIFIED:['publicUrl','httpStatus','liveCheckedAt','liveContentMatched','interactionPassed','simulationDisclosure'],
 DRAFTED:['draftId','recipient','draftBodyHash'],
 APPROVAL_NEEDED:['dedupeCheckedAt','outreachReviewed'],
 APPROVED:['approvalId','approvedAt','approvedRecipient','approvedDraftHash'],
 SENT:['gmailSentMessageId','sentAt'],
 ATS_APPLIED:['atsReceiptId','atsSubmittedAt']
});
const present=v=>v!==undefined&&v!==null&&v!==''&&v!==false;
const isHttps=u=>{try{return new URL(u).protocol==='https:'}catch{return false}};
export function assess(record,target){
 const idx=STAGES.indexOf(target),current=STAGES.indexOf(record.stage);
 if(idx<0)return {ok:false,errors:['Unknown stage']};
 if(current<0)return {ok:false,errors:['Unknown current stage']};
 if(idx>current+1)return {ok:false,errors:['Stages cannot be skipped']};
 const evidence=record.evidence||{},errors=[];
 for(let i=1;i<=idx;i++)for(const field of REQUIRED[STAGES[i]]||[])if(!present(evidence[field]))errors.push('Missing '+field);
 if(idx>=STAGES.indexOf('NEEDS_VERIFIED')&&(!Array.isArray(evidence.needsSources)||!evidence.needsSources.length))errors.push('Needs require cited sources');
 if(idx>=STAGES.indexOf('LIVE_VERIFIED')){
   if(!isHttps(evidence.publicUrl))errors.push('Public URL must be HTTPS');
   if(evidence.httpStatus!==200)errors.push('Live HTTP status must equal 200');
   if(evidence.liveContentMatched!==true||evidence.interactionPassed!==true||evidence.simulationDisclosure!==true)errors.push('Live content, interaction and disclosure must pass');
 }
 if(idx>=STAGES.indexOf('APPROVED')){
   if(evidence.approvedRecipient!==evidence.recipient||evidence.approvedDraftHash!==evidence.draftBodyHash)errors.push('Approval must match exact recipient and draft');
 }
 if(idx>=STAGES.indexOf('SENT')&&!evidence.gmailSentMessageId)errors.push('Gmail Sent receipt required');
 if(idx>=STAGES.indexOf('ATS_APPLIED')&&!evidence.atsReceiptId)errors.push('ATS confirmation required');
 return {ok:errors.length===0,errors};
}
export function transition(record,target,at=new Date().toISOString()){
 const check=assess(record,target);if(!check.ok)return {record,check};
 return {record:{...record,stage:target,history:[...(record.history||[]),{stage:target,at}]},check};
}
export function rankJob(j){
 const weights={fit:0.28,compensation:0.22,hiringUrgency:0.18,remoteCompatibility:0.14,impact:0.12,effort:0.06};
 return Object.entries(weights).reduce((sum,[key,w])=>sum+w*Math.max(0,Math.min(5,Number(j[key]??0))),0);
}
export function qualityScore(q){
 const keys=['relevance','usability','reliability','evidence','presentation'];
 return keys.reduce((s,k)=>s+Math.max(0,Math.min(5,Number(q[k]??0))),0)/keys.length;
}
export function dedupeKey(j){return [j.employer||'',j.requisitionId||'',j.title||''].map(x=>String(x).trim().toLowerCase()).join('|')}
export function shouldRetry({attempt,maxAttempts=3,transient=false}){return transient&&attempt<maxAttempts}
export function releaseGate(record){
 const check=assess(record,'APPROVED');
 return {allowed:check.ok&&record.stage==='APPROVED',reason:check.ok?'Await explicit user-initiated send action':check.errors.join('; ')};
}
