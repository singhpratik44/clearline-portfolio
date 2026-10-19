import { performance } from 'node:perf_hooks';
import { simulateOrganization } from '../src/organization-simulator.mjs';

const snapshot={version:1,nodes:[{id:'staff',completed:true},{id:'trial'},{id:'enroll'}],edges:[{from:'staff',to:'trial'},{from:'trial',to:'enroll'}]};
const candidates=Array.from({length:64},(_,i)=>({id:'proposal-'+i,targetNode:i%4===0?'trial':'enroll',owner:'director',baseVersion:1,prerequisites:['staff'],evidence:['fixture'],successMeasure:'enrollment',reversalCondition:'capacity',estimatedImpact:100-i,estimatedRisk:2,estimatedCost:1}));
const samples=[];
for(let i=0;i<20;i++){const start=performance.now();const result=await simulateOrganization(snapshot,candidates,{beamWidth:4});samples.push(performance.now()-start);if(i===0)console.log(JSON.stringify({evaluated:result.evaluatedCount,pruned:result.prunedCount,selected:result.projections.decisions.ranked.map(x=>x.id)}));}
samples.sort((a,b)=>a-b);console.log(JSON.stringify({iterations:samples.length,medianMs:+samples[10].toFixed(3),p95Ms:+samples[19].toFixed(3),note:'CI-host timings are not production latency or a speedup claim'}));
