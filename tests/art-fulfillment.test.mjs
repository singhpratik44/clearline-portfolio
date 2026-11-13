import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyArtPurchase,signArtToken,handleArt} from '../gifts/fulfillment/art.mjs';
import {createHmac} from 'node:crypto';
const key='this_is_a_test_only_secret_with_enough_bytes_1234567890';
const sid='cs_live_ABCDEFGHIJKLMNOPQRSTUV1234567';
const paid={id:sid,livemode:true,status:'complete',payment_status:'paid',mode:'payment',currency:'usd',amount_subtotal:1900,amount_total:1900,payment_link:'plink_1UbOdSRuy3ohymOHdcurManK'};
const fake=body=>async()=>({ok:true,json:async()=>body});
const verify=(body=paid)=>verifyArtPurchase(sid,{secret:'sk_live_testtoken1234',fetchFn:fake(body)});
const mockRes=()=>({status:0,headers:null,body:'',writeHead(status,headers){this.status=status;this.headers=headers;},end(text){this.body=text||'';}});
test('valid verified live exact payment-link sale grants only purchased SKU',async()=>{
  const result=await verify();assert.equal(result.ok,true);assert.equal(result.product.sku,'courtside');
});
test('payment status, mode, link, currency, subtotal, and live state are gates',async()=>{
  const bad=[{payment_status:'unpaid'},{status:'open'},{livemode:false},{mode:'subscription'},{currency:'eur'},{amount_subtotal:50},{amount_total:0},{payment_link:'plink_wrong'},{id:'cs_live_wrong'}];
  for(const patch of bad)assert.equal((await verify({...paid,...patch})).ok,false,JSON.stringify(patch));
});
test('test session and missing Stripe secrets never grant access',async()=>{
  assert.equal((await verifyArtPurchase('cs_test_ABCDEFGHIJKLMN12345',{secret:'sk_live_123',fetchFn:fake(paid)})).ok,false);
  assert.equal((await verifyArtPurchase(sid,{secret:'sk_test_123',fetchFn:fake(paid)})).ok,false);
});
test('Stripe network failures and unknown responses deny',async()=>{
  assert.equal((await verifyArtPurchase(sid,{secret:'sk_live_123',fetchFn:async()=>{throw Error('network')}})).ok,false);
  assert.equal((await verifyArtPurchase(sid,{secret:'sk_live_123',fetchFn:async()=>({ok:false,status:404})})).ok,false);
});
test('grants are signed and time-bounded; no Stripe IDs or email in tokens',()=>{
  const now=1700000000000;const token=signArtToken('beyond',{key,now});const [b,s]=token.split('.');
  assert.equal(s,createHmac('sha256',key).update(b).digest('base64url'));
  const body=JSON.parse(Buffer.from(b,'base64url').toString('utf8'));
  assert.deepEqual(body,{v:1,sku:'beyond',exp:1700000600});
  assert.equal(token.includes(sid),false);assert.throws(()=>signArtToken('unknown',{key,now}));
});
test('unverified session cannot view landing page or download',async()=>{
  const res=mockRes();await handleArt({method:'GET'},res,new URL('https://example.org/art/redeem'),{verify:async()=>({ok:false,status:400})});
  assert.equal(res.status,400);assert.equal(res.body.includes('Your art is ready'),false);
});
test('paid order generates a signed ZIP redirect only to trusted configured host',async()=>{
  const res=mockRes();const v=async()=>({ok:true,product:{sku:'premium',name:'Premium Archive'}});
  await handleArt({method:'GET'},res,new URL('https://example.org/art/download?session_id='+sid),{verify:v,sign:(sku)=>'signed-'+sku,downloadOrigin:'https://clearline-art-delivery.onrender.com'});
  assert.equal(res.status,303);assert.equal(res.headers.Location,'https://clearline-art-delivery.onrender.com/download?token=signed-premium');
});
test('bad destination cannot redirect even for a paid order',async()=>{
  const res=mockRes();await handleArt({method:'GET'},res,new URL('https://example.org/art/download?session_id='+sid),{verify:async()=>({ok:true,product:{sku:'premium',name:'Premium Archive'}}),downloadOrigin:'https://attacker.example/evil'});
  assert.equal(res.status,503);
});
test('paid landing includes a download button but no payment details in content',async()=>{
  const res=mockRes();await handleArt({method:'GET'},res,new URL('https://example.org/art/redeem?session_id='+sid),{verify:async()=>({ok:true,product:{sku:'courtside',name:'Courtside Collection'}})});
  assert.equal(res.status,200);assert.match(res.body,/Your art is ready/);assert.match(res.body,/Download my collection/);assert.equal(res.body.includes('sk_live_'),false);
});
