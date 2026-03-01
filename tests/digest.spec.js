// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Digest feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.layout-shell', { timeout: 15000 });
    await page.evaluate(() => localStorage.clear());
  });

  test('shows "Set preferences" when no preferences', async ({ page }) => {
    await page.goto('/digest');
    await expect(page.getByText('Set preferences to generate a personalized digest')).toBeVisible({ timeout: 10000 });
  });

  test('after saving preferences, shows Generate button', async ({ page }) => {
    await page.goto('/settings');
    await page.fill('#settings-role-keywords', 'Engineer');
    await page.click('.js-settings-save');
    await page.goto('/digest');
    await expect(page.getByRole('button', { name: /Generate Today's 9AM Digest/ })).toBeVisible();
  });

  test('generates digest and shows top 10 jobs', async ({ page }) => {
    await page.goto('/settings');
    await page.fill('#settings-role-keywords', 'Engineer');
    await page.click('.js-settings-save');
    await page.goto('/digest');
    await page.click('.js-digest-generate');
    await expect(page.getByText('Top 10 Jobs For You — 9AM Digest')).toBeVisible();
    const jobs = await page.locator('.digest-job').count();
    expect(jobs).toBe(10);
  });

  test('digest persists after refresh', async ({ page }) => {
    await page.goto('/settings');
    await page.fill('#settings-role-keywords', 'Engineer');
    await page.click('.js-settings-save');
    await page.goto('/digest');
    await page.click('.js-digest-generate');
    await expect(page.getByText('Top 10 Jobs For You — 9AM Digest')).toBeVisible();
    await page.reload();
    await expect(page.getByText('Top 10 Jobs For You — 9AM Digest')).toBeVisible();
  });

  test('Copy Digest button exists when digest shown', async ({ page }) => {
    await page.goto('/settings');
    await page.fill('#settings-role-keywords', 'x');
    await page.click('.js-settings-save');
    await page.goto('/digest');
    await page.click('.js-digest-generate');
    await expect(page.getByRole('button', { name: 'Copy Digest to Clipboard' })).toBeVisible();
  });

  test('Create Email Draft button opens mailto when clicked', async ({ page }) => {
    await page.goto('/settings');
    await page.fill('#settings-role-keywords', 'x');
    await page.click('.js-settings-save');
    await page.goto('/digest');
    await page.click('.js-digest-generate');
    const btn = page.getByRole('button', { name: 'Create Email Draft' });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page).toHaveURL(/\/digest/);
  });
});
