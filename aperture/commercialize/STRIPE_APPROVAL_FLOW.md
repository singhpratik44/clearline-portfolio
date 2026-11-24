# APERTURE Workflow Sprint — Stripe integration preparation (not for publication)

Verified against connected Stripe **Clearline Code** live account on 2026-11-20. Read-only inspection only. No Stripe mutations made.

## Existing catalog — do not duplicate
- Existing product: `prod_VcGcDUsQnwL8Gv`, **APERTURE — 48-Hour AI Workflow Sprint Kickoff Deposit**
- Existing one-time price: `price_1Ub25gRuy3ohymOHaL5M9ALO`, **USD 250.00**
- Existing payment link: `plink_1Ub25mRuy3ohymOHtzvHngbS`, **already active in Stripe before this change**
- Product terms: **USD 500 total**, **USD 250 deposit**, **USD 250 balance due upon delivery** under agreed scope.

**Important:** Existing active Stripe link is not linked or displayed on the new APERTURE commercial landing page. Do not publish or send it to customers until scope, cancellation/refund terms, availability, and customer approval are verified. Do not claim a new $500 full-payment product/link exists.

## Manual approval flow
1. Customer submits inquiry using commercial page (currently opens their own email client; no server-side lead collection).
2. Operator reviews the request, confirms fixed scope, deliverables, timeline, payment milestones, privacy constraints and refund terms.
3. Operator sends a written proposal for customer approval. Record approval and versioned scope outside the public website.
4. **Only after both parties approve**, operator may privately share the already-existing Stripe $250 deposit link. The public site must never auto-expose it before approval.
5. Independently confirm payment in the Stripe account, matching amount, currency, customer and relevant transaction. Do not trust redirect alone.
6. Deliver the scoped prototype and evidence-backed handoff. Invoice/collect the remaining $250 only under the agreed terms and verified authorized payment process.
7. Record acceptance, support, refund/chargeback handling, and closure.

## Production requirements
- Verify the existing payment link's line items, price, terms, tax settings, and after-payment behavior before sending it.
- Clarify whether a 48-hour sprint means elapsed time or business hours, when the clock starts, and what constitutes acceptance.
- Decide whether Stripe Tax should apply; confirm registrations and tax treatment before enabling new checkout.
- Configure a permissioned lead store and authenticated operator review; browser localStorage is not an operational CRM.
- Add payment reconciliation via server-side Stripe API/webhooks with idempotency and signature validation if automated fulfillment is introduced.
- Keep all Stripe secret keys server-side. No automatic charges or order placement.
- Require explicit owner approval before merging, deployment, or new live payment-link activation.

## CI verification
PR #67 had a failing APERTURE commercial verification job: 11/12 passed, one static test incorrectly expected `function esc(` instead of the actual arrow function `const esc=s=>`. Corrected the assertion on the feature branch; await fresh CI result. Existing unrelated site-integrity and CODE THE GAME checks also failed on the prior commit and require independent diagnosis.
