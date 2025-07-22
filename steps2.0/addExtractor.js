const { expect } = require('@playwright/test');
const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');

async function fillInput(pageOrLocator, selector, value) {
  const input = pageOrLocator.locator(selector);
  await input.waitFor({ state: 'visible' });
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
  await fillInput(page, selectors.extractorNameInput, data.extractorName);
  await fillInput(page, selectors.descriptionInput, data.description);

  await selectDropdownOption(page, selectors.activeDropdownIcon, data.isActive, {
    openTimeout: timeouts.dropdown,
    optionTimeout: timeouts.dropdown,
  });
  console.log(`✅ Selected Active dropdown: "${data.isActive}"`);

  await page.waitForTimeout(1000);

  // Entities accordion açıldı mı bekle
  const entitiesAccordion = page.locator('.e-acrdn-item').filter({ hasText: 'Entities' });
  await entitiesAccordion.waitFor({ state: 'visible', timeout: timeouts.modal });
  console.log('✅ Entities accordion is visible');

  // Add button Entity'ler için
  const entitiesAddButton = entitiesAccordion.locator('.e-toolbar-item button.e-tbar-btn').filter({ hasText: 'Add' }).first();
  await entitiesAddButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await entitiesAddButton.click();
  console.log('📦 Clicked Add button in Entities accordion section');

  // Modal açılması için bekle
  const modal = page.locator('#grid_1781639624_2_dialogEdit_wrapper');
  await modal.waitFor({ state: 'visible', timeout: timeouts.modal });
  console.log('📦 Entities Add modal is visible');

  // Modal içindeki dropdown ve inputları doldur
  await selectDropdownOption(modal, '#isRepeating', data.isRepeating, {
    openTimeout: timeouts.dropdown,
    optionTimeout: timeouts.dropdown,
  });
  console.log(`✅ Set Is Repeating to "${data.isRepeating}"`);

  await selectDropdownOption(modal, '#entityName', data.entityName, {
    openTimeout: timeouts.dropdown,
    optionTimeout: timeouts.dropdown,
  });
  console.log(`✅ Set Entity Name to "${data.entityName}"`);

  // Modal içindeki diğer inputları doldur (data’da varsa)
  await fillInput(modal, '#itemType', data.itemType || '');
  await fillInput(modal, '#specialInstructions', data.specialInstructions || '');
  await fillInput(modal, '#itemIdentifier', data.itemIdentifier || '');
  await fillInput(modal, '#batchSize', data.batchSize ? String(data.batchSize) : '');
  await fillInput(modal, '#itemPatterns', data.itemPatterns || '');

  // Modal Save butonuna tıkla
  const modalSaveButton = modal.locator('button.submit-button');
  await modalSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await modalSaveButton.click();
  console.log('💾 Clicked Save button in Entities modal');

  await page.waitForTimeout(1500); // modal kapanması için kısa bekleme

  // Main formdaki Save butonuna tıkla
  const mainSaveButton = page.locator(selectors.mainSaveButton).last();
  await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await mainSaveButton.click();
  console.log('💾 Clicked Save on main form');

  await page.waitForTimeout(3000);

  console.log('🎉 Extractor (with Entities added) successfully created!');
}

module.exports = addExtractor;
