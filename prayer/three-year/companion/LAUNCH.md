# A Quiet Journey — 3x stronger commerce implementation brief

## Mission
Build an elegant, ethically purchasable optional digital reflection workbook alongside A Quiet Journey. Preserve the free Gurbani resources, prayer, 4D timeline, personalized long-term journey and private encrypted journaling. Never sell scripture, blessings, religious rank, or spiritual outcomes. Never imply an endorsement by Sikh authorities. Never promise unavailable mentoring or counseling.

## Product and offer
Proposed product: **A Quiet Journey — Three-Year Companion Workbook** at a suggested **$29 USD one-time**. Buyer receives 36 original monthly reflection worksheets and 12 quarterly review worksheets, available as a printable browser workbook or save-as-PDF file, with an action-based reflection framework. No recurring charge and no required account. Pricing requires seller approval before a live Stripe sale.

The workbook link is publicly accessible to anyone with the URL. This initial GitHub Pages model **does not provide copy protection, authenticated paid access, entitlement checks or payment verification**. Disclose that prominently. The optional payment pays for the prepared digital companion resource, not spiritual transformation. The original app remains free.

## Stronger build specification
1. **Commercial clarity:** Show what is free vs. paid, full one-time price, delivery format, tangible scope, contact details, and checkout status without tricks.
2. **Substantive learning:** Every monthly sheet offers original prompts for truth, reflection, concrete care and voluntary action. Add seasonal review without streak penalties or invented religious citations.
3. **Visual quality:** Premium deep pine, antique-gold, ivory; responsive 320px and 390px layouts; elegant 36-month workbook and consistent accessible print layout; reduced-motion support.
4. **Security:** Use Stripe-hosted Payment Links, not secret API keys or card forms in static source. Payment CTA is disabled unless a verified Stripe-owned live link is installed. Keep browser journaling local and encrypted as before.
5. **Fulfillment:** Stripe's post-payment redirect should point to the downloadable workbook URL. This is a shareable delivery link, not proof of payment. A true entitlement system requires a backend and verification.
6. **Tax, support and consumer disclosures:** Review seller name, applicable taxes, customer-facing terms and how buyers can request delivery help or refunds before enabling checkout. Do not invent a refund guarantee.
7. **Marketing discipline:** Write useful, opt-in-friendly offer messages for an identified consenting recipient or a chosen authorized public channel. Do not mass-mail unrelated job contacts.
8. **Engineering integrity:** Automated tests verify 36 month sheets, 12 quarter sheets, no live payment before approval, free app unaffected, usable navigation, privacy constraints, mobile and desktop viewports, and GitHub Pages artifact presence.
9. **Release evidence:** Branch → PR → tests → merge → deploy → confirm. Do not describe proposed, deployed, paid or emailed states as interchangeable.

## Launch gates
- [x] Prepare optional shop, preview, 36-month print workbook and 12 quarterly reviews.
- [x] Preserve free prayer and encrypted journal.
- [x] Disable checkout until an owner-approved Stripe URL exists.
- [ ] Confirm whether the connected **Clearline Code LIVE Stripe account** is the intended seller and approve the proposed $29 one-time price.
- [ ] Create Stripe product, price and payment link using the authorized connector. Obtain human approval if Stripe requests it.
- [ ] Configure Stripe's post-checkout redirect to the shareable workbook and check merchant/tax disclosures.
- [ ] Update the exact Stripe-hosted checkout URL in the public configuration and re-run automated tests.
- [ ] Confirm the buyer checkout opens; do not simulate a completed sale or charge a card without permission.
- [ ] Obtain an intended recipient or marketing channel before sending promotion; only claim sent after a successful send action.

## Clear buyer-facing language
**A Quiet Journey — Three-Year Companion Workbook.** A self-guided printable workbook with 36 monthly worksheets and 12 quarterly reviews. Practice reflection, humility, gratitude and practical care at your own pace. One-time digital purchase. It contains original planning materials, not Gurbani, guided religious services, counseling, or a guarantee of spiritual outcomes. The full A Quiet Journey practice stays free; the workbook link may be shared.
