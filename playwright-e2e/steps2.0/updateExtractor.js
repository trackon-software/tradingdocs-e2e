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
    await page.waitForTimeout(1000);

    console.log(`🔍 Searching for extractor row with name: "${extractorName}"`);
    // We find the row by title attribute
    const rowSelector = `tr.e-row:has(td[title="${extractorName}"])`;
    await page.waitForSelector(rowSelector, { timeout: timeouts.navigation });
    const row = page.locator(rowSelector);

    console.log('✅ Extractor row found, clicking it...');
    await row.click();
    await page.waitForTimeout(500);

    console.log('✏️ Clicking Edit button in the toolbar for the selected row...');
    // Here we find the edit button from the general toolbar, even if it is not inside the row's toolbar-item
    // Because the edit button is usually in the toolbar, not in the table.
    // We definitely select the active button titled "Edit":
    const editButton = page.locator('div.e-toolbar-item[title="Edit"] > button.e-tbar-btn[aria-disabled="false"]');
    await editButton.waitFor({ state: 'visible', timeout: timeouts.input });

    const box = await editButton.boundingBox();
    if (!box) throw new Error('Edit button is not visible');

    await editButton.hover();
    await editButton.click();

    console.log('🎉 Edit button clicked, extractor ready to update');

  } catch (e) {
    console.error('❌ Error in updateExtractor:', e.message);
    throw e;
  }
};
