import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../aperture/commercialize/index.html',import.meta.url),'utf8');
test('commercial offers and inquiry present',()=>{for(const s of ['AI Workflow Sprint','Education Lab Pilot','Governed Operations System','id="lead"','id="goal"','id="email"'])assert.ok(html.includes(s),s)});
test('lead requires consent and explicit email send',()=>{assert.match(html,/id="consent"[^>]*required/);assert.match(html,/mailto:parry\.s\.2324@gmail\.com/);assert.match(html,/e\.preventDefault\(\)/)});
test('no embedded Stripe secrets or deceptive checkout',()=>{assert.doesNotMatch(html,/sk_live_|sk_test_|pk_live_|checkout\.stripe\.com\/c\/pay/);assert.match(html,/not a purchase/);assert.match(html,/No customer data, payments/);});
test('navigation points to actual feature paths',()=>{assert.match(html,/\.\.\/workbench\//);assert.match(html,/\.\.\/\.\.\/offers\.html/)});
