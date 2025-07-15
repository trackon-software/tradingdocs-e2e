// steps/createShipment.js

module.exports = async function createShipment(page) {
  console.log('🚀 Starting step: Create Shipment');

  // Navigate to Shipments page
  await page.goto('https://demo.tradingdocs.ai/shipments');
  await page.waitForSelector('text=Shipments', { timeout: 10000 });
  console.log('✅ Navigated to Shipments page');

  // Click Add button to open new shipment form
  await page.click('text=Add');
  await page.waitForSelector('#shipmentId', { state: 'visible', timeout: 5000 });
  console.log('✅ Opened new shipment form');

  // Fill shipment details
  const shipmentData = {
    '#shipmentId': 'TEST-002',
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
      await page.keyboard.press('Tab'); // Handle date inputs tabbing
    }
  }
  console.log('✅ Filled shipment details');

  // Handle status dropdown
  await page.click('.e-input-group-icon.e-ddl-icon');
  await page.waitForSelector('#status_popup', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#status_popup .dropdown-item-template', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(200);

  const generatedOption = page.locator('#status_popup .dropdown-item-template').filter({ hasText: 'Generated' });
  await generatedOption.waitFor({ state: 'visible', timeout: 5000 });
  await generatedOption.click();
  await page.waitForFunction(() => document.querySelector('#status').value === 'Generated', {}, { timeout: 5000 });
  console.log('✅ Status set to Generated');

  // Save shipment
  await page.click('button:has-text("Save")');
  console.log('✅ Save button clicked');

  // Wait for success popup and verify
  await page.waitForSelector('.e-alert-dialog .predefined-dialog', { state: 'visible', timeout: 10000 });
  const successHeader = page.locator('.e-alert-dialog .dialog-text h2');
  const successMessage = page.locator('.e-alert-dialog .dialog-text p');

  await successHeader.waitFor({ state: 'visible', timeout: 5000 });
  await successMessage.waitFor({ state: 'visible', timeout: 5000 });

  if ((await successHeader.textContent()) === 'Success' &&
      (await successMessage.textContent()) === 'Document shipment created successfully.') {
    console.log('✅ Success message verified in popup');
  } else {
    throw new Error('Shipment creation success message mismatch');
  }

  // Close success popup
  await page.click('.e-alert-dialog .predefined-dialog');
  await page.waitForSelector('.e-alert-dialog', { state: 'hidden', timeout: 5000 });
  console.log('✅ Success popup closed');

  await page.waitForLoadState('networkidle');
  console.log('🎉 Shipment created successfully');
};
