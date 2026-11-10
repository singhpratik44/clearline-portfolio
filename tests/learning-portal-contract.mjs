import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const text=(path)=>readFileSync(new URL('../'+path, import.meta.url),'utf8');
const portalHtml=text('learning/portal/index.html');
const portalJs=text('learning/portal/portal.js');
const config=text('learning/portal/config.js');
const schema=text('learning/portal/001_secure_schema.sql');
const atlas=text('learning/catalog/catalog.js');
const universe=text('learning/universe/universe.js');

test('portal is fail-closed and no credentials are committed',()=>{
 assert.match(config,/enabled:\s*false/);
 assert.match(config,/supabaseUrl:\s*["']{2}/);
 assert.match(config,/supabasePublishableKey:\s*["']{2}/);
 assert.doesNotMatch(config+portalHtml+portalJs,/(?:service_role|sb_secret_)[\w-]{10,}/i);
 assert.match(portalJs,/cfg\.enabled!==true/);
 assert.match(portalJs,/show\("setup-panel",true\)/);
});
test('DOM bindings point to real elements',()=>{
 const idList=[...portalHtml.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 const used=[...portalJs.matchAll(/\$\("([^"]+)"\)/g)].map(x=>x[1]);
 assert.equal(idList.length,new Set(idList).size,'duplicate HTML IDs');
 for(const name of used)assert.ok(idList.includes(name), 'missing portal element '+name);
});
test('database draft enables RLS and prevents anonymous access',()=>{
 for(const table of ['ap_learner_profiles','ap_coach_assignments','ap_projects','ap_submissions','ap_coach_reviews','ap_data_requests']){
   assert.match(schema,new RegExp('alter table public\\.'+table+' enable row level security;'));
 }
 assert.match(schema,/revoke all on table[\s\S]+from public,anon,authenticated;/);
 assert.match(schema,/create policy ap_review_insert/);
 assert.match(schema,/app_private\.ap_is_coach/);
 assert.match(schema,/grant select,insert on public\.ap_coach_reviews/);
 assert.match(schema,/split_part\(artifact_path,'\/',3\)=project_id::text/);
 assert.match(schema,/public=false/);
 assert.match(schema,/aperture-learner-work/);
});
test('verified milestones are based on reviewer data, not checkboxes',()=>{
 assert.match(portalJs,/reviews\.some\(r=>r\.submission_id===s\.id&&r\.verdict==="verified"\)/);
 assert.match(portalJs,/Guardian|guardian/i);
 assert.match(portalJs,/created_by:authorId/);
 assert.match(portalJs,/coach_id:authorId/);
});
test('all portal specialization IDs match the existing 4D universe',()=>{
 const ids=(x)=>new Set([...x.matchAll(/\{id:"([a-z0-9-]+)"/g)].map(m=>m[1]));
 const universeIds=ids(universe),atlasIds=ids(atlas);
 const portalTracks=new Set([...portalJs.matchAll(/\["([a-z0-9-]+)","/g)].map(m=>m[1]));
 assert.equal(universeIds.size,20);
 assert.deepEqual(universeIds,atlasIds);
 assert.deepEqual(portalTracks,universeIds);
});
