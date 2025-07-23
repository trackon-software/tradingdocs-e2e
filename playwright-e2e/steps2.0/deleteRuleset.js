const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');
const { expect } = require('@playwright/test');

module.exports = async function deleteRuleset(page) {
  const cfg = config.ruleset;
  const { selectors, timeouts, rulesetData } = cfg;

  console.log('🚀 Navigating to Rulesets page');
  await navigateAndWait(page, 'ruleset');

  console.log(`🔍 Searching for ruleset named "${rulesetData.rulesetName}"`);
  const row = page.locator(selectors.tableRow, { hasText: rulesetData.rulesetName }).first();
  
  // Assert the ruleset row exists and is visible
  await expect(row).toBeVisible({ timeout: timeouts.pageLoad });
  await row.scrollIntoViewIfNeeded();
  await row.click();
  console.log('✅ Ruleset row found and selected');

  console.log('🗑️ Clicking Delete button');
  const deleteButton = page.locator(selectors.deleteButton);
  
  // Assert delete button is visible and click it
  await expect(deleteButton).toBeVisible({ timeout: timeouts.selector });
  await deleteButton.click();
  console.log('✅ Delete button clicked');

  console.log('⏳ Waiting for confirmation popup...');
  const confirmPopup = page.locator('div.e-confirm-dialog.e-popup-open');
  
  // Assert confirmation popup appears
  await expect(confirmPopup).toBeVisible({ timeout: timeouts.pageLoad });
  console.log('✅ Confirmation popup appeared');

  console.log('☑️ Confirming delete');
  const confirmOkButton = page.locator('div.e-confirm-dialog.e-popup-open div.e-footer-content button.e-primary:has-text("OK")');
  
  // Assert OK button is visible and click it
  await expect(confirmOkButton).toBeVisible({ timeout: timeouts.selector });
  await confirmOkButton.click();
  console.log('✅ Delete confirmed');

  // Assert successful deletion by checking that the row disappears
  await expect(row).not.toBeAttached({ timeout: timeouts.pageLoad });
  console.log(`🎉 Ruleset "${rulesetData.rulesetName}" deleted successfully`);
};