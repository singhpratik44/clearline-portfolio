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
    await page.waitForFunction(() => document.getElementById('robotStatus')?.textContent?.includes('Mission complete'), null, { timeout: 12000 });

    await page.locator('#threshold').evaluate(el => { el.value = '70'; el.dispatchEvent(new Event('input', { bubbles: true })); });
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
    await page.goto('http://127.0.0.1:8779/code-the-game/classroom/labs/lego/');
    assert.match(await page.title(), /Robot Code Studio/);
    assert.equal(await page.locator('#missions button').count(), 4, 'four missions');
    assert.equal(await page.locator('#board .cell').count(), 36, 'six by six robot grid');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, 'robot lab mobile horizontal overflow');
    for(let i=0;i<5;i++) await page.locator('[data-command="F"]').click();
    await page.locator('[data-command="L"]').click();
    for(let i=0;i<5;i++) await page.locator('[data-command="F"]').click();
    assert.equal(await page.locator('#queue .step').count(), 11, 'tappable coding blocks');
    await page.locator('#run').click();
    await page.waitForFunction(() => document.getElementById('status')?.textContent?.includes('Mission complete'), null, { timeout: 12000 });
    assert.match(await page.locator('#completion').textContent(), /1 \/ 4/);
    await page.locator('#next').click();
    assert.match(await page.locator('#missionTitle').textContent(), /Mission 2/);
    await page.goto('http://127.0.0.1:8779/code-the-game/classroom/labs/ai/');
    assert.match(await page.title(), /AI Decision Lab/);
    assert.equal(await page.locator('#rows tr').count(), 6);
    await page.locator('#threshold').evaluate(el => {el.value='70';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('#v').textContent(), '70');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, 'AI lab mobile horizontal overflow');
    await page.goto('http://127.0.0.1:8779/code-the-game/classroom/labs/hackathon/');
    assert.match(await page.title(), /Hackathon Lab/);
    await page.locator('#problem').fill('Accessible study spaces');
    await page.locator('#generate').click();
    assert.match(await page.locator('#output').textContent(), /Accessible study spaces/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, 'hackathon mobile horizontal overflow');
    await page.goto('http://127.0.0.1:8779/code-the-game/');
    assert.ok(await page.locator('a[href="classroom/labs/lego/"]').count() > 0, 'main website links to robotics lab');
    assert.ok(await page.locator('a[href="classroom/labs/ai/"]').count() > 0, 'main website links to AI lab');
    assert.ok(await page.locator('a[href="classroom/labs/hackathon/"]').count() > 0, 'main website links to hackathon lab');
    assert.deepEqual(errors, [], 'no browser JS exceptions');
    await page.close();
  }
  console.log('CODE THE GAME Robotics + AI hub passed: mobile/desktop, simulator win, classifiers, competition filters, catalog and school links');
} finally {
  await browser?.close();
  server.kill();
}
