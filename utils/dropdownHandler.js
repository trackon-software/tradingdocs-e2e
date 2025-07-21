// utils/dropdownHandler.js

/**
 * Syncfusion dropdown listelerinde bir option seçmek için kullanılır.
 * @param {import('@playwright/test').Page} page - Playwright sayfa objesi
 * @param {string} iconSelector - Dropdown'u açan ikon'un selector'ı
 * @param {string} optionText - Seçilmek istenen text
 * @param {Object} [options] - Timeout gibi opsiyonel ayarlar
 * @param {number} [options.openTimeout=3000]
 * @param {number} [options.optionTimeout=3000]
 */
async function selectDropdownOption(page, iconSelector, optionText, options = {}) {
  const openTimeout = options.openTimeout || 3000;
  const optionTimeout = options.optionTimeout || 3000;

  try {
    console.log(`🔽 Opening dropdown with selector: ${iconSelector}`);
    await page.click(iconSelector);
    await page.waitForTimeout(500); // UI stabilitesi

    const popupSelector = '.e-popup-open ul.e-ul';
    await page.waitForSelector(popupSelector, { state: 'visible', timeout: openTimeout });

    const optionSelector = `${popupSelector} .e-list-item:has-text("${optionText}")`;
    await page.waitForSelector(optionSelector, { state: 'visible', timeout: optionTimeout });
    await page.click(optionSelector);

    await page.waitForTimeout(300); // Dropdown'un kapanması için kısa bir bekleme
    console.log(`✅ Selected option: ${optionText}`);
  } catch (e) {
    console.error(`❌ Failed to select dropdown option: ${optionText}`, e.message);
    throw e;
  }
}

module.exports = { selectDropdownOption };