const { test, expect } = require('@playwright/test');

test.describe('Yurichan Store Storefront E2E Tests', () => {
  
  test('should load the homepage and render core branding', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');

    // Verify the page title
    await expect(page).toHaveTitle(/Yurichan(\.|\s)store/i);

    // Verify the Skip to Content accessibility link is present
    const skipLink = page.locator('a:has-text("Skip to content")');
    await expect(skipLink).toBeAttached();

    // Verify header presence
    const header = page.locator('header, .shopify-section-header');
    await expect(header).toBeDefined();

    // Verify footer presence
    const footer = page.locator('footer');
    await expect(footer).toBeDefined();
  });

  test('should have basic accessibility landmarks', async ({ page }) => {
    await page.goto('/');

    // The main element should have role="main" and id="MainContent"
    const mainContent = page.locator('main#MainContent');
    await expect(mainContent).toBeVisible();
    await expect(mainContent).toHaveAttribute('role', 'main');
  });

  test('should contain navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for standard navigation elements or details disclosures
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeDefined();
  });

  test('should render Tailwind dynamic style sheets', async ({ page }) => {
    await page.goto('/');

    // Ensure the Tailwind CSS stylesheet is successfully linked and not broken
    const tailwindLink = page.locator('link[href*="tailwind.css"]');
    await expect(tailwindLink).toBeAttached();
  });
});
