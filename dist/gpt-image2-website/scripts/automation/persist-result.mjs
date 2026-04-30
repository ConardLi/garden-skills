import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';

export async function persistResult(baseDir, payload) {
  const category = payload.category ?? 'draft-category';
  const template = payload.template ?? 'draft-template';
  const idx = payload.idx ?? '1';
  
  const targetDir = join(baseDir, category, template);
  await mkdir(targetDir, { recursive: true });

  const promptPath = join(targetDir, `${idx}.txt`);
  const imagePath = join(targetDir, `${idx}.png`);

  await writeFile(promptPath, payload.prompt, 'utf8');
  await writeFile(imagePath, payload.imageBuffer);

  // Update _mapping.json in the category directory if it exists or create one
  const mappingPath = join(baseDir, category, '_mapping.json');
  let mapping = {};
  if (existsSync(mappingPath)) {
    try {
      const content = await readFile(mappingPath, 'utf8');
      mapping = JSON.parse(content);
    } catch (e) {
      console.warn(`[persist] Failed to read ${mappingPath}, starting fresh.`);
    }
  }

  // Update mapping for this template
  if (!mapping[template]) {
    mapping[template] = {
      title: template.replace(/-/g, ' '),
      description: `Generated ${template}`
    };
  }

  await writeFile(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');

  return { promptPath, imagePath, mappingPath };
}
