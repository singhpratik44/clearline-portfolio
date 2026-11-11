import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {Readable} from 'node:stream';
import {CLASSICX,verifyClassicxPurchase,decryptClassicxZip,handleClassicxWebhook} from './classicx.mjs';
const secret='rk_live_dummy_key_not_a_real_credential';
const id='cs_live_'+'X'.repeat(50);
const links=Object.entries(CLASSICX);
function request(json, status=200){return async()=>({ok:status===200,status,json:async()=>json});}
function good(link,item){return {id,status:'complete',payment_status:'paid',livemode:true,mode:'payment',currency:'usd',amount_subtotal:item.cents,amount_total:item.cents,payment_link:link};}
for(const [link,item] of links){
  test('paid purchased SKU verified '+item.sku,async()=>{const v=await verifyClassicxPurchase(id,{secret,fetchFn:request(good(link,item))});assert.equal(v.ok,true);assert.equal(v.sku,item.sku);});
  test('ZIP decrypts and verifies '+item.sku+' when vault configured; otherwise fails closed',async()=>{if(!process.env.CLASSICX_VAULT_KEY){await assert.rejects(decryptClassicxZip(item.sku,{key:undefined}),/Vault not configured/);return;}const v=await decryptClassicxZip(item.sku);assert.equal(v.item.sku,item.sku);assert.ok(v.zip.length>3000);});
}
test('missing and malformed session denied',async()=>{assert.equal((await verifyClassicxPurchase('fake',{secret})).status,400);});
test('no secret denies',async()=>{assert.equal((await verifyClassicxPurchase(id,{secret:''})).status,503);});
test('wrong amount, mode, session ID, link, paid state denied',async()=>{const [link,item]=links[0];for(const patch of [{amount_subtotal:900},{mode:'subscription'},{id:'cs_live_bogus'},{payment_link:'plink_fake'},{payment_status:'unpaid'},{status:'open'},{livemode:false},{amount_total:0}]){const v=await verifyClassicxPurchase(id,{secret,fetchFn:request({...good(link,item),...patch})});assert.equal(v.status,403,JSON.stringify(patch));}});
test('promo code discount still grants verified order',async()=>{const [link,item]=links[1];const v=await verifyClassicxPurchase(id,{secret,fetchFn:request({...good(link,item),amount_total:1200})});assert.equal(v.ok,true);});
test('Stripe errors deny',async()=>{assert.equal((await verifyClassicxPurchase(id,{secret,fetchFn:request({},404)})).status,403);assert.equal((await verifyClassicxPurchase(id,{secret,fetchFn:async()=>{throw Error('network')}})).status,503);});
test('decryption denies wrong key',async()=>{await assert.rejects(decryptClassicxZip('one',{key:Buffer.alloc(32,7).toString('base64url')}));});
class Resp{constructor(){this.headers={};this.statusCode=200;}setHeader(k,v){this.headers[k]=v;}end(v){this.body=v;return this;}}
test('invalid webhook signature denied',async()=>{const req=Readable.from([JSON.stringify({type:'checkout.session.completed'})]);req.method='POST';req.headers={'stripe-signature':'t=123,v1='+''.padStart(64,'0')};const r=new Resp();await handleClassicxWebhook(req,r,{secret:'whsec_something'});assert.equal(r.statusCode,400);});
test('valid webhook event accepted only after signature validation',async()=>{const obj={livemode:true,type:'checkout.session.completed',data:{object:{payment_link:links[0][0],mode:'payment',currency:'usd',amount_subtotal:links[0][1].cents,payment_status:'paid'}}};const body=JSON.stringify(obj);const t=Math.floor(Date.now()/1000);const s='whsec_unit_test';const signature=createHmac('sha256',s).update(t+'.'+body).digest('hex');const req=Readable.from([body]);req.method='POST';req.headers={'stripe-signature':`t=${t},v1=${signature}`};const r=new Resp();await handleClassicxWebhook(req,r,{secret:s});assert.equal(r.statusCode,200);});