const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');

module.exports = async function addRuleset(page) {
  const { selectors, rulesetData, timeouts } = config.ruleset;

  console.log('🚀 Navigating to Rulesets page');
  await navigateAndWait(page, 'ruleset');

  console.log('🟢 Clicking "Add" button');
  
  // Wait for the Add button to be visible and clickable
  await page.waitForSelector(selectors.addButton, { timeout: timeouts.pageLoad });
  await page.click(selectors.addButton);
  
  // Add a small delay after clicking Add button
  await page.waitForTimeout(500);
  
  // Wait for the form/modal to appear and the input to become visible
  console.log('⏳ Waiting for form to load...');
  try {
    await page.waitForSelector(selectors.rulesetNameInput, { 
      state: 'visible',
      timeout: timeouts.formVisible 
    });
  } catch (error) {
    console.log('❌ Form input not visible, checking for modal or dialog...');
    
    // Try to wait for any modal/dialog container to appear first
    const modalSelectors = [
      '.e-dialog',
      '.e-popup',
      '.e-dlg-container',
      '[role="dialog"]',
      '.modal'
    ];
    
    let modalFound = false;
    for (const modalSelector of modalSelectors) {
      try {
        await page.waitForSelector(modalSelector, { timeout: 2000 });
        console.log(`✅ Modal found with selector: ${modalSelector}`);
        modalFound = true;
        break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!modalFound) {
      console.log('❌ No modal found, retrying Add button click...');
      await page.click(selectors.addButton);
      await page.waitForTimeout(1000);
    }
    
    // Try waiting for the input again
    await page.waitForSelector(selectors.rulesetNameInput, { 
      state: 'visible',
      timeout: timeouts.formVisible 
    });
  }

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