const { expect } = require('@playwright/test');
const navigateAndWait = require('../utils/navigateAndWait');
const config = require('../steps2.0/config2.0');
const path = require('path');
const fs = require('fs');

module.exports = async function entityBuilder(page) {
  const cfg = config.entityBuilder;
  const { selectors, timeouts, texts } = cfg;

  const screenshotsDir = path.resolve('src', 'test-results', 'screenshots');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    console.log('🚀 Navigating to Entity Builder...');
    await navigateAndWait(page, 'entityBuilder');

    await page.waitForLoadState('domcontentloaded');

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible({ timeout: timeouts.modalOpen });
    console.log('✅ Modal is visible');

    const modalTitle = modal.locator(selectors.modalTitle);
    await expect(modalTitle).toHaveText(texts.modalTitleText, {
      timeout: timeouts.buttonVisible
    });
    console.log(`✅ Modal title confirmed: ${texts.modalTitleText}`);

    const headerRadio = modal.locator(selectors.headerRadio);
    await expect(headerRadio).toBeVisible({ timeout: timeouts.buttonVisible });

    const isChecked = await headerRadio.isChecked();
    console.log(`📋 Header Data radio button is checked: ${isChecked}`);

    const continueButton = modal.locator(selectors.continueButton);
    await expect(continueButton).toBeVisible({ timeout: timeouts.buttonVisible });
    console.log(`✅ ${texts.continueButtonText} button is visible`);

    try {
      await continueButton.click();
      console.log(`👉 ${texts.continueButtonText} button clicked successfully`);
    } catch {
      console.warn('⚠️ Normal click failed, retrying with force...');
      await continueButton.click({ force: true });
      console.log(`👉 ${texts.continueButtonText} button clicked with force`);
    }

    await expect(modal).toBeHidden({ timeout: timeouts.modalClose });
    console.log('✅ Modal closed successfully');

    const entityBuilderCard = page.locator(selectors.entityBuilderTitle);
    await expect(entityBuilderCard).toHaveText(texts.entityBuilderPageTitle, {
      timeout: timeouts.pageLoad
    });
    console.log(`✅ ${texts.entityBuilderPageTitle} page loaded`);

    const dataTable = page.locator(selectors.dataTable);
    await expect(dataTable).toBeVisible({ timeout: timeouts.tableVisible });
    console.log('✅ Data table is visible');

    const tableRows = page.locator(selectors.dataTableRows);
    await expect(tableRows.first()).toBeVisible({ timeout: timeouts.rowsLoad });

    const rowCount = await tableRows.count();
    console.log(`📦 ${rowCount} Entity rows loaded`);

    const createEntityButton = page.locator(selectors.createEntityButton);
    await expect(createEntityButton).toBeVisible({ timeout: timeouts.buttonVisible });
    console.log(`✅ ${texts.createEntityButtonText} button is visible`);

    try {
      await createEntityButton.click();
      console.log(`👉 ${texts.createEntityButtonText} button clicked successfully`);
    } catch {
      console.warn('⚠️ Normal click failed, retrying with force...');
      await createEntityButton.click({ force: true });
      console.log(`👉 ${texts.createEntityButtonText} button clicked with force`);
    }

    console.log('✅ Entity Builder process completed');

  } catch (error) {
    console.error('❌ entityBuilder failed:', error.message);

    try {
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }
      const screenshotPath = path.join(screenshotsDir, `entityBuilder_${timestamp}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } catch (ssErr) {
      console.error('❌ Failed to save screenshot:', ssErr.message);
    }

    throw error;
  }
};
