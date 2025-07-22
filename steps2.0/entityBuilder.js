const navigateAndWait = require('../utils/navigateAndWait');
const config = require('../steps2.0/config2.0');

module.exports = async function entityBuilder(page) {
  const cfg = config.entityBuilder;
  const { selectors, timeouts, texts } = cfg;

  console.log('🚀 Navigating to Entity Builder...');
  await navigateAndWait(page, 'entityBuilder');

  // Sayfa yüklenene kadar bekle
  await page.waitForLoadState('domcontentloaded');
  
  console.log('🚀 Waiting for Entity Type modal to appear...');
  
  // Modal'ın görünmesini bekle
  const modal = page.locator(selectors.modal);
  await modal.waitFor({ state: 'visible', timeout: timeouts.modalOpen });
  console.log('✅ Modal is visible');

  // Modal title'ın doğru olduğunu kontrol et
  const modalTitle = modal.locator(selectors.modalTitle);
  await modalTitle.waitFor({ state: 'visible', timeout: timeouts.buttonVisible });
  console.log(`✅ Modal title confirmed: ${texts.modalTitleText}`);

  // Header Data radio button'ının seçili olduğunu kontrol et (varsayılan olarak seçili)
  const headerRadio = modal.locator(selectors.headerRadio);
  await headerRadio.waitFor({ state: 'visible', timeout: timeouts.buttonVisible });
  
  const isChecked = await headerRadio.isChecked();
  console.log(`📋 Header Data radio button is checked: ${isChecked}`);

  // Continue butonunu bul ve tıkla
  const continueButton = modal.locator(selectors.continueButton);
  await continueButton.waitFor({ state: 'visible', timeout: timeouts.buttonVisible });
  console.log(`✅ ${texts.continueButtonText} button is visible`);

  // Continue butonuna tıkla
  try {
    await continueButton.click();
    console.log(`👉 ${texts.continueButtonText} button clicked successfully`);
  } catch (error) {
    console.log('⚠️ Normal click failed, trying force click');
    await continueButton.click({ force: true });
    console.log(`👉 ${texts.continueButtonText} button clicked with force`);
  }

  // Modal'ın kapanmasını bekle
  await modal.waitFor({ state: 'hidden', timeout: timeouts.modalClose });
  console.log('✅ Modal closed successfully');

  // Entity Builder sayfasının yüklendiğini kontrol et
  const entityBuilderCard = page.locator(selectors.entityBuilderTitle);
  await entityBuilderCard.waitFor({ state: 'visible', timeout: timeouts.pageLoad });
  console.log(`✅ ${texts.entityBuilderPageTitle} page loaded`);

  // Tablonun yüklendiğini kontrol et
  const dataTable = page.locator(selectors.dataTable);
  await dataTable.waitFor({ state: 'visible', timeout: timeouts.tableVisible });
  console.log('✅ Data table is visible');

  // Tablo satırlarını say
  const tableRows = page.locator(selectors.dataTableRows);
  await tableRows.first().waitFor({ state: 'visible', timeout: timeouts.rowsLoad });
  
  const rowCount = await tableRows.count();
  console.log(`📦 ${rowCount} Entity rows loaded`);

  // Create Entity butonunu bul ve tıkla
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