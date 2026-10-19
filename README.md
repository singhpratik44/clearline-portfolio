# Clearline — APERTURE Operating Intelligence

**Mission:** Make consequential organizational decisions explainable, testable, authorized, recoverable, and more efficient through one versioned operating model.

**[Live portfolio](https://singhpratik44.github.io/clearline-portfolio/)** · **[Interactive Decision Universe (development source)](./interactive-decision-universe.html)** · **[Architecture and goals](./docs/MASTER_PLAN.md)**

> Status: the interactive prototype is on the development branch, not confirmed deployed. It uses illustrative assumptions, not real employer data. Jason Padgett-inspired reversible representation work is experimental conventional computation, not quantum hardware or a demonstrated quantum advantage.

## One organized system

| Layer | Responsibility | Truth boundary |
|---|---|---|
| Clearline | Portfolio, methodology, organization-specific experiences | No invented outcomes |
| APERTURE | Universal decision/governance kernel | Canonical versioned state |
| Operating worlds | Franchise, center, education, staffing, growth, jobs | Explicit domain assumptions |
| Decision router | Rule → targeted AI → simulation → authorized human | Agents propose; never self-approve |
| Dependency graph | Prerequisites, critical path, blast radius | Reject invalid transitions |
| Evidence and ledger | Supporting facts, decisions, replay, rollback | Append-only durable storage is planned |
| Jason/QIH research | Reversible representations, equivalence and tests | Hypotheses separate from verified results |
| Interface | Interactive universe, scenario comparison, mobile | Same model across views |

## Try the prototype

Open `interactive-decision-universe.html` through a local static server, because its ES module import requires HTTP rather than `file://`. No API key or build step is required. Example: `python3 -m http.server 8000` from the repository root, then open `http://localhost:8000/interactive-decision-universe.html`.

Run the deterministic research tests with `node --test research/representation.test.mjs` (Node.js 20+). CI configuration is in `.github/workflows/clearline-validation.yml`.

## Current verified implementation scope

- Standalone illustrative trial-to-enrollment simulator with capacity, follow-up, conversion, revenue and three alternatives.
- Shared versioned state encoding/decoding, round-trip certificate, operational calculation invariants and automated tests.
- Decision log in current page memory, export to JSON, bounded undo for button-driven scenario actions.
- No production persistence, real-time provider connections, agent execution, quantum advantage, or formal verification of causal impact is claimed.

## Change discipline

1. Audit the existing implementation and preserve production.
2. Create an isolated branch and record assumptions.
3. Implement the smallest useful capability.
4. Test invariants, mobile interactions, regression and security boundaries.
5. Review evidence and human authorization before merging.
6. Record results and maintain a rollback path.

See [MASTER_PLAN](./docs/MASTER_PLAN.md) for the goal hierarchy, milestones, and acceptance criteria.
