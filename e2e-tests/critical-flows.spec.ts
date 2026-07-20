// e2e-tests/critical-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Hello World App Critical User Flows E2E', () => {
  const uniqueId = Math.floor(Math.random() * 90000) + 10000;
  const username = `user_${uniqueId}`;
  const password = 'SecurePassword123!';

  test('should register, login, create an idea, and allow voting', async ({ page }) => {
    // 1. Registration Flow
    await page.goto('/register');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login');

    // 2. Authentication Flow
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // 3. Idea Creation Flow
    await page.click('text=New Idea');
    await page.fill('input[name="title"]', `Project Idea v${uniqueId}`);
    await page.fill('textarea[name="description"]', 'Automated E2E pipeline tracking testing.');
    await page.click('button:has-text("Publish")');
    await expect(page.locator('text=Idea Created Successfully')).toBeVisible();

    // 4. Voting Flow
    const upvoteButton = page.locator('button[aria-label="Upvote"]').first();
    await expect(upvoteButton).toBeVisible();
    
    const initialVotes = await page.locator('.vote-count').first().innerText();
    await upvoteButton.click();
    
    // Validate counter updates accurately
    const updatedVotes = await page.locator('.vote-count').first().innerText();
    expect(Number(updatedVotes)).toBe(Number(initialVotes) + 1);
  });
});