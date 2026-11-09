import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync('coaching-journey.html', 'utf8');
const homepage = readFileSync('index.html', 'utf8');
const academy = readFileSync('basketball.html', 'utf8');

test('coaching page has meaningful sections and accessible practice controls', () => {
  for (const id of ['journey', 'scripture', 'practice', 'lab', 'tools', 'group', 'focus', 'duration', 'plan-lines']) {
    assert.match(page, new RegExp('id="' + id + '"'));
  }
  assert.match(page, /<main id="main">/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /prefers-reduced-motion:reduce/);
});

test('both traditions credited and no invented player-data integrations', () => {
  assert.match(page, /Sri Guru Granth Sahib Ji/);
  assert.match(page, /Ang 1/);
  assert.match(page, /Proverbs 27:17/);
  assert.match(page, /distinct theological teachings/);
  assert.match(page, /No automated assessment of minors/);
  assert.match(page, /No athlete names or profiles collected/);
});

test('APERTURE and basketball links work in both directions', () => {
  assert.match(homepage, /href="coaching-journey.html"/);
  assert.match(academy, /href="coaching-journey.html"/);
  assert.match(page, /href="basketball.html"/);
  assert.match(page, /href="aperture-unified-command.html"/);
  assert.match(page, /href="basketball-os.html"/);
});

test('practice timings add up to selected duration', () => {
  const match = page.match(/const durations=({[^;]+});/);
  assert.ok(match, 'timing templates exist');
  const durations = JSON.parse(match[1].replace(/(\d+):/g, '"$1":'));
  for (const minutes of [45, 60, 75]) {
    assert.equal(durations[minutes].reduce((a,b)=>a+b,0), minutes);
    assert.equal(durations[minutes].length, 5);
  }
});
