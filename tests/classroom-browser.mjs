import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const server = spawn('python3', ['-m', 'http.server', '8779', '--bind', '127.0.0.1'], { stdio: 'ignore' });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;
try {
  await sleep(1200);
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    const page = await browser.newPage({ viewport, isMobile: viewport.width < 500, hasTouch: viewport.width < 500 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8779/code-the-game/classroom/', { waitUntil: 'load' });
    assert.match(await page.title(), /Robotics, AI & Competition-Ready Learning/);
    assert.equal(await page.locator('#events .event').count(), 8, 'all official competition resources render');
    assert.equal(await page.locator('#robotfield .tile').count(), 49, 'robot field is seven by seven');
    assert.equal(await page.locator('#aiCases tbody tr').count(), 6, 'AI literacy sample table works');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, 'homepage horizontal overflow');

    for (let i = 0; i < 6; i++) await page.locator('#cmdF').click();
    await page.locator('#cmdR').click();
    for (let i = 0; i < 6; i++) await page.locator('#cmdF').click();
    assert.match(await page.locator('#queueCount').textContent(), /13 commands/);
    await page.locator('#runRobot').click();
    await page.waitForFunction(() => document.getElementById('robotStatus')?.textContent?.includes('Mission complete'), { timeout: 12000 });

    await page.locator('#threshold').fill('70');
    assert.equal(await page.locator('#thValue').textContent(), '70');
    await page.locator('#evalAI').click();
    assert.match(await page.locator('#aiResult').textContent(), /predictions matched/);
    await page.locator('#trackFilter').selectOption('apps');
    assert.equal(await page.locator('#events .event').count(), 2, 'apps competitions filter');
    await page.locator('#trackFilter').selectOption('all');

    await page.goto('http://127.0.0.1:8779/code-the-game/classroom/activities/');
    assert.match(await page.title(), /Classic Game Coding Lab/);
    await page.goto('http://127.0.0.1:8779/code-the-game/classroom/catalog/');
    assert.match(await page.title(), /Curriculum Catalog/);
    assert.equal(await page.locator('a[href="../#lab"]').count() >= 1, true);
    await page.goto('http://127.0.0.1:8779/code-the-game/classroom/schools/');
    assert.match(await page.title(), /School Licensing/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, 'school page horizontal overflow');
    assert.deepEqual(errors, [], 'no browser JS exceptions');
    await page.close();
  }
  console.log('CODE THE GAME Robotics + AI hub passed: mobile/desktop, simulator win, classifiers, competition filters, catalog and school links');
} finally {
  await browser?.close();
  server.kill();
}
