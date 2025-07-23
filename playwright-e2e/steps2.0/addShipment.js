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
    await page.waitForSelector(selectors.addButton, { timeout: timeouts.buttonVisible });
    console.log('✅ Add button is loaded and visible');

    console.log('🔧 Clicking Add button...');
    await page.click(selectors.addButton);

    console.log('⏳ Waiting for modal to load...');
    await page.waitForSelector(selectors.modal, { timeout: timeouts.modalVisible });
    console.log('✅ Modal is loaded and visible');
    await page.waitForTimeout(2000); // Modal'ın tamamen yüklenmesi için ekstra bekleme

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

    // Status dropdown seçimi için dropdownHandler kullanımı
    console.log('🔧 Handling status dropdown...');
    try {
      await selectDropdownOption(page, selectors.statusDropdownIcon, 'Generated', {
        openTimeout: timeouts.statusPopupVisible,
        optionTimeout: timeouts.statusOptionVisible,
      });
      console.log('✅ Status selection completed successfully');
    } catch (statusError) {
      console.warn('⚠️ Status selection failed:', statusError.message);
      console.warn('Continuing without status selection...');
    }

    console.log('💾 Clicking Save button...');
    await page.click(selectors.saveButton);

    console.log('⏳ Waiting for success popup...');
    await page.waitForSelector(selectors.shipmentSavedPopupSelector, {
      timeout: timeouts.shipmentSavedPopupTimeout,
    });

    const successText = await page.textContent(selectors.shipmentSavedPopupSuccessMessageSelector);
    if (successText && successText.trim() !== cfg.data.expectedSuccessText) {
      console.warn(`⚠️ Unexpected popup message: "${successText}"`);
    } else {
      console.log('✅ Success popup received with correct message');
    }

    console.log('👍 Clicking OK on popup...');
    await page.click(selectors.shipmentSavedPopupOkButtonSelector);

    console.log('🎉 Shipment added successfully');

    // Modal'ın kapanmasını bekle
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
    } catch {
      // hata yoksa geç
    }

    throw e;
  }
};
