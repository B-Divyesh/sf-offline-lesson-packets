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

test('@claim:standalone-response @claim:print-packet teacher exports a standalone packet and learner response', async ({ page, context }) => {
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
  await learner.getByLabel('Read the source once').check();
  await learner.getByRole('button', { name: 'Move Notice a detail down' }).click();
  await learner.getByLabel('Response to activity 3').fill('Details connect to the main idea.');
  await learner.getByLabel(/What changed or became clearer/).fill('I slowed down and noticed evidence.');
  const packetA11y = await new AxeBuilder({ page: learner as never }).analyze();
  expect(packetA11y.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''))).toEqual([]);
  const responseDownloadPromise = learner.waitForEvent('download');
  await learner.getByRole('button', { name: 'Download my responses' }).click();
  const responseDownload = await responseDownloadPromise;
  const responsePath = await responseDownload.path();
  const response = await readFile(responsePath!, 'utf8');
  expect(response).toContain('Learner: Sam');
  expect(response).toContain('Details connect to the main idea.');
  expect(response).toContain('[x] Read the source once');
  expect(response).toMatch(/1\. Ask what it might mean\n2\. Notice a detail/);
  await learner.evaluate(() => { window.print = () => { document.body.dataset.printInvoked = 'true'; }; });
  await learner.getByRole('button', { name: 'Print packet' }).click();
  await expect(learner.locator('body')).toHaveAttribute('data-print-invoked', 'true');
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
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Lesson Packet');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That packet page is missing.');
});

test('@claim:offline-reload composer reloads offline after its first visit', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'one service-worker check is enough');
  await page.goto('/');
  await page.waitForFunction(async () => (await navigator.serviceWorker.getRegistrations()).some((registration) => registration.active), undefined, { timeout: 10_000 });
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, undefined, { timeout: 10_000 });
  await context.setOffline(true);
  await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(false);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Lesson Packet/);
  await expect(page.locator('#offline-bar')).toBeVisible();
});

test('activity reorder and removal keep keyboard focus on useful controls', async ({ page }) => {
  await page.goto('/#composer');
  const moveDown = page.getByRole('button', { name: 'Move activity 1 down' });
  await moveDown.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Move activity 2 up' })).toBeFocused();

  const remove = page.getByRole('button', { name: 'Remove activity 2' });
  await remove.focus();
  page.once('dialog', (dialog) => dialog.accept());
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove activity 1' })).toBeFocused();
});

test('template import shows truthful keyboard focus on its visible label', async ({ page }) => {
  await page.goto('/#composer');
  await page.getByRole('button', { name: 'Save editable template' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#import-template')).toBeFocused();
  const outlines = await page.evaluate(() => ({
    importLabel: getComputedStyle(document.querySelector<HTMLElement>('.import-label')!).outlineStyle,
    reset: getComputedStyle(document.querySelector<HTMLElement>('#reset-draft')!).outlineStyle,
  }));
  expect(outlines).toEqual({ importLabel: 'solid', reset: 'none' });
});

test('estimated time is visibly normalized before preview and export', async ({ page }) => {
  await page.goto('/#composer');
  const minutes = page.locator('#lesson-time');
  await minutes.fill('0');
  await expect(minutes).toHaveValue('1');
  await expect(page.locator('#time-feedback')).toHaveText('Time adjusted to 1 minute.');
  await page.locator('#packet-preview').scrollIntoViewIfNeeded();
  const frame = page.locator('#packet-preview').contentFrame();
  await expect(frame.locator('.meta')).toContainText('About 1 minute');

  await minutes.fill('301');
  await expect(minutes).toHaveValue('300');
  await expect(page.locator('#time-feedback')).toHaveText('Time adjusted to 300 minutes.');
  await expect(frame.locator('.meta')).toContainText('About 300 minutes');
});

test('malformed template gives a teacher-facing recovery message', async ({ page }) => {
  await page.goto('/#composer');
  await page.locator('#import-template').setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{oops'),
  });
  await expect(page.locator('#toast')).toHaveText('That file is not valid JSON. Check the file and try again.');
  await expect(page.locator('#toast')).not.toContainText(/position|property|JSON at/i);
});

test('preview main landmark has a unique accessible name', async ({ page }) => {
  await page.goto('/#composer');
  await page.locator('#packet-preview').scrollIntoViewIfNeeded();
  await expect(page.locator('#packet-preview').contentFrame().locator('main')).toHaveAttribute('aria-label', 'Lesson packet');
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.find((violation) => violation.id === 'landmark-unique')).toBeUndefined();
});

test('@claim:free-demo sample lesson opens without an account', async ({ page }) => {
  await page.goto('/?demo=1#composer');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#lesson-title')).toHaveValue('Notice, wonder, connect');
  await expect(page.locator('body')).not.toContainText(/sign in|credit card|payment/i);
  await page.locator('#lesson-title').fill('Changed sample');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#lesson-title')).toHaveValue('Notice, wonder, connect');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).not.toHaveURL(/demo=1/);
  await expect(page.locator('#demo-banner')).toBeHidden();
});

test('@claim:local-only demo flow sends no content off-origin and does not touch the real draft', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
  });
  await page.goto('/?demo=1#composer');
  await page.locator('#lesson-title').fill('A separate demo lesson');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('demo:lesson-packet:teacher-draft:v1'))).not.toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('lesson-packet:teacher-draft:v1'))).toBeNull();
  expect(offOrigin).toEqual([]);
});

test('initial render defers the off-screen packet preview', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'desktop startup check is sufficient');
  await page.goto('/');
  expect(await page.locator('#packet-preview').getAttribute('srcdoc')).toBeNull();
});

test('@claim:template-roundtrip editable template downloads and imports from the demo', async ({ page }) => {
  await page.goto('/?demo=1#composer');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save editable template' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const template = JSON.parse(await readFile(path!, 'utf8'));
  template.title = 'Imported ecosystem lesson';
  await page.locator('#import-template').setInputFiles({
    name: 'ecosystem.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(template)),
  });
  await expect(page.locator('#lesson-title')).toHaveValue('Imported ecosystem lesson');
  await expect(page.locator('#toast')).toHaveText('Template imported and checked.');
});

test('@claim:learner-progress optional learner progress survives reload and can be cleared', async ({ page, context }) => {
  await page.goto('/?demo=1#composer');
  await page.locator('#remember-responses').check();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download lesson packet/ }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const packetHtml = await readFile(path!, 'utf8');
  await context.route('http://127.0.0.1:4173/learner-test.html', (route) => route.fulfill({ contentType: 'text/html', body: packetHtml }));
  const learner = await context.newPage();
  await learner.goto('http://127.0.0.1:4173/learner-test.html');
  await learner.getByLabel('Your name or initials (optional)').fill('Riley');
  await learner.getByLabel('Read the source once').check();
  await learner.reload();
  await expect(learner.getByLabel('Your name or initials (optional)')).toHaveValue('Riley');
  await expect(learner.getByLabel('Read the source once')).toBeChecked();
  learner.once('dialog', (dialog) => dialog.accept());
  await learner.getByRole('button', { name: 'Clear saved progress' }).click();
  await expect(learner.getByLabel('Your name or initials (optional)')).toHaveValue('');
  await learner.close();
});
