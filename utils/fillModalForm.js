const config = require('./config2.0');
const { selectDropdownOption } = require('../utils/dropdownHandler');

async function fillModalForm(page) {
  const { data, selectors, timeouts } = config.extractors;

  // Modal form locator (form ID’sine göre, bu örnek HTML’deki form ID'si)
  const modalForm = page.locator('form#grid_1781639624_2EditForm');

  // Modal görünür mü bekle (modal görünürlüğü genelde wrapper veya form’un görünmesiyle kontrol edilir)
  await modalForm.waitFor({ state: 'visible', timeout: timeouts.modal });

  console.log('📦 Modal form is visible');

  // Input doldur: input#itemType
  await modalForm.locator('input#itemType').fill(data.itemType || '');
  console.log(`✍️ Filled Item Type: ${data.itemType || ''}`);

  // Dropdown: Is Repeating
  await selectDropdownOption(
    modalForm,
    'div#isRepeating .e-input-group-icon.e-ddl-icon',
    data.isRepeating,
    { openTimeout: timeouts.dropdown, optionTimeout: timeouts.dropdown }
  );

  // Dropdown: Entity Name
  await selectDropdownOption(
    modalForm,
    'div#entityName .e-input-group-icon.e-ddl-icon',
    data.entityName,
    { openTimeout: timeouts.dropdown, optionTimeout: timeouts.dropdown }
  );

  // Textarea: specialInstructions
  await modalForm.locator('textarea#specialInstructions').fill(data.specialInstructions || '');
  console.log(`✍️ Filled Special Instructions: ${data.specialInstructions || ''}`);

  // Input: itemIdentifier
  await modalForm.locator('input#itemIdentifier').fill(data.itemIdentifier || '');
  console.log(`✍️ Filled Item Identifier: ${data.itemIdentifier || ''}`);

  // Input: batchSize (numeric input)
  await modalForm.locator('input#batchSize').fill(data.batchSize?.toString() || '0');
  console.log(`✍️ Filled Batch Size: ${data.batchSize || 0}`);

  // Input: itemPatterns
  await modalForm.locator('input#itemPatterns').fill(data.itemPatterns || '');
  console.log(`✍️ Filled Item Patterns: ${data.itemPatterns || ''}`);

  // Modal Save button (footerdaki buton)
  const saveButton = page.locator('.e-footer-content button.submit-button');
  await saveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await saveButton.click();

  console.log('💾 Clicked Save button on modal form');
}

module.exports = fillModalForm;
