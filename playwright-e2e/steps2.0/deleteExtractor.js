// steps2.0/deleteExtractor.js

const { expect } = require('@playwright/test');
const config = require('./config2.0');

module.exports = async function deleteExtractor(page, extractorName) {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  // Use the provided name or fall back to the updated name from config
  // This ensures we're looking for the extractor by its current name, not the original description
  extractorName = extractorName || data.updatedExtractorName;
  console.log(`🔍 Searching for extractor with name: "${extractorName}"`);

  console.log('🚀 Navigating to Extractors page...');
  await page.goto(cfg.baseUrl);
  await page.waitForSelector(selectors.pageTitle, { timeout: timeouts.pageLoad });
  console.log('✅ Navigated to Extractors page');

  console.log(`🔍 Searching for extractor with name: "${extractorName}"`);
  // Use the proper selector for finding by name, not description
  const rowSelector = selectors.extractorRowByTitle(extractorName);

  // Assert extractor row exists
  const extractorRow = page.locator(rowSelector);
  await expect(extractorRow).toBeVisible({ timeout: timeouts.pageLoad });
  console.log('✅ Extractor row found');

  // Click the extractor row
  await extractorRow.click();
  console.log('🟡 Extractor row clicked (selected)');
  await page.waitForTimeout(timeouts.generalWait);

  // Assert delete button is visible and click it
  const deleteButton = page.locator(selectors.deleteButton);
  await expect(deleteButton).toBeVisible({ timeout: timeouts.buttonVisible });
  await deleteButton.click();
  console.log('🗑️ Delete button clicked');
  await page.waitForTimeout(timeouts.generalWait);

  // Assert confirmation popup appears
  console.log('⏳ Waiting for confirmation popup...');
  const confirmPopup = page.locator(selectors.confirmDeletePopup);
  await expect(confirmPopup).toBeVisible({ timeout: timeouts.modalOpen });
  console.log('✅ Confirmation popup appeared');

  // Assert OK button exists and click it
  const confirmOkButton = page.locator(selectors.confirmDeleteButton);
  await expect(confirmOkButton).toBeVisible({ timeout: timeouts.modalOpen });
  await confirmOkButton.click();
  console.log('✅ Delete confirmed');
  await page.waitForTimeout(timeouts.saveProcessing * 2); // Give more time for deletion

  // Assert successful deletion - extractor row should disappear
  await expect(extractorRow).not.toBeAttached({ timeout: timeouts.modal });
  console.log('🎉 Extractor deleted successfully (row disappeared)');
};