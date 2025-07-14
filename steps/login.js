require('dotenv').config();

module.exports = async function login(page) {
  await page.goto('https://demo.tradingdocs.ai/login');
  await page.fill('input[name="email"]', process.env.USER_EMAIL);
  await page.fill('input[name="password"]', process.env.USER_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('https://demo.tradingdocs.ai');
  console.log('✅ Login successful');
};
