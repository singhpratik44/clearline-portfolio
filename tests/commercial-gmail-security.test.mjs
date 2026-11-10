import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {webcrypto} from "node:crypto";
import {TextEncoder,TextDecoder} from "node:util";

const root=new URL("../",import.meta.url);
function load(file,extras={}){
 const context={globalThis:{crypto:webcrypto,indexedDB:{},location:{protocol:"https:",hostname:"example.test"}},URL,TextEncoder,TextDecoder,atob,btoa,setTimeout,...extras};
 vm.runInNewContext(fs.readFileSync(new URL(file,root),"utf8"),context,{filename:file});
 return context.globalThis;
}
const core=load("commercial-4d/opportunities/gmail-core.js").AP4DGmailCore;
const vault=load("commercial-4d/opportunities/vault.js").AP4DVault;
const audit=load("commercial-4d/opportunities/audit.js").AP4DAudit;
const engine=load("commercial-4d/opportunities/engine.js").AP4DOpportunity;
const TID="abc123abc123abc1", A="abcdefabcdef1234",B="abcdefabcdef1235";
const MSG=(id,day,labels,subject,snippet,from="contact@example.test")=>({
 id,threadId:TID,internalDate:String(Date.parse(day)),labelIds:labels,
 snippet,payload:{headers:[{name:"Subject",value:subject},{name:"From",value:from}]}
});
const outbound=MSG(A,"2026-11-06T20:00:00Z",["SENT"],"Partnership discussion","I propose a discussion.","user@example.test");
const received=MSG(B,"2026-11-09T20:00:00Z",["INBOX"],"Re: Partnership discussion","Let's meet Friday. I can send a referral agreement.","contact@example.test");
const source="https://mail.google.com/mail/u/?authuser=user%40example.test#all/"+TID;
const initial=engine.normalizeBundle({opportunities:[{
 id:"private-1",organization:"Example Sports Partner",title:"Referral pilot",kind:"partnership",stage:"meeting_offered",
 source_url:source,last_evidence_at:"2026-11-09T20:00:00Z",evidence:"Verified reply offering a meeting.",status_confidence:"confirmed",
 terms:"Proposed, not signed",blockers:"Outreach must be approved",proposed_next:"Review partner referral scope",
 contract_value:null,terms_confirmed:false
}]}).opportunities;
test("extract Gmail thread identity from imported source URLs without publishing any actual IDs",()=>{
 assert.equal(core.threadId(source),TID);
 assert.equal(core.threadId("https://evil.example/#all/"+TID),"");
 assert.equal(core.threadId("javascript:alert(1)"),"");
});
test("read-only thread reconciliation does not multiply the six-source ledger",()=>{
 const a=core.merge(initial,{id:TID,messages:[outbound,received]});
 assert.equal(a.opportunities.length,1);
 assert.equal(a.added,0);assert.equal(a.updated,1);assert.equal(a.new_messages,2);
 assert.equal(a.opportunities[0].id,"private-1");
 assert.equal(a.opportunities[0].evidence,initial[0].evidence,"Preserve manually verified evidence");
 assert.equal(a.opportunities[0].stage,"meeting_offered");
 assert.deepEqual(Array.from(a.opportunities[0].message_ids),[A,B]);
 const b=core.merge(a.opportunities,{id:TID,messages:[outbound,received]});
 assert.equal(b.opportunities.length,1);assert.equal(b.new_messages,0);assert.equal(b.unchanged,1);
});
test("auto-replies and delivery failures never count as human commercial responses",()=>{
 const auto=MSG(B,"2026-11-09T20:00:00Z",["INBOX"],"Automatic reply: inquiry","We received your message.","noreply@example.test");
 const bounce=MSG(B,"2026-11-09T20:00:00Z",["INBOX"],"Delivery Status Notification (Failure)","The message was not delivered.","mailer-daemon@example.test");
 assert.equal(core.classify([outbound,auto],"outbound").stage,"auto_reply");
 assert.equal(core.classify([outbound,bounce],"outbound").stage,"delivery_failed");
});
test("rescheduling conflicts invalidate an older confirmed screening stage",()=>{
 const changed=MSG(B,"2026-11-09T20:00:00Z",["INBOX"],"Re: Partnership discussion","We need to reschedule the appointment; I cannot attend Friday.","contact@example.test");
 const verdict=core.classify([outbound,changed],"screening_confirmed");
 assert.equal(verdict.stage,"responded");
 assert.equal(verdict.needs_review,true);
});
test("Gmail sync never self-approves a commercial contract",()=>{
 const thread={id:TID,messages:[outbound,received]};
 const row=core.merge(initial,thread).opportunities[0];
 assert.equal(row.terms_confirmed,false);
 assert.equal(engine.dashboard([engine.normalize(row,0)]).booked_contract_value,0);
});
test("dedup metadata survives normalization and private roundtrip",()=>{
 const a=core.merge(initial,{id:TID,messages:[outbound,received]}).opportunities[0];
 const b=engine.normalizeBundle({opportunities:[a]}).opportunities[0];
 assert.equal(b.gmail_thread_id,TID);
 assert.equal(b.message_ids.length,2);
 assert.ok(b.last_synced_at);
 assert.ok(b.gmail_latest_excerpt);
});
test("vault encryption keeps correspondence out of ciphertext and rejects wrong key",async()=>{
 const input={opportunities:initial,ledger:[]};
 const sealed=await vault.seal(input,"a very long private passphrase 123");
 assert.equal(sealed.schema,"aperture-vault-v1");
 assert.equal(sealed.cipher,"AES-256-GCM");
 assert.ok(!JSON.stringify(sealed).includes("Example Sports Partner"));
 const opened=await vault.open(sealed,"a very long private passphrase 123");
 assert.equal(opened.opportunities[0].organization,"Example Sports Partner");
 await assert.rejects(vault.open(sealed,"totally incorrect passphrase"),/Wrong passphrase/);
 await assert.rejects(vault.seal(input,"short"),/12 characters/);
});
test("review ledger is hash-linked, verifiable and not external action authority",async()=>{
 const row=initial[0];
 const p=audit.proposal(row);
 assert.equal(p.scope,"planning_review_only");
 const ledger=await audit.append([],"proposal_reviewed",{proposal:p,authority:"planning_review_only"});
 assert.equal(ledger.length,1);
 assert.equal(await audit.verify(ledger),true);
 assert.equal(await audit.sameProposal(ledger[0],row),true);
 const changed={...row,proposed_next:"A completely new proposal"};
 assert.equal(await audit.sameProposal(ledger[0],changed),false);
 const altered=JSON.parse(JSON.stringify(ledger));altered[0].payload.authority="external_email_send";
 assert.equal(await audit.verify(altered),false);
});
test("secure browser OAuth uses read-only scope and no mailbox-wide scan or send permission",()=>{
 const oauth=fs.readFileSync(new URL("commercial-4d/opportunities/gmail-oauth.js",root),"utf8");
 const page=fs.readFileSync(new URL("commercial-4d/opportunities/index.html",root),"utf8");
 assert.match(oauth,/https:\/\/www\.googleapis\.com\/auth\/gmail\.readonly/);
 assert.match(oauth,/method:"GET"/);
 assert.match(oauth,/threads\//);
 assert.doesNotMatch(oauth,/gmail\.modify|gmail\.send|refresh_token|localStorage|sessionStorage/);
 assert.match(page,/src="\.\/gmail-oauth\.js"/);
 assert.match(page,/src="\.\/vault\.js"/);
 assert.match(page,/src="\.\/secure-ui\.js"/);
 assert.match(page,/Record hash-linked planning review/);
 assert.doesNotMatch(page,/gouspa\.org|boominbusinesssolutions\.com|parry\.s\.2324@gmail\.com/);
});
