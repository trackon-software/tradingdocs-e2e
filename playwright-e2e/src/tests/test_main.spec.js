const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Paths for log files
const testRunLogPath = path.resolve('test_run.log');
const failedStepsLogPath = path.resolve('failed_steps.log');
const screenshotsDir = path.resolve('screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir);
}

// Open test_run.log for appending
const logFile = fs.createWriteStream(testRunLogPath, { flags: 'a' });

// Preserve original console functions
const originalLog = console.log;
const originalError = console.error;

// Override console.log to write to file and stdout
console.log = (...args) => {
  originalLog(...args);
  logFile.write(args.join(' ') + '\n');
};

// Override console.error similarly, prefix with [ERROR]
console.error = (...args) => {
  originalError(...args);
  logFile.write('[ERROR] ' + args.join(' ') + '\n');
};

// Helper to write failure summary to file and console
function logFailureSummary(failedSteps) {
  const failureLog = `🧨 Test Failures:\n${failedSteps.join('\n\n')}\n`;
  fs.writeFileSync(failedStepsLogPath, failureLog, 'utf-8');
  console.error(failureLog);
}

// Import test steps
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

test.setTimeout(300000); // 5 minutes timeout

test.describe('E2E Test Suite', () => {
  test('Simple E2E Test Flow', async ({ page }) => {
    const failedSteps = [];

    // Wrapper to run steps with error catching, logging, and screenshot capture
    const runStep = async (name, fn) => {
      try {
        console.log(`➡️ Running ${name}...`);
        await fn();
        console.log(`✅ ${name} completed\n`);
      } catch (error) {
        // Create unique screenshot filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(screenshotsDir, `${name}_${timestamp}.png`);

        try {
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`📸 Screenshot saved: ${screenshotPath}`);
        } catch (screenshotError) {
          console.error('⚠️ Failed to capture screenshot:', screenshotError);
        }

        const errorMsg = `❌ ${name} failed: ${error.message}\nStack:\n${error.stack}\nScreenshot: ${screenshotPath}`;
        console.error(errorMsg);
        failedSteps.push(errorMsg);
      }
    };

    // Set browser window size
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Log browser console errors to our log file
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🐛 Browser Console Error: ${msg.text()}`);
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      console.log(`🐛 Page Error: ${error.message}`);
    });

    console.log('🚀 Starting test suite...\n');

    // Run tests sequentially
    await runStep('login', () => login(page));
    //await runStep('entityBuilder', () => entityBuilder(page));

    await runStep('addExtractor', () => addExtractor(page));
    await runStep('updateExtractor', () => updateExtractor(page));
    await runStep('deleteExtractor', () => deleteExtractor(page));

    await runStep('addRuleset', () => addRuleset(page));
    await runStep('updateRuleset', () => updateRuleset(page));
    await runStep('deleteRuleset', () => deleteRuleset(page));

    await runStep('addShipment', () => addShipment(page));
    await runStep('updateShipment', () => updateShipment(page));

    await runStep('deleteShipment', () => deleteShipment(page));
    await runStep('definitionsTest', () => definitionsTest(page));

    // If any step failed, write failure details and throw error
    if (failedSteps.length > 0) {
      logFailureSummary(failedSteps);
      throw new Error('❗ Some steps failed. See "failed_steps.log", "test_run.log", and screenshots/ for details.');
    } else {
      console.log('🎉 All tests completed successfully!');
    }
  });
});
