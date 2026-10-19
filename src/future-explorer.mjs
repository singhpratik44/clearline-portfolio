// Classical, quantum-inspired branching: not a quantum computer or physical simulation.
// Deterministic beam search with immutable inputs, feasibility gates, and explicit bounds.
import { evaluateProposal } from './decision-kernel.mjs';

export function exploreFutures(state, candidates, { beamWidth = 4, maxCandidates = 64 } = {}) {
  if (!Number.isInteger(beamWidth) || beamWidth < 1 || beamWidth > 32) throw new RangeError('beamWidth must be 1..32');
  if (!Number.isInteger(maxCandidates) || maxCandidates < 1 || maxCandidates > 512) throw new RangeError('maxCandidates must be 1..512');
  if (!Array.isArray(candidates)) throw new TypeError('candidates must be an array');
  if (candidates.length > maxCandidates) throw new RangeError('candidate budget exceeded');
  const evaluated = candidates.map((candidate, index) => {
    const gate = evaluateProposal(state, candidate);
    const impact = Number(candidate?.estimatedImpact);
    const risk = Number(candidate?.estimatedRisk);
    const cost = Number(candidate?.estimatedCost);
    const bounded = [impact, risk, cost].every(Number.isFinite) && risk >= 0 && cost >= 0;
    const reasons = [...gate.reasons, ...(!bounded ? ['invalid_estimates'] : [])];
    return {
      id: String(candidate?.id ?? index),
      eligible: reasons.length === 0,
      reasons,
      score: reasons.length === 0 ? impact - risk - cost : null,
      // These are input estimates, never observed results.
      estimatedImpact: bounded ? impact : null,
      estimatedRisk: bounded ? risk : null,
      estimatedCost: bounded ? cost : null
    };
  });
  const ranked = evaluated.filter(x => x.eligible).sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
  return { method: 'classical_bounded_beam', quantumHardware: false, evaluatedCount: evaluated.length, selected: ranked.slice(0, beamWidth), rejected: evaluated.filter(x => !x.eligible) };
}
