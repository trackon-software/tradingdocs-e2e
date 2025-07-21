const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');

module.exports = async function addRuleset(page) {
  const { selectors, rulesetData, timeouts } = config.ruleset;

  console.log('🚀 Navigating to Rulesets page');
  await navigateAndWait(page, 'ruleset');

  console.log('🟢 Clicking "Add" button');
  await page.click(selectors.addButton);
  await page.waitForSelector(selectors.rulesetNameInput, { timeout: timeouts.formVisible });

  console.log('📝 Filling out Ruleset form');
  await page.fill(selectors.rulesetNameInput, rulesetData.rulesetName);
  await page.fill(selectors.rulesetDescriptionInput, rulesetData.rulesetDescription);
  await page.fill(selectors.commodityInput, rulesetData.commodity);
  await page.fill(selectors.destinationCountryInput, rulesetData.destinationCountry);
  await page.fill(selectors.originCountryInput, rulesetData.originCountry);
  await page.fill(selectors.effectiveDateInput, rulesetData.effectiveDate);
  await page.fill(selectors.rulesetSourceInput, rulesetData.rulesetSource);
  await page.fill(selectors.rulesInput, rulesetData.rules);

  console.log('🔽 Selecting Ruleset Type from dropdown');
  await selectDropdownOption(page, selectors.rulesetTypeDropdownIcon, rulesetData.rulesetTypeOption, {
    openTimeout: timeouts.dropdownVisible,
    optionTimeout: timeouts.dropdownVisible,
  });

  console.log('📂 Expanding Metadata accordion');
  await page.waitForTimeout(timeouts.beforeAccordion);
  await page.click(selectors.metadataAccordion);
  await page.waitForTimeout(timeouts.accordionAnimation);

  console.log('✅ Selecting "Is Active" dropdown option');
  await selectDropdownOption(page, selectors.isActiveDropdownIcon, rulesetData.isActiveOption, {
    openTimeout: timeouts.dropdownVisible,
    optionTimeout: timeouts.dropdownVisible,
  });

  console.log('💾 Saving Ruleset');
  await page.waitForTimeout(timeouts.beforeSave);
  await page.click(selectors.saveButton);

  console.log('⏳ Waiting for success confirmation');
  await page.waitForSelector(selectors.successText, { timeout: timeouts.successVisible });

  console.log('🎉 Ruleset created successfully');
};
