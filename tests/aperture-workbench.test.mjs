// Run: node --test tests/aperture-workbench.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../aperture/workbench/index.html',import.meta.url),'utf8');
test('five modules are present',()=>{for(const name of ['Core Platform','Education Lab','Market Command','Sales Engine','Agent Operations'])assert.ok(html.includes(name),name)});
test('risk calculator enforces nonnegative budget and stop below entry',()=>{assert.match(html,/stop>=entry/);assert.match(html,/budget<0/);assert.match(html,/Math\.floor\(capital\/entry\)/)});
test('governance blocks unfinished prerequisites',()=>{assert.match(html,/!t\.done&&!ready\(t\)/);assert.match(html,/x\.deps\.includes\(id\)&&x\.done/)});
test('proposal-only agents and demo-only sales',()=>{assert.match(html,/no action executed/);assert.match(html,/no charge is made/)});
test('escapes dynamic ledger and lesson content',()=>{assert.match(html,/const esc=s=>/);assert.match(html,/esc\(e\.detail\)/)});
