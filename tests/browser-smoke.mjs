import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let browser;
try {
  await sleep(1200);
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 1365, height: 768 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle', timeout: 30000 });
    assert.equal(response.status(), 200);
    await page.locator('#root').waitFor({ state: 'visible', timeout: 15000 });
    assert.ok((await page.locator('#root').innerText()).trim().length > 100, 'React root did not render meaningful content');
    assert.deepEqual(errors, [], 'Browser JavaScript exceptions');
    console.log('PASS viewport', viewport.width, viewport.height);
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
