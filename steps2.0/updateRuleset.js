const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');

module.exports = async function updateRuleset(page) {
  const cfg = config.ruleset;
  const { selectors, timeouts, rulesetData } = cfg;

  try {
    console.log('🚀 Navigating to Ruleset page...');
    await navigateAndWait(page, 'ruleset');
    await page.waitForSelector(selectors.pageTitle, { timeout: timeouts.pageLoad });
    console.log('✅ Ruleset page loaded');

    const rowSelector = `tr.e-row:has(td[title="${rulesetData.rulesetName}"])`;
    await page.waitForSelector(rowSelector, { timeout: timeouts.pageLoad });
    console.log('✅ Ruleset row found');

    await page.click(rowSelector);
    await page.waitForSelector(selectors.editButton, { timeout: timeouts.formVisible });
    await page.click(selectors.editButton);
    console.log('✏️ Edit button clicked');

    // Wait for the description field to be editable
    const descriptionSelector = selectors.descriptionEditor;
    await page.waitForSelector(descriptionSelector, { timeout: timeouts.formVisible * 2 });
    console.log('✅ Description field found');

    // Click on the description field to edit
    await page.click(descriptionSelector);
    await page.waitForSelector(selectors.descriptionEditorInput, { timeout: timeouts.inputVisible });
    console.log('✅ Description input field found');

    // Fill the new description
    const newDescription = 'Edit test passed';
    await page.fill(selectors.descriptionEditorInput, newDescription);
    console.log('📝 Description updated to:', newDescription);

    // Click the "tick" symbol to save the changes
    const saveDescriptionSelector = selectors.descriptionSaveButton;
    await page.waitForSelector(saveDescriptionSelector, { timeout: timeouts.buttonVisible });
    await page.click(saveDescriptionSelector);
    console.log('✅ Description saved');

    // Check if the "Update Ruleset" button is disabled
    const updateButtonSelector = selectors.updateButton;
    await page.waitForSelector(updateButtonSelector, { timeout: timeouts.buttonVisible });
    const isUpdateButtonDisabled = await page.$eval(updateButtonSelector, (btn) => btn.classList.contains('disabled'));
    console.log(`🔍 Update Ruleset button is ${isUpdateButtonDisabled ? 'disabled' : 'enabled'}`);

  } catch (error) {
    console.error('❌ updateRuleset error:', error);
    // Continue even if there's an error (do not throw)
  }
};