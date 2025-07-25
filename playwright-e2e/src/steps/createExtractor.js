const { expect } = require('@playwright/test');
const config = require('./config');
const dropdownHandler = require('../utils/dropdownHandler');

async function fillInput(page, selector, value) {
  const input = page.locator(selector);
  await input.waitFor({ state: 'visible' });
  await input.fill(''); // clear yerine böyle temizle
  await input.fill(value);
  console.log(`✍️ Filled ${selector} with "${value}"`);
}

async function addExtractor(page) {
  const { baseUrl, data, selectors, timeouts } = config.extractors;

  console.log('🚀 Navigating to Extractors page');
  await page.goto(baseUrl);

  // Sayfanın yüklendiğini kontrol et
  const title = page.locator(selectors.pageTitle);
  await expect(title).toBeVisible({ timeout: timeouts.navigation });
  console.log('✅ Extractors page loaded');

  await page.waitForTimeout(1000);

  // Add butonuna tıklama (ilk görünen Add)
  const addButtons = page.locator(selectors.addButton).filter({ hasText: 'Add', visible: true });
  const addButtonCount = await addButtons.count();
  console.log(`➕ Found ${addButtonCount} visible Add buttons`);
  if (addButtonCount === 0) throw new Error('No visible Add button found');
  const addButton = addButtons.first();
  await addButton.click();
  console.log('➕ Clicked Add button');

  await page.waitForTimeout(1500);

  // Extractor Name input doldur
  await fillInput(page, selectors.extractorNameInput, data.extractorName);

  // Description input doldur
  await fillInput(page, selectors.descriptionInput, data.description);

  // Active dropdown seçimi dropdownHandler ile
  await dropdownHandler.selectDropdownOption(page, selectors.activeDropdownIcon, data.isActive, {
    openTimeout: timeouts.dropdown,
    optionTimeout: timeouts.dropdown,
  });
  console.log(`✅ Selected Active dropdown: "${data.isActive}"`);

  // Entities tabındaki Add butonuna tıklama (visible ve enabled olanı seç)
  const entityAddButtons = page.locator(selectors.entitiesAddButton).filter({ visible: true, hasText: 'Add' });
  const entityAddCount = await entityAddButtons.count();
  console.log(`📦 Found ${entityAddCount} visible Entities Add buttons`);
  if (entityAddCount === 0) throw new Error('No visible Entities Add button found');
  const entityAddButton = entityAddButtons.first();
  await entityAddButton.click();
  console.log('📦 Clicked Add in Entities section');

  // Entities modal açılmasını bekle
  await page.waitForSelector(selectors.entitiesModal, { state: 'visible', timeout: timeouts.modal });
  console.log('✅ Entity modal is visible');

  // --- Buraya istersen modal içi form doldurma adımları eklenebilir ---

  // Main formdaki Save butonuna tıklama
  const mainSaveButton = page.locator(selectors.mainSaveButton).first();
  await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await mainSaveButton.click();
  console.log('💾 Clicked Save on main form');

  await page.waitForTimeout(3000);

  console.log('🎉 Extractor (with Entities modal opened) successfully created!');
}

module.exports = addExtractor;
