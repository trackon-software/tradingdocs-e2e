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
    console.log('✅ Ruleset page loaded');

    console.log(`🔍 Searching for ruleset row with name: "${rulesetName}"`);
    // Use the dynamic selector from config
    const rowSelector = selectors.rulesetRowByTitle(rulesetName);
    await page.waitForSelector(rowSelector, { timeout: timeouts.navigation });
    const row = page.locator(rowSelector);

    console.log('✅ Ruleset row found, clicking it...');
    // Handle multiple rows with same name
    const rowCount = await row.count();
    if (rowCount > 1) {
      console.log(`⚠️ Found ${rowCount} rulesets with name "${rulesetName}", selecting the first one`);
    }
    await row.first().click();
    await page.waitForTimeout(timeouts.generalWait);

    console.log('✏️ Clicking Edit button in the toolbar for the selected row...');
    const editButton = page.locator(selectors.editButton);
    await editButton.waitFor({ state: 'visible', timeout: timeouts.inputVisible });

    const box = await editButton.boundingBox();
    if (!box) throw new Error('Edit button is not visible');

    await editButton.hover();
    await editButton.click();

    console.log('🎉 Edit button clicked, waiting for edit form to load...');
    
    // Wait for the inline editor to load
    await page.waitForTimeout(timeouts.inlineEditorWait);
    
    // Find the ruleset name inline editor using config selector
    const rulesetNameEditor = page.locator(selectors.rulesetNameEditor);
    await rulesetNameEditor.waitFor({ state: 'visible', timeout: timeouts.pageLoad });
    console.log('✅ Ruleset name inline editor found');

    // Click on the inline editor to activate edit mode
    console.log('📝 Clicking ruleset name editor to activate edit mode...');
    await rulesetNameEditor.click();
    await page.waitForTimeout(timeouts.editModeActivation);
    
    // Wait for the popup tooltip to appear and find the input field
    await page.waitForSelector(selectors.rulesetNamePopupInput, { timeout: timeouts.inputVisible });
    const nameInput = page.locator(selectors.rulesetNamePopupInput);
    console.log('✅ Edit popup appeared with input field');
    
    console.log(`📝 Updating ruleset name to "${rulesetData.updatedRulesetName}"...`);
    await nameInput.clear();
    await nameInput.fill(rulesetData.updatedRulesetName);
    console.log('✅ Ruleset name updated');

    // Click the save button (tick symbol) using config selector
    console.log('💾 Clicking inline save button (tick symbol)...');
    const inlineSaveButton = page.locator(selectors.rulesetNameSaveButton);
    await inlineSaveButton.click();
    await page.waitForTimeout(timeouts.saveProcessing);
    console.log('✅ Inline save button clicked');

    // Wait for the popup to disappear (indicating save is complete)
    await page.waitForSelector(selectors.rulesetPopupTooltip, { state: 'hidden', timeout: timeouts.inputVisible });
    console.log('✅ Edit popup closed, update complete');

    // Save the changes on the main form
    console.log('💾 Clicking "Update Ruleset" button...');
    const mainSaveButton = page.locator(selectors.updateButton);
    await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.inputVisible });
    await mainSaveButton.click();
    console.log('✅ Update Ruleset button clicked');

    // Wait for the browser popup/alert and handle it
    console.log('🔔 Waiting for success popup/alert...');
    
    let dialogHandled = false;
    const dialogHandler = async (dialog) => {
      if (dialogHandled) return; // Prevent double handling
      
      dialogHandled = true;
      console.log(`📢 Browser dialog appeared: ${dialog.message()}`);
      try {
        await dialog.accept();
        console.log('✅ Browser dialog accepted');
      } catch (error) {
        console.log('⚠️ Dialog already handled or error:', error.message);
      }
      // Remove the listener after handling
      page.off('dialog', dialogHandler);
    };
    
    page.on('dialog', dialogHandler);
    
    // Wait a moment for the popup to appear and be handled
    await page.waitForTimeout(timeouts.saveProcessing * 3); // Increased timeout
    
    // Clean up - remove listener if still attached
    try {
      page.off('dialog', dialogHandler);
    } catch (e) {
      // Listener already removed
    }
    
    console.log('✅ Main form changes saved successfully');

    console.log('🎉 Ruleset updated successfully');

  } catch (error) {
    console.error('❌ updateRuleset error:', error);
    throw error; // Re-throw to indicate failure
  }
};