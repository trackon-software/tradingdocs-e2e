const { expect } = require('@playwright/test');
const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');

async function fillInput(pageOrLocator, selector, value, timeout) {
  const input = pageOrLocator.locator(selector);
  await input.waitFor({ state: 'visible', timeout });
  await input.fill('');
  await input.fill(value);
  console.log(`✍️ Filled ${selector} with "${value}"`);
}

async function addExtractor(page) {
  const cfg = config.extractors;
  const { baseUrl, data, selectors, timeouts } = cfg;

  console.log('🚀 Navigating to Extractors page');
  await navigateAndWait(page, 'extractors');
  await page.waitForURL(baseUrl);

  const title = page.locator(selectors.pageTitle);
  await expect(title).toBeVisible({ timeout: timeouts.navigation });
  console.log('✅ Page loaded');

  await page.waitForTimeout(1000);

  const addButton = page.locator(selectors.addButton);
  await addButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await addButton.click();
  console.log('➕ Clicked Add button on Extractors page');

  await page.waitForTimeout(1500);

  // Fill main extractor inputs
  await fillInput(page, selectors.extractorNameInput, data.extractorName, timeouts.input);
  await fillInput(page, selectors.descriptionInput, data.description, timeouts.input);

  // Debug: Log available options for isActive dropdown
  try {
    const activeDropdownPopup = '.e-popup-open ul.e-ul';
    await page.locator(selectors.activeDropdownIcon).click();
    await page.locator(activeDropdownPopup).waitFor({ state: 'visible', timeout: timeouts.dropdown });
    const activeOptions = await page.locator(activeDropdownPopup + ' .e-list-item').allTextContents();
    console.log('isActive dropdown options:', activeOptions);
    // Avoid closing dropdown to prevent strict mode violation
  } catch (e) {
    console.error('❌ Failed to retrieve isActive dropdown options:', e.message);
  }

  // Select isActive dropdown
  try {
    await selectDropdownOption(page, selectors.activeDropdownIcon, data.isActive, {
      openTimeout: timeouts.dropdown,
      optionTimeout: timeouts.dropdown,
      popupSelector: '.e-popup-open ul.e-ul',
    });
    console.log(`✅ Selected Active dropdown: "${data.isActive}"`);
  } catch (error) {
    console.error('❌ Failed to select isActive dropdown:', error);
    throw error;
  }

  await page.waitForTimeout(2000); // Wait for UI to settle

  // Wait for Entities accordion to be visible
  const entitiesAccordion = page.locator(selectors.entitiesAccordion);
  await entitiesAccordion.waitFor({ state: 'visible', timeout: timeouts.modal });
  console.log('✅ Entities accordion is visible');

  // Click Add button in Entities accordion
  const entitiesAddButton = page.locator(selectors.entitiesAddButton);
  await entitiesAddButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await entitiesAddButton.click();
  console.log('📦 Clicked Add button in Entities accordion section');

  // Wait for the "Add Entities" modal to open
  const modal = page.locator('.e-dialog.e-popup-open[role="dialog"]:has(.e-dlg-header:has-text("Add Entities"))');
  await modal.waitFor({ state: 'visible', timeout: timeouts.modal });
  console.log('📦 Entities Add modal is visible');

  // Wait a bit for the modal to fully render
  await page.waitForTimeout(1000);

  // Fill modal inputs and dropdowns with corrected selectors
  try {
    // Fill text inputs first (these are easier)
    await fillInput(modal, '#itemType', data.itemType || '', timeouts.input);
    await fillInput(modal, '#specialInstructions', data.specialInstructions || '', timeouts.input);
    await fillInput(modal, '#itemIdentifier', data.itemIdentifier || '', timeouts.input);
    await fillInput(modal, '#batchSize', data.batchSize ? String(data.batchSize) : '', timeouts.input);
    await fillInput(modal, '#itemPatterns', data.itemPatterns || '', timeouts.input);

    // Handle isRepeating dropdown - use the correct icon selector from within the modal
    const isRepeatingIconSelector = '#isRepeating ~ .e-input-group-icon.e-ddl-icon';
    console.log(`🔽 Selecting isRepeating dropdown with value: ${data.isRepeating}`);
    
    await modal.locator(isRepeatingIconSelector).waitFor({ state: 'visible', timeout: timeouts.dropdown });
    await modal.locator(isRepeatingIconSelector).click();
    
    // Wait for popup and select option
    await page.waitForTimeout(500);
    const isRepeatingPopup = page.locator('.e-popup-open ul.e-ul');
    await isRepeatingPopup.waitFor({ state: 'visible', timeout: timeouts.dropdown });
    
    // Use more specific selector to avoid strict mode violation
    const isRepeatingOption = page.locator(`.e-popup-open ul.e-ul .e-list-item[data-value="${data.isRepeating}"]`);
    await isRepeatingOption.waitFor({ state: 'visible', timeout: timeouts.dropdown });
    await isRepeatingOption.click();
    console.log(`✅ Selected Is Repeating: "${data.isRepeating}"`);

    await page.waitForTimeout(500);

    // Handle entityName dropdown - use the correct icon selector from within the modal
    const entityNameIconSelector = '#entityName ~ .e-input-group-icon.e-ddl-icon';
    console.log(`🔽 Selecting entityName dropdown with value: ${data.entityName}`);
    
    await modal.locator(entityNameIconSelector).waitFor({ state: 'visible', timeout: timeouts.dropdown });
    await modal.locator(entityNameIconSelector).click();
    
    // Wait for popup and select option
    await page.waitForTimeout(500);
    const entityNamePopup = page.locator('.e-popup-open ul.e-ul');
    await entityNamePopup.waitFor({ state: 'visible', timeout: timeouts.dropdown });
    
    // FIX: Use data-value attribute instead of has-text to avoid strict mode violation
    // This will select only the element with exact data-value="PO", not "PO_ITEM"
    const entityNameOption = page.locator(`.e-popup-open ul.e-ul .e-list-item[data-value="${data.entityName}"]`);
    await entityNameOption.waitFor({ state: 'visible', timeout: timeouts.dropdown });
    await entityNameOption.click();
    console.log(`✅ Selected Entity Name: "${data.entityName}"`);

  } catch (error) {
    console.error('❌ Failed to interact with Entities modal:', error);
    throw error;
  }

  // Click Save button in the modal - use more specific selector
  const modalSaveButton = modal.locator('button.submit-button:has-text("Save")');
  await modalSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await modalSaveButton.click();
  console.log('💾 Clicked Save button in Entities modal');

  await page.waitForTimeout(1500); // Wait for modal to close

  // Click Save button on the main form
  const mainSaveButton = page.locator(selectors.mainSaveButton).last();
  await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await mainSaveButton.click();
  console.log('💾 Clicked Save on main form');

  await page.waitForTimeout(3000);

  console.log('🎉 Extractor (with Entities added) successfully created!');
}

module.exports = addExtractor;