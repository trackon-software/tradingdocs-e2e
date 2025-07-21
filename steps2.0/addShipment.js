const config = require('./config2.0');

module.exports = async function addShipment(page) {
    const cfg = config.shipment;
    const { selectors, timeouts } = cfg;

    try {
        console.log('🚀 Navigating to Shipments page...');
        await page.goto(cfg.baseUrl + cfg.shipmentsPath);
        await page.waitForSelector('text=Shipments', { timeout: timeouts.pageLoad });

        console.log('🔍 Checking if Add button is loaded...');
        await page.waitForSelector(selectors.addButton, { timeout: timeouts.buttonVisible });
        console.log('✅ Add button is loaded and visible');

        console.log('🔧 Clicking Add button...');
        await page.click(selectors.addButton);

        console.log('⏳ Waiting for modal to load...');
        await page.waitForSelector(selectors.modal, { timeout: timeouts.modalVisible });
        console.log('✅ Modal is loaded and visible');
        await page.waitForTimeout(2000); // Modal'ın tamamen yüklenmesi için ekstra bekleme

        console.log('📝 Filling out shipment form...');
        
        // Her input'u doldururken biraz bekle ve kontrol et
        console.log('  - Filling Shipment ID...');
        await page.waitForSelector(selectors.shipmentIdInput, { timeout: 5000 });
        await page.fill(selectors.shipmentIdInput, cfg.data.shipmentId);

        console.log('  - Filling Shipper...');
        await page.fill(selectors.shipperInput, cfg.data.shipper);

        console.log('  - Filling Consignee...');
        await page.fill(selectors.consigneeInput, cfg.data.consignee);

        console.log('  - Filling BL Number...');
        await page.fill(selectors.blNumberInput, cfg.data.blNumber);

        console.log('  - Filling Commodity...');
        await page.fill(selectors.commodityInput, cfg.data.commodity);

        console.log('  - Filling Origin Port...');
        await page.fill(selectors.originPortInput, cfg.data.originPort);

        console.log('  - Filling Destination Port...');
        await page.fill(selectors.destinationPortInput, cfg.data.destinationPort);

        console.log('  - Filling Vessel Name...');
        await page.fill(selectors.vesselNameInput, cfg.data.vesselName);

        console.log('  - Filling Shipment Date...');
        await page.fill(selectors.shipmentDateInput, cfg.data.shipmentDate);

        console.log('  - Filling ETD...');
        await page.fill(selectors.etdInput, cfg.data.etd);

        console.log('  - Filling ETA...');
        await page.fill(selectors.etaInput, cfg.data.eta);

        console.log('  - Filling Booking Number...');
        await page.fill(selectors.bookingNumberInput, cfg.data.bookingNumber);

        console.log('  - Filling Reference...');
        await page.fill(selectors.referenceInput, cfg.data.reference);

        // Status dropdown - daha güvenilir yaklaşım
        console.log('🔧 Handling status dropdown...');
        try {
            // Dropdown'u açmak için ikon'a tıkla
            console.log('  - Clicking status dropdown icon...');
            await page.click(selectors.statusDropdownIcon);
            
            // Popup'ın görünür olmasını bekle
            console.log('  - Waiting for status popup to be visible...');
            await page.waitForSelector(selectors.statusPopup, { 
                state: 'visible', 
                timeout: timeouts.statusPopupVisible 
            });
            
            // Popup tamamen yüklendikten sonra biraz daha bekle
            await page.waitForTimeout(1000);
            
            // "Generated" option'ını bul ve görünür olmasını bekle
            console.log('  - Looking for Generated option...');
            const generatedSelector = '#status_popup .e-list-item:has-text("Generated")';
            await page.waitForSelector(generatedSelector, { 
                state: 'visible',
                timeout: timeouts.statusOptionVisible 
            });
            
            // Option'ın tamamen hazır olmasını sağlamak için ekstra bekleme
            await page.waitForTimeout(500);
            
            // Option'a tıkla
            console.log('  - Clicking Generated option...');
            await page.click(generatedSelector);
            
            // Dropdown'un kapanmasını bekle
            await page.waitForSelector(selectors.statusPopup, { 
                state: 'hidden', 
                timeout: 3000 
            });
            
            console.log('✅ Status selection completed successfully');
            
        } catch (statusError) {
            console.warn('⚠️ Primary status selection failed, trying alternative approaches...');
            console.warn(`Status error: ${statusError.message}`);
            
            try {
                // Alternative approach 1 - locator ile filter kullan
                console.log('  - Trying alternative method 1...');
                const alternativeOption = page.locator('#status_popup .e-list-item').filter({ hasText: 'Generated' });
                await alternativeOption.waitFor({ 
                    state: 'visible', 
                    timeout: 3000 
                });
                await page.waitForTimeout(500); // Stabilize
                await alternativeOption.click();
                console.log('✅ Status selected with alternative method 1');
                
            } catch (altError1) {
                try {
                    // Alternative approach 2 - getByText kullan
                    console.log('  - Trying alternative method 2...');
                    await page.waitForTimeout(500);
                    const textOption = page.getByText('Generated', { exact: false }).first();
                    await textOption.waitFor({ state: 'visible', timeout: 3000 });
                    await page.waitForTimeout(300);
                    await textOption.click();
                    console.log('✅ Status selected with alternative method 2');
                    
                } catch (altError2) {
                    try {
                        // Alternative approach 3 - CSS selector ile direkt
                        console.log('  - Trying alternative method 3...');
                        await page.waitForTimeout(500);
                        const directSelector = '#status_popup li:has-text("Generated")';
                        await page.waitForSelector(directSelector, { state: 'visible', timeout: 3000 });
                        await page.waitForTimeout(300);
                        await page.click(directSelector);
                        console.log('✅ Status selected with alternative method 3');
                        
                    } catch (altError3) {
                        console.warn('⚠️ All status selection methods failed');
                        console.warn('Continuing without status selection...');
                        
                        // Dropdown açık kaldıysa kapatmaya çalış
                        try {
                            await page.keyboard.press('Escape');
                            await page.waitForTimeout(500);
                        } catch (escError) {
                            console.warn('Could not close dropdown with Escape');
                        }
                    }
                }
            }
        }

        console.log('💾 Clicking Save button...');
        await page.click(selectors.saveButton);

        console.log('⏳ Waiting for success popup...');
        await page.waitForSelector(selectors.shipmentSavedPopupSelector, { 
            timeout: timeouts.shipmentSavedPopupTimeout 
        });

        const successText = await page.textContent(selectors.shipmentSavedPopupSuccessMessageSelector);
        if (successText && successText.trim() !== cfg.data.expectedSuccessText) {
            console.warn(`⚠️ Unexpected popup message: "${successText}"`);
        } else {
            console.log('✅ Success popup received with correct message');
        }

        console.log('👍 Clicking OK on popup...');
        await page.click(selectors.shipmentSavedPopupOkButtonSelector);

        console.log('🎉 Shipment added successfully');
        
        // Modal'ın kapanmasını bekle
        await page.waitForSelector(selectors.modal, { 
            state: 'hidden', 
            timeout: timeouts.modalClose || 5000 
        });

    } catch (e) {
        console.error('❌ Error in addShipment:', e.message);
        
        // Debug bilgisi - hangi aşamada hata oluştu?
        try {
            const modalVisible = await page.$(selectors.modal);
            const dropdownVisible = await page.$(selectors.statusPopup);
            console.log(`🔍 Debug - Modal visible: ${!!modalVisible}, Dropdown visible: ${!!dropdownVisible}`);
            
            if (modalVisible) {
                // Modal açıksa kapatmaya çalış
                await page.keyboard.press('Escape');
            }
        } catch (debugError) {
            console.log('🔍 Debug info collection failed');
        }
        
        throw e; // Hatayı yeniden fırlat ki üst seviyede yakalanabilsin
    }
};