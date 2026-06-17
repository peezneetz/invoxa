import { test, expect } from '@playwright/test';

test('User can log in, create a client, and create an invoice', async ({ page }) => {
  const uniqueClientName = `E2E Client ${Date.now()}`;
  const uniqueEmail = `e2e-${Date.now()}@client.com`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const formattedDueDate = dueDate.toISOString().split('T')[0];

  await page.goto('https://invoxa-frontend-942154906460.asia-southeast2.run.app');
  await page.click('text=Sign In');
  await page.fill('input[name="email"]', 'test-e2e@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);

  await page.click('text=Clients');
  await page.locator('text=Add Client').first().click();
  await page.waitForSelector('form');
  await page.fill('input[name="name"]', uniqueClientName);
  await page.fill('input[name="email"]', uniqueEmail);
  await page.click('button[type="submit"]');
  
  await expect(page.locator(`text=${uniqueClientName}`).first()).toBeVisible();

  await page.click('text=Invoices');
  await page.click('text=New Invoice');
  await expect(page).toHaveURL(/.*\/invoices\/new/);

  await page.selectOption('select[name="client_id"]', { label: uniqueClientName });
  await page.fill('input[name="due_date"]', formattedDueDate);
  await page.fill('input[placeholder="Service description"]', 'E2E Testing Service');
  await page.fill('input[type="number"]', '2');
  await page.fill('input[placeholder="0.00"]', '99.99');

  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/.*\/invoices/, { timeout: 10000 });
  
  await expect(page.locator('body')).toContainText('Invoices');
});