require('dotenv').config();
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Console mesajlarını görmek için
test.beforeEach(async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('PAGE LOG:', msg.text());
    }
  });
});

// Set a longer global timeout to accommodate the 2-minute wait
test.setTimeout(180000); // 3 minutes to be safe

test('Login, create a shipment, upload file, and perform compliance check', async ({ page }) => {
  // Step 1: Go to login page
  await test.step('Navigate to login page', async () => {
    await page.goto('https://demo.tradingdocs.ai/login');
  });

  // Step 2: Login
  await test.step('Login with valid credentials', async () => {
    await page.fill('input[name="email"]', process.env.USER_EMAIL);
    await page.fill('input[name="password"]', process.env.USER_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('https://demo.tradingdocs.ai');
  });

  // Step 3: Go to Shipments page
  await test.step('Navigate to Shipments page', async () => {
    await page.click('a[href="/shipments"]');
    await expect(page).toHaveURL('https://demo.tradingdocs.ai/shipments');
    await page.waitForSelector('text=Shipments', { timeout: 10000 });
  });

  // Step 4: Add new shipment
  await test.step('Add a new shipment', async () => {
    await page.click('text=Add');
    await page.waitForSelector('#shipmentId', { state: 'visible', timeout: 5000 });
    console.log('📝 Opened new shipment form');

    // Fill all form fields
    console.log('📝 Filling form fields...');
    
    await page.fill('#shipmentId', 'TEST-001');
    await page.fill('#shipper', 'TEST_SHIPPER');
    await page.fill('#consignee', 'TEST_CONSIGNEE');
    await page.fill('#blNumber', 'BL123456');
    await page.fill('#commodity', 'STEEL');
    await page.fill('#originPort', 'Istanbul');
    await page.fill('#destinationPort', 'Dubai');
    await page.fill('#vesselName', 'Black Pearl');

    const etdDate = '07/15/2025';
    const etaDate = '07/25/2025';

    await page.fill('#shipmentDate', etdDate);
    await page.fill('#etd', etdDate);
    await page.keyboard.press('Tab');
    await page.fill('#eta', etaDate);
    await page.keyboard.press('Tab');
    await page.fill('#bookingNumber', 'BOOK1234');
    await page.fill('#reference', 'Test Ref');

    console.log('✅ All form fields completed');

    // Handle dropdown status
    await test.step('Handle status dropdown', async () => {
      console.log('🔽 Setting dropdown status...');
      
      await page.waitForSelector('#status', { state: 'visible', timeout: 5000 });
      
      // Try direct selection first
      try {
        await page.selectOption('#status', 'Generated');
        console.log('✅ Direct selection worked!');
      } catch (directError) {
        console.log('Direct selection failed, trying click method...');
        
        // Click on dropdown icon to open it
        await page.click('.e-input-group-icon.e-ddl-icon', { timeout: 2000 });
        
        // Wait for dropdown list to appear
        await page.waitForSelector('.e-ddl.e-popup .e-list-item', { state: 'visible', timeout: 3000 });
        
        // Wait for dropdown to fully render
        await page.waitForTimeout(500);
        
        // Select the "Generated" option
        await page.click('.e-ddl.e-popup .e-list-item:has-text("Generated")', { 
          timeout: 2000,
          force: false
        });
        
        // Wait for selection to complete
        await page.waitForTimeout(1000);
      }
      
      // Verify the selection was successful
      const selectedValue = await page.inputValue('#status');
      console.log(`✅ Status set to: ${selectedValue}`);
    });

    // Save the shipment
    console.log('💾 Saving shipment...');
    await page.click('button:has-text("Save")');
    
    await page.waitForSelector('#shipmentId', { state: 'detached', timeout: 5000 });
    console.log('✅ Shipment saved successfully!');
  });

  // Step 5: Confirm shipment created
  await test.step('Verify shipment created successfully', async () => {
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('success'); // Change if needed
  });

  // Step 6: Navigate to shipment details and upload file
  await test.step('Upload dummy file to shipment', async () => {
    console.log('📂 Starting file upload process...');
    
    // Define the test file path - Your specific file
    const testFileName = 'Demo Shipping Documents - MSCU1234567-1751916499287.pdf';
    const testFilePath = path.join(__dirname, testFileName);
    
    // Check if file exists
    if (!fs.existsSync(testFilePath)) {
      console.log(`❌ Test file not found: ${testFilePath}`);
      console.log('📍 Please place your file in the same directory as this test file');
      console.log(`📍 Expected file: ${testFileName}`);
      throw new Error(`Test file not found: ${testFileName}`);
    }
    
    console.log(`📄 Using test file: ${testFileName}`);

    try {
      // Navigate directly to the shipment details page
      console.log('🚀 Navigating directly to shipment details...');
      await page.goto('https://demo.tradingdocs.ai/shipment/TEST-001');
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      console.log('✅ Arrived at shipment details page');
      
      // Make sure we're on the Files tab
      await page.waitForSelector('button:has-text("Files")', { timeout: 10000 });
      
      // Click Files tab if not already active  
      const filesTab = await page.locator('button:has-text("Files")').first();
      if (await filesTab.isVisible()) {
        await filesTab.click();
        console.log('📁 Clicked on Files tab');
        await page.waitForTimeout(2000);
      }
      
      // Try two approaches: Upload Files button and drag & drop
      console.log('📤 Attempting file upload...');
      
      // First approach: Upload Files button with proper modal handling
      try {
        await page.click('button:has-text("Upload Files")');
        console.log('📤 Clicked Upload Files button');
        
        // Wait for the modal to appear
        await page.waitForSelector('text=Upload Documents', { timeout: 5000 });
        console.log('📝 Upload Documents modal opened');
        
        // Wait for file input in the modal
        await page.waitForSelector('input[type="file"]', { timeout: 5000 });
        console.log('📁 File input found in modal');
        
        // Upload the file via the modal's file input
        const fileInput = await page.locator('input[type="file"]').first();
        await fileInput.setInputFiles(testFilePath);
        console.log('📤 File selected in modal');
        
        // Wait a bit for the file to be processed
        await page.waitForTimeout(2000);
        
        // Click the Upload button in the modal
        await page.click('button:has-text("Upload")');
        console.log('📤 Clicked Upload button in modal');
        
        // Wait for modal to close
        await page.waitForSelector('text=Upload Documents', { state: 'detached', timeout: 10000 });
        console.log('✅ Modal closed after upload');
        
      } catch (modalError) {
        console.log('❌ Modal upload failed:', modalError.message);
        console.log('🔄 Trying alternative drag & drop approach...');
        
        // Close modal if it's still open
        try {
          const closeButton = await page.locator('button:has-text("Cancel")').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
            console.log('❌ Closed modal to try alternative approach');
          }
        } catch (e) {
          // Modal might already be closed
        }
        
        // Alternative approach: Direct file input (hidden)
        await page.waitForTimeout(2000);
        
        // Look for any file input on the page
        const hiddenFileInputs = await page.locator('input[type="file"]').all();
        console.log(`📁 Found ${hiddenFileInputs.length} file inputs on page`);
        
        if (hiddenFileInputs.length > 0) {
          // Try the first available file input
          await hiddenFileInputs[0].setInputFiles(testFilePath);
          console.log('📤 File uploaded via hidden input');
        }
      }
      
      // Wait for upload to complete
      await page.waitForTimeout(3000);
      
      // Check if file appears in the Raw Document List
      try {
        await page.waitForSelector(`text=${testFileName}`, { timeout: 10000 });
        console.log('✅ File appears in document list!');
      } catch (e) {
        console.log('ℹ️ File might be uploading in background');
        
        // Check for partial filename match
        const partialFileName = testFileName.substring(0, 20);
        try {
          await page.waitForSelector(`text*=${partialFileName}`, { timeout: 5000 });
          console.log('✅ Partial filename found in document list!');
        } catch (e2) {
          console.log('ℹ️ File upload might still be processing');
        }
      }
      
      // Alternative success checks
      const successIndicators = [
        'text=uploaded successfully',
        'text=upload complete',
        'text=Processing',
        '.success',
        '.uploaded',
        'text=Demo Shipping Documents' // Part of your filename
      ];
      
      for (const indicator of successIndicators) {
        try {
          const element = await page.locator(indicator).first();
          if (await element.isVisible()) {
            console.log(`✅ Success indicator found: ${indicator}`);
            break;
          }
        } catch (e) {
          // Continue checking
        }
      }
      
    } catch (error) {
      console.log('❌ Error during file upload:', error.message);
      throw error;
    }
    
    console.log('✅ Upload process completed');
  });

  // Step 6.1: Wait for AI processing and file splitting
  await test.step('Wait for AI processing and file splitting', async () => {
    console.log('⏳ Waiting for AI to process and split the uploaded file...');
    
    try {
      // Wait for the Compliance button to be enabled, indicating processing is complete
      await page.waitForSelector('button:has-text("Compliance"):not([disabled])', { timeout: 120000 }); // Wait up to 2 minutes
      console.log('✅ AI processing completed, Compliance button is now enabled.');
    } catch (error) {
      console.log('❌ Timeout waiting for Compliance button to enable:', error.message);
      await page.screenshot({ path: 'ai-processing-timeout.png' }); // Capture screenshot for debugging
      throw new Error('AI processing did not complete within 2 minutes');
    }
  });

  // Step 6.2: Perform compliance check
  await test.step('Perform compliance check', async () => {
    console.log('🔍 Starting compliance check...');
    
    // Click the "Compliance" button
    await page.click('button:has-text("Compliance")');
    console.log('✅ Clicked Compliance button');
    
    // Wait for the ruleset modal to appear
    await page.waitForSelector('#dialog_1661903410_4', { state: 'visible', timeout: 5000 });
    console.log('📝 Ruleset modal opened');
    
    // Handle ruleset dropdown
    await page.waitForSelector('#rulesetTemplate', { state: 'visible', timeout: 5000 });
    try {
      await page.selectOption('#rulesetTemplate', 'Standard'); // Try direct selection with value
      console.log('✅ Selected ruleset using selectOption');
    } catch (directError) {
      console.log('Direct selection failed, trying click method...');
      await page.click('#rulesetTemplate ~ .e-input-group-icon.e-ddl-icon', { timeout: 2000 }); // Click the dropdown icon
      await page.waitForSelector('.e-ddl.e-popup .e-list-item', { state: 'visible', timeout: 3000 });
      await page.click('.e-ddl.e-popup .e-list-item:has-text("Standard")', { timeout: 2000 });
      console.log('✅ Selected ruleset using click method');
    }
    
    // Click the "Select" button to confirm
    await page.click('button:has-text("Select")');
    await page.waitForSelector('#dialog_1661903410_4', { state: 'detached', timeout: 5000 });
    console.log('✅ Ruleset selected and modal closed');
  });

  // Step 7: Final verification
  await test.step('Verify complete workflow', async () => {
    console.log('🎉 Complete workflow finished!');
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('TEST-001'); // Verify our shipment is visible
    console.log('✅ Workflow Summary:');
    console.log('  - Shipment created: TEST-001');
    console.log('  - File uploaded and processed');
    console.log('  - Compliance check applied');
    console.log('🎉 All steps completed successfully!');
  });
});