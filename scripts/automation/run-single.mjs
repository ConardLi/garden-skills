#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      out[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    }
  }
  return out;
}

async function createAdapter(kind) {
  if (kind === 'opencli') {
    return import('./adapters/opencli-adapter.mjs').then((m) => m.default());
  }
  if (kind === 'playwright') {
    return import('./adapters/playwright-adapter.mjs').then((m) => m.default());
  }
  throw new Error(`Unsupported adapter: ${kind}`);
}

async function persistResult(baseDir, payload) {
  const category = payload.category ?? 'draft-category';
  const template = payload.template ?? 'draft-template';
  const idx = payload.idx ?? '1';
  const targetDir = join(baseDir, category, template);
  await mkdir(targetDir, { recursive: true });

  const promptPath = join(targetDir, `${idx}.txt`);
  const imagePath = join(targetDir, `${idx}.png`);

  await writeFile(promptPath, payload.prompt, 'utf8');
  await writeFile(imagePath, payload.imageBuffer);

  return { promptPath, imagePath };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const adapterKind = process.env.ADAPTER ?? args.adapter ?? 'opencli';
  const prompt = args.prompt ?? 'Generate a clean product hero image with soft lighting.';
  const outputRoot = process.env.OUTPUT_ROOT ?? 'public/case';

  console.log(`▶ adapter: ${adapterKind}`);
  console.log(`▶ outputRoot: ${outputRoot}`);

  const adapter = await createAdapter(adapterKind);
  await adapter.createSession();
  await adapter.generate(prompt, { format: 'png' });
  const result = await adapter.waitForResult();

  const saved = await persistResult(outputRoot, {
    category: args.category,
    template: args.template,
    idx: args.idx,
    prompt,
    imageBuffer: result.imageBuffer,
  });

  console.log('✅ run-single completed');
  console.log(JSON.stringify({ adapter: adapterKind, saved }, null, 2));
}

main().catch((error) => {
  console.error('❌ run-single failed:', error.message);
  process.exit(1);
});
