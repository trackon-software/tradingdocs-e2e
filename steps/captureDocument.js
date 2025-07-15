const { expect } = require('@playwright/test');

async function captureDocument(page) {
  const popoverSelector = '#driver-popover-content';
  const closeBtnSelector = `${popoverSelector} .driver-popover-close-btn`;

  // Step 0: Go to shipment page and let UI settle
  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-002');
  console.log('🚀 Navigated to shipment page');
  await page.waitForTimeout(2000); // Let animations or popovers start

  // Step 1: Close popover if it appears
  try {
    console.log('⏳ Waiting for possible popover (max 5s)...');
    await page.waitForSelector(popoverSelector, { state: 'visible', timeout: 5000 });
    console.log('⚠️ Popover detected, attempting to close it...');
    await page.click(closeBtnSelector);
    await page.waitForSelector(popoverSelector, { state: 'hidden', timeout: 7000 });
    console.log('✅ Popover closed successfully');
  } catch (err) {
    console.log('✅ No popover detected — continuing.');
  }

  // Step 2: Click the first row's checkbox input
  const checkboxInput = page.locator('tr.e-row').first().locator('input[type="checkbox"]');
  await checkboxInput.waitFor({ state: 'visible', timeout: 5000 });
  await checkboxInput.click();
  console.log('✅ Checkbox input in first row clicked');

  // Wait for UI to register the selection
  await page.waitForTimeout(1000);

  // Step 3: Click Capture button
  const captureBtn = page.locator('#captureBtn');
  await captureBtn.waitFor({ state: 'visible', timeout: 5000 });

  const isDisabled = await captureBtn.evaluate(btn => btn.disabled);
  if (isDisabled) {
    throw new Error('Capture button is disabled, cannot click.');
  }

  await captureBtn.click();
  console.log('✅ Capture button clicked');
}

module.exports = captureDocument;
