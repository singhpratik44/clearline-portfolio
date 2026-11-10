/**
 * A Quiet Journey commerce configuration.
 * Safe by default: payment is NOT accepted until the owner chooses a Stripe account,
 * reviews the product and price, creates a legitimate LIVE payment link, and replaces
 * stripePaymentUrl with the exact active Stripe-hosted link.
 * Never put Stripe secret API keys in public GitHub Pages files.
 */
export const checkoutConfig=Object.freeze({
  enabled:false,
  productName:"A Quiet Journey — Three-Year Companion Workbook",
  proposedOneTimeUSD:29,
  stripePaymentUrl:"",
  fulfillment:"Stripe hosted payment link redirects to the shareable, printable workbook URL after checkout."
});
