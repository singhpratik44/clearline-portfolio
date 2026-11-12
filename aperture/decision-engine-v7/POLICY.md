# APERTURE Decision Engine v7 — Coordinated execution

This layer supplements, never replaces, aperture/METHODOLOGY.md, builds/registry.json and existing project-specific controls. Repository presence is not proof of active deployment, current customers, verified performance or running agents. Inventory is based on the repository tree on 2026-11-12; further candidates may exist outside this repo.

## Per-cycle algorithm
1. Read project registry, canonical methodology, last cycle and outstanding blockers.
2. Record an answer for each D01–D20 with evidence URI, timestamp, confidence 0–1, decision, risk, owner, status, metric baseline and expected impact. Unknown is an acceptable answer; fabricate nothing.
3. Score authorized candidate actions on impact, confidence, urgency, reversibility, cost and dependency readiness; do not use scores to override safety or approval gates.
4. Break chosen actions into observable subactions: inspect → change → test → independent verify → record. Batch read-only tasks; sequence dependent writes; stop on conflicts.
5. Append a new immutable cycle record, with before/after metrics and source commit/run IDs. Never overwrite earlier cycles. Compare outcomes at 7 days, 90 days and 1 year.
6. Release status: proposed → specified → implemented → tested → independently verified → piloting → operating. A successful CI test alone does not prove customer outcomes.

## Authorization gates
- G0 read-only research, local simulation and analysis: allowed.
- G1 reversible changes to this owned repo, tests, documentation and nonproduction demos: allowed within user direction; verify CI and deployment before claiming release.
- G2 production configuration, live checkout/delivery changes, user-data handling, and public claims: require scope-specific user authorization and rollback plan; no real purchase without approval.
- G3 outreach, applications, emails, social publishing, partner representation: require explicit audience/channel approval; existing CODE THE GAME authorization is capped at 100 verified qualified prospects, with deduplication and channel compliance, not a blanket authorization for other projects.
- G4 spending, trading, legal commitments, contract signature, access grants, deletion or irreversible changes: explicit approval for the exact action.
- All projects: protect minors, private data and access tokens; no secret-bearing URLs in Git, logs or reports; no fabricated outcomes or autonomous background activity claims.

## Shared infrastructure
Source registry + per-project append-only ledgers + decision schema + evidence references + approval records + CI status + shared mobile accessibility/security checks. Keep costs deterministic-first; escalate reasoning only for ambiguous, high-impact decisions. Never claim learning without comparing actual results.

## Cross-project priorities
P0 protect payment/access and privacy; P1 verify actual user journeys and current job/partner evidence; P2 consolidate shared navigation, evidence and accessibility; P3 measure real outcomes; P4 expand only after safeguards. For research, distinguish hypothesis, simulation, reproducible result and peer-reviewed evidence. For wellbeing and faith, avoid clinical or spiritual authority claims.
