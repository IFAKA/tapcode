import { test, expect } from '@playwright/test';

test.describe('Editor - Monaco', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB and create a test project
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('tapcode');
    });
    await page.reload();

    // Create a project
    await page.getByRole('button', { name: '+ New' }).click();
    await page.getByPlaceholder('Project name').fill('Test Project');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Wait for editor to load (URL is /{projectId})
    await expect(page).toHaveURL(/\/[a-f0-9-]{36}/);
  });

  test('Monaco editor loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for Monaco to fully load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Give it time to stabilize
    await page.waitForTimeout(2000);

    // Check no Canceled errors
    const canceledErrors = errors.filter(e => e.includes('Canceled'));
    expect(canceledErrors).toHaveLength(0);
  });

  test('file switching does not cause Canceled errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Open sidebar
    await page.getByTitle('Toggle sidebar').click();
    await page.waitForTimeout(300);

    // Switch between files rapidly (use sidebar file list)
    const sidebar = page.locator('.w-64');
    await sidebar.getByText('style.css').click();
    await page.waitForTimeout(300);
    await sidebar.getByText('script.js').click();
    await page.waitForTimeout(300);
    await sidebar.getByText('index.html').click();
    await page.waitForTimeout(300);
    await sidebar.getByText('style.css').click();
    await page.waitForTimeout(1000);

    // Check no Canceled errors
    const canceledErrors = errors.filter(e => e.includes('Canceled'));
    expect(canceledErrors).toHaveLength(0);
  });

  test('can edit content in Monaco', async ({ page }) => {
    // Wait for Monaco to load
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });

    // Click inside the editor
    await page.click('.monaco-editor');

    // Type some text
    await page.keyboard.type('<!-- test -->');

    // Verify the text appears
    await expect(page.locator('.monaco-editor')).toContainText('test');
  });
});

test.describe('Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB and create a test project
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('tapcode');
    });
    await page.reload();

    // Create a project
    await page.getByRole('button', { name: '+ New' }).click();
    await page.getByPlaceholder('Project name').fill('Test Project');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Wait for editor to load (URL is /{projectId})
    await expect(page).toHaveURL(/\/[a-f0-9-]{36}/);
  });

  test('shows default files in tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'index.html' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'style.css' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'script.js' })).toBeVisible();
  });

  test('shows line numbers', async ({ page }) => {
    // Should see line numbers 1, 2, 3, etc.
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
  });

  test('can tap a line to edit', async ({ page }) => {
    // Click on a line (the one containing "Hello")
    const line = page.locator('div').filter({ hasText: /Hello/ }).first();
    await line.click();

    // Should have an input focused
    const input = page.locator('input[type="text"]');
    await expect(input).toBeFocused();
  });

  test('can type in a line', async ({ page }) => {
    // Click on a line
    const line = page.locator('div').filter({ hasText: /DOCTYPE/ }).first();
    await line.click();

    // Type something unique
    await page.keyboard.press('End');
    await page.keyboard.type('UNIQUE_TEXT_123');

    // Should see the typed text in the code area
    await expect(page.locator('code').filter({ hasText: 'UNIQUE_TEXT_123' })).toBeVisible();
  });

  test('Enter key creates new line', async ({ page }) => {
    // Click on a line
    const line = page.locator('div').filter({ hasText: /DOCTYPE/ }).first();
    await line.click();

    // Press Enter
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');

    // Should have more lines now (check for increased line numbers)
    const lineNumbers = page.locator('div').filter({ hasText: /^\d+$/ });
    const count = await lineNumbers.count();
    expect(count).toBeGreaterThan(10); // Default template has ~10 lines
  });

  test('can switch between files', async ({ page }) => {
    // Click on style.css tab
    await page.getByRole('button', { name: 'style.css' }).click();

    // Should see CSS content (check for CSS-specific token)
    await expect(page.locator('.token.property').first()).toBeVisible();

    // Click on script.js tab
    await page.getByRole('button', { name: 'script.js' }).click();

    // Should see JS content
    await expect(page.locator('code').filter({ hasText: 'console.log' })).toBeVisible();
  });

  test('shows syntax highlighting', async ({ page }) => {
    // Check for Prism token classes in the HTML
    const tokenElement = page.locator('.token').first();
    await expect(tokenElement).toBeVisible();
  });

  test('Save button works', async ({ page }) => {
    // Make a change
    const line = page.locator('div').filter({ hasText: /DOCTYPE/ }).first();
    await line.click();
    await page.keyboard.press('End');
    await page.keyboard.type('SAVE_TEST');

    // Should show dirty indicator (blue dot after project name)
    await expect(page.locator('header span.text-accent')).toBeVisible();

    // Click save
    await page.getByRole('button', { name: 'Save' }).click();

    // Dirty indicator should be gone (wait for it to disappear)
    await expect(page.locator('header span.text-accent')).not.toBeVisible({ timeout: 3000 });
  });

  test('Undo button works', async ({ page }) => {
    // Click on a line and type
    const line = page.locator('div').filter({ hasText: /Hello/ }).first();
    await line.click();
    await page.keyboard.press('End');
    await page.keyboard.type('UNDO_TEST');

    // Verify text is there
    await expect(page.getByText('UNDO_TEST')).toBeVisible();

    // Click undo button
    await page.getByRole('button', { name: '↩' }).click();

    // Text should be gone
    await expect(page.getByText('UNDO_TEST')).not.toBeVisible();
  });
});
