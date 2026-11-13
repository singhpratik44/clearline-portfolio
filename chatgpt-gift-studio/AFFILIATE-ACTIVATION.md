# Gift Finder commerce and affiliate activation (November 2026)

## Customer path
Gift Finder Digital Twin → free Clearline original interactive tutorial → free personalized shareable gift → explicit independent-retailer shopping link. Keep the tutorial on our website, and let merchant handle physical orders, refunds, shipping and payment.

## Affiliate status
No approval, issued referral tracking link, commission receipt, or sale is verified. The live website currently uses ordinary links to bookshop.org, ulta.com, sephora.com and etsy.com. Do not add affiliate claims or affiliate parameters until partner credentials and destination-specific tracking links are confirmed.

## Partner application priority
1. Bookshop.org: https://bookshop.org/affiliates/profile/introduction — published 10% non-bookstore affiliate rate. Apply, complete verification, obtain the exact affiliate storefront and permitted link format.
2. Ulta Beauty: https://www.ulta.com/company/affiliate — publisher program via Impact or creator program, depending on the channel.
3. Sephora: https://www.sephora.com/beauty/affiliates — publisher program via Rakuten Advertising or separate creator storefront.
4. Etsy: https://www.etsy.com/affiliates — publisher affiliate program or Creator Collective.

These are application destinations; they are not merchant-issued affiliate links. Do not invent a partner ID, spoof tracking, use coupon stuffing or cookie injection, redirect without disclosure, or call a purchase a conversion without merchant evidence.

## Activation gates (per merchant)
- Confirm written approval on the account authorized for Clearline/APERTURE.
- Obtain the issued affiliate ID, official tracked URL, permitted channels, and disclosure requirements.
- Replace the relevant public merchant link in `public/index.html` with **exactly** the issued URL; no homegrown redirect is required.
- Label each applicable link “Affiliate link — we may earn a commission”; keep non-affiliate labels on others.
- Test navigation to the intended merchant landing page without a purchase.
- Verify click attribution from the merchant's own partner dashboard or an approved test-click mechanism, not from inferred browser visits.
- Do not claim a sale or earnings until merchant dashboard shows actual attributed transactions.
- Confirm product, availability, price, and merchant terms before showing specific buy-now offers.

## Measuring conversion
Count verified outbound link taps (with consent and minimal aggregate analytics, if enabled), merchant-attributed clicks, merchant-attributed purchases, earned commissions, and Clearline digital gift completions separately. Do not log recipient names or gifts. Use privacy notice and consent configuration before analytics are turned on.

## Current non-claim
There is no live checkout or commission payout verified for third-party retailers. Tutorials and free gift reveal work without advertising or sign-in.
