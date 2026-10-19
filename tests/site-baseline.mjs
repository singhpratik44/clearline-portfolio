import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const pages = ['index.html','hire.html','apply.html','governance.html','enrollment.html','self-review.html','unit-defense.html','basketball.html','implementation.html'];

for (const page of pages) {
  test(`${page} exists and has basic document structure`, () => {
    const path = join(root, page);
    assert.ok(existsSync(path), `Missing ${page}`);
    const html = readFileSync(path, 'utf8');
    assert.match(html, /<!doctype html>/i);
    assert.match(html, /<title\b[^>]*>[^<]+<\/title>/i);
    assert.match(html, /<meta\s+name=["']viewport["']/i);
  });
}

test('franchise engine source remains present', () => assert.ok(existsSync(join(root, 'src/franchise-engine.tsx'))));
test('self-review source remains present', () => assert.ok(existsSync(join(root, 'self-review.html'))));
