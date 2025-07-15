const { expect } = require('@playwright/test');

async function checkDiscrepancies(page) {
  const popoverSelector = '#driver-popover-content';
  const closeBtnSelector = `${popoverSelector} .driver-popover-close-btn`;

  await page.goto('https://demo.tradingdocs.ai/shipment/TEST-002');
  console.log('🚀 Navigated to TEST-002');
  await page.waitForTimeout(2000);

  // Close initial popover if visible
  try {
    await page.waitForSelector(popoverSelector, { state: 'visible', timeout: 3000 });
    const closeBtn = page.locator(closeBtnSelector).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForSelector(popoverSelector, { state: 'hidden', timeout: 7000 });
      console.log('✅ Initial popover closed');
    }
  } catch (_) {
    console.log('✅ No initial popover or already closed');
  }

  // Click on Discrepancies tab
  const tabSelector = 'a[data-bs-target="#inconsistencies"]';
  await page.waitForSelector(tabSelector, { state: 'visible', timeout: 15000 });
  await page.click(tabSelector);
  console.log('✅ Discrepancies tab clicked');

  await page.waitForSelector('#inconsistencies', { state: 'visible', timeout: 15000 });

  // Close second popover if visible
  try {
    await page.waitForSelector(popoverSelector, { state: 'visible', timeout: 3000 });
    const closeBtn = page.locator(closeBtnSelector).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForSelector(popoverSelector, { state: 'hidden', timeout: 7000 });
      console.log('✅ Second popover closed');
    }
  } catch (_) {
    console.log('✅ No second popover or already closed');
  }

  // Find and click Column Chooser button
  const chooserSelectors = [
    '#inconsistencies .e-toolbar-item[title="Column Chooser"] button',
    '#inconsistencies .e-toolbar .e-cc-toolbar button[aria-label="Column Chooser"]',
    '#inconsistencies .e-toolbar button[title="Column Chooser"]',
    '#inconsistencies .e-cc-toolbar button.e-cc-icon'
  ];

  let foundChooser = null;
  for (const selector of chooserSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible()) {
      foundChooser = selector;
      break;
    }
  }

  if (!foundChooser) throw new Error('❌ Column Chooser button not found');
  await page.click(foundChooser);
  console.log('✅ Column Chooser clicked');

  await page.waitForTimeout(2000);

  // Blur search input if visible to avoid checkbox issues
  const searchInput = page.locator('input#textbox_0.e-control.e-textbox');
  if (await searchInput.isVisible()) {
    console.log('🛑 Search input visible — blurring it...');
    await searchInput.evaluate(node => node.blur());
    await page.waitForTimeout(800);
    console.log('✅ Search input blurred');
  }

  // Check Notes checkbox and select if not checked
  const notesCheckbox = page.locator('input#field-notes');
  if (await notesCheckbox.isVisible()) {
    const isChecked = await notesCheckbox.isChecked();
    if (!isChecked) {
      await notesCheckbox.click({ force: true });
      console.log('✅ Notes checkbox clicked');
    } else {
      console.log('✅ Notes checkbox already checked');
    }
  } else {
    console.log('❌ Notes checkbox not found');
  }

  await page.waitForTimeout(1000); // Wait for UI to update

  // Apply column settings with forced click if necessary
  const applyBtn = page.locator('button.grid-settings-dialog.e-control.e-btn.e-lib.e-flat.e-primary').first();
  const isBtnVisible = await applyBtn.isVisible();

  if (!isBtnVisible) {
    console.log('⚠️ Apply button not visible, attempting force click...');
  }

  try {
    await applyBtn.evaluate(button => button.click());
    console.log('✅ Apply button clicked via JS');
  } catch (err) {
    console.error('❌ Apply JS click failed, fallback to Playwright force click...');
    await applyBtn.click({ force: true });
    console.log('✅ Apply button clicked via Playwright force click');
  }

  await page.waitForTimeout(2000);
  console.log('✅ Column settings applied, ready to check discrepancies');

  // Wait for page reload after applying settings
  await page.waitForLoadState('networkidle');
  console.log('🔄 Page reloaded');

  // Wait for discrepancies content to be visible
  await page.waitForSelector('#inconsistencies', { state: 'visible', timeout: 15000 });
  console.log('✅ Discrepancies content reloaded');

  // Collect all Notes from all pages
  let allNotes = [];

  while (true) {
    // Wait for notes cells on current page
    await page.waitForSelector('td[data-field="notes"]', { state: 'attached', timeout: 15000 });
    const notesCells = page.locator('td[data-field="notes"]');
    const count = await notesCells.count();

    for (let i = 0; i < count; i++) {
      const cell = notesCells.nth(i);
      const text = (await cell.innerText()).trim();
      if (text && text.toLowerCase() !== 'undefined') {
        allNotes.push(text);
      }
    }

    // Locate next page button
    const nextBtn = page.locator('div.e-next.e-icons.e-icon-next.e-nextpage.e-pager-default');

    // Check if next button is disabled
    const isDisabled = await nextBtn.evaluate(node => {
      return node.classList.contains('e-disable') 
        || node.getAttribute('aria-disabled') === 'true'
        || node.getAttribute('tabindex') === '-1';
    });

    if (isDisabled) {
      console.log('✅ Last page reached, no more pages to process.');
      break;
    } else {
      console.log('➡️ Moving to next page...');
      await nextBtn.waitForElementState('visible');
      await nextBtn.waitForElementState('enabled');

      await Promise.all([
        page.waitForLoadState('networkidle'),
        nextBtn.click(),
      ]);
    }
  }

  if (allNotes.length > 0) {
    console.log('✅ Notes found across all pages:');
    for (const note of allNotes) {
      console.log(`📝 ${note}`);
    }
  } else {
    console.log('⚠️ No Notes found in any pages.');
  }
}

module.exports = checkDiscrepancies;
