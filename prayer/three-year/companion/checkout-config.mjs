/**
 * A Quiet Journey — approved LIVE Stripe Payment Link.
 * Verified 2026-11-10 against Clearline Code's connected LIVE Stripe account:
 * 1 x $29 USD non-recurring Three-Year Companion Workbook price,
 * active link, hosted checkout, after-completion redirect to workbook.html.
 * Checkout is for original printable material only. Prayer and religious
 * resources remain free. The delivery URL is public and not access-controlled.
 *
 * Never add secret/restricted Stripe API keys to this public file.
 */
export const checkoutConfig=Object.freeze({
  enabled:true,
  productName:"A Quiet Journey — Three-Year Companion Workbook",
  proposedOneTimeUSD:29,
  stripePaymentUrl:"https://buy.stripe.com/9B6dRbdwO3bScAcbod6kg1i",
  fulfillment:"Active LIVE Stripe-hosted one-time checkout redirects to the shareable printable workbook HTML page. This static site does not verify payment entitlements."
});
