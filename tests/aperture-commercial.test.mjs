import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../aperture/commercialize/index.html',import.meta.url),'utf8');
test('commercial offers and inquiry present',()=>{for(const s of ['AI Workflow Sprint','Education Lab Pilot','Governed Operations System','id="lead"','id="goal"','id="email"'])assert.ok(html.includes(s),s)});
test('lead requires consent and explicit email send',()=>{assert.match(html,/id="consent"[^>]*required/);assert.match(html,/mailto:parry\.s\.2324@gmail\.com/);assert.match(html,/e\.preventDefault\(\)/)});
test('no embedded Stripe secrets or deceptive checkout',()=>{assert.doesNotMatch(html,/sk_live_|sk_test_|pk_live_|checkout\.stripe\.com\/c\/pay/);assert.match(html,/not a purchase/);assert.match(html,/No customer data, payments/);});
test('navigation points to actual feature paths',()=>{assert.match(html,/\.\.\/workbench\//);assert.match(html,/\.\.\/\.\.\/offers\.html/)});

test('five Stripe catalog products are listed without unverified checkout links',()=>{for(const id of ['prod_VfO0r0eyuH6OZF','prod_VfO05wIWLeHBLe','prod_VfO0gIwmEg9adv','prod_VfO0xMg1LaXIpy','prod_VfO0RdvkHjDzsH'])assert.ok(html.includes(id),id);assert.match(html,/Delivery verification pending/);assert.match(html,/No automatic charge/);assert.doesNotMatch(html,/buy\.stripe\.com\//);});
