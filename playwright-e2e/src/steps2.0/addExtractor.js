const { expect } = require('@playwright/test');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');

async function addExtractor(page, config = null) {
  let success = false;

  const defaultConfig = {
    data: {
      extractorName: 'Test Extractor',
      description: 'This is a test extractor.',
      isActive: 'Y',
      isRepeating: 'false',
      entityName: 'PO',
      itemType: 'Sample Item',
      specialInstructions: 'Handle with care',
      itemIdentifier: 'ID-12345',
      batchSize: 10,
      itemPatterns: 'pattern1, pattern2',
    },
    selectors: {
      pageTitle: 'h3.page-title',
      addButton: 'button.e-tbar-btn:has-text("Add")',
      extractorNameInput: 'input#extractorName',
      descriptionInput: 'input#description',
      activeDropdownIcon: 'div.e-control-wrapper .e-ddl-icon',
      entitiesSection: '.e-acrdn-item:has-text("Entities")',
      entitiesAddButton: '.e-acrdn-item:has-text("Entities") .e-toolbar-item button.e-tbar-btn:has-text("Add")',
      extractorRowByTitle: (name) => `tr.e-row:has(td[title="${name}"])`,
    },
    timeouts: {
      pageLoad: 10000,
      addButtonVisible: 5000,
      input: 5000,
      dropdown: 10000,
      modal: 15000,
      buttonVisible: 5000,
      accordionExpand: 2000,
      saveProcessing: 1000,
    }
  };

  const { data, selectors, timeouts } = config?.extractors || defaultConfig;

  try {
    await navigateAndWait(page, 'extractors');
    await expect(page.locator(selectors.pageTitle)).toBeVisible({ timeout: timeouts.pageLoad });
    console.log('✅ Page loaded');

    const addButton = page.locator(selectors.addButton);
    await expect(addButton).toBeVisible({ timeout: timeouts.addButtonVisible });
    await expect(addButton).toBeEnabled();
    await addButton.click();
    console.log('➕ Clicked Add button');

    await page.locator(selectors.extractorNameInput).fill(data.extractorName);
    console.log(`✍️ Filled ${selectors.extractorNameInput} with "${data.extractorName}"`);
    await page.locator(selectors.descriptionInput).fill(data.description);
    console.log(`✍️ Filled ${selectors.descriptionInput} with "${data.description}"`);

    await selectDropdownOption(page, selectors.activeDropdownIcon, data.isActive, {
      openTimeout: timeouts.dropdown,
      optionTimeout: timeouts.dropdown,
      popupSelector: '.e-popup-open ul.e-ul',
    });

    const entitiesSection = page.locator(selectors.entitiesSection);
    await expect(entitiesSection).toBeVisible({ timeout: timeouts.accordionExpand });

    const addEntityBtn = page.locator(selectors.entitiesAddButton);
    await expect(addEntityBtn).toBeVisible({ timeout: timeouts.buttonVisible });
    await expect(addEntityBtn).toBeEnabled();
    await addEntityBtn.click();
    console.log('📦 Clicked Add Entity button');

    const modal = page.locator('.e-dialog.e-popup-open[role="dialog"]:has(.e-dlg-header:has-text("Add Entities"))');
    await expect(modal).toBeVisible({ timeout: timeouts.modal });
    console.log('✅ Modal is open');

    console.log('📝 Skipping field filling (placeholder mode)');

    await selectDropdownOption(page, '#isRepeating ~ .e-input-group-icon.e-ddl-icon', data.isRepeating, {
      openTimeout: timeouts.dropdown,
      optionTimeout: timeouts.dropdown,
      popupSelector: '.e-popup-open ul.e-ul',
    });

    await selectDropdownOption(page, '#entityName ~ .e-input-group-icon.e-ddl-icon', data.entityName, {
      openTimeout: timeouts.dropdown,
      optionTimeout: timeouts.dropdown,
      popupSelector: '.e-popup-open ul.e-ul',
    });

    const modalSaveButton = modal.locator('button:has-text("Save")').first();
    await expect(modalSaveButton).toBeVisible({ timeout: timeouts.buttonVisible });
    await expect(modalSaveButton).toBeEnabled();
    await modalSaveButton.click();
    console.log('💾 Saved Add Entity modal');

    await expect(modal).toBeHidden({ timeout: timeouts.modal });
    console.log('✅ Entity modal closed');

    await page.waitForTimeout(timeouts.saveProcessing);

    const finalSaveButton = page.locator('div.e-footer-content >> button.submit-button:has-text("Save")');
    await expect(finalSaveButton).toBeVisible({ timeout: timeouts.buttonVisible });
    await expect(finalSaveButton).toBeEnabled({ timeout: 2000 });
    await finalSaveButton.click();
    console.log('💾 Clicked Save on Add Extractor modal');

    await expect(page.locator(selectors.pageTitle)).toBeVisible({ timeout: timeouts.pageLoad });

    const extractorRow = page.locator(selectors.extractorRowByTitle(data.extractorName));
    await expect(extractorRow).toBeVisible({ timeout: timeouts.pageLoad });
    console.log(`✅ Extractor "${data.extractorName}" created successfully`);

    success = true;
    console.log('🎉 addExtractor completed successfully');
  } catch (error) {
    console.error('❌ addExtractor failed:', error.message);
    try {
      await page.screenshot({ 
        path: `debug-addExtractor-${Date.now()}.png`, 
        fullPage: true 
      });
      console.log('📸 Screenshot saved');
    } catch (e) {
      console.error('❌ Screenshot failed:', e.message);
    }
    throw error;
  }

  return {
    success,
    functionName: 'addExtractor',
    timestamp: new Date().toISOString(),
  };
}

module.exports = addExtractor;
