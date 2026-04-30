import { execSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync } from 'node:fs';

export default function createOpenCliAdapter() {
  let lastImageFile = null;
  const OPENCLI_EXEC = 'node /Users/christianwu/opencli/dist/src/main.js';

  return {
    async createSession() {
      console.log('[opencli] Ready to use ChatGPT Web-UI Image Generation');
    },

    async generate(prompt, options = {}) {
      const tempDir = resolve(tmpdir(), `opencli-gen-${Date.now()}`);
      mkdirSync(tempDir, { recursive: true });
      
      console.log(`[opencli] Generating image via ChatGPT Web UI...`);
      
      try {
        // 使用 chatgpt image 指令，並指定 --op (output path)
        // 注意：OpenCLI 的 image 指令會自動處理導航、輸入、等待和下載
        const cmd = `export PATH="/usr/local/bin:$PATH" && ${OPENCLI_EXEC} chatgpt image "${prompt.replace(/"/g, '\\"')}" --op ${tempDir} --cdp http://127.0.0.1:9000`;
        
        console.log(`[opencli] Executing: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
        
        // 找出生成的檔案
        const files = await readdir(tempDir);
        const imageFile = files.find(f => f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.jpg'));
        
        if (imageFile) {
          lastImageFile = join(tempDir, imageFile);
          console.log('[opencli] Successfully caught generated image:', lastImageFile);
        } else {
          throw new Error('OpenCLI executed but no image file was found in output directory.');
        }
        
      } catch (err) {
        console.error('[opencli] Web-UI Image Generation failed:', err.message);
        throw err;
      }
    },

    async waitForResult() {
      if (!lastImageFile) throw new Error('No result image found');
      const buffer = await readFile(lastImageFile);
      return { imageBuffer: buffer };
    },
    
    async close() {
      console.log('[opencli] OpenCLI adapter session closed.');
    }
  };
}
