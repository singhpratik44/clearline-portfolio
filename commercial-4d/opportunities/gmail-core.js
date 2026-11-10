/* APERTURE / COMMERCIAL 4D — Google Gmail sync core.
 * Read-only, no transport, authentication, storage, or DOM dependencies.
 * Provider message/thread IDs remain private in local encrypted data.
 */
(function(root){
"use strict";
const THREAD_RE=/^[0-9a-f]{12,32}$/i;
const STAGE_ORDER={draft:0,outbound:1,auto_reply:1,delivery_failed:1,responded:2,meeting_offered:3,screening_confirmed:4,negotiating:5,contracted:6,closed_lost:6};
function threadId(value){
 const v=String(value||"").trim();
 if(THREAD_RE.test(v))return v.toLowerCase();
 if(!v.startsWith("https://mail.google.com/"))return "";
 const match=v.match(/#(?:all|inbox|sent|search\/[^/]+)\/([0-9a-f]{12,32})(?:[/?#]|$)/i);
 return match?match[1].toLowerCase():"";
}
function text(s,max=800){return typeof s==="string"?s.replace(/[\u0000-\u001f\u007f]+/g," ").replace(/\s+/g," ").trim().slice(0,max):"";}
function header(headers,key){
 return text((Array.isArray(headers)?headers:[]).find(h=>String(h.name||"").toLowerCase()===key.toLowerCase())?.value||"",280);
}
function isAuto(message){
 const h=message?.payload?.headers||[];
 const from=header(h,"From"),subject=header(h,"Subject");
 const auto=header(h,"Auto-Submitted"),prec=header(h,"Precedence"),respond=header(h,"X-Autoreply");
 return /auto-replied|auto-generated/i.test(auto)||/bulk|list|junk/i.test(prec)||!!respond||
 /(?:mailer-daemon|postmaster|no-reply|noreply|auto.?reply)/i.test(from)||
 /(?:automatic reply|auto.?reply|out of office)/i.test(subject);
}
function isFailure(message){
 const h=message?.payload?.headers||[];
 const subject=header(h,"Subject"),from=header(h,"From"),snip=text(message?.snippet,500);
 return /(?:delivery status notification|mail delivery failure|undeliverable|message blocked)/i.test(subject)||
 /(?:mailer-daemon|postmaster)/i.test(from)&&/(?:failure|undeliver|not delivered)/i.test(snip);
}
function isoFromMillis(value){
 const n=Number(value);
 return Number.isFinite(n)&&n>100000000000?new Date(n).toISOString():"";
}
function classify(messages,existingStage){
 const msgs=[...messages].sort((a,b)=>Number(a.internalDate||0)-Number(b.internalDate||0));
 const sent=msgs.filter(m=>Array.isArray(m.labelIds)&&m.labelIds.includes("SENT"));
 const received=msgs.filter(m=>!(Array.isArray(m.labelIds)&&m.labelIds.includes("SENT")));
 const failed=received.filter(isFailure);
 if(failed.length)return {stage:"delivery_failed",reason:"Gmail reported a delivery failure; address must be checked.",confidence:"confirmed"};
 const human=received.filter(m=>!isAuto(m));
 if(!human.length)return {stage:received.length?"auto_reply":sent.length?"outbound":"draft",reason:received.length?"Automated response only.":"No human response found in this thread.",confidence:"confirmed"};
 const recent=human[human.length-1],subject=header(recent.payload?.headers,"Subject");
 const snippet=text(recent.snippet,500);const context=(subject+" "+snippet).toLowerCase();
 let stage="responded",reason="A human responded, but commercial terms are not verified.";
 if(/(?:confirmed (?:for|at)|i.ll (?:give you a )?call|works for me|appointment confirmed|interview confirmed|screening confirmed)/i.test(context)){
  stage="screening_confirmed";reason="A screening or meeting confirmation appears in the response; verify precise details.";
 }else if(/(?:let.s meet|meet on friday|calendar invite|schedule (?:a |the )?(?:meeting|call)|can meet|book a (?:time|meeting)|meet briefly|availability next week)/i.test(context)){
  stage="meeting_offered";reason="The counterparty proposed a meeting or scheduling step.";
 }
 // A signed agreement cannot be inferred from language alone, and any
 // previous verified contracted status must not be downgraded by sync.
 if(["contracted","closed_lost"].includes(existingStage))return {stage:existingStage,reason:"Existing manually reviewed terminal status retained.",confidence:"confirmed"};
 if(STAGE_ORDER[existingStage]>STAGE_ORDER[stage]&&existingStage!=="delivery_failed")return {stage:existingStage,reason:"Previously reviewed advanced stage retained; automatic metadata does not demote it.",confidence:"confirmed"};
 return {stage,reason,confidence:"inferred"};
}
function summarize(thread,prior){
 if(!thread||!THREAD_RE.test(thread.id||"")||!Array.isArray(thread.messages))throw Error("Invalid Gmail thread object");
 const msgs=[...thread.messages].filter(m=>m&&THREAD_RE.test(m.id||"")).sort((a,b)=>Number(a.internalDate||0)-Number(b.internalDate||0));
 if(!msgs.length)throw Error("Gmail thread contained no readable message metadata");
 const ids=Array.from(new Set(msgs.map(m=>m.id.toLowerCase()))).sort();
 const newest=msgs[msgs.length-1],lastIncoming=[...msgs].reverse().find(m=>!m.labelIds?.includes("SENT")&&!isAuto(m));
 const subject=header(msgs[0].payload?.headers,"Subject")||header(newest.payload?.headers,"Subject")||"Commercial correspondence";
 const from=lastIncoming?header(lastIncoming.payload?.headers,"From"):"";
 const previousIds=Array.isArray(prior?.message_ids)?prior.message_ids:[];
 const newIds=ids.filter(id=>!previousIds.includes(id));
 const c=classify(msgs,prior?.stage);
 let stage=c.stage;
 if(prior?.stage==="contracted"||prior?.stage==="closed_lost")stage=prior.stage;
 if(prior?.status_confidence==="confirmed"&&prior?.stage==="screening_confirmed"&&stage==="meeting_offered")stage="screening_confirmed";
 const lastEvidence=isoFromMillis(newest.internalDate);
 const snippet=text((lastIncoming||newest).snippet,380);
 const rawEvidence=snippet?"Gmail "+(lastIncoming?"human reply":"sent thread")+" summary: "+snippet:"Gmail thread metadata verified; content requires manual review.";
 return {
  id:String(prior?.id||"gmail-thread-"+thread.id),gmail_thread_id:thread.id.toLowerCase(),
  organization:text(prior?.organization,120)||"Unclassified commercial contact",
  title:text(prior?.title,160)||subject,kind:prior?.kind||"other",
  stage,source_url:String(prior?.source_url||("https://mail.google.com/mail/u/0/#all/"+thread.id)),
  last_evidence_at:lastEvidence||prior?.last_evidence_at||"",
  evidence:prior?.evidence?String(prior.evidence):rawEvidence,
  gmail_latest_excerpt:rawEvidence,
  terms:prior?.terms||"",blockers:prior?.blockers||"",proposed_next:prior?.proposed_next||"",
  status_confidence:prior?.status_confidence==="confirmed"&&stage===prior?.stage?"confirmed":c.confidence,
  contract_value:prior?.contract_value??null,terms_confirmed:Boolean(prior?.terms_confirmed),
  scenario_probability:prior?.scenario_probability??null,decision_owner:prior?.decision_owner||"",
  planned_days:prior?.planned_days??null,
  message_ids:ids,provider:"gmail_api_readonly",last_synced_at:new Date().toISOString(),
  sync_reason:c.reason,latest_from:from
 };
}
function merge(existing,thread){
 const rows=Array.isArray(existing)?existing:[];
 const id=threadId(thread?.id);
 if(!id)throw Error("Invalid provider thread ID");
 const index=rows.findIndex(r=>(threadId(r?.gmail_thread_id)||threadId(r?.source_url))===id);
 const previous=index>=0?rows[index]:null;
 const updated=summarize(thread,previous);
 const newMessages=updated.message_ids.filter(m=>!(previous?.message_ids||[]).includes(m));
 if(previous&&newMessages.length===0){
  return {opportunities:rows.slice(),added:0,updated:0,unchanged:1,new_messages:0};
 }
 const next=rows.slice();
 if(index<0)next.push(updated);else next[index]=updated;
 return {opportunities:next,added:index<0?1:0,updated:index>=0?1:0,unchanged:0,new_messages:newMessages.length};
}
root.AP4DGmailCore={THREAD_RE,threadId,text,header,isAuto,isFailure,isoFromMillis,classify,summarize,merge};
if(typeof module!=="undefined"&&module.exports)module.exports=root.AP4DGmailCore;
})(typeof globalThis!=="undefined"?globalThis:this);
