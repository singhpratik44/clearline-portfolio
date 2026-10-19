import { analyzeWorld } from './world-graph.mjs';
import { solveDecision } from './solver-router.mjs';

// One immutable state projected into operational views and evaluated against proposals.
// QIH motivates the multi-view metaphor; all computation here is classical.
export async function simulateOrganization(snapshot, proposals, options = {}) {
  if (!snapshot || !Number.isInteger(snapshot.version) || snapshot.version < 0) throw new TypeError('versioned snapshot required');
  const nodes = structuredClone(snapshot.nodes ?? []);
  const edges = structuredClone(snapshot.edges ?? []);
  const graph = analyzeWorld(nodes, edges);
  const completed = nodes.filter(n => n.completed === true).map(n => n.id);
  const state = { version: snapshot.version, completed };
  const eligibleWork = new Set(graph.actionable);
  const normalized = proposals.map(p => ({
    ...p,
    prerequisites: Array.isArray(p.prerequisites) ? p.prerequisites : [],
    // Work item must be currently actionable, or it remains blocked via prerequisite gate.
    ...(!eligibleWork.has(p.targetNode) ? { prerequisites: [...(p.prerequisites ?? []), '__target_not_actionable__'] } : {})
  }));
  const result = await solveDecision(state, normalized, options);
  const projections = {
    operations: { ready: [...graph.actionable], completed: [...graph.completed] },
    risk: { downstreamImpact: graph.blastRadius },
    planning: { executionOrder: graph.order, dependencyDepth: graph.depth },
    decisions: { ranked: result.selected, rejected: result.rejected }
  };
  return { version: snapshot.version, projections, solver: result.solver, verifiedQuantumExecution: result.verifiedQuantumExecution, ...(result.fallback ? { fallback: result.fallback } : {}) };
}
