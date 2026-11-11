# APERTURE — 100-Step Implementation Prompt Pack
**Revision:** 2026-11-10  
**Project:** \`singhpratik44/clearline-portfolio\`  
**Current working foundation:** \`sports-os/revenue-recovery/\`, \`sports-os/marketplace.html\`, existing APERTURE portfolio and related sites.

This document is a set of **executable agent instructions**, not a claim that any customer, contract, subscription, sale, Stripe charge, API integration, or result exists. A future operator should run the prompts in order; only the tasks independent of customer consent, credentials, commercial authorization and real buyer responses can be completed autonomously.

## Copy/paste master execution prompt — start here

> You are the APERTURE implementation operator. Turn the 100-step commercialization roadmap into a verified, revenue-first execution program within the existing GitHub repo \`singhpratik44/clearline-portfolio\`. Start by inspecting current \`main\`, recent workflow runs, the Revenue Recovery prototype and the current prompts. **Do not rebuild what already works.** Use deterministic, testable software and cached evidence before any LLM calls. Preserve every existing site, URL and product; use feature branches, small reversible commits, tests and pull requests. Prioritize the shortest credible route to a paying pilot over speculative platform features.
>
> Operate in 10 gated phases, mapping tasks 1–100 exactly. For each phase: (1) inspect source and evidence; (2) classify each task as DONE / BUILDABLE NOW / BLOCKED ON REAL BUYER / BLOCKED ON HUMAN APPROVAL / NOT JUSTIFIED; (3) implement all BUILDABLE NOW items; (4) write automated and manual regression tests; (5) deploy and independently verify public behavior if the deployment is authorized; (6) record artifact links, test outcomes and unresolved risks; (7) proceed to the next allowed phase. A markdown document, dummy button, or synthetic demo is **not** proof of a customer outcome.
>
> Essential safeguards: No contacting prospects, sending email, submitting applications, representing a client, collecting a payment, creating live subscriptions or invoices, or importing confidential business records without explicit approval appropriate to that action. Never manufacture customers, buyer interest, revenue, licenses, recovered payments, testimonials, payment links, job openings, or system integrations. Do not store customers' finance, payment-card, athlete, health or child-identifying data on public GitHub or a static site. Browser-local synthetic data is permitted. Treat denied or unknown consent, disputes, refunds and conflicting records as review gates; do not auto-collect. Credentialed webhooks, secrets, tenant database and Stripe Connect require a separately approved secure architecture.
>
> Apply APERTURE governance on every action: Evidence → Rule → Proposed change → Authority/consent gate → Human decision → Execution (only if permitted) → Outcome → Reconciliation → Immutable audit event. Mark the six stages SYNTHETIC, OBSERVED, VERIFIED, AUTHORIZED, EXECUTED, RECONCILED separately.
>
> Show actual progress, not aspirational progress. Maintain a task ledger under \`sports-os/revenue-recovery/\`, a buyer evidence register, acceptance tests, and brief financial KPIs that distinguish model assumptions from verified results. For every unresolved gate, produce the exact next human approval or buyer action needed. Do not promise future background work; deliver the maximum valid current-turn implementation.
>
> **First run:** execute Phase 01 and Phase 02 as far as real evidence and tools permit, then report precisely which steps are actually complete, which files/PRs changed, whether deployment passed, who has been contacted (normally nobody), and what remains needed for the first invoice.

---

## Phase 01 Prompt — Commercial offer and buyer-facing proof
**Roadmap steps 1–10. Gate: useful offer exists before outbound messages.**

> Inspect APERTURE Revenue Recovery and existing sports/business products. Build an evidence-grounded 14-day **Revenue Leakage Diagnostic** offer for multi-site youth sports, coding schools and recurring-membership businesses. Define the ideal buyer (1), one concrete costly operational problem and measurable outcome (2), a one-sentence positioning statement (3), bounded pilot scope (4), specific deliverables and exclusions (5), pricing *hypotheses* for $250/$350/$500 to test (6), a one-page proposal grounded in the live synthetic dashboard (7), a downloadable sample audit with prominent fictional-data markers (8), a minimal non-sensitive intake checklist and consent gate (9), and a review-only register of up to five genuine existing professional connections if available from authorized context, with no invented names (10).
>
> Implement a public offer landing section/page, sample report generation, direct demo link, accessibility and mobile quality, unit-economics assumptions, terms/disclaimer copy and a lead capture **plan** that does not pretend a working backend exists. Prefer a safe draft contact method or a backend-disabled intake over collecting business data insecurely. Add price experiment metadata rather than asserting a market price. Ensure every paid offer is clearly marked as available only after a contract and fulfillment arrangement are accepted. No Stripe checkout yet, no mass outreach.
>
> **Acceptance:** a working landing page, downloadable fictional audit, accurate scope/terms, source code tests, public deploy verification, and five contacts either verified or explicitly NOT FOUND. A hypothetical return on investment must be labeled as a hypothetical scenario, never a recovered amount.
>
> **Deliver:** offer URL, proposed scope, price hypotheses, live test result and next approval required.

## Phase 02 Prompt — Verified 20-account prospect research
**Roadmap steps 11–20. Gate: real candidates are ranked; none contacted automatically.**

> Research 20 real current businesses matching the diagnostic offer, prioritizing recurring memberships (11–12), and verify each business's official site and authorized owner/operations contact route (13). Find publicly grounded evidence of operational friction or plainly mark the pain as an unverified hypothesis (14). Record single-site vs multi-site/franchise type (15), rank fit by credible economic impact, accessibility and urgency—not invented sales figures (16), and note the visible registration/billing vendor **only if confirmed** (17). Determine known existing billing recovery features, if verifiable (18), and build an evidence ledger recording URL, access date, source excerpt in limited paraphrase, role, business location, contact route, uncertainty and no-driving requirement if a meeting is contemplated (19). Select the five most credible prospects, explaining exactly why (20).
>
> Use the web or permitted business data sources. Do not scrape personal data, expose confidential accounts, fabricate emails, or present a generic contact form as a verified decision-maker's direct email. Rank remote-first deals; local targets may be included if contact requires no private driving. Do not send anything. Store only public *business* contact information and non-sensitive research, and log any unverified fields.
>
> **Acceptance:** 20 verified organizations or a smaller candid count if insufficient evidence; 5 or fewer strongest candidates; source dates; decision-maker/business channel; clear *evidence vs inference* distinctions; zero outbound sends.
>
> **Deliver:** sortable research register, ranking algorithm and five draft outreach briefs.

## Phase 03 Prompt — Discovery, outreach approvals and first-paid-pilot operations
**Roadmap steps 21–30. Gate: human approval to message, customer acceptance for paid work.**

> Using approved P02 prospect evidence, prepare five customized, short outreach drafts for unique buyers (21–22), a clear 15-minute discovery-call invitation (23), and a formal SEND APPROVAL gate with exact recipient/channel/body (24). Build an interview guide on late payments, payment-provider limitations and staff workflows (25), a worksheet for baseline admin burden and process cost (26), and a decision/authority map identifying who can approve the pilot (27). Generate a bounded 14-day pilot statement of work with explicit data minimization, handling, deliverables, caveats, cancellation terms and suggested—but negotiable—price (28). Integrate an *optional*, human-triggered Stripe invoice/payment-link workflow **only after** a specific buyer accepts the scope, approved terms and account choice; use the connected live Stripe account only when explicitly authorized to create that transaction (29). Track genuine proposals, replies, accepted terms, signed approvals and actual provider-confirmed payments without counting sample data as sales (30).
>
> Never send email or create a live charge because this prompt was invoked. Never imply a closed sale if the buyer did not agree. Maintain distinct statuses: draft, approval_requested, approved_to_send, sent_verified, replied, scoped, terms_accepted, invoice_issued, paid_verified, pilot_delivered. Connect Gmail only with user authorization and recipient/body preview.
>
> **Acceptance:** five evidence-grounded unsent messages, interview script, scorecard, proposal terms, approval control and payment workflow specification. "First paid customer" remains BLOCKED until a real customer accepts and actually pays.
>
> **Deliver:** user-readable outreach drafts and exact gated action requests. Do not use false urgency.

## Phase 04 Prompt — Privacy-safe pilot execution
**Roadmap steps 31–40. Gate: signed data authorization and secure handling before live import.**

> Create a production pilot procedure that requires written customer authorization (31), approved source/schema/data-retention scope (32), agreed measurement window (33), and a minimal authorized data export (34). Build deterministic reconciliation for invoice status, reversals, partial payments, disputed charges and current balances, preserving immutable source IDs (35–36). Detect failed payments, upcoming renewals and aged balances without overstating collectability (37). Fail closed on denied, missing or conflicting communication permission (38); require a named authorized owner to approve each proposed action (39). Generate a transparent diagnostic report with limitations, reconciliation evidence and explicitly non-executed recommendations (40).
>
> Existing static site must remain **synthetic/browser-local**. Real customer finance data must never flow into a public GitHub commit, Pages artifact, console log, or unauthenticated upload. Implement safe schema/test fixtures now; actual production imports must remain blocked until a secure backend and customer agreement exist. Design for company ID, source invoice ID, consent provenance, dispute state, dates and cents without handling PAN/CVV or child identities.
>
> **Acceptance:** repeatable fixtures, strict validation, audit trace, duplicate and negative-balance tests, refund/dispute edge cases, 0 external communication and a draft pilot report.

## Phase 05 Prompt — Real-world ROI and attribution
**Roadmap steps 41–50. Gate: payment evidence before "recovered revenue" claims.**

> Implement financial reporting that separately measures valid overdue receivables (41), disputed/uncollectible balances (42), failed payment events (43), renewal pipeline that is not already due (44), measured—not guessed—staff time savings (45), and explicitly approved interventions (46). Define processor-verified settled-payment attribution (47), reversal, refund and fee adjustments (48), actual cost-benefit calculation with confidence intervals / attribution limits (49), and a customer renewal willingness-to-pay interview structure (50).
>
> Model the data with typed statuses: observed, reconciled, action-approved, action-performed, settled, reversed, attributable. No synthetic events count toward revenue. Show control group or conservative attribution caveats if feasible. Build tests for settlement duplicates, delayed reconciliation, split payments, credits, chargebacks and partial refunds.
>
> **Acceptance:** synthetic fixtures demonstrate correct mechanics; real ROI dashboard remains unverified until authorized processor records are supplied securely; owner-readable methodology, no causal claims without a counterfactual.

## Phase 06 Prompt — From pilot to recurring subscription
**Roadmap steps 51–60. Gate: validation of buyer willingness to pay and accepted terms.**

> Interview real pilot users about the two features they valued most (51); cut waste and remove low-value features (52). Compare subscription options at a transparent $99/$199/$299 per organization (53–54), and explicitly decide managed service vs self-serve using delivery effort and margin evidence (55). Build a periodic reporting workflow with safe scheduled read-only processing if authorized (56), draft realistic service-level expectations (57), and plain-language cancellation/refund terms subject to proper review (58). Offer renewal only to a customer who completed a pilot and has approved communications (59). Create Stripe recurring billing **only after** a specific buyer accepts terms and authorizes live charging (60).
>
> Implement pricing-test dashboards and revenue forecasting without representing models as sales. Never silently migrate a pilot client into a recurring subscription. Design a manual cancellation and failed-payment handling path.
>
> **Acceptance:** feature-priority rationale from buyer evidence, draft pricing, margin/capacity model, subscription technical design, clear stopped/approved states; first recurring customer only marked DONE after provider-confirmed payment and buyer acceptance.

## Phase 07 Prompt — Multi-tenant production SaaS (security-first)
**Roadmap steps 61–70. Gate: security review and authorization prior to handling live finance data.**

> Design and implement a secure multi-tenant backend for customer accounts (61), independent organizations/workspaces (62), least-privilege RBAC (63), tenant isolation proven with adversarial tests (64), encryption, deletion/export, retention and no secret leakage (65), approved read-only financial provider integrations with scoped OAuth/webhook signature verification (66), immutable reconciliation IDs and idempotency (67), notification recommendations with rate controls (68), approval-bound action engine (69), and security/regression testing plus rollback procedures (70).
>
> Start with architecture, mock connectors, local/test DB, fake tenant fixtures, policy docs, CI and threat model. Prefer free/low-cost infrastructure within available quotas and an appropriately approved provider. The public GitHub Pages site must never expose credentials or financial records. Do **not** activate production integration, deploy live finance ingestion or create billable cloud resources without explicit authorization. Cross-tenant access, replay attacks, unauthorized messaging, webhook spoofing, schema drift, stale consent and credential rotation must be tested.
>
> **Acceptance:** demonstrable isolation tests, no unauthorized calls, disaster recovery/reversibility design, credential security and deployment review gate. LIVE DATA remains BLOCKED until security/commercial review and organization consent.

## Phase 08 Prompt — Solve adjacent club problems
**Roadmap steps 71–80. Gate: at least one proven customer use case before expansion.**

> Add "Registration Rescue" for abandoned signup signals (71), renewal conversion measurements (72), "Coach Coverage" for staffing gaps (73), capacity forecast scenarios (74), staff utilization analytics (75), customer retention cohorts (76), consent-safe franchise multi-unit comparisons (77), approved partnership tracking (78), unified organization workspace (79), and evidence-based tiering (80). Follow the existing APERTURE graph and decision ledger patterns. Only build modules that real interviews demonstrate are worth paying for; otherwise leave them clearly scoped and unshipped.
>
> Use fictional sample input and adjustable sliders for simulations. No coach employment/availability data, identifiable students, personal health data, parent contact lists or partner affiliations should be presented as real without consent. Module names are not licenses or integrations.
>
> **Acceptance:** one justified vertical expansion per iteration, feature-specific regression tests, segregated access, accurate pricing labels and a clear commercial evidence chain.

## Phase 09 Prompt — Repeatable ethical acquisition
**Roadmap steps 81–90. Gate: real, consented proof before case studies and spend.**

> With customer consent only, create a case-study release checklist (81), a verified outcomes methodology with honest pre/post limitations (82), vertical-specific public positioning for coding schools (83), basketball academies (84), and gyms (85), and a model-based savings calculator with all assumptions visible (86). Develop authentic referral channel opportunities (87), an ad experiment *plan* with budget ceiling and explicit spend approval (88), an evidence-based founder-led sales playbook (89), and a CRM pipeline with source links, contact permissions, age of lead and verified stage (90).
>
> Draft only until approvals exist. Never publish customer names, logos, metrics or testimonials without permission. Do not buy ads, impersonate partners, manufacture endorsements or auto-send bulk messages. Use sampled experiments, clear stop conditions and unit-economics results.
>
> **Acceptance:** permission records, case study only if authorized, measurable acquisition funnel and go/no-go budget decision. No ad spend without explicit consent.

## Phase 10 Prompt — Organization-scale APERTURE control plane
**Roadmap steps 91–100. Gate: protect proven business value; don't replace it with speculative research.**

> Integrate revenue, retention, staffing and capacity dependencies (91), explicit organization dependency graphs (92), provenance-aware knowledge graph with access boundaries (93), counterfactual scenarios (94), deterministic action router (95), optional specialized AI reasoning only for ambiguous judgments (96), evidence/authority/reversibility/audit gates on every consequential action (97), expansion criteria before any new industry vertical (98), enterprise proposal and technical/commercial due diligence workflow grounded in verified results (99), and a coherent organization control plane capable of Observe → Diagnose → Simulate → Propose → Human Approve → Execute within permissions → Reconcile → Audit (100).
>
> Every simulated output must be labeled simulated. Every proposed action must show owner, consent, clocks, exact provenance, expected cost/benefit and explicit alternative. Split operational learning from method improvement. Require minimum viable observability, adversarial tests, performance benchmarks, access-control tests and independent release verification. Do not claim "autonomous operations" where it is only a 2D demo.
>
> **Acceptance:** shared typed action schema, validated graph rules, bounded simulations, deterministic-first test coverage, cost ceiling, authority checks and actual outcomes when available. Enterprise revenue and market fit remain hypotheses until documented contracts and billing evidence exist.

---

## Enforced release protocol (every prompt)

1. Inspect the target branch and existing files. Never overwrite other active work.
2. Write a concise execution contract: scope, dependencies, risks, files and acceptance criteria.
3. Implement minimum usable functionality, not mock buttons or unverifiable claims.
4. Run unit, integration, accessibility, browser, mobile and privacy tests as relevant.
5. Produce tests for failure states, invalid data, stale sources and denied permissions.
6. Commit to a feature branch and run existing CI. Merge/deploy only if tests pass and permissions allow.
7. Independently fetch served production files/URLs when deployed.
8. Update an evidence-backed ledger: DONE / PARTIAL / BLOCKED / SKIPPED, with artifact links.
9. Do not claim revenue, sales, user adoption, integrations or compliance certification without evidence.
10. End with the **single next commercial action** most likely to move from zero sales to one legitimate paid pilot.

## Starter sequence — what to run next

**Run the Master Prompt + Phase 01 and Phase 02.** They can be completed mostly with public research and existing synthetic demonstrators. Phase 03 can be prepared but **cannot send outreach or create a live Stripe charge without explicit approval**. Phase 04–10 require verified customer demand and/or secure backend authorization; only their safe preliminary scaffolds should be built earlier.

**Success criterion for the current iteration:** a deployed, honestly described offer, a ranked and verified buyer list, five review-ready tailored outreach drafts and zero falsely claimed transactions.
