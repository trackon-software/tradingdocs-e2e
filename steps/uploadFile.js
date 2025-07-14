const { expect } = require('@playwright/test');

module.exports = async function uploadFile(page) {
  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-001');

  // Close popover if present (reuse previous popover handling)
  try {
    const popover = await page.waitForSelector('.driver-popover[style*="display: block"]', { timeout: 10000 });
    if (popover) {
      console.log('⚠️ Popover detected, closing it...');
      await page.click('.driver-popover-close-btn');
      await page.waitForSelector('.driver-popover[style*="display: block"]', { state: 'hidden', timeout: 10000 });
      console.log('✅ Popover closed');
    }
  } catch {
    console.log('ℹ️ No popover detected, continuing...');
  }

  // Wait for the "Click Here" button inside upload card
  const clickHereBtn = await page.waitForSelector('.upload-card button.btn-link', { timeout: 15000 });
  await clickHereBtn.click();
  console.log('✅ Clicked "Click Here" to open file selector');

  // Wait for hidden file input to appear (adjust selector if needed)
  const fileInput = page.locator('#fileUpload');


  // Set the file - adjust filename/path as needed
  await fileInput.setInputFiles('Demo Shipping Documents - MSCU1234567-1751916499287.pdf');
  console.log('✅ File set for upload');

  // Now click upload button (you might need to wait for it to appear)
  await page.waitForSelector('.e-footer-content button.e-primary:has-text("Upload")', { timeout: 10000 });
  await page.click('.e-footer-content button.e-primary:has-text("Upload")');
  console.log('✅ Upload button clicked');

  // The rest of your success waiting code...

  await page.waitForSelector('.e-alert-dialog .predefined-dialog-content', { state: 'visible', timeout: 15000 });
  const uploadSuccessHeader = page.locator('.e-alert-dialog .dialog-text h2');
  const uploadSuccessMessage = page.locator('.e-alert-dialog .dialog-text p');
  await expect(uploadSuccessHeader).toHaveText('Success');
  await expect(uploadSuccessMessage).toHaveText('Files uploaded successfully and sent for processing');
  console.log('✅ Upload success message verified');

  // Click OK button on popup using evaluate
  await page.waitForSelector('.e-alert-dialog button.predefined-dialog:has-text("OK")', { timeout: 15000 });
  await page.evaluate(() => {
    const btn = document.querySelector('.e-alert-dialog button.predefined-dialog');
    if (btn) btn.click();
  });
  console.log('✅ OK button clicked via evaluate');

  await page.waitForSelector('.e-alert-dialog', { state: 'hidden', timeout: 5000 });
  console.log('✅ Upload success popup closed');

  // Reload page after upload
  await page.reload();
  console.log('🔄 Page reloaded after file upload');
};
