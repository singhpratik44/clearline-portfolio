#!/usr/bin/env node
// APERTURE read-only deployment drift gate. No network calls, credentials or deployments.
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const read = p => readFileSync(p,'utf8');
const required = ['index.html','render.yaml','tests/site-integrity.test.mjs','tests/gift-fulfillment.test.mjs'];
for (const p of required) assert.ok(existsSync(p), 'Missing required file: '+p);
const config=read('render.yaml');
assert.match(config,/autoDeployTrigger:\s*["']?off/, 'Gift delivery must remain manually deployed');
assert.match(config,/healthCheckPath:\s*\/healthz/, 'Gift delivery health endpoint must be declared');
assert.match(config,/sync:\s*false/, 'Stripe secret must not be embedded in source');
const homepage=read('index.html');
assert.match(homepage,/<link rel="canonical"/, 'Canonical homepage URL is missing');
assert.match(homepage,/github\.io\/clearline-portfolio\//, 'Canonical homepage URL changed unexpectedly');
console.log('PASS: source layout, protected fulfillment deployment, secret boundary, canonical homepage');
console.log('NOTE: This does NOT validate live Render status, DNS, payments, or HTTP availability.');
