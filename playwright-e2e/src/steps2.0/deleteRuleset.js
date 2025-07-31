const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { expect } = require('@playwright/test');
const { findRowAcrossPages } = require('../utils/paginationHelper');

module.exports = async function deleteRuleset(page, rulesetName) {
  const cfg = config.ruleset;
  const { selectors, timeouts, rulesetData } = cfg;
  const nextPage = selectors.nextPageButton;

  // Use updated name by default
  rulesetName = rulesetName || rulesetData.updatedRulesetName;

  try {
    console.log('🚀 Navigating to Rulesets page');
    await navigateAndWait(page, 'ruleset');
    await page.waitForLoadState('networkidle');

    console.log(`🔍 Searching for ruleset named "${rulesetName}" across pages...`);
    const rowSelector = selectors.rulesetRowByTitle(rulesetName);
    const row = await findRowAcrossPages(page, rowSelector, nextPage, 10);
    await row.scrollIntoViewIfNeeded();
    await row.click();
    console.log('✅ Ruleset row selected');

    const deleteBtn = page.locator(selectors.deleteButton);
    await expect(deleteBtn).toBeVisible({ timeout: timeouts.buttonVisible });
    await deleteBtn.click();
    console.log('🗑️ Delete button clicked');

    const popup = page.locator(selectors.deleteConfirmPopup);
    await expect(popup).toBeVisible({ timeout: timeouts.successVisible });
    console.log('✅ Confirmation popup appeared');

    const confirmBtn = page.locator(selectors.deleteConfirmOkButton);
    await expect(confirmBtn).toBeVisible({ timeout: timeouts.buttonVisible });
    await confirmBtn.click();
    console.log('✅ Delete confirmed');

    const successPopup = page.locator('div.e-alert-dialog.e-popup-open');
    try {
      await successPopup.waitFor({ state: 'visible', timeout: 2000 });
      console.log('🎉 Success popup appeared');
    } catch {
      console.log('ℹ️ No success popup — relying on row disappearance');
    }

    console.log('⏳ Waiting for delete operation to complete...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const deletedRow = page.locator(rowSelector);
    await expect(deletedRow).toHaveCount(0, { timeout: timeouts.successVisible });
    console.log(`🎉 Ruleset "${rulesetName}" deleted successfully`);

  } catch (e) {
    console.error('❌ deleteRuleset failed:', e.message);
    throw e;
  }
};
