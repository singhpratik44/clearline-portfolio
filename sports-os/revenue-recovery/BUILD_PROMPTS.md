# APERTURE — Revenue Recovery Build Prompts & Execution Gates

These prompts are execution specifications, not evidence that subsequent milestones are completed. APERTURE must never fabricate customer data, claim recovered funds, send collection notices automatically, or store private financial records in public GitHub/GitHub Pages.

## P0 — Production-grade demonstration (implemented in V1)

**Build prompt**

> Inspect the current Clearline repository and preserve every existing APERTURE page. Deliver a functional, mobile-responsive Revenue Recovery workspace in \`sports-os/revenue-recovery/\` backed by deterministic logic and a fictional membership ledger. Parse only a tightly controlled seven-column CSV locally, cap records and bytes, reject identity/contact data, detect overdue balances, failed payments, upcoming renewals, duplicates, disputes and communication permission blockers. Show audit evidence, source timestamps, financial indicators, signal queue, neutral drafts, local human-reviewed decisions, exportable review queues and decision ledgers. No external service calls or storage. Write testable pure functions and regression tests. Gate every proposed collection action; do not send messages, charge cards, or claim recovered revenue. Include a clear non-production disclosure. Verify the Pages build and served HTML/JS. Do not disturb other APERTURE products.

**Acceptance**: built and source-tested, live release verification succeeds; no private-data exfiltration paths; deterministic calculations tested; all actions local only.

## P1 — Buyer evidence and offer discovery (next)

> Find 20 independently verified current sports clubs, youth enrichment franchises or membership businesses with explicit, public operational needs that APERTURE might solve. Identify owner/decision-maker only from legitimate public business contact channels. Separate evidence of needs from guesses, provide source URLs/dates, and produce a ranked outreach review sheet with value hypothesis, suggested demo and one measurable success criterion. Prioritize remote-ready operators and multi-site businesses. No scraping personal customer records, no claims of vendor affiliation. Draft personalized, specific outreach; never send without explicit approval. Stop if proof is insufficient. The output should enable five structured discovery conversations rather than speculative mass outreach.

**Acceptance**: source-verified list, one-off review queue, customer interviews, discovery notes and decision to proceed/pivot.

## P2 — First paid, bounded pilot

> Define a 14-day or 30-day fixed-scope membership revenue diagnostic that a club owner can authorize. Specify source system read-only exports, legal and security boundary, data minimization, owner approvals, payout/fee assumptions, deliverables, reporting and cancellation terms. Offer a sample with synthetic data and a gated manual statement of work. Do not promise a recovery outcome. Price only after testing willingness to pay. Use Stripe payment links only after the owner and merchant authorize the terms, customer delivery method and account. Do not launch recurring billing for a nonfunctional product.

**Acceptance**: signed terms, approved real client, business data handling agreement where needed, real paid invoice, actual delivered report. No fake proof.

## P3 — Secure commercial integration

> After explicit organization consent and architecture review, design a backend integrating an authorized billing provider through least-privilege OAuth and verified webhooks. All client data stays server-side with tenant isolation, deletion/export rights, key management, retention limits, role-based permissions, dispute/refund handling, least-privilege read scopes and security logging. Transactions are reconciled using immutable provider IDs. Human approval is mandatory before notices, retries, payment modifications or follow-ups. Test adversarial cases: duplicates, chargebacks, unauthorized tenants, stale invoices, revoked consent, partial refunds and webhook replay. Public pages must never contain sensitive financial data or API keys. Preserve a deterministic fallback if APIs fail.

**Acceptance**: independent security review, penetration tests, policy and contractual approvals, full audit trail and operational alerting. Do not deploy while any gate is unresolved.

## P4 — Proof-driven sales

> With 1–3 consenting pilots, track verified baseline, attempted interventions, owner-approved actions, actual settled payments and confidence limits. Attribute revenue only from processor-confirmed settled payments net of reversals and fees. Publish anonymized case studies only after written authorization. Compare measured recovered value to service costs; choose fixed fee versus subscription based on real renewal, not assumptions. Update the offer only on verified customer evidence.

**Acceptance**: documented revenue attribution, retention and consent, buyer-approved testimonial or explicit decision not to publish.

## Global execution rules
- Deterministic processing first; no LLM needed for accounting or eligibility decisions.
- Truth statuses: \`synthetic\`, \`unverified\`, \`verified\`, \`authorized\`, \`executed\`, \`reconciled\`; never silently promote states.
- Every proposed action includes evidence, owner, authority, clock, expected impact, reversibility and outcome.
- External customer outreach requires prior human approval.
- No collection activity toward any individual from synthetic records.
- Never create a live charge, subscription, outbound notice, or data integration before authorization.
- For each task: Inspect → Diagnose → Implement → Test → Deploy → Verify → Record.
