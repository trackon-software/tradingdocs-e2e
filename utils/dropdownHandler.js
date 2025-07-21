async function selectDropdownOption(page, iconSelector, optionText, options = {}) {
  const openTimeout = options.openTimeout || 8000;
  const optionTimeout = options.optionTimeout || 8000;
  const popupSelector = options.popupSelector || '.e-popup-open ul.e-ul'; // default

  try {
    console.log(`🔽 Opening dropdown with selector: ${iconSelector}`);
    await page.click(iconSelector);

    console.log(`⏳ Waiting for dropdown popup: ${popupSelector}`);
    await page.waitForSelector(popupSelector, { state: 'visible', timeout: openTimeout });
    await page.waitForTimeout(1000);

    const optionSelector = `${popupSelector} .e-list-item:has-text("${optionText}")`;
    console.log(`⏳ Waiting for option: ${optionSelector}`);

    // Burada page.locator kullanarak doğrudan doğru option'u alalım
    const optionLocator = page.locator(optionSelector);
    await optionLocator.waitFor({ state: 'visible', timeout: optionTimeout });
    await optionLocator.click();

    await page.waitForTimeout(300);
    console.log(`✅ Selected option: ${optionText}`);
  } catch (e) {
    console.error(`❌ Failed to select dropdown option: ${optionText}`, e.message);
    throw e;
  }
}


module.exports = { selectDropdownOption };