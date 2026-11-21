import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,existsSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve('game-builder/scratch');
const work=mkdtempSync(join(tmpdir(),'aperture-scratch-'));
try {
 execFileSync(process.execPath,[join(root,'build.mjs')],{cwd:work,stdio:'pipe'});
 for(let i=1;i<=4;i++){
  test('lesson '+i+' has a readable Scratch project and packaged assets',()=>{
   const dir=join(work,'lesson-'+i);
   const project=JSON.parse(readFileSync(join(dir,'project.json'),'utf8'));
   assert.equal(project.meta.semver,'3.0.0');
   assert.equal(project.targets.length,4);
   assert.ok(existsSync(join(work,'lesson-'+i+'.sb3')));
   for(const target of project.targets){
    for(const costume of target.costumes){
     const file=join(dir,costume.md5ext);
     assert.ok(existsSync(file),'missing costume '+costume.md5ext);
     assert.equal(createHash('md5').update(readFileSync(file)).digest('hex'),costume.assetId);
    }
    for(const [id,block] of Object.entries(target.blocks)){
     if(block.next)assert.ok(target.blocks[block.next],id+' has broken next '+block.next);
     if(block.parent)assert.ok(target.blocks[block.parent],id+' has broken parent '+block.parent);
    }
   }
  });
 }
 test('each course has distinct mechanics rather than four copies of one game',()=>{
  const signatures=[1,2,3,4].map(i=>{
   const project=JSON.parse(readFileSync(join(work,'lesson-'+i,'project.json'),'utf8'));
   return JSON.stringify(project.targets.map(t=>({name:t.name,opcodes:Object.values(t.blocks).map(b=>b.opcode).sort()})));
  });
  assert.equal(new Set(signatures).size,4,'Four unique games are required before launch');
 });
} finally {rmSync(work,{recursive:true,force:true});}
