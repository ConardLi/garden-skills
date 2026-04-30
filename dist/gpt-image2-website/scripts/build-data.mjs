#!/usr/bin/env node
// Reads website/public/case/_mapping.json + each case's prompt content + each
// template's MD source, and emits src/data/cases.json (a flat, embedded manifest).
//
// Cases live under `website/public/case/` so that Vite serves them directly
// from `/case/...` in both dev and production builds (lazy loaded by the
// browser). Run via `npm run build:data` (also fires on predev / prebuild).

import { readFile, writeFile, access, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');
const WEBSITE_ROOT = resolve(__dirname, '..');
// Case assets now live under website/public/case so they get bundled into
// the static site automatically. URLs are served at /case/<...>.
const CASES_ROOT = resolve(WEBSITE_ROOT, 'public', 'case');
const CASES_URL_PREFIX = '/case';
const SKILL_ROOT = resolve(ROOT, 'skills', 'gpt-image-2');
const OUT = resolve(__dirname, '..', 'src', 'data', 'cases.json');

// Thumbnail spec — gallery cards / hero mosaic / related strip never need
// the full 2K-3K source PNG. 800px wide WebP at q78 lands around 60–120 KB
// per image (vs. ~2-3 MB original), preserving plenty of fidelity for any
// rendered tile up to ~400px on a Retina display.
const THUMB_SUFFIX = '-thumb.webp';
const THUMB_WIDTH = 800;
const THUMB_QUALITY = 78;
const THUMB_CONCURRENCY = 6;

const CATEGORY_META = {
  'ui-mockups': { label: 'UI Mockups', cn: '介面樣機', accent: '#1F6FB2' },
  'product-visuals': { label: 'Product Visuals', cn: '產品視覺', accent: '#C7522A' },
  'maps': { label: 'Maps', cn: '地圖', accent: '#3B7A57' },
  'slides-and-visual-docs': { label: 'Slides & Docs', cn: '視覺檔案', accent: '#6A4C93' },
  'poster-and-campaigns': { label: 'Posters & Campaigns', cn: '海報營銷', accent: '#E8472C' },
  'portraits-and-characters': { label: 'Portraits', cn: '人物視覺', accent: '#8B4513' },
  'scenes-and-illustrations': { label: 'Scenes', cn: '氛圍插畫', accent: '#5E8B7E' },
  'editing-workflows': { label: 'Editing', cn: '影象編輯', accent: '#4A6FA5' },
  'avatars-and-profile': { label: 'Avatars', cn: '頭像人設', accent: '#D08C60' },
  'storyboards-and-sequences': { label: 'Storyboards', cn: '敘事序列', accent: '#A23E48' },
  'grids-and-collages': { label: 'Grids & Collages', cn: '網格拼貼', accent: '#2E7D8B' },
  'branding-and-packaging': { label: 'Branding', cn: '品牌包裝', accent: '#B8860B' },
  'typography-and-text-layout': { label: 'Typography', cn: '字型版式', accent: '#4F4F4F' },
  'assets-and-props': { label: 'Assets & Props', cn: '素材資產', accent: '#6B5B95' },
  'academic-figures': { label: 'Academic', cn: '學術配圖', accent: '#1A4E8A' },
  'infographics': { label: 'Infographics', cn: '資訊圖', accent: '#D4665A' },
  'technical-diagrams': { label: 'Technical Diagrams', cn: '技術圖示', accent: '#0A6E96' },
};

async function readSafe(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

// Generate (or reuse) a small WebP thumbnail next to the original image.
// Idempotent: if the thumb already exists and is at least as new as the
// source, we return immediately. Returns the thumb's absolute path on
// success, or null on failure (caller falls back to the original).
async function ensureThumbnail(originalPath) {
  const thumbPath = originalPath.replace(/\.png$/i, THUMB_SUFFIX);
  try {
    const origStat = await stat(originalPath);
    let thumbStat = null;
    try {
      thumbStat = await stat(thumbPath);
    } catch {}
    if (thumbStat && thumbStat.mtimeMs >= origStat.mtimeMs && thumbStat.size > 0) {
      return thumbPath;
    }
    await sharp(originalPath, { failOn: 'none' })
      .rotate() // honour EXIF orientation if any
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY, effort: 4 })
      .toFile(thumbPath);
    return thumbPath;
  } catch (err) {
    console.warn(`[thumb] skipped ${originalPath}: ${err.message}`);
    return null;
  }
}

// Tiny worker pool so we don't spawn 161 sharp pipelines simultaneously
// (each sharp call already uses libvips' internal threadpool).
async function pool(items, limit, worker) {
  const ret = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      ret[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return ret;
}

function extractTemplateSummary(md) {
  if (!md) return { description: null, signature: null };
  // Find first heading after frontmatter
  const lines = md.split('\n');
  let body = lines.slice(0);
  // strip frontmatter
  if (body[0] && body[0].trim() === '---') {
    let end = -1;
    for (let i = 1; i < body.length; i++) {
      if (body[i].trim() === '---') { end = i; break; }
    }
    if (end > 0) body = body.slice(end + 1);
  }
  const text = body.join('\n').trim();
  // Take first paragraph after the first heading
  const headingIdx = text.indexOf('\n## ');
  let intro;
  if (headingIdx >= 0) {
    const before = text.slice(0, headingIdx).trim();
    intro = before
      .replace(/^#\s+.+$/m, '')
      .split('\n').filter(l => l.trim() && !l.startsWith('#')).slice(0, 4).join('\n').trim();
  } else {
    intro = text.split('\n').filter(l => l.trim()).slice(0, 4).join('\n').trim();
  }
  return { description: intro || null, signature: null };
}

async function main() {
  const mapping = JSON.parse(await readFile(resolve(CASES_ROOT, '_mapping.json'), 'utf8'));
  const out = {
    generated_at: new Date().toISOString(),
    summary: mapping.summary,
    categories: {},
    cases: [],
    templates: {},
  };

  for (const item of mapping.items) {
    const cat = item.category;
    out.categories[cat] = out.categories[cat] || {
      key: cat,
      ...CATEGORY_META[cat],
      templates: [],
      total: 0,
      ready: 0,
    };

    const tplKey = `${cat}/${item.template_basename}`;
    const tplMd = await readSafe(resolve(SKILL_ROOT, 'references', cat, `${item.template_basename}.md`));
    const summary = extractTemplateSummary(tplMd);

    out.templates[tplKey] = {
      key: tplKey,
      category: cat,
      name: item.template_basename,
      label: item.template_basename
        .split('-').map(s => s[0].toUpperCase() + s.slice(1)).join(' '),
      md_path: item.template_md,
      description: summary.description,
      // Embed the full template MD so detail page can render it.
      content: tplMd,
      cases_count: item.cases.length,
    };
    out.categories[cat].templates.push(tplKey);

    for (const c of item.cases) {
      const promptPath = resolve(CASES_ROOT, c.file);
      const baseName = c.file.replace(/\.(json|txt)$/, '');
      const imagePath = resolve(CASES_ROOT, baseName + '.png');
      const hasImage = await exists(imagePath);
      const promptContent = await readSafe(promptPath);

      out.categories[cat].total += 1;
      if (hasImage) out.categories[cat].ready += 1;

      out.cases.push({
        id: `${cat}/${item.template_basename}/${c.idx}`,
        category: cat,
        category_label: CATEGORY_META[cat]?.cn || cat,
        category_accent: CATEGORY_META[cat]?.accent || '#666',
        template_key: tplKey,
        template_label: out.templates[tplKey].label,
        idx: c.idx,
        title: c.title,
        brief: c.brief,
        format: c.format,
        prompt_path: c.file,
        prompt_url: `${CASES_URL_PREFIX}/${c.file}`,
        prompt_content: promptContent,
        // Full original PNG — only loaded when a case detail opens.
        image_url: hasImage ? `${CASES_URL_PREFIX}/${baseName}.png` : null,
        // Filled in below by the thumbnail pass.
        thumb_url: null,
        // Side-channel used by the thumbnail pass; stripped before write.
        _imagePath: hasImage ? imagePath : null,
        _baseName: baseName,
        has_image: hasImage,
      });
    }
  }

  // ---------------- Thumbnail pass ----------------
  const withImages = out.cases.filter((c) => c._imagePath);
  if (withImages.length > 0) {
    let generated = 0;
    let reused = 0;
    const t0 = Date.now();
    await pool(withImages, THUMB_CONCURRENCY, async (c) => {
      const before = existsSync(c._imagePath.replace(/\.png$/i, THUMB_SUFFIX));
      const thumbAbs = await ensureThumbnail(c._imagePath);
      if (thumbAbs) {
        c.thumb_url = `${CASES_URL_PREFIX}/${c._baseName}${THUMB_SUFFIX}`;
        if (before) reused += 1;
        else generated += 1;
      }
    });
    console.log(
      `  thumbs: ${generated} generated, ${reused} reused (${Date.now() - t0}ms)`,
    );
  }
  // Strip private fields before serialising.
  for (const c of out.cases) {
    delete c._imagePath;
    delete c._baseName;
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2));

  // Also pull skill SKILL.md content for the skills page
  const skillMd = await readSafe(resolve(SKILL_ROOT, 'SKILL.md'));
  const introMd = await readSafe(resolve(ROOT, 'doc', 'img2.md'));
  const meta = {
    skill_md: skillMd,
    intro_md: introMd,
    generated_at: out.generated_at,
  };
  await writeFile(resolve(__dirname, '..', 'src', 'data', 'docs.json'), JSON.stringify(meta, null, 2));

  console.log(`✔ wrote ${OUT}`);
  console.log(`  ${out.cases.length} cases, ${Object.keys(out.templates).length} templates`);
  const ready = out.cases.filter(c => c.has_image).length;
  console.log(`  ${ready} / ${out.cases.length} have images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
