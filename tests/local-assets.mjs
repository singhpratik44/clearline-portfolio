import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';

const root = process.cwd();
const pages = ['index.html', 'hire.html', 'apply.html', 'governance.html', 'enrollment.html', 'self-review.html', 'unit-defense.html', 'basketball.html', 'implementation.html'];

for (const page of pages) {
  test(`${page}: local script and stylesheet assets exist`, () => {
    const html = readFileSync(resolve(root, page), 'utf8');
    const tags = [...html.matchAll(/<(script|link)\b[^>]*>/gi)].map(m => m[0]);
    for (const tag of tags) {
      const kind = /^<script\b/i.test(tag) ? 'src' : 'href';
      if (kind === 'href' && !/\brel\s*=\s*["']stylesheet["']/i.test(tag)) continue;
      const match = tag.match(new RegExp('\\b' + kind + '\\s*=\\s*["\\x27]([^"\\x27]+)["\\x27]', 'i'));
      if (!match) continue;
      const url = match[1];
      if (/^(?:https?:|\/\/|data:|#)/i.test(url)) continue;
      const path = resolve(root, dirname(page), decodeURIComponent(url.split(/[?#]/)[0]));
      assert.ok(path.startsWith(root + sep), `Asset path escapes repository: ${page} -> ${url}`);
      assert.ok(existsSync(path), `Missing local asset: ${page} -> ${url}`);
    }
  });
}
