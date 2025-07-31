const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Paths for log files
const testResultsDir = path.join(__dirname, '../test-results');
const testRunLogPath = path.join(testResultsDir, 'test_run.log');
const failedStepsLogPath = path.join(testResultsDir, 'failed_steps.log');
const failureJsonPath = path.join(testResultsDir, 'failure_summary.json');
const screenshotsDir = path.join(testResultsDir, 'screenshots');

// Ensure test-results and screenshots dir exist
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

// Logging setup
const logFile = fs.createWriteStream(testRunLogPath, { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;
console.log = (...args) => { originalLog(...args); logFile.write(args.join(' ') + '\n'); };
console.error = (...args) => { originalError(...args); logFile.write('[ERROR] ' + args.join(' ') + '\n'); };

// Failure summary
function logFailureSummary(failedSteps) {
  const log = `🧨 Test Failures:\n${failedSteps.join('\n\n')}\n`;
  fs.writeFileSync(failedStepsLogPath, log, 'utf-8');
  console.error(log);
}
function writeFailureJson(failedSteps) {
  const structured = {
    status: 'failed',
    summary: {
      total: failedSteps.length,
      passed: 0,
      failed: failedSteps.length
    },
    failedTests: failedSteps.map((msg, idx) => {
      const match = msg.match(/❌ (\w+) failed:/);
      const name = match?.[1] || `step_${idx}`;
      const screenshot = (msg.match(/Screenshot:\s*(.*\.png)/) || [])[1] || null;
      return {
        id: `${Date.now()}-${idx}`,
        name,
        description: msg.split('\n')[0],
        error: 'Stack:\n' + msg.split('Stack:\n')[1]?.split('\nScreenshot')[0],
        screenshot,
        logFile: 'test_run.log'
      };
    })
  };
  fs.writeFileSync(failureJsonPath, JSON.stringify(structured, null, 2), 'utf-8');
}

// Imports
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

test.setTimeout(300000); // 5 min

test.describe('E2E Test Suite', () => {
  test('Simple E2E Test Flow', async ({ page }) => {
    const failedSteps = [];

    const runStep = async (name, fn) => {
      try {
        console.log(`➡️ Running ${name}...`);
        await fn();
        console.log(`✅ ${name} completed\n`);
      } catch (error) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(screenshotsDir, `${name}_${timestamp}.png`);
        try {
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`📸 Screenshot saved: ${screenshotPath}`);
        } catch (err) {
          console.error('⚠️ Screenshot failed:', err);
        }
        const errorMsg = `❌ ${name} failed: ${error.message}\nStack:\n${error.stack}\nScreenshot: ${screenshotPath}`;
        console.error(errorMsg);
        failedSteps.push(errorMsg);
      }
    };

    // General setup
    await page.setViewportSize({ width: 1920, height: 1080 });
    page.on('console', msg => msg.type() === 'error' && console.log(`🐛 Browser Console Error: ${msg.text()}`));
    page.on('pageerror', error => console.log(`🐛 Page Error: ${error.message}`));

    console.log('🚀 Starting test suite...\n');

    // Test steps
    await runStep('login', () => login(page));
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
    await runStep('entityBuilder', () => entityBuilder(page));

    if (failedSteps.length > 0) {
      logFailureSummary(failedSteps);
      writeFailureJson(failedSteps);
    }

    // ✅ Playwright assertion to fail test officially for CI/CD
    expect(failedSteps.length, 'Some test steps failed').toBe(0);
    console.log('🎉 All tests completed successfully!');
  });
});
