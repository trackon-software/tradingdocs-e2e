const { expect } = require('@playwright/test');
const { popoverHandler } = require('../utils/popoverHandler');
const config = require('../config'); // config dosyasını import et

module.exports = async function uploadFile(page) {
  const { uploadFile: uploadConfig } = config;
  
  await page.goto(uploadConfig.baseUrl + uploadConfig.shipmentPath);

  // Popover kapatma
  await popoverHandler(page);

  // Wait for the "Click Here" button inside upload card
  const clickHereBtn = await page.waitForSelector(uploadConfig.selectors.uploadCardButton, { 
    timeout: uploadConfig.timeouts.clickHereButton 
  });
  await clickHereBtn.click();
  console.log(uploadConfig.messages.clickHereClicked);

  // Wait for hidden file input to appear
  const fileInput = page.locator(uploadConfig.selectors.fileInput);

  // Set the file
  await fileInput.setInputFiles(uploadConfig.uploadData.fileName);
  console.log(uploadConfig.messages.fileSet);

  // Now click upload button
  await page.waitForSelector(uploadConfig.selectors.uploadButton, { 
    timeout: uploadConfig.timeouts.uploadButton 
  });
  await page.click(uploadConfig.selectors.uploadButton);
  console.log(uploadConfig.messages.uploadClicked);

  // Wait for success dialog and verify content
  await page.waitForSelector(uploadConfig.selectors.successDialog, { 
    state: 'visible', 
    timeout: uploadConfig.timeouts.successDialog 
  });
  
  const uploadSuccessHeader = page.locator(uploadConfig.selectors.successHeader);
  const uploadSuccessMessage = page.locator(uploadConfig.selectors.successMessage);
  
  await expect(uploadSuccessHeader).toHaveText(uploadConfig.expectedSuccess.header);
  await expect(uploadSuccessMessage).toHaveText(uploadConfig.expectedSuccess.message);
  console.log(uploadConfig.messages.successVerified);

  // Click OK button on popup using evaluate
  await page.waitForSelector(uploadConfig.selectors.okButton, { 
    timeout: uploadConfig.timeouts.okButton 
  });
  await page.evaluate(() => {
    const btn = document.querySelector('.e-alert-dialog button.predefined-dialog');
    if (btn) btn.click();
  });
  console.log(uploadConfig.messages.okClicked);

  await page.waitForSelector(uploadConfig.selectors.alertDialog, { 
    state: 'hidden', 
    timeout: uploadConfig.timeouts.dialogClose 
  });
  console.log(uploadConfig.messages.popupClosed);

  // Reload page after upload
  await page.reload();
  console.log(uploadConfig.messages.pageReloaded);
};