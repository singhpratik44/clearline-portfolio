/* Public Stripe Payment Links only. Never put Stripe secret keys here.
 * 1. Create a verified Stripe account.
 * 2. In Stripe Dashboard > Payment Links, create a link for each confirmed offer.
 * 3. Paste its https://buy.stripe.com/... URL below.
 * 4. Checkout buttons appear automatically for configured offers.
 * 5. For subscriptions, create a recurring Price in Stripe before making its Payment Link.
 * 6. For payments that require an individual quote, leave the link blank and invoice via Stripe.
 */
(function(){
  "use strict";
  const links = Object.freeze({
    private: "",
    group: "",
    partner: ""
  });
  const allowed = /^https:\/\/(?:buy\.stripe\.com|checkout\.stripe\.com)\/[A-Za-z0-9_/?=&%-]+$/;
  document.querySelectorAll(".stripe-checkout[data-plan]").forEach(function(el){
    const link = links[el.dataset.plan];
    if(typeof link === "string" && allowed.test(link)){
      el.href = link;
      el.hidden = false;
      el.setAttribute("aria-label", "Continue to secure Stripe checkout for " + el.dataset.plan);
    } else {
      el.hidden = true;
      el.removeAttribute("href");
    }
  });
})();
