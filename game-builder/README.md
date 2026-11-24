# APERTURE Game Builder — prelaunch implementation
- Product: Stripe live catalog product prod_VfQg3XdM2nyAQw (inactive), price price_1Ue5pORuy3ohymOHtBY0279s ($29 tax-exclusive).
- Do not activate or publish a payment link before approval.
- Public preview page has a playable JavaScript game, not a completed Scratch game.
- Four Scratch lesson starter .sb3 archives and guides were generated locally for review; the branch does not yet contain those archives.
- Secure fulfillment design: authenticated server creates test-mode Stripe Checkout Session with a test-mode price; server validates signed webhook and checkout.session.completed payment_status=paid; grants entitlement idempotently keyed by session ID; downloadable files live in private storage and are delivered through short-lived signed URLs.
- Never grant access based only on a success redirect or client-side query parameters.
- Tests needed: test-mode successful checkout, failed/expired session, replayed webhook, unauthorized access, signed URL expiry, refunds/revocation, price mismatch, and mobile usability.
- Current status: checkout and fulfillment are architecture only, not implemented. No live charges or published links.
