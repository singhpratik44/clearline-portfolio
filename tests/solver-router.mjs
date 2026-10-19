import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solveDecision } from '../src/solver-router.mjs';
const state = { version: 1, completed: [] };
const candidate = { id:'a',owner:'owner',baseVersion:1,prerequisites:[],evidence:['record'],successMeasure:'impact',reversalCondition:'stop',estimatedImpact:10,estimatedRisk:1,estimatedCost:1 };
test('auto defaults to classical', async () => assert.equal((await solveDecision(state,[candidate])).solver,'classical'));
test('explicit quantum request without adapter falls back', async () => assert.equal((await solveDecision(state,[candidate],{mode:'quantum'})).fallback,'quantum_adapter_unavailable'));
test('adapter cannot introduce an ineligible decision', async () => {
  const blocked={...candidate,id:'b',prerequisites:['missing']};
  const result=await solveDecision(state,[candidate,blocked],{mode:'quantum',adapters:{quantum:async()=>({candidateIds:['b','a'],traceId:'trace'})}});
  assert.deepEqual(result.selected.map(x=>x.id),['a']);
  assert.equal(result.verifiedQuantumExecution,false);
});
test('adapter errors safely fall back', async () => assert.equal((await solveDecision(state,[candidate],{mode:'quantum',adapters:{quantum:async()=>{throw Error('offline')}}})).solver,'classical'));
