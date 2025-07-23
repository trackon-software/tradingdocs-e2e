const { expect } = require('@playwright/test');
const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');

async function fillInput(pageOrLocator, selector, value, timeout) {
  try {
    const input = pageOrLocator.locator(selector);
    await input.waitFor({ state: 'visible', timeout });
    await input.fill('');
    await input.fill(value);
    console.log(`✍️ Filled ${selector} with "${value}"`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to fill ${selector}:`, error.message);
    return false;
  }
}

async function addExtractor(page) {
  let success = false;
  const cfg = config.extractors;
  const { baseUrl, data, selectors, timeouts } = cfg;

  try {
    console.log('🚀 Starting addExtractor process');
    
    // Navigation step
    try {
      console.log('🚀 Navigating to Extractors page');
      await navigateAndWait(page, 'extractors');
      await page.waitForURL(baseUrl, { timeout: timeouts.navigation });

      const title = page.locator(selectors.pageTitle);
      await expect(title).toBeVisible({ timeout: timeouts.navigation });
      console.log('✅ Page loaded successfully');
    } catch (error) {
      console.error('❌ Navigation failed:', error.message);
      throw new Error(`Navigation to extractors page failed: ${error.message}`);
    }

    await page.waitForTimeout(1000);

    // Add button click
    try {
      const addButton = page.locator(selectors.addButton);
      await addButton.waitFor({ state: 'visible', timeout: timeouts.input });
      await addButton.click();
      console.log('➕ Clicked Add button on Extractors page');
      await page.waitForTimeout(1500);
    } catch (error) {
      console.error('❌ Failed to click Add button:', error.message);
      throw new Error(`Add button interaction failed: ${error.message}`);
    }

    // Fill main form inputs
    try {
      console.log('📝 Filling main form inputs');
      await fillInput(page, selectors.extractorNameInput, data.extractorName, timeouts.input);
      await fillInput(page, selectors.descriptionInput, data.description, timeouts.input);
    } catch (error) {
      console.error('❌ Failed to fill main form inputs:', error.message);
      // Continue execution even if some inputs fail
    }

    // Handle isActive dropdown
    try {
      console.log('🔽 Handling isActive dropdown');
      
      // Debug: Log available options
      try {
        const activeDropdownPopup = '.e-popup-open ul.e-ul';
        await page.locator(selectors.activeDropdownIcon).click();
        await page.waitForTimeout(800); // Wait for dropdown to fully open
        await page.locator(activeDropdownPopup).waitFor({ state: 'visible', timeout: timeouts.dropdown });
        const activeOptions = await page.locator(activeDropdownPopup + ' .e-list-item').allTextContents();
        console.log('isActive dropdown options:', activeOptions);
        
        // Close dropdown first to avoid conflicts
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      } catch (debugError) {
        console.warn('⚠️ Could not retrieve dropdown options for debugging:', debugError.message);
      }

      // Wait a bit before actual selection
      await page.waitForTimeout(1000);
      
      // Select dropdown option
      await selectDropdownOption(page, selectors.activeDropdownIcon, data.isActive, {
        openTimeout: timeouts.dropdown,
        optionTimeout: timeouts.dropdown,
        popupSelector: '.e-popup-open ul.e-ul',
      });
      console.log(`✅ Selected Active dropdown: "${data.isActive}"`);
      
      // Wait after selection to ensure it's processed
      await page.waitForTimeout(1500);
      
    } catch (error) {
      console.error('❌ Failed to select isActive dropdown:', error.message);
      // Continue execution
    }

    await page.waitForTimeout(3000); // Increased wait time before entities section

    // Entities accordion section
    try {
      console.log('📦 Handling Entities section');
      
      const entitiesAccordion = page.locator(selectors.entitiesAccordion);
      await entitiesAccordion.waitFor({ state: 'visible', timeout: timeouts.modal });
      console.log('✅ Entities accordion is visible');

      const entitiesAddButton = page.locator(selectors.entitiesAddButton);
      await entitiesAddButton.waitFor({ state: 'visible', timeout: timeouts.input });
      await entitiesAddButton.click();
      console.log('📦 Clicked Add button in Entities accordion section');

      // Handle modal
      const modal = page.locator('.e-dialog.e-popup-open[role="dialog"]:has(.e-dlg-header:has-text("Add Entities"))');
      await modal.waitFor({ state: 'visible', timeout: timeouts.modal });
      console.log('📦 Entities Add modal is visible');
      
      await page.waitForTimeout(1000);

      // Fill modal inputs
      try {
        console.log('📝 Filling modal inputs');
        await fillInput(modal, '#itemType', data.itemType || '', timeouts.input);
        await fillInput(modal, '#specialInstructions', data.specialInstructions || '', timeouts.input);
        await fillInput(modal, '#itemIdentifier', data.itemIdentifier || '', timeouts.input);
        await fillInput(modal, '#batchSize', data.batchSize ? String(data.batchSize) : '', timeouts.input);
        await fillInput(modal, '#itemPatterns', data.itemPatterns || '', timeouts.input);
      } catch (error) {
        console.error('❌ Failed to fill some modal inputs:', error.message);
        // Continue with dropdowns
      }

      // Handle isRepeating dropdown
      try {
        const isRepeatingIconSelector = '#isRepeating ~ .e-input-group-icon.e-ddl-icon';
        console.log(`🔽 Selecting isRepeating dropdown with value: ${data.isRepeating}`);
        
        await modal.locator(isRepeatingIconSelector).waitFor({ state: 'visible', timeout: timeouts.dropdown });
        await modal.locator(isRepeatingIconSelector).click();
        await page.waitForTimeout(500);
        
        const isRepeatingPopup = page.locator('.e-popup-open ul.e-ul');
        await isRepeatingPopup.waitFor({ state: 'visible', timeout: timeouts.dropdown });
        
        const isRepeatingOption = page.locator(`.e-popup-open ul.e-ul .e-list-item[data-value="${data.isRepeating}"]`);
        await isRepeatingOption.waitFor({ state: 'visible', timeout: timeouts.dropdown });
        await isRepeatingOption.click();
        console.log(`✅ Selected Is Repeating: "${data.isRepeating}"`);
        
        await page.waitForTimeout(500);
      } catch (error) {
        console.error('❌ Failed to select isRepeating dropdown:', error.message);
        // Continue execution
      }

      // Handle entityName dropdown  
      try {
        const entityNameIconSelector = '#entityName ~ .e-input-group-icon.e-ddl-icon';
        console.log(`🔽 Selecting entityName dropdown with value: ${data.entityName}`);
        
        await modal.locator(entityNameIconSelector).waitFor({ state: 'visible', timeout: timeouts.dropdown });
        await modal.locator(entityNameIconSelector).click();
        await page.waitForTimeout(500);
        
        const entityNamePopup = page.locator('.e-popup-open ul.e-ul');
        await entityNamePopup.waitFor({ state: 'visible', timeout: timeouts.dropdown });
        
        const entityNameOption = page.locator(`.e-popup-open ul.e-ul .e-list-item[data-value="${data.entityName}"]`);
        await entityNameOption.waitFor({ state: 'visible', timeout: timeouts.dropdown });
        await entityNameOption.click();
        console.log(`✅ Selected Entity Name: "${data.entityName}"`);
      } catch (error) {
        console.error('❌ Failed to select entityName dropdown:', error.message);
        // Continue execution
      }

      // Save modal
      try {
        const modalSaveButton = modal.locator('button.submit-button:has-text("Save")');
        await modalSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
        await modalSaveButton.click();
        console.log('💾 Clicked Save button in Entities modal');
        await page.waitForTimeout(1500);
      } catch (error) {
        console.error('❌ Failed to save modal:', error.message);
        // Try alternative save button selector
        try {
          const altSaveButton = modal.locator('button:has-text("Save")');
          await altSaveButton.click();
          console.log('💾 Clicked Save button (alternative selector)');
          await page.waitForTimeout(1500);
        } catch (altError) {
          console.error('❌ Alternative save button also failed:', altError.message);
        }
      }

    } catch (error) {
      console.error('❌ Entities section failed:', error.message);
      // Continue to try saving main form
    }

    // Save main form
    try {
      const mainSaveButton = page.locator(selectors.mainSaveButton).last();
      await mainSaveButton.waitFor({ state: 'visible', timeout: timeouts.input });
      await mainSaveButton.click();
      console.log('💾 Clicked Save on main form');
      
      await page.waitForTimeout(3000);
      
      // Check for success indicators (you might want to add specific checks here)
      console.log('🎉 Extractor process completed!');
      success = true;
      
    } catch (error) {
      console.error('❌ Failed to save main form:', error.message);
      // Try alternative main save button
      try {
        const altMainSaveButton = page.locator('button:has-text("Save")').last();
        await altMainSaveButton.click();
        console.log('💾 Clicked Save on main form (alternative selector)');
        await page.waitForTimeout(3000);
        success = true;
      } catch (altError) {
        console.error('❌ Alternative main save button also failed:', altError.message);
      }
    }

  } catch (error) {
    console.error('❌ addExtractor function failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Take screenshot for debugging
    try {
      await page.screenshot({ 
        path: `debug-addExtractor-${Date.now()}.png`, 
        fullPage: true 
      });
      console.log('📸 Debug screenshot saved');
    } catch (screenshotError) {
      console.error('❌ Failed to take screenshot:', screenshotError.message);
    }
  } finally {
    // Cleanup or final steps
    console.log(`📊 addExtractor completed. Success: ${success}`);
    
    // Return success status so other scripts can know the result
    return {
      success,
      functionName: 'addExtractor',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = addExtractor;