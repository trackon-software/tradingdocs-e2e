async function selectDropdownOption(context, iconSelector, optionText, options = {}) {
  const openTimeout = options.openTimeout || 8000;
  const optionTimeout = options.optionTimeout || 8000;
  const popupSelector = options.popupSelector || '.e-popup-open ul.e-ul';

  try {
    console.log(`🔽 Opening dropdown with selector: ${iconSelector}`);
    const iconLocator = context.locator(iconSelector);
    await iconLocator.click();

    console.log(`⏳ Waiting for dropdown popup: ${popupSelector}`);
    await context.waitForSelector(popupSelector, { state: 'visible', timeout: openTimeout });
    await context.waitForTimeout(1000);

    const optionSelector = `${popupSelector} .e-list-item:has-text("${optionText}")`;
    console.log(`⏳ Waiting for option: ${optionSelector}`);

    const optionLocator = context.locator(optionSelector);
    await optionLocator.waitFor({ state: 'visible', timeout: optionTimeout });
    await optionLocator.click();

    await context.waitForTimeout(300);
    console.log(`✅ Selected option: ${optionText}`);
  } catch (e) {
    console.error(`❌ Failed to select dropdown option: ${optionText}`, e.message);
    throw e;
  }
}

module.exports = { selectDropdownOption };
