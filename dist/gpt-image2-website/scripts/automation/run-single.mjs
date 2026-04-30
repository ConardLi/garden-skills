#!/usr/bin/env node
import { join, resolve } from 'node:path';
import { persistResult } from './persist-result.mjs';
import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

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

async function updateMainMapping(outputRoot, category, template, idx, prompt) {
  const mappingPath = resolve(outputRoot, '_mapping.json');
  try {
    const content = await readFile(mappingPath, 'utf8');
    const mapping = JSON.parse(content);
    
    // Find or create category item
    let item = mapping.items.find(i => i.category === category && i.template_basename === template);
    
    if (!item) {
      console.log(`[mapping] Creating new entry for ${category}/${template}`);
      item = {
        category,
        template_basename: template,
        template_md: `references/${category}/${template}.md`,
        prompt_dir: `${category}/${template}`,
        source_md: `${category}/${template}.md`,
        cases: []
      };
      mapping.items.push(item);
    }

    // Check if case already exists
    const existingCase = item.cases.find(c => c.idx === parseInt(idx));
    if (!existingCase) {
      item.cases.push({
        idx: parseInt(idx),
        title: `${template} ${idx}`,
        brief: prompt.slice(0, 100) + '...',
        format: "txt",
        file: `${category}/${template}/${idx}.txt`
      });
    }

    await writeFile(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');
    console.log(`✅ Main mapping updated: ${mappingPath}`);
  } catch (err) {
    console.error(`❌ Failed to update main mapping: ${err.message}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const adapterKind = process.env.ADAPTER ?? args.adapter ?? 'playwright';
  const prompt = args.prompt ?? 'Generate a clean product hero image with soft lighting.';
  const outputRoot = process.env.OUTPUT_ROOT ?? 'public/case';

  console.log(`▶ adapter: ${adapterKind}`);
  console.log(`▶ outputRoot: ${outputRoot}`);

  const adapter = await createAdapter(adapterKind);
  await adapter.createSession();
  await adapter.generate(prompt, { format: 'png' });
  const result = await adapter.waitForResult();

  const category = args.category ?? 'draft-category';
  const template = args.template ?? 'draft-template';
  const idx = args.idx ?? '1';

  const saved = await persistResult(outputRoot, {
    category,
    template,
    idx,
    prompt,
    imageBuffer: result.imageBuffer,
  });

  // 更新主 Mapping
  await updateMainMapping(outputRoot, category, template, idx, prompt);

  if (typeof adapter.close === 'function') {
    await adapter.close();
  }

  console.log('🚀 Triggering build:data to refresh website manifest...');
  try {
    execSync('export PATH="/usr/local/bin:$PATH" && npm run build:data', { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Build-data failed, you may need to run it manually.');
  }

  console.log('✅ run-single completed');
  console.log(JSON.stringify({ adapter: adapterKind, saved }, null, 2));
}

main().catch((error) => {
  console.error('❌ run-single failed:', error.message);
  process.exit(1);
});
