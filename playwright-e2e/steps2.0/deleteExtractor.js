const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');
const { expect } = require('@playwright/test');

module.exports = async function deleteExtractor(page, extractorName = '') {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  if (!extractorName) {
    extractorName = data.extractorName;
    console.log(`⚠️ No extractorName provided, using default: ${extractorName}`);
  }

  console.log('🚀 Navigating to Extractors page...');
  await navigateAndWait(page, 'extractors');
  await page.waitForTimeout(1000);

  console.log(`🔍 Searching for extractor row with name: "${extractorName}"`);
  const rowSelector = `tr.e-row:has(td[title="${extractorName}"])`;
  const row = page.locator(rowSelector);

  // Assert the extractor row exists and is visible
  await expect(row).toBeVisible({ timeout: timeouts.navigation });
  console.log('✅ Extractor row found');

  // Click the row
  await row.click();
  console.log('✅ Extractor row clicked');
  await page.waitForTimeout(500);

  console.log('🗑️ Looking for Delete button...');
  const deleteButton = page.locator('button[aria-label="Delete"]:not([aria-disabled="true"])');

  // Assert delete button is visible and enabled
  await expect(deleteButton).toBeVisible({ timeout: timeouts.input });
  await deleteButton.click();
  console.log('✅ Delete button clicked');

  // Assert confirmation popup appears (you may need to adjust this selector based on your actual popup)
  console.log('⏳ Waiting for confirmation popup...');
  const confirmPopup = page.locator('.e-confirm-dialog.e-popup-open, .e-dialog.e-popup-open[role="dialog"]');
  await expect(confirmPopup).toBeVisible({ timeout: timeouts.modal });
  console.log('✅ Confirmation popup appeared');

  // If there's a confirmation step, you can add it here:
  const confirmOkButton = page.locator('.e-confirm-dialog.e-popup-open .e-footer-content button.e-primary');
  await expect(confirmOkButton).toBeVisible({ timeout: timeouts.input });
  await confirmOkButton.click();
  console.log('✅ Delete confirmed');

  // Assert successful deletion by checking that the row disappears
  await expect(row).not.toBeAttached({ timeout: timeouts.navigation });
  console.log(`🎉 Extractor "${extractorName}" deleted successfully`);
};