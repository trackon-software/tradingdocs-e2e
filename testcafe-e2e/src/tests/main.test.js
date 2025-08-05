require('dotenv').config({ path: './src/.env' });
import { login } from '../steps/login.js';
import { addExtractor } from '../steps/addExtractor.js';
import { updateExtractor } from '../steps/updateExtractor.js';
// import { deleteExtractor } from '../steps/deleteExtractor.js';

fixture('E2E Extractor Flow')
  .page('https://demo.tradingdocs.ai/extractors');

test('Run Extractor CRUD Steps', async t => {
  await login();
  await addExtractor();
  await updateExtractor();
  //await deleteExtractor();
});
