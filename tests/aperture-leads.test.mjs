import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../aperture/leads/index.html',import.meta.url),'utf8');
test('lead stages and local-only disclosure',()=>{for(const s of ['New inquiry','Proposal approved','Payment offered','Payment verified','Private-device demonstration only'])assert.ok(html.includes(s),s)});
test('cannot assert payment verified or skip stages',()=>{assert.match(html,/stages\.indexOf\(next\)>stages\.indexOf\("Payment offered"\)/);assert.match(html,/stages\.indexOf\(next\)>stages\.indexOf\(lead\.stage\)\+1/);assert.match(html,/independently verified payment system/)});
test('safe text rendering and deletion',()=>{assert.match(html,/title\.textContent=/);assert.match(html,/list\.replaceChildren\(\)/);assert.match(html,/confirm\("Delete all locally stored/)});
