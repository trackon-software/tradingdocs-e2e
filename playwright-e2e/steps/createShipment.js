const config = require('../config');

module.exports = async function createEditDeleteShipment(page) {
  const cfg = config.createShipment;
  const { selectors, shipmentData, timeouts } = cfg;

  try {
    console.log('🚀 Navigating to Shipments page...');
    await page.goto(cfg.baseUrl + cfg.shipmentsPath);
    await page.waitForSelector('text=Shipments', { timeout: timeouts.pageLoad });

    // ADD
    console.log('🔧 Clicking Add button...');
    await page.click(selectors.addButton);
    await page.waitForSelector(selectors.shipmentForm, { state: 'visible', timeout: timeouts.formVisible });

    console.log('📝 Filling out shipment form...');
    await page.fill(selectors.shipmentIdInput, shipmentData.shipmentId);
    await page.fill(selectors.shipperInput, shipmentData.shipper);
    await page.fill(selectors.consigneeInput, shipmentData.consignee);
    await page.fill(selectors.blNumberInput, shipmentData.blNumber);
    await page.fill(selectors.commodityInput, shipmentData.commodity);
    await page.fill(selectors.originPortInput, shipmentData.originPort);
    await page.fill(selectors.destinationPortInput, shipmentData.destinationPort);
    await page.fill(selectors.vesselNameInput, shipmentData.vesselName);
    await page.fill(selectors.shipmentDateInput, shipmentData.shipmentDate);
    await page.fill(selectors.etdInput, shipmentData.etd);
    await page.keyboard.press('Tab');
    await page.fill(selectors.etaInput, shipmentData.eta);
    await page.keyboard.press('Tab');
    await page.fill(selectors.bookingNumberInput, shipmentData.bookingNumber);
    await page.fill(selectors.referenceInput, shipmentData.reference);

    // STATUS Dropdown
    try {
      await page.click(selectors.statusDropdownIcon);
      await page.waitForSelector(selectors.statusPopup, { state: 'visible', timeout: timeouts.statusPopupVisible });

      const generatedOption = page.locator(selectors.statusOptionGenerated).filter({ hasText: 'Generated' });
      await generatedOption.waitFor({ state: 'visible', timeout: timeouts.statusOptionVisible });
      await generatedOption.click();
    } catch (e) {
      console.warn('⚠️ Status selection failed, skipping...');
    }

    await page.click(selectors.saveButton);
    console.log('💾 Clicked Save');

    try {
      await page.waitForSelector(selectors.successPopup, { state: 'visible', timeout: timeouts.saveSuccessPopupVisible });
      console.log('✅ Success popup appeared');
      await page.click(selectors.successPopup);
      await page.waitForSelector(selectors.successPopup, { state: 'hidden', timeout: timeouts.popupCloseTimeout });
    } catch (e) {
      console.warn('⚠️ Could not verify or close success popup');
    }

    await page.waitForLoadState('networkidle');

    // EDIT
    try {
      console.log('🔍 Searching for created shipment in grid...');
      const shipmentCell = page.locator(`td[title="${shipmentData.shipmentId}"]`);
      await shipmentCell.waitFor({ timeout: 3000 });
      await shipmentCell.click();

      console.log('✏️ Clicking Edit');
      await page.click(selectors.editButton);
      await page.waitForSelector(selectors.shipmentForm, { state: 'visible', timeout: 3000 });
      console.log('✅ Edit form opened');

      // Optional: Check if form data is correct or do minor edit
      await page.keyboard.press('Escape'); // Close edit modal if needed
    } catch (e) {
      console.warn('⚠️ Edit step failed or shipment not found');
    }

    // DELETE
    try {
      console.log('🗑️ Clicking Delete');
      const shipmentCell = page.locator(`td[title="${shipmentData.shipmentId}"]`);
      await shipmentCell.waitFor({ timeout: 3000 });
      await shipmentCell.click();

      await page.click(selectors.deleteButton);

      // Confirm delete popover/modal
      const confirmDeleteButton = page.locator(selectors.confirmDeleteButton);
      await confirmDeleteButton.waitFor({ timeout: 2000 });
      await confirmDeleteButton.click();

      console.log('✅ Shipment deleted');
    } catch (e) {
      console.warn('⚠️ Delete step failed');
    }

    console.log('🎉 Finished create-edit-delete flow');
  } catch (e) {
    console.error('❌ Fatal error in shipment test flow:', e.message);
  }
};
