# Gift Finder → Paid Gift Experiences | Revenue Operating Plan
**Date:** 2026-11-12 · **Owner:** Clearline / APERTURE · **Status:** approved product strategy, not a claim of launch.

## Decision
**Keep Gift Finder free**. Monetize meaningful value after a recipient finds an idea: interactive gift reveals, downloadable keepsakes, multi-recipient packs, and verified physical products. Never put an unexpected paywall on basic discovery, and never imply that a digital greeting includes a shipped gift.

## Offer ladder (proposed prices; NOT yet active)
| Stage | Product | Customer pays | Delivery | Gate |
| --- | --- | ---: | --- | --- |
| Discover | Recipient/budget/interest-based gift finder | $0 | 3 idea concepts and sample note | live today |
| Starter | Personal gift reveal | $2.99 one-time | Personalized shareable interactive card, with sender/recipient name, message, theme | server-verified purchase before private reveal |
| Core | Gift Story | $7.99 one-time | Reveal + illustrated original story + printable certificate + private share link | payment and asset delivery verified |
| Bundle | Gift Collection | $14.99 one-time | 3 gift experiences to send to 3 recipients | entitlement counts verified |
| Teams | 10 Gift Pack | $39 one-time | 10 gifts, team branding and recipient-ready messages | batch delivery and support verified |
| Services | Custom business gifting campaign | $250 deposit toward $500+ scoped service | Manual deliverable under signed scope | existing verified Stripe service flow, separate from gift checkout |
| Merchant referrals | Real physical gifts | merchant's actual price | merchant handles shipping/returns | only approved affiliate program, disclosures, tracked referrals |

Do not promise AI illustration, printable certificates, unlimited redemptions, or merchant shipping until implemented and verified. No auto-renewal or subscription at launch.

## Why this is smarter
- Free discovery builds SEO, plugin tool invocations and trust, while an actual gift recipient has a reason to pay for a *memorable reveal*.
- At $2.99, Stripe's hypothetical US online card fee of 2.9% + $0.30 consumes ~$0.39, ~13% of gross. $7.99 improves unit economics. Actual account rates may differ.
- The $7.99 product should be the primary CTA; $2.99 is a low-friction entry, $14.99 is the upsell. Do not put a payment link on a feature that cannot be delivered.
- Physical gift affiliate monetization is a separate merchant program, not a payment collected by Clearline.

## Checkout and entitlements (critical path)
1. Audit 88 existing live Stripe payment links and products for duplicate gift SKUs; reuse only when exact entitlement, amount, delivery and tax handling match. Never repurpose an unrelated existing product.
2. Confirm tax registrations/settings and digital product treatment. Do not assume all US digital goods are tax-exempt.
3. Create dedicated test-mode products/prices: `gift-reveal-v1`, `gift-story-v1`, `gift-collection-3-v1`, `team-gifts-10-v1`; hosted Stripe Checkout. No live checkout before test success.
4. User chooses a gift and pays. Store only a server-side opaque `draft_id` and minimal non-sensitive content; never put the message into Stripe metadata or payment descriptions.
5. Create Checkout Session on backend using fixed allowlisted SKU/price IDs. Reject client-controlled prices. Set `client_reference_id` to opaque draft ID. Use Stripe-hosted checkout, allow applicable payment methods, handle cancel.
6. Verify Stripe-signed `checkout.session.completed` webhook and, for delayed methods, `checkout.session.async_payment_succeeded`; retrieve Checkout Session server-side as needed. Confirm `payment_status=paid`, correct product, amount/currency and livemode.
7. Persist idempotent entitlements and purchase records in a durable database (e.g. Render Postgres). Enforce per-purchase redemption limits and prevent duplicate fulfillment.
8. On success page, redeem through backend entitlement lookup; no success based solely on `session_id` query string, client flag, or return redirect. Use signed short-lived recipient link tokens, separate from purchaser access.
9. Deliver the exact purchased content. Recipient can open the gift without paying. This is a paid gift **from the giver**, not a paywall for the recipient.
10. Handle refund/chargeback revocation where appropriate; implement expiration, support and re-send. Keep gift contents private and deletable.
11. Test: success, cancel, abandoned, webhook replay, wrong SKU, modified price, forged session, refund, link forwarding, duplicate redemption, mobile slow network, and zero-charge attempts.
12. Only then activate live SKUs and publish purchase CTAs.

## Funnel events and measurable revenue
- `finder_opened` → `finder_completed` → `gift_preview_opened` → `checkout_started` → `payment_succeeded` → `gift_delivered` → `gift_opened` → `next_gift_created`.
- Never count redirect visits as sales. Revenue comes from Stripe paid charges, less refunds, fees, taxes, and direct costs.
- Attribution: per-campaign UTM or non-identifying campaign code; do not track private greeting contents.
- Dashboard: visits, free plans, checkout starts, completed purchases, paid conversion rate, AOV, gross receipts, refunds, net after payment fees, fulfillment cost, net contribution, customer support incidents.

## Scenario calculator (NOT actual income)
Assumptions: 1,000 unique monthly finder visitors; 50% complete a gift plan; 10% of completers purchase = 50 orders; product mix 20% at $2.99, 60% at $7.99, 20% at $14.99.
- AOV = $8.39; gross = **$419.50/month**.
- Illustrative card fees at 2.9% + $0.30 = ~$27.17; after card fees **~$392.33**, before other costs, tax and refunds.
- Sensitivity with same AOV: 10 orders = $83.90; 100 orders = $839; 500 orders = $4,195.
- These are modeled assumptions, not observed traffic, conversions or forecasts.

## Go-to-market
**Phase 0, now:** Keep free Finder working; remove any claim that paid gifts are already available. Add truthful coming-soon preview only after feature scope is frozen. Preserve existing gift-lab links and don't mix unrelated checkout.
**Phase 1, build:** Backend checkout, durable entitlements, recipient delivery, tests. Launch **one** SKU (Gift Story at $7.99) rather than four unfinished SKUs.
**Phase 2, prove:** 10 opt-in users test free finder; run authorized test-mode payments; one controlled live purchase after legal/tax and Stripe verification; check actual delivery and refund flow.
**Phase 3, distribute:** Public site and custom MCP app; gift-related search landing pages; 5-10 permissioned creator or store partnerships; QR displays; opt-in sharing, no unsolicited SMS. Measure traffic and completed paid deliveries.
**Phase 4, expand:** Starter and 3-pack only if paid conversion and support are acceptable. Add approved merchant affiliate catalog after stock, price and disclosures are real.
**Phase 5, B2B:** Offer 10-pack and custom gifting services with clear turnaround, approvals, rights and support.

## Decision gates
- Do not activate live checkout if fulfillment is incomplete.
- No fabricated order volume, rankings, product stock, commission or public ChatGPT directory approval.
- Do not contact people or publish campaigns without appropriate permission.
- The owner approves pricing, tax configuration and first live test before taking real payments.
- Maintain free discovery while experimenting with premium conversion.

## Current evidence and blockers
- Stripe Clearline Code is live. Stripe lists 88 payment links, many for a separate APERTURE Gift Lab; these are **not** automatically a valid Gift Finder purchase entitlement.
- Gift Finder's current MCP tool and website create free suggestions and a free greeting URL; they do not enforce a paid entitlement.
- No verified Gift Finder purchases or gift-specific revenue. Previous two $0.50 successful payments cannot be attributed to Gift Finder.
- Public ChatGPT directory approval and rank are not verified.
- **Next action:** audit exact matching Stripe gift SKUs and their fulfillment, implement a $7.99 Gift Story test-mode checkout with server-verified access and test purchase; only then switch on live sales.
