const { expect } = require('@playwright/test');
const { popoverHandler } = require('../utils/popoverHandler');
const config = require('./config3.0'); 

const captureConfig = config.captureDocuments;
const DROPDOWN_SELECTOR = `${captureConfig.selectors.modal} ${captureConfig.selectors.dropdown}`;

async function captureDocument(page) {
  await page.goto(captureConfig.baseUrl + captureConfig.shipmentPath);
  console.log('🚀 Navigated to shipment page');

  await popoverHandler(page);

  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);
  if (!currentUrl.includes(captureConfig.shipmentPath)) {
    throw new Error(`❌ Unexpected redirect! Expected shipment page, got: ${currentUrl}`);
  }

  const rowLocator = page.locator(captureConfig.selectors.tableRow);
  try {
    await rowLocator.nth(0).waitFor({ state: 'visible', timeout: captureConfig.timeouts.tableRow });
    const rowsCount = await rowLocator.count();
    console.log(`ℹ️ Number of rows found: ${rowsCount}`);
    if (rowsCount === 0) {
      throw new Error('No rows found in the table');
    }
  } catch (err) {
    throw new Error(`Table rows did not appear in time: ${err.message}`);
  }

  await popoverHandler(page);

  try {
    console.log('🧹 Clearing any existing selections...');
    let currentUrl = page.url();
    console.log(`📍 URL before clearing selections: ${currentUrl}`);

    const header = page.locator(captureConfig.selectors.tableHeader).first();
    if (await header.isVisible()) {
      await header.click({ position: { x: 50, y: 10 } });
      await page.waitForTimeout(captureConfig.timeouts.shortDelay);
    }

    currentUrl = page.url();
    console.log(`📍 URL after clearing selections: ${currentUrl}`);
    if (!currentUrl.includes(captureConfig.shipmentPath)) {
      throw new Error(`❌ Redirect detected after clearing selections! URL: ${currentUrl}`);
    }

    const selectedRows = await page.locator(captureConfig.selectors.selectedRow).count();
    console.log(`ℹ️ Selected rows after clearing: ${selectedRows}`);
  } catch (err) {
    console.log(`⚠️ Warning during selection clearing: ${err.message}`);
    if (err.message.includes('Redirect detected')) {
      throw err;
    }
  }

  const targetRow = page.locator(captureConfig.selectors.tableRow, {
    has: page.locator(captureConfig.selectors.documentNameCell, { hasText: captureConfig.captureData.targetDocument })
  }).first();

  await targetRow.scrollIntoViewIfNeeded();
  await page.waitForTimeout(captureConfig.timeouts.shortDelay);

  const checkbox = targetRow.locator(captureConfig.selectors.checkbox);
  if (await checkbox.isVisible()) {
    await checkbox.click();
    console.log(`✅ Checkbox clicked for "${captureConfig.captureData.targetDocument}" row`);
  } else {
    throw new Error('❌ Checkbox not found in the matched row');
  }

  try {
    const selectedCount = await page.locator(captureConfig.selectors.selectedRow).count();
    console.log(`📊 Final selection count: ${selectedCount}`);
    if (selectedCount !== 1) {
      throw new Error(`Expected 1 selected row, but found ${selectedCount}. Aborting capture.`);
    }
  } catch (err) {
    throw new Error(`❌ Selection verification failed: ${err.message}`);
  }

  console.log(`⏸️ Pausing for ${captureConfig.timeouts.captureDelay / 1000} seconds before clicking Capture button...`);
  await page.waitForTimeout(captureConfig.timeouts.captureDelay);

  try {
    const captureBtn = page.locator(captureConfig.selectors.captureButton);
    await captureBtn.waitFor({ state: 'visible', timeout: captureConfig.timeouts.captureButton });
    const isDisabled = await captureBtn.evaluate(btn => btn.disabled);
    if (isDisabled) {
      throw new Error('Capture button is disabled, cannot click.');
    }
    await captureBtn.click();
    console.log('✅ Capture button clicked, waiting for modal...');
  } catch (err) {
    throw new Error(`Failed to click capture button: ${err.message}`);
  }

  await page.waitForSelector(captureConfig.selectors.modal, { state: 'visible', timeout: captureConfig.timeouts.modal });

  const dropdown = page.locator(DROPDOWN_SELECTOR);
  await dropdown.click();
  console.log('🔽 Dropdown clicked to open options');

  await page.waitForTimeout(captureConfig.timeouts.dropdownDelay);
  await dropdown.press('ArrowDown');
  await page.waitForTimeout(captureConfig.timeouts.shortDelay);
  await dropdown.press('Enter');
  console.log('✅ Dropdown option selected via keyboard');

  const modalCaptureBtn = page.locator(captureConfig.selectors.modalCaptureButton, { hasText: 'Capture' });
  await modalCaptureBtn.waitFor({ state: 'visible', timeout: captureConfig.timeouts.modalCapture });
  await modalCaptureBtn.click();
  console.log('✅ Modal Capture button clicked');

  await page.waitForSelector(captureConfig.selectors.modal, { state: 'hidden', timeout: captureConfig.timeouts.modalClose });
  console.log('✅ Modal closed after capture');

  const okBtn = page.locator(captureConfig.selectors.okButton, { hasText: 'OK' });
  await okBtn.waitFor({ state: 'visible', timeout: captureConfig.timeouts.okButton });
  await okBtn.click();
  console.log('✅ OK button clicked after capture');
}

module.exports = captureDocument;