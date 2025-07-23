// definitionsTest.js
const navigateAndWait = require('../utils/navigateAndWait');
const config = require('./config2.0');
module.exports = async function definitionsTest(page) {
  console.log('🔍 Starting Definitions (Entity List) Navigation Test');
  
  try {
    // Go to Entity list page.
    await page.goto(`${config.entityList.baseUrl}${config.entityList.entityListPath}`);
    await page.waitForTimeout(config.entityList.timeouts.pageLoad);
    
    console.log('📋 Navigated to Entity List page');
    
    // Test the Entities.
    for (let i = 0; i < config.entityList.entities.length; i++) {
      const entity = config.entityList.entities[i];
      
      try {
        console.log(`🔎 Testing entity: ${entity.name} (${i + 1}/${config.entityList.entities.length})`);
        
        // Check if Entity exists.
        const entityElement = page.locator(entity.selector);
        await entityElement.waitFor({ 
          timeout: config.entityList.timeouts.entityItemVisible 
        });
        
        // Click on Entity.
        await entityElement.click();
        console.log(`  ✅ Clicked on ${entity.name}`);
        
        // Wait for page load.
        await page.waitForTimeout(config.entityList.timeouts.entityNavigation);
        
        // URL check.
        if (config.entityList.validation.checkUrl) {
          await page.waitForFunction(
            (expectedUrl) => window.location.pathname.includes(expectedUrl),
            entity.url,
            { timeout: config.entityList.timeouts.pageLoad }
          );
          console.log(`  ✅ URL validation passed for ${entity.name}`);
        }
        
        // Header check.
        if (config.entityList.validation.requireTitle) {
          try {
            await page.waitForSelector(config.entityList.selectors.pageTitle, {
              timeout: config.entityList.timeouts.titleVisible
            });
            
            const titleElement = page.locator(config.entityList.selectors.pageTitle);
            const titleText = await titleElement.textContent();
            console.log(`  📄 Page title: "${titleText}"`);
            
            if (entity.expectedTitle && !titleText.includes(entity.expectedTitle)) {
              console.warn(`  ⚠️  Title mismatch for ${entity.name}. Expected: "${entity.expectedTitle}", Got: "${titleText}"`);
            } else {
              console.log(`  ✅ Title validation passed for ${entity.name}`);
            }
          } catch (error) {
            console.warn(`  ⚠️  Could not find title for ${entity.name}: ${error.message}`);
          }
        }
        
        // Short wait between entity switches
        await page.waitForTimeout(config.entityList.timeouts.betweenNavigations);
        
      } catch (error) {
        console.error(`  ❌ Error testing ${entity.name}: ${error.message}`);
        
        // Return to main page on error
        try {
          await page.goto(`${config.entityList.baseUrl}${config.entityList.entityListPath}`);
          await page.waitForTimeout(config.entityList.timeouts.pageLoad);
          console.log(`  🔄 Navigated back to entity list after error`);
        } catch (navigateError) {
          console.error(`  ❌ Failed to navigate back to entity list: ${navigateError.message}`);
          throw navigateError; // Stop the test
        }
      }
    }
    
    console.log('✅ Entity list navigation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Definitions test failed:', error.message);
    throw error;
  }
};
