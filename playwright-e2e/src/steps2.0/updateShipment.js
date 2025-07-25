const { popoverHandler } = require('../utils/popoverHandler');
const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');

module.exports = async function updateShipment(page, newBLNumber) {
  const cfg = config.shipment;
  const { selectors, timeouts, data } = cfg;

  // Check newBLNumber parameter and set default
  if (!newBLNumber) {
    newBLNumber = data.newBLNumber || 'BL654321'; // take from config or use default
    console.log(`⚠️ No newBLNumber provided, using default: ${newBLNumber}`);
  }

  // String type check
  if (typeof newBLNumber !== 'string') {
    newBLNumber = String(newBLNumber);
    console.log(`⚠️ newBLNumber converted to string: ${newBLNumber}`);
  }

  try {
    console.log('🚀 Navigating to Shipments page...');
    await navigateAndWait(page, 'shipment');
    await page.waitForTimeout(1000);

    console.log(`🔍 Searching for shipment with ID: ${data.shipmentId}...`);
    const rowSelector = `tr.e-row:has(td[title="${data.shipmentId}"])`;
    await page.waitForSelector(rowSelector, { timeout: timeouts.pageLoad });
    await page.waitForTimeout(1000);
    console.log('✅ Shipment row found');

    await page.click(rowSelector);
    console.log('🟡 Shipment row clicked (selected)');
    await page.waitForTimeout(1000);

    await page.waitForSelector(selectors.editButton, { timeout: timeouts.buttonVisible });
    await page.click(selectors.editButton);
    console.log('✏️ Edit button clicked');
    await page.waitForTimeout(1000);

    await popoverHandler(page);
    await page.waitForTimeout(1000);

    console.log('➡️ Navigating to General Info tab...');
    await page.click('li.nav-item > a[data-bs-target="#general"]');
    await page.waitForSelector('#general.active', { timeout: timeouts.pageLoad });
    await page.waitForTimeout(1000);
    console.log('✅ General Info tab is active');

    await popoverHandler(page);
    await page.waitForTimeout(1000);

    const blInlineSelector = 'div[name="blNumber"].inline';
    await page.click(blInlineSelector);
    console.log('✏️ BL Number inline editor clicked, waiting for modal...');
    await page.waitForTimeout(1000);

    const modalSelector = 'div.e-dialog.e-popup-open';
    await page.waitForSelector(modalSelector, { state: 'visible', timeout: timeouts.modalOpen });
    console.log('✅ BL Number edit modal is visible');
    await page.waitForTimeout(1000);

    // Find and clear input field
    const blInputSelector = 'input#blNumber';
    await page.waitForSelector(blInputSelector, { state: 'visible', timeout: 5000 });
    
    // Clear current value
    await page.click(blInputSelector);
    await page.keyboard.press('Control+A'); // Select all
    await page.keyboard.press('Delete'); // Delete
    await page.waitForTimeout(500);
    
    // Enter new value
    console.log(`✍️ Entering new BL Number: "${newBLNumber}"`);
    await page.fill(blInputSelector, newBLNumber);
    
    // Verify value entered correctly
    const enteredValue = await page.inputValue(blInputSelector);
    console.log(`✅ BL Number updated to: "${enteredValue}"`);
    
    if (enteredValue !== newBLNumber) {
      console.warn(`⚠️ Warning: Expected "${newBLNumber}" but got "${enteredValue}"`);
    }
    
    await page.waitForTimeout(1000);

    const modalSaveSelector = 'div.e-footer-content button.e-primary';
    await page.waitForSelector(modalSaveSelector, { state: 'visible', timeout: 5000 });
    await page.click(modalSaveSelector);
    console.log('💾 Modal save button clicked');
    await page.waitForTimeout(1000);

    await page.waitForSelector(modalSelector, { state: 'hidden', timeout: timeouts.modalClose });
    console.log('✅ Modal closed');
    await page.waitForTimeout(1000);

    await page.waitForSelector(selectors.updateButton, { state: 'visible', timeout: timeouts.buttonVisible });
    await page.click(selectors.updateButton);
    console.log('➡️ Update button clicked');
    await page.waitForTimeout(1000);

    if (selectors.shipmentSavedPopupSelector) {
      await page.waitForSelector(selectors.shipmentSavedPopupSelector, { timeout: timeouts.shipmentSavedPopupTimeout });
      
      // Click OK button on success popup
      if (selectors.shipmentSavedPopupOkButtonSelector) {
        await page.click(selectors.shipmentSavedPopupOkButtonSelector);
        console.log('👍 Success popup OK button clicked');
      }
      
      console.log('🎉 Shipment updated successfully');
    }

  } catch (e) {
    console.error('❌ Error in updateShipment:', e.message);
    console.error('Stack trace:', e.stack);
    
    // Debug info
    try {
      const currentUrl = page.url();
      console.log(`🔍 Current URL: ${currentUrl}`);
      
      // Check if modal is open
      const modalOpen = await page.$('div.e-dialog.e-popup-open');
      console.log(`🔍 Modal open: ${!!modalOpen}`);
      
      if (modalOpen) {
        // Try to close modal
        await page.keyboard.press('Escape');
        console.log('🔄 Attempted to close modal with Escape');
      }
    } catch (debugError) {
      console.log('🔍 Debug info collection failed');
    }
    
    throw e; // Rethrow error
  }
};