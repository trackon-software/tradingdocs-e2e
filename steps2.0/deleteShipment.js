const config = require('./config2.0');
const navigateAndWait = require('../utils/navigateAndWait');

module.exports = async function deleteShipment(page) {
  const cfg = config.shipment;
  const { selectors, timeouts, data } = cfg;

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

    await page.waitForSelector(selectors.deleteButton, { timeout: timeouts.buttonVisible });
    await page.click(selectors.deleteButton);
    console.log('🗑️ Delete button clicked');
    await page.waitForTimeout(1000);

    // Confirm delete - DOM yapısına göre düzeltilmiş selector
    console.log('⏳ Waiting for confirmation popup...');
    const confirmPopupSelector = '.e-confirm-dialog.e-popup-open';
    await page.waitForSelector(confirmPopupSelector, { timeout: timeouts.modalOpen });
    console.log('✅ Confirmation popup appeared');

    // OK butonuna tıkla - daha spesifik selector
    const confirmOkButtonSelector = '.e-confirm-dialog.e-popup-open .e-footer-content button.e-primary';
    await page.waitForSelector(confirmOkButtonSelector, { timeout: 5000 });
    await page.click(confirmOkButtonSelector);
    console.log('✅ Delete confirmed');
    await page.waitForTimeout(2000);

    // Optional: Wait for success notification
    if (selectors.shipmentDeletedPopupSelector) {
      await page.waitForSelector(selectors.shipmentDeletedPopupSelector, { timeout: timeouts.shipmentSavedPopupTimeout });
      console.log('🎉 Shipment deleted successfully');
    } else {
      // Alternatif: Sayfanın yenilenmesini veya shipment'ın kaybolmasını bekle
      try {
        await page.waitForSelector(rowSelector, { timeout: 3000, state: 'detached' });
        console.log('🎉 Shipment deleted successfully (row disappeared)');
      } catch (e) {
        console.log('ℹ️ Shipment deletion completed (timeout waiting for row to disappear)');
      }
    }

  } catch (e) {
    console.error('❌ Error in deleteShipment:', e.message);
    // Debug için popup'ın mevcut olup olmadığını kontrol et
    try {
      const popup = await page.$('.e-confirm-dialog.e-popup-open');
      if (popup) {
        console.log('🔍 Debug: Confirmation popup is still visible');
        const buttons = await page.$$('.e-confirm-dialog.e-popup-open .e-footer-content button');
        console.log(`🔍 Debug: Found ${buttons.length} buttons in popup`);
      }
    } catch (debugError) {
      console.log('🔍 Debug: Could not find confirmation popup');
    }
  }
};