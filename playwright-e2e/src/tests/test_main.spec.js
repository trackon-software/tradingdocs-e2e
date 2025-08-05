const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Timestamp helpers
const getDubaiTime = () => new Date().toLocaleString('en-GB', {
  timeZone: 'Asia/Dubai',
  hour12: false
}).replace(',', '').replace(/[:/]/g, '-').replace(/\s/g, '_');
const timestampForFilename = getDubaiTime();

// Paths
const rootDir = path.join(__dirname, '../');
const testResultsDir = path.join(rootDir, 'test-results');
const screenshotsDir = path.join(testResultsDir, 'screenshots');
if (!fs.existsSync(testResultsDir)) fs.mkdirSync(testResultsDir);
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

// Log file paths
const testRunLogPath = path.join(testResultsDir, `test_run_${timestampForFilename}.log`);
const failedStepsLogPath = path.join(testResultsDir, `failed_steps_${timestampForFilename}.log`);
const failureJsonPath = path.join(testResultsDir, `failure_summary_${timestampForFilename}.json`);
const logFile = fs.createWriteStream(testRunLogPath, { flags: 'a' });

// Timestamp formatter
const nowDubai = () => `[⏱ ${new Date().toLocaleString('en-GB', {
  timeZone: 'Asia/Dubai',
  hour12: false
}).replace(',', '')}]`;

// Override console
const originalLog = console.log;
const originalError = console.error;
console.log = (...args) => {
  const msg = `${nowDubai()} [INFO] ${args.join(' ')}`;
  originalLog(msg);
  logFile.write(msg + '\n');
};
console.error = (...args) => {
  const msg = `${nowDubai()} [ERROR] ${args.join(' ')}`;
  originalError(msg);
  logFile.write(msg + '\n');
};

// Error summary writers
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

// ✅ STEP IMPORTS
const login = require('../steps3.0/login');
const addShipment = require('../steps3.0/addShipment');
const uploadFile = require('../steps3.0/uploadFile');
const captureDocument = require('../steps3.0/captureDocument');
const { complyShipment } = require('../steps3.0/complyShipment');
const checkDiscrepancies = require('../steps/checkDiscrepancies');
const definitionsTest = require('../steps2.0/definitionsTest');
const deleteShipment = require('../steps2.0/deleteShipment');
const updateShipment = require('../steps2.0/updateShipment');
const addExtractor = require('../steps2.0/addExtractor');
const updateExtractor = require('../steps2.0/updateExtractor');
const deleteExtractor = require('../steps2.0/deleteExtractor');
const addRuleset = require('../steps2.0/addRuleset');
const updateRuleset = require('../steps2.0/updateRuleset');
const deleteRuleset = require('../steps2.0/deleteRuleset');
const entityBuilder = require('../steps2.0/entityBuilder');


test.setTimeout(300000); // 5 mins timeout

test.describe('E2E Test Suite v3.0', () => {
  test('Full flow test', async ({ page }) => {
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
    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`[BrowserConsole] ${msg.text()}`);
    });
    page.on('pageerror', err => {
      console.log(`[PageError] ${err.message}`);
    });

    console.log('🚀 Starting E2E flow...\n');

    /* Run each step (Uncomment the ones you'd like to run. know that for CRUDS it goes add->update->delete) 
    and for "AI testing" you need to run addShipment first if there isn't a shipment created lastly, without login no other test will run. */
    await runStep('login', () => login(page));
    //await runStep('addShipment', () => addShipment(page));
    //await runStep('uploadFile', () => uploadFile(page));
    //await runStep('captureDocument', () => captureDocument(page));
    //await runStep('complyShipment', () => complyShipment(page));
    //await runStep('checkDiscrepancies', () => checkDiscrepancies(page));
    await runStep('definitionsTest', () => definitionsTest(page));
    //await runStep('updateShipment', () => updateShipment(page));
    //await runStep('deleteShipment', () => deleteShipment(page));
    //await runStep('addRuleset', () => addRuleset(page));
    //await runStep('updateRuleset', () => updateRuleset(page));
    //await runStep('deleteRuleset', () => deleteRuleset(page));
    //await runStep('addExtractor', () => addExtractor(page));
    //await runStep('updateExtractor', () => updateExtractor(page));
    //await runStep('deleteExtractor', () => deleteExtractor(page));
    //await runStep('entityBuilder', () => entityBuilder(page));
    

    if (failedSteps.length > 0) {
      logFailureSummary(failedSteps);
      writeFailureJson(failedSteps);
      throw new Error('❗ Some steps failed. See test-results/ for details.');
    } else {
      console.log('🎉 All tests passed successfully!');
    }
  });
});
//NOTE
/* function call to run a test example await runStep('script name', () => scriptname(page)); */