# CLEARLINE ART — Verified digital delivery

This is a private Render Python web service for **digital ZIP fulfillment**, not a public static download directory. The project generates its bundles during Render build time, and only serves them after verifying a short-lived HMAC grant.

1. Build command: `pip install -r art-fulfillment/requirements.txt && python art-fulfillment/build.py`
2. Start command: `python art-fulfillment/server.py`
3. Set `ART_TOKEN_KEY` (same random 40+ character shared secret as existing gift-delivery app); never commit the value.
4. Set `ART_DOWNLOAD_ORIGIN=https://<art-service>.onrender.com` on the existing `aperture-gift-delivery` service.
5. Checkout redirects to `https://aperture-gift-delivery.onrender.com/art/redeem?session_id={CHECKOUT_SESSION_ID}`. Existing gift service validates Stripe live payment and correct payment link/amount, and signs a 10-minute download grant.
6. Python service verifies HMAC and expiration and returns the appropriate private ZIP. Unauthenticated or expired requests are denied. Paid ZIP files must **not** be put on GitHub Pages or in git.

No auto-email integration is claimed. The customer opens the verified download page after checkout; a receipt alone is not an entitlement. Keep the old manual fulfillment promise until a real post-payment redirect and full integration tests are verified.

Before enabling production redirect: deploy both services, pass /healthz, deny forged sessions/grants, verify one valid paid Stripe session without charging a customer, confirm ZIP contents from protected endpoint, and inspect live payment-link mappings.
