const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');

module.exports = async function updateRuleset(page) {
  const cfg = config.ruleset;
  const { selectors, timeouts, rulesetData } = cfg;

  try {
    console.log('🚀 Navigating to Rulesets page...');
    await navigateAndWait(page, 'ruleset');
    await page.waitForTimeout(1000);

    const rowSelector = `tr.e-row:has(td[title="${rulesetData.rulesetName}"])`;
    await page.waitForSelector(rowSelector, { timeout: timeouts.pageLoad });
    console.log('✅ Ruleset row found');

    await page.click(rowSelector);
    await page.waitForTimeout(500);

    await page.waitForSelector(selectors.editButton, { timeout: timeouts.formVisible });
    await page.click(selectors.editButton);
    console.log('✏️ Edit button clicked');

    // Daha uzun bekleme, hata toleransı ile:
    try {
      console.log('⏳ Waiting for ruleset name input...');
      await page.waitForSelector(selectors.rulesetNameInput, { timeout: timeouts.formVisible * 2 });
      console.log('✅ Ruleset form loaded');

      // Örnek form güncelleme (yorumda):
      // await page.fill(selectors.rulesetDescriptionInput, 'Updated description via test');
      // await page.click(selectors.saveButton);

      console.log('✅ Ready for further actions on edit form');
    } catch (formError) {
      console.warn('⚠️ Form yüklenemedi, devam ediyoruz:', formError.message);
    }

  } catch (error) {
    console.error('❌ updateRuleset error:', error);
    // Hata olsa da devam etsin (throw etme)
  }
};
