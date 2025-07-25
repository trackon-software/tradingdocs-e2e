const { expect } = require('@playwright/test');
const config = require('./config2.0');

module.exports = async function deleteExtractor(page, extractorName) {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  extractorName = extractorName || data.updatedExtractorName;
  console.log(`🔍 Searching for extractor with name: "${extractorName}"`);

  console.log('🚀 Navigating to Extractors page...');
  await page.goto(cfg.baseUrl);
  await page.waitForSelector(selectors.pageTitle, { timeout: timeouts.pageLoad });
  console.log('✅ Navigated to Extractors page');

  const rowSelector = selectors.extractorRowByTitle(extractorName);
  const extractorRow = page.locator(rowSelector);

  // Wait for row count > 0 and then check it's visible before clicking
  await page.waitForFunction(
    selector => document.querySelectorAll(selector).length > 0,
    rowSelector,
    { timeout: timeouts.pageLoad }
  );
  await expect(extractorRow.first()).toBeVisible({ timeout: timeouts.pageLoad });
  console.log('✅ Extractor row found');

  await extractorRow.first().click();
  console.log('🟡 Extractor row clicked (selected)');
  await page.waitForTimeout(timeouts.generalWait);

  const deleteButton = page.locator(selectors.deleteButton);
  await expect(deleteButton).toBeVisible({ timeout: timeouts.buttonVisible });
  await deleteButton.click();
  console.log('🗑️ Delete button clicked');
  await page.waitForTimeout(timeouts.generalWait);

  console.log('⏳ Waiting for confirmation popup...');
  const confirmPopup = page.locator(selectors.confirmDeletePopup);
  await expect(confirmPopup).toBeVisible({ timeout: timeouts.modalOpen });
  console.log('✅ Confirmation popup appeared');

  const confirmOkButton = page.locator(selectors.confirmDeleteButton);
  await expect(confirmOkButton).toBeVisible({ timeout: timeouts.modalOpen });
  await confirmOkButton.click();
  console.log('✅ Delete confirmed');

  // Wait for deletion to complete: row should disappear from DOM
  await expect(extractorRow.first()).not.toBeAttached({ timeout: timeouts.modalClose });
  console.log('🎉 Extractor deleted successfully (row disappeared)');
};
