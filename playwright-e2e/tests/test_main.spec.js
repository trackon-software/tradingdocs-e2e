const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

test.setTimeout(300000); // 5 minutes timeout

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

// Step definitions
const stepsMap = {
  login: { fn: login, dependsOn: [], timeout: 30000 },
  entityBuilder: { fn: entityBuilder, dependsOn: ['login'], timeout: 60000 },
  addExtractor: { fn: addExtractor, dependsOn: ['entityBuilder'], timeout: 45000 },
  updateExtractor: { fn: updateExtractor, dependsOn: ['addExtractor'], timeout: 30000 },
  deleteExtractor: { fn: deleteExtractor, dependsOn: ['updateExtractor'], timeout: 30000 },
  addRuleset: { fn: addRuleset, dependsOn: ['addExtractor'], timeout: 45000 },
  updateRuleset: { fn: updateRuleset, dependsOn: ['addRuleset'], timeout: 30000 },
  deleteRuleset: { fn: deleteRuleset, dependsOn: ['updateRuleset'], timeout: 30000 },
  definitionsTest: { fn: definitionsTest, dependsOn: ['addRuleset'], timeout: 60000 },
  addShipment: { fn: addShipment, dependsOn: ['login'], timeout: 45000 },
  updateShipment: { fn: updateShipment, dependsOn: ['addShipment'], timeout: 30000 },
  deleteShipment: { fn: deleteShipment, dependsOn: ['updateShipment'], timeout: 30000 },
};

// Selected steps to run
const selectedSteps = [
  'login',
  'entityBuilder',
  'addExtractor',
  'addRuleset',
  'definitionsTest',
  'addShipment',
  'updateShipment',
  'deleteShipment',
];

// Resolve execution order with dependency handling
function resolveExecutionOrder(stepsMap, selectedSteps) {
  const visited = new Set();
  const visiting = new Set();
  const result = [];

  function visit(stepName, path = []) {
    if (visiting.has(stepName)) {
      throw new Error(`Circular dependency detected: ${[...path, stepName].join(' -> ')}`);
    }

    if (visited.has(stepName)) return;

    const step = stepsMap[stepName];
    if (!step) {
      throw new Error(`Step not found: ${stepName}. Available steps: ${Object.keys(stepsMap).join(', ')}`);
    }

    visiting.add(stepName);

    for (const dep of step.dependsOn) {
      visit(dep, [...path, stepName]);
    }

    visiting.delete(stepName);
    visited.add(stepName);
    result.push(stepName);
  }

  for (const step of selectedSteps) {
    visit(step);
  }

  return result;
}

// Save test results to a file
async function saveTestResults(results, filename = '.last-run.json') {
  try {
    const filePath = path.resolve(filename);
    await fs.writeFile(filePath, JSON.stringify(results, null, 2));
    console.log(`📄 Test results saved to ${filePath}`);
  } catch (error) {
    console.warn(`⚠️ Failed to save test results: ${error.message}`);
  }
}

// Execute a single step with error handling
async function executeStep(stepName, stepConfig, page, context = {}) {
  const startTime = Date.now();

  try {
    await page.setDefaultTimeout(stepConfig.timeout || 30000);
    console.log(`➡️ Executing: ${stepName} (timeout: ${stepConfig.timeout}ms)`);
    const result = await stepConfig.fn(page, context);
    const duration = Date.now() - startTime;
    console.log(`✅ ${stepName} completed in ${duration}ms`);
    return { step: stepName, status: 'PASSED', duration, result };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ ${stepName} failed after ${duration}ms: ${error.message}`);
    try {
      const screenshotPath = `./test-results/failure-${stepName}-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Failure screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      console.warn(`⚠️ Failed to take screenshot: ${screenshotError.message}`);
    }
    return { step: stepName, status: 'FAILED', duration, error: error.message };
  }
}

// Main test suite
test.describe('E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🐛 Browser Console Error: ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      console.log(`🐛 Page Error: ${error.message}`);
    });
  });

  test('🔄 Dynamic E2E Test Flow', async ({ page }) => {
    const orderedSteps = resolveExecutionOrder(stepsMap, selectedSteps);
    console.log('🔁 Execution order:', orderedSteps);
    console.log('🚀 Starting test suite...\n');

    const results = [];
    const context = {};
    let firstFailure = null;

    for (const stepName of orderedSteps) {
      const stepConfig = stepsMap[stepName];
      const result = await executeStep(stepName, stepConfig, page, context);
      results.push(result);

      if (result.status === 'FAILED' && !firstFailure) {
        firstFailure = result;
      }

      if (result.result) {
        context[stepName] = result.result;
      }

      console.log(''); // Empty line for readability
    }

    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'PASSED').length,
      failed: results.filter(r => r.status === 'FAILED').length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
    };

    console.log('='.repeat(60));
    console.log('📊 TEST SUITE SUMMARY');
    console.log('='.repeat(60));
    results.forEach(result => {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      const duration = `(${result.duration}ms)`;
      console.log(`${status} ${result.step.padEnd(20)} ${result.status.padEnd(6)} ${duration}`);
    });
    console.log('='.repeat(60));
    console.log(`📈 Total: ${summary.total} | ✅ Passed: ${summary.passed} | ❌ Failed: ${summary.failed}`);
    console.log(`⏱️ Total Duration: ${(summary.totalDuration / 1000).toFixed(2)}s`);

    if (summary.failed > 0) {
      console.log(`\n🔧 Failed tests requiring attention:`);
      results.filter(r => r.status === 'FAILED').forEach(r => console.log(`   • ${r.step}: ${r.error}`));
    }

    await saveTestResults({ summary, results, orderedSteps });

    if (summary.failed > 0) {
      throw new Error(`Test suite failed: ${summary.failed} steps failed. First failure in "${firstFailure.step}": ${firstFailure.error}`);
    }

    console.log('🎉 All tests completed successfully!');
  });
});