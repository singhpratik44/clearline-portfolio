import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exploreFutures } from '../src/future-explorer.mjs';

const state = { version: 3, completed: ['staffing'] };
const proposal = (id, impact, overrides = {}) => ({
  id, owner: 'director', baseVersion: 3, prerequisites: ['staffing'],
  evidence: ['source'], successMeasure: 'enrollment', reversalCondition: 'capacity',
  estimatedImpact: impact, estimatedRisk: 2, estimatedCost: 1, ...overrides
});

test('ranks eligible estimated futures deterministically', () => {
  const a = exploreFutures(state, [proposal('b', 9), proposal('a', 9), proposal('c', 3)], {beamWidth:2});
  assert.deepEqual(a.selected.map(x=>x.id), ['a','b']);
  assert.equal(a.quantumHardware, false);
});
test('prunes unmet dependencies and approvals', () => {
  const r = exploreFutures(state, [proposal('blocked', 100, {prerequisites:['missing']}), proposal('approved', 10)]);
  assert.deepEqual(r.selected.map(x=>x.id), ['approved']);
  assert.equal(r.rejected[0].eligible, false);
});
test('rejects invalid numerical estimates', () => {
  assert.equal(exploreFutures(state, [proposal('bad', Number.POSITIVE_INFINITY)]).rejected[0].reasons[0], 'invalid_estimates');
});
test('enforces computation budget', () => {
  assert.throws(() => exploreFutures(state, Array.from({length:3}, (_,i)=>proposal(String(i),i)), {maxCandidates:2}), /budget/);
});
test('does not mutate inputs', () => {
  const c = [proposal('a', 5)], before = structuredClone(c);
  exploreFutures(state,c); assert.deepEqual(c,before);
});
