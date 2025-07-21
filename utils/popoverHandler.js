async function popoverHandler(page) {
  try {
    const popover = await page.waitForSelector('.driver-popover[style*="display: block"]', { timeout: 10000 });
    if (popover) {
      console.log('⚠️ Popover detected, closing it...');
      await page.click('.driver-popover-close-btn');
      await page.waitForSelector('.driver-popover[style*="display: block"]', { state: 'hidden', timeout: 10000 });
      console.log('✅ Popover closed');
    }
  } catch {
    console.log('ℹ️ No popover detected, continuing...');
  }
}

module.exports = { popoverHandler };
