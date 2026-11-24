# APERTURE production launch gate — PR #67

Status: **NOT APPROVED FOR PRODUCTION**. This document is a checklist, not a deployment authorization.

## Product / user journey
- [ ] Confirm the five-module prototype works on desktop and mobile; keyboard navigation and accessibility checked
- [ ] Validate prerequisite gating, reopen behavior, local evidence export and corrupted local storage handling
- [ ] Validate all three education checks and clearly label sample content
- [ ] Validate risk calculator with zero capital, stop >= entry, nonfinite inputs, costs > budget and tiny per-share risk
- [ ] Ensure no real broker action, market quote or automated agent action is implied
- [ ] Validate sales inquiry fields, consent and mailto behavior in Safari, Chrome and mobile
- [ ] Replace mailto-only intake with a permissioned CRM/form service before claiming server-side lead capture
- [ ] Confirm consent/privacy notice, spam controls, retention and deletion policy before storing leads

## Payments / commercial
- [ ] Confirm business identity, support contact, refund/cancellation terms, service scope and delivery terms
- [ ] Review connected Stripe **Clearline Code** account ownership and livemode with owner
- [ ] Create a Stripe-hosted Payment Link for the approved $500 fixed-scope sprint only after scope/terms and owner authorization
- [ ] Use only the exact Stripe-provided link; do not invent URLs or embed secret keys
- [ ] Require manual proposal acceptance before providing a payment link for custom quotes
- [ ] Validate Stripe test/sandbox checkout where available, and webhook/fulfillment reconciliation if automating delivery
- [ ] No claim of successful payment from a browser redirect alone; verify through Stripe
- [ ] Review taxes, chargebacks, refunds, customer support, accessibility and privacy compliance

## Engineering / release
- [ ] PR-only node:test workflow succeeds on latest commit
- [ ] Review GitHub Actions and hosting configurations for branch-specific deploy behavior
- [ ] Confirm no deployment previews auto-publish customer-facing unapproved offers
- [ ] Review PR diff, static link checks, security, performance and browser smoke tests
- [ ] Obtain explicit approval before merging, publishing or enabling live payment links
- [ ] After approval: publish, verify real HTTPS pages and inquiry path, monitor errors and rollback readiness

## Lead stages
New inquiry → qualified → scope drafted → proposal approved → payment link offered → Stripe payment verified → delivery → acceptance → follow-up.

The current static inquiry form opens the visitor's email client. It does **not** save a lead to a database, send email automatically, or create a Stripe charge.
