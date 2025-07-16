// tests/test_main.spec.js
const { test } = require('@playwright/test');
test.setTimeout(300000); // 5 minute timeout for all the tests in this program

const login = require('../steps/login');
const createShipment = require('../steps/createShipment');
const uploadFile = require('../steps/uploadFile');
const { complyShipment } = require('../steps/complyShipment');
const createRuleset = require('../steps/createRuleset');
const captureDocument = require('../steps/captureDocument');
const checkDiscrepancies = require('../steps/checkDiscrepancies');
const createExtractor = require('../steps/createExtractor');

test('End-to-end shipment and ruleset flow', async ({ page }) => {
  console.log('🚀 Starting full E2E test flow');
  //You can run these on their own but login has to always run first, obviously.
  await login(page);
  await createRuleset(page);
  await createExtractor(page);
  await createShipment(page);
  await uploadFile(page);
  await complyShipment(page);
  await checkDiscrepancies(page);
  //await captureDocument(page);
 
  console.log('🎉 All steps completed successfully');
});
