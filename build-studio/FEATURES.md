# APERTURE ∞ — Internal Feature Registry

Updated: 2026-11-14. Status: feature-branch implementation; not verified in production.

## Build Studio — standalone commercial product
- [x] Standalone `build-studio/index.html` interactive configurator, selectable service packages and feature-based estimate.
- [x] APERTURE itself used as the initial example in the studio.
- [x] Desktop and mobile navigation on the feature branch.
- [x] Preliminary quote and review workflow; no unauthorized live checkout.
- [ ] Confirm final scope, prices, tax/refund terms and delivery promises.
- [ ] Locate or create reviewed Stripe products and payment links, test actual redirect and payment confirmation.
- [ ] Verify fulfillment, receipt, customer handoff and production mobile QA.
- [ ] Publish only after review and explicit approval.

## Internal feature 01 — Save every building method
**Implemented locally in browser, not cloud-synced.**
- Each Save produces a timestamped method revision with name, purpose, package, complexity and features.
- Reopen earlier revisions; export/import JSON backup.
- Local storage is device-specific and may be cleared; no customer account, database or remote persistence is implied.
- Future: authenticated server-side version history, audit trail, comparison, rollback, and per-client access control.
- Acceptance: independent projects retain separate histories; changes can be restored without affecting existing builds.

## Internal feature 02 — Build on each method in the background
**Queue interface implemented; unattended execution NOT implemented.**
- A user can append timestamped improvement ideas to a local queue.
- This is a backlog only. No worker, cloud scheduler, asynchronous execution, or AI background processing exists.
- Future implementation: authorized server-side job queue, scoped agent permissions, scheduled CI workers, budget/time limits, idempotency, dependency graph, evidence snapshots, tests, and approval gates before publishing or spending.
- Acceptance: each run records source version, proposed change, tests, diff, outcome, spend and rollback; never claims completion before verification.
- No automatic messages, payments, data collection or deployment.

## Commercial packages — illustrative, pending review
| Package | Base price | Proposed deliverable |
|---|---:|---|
| AI Blueprint | $49 | Scope and feature architecture |
| Launch Sprint | $500 | One focused prototype |
| Business Builder | $2,500 | Connected customer workflows |
| Intelligence Platform | $10,000 | Multi-system custom build |

Optional feature add-ons and complexity multipliers are only pricing simulations. They are not active Stripe prices. Review the commercial contract before offering them to customers.

## Parallel workstreams
1. Revenue: checkout and reliable fulfillment.
2. Education: coding service and learning evidence.
3. Sports: athlete experience and coaching tools.
4. Network: Atlas source validation and privacy.
5. Build Studio: customer preview and saved methods.
6. Governance: tests, ledger and permissioned execution.

Parallel development is acceptable; merge and release require individual tests and integrated verification.

## Deployment status
GitHub branch: `feature/global-atlas-20261114`. Draft PR #56. Production unchanged. Previous Vercel preview attempt failed because the deployment account required a verified domain; do not claim deployment. A separate live browser/mobile test has not succeeded.
