import test from "node:test";
import assert from "node:assert/strict";
import {evaluateUseCase,useCases} from "./use-cases.mjs";
test("all five cases evaluate",()=>assert.equal(useCases.map(c=>evaluateUseCase(c)).length,5));
test("sensitive real-world actions remain blocked",()=>{for(const c of useCases.filter(c=>c.external)){assert.equal(evaluateUseCase(c,c.dependencies).mayProceed,false)}});
test("research preparation is local-only when verified",()=>{const c=useCases.find(c=>c.id==="research-record");assert.deepEqual(evaluateUseCase(c,c.dependencies).status,"LOCAL_ONLY")});
test("missing evidence blocks sample sports plan",()=>{const c=useCases.find(c=>c.id==="practice-plan");assert.equal(evaluateUseCase(c,[]).status,"BLOCKED_PREREQUISITES")});
