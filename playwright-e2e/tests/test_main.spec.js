const { test, expect } = require('@playwright/test');
const fs = require('fs');

// Import step functions
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
const entityBuilder = require('../steps2.0/entityBuilder');
const failOnPurpose = require('../steps2.0/failOnPurpose'); // 👈 Bu da eklendi

test.setTimeout(300000); // 5 minutes timeout

test.describe('E2E Test Suite', () => {
  test('Simple E2E Test Flow', async ({ page }) => {
    const failedSteps = [];

    const runStep = async (name, fn) => {
      try {
        console.log(`➡️ Running ${name}...`);
        await fn();
        console.log(`✅ ${name} completed\n`);
      } catch (error) {
        const errorMsg = `❌ ${name} failed: ${error.message}`;
        console.error(errorMsg);
        failedSteps.push(errorMsg);
      }
    };

    await page.setViewportSize({ width: 1920, height: 1080 });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🐛 Browser Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      console.log(`🐛 Page Error: ${error.message}`);
    });

    console.log('🚀 Starting test suite...\n');

    await runStep('login', () => login(page));
    await runStep('entityBuilder', () => entityBuilder(page));

    await runStep('addExtractor', () => addExtractor(page));
    await runStep('updateExtractor', () => updateExtractor(page));
    await runStep('deleteExtractor', () => deleteExtractor(page));

    await runStep('addRuleset', () => addRuleset(page));
    await runStep('updateRuleset', () => updateRuleset(page));
    await runStep('deleteRuleset', () => deleteRuleset(page));

    await runStep('addShipment', () => addShipment(page));
    await runStep('updateShipment', () => updateShipment(page));

    // 👇 Fail on purpose adımı buraya yerleştirildi
    await runStep('failOnPurpose', () => failOnPurpose(page));

    await runStep('deleteShipment', () => deleteShipment(page));
    await runStep('definitionsTest', () => definitionsTest(page));

    // 🔴 Failed adımları dosyaya yaz
    if (failedSteps.length > 0) {
      const failureLog = `🧨 Test Failures:\n${failedSteps.join('\n')}`;
      fs.writeFileSync('failed_steps.log', failureLog, 'utf-8');
      console.error(failureLog);
      throw new Error('❗ Some steps failed. See "failed_steps.log" for details.');
    } else {
      console.log('🎉 All tests completed successfully!');
    }
  });
});
