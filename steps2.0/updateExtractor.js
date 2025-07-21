const config = require('./config2.0');

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
    await page.waitForSelector(selectors.pageTitle, { timeout: timeouts.navigation });
    await page.waitForTimeout(1000);

    console.log(`🔍 Searching for extractor row with name: "${extractorName}"`);
    // Satırı buluyoruz, title attribute ile
    const rowSelector = `tr.e-row:has(td[title="${extractorName}"])`;
    await page.waitForSelector(rowSelector, { timeout: timeouts.navigation });
    const row = page.locator(rowSelector);

    console.log('✅ Extractor row found, clicking it...');
    await row.click();
    await page.waitForTimeout(500);

    console.log('✏️ Clicking Edit button in the toolbar for the selected row...');
    // Burada edit butonunu, row içindeki toolbar-item değilse bile genel sayfadaki ilgili toolbar-item'dan buluyoruz
    // Çünkü edit button genelde tabloda değil toolbarda olabilir.
    // Biz "Edit" başlıklı aktif butonu kesin seçiyoruz:
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
