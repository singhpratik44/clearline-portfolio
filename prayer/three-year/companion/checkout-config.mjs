/**
 * A Quiet Journey — verified Stripe hosted checkout (public identifiers only).
 * Live, one-time USD $29 price. No card data, client-side secret or subscriptions.
 * Fulfillment is the public, shareable workbook URL configured in Stripe after_completion.
 * This is not a payment proof or authenticated entitlement system.
 */
export const checkoutConfig=Object.freeze({
  enabled:true,
  livemode:true,
  productName:"A Quiet Journey — Three-Year Companion Workbook",
  proposedOneTimeUSD:29,
  stripeProductId:"prod_Vbh7BW3lY2n0rc",
  stripePriceId:"price_1UaTjbRuy3ohymOH95dZrGSw",
  stripePaymentLinkId:"plink_1UaTkdRuy3ohymOHGJZ9bSGz",
  stripePaymentUrl:"https://buy.stripe.com/9B6dRbdwO3bScAcbod6kg1i",
  fulfillment:"Stripe redirects after successful Checkout to the publicly shareable workbook URL. No access control or cloud journal."
});
