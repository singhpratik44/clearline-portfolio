/* APERTURE local decision review ledger.
 * Tamper-EVIDENT sequence in one local vault, not an independently signed
 * audit record. No approval authorizes external communication or spending.
 */
(function(root){
"use strict";
const TYPES=new Set(["proposal_reviewed","plan_reviewed","proposal_rejected","evidence_reconciled","sync_completed","vault_loaded"]);
function stable(obj){return JSON.stringify(obj,Object.keys(obj).sort());}
function b64(bytes){return Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");}
async function hash(payload){
 if(!root.crypto?.subtle)throw Error("HTTPS/WebCrypto is required to record verifiable reviews.");
 const bytes=new TextEncoder().encode(JSON.stringify(payload));
 const result=await root.crypto.subtle.digest("SHA-256",bytes);
 return b64(new Uint8Array(result));
}
function proposal(row){
 if(!row?.id||!row?.source_url||!row?.evidence)throw Error("Source evidence is required to review a commercial plan.");
 const action=String(row.proposed_next||"").trim();
 if(!action)throw Error("An explicit proposed action is required.");
 return {opportunity_id:row.id,source_url:row.source_url,source_last_updated:row.last_evidence_at||null,
  stage:row.stage,action,scope:"planning_review_only",commercial_terms_confirmed:!!row.terms_confirmed,
  provider_message_ids:Array.isArray(row.message_ids)?row.message_ids.slice().sort():[]};
}
async function append(rows,type,payload){
 if(!TYPES.has(type))throw Error("Unsupported decision event.");
 const previous=rows.length?rows[rows.length-1].hash:"GENESIS";
 const base={version:1,id:root.crypto.randomUUID(),type,at:new Date().toISOString(),previous,payload};
 const fingerprint=await hash(base);
 return [...rows,{...base,hash:fingerprint}];
}
async function verify(rows){
 let previous="GENESIS";if(!Array.isArray(rows)||rows.length>10000)return false;
 for(const row of rows){
  const {hash:stored,...base}=row||{};
  if(!TYPES.has(base.type)||base.previous!==previous||stored!==await hash(base))return false;
  previous=stored;
 }
 return true;
}
async function sameProposal(event,row){
 if(!event?.payload?.proposal||!row)return false;
 return await hash(event.payload.proposal)===await hash(proposal(row));
}
root.AP4DAudit={TYPES,hash,proposal,append,verify,sameProposal};
if(typeof module!=="undefined"&&module.exports)module.exports=root.AP4DAudit;
})(typeof globalThis!=="undefined"?globalThis:this);
