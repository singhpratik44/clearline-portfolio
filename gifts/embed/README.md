# Gifter Embed v1

A no-build embeddable gift discovery widget for third-party websites. Uses existing Stripe-hosted payment links; it never collects card details.

## Install on a website

```html
<div id="gifter-widget"></div>
<script defer src="https://singhpratik44.github.io/clearline-portfolio/gifts/embed/gifter.js"></script>
```

For multiple embeds, use a unique target ID and add `data-target="your-id"` to the script tag. Supports responsive layouts and Shadow DOM style isolation.

## What this is and isn't

This is a website embed, not an approved Shopify, WordPress, Slack, Discord, or ChatGPT marketplace app. Those require separate integrations, reviews, and sometimes developer accounts. Checkout links are live Stripe links; some existing products use manual delivery or public printable redirects. Do not market instant private delivery until it is tested. The current widget is public and has no merchant authentication, commissions, order tracking, or paid-gift claim API. For partner distribution, add an authenticated referral ledger and payment-confirmed fulfillment before commission payouts.

## Suggested next integrations

WordPress shortcode wrapper, Shopify theme app extension, Slack slash command, Discord slash command, and an API-based ChatGPT app. Keep all fulfillment and billing verification server-side.
