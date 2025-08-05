// src/steps/updateExtractor.js
import { Selector, t } from 'testcafe';
import config from '../config/extractorConfig.js';
import { selectDropdownWithin } from '../helpers/dropdownHelper.js';

export async function updateExtractor() {
  const { name: originalName, description, isActive } = config.extractor;

  // ✅ Ensure we’re on the Extractors page
  const extractorPageTitle = Selector('h3.page-title').withText(/Extractors/i);
  await t.expect(extractorPageTitle.exists).ok('❌ Not on Extractors page');

  // 🔍 Locate extractor row by name
  const extractorRow = Selector('tr').withText(originalName);
  await t.expect(extractorRow.exists).ok(`❌ Could not find extractor row: "${originalName}"`);
  console.log(`🔍 Found row for: ${originalName}`);

  // ✅ Select the row
  await t.click(extractorRow);
  console.log(`✅ Selected extractor row: ${originalName}`);

  // ✏️ Use global toolbar Edit button
  const editBtn = Selector('button').withAttribute('aria-label', 'Edit');
  await t.expect(editBtn.exists).ok('❌ Global Edit button not found');
  await t.click(editBtn);
  console.log('✏️ Clicked Edit button');

  // 🧾 Edit Modal should appear
  const modal = Selector('.e-dialog.e-popup-open');
  const modalForm = modal.find('form');

  await t.expect(modal.exists).ok('❌ Edit modal did not appear');
  await t.expect(modal.visible).ok('❌ Edit modal not visible');

  // 📝 Update description and dropdown
  await t.selectText(modalForm.find('input#description')).pressKey('delete');
  await t.typeText(modalForm.find('input#description'), `${description} UPDATED`, { paste: true });
  await selectDropdownWithin(modal, '#isActive ~ .e-input-group-icon', isActive);

  // 💾 Save changes
  const saveBtn = modal.find('div.e-footer-content button.submit-button');
  await t.expect(saveBtn.exists).ok('❌ Save button not found');
  await t.expect(saveBtn.visible).ok('❌ Save button not visible');
  await t.click(saveBtn);
  console.log('💾 Saved extractor changes');

  // ✅ Confirm update reflected
  await t.expect(extractorRow.find('td').withText(`${description} UPDATED`).exists)
    .ok('❌ Updated description not found in row');
  console.log('✅ Extractor update confirmed');
}
