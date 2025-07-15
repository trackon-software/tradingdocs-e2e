// complyShipment.js
const { expect } = require('@playwright/test');

// Helper function to wait for file status without page refresh
async function waitForFileStatus(page, expectedStatus = 'Splitted', maxWaitTime = 90000) {
  const statusSelector = 'td[data-field="status"] .status-badge span.text-white';
  const startTime = Date.now();
  
  console.log(`⏳ Waiting for file status to change to "${expectedStatus}"...`);
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Check if status element exists and get its text
      const statusElement = await page.locator(statusSelector).first();
      const statusText = await statusElement.textContent();
      
      if (statusText && statusText.trim() === expectedStatus) {
        console.log(`✅ File status changed to "${expectedStatus}"`);
        return true;
      }
      
      console.log(`⏳ Current status: "${statusText?.trim() || 'unknown'}", waiting...`);
      await page.waitForTimeout(5000); // Check every 5 seconds
      
    } catch (error) {
      console.log('⏳ Status element not found yet, continuing to wait...');
      await page.waitForTimeout(5000);
    }
  }
  
  throw new Error(`Timeout: File status did not change to "${expectedStatus}" within ${maxWaitTime}ms`);
}

async function complyShipment(page, rulesetName = 'Demo Ruleset') {
  const popoverSelector = '#driver-popover-content';
  const closeBtnSelector = `${popoverSelector} .driver-popover-close-btn`;

  // Step 0: Go to shipment page and let UI settle
  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-002');
  console.log('🚀 Navigated to shipment page');
  await page.waitForTimeout(2000); // Let animations or popovers start

  // Step 1: Check for popover before interacting with anything
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

  // Step 2: Click Comply (All)
  await page.waitForTimeout(1000); // Let UI stabilize more
  await page.click('button:has-text("Comply")');
  console.log('✅ Clicked "Comply (All)" button');

  // Step 3: Wait for dropdown field
  await page.waitForSelector('#rulesetTemplate', { state: 'visible', timeout: 15000 });
  console.log('✅ Ruleset input field visible');

  // Step 4: Click dropdown icon to trigger popup
  await page.click('#rulesetTemplate ~ .e-input-group-icon.e-ddl-icon');
  console.log('✅ Clicked dropdown icon for ruleset list');

  // Step 5: Wait for popup and options to appear
  await page.waitForSelector('#rulesetTemplate_popup', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('#rulesetTemplate_popup .e-list-item', { state: 'visible', timeout: 7000 });
  await page.waitForTimeout(500); // Let it visually settle

  // Step 6: Select the desired ruleset
  const rulesetOption = page.locator('#rulesetTemplate_popup .e-list-item').filter({ hasText: rulesetName });
  await rulesetOption.waitFor({ state: 'visible', timeout: 7000 });
  await rulesetOption.click();
  console.log(`✅ Selected ruleset: "${rulesetName}"`);

  // Step 7: Click the Select button in the modal
  await page.waitForTimeout(800); // Let selection register in the system
  await page.click('.e-dialog .e-footer-content button:has-text("Select")');
  console.log('✅ Clicked "Select" to confirm ruleset');

  // Step 8: Wait for file processing to complete (NEW)
  await waitForFileStatus(page, 'Splitted', 90000); // Wait up to 90 seconds
  
}

module.exports = { complyShipment, waitForFileStatus };