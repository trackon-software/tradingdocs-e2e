require('dotenv').config({ path: './src/.env' });
const config = require('../steps2.0/config2.0');
const { expect } = require('@playwright/test');

module.exports = async function login(page) {
  const { baseUrl, loginPath, homePath, selectors, timeouts } = config.login;

  // Validate environment variables
  if (!process.env.USER_EMAIL || !process.env.USER_PASSWORD) {
    throw new Error('🚨 USER_EMAIL or USER_PASSWORD environment variables are not defined!');
  }

  // Navigate to login page and wait for it to fully load
  await page.goto(baseUrl + loginPath, { timeout: timeouts.navigation });
  await page.waitForLoadState('networkidle');

  // Fill in login credentials
  await expect(page.locator(selectors.emailInput)).toBeVisible();
  await page.fill(selectors.emailInput, process.env.USER_EMAIL);

  await expect(page.locator(selectors.passwordInput)).toBeVisible();
  await page.fill(selectors.passwordInput, process.env.USER_PASSWORD);

  // Submit login form
  await expect(page.locator(selectors.submitButton)).toBeEnabled();
  await page.click(selectors.submitButton);

  // Wait for redirect and assert correct URL
  await page.waitForURL(baseUrl + homePath, { timeout: timeouts.postLoginRedirect });
  await expect(page).toHaveURL(baseUrl + homePath);

  // Optional: verify UI element that confirms user is logged in
  if (selectors.postLoginIndicator) {
    const postLoginElement = page.locator(selectors.postLoginIndicator);
    await expect(postLoginElement).toBeVisible({ timeout: timeouts.postLoginRedirect });
  }

  console.log('✅ Login successful');
};
