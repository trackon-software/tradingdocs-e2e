import { Selector, t } from 'testcafe';
import config from '../config/extractorConfig.js';
import { selectDropdownWithin } from '../helpers/dropdownHelper.js';

export async function addExtractor() {
  const data = config.extractor;

  // ✅ Navigate to Extractors page
  await t.navigateTo('https://demo.tradingdocs.ai/extractors');
  const extractorPageTitle = Selector('h3.page-title').withText(/Extractors/i);
  await t.expect(extractorPageTitle.exists).ok('❌ Not on Extractors page');
  console.log('✅ Navigated to Extractors page');

  // ➕ Click Add Extractor
  const addBtn = Selector('button').withText('Add');
  await t.expect(addBtn.exists).ok('❌ Add button not found');
  await t.click(addBtn);
  console.log('➕ Clicked Add button');

  // 📝 Fill form fields
  await t.typeText('#extractorName', data.name);
  await t.typeText('#description', data.description);
  await selectDropdownWithin(Selector('form'), 'div.e-control-wrapper .e-input-group-icon', data.isActive);

  // 📦 Add Entity
  const entityToolbar = Selector('.e-toolbar');
  const addEntityBtn = entityToolbar.find('button').withText('Add');
  await t.expect(addEntityBtn.exists).ok('❌ Add Entity button not found');
  await t.expect(addEntityBtn.visible).ok('❌ Add Entity button not visible');
  await t.click(addEntityBtn);
  console.log('📦 Clicked Add Entity button');

  // 🔳 Fill Modal Form (Add Entities)
  const modal = Selector('.e-dialog.e-popup-open')
    .withText('Add Entities')
    .filterVisible()
    .withAttribute('aria-label', 'dialog');
  const modalForm = modal.find('form');

  await t.expect(modal.exists).ok('❌ Add Entities modal did not appear');
  await t.expect(modal.visible).ok('❌ Add Entities modal not visible');

  await t.typeText(modalForm.find('input#itemType'), 'Sample Item');
  await selectDropdownWithin(modal, '#isRepeating ~ .e-input-group-icon', 'false');
  await selectDropdownWithin(modal, '#entityName ~ .e-input-group-icon', 'PO');
  await t.typeText(modalForm.find('textarea#specialInstructions'), 'Just test stuff');
  await t.typeText(modalForm.find('input#itemIdentifier'), 'ID123');
  await t.typeText(modalForm.find('input#batchSize'), '20');
  await t.typeText(modalForm.find('input#itemPatterns'), 'abc|def');

  const saveModalBtn = modal.find('div.e-footer-content button.submit-button');
  await t
    .expect(saveModalBtn.exists).ok('❌ Modal Save button not found')
    .expect(saveModalBtn.visible).ok('❌ Modal Save button not visible')
    .hover(saveModalBtn)
    .wait(250)
    .click(saveModalBtn, { speed: 0.75 });

  console.log('✅ Modal entity saved');

  // 💾 Save Extractor (Add Extractor Modal)
  const extractorModal = Selector('.e-dialog.e-popup-open')
    .withText('Add Extractor')
    .filterVisible()
    .withAttribute('aria-label', 'dialog');
  const saveBtn = extractorModal.find('div.e-footer-content button.submit-button');

  await t.expect(saveBtn.exists).ok('❌ Extractor Save button not found');
  await t.expect(saveBtn.visible).ok('❌ Extractor Save button not visible');
  await t.click(saveBtn);
  console.log('💾 Clicked Save');

  // 🔍 Final assertion
  const extractorRow = Selector('tr').withText(data.name);
  await t.expect(extractorRow.exists).ok(`❌ Extractor "${data.name}" not found after creation`, { timeout: 10000 });
  console.log(`✅ Extractor "${data.name}" created successfully`);
}
