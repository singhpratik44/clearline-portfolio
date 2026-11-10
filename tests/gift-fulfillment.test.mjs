import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyGiftPurchase} from '../gifts/fulfillment/verify.mjs';
import {BUNDLE_BOOKS} from '../gifts/fulfillment/bundles.mjs';
import {PURCHASE_LINK_SKU} from '../gifts/fulfillment/payment-links.mjs';

const validId='cs_live_'+'a'.repeat(48);
const validLink=Object.keys(PURCHASE_LINK_SKU).find(id=>PURCHASE_LINK_SKU[id]==='basketball-iq');
const secret='sk_live_example_test_token_not_real';
function mockSession(overrides={}) {
  return {status:'complete',payment_status:'paid',payment_link:validLink,livemode:true,mode:'payment',currency:'usd',amount_total:1500,...overrides};
}
function responder(session,status=200) {
  return async (_url,options)=>{
    assert.ok(options.headers.Authorization.startsWith('Bearer '));
    return {ok:status>=200&&status<300,status,json:async()=>session};
  };
}
test('all 44 Stripe payment links mapped to an entitlement',()=>{
  assert.equal(Object.keys(PURCHASE_LINK_SKU).length,59);
  assert.equal(BUNDLE_BOOKS['all-sports-bundle'].length,13);
  assert.equal(BUNDLE_BOOKS['all-vault'].length,21);
});
test('a completed live paid session grants its exact purchased SKU',async()=>{
  const r=await verifyGiftPurchase(validId,{secret,fetchFn:responder(mockSession())});
  assert.deepEqual(r,{ok:true,status:200,sku:'basketball-iq'});
});
test('redirect query alone is not a proof of purchase',async()=>{
  const r=await verifyGiftPurchase('hello',{secret,fetchFn:responder(mockSession())});
  assert.equal(r.ok,false);
  assert.equal(r.code,'invalid_session_id');
});
test('server refuses to operate without a Stripe server-side credential',async()=>{
  const r=await verifyGiftPurchase(validId,{secret:'',fetchFn:responder(mockSession())});
  assert.equal(r.status,503);
});
test('unpaid, incomplete, or testmode sessions are denied',async()=>{
  for(const field of [{payment_status:'unpaid'},{status:'open'},{livemode:false},{amount_total:0},{currency:'eur'},{mode:'subscription'}]) {
    const r=await verifyGiftPurchase(validId,{secret,fetchFn:responder(mockSession(field))});
    assert.equal(r.status,403,JSON.stringify(field));
  }
});
test('payment links outside the allowlist are denied',async()=>{
  const r=await verifyGiftPurchase(validId,{secret,fetchFn:responder(mockSession({payment_link:'plink_UNAUTHORIZED'}))});
  assert.equal(r.status,403);
});
test('Stripe API denial does not grant access',async()=>{
  const r=await verifyGiftPurchase(validId,{secret,fetchFn:responder({},404)});
  assert.equal(r.status,403);
});
test('Stripe network failures do not grant access',async()=>{
  const r=await verifyGiftPurchase(validId,{secret,fetchFn:async()=>{throw new Error('offline')}});
  assert.equal(r.status,502);
});
