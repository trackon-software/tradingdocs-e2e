require('dotenv').config();
const config = require('../steps2.0/config2.0');

module.exports = async function login(page) {
  const { baseUrl, loginPath, homePath, selectors, timeouts } = config.login;
  await page.goto(baseUrl + loginPath, { timeout: timeouts.navigation });
  
  await page.fill(selectors.emailInput, process.env.USER_EMAIL);
  await page.fill(selectors.passwordInput, process.env.USER_PASSWORD);
  await page.click(selectors.submitButton);

  await page.waitForURL(baseUrl + homePath, { timeout: timeouts.postLoginRedirect });
  console.log('✅ Login successful');
};
