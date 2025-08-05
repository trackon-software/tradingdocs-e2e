const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');
const { popoverHandler } = require('../utils/popoverHandler');
const config = require('./config3.0');

async function checkDiscrepancies(page) {
  const { checkDiscrepancies: discrepanciesConfig } = config;

  await page.goto(discrepanciesConfig.baseUrl + discrepanciesConfig.shipmentPath);
  console.log(discrepanciesConfig.messages.navigated);
  await page.waitForLoadState('networkidle');

  await popoverHandler(page);

  await page.waitForSelector(discrepanciesConfig.selectors.discrepanciesTab, {
    state: 'visible',
    timeout: discrepanciesConfig.timeouts.tabVisible,
  });
  await page.click(discrepanciesConfig.selectors.discrepanciesTab);
  console.log(discrepanciesConfig.messages.tabClicked);

  await page.waitForSelector(discrepanciesConfig.selectors.inconsistenciesContent, {
    state: 'visible',
    timeout: discrepanciesConfig.timeouts.contentVisible,
  });

  await popoverHandler(page);

  let foundChooser = null;
  for (const selector of discrepanciesConfig.selectors.columnChooserSelectors) {
    const el = page.locator(selector).first();
    if (await el.isVisible()) {
      foundChooser = selector;
      break;
    }
  }

  if (!foundChooser) throw new Error(discrepanciesConfig.messages.chooserNotFound);
  await page.click(foundChooser);
  console.log(discrepanciesConfig.messages.chooserClicked);

  await page.waitForTimeout(discrepanciesConfig.timeouts.columnChooserWait);

  const searchInput = page.locator(discrepanciesConfig.selectors.searchInput);
  if (await searchInput.isVisible()) {
    await searchInput.evaluate((node) => node.blur());
    await page.waitForTimeout(discrepanciesConfig.timeouts.searchInputBlur);
  }

  const notesCheckbox = page.locator(discrepanciesConfig.selectors.notesCheckbox);
  if (await notesCheckbox.isVisible() && !(await notesCheckbox.isChecked())) {
    await notesCheckbox.click({ force: true });
    console.log(discrepanciesConfig.messages.notesCheckboxClicked);
  }

  await page.waitForTimeout(discrepanciesConfig.timeouts.checkboxWait);

  const applyBtn = page.locator(discrepanciesConfig.selectors.applyButton).first();
  try {
    await applyBtn.evaluate((button) => button.click());
    console.log(discrepanciesConfig.messages.applyButtonClicked);
  } catch {
    await applyBtn.click({ force: true });
    console.log(discrepanciesConfig.messages.applyButtonFallback);
  }

  await page.waitForTimeout(discrepanciesConfig.timeouts.applyButtonWait);
  await page.waitForLoadState('networkidle');

  await page.waitForSelector(discrepanciesConfig.selectors.inconsistenciesContent, {
    state: 'visible',
    timeout: discrepanciesConfig.timeouts.contentVisible,
  });

  const notesLocator = page.locator(discrepanciesConfig.selectors.notesCells);
  await notesLocator.first().waitFor({ state: 'attached' });

  const notesCount = await notesLocator.count();
  const extractedNotes = [];

  for (let i = 0; i < notesCount; i++) {
    const cell = notesLocator.nth(i);
    const titleAttr = await cell.getAttribute('title');
    const fallbackText = (await cell.innerText()).trim();
    const note = (titleAttr || fallbackText || '').trim();
    if (note && !discrepanciesConfig.excludedNoteTexts.includes(note.toLowerCase())) {
      extractedNotes.push(note);
    }
  }

  const referencePath = path.join(__dirname, '../test-results/discrepancy_notes_reference.txt');
  const expectedNotes = fs
    .readFileSync(referencePath, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const missing = expectedNotes.filter((note) => !extractedNotes.includes(note));
  const unexpected = extractedNotes.filter((note) => !expectedNotes.includes(note));

  if (missing.length > 0 || unexpected.length > 0) {
    console.error('❌ Discrepancy mismatch detected!');
    if (missing.length > 0) {
      console.log('🟥 Missing notes:');
      missing.forEach((n) => console.log(`- ${n}`));
    }
    if (unexpected.length > 0) {
      console.log('🟨 Unexpected notes:');
      unexpected.forEach((n) => console.log(`+ ${n}`));
    }
    throw new Error('Discrepancy comparison failed. Notes mismatch.');
  } else {
    console.log('✅ All discrepancies matched expected reference.');
  }
}

module.exports = checkDiscrepancies;
