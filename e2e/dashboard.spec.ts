import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear IndexedDB before each test
    await page.goto('/');
    await page.evaluate(() => {
      indexedDB.deleteDatabase('tapcode');
    });
    await page.reload();
  });

  test('shows empty state when no projects', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('No projects yet')).toBeVisible();
    await expect(page.getByRole('button', { name: /create your first project/i })).toBeVisible();
  });

  test('can create a new project', async ({ page }) => {
    await page.goto('/');

    // Click new button
    await page.getByRole('button', { name: '+ New' }).click();

    // Fill project name
    await page.getByPlaceholder('Project name').fill('Test Project');

    // Create project (use exact match to avoid "Create your first project")
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Should navigate to editor
    await expect(page).toHaveURL(/\/editor\/.+/);
  });

  test('shows created project in list', async ({ page }) => {
    await page.goto('/');

    // Create a project
    await page.getByRole('button', { name: '+ New' }).click();
    await page.getByPlaceholder('Project name').fill('My App');
    await page.getByRole('button', { name: 'Create', exact: true }).click();

    // Go back to dashboard
    await page.getByRole('button', { name: '←' }).click();

    // Should see project in list (check for project card)
    await expect(page.locator('h3').filter({ hasText: 'My App' })).toBeVisible();
  });

  test('can delete a project', async ({ page }) => {
    await page.goto('/');

    // Create a project first
    await page.getByRole('button', { name: '+ New' }).click();
    await page.getByPlaceholder('Project name').fill('Delete Me');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await page.getByRole('button', { name: '←' }).click();

    // Delete the project
    page.on('dialog', dialog => dialog.accept());
    await page.getByLabel('Delete project').click();

    // Should show empty state again
    await expect(page.getByText('No projects yet')).toBeVisible();
  });
});
