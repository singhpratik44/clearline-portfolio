import '/core.js';
import { rank, whyFirst, previewCompletion, briefing } from './decision.mjs';
const core = globalThis.ApertureMission;
const el = id => document.getElementById(id);
const now = new Date();
const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
let original = core.sample(), snapshot = original, source = 'Mission Control sample', steps = 0;
let enabled = false, pending = false, version = 0;
function add(parent, tag, content, style) {
  const element = document.createElement(tag);
  element.textContent = content;
  if (style) element.className = style;
  parent.append(element);
  return element;
}
function render() {
  const {ready, blocked, done} = rank(snapshot, today);
  el('context').textContent = source + (steps ? ' · What-if preview (' + steps + ' completed)' : '');
  el('summary').textContent = ready.length + ' ready to start · ' + blocked + ' blocked · ' + done + ' complete';
  el('reset').hidden = !steps;
  el('choices').replaceChildren();
  if (!ready.length) add(el('choices'), 'p', snapshot.tasks.length ? 'Every task in this snapshot is complete.' : 'This snapshot has no tasks. Import a Mission Control export to rank work.');
  for (const [i, task] of ready.slice(0, 3).entries()) {
    const card = document.createElement('article');
    el('choices').append(card);
    add(card, 'div', (i === 0 ? 'Recommended' : 'Alternative ' + i) + ' · ' + task.project, 'label');
    add(card, 'h2', task.title);
    if (i === 0) add(card, 'p', whyFirst(task, ready[1]));
    add(card, 'p', [task.owner || 'No owner recorded', task.due ? 'Due ' + task.due : 'No task deadline'].join(' · '));
    if (task.deadline && task.deadline !== task.due) add(card, 'p', 'Earliest deadline this would unlock: ' + task.deadline);
    add(card, 'p', task.unlocks.length ? 'Ready after completion: ' + task.unlocks.join(', ') : 'Completing this task alone opens no other task.');
    if (i === 0) add(card, 'p', task.source ? 'Recorded source: ' + task.source : 'The snapshot provides no source for this task.');
    add(card, 'button', 'Preview completion').onclick = () => {
      snapshot = previewCompletion(snapshot, task.id, today);
      steps++; changed();
    };
  }
  el('review').disabled = !enabled || pending || !ready.length;
  el('specialists').disabled = !enabled || pending || !ready.length;
}
el('specialists').onchange = changed;
function changed() {
  version++;
  el('advice').textContent = ''; el('error').textContent = '';
  render();
}
el('reset').onclick = () => { snapshot = original; steps = 0; changed(); };
el('file').onchange = async event => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 4 * 1024 * 1024) throw Error('Choose a Mission Control export under 4 MB.');
    const data = JSON.parse(await file.text());
    if (data?.schema !== 'aperture-mission-v1' || !Array.isArray(data.tasks)) throw Error('Choose a Mission Control JSON export.');
    original = core.normalize(data); snapshot = original; source = file.name + (original.sample ? ' · Sample data' : ''); steps = 0; changed();
  } catch (error) { el('error').textContent = error.message; }
  finally { event.target.value = ''; }
};
async function readReview(response, showPartial, showProgress) {
  if (!response.headers.get('content-type')?.includes('application/x-ndjson')) return response.json();
  let buffer = '', advice = '', result;
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = (buffer + value).split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const event = JSON.parse(line);
        if (event.error) throw Error(event.error);
        if (event.specialistsStarted && !advice) showProgress(event.specialistsStarted);
        if (typeof event.text === 'string') {
          advice += event.text;
          showPartial(advice);
        }
        if (typeof event.advice === 'string') result = event;
      }
    }
  } finally { reader.releaseLock(); }
  if (!result) throw Error('The review was interrupted before it finished.');
  return result;
}
el('review').onclick = async () => {
  const currentVersion = version;
  const mode = el('specialists').checked ? 'specialist' : 'standard';
  pending = true; render();
  el('advice').setAttribute('aria-busy', 'true');
  el('advice').textContent = 'Reviewing the shortlist…';
  try {
    const response = await fetch('/review', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
      body: JSON.stringify({ ...briefing(rank(snapshot, today), today, snapshot.sample, steps > 0), mode }) });
    if (!response.ok) throw Error(await response.text());
    const result = await readReview(response, text => {
      if (version === currentVersion) el('advice').textContent = text;
    }, count => {
      if (version === currentVersion) el('advice').textContent = count === 1 ? 'First specialist started…' : 'Both specialists started…';
    });
    if (version === currentVersion) el('advice').textContent = (result.cached ? 'Reused previous review.\n\n' : '') + result.advice;
  } catch (error) { if (version === currentVersion) el('advice').textContent = error.message; }
  finally { el('advice').removeAttribute('aria-busy'); pending = false; render(); }
};
render();
try {
  enabled = (await (await fetch('/settings')).json()).reviewEnabled;
  if (!enabled) el('review-info').textContent = 'Add OPENAI_API_KEY in the Render service environment to enable an on-demand review. Ranking and previews already work locally.';
} catch { el('review-info').textContent = 'Could not check AI review availability. Reload to try again.'; }
render();
