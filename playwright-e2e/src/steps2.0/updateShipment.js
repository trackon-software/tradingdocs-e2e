const { popoverHandler } = require('../utils/popoverHandler');
const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');
const { expect } = require('@playwright/test');
const { findRowAcrossPages } = require('../utils/paginationHelper');

module.exports = async function updateShipment(page, newBLNumber) {
  const cfg = config.shipment;
  const { selectors, timeouts, data, rowSelectors } = cfg;

  const shipmentId = data.shipmentId;
  const finalBL = newBLNumber || data.newBLNumber || 'BL654321';

  try {
    console.log('🚀 Navigating to Shipments page...');
    await navigateAndWait(page, 'shipment');

    console.log(`🔍 Searching for shipment ID: ${shipmentId} across pages...`);
    const row = await findRowAcrossPages(page, rowSelectors.byBL(shipmentId), selectors.nextPageButton, 10);
    await row.click();
    console.log('🟡 Shipment row clicked');

    const selectedBlCell = page.locator(rowSelectors.byShipmentIdInColumn(shipmentId));
    await expect(selectedBlCell).toBeVisible({ timeout: timeouts.inputVisible });

    const editButton = page.locator(selectors.editButton);
    await expect(editButton).toBeVisible({ timeout: timeouts.buttonVisible });
    await editButton.click();
    console.log('✏️ Edit button clicked');

    await popoverHandler(page);

    console.log('➡️ Navigating to General Info tab...');
    await page.click(selectors.generalTabButton);
    await expect(page.locator('#general.active')).toBeVisible({ timeout: timeouts.pageLoad });
    console.log('✅ General Info tab active');

    await popoverHandler(page);

    const blInline = page.locator('div[name="blNumber"].inline');
    await blInline.click();
    console.log('✏️ Clicked BL Number inline editor');

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible({ timeout: timeouts.modalOpen });

    const blInput = modal.locator(selectors.blNumberInput);
    await expect(blInput).toBeVisible({ timeout: timeouts.inputVisible });

    await blInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Delete');
    await blInput.fill(finalBL);
    await expect(blInput).toHaveValue(finalBL);
    console.log(`✍️ Updated BL Number to "${finalBL}"`);

    const modalSave = modal.locator(selectors.modalSaveButton);
    await expect(modalSave).toBeVisible({ timeout: 5000 });
    await modalSave.click();
    console.log('💾 Clicked Save on modal');

    await expect(modal).toHaveCount(0, { timeout: timeouts.modalClose });
    console.log('✅ Modal closed');

    const updateBtn = page.locator(selectors.updateButton);
    await expect(updateBtn).toBeVisible({ timeout: timeouts.buttonVisible });
    await updateBtn.click();
    console.log('🚀 Clicked Update');

    try {
      const popup = page.locator(selectors.shipmentSavedPopupSelector);
      await expect(popup).toBeVisible({ timeout: timeouts.shipmentSavedPopupTimeout });

      if (selectors.shipmentSavedPopupOkButtonSelector) {
        await page.click(selectors.shipmentSavedPopupOkButtonSelector);
        console.log('👍 Clicked OK on success popup');
      }

      console.log('🎉 Update confirmed via popup');
    } catch {
      console.warn('⚠️ Popup not detected, continuing...');
    }

    // Final verification
    console.log('🔍 Verifying updated BL Number...');
    await navigateAndWait(page, 'shipment');
    const finalRow = await findRowAcrossPages(page, rowSelectors.byBL(shipmentId), selectors.nextPageButton, 10);
    await expect(finalRow).toContainText(finalBL);
    console.log('✅ BL update verified in table');

  } catch (err) {
    console.error('❌ Error in updateShipment:', err.message);

    try {
      const ts = Date.now();
      await page.screenshot({ path: `update-failure-${ts}.png`, fullPage: true });

      const currentUrl = await page.url();
      console.log(`📍 URL at error: ${currentUrl}`);

      const modalOpen = await page.$(selectors.modal);
      if (modalOpen) {
        await page.keyboard.press('Escape');
        console.log('🔄 Closed modal with Escape');
      }
    } catch (debugErr) {
      console.warn('⚠️ Failed to collect debug info');
    }

    throw err;
  }
};
