const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { expect } = require('@playwright/test');

module.exports = async function updateExtractor(page, extractorName = '') {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  if (!extractorName) {
    extractorName = data.extractorName;
    console.log(`⚠️ No extractorName provided, using default: ${extractorName}`);
  }

  try {
    console.log('🚀 Navigating to Extractors page...');
    await page.goto(cfg.baseUrl);
    await navigateAndWait(page, 'extractors');
    await page.waitForTimeout(timeouts.generalWait);

    console.log(`🔍 Searching for extractor row with name: "${extractorName}"`);
    const rowSelector = selectors.extractorRowByTitle(extractorName);
    await page.waitForSelector(rowSelector, { timeout: timeouts.navigation });
    const row = page.locator(rowSelector);

    const rowCount = await row.count();
    expect(rowCount).toBeGreaterThan(0);
    console.log(`✅ Found ${rowCount} extractor row(s)`);

    if (rowCount > 1) {
      console.log(`⚠️ Multiple rows found, selecting the first one`);
    }

    await row.first().click();
    await page.waitForTimeout(timeouts.generalWait);

    console.log('✏️ Clicking Edit button in the toolbar for the selected row...');
    const editButton = page.locator(selectors.editButton);
    await expect(editButton).toBeVisible({ timeout: timeouts.input });

    const box = await editButton.boundingBox();
    if (!box) throw new Error('Edit button is not visible');

    await editButton.hover();
    await editButton.click();

    console.log('🎉 Edit button clicked, waiting for edit form to load...');
    await page.waitForTimeout(timeouts.inlineEditorWait);

    const extractorNameEditor = page.locator(selectors.extractorNameEditor);
    await expect(extractorNameEditor).toBeVisible({ timeout: timeouts.pageLoad });
    console.log('✅ Extractor name inline editor found');

    console.log('📝 Clicking extractor name editor to activate edit mode...');
    await extractorNameEditor.click();
    await page.waitForTimeout(timeouts.editModeActivation);

    const nameInput = page.locator(selectors.extractorNamePopupInput);
    await expect(nameInput).toBeVisible({ timeout: timeouts.input });
    console.log('✅ Edit popup appeared with input field');

    console.log(`📝 Updating extractor name to "${data.updatedExtractorName}"...`);
    await nameInput.fill(''); // clear the field explicitly
    await nameInput.fill(data.updatedExtractorName);
    await expect(nameInput).toHaveValue(data.updatedExtractorName);
    console.log('✅ Extractor name updated');

    const inlineSaveButton = page.locator(selectors.extractorNameSaveButton);
    await expect(inlineSaveButton).toBeVisible();
    console.log('💾 Clicking inline save button (tick symbol)...');
    await inlineSaveButton.click();

    await page.waitForTimeout(timeouts.saveProcessing);
    await expect(page.locator(selectors.extractorPopupTooltip)).toHaveCount(0, { timeout: timeouts.input });
    console.log('✅ Edit popup closed, update complete');

    console.log('💾 Clicking "Update Extractor" button...');
    const mainSaveButton = page.locator(selectors.mainSaveButton);
    await expect(mainSaveButton).toBeVisible({ timeout: timeouts.input });
    await mainSaveButton.click();
    console.log('✅ Update Extractor button clicked');

    console.log('🔔 Waiting for success popup/alert...');
    page.once('dialog', async dialog => {
      console.log(`📢 Browser dialog appeared: ${dialog.message()}`);
      await dialog.accept();
      console.log('✅ Browser dialog accepted');
    });

    await page.waitForTimeout(timeouts.saveProcessing * 2);
    console.log('✅ Main form changes saved successfully');

    console.log('🎉 Extractor updated successfully');

  } catch (e) {
    console.error('❌ Error in updateExtractor:', e.message);
    throw e;
  }
};
