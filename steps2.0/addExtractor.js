const { expect } = require('@playwright/test');
const config = require('./config2.0');
const dropdownHandler = require('../utils/dropdownHandler');

async function fillInput(page, selector, value) {
  const input = page.locator(selector);
  await input.waitFor({ state: 'visible' });
  await input.fill(''); // clear yerine fill('') daha stabil olabilir
  await input.fill(value);
  console.log(`✍️ Filled ${selector} with "${value}"`);
}

async function addExtractor(page) {
  const cfg = config.extractors;
  const { baseUrl, data, selectors, timeouts } = cfg;

  console.log('🚀 Navigating to Extractors page');
  await page.goto(baseUrl);

  const title = page.locator(selectors.pageTitle);
  await expect(title).toBeVisible({ timeout: timeouts.navigation });
  console.log('✅ Page loaded');

  await page.waitForTimeout(1000);

  // Sayfa üstündeki Add butonuna tıkla
  const addButton = page.locator(selectors.addButton);
  await addButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await addButton.click();
  console.log('➕ Clicked Add button on Extractors page');

  await page.waitForTimeout(1500);

  await fillInput(page, selectors.extractorNameInput, data.extractorName);
  await fillInput(page, selectors.descriptionInput, data.description);

  // Active dropdown seçimi
  await dropdownHandler.selectDropdownOption(page, selectors.activeDropdownIcon, data.isActive, {
    openTimeout: timeouts.dropdown,
    optionTimeout: timeouts.dropdown,
  });
  console.log(`✅ Selected Active dropdown: "${data.isActive}"`);

  // Entities bölümü ve içindeki Add butonu
  const entitiesSection = page.locator(selectors.entitiesSection);
  const entitiesAddButton = entitiesSection.locator(selectors.entitiesAddButton);

  await entitiesAddButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await entitiesAddButton.click();
  console.log('📦 Clicked Add button inside Entities section');

  // Entities modal açılmasını bekle
  await page.waitForSelector(selectors.entitiesModal, { timeout: timeouts.modal });
  console.log('✅ Entity modal is visible');

  // Modal üzerindeki Save butonuna tıkla
  const mainSaveButton = page.locator(selectors.mainSaveButton).first();
  await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await mainSaveButton.click();
  console.log('💾 Clicked Save on main form');

  await page.waitForTimeout(3000);

  console.log('🎉 Extractor (with Entities modal opened) successfully created!');
}

module.exports = addExtractor;
