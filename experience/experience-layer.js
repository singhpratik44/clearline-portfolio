import { experiences } from './content.js';

const maxNoteLength = 240;
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

/**
 * Embeddable, dependency-free experience layer.
 * No analytics, network requests, accounts, cookies, or storage writes.
 * Notes remain in JavaScript memory and disappear when the page reloads.
 */
export function createExperienceLayer(container, options = {}) {
  if (!(container instanceof HTMLElement)) throw new TypeError('A DOM container is required');
  const ids = experiences.map(experience => experience.id);
  const queryId = (() => {
    try { return new URL(location.href).searchParams.get('experience'); }
    catch { return null; }
  })();
  const initialId = [options.initialExperience, queryId, 'awareness'].find(id => ids.includes(id));
  const state = {
    selected: initialId,
    step: 0,
    quiet: false,
    complete: false,
    answers: Object.create(null),
    notes: Object.create(null),
    ideaIndices: Object.create(null),
    breathing: true,
    shareOpen: false,
    status: ''
  };
  let destroyed = false;
  const current = () => experiences.find(e => e.id === state.selected);
  const stepKey = () => `${state.selected}:${state.step}`;
  const stepData = () => current().steps[state.step];
  const note = () => state.notes[stepKey()] || '';
  const urlForSharing = () => {
    try {
      const url = new URL(location.href);
      url.searchParams.set('experience', state.selected);
      url.hash = '';
      return url.href;
    } catch { return ''; }
  };
  const isPublicLink = () => location.protocol === 'https:' &&
    !['localhost', '127.0.0.1'].includes(location.hostname);

  function notify() {
    if (typeof options.onChange === 'function') {
      options.onChange({ experience: state.selected, step: state.step, quiet: state.quiet, complete: state.complete });
    }
  }
  function updateLink() {
    if (!options.syncURL) return;
    try {
      const url = new URL(location.href);
      url.searchParams.set('experience', state.selected);
      history.replaceState(history.state, '', url);
    } catch { /* file:// or embedded contexts may restrict history writes */ }
  }
  function activityMarkup(activity) {
    switch (activity.type) {
      case 'choice': {
        const chosen = state.answers[stepKey()] || '';
        return `<div class="ael-activity ael-choice-activity">
          <div class="ael-activity-label">${escapeHTML(activity.label)}</div>
          <div class="ael-chip-row">${activity.options.map((option, index) => `
            <button type="button" class="ael-chip ${chosen === option ? 'is-picked' : ''}" data-action="choice" data-value="${index}" aria-pressed="${chosen === option}">${escapeHTML(option)}</button>
          `).join('')}</div>
          ${chosen ? `<p class="ael-gentle-feedback" role="status">${escapeHTML(activity.response)}</p>` : '<p class="ael-gentle-hint">Optional. There is no right answer.</p>'}
        </div>`;
      }
      case 'reflection':
        return `<div class="ael-activity ael-reflection">
          <label class="ael-activity-label" for="ael-private-note">${escapeHTML(activity.label)}</label>
          <textarea id="ael-private-note" data-note maxlength="${maxNoteLength}" rows="3" placeholder="${escapeHTML(activity.placeholder)}">${escapeHTML(note())}</textarea>
          <div class="ael-note-bottom"><span>Private to this open page. Never sent or saved.</span><span data-note-count>${note().length}/${maxNoteLength}</span></div>
        </div>`;
      case 'ideas': {
        const ideaIndex = state.ideaIndices[stepKey()] || 0;
        return `<div class="ael-activity ael-idea">
          <div class="ael-activity-label">A question to carry</div>
          <p class="ael-idea-text">“${escapeHTML(activity.options[ideaIndex])}”</p>
          <button class="ael-text-button" type="button" data-action="new-idea">✧ Another possibility <span aria-hidden="true">↗</span></button>
        </div>`;
      }
      case 'breath':
        return `<div class="ael-activity ael-breath-activity">
          <div class="ael-breath-wrap ${state.breathing ? '' : 'is-paused'}" role="img" aria-label="Gentle expanding and contracting circle; optional visual breathing guide">
            <div class="ael-breath-orb"><span aria-hidden="true">◌</span></div>
          </div>
          <button class="ael-text-button" type="button" data-action="breath" aria-pressed="${state.breathing}">${state.breathing ? 'Ⅱ Pause visual guide' : '▷ Resume visual guide'}</button>
          <p class="ael-gentle-hint">No pace to match. Breathe naturally if the guide is not comfortable.</p>
        </div>`;
      case 'pause':
        return `<div class="ael-activity ael-pause"><div class="ael-pause-symbol" aria-hidden="true">✦</div><p>You can stay with this moment for as long as you like.</p><p class="ael-gentle-hint">No timer. No score. No obligation to finish.</p></div>`;
      default: return '';
    }
  }
  function stepMarkup() {
    const exp = current();
    const step = stepData();
    const progress = Math.round(((state.step + 1) / exp.steps.length) * 100);
    return `<section class="ael-journey" aria-labelledby="ael-step-heading">
      <div class="ael-journey-top">
        <span class="ael-kicker">${escapeHTML(exp.name)} <span class="ael-separator">·</span> ${escapeHTML(exp.verb)}</span>
        <span class="ael-step-count">${state.step + 1} / ${exp.steps.length}</span>
      </div>
      <div class="ael-progress" role="progressbar" aria-label="Journey progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><div style="width:${progress}%"></div></div>
      <div class="ael-journey-content">
        <div class="ael-journey-glow" aria-hidden="true"><span>${escapeHTML(exp.symbol)}</span></div>
        <div class="ael-eyebrow">A moment to ${escapeHTML(exp.verb.toLowerCase())}</div>
        <h2 id="ael-step-heading" tabindex="-1">${escapeHTML(step.title)}</h2>
        <p class="ael-step-copy">${escapeHTML(step.text)}</p>
        ${activityMarkup(step.activity)}
      </div>
      <div class="ael-journey-footer">
        <button class="ael-btn ael-btn-ghost" type="button" data-action="back" ${state.step === 0 ? 'disabled' : ''}><span aria-hidden="true">←</span> Back</button>
        <span class="ael-unhurried">At your own pace</span>
        <button class="ael-btn ael-btn-primary" type="button" data-action="next">${state.step === exp.steps.length - 1 ? 'Finish this moment' : 'Continue'} <span aria-hidden="true">→</span></button>
      </div>
    </section>`;
  }
  function completeMarkup() {
    const exp = current();
    return `<section class="ael-journey ael-complete" aria-labelledby="ael-complete-heading">
      <div class="ael-complete-symbol" aria-hidden="true">${escapeHTML(exp.symbol)}</div>
      <div class="ael-eyebrow">A moment well met</div>
      <h2 id="ael-complete-heading" tabindex="-1">${escapeHTML(exp.closing)}</h2>
      <p>Nothing needs to be earned. You can rest here, return to this path, or discover another.</p>
      <div class="ael-complete-actions">
        <button class="ael-btn ael-btn-primary" type="button" data-action="restart">Begin again ↺</button>
        <button class="ael-btn ael-btn-outline" type="button" data-action="surprise">Explore another ✧</button>
      </div>
    </section>`;
  }
  function shareMarkup() {
    if (!state.shareOpen) return '';
    const link = urlForSharing();
    return `<div class="ael-share-panel" aria-label="Share this experience">
      <p><strong>Invite someone to ${escapeHTML(current().verb.toLowerCase())}.</strong> Send the link only if you'd like to.</p>
      <label for="ael-share-url">Link to ${escapeHTML(current().name)}</label>
      <div class="ael-share-row"><input id="ael-share-url" value="${escapeHTML(link)}" readonly aria-readonly="true" /><button class="ael-btn ael-btn-outline" type="button" data-action="copy">Copy</button></div>
      ${!isPublicLink() ? '<p class="ael-share-note">This is a local preview link. Publish the site before sharing it with other people.</p>' : ''}
    </div>`;
  }
  function render({ focus = '', announce = '' } = {}) {
    if (destroyed) return;
    const exp = current();
    container.innerHTML = `<div class="ael ${state.quiet ? 'is-quiet' : ''}" data-hue="${escapeHTML(exp.hue)}" id="ael-app">
      <div class="ael-sky" aria-hidden="true"><div class="ael-aura ael-aura-one"></div><div class="ael-aura ael-aura-two"></div><span class="ael-star ael-star-one">✧</span><span class="ael-star ael-star-two">·</span><span class="ael-star ael-star-three">✦</span></div>
      <div class="ael-shell">
        <header class="ael-header">
          <div class="ael-brand" aria-label="APERTURE Experience"><span class="ael-brand-mark" aria-hidden="true">◈</span><span>APERTURE <span class="ael-brand-sub">/ EXPERIENCE</span></span></div>
          <button class="ael-quiet-toggle" type="button" data-action="quiet" aria-pressed="${state.quiet}"><span aria-hidden="true">${state.quiet ? '☀' : '☾'}</span> ${state.quiet ? 'Exit quiet' : 'Quiet mode'}</button>
        </header>
        <main id="ael-main-content">
          <section class="ael-hero" aria-labelledby="ael-page-title">
            <div class="ael-hero-kicker"><span class="ael-kicker-line" aria-hidden="true"></span> A MOMENT IS ENOUGH <span class="ael-kicker-line" aria-hidden="true"></span></div>
            <h1 id="ael-page-title">Be here.<br /><em>Be alive.</em></h1>
            <p>Four gentle ways to meet the moment. Not another thing to achieve—just space to notice, feel, care, and explore.</p>
          </section>
          <section class="ael-paths" aria-label="Choose an experience">
            <div class="ael-section-heading"><div><p class="ael-overline">01 / THE FOUR PATHS</p><h2>What calls to you?</h2></div><span>Choose one, or let one find you.</span></div>
            <div class="ael-path-grid">${experiences.map((e, i) => `<button type="button" data-action="choose" data-id="${escapeHTML(e.id)}" class="ael-path ${state.selected === e.id ? 'is-selected' : ''}" aria-pressed="${state.selected === e.id}">
              <span class="ael-path-head"><span class="ael-path-index">0${i + 1}</span><span class="ael-path-symbol" aria-hidden="true">${escapeHTML(e.symbol)}</span></span>
              <span class="ael-path-name">${escapeHTML(e.name)}</span>
              <span class="ael-path-short">${escapeHTML(e.short)}</span>
              <span class="ael-path-arrow" aria-hidden="true">↗</span>
            </button>`).join('')}</div>
          </section>
          <div class="ael-experience-area">
            <div class="ael-area-heading"><p class="ael-overline">02 / THE EXPERIENCE</p><button class="ael-surprise" type="button" data-action="surprise">✧ Surprise me</button></div>
            ${state.complete ? completeMarkup() : stepMarkup()}
            <div class="ael-below-journey"><p>Not feeling it? You can switch paths, skip a prompt, or stop at any time.</p><button class="ael-share-trigger" type="button" data-action="share" aria-expanded="${state.shareOpen}">${state.shareOpen ? 'Close share options' : '↗ Share this path'}</button></div>
            ${shareMarkup()}
          </div>
          <section class="ael-manifesto" aria-label="Our promises"><span class="ael-manifesto-mark" aria-hidden="true">✦</span><p>Technology should make more room for being human.</p><div class="ael-promises"><span>No account</span><span>No tracking</span><span>No streaks</span><span>No pressure</span></div><button class="ael-clear-notes" type="button" data-action="clear-notes">Clear my private notes</button></section>
        </main>
        <footer class="ael-footer"><span>APERTURE · EXPERIENCE LAYER v2</span><span>Awareness · Joy · Love · Wonder</span></footer>
      </div>
      <div class="ael-sr-only" role="status" aria-live="polite" aria-atomic="true" id="ael-live"></div>
    </div>`;
    if (announce || state.status) {
      queueMicrotask(() => {
        const live = container.querySelector('#ael-live');
        if (live && !destroyed) live.textContent = announce || state.status;
      });
    }
    if (focus) {
      const heading = container.querySelector(focus);
      if (heading) heading.focus({ preventScroll: true });
    }
  }
  function changeExperience(id) {
    if (!ids.includes(id)) return;
    state.selected = id;
    state.step = 0;
    state.complete = false;
    state.breathing = true;
    state.shareOpen = false;
    state.status = '';
    updateLink();
    render({ focus: '#ael-step-heading', announce: `Opened ${current().name} experience, step one.` });
    notify();
  }
  async function copyLink() {
    const url = urlForSharing();
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      state.status = 'Link copied. You choose where it goes.';
    } catch {
      const field = container.querySelector('#ael-share-url');
      if (field) { field.focus(); field.select(); }
      state.status = 'Select the link and copy it manually.';
    }
    const status = container.querySelector('#ael-live');
    if (status) status.textContent = state.status;
  }
  function handleClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button || !container.contains(button)) return;
    const action = button.dataset.action;
    if (action === 'clear-notes') {
      state.notes = Object.create(null);
      state.status = 'Your private notes have been cleared from this page.';
      render({ announce: state.status });
      container.querySelector('[data-action="clear-notes"]')?.focus({ preventScroll: true });
      return;
    }
    if (action === 'choose') { changeExperience(button.dataset.id); return; }
    if (action === 'surprise') {
      const otherIds = ids.filter(id => id !== state.selected);
      changeExperience(otherIds[Math.floor(Math.random() * otherIds.length)]);
      return;
    }
    if (action === 'quiet') {
      state.quiet = !state.quiet;
      render({ announce: state.quiet ? 'Quiet mode enabled.' : 'Quiet mode disabled.' });
      container.querySelector('[data-action="quiet"]')?.focus({ preventScroll: true });
      notify();
      return;
    }
    if (action === 'choice') {
      const opts = stepData().activity.options;
      const picked = opts[Number(button.dataset.value)];
      if (picked) state.answers[stepKey()] = picked;
      render({ announce: `Selected: ${picked}` });
      container.querySelector(`[data-action="choice"][data-value="${button.dataset.value}"]`)?.focus({ preventScroll: true });
      return;
    }
    if (action === 'breath') {
      state.breathing = !state.breathing;
      render({ announce: state.breathing ? 'Visual guide resumed.' : 'Visual guide paused.' });
      container.querySelector('[data-action="breath"]')?.focus({ preventScroll: true });
      return;
    }
    if (action === 'new-idea') {
      const key = stepKey();
      const options = stepData().activity.options;
      state.ideaIndices[key] = ((state.ideaIndices[key] || 0) + 1) % options.length;
      render({ announce: 'A new question is shown.' });
      container.querySelector('[data-action="new-idea"]')?.focus({ preventScroll: true });
      return;
    }
    if (action === 'back' && state.step > 0) {
      state.step -= 1;
      state.complete = false;
      render({ focus: '#ael-step-heading', announce: `Step ${state.step + 1} of ${current().steps.length}.` });
      notify();
      return;
    }
    if (action === 'next') {
      if (state.step < current().steps.length - 1) {
        state.step += 1;
        state.breathing = true;
        render({ focus: '#ael-step-heading', announce: `Step ${state.step + 1} of ${current().steps.length}.` });
      } else {
        state.complete = true;
        render({ focus: '#ael-complete-heading', announce: 'The experience is complete.' });
      }
      notify();
      return;
    }
    if (action === 'restart') {
      state.step = 0;
      state.complete = false;
      render({ focus: '#ael-step-heading', announce: 'Starting again.' });
      notify();
      return;
    }
    if (action === 'share') {
      state.shareOpen = !state.shareOpen;
      render({ announce: state.shareOpen ? 'Share options opened.' : 'Share options closed.' });
      container.querySelector('[data-action="share"]')?.focus({ preventScroll: true });
      return;
    }
    if (action === 'copy') { void copyLink(); }
  }
  function handleInput(event) {
    if (!event.target.matches('[data-note]') || !container.contains(event.target)) return;
    state.notes[stepKey()] = event.target.value.slice(0, maxNoteLength);
    const counter = container.querySelector('[data-note-count]');
    if (counter) counter.textContent = `${state.notes[stepKey()].length}/${maxNoteLength}`;
  }
  container.addEventListener('click', handleClick);
  container.addEventListener('input', handleInput);
  render();
  updateLink();
  return {
    chooseExperience: changeExperience,
    setQuiet(value) {
      state.quiet = Boolean(value);
      render();
      notify();
    },
    getState: () => ({ experience: state.selected, step: state.step, quiet: state.quiet, complete: state.complete }),
    destroy() {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('input', handleInput);
      container.replaceChildren();
      state.notes = Object.create(null);
      state.answers = Object.create(null);
      destroyed = true;
    }
  };
}