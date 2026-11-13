# APERTURE × Clearline — Holiday measurement and consent ledger
Updated: November 12, 2026. This is an implementation specification, **not a claim that analytics is active**.

## Status and sources of truth
- Free spiritual gift: live at https://singhpratik44.github.io/clearline-portfolio/holiday/
- Checkout and digital fulfillment: not enabled through this page. Do not add a buy button until test/live payment verification and product delivery are confirmed.
- Website traffic and share events: **PostHog transport staged but not connected**. The public `holiday/analytics-config.js` intentionally contains no project token. The site emits client-side `aperture:metric` CustomEvents and an in-memory `window.APERTURE_HOLIDAY_EVENTS` buffer for QA only. These create no aggregate results until a real PostHog project is connected, consent is granted, live events arrive and a dashboard is verified.
- Outbound outreach: Gmail SENT message IDs. Count only messages whose provider acknowledged SENT.
- Responses: distinct incoming Gmail replies from each unique qualified partner (not email opens).
- Leads: explicitly opted-in, reviewable requests or booked calls, not page visits or share intents.
- Sales: settled payment and verified digital delivery in Stripe/fulfillment records, not projected orders.

## Funnel events
| Event | Definition | Can it prove a message was delivered? |
| --- | --- | --- |
| `gift_view` | Holiday page loaded | No |
| `gift_personalize` | Theme selection changed | No |
| `gift_share_intent` | Share menu requested | No |
| `gift_share_success` | Native share API resolved | No; destination delivery unknown |
| `gift_copy_intent` | User pressed Copy | No |
| `gift_copy_success` | Clipboard API resolved | No |
| `gift_sms_intent` | SMS composer requested | No; no message sent automatically |
| `gift_email_intent` | Email composer requested | No |
| `sms_invitation_intent` | Email composer for invitation request opened | No; user must send the email |

## Attribution
Share links can preserve simple, allowlisted `ref`, `utm_source`, `utm_medium`, and `utm_campaign` values. Personal names are not analytics properties.

Example: `/holiday/?utm_source=partner&utm_medium=qr&utm_campaign=holiday2026&ref=community`

Partner identity or endorsement must not be claimed without the partner's approval. Do not append phone numbers or other personally identifying information to campaign tags.

## To activate true website conversion analytics
1. Connect a real PostHog organization/project from the user account, record the public project token and regional ingest host (US or EU). A personal API key is **never** embedded in the static site.
2. Set `holiday/analytics-config.js` to the project token and matching host. The implementation now includes a visible, separate consent/withdrawal control that defaults off and honors Global Privacy Control/Do Not Track.
3. Confirm the PostHog SDK never loads and no events leave the page without affirmative analytics consent. Auto events, heatmaps, session replay, exception capture, person profiles, and named identification are disabled. Only the explicit event allowlist and sanitized campaign tags can be transmitted.
4. Verify in PostHog's real activity debugger using a purposefully tagged TEST campaign link: one consented `gift_view`, one `gift_personalize`, one `gift_copy_success`, then no events after opt-out. Confirm *no* `to`/`from` query values or message bodies appear in the ingested event payload.
5. Build a private funnel dashboard for consenting visitors: measured `gift_view` → `gift_personalize` → `gift_share_intent` → `gift_share_success` / `gift_copy_success`, segmented by `utm_source`, `utm_medium`, `utm_campaign`, and `ref`. Other conversion measures (confirmed opt-in requests, leads, paid purchases, verified delivery) remain unavailable until reconciled with authoritative email, SMS-provider and Stripe records.
6. Reconcile Gmail replies and Stripe orders using provider IDs and timestamps. Do not infer completed SMS/email sends from opening a composer, do not equate a native share-sheet resolution with recipient delivery, and do not attribute sales to sources lacking verifiable evidence.

The opt-in rate is *not known* from event data because only consenting visitors are counted. Do not divide against total traffic that is unavailable.

## SMS safeguards
- The site currently provides only a **manual email invitation request**. No SMS provider, sender number, A2P registration, double opt-in, or suppression webhook is connected.
- The consent checkbox defaults unchecked and is separate from the Terms acknowledgement; messages, frequency, rates, STOP/HELP, privacy, and support details are visible.
- A request email is **not** an SMS subscription. Before sending even one recurring SMS, deploy an approved provider, complete carrier registration, confirm the person explicitly opts in, persist the date/form disclosure/consent scope, and implement STOP/HELP/suppression and quiet-hour controls.
- Do not import prior Gmail addresses or unsolicited phone numbers as subscribers.
- Terms: /holiday/sms-terms.html. Privacy: /holiday/privacy.html.

## Connection state
- PostHog plugin: not installed/connected as of the November 12, 2026 implementation check.
- Static PostHog project token: deliberately blank; no destination and no send.
- Current production analytics: **Not connected**, not zero.
- Connect PostHog in ChatGPT and then configure the website project token from PostHog project settings; the plugin connection alone does not install the website snippet.
