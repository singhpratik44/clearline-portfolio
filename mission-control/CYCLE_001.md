# APERTURE Intelligence Engine v7 — Cycle 001
Date: 2026-11-12. Scope: Meeting Command Center. Priority: build. Budget: minimal.
Status: Implementation committed; CI and public release must be verified independently.
This document records decisions and actual implementation, not hidden chain-of-thought.

## Twenty decisions and answers
| # | Decision | Recorded answer | Evidence |
|---|---|---|---|
| 1 | Intent | Make meeting-to-action execution measurable and inspectable. | User instruction |
| 2 | Context | Existing Causal Loom, local vault, project graph, meeting prep and Google read-only connector. | Repository files |
| 3 | Assumptions | Local statuses and notes are not independently verified. | Architecture |
| 4 | Constraints | Minimal spend, no external writes or unapproved actions. | User instruction |
| 5 | Problem | Decision traceability is more urgent than adding another dashboard. | Design hypothesis |
| 6 | Research | Existing ten-study curated register; no claim of fresh automated ingestion. | research.json |
| 7 | Alternatives | A dashboard expansion; B decision-cycle ledger; C external automation. | Design comparison |
| 8 | Innovation | Turn the causal graph into a repeatable evidence-status decision cycle. | Design hypothesis |
| 9 | Systems | Reusable ledger architecture can later serve other APERTURE modules. | Code modularity |
| 10 | Experience | Progressive disclosure: concise summary followed by 20 inspectable entries. | UI implementation |
| 11 | Priority | Choose B; immediate verifiability without new credentials. | Feasibility |
| 12 | Decomposition | Pure engine, visible UI, export/compare, unit tests, browser QA, release gate. | Commit trace |
| 13 | Automation | Deterministic metrics and diffs; zero model calls in browser. | decision-cycle.js |
| 14 | Security | No external actions, credential writes, autonomous sync, or implicit approvals. | Static code boundary |
| 15 | Implementation | Added 20-decision engine and interactive command-center module. | Repository commits |
| 16 | Verification | Added deterministic tests and browser checks; CI outcome separately tracked. | tests/mission-control* |
| 17 | Measurement | Tasks, done, blocked, overdue, pending decisions, sourced tasks. | Metrics schema |
| 18 | Learning | Cycle 001 establishes baseline only; no claimed improvement yet. | No prior observed snapshot |
| 19 | Futures | 30d blockers; 90d repeatability; 1y consented integrations; 5y portability. | Scenarios |
| 20 | Improvement | Verify actual user task outcomes and evidence quality in Cycle 002. | Experiment |

## Alternatives and tradeoffs
- **A: Dashboard expansion — deferred.** Low cost, but doesn't improve provenance or learning.
- **B: Decision-cycle ledger — selected.** Reuses existing project data, testable, local, exportable.
- **C: External calendar/task automation — deferred.** Requires explicit authorization, secure identities, durable deduplication and a production trust boundary.

## Internal subactions actually attempted
1. Inspected current GitHub implementation and CI configuration.
2. Created `mission-control/decision-cycle.js`: twenty concise evidence-status decisions, metrics, comparison deltas, three alternatives, five subaction statuses, four future horizons.
3. Added command-center section and `decision-ui.js` to run cycles, inspect all answers, import a prior cycle and export the current snapshot.
4. Added deterministic unit tests and browser coverage for cycle generation and export.
5. Added CI release checks requiring deployed engine assets.
6. Left provider credentials, user calendar, external messages, money and approvals unchanged.

## Verification and limits
Tests are designed to assert exactly twenty entries, four horizons, no previous-cycle learning claim, explicit no-external-action boundary, and metric delta after a controlled synthetic task change. Browser QA asserts 20 entries and export on mobile and desktop.
**No real operational outcome has been measured yet.** A static export is not an append-only server audit log. Imported snapshots are untrusted user-provided data and require review. Future-horizon statements are scenarios, not predictions.

## Future scenarios
| Horizon | Opportunity | Failure mode | Validation |
|---|---|---|---|
| 30 days | Close verified task blockers and improve meeting prep | False local status data | Review evidence and owner signoff |
| 90 days | Compare repeated decision cycles | Goodhart's law / metric gaming | Independent outcome samples |
| 1 year | Provider-linked decision provenance | Credential leakage, identity mismatches | Tenant isolation, provider-ID dedup and security audit |
| 5 years | Portable, interoperable organizational memory | Governance drift, vendor lock-in | Open export schemas, independent oversight |

## Next cycle acceptance
Import Cycle 001 export, update real authorized workspace records, run Cycle 002, compare the metric deltas, and attach verified task completion evidence. Never claim learning from a metric change alone.
