# APERTURE × Clearline — Holiday measurement and consent ledger
Updated: November 12, 2026. This is an implementation specification, **not a claim that analytics is active**.

## Status and sources of truth
- Free spiritual gift: live at https://singhpratik44.github.io/clearline-portfolio/holiday/
- Checkout and digital fulfillment: not enabled through this page. Do not add a buy button until test/live payment verification and product delivery are confirmed.
- Website traffic and share events: **not connected to a durable collection provider**. This static site currently emits client-side `aperture:metric` CustomEvents and an in-memory `window.APERTURE_HOLIDAY_EVENTS` buffer for QA only. Neither creates aggregate results.
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
1. Connect a real analytics destination such as a new PostHog project, and review its privacy/cookie configuration.
2. Implement a separate voluntary analytics consent control before loading third-party code; default to off, respect revocation and do-not-track.
3. Capture only the event names and allowlisted campaign tags above. Never capture gift recipient names, phone numbers, email addresses, raw share URLs or message bodies.
4. Verify events in the provider's live event debugger using test interactions; deduplicate page views and share completions.
5. Build a private funnel dashboard showing real visits → personalizations → share intents → share completions → confirmed opt-in requests → referrals → paid purchases → verified delivery. Leave missing measures as 'Not connected', not zero.
6. Reconcile Gmail replies and Stripe orders by actual IDs and timestamps. Do not attribute sales to sources lacking verifiable join evidence.

## SMS safeguards
- The site currently provides only a **manual email invitation request**. No SMS provider, sender number, A2P registration, double opt-in, or suppression webhook is connected.
- The consent checkbox defaults unchecked and is separate from the Terms acknowledgement; messages, frequency, rates, STOP/HELP, privacy, and support details are visible.
- A request email is **not** an SMS subscription. Before sending even one recurring SMS, deploy an approved provider, complete carrier registration, confirm the person explicitly opts in, persist the date/form disclosure/consent scope, and implement STOP/HELP/suppression and quiet-hour controls.
- Do not import prior Gmail addresses or unsolicited phone numbers as subscribers.
- Terms: /holiday/sms-terms.html. Privacy: /holiday/privacy.html.
