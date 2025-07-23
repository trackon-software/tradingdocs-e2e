const { expect } = require('@playwright/test');
const config = require('../config'); 

module.exports = async function createRuleset(page) {
  const { createRuleset: rulesetConfig } = config;
  
  // Step 1: Navigate to Rulesets page
  await page.goto(rulesetConfig.baseUrl + rulesetConfig.rulesetsPath);
  await page.waitForSelector(rulesetConfig.selectors.pageTitle, { timeout: rulesetConfig.timeouts.pageLoad });
  console.log('✅ Navigated to Rulesets page');

  // Step 2: Click "Add" button
  await page.click(rulesetConfig.selectors.addButton);
  await page.waitForSelector(rulesetConfig.selectors.rulesetNameInput, { 
    state: 'visible', 
    timeout: rulesetConfig.timeouts.formVisible 
  });
  console.log('✅ Add Ruleset form opened');

  // Small delay before filling inputs
  await page.waitForTimeout(rulesetConfig.timeouts.beforeDropdownSelection);

  // Step 3: Fill text inputs
  const rulesetInfo = {
    [rulesetConfig.selectors.rulesetNameInput]: rulesetConfig.rulesetData.rulesetName,
    [rulesetConfig.selectors.rulesetDescriptionInput]: rulesetConfig.rulesetData.rulesetDescription,
    [rulesetConfig.selectors.commodityInput]: rulesetConfig.rulesetData.commodity,
    [rulesetConfig.selectors.destinationCountryInput]: rulesetConfig.rulesetData.destinationCountry,
    [rulesetConfig.selectors.originCountryInput]: rulesetConfig.rulesetData.originCountry,
    [rulesetConfig.selectors.effectiveDateInput]: rulesetConfig.rulesetData.effectiveDate,
    [rulesetConfig.selectors.rulesetSourceInput]: rulesetConfig.rulesetData.rulesetSource,
    [rulesetConfig.selectors.rulesInput]: rulesetConfig.rulesetData.rules
  };

  for (const [selector, value] of Object.entries(rulesetInfo)) {
    await page.fill(selector, value);
    await page.waitForTimeout(rulesetConfig.timeouts.inputFillDelay);
  }
  console.log('✅ Ruleset basic inputs filled');

  // Small delay before dropdown selection
  await page.waitForTimeout(rulesetConfig.timeouts.beforeDropdownSelection);

  // Step 4: Select "Ruleset Type" from dropdown
  await page.click(rulesetConfig.selectors.rulesetTypeDropdownIcon);
  console.log('✅ Clicked Ruleset Type dropdown icon');

  await page.waitForSelector(rulesetConfig.selectors.rulesetTypePopup, { 
    state: 'visible', 
    timeout: rulesetConfig.timeouts.dropdownVisible 
  });
  await page.waitForSelector(rulesetConfig.selectors.rulesetTypeListItem, { 
    state: 'visible', 
    timeout: rulesetConfig.timeouts.dropdownVisible 
  });
  await page.waitForTimeout(rulesetConfig.timeouts.dropdownSettle);

  const typeOption = page.locator(rulesetConfig.selectors.rulesetTypeListItem).first();
  await typeOption.waitFor({ state: 'visible', timeout: rulesetConfig.timeouts.dropdownVisible });
  await typeOption.click();
  console.log('✅ Ruleset Type selected');

  // Small delay before accordion interaction
  await page.waitForTimeout(rulesetConfig.timeouts.beforeAccordion);

  // Step 5: Open "Metadata" accordion if not already open
  const metadataAccordion = page.locator(rulesetConfig.selectors.metadataAccordion);
  if (await metadataAccordion.getAttribute('aria-expanded') === 'false') {
    await metadataAccordion.click();
    await page.waitForTimeout(rulesetConfig.timeouts.accordionAnimation);
    console.log('✅ Metadata accordion expanded');
  }

  // Small delay before next dropdown
  await page.waitForTimeout(rulesetConfig.timeouts.beforeDropdownSelection);

  // Step 6: Select "Is Active" dropdown
  await page.locator(rulesetConfig.selectors.isActiveDropdown).scrollIntoViewIfNeeded();
  console.log('🔍 Scrolled to Is Active dropdown');

  await page.click(rulesetConfig.selectors.isActiveDropdownIcon);
  console.log('✅ Clicked Is Active dropdown icon');

  await page.waitForSelector(rulesetConfig.selectors.isActivePopup, { 
    state: 'visible', 
    timeout: rulesetConfig.timeouts.pageLoad 
  });
  await page.waitForSelector(rulesetConfig.selectors.isActiveListItem, { 
    state: 'visible', 
    timeout: rulesetConfig.timeouts.dropdownVisible 
  });
  await page.waitForTimeout(rulesetConfig.timeouts.dropdownSettle);

  const activeOption = page.locator(rulesetConfig.selectors.isActiveYOption);
  await activeOption.waitFor({ state: 'visible', timeout: rulesetConfig.timeouts.dropdownVisible });
  await activeOption.click();
  console.log('✅ "Y" selected from Is Active dropdown');

  // Step 7: Click "Save"
  await page.waitForTimeout(rulesetConfig.timeouts.beforeSave);
  await page.click(rulesetConfig.selectors.saveButton);
  console.log('✅ Save button clicked (ruleset)');

  // Optional: confirm creation in list
  await page.waitForSelector(rulesetConfig.selectors.successText, { 
    timeout: rulesetConfig.timeouts.successVisible 
  });
  console.log('🎉 Ruleset successfully created and listed');
};