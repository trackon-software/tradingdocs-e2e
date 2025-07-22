// tests/test_main.spec.js
const { test } = require('@playwright/test');
test.setTimeout(300000); // 5 minute timeout for all the tests in this program

const login = require('../steps/login');
const addShipment = require('../steps2.0/addShipment');
const updateShipment = require('../steps2.0/updateShipment');
const deleteShipment = require('../steps2.0/deleteShipment');
const addExtractor = require('../steps2.0/addExtractor');
const updateExtractor = require('../steps2.0/updateExtractor');
const deleteExtractor = require('../steps2.0/deleteExtractor');
const addRuleset = require('../steps2.0/addRuleset');
const updateRuleset = require('../steps2.0/updateRuleset');
const deleteRuleset = require('../steps2.0/deleteRuleset');
const definitionsTest = require('../steps2.0/definitionsTest');

test('End-to-end shipment and ruleset flow', async ({ page }) => {
  console.log('🚀 Starting full E2E test flow');
  //You can run these on their own but login has to always run first, obviously.
  await login(page);
  //await addShipment(page);
  //await updateShipment(page);
  //await deleteShipment(page);
  //await addRuleset(page);
  //await updateRuleset(page);
  //await definitionsTest(page);
  //await deleteRuleset(page);
  await addExtractor(page);
  //await updateExtractor(page);
  //await deleteExtractor(page);
  console.log('🎉 All steps completed successfully');
});
