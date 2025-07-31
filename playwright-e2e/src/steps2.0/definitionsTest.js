const { expect } = require('@playwright/test');
const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');
const path = require('path');
const fs = require('fs');

module.exports = async function definitionsTest(page) {
  console.log('🔍 Starting Definitions (Entity List) Navigation Test');

  const {
    baseUrl,
    entityListPath,
    selectors,
    entities,
    timeouts,
    validation
  } = config.entityList;

  const testResultsDir = path.resolve('src', 'test-results', 'screenshots');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  try {
    await page.goto(`${baseUrl}${entityListPath}`);
    await expect(page).toHaveURL(/.*entity-list.*/i, { timeout: timeouts.pageLoad });
    console.log('📋 Navigated to Entity List page');

    const testSubset = entities.slice(0, 5);

    for (let i = 0; i < testSubset.length; i++) {
      const entity = testSubset[i];
      try {
        console.log(`🔎 Testing entity: ${entity.name} (${i + 1}/${testSubset.length})`);

        const entityElement = page.locator(entity.selector);
        await expect(entityElement).toBeVisible({ timeout: timeouts.entityItemVisible });
        await entityElement.click();
        console.log(`  ✅ Clicked on ${entity.name}`);

        if (selectors.loadingIndicator) {
          try {
            await page.waitForSelector(selectors.loadingIndicator, {
              state: 'hidden',
              timeout: timeouts.dataLoad,
            });
            console.log('  ⏳ Loading complete');
          } catch {
            console.log('  ℹ️ No loading indicator or it did not disappear');
          }
        }

        await page.waitForTimeout(timeouts.entityNavigation);

        if (validation.checkUrl && entity.url) {
          const currentUrl = await page.url();
          expect(currentUrl.toLowerCase()).toContain(entity.url.toLowerCase());
          console.log(`  ✅ URL validation passed`);
        }

        if (validation.requireTitle) {
          const titleSelectors = [
            selectors.pageTitle,
            'h1', 'h2', '.page-title',
            '[data-testid="page-title"]',
            '.header-title'
          ];

          let titleText = '';
          for (const sel of titleSelectors) {
            const el = page.locator(sel).first();
            if (await el.isVisible({ timeout: timeouts.titleVisible }).catch(() => false)) {
              titleText = await el.textContent();
              if (titleText?.trim()) break;
            }
          }

          if (validation.requireTitle && titleText?.trim()) {
            if (entity.expectedTitle) {
              expect(titleText.toLowerCase()).toContain(entity.expectedTitle.toLowerCase());
            }
            console.log(`  ✅ Title check passed`);
          } else {
            console.warn(`  ⚠️ Title missing or unreadable`);
          }
        }

        if (validation.requireTable) {
          const table = page.locator(selectors.dataTable);
          await expect(table).toBeVisible({ timeout: timeouts.tableLoad });

          const rows = await page.locator(selectors.tableRows).count();
          if (!validation.allowEmpty) {
            expect(rows).toBeGreaterThan(0);
          }
          console.log(`  ✅ Table check passed with ${rows} rows`);
        }

        await page.waitForTimeout(timeouts.betweenNavigations);
        await page.goto(`${baseUrl}${entityListPath}`);
        await page.waitForTimeout(timeouts.pageLoad);

      } catch (entityErr) {
        console.error(`  ❌ Error for ${entity.name}:`, entityErr.message);

        try {
          if (!fs.existsSync(testResultsDir)) {
            fs.mkdirSync(testResultsDir, { recursive: true });
          }

          const screenshotPath = path.join(testResultsDir, `entity_${entity.name}_${timestamp}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`  📸 Screenshot saved: ${screenshotPath}`);
        } catch (screenshotErr) {
          console.error(`  ❌ Failed to save screenshot:`, screenshotErr.message);
        }

        // Return to base entity list page before continuing
        try {
          await page.goto(`${baseUrl}${entityListPath}`);
          await page.waitForTimeout(timeouts.pageLoad);
        } catch (navErr) {
          console.error('  ❌ Failed to navigate back after error:', navErr.message);
        }
      }
    }

    console.log('✅ Finished testing Entity List definitions');

  } catch (fatalError) {
    console.error('❌ Fatal error in definitionsTest:', fatalError.message);
    throw fatalError;
  }
};
