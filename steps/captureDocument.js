const { expect } = require('@playwright/test');

async function captureDocument(page) {
  const popoverSelector = '#driver-popover-content';
  const closeBtnSelector = `${popoverSelector} .driver-popover-close-btn`;

  // Step 0: Go to shipment page
  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-002');
  console.log('🚀 Navigated to shipment page');
  
  // Add URL verification to catch redirects
  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);
  if (!currentUrl.includes('/shipment/TEST-002')) {
    throw new Error(`❌ Unexpected redirect! Expected shipment page, got: ${currentUrl}`);
  }

  // Wait for rows to appear (up to 10 seconds)
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

  // Step 1: Close popover if it appears
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

  // Step 2: CLEAR ANY EXISTING SELECTIONS FIRST - BUT CAREFULLY
  try {
    console.log('🧹 Clearing any existing selections...');
    
    // Check URL before any clicks
    let currentUrl = page.url();
    console.log(`📍 URL before clearing selections: ${currentUrl}`);
    
    // Instead of clicking body, click on table header (safer)
    const tableHeader = page.locator('thead tr').first();
    if (await tableHeader.isVisible()) {
      await tableHeader.click({ position: { x: 50, y: 10 } });
      await page.waitForTimeout(500);
    }
    
    // Check URL after click to detect unwanted redirects
    currentUrl = page.url();
    console.log(`📍 URL after clearing selections: ${currentUrl}`);
    if (!currentUrl.includes('/shipment/TEST-002')) {
      throw new Error(`❌ Redirect detected after clearing selections! URL: ${currentUrl}`);
    }
    
    // Verify no rows are selected
    const selectedRows = await page.locator('tr.e-row.e-selectionbackground, tr.e-row.e-active, tr.e-row[aria-selected="true"]').count();
    console.log(`ℹ️ Selected rows after clearing: ${selectedRows}`);
    
  } catch (err) {
    console.log(`⚠️ Warning during selection clearing: ${err.message}`);
    // Re-throw if it's a redirect error
    if (err.message.includes('Redirect detected')) {
      throw err;
    }
  }

  // Step 3: Select ONLY the first row with precise targeting
  try {
    const firstRow = rowLocator.nth(1);
    await firstRow.scrollIntoViewIfNeeded();
    
    // Check URL before row interaction
    let currentUrl = page.url();
    console.log(`📍 URL before row selection: ${currentUrl}`);
    
    // Get the specific document name for logging
    const documentName = await firstRow.locator('[data-field="documentName"]').textContent();
    console.log(`🎯 Targeting document: "${documentName}"`);
    
    // Use checkbox selection instead of row clicking to avoid triggers
    const checkbox = firstRow.locator('input.e-checkselect');
    if (await checkbox.isVisible()) {
      console.log('📋 Using checkbox selection method...');
      await checkbox.check();
      await page.waitForTimeout(500);
    } else {
      console.log('🖱️ Checkbox not found, using careful row click...');
      // Click on document name cell specifically (safer than whole row)
      const documentCell = firstRow.locator('[data-field="documentName"]');
      await documentCell.click();
      await page.waitForTimeout(500);
    }
    
    // Check URL after selection
    currentUrl = page.url();
    console.log(`📍 URL after row selection: ${currentUrl}`);
    if (!currentUrl.includes('/shipment/TEST-002')) {
      throw new Error(`❌ Redirect detected after row selection! URL: ${currentUrl}`);
    }
    
    console.log('✅ First row selected');
    await page.waitForTimeout(1000);
    
  } catch (err) {
    throw new Error(`❌ Failed to select first row: ${err.message}`);
  }

  // Step 4: Verify selection count before capture
  try {
    const selectedCount = await page.locator('tr.e-row.e-selectionbackground, tr.e-row.e-active, tr.e-row[aria-selected="true"]').count();
    console.log(`📊 Final selection count: ${selectedCount}`);
    
    if (selectedCount !== 1) {
      throw new Error(`Expected 1 selected row, but found ${selectedCount}. Aborting capture.`);
    }
    
  } catch (err) {
    throw new Error(`❌ Selection verification failed: ${err.message}`);
  }

  // Step 5: Pause before capture
  console.log('⏸️ Pausing for 5 seconds so you can verify selection before clicking Capture...');
  await page.waitForTimeout(5000);

  // Step 6: Click Capture button
  try {
    const captureBtn = page.locator('#captureBtn');
    await captureBtn.waitFor({ state: 'visible', timeout: 7000 });

    const isDisabled = await captureBtn.evaluate(btn => btn.disabled);
    if (isDisabled) {
      throw new Error('Capture button is disabled, cannot click.');
    }

    await captureBtn.click();
    console.log('✅ Capture button clicked');

    // Post-click delay to observe UI result
    console.log('⏸️ Waiting 5 seconds after clicking Capture to observe UI...');
    await page.waitForTimeout(5000);

  } catch (err) {
    throw new Error(`Failed to click Capture button: ${err.message}`);
  }
}

module.exports = captureDocument;