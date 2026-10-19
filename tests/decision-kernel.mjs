import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateProposal } from '../src/decision-kernel.mjs';

const state = { version: 7, completed: ['coverage'] };
const proposal = { id: 'p1', owner: 'director', baseVersion: 7, prerequisites: ['coverage'], evidence: ['staffing-record'], successMeasure: 'capacity', reversalCondition: 'coverage loss', consequential: true, approvedVersion: 7 };

test('valid approved proposal is eligible', () => assert.equal(evaluateProposal(state, proposal).status, 'eligible'));
test('stale proposals are blocked', () => assert.ok(evaluateProposal(state, { ...proposal, baseVersion: 6 }).reasons.includes('stale_state')));
test('unmet prerequisites block', () => assert.ok(evaluateProposal(state, { ...proposal, prerequisites: ['funding'] }).reasons.includes('unmet:funding')));
test('consequential proposals need state-bound approval', () => assert.ok(evaluateProposal(state, { ...proposal, approvedVersion: 6 }).reasons.includes('approval_required_for_version')));
test('missing evidence blocks', () => assert.ok(evaluateProposal(state, { ...proposal, evidence: [] }).reasons.includes('missing_evidence')));
test('kernel does not mutate state or proposal', () => {
  const a = structuredClone(state), b = structuredClone(proposal);
  evaluateProposal(state, proposal);
  assert.deepEqual(state, a); assert.deepEqual(proposal, b);
});
