const { expect } = require('@playwright/test');

async function createExtractor(page) {
  // Step 1: Go to Extractors page
  await page.goto('https://demo.tradingdocs.ai/extractors');
  console.log('🚀 Navigated to Extractors page');

  // Step 2: Confirm page loaded
  const title = page.locator('h3.page-title', { hasText: 'Extractors' });
  await expect(title).toBeVisible({ timeout: 10000 });
  console.log('✅ Extractors page loaded');
  
  // Extra wait for page to fully load
  await page.waitForTimeout(1000);

  // Step 3: Click "Add" button
  const addButton = page.locator('button.e-tbar-btn').filter({ hasText: 'Add' });
  await addButton.waitFor({ state: 'visible', timeout: 5000 });
  await addButton.click();
  console.log('➕ Clicked Add button');
  
  // Wait for form to appear
  await page.waitForTimeout(1500);

  // Step 4: Fill "Extractor Name"
  const nameInput = page.locator('input#extractorName');
  await nameInput.waitFor({ state: 'visible', timeout: 10000 });
  await nameInput.clear(); // Clear any existing text
  await nameInput.fill('Test Extractor');
  console.log('✍️ Filled Extractor Name');
  
  // Wait and verify the input was filled
  await page.waitForTimeout(1000);
  const nameValue = await nameInput.inputValue();
  console.log(`📋 Name input value: "${nameValue}"`);

  // Step 5: Fill "Description"
  const descriptionInput = page.locator('input#description');
  await descriptionInput.waitFor({ state: 'visible', timeout: 5000 });
  await descriptionInput.clear(); // Clear any existing text
  await descriptionInput.fill('This is a test extractor.');
  console.log('📝 Filled Description');
  
  // Wait and verify the description was filled
  await page.waitForTimeout(1000);
  const descValue = await descriptionInput.inputValue();
  console.log(`📋 Description input value: "${descValue}"`);

  // Step 6: Set "Active" dropdown to "Y"
  console.log('🔍 Looking for Active dropdown...');
  
  // Wait for the dropdown container to be ready
  const dropdownContainer = page.locator('div.e-control-wrapper').filter({ has: page.locator('input#isActive') });
  await dropdownContainer.waitFor({ state: 'visible', timeout: 5000 });
  console.log('📦 Dropdown container found');
  
  // Click on the dropdown icon to open it
  const dropdownIcon = dropdownContainer.locator('.e-ddl-icon');
  await dropdownIcon.waitFor({ state: 'visible', timeout: 5000 });
  await dropdownIcon.click();
  console.log('🎯 Clicked dropdown icon');
  
  // Wait for dropdown to open
  await page.waitForTimeout(1000);
  
  // Wait for dropdown list to appear and select "Y"
  const dropdownList = page.locator('.e-list-item[data-value="Y"]');
  await dropdownList.waitFor({ state: 'visible', timeout: 5000 });
  await dropdownList.click();
  console.log('✅ Selected "Y" in Active dropdown');
  
  // Wait for dropdown to close and verify selection
  await page.waitForTimeout(1000);
  const selectedValue = await page.locator('input#isActive').inputValue();
  console.log(`📋 Active dropdown value: "${selectedValue}"`);

  // Step 7: Click the second "Add" button (after form is filled)
  const secondAddButton = page.locator('button.e-tbar-btn').filter({ hasText: 'Add' }).and(page.locator('[aria-disabled="false"]'));
  await secondAddButton.waitFor({ state: 'visible', timeout: 5000 });
  await secondAddButton.click();
  console.log('➕ Clicked second Add button');
  
  // Wait for "Add Entities" modal to appear
  await page.waitForTimeout(1000);
  
  // Step 8: Wait for the modal dialog to be visible
  const modal = page.locator('.e-dialog').filter({ hasText: 'Add Entities' });
  await modal.waitFor({ state: 'visible', timeout: 5000 });
  console.log('🔲 Add Entities modal opened');
  
  // Step 9: Fill Item Type
  const itemTypeInput = page.locator('input#itemType');
  await itemTypeInput.waitFor({ state: 'visible', timeout: 5000 });
  await itemTypeInput.fill('Test Item Type');
  console.log('🏷️ Filled Item Type');
  await page.waitForTimeout(500);
  
  // Step 10: Set "Is Repeating" dropdown
  const isRepeatingContainer = page.locator('div.e-control-wrapper').filter({ has: page.locator('input#isRepeating') });
  const isRepeatingIcon = isRepeatingContainer.locator('.e-ddl-icon');
  await isRepeatingIcon.click();
  console.log('🔄 Clicked Is Repeating dropdown');
  await page.waitForTimeout(500);
  
  // Select "false" or "true" for Is Repeating (assuming we want "false")
  const isRepeatingOption = page.locator('.e-list-item[data-value="false"]');
  await isRepeatingOption.waitFor({ state: 'visible', timeout: 5000 });
  await isRepeatingOption.click();
  console.log('✅ Selected "false" for Is Repeating');
  await page.waitForTimeout(500);
  
  // Step 11: Fill Entity Name
  const entityNameInput = page.locator('input#entityName');
  await entityNameInput.fill('Test Entity');
  console.log('🏢 Filled Entity Name');
  await page.waitForTimeout(500);
  
  // Step 12: Fill Special Instructions
  const specialInstructionsInput = page.locator('textarea#specialInstructions');
  await specialInstructionsInput.fill('Test special instructions');
  console.log('📋 Filled Special Instructions');
  await page.waitForTimeout(500);
  
  // Step 13: Fill Item Identifier
  const itemIdentifierInput = page.locator('input#itemIdentifier');
  await itemIdentifierInput.fill('TEST_ID');
  console.log('🆔 Filled Item Identifier');
  await page.waitForTimeout(500);
  
  // Step 14: Fill Batch Size
  const batchSizeInput = page.locator('input#batchSize');
  await batchSizeInput.fill('10');
  console.log('📊 Filled Batch Size');
  await page.waitForTimeout(500);
  
  // Step 15: Fill Item Patterns
  const itemPatternsInput = page.locator('input#itemPatterns');
  await itemPatternsInput.fill('pattern1,pattern2');
  console.log('🔍 Filled Item Patterns');
  await page.waitForTimeout(500);
  
  // Step 16: Click Save button in the modal
  const saveButton = modal.locator('button.submit-button').filter({ hasText: 'Save' });
  await saveButton.click();
  console.log('💾 Clicked Save button in modal');
  
  // Wait for modal to close
  await page.waitForTimeout(1000);
  
  // Step 17: Click Save button on the main form
  const mainSaveButton = page.locator('button.submit-button').filter({ hasText: 'Save' }).first();
  await mainSaveButton.waitFor({ state: 'visible', timeout: 5000 });
  await mainSaveButton.click();
  console.log('💾 Clicked Save button on main form');
  await page.waitForTimeout(3000);

  console.log('🎉 Extractor and Entity created successfully');
}

module.exports = createExtractor;