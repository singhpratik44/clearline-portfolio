// Deterministic proposal-only decision kernel, independent of React and network access.
// No authoritative state mutation, execution, or permission grants occur here.
export function evaluateProposal(state, proposal) {
  const reasons = [];
  if (!state || !Number.isInteger(state.version) || state.version < 0) reasons.push('invalid_state_version');
  if (!proposal || typeof proposal !== 'object') return { status: 'blocked', reasons: ['invalid_proposal'] };
  if (!proposal.id || !proposal.owner) reasons.push('missing_identity_or_owner');
  if (!Number.isInteger(proposal.baseVersion) || proposal.baseVersion !== state?.version) reasons.push('stale_state');
  if (!Array.isArray(proposal.prerequisites)) reasons.push('invalid_prerequisites');
  else {
    const complete = new Set(state?.completed ?? []);
    for (const id of proposal.prerequisites) if (!complete.has(id)) reasons.push('unmet:' + id);
  }
  if (!Array.isArray(proposal.evidence) || proposal.evidence.length === 0) reasons.push('missing_evidence');
  if (!proposal.successMeasure || !proposal.reversalCondition) reasons.push('missing_success_or_reversal');
  if (proposal.consequential && proposal.approvedVersion !== state?.version) reasons.push('approval_required_for_version');
  return { status: reasons.length ? 'blocked' : 'eligible', reasons };
}
