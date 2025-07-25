const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');

module.exports = async function updateRuleset(page, rulesetName = '') {
  const cfg = config.ruleset;
  const { selectors, timeouts, rulesetData } = cfg;

  if (!rulesetName) {
    rulesetName = rulesetData.rulesetName;
    console.log(`⚠️ No rulesetName provided, using default: ${rulesetName}`);
  }

  try {
    console.log('🚀 Navigating to Rulesets page...');
    await navigateAndWait(page, 'ruleset');
    await page.waitForSelector(selectors.pageTitle, { timeout: timeouts.pageLoad });
    console.log('✅ Rulesets page loaded');

    console.log(`🔍 Searching for ruleset row with name: "${rulesetName}"`);
    const rowSelector = selectors.rulesetRowByTitle(rulesetName);
    await page.waitForSelector(rowSelector, { timeout: timeouts.navigation });
    const row = page.locator(rowSelector);

    const rowCount = await row.count();
    if (rowCount > 1) {
      console.log(`⚠️ Found ${rowCount} rulesets with name "${rulesetName}", selecting the first one`);
    }

    console.log('✅ Ruleset row found, clicking it...');
    await row.first().click();
    await page.waitForTimeout(timeouts.generalWait);

    console.log('✏️ Clicking Edit button in the toolbar...');
    const editButton = page.locator(selectors.editButton);
    await editButton.waitFor({ state: 'visible', timeout: timeouts.inputVisible });

    const box = await editButton.boundingBox();
    if (!box) throw new Error('❌ Edit button is not visible');

    await editButton.hover();
    await editButton.click();
    console.log('✅ Edit button clicked');

    await page.waitForTimeout(timeouts.inlineEditorWait);

    const rulesetNameEditor = page.locator(selectors.rulesetNameEditor);
    await rulesetNameEditor.waitFor({ state: 'visible', timeout: timeouts.pageLoad });
    console.log('✅ Ruleset name inline editor found');

    console.log('📝 Clicking inline editor to activate edit mode...');
    await rulesetNameEditor.click();
    await page.waitForTimeout(timeouts.editModeActivation);

    await page.waitForSelector(selectors.rulesetNamePopupInput, { timeout: timeouts.inputVisible });
    const nameInput = page.locator(selectors.rulesetNamePopupInput);
    console.log('✅ Edit popup appeared');

    console.log(`📝 Updating ruleset name to "${rulesetData.updatedRulesetName}"...`);
    await nameInput.clear();
    await nameInput.fill(rulesetData.updatedRulesetName);
    console.log('✅ Ruleset name filled');

    const inlineSaveButton = page.locator(selectors.rulesetNameSaveButton);
    console.log('💾 Clicking inline save button...');
    await inlineSaveButton.click();
    await page.waitForTimeout(timeouts.saveProcessing);
    console.log('✅ Inline save clicked');

    await page.waitForSelector(selectors.rulesetPopupTooltip, { state: 'hidden', timeout: timeouts.inputVisible });
    console.log('✅ Edit popup closed');

    console.log('💾 Clicking "Update Ruleset" button...');
    const mainSaveButton = page.locator(selectors.updateButton);
    await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.inputVisible });
    await mainSaveButton.click();
    console.log('✅ Update button clicked');

    console.log('🔔 Waiting for browser dialog...');
    let dialogHandled = false;
    const dialogHandler = async (dialog) => {
      if (dialogHandled) return;
      dialogHandled = true;
      console.log(`📢 Browser dialog appeared: ${dialog.message()}`);
      try {
        await dialog.accept();
        console.log('✅ Dialog accepted');
      } catch (error) {
        console.log('⚠️ Dialog error:', error.message);
      }
      page.off('dialog', dialogHandler);
    };
    page.on('dialog', dialogHandler);

    await page.waitForTimeout(timeouts.saveProcessing * 3);
    try {
      page.off('dialog', dialogHandler);
    } catch (_) {}

    console.log('✅ Ruleset changes saved');

    // ✅ Assertion: Verify update
    console.log(`🔍 Verifying updated ruleset name: "${rulesetData.updatedRulesetName}"`);
    await navigateAndWait(page, 'ruleset');
    await page.waitForSelector(selectors.pageTitle, { timeout: timeouts.pageLoad });

    const updatedRowSelector = selectors.rulesetRowByTitle(rulesetData.updatedRulesetName);
    const updatedRow = page.locator(updatedRowSelector);
    await updatedRow.waitFor({ state: 'visible', timeout: timeouts.navigation });

    const isVisible = await updatedRow.isVisible();
    if (!isVisible) {
      throw new Error(`❌ Updated ruleset "${rulesetData.updatedRulesetName}" not found`);
    }
    console.log(`✅ Updated ruleset "${rulesetData.updatedRulesetName}" is present in the list`);

    console.log('🎉 Ruleset update test completed successfully');
  } catch (error) {
    console.error('❌ updateRuleset error:', error);
    throw error;
  }
};
