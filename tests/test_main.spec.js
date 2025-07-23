// tests/test_main.spec.js
const { test } = require('@playwright/test');
test.setTimeout(300000); // 5 dakika timeout

// Step fonksiyonlarını içe aktar
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

// Step bağımlılıklarını tanımla
const stepsMap = {
  login: { fn: login, dependsOn: [] },
  entityBuilder: { fn: entityBuilder, dependsOn: ['login'] },
  addExtractor: { fn: addExtractor, dependsOn: ['entityBuilder'] },
  updateExtractor: { fn: updateExtractor, dependsOn: ['addExtractor'] },
  deleteExtractor: { fn: deleteExtractor, dependsOn: ['updateExtractor'] },
  addRuleset: { fn: addRuleset, dependsOn: ['addExtractor'] },
  updateRuleset: { fn: updateRuleset, dependsOn: ['addRuleset'] },
  deleteRuleset: { fn: deleteRuleset, dependsOn: ['updateRuleset'] },
  definitionsTest: { fn: definitionsTest, dependsOn: ['addRuleset'] },
  addShipment: { fn: addShipment, dependsOn: ['login'] },
  updateShipment: { fn: updateShipment, dependsOn: ['addShipment'] },
  deleteShipment: { fn: deleteShipment, dependsOn: ['updateShipment'] },
};

// Hangi adımlar çalıştırılsın (sadece bunu değiştirirsin)
const selectedSteps = [
  'login',
  'entityBuilder',
  'addExtractor',
  'addRuleset',
  'definitionsTest',
];

// Bağımlılığa göre sıralama (topolojik sort)
function resolveExecutionOrder(stepsMap, selectedSteps) {
  const visited = new Set();
  const result = [];

  function visit(stepName) {
    if (visited.has(stepName)) return;
    const step = stepsMap[stepName];
    if (!step) throw new Error(`Step not found: ${stepName}`);
    for (const dep of step.dependsOn) {
      visit(dep);
    }
    visited.add(stepName);
    result.push(stepName);
  }

  for (const step of selectedSteps) {
    visit(step);
  }

  return result;
}

// Playwright testi
test('🔄 Dynamic E2E Test Flow', async ({ page }) => {
  const orderedSteps = resolveExecutionOrder(stepsMap, selectedSteps);
  console.log('🔁 Step execution order:', orderedSteps);

  for (const stepName of orderedSteps) {
    const fn = stepsMap[stepName].fn;
    console.log(`➡️ Running step: ${stepName}`);
    await fn(page);
  }

  console.log('✅ All selected steps completed.');
});
//To change test order just modify this const selectedSteps = ['login', 'addShipment', 'updateShipment']; rest should fall into place.