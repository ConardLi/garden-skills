/**
 * export-slide-data.ts — emit a generic `slide-data.json` for every
 * chapter, so the finished web-video-presentation can also be viewed /
 * edited in the server-side generic web viewer & editor.
 *
 * Run via:
 *   npm run export-slide-data            # writes slide-data.json
 *   npm run export-slide-data -- --print # also prints to stdout
 *
 * Reads chapter order from src/registry/chapters.ts (same regex approach
 * as extract-narrations.ts), then for each chapter:
 *
 *   • narrations.ts  — required (as today), the narration per step
 *   • slides.ts      — OPTIONAL, per-step slide metadata (SlideStepMeta)
 *
 * Merges them into the slide-data.json shape understood by the server's
 * generic viewer/editor:
 *
 *   {
 *     "title":    "…",
 *     "subtitle": "…",
 *     "chapters": [
 *       { "id": "…", "title": "…",
 *         "steps": [ { "type": "hero", "kicker": "…", … }, … ],
 *         "narrations": [ "…", … ] },
 *       …
 *     ]
 *   }
 *
 * Drift guard: when a chapter HAS slides.ts, its length MUST equal
 * narrations.length (same rule as narrations vs. the .tsx switch). A
 * chapter WITHOUT slides.ts is still exported with a coarse auto-inferred
 * `type` per step so nothing breaks.
 */
import { readFile, writeFile, access } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const REGISTRY_PATH = resolve(ROOT, "src/registry/chapters.ts");
const CHAPTERS_DIR = resolve(ROOT, "src/chapters");
const OUT_PATH = resolve(ROOT, "slide-data.json");

interface ChapterRef {
  id: string;
  title: string;
  folder: string;
}

/** Parse `src/registry/chapters.ts` to learn chapter order + titles. */
async function readChapterOrder(): Promise<ChapterRef[]> {
  const src = await readFile(REGISTRY_PATH, "utf8");

  // Pull ordered chapter {id, title} object literals (the CHAPTERS array).
  const refs: ChapterRef[] = [];
  const chunkRe = /id:\s*["']([^"']+)["'][\s\S]*?title:\s*["']([^"']*)["']/g;
  let m: RegExpExecArray | null;
  while ((m = chunkRe.exec(src)) !== null) {
    refs.push({ id: m[1]!, title: m[2] ?? "", folder: "" });
  }

  // Map id → folder. Folders are `<NN>-<id>`; fall back to plain `<id>`.
  const folders = await readdirNames();
  for (const ref of refs) {
    const folder =
      folders.find((f) => f.endsWith(`-${ref.id}`)) ??
      folders.find((f) => f === ref.id);
    if (!folder) {
      throw new Error(
        `chapter id "${ref.id}" registered but no folder found ` +
          `under src/chapters/. Expected NN-${ref.id}/ or ${ref.id}/`,
      );
    }
    ref.folder = folder;
  }
  return refs;
}

async function readdirNames(): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  try {
    return await readdir(CHAPTERS_DIR);
  } catch {
    return [];
  }
}

async function loadModule(folder: string, file: string): Promise<any | null> {
  const p = join(CHAPTERS_DIR, folder, file);
  try {
    await access(p);
  } catch {
    return null; // file absent → no module
  }
  const url = pathToFileURL(p).href;
  const mod = await import(url);
  return mod;
}

/** Infer a slide-data `type` from a narration string (coarse fallback). */
function inferType(narration: string, index: number): string {
  const t = (narration ?? "").trim();
  if (t === "") return "transition";
  if (index === 0) return "hero";
  if (/\d+(%|克|倍|kg|mg)/.test(t)) return "study";
  if (/(？|\?)/.test(t)) return "question";
  if (t.length <= 12) return "highlight";
  return "fact";
}

async function main() {
  const print = process.argv.includes("--print");
  const refs = await readChapterOrder();

  const chapters: any[] = [];
  let slidesChapters = 0;
  let inferred = 0;

  for (const ref of refs) {
    const narr = await loadModule(ref.folder, "narrations.ts");
    if (!narr || !Array.isArray(narr.narrations)) {
      throw new Error(`missing narrations array in ${ref.folder}/narrations.ts`);
    }
    const narrations: string[] = narr.narrations;

    const slides = (await loadModule(ref.folder, "slides.ts"))?.slides ?? null;

    let steps: any[];
    if (slides && Array.isArray(slides)) {
      if (slides.length !== narrations.length) {
        throw new Error(
          `chapter "${ref.id}": slides.length (${slides.length}) !== ` +
            `narrations.length (${narrations.length})`,
        );
      }
      steps = slides.map((s: any) => {
        const { type, ...fields } = s ?? {};
        return { type: type ?? "custom", ...fields };
      });
      slidesChapters++;
    } else {
      steps = narrations.map((n, i) => ({ type: inferType(n, i) }));
      inferred += narrations.length;
    }

    chapters.push({
      id: ref.id,
      title: ref.title,
      steps,
      narrations,
    });
  }

  // Title/subtitle come from an optional slide-config module, else project.
  let title = "Presentation";
  let subtitle = "";
  const cfg = await loadModule("..", "registry/slide-config.ts");
  if (cfg && cfg.slideConfig) {
    title = cfg.slideConfig.title || title;
    subtitle = cfg.slideConfig.subtitle || subtitle;
  }

  const out = { title, subtitle, chapters };
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n", "utf8");

  console.error(
    `✓ wrote slide-data.json (${chapters.length} chapters, ` +
      `${chapters.reduce((a, c) => a + c.steps.length, 0)} steps)` +
      (slidesChapters ? ` · ${slidesChapters} chapters with slides.ts` : "") +
      (inferred ? ` · ${inferred} steps auto-inferred` : ""),
  );
  console.error(`  → ${OUT_PATH}`);
  if (print) console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(`✗ ${err.message ?? err}`);
  process.exit(1);
});
