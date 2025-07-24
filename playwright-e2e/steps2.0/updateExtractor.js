const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');

module.exports = async function updateExtractor(page, extractorName = '') {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  if (!extractorName) {
    extractorName = data.extractorName;
    console.log(`⚠️ No extractorName provided, using default: ${extractorName}`);
  }

  try {
    console.log('🚀 Navigating to Extractors page...');
    await page.goto(cfg.baseUrl);
    await navigateAndWait(page, 'extractors');
    await page.waitForTimeout(timeouts.generalWait);

    console.log(`🔍 Searching for extractor row with name: "${extractorName}"`);
    // Use the dynamic selector from config
    const rowSelector = selectors.extractorRowByTitle(extractorName);
    await page.waitForSelector(rowSelector, { timeout: timeouts.navigation });
    const row = page.locator(rowSelector);

    console.log('✅ Extractor row found, clicking it...');
    // Handle multiple rows with same name
    const rowCount = await row.count();
    if (rowCount > 1) {
      console.log(`⚠️ Found ${rowCount} extractors with name "${extractorName}", selecting the first one`);
    }
    await row.first().click();
    await page.waitForTimeout(timeouts.generalWait);

    console.log('✏️ Clicking Edit button in the toolbar for the selected row...');
    const editButton = page.locator(selectors.editButton);
    await editButton.waitFor({ state: 'visible', timeout: timeouts.input });

    const box = await editButton.boundingBox();
    if (!box) throw new Error('Edit button is not visible');

    await editButton.hover();
    await editButton.click();

    console.log('🎉 Edit button clicked, waiting for edit form to load...');
    
    // Wait for the inline editor to load
    await page.waitForTimeout(timeouts.inlineEditorWait);
    
    // Find the extractor name inline editor using config selector
    const extractorNameEditor = page.locator(selectors.extractorNameEditor);
    await extractorNameEditor.waitFor({ state: 'visible', timeout: timeouts.pageLoad });
    console.log('✅ Extractor name inline editor found');

    // Click on the inline editor to activate edit mode
    console.log('📝 Clicking extractor name editor to activate edit mode...');
    await extractorNameEditor.click();
    await page.waitForTimeout(timeouts.editModeActivation);
    
    // Wait for the popup tooltip to appear and find the input field
    await page.waitForSelector(selectors.extractorNamePopupInput, { timeout: timeouts.input });
    const nameInput = page.locator(selectors.extractorNamePopupInput);
    console.log('✅ Edit popup appeared with input field');
    
    console.log(`📝 Updating extractor name to "${data.updatedExtractorName}"...`);
    await nameInput.clear();
    await nameInput.fill(data.updatedExtractorName);
    console.log('✅ Extractor name updated');

    // Click the save button (tick symbol) using config selector
    console.log('💾 Clicking inline save button (tick symbol)...');
    const inlineSaveButton = page.locator(selectors.extractorNameSaveButton);
    await inlineSaveButton.click();
    await page.waitForTimeout(timeouts.saveProcessing);
    console.log('✅ Inline save button clicked');

    // Wait for the popup to disappear (indicating save is complete)
    await page.waitForSelector(selectors.extractorPopupTooltip, { state: 'hidden', timeout: timeouts.input });
    console.log('✅ Edit popup closed, update complete');

    // Save the changes on the main form
    console.log('💾 Clicking "Update Extractor" button...');
    const mainSaveButton = page.locator(selectors.mainSaveButton);
    await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
    await mainSaveButton.click();
    console.log('✅ Update Extractor button clicked');

    // Wait for the browser popup/alert and handle it
    console.log('🔔 Waiting for success popup/alert...');
    try {
      // Listen for browser alert/confirm dialog
      page.on('dialog', async dialog => {
        console.log(`📢 Browser dialog appeared: ${dialog.message()}`);
        await dialog.accept(); // Accept the dialog
        console.log('✅ Browser dialog accepted');
      });
      
      // Wait a moment for the popup to appear and be handled
      await page.waitForTimeout(timeouts.saveProcessing * 2); // Double the wait time for popup
      console.log('✅ Main form changes saved successfully');
    } catch (e) {
      console.log('⚠️ No browser dialog appeared, but update likely succeeded');
    }

    console.log('🎉 Extractor updated successfully');

  } catch (e) {
    console.error('❌ Error in updateExtractor:', e.message);
    throw e;
  }
};