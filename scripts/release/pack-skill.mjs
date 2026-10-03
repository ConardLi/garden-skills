#!/usr/bin/env node
// Build a release zip for one or all skills.
//
// Usage:
//   node scripts/release/pack-skill.mjs --skill web-design-engineer
//   node scripts/release/pack-skill.mjs --skill web-design-engineer --version 1.2.0
//   node scripts/release/pack-skill.mjs --all
//
// Output (default): dist/release/<skill>-<version>.zip + .sha256
// Override out dir with --out <dir>.
//
// The zip's top-level entry is always "<skill>/" so users can extract straight
// into .claude/skills/, .agents/skills/, etc.

import { mkdir, rm, writeFile, readFile, stat as statFile } from "node:fs/promises";
import { existsSync, createReadStream, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import {
  REPO_ROOT,
  SKILLS_DIR,
  listSkills,
  readManifest,
  validateManifest,
  validateSkillStructure,
  dirSize,
  formatBytes,
  zipName,
} from "./lib/skills.mjs";

const EXCLUDE = [
  ".DS_Store",
  "Thumbs.db",
  "node_modules",
  "*.log",
  "*.swp",
  "*.swo",
  ".idea",
  ".vscode",
];

// Files that belong in the zip: what git would ship (tracked + untracked-but-not-ignored),
// so local packs match CI packs even when a skill has gitignored runtime downloads or a
// nested node_modules/. Returns null outside a git checkout (caller falls back to zip -r).
function shippedFiles(name) {
  const r = spawnSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "."],
    { cwd: path.join(SKILLS_DIR, name), encoding: "utf8" },
  );
  if (r.status !== 0) return null;
  const segs = EXCLUDE.filter((p) => !p.includes("*"));
  const globs = EXCLUDE.filter((p) => p.includes("*")).map(
    (p) => new RegExp(`^${p.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`),
  );
  return [...new Set(r.stdout.split("\0").filter(Boolean))]
    .filter((rel) => {
      const parts = rel.split("/");
      if (parts.some((s) => segs.includes(s))) return false;
      if (globs.some((g) => g.test(parts[parts.length - 1]))) return false;
      return existsSync(path.join(SKILLS_DIR, name, rel));   // tracked but deleted locally
    })
    .map((rel) => `${name}/${rel}`)
    .sort();
}

function parseArgs(argv) {
  const args = { all: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--all") args.all = true;
    else if (a === "--skill") args.skill = argv[++i];
    else if (a === "--version") args.version = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--help" || a === "-h") args.help = true;
    else throw new Error(`Unknown arg: ${a}`);
  }
  return args;
}

function help() {
  console.log(
    "Usage: pack-skill.mjs (--skill <name> [--version <semver>] | --all) [--out <dir>]",
  );
}

async function sha256File(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const s = createReadStream(file);
    s.on("data", (c) => hash.update(c));
    s.on("end", () => resolve(hash.digest("hex")));
    s.on("error", reject);
  });
}

async function packOne({ name, dir, manifest, outDir, expectVersion }) {
  const errs = [
    ...validateManifest(manifest, name),
    ...(await validateSkillStructure(dir, name)),
  ];
  if (errs.length) {
    throw new Error(`Validation failed for ${name}:\n  - ${errs.join("\n  - ")}`);
  }

  const version = expectVersion ?? manifest.version;
  if (expectVersion && manifest.version !== expectVersion) {
    throw new Error(
      `Version drift: tag asks for ${expectVersion} but manifest is ${manifest.version}. ` +
        `Bump skills/${name}/manifest.json#version first.`,
    );
  }

  const files = shippedFiles(name);
  const sizeBefore = files
    ? files.reduce((s, f) => s + statSync(path.join(SKILLS_DIR, f)).size, 0)
    : await dirSize(dir, { exclude: EXCLUDE });
  console.log(`[pack] ${name}@${version}  source=${formatBytes(sizeBefore)}${files ? `  files=${files.length}` : ""}`);

  await mkdir(outDir, { recursive: true });
  const zipFile = path.join(outDir, zipName(name, version));
  if (existsSync(zipFile)) await rm(zipFile);

  // Use system `zip` for portability + deterministic-ish output.
  // Run inside SKILLS_DIR so the archive's top-level dir is "<name>/".
  let result;
  if (files) {
    result = spawnSync("zip", ["-q", "-X", zipFile, "-@"], {
      cwd: SKILLS_DIR,
      input: files.join("\n") + "\n",
      stdio: ["pipe", "inherit", "inherit"],
    });
  } else {
    const excludeArgs = EXCLUDE.flatMap((p) => [
      "-x",
      `${name}/${p}`,
      "-x",
      `${name}/**/${p}`,
      "-x",
      `${name}/**/${p}/*`,
    ]);
    result = spawnSync(
      "zip",
      ["-r", "-q", "-X", zipFile, name, ...excludeArgs],
      { cwd: SKILLS_DIR, stdio: ["ignore", "inherit", "inherit"] },
    );
  }
  if (result.status !== 0) {
    throw new Error(`zip exited with status ${result.status}`);
  }

  const digest = await sha256File(zipFile);
  const shaFile = `${zipFile}.sha256`;
  await writeFile(shaFile, `${digest}  ${path.basename(zipFile)}\n`, "utf8");
  const stat = await statFile(zipFile);
  console.log(
    `[pack] -> ${path.relative(REPO_ROOT, zipFile)}  (${formatBytes(stat.size)})`,
  );
  console.log(`[pack] -> ${path.relative(REPO_ROOT, shaFile)}  (sha256=${digest.slice(0, 12)}…)`);

  // Soft size gate — warn (don't fail) for skills > 5 MB.
  if (stat.size > 5 * 1024 * 1024) {
    console.warn(
      `[pack] WARNING: ${name}-${version}.zip is ${formatBytes(stat.size)} — consider trimming bundled assets.`,
    );
  }

  return { name, version, zipFile, shaFile, digest, size: stat.size };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return help();
  if (!args.all && !args.skill) {
    help();
    process.exitCode = 2;
    return;
  }

  const outDir = path.resolve(REPO_ROOT, args.out ?? "dist/release");

  let targets;
  if (args.all) {
    targets = await listSkills();
  } else {
    const all = await listSkills();
    const t = all.find((s) => s.name === args.skill);
    if (!t) throw new Error(`No such skill: ${args.skill}`);
    targets = [t];
  }

  const results = [];
  for (const t of targets) {
    const manifest = await readManifest(t.dir);
    results.push(
      await packOne({
        name: t.name,
        dir: t.dir,
        manifest,
        outDir,
        expectVersion: args.skill ? args.version : undefined,
      }),
    );
  }

  // Emit a summary index.json so CI / README sync can consume it.
  const indexPath = path.join(outDir, "index.json");
  await writeFile(
    indexPath,
    JSON.stringify(
      {
        builtAt: new Date().toISOString(),
        artifacts: results.map((r) => ({
          name: r.name,
          version: r.version,
          file: path.basename(r.zipFile),
          sha256File: path.basename(r.shaFile),
          sha256: r.digest,
          size: r.size,
        })),
      },
      null,
      2,
    ) + "\n",
    "utf8",
  );
  console.log(`[pack] -> ${path.relative(REPO_ROOT, indexPath)}`);
}

main().catch((err) => {
  console.error(`[pack] ERROR: ${err.message}`);
  process.exit(1);
});
