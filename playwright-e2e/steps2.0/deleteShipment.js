const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { expect } = require('@playwright/test');

module.exports = async function deleteShipment(page) {
  const cfg = config.shipment;
  const { selectors, timeouts, data } = cfg;

  console.log('🚀 Navigating to Shipments page...');
  await navigateAndWait(page, 'shipment');
  await page.waitForTimeout(1000);

  console.log(`🔍 Searching for shipment with ID: ${data.shipmentId}...`);
  const rowSelector = `tr.e-row:has(td[title="${data.shipmentId}"])`;
  
  // Assert shipment row exists
  const shipmentRow = page.locator(rowSelector);
  await expect(shipmentRow).toBeVisible({ timeout: timeouts.pageLoad });
  console.log('✅ Shipment row found');

  // Click the shipment row
  await shipmentRow.click();
  console.log('🟡 Shipment row clicked (selected)');
  await page.waitForTimeout(1000);

  // Assert delete button is visible and click it
  const deleteButton = page.locator(selectors.deleteButton);
  await expect(deleteButton).toBeVisible({ timeout: timeouts.buttonVisible });
  await deleteButton.click();
  console.log('🗑️ Delete button clicked');
  await page.waitForTimeout(1000);

  // Assert confirmation popup appears
  console.log('⏳ Waiting for confirmation popup...');
  const confirmPopup = page.locator(selectors.confirmDeletePopup);
  await expect(confirmPopup).toBeVisible({ timeout: timeouts.modalOpen });
  console.log('✅ Confirmation popup appeared');

  // Assert OK button exists and click it
  const confirmOkButton = page.locator(selectors.confirmDeleteButton);
  await expect(confirmOkButton).toBeVisible({ timeout: 5000 });
  await confirmOkButton.click();
  console.log('✅ Delete confirmed');
  await page.waitForTimeout(2000);

  // Assert successful deletion
  if (selectors.shipmentDeletedPopupSelector) {
    const successPopup = page.locator(selectors.shipmentDeletedPopupSelector);
    await expect(successPopup).toBeVisible({ timeout: timeouts.shipmentSavedPopupTimeout });
    console.log('🎉 Shipment deleted successfully');
  } else {
    // Assert shipment row disappears (is no longer attached to DOM)
    await expect(shipmentRow).not.toBeAttached({ timeout: 3000 });
    console.log('🎉 Shipment deleted successfully (row disappeared)');
  }
};