// complyShipment.js
const { expect } = require('@playwright/test');
const config = require('../config');

// Helper function to wait for file status without page refresh
async function waitForFileStatus(page, expectedStatus = config.complyShipment.expectedFileStatus, maxWaitTime = config.complyShipment.timeouts.fileStatusCheck) {
  const statusSelector = config.complyShipment.selectors.statusBadge;
  const startTime = Date.now();
  
  console.log(config.complyShipment.messages.waitingForStatus.replace('{expectedStatus}', expectedStatus));
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Check if status element exists and get its text
      const statusElement = await page.locator(statusSelector).first();
      const statusText = await statusElement.textContent();
      
      if (statusText && statusText.trim() === expectedStatus) {
        console.log(config.complyShipment.messages.statusChanged.replace('{expectedStatus}', expectedStatus));
        return true;
      }
      
      console.log(config.complyShipment.messages.currentStatus.replace('{currentStatus}', statusText?.trim() || 'unknown'));
      await page.waitForTimeout(config.complyShipment.timeouts.fileStatusInterval);
      
    } catch (error) {
      console.log(config.complyShipment.messages.statusNotFound);
      await page.waitForTimeout(config.complyShipment.timeouts.fileStatusInterval);
    }
  }
  
  throw new Error(config.complyShipment.messages.statusTimeout
    .replace('{expectedStatus}', expectedStatus)
    .replace('{maxWaitTime}', maxWaitTime));
}

async function complyShipment(page, rulesetName = config.complyShipment.defaultRulesetName) {
  const popoverSelector = config.complyShipment.selectors.popover;
  const closeBtnSelector = config.complyShipment.selectors.popoverCloseBtn;

  // Step 0: Go to shipment page and let UI settle
  await page.goto(`${config.complyShipment.baseUrl}${config.complyShipment.shipmentPath}`);
  console.log(config.complyShipment.messages.navigated);
  await page.waitForTimeout(config.complyShipment.timeouts.initialWait);

  // Step 1: Check for popover before interacting with anything
  try {
    console.log(config.complyShipment.messages.popoverWait);
    await page.waitForSelector(popoverSelector, { 
      state: 'visible', 
      timeout: config.complyShipment.timeouts.popoverVisible 
    });
    console.log(config.complyShipment.messages.popoverDetected);
    await page.click(closeBtnSelector);
    await page.waitForSelector(popoverSelector, { 
      state: 'hidden', 
      timeout: config.complyShipment.timeouts.popoverHidden 
    });
    console.log(config.complyShipment.messages.popoverClosed);
  } catch (err) {
    console.log(config.complyShipment.messages.noPopover);
  }

  // Step 2: Click Comply (All)
  await page.waitForTimeout(config.complyShipment.timeouts.uiStabilize);
  await page.click(config.complyShipment.selectors.complyButton);
  console.log(config.complyShipment.messages.complyClicked);

  // Step 3: Wait for dropdown field
  await page.waitForSelector(config.complyShipment.selectors.rulesetInput, { 
    state: 'visible', 
    timeout: config.complyShipment.timeouts.rulesetInputVisible 
  });
  console.log(config.complyShipment.messages.rulesetInputVisible);

  // Step 4: Click dropdown icon to trigger popup
  await page.click(config.complyShipment.selectors.rulesetDropdownIcon);
  console.log(config.complyShipment.messages.dropdownClicked);

  // Step 5: Wait for popup and options to appear
  await page.waitForSelector(config.complyShipment.selectors.rulesetPopup, { 
    state: 'visible', 
    timeout: config.complyShipment.timeouts.rulesetPopupVisible 
  });
  await page.waitForSelector(config.complyShipment.selectors.rulesetListItem, { 
    state: 'visible', 
    timeout: config.complyShipment.timeouts.rulesetOptionsVisible 
  });
  await page.waitForTimeout(config.complyShipment.timeouts.optionSettle);

  // Step 6: Select the desired ruleset
  const rulesetOption = page.locator(config.complyShipment.selectors.rulesetListItem).filter({ hasText: rulesetName });
  await rulesetOption.waitFor({ 
    state: 'visible', 
    timeout: config.complyShipment.timeouts.rulesetOptionsVisible 
  });
  await rulesetOption.click();
  console.log(config.complyShipment.messages.rulesetSelected.replace('{rulesetName}', rulesetName));

  // Step 7: Click the Select button in the modal
  await page.waitForTimeout(config.complyShipment.timeouts.selectionRegister);
  await page.click(config.complyShipment.selectors.selectButton);
  console.log(config.complyShipment.messages.selectClicked);

  // Step 8: Wait for file processing to complete
  await waitForFileStatus(page, config.complyShipment.expectedFileStatus, config.complyShipment.timeouts.fileStatusCheck);
}

module.exports = { complyShipment, waitForFileStatus };