# Clearline master organization and delivery plan

## North star

**Clearline** is the public-facing operating-systems portfolio and delivery methodology. **APERTURE** is its universal decision and coordination kernel. Organization-specific **worlds** are adapters and simulations over the same underlying model. The **Jason Padgett-inspired / QIH** work is a clearly separated research program. Employment demonstrations are applications of the architecture, not its reason for existence.

**Success test:** given a proposed organizational change, identify prerequisites, evidence, owner and authority; simulate alternatives; verify invariants; approve or reject; record and replay the outcome without contradictory dashboards.

## Goals by level

| ID | Goal | Deliverable | Acceptance gate |
|---|---|---|---|
| G1 | Canonical truth | Versioned state and event history | Reload/replay agrees; conflicting versions rejected |
| G2 | Dependency intelligence | Typed AND/OR graph, cycles, critical path, blast radius | Deterministic graph test suite |
| G3 | Decision governance | Risk/evidence router and approval workflow | Agents cannot mutate authoritative state |
| G4 | Interactive world | One shared state across maps, simulations and decisions | Mobile end-to-end user journey |
| G5 | Recovery | Counterfactual correction and rollback | Failure replay + authorized recovery |
| G6 | Computation efficiency | Rules first, targeted models, solver baselines | Latency/cost/model-call benchmarks |
| G7 | Jason/QIH research | Reversible encodings and equivalence certificates | Reproducible round-trip and baseline tests |
| G8 | Organization adapters | Franchise, education, community, operations | Each adapter passes common contract |
| G9 | Job applications | Kodland, Thinkverse, GoGuardian, CodeSquad, EnthuZiastic, STEAM K-12 | Truthful tailored demo and application materials |
| G10 | Public credibility | Documentation, accessibility, security and CI | Verified demo, no speculative performance claims |

## Architecture boundaries

```text
Organization worlds (Kodland, franchise network, centers, future domains)
                |
       Shared scenario and proposal contract
                |
APERTURE: dependency graph -> evidence gate -> decision router
                |                       |
       deterministic kernel       agents propose only
                |                       |
       authorization / human approval gate
                |
    versioned state + event ledger + replay
                |
Interactive views: world / graph / compare / timeline / proof
                |
Separate research sandbox: Jason-inspired representations / equivalence
```

## Delivery stages

### P0 — Inventory and integrity
- Enumerate existing source, branches, hosting, tests, data, integrations and security.
- Identify broken UI controls and mobile overflow.
- Establish baseline and no-regression policy; do not overwrite production.

### P1 — Working vertical slice (in progress)
- Shared `research/representation.mjs` model.
- `interactive-decision-universe.html` imports that model.
- Reversible encoding, calculation invariants and tests.
- CI execution and documented local run steps.
- **Still required:** real browser/iPhone interaction tests, mobile accessibility, persistent state, deployment verification.

### P2 — Governance and graph
- Typed proposal and versioned event contracts.
- Dependency cycle detection and downstream invalidation.
- Authority checks, audit trail and replayable decision ledger.
- Separate model proposals from authorized state writes.

### P3 — Simulation and efficiency
- Causal assumptions and sensitivity analysis explicitly labeled.
- Classical optimization baseline before specialized approaches.
- Model-call budgeting, cache, performance baselines.
- Scenario branches, rewind and compare.

### P4 — Interactive universe
- Shared state across 2D/3D or accessible fallback.
- All controls usable on iPhone; touch target, scroll and viewport tests.
- Progressive disclosure, one main navigation and undo.
- Export/import with schema migration and privacy controls.

### P5 — Adaptation and applications
- Reuse same kernel for franchise director, Kodland trials, district success and instruction.
- Generate truthful employer-specific demos, interview plans and 30/60/90-day plans.
- No real family/student data in public demos.

### P6 — Research frontier
- Compare representations using exact round-trip and operator equivalence tests.
- Document limitations, falsification conditions and computational baselines.
- Treat quantum-inspired claims as hypotheses unless independently verified.

## Decision rules

- **Integrity before intelligence.** No agent is allowed to grant itself authority.
- **Evidence before prediction.** Label simulated assumptions and confidence.
- **Least computation necessary.** Deterministic logic first; AI only when justified.
- **One model, multiple views.** No competing independent truth stores.
- **Ship small and verify.** Passing unit tests does not equal production readiness.
- **Preserve existing links.** Develop in branch; merge and deploy only after verification.

## Open risks and blockers

1. The default branch's sparse README does not describe the broader repository; complete inventory is pending.
2. Current simulator uses illustrative arithmetic, not validated causal inference.
3. The in-page ledger is not durable or tamper-evident.
4. The browser module import and mobile controls have not been verified in a real device session.
5. Public deployment, GitHub Pages branch configuration and external site integration remain unverified.

## Definition of done for a feature

A feature is done only when its behavior, dependencies, permissions, failure handling, tests, mobile behavior, and deployment status are all documented and checked.
