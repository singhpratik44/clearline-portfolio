import test from "node:test";
import assert from "node:assert/strict";
import {prepareDecision} from "./decision-report.mjs";
const now=new Date("2026-11-11T00:00:00Z");
const evidence=[{id:"source-1",url:"https://example.org",title:"Sample evidence",published_at:"2026-11-01T00:00:00Z",retrieved_at:"2026-11-11T00:00:00Z",review_status:"published"}];
test("approved-looking external requests still never execute",()=>{const r=prepareDecision({caseId:"uspa-referral",completed:["partner_agreement","school_consent","user_approval"],evidence,now});assert.equal(r.status,"BLOCKED");assert.equal(r.external_actions_performed,0);assert.ok(r.blockers.includes("external-action:human-review-required"))});
test("local planning produces report only after evidence and inputs",()=>{const r=prepareDecision({caseId:"practice-plan",completed:["duration_set","constraints_set"],evidence,now});assert.equal(r.status,"READY_FOR_LOCAL_PREPARATION");assert.equal(r.executed,false)});
test("missing evidence blocks otherwise ready task",()=>{const r=prepareDecision({caseId:"practice-plan",completed:["duration_set","constraints_set"],now});assert.equal(r.status,"BLOCKED")});
test("unknown cases rejected",()=>assert.throws(()=>prepareDecision({caseId:"bogus"}),RangeError));
