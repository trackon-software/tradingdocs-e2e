const { expect } = require('@playwright/test');

async function waitForAndClosePopover(page) {
  const popoverSelector = '#driver-popover-content';
  const closeBtnSelector = `${popoverSelector} .driver-popover-close-btn`;

  console.log('⏳ Waiting for popover to appear (max 15s)...');
  await page.waitForSelector(popoverSelector, { state: 'visible', timeout: 15000 });
  console.log('⚠️ Popover appeared, closing it...');

  await page.click(closeBtnSelector);
  await page.waitForSelector(popoverSelector, { state: 'hidden', timeout: 10000 });
  console.log('✅ Popover closed');
}

async function captureDocument(page) {
  console.log('🚀 Starting captureDocument step');

  // Go to shipment detail page
  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-001');

  // Wait for upload button visible first
  await page.waitForSelector('#uploadFilesBtn', { state: 'visible', timeout: 15000 });
  console.log('✅ Navigated to shipment details page');

  // Wait for and close popover before doing anything else
  try {
    await waitForAndClosePopover(page);
  } catch {
    console.log('ℹ️ Popover did not appear, continuing...');
  }

  // Select the first document checkbox in the documents grid
  const firstCheckbox = page.locator('input.e-checkselect').first();
  await firstCheckbox.waitFor({ state: 'visible', timeout: 10000 });
  await firstCheckbox.click();
  console.log('✅ First document selected');

  // Click the "Capture" button
  const captureButton = page.locator('button', { hasText: 'Capture' });
  await captureButton.waitFor({ state: 'visible', timeout: 5000 });
  await captureButton.click();
  console.log('✅ Capture button clicked');

  // Optional: wait for any confirmation or processing indicator
  await page.waitForTimeout(2000);
  console.log('🎯 Capture process triggered successfully');
}

module.exports = captureDocument;
