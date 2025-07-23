const { expect } = require('@playwright/test');

async function testAllExtractors(page) {
  const treeItemSelector = '.e-treeview .e-list-item';
  const textSelector = '.e-text-content .e-list-text';

  await page.goto('https://demo.tradingdocs.ai/entity-list/agent_usage');
  await page.waitForSelector('.e-treeview', { state: 'visible', timeout: 5000 });
  // Toplam öğe sayısını al
  const itemCount = await page.locator(treeItemSelector).count();
  console.log(`🌲 Toplam ${itemCount} entity bulundu.`);

  for (let i = 0; i < itemCount; i++) {
    const currentItem = page.locator(treeItemSelector).nth(i);
    const label = await currentItem.locator(textSelector).textContent();

    console.log(`\n👉 Seçiliyor: ${label?.trim()}`);

    // Öğeye tıkla
    await currentItem.click();

    // Yükleme spinner'ının kaybolmasını bekle
    try {
      await page.waitForSelector('.loading-spinner', { state: 'detached', timeout: 5000 });
    } catch (e) {
      throw new Error(`❌ ${label?.trim()} yüklenirken sorun oluştu.`);
    }

    console.log(`✅ ${label?.trim()} başarıyla yüklendi.`);
  }

  console.log('\n🎉 Tüm entity\'ler başarıyla test edildi.');
}

module.exports =  testAllExtractors ;
