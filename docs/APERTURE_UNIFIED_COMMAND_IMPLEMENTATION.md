# APERTURE unified command — implementation contract

Status: isolated development proposal; not deployed to dependency-delivery.chatgpt.site.

## Source verification gate
Confirm the live site's actual source repository and deployment mapping before merging or publishing. Do not assume this repository powers that domain.

## Product flow
One entry point: Command → Universe → Decisions → Execution → Evidence.
All five views consume the same versioned state; no duplicated business logic.

## First vertical slice
1. Command: display highest-priority blocked dependency, why it matters, and one next-best action.
2. Universe: select a node to see prerequisites, downstream blast radius, evidence and owner.
3. Decisions: compare baseline and one hypothetical intervention using identical assumptions.
4. Execution: queue a proposal; require explicit human authorization before consequential actions.
5. Evidence: log proposal, inputs, verdict, timestamp and reversible state transition.

## Invariants
- No agent self-approval.
- No execution if prerequisites or authorization are missing.
- No claims of real-world impact from illustrative simulations.
- Every state-changing action supports undo or a documented compensation path.
- Deterministic checks before model calls; batch and cache repeated work.

## Acceptance tests
- Navigation works with mouse, keyboard, and touch at 375px viewport.
- No dead controls; each primary action visibly updates canonical state.
- Undo restores the previous state and evidence links.
- Blocked actions produce an inspectable reason without side effects.
- Scenario comparison does not mutate baseline.
- Refresh/persistence behavior is clearly disclosed and tested.
- Existing routes remain reachable.
- Deployment only after source mapping, tests, and human review.

## Rollout
Audit actual source → implement isolated vertical slice → run regression and mobile tests → review diff → request merge/deploy approval.
