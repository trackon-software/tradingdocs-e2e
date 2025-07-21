const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');

module.exports = async function deleteRuleset(page) {
  const cfg = config.ruleset;
  const { selectors, timeouts, rulesetData } = cfg;

  try {
    console.log('🚀 Navigating to Rulesets page');
    await navigateAndWait(page, 'ruleset');

    console.log(`🔍 Searching for ruleset named "${rulesetData.rulesetName}"`);
    const row = await page.locator(selectors.tableRow, { hasText: rulesetData.rulesetName }).first();
    await row.scrollIntoViewIfNeeded();
    await row.click();

    console.log('🗑️ Clicking Delete button');
    await page.locator(selectors.deleteButton).click();

    console.log('☑️ Confirming delete');
    // Tekil popup ve OK butonuna tıklıyoruz:
    await page.locator('div.e-confirm-dialog.e-popup-open div.e-footer-content button.e-primary:has-text("OK")').click();

    console.log(`✅ Ruleset "${rulesetData.rulesetName}" deleted`);
  } catch (err) {
    console.error('❌ Ruleset deletion error:', err);
  }
};
