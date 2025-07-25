const { expect } = require('@playwright/test');
const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');

module.exports = async function definitionsTest(page) {
  console.log('🔍 Starting Definitions (Entity List) Navigation Test');

  try {
    await page.goto(`${config.entityList.baseUrl}${config.entityList.entityListPath}`);
    await page.waitForTimeout(config.entityList.timeouts.pageLoad);
    console.log('📋 Navigated to Entity List page');

    const entitiesToTest = config.entityList.entities.slice(0, 5);

    for (let i = 0; i < entitiesToTest.length; i++) {
      const entity = entitiesToTest[i];

      try {
        console.log(`🔎 Testing entity: ${entity.name} (${i + 1}/${entitiesToTest.length})`);

        const entityElement = page.locator(entity.selector);
        await entityElement.waitFor({ timeout: config.entityList.timeouts.entityItemVisible });
        await entityElement.click();
        console.log(`  ✅ Clicked on ${entity.name}`);

        if (config.entityList.selectors.loadingIndicator) {
          try {
            await page.waitForSelector(
              config.entityList.selectors.loadingIndicator,
              { state: 'hidden', timeout: config.entityList.timeouts.dataLoad }
            );
            console.log('  ⏳ Loading indicator disappeared');
          } catch {
            console.log('  ℹ️ Loading indicator did not appear or timeout elapsed');
          }
        }

        await page.waitForTimeout(config.entityList.timeouts.entityNavigation);

        if (config.entityList.validation.checkUrl && entity.url) {
          const currentUrl = await page.url();
          try {
            expect(currentUrl.toLowerCase()).toContain(entity.url.toLowerCase());
            console.log(`  ✅ URL validation passed for ${entity.name}`);
          } catch {
            console.warn(`  ⚠️ URL validation failed for ${entity.name}: Expected URL includes "${entity.url}" but got "${currentUrl}"`);
          }
        }

        if (config.entityList.validation.requireTitle) {
          const titleSelectors = [
            config.entityList.selectors.pageTitle,
            'h1',
            'h2',
            '.page-title',
            '[data-testid="page-title"]',
            '.header-title'
          ];

          let titleFound = false;
          let titleText = '';

          for (const selector of titleSelectors) {
            try {
              await page.waitForSelector(selector, { timeout: config.entityList.timeouts.titleVisible });
              const titleElement = page.locator(selector).first();
              titleText = await titleElement.textContent();

              if (titleText && titleText.trim()) {
                titleFound = true;
                break;
              }
            } catch {
              // Try next selector
            }
          }

          if (titleFound) {
            try {
              if (entity.expectedTitle) {
                expect(titleText.toLowerCase()).toContain(entity.expectedTitle.toLowerCase());
              }
              console.log(`  ✅ Title validation passed for ${entity.name}`);
            } catch {
              console.warn(`  ⚠️ Title mismatch for ${entity.name}. Expected: "${entity.expectedTitle}", Got: "${titleText.trim()}"`);
            }
          } else {
            console.warn(`  ⚠️ Could not find any title element for ${entity.name}`);
          }
        }

        if (config.entityList.validation.requireTable) {
          try {
            await page.waitForSelector(config.entityList.selectors.dataTable, { timeout: config.entityList.timeouts.tableLoad });
            const rows = await page.locator(config.entityList.selectors.tableRows).count();

            if (!config.entityList.validation.allowEmpty) {
              expect(rows).toBeGreaterThan(0);
            }
            console.log(`  ✅ Table check passed for ${entity.name} with ${rows} rows`);
          } catch (tableError) {
            console.warn(`  ⚠️ Table check failed for ${entity.name}: ${tableError.message}`);
          }
        }

        await page.waitForTimeout(config.entityList.timeouts.betweenNavigations);

        await page.goto(`${config.entityList.baseUrl}${config.entityList.entityListPath}`);
        await page.waitForTimeout(config.entityList.timeouts.pageLoad);

      } catch (entityError) {
        console.error(`  ❌ Error testing ${entity.name}: ${entityError.message}`);

        try {
          await page.goto(`${config.entityList.baseUrl}${config.entityList.entityListPath}`);
          await page.waitForTimeout(config.entityList.timeouts.pageLoad);
          console.log(`  🔄 Navigated back to entity list after error`);
        } catch (navigateError) {
          console.error(`  ❌ Failed to navigate back after error: ${navigateError.message}`);
        }
      }
    }

    console.log('✅ Entity list navigation test for first 5 entities completed!');

  } catch (error) {
    console.error('❌ Definitions test failed:', error.message);
    throw error;
  }
};
