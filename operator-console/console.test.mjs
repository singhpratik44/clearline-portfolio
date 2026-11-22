import assert from 'node:assert/strict';
import { test } from 'node:test';
import { once } from 'node:events';
import core from '../mission-control/core.js';
import { rank, previewCompletion, briefing, whyFirst } from './decision.mjs';
import { makeServer } from './server.mjs';

const today = '2026-11-22';
const projects = [{ id: 'launch', name: 'Launch' }];
const task = (id, title, due, blockedBy = []) => ({ id, title, due, blockedBy, status: 'todo',
  projectId: 'launch', owner: 'Private owner', source: 'Private meeting note' });
const sample = core.normalize({ projects, tasks: [
  task('verify', 'Verify checkout delivery', null),
  task('announce', 'Announce the release', '2026-11-21', ['verify']),
  task('proof', 'Capture delivery proof', null, ['verify']),
  task('adjust', 'Revise the home page', '2026-11-24'),
  task('followup', 'Review launch results', null, ['announce', 'proof'])
] });
test('an overdue dependent raises the urgency of the prerequisite', () => {
  const ranking = rank(sample, today);
  assert.deepEqual(ranking.ready.map(t => t.id), ['verify', 'adjust']);
  assert.equal(ranking.blocked, 3);
  assert.equal(ranking.ready[0].reach, 3);
  assert.deepEqual(ranking.ready[0].unlocks, ['Announce the release', 'Capture delivery proof']);
  assert.match(whyFirst(...ranking.ready), /more urgent/);
});
test('a preview makes new work available and keeps multi-prerequisite work blocked', () => {
  const preview = previewCompletion(sample, 'verify', today);
  assert.equal(rank(preview, today).ready[0].id, 'announce');
  assert.equal(rank(preview, today).blocked, 1);
  assert.equal(sample.tasks[0].status, 'todo');
  assert.throws(() => previewCompletion(sample, 'announce', today), /ready/);
});
test('empty and fully complete missions have no recommendation', () => {
  assert.equal(rank(core.blank(), today).ready.length, 0);
  assert.equal(rank({...sample, tasks: sample.tasks.map(t => ({...t, status:'done'}))}, today).done, 5);
});
test('brief excludes owners, source notes and meetings', () => {
  const brief = briefing(rank(sample, today), today, false, true);
  assert.equal(brief.simulated, true);
  assert.doesNotMatch(JSON.stringify(brief), /Private|source|owner|meetings/);
});

const password = 'test-only-operator-password';
async function start(t, env, review) {
  const server = makeServer(env, review).listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  return 'http://127.0.0.1:' + server.address().port;
}
const auth = { authorization: 'Basic ' + Buffer.from('operator:' + password).toString('base64') };
test('service health works while missing credentials lock the console', async t => {
  const url = await start(t, {});
  assert.equal((await fetch(url + '/healthz')).status, 200);
  assert.equal((await fetch(url + '/')).status, 503);
});
test('private assets require authentication and the review route requires same origin', async t => {
  const url = await start(t, { APERTURE_OPERATOR_PASSWORD: password });
  for (const path of ['/', '/core.js', '/settings']) assert.equal((await fetch(url + path)).status, 401);
  const get = path => fetch(url + path, { headers: auth });
  assert.match(await (await get('/')).text(), /What should move next/);
  assert.equal((await get('/server.mjs')).status, 404);
  assert.equal((await (await get('/settings')).json()).reviewEnabled, false);
  for (const [origin, expected] of [['https://example.com',403], [url,503]]) {
    assert.equal((await fetch(url + '/review', {method:'POST',headers:{...auth,origin,'content-type':'application/json'},body:'{}'})).status, expected);
  }
});
test('AI receives whitelisted shortlist fields, only on explicit request', async t => {
  let sent;
  const url = await start(t, { APERTURE_OPERATOR_PASSWORD: password, OPENAI_API_KEY:'test' }, async brief => {
    sent = brief; return 'Simulated review.';
  });
  const brief = briefing(rank(sample, today), today, false, false);
  const post = body => fetch(url + '/review', { method:'POST', headers:{ ...auth, origin:url, 'content-type':'application/json' }, body:JSON.stringify(body) });
  assert.equal((await post({})).status, 400);
  assert.equal((await post({...brief, notes:'discard me'})).status, 200);
  assert.deepEqual(sent, brief);
  assert.equal((await post(brief)).status, 429);
});
