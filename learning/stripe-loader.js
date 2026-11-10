/* Privacy-conscious, deferred loading of Stripe's official public Buy Button.
 * No Stripe secret keys, API calls or personal learner data.
 * Loading occurs only after an adult deliberately opens checkout.
 */
(() => {
  "use strict";
  let loading = null;
  window.AP_loadStripeCheckout = () => {
    if(window.customElements?.get("stripe-buy-button")) return Promise.resolve(true);
    if(loading) return loading;
    loading = new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src="https://js.stripe.com/v3/buy-button.js";
      script.async=true;
      script.onload=()=>resolve(true);
      script.onerror=()=>{loading=null;reject(new Error("Stripe checkout could not load. Check your connection or content blocker."));};
      document.head.appendChild(script);
    });
    return loading;
  };
})();
