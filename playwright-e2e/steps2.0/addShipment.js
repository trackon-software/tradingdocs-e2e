const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');
const { selectDropdownOption } = require('../utils/dropdownHandler');

module.exports = async function addShipment(page) {
  const cfg = config.shipment;
  const { selectors, timeouts } = cfg;

  try {
    console.log('🚀 Navigating to Shipments page...');
    await navigateAndWait(page, 'shipment');

    console.log('🔍 Checking if Add button is loaded...');
    const addBtn = page.locator(selectors.addButton);
    await addBtn.waitFor({ timeout: timeouts.buttonVisible });
    console.log('✅ Add button is loaded and visible');

    console.log('🔧 Scrolling into view and clicking Add button...');
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click(); // you can add { force: true } if still unreliable

    console.log('⏳ Waiting for modal to load...');
    try {
      await page.waitForSelector(selectors.modal, { timeout: timeouts.modalVisible });
      console.log('✅ Modal is loaded and visible');
    } catch (modalError) {
      console.error('❌ Modal did not appear. Taking screenshot for debugging...');
      await page.screenshot({ path: 'modal-load-failure.png', fullPage: true });
      throw modalError;
    }

    await page.waitForTimeout(2000); // Wait to ensure modal is fully rendered

    console.log('📝 Filling out shipment form...');
    await page.fill(selectors.shipmentIdInput, cfg.data.shipmentId);
    await page.fill(selectors.shipperInput, cfg.data.shipper);
    await page.fill(selectors.consigneeInput, cfg.data.consignee);
    await page.fill(selectors.blNumberInput, cfg.data.blNumber);
    await page.fill(selectors.commodityInput, cfg.data.commodity);
    await page.fill(selectors.originPortInput, cfg.data.originPort);
    await page.fill(selectors.destinationPortInput, cfg.data.destinationPort);
    await page.fill(selectors.vesselNameInput, cfg.data.vesselName);
    await page.fill(selectors.shipmentDateInput, cfg.data.shipmentDate);
    await page.fill(selectors.etdInput, cfg.data.etd);
    await page.fill(selectors.etaInput, cfg.data.eta);
    await page.fill(selectors.bookingNumberInput, cfg.data.bookingNumber);
    await page.fill(selectors.referenceInput, cfg.data.reference);

    console.log('🔧 Handling status dropdown...');
    try {
      await selectDropdownOption(page, selectors.statusDropdownIcon, 'Generated', {
        openTimeout: timeouts.statusPopupVisible,
        optionTimeout: timeouts.statusOptionVisible,
      });
      console.log('✅ Status selection completed successfully');
    } catch (statusError) {
      console.warn('⚠️ Status selection failed:', statusError.message);
    }

    console.log('💾 Clicking Save button...');
    await page.click(selectors.saveButton);

    console.log('⏳ Waiting for success popup...');
    await page.waitForSelector(selectors.shipmentSavedPopupSelector, {
      timeout: timeouts.shipmentSavedPopupTimeout,
    });

    const successText = await page.textContent(selectors.shipmentSavedPopupSuccessMessageSelector);
    if (successText?.trim() !== cfg.data.expectedSuccessText) {
      console.warn(`⚠️ Unexpected popup message: "${successText}"`);
    } else {
      console.log('✅ Success popup received with correct message');
    }

    console.log('👍 Clicking OK on popup...');
    await page.click(selectors.shipmentSavedPopupOkButtonSelector);

    console.log('🎉 Shipment added successfully');

    console.log('⏳ Waiting for modal to close...');
    await page.waitForSelector(selectors.modal, {
      state: 'hidden',
      timeout: timeouts.modalClose || 5000,
    });
  } catch (e) {
    console.error('❌ Error in addShipment:', e.message);
    try {
      const modalVisible = await page.$(selectors.modal);
      if (modalVisible) {
        await page.keyboard.press('Escape');
      }
    } catch (_) {}
    throw e;
  }
};
