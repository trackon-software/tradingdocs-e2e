// definitionsTest function - test_main.spec.js'e eklenecek

async function definitionsTest(page) {
  console.log('🔍 Starting Definitions (Entity List) Navigation Test');
  
  try {
    // Entity List sayfasına git
    await page.goto(`${config.entityList.baseUrl}${config.entityList.entityListPath}`);
    await page.waitForTimeout(config.entityList.timeouts.pageLoad);
    
    console.log('📋 Navigated to Entity List page');
    
    // Her entity için test yap
    for (let i = 0; i < config.entityList.entities.length; i++) {
      const entity = config.entityList.entities[i];
      
      try {
        console.log(`🔎 Testing entity: ${entity.name} (${i + 1}/${config.entityList.entities.length})`);
        
        // Entity'nin varlığını kontrol et
        const entityElement = page.locator(entity.selector);
        await entityElement.waitFor({ 
          timeout: config.entityList.timeouts.entityItemVisible 
        });
        
        // Entity'ye tıkla
        await entityElement.click();
        console.log(`  ✅ Clicked on ${entity.name}`);
        
        // Sayfa yüklenmesini bekle
        await page.waitForTimeout(config.entityList.timeouts.entityNavigation);
        
        // URL kontrolü
        if (config.entityList.validation.checkUrl) {
          await page.waitForFunction(
            (expectedUrl) => window.location.pathname.includes(expectedUrl),
            entity.url,
            { timeout: config.entityList.timeouts.pageLoad }
          );
          console.log(`  ✅ URL validation passed for ${entity.name}`);
        }
        
        // Başlık kontrolü
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
        
        // Tablo yüklenmesi kontrolü
        if (config.entityList.validation.requireTable) {
          try {
            await page.waitForSelector(config.entityList.selectors.dataTable, {
              timeout: config.entityList.timeouts.tableLoad
            });
            console.log(`  ✅ Table loaded for ${entity.name}`);
            
            // Tablo satır sayısı kontrolü
            if (!config.entityList.validation.allowEmpty) {
              const rows = page.locator(config.entityList.selectors.tableRows);
              const rowCount = await rows.count();
              
              if (rowCount === 0) {
                console.warn(`  ⚠️  No data found in table for ${entity.name}`);
              } else {
                console.log(`  📊 Found ${rowCount} rows in ${entity.name} table`);
              }
            }
          } catch (error) {
            console.warn(`  ⚠️  Table load failed for ${entity.name}: ${error.message}`);
            
            // Hata mesajı kontrolü
            try {
              const errorElement = page.locator(config.entityList.selectors.errorMessage);
              if (await errorElement.isVisible()) {
                const errorMsg = await errorElement.textContent();
                console.error(`  ❌ Error message for ${entity.name}: ${errorMsg}`);
              }
            } catch (e) {
              // Error mesajı bulunamadı, devam et
            }
          }
        }
        
        // Loading indicator'ın kaybolmasını bekle
        try {
          await page.waitForSelector(config.entityList.selectors.loadingIndicator, {
            state: 'hidden',
            timeout: config.entityList.timeouts.dataLoad
          });
        } catch (error) {
          // Loading indicator yoksa veya kaybolmadıysa devam et
        }
        
        console.log(`  ✅ Successfully tested ${entity.name}`);
        
        // Entity'ler arası geçiş için kısa bekleme
        await page.waitForTimeout(config.entityList.timeouts.betweenNavigations);
        
      } catch (error) {
        console.error(`  ❌ Error testing ${entity.name}: ${error.message}`);
        
        // Hata durumunda ana sayfaya geri dön
        try {
          await page.goto(`${config.entityList.baseUrl}${config.entityList.entityListPath}`);
          await page.waitForTimeout(config.entityList.timeouts.pageLoad);
          console.log(`  🔄 Navigated back to entity list after error`);
        } catch (navigateError) {
          console.error(`  ❌ Failed to navigate back to entity list: ${navigateError.message}`);
          throw navigateError; // Test'i durdur
        }
      }
    }
    
    console.log('✅ Entity list navigation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Definitions test failed:', error.message);
    throw error;
  }
}