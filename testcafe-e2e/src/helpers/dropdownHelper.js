// src/helpers/dropdownHelper.js
import { Selector, t } from 'testcafe';

export async function selectDropdown(labelSelector, optionText) {
  const dropdownIcon = Selector(labelSelector).find('.e-input-group-icon.e-ddl-icon');
  const popup = Selector('.e-popup-open ul.e-ul');
  const option = popup.find('.e-list-item').withText(optionText);

  await t
    .click(dropdownIcon)
    .expect(popup.exists).ok({ timeout: 5000 })
    .click(option)
    .expect(popup.exists).notOk({ timeout: 5000 });
}

export async function selectDropdownWithin(scope, iconSelector, optionText) {
  const dropdownIcon = scope.find(iconSelector);
  const popup = Selector('.e-popup-open ul.e-ul'); // Syncfusion standard
  const option = popup.find('.e-list-item').withText(optionText);

  await t
    .hover(dropdownIcon) // Helps with flaky UI
    .click(dropdownIcon)
    .expect(popup.exists).ok('❌ Dropdown popup not opened', { timeout: 5000 })
    .expect(option.exists).ok(`❌ Option "${optionText}" not found`, { timeout: 5000 })
    .click(option)
    .expect(popup.exists).notOk('❌ Dropdown did not close after selection', { timeout: 5000 });

  console.log(`✅ Selected dropdown value: ${optionText}`);
}
