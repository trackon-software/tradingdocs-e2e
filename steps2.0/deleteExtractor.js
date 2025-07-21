const config = require('./config2.0');

module.exports = async function deleteExtractor(page, extractorName = '') {
  const cfg = config.extractors;
  const { selectors, timeouts, data } = cfg;

  if (!extractorName) {
    extractorName = data.extractorName;
    console.log(`⚠️ No extractorName provided, using default: ${extractorName}`);
  }

  try {
    console.log('🚀 Navigating to Extractors page...');
    await page.goto(cfg.baseUrl);
    await page.waitForSelector(selectors.pageTitle, { timeout: timeouts.navigation });
    await page.waitForTimeout(1000);

    console.log(`🔍 Searching for extractor row with name: "${extractorName}"`);
    const rowSelector = `tr.e-row:has(td[title="${extractorName}"])`;
    await page.waitForSelector(rowSelector, { timeout: timeouts.navigation });
    const row = page.locator(rowSelector);

    console.log('✅ Extractor row found, clicking it...');
    await row.click();
    await page.waitForTimeout(500);

    console.log('🗑️ Clicking Delete button in that row...');
    const deleteButton = page.locator('button[aria-label="Delete"]:not([aria-disabled="true"])');
    await deleteButton.waitFor({ state: 'visible', timeout: timeouts.input });
    await deleteButton.click();

    console.log('🎉 Delete button clicked, confirmation popup expected next...');

  } catch (e) {
    console.error('❌ Error in deleteExtractor:', e.message);
    throw e;
  }
};
