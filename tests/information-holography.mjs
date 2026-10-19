import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeBoundary, decodeBoundary, completeCanonical, completeBoundary,
  verifyBoundaryEquivalence
} from '../src/information-holography.mjs';

const snapshot = {
  version: 7, workspace: { name: 'Encino demonstration', mode: 'fixture' },
  nodes: [{ id: 'trial', completed: false, role: 'director' },
          { id: 'enroll', completed: false },
          { id: 'staff', completed: true, capacity: 2 }],
  edges: [{ from: 'staff', to: 'trial', label: 'coverage' },
          { from: 'trial', to: 'enroll', label: 'completed trial' }]
};
const proposal = {
  id: 'schedule-trial', targetNode: 'trial', owner: 'director', baseVersion: 7,
  prerequisites: ['staff'], evidence: ['fixture'],
  successMeasure: 'conversion', reversalCondition: 'capacity',
  estimatedImpact: 10, estimatedRisk: 1, estimatedCost: 2
};

test('boundary representation is reversible including metadata and edge labels', () => {
  const b = encodeBoundary(snapshot);
  const r = decodeBoundary(b);
  assert.deepEqual(r.workspace, snapshot.workspace);
  assert.deepEqual(r.nodes.find(n => n.id === 'staff'), snapshot.nodes[2]);
  assert.deepEqual(r.edges.find(e => e.to === 'enroll').label, 'completed trial');
  assert.deepEqual(encodeBoundary(r), b);
});

test('QIH-inspired operator consistency: D O_H T = O', () => {
  const canonical = completeCanonical(snapshot, 'trial');
  const viaBoundary = decodeBoundary(completeBoundary(encodeBoundary(snapshot), 'trial'));
  assert.deepEqual(encodeBoundary(canonical), encodeBoundary(viaBoundary));
  assert.equal(viaBoundary.version, 8);
});

test('dependency gates apply in both representations', () => {
  assert.throws(() => completeCanonical(snapshot, 'enroll'), /not actionable/);
  assert.throws(() => completeBoundary(encodeBoundary(snapshot), 'enroll'), /not actionable/);
});

test('reconstruction rejects tampered unknown, repeated, or cyclic links', () => {
  const b = encodeBoundary(snapshot);
  const broken = structuredClone(b);
  broken.links[1] = [{ fromIndex: 99, edgeData: {} }];
  assert.throws(() => decodeBoundary(broken), /invalid encoded dependency/);
  const cyclic = structuredClone(b);
  const staff = cyclic.nodes.findIndex(n => n.id === 'staff');
  const enroll = cyclic.nodes.findIndex(n => n.id === 'enroll');
  cyclic.links[staff].push({fromIndex: enroll, edgeData:{}});
  assert.throws(() => decodeBoundary(cyclic), /cycle/);
});

test('simulation outcomes agree across two information representations', async () => {
  const result = await verifyBoundaryEquivalence(snapshot, [proposal], { targetNode: 'trial' });
  assert.equal(result.roundTripEquivalent, true);
  assert.equal(result.simulationEquivalent, true);
  assert.equal(result.operatorEquivalent, true);
  assert.equal(result.computation, 'classical');
  assert.equal(result.dependencies, 2);
});

test('dual representation experiment never mutates original inputs', async () => {
  const stateBefore = structuredClone(snapshot), pBefore = structuredClone(proposal);
  await verifyBoundaryEquivalence(snapshot, [proposal], { targetNode: 'trial' });
  assert.deepEqual(snapshot, stateBefore);
  assert.deepEqual(proposal, pBefore);
});

test('rejects invalid state encodings', () => {
  assert.throws(() => encodeBoundary({ ...snapshot, version: -1 }), /versioned/);
  const b = encodeBoundary(snapshot);
  b.nodes.reverse();
  assert.throws(() => decodeBoundary(b), /canonical node order/);
});
