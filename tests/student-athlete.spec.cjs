const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');
const url = pathToFileURL(path.resolve(__dirname, '../student-athlete-preview/index.html')).href;
test.beforeEach(async ({page}) => { await page.goto(url); });
test('page loads with independent partnership disclaimer', async ({page}) => {
  await expect(page.getByRole('heading',{name:'Your future is bigger than the game.'})).toBeVisible();
  await expect(page.getByText('Not an approved USPA partnership')).toBeVisible();
  await expect(page.getByRole('link',{name:'Official USPA admissions information'})).toHaveAttribute('href','https://gouspa.org/admissions/');
});
test('course filters and inquiry selection', async ({page}) => {
  await expect(page.locator('#courseGrid article')).toHaveCount(7);
  await page.locator('#filters button[data-filter="athlete"]').click();
  await expect(page.locator('#courseGrid article')).toHaveCount(1);
  await expect(page.getByRole('heading',{name:'Sports Analytics Studio'})).toBeVisible();
  await page.getByRole('button',{name:'Ask about this course'}).click();
  await expect(page.locator('#courseSelect')).toHaveValue('Sports Analytics Studio');
  await expect(page.locator('#requestType')).toHaveValue('Course information');
  await page.locator('#filters button[data-filter="all"]').click();
  await expect(page.locator('#courseGrid article')).toHaveCount(7);
});
test('roadmap changes with selected interests', async ({page}) => {
  await page.locator('#generate').click();
  const first=await page.locator('#roadmapResult').innerText();
  expect(first).toContain('shot-chart');
  await page.locator('#interest').selectOption('robotics');
  await page.locator('#challenge').selectOption('portfolio');
  await page.locator('#generate').click();
  const second=await page.locator('#roadmapResult').innerText();
  expect(second).toContain('robot obstacle-course');
  expect(second).not.toBe(first);
});
test('form validates and prepares email without sending', async ({page}) => {
  await page.locator('#inquiryForm button[type="submit"]').click();
  expect(await page.locator('#parentName').evaluate(el=>el.validity.valueMissing)).toBe(true);
  await page.locator('#parentName').fill('Test Parent');
  await page.locator('#parentEmail').fill('not-an-email');
  expect(await page.locator('#parentEmail').evaluate(el=>el.validity.typeMismatch)).toBe(true);
  await page.locator('#parentEmail').fill('test@example.com');
  await page.locator('#courseSelect').selectOption('Python Foundations');
  await page.locator('#requestType').selectOption('Course information');
  await page.route('mailto:**',route=>route.abort());
  await page.locator('#inquiryForm button[type="submit"]').click();
  await expect(page.locator('#inquiryStatus')).toContainText('Your email app should open');
  // mailto opens an external mail handler; do not send email
});
test('mobile viewport has no horizontal overflow and core controls are usable', async ({page}) => {
  const width=await page.evaluate(()=>document.documentElement.scrollWidth);
  const viewport=page.viewportSize().width;
  expect(width).toBeLessThanOrEqual(viewport+2);
  await page.locator('#filters button[data-filter="starter"]').click();
  await expect(page.locator('#courseGrid article')).toHaveCount(3);
  await page.locator('#generate').click();
  await expect(page.locator('#roadmapResult')).toContainText('Week 4');
});
test('pricing remains separate and no unapproved enrollment claims', async ({page}) => {
  await expect(page.locator('#pricing')).toContainText('Request quote');
  await expect(page.locator('#courses')).toContainText('not USPA courses or credits');
  await expect(page.locator('#inquiry')).toContainText('does not transmit or store information');
});
