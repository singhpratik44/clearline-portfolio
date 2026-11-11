import test from "node:test";
import assert from "node:assert/strict";
import {assessEvidence,evidenceGate} from "./evidence-quality.mjs";
const now=new Date("2026-11-11T00:00:00Z");
const verified={id:"example",url:"https://example.org/paper",title:"Example",published_at:"2026-10-11T00:00:00Z",retrieved_at:"2026-11-11T00:00:00Z",review_status:"published"};
test("complete recent evidence passes metadata gate",()=>assert.equal(assessEvidence(verified,{now}).ready_for_decision,true));
test("preprint is not silently labeled peer reviewed",()=>assert.ok(assessEvidence({...verified,review_status:"preprint; peer review not inferred"},{now}).flags.includes("peer-review-unverified")));
test("stale and unverified evidence blocked",()=>assert.equal(evidenceGate([{...verified,updated_at:"2024-01-01",retrieved_at:null}],{now}).allowed,false));
test("missing records fail closed",()=>assert.equal(evidenceGate([],{now}).allowed,false));
