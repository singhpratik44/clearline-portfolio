/* APERTURE Revenue Recovery — offline, deterministic, approve-before-action V1.
   Public demo: no persistence, network, email, Stripe or background actions. */
"use strict";
(function(global){
const MAX_BYTES=200000,MAX_RECORDS=500,MAX_CELL=140,DAY=86400000;
const allowedStatuses=new Set(["paid","open","failed","past_due","disputed","refunded","void"]);
const allowedConsents=new Set(["unknown","granted","denied"]);
const fmtMoney=cents=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
const isoDate=(date)=>new Date(date).toISOString().slice(0,10);
function dateOnly(date){if(typeof date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error("Dates must use YYYY-MM-DD");const t=Date.parse(date+"T00:00:00Z");if(!Number.isFinite(t)||isoDate(t)!==date)throw Error("Invalid calendar date");return t}
function parseCsv(src){
 if(typeof src!=="string"||src.length>MAX_BYTES)throw Error("CSV must be 200 KB or less");
 if(src.charCodeAt(0)===0xfeff)src=src.slice(1);
 const rows=[];let row=[],cell="",quoted=false;for(let i=0;i<src.length;i++){
   const ch=src[i];
   if(quoted){if(ch==='"'&&src[i+1]==='"'){cell+='"';i++}else if(ch==='"'){quoted=false}else cell+=ch}
   else if(ch==='"'){if(cell!=="")throw Error("Invalid CSV quoting");quoted=true}
   else if(ch===","){row.push(cell);cell=""}
   else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&src[i+1]==="\n")i++;row.push(cell);cell="";if(row.some(x=>x.trim()!==""))rows.push(row);row=[]}
   else cell+=ch;
   if(cell.length>MAX_CELL)throw Error("CSV field exceeds 140 characters");
 }
 if(quoted)throw Error("Unclosed CSV quoted field");
 row.push(cell);if(row.some(x=>x.trim()!==""))rows.push(row);
 if(rows.length<2)throw Error("CSV requires header and at least one record");
 if(rows.length>MAX_RECORDS+1)throw Error("CSV exceeds 500 records");
 const header=rows.shift().map(x=>x.trim());
 const expected=["member_id","invoice_id","due_date","balance_cents","payment_status","renewal_date","consent_status"];
 if(new Set(header).size!==header.length||header.length!==expected.length||!expected.every(x=>header.includes(x)))throw Error("Use the exact seven approved column names; personal contact columns are not accepted");
 return rows.map((cells,i)=>{
   if(cells.length!==header.length)throw Error("Row "+(i+2)+" has wrong column count");
   return Object.fromEntries(header.map((h,n)=>[h,cells[n].trim()]));
 });
}
function cleanRow(raw){
 const id=String(raw.member_id||"").trim(),invoice=String(raw.invoice_id||"").trim();
 if(!/^[A-Za-z0-9_-]{2,40}$/.test(id)||!/^[A-Za-z0-9_-]{2,40}$/.test(invoice))throw Error("Only opaque member/invoice identifiers (2–40 letters, numbers, hyphen or underscore) are allowed");
 const amount=String(raw.balance_cents??"").trim();if(!/^(?:0|[1-9]\d{0,8})$/.test(amount))throw Error("Balance must be a whole number of cents from 0 to 999999999");
 const status=String(raw.payment_status||"").trim().toLowerCase();
 if(!allowedStatuses.has(status))throw Error("Invalid payment_status: "+status);
 const consent=String(raw.consent_status||"unknown").trim().toLowerCase();
 if(!allowedConsents.has(consent))throw Error("Invalid consent_status");
 const due=String(raw.due_date||"").trim(),renew=String(raw.renewal_date||"").trim();
 dateOnly(due);if(renew)dateOnly(renew);
 if(status==="paid"&&Number(amount)!==0)throw Error("Paid invoices must have zero outstanding balance");
 if(["void","refunded"].includes(status)&&Number(amount)!==0)throw Error("Void or refunded invoices must have zero balance");
 return {member_id:id,invoice_id:invoice,due_date:due,balance_cents:Number(amount),payment_status:status,renewal_date:renew,consent_status:consent};
}
function validateRows(raw){
 if(!Array.isArray(raw)||raw.length<1||raw.length>MAX_RECORDS)throw Error("1 to 500 invoice records are required");
 const ids=new Set();return raw.map(r=>{
   const x=cleanRow(r);
   if(ids.has(x.invoice_id))throw Error("Invoice IDs must be unique");
   ids.add(x.invoice_id);return x;
 });
}
function sampleRows(now){
 const t=dateOnly(now);const d=offset=>isoDate(t+offset*DAY);
 return validateRows([
 {member_id:"M101",invoice_id:"INV101",due_date:d(-29),balance_cents:"14900",payment_status:"past_due",renewal_date:d(28),consent_status:"granted"},
 {member_id:"M102",invoice_id:"INV102",due_date:d(-7),balance_cents:"17900",payment_status:"failed",renewal_date:d(22),consent_status:"unknown"},
 {member_id:"M103",invoice_id:"INV103",due_date:d(5),balance_cents:"21900",payment_status:"open",renewal_date:d(12),consent_status:"granted"},
 {member_id:"M104",invoice_id:"INV104",due_date:d(-45),balance_cents:"24900",payment_status:"disputed",renewal_date:d(18),consent_status:"denied"},
 {member_id:"M105",invoice_id:"INV105",due_date:d(-15),balance_cents:"29900",payment_status:"open",renewal_date:d(42),consent_status:"granted"},
 {member_id:"M106",invoice_id:"INV106",due_date:d(-1),balance_cents:"7900",payment_status:"failed",renewal_date:d(7),consent_status:"denied"},
 {member_id:"M107",invoice_id:"INV107",due_date:d(-9),balance_cents:"0",payment_status:"paid",renewal_date:d(20),consent_status:"granted"},
 {member_id:"M108",invoice_id:"INV108",due_date:d(14),balance_cents:"39000",payment_status:"open",renewal_date:d(29),consent_status:"unknown"},
 {member_id:"M109",invoice_id:"INV109",due_date:d(-12),balance_cents:"9900",payment_status:"open",renewal_date:d(91),consent_status:"unknown"},
 {member_id:"M110",invoice_id:"INV110",due_date:d(2),balance_cents:"12900",payment_status:"open",renewal_date:d(61),consent_status:"granted"},
 ]);
}
function analyze(input,now){
 const rows=validateRows(input);const today=dateOnly(now);
 const signals=[],evidence=new Set(),members=new Set(),failedMembers=new Set(),renewMembers=new Set();
 let pastDue=0;
 for(const r of rows){
   members.add(r.member_id);
   const days=Math.floor((today-dateOnly(r.due_date))/DAY);
   const renewIn=r.renewal_date?Math.floor((dateOnly(r.renewal_date)-today)/DAY):null;
   const unresolved=r.balance_cents>0&&!["paid","void","refunded"].includes(r.payment_status);
   const blocked=r.payment_status==="disputed"||r.consent_status!=="granted";
   if(unresolved&&days>0)pastDue+=r.balance_cents;
   const base={member_id:r.member_id,invoice_id:r.invoice_id,amount_cents:r.balance_cents,consent_status:r.consent_status,payment_status:r.payment_status,blocked,reason:blocked?(r.payment_status==="disputed"?"Disputed invoice requires reconciliation; no payment request":r.consent_status==="denied"?"Contact permission denied; no outreach":"Contact permission unverified; no outreach"):"Review balance and communications authority before outreach",evidence:{invoice_id:r.invoice_id,due_date:r.due_date,payment_status:r.payment_status,renewal_date:r.renewal_date,balance_cents:r.balance_cents}};
   const add=(kind,daysLabel,amount)=>{const key=r.invoice_id+":"+kind;if(evidence.has(key))return;evidence.add(key);signals.push({...base,id:key,kind,age_days:daysLabel,amount_cents:amount})};
   if(unresolved&&r.payment_status==="failed"){failedMembers.add(r.member_id);add("failed",days,r.balance_cents)}
   if(unresolved&&days>0){add("past_due",days,r.balance_cents)}
   // A pending renewal is informational, not an overdue amount. Paid invoices may still be up for renewal.
   if(renewIn!==null&&renewIn>=0&&renewIn<=30&&r.payment_status!=="void"&&r.payment_status!=="disputed"){
      renewMembers.add(r.member_id);add("renewal",renewIn,0);
   }
 }
 const importance={failed:0,past_due:1,renewal:2};
 signals.sort((a,b)=>Number(b.blocked)-Number(a.blocked)||importance[a.kind]-importance[b.kind]||b.amount_cents-a.amount_cents||a.id.localeCompare(b.id));
 return {rows,signals,metrics:{accounts:members.size,past_due_cents:pastDue,failed_members:failedMembers.size,renewal_members:renewMembers.size},as_of:now};
}
function proposal(signal){
 if(!signal)throw Error("Select a signal first");
 const heading={failed:"PAYMENT FAILURE — RECONCILIATION",past_due:"OVERDUE BALANCE — ACCOUNT REVIEW",renewal:"UPCOMING RENEWAL — STATUS CHECK"}[signal.kind];
 const why={failed:"Confirm whether a retry, alternative method, dispute or already-settled payment exists before any follow-up.",past_due:"Reconcile the invoice, any credits or refunds, and contract terms before considering a neutral reminder.",renewal:"Check whether the member intends to renew, the terms and any active cancellation or waiver."}[signal.kind];
 const draft={failed:"Subject: Account payment status check\nHello,\nWe are reviewing recent payment records. If you believe your account is current or needs correction, please contact the authorized billing team through your usual official channel. Thank you.",past_due:"Subject: Membership account review\nHello,\nOur records may show an account item requiring review. Please check the official member portal or contact the authorized billing team if you have paid or believe this is incorrect. Thank you.",renewal:"Subject: Upcoming membership review\nHello,\nYour membership may be approaching a renewal date. Please consult your official agreement and member portal to review options. Thank you."}[signal.kind];
 return {heading,why,draft,gate:signal.blocked?"BLOCKED — dispute or denied contact permission. Human reconciliation only.":"PENDING — authorized owner must verify reconciliation, consent, contractual rights and approved channel.",execution:"NONE — local decision record only; sending and charging are disabled."};
}
function toCsv(rows){
 const columns=["member_id","invoice_id","due_date","balance_cents","payment_status","renewal_date","consent_status"];
 const escape=s=>'"'+String(s??"").replaceAll('"','""')+'"';
 return [columns.join(","),...rows.map(r=>columns.map(k=>escape(r[k])).join(","))].join("\r\n")+"\r\n";
}
const API={parseCsv,validateRows,sampleRows,analyze,proposal,toCsv,fmtMoney};
if(typeof module!=="undefined"&&module.exports)module.exports=API;
if(!global.document)return;
const doc=global.document,$=id=>doc.getElementById(id);
const state={rows:[],report:null,selected:null,ledger:[],mode:"sample",counter:0};
const today=()=>isoDate(Date.now());
const text=(tag,content,cls)=>{const n=doc.createElement(tag);n.textContent=String(content);if(cls)n.className=cls;return n};
function displayMoney(cents){return fmtMoney(cents)}
function download(name,body,mime){
 const url=URL.createObjectURL(new Blob([body],{type:mime||"text/plain;charset=utf-8"}));
 const a=doc.createElement("a");a.href=url;a.download=name;doc.body.append(a);a.click();a.remove();global.setTimeout(()=>URL.revokeObjectURL(url),150);
}
function filterSignals(){
 return state.report?state.report.signals.filter(s=>$("filter").value==="all"||s.kind===$("filter").value):[];
}
function signalRows(){
 const body=$("signal-rows");body.replaceChildren();const items=filterSignals();
 $("empty-signals").hidden=items.length!==0;
 for(const s of items){
   const tr=text("tr","");tr.dataset.signalId=s.id;
   const id=text("td",s.member_id);id.append(text("div",s.invoice_id,"micro"));
   const title={failed:"Failed payment",past_due:"Past-due invoice",renewal:"Upcoming renewal"}[s.kind];
   const kind=text("td",title);kind.append(text("div",s.blocked?"Hold / reconcile":"Review needed",s.blocked?"state block":"state flag"));
   const amount=text("td",s.kind==="renewal"?"—":displayMoney(s.amount_cents));
   const evidence=text("td",s.kind==="renewal"?"Renewal in "+s.age_days+" days":s.age_days+" days past due");evidence.append(text("div",s.evidence.payment_status,"micro"));
   const action=doc.createElement("td"),btn=text("button",state.selected===s.id?"Selected":"Review","btn small");
   btn.type="button";btn.setAttribute("aria-pressed",String(state.selected===s.id));btn.addEventListener("click",()=>select(s.id));action.append(btn);tr.append(id,kind,amount,evidence,action);body.append(tr);
 }
}
function metric(){
 const m=state.report?.metrics||{accounts:0,past_due_cents:0,failed_members:0,renewal_members:0};
 $("count-accounts").textContent=m.accounts;
 $("past-due").textContent=displayMoney(m.past_due_cents);
 $("failed-count").textContent=m.failed_members;
 $("renewal-count").textContent=m.renewal_members;
 $("dataset-label").textContent=state.mode==="sample"?"Fictional sample · no real customers":state.mode==="csv"?"PRIVATE CSV · browser session only":"No data loaded";
}
function select(id){
 const s=state.report?.signals.find(x=>x.id===id);if(!s)return;
 state.selected=id;
 const p=proposal(s);
 $("focus-label").textContent=p.heading+" · "+s.member_id;
 $("focus-detail").textContent=p.why+" Evidence: "+s.invoice_id+" / "+s.evidence.due_date+" / "+s.payment_status+".";
 $("gate-status").textContent=p.gate;
 $("proposal").textContent=p.draft+"\n\nDecision gate: "+p.gate+"\n"+p.execution;
 $("approve").disabled=s.blocked;$("defer").disabled=false;$("reject").disabled=false;$("copy-draft").disabled=s.blocked;
 $("owner").value="";$("decision-note").value="";$("decision-status").textContent=s.blocked?"Cannot approve or copy blocked proposal. Reconcile outside the demo.":"Ready for a local decision; no external actions can be executed.";
 signalRows();
}
function ledgerRender(){
 $("ledger-count").textContent=state.ledger.length+" decisions";
 const panel=$("ledger");panel.replaceChildren();
 if(!state.ledger.length){panel.append(text("div","No decisions recorded. Nothing has been transmitted.","empty"));return}
 for(const e of [...state.ledger].reverse()){
   const article=text("article","", "card");
   const label={approved:"Locally approved — not executed",deferred:"Deferred for review",rejected:"Rejected"}[e.decision];
   article.append(text("div",e.id+" / "+label,"eyebrow"),text("p",e.member_id+" · "+e.invoice_id+" · "+e.kind+" · "+e.timestamp,"muted"),text("p","Reviewer: "+e.owner+" · Note: "+e.note,"micro"));
   panel.append(article);
 }
}
function decision(dec){
 const s=state.report?.signals.find(x=>x.id===state.selected);
 if(!s)return;
 if(dec==="approved"&&s.blocked){$("decision-status").textContent="Blocked: this record cannot be approved.";return}
 const owner=$("owner").value.trim(),note=$("decision-note").value.trim();
 if(!/^[\p{L}\p{N} ._-]{2,100}$/u.test(owner)||note.length<8){$("decision-status").textContent="Enter reviewer identity (2–100 characters) and a decision rationale (at least 8 characters).";return}
 const existing=state.ledger.findIndex(e=>e.signal_id===s.id);
 const e={id:"DEC-"+String(++state.counter).padStart(4,"0"),signal_id:s.id,member_id:s.member_id,invoice_id:s.invoice_id,kind:s.kind,decision:dec,owner,note,source:state.mode,evidence:s.evidence,timestamp:new Date().toISOString(),executed:false};
 if(existing>=0)state.ledger.splice(existing,1);
 state.ledger.push(e);
 $("decision-status").textContent="Recorded locally as "+e.id+". Not sent or executed.";
 ledgerRender();
}
function load(rows,mode){
 const report=analyze(rows,today());
 state.rows=report.rows;state.report=report;state.mode=mode;state.selected=null;state.ledger=[];state.counter=0;
 $("focus-label").textContent="Select a signal";$("focus-detail").textContent="Choose Review on a record. No action is sent.";
 $("proposal").textContent="Choose a signal to view a neutral draft. No messages can be sent.";
 $("gate-status").textContent="Human approval required. No external actions are enabled.";
 for(const id of ["approve","defer","reject","copy-draft"])$(id).disabled=true;
 $("filter").value="all";metric();signalRows();ledgerRender();
}
function clear(){
 state.rows=[];state.report=null;state.selected=null;state.ledger=[];state.mode="none";state.counter=0;
 $("csv-input").value="";$("import-status").textContent="Session cleared. Downloaded files, if any, remain on your device.";
 $("focus-label").textContent="No session data";$("focus-detail").textContent="Select sample data or a local CSV.";
 $("gate-status").textContent="No action available.";$("proposal").textContent="No draft.";
 for(const id of ["approve","defer","reject","copy-draft"])$(id).disabled=true;
 metric();signalRows();ledgerRender();
}
$("filter").addEventListener("change",signalRows);
$("reset-demo").addEventListener("click",()=>{load(sampleRows(today()),"sample");$("import-status").textContent="Fictional sample restored; previous session decisions cleared."});
$("load-sample").addEventListener("click",()=>{load(sampleRows(today()),"sample");$("import-status").textContent="Fictional sample restored."});
$("erase-data").addEventListener("click",clear);
$("approve").addEventListener("click",()=>decision("approved"));
$("defer").addEventListener("click",()=>decision("deferred"));
$("reject").addEventListener("click",()=>decision("rejected"));
$("sample-csv").addEventListener("click",()=>download("aperture-revenue-recovery-demo.csv",toCsv(sampleRows(today())),"text/csv;charset=utf-8"));
$("download-review").addEventListener("click",()=>{
 if(!state.report)return;
 const columns=["signal_id","member_id","invoice_id","type","amount_cents","blocked","payment_status","due_date"];
 const rows=state.report.signals.map(s=>[s.id,s.member_id,s.invoice_id,s.kind,s.amount_cents,s.blocked,s.payment_status,s.evidence.due_date]);
 download("aperture-review-queue.csv",[columns,...rows].map(row=>row.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(",")).join("\r\n")+"\r\n","text/csv;charset=utf-8");
});
$("export-ledger").addEventListener("click",()=>{
 download("aperture-decision-ledger.json",JSON.stringify({schema_version:1,source:state.mode,exported_at:new Date().toISOString(),advisory:"Decisions are local only; none was executed or transmitted.",decisions:state.ledger},null,2),"application/json");
});
$("copy-draft").addEventListener("click",async()=>{
 const s=state.report?.signals.find(x=>x.id===state.selected);
 if(!s||s.blocked)return;
 try{await navigator.clipboard.writeText(proposal(s).draft);$("decision-status").textContent="Draft copied. No message sent. Verify authority and channel before use."}
 catch{$("decision-status").textContent="Clipboard access unavailable. Select the text manually."}
});
$("csv-input").addEventListener("change",async()=>{
 const f=$("csv-input").files?.[0];if(!f)return;
 if(f.size>MAX_BYTES){$("import-status").textContent="File exceeds 200 KB. Original session unchanged.";return}
 try{
   const content=await f.text();const rows=validateRows(parseCsv(content));
   load(rows,"csv");
   $("import-status").textContent="Analyzed "+rows.length+" local invoice records. Nothing uploaded. Decision ledger reset.";
 }catch(error){$("import-status").textContent="File rejected: "+error.message+". Original session unchanged."}
});
load(sampleRows(today()),"sample");
})(typeof globalThis!=="undefined"?globalThis:this);