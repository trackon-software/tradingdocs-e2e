const { expect } = require('@playwright/test');

/**
 * Searches for a row across paginated tables.
 * 
 * @param {Page} page - The Playwright page object
 * @param {string} rowSelector - Selector to find the row (e.g., `tr.e-row:has(td[title="value"])`)
 * @param {string} nextButtonSelector - Selector for the pagination "Next" button
 * @param {number} maxPages - Optional limit to how many pages to search
 * @returns {Locator} - The found row locator, or throws if not found
 */
async function findRowAcrossPages(page, rowSelector, nextButtonSelector, maxPages = 10) {
  for (let i = 0; i < maxPages; i++) {
    const row = page.locator(rowSelector);
    const count = await row.count();
    if (count > 0) {
      console.log(`✅ Found row on page ${i + 1}`);
      return row;
    }

    const next = page.locator(nextButtonSelector);
    const isDisabled = await next.getAttribute('class');
    if (isDisabled && isDisabled.includes('e-disable')) {
      console.log('⛔ No more pages to paginate. Row not found.');
      break;
    }

    console.log(`➡️ Moving to page ${i + 2}...`);
    await next.click();
    await page.waitForTimeout(1000);
  }

  throw new Error(`🚫 Row not found across ${maxPages} pages.`);
}

module.exports = { findRowAcrossPages };
//Not Implemented.