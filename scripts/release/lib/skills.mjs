// Shared helpers for the release tooling.
// Pure ESM, zero runtime dependencies — keeps GitHub Actions fast.

import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, "..", "..", "..");
export const SKILLS_DIR = path.join(REPO_ROOT, "skills");

const SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const NAME_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const VALID_AGENTS = new Set([
  "claude-code",
  "claude-ai",
  "cursor",
  "codex-cli",
  "gemini-cli",
  "opencode",
]);

// Tag convention: <skill-name>-v<semver>
// Example: web-design-engineer-v1.2.0
const TAG_RE = /^([a-z0-9][a-z0-9-]*[a-z0-9])-v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

export function parseTag(tag) {
  const m = TAG_RE.exec(tag);
  if (!m) return null;
  return { skill: m[1], version: m[2] };
}

export function buildTag(skill, version) {
  return `${skill}-v${version}`;
}

export function zipName(skill, version) {
  return `${skill}-${version}.zip`;
}

export async function listSkills() {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    const dir = path.join(SKILLS_DIR, entry.name);
    const manifestPath = path.join(dir, "manifest.json");
    if (!existsSync(manifestPath)) {
      throw new Error(`${entry.name}: missing required file manifest.json`);
    }
    skills.push({ name: entry.name, dir, manifestPath });
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

export async function readManifest(skillDir) {
  const manifestPath = path.join(skillDir, "manifest.json");
  const raw = await readFile(manifestPath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${manifestPath}: ${err.message}`);
  }
  return parsed;
}

export async function loadAllManifests() {
  const skills = await listSkills();
  const out = [];
  for (const s of skills) {
    const manifest = await readManifest(s.dir);
    out.push({ ...s, manifest });
  }
  return out;
}

// Validate a single manifest. Returns an array of error strings (empty if OK).
export function validateManifest(manifest, expectedName) {
  const errors = [];
  const required = ["name", "version", "description", "category", "compat"];
  for (const key of required) {
    if (manifest[key] === undefined || manifest[key] === null || manifest[key] === "") {
      errors.push(`missing required field: ${key}`);
    }
  }
  if (manifest.name && !NAME_RE.test(manifest.name)) {
    errors.push(`invalid name "${manifest.name}" (must be lower-kebab-case)`);
  }
  if (expectedName && manifest.name && manifest.name !== expectedName) {
    errors.push(
      `manifest.name "${manifest.name}" does not match folder name "${expectedName}"`,
    );
  }
  if (manifest.version && !SEMVER_RE.test(manifest.version)) {
    errors.push(`invalid version "${manifest.version}" (must be SemVer X.Y.Z)`);
  }
  if (manifest.description && manifest.description.length < 20) {
    errors.push(`description is suspiciously short (<20 chars)`);
  }
  if (manifest.compat && !Array.isArray(manifest.compat)) {
    errors.push(`compat must be an array`);
  } else if (Array.isArray(manifest.compat)) {
    for (const a of manifest.compat) {
      if (!VALID_AGENTS.has(a)) {
        errors.push(`unknown agent in compat: "${a}"`);
      }
    }
  }
  return errors;
}

// Async ensure a skill directory has the minimum required files.
export async function validateSkillStructure(skillDir, name) {
  const errors = [];
  const must = ["SKILL.md", "manifest.json"];
  for (const f of must) {
    if (!existsSync(path.join(skillDir, f))) {
      errors.push(`${name}: missing required file ${f}`);
    }
  }
  // SKILL.md frontmatter must declare matching name.
  const skillMdPath = path.join(skillDir, "SKILL.md");
  if (existsSync(skillMdPath)) {
    const head = (await readFile(skillMdPath, "utf8")).slice(0, 4096);
    const m = /^---\s*\n([\s\S]*?)\n---/m.exec(head);
    if (!m) {
      errors.push(`${name}: SKILL.md is missing YAML frontmatter (--- ... ---)`);
    } else {
      const nameLine = /^name:\s*(\S+)\s*$/m.exec(m[1]);
      if (!nameLine) {
        errors.push(`${name}: SKILL.md frontmatter has no "name:" field`);
      } else if (nameLine[1] !== name) {
        errors.push(
          `${name}: SKILL.md frontmatter name "${nameLine[1]}" does not match folder "${name}"`,
        );
      }
      const descriptionLine = /^description:\s*(.+?)\s*$/m.exec(m[1]);
      if (!descriptionLine) {
        errors.push(`${name}: SKILL.md frontmatter has no "description:" field`);
      } else {
        const description = descriptionLine[1].trim();
        const isQuoted =
          (description.startsWith('"') && description.endsWith('"')) ||
          (description.startsWith("'") && description.endsWith("'"));
        if (!isQuoted && /:\s/.test(description)) {
          errors.push(
            `${name}: SKILL.md frontmatter description contains ": " and must be quoted`,
          );
        }
      }
    }
  }
  return errors;
}

// Recursive directory size in bytes (after pack-time exclusion).
export async function dirSize(dir, { exclude = [] } = {}) {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += await dirSize(p, { exclude });
    } else if (entry.isFile()) {
      const s = await stat(p);
      total += s.size;
    }
  }
  return total;
}

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

// --- git helpers (used by cut-release.mjs) -------------------------------

export function git(args, opts = {}) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trim();
}

export function gitOk(args) {
  try {
    git(args);
    return true;
  } catch {
    return false;
  }
}

// Find the most recent release tag for a given skill, or null if none yet.
export function lastTagFor(skill) {
  let out;
  try {
    out = git(["tag", "--list", `${skill}-v*`, "--sort=-v:refname"]);
  } catch {
    return null;
  }
  const lines = out.split("\n").filter(Boolean);
  return lines[0] ?? null;
}

// Commits touching skills/<skill>/ since the given tag (or all-time if no tag).
export function commitsSince(tag, skill, limit = 50) {
  const range = tag ? `${tag}..HEAD` : "HEAD";
  let out;
  try {
    out = git([
      "log",
      `--max-count=${limit}`,
      "--pretty=format:%h\t%s",
      range,
      "--",
      `skills/${skill}/`,
    ]);
  } catch {
    return [];
  }
  if (!out) return [];
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("\t");
      return { hash: line.slice(0, idx), subject: line.slice(idx + 1) };
    });
}

// Compare two SemVer-ish strings (pre-release suffix is ignored). Returns
// -1 if a<b, 0 if equal core, 1 if a>b.
const SEMVER_CORE_RE = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/;
export function compareSemver(a, b) {
  const ma = SEMVER_CORE_RE.exec(a);
  const mb = SEMVER_CORE_RE.exec(b);
  if (!ma || !mb) throw new Error(`compareSemver: invalid input ${a} / ${b}`);
  for (let i = 1; i <= 3; i++) {
    const da = Number(ma[i]);
    const db = Number(mb[i]);
    if (da !== db) return da > db ? 1 : -1;
  }
  return 0;
}

// Bump a SemVer string. Pre-release suffix is dropped on patch/minor/major.
const SEMVER_BUMP_RE = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?$/;
export function bumpVersion(version, kind) {
  const m = SEMVER_BUMP_RE.exec(version);
  if (!m) throw new Error(`Cannot bump non-SemVer version: ${version}`);
  let [, maj, min, pat] = m.map((x, i) => (i === 0 ? x : Number(x)));
  switch (kind) {
    case "patch":
      pat += 1;
      break;
    case "minor":
      min += 1;
      pat = 0;
      break;
    case "major":
      maj += 1;
      min = 0;
      pat = 0;
      break;
    default:
      throw new Error(`Unknown bump kind: ${kind}`);
  }
  return `${maj}.${min}.${pat}`;
}
