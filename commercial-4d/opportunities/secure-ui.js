/* APERTURE Commercial 4D browser consent controls.
 * Private workspace only; no data goes to GitHub, our servers, or model APIs.
 * Google Gmail access happens directly browser -> gmail.googleapis.com on click,
 * only with explicit OAuth user consent and imported known thread IDs.
 */
(function(root){
"use strict";
const E=root.AP4DOpportunity,Core=root.AP4DGmailCore,G=root.AP4DGmail,V=root.AP4DVault,A=root.AP4DAudit;
const W=root.AP4DWorkspace,by=id=>document.getElementById(id);
let ledger=[],lastSync=null,dirty=false,inProgress=false;
function status(msg,bad=false){
 const a=by("secure-alert");a.textContent=String(msg).slice(0,550);a.setAttribute("data-error",bad?"true":"false");
}
function publicError(e){return String(e?.message||e||"Unknown error").slice(0,500);}
function snapshot(){return {schema:"aperture-commercial-private-v1",opportunities:W.getRecords(),ledger:ledger.slice(),last_sync:lastSync,plans:root.AP4DPlannerUI?.getInputs?.()||{}};}
function renderLedger(){
 const panel=by("audit-records");panel.replaceChildren();
 if(!ledger.length){const p=document.createElement("p");p.className="secure-help";p.textContent="No review decisions recorded. Reviewing a plan does not authorize sending, signing, purchasing or hiring.";panel.append(p);return;}
 const last=ledger.slice(-8).reverse();
 for(const item of last){
  const div=document.createElement("div");div.className="secure-ledger-item";
  const heading=document.createElement("strong");heading.textContent=item.type.replace(/_/g," ").toUpperCase()+" · "+item.at.slice(0,16).replace("T"," ");
  const text=document.createElement("span");text.textContent=item.payload?.organization||item.payload?.summary||"Local review record";
  const digest=document.createElement("code");digest.textContent=item.hash.slice(0,16)+"…";
  div.append(heading,text,digest);panel.append(div);
 }
}
function markDirty(message){dirty=true;by("vault-state").textContent="Unsaved changes in memory. Save encrypted to keep them after refresh.";if(message)status(message);}
async function saveEncrypted(){
 const pass=by("vault-passphrase").value;
 const confirm=by("vault-confirm").value;
 if(pass.length<12)throw Error("Choose a vault passphrase of at least 12 characters.");
 if(pass!==confirm)throw Error("Vault passphrase confirmation does not match.");
 const encrypted=await V.seal(snapshot(),pass);
 await V.write(encrypted);
 by("vault-passphrase").value="";by("vault-confirm").value="";
 dirty=false;by("vault-state").textContent="Encrypted vault saved in this browser (AES-256-GCM). A passphrase is required to reopen it.";
 status("Private opportunities and review ledger saved encrypted on this device. Gmail access tokens were not saved.");
}
async function unlockEncrypted(){
 const pass=by("vault-passphrase").value;
 if(!pass)throw Error("Enter the vault passphrase before unlocking.");
 const encrypted=await V.read();
 if(!encrypted)throw Error("No encrypted vault found on this device. Import a private bundle first.");
 const value=await V.open(encrypted,pass);
 const bundle=E.normalizeBundle(value);
 if(value.ledger?.length&&!await A.verify(value.ledger))throw Error("Vault review ledger has failed hash-chain validation.");
 if(W.getRecords().length&&!root.confirm("Replace your unsaved in-memory opportunities with the encrypted vault?"))return;
 ledger=Array.isArray(value.ledger)?value.ledger.slice():[];lastSync=value.last_sync||null;
 W.replaceRecords(bundle.opportunities);
 root.AP4DPlannerUI?.setInputs?.(value.plans||{});
 by("vault-passphrase").value="";by("vault-confirm").value="";
 dirty=false;renderLedger();
 by("vault-state").textContent="Encrypted vault unlocked in this browser session. New changes require Save encrypted.";
 status("Unlocked "+bundle.opportunities.length+" private opportunity records and "+ledger.length+" local review entries.");
}
async function exportEncrypted(){
 const envelope=await V.read();
 if(!envelope)throw Error("Save an encrypted vault before exporting its encrypted backup.");
 const blob=new Blob([JSON.stringify(envelope,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="aperture-commercial-encrypted.apvault";a.click();setTimeout(()=>URL.revokeObjectURL(url),1600);
 status("Encrypted vault backup downloaded. Keep the passphrase separately and securely.");
}
async function importEncrypted(file){
 if(file.size>V.MAX_RECORD_BYTES*2)throw Error("Encrypted file exceeds the limit.");
 const envelope=JSON.parse(await file.text());
 const pass=by("vault-passphrase").value;
 const value=await V.open(envelope,pass);
 const parsed=E.normalizeBundle(value);
 if(value.ledger?.length&&!await A.verify(value.ledger))throw Error("Imported review ledger failed verification.");
 if(W.getRecords().length&&!root.confirm("Replace unsaved records with the encrypted backup?"))return;
 await V.write(envelope);
 ledger=Array.isArray(value.ledger)?value.ledger.slice():[];lastSync=value.last_sync||null;
 W.replaceRecords(parsed.opportunities);
 root.AP4DPlannerUI?.setInputs?.(value.plans||{});
 dirty=false;renderLedger();
 by("vault-passphrase").value="";by("vault-confirm").value="";
 by("vault-state").textContent="Encrypted backup imported and unlocked.";
 status("Imported encrypted backup with "+parsed.opportunities.length+" opportunity records.");
}
async function review(){
 const row=W.getSelected();if(!row)throw Error("Select an evidence-backed commercial opportunity.");
 if(!by("review-evidence").checked||!by("review-approval").checked)throw Error("Confirm source review and planning-only authorization before recording a decision.");
 const proposal=A.proposal(row),digest=await A.hash(proposal);
 const recent=ledger.filter(x=>x.type==="proposal_reviewed"&&x.payload?.proposal_digest===digest);
 if(recent.length)throw Error("This exact proposal has already been reviewed; no duplicate decision is necessary.");
 ledger=await A.append(ledger,"proposal_reviewed",{
  organization:row.organization,opportunity_id:row.id,proposal_digest:digest,proposal,
  summary:"Human reviewed plan only; no external action authorized.",
  authorizer:"local_user_self_attestation",authority:"planning_review_only"
 });
 by("review-evidence").checked=false;by("review-approval").checked=false;
 renderLedger();markDirty("Recorded a local, hash-chained planning review. It authorizes no Gmail send or other commercial action.");
}

async function recordPlanReview(plan){
 if(!root.AP4DPlannerUI||!plan||typeof plan!=="object")throw Error("A current commercial plan is required.");
 const selected=W.getSelected(),actual=root.AP4DPlannerUI.getPlan();
 if(!selected||!actual||selected.id!==plan.opportunity_id||actual!==plan)throw Error("The selected opportunity or plan changed. Review the current plan again.");
 if(!plan.review_ready)throw Error("Source, commercial scope, success measure and named reviewer are required.");
 if(plan.execution_authorized!==false||plan.executed_actions!==0)throw Error("Only unexecuted planning proposals can be reviewed.");
 const fingerprint=await A.hash(plan);
 if(ledger.some(entry=>entry.type==="plan_reviewed"&&entry.payload?.plan_digest===fingerprint))throw Error("This identical plan version has already been reviewed.");
 ledger=await A.append(ledger,"plan_reviewed",{
  opportunity_id:plan.opportunity_id,organization:selected.organization,plan_digest:fingerprint,
  source_url:selected.source_url,source_date:selected.last_evidence_at,
  summary:"Research-linked 90-day planning review; no external action authorized.",
  study_ids:plan.studies.map(x=>x.id),research_count:plan.studies.length,
  gate_count:plan.gates.filter(x=>x.ok).length,
  authorizer:"local_user_self_attestation",authority:"planning_review_only"
 });
 renderLedger();
 markDirty("Versioned plan review recorded. No external action is authorized. Save encrypted vault to retain it.");
 return {recorded:true,digest:fingerprint};
}

async function connectGoogle(){
 if(!G.connected()) {
  if(!root.google?.accounts?.oauth2)throw Error("Click Prepare Google sign-in first, then Connect Gmail.");
  await G.connect(by("client-id").value);
 }
 by("sync-now").disabled=false;by("disconnect-google").disabled=false;
 by("google-status").textContent="Connected with user-consented Gmail READONLY scope. Token exists in memory only.";
 status("Gmail connected. Click Sync imported threads to read metadata from the source threads in your private bundle.");
}
async function syncGmail(){
 if(inProgress)throw Error("A sync is already in progress.");
 if(!W.getRecords().length)throw Error("Import the six reviewed opportunity records before syncing Gmail.");
 if(!G.connected())throw Error("Connect Gmail with read-only consent first.");
 inProgress=true;by("sync-now").disabled=true;
 try{
  const result=await G.synchronize(W.getRecords(),p=>by("google-status").textContent="Read-only sync "+p.done+"/"+p.total+" known threads.");
  if(result.updated||result.added) {
    const bundle=E.normalizeBundle({opportunities:result.opportunities});
    W.replaceRecords(bundle.opportunities);
    markDirty("Gmail sync reconciled "+result.new_messages+" message IDs across "+result.checked+" imported threads. No outbound action occurred.");
  }else status("Gmail sync checked "+result.checked+" private threads; no new messages were detected.");
  lastSync={checked:result.checked,updated:result.updated,added:result.added,unchanged:result.unchanged,new_messages:result.new_messages,
   errors:result.errors,at:result.synced_at,source:"gmail_api_readonly"};
  by("google-status").textContent="Checked "+result.checked+" threads · "+result.new_messages+" new message IDs · "+result.errors.length+" failures. Unsaved until encrypted save.";
  if(result.errors.length)status("Partial sync: "+result.errors.map(x=>x.error).slice(0,2).join("; "),true);
 }finally{inProgress=false;by("sync-now").disabled=!G.connected();}
}
const action=(id,fn)=>by(id).addEventListener("click",async()=>{
 try{by(id).disabled=true;await fn();}catch(e){status(publicError(e),true);}finally{by(id).disabled=false;}
});
action("prepare-google",async()=>{await G.ensureLibrary();status("Google sign-in library ready. Click Connect Gmail to authorize read-only access.");});
action("connect-google",connectGoogle);
action("sync-now",syncGmail);
action("disconnect-google",async()=>{G.disconnect();by("sync-now").disabled=true;by("disconnect-google").disabled=true;by("google-status").textContent="Disconnected. OAuth token discarded and access revoked.";status("Gmail disconnected; imported data remains private in memory.");});
action("save-vault",saveEncrypted);
action("unlock-vault",unlockEncrypted);
action("export-vault",exportEncrypted);
action("delete-vault",async()=>{if(!root.confirm("Permanently delete the encrypted vault stored on this device? In-memory records remain until you clear or reload."))return;await V.clear();by("vault-state").textContent="No encrypted vault stored on this device.";status("Encrypted local vault deleted.");});
action("record-review",review);
by("import-vault").addEventListener("change",async e=>{const f=e.target.files?.[0];e.target.value="";if(!f)return;try{await importEncrypted(f);}catch(err){status(publicError(err),true);}});
by("upload").addEventListener("change",()=>{ledger=[];lastSync=null;renderLedger();markDirty("Imported private data is only in memory. Save encrypted to retain it after reload.");});
root.addEventListener("pagehide",()=>{G.disconnect();});
root.addEventListener("ap4d:plan-change",()=>markDirty("Commercial planning assumptions changed in memory. Save encrypted vault before leaving."));
root.AP4DSecureUI={getLedger:()=>ledger.slice(),getSyncInfo:()=>lastSync,recordPlanReview};
if(!V.available())by("vault-state").textContent="WebCrypto or IndexedDB unavailable. Encrypted saving is disabled.";
renderLedger();
})(typeof globalThis!=="undefined"?globalThis:this);
