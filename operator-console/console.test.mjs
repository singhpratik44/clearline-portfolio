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
  let sent, calls = 0;
  const url = await start(t, { APERTURE_OPERATOR_PASSWORD: password, OPENAI_API_KEY:'test' }, async brief => {
    sent = brief; calls++; return 'Simulated review.';
  });
  const brief = briefing(rank(sample, today), today, false, false);
  const post = body => fetch(url + '/review', { method:'POST', headers:{ ...auth, origin:url, 'content-type':'application/json' }, body:JSON.stringify(body) });
  assert.equal((await post({})).status, 400);
  assert.equal((await post({...brief, notes:'discard me'})).status, 200);
  assert.deepEqual(sent, brief);
  const repeat = await post(brief);
  assert.equal((await repeat.json()).cached, true);
  assert.equal(calls, 1);
  assert.equal((await post({...brief, simulated: true})).status, 429);
});

test('a streaming review delivers the first text before completion and then serves the cached answer', async t => {
  const gate = Promise.withResolvers();
  t.after(() => gate.resolve());
  let calls = 0;
  const url = await start(t, { APERTURE_OPERATOR_PASSWORD: password, OPENAI_API_KEY: 'test' },
    async (brief, key, model, onText) => {
      calls++;
      onText('First choice');
      await gate.promise;
      return 'First choice, with supporting evidence.';
    });
  const post = () => fetch(url + '/review', {
    method: 'POST',
    headers: { ...auth, origin: url, 'content-type': 'application/json', accept: 'application/x-ndjson' },
    body: JSON.stringify(briefing(rank(sample, today), today, true, false)),
    signal: AbortSignal.timeout(3000)
  });
  const first = await post();
  const reader = first.body.pipeThrough(new TextDecoderStream()).getReader();
  let received = '';
  while (!received.includes('\n')) {
    const part = await reader.read();
    assert.equal(part.done, false);
    received += part.value;
  }
  assert.deepEqual(JSON.parse(received), { text: 'First choice' });
  gate.resolve();
  let final = '';
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    final += part.value;
  }
  const { advice } = JSON.parse(final);
  assert.equal(advice, 'First choice, with supporting evidence.');
  assert.deepEqual(await (await post()).json(), { advice, cached: true });
  assert.equal(calls, 1);
});

test('only a specialist request uses the three-agent configuration and its cached result', async t => {
  const seen = [];
  const url = await start(t, { APERTURE_OPERATOR_PASSWORD: password, OPENAI_API_KEY: 'test' },
    async (brief, key, model, onText, mode, onProgress) => {
      seen.push({ model, mode });
      onProgress(1); onProgress(2); onProgress(3);
      return 'Sample specialist synthesis.';
    });
  const brief = briefing(rank(sample, today), today, true, false);
  const post = mode => fetch(url + '/review', {
    method: 'POST', headers: { ...auth, origin: url, 'content-type': 'application/json', accept: 'application/x-ndjson' },
    body: JSON.stringify({ ...brief, mode })
  });
  assert.equal((await post('other')).status, 400);
  const first = await post('specialist');
  const records = (await first.text()).trimEnd().split('\n').map(line => JSON.parse(line));
  assert.deepEqual(records, [{ specialistsStarted: 1 }, { specialistsStarted: 2 }, { specialistsStarted: 3 }, { advice: 'Sample specialist synthesis.', cached: false }]);
  assert.equal((await (await post('specialist')).json()).cached, true);
  assert.equal((await post('standard')).status, 429);
  assert.deepEqual(seen, [{ model: 'gpt-6.2-astra', mode: 'specialist' }]);
});
