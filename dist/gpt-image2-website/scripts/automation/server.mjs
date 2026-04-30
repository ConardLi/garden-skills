import http from 'http';
import { exec } from 'node:child_process';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

import { saveMarkdown, listArchive, readArchive } from '../prompt-archive.mjs';
import { getSkillTemplatePath } from './safe-paths.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const PORT = 3001;
const PROJECT_ROOT = resolve(__dirname, '../..'); 

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);

      // API: POST /generate
      if (req.method === 'POST' && url.pathname === '/generate') {
        const payload = JSON.parse(body || '{}');
        const { prompt, category, template, idx, adapter } = payload;

        if (!prompt) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Prompt is required' }));
          return;
        }

        console.log(`[bridge] Request received: ${template} (${idx})`);
        const cmd = `ADAPTER=${adapter || 'playwright'} node scripts/automation/run-single.mjs --prompt "${prompt.replace(/"/g, '\\"')}" --category "${category}" --template "${template}" --idx "${idx}"`;

        console.log(`[bridge] Executing: ${cmd}`);

        exec(cmd, { cwd: PROJECT_ROOT }, (error, stdout, stderr) => {
          if (error) {
            console.error(`[bridge] Error: ${error.message}`);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
          console.log(`[bridge] Success: ${stdout}`);
          res.end(JSON.stringify({ status: 'success', output: stdout }));
        });
        return;
      }

      // API: POST /save-prompt
      if (req.method === 'POST' && url.pathname === '/save-prompt') {
        const payload = JSON.parse(body || '{}');
        const { category, template, args, prompt: renderedPrompt, format, tags } = payload;
        
        if (!renderedPrompt || !category || !template) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }

        const timestamp = new Date().toISOString();
        const slug = `${category}-${template}-${Date.now()}`;
        
        const archivePath = await saveMarkdown(category, template, slug, {
          category,
          template,
          slug,
          timestamp,
          format,
          tags: tags || [],
          args
        }, renderedPrompt);

        res.end(JSON.stringify({ ok: true, path: archivePath, slug }));
        return;
      }

      // API: GET /list-archive
      if (req.method === 'GET' && url.pathname === '/list-archive') {
        const category = url.searchParams.get('category');
        const template = url.searchParams.get('template');
        const q = url.searchParams.get('q');

        let entries = await listArchive();

        if (category) entries = entries.filter(e => e.category === category);
        if (template) entries = entries.filter(e => e.template === template);
        if (q) {
          const lowerQ = q.toLowerCase();
          entries = entries.filter(e => 
            JSON.stringify(e).toLowerCase().includes(lowerQ) ||
            (e.renderedPrompt && e.renderedPrompt.toLowerCase().includes(lowerQ))
          );
        }

        res.end(JSON.stringify({ entries }));
        return;
      }

      // API: GET /load-template-md
      if (req.method === 'GET' && url.pathname === '/load-template-md') {
        const category = url.searchParams.get('category');
        const template = url.searchParams.get('template');

        if (!category || !template) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Category and template are required' }));
          return;
        }

        const templatePath = getSkillTemplatePath(category, template);
        const md = readFileSync(templatePath, 'utf8');
        
        // Simple regex to extract placeholders for the UI
        const placeholders = Array.from(new Set(md.match(/{([^}:]+)(?::[^}]+)?}/g) || []))
          .map(m => m.substring(1, m.indexOf(':') > -1 ? m.indexOf(':') : m.length - 1));

        res.end(JSON.stringify({ md, placeholders }));
        return;
      }

      // 404
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not Found' }));

    } catch (err) {
      console.error('[bridge] Server Error:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Automation Bridge running at http://localhost:${PORT}`);
});
