import { Selector, t } from 'testcafe';

export async function login() {
  const username = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;

  // Selectors
  const userInput = Selector('input[name="email"]');
  const passInput = Selector('input[name="password"]');
  const loginBtn = Selector('button').withText('Login');
  const dashboardGreeting = Selector('div').withText(/Welcome Back/i);

  // Assert presence and visibility
  await t.expect(userInput.exists).ok('❌ Email input not found');
  await t.expect(passInput.exists).ok('❌ Password input not found');
  await t.expect(loginBtn.exists).ok('❌ Login button not found');

  await t
    .typeText(userInput, username, { paste: true })
    .typeText(passInput, password, { paste: true })
    .click(loginBtn);

  // Assert dashboard loaded
  await t.expect(dashboardGreeting.exists).ok('❌ Dashboard welcome message not found after login', { timeout: 10000 });

  // Manual navigation to Extractors page
  await t.navigateTo('https://demo.tradingdocs.ai/extractors');

  const extractorPageTitle = Selector('h3.page-title').withText(/Extractors/i);
  await t.expect(extractorPageTitle.exists).ok('❌ Failed to load Extractors page', { timeout: 10000 });

  console.log('✅ Login and navigation successful');
}
