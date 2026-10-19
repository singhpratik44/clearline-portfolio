import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulateOrganization } from '../src/organization-simulator.mjs';
const snapshot = {version:2,nodes:[{id:'staff',completed:true},{id:'trial'},{id:'enroll'}],edges:[{from:'staff',to:'trial'},{from:'trial',to:'enroll'}]};
const make = (id,targetNode)=>({id,targetNode,owner:'director',baseVersion:2,prerequisites:['staff'],evidence:['verified'],successMeasure:'conversion',reversalCondition:'capacity',estimatedImpact:10,estimatedRisk:2,estimatedCost:1});
test('projects one versioned world into consistent views',async()=>{const r=await simulateOrganization(snapshot,[make('p','trial')]);assert.deepEqual(r.projections.operations.ready,['trial']);assert.deepEqual(r.projections.risk.downstreamImpact.staff,['enroll','trial']);assert.deepEqual(r.projections.decisions.ranked.map(x=>x.id),['p']);});
test('prevents proposals targeting blocked work',async()=>{const r=await simulateOrganization(snapshot,[make('p','enroll')]);assert.equal(r.projections.decisions.ranked.length,0);assert.equal(r.projections.decisions.rejected.length,1);});
test('simulation cannot mutate authoritative snapshot',async()=>{const before=structuredClone(snapshot),p=[make('p','trial')],prev=structuredClone(p);await simulateOrganization(snapshot,p);assert.deepEqual(snapshot,before);assert.deepEqual(p,prev);});
test('rejects cycles before solver invocation',async()=>{await assert.rejects(simulateOrganization({...snapshot,edges:[...snapshot.edges,{from:'enroll',to:'staff'}]},[]),/cycle/);});
