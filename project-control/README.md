# APERTURE Project Control Plane — Import and architectural contract

## Imported source
- Public APERTURE homepage: https://singhpratik44.github.io/clearline-portfolio/
- 23 project cards listed on the homepage, captured 2026-11-14.
- Imported into `portfolio-import.json`: name, domain, homepage description, provenance, provisional path, stage, review requirements, empty dependency list.
- **Not a full audit of each project.** Several individual URLs were inaccessible to the public retrieval tool; do not infer their underlying implementations. Candidate paths must be verified before linking. The public homepage currently differs from the GitHub branch's homepage and may be from a different deployment revision.

## Control plane contract
A project has a stable ID, name, domain, owner, stage, scope, dependencies, acceptance tests and source provenance. All imported projects begin in an unapproved review state. Dependencies are **not guessed**: an operator must add them explicitly. The UI rejects self-dependencies, duplicate edges and dependency cycles.

Each mutation appends a numbered event with timestamp, project ID, action details, previous hash and SHA-256 hash. Events persist in the current browser via localStorage, can be exported, and can be reverified in-browser.

**Important limitation:** localStorage is not a server-backed durable ledger, cannot provide a trusted audit boundary, can be edited or deleted, and is not shared between devices. Browser persistence and export are a prototype of the event schema, not completion of the durable execution ledger requirement. No autonomous agents, scheduling, background tasks, payments or external publication run from this control plane.

## Next implementation gates
1. Audit all 23 source project pages and source files, verifying links and separating actual features from descriptions.
2. Build authenticated persistent project/event storage with server-side append-only writes, project-level authorization, backups and recovery.
3. Add task nodes, typed dependency edges, work breakdown, estimates, deadlines, critical path, agent capabilities, run budgets and idempotency keys.
4. Implement background worker queue with evidence collection and automated tests; require human approval for deployment, purchases and communications.
5. Link Build Studio proposals to projects, reviewed Stripe checkouts and verified fulfillment.
6. Run mobile and integration tests in an isolated preview before merging into production.

## Architecture lineage
The existing public Network Governance instrument already describes nodes, edges, gates, clocks, proposals, a canonical state and a realized ledger. Reuse and test these ideas rather than inventing a disconnected project manager: https://singhpratik44.github.io/clearline-portfolio/governance.html

## Release status
Feature branch: `feature/global-atlas-20261114`. Draft PR #56. No production deployment or verified phone test has been performed for this new page.

## Source audit — 2026-11-14
`source-audit.json` records direct GitHub source checks for 10 candidate paths. Nine existed; one guessed Gift Lab path did not. The existing `thinkverse-jason-rules.html` page title is District Partnership OS, so the provisional Jason Rules path in the import is wrong. The `enrollment.html` page is a thin loader and must be audited with its fetched dependencies. Do not use candidate paths as authoritative.

## Authorized worker and persistence boundaries
- `portfolio-import.json` is **persistent, version-controlled repository storage**, but the UI's local dependency edits are **not automatically synced** to it. The Git repository is the canonical *seed*, not yet a live project database.
- `worker.mjs` performs a deterministic, read-only registry and DAG audit, writes a report and returns nonzero on invalid graph state.
- `.github/workflows/aperture-project-audit.yml` defines a **manual workflow_dispatch** worker, not a recurring or autonomous background agent. GitHub Actions must be enabled and the workflow must be available on the repository default branch before it can be run through the usual Actions UI.
- Worker artifacts are retained by GitHub Actions according to repository retention policy. They are not a trusted append-only execution ledger.
- Production integration still requires authenticated server persistence, protected write API, append-only event store, queue, scoped agent runner, job status, approval service, mobile tests and rollout review.
- The isolated workflow has not been executed on GitHub; do not claim it passed.
