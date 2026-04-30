#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { persistResult } from './persist-result.mjs';

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const adapterKind = process.env.ADAPTER ?? args.adapter ?? 'opencli';
  const outputRoot = process.env.OUTPUT_ROOT ?? 'public/case';
  const listFile = args.list ?? 'config/batch.json';

  console.log(`▶ run-batch starting`);
  console.log(`▶ adapter: ${adapterKind}`);
  console.log(`▶ list file: ${listFile}`);
  console.log(`▶ outputRoot: ${outputRoot}`);

  let tasks = [];
  try {
    const content = await readFile(listFile, 'utf8');
    tasks = JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to read list file: ${error.message}`);
    process.exit(1);
  }

  if (!Array.isArray(tasks)) {
    console.error(`❌ List file must contain a JSON array of tasks.`);
    process.exit(1);
  }

  console.log(`▶ Found ${tasks.length} tasks.`);

  const adapter = await createAdapter(adapterKind);
  await adapter.createSession();

  let successCount = 0;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`\n--- Task ${i + 1}/${tasks.length}: ${task.category}/${task.template} ---`);
    try {
      await adapter.generate(task.prompt, { format: 'png' });
      const result = await adapter.waitForResult();

      await persistResult(outputRoot, {
        category: task.category,
        template: task.template,
        idx: task.idx ?? '1',
        prompt: task.prompt,
        imageBuffer: result.imageBuffer,
      });
      console.log(`✅ Task ${i + 1} succeeded.`);
      successCount++;
    } catch (err) {
      console.error(`❌ Task ${i + 1} failed: ${err.message}`);
      // In a real robust implementation, maybe retry logic here
    }
  }

  if (typeof adapter.close === 'function') {
    await adapter.close();
  }

  console.log(`\n✅ run-batch completed: ${successCount}/${tasks.length} tasks succeeded.`);
}

main().catch((error) => {
  console.error('❌ run-batch failed:', error.message);
  process.exit(1);
});
