const config = require('../steps3.0/config3.0');

module.exports = async function navigateAndWait(page, sectionKey) {
  const section = config[sectionKey];

  if (!section) {
    throw new Error(`Config section "${sectionKey}" bulunamadı.`);
  }

  const baseUrl = section.baseUrl;
  const path = section.path || section.shipmentsPath || section.rulesetsPath || section.loginPath || '';
  const fullUrl = baseUrl + path;

  const timeouts = section.timeouts || {};
  const selectors = section.selectors || {};

  const waitTimeout = timeouts.pageLoad || timeouts.navigation || 10000;
  const waitSelector =
    selectors.pageTitle ||
    selectors.addButton ||
    selectors.modal ||
    selectors.pageReadySelector ||
    'body'; // fallback

  console.log(`🌐 Navigating to: ${fullUrl}`);
  await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: waitTimeout });

  console.log(`⏳ Waiting for selector: ${waitSelector}`);
  await page.waitForSelector(waitSelector, { timeout: waitTimeout });

  // Sayfanın oturması için kısa bir bekleme (isteğe bağlı)
  await page.waitForTimeout(1000);

  console.log(`✅ Page loaded for section: "${sectionKey}"`);
};


/* **************************USAGE**********************************
const navigateAndWait = require('../utils/navigateAndWait');

// example: goto ruleset page.
await navigateAndWait(page, 'ruleset');

// example: goto shipment page.
await navigateAndWait(page, 'shipment');

// example: extractors
await navigateAndWait(page, 'extractors');
*****************************USAGE**********************************/