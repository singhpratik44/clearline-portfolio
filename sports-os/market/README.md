# APERTURE SPORTS — Marketplace, Moments & Ads

## Status (November 12, 2026)
Public site: \`/sports-os/market/\` in the existing \`singhpratik44/clearline-portfolio\` GitHub Pages deployment.

This is a **real, working, no-sign-in static frontend** that connects:
1. **Official live sports scoreboard links** (not an in-app licensed feed). Each card opens the league's own scoreboard. APERTURE does **not** scrape, mirror, broadcast or relicense live scores.
2. **Original fan moment creator** (free): browser-local names, occasion and positive message; shareable URL fragment; native share/copy and print as PDF. This is not a game highlight or an athlete-licensed collectible.
3. **Digital sports gifts**: reuses existing in-repo products from \`gifts/sports-collection.js\`, \`gifts/basketball-collection.js\`, \`gifts/basketball-extra.js\`, with original per-SKU \`gifts/checkout-links.js\` purchase URLs, prices and licensing. No duplicate Stripe gifts, charges or refund policy overrides.
4. **Purchasable independent sponsor placements**: three verified Clearline Code one-time Stripe Payment Links, each limited to one completed checkout. All advertiser creative, activation and end-date removal remain manual and verified. No actual sponsor is represented unless paid, approved and scheduled.
5. **B2B conversion**: navigation to the existing Revenue Recovery diagnostic, Sports Career OS and proposal-based services.

## Sponsor packages (live Stripe checkout; manually fulfilled)
- Community: $49, 7-day labeled sponsor card after approval, one purchase slot, link ID \`plink_1UbEuXRuy3ohymOHfeLD1NSL\`.
- Moment: $99, 14-day labeled sponsor tile beside fan moment maker, one purchase slot, link ID \`plink_1UbEupRuy3ohymOHfqJbtvLv\`.
- Presenting: $249, 30-day labeled hero and sponsor-section placement, one purchase slot, link ID \`plink_1UbEurRuy3ohymOHG6UCPxi0\`.

Stripe live payment links were read back from API, active, \`livemode: true\`, \`restrictions.completed_sessions.limit=1\` and \`count=0\` at creation/verification.

**Fulfillment is NOT automatic**: buyer emails receipt, company identity, URL and owned/licensed creative to \`parry.s.2324@gmail.com\`; operator verifies payment in Stripe, approves/declines content, obtains written schedule, creates a signed-off static placement entry, deploys, independently verifies appearance, records dates and removes it on expiry. Full refund if unable to approve/deliver. Read \`advertising.html\` for exact package constraints and refund conditions.

This is NOT a marketplace for third-party creators with automatic commission splits. No Stripe Connect payout has been authorized or configured. No audience or revenue guarantee.

## Sponsor activation instructions

In \`sponsors.js\`, the \`placements\` array defaults empty. To publish a genuine approved advertiser:
- Confirm the Stripe payment is paid/settled and not reversed.
- Confirm agency/advertiser owns the creative and destination and is allowed on this family-friendly site.
- Confirm advertiser accepted a specific placement, schedule and duration.
- Review final copy and link; reject unsafe/risky claims. Distinguish an APERTURE sponsor from professional sports endorsement.
- Append a placement object (no customer payment or identity details!) with \`surface: "community"|"moment"|"presenter"\`, \`name\`, \`headline\`, \`description\`, HTTPS \`url\`, \`approved: true\`, \`payment_verified: true\`, non-secret \`approval_ref\`, and \`starts_at\`/\`ends_at\` ISO timestamps.
- Run tests, deploy, verify the label "ADVERTISEMENT / SPONSORED" in the approved surface and record public URL and times.
- When dates expire, the frontend automatically stops displaying the advertiser, but the operator must verify removal and fulfill the agreed period.

There is no server-side impression counting and no client event data or entered fan-moment information is sent to sponsors. Ad creative requires an explicit approval workflow before production.

## Live sports licensing boundary

**Do not** add unlicensed live scoring APIs, scraped ESPN/league scoreboard endpoints, trademarks, player photographs, exclusive clips, rights-managed editorial or betting feeds. TheSportsDB free and paid terms, and Sportradar licensing guidance, are captured in \`technology.html\`. Embedding licensed scores requires an approved contract, server-side key management, attribution, cache/redistribution review, and fallback. The current deployed scope is official external score links.

## Build validation

- \`node --test tests/sports-market.test.mjs\`
- \`node tests/site-browser.mjs\` (requires Playwright and Python server as in repo)
- Existing repository CI and GitHub Pages build remain authoritative.
- Pages workflow checks the production site for the marketplace HTML, scripts, real sponsor links, terms and roadmap.

## Next development bets
1. Confirm first ad purchase and manually deliver visible inventory, measure actual public impressions later with consent-preserving instrumentation.
2. Add reliable payment-verified fulfillment for a premium original personalized moment, not a public PDF passed off as private.
3. Test buyer demand for team-license gift bundles.
4. Negotiate a licensed data feed before in-app live scores.
5. Add affiliate commerce only after documented affiliate tracking terms; never imply commissions without an agreement.

**Truth ledger**: Stripe links are live; **no sponsor purchases, payments, customers, impressions, conversions, media rights, commercial score licenses or automatic activation are claimed** until independently confirmed.
