const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { expect } = require('@playwright/test');
const { findRowAcrossPages } = require('../utils/paginationHelper');

module.exports = async function deleteShipment(page, searchCriteria) {
  const cfg = config.shipment;
  const { selectors, timeouts, data } = cfg;

  console.log('🚀 Navigating to Shipments page...');
  await navigateAndWait(page, 'shipment');
  await page.waitForTimeout(timeouts.generalWait);

  const searchValue = searchCriteria || data.newBLNumber;
  console.log(`🔍 Searching for shipment with BL Number: ${searchValue} across pages...`);

  const rowSelector = `tr.e-row:has(td[title="${searchValue}"])`;
  const shipmentRow = await findRowAcrossPages(page, rowSelector, selectors.nextPageButton, 10);

  await shipmentRow.click();
  console.log('🟡 Shipment row clicked (selected)');
  await page.waitForTimeout(timeouts.generalWait);

  const deleteButton = page.locator(selectors.deleteButton);
  await expect(deleteButton).toBeVisible({ timeout: timeouts.buttonVisible });
  await deleteButton.click();
  console.log('🗑️ Delete button clicked');
  await page.waitForTimeout(timeouts.generalWait);

  console.log('⏳ Waiting for confirmation popup...');
  const confirmPopup = page.locator(selectors.confirmDeletePopup);
  await expect(confirmPopup).toBeVisible({ timeout: timeouts.modalOpen });
  console.log('✅ Confirmation popup appeared');

  const confirmOkButton = page.locator(selectors.confirmDeleteButton);
  await expect(confirmOkButton).toBeVisible({ timeout: timeouts.modalOpen });
  await confirmOkButton.click();
  console.log('✅ Delete confirmed');

  await page.waitForTimeout(timeouts.saveProcessing * 2);

  if (selectors.shipmentDeletedPopupSelector) {
    try {
      const successPopup = page.locator(selectors.shipmentDeletedPopupSelector);
      await expect(successPopup).toBeVisible({ timeout: timeouts.shipmentSavedPopupTimeout });
      console.log('🎉 Shipment deleted successfully (success popup confirmed)');

      if (selectors.successPopupOkButton) {
        await page.locator(selectors.successPopupOkButton).click();
        await page.waitForTimeout(timeouts.generalWait);
      }
    } catch (error) {
      console.log('⚠️ Success popup not found, checking row disappearance...');
      await expect(shipmentRow).not.toBeAttached({ timeout: timeouts.modal });
      console.log('🎉 Shipment deleted successfully (row disappeared)');
    }
  } else {
    await expect(shipmentRow).not.toBeAttached({ timeout: timeouts.modal });
    console.log('🎉 Shipment deleted successfully (row disappeared)');
  }
};
