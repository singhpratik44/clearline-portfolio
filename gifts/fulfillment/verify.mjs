import { PURCHASE_LINK_SKU } from './payment-links.mjs';
import { LINK_AMOUNTS } from './amounts.mjs';

/**
 * Verify a checkout session with the Stripe secret key on the SERVER only.
 * A public Stripe checkout redirect is NEVER proof of payment by itself.
 * No names, addresses or emails are stored or returned.
 */
export async function verifyGiftPurchase(sessionId, {
  secret = process.env.STRIPE_SECRET_KEY,
  fetchFn = globalThis.fetch,
} = {}) {
  if(typeof sessionId!=='string' || !/^cs_(live|test)_[a-zA-Z0-9_]{10,256}$/.test(sessionId)) {
    return {ok:false,status:400,code:'invalid_session_id'};
  }
  if(typeof secret!=='string' || !/^(sk|rk)_live_/.test(secret)) {
    return {ok:false,status:503,code:'fulfillment_not_configured'};
  }
  let response;
  try {
    response=await fetchFn('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId), {
      method:'GET',
      headers:{Authorization:'Bearer '+secret,Accept:'application/json'},
      cache:'no-store',
      signal:AbortSignal.timeout(8000),
    });
  } catch (_err) {
    return {ok:false,status:502,code:'stripe_unavailable'};
  }
  if(!response?.ok) {
    return {ok:false,status:response?.status===404?403:502,code:'session_unverified'};
  }
  let session;
  try { session=await response.json(); } catch(_err) {
    return {ok:false,status:502,code:'invalid_stripe_response'};
  }
  const link=typeof session.payment_link==='string'?session.payment_link:session.payment_link?.id;
  const sku=Object.hasOwn(PURCHASE_LINK_SKU,link)?PURCHASE_LINK_SKU[link]:null;
  if(!sku || session.status!=='complete' || session.payment_status!=='paid' ||
      session.livemode!==true || session.mode!=='payment' || session.currency!=='usd' ||
      !Number.isInteger(session.amount_total) || session.amount_total<=0 ||
      !Number.isInteger(LINK_AMOUNTS[link]) || session.amount_total!==LINK_AMOUNTS[link]) {
    return {ok:false,status:403,code:'payment_not_authorized'};
  }
  return {ok:true,status:200,sku};
}
