const { expect } = require('@playwright/test');
const config = require('./config2.0');

module.exports = async function deleteExtractor(page, extractorName) {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  extractorName = extractorName || data.updatedExtractorName;
  console.log(`🔍 Searching for extractor with name: "${extractorName}"`);

  try {
    console.log('🚀 Navigating to Extractors page...');
    await page.goto(cfg.baseUrl);
    await expect(page.locator(selectors.pageTitle)).toBeVisible({ timeout: timeouts.pageLoad });
    console.log('✅ Navigated to Extractors page');

    const rowSelector = selectors.extractorRowByTitle(extractorName);
    const extractorRow = page.locator(rowSelector);

    console.log('⏳ Waiting for extractor row to appear...');
    await expect(extractorRow.first()).toBeVisible({ timeout: timeouts.pageLoad });
    console.log('✅ Extractor row found');

    await extractorRow.first().click();
    console.log('🟡 Extractor row clicked');

    const deleteButton = page.locator(selectors.deleteButton);
    await expect(deleteButton).toBeVisible({ timeout: timeouts.buttonVisible });
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();
    console.log('🗑️ Delete button clicked');

    const confirmPopup = page.locator(selectors.confirmDeletePopup);
    await expect(confirmPopup).toBeVisible({ timeout: timeouts.modalOpen });
    console.log('✅ Confirmation popup appeared');

    const confirmOkButton = page.locator(selectors.confirmDeleteButton);
    await expect(confirmOkButton).toBeVisible({ timeout: timeouts.modalOpen });
    await expect(confirmOkButton).toBeEnabled();
    await confirmOkButton.click();
    console.log('✅ Delete confirmed');

    // Post-delete: assert row is either gone or hidden
    await expect(extractorRow.first()).not.toBeVisible({ timeout: timeouts.modalClose });
    console.log('🎉 Extractor deleted successfully');

  } catch (e) {
    console.error('❌ deleteExtractor failed:', e.message);
    try {
      await page.screenshot({
        path: `deleteExtractor-failure-${Date.now()}.png`,
        fullPage: true
      });
      console.log('📸 Screenshot captured');
    } catch (screenshotErr) {
      console.error('❌ Screenshot failed:', screenshotErr.message);
    }
    throw e;
  }
};
