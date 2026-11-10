# APERTURE Gift Lab — U.S./California Legal Launch Review (November 10, 2026)

**Status: Preliminary compliance audit, NOT a legal opinion or certification.** The purpose is to document researched rules, product-specific safeguards, and unresolved gates. Confirm merchant identity, tax nexus, business registration, actual privacy processing, and customer refund policies with qualified professionals before high-volume sales.

## 1. Product scope

- Digital-only, one-time licensed printable gifts, no shipment or third-party manufacturing.
- 69 Stripe Gift Lab products and payment links currently catalogued across family, faith, motivation, sports and creative learning. The 54 original workbook source pages contain 434 writing/decision activities, as published in current catalog files.
- Basketball and sports source includes fictional diagrams, creative prompts, data-literacy templates and reflection cards. There is **no** live, licensed, certified or medical instruction included with these purchases.
- More than one product/bundle has related contents; marketing must accurately describe exactly what a SKU includes.

## 2. California digital goods license disclosures — B&P Code §17500.6

California AB 2426 (effective January 1, 2025) generally restricts advertising digital goods using terms like *buy* or *purchase* when access is only a revocable license, unless an applicable exception applies or an appropriate separate clear disclosure or affirmative acknowledgement is supplied. Offline permanently available products are subject to an exception; because circumstances vary, APERTURE uses the more cautious approach: **prominently state a nonexclusive personal-use digital license and link to full terms before every checkout**.

Source: https://law.justia.com/codes/california/code-bpc/division-7/part-3/chapter-1/article-1/section-17500-6/
California Senate judiciary analysis: https://sjud.senate.ca.gov/system/files/2024-06/ab-2426-irwin-sjud-analysis.pdf

Implemented in `gifts/terms.html`, public `gifts/index.html`, `gifts/sports/index.html`, product descriptions and Stripe payment-link custom text. **Open gate**: counsel review of consumer-facing copy and completeness/visibility of Stripe checkout disclosures.

## 3. California tax classification — CDTFA

For **2026**, the CDTFA generally treats electronically delivered eBooks/data without tangible media as nontaxable in California, subject to the transaction facts.
- https://cdtfa.ca.gov/formspubs/pub109/nontaxable-sales.htm
- https://cdtfa.ca.gov/formspubs/pub37.pdf

**Important change January 1, 2027:** California Senate Bill 122 (2026) generally expands taxation of sales of digital products, including electronically transferred or remotely accessed goods. Check exemptions, permitted registration periods, filing obligations and retailer registration *before the effective date*:
- https://cdtfa.ca.gov/industry/retailers-and-purchasers-of-digital-products/

Current Stripe Gift Lab links use `automatic_tax.enabled=false` following merchant direction that they do not currently collect sales tax. This is **not a determination** of whether tax registration, collection or remittance is required in any state; interstate tax nexus and other jurisdictions require professional review. No new physical goods should be listed using these digital-only checkouts.

## 4. Children's privacy: FTC COPPA

The 2025 COPPA rule amendments require care when sites are child-directed or knowingly collect data on under-13 users. Generally, verifiable parental consent is needed before collecting covered personal information from children under 13 unless a rule exception applies; persistent identifiers can also qualify.
- https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-312-coppa-final-rule-amendments

Existing mitigations: adult purchasers, no child login, no collecting or uploading children's full names, photos, medical information, training stats or email, and dedication text processed locally in the browser. Verify the actual privacy behavior of third-party host logs, analytics and embedded scripts before asserting COPPA compliance. Do not add targeted advertising, tracking SDKs or behavioral profiling of children without counsel-led review.

## 5. FTC advertising truth, endorsements and performance

Sales claims must be truthful, nonmisleading and supported. Do not invent basketball victories, athlete results, product reviews, league partnerships, team affiliations, school contracts, certification, coaching outcomes or endorsements. State clearly that printable activity guides **do not promise improved performance** or replace professional education or care.
- https://www.ftc.gov/business-guidance/resources/advertising-faqs-guide-small-business
- https://www.ftc.gov/news-events/topics/truth-advertising/advertisement-endorsements

No fabricated testimonials and no "No. 1 in the world" claims without reliable substantiation.

## 6. Trademark / likeness / copyright

Do not use protected team or league logos, jerseys with marks, player photos, likenesses, trading cards, recorded clips, copyrighted athlete quotes, NBA/WNBA/club logos, or branded sponsors in APERTURE product files without appropriate permissions. Generic words like basketball, defense, practice and coaching and original diagrams are safer but still require an actual product-by-product review. Do not imply third-party endorsement.
- https://www.uspto.gov/page/about-trademark-infringement
- https://www.uspto.gov/trademarks/basics/what-trademark

Original APERTURE brand still warrants a clearance search before significant paid advertising. The legal ability to use specific branding cannot be guaranteed merely from this audit.

## 7. Consumer support / refund / privacy disclosures

Implemented a plain-language license, order support method, refund review, privacy notice and product limitations in `gifts/terms.html`. Confirm legally required merchant name, business contact details, cancellation/refund standards, tax disclosures, record retention, state privacy law applicability, and accessibility. Do not claim that a support inbox is monitored unless it is.

## 8. Private checkout and fulfillment

**Not live/secure yet.** A public GitHub Pages print URL does not authenticate the buyer. Existing original workbooks have already been committed into public Git history, so future access-control changes cannot make past published copies exclusive. The portable backend at `gifts/fulfillment/` validates Stripe checkout sessions, link entitlements, currency, live-mode status, paid status and expected amount, then generates a workbook response. However its service deployment and private Stripe key configuration remain **unverified**, and Stripe links still redirect to public print URLs.

Required steps:
1. Select an authorized hosting workspace. The Render app has been connected, but **the user has not selected a workspace**; the Render tool requires explicit confirmation before creating a service.
2. Create hosted Node service from the reviewed source, and add `STRIPE_SECRET_KEY` through secret environment settings directly, never in Git or chat.
3. Verify unauthorized, unpaid, wrong-SKU and wrong-amount requests fail; run a real low-value authorized purchase in the intended Stripe live account and confirm successful PDF print/save and bundle selection. Check refunds and recovery.
4. Move only after verified: change checkout return URLs to the paid endpoint including the `{CHECKOUT_SESSION_ID}` token. Keep the public redirects until then to avoid blocking already paying customers.
5. Restrict public workbook endpoints as appropriate and create genuinely new premium material that is not in public Git history if exclusivity is promised. Do not advertise DRM or piracy-proof content.

## Launch checklist

- [x] Digital-only products with no physical fulfillment
- [x] Trademark/endorsement disclaimers
- [x] Adult purchasers and local-only dedication processing
- [x] Digital license terms and link
- [x] Preliminary tax/COPPA/advertising research
- [x] Stripe SKU and expected-amount verifier with regression tests
- [ ] Rendering and mobile/browser regression tests pass on current head
- [ ] Render workspace explicitly selected
- [ ] Private backend deployed with server-only Stripe key
- [ ] Real payment-to-print checkout verified
- [ ] Stripe URLs migrated without disrupting past orders
- [ ] Professional California/multi-state tax review
- [ ] Attorney review of license, privacy, trademark and merchant disclosures

**Do not claim "fully compliant," "private delivery enabled" or "secure download" before the corresponding gates are closed.**
