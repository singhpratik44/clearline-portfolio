import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyGiftPurchase} from '../gifts/fulfillment/verify.mjs';
import {loadBooks,renderBook} from '../gifts/fulfillment/renderer.mjs';
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
test('all 69 Stripe payment links mapped to an entitlement',()=>{
  assert.ok(Object.keys(PURCHASE_LINK_SKU).length>=69);
  assert.equal(PURCHASE_LINK_SKU['plink_1UaPILRuy3ohymOHuQwOP1lN'],'achievement-awards');
  assert.equal(BUNDLE_BOOKS['all-sports-bundle'].length,33);
  assert.equal(BUNDLE_BOOKS['all-vault'].length,54);
});
test('server-side activity renderer covers all 54 original printable workbooks',async()=>{
  const books=await loadBooks();
  assert.equal(Object.keys(books).length,54);
  assert.equal(books['point-guard-lab'].quests.length,8);
  assert.equal(books['basketball-dreambook'].quests.length,8);
  assert.equal(books['basketball-iq'].quests.length,8);
  assert.ok(renderBook(books['defensive-iq']).includes('Print / Save PDF'));
  assert.ok(BUNDLE_BOOKS['basketball-coach-studio'].every(sku=>books[sku]));
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
test('wrong total never grants a different product',async()=>{
  const r=await verifyGiftPurchase(validId,{secret,fetchFn:responder(mockSession({amount_total:900}))});
  assert.equal(r.status,403);
  assert.equal(r.code,'payment_not_authorized');
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

test('team checkout is bound to exact $99 amount and two workbooks',async()=>{
 const link='plink_1UaQ8dRuy3ohymOH9kQ6t0ay';
 assert.equal(PURCHASE_LINK_SKU[link],'basketball-team-20');
 assert.deepEqual(BUNDLE_BOOKS['basketball-team-20'],['basketball-iq','coach-practice']);
 const good=await verifyGiftPurchase(validId,{secret,fetchFn:responder(mockSession({payment_link:link,amount_total:9900}))});
 assert.deepEqual(good,{ok:true,status:200,sku:'basketball-team-20'});
 const bad=await verifyGiftPurchase(validId,{secret,fetchFn:responder(mockSession({payment_link:link,amount_total:1500}))});
 assert.equal(bad.ok,false);
 assert.equal(bad.status,403);
});

import {verifyQuietPurchase,buildQuietPdf,DAYS} from '../gifts/fulfillment/quiet-journal.mjs';
const journalSession='cs_live_'+'b'.repeat(48);
const quietOk={status:'complete',payment_status:'paid',payment_link:'plink_1UaTfeRuy3ohymOHLkzMJK3n',livemode:true,mode:'payment',currency:'usd',amount_total:1900};
test('Quiet Practice generates exactly 25 printable pages with journal content',()=>{
  assert.equal(DAYS.length,21);
  const pdf=buildQuietPdf();
  assert.ok(pdf.subarray(0,8).toString('ascii').startsWith('%PDF-1.4'));
  const t=pdf.toString('ascii');
  assert.equal((t.match(/\/Type \/Page \/Parent /g)||[]).length,25);
  assert.ok(t.includes('Make room'));
  assert.ok(t.includes('Keep going, gently'));
  assert.ok(t.includes('startxref'));
});
test('Quiet Practice only grants the exact live $19 Stripe product',async()=>{
  const r=await verifyQuietPurchase(journalSession,{secret,fetchFn:responder(quietOk)});
  assert.deepEqual(r,{ok:true,status:200});
  for(const wrong of [
    {payment_link:'plink_1UaNRBRuy3ohymOHZqchj3I2'},
    {amount_total:2000},{amount_total:0},{status:'open'},
    {payment_status:'unpaid'},{livemode:false},{mode:'subscription'},{currency:'cad'},
  ]) {
    const bad=await verifyQuietPurchase(journalSession,{secret,fetchFn:responder({...quietOk,...wrong})});
    assert.equal(bad.ok,false,JSON.stringify(wrong));
    assert.equal(bad.status,403);
  }
});
test('Quiet Practice denies missing, forged and unverifiable session IDs',async()=>{
  for(const id of ['',undefined,'cs_test_fake','fake']) {
    const r=await verifyQuietPurchase(id,{secret,fetchFn:responder(quietOk)});
    assert.equal(r.ok,false);
    assert.equal(r.status,400);
  }
  const missingKey=await verifyQuietPurchase(journalSession,{secret:'',fetchFn:responder(quietOk)});
  assert.equal(missingKey.status,503);
  const stripeDenied=await verifyQuietPurchase(journalSession,{secret,fetchFn:responder({},404)});
  assert.equal(stripeDenied.status,403);
  const networkDown=await verifyQuietPurchase(journalSession,{secret,fetchFn:async()=>{throw new Error('down')}});
  assert.equal(networkDown.status,502);
});
