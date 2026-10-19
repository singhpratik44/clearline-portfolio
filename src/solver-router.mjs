import { exploreFutures } from './future-explorer.mjs';

// Unified interface: quantum hardware adapters may be registered only when genuinely connected.
// Every adapter must return auditable candidates, not mutate authoritative state.
export async function solveDecision(state, candidates, { mode = 'auto', adapters = {}, beamWidth = 4 } = {}) {
  const baseline = exploreFutures(state, candidates, { beamWidth });
  if (mode === 'classical' || (mode === 'auto' && typeof adapters.quantum !== 'function')) {
    return { ...baseline, solver: 'classical', verifiedQuantumExecution: false };
  }
  if (mode !== 'auto' && mode !== 'quantum') throw new RangeError('unsupported solver mode');
  if (typeof adapters.quantum !== 'function') {
    return { ...baseline, solver: 'classical', verifiedQuantumExecution: false, fallback: 'quantum_adapter_unavailable' };
  }
  try {
    const result = await adapters.quantum({ state: structuredClone(state), candidates: structuredClone(candidates), beamWidth });
    if (!result || !Array.isArray(result.candidateIds) || result.candidateIds.some(id => typeof id !== 'string')) throw new TypeError('invalid adapter output');
    const eligible = new Map(baseline.selected.map(x => [x.id, x]));
    const selected = [...new Set(result.candidateIds)].map(id => eligible.get(id)).filter(Boolean).slice(0, beamWidth);
    if (!selected.length) throw new Error('no verified eligible candidates');
    // Provider's hardware claim must be backed by a trace identifier; trace verification remains external.
    return { ...baseline, selected, solver: 'quantum_adapter', verifiedQuantumExecution: false, executionTrace: typeof result.traceId === 'string' ? result.traceId : null };
  } catch (error) {
    return { ...baseline, solver: 'classical', verifiedQuantumExecution: false, fallback: 'quantum_adapter_failed' };
  }
}
