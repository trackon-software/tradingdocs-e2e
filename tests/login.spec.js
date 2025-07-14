require('dotenv').config();
const { test, expect } = require('@playwright/test');

// Increase test timeout to handle AI processing delays
test.setTimeout(180000); // 3 minutes

test.beforeEach(async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('🌐 PAGE:', msg.text());
    }
  });
});

test('Create shipment with document upload', async ({ page }) => {
  console.log('🚀 Starting test: Create shipment with document upload');
  
  // Login
  await page.goto('https://demo.tradingdocs.ai/login');
  await page.fill('input[name="email"]', process.env.USER_EMAIL);
  await page.fill('input[name="password"]', process.env.USER_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('https://demo.tradingdocs.ai');
  console.log('✅ Login successful');

  // Navigate to Shipments
  await page.click('a[href="/shipments"]');
  await expect(page).toHaveURL('https://demo.tradingdocs.ai/shipments');
  await page.waitForSelector('text=Shipments', { timeout: 10000 });
  console.log('✅ Navigated to Shipments page');

  // Create new shipment
  await page.click('text=Add');
  await page.waitForSelector('#shipmentId', { state: 'visible', timeout: 5000 });
  console.log('✅ Opened new shipment form');

  // Fill shipment details
  const shipmentData = {
    '#shipmentId': 'TEST-001',
    '#shipper': 'TEST_SHIPPER',
    '#consignee': 'TEST_CONSIGNEE',
    '#blNumber': 'BL123456',
    '#commodity': 'STEEL',
    '#originPort': 'Istanbul',
    '#destinationPort': 'Dubai',
    '#vesselName': 'Black Pearl',
    '#shipmentDate': '07/15/2025',
    '#etd': '07/15/2025',
    '#eta': '07/25/2025',
    '#bookingNumber': 'BOOK1234',
    '#reference': 'Test Ref'
  };

  for (const [selector, value] of Object.entries(shipmentData)) {
    await page.fill(selector, value);
    if (selector === '#etd' || selector === '#eta') {
      await page.keyboard.press('Tab'); // Handle date inputs
    }
  }
  console.log('✅ Filled shipment details');

  // Handle status dropdown with proper waiting
  await page.click('.e-input-group-icon.e-ddl-icon');
  await page.waitForSelector('#status_popup', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#status_popup .dropdown-item-template', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(200);
  
  const generatedOption = page.locator('#status_popup .dropdown-item-template').filter({ hasText: 'Generated' });
  await generatedOption.waitFor({ state: 'visible', timeout: 5000 });
  await generatedOption.click();
  await page.waitForFunction(() => document.querySelector('#status').value === 'Generated', {}, { timeout: 5000 });
  console.log('✅ Status set to Generated');

  // Save shipment and verify success
  await page.click('button:has-text("Save")');
  console.log('✅ Save button clicked');
  
  await page.waitForSelector('.e-alert-dialog .predefined-dialog', { state: 'visible', timeout: 10000 });
  
  const successHeader = page.locator('.e-alert-dialog .dialog-text h2');
  const successMessage = page.locator('.e-alert-dialog .dialog-text p');
  
  await expect(successHeader).toHaveText('Success');
  await expect(successMessage).toHaveText('Document shipment created successfully.');
  console.log('✅ Success message verified in popup');
  
  await page.click('.e-alert-dialog .predefined-dialog');
  await page.waitForSelector('.e-alert-dialog', { state: 'hidden', timeout: 5000 });
  console.log('✅ Success popup closed');

  await page.waitForLoadState('networkidle');
  console.log('✅ Shipment created and verified successfully');

  // Step 6: Navigate to shipment details and upload file
  await test.step('Upload file to shipment', async () => {
    await page.goto('https://demo.tradingdocs.ai/shipment/TEST-001');
    
    await page.waitForSelector('#uploadFilesBtn', { state: 'visible', timeout: 15000 });
    console.log('✅ Navigated to shipment details page (upload button visible)');

    await page.click('#uploadFilesBtn');
    console.log('✅ Upload Files button clicked');

    await page.waitForSelector('#fileUpload', { state: 'visible', timeout: 10000 });
    console.log('✅ Upload dialog opened');

    await page.waitForSelector('#documentType', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('#documentCategory', { state: 'visible', timeout: 5000 });

    const fileInput = page.locator('#fileUpload');
    await fileInput.setInputFiles('Demo Shipping Documents - MSCU1234567-1751916499287.pdf');
    console.log('✅ File selected for upload');

    const processCheckbox = page.locator('#processDocuments');
    await expect(processCheckbox).toBeChecked();
    console.log('✅ Process files checkbox verified as checked');

    await page.click('.e-footer-content button.e-primary:has-text("Upload")');
    console.log('✅ Upload button clicked');

    // Upload success popup handling with evaluate click on OK button
    await page.waitForSelector('.e-alert-dialog .predefined-dialog-content', { state: 'visible', timeout: 15000 });

    const uploadSuccessHeader = page.locator('.e-alert-dialog .dialog-text h2');
    const uploadSuccessMessage = page.locator('.e-alert-dialog .dialog-text p');

    await expect(uploadSuccessHeader).toHaveText('Success');
    await expect(uploadSuccessMessage).toHaveText('Files uploaded successfully and sent for processing');
    console.log('✅ Upload success message verified');

    await page.waitForSelector('.e-alert-dialog button.predefined-dialog:has-text("OK")', { timeout: 15000 });

    await page.evaluate(() => {
      const btn = document.querySelector('.e-alert-dialog button.predefined-dialog');
      if (btn) btn.click();
    });
    console.log('✅ OK button clicked via evaluate');

    await page.waitForSelector('.e-alert-dialog', { state: 'hidden', timeout: 5000 });
    console.log('✅ Upload success popup closed');

    // Reload page and click Comply (All)
    await page.reload();
    console.log('🔄 Page reloaded after file upload');

    await page.click('button:has-text("Comply")');
    console.log('✅ Comply (All) button clicked');
  });

  console.log('🎉 Test completed successfully - Shipment created, file uploaded, and comply clicked!');
});
