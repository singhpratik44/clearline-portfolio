# CODE THE GAME — Release evidence and unresolved blockers

## Scope
The storefront is a static GitHub Pages site with four Stripe Payment Links, three encrypted course packs, and a browser-based reader. No checkout credentials, keys or customer data should be stored in this repository.

## Verified in source / CI evidence
- Product pages exist for Roblox Creator, Minecraft Coding, and Indie Game Developer.
- The storefront links to four Stripe-hosted payment destinations.
- Static reader includes AES-GCM decryption and local progress storage.
- GitHub Actions run the CODE THE GAME regression suite.
- Run 42937893374 failed with 10/11 tests passing. The failed test checked for the exact phrase “No live coding sessions” in the storefront. This phrase was restored in commit ea020c9dbdb823ab5907c3d49632132dfef1d659. A subsequent successful deployment is required before calling this resolved in production.

## Unverified / blocking
1. Stripe successful-payment redirect to the correct full fragment-bearing URL for all four products.
2. Course decryption with a real paid-access link, including bundle.
3. Independent execution of Roblox Studio, Minecraft Education, and Godot 4 examples.
4. Buyer support response, refund procedure, and loss-of-link recovery.
5. Actual device/browser screenshots and accessibility audit.
6. Production analytics for paid conversions, without collecting sensitive student data.
7. Full price purchase: not authorized for automated execution.

## Release gate
- **P0**: CI green on the current commit; deployed public pages load; Stripe configuration inspected; real customer access flow manually verified with approved transaction or Stripe-supported safe test environment; engine examples tested or limitations disclosed.
- **P1**: Genuine project screenshots, privacy and digital purchase terms, real user feedback with consent.
- **P2**: Organic distribution, consent-based partnerships, and a budget-controlled advertising test.

## Manual buyer journey test (approval required for any real charge)
1. Open the product detail page on a supported device.
2. Confirm the correct price, product and required editor.
3. Open the Stripe Payment Link and verify product and total.
4. Complete only an explicitly approved transaction.
5. Record whether the post-payment redirect opens the expected reader.
6. Confirm the reader decrypts only the purchased pathway(s).
7. Save the complete URL fragment privately; do not paste it into issues, commits or logs.
8. Test lesson navigation and refresh.
9. Report failures to purchase support without sending card details or private access URLs.

## Safety
Never commit encryption keys, buyer emails, receipts, card details, or complete bearer URLs. Never imply a source-code check is proof of paid fulfillment. No new charges, ad spend, or external outreach without explicit authorization.
