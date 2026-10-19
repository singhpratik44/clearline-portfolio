import test from "node:test";
import assert from "node:assert/strict";
import {encode,decode,equivalent,compute,roundTripCertificate} from "./representation.mjs";
const sample={demand:50,hours:55,follow:70,conversion:28,revenue:300};
test("reversible canonical representation",()=>{assert.deepEqual(decode(encode(sample)),sample);assert.equal(roundTripCertificate(sample).roundTripPassed,true);});
test("rejects malformed or unversioned representations",()=>{assert.throws(()=>decode({schema:"unknown",values:[1,2,3,4,5]}));assert.throws(()=>decode({schema:"clearline.scenario.v1",values:[1]}));});
test("same state independent of insertion order",()=>{assert.equal(equivalent(sample,{revenue:300,conversion:28,follow:70,hours:55,demand:50}),true);});
test("bounded capacity and nonnegative unserved demand",()=>{for(let demand=0;demand<=100;demand+=10)for(let hours=0;hours<=100;hours+=10){const s={...sample,demand,hours},r=compute(s);assert.equal(r.served,Math.min(demand,hours));assert.ok(r.unserved>=0);assert.equal(roundTripCertificate(s).outputPreserved,true);}});
test("rejects invalid percentages",()=>{assert.throws(()=>encode({...sample,follow:101}));assert.throws(()=>encode({...sample,conversion:-1}));});
