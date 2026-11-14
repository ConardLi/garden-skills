#!/usr/bin/env node
// Quick maintainer helper: list all skills + manifest version + structure status.
//
// Usage:
//   node scripts/release/list-skills.mjs
//   node scripts/release/list-skills.mjs --json

import process from "node:process";
import {
  loadAllManifests,
  validateManifest,
  validateSkillStructure,
} from "./lib/skills.mjs";

async function main() {
  const json = process.argv.includes("--json");
  const all = await loadAllManifests();
  const rows = [];
  for (const s of all) {
    const errors = [
      ...validateManifest(s.manifest, s.name),
      ...(await validateSkillStructure(s.dir, s.name)),
    ];
    rows.push({
      name: s.name,
      version: s.manifest.version,
      category: s.manifest.category,
      ok: errors.length === 0,
      errors,
    });
  }

  if (json) {
    console.log(JSON.stringify(rows, null, 2));
    if (rows.some((r) => !r.ok)) process.exitCode = 1;
    return;
  }

  const namePad = Math.max(...rows.map((r) => r.name.length), 4);
  const verPad = Math.max(...rows.map((r) => r.version.length), 7);
  console.log(
    `${"name".padEnd(namePad)}  ${"version".padEnd(verPad)}  status  category`,
  );
  console.log("-".repeat(namePad + verPad + 30));
  for (const r of rows) {
    const status = r.ok ? "OK    " : "FAIL  ";
    console.log(
      `${r.name.padEnd(namePad)}  ${r.version.padEnd(verPad)}  ${status}  ${r.category ?? ""}`,
    );
    for (const e of r.errors) console.log(`  - ${e}`);
  }
  if (rows.some((r) => !r.ok)) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
