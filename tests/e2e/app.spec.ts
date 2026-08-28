import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('composer loads without console errors and passes serious accessibility checks', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Lesson Packet/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#packet-preview')).toBeVisible();
  await expect(page.locator('.hero-art img')).toHaveJSProperty('complete', true);
  // @axe-core/playwright carries a newer structural Page type than our pinned
  // worker browser; the runtime API used here is compatible.
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('teacher can add a block and export a working standalone response flow', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Short response' }).click();
  const addedPrompt = page.locator('[data-type="write"] textarea');
  await addedPrompt.fill('Explain your strongest connection.');
  const packetDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download lesson packet/ }).click();
  const packetDownload = await packetDownloadPromise;
  expect(packetDownload.suggestedFilename()).toBe('notice-wonder-connect.html');
  const packetPath = await packetDownload.path();
  expect(packetPath).toBeTruthy();
  const packetHtml = await readFile(packetPath!, 'utf8');
  expect(packetHtml).toContain('Explain your strongest connection.');
  expect(packetHtml).not.toMatch(/https?:\/\//);

  const learner = await context.newPage();
  await learner.setContent(packetHtml, { waitUntil: 'load' });
  await learner.getByLabel('Your name or initials (optional)').fill('Sam');
  await learner.getByLabel('Response to activity 3').fill('Details connect to the main idea.');
  await learner.getByLabel(/What changed or became clearer/).fill('I slowed down and noticed evidence.');
  const responseDownloadPromise = learner.waitForEvent('download');
  await learner.getByRole('button', { name: 'Download my responses' }).click();
  const responseDownload = await responseDownloadPromise;
  const responsePath = await responseDownload.path();
  const response = await readFile(responsePath!, 'utf8');
  expect(response).toContain('Learner: Sam');
  expect(response).toContain('Details connect to the main idea.');
  await learner.close();
});

test('validation explains an empty packet and links to the problem', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lesson-title').fill('');
  const removeButtons = page.getByRole('button', { name: /Remove activity/ });
  while (await removeButtons.count()) {
    page.once('dialog', (dialog) => dialog.accept());
    await removeButtons.first().click();
  }
  await page.getByRole('button', { name: /Download lesson packet/ }).click();
  const summary = page.locator('#error-summary');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Add a lesson title');
  await expect(summary).toContainText('Add at least one activity block');
  await expect(page.locator('#empty-activities')).toBeVisible();
});

test('mobile composer has no horizontal overflow and keeps export reachable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile project only');
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: /Download lesson packet/ })).toBeVisible();
});

test('privacy and terms pages are real routes', async ({ page }) => {
  for (const route of ['/privacy/', '/terms/']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  }
});
