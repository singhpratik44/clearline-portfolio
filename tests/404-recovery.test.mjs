import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
test('404 recovery routes lead to actual public files',async()=>{
 const html=await readFile(new URL('404.html',root),'utf8');
 for(const route of ['learning-lab.html','game-studio.html','curriculum.html']){
  assert.match(html,new RegExp('href="/clearline-portfolio/'+route.replace('.','\\.')+'"'));
  const file=new URL(route,root);assert.ok((await stat(file)).isFile(),route);
 }
 assert.match(html,/name="viewport"/);
});
