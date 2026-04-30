import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

const AUTH_PATH = resolve(process.cwd(), 'chatgpt-auth');

async function login() {
  if (!existsSync(AUTH_PATH)) {
    mkdirSync(AUTH_PATH, { recursive: true });
  }

  console.log('🚀 Starting browser for login...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: existsSync(resolve(AUTH_PATH, 'state.json')) ? resolve(AUTH_PATH, 'state.json') : undefined
  });

  const page = await context.newPage();
  await page.goto('https://chatgpt.com/?model=gpt-4');

  console.log('ℹ️  Please login manually in the opened browser window.');
  console.log('ℹ️  Once you see the chat interface, the script will save your session and close.');

  try {
    // Wait for the prompt textarea which indicates we are logged in and ready
    await page.waitForSelector('#prompt-textarea', { timeout: 300000 }); // 5 minutes timeout
    
    console.log('✅ Login detected! Saving storage state...');
    await context.storageState({ path: resolve(AUTH_PATH, 'state.json') });
    console.log(`✅ State saved to ${resolve(AUTH_PATH, 'state.json')}`);
  } catch (err) {
    console.error('❌ Login timeout or failed.');
  } finally {
    await browser.close();
  }
}

login().catch(console.error);
