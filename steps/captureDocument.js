const { expect } = require('@playwright/test');

async function captureDocument(page) {
  const popoverSelector = '#driver-popover-content';
  const closeBtnSelector = `${popoverSelector} .driver-popover-close-btn`;

  // Step 0: Go to shipment page
  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-002');
  console.log('🚀 Navigated to shipment page');

  // Popover kapatma (ilk kontrol)
  try {
    console.log('⏳ Waiting for possible popover (max 5s)...');
    await page.waitForSelector(popoverSelector, { state: 'visible', timeout: 5000 });
    console.log('⚠️ Popover detected, attempting to close it...');
    await page.click(closeBtnSelector);
    await page.waitForSelector(popoverSelector, { state: 'hidden', timeout: 7000 });
    console.log('✅ Popover closed successfully');
    await page.waitForTimeout(1500);
  } catch {
    console.log('✅ No popover detected — continuing.');
  }

  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);
  if (!currentUrl.includes('/shipment/TEST-002')) {
    throw new Error(`❌ Unexpected redirect! Expected shipment page, got: ${currentUrl}`);
  }

  // Tablo satırlarının gelmesini bekle
  const rowLocator = page.locator('tr.e-row');
  try {
    await rowLocator.nth(0).waitFor({ state: 'visible', timeout: 10000 });
    const rowsCount = await rowLocator.count();
    console.log(`ℹ️ Number of rows found: ${rowsCount}`);
    if (rowsCount === 0) {
      throw new Error('No rows found in the table');
    }
  } catch (err) {
    throw new Error(`Table rows did not appear in time: ${err.message}`);
  }

  // Popover kapatma (tekrar kontrol)
  try {
    console.log('⏳ Waiting for possible popover (max 5s)...');
    await page.waitForSelector(popoverSelector, { state: 'visible', timeout: 5000 });
    console.log('⚠️ Popover detected, attempting to close it...');
    await page.click(closeBtnSelector);
    await page.waitForSelector(popoverSelector, { state: 'hidden', timeout: 7000 });
    console.log('✅ Popover closed successfully');
    await page.waitForTimeout(1500);
  } catch {
    console.log('✅ No popover detected — continuing.');
  }

  // Seçimleri temizle
  try {
    console.log('🧹 Clearing any existing selections...');
    let currentUrl = page.url();
    console.log(`📍 URL before clearing selections: ${currentUrl}`);

    const tableHeader = page.locator('thead tr').first();
    if (await tableHeader.isVisible()) {
      await tableHeader.click({ position: { x: 50, y: 10 } });
      await page.waitForTimeout(500);
    }

    currentUrl = page.url();
    console.log(`📍 URL after clearing selections: ${currentUrl}`);
    if (!currentUrl.includes('/shipment/TEST-002')) {
      throw new Error(`❌ Redirect detected after clearing selections! URL: ${currentUrl}`);
    }

    const selectedRows = await page.locator('tr.e-row.e-selectionbackground, tr.e-row.e-active, tr.e-row[aria-selected="true"]').count();
    console.log(`ℹ️ Selected rows after clearing: ${selectedRows}`);
  } catch (err) {
    console.log(`⚠️ Warning during selection clearing: ${err.message}`);
    if (err.message.includes('Redirect detected')) {
      throw err;
    }
  }

  // "Purchase Order - A" satırını kısmi text ile bul ve checkbox wrapper div'ine tıkla
  const targetRow = page.locator('tr.e-row', {
    has: page.locator('td[data-field="documentName"]', { hasText: 'Purchase Order - A' }) // partial text to handle truncation
  }).first();

  await targetRow.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const checkboxWrapper = targetRow.locator('div.e-checkbox-wrapper');

  if (await checkboxWrapper.isVisible()) {
    await checkboxWrapper.click();
    console.log('✅ Checkbox wrapper clicked for "Purchase Order - A" row');
  } else {
    throw new Error('❌ Checkbox wrapper not found in the matched row');
  }

  // Seçim sayısını kontrol et
  try {
    const selectedCount = await page.locator('tr.e-row.e-selectionbackground, tr.e-row.e-active, tr.e-row[aria-selected="true"]').count();
    console.log(`📊 Final selection count: ${selectedCount}`);

    if (selectedCount !== 1) {
      throw new Error(`Expected 1 selected row, but found ${selectedCount}. Aborting capture.`);
    }
  } catch (err) {
    throw new Error(`❌ Selection verification failed: ${err.message}`);
  }

  // Capture butonuna basmadan önce kısa bekleme
  console.log('⏸️ Pausing for 2 seconds before clicking Capture button...');
  await page.waitForTimeout(2000);

  // #captureBtn butonuna tıkla (modal açacak)
  try {
    const captureBtn = page.locator('#captureBtn');
    await captureBtn.waitFor({ state: 'visible', timeout: 7000 });

    const isDisabled = await captureBtn.evaluate(btn => btn.disabled);
    if (isDisabled) {
      throw new Error('Capture button (#captureBtn) is disabled, cannot click.');
    }

    await captureBtn.click();
    console.log('✅ #captureBtn clicked, waiting for modal...');
  } catch (err) {
    throw new Error(`Failed to click #captureBtn button: ${err.message}`);
  }

  // Modal açılana kadar bekle
  const modalSelector = 'div.e-dialog.e-popup-open[role="dialog"]';
  await page.waitForSelector(modalSelector, { state: 'visible', timeout: 7000 });

  // Modal içindeki dropdown wrapper'ı bul ve tıkla
  const dropdownWrapper = page.locator(`${modalSelector} span.e-input-group.e-control-wrapper.e-ddl.e-lib.e-keyboard`);
  await dropdownWrapper.click();
  console.log('🔽 Dropdown clicked to open options');

  // Dropdown açıldıktan sonra biraz bekle, stabilite için
  await page.waitForTimeout(1000);

  // Bir kere aşağı ok tuşuna bas
  await dropdownWrapper.press('ArrowDown');
  await page.waitForTimeout(500);

  // Enter ile seç
  await dropdownWrapper.press('Enter');
  console.log('✅ Dropdown option selected via keyboard');

  // Modal içindeki Capture butonuna tıkla
  const modalCaptureBtn = page.locator(`${modalSelector} button.e-control.e-btn.e-lib.e-primary.e-flat`, { hasText: 'Capture' });
  await modalCaptureBtn.waitFor({ state: 'visible', timeout: 7000 });

  await modalCaptureBtn.click();
  console.log('✅ Modal Capture button clicked');

  // Modal kapanana kadar bekle
  await page.waitForSelector(modalSelector, { state: 'hidden', timeout: 7000 });
  console.log('✅ Modal closed after capture');

  // Başarı mesajındaki OK butonuna tıkla
  const okBtn = page.locator('button.predefined-dialog.e-control.e-btn.e-lib.e-primary.e-flat', { hasText: 'OK' });
  await okBtn.waitFor({ state: 'visible', timeout: 7000 });
  await okBtn.click();
  console.log('✅ OK button clicked after capture');
}

module.exports = captureDocument;
