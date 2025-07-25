async function selectDropdownOption(page, iconSelector, optionText, options = {}) {
  const openTimeout = options.openTimeout || 8000;
  const optionTimeout = options.optionTimeout || 8000;
  const popupSelector = options.popupSelector || '.e-popup-open ul.e-ul';

  try {
    console.log(`🔽 Opening dropdown with selector: ${iconSelector}`);
    
    // Wait for the dropdown icon to be visible and clickable
    await page.waitForSelector(iconSelector, { state: 'visible', timeout: openTimeout });
    await page.waitForTimeout(500); // Give time for any previous animations
    
    // Click the dropdown icon
    await page.click(iconSelector);

    console.log(`⏳ Waiting for dropdown popup: ${popupSelector}`);
    await page.waitForSelector(popupSelector, { state: 'visible', timeout: openTimeout });
    
    // Wait for dropdown to fully render
    await page.waitForTimeout(1000);

    // Construct the option selector
    const optionSelector = `${popupSelector} .e-list-item:has-text("${optionText}")`;
    console.log(`⏳ Waiting for option: ${optionSelector}`);

    // Wait for the specific option to be visible
    await page.waitForSelector(optionSelector, { state: 'visible', timeout: optionTimeout });
    
    // Small delay before clicking the option
    await page.waitForTimeout(300);
    
    // Click the option
    await page.click(optionSelector);

    // Wait for dropdown to close
    await page.waitForTimeout(500);
    
    console.log(`✅ Selected option: ${optionText}`);
    
    // Verify the selection was successful by checking if the dropdown closed
    try {
      await page.waitForSelector(popupSelector, { state: 'hidden', timeout: 2000 });
      console.log(`✅ Dropdown closed successfully`);
    } catch (e) {
      console.log(`⚠️ Dropdown might still be open, continuing...`);
    }
    
  } catch (e) {
    console.error(`❌ Failed to select dropdown option: ${optionText}`, e.message);
    
    // Try to debug what options are available
    try {
      const availableOptions = await page.$$eval(`${popupSelector} .e-list-item`, elements => 
        elements.map(el => el.textContent.trim())
      );
      console.log(`Available options: ${availableOptions.join(', ')}`);
    } catch (debugError) {
      console.log(`Could not retrieve available options`);
    }
    
    throw e;
  }
}

module.exports = { selectDropdownOption };