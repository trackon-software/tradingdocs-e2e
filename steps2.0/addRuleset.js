const config = require('./config2.0');

module.exports = async function addRuleset(page) {
  const cfg = config.ruleset;
  const { baseUrl, rulesetsPath, selectors, rulesetData, timeouts } = cfg;

  console.log('🚀 Navigating to Rulesets page');
  await page.goto(baseUrl + rulesetsPath);
  await page.waitForSelector(selectors.addButton, { timeout: timeouts.pageLoad });

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

  console.log('🔽 Selecting Ruleset Type');
  await page.click(selectors.rulesetTypeDropdownIcon);
  await page.waitForSelector(selectors.rulesetTypePopup, { timeout: timeouts.dropdownVisible });
  await page.click(selectors.rulesetTypeListItem); // ilk öğe

  console.log('📂 Expanding Metadata accordion');
  await page.waitForTimeout(timeouts.beforeAccordion);
  await page.click(selectors.metadataAccordion);
  await page.waitForTimeout(timeouts.accordionAnimation);

  console.log('✅ Selecting "Y" for Is Active');
  await page.click(selectors.isActiveDropdownIcon);
  await page.waitForSelector(selectors.isActivePopup, { timeout: timeouts.dropdownVisible });
  await page.click(selectors.isActiveYOption);

  console.log('💾 Saving Ruleset');
  await page.waitForTimeout(timeouts.beforeSave);
  await page.click(selectors.saveButton);

  console.log('⏳ Waiting for success confirmation');
  await page.waitForSelector(selectors.successText, { timeout: timeouts.successVisible });

  console.log('🎉 Ruleset created successfully');
};
