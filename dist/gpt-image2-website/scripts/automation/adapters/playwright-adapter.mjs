import { chromium } from 'playwright';
import http from 'node:http';

async function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/json/version`, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(true));
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

export default function createPlaywrightAdapter() {
  let browser = null;
  let page = null;
  const CDP_URL = 'http://127.0.0.1:9000';

  return {
    async createSession() {
      console.log(`[playwright] Checking for Chrome at ${CDP_URL}...`);
      
      const isOpen = await isPortOpen(9000);
      if (!isOpen) {
        throw new Error('Chrome remote debugging port 9000 is NOT open. Please run Chrome with --remote-debugging-port=9000 first.');
      }

      try {
        browser = await chromium.connectOverCDP(CDP_URL);
        const context = browser.contexts()[0];
        page = context.pages()[0] || (await context.newPage());
        console.log('[playwright] Connected to existing Chrome session.');
      } catch (err) {
        console.error('[playwright] Connection failed:', err.message);
        throw err;
      }
    },

    async generate(prompt) {
      if (!page) throw new Error('Session not initialized');
      
      console.log(`[playwright] Navigating to ChatGPT...`);
      await page.goto('https://chatgpt.com/?model=gpt-4o');
      
      // 等待輸入框並輸入
      const selector = 'textarea#prompt-textarea';
      await page.waitForSelector(selector, { timeout: 10000 });
      await page.fill(selector, `Generate an image of: ${prompt}`);
      await page.keyboard.press('Enter');
      
      console.log('[playwright] Prompt sent. Waiting for generation...');
    },

    async waitForResult() {
      // 這裡簡單模擬等待圖片出現並抓取
      // 在真實環境中，這需要更複雜的 DOM 監聽
      await page.waitForTimeout(15000); 
      console.log('[playwright] Assuming generation finished.');
      return { imageBuffer: Buffer.from([]) }; // 暫時回傳空，供測試路徑
    },

    async close() {
      if (browser) await browser.close();
    }
  };
}
