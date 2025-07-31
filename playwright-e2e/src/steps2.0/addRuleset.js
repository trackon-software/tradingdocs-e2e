const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');
const { expect } = require('@playwright/test');
const { findRowAcrossPages } = require('../utils/paginationHelper');

module.exports = async function addRuleset(page) {
  const cfg = config.ruleset;
  const { selectors, rulesetData, timeouts } = cfg;

  try {
    console.log('🚀 Navigating to Rulesets page');
    await navigateAndWait(page, 'ruleset');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(selectors.addButton)).toBeVisible({ timeout: timeouts.pageLoad });
    console.log('✅ Rulesets page loaded');

    await page.click(selectors.addButton);
    console.log('➕ Add button clicked');

    await expect(page.locator(selectors.rulesetNameInput)).toBeVisible({ timeout: timeouts.formVisible });

    console.log(`📝 Filling out ruleset form for: ${rulesetData.rulesetName}`);
    await page.fill(selectors.rulesetNameInput, rulesetData.rulesetName);
    await page.fill(selectors.rulesetDescriptionInput, rulesetData.rulesetDescription);
    await page.fill(selectors.commodityInput, rulesetData.commodity);
    await page.fill(selectors.destinationCountryInput, rulesetData.destinationCountry);
    await page.fill(selectors.originCountryInput, rulesetData.originCountry);
    await page.fill(selectors.effectiveDateInput, rulesetData.effectiveDate);
    await page.fill(selectors.rulesetSourceInput, rulesetData.rulesetSource);
    await page.fill(selectors.rulesInput, rulesetData.rules);

    console.log('🔽 Selecting Ruleset Type...');
    await selectDropdownOption(page, selectors.rulesetTypeDropdownIcon, rulesetData.rulesetTypeOption, {
      openTimeout: timeouts.dropdownVisible,
      optionTimeout: timeouts.dropdownVisible,
    });
    await expect(page.locator(selectors.rulesetTypeDropdownIcon).locator('..'))
      .toContainText(rulesetData.rulesetTypeOption);

    console.log('📂 Expanding Metadata accordion');
    await page.waitForTimeout(timeouts.beforeAccordion);
    await page.click(selectors.metadataAccordion);
    await page.waitForTimeout(timeouts.accordionAnimation);

    console.log('✅ Selecting "Is Active" option...');
    await selectDropdownOption(page, selectors.isActiveDropdownIcon, rulesetData.isActiveOption, {
      openTimeout: timeouts.dropdownVisible,
      optionTimeout: timeouts.dropdownVisible,
    });
    await expect(page.locator(selectors.isActiveDropdown).locator('..'))
      .toContainText(rulesetData.isActiveOption);

    console.log('💾 Saving Ruleset...');
    await page.waitForTimeout(timeouts.beforeSave);
    await page.click(selectors.saveButton);

    console.log('🌐 Waiting for page reload and verifying creation...');
    await navigateAndWait(page, 'ruleset');
    await page.waitForLoadState('networkidle');

    const rowSelector = selectors.rulesetRowByTitle(rulesetData.rulesetName);
    await findRowAcrossPages(page, rowSelector, selectors.nextPageButton, 10);
    console.log('✅ Ruleset appears in the table (verified across pages)');

  } catch (e) {
    console.error('❌ Error in addRuleset:', e.message);
    console.error('Stack trace:', e.stack);
    throw e;
  }
};
