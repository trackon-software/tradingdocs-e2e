const config = require('./config3.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');
const { findRowAcrossPages } = require('../utils/paginationHelper');
const { expect } = require('@playwright/test');

module.exports = async function addShipment(page) {
  const cfg = config.shipment;
  const { selectors, timeouts, data, rowSelectors } = cfg;

  try {
    console.log('🚀 Navigating to Shipments page...');
    await navigateAndWait(page, 'shipment');

    const addBtn = page.locator(selectors.addButton);
    await addBtn.waitFor({ timeout: timeouts.buttonVisible });
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();

    console.log('⏳ Waiting for modal...');
    await page.waitForSelector(selectors.modal, { timeout: timeouts.modalVisible });

    const inputMap = [
      [selectors.shipmentIdInput, data.shipmentId],
      [selectors.shipperInput, data.shipper],
      [selectors.consigneeInput, data.consignee],
      [selectors.blNumberInput, data.blNumber],
      [selectors.commodityInput, data.commodity],
      [selectors.originPortInput, data.originPort],
      [selectors.destinationPortInput, data.destinationPort],
      [selectors.vesselNameInput, data.vesselName],
      [selectors.shipmentDateInput, data.shipmentDate],
      [selectors.etdInput, data.etd],
      [selectors.etaInput, data.eta],
      [selectors.bookingNumberInput, data.bookingNumber],
      [selectors.referenceInput, data.reference],
    ];

    for (const [selector, value] of inputMap) {
      await page.fill(selector, value);
    }

    console.log(`🔽 Selecting status: ${data.statusOption}`);
    await selectDropdownOption(page, selectors.statusDropdownIcon, data.statusOption, {
      openTimeout: timeouts.statusPopupVisible,
      optionTimeout: timeouts.statusOptionVisible,
    });

    console.log('💾 Saving form...');
    await page.click(selectors.saveButton);

    const popup = page.locator(selectors.shipmentSavedPopupSelector);
    await popup.waitFor({ timeout: timeouts.shipmentSavedPopupTimeout });

    const popupText = await page.textContent(selectors.shipmentSavedPopupSuccessMessageSelector);
    if (popupText?.trim() === data.expectedSuccessText) {
      console.log(`✅ Success popup message matched: ${popupText}`);
    } else {
      console.warn(`⚠️ Unexpected success message: ${popupText}`);
    }

    await page.click(selectors.shipmentSavedPopupOkButtonSelector);

    console.log('⏳ Waiting for modal to close...');
    await page.waitForSelector(selectors.modal, { state: 'hidden', timeout: timeouts.modalClose });

    // ✅ Final verification
    console.log('🔍 Verifying row post-creation...');
    await navigateAndWait(page, 'shipment');
    const verifyRowSelector = rowSelectors.byShipmentIdInColumn(data.shipmentId);
    const row = await findRowAcrossPages(page, `tr.e-row:has(td[title="${data.shipmentId}"])`, selectors.nextPageButton, 10);
    await expect(row).toContainText(data.blNumber);
    console.log('✅ Shipment appears in table with correct BL');

  } catch (err) {
    console.error('❌ Error in addShipment:', err.message);
    try {
      const isModalOpen = await page.$(selectors.modal);
      if (isModalOpen) await page.keyboard.press('Escape');
    } catch (_) {}
    throw err;
  }
};
