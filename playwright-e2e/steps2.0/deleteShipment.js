const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { expect } = require('@playwright/test');

module.exports = async function deleteShipment(page, searchCriteria) {
  const cfg = config.shipment;
  const { selectors, timeouts, data } = cfg;

  console.log('🚀 Navigating to Shipments page...');
  await navigateAndWait(page, 'shipment');
  await page.waitForTimeout(timeouts.generalWait);

  // Use the updated BL Number as search criteria since that's what the shipment was updated to
  const searchValue = searchCriteria || data.newBLNumber;
  console.log(`🔍 Searching for shipment with BL Number: ${searchValue}...`);
  
  // Search by BL Number instead of shipment ID since that's what was updated
  const rowSelector = `tr.e-row:has(td[title="${searchValue}"])`;
  
  // Assert shipment row exists
  const shipmentRow = page.locator(rowSelector);
  await expect(shipmentRow).toBeVisible({ timeout: timeouts.pageLoad });
  console.log('✅ Shipment row found');

  // Click the shipment row
  await shipmentRow.click();
  console.log('🟡 Shipment row clicked (selected)');
  await page.waitForTimeout(timeouts.generalWait);

  // Assert delete button is visible and click it
  const deleteButton = page.locator(selectors.deleteButton);
  await expect(deleteButton).toBeVisible({ timeout: timeouts.buttonVisible });
  await deleteButton.click();
  console.log('🗑️ Delete button clicked');
  await page.waitForTimeout(timeouts.generalWait);

  // Assert confirmation popup appears
  console.log('⏳ Waiting for confirmation popup...');
  const confirmPopup = page.locator(selectors.confirmDeletePopup);
  await expect(confirmPopup).toBeVisible({ timeout: timeouts.modalOpen });
  console.log('✅ Confirmation popup appeared');

  // Assert OK button exists and click it
  const confirmOkButton = page.locator(selectors.confirmDeleteButton);
  await expect(confirmOkButton).toBeVisible({ timeout: timeouts.modalOpen });
  await confirmOkButton.click();
  console.log('✅ Delete confirmed');
  await page.waitForTimeout(timeouts.saveProcessing * 2); // Give more time for deletion

  // Check for success popup first, then fallback to row disappearance
  if (selectors.shipmentDeletedPopupSelector) {
    try {
      const successPopup = page.locator(selectors.shipmentDeletedPopupSelector);
      await expect(successPopup).toBeVisible({ timeout: timeouts.shipmentSavedPopupTimeout });
      console.log('🎉 Shipment deleted successfully (success popup confirmed)');
      
      // If there's an OK button on the success popup, click it
      if (selectors.successPopupOkButton) {
        await page.locator(selectors.successPopupOkButton).click();
        await page.waitForTimeout(timeouts.generalWait);
      }
    } catch (error) {
      console.log('⚠️ Success popup not found, checking row disappearance...');
      // Fallback to checking row disappearance
      await expect(shipmentRow).not.toBeAttached({ timeout: timeouts.modal });
      console.log('🎉 Shipment deleted successfully (row disappeared)');
    }
  } else {
    // Assert shipment row disappears (is no longer attached to DOM)
    await expect(shipmentRow).not.toBeAttached({ timeout: timeouts.modal });
    console.log('🎉 Shipment deleted successfully (row disappeared)');
  }
};