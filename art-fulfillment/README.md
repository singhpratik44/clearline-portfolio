# CLEARLINE ART — Verified digital delivery

This is a private Render Python web service for **digital ZIP fulfillment**, not a public static download directory. The project generates its bundles during Render build time, and only serves them after verifying a short-lived HMAC grant.

1. Build command: `pip install -r art-fulfillment/requirements.txt && python art-fulfillment/build.py`
2. Start command: `python art-fulfillment/server.py`
3. Set `ART_TOKEN_KEY` (same random 40+ character shared secret as existing gift-delivery app); never commit the value.
4. Set `ART_DOWNLOAD_ORIGIN=https://<art-service>.onrender.com` on the existing `aperture-gift-delivery` service.
5. Checkout redirects to `https://aperture-gift-delivery.onrender.com/art/redeem?session_id={CHECKOUT_SESSION_ID}`. Existing gift service validates Stripe live payment and correct payment link/amount, and signs a 10-minute download grant.
6. Python service verifies HMAC and expiration and returns the appropriate private ZIP. Unauthenticated or expired requests are denied. Paid ZIP files must **not** be put on GitHub Pages or in git.

Post-payment redirect is now active on all three existing art payment links (Nov 13, 2026). No auto-email integration is claimed: the customer opens the verified download page after Stripe Checkout and clicks Download. A receipt alone is not an entitlement. In case of an interruption, support can help manually after verifying the receipt. Do not commit signed tokens or customer session IDs.

Verified before activation: both Render services live, Stripe credential authenticated, /healthz ready, 403 for unsigned direct ZIP and 400 for missing/invalid Checkout Session, 9 Node entitlement mock tests and Python ZIP/signature tests pass in CI, and all three Stripe live links return to the correct redemption route. **Still not completed:** one real paid purchase and customer-side ZIP retrieval; do not claim full purchase-to-delivery verification until conducted with a controlled transaction.\n\nIf service health fails: restore each payment link's after_completion to hosted_confirmation with explicit manual delivery copy; keep Stripe product and website terms aligned. Never make private ZIP paths public.
