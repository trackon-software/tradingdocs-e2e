const { expect } = require('@playwright/test');

module.exports = async function createRuleset(page) {
  // Step 1: Navigate to Rulesets page
  await page.goto('https://demo.tradingdocs.ai/rulesets');
  await page.waitForSelector('text=Rulesets', { timeout: 10000 });
  console.log('✅ Navigated to Rulesets page');

  // Step 2: Click "Add" button
  await page.click('span.e-tbar-btn-text:has-text("Add")');
  await page.waitForSelector('#rulesetName', { state: 'visible', timeout: 5000 });
  console.log('✅ Add Ruleset form opened');

  // Small delay before filling inputs
  await page.waitForTimeout(500);

  // Step 3: Fill text inputs
  const rulesetInfo = {
    '#rulesetName': 'Test Ruleset',
    '#rulesetDescription': 'Automatically created via Playwright',
    '#commodity': 'Steel',
    '#destinationCountry': 'UAE',
    '#originCountry': 'Turkey',
    '#effectiveDate': '07/14/2025',
    '#rulesetSource': 'Auto Test',
    '#rules': 'IF commodity == "Steel" THEN apply tax'
  };

  for (const [selector, value] of Object.entries(rulesetInfo)) {
    await page.fill(selector, value);
    await page.waitForTimeout(100); // slight pause after each fill for stability
  }
  console.log('✅ Ruleset basic inputs filled');

  // Small delay before dropdown selection
  await page.waitForTimeout(500);

  // Step 4: Select "Ruleset Type" from dropdown
  await page.click('#rulesetType ~ .e-input-group-icon.e-ddl-icon');
  console.log('✅ Clicked Ruleset Type dropdown icon');

  await page.waitForSelector('#rulesetType_popup', { state: 'visible', timeout: 5000 });
  await page.waitForSelector('#rulesetType_popup .e-list-item', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500); // increased wait to let dropdown settle

  const typeOption = page.locator('#rulesetType_popup .e-list-item').first();
  await typeOption.waitFor({ state: 'visible', timeout: 5000 });
  await typeOption.click();
  console.log('✅ Ruleset Type selected');

  // Small delay before accordion interaction
  await page.waitForTimeout(500);

  // Step 5: Open "Metadata" accordion if not already open
  const metadataAccordion = page.locator('.e-acrdn-header:has-text("Metadata")');
  if (await metadataAccordion.getAttribute('aria-expanded') === 'false') {
    await metadataAccordion.click();
    await page.waitForTimeout(500); // increased buffer for animation
    console.log('✅ Metadata accordion expanded');
  }

  // Small delay before next dropdown
  await page.waitForTimeout(500);

  // Step 6: Select "Is Active" dropdown
  await page.locator('#isActive').scrollIntoViewIfNeeded();
  console.log('🔍 Scrolled to Is Active dropdown');

  await page.click('#isActive ~ .e-input-group-icon.e-ddl-icon');
  console.log('✅ Clicked Is Active dropdown icon');

  await page.waitForSelector('#isActive_popup', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#isActive_popup .e-list-item', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500); // wait for dropdown to fully settle

  const activeOption = page.locator('#isActive_popup .e-list-item').filter({ hasText: 'Y' });
  await activeOption.waitFor({ state: 'visible', timeout: 5000 });
  await activeOption.click();
  console.log('✅ "Y" selected from Is Active dropdown');

  // Step 7: Click "Save"
  await page.waitForTimeout(300);
  await page.click('button.e-edit-dialog.submit-button');
  console.log('✅ Save button clicked (ruleset)');

  // Optional: confirm creation in list
  await page.waitForSelector('text=Test Ruleset', { timeout: 10000 });
  console.log('🎉 Ruleset successfully created and listed');
};
