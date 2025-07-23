const { expect } = require('@playwright/test');
const { popoverHandler } = require('../utils/popoverHandler');
const config = require('../config'); // config dosyasını import et  

async function checkDiscrepancies(page) {
  const { checkDiscrepancies: discrepanciesConfig } = config;
  
  await page.goto(discrepanciesConfig.baseUrl + discrepanciesConfig.shipmentPath);
  console.log(discrepanciesConfig.messages.navigated);
  await page.waitForTimeout(discrepanciesConfig.timeouts.initialWait);

  // Close initial popover if visible
  await popoverHandler(page);

  // Click on Discrepancies tab
  await page.waitForSelector(discrepanciesConfig.selectors.discrepanciesTab, { 
    state: 'visible', 
    timeout: discrepanciesConfig.timeouts.tabVisible 
  });
  await page.click(discrepanciesConfig.selectors.discrepanciesTab);
  console.log(discrepanciesConfig.messages.tabClicked);

  await page.waitForSelector(discrepanciesConfig.selectors.inconsistenciesContent, { 
    state: 'visible', 
    timeout: discrepanciesConfig.timeouts.contentVisible 
  });

  // Close second popover if visible
  await popoverHandler(page);

  // Find and click Column Chooser button
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

  // Blur search input if visible to avoid checkbox issues
  const searchInput = page.locator(discrepanciesConfig.selectors.searchInput);
  if (await searchInput.isVisible()) {
    console.log(discrepanciesConfig.messages.searchInputVisible);
    await searchInput.evaluate(node => node.blur());
    await page.waitForTimeout(discrepanciesConfig.timeouts.searchInputBlur);
    console.log(discrepanciesConfig.messages.searchInputBlurred);
  }

  // Check Notes checkbox and select if not checked
  const notesCheckbox = page.locator(discrepanciesConfig.selectors.notesCheckbox);
  if (await notesCheckbox.isVisible()) {
    const isChecked = await notesCheckbox.isChecked();
    if (!isChecked) {
      await notesCheckbox.click({ force: true });
      console.log(discrepanciesConfig.messages.notesCheckboxClicked);
    } else {
      console.log(discrepanciesConfig.messages.notesCheckboxAlreadyChecked);
    }
  } else {
    console.log(discrepanciesConfig.messages.notesCheckboxNotFound);
  }

  await page.waitForTimeout(discrepanciesConfig.timeouts.checkboxWait);

  // Apply column settings with forced click if necessary
  const applyBtn = page.locator(discrepanciesConfig.selectors.applyButton).first();
  const isBtnVisible = await applyBtn.isVisible();

  if (!isBtnVisible) {
    console.log(discrepanciesConfig.messages.applyButtonNotVisible);
  }

  try {
    await applyBtn.evaluate(button => button.click());
    console.log(discrepanciesConfig.messages.applyButtonClicked);
  } catch (err) {
    console.error(discrepanciesConfig.messages.applyJSFailed);
    await applyBtn.click({ force: true });
    console.log(discrepanciesConfig.messages.applyButtonFallback);
  }

  await page.waitForTimeout(discrepanciesConfig.timeouts.applyButtonWait);
  console.log(discrepanciesConfig.messages.settingsApplied);

  // Wait for page reload after applying settings
  await page.waitForLoadState('networkidle');
  console.log(discrepanciesConfig.messages.pageReloaded);

  // Wait for discrepancies content to be visible
  await page.waitForSelector(discrepanciesConfig.selectors.inconsistenciesContent, { 
    state: 'visible', 
    timeout: discrepanciesConfig.timeouts.contentVisible 
  });
  console.log(discrepanciesConfig.messages.contentReloaded);

  // Collect all Notes from all pages
  let allNotes = [];

  while (true) {
    // Wait for notes cells on current page
    await page.waitForSelector(discrepanciesConfig.selectors.notesCells, { 
      state: 'attached', 
      timeout: discrepanciesConfig.timeouts.notesCellsAttached 
    });
    const notesCells = page.locator(discrepanciesConfig.selectors.notesCells);
    const count = await notesCells.count();

    for (let i = 0; i < count; i++) {
      const cell = notesCells.nth(i);
      const text = (await cell.innerText()).trim();
      if (text && !discrepanciesConfig.excludedNoteTexts.includes(text.toLowerCase())) {
        allNotes.push(text);
      }
    }

    // Locate next page button
    const nextBtn = page.locator(discrepanciesConfig.selectors.nextPageButton);

    // Check if next button is disabled
    const isDisabled = await nextBtn.evaluate(node => {
      return node.classList.contains('e-disable') 
        || node.getAttribute('aria-disabled') === 'true'
        || node.getAttribute('tabindex') === '-1';
    });

    if (isDisabled) {
      console.log(discrepanciesConfig.messages.lastPage);
      break;
    } else {
      console.log(discrepanciesConfig.messages.nextPage);
      await nextBtn.waitForElementState('visible');
      await nextBtn.waitForElementState('enabled');

      await Promise.all([
        page.waitForLoadState('networkidle'),
        nextBtn.click(),
      ]);
    }
  }

  if (allNotes.length > 0) {
    console.log(discrepanciesConfig.messages.notesFound);
    for (const note of allNotes) {
      console.log(`📝 ${note}`);
    }
  } else {
    console.log(discrepanciesConfig.messages.noNotesFound);
  }
}

module.exports = checkDiscrepancies;