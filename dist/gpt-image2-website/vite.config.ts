import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const PUBLIC_DIR = resolve(__dirname, 'public');
const CASES_DIR = resolve(PUBLIC_DIR, 'case');
const SKILL_DIR = resolve(__dirname, '..', '..', 'skills', 'gpt-image-2');

// Skip these names anywhere in the public/ tree when copying to dist/. The
// case folder is a snapshot of an upstream repo, so it carries a `.git/`
// subdirectory whose pack files have read-only permissions that break Vite's
// default recursive copy with `EPERM`.
const PUBLIC_COPY_EXCLUDES = new Set([
  '.git',
  '.DS_Store',
  'Thumbs.db',
  '.gitignore',
  '.gitattributes',
]);

// Replace Vite's default `public/` -> `dist/` copy with one that skips the
// excluded names above. Activated only during `vite build`.
function safePublicCopy(): Plugin {
  return {
    name: 'safe-public-copy',
    apply: 'build',
    config() {
      return { build: { copyPublicDir: false } };
    },
    async closeBundle() {
      if (!existsSync(PUBLIC_DIR)) return;
      const outDir = resolve(__dirname, 'dist');
      await cp(PUBLIC_DIR, outDir, {
        recursive: true,
        dereference: true,
        force: true,
        errorOnExist: false,
        filter: (src) => {
          const segments = src
            .replace(PUBLIC_DIR, '')
            .split(/[\\/]/)
            .filter(Boolean);
          return !segments.some((seg) => PUBLIC_COPY_EXCLUDES.has(seg));
        },
      });
      // Defensive: even if the platform's cp ignored the filter for any
      // reason, ensure these never make it to the deployable output.
      for (const name of PUBLIC_COPY_EXCLUDES) {
        const stale = resolve(outDir, 'case', name);
        if (existsSync(stale)) {
          await rm(stale, { recursive: true, force: true });
        }
      }
    },
  };
}

// API Middleware to bridge local UI with Playwright/OpenCLI runner scripts
function generationApiMiddleware(): Plugin {
  return {
    name: 'generation-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/generate' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const { prompt, category, template, idx } = payload;
              
              if (!prompt) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Prompt is required' }));
                return;
              }

              const args = ['run', 'auto:single:pw', '--', '--prompt', prompt];
              if (category) args.push('--category', category);
              if (template) args.push('--template', template);
              if (idx) args.push('--idx', idx);

              const child = spawn('npm', args, {
                cwd: __dirname,
                stdio: ['ignore', 'pipe', 'pipe'],
                shell: true // Ensure cross-platform shell support
              });

              child.on('error', (spawnErr) => {
                console.error('[vite] Spawn error:', spawnErr);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: 'Failed to start automation script' }));
              });

              let stdout = '';
              let stderr = '';
              child.stdout.on('data', data => (stdout += data.toString()));
              child.stderr.on('data', data => (stderr += data.toString()));

              child.on('close', code => {
                if (code === 0) {
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, message: 'Image generated successfully', stdout }));
                } else {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: 'Generation failed', stderr }));
                }
              });
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        if (req.url === '/api/archive' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body);
              const { category, template, filename, content, args } = payload;
              
              if (!content || !category || !template) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing required fields' }));
                return;
              }

              // Archive path: archives/<category>/<template>/<timestamp>_<filename>.json
              const archiveDir = resolve(__dirname, 'archives', category, template);
              if (!existsSync(archiveDir)) {
                const { mkdir } = await import('node:fs/promises');
                await mkdir(archiveDir, { recursive: true });
              }

              const { writeFile } = await import('node:fs/promises');
              const finalFilename = `${Date.now()}_${filename || 'custom'}.json`;
              const filePath = resolve(archiveDir, finalFilename);
              
              await writeFile(filePath, JSON.stringify({
                generated_at: new Date().toISOString(),
                category,
                template,
                args,
                content
              }, null, 2));

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, path: filePath }));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

// Dev-only watcher that regenerates src/data/cases.json whenever a case
// asset (image, JSON, txt, or _mapping.json) changes. New images appearing
// under public/case/ flow into the page via HMR without a manual rebuild.
function casesDataWatcher(): Plugin {
  let pending: NodeJS.Timeout | null = null;
  let running = false;
  let queued = false;

  const runBuild = (server: ViteDevServer) => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    const child = spawn(
      process.execPath,
      [resolve(__dirname, 'scripts', 'build-data.mjs')],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let stderr = '';
    child.stderr.on('data', (b) => (stderr += b.toString()));
    child.stdout.on('data', (b) => {
      const s = b.toString().trim();
      if (s) server.config.logger.info(`[case] ${s.split('\n').pop()}`);
    });
    child.on('close', (code) => {
      running = false;
      if (code !== 0) {
        server.config.logger.error(
          `[case] build-data exited with ${code}\n${stderr}`,
        );
      }
      if (queued) {
        queued = false;
        runBuild(server);
      }
    });
  };

  const schedule = (server: ViteDevServer) => {
    if (pending) clearTimeout(pending);
    // Debounce — when a batch of images is dropped in we only rebuild once.
    pending = setTimeout(() => {
      pending = null;
      runBuild(server);
    }, 250);
  };

  return {
    name: 'cases-data-watcher',
    configureServer(server) {
      server.watcher.add([
        resolve(CASES_DIR, '_mapping.json'),
        resolve(CASES_DIR, '**', '*.{png,jpg,jpeg,webp,json,txt}'),
        resolve(SKILL_DIR, 'references', '**', '*.md'),
      ]);
      const onChange = (file: string) => {
        // Avoid an infinite loop: build-data writes *-thumb.webp itself.
        if (file.endsWith('-thumb.webp')) return;
        if (
          file.startsWith(CASES_DIR) ||
          file.startsWith(resolve(SKILL_DIR, 'references'))
        ) {
          schedule(server);
        }
      };
      server.watcher.on('add', onChange);
      server.watcher.on('change', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}

export default defineConfig({
  plugins: [react(), safePublicCopy(), casesDataWatcher(), generationApiMiddleware()],
  server: {
    fs: {
      allow: ['..', '../..'],
    },
  },
  resolve: {
    preserveSymlinks: false,
  },
});
