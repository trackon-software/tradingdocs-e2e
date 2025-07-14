// tests/test_main.spec.js
const { test } = require('@playwright/test');
test.setTimeout(120000); // 2 minutes timeout for all tests in this file

const login = require('../steps/login');
const createShipment = require('../steps/createShipment');
const uploadFile = require('../steps/uploadFile');
const { complyShipment } = require('../steps/complyShipment');
const createRuleset = require('../steps/createRuleset');
const captureDocument = require('../steps/captureDocument');

test('End-to-end shipment and ruleset flow', async ({ page }) => {
  console.log('🚀 Starting full E2E test flow');

  await login(page);
  await createShipment(page);
  await uploadFile(page);
  await complyShipment(page);
  await createRuleset(page);
  //await captureDocument(page);

  console.log('🎉 All steps completed successfully');
});
