# Gift Cloud purchase-to-gift implementation status

## Verified
- Independent static v3 is on a separate Render static preview; production unchanged.
- Twelve existing Stripe product links are listed in v3.
- Opt-in original synthesized ambient audio is available on the store screen.
- A **non-deployed** server-side prototype is in `redemption-api/server.mjs`.

## Security architecture
Buy: existing Stripe checkout, **but these payment links currently do not redirect with a verified session ID**.
Personalize: after checkout, collect recipient name and note (no email until a delivery provider is connected).
Verify: server retrieves the Stripe Checkout Session using a secret key and verifies paid status, mode, livemode and allowlisted Stripe price IDs. Never accept payment proof from the browser.
Deliver: issue an opaque token and let the buyer share it. Email/SMS delivery is NOT implemented.
Open: redeem token exactly once through API. Gift UI for redemption is NOT implemented.

## Required before real sales delivery
1. Configure payment-link completion redirect with Checkout Session ID, preserving existing products; verify Stripe settings and get explicit approval before changing live links.
2. Obtain durable transactional storage with uniqueness constraints. The file-backed prototype is **not safe for multi-instance/concurrent production deployment**, and Render free ephemeral filesystem cannot guarantee persistence. Do not deploy as production.
3. Store Stripe secret server-side only, never in GitHub or static site. Configure an allowlist of price IDs and validate account context.
4. Add a real recipient redemption UI and authorized delivery channel; use opt-in emails only, no unsolicited texts.
5. Test: unpaid/expired/foreign session, duplicate claim, wrong product, token replay, persistence across restarts, concurrency, mobile Safari, and refund policy.
6. Ensure purchased PDFs or assets are actually ready for fulfillment before advertising instant delivery.

## Distribution and plugin
A connected MCP tool is not proof of public ChatGPT Plugin Directory listing. Confirm public listing and approval through developer dashboard.
No fabricated traffic, purchases, impressions, or delivery outcomes. Track privacy-preserving aggregate funnel events once consent and durable analytics are in place.
