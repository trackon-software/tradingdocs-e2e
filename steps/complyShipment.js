// complyShipment.js
const { expect } = require('@playwright/test');

async function complyShipment(page, rulesetName = 'Demo Ruleset') {
  const popoverSelector = '#driver-popover-content';
  const closeBtnSelector = `${popoverSelector} .driver-popover-close-btn`;

  // Step 0: Go to shipment page and let UI settle
  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-001');
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
}

module.exports = { complyShipment };
