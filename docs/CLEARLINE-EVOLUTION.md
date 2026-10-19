# Clearline — governed evolution backlog
Status: proposed architecture and implementation sequence. This document does not claim these capabilities are implemented.

## Existing experiences to preserve
- Portfolio: https://singhpratik44.github.io/clearline-portfolio/ (repository root currently serves a Protecting the Center shell; /clearline/ hosts portfolio content)
- Governance model: https://clearline-governance-model.netlify.app/
- APERTURE: https://dependency-delivery.kobez2417.chatgpt.site/
- Keep production main unchanged until independently verified. Do not replace sites with separate prototypes.

## Core operating contract
Goal -> observe evidence -> map dependencies -> determine whether intervention is necessary -> compare feasible changes -> independent verification -> human approval where consequential -> execute -> record actual outcomes.

Every change proposal must contain:
- id, goal, rationale, alternatives, assumptions, source-state version
- owner and authority rule, prerequisites, resource limits
- success measure, evidence provenance, reversal condition
- uncertainty and modeled-vs-observed distinction

## Governor and agent boundaries
One deterministic governor controls canonical state, authorization and the append-only decision record. Specialized agents are proposal-only; they cannot mutate authoritative state or grant themselves permissions. Run independent work in parallel, serialize conflicting writes, and allocate compute only when needed.

Agent roles: architecture audit; kernel extraction; dependency graph; decision router; optimization; evidence/governance; simulation; mobile/experience; career adaptation; QA/release.

## Prioritized development gates
P0: Identify authoritative deployment source, build steps and duplicated root vs /clearline files. Verify missing app.bundle.js referenced by root index.html and whether the deployed root experience renders. Do not invent a bundle.
P1: Establish CI for structural and local asset tests; fix failures without suppressing legitimate errors.
P2: Add browser/mobile smoke tests for load, navigation, buttons, comparison, scenario state, persistence, and accessibility. Test representative iPhone viewport.
P3: Extract a small shared, deterministic kernel (versioned state, dependency validation, evidence sufficiency, approval rules) without rewriting the franchise engine.
P4: Route no-action/rules/optimization/simulation/targeted agents based on uncertainty and risk; keep all agent output as bounded proposals.
P5: Add minimal-intervention optimization, counterfactual branches, recovery proposals and verifiable decision history.
P6: Integrate portfolio, governance and APERTURE through a versioned contract; no cross-site authority assumptions.
P7: Tailor employer scenarios (franchise director, Kodland, GoGuardian) from the same underlying contract; label illustrative data.
P8: Compare changes against baseline latency, model calls, failure rate, mobile task completion and real outcome measures. Roll back regressions.

## Safety and integrity requirements
- Never imply simulated projections are real operational data.
- No production deployment or external action without required human authority.
- Preserve existing URLs, records and functionality.
- Approval binds proposal and state version; stale approvals are invalid.
- Tests passing on static HTML are not evidence that a React experience renders.
- Avoid unnecessary model calls, duplicated datasets, decorative simulations and unchecked autonomy.

## Current verified findings (2026-10-18)
- GitHub repository singhpratik44/clearline-portfolio exists and supports branch writes.
- Root index.html references app.bundle.js, absent from the root file inventory at inspection time.
- src/entry.jsx imports src/franchise-engine.tsx; actual bundling/deployment path still needs verification.
- Existing pages include governance, enrollment, unit-defense, basketball, application, self-review and implementation.
- Initial structural GitHub Actions workflow passed. Local-asset test needs a CI run before its outcome can be claimed.
