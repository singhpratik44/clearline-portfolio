import { analyzeWorld } from './world-graph.mjs';
import { solveDecision } from './solver-router.mjs';

// One canonical state, multiple read-only projections. Pure classical computation.
export async function simulateOrganization(snapshot, proposals, options = {}) {
  if (!snapshot || !Number.isInteger(snapshot.version) || snapshot.version < 0) throw new TypeError('versioned snapshot required');
  if (!Array.isArray(proposals)) throw new TypeError('proposals must be an array');
  const maxCandidates = options.maxCandidates ?? 64;
  if (!Number.isInteger(maxCandidates) || maxCandidates < 1 || maxCandidates > 512) throw new RangeError('maxCandidates must be 1..512');
  if (proposals.length > maxCandidates) throw new RangeError('candidate budget exceeded');
  const nodes = structuredClone(snapshot.nodes ?? []);
  const edges = structuredClone(snapshot.edges ?? []);
  const graph = analyzeWorld(nodes, edges);
  const completed = nodes.filter(n => n.completed === true).map(n => n.id);
  const state = { version: snapshot.version, completed };
  const eligibleWork = new Set(graph.actionable);
  const feasible = [], rejectedEarly = [];
  for (const p of proposals) {
    if (!p || typeof p !== 'object') { rejectedEarly.push({ id: '', eligible: false, reasons: ['invalid_proposal'], score: null }); continue; }
    if (!eligibleWork.has(p.targetNode)) {
      rejectedEarly.push({ id: String(p.id ?? ''), eligible: false, reasons: ['target_not_actionable'], score: null });
      continue;
    }
    // Preserve the proposal as-is: malformed prerequisites must fail the truth kernel.
    feasible.push(p);
  }
  const result = await solveDecision(state, feasible, options);
  const projections = {
    operations: { ready: [...graph.actionable], completed: [...graph.completed] },
    risk: { downstreamImpact: graph.blastRadius },
    planning: { executionOrder: graph.order, dependencyDepth: graph.depth },
    decisions: { ranked: result.selected, rejected: [...rejectedEarly, ...result.rejected] }
  };
  return { version: snapshot.version, projections, solver: result.solver, verifiedQuantumExecution: result.verifiedQuantumExecution, evaluatedCount: feasible.length, prunedCount: rejectedEarly.length, ...(result.fallback ? { fallback: result.fallback } : {}) };
}
