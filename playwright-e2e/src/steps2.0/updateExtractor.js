const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { expect } = require('@playwright/test');
const { findRowAcrossPages } = require('../utils/paginationHelper');

module.exports = async function updateExtractor(page, extractorName = '') {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  if (!extractorName) {
    extractorName = data.extractorName;
    console.log(`⚠️ No extractorName provided, using default: ${extractorName}`);
  }

  try {
    console.log('🚀 Navigating to Extractors page...');
    await navigateAndWait(page, 'extractors');

    console.log(`🔍 Locating extractor row with name: "${extractorName}"...`);
    const rowSelector = selectors.extractorRowByTitle(extractorName);
    const row = await findRowAcrossPages(page, rowSelector, selectors.nextPageButton);
    await expect(row.first()).toBeVisible({ timeout: timeouts.navigation });
    await row.first().click();

    console.log('✏️ Clicking Edit button...');
    const editButton = page.locator(selectors.editButton);
    await expect(editButton).toBeVisible({ timeout: timeouts.input });
    await expect(editButton).toBeEnabled({ timeout: 2000 });
    await editButton.click();

    console.log('⏳ Waiting for inline editor...');
    const extractorNameEditor = page.locator(selectors.extractorNameEditor);
    await expect(extractorNameEditor).toBeVisible({ timeout: timeouts.pageLoad });

    console.log('📝 Activating name editor...');
    await extractorNameEditor.click();

    const nameInput = page.locator(selectors.extractorNamePopupInput);
    await expect(nameInput).toBeVisible({ timeout: timeouts.input });

    console.log(`🔁 Changing name to "${data.updatedExtractorName}"...`);
    await nameInput.fill('');
    await nameInput.fill(data.updatedExtractorName);
    await expect(nameInput).toHaveValue(data.updatedExtractorName);

    const inlineSaveButton = page.locator(selectors.extractorNameSaveButton);
    await expect(inlineSaveButton).toBeVisible({ timeout: timeouts.input });
    await inlineSaveButton.click();

    console.log('💾 Waiting for tooltip to close...');
    await expect(page.locator(selectors.extractorPopupTooltip)).toHaveCount(0, { timeout: timeouts.input });

    const mainSaveButton = page.locator(selectors.mainSaveButton);
    await expect(mainSaveButton).toBeVisible({ timeout: timeouts.input });
    await expect(mainSaveButton).toBeEnabled({ timeout: 2000 });
    await mainSaveButton.click();
    console.log('✅ Clicked Update Extractor');

    page.once('dialog', async dialog => {
      console.log(`📢 Dialog appeared: ${dialog.message()}`);
      await dialog.accept();
    });

    await page.waitForTimeout(timeouts.saveProcessing * 2);
    console.log('🎉 Extractor updated successfully');

  } catch (e) {
    console.error(`❌ updateExtractor failed: ${e.message}`);
    throw e;
  }
};
