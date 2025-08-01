const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Format current timestamp in Dubai time
const getDubaiTime = () => {
  return new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dubai',
    hour12: false
  }).replace(',', '').replace(/[:/]/g, '-').replace(/\s/g, '_');
};

const timestampForFilename = getDubaiTime();

// Define output paths
const testResultsDir = path.join(__dirname, '../test-results');
const screenshotsDir = path.join(testResultsDir, 'screenshots');

if (!fs.existsSync(testResultsDir)) fs.mkdirSync(testResultsDir);
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

// Define filenames with timestamp
const testRunLogPath = path.join(testResultsDir, `test_run_${timestampForFilename}.log`);
const failedStepsLogPath = path.join(testResultsDir, `failed_steps_${timestampForFilename}.log`);
const failureJsonPath = path.join(testResultsDir, `failure_summary_${timestampForFilename}.json`);

// Open test_run log stream
const logFile = fs.createWriteStream(testRunLogPath, { flags: 'a' });

// Timestamp prefix
const nowDubai = () =>
  `[⏱ ${new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dubai',
    hour12: false
  }).replace(',', '')}]`;

// Custom logger overrides
const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  const message = `${nowDubai()} [INFO] ${args.join(' ')}`;
  originalLog(message);
  logFile.write(message + '\n');
};

console.error = (...args) => {
  const message = `${nowDubai()} [ERROR] ${args.join(' ')}`;
  originalError(message);
  logFile.write(message + '\n');
};

// Write failure logs
function logFailureSummary(failedSteps) {
  const log = `🧨 Test Failures:\n${failedSteps.join('\n\n')}\n`;
  fs.writeFileSync(failedStepsLogPath, log, 'utf-8');
  console.error(log);
}

// Write failure JSON
function writeFailureJson(failedSteps) {
  const structured = {
    status: 'failed',
    summary: {
      total: failedSteps.length,
      passed: 0,
      failed: failedSteps.length,
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
        logFile: path.basename(testRunLogPath),
      };
    }),
  };
  fs.writeFileSync(failureJsonPath, JSON.stringify(structured, null, 2), 'utf-8');
}

// Import all steps
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

test.setTimeout(300000); // 5 minutes

test.describe('E2E Test Suite', () => {
  test('Simple E2E Test Flow', async ({ page }) => {
    const failedSteps = [];

    const runStep = async (name, fn) => {
      try {
        console.log(`[STEP] Running ${name}...`);
        await fn();
        console.log(`[SUCCESS] ${name} completed`);
      } catch (error) {
        const timeForFile = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(screenshotsDir, `${name}_${timeForFile}.png`);

        try {
          await page.screenshot({ path: screenshotPath, fullPage: true });
          console.log(`[SCREENSHOT] Saved at: ${screenshotPath}`);
        } catch (screenshotError) {
          console.error('⚠️ Failed to capture screenshot:', screenshotError);
        }

        const errorMsg = `❌ ${name} failed: ${error.message}\nStack:\n${error.stack}\nScreenshot: ${screenshotPath}`;
        console.error(errorMsg);
        failedSteps.push(errorMsg);
      }
    };

    await page.setViewportSize({ width: 1920, height: 1080 });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`[BrowserConsole] ${msg.text()}`);
      }
    });

    page.on('pageerror', (err) => {
      console.log(`[PageError] ${err.message}`);
    });

    console.log('🚀 Starting test suite...\n');

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
      throw new Error('❗ Some steps failed. See the latest test-results/ files for details.');
    } else {
      console.log('🎉 All tests completed successfully!');
    }
  });
});
