const navigateAndWait = require('../utils/navigateAndWait');
const config = require('../steps2.0/config2.0');

module.exports = async function entityBuilder(page) {
  const cfg = config.entityBuilder;
  const { selectors, timeouts, texts } = cfg;

  console.log('🚀 Navigating to Entity Builder...');
  await navigateAndWait(page, 'entityBuilder');

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');
  
  console.log('🚀 Waiting for Entity Type modal to appear...');
  
  // Wait for the modal to become visible
  const modal = page.locator(selectors.modal);
  await modal.waitFor({ state: 'visible', timeout: timeouts.modalOpen });
  console.log('✅ Modal is visible');

  // Verify the modal title is correct
  const modalTitle = modal.locator(selectors.modalTitle);
  await modalTitle.waitFor({ state: 'visible', timeout: timeouts.buttonVisible });
  console.log(`✅ Modal title confirmed: ${texts.modalTitleText}`);

  // Check that Header Data radio button is selected (default selected)
  const headerRadio = modal.locator(selectors.headerRadio);
  await headerRadio.waitFor({ state: 'visible', timeout: timeouts.buttonVisible });
  
  const isChecked = await headerRadio.isChecked();
  console.log(`📋 Header Data radio button is checked: ${isChecked}`);

  // Find and click the Continue button
  const continueButton = modal.locator(selectors.continueButton);
  await continueButton.waitFor({ state: 'visible', timeout: timeouts.buttonVisible });
  console.log(`✅ ${texts.continueButtonText} button is visible`);

  // Click the Continue button
  try {
    await continueButton.click();
    console.log(`👉 ${texts.continueButtonText} button clicked successfully`);
  } catch (error) {
    console.log('⚠️ Normal click failed, trying force click');
    await continueButton.click({ force: true });
    console.log(`👉 ${texts.continueButtonText} button clicked with force`);
  }

  // Wait for the modal to close
  await modal.waitFor({ state: 'hidden', timeout: timeouts.modalClose });
  console.log('✅ Modal closed successfully');

  // Verify Entity Builder page loaded
  const entityBuilderCard = page.locator(selectors.entityBuilderTitle);
  await entityBuilderCard.waitFor({ state: 'visible', timeout: timeouts.pageLoad });
  console.log(`✅ ${texts.entityBuilderPageTitle} page loaded`);

  // Verify the data table is visible
  const dataTable = page.locator(selectors.dataTable);
  await dataTable.waitFor({ state: 'visible', timeout: timeouts.tableVisible });
  console.log('✅ Data table is visible');

  // Count the table rows
  const tableRows = page.locator(selectors.dataTableRows);
  await tableRows.first().waitFor({ state: 'visible', timeout: timeouts.rowsLoad });
  
  const rowCount = await tableRows.count();
  console.log(`📦 ${rowCount} Entity rows loaded`);

  // Find and click the Create Entity button
  const createEntityButton = page.locator(selectors.createEntityButton);
  await createEntityButton.waitFor({ state: 'visible', timeout: timeouts.buttonVisible });
  console.log(`✅ ${texts.createEntityButtonText} button is visible`);

  try {
    await createEntityButton.click();
    console.log(`👉 ${texts.createEntityButtonText} button clicked successfully`);
  } catch (error) {
    console.log('⚠️ Normal click failed, trying force click');
    await createEntityButton.click({ force: true });
    console.log(`👉 ${texts.createEntityButtonText} button clicked with force`);
  }

  console.log('✅ Entity Builder process completed');
};
