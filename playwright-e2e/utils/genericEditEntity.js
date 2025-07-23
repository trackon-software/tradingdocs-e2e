/**
 * Genel tablo düzenleme fonksiyonu.
 * bunu yine de kontrol etmem lazım.... 
 * @param {Page} page - Playwright sayfası
 * @param {string} baseUrl - Düzenleme yapılacak sayfanın URL'i
 * @param {string} rowUniqueSelector - Satırı bulmak için locator (ör: `tr.e-row:has(td[title="uniqueValue"])`)
 * @param {string} editButtonSelector - Düzenle butonunun locator'u
 * @param {function} fillFormFn - Form doldurma ve güncelleme için async callback, page parametre alır
 * @param {object} options - timeout vb opsiyonlar
 */
async function genericEditEntity(page, baseUrl, rowUniqueSelector, editButtonSelector, fillFormFn, options = {}) {
  const {
    navigationTimeout = 10000,
    inputTimeout = 5000,
    saveButtonSelector = 'button.submit-button',
    saveTimeout = 5000,
    postSaveWait = 3000,
  } = options;

  try {
    console.log(`🚀 Navigating to ${baseUrl}`);
    await page.goto(baseUrl);
    await page.waitForSelector(rowUniqueSelector, { timeout: navigationTimeout });
    console.log(`✅ Found row matching selector: ${rowUniqueSelector}`);

    const row = page.locator(rowUniqueSelector);
    await row.click();
    console.log('🟡 Selected row');
    await page.waitForTimeout(1000);

    const editBtn = page.locator(editButtonSelector);
    await editBtn.waitFor({ state: 'visible', timeout: inputTimeout });
    await editBtn.click();
    console.log('✏️ Edit button clicked');
    await page.waitForTimeout(1000);

    // Kullanıcı tanımlı form doldurma fonksiyonu çağrılır
    await fillFormFn(page);

    // Kaydetme işlemi
    const saveBtn = page.locator(saveButtonSelector);
    await saveBtn.waitFor({ state: 'visible', timeout: saveTimeout });
    await saveBtn.click();
    console.log('💾 Save button clicked');
    await page.waitForTimeout(postSaveWait);

    console.log('🎉 Edit completed successfully');
  } catch (e) {
    console.error('❌ Error in genericEditEntity:', e);
    throw e;
  }
}

module.exports = {
  genericEditEntity,
};
