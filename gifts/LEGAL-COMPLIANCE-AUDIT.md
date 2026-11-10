# APERTURE Gift Lab — legal and payment readiness audit
**Audit date:** November 10, 2026 (United States / California)  
**Scope:** 69 currently active Stripe Payment Links, 69 Stripe products, online digital-only printable workbooks. No shipping, physical inventory, automatic subscriptions, officially licensed athlete or league merchandise, or live athletic instruction included.

**Important:** This is a source-grounded operational compliance review, not a lawyer's certification, legal opinion, tax determination, licensing approval, or a guarantee that selling in every jurisdiction is lawful.

## Findings

| Area | Verification | Current risk / action |
| --- | --- | --- |
| Honest digital-goods marketing | The 69 live Stripe Payment Links carry a conspicuous "DIGITAL LICENSE" custom message linking to the customer license and noting current public accessibility. Products are described as one-time digital books, not physical shipments. | **Partial.** Confirm rendered mobile Checkout UI clearly shows the text before payment; a live no-charge checkout proof was not run. |
| California digital license (AB 2426 / BPC §17500.6) | Store terms now explain the limited personal-use license, buyer's rights, printed-copy conditions and that copyright ownership does not transfer. This language is displayed from product pages and Stripe-hosted checkout. | **Partial.** The law has exceptions and nuances. Review legal adequacy of the on-page disclosure and Stripe presentation; a required terms checkbox is not yet confirmed. |
| COPPA and children’s privacy | Workbook dedication names are handled locally in the browser. No child profiles, accounts, photos, birth dates, athletics records, medical data or targeting pixels are intentionally required. Checkout is adult-oriented. | **Needs professional check.** The COPPA amendments reached general compliance April 22, 2026. Assess third-party logs and any future analytics/trackers, retention/deletion disclosures, age audience and parental-notice obligations before enabling new collection. |
| Truthful advertising | No fabricated league affiliation, results, official coaching credentials or guaranteed athlete outcomes in marketed descriptions. Products are independent, paper-first educational content; no licensed logos/likenesses are provided. | **Partially verified by current catalog scan.** Do not claim official NBA/WNBA/NCAA/FIFA endorsements. Review every future media asset, ad creative and testimonial before use. |
| Trademark and copyright | Current original workbook copy and generic sport terms have no identified third-party player photos or league logos in the inspected text. | **No comprehensive clearance.** Separate trademark search, visual design audit and rights checks required before distributing imagery, brand merchandise or music. |
| California tax treatment in 2026 | California CDTFA currently states purely electronically transferred digital books are generally not taxable in 2026 under its existing guidance. Stripe automatic tax is disabled on current links per user's stated current tax practice. | **High priority.** CDTFA says statewide rules change January 1, 2027 under SB 122; electronically delivered or remotely accessible digital products generally become taxable. Ask a CA tax advisor to determine seller nexus, registration, classification and other-state obligations. Do not assume zero tax outside CA. |
| Refunds, support and chargebacks | Public digital-gift terms now include refund/access support contact, addressable issues and no waiver of statutory customer rights. | **Partially verified.** Test a real customer receipt, working refund workflow and accessible email support. |
| Secure fulfillment | Fail-closed Stripe live Checkout verification and SKU/bundle allowlists implemented in repository; latest mock tests pass. 69 product SKUs, 54 original workbooks, 434 original educational activities and 15 bundles mapped. | **BLOCKED / NOT LIVE.** Public GitHub Pages is not an access-controlled file vault; backend hosting permission and private assets still needed. Existing files and Git history have already been public. |
| Physical shipment | Digital products say no physical merchandise or shipping; print-at-home PDF guidance exists. | **Not in scope.** Do not connect or advertise manufacturer delivery. |
| Clinical and regulated activities | Products expressly say they are not therapy, medical care, injury rehabilitation, accredited physical training, professional sports psychology or sports-certified instruction. | **Continue restricting claims.** Adult-supervised, optional activities; no youth performance profiling. |

## Primary sources consulted

1. Federal Trade Commission — Complying with COPPA: FAQs: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
2. Federal Register — 2025 updated COPPA Rule, effective June 23, 2025, general compliance April 22, 2026: https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm
3. FTC — Advertising and Marketing Basics: https://consumer.ftc.gov/business-guidance/advertising-marketing
4. California AB 2426, codified Business & Professions Code §17500.6 — https://legiscan.com/CA/text/AB2426/id/3022416
5. California Department of Tax and Fee Administration — Digital products and SB 122 change, effective January 1, 2027: https://cdtfa.ca.gov/industry/retailers-and-purchasers-of-digital-products/
6. CDTFA — Publication 109, Internet Sales: https://cdtfa.ca.gov/formspubs/pub109/nontaxable-sales.htm
7. U.S. trademark false-endorsement / false-association rule (15 U.S.C. §1125): https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap22-subchapIII-sec1125.htm
8. Stripe — payment link and Checkout Sessions docs: https://docs.stripe.com/payment-links and https://docs.stripe.com/api/checkout/sessions/object

## Buyer disclosure rules implemented

- Display **digital-only, one-time limited license** near each checkout link, and link to `/gifts/terms.html`.
- No brand licensing or athlete/league affiliation claims.
- No subscriptions or physical shipping.
- No photos, identifiable athlete ratings, medical history or full names of children required to use content.
- Do not claim a genuine paywall until private assets, server secret configuration and a paid-session end-to-end test are complete.
- If a purchaser cannot access the promised content, follow the posted support and refund process.

## Release gates to close before a large marketing campaign

1. **Backend access**: Provision private server hosting with permission to create/deploy, set `STRIPE_SECRET_KEY` only in server-managed secret settings, and store new premium workbook assets outside the publicly visible repository and its Git history.
2. **Payment test**: Test unauthorized, test-mode, incomplete, refunded and paid scenarios; verify a real paid checkout, entitlement and PDF download for ordinary and bundle purchases. A checkout link that merely redirects to `?kit=...` is not verified delivery.
3. **Checkout presentation**: Confirm the CA digital-license explanation and link are prominent on desktop and mobile hosted payment pages; set optional Stripe TOS checkbox if the seller's Dashboard public terms URL is properly configured.
4. **Tax**: Obtain jurisdiction-specific guidance on sales tax registrations for U.S. and international customers, prioritize the California January 1, 2027 law change.
5. **Consumer support**: Test customer receipt recovery, adult support contacts and access/refund handling before promotions.
6. **Marketing proof**: Ads must avoid fabricated reviews, schools, star athletes, performance guarantees, endorsements and certifications. Only use real purchasers' voluntary endorsements with permission and material-connection disclosure.

**Operational outcome:** Storefront payment configuration and disclosures improved; a legally safe, genuinely private, internationally compliant sales operation is **not yet independently verified**. The blocker is private backend hosting and nonpublic delivery assets. This distinction is material to buyers.
