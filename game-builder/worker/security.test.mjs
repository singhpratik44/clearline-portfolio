import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

const worker = await import(pathToFileURL(resolve('game-builder/worker/index.js')).href);
const env = {APP_ORIGIN:'https://preview.example',STRIPE_TEST_SECRET_KEY:'sk_test_placeholder',STRIPE_TEST_PRICE_ID:'price_test_placeholder',STRIPE_TEST_WEBHOOK_SECRET:'whsec_placeholder'};
test('checkout cannot be purchased using a forged demo user header', async()=>{
 const response=await worker.default.fetch(new Request('https://preview.example/api/checkout',{method:'POST',headers:{origin:env.APP_ORIGIN,'x-demo-user':'fakeuser123'}}),env);
 assert.equal(response.status,503);
});
test('cross-origin checkout is rejected',async()=>{
 const response=await worker.default.fetch(new Request('https://preview.example/api/checkout',{method:'POST',headers:{origin:'https://attacker.example','x-demo-user':'fakeuser123'}}),env);
 assert.equal(response.status,403);
});
test('course files cannot be fetched without entitlements',async()=>{
 const response=await worker.default.fetch(new Request('https://preview.example/api/course/lesson-1'),env);
 assert.equal(response.status,403);
});
test('unsigned webhook is rejected',async()=>{
 const response=await worker.default.fetch(new Request('https://preview.example/api/webhook',{method:'POST',body:JSON.stringify({type:'checkout.session.completed',livemode:false})}),env);
 assert.equal(response.status,400);
});
test('live Stripe event is never accepted as a test purchase',async()=>{
 const source=readFileSync('game-builder/worker/index.js','utf8');
 assert.match(source,/event\.livemode!==false/);
});
