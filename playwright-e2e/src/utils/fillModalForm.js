const config = require('../steps2.0/config2.0');
const { selectDropdownOption } = require('../utils/dropdownHandler');

/**
 * Fill modal form inside the Add Entity modal for Extractor.
 * Accepts either a Playwright `page` or a specific modal form `locator`.
 */
async function fillModalForm(scope) {
  const { data, timeouts } = config.extractors;

  const isPage = !!scope.waitForSelector;
  const modalForm = isPage
    ? scope.locator('.e-dialog.e-popup-open form.e-formvalidator')
    : scope;

  await modalForm.waitFor({ state: 'attached', timeout: timeouts.modal });
  await modalForm.waitFor({ state: 'visible', timeout: timeouts.modal });
  console.log('📦 Modal form is visible');

  const fillInput = async (selector, value) => {
    const input = modalForm.locator(selector);
    await input.waitFor({ state: 'visible', timeout: 3000 });
    await input.fill(value ?? '');
    console.log(`✍️ Filled ${selector} → ${value}`);
  };

  await fillInput('input#itemType', data.itemType);

  await selectDropdownOption(modalForm, '#isRepeating ~ .e-input-group-icon.e-ddl-icon', data.isRepeating, {
    openTimeout: timeouts.dropdown,
    optionTimeout: timeouts.dropdown,
    direct: true
  });

  await selectDropdownOption(modalForm, '#entityName ~ .e-input-group-icon.e-ddl-icon', data.entityName, {
    openTimeout: timeouts.dropdown,
    optionTimeout: timeouts.dropdown,
    direct: true
  });

  await fillInput('textarea#specialInstructions', data.specialInstructions);
  await fillInput('input#itemIdentifier', data.itemIdentifier);
  await fillInput('input#batchSize', data.batchSize?.toString());
  await fillInput('input#itemPatterns', data.itemPatterns);

  const saveButton = modalForm.locator('button:has-text("Save")');
  await saveButton.waitFor({ state: 'visible', timeout: timeouts.input });
  await saveButton.click();
  console.log('💾 Clicked Save button on modal form');
}

module.exports = fillModalForm;
