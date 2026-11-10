# APERTURE Gift Lab — Fulfillment and Physical Products Release Gate

**Status (2026-11-10):** 69 live-mode Stripe products and payment links exist. The public storefront, printable activity library, and 17-product sports storefront are implemented. The public print URLs are **not paywall protected**. Do not represent this release as securely delivered digital assets or as an active physical print-on-demand operation.

## What already works

- 54 original printable activity books, 434 activities, 15 mixed bundles, 69 purchasable configurations.
- Adult-directed purchases and Stripe-hosted payment links.
- Browser-based personalized covers, print-to-PDF, award certificates and optional local print-shop preparation.
- Youth-safety and independent-organization wording on sports products. No license to NBA/other leagues implied.
- A fail-closed, unit-tested Stripe Checkout Session verification module under `gifts/fulfillment/`.
- An entitlement allowlist linking exactly 69 Stripe Payment Link IDs to purchased SKUs and bundles.

## Private delivery is not yet activated

GitHub Pages is a **public static host**. The workbook source and historical commits can be accessed without paying, so simply hiding URLs is not adequate security. Public source history also cannot be made private by deleting a file in a later commit.

A dedicated server-side project, private content packaging, and a server credential are prerequisites. Publicly committed historical books cannot become secret retroactively:

1. Create a **separate private deployment** (Vercel or equivalent) for `gifts/fulfillment/`. Vercel denied project creation in both team and personal scope (403). The portable Node service and Render Blueprint are prepared, but installation/connection of the suggested Render plugin and permitted deployment are not yet complete.
2. Set `STRIPE_SECRET_KEY` on the server only using the provider's secure environment-variable settings. Never send this key by email or put it in GitHub, client JavaScript, public logs or ChatGPT.
3. Package original printable HTML workbooks privately as `private-content/<SKU>.html`, with names matching the checked-in `BUNDLE_BOOKS` and single-SKU entitlement allowlist. Make sure those files cannot be fetched directly as public assets. To make already-published workbooks genuinely exclusive, publish sufficiently revised premium assets that have **not** been placed in a public repository or Git history.
4. Deploy and run `node --test tests/gift-fulfillment.test.mjs`, confirm unauthorized request → 400/403 and missing credential/private content → 503, then test a legitimate paid Checkout Session with the right account. No real customer details in logs.
5. **Only after successful proof**, change each Stripe Payment Link after-completion destination to `https://<private-fulfillment-domain>/api/redeem?session_id={CHECKOUT_SESSION_ID}`. Keep the existing destinations until the verified service is ready to avoid breaking paying customers. Stripe replacements must be tested per product and bundle.
6. Add a robust post-purchase recovery and receipt support flow before marketing a large batch of paid units. A session ID in a URL is a bearer credential, so it must be treated as private and not sent to third-party analytics.

The prepared `gifts/fulfillment/api/redeem.mjs` is **source code**, not a deployed endpoint. It denies access if the Stripe credential or private workbook is missing. It is not a production access-control claim.

## Physical print-on-demand gate

**Not active:** there is no connected print-on-demand manufacturing provider, no inventory or shipping workflow, and no production shipping checkout. Do not sell physical goods through the currently active digital-only Stripe links.

To enable true shipped print-on-demand:
1. Connect a print partner (Printful, Printify, Gelato or another compatible vendor) and configure an authorized merchant account.
2. Create and inspect suitable 300-DPI or vector print files, trim/bleed/margin layouts, SKU product mockups and print proofs.
3. Obtain production cost, packaging, taxes, shipping zones, refund terms and customer support policies.
4. Use distinct *physical* products and checkouts that capture shipping address and appropriate taxes, without changing digital-only product meaning.
5. Perform a fully authorized sample order to verify printing, actual shipment, delivery and margins before offering shipped gifts.

Until then, the [APERTURE print guide](./print-guide.html) explains how a purchaser can print or bind the PDF locally.

## Next release acceptance

- [x] Sports workbooks and checkouts built.
- [x] Original product contents and all bundle entitlements represented.
- [x] Validation suite verifies storefront behavior and server-side payment guard.
- [ ] Private server project created and authorized.
- [ ] Stripe server credential set in the private deployment.
- [ ] Private premium delivery assets and purchaser recovery provisioned.
- [ ] Actual paid session and all SKU/bundle entitlements verified without mock data.
- [ ] Stripe checkout redirects moved to secure production endpoint.
- [ ] Physical printing vendor and sample fulfillment verified.

**Safety:** Do not record or upload children’s names, medical data, photos or athletic evaluations without appropriate adult consent and legitimate operational need. General sports and mental-performance prompts are not therapy, clinical sports psychology, physical therapy or professional training.
