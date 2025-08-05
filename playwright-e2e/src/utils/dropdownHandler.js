async function selectDropdownOption(scope, iconSelector, optionText, options = {}) {
  const openTimeout = options.openTimeout || 8000;
  const optionTimeout = options.optionTimeout || 8000;
  const popupSelector = options.popupSelector || '.e-popup-open ul.e-ul';
  const direct = options.direct || false;

  const isPage = !!scope.waitForSelector;

  const waitFor = async (selector, state, timeout) =>
    isPage
      ? scope.waitForSelector(selector, { state, timeout })
      : scope.locator(selector).waitFor({ state, timeout });

  const click = async (selector) =>
    isPage
      ? scope.click(selector)
      : scope.locator(selector).click();

  const locator = (selector) =>
    isPage ? scope.locator(selector) : scope.locator(selector);

  try {
    if (direct) {
      const idSelector = iconSelector.split('~')[0].trim(); // '#isRepeating'
      const inputSelector = `input${idSelector}`;
      const optionSelector = `.e-popup-open .e-list-item:has-text("${optionText}")`;

      console.log(`🎯 [direct] Clicking input: ${inputSelector}`);
      await waitFor(inputSelector, 'visible', openTimeout);
      await click(inputSelector);

      console.log(`⏳ Waiting for direct dropdown item: ${optionSelector}`);
      await waitFor(optionSelector, 'visible', optionTimeout);
      await click(optionSelector);

      console.log(`✅ [direct] Selected option: ${optionText}`);
      return;
    }

    console.log(`🔽 Opening dropdown with selector: ${iconSelector}`);
    await waitFor(iconSelector, 'visible', openTimeout);
    await scope.waitForTimeout?.(500); // Only works on Page

    await click(iconSelector);
    console.log(`⏳ Waiting for dropdown popup: ${popupSelector}`);
    await waitFor(popupSelector, 'visible', openTimeout);
    await scope.waitForTimeout?.(1000);

    const optionSelector = `${popupSelector} .e-list-item:has-text("${optionText}")`;
    console.log(`⏳ Waiting for option: ${optionSelector}`);
    await waitFor(optionSelector, 'visible', optionTimeout);
    await scope.waitForTimeout?.(300);

    await click(optionSelector);

    try {
      await waitFor(popupSelector, 'hidden', 2000);
      console.log(`✅ Dropdown closed successfully`);
    } catch {
      console.log(`⚠️ Dropdown might still be open`);
    }

    console.log(`✅ Selected option: ${optionText}`);
  } catch (e) {
    console.error(`❌ Failed to select dropdown option: ${optionText}`, e.message);
    try {
      const options = await locator(`${popupSelector} .e-list-item`).allTextContents();
      console.log(`Available options: ${options.join(', ')}`);
    } catch {
      console.log(`⚠️ Could not retrieve available options`);
    }
    throw e;
  }
}

module.exports = { selectDropdownOption };
