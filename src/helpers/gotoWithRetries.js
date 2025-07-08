/**
 * Navigate to a Cartier product page with retry logic.
 * Handles common loading failures and waits for a reliable element.
 *
 * @param {import('playwright').Page} page - Playwright page object
 * @param {string} url - Product page URL
 * @param {number} retries - Number of retry attempts (default: 2)
 */
export async function gotoWithRetries(page, url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🌐 Attempting to load: ${url} (try ${i + 1}/${retries + 1})`);

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      // Wait for Cartier-specific selector to confirm successful load
      await page.waitForSelector('h1.pdp__name', { timeout: 20000 });

      return; // Success
    } catch (error) {
      console.warn(`⚠️ Retry ${i + 1}/${retries + 1} failed: ${error.message}`);

      if (i === retries) {
        throw new Error(`Failed to load ${url} after ${retries + 1} attempts`);
      }

      // Wait before retrying
      await page.waitForTimeout(20000);
    }
  }
}
