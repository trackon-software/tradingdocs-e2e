const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { expect } = require('@playwright/test');
const { findRowAcrossPages } = require('../utils/paginationHelper');

module.exports = async function updateRuleset(page, updatedName) {
  const cfg = config.ruleset;
  const { selectors, rulesetData, timeouts } = cfg;
  const nextPage = selectors.nextPageButton;

  if (!updatedName) updatedName = rulesetData.updatedRulesetName;

  try {
    console.log('🚀 Navigating to Rulesets page...');
    await navigateAndWait(page, 'ruleset');
    await page.waitForLoadState('networkidle');

    console.log(`🔍 Searching for ruleset row with name: "${rulesetData.rulesetName}"`);
    const rowSelector = selectors.rulesetRowByTitle(rulesetData.rulesetName);
    const row = await findRowAcrossPages(page, rowSelector, nextPage, 10);
    await row.click();
    console.log('✅ Ruleset row found and clicked');

    console.log('✏️ Clicking Edit button...');
    const editBtn = page.locator(selectors.editButton);
    await expect(editBtn).toBeVisible({ timeout: timeouts.buttonVisible });
    await editBtn.click();
    console.log('✅ Edit button clicked');

    const inlineEditor = page.locator(selectors.rulesetNameEditor);
    await page.waitForTimeout(300); // DOM settle
    await expect(inlineEditor).toBeVisible({ timeout: timeouts.inputVisible });
    console.log('✅ Inline name editor visible');

    console.log('📝 Clicking to activate name editor...');
    await inlineEditor.click();

    const inputSelector = selectors.rulesetNamePopupInput;
    const inputField = page.locator(inputSelector);
    await expect(inputField).toBeVisible({ timeout: timeouts.inputVisible });

    console.log(`✍️ Updating ruleset name to "${updatedName}"`);
    await inputField.fill(updatedName);
    await expect(inputField).toHaveValue(updatedName);

    const inlineSave = page.locator(selectors.rulesetNameSaveButton);
    await inlineSave.click();
    console.log('💾 Inline Save clicked');

    await expect(page.locator(selectors.rulesetPopupTooltip)).toHaveCount(0, { timeout: timeouts.saveProcessing });
    console.log('✅ Edit popup closed');

    const updateBtn = page.locator(selectors.updateButton);
    await expect(updateBtn).toBeVisible({ timeout: timeouts.buttonVisible });
    await updateBtn.click();
    console.log('✅ Update button clicked');

    await page.waitForLoadState('networkidle');

    console.log(`🔍 Verifying updated ruleset name: "${updatedName}"`);
    await navigateAndWait(page, 'ruleset');
    await page.waitForLoadState('networkidle');

    const updatedRowSelector = selectors.rulesetRowByTitle(updatedName);
    await findRowAcrossPages(page, updatedRowSelector, nextPage, 10);
    console.log(`✅ Updated ruleset "${updatedName}" found in table`);

  } catch (e) {
    console.error('❌ updateRuleset error:', e.message);
    throw e;
  }
};
