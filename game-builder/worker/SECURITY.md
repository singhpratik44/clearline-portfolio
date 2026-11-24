# Phase 3 security gates
- The Worker is deliberately **fail-closed**: checkout cannot run with demo headers, webhooks do not grant entitlements, course API denies access.
- Configure actual authentication (verified JWT/session), private object storage, and durable idempotent entitlements before enabling test checkout.
- Stripe webhook must fetch checkout session line items server-side and verify price, amount, mode, paid status, test-mode flag, user binding, and event signature.
- Test successful/failed payments, invalid/replayed webhooks, refund/revocation, unauthorized downloads, wrong prices, expiry, and cross-user access.
- Never use production Stripe credentials, live prices, or enable checkout before approval.
- No test-mode payment flow has been exercised yet.
