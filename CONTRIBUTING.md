# Contributing & Maintaining

Everything you need to add a skill, cut a release, or hack on the tooling
behind this monorepo.

[English](./CONTRIBUTING.md) · [中文文档](./CONTRIBUTING.zh-CN.md) · [日本語](./CONTRIBUTING.ja-JP.md)

---

## Table of contents

- [Quick start](#quick-start)
- [Repository layout](#repository-layout)
- [Anatomy of a skill](#anatomy-of-a-skill)
- [Adding a new skill](#adding-a-new-skill)
- [Cutting a release](#cutting-a-release)
- [Versioning rules](#versioning-rules)
- [npm scripts](#npm-scripts)
- [CI / GitHub Actions](#ci--github-actions)
- [How the README download links work](#how-the-readme-download-links-work)
- [Manual release fallback](#manual-release-fallback)
- [Troubleshooting](#troubleshooting)

---

## Quick start

```bash
git clone https://github.com/ConardLi/garden-skills.git
cd garden-skills
node --version    # must be >= 20

npm run list      # show all skills + manifest status
npm run validate  # run the same checks CI runs on every PR
```

There are no runtime dependencies — `npm install` is a no-op. The release
tooling is pure ESM Node, zero deps.

---

## Repository layout

```text
.
├── skills/                              ← all skills live here, one folder each
│   ├── web-video-presentation/
│   │   ├── SKILL.md                     ← Agent-facing spec (required)
│   │   ├── manifest.json                ← name / version / category / compat (required)
│   │   ├── README.md / README.zh-CN.md  ← human-facing docs
│   │   ├── references/                  ← (optional) docs the agent loads on demand
│   │   ├── scripts/                     ← (optional) deterministic executable helpers
│   │   ├── templates/                   ← (optional) scaffold templates
│   │   └── themes/                      ← (optional) skill-specific assets
│   │
│   ├── web-design-engineer/
│   ├── gpt-image-2/
│   ├── kb-retriever/
│   ├── beautiful-article/
│   └── motion-showreel/
│
├── scripts/release/                     ← release tooling (zero-dep Node ESM)
│   ├── cut-release.mjs                  ← interactive release helper (THE main entry)
│   ├── pack-skill.mjs                   ← skill → versioned .zip + .sha256
│   ├── update-readme.mjs                ← rewrite Download links in READMEs
│   ├── list-skills.mjs                  ← inspect manifests + structure
│   └── lib/skills.mjs                   ← shared helpers
│
├── .github/workflows/
│   ├── release-skill.yml                ← tag-driven per-skill release
│   └── validate-skills.yml              ← PR guard rails
│
├── .claude-plugin/
│   └── marketplace.json                 ← Claude Code plugin marketplace manifest
│
├── demo/                                ← live, openable demos
├── dist/                                ← shared README assets + reference materials
├── website/                             ← standalone showcase websites
│
├── package.json                         ← maintainer scripts (no runtime deps)
├── README.md / README.zh-CN.md / README.ja-JP.md ← user-facing collection index
└── CONTRIBUTING.md / CONTRIBUTING.zh-CN.md / CONTRIBUTING.ja-JP.md ← this file
```

---

## Anatomy of a skill

Every skill in this repo follows the same minimal shape:

```text
<skill-name>/
├── SKILL.md            ← required: YAML frontmatter + instructions for the agent
├── manifest.json       ← required: name / version / category / description / compat
├── README.md           ← English docs for humans (this is what GitHub renders)
├── README.zh-CN.md     ← Chinese docs for humans
├── README.ja-JP.md     ← Japanese docs for humans
├── references/         ← optional: docs the agent loads on-demand
├── scripts/            ← optional: deterministic executable code
└── assets/             ← optional: templates, fonts, icons used in outputs
```

`SKILL.md` frontmatter is the contract that tells the agent **when** to use the skill:

```markdown
---
name: my-skill
description: A clear sentence about what this skill does and when to use it.
              The agent uses this to decide whether to load the skill.
---

# My Skill

Detailed instructions, examples, and constraints go here.
```

`manifest.json` is the contract for **release tooling and downstream installers**:

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "category": "Design / Frontend",
  "description": "What it does, what it's good for. Shown in install UIs.",
  "homepage": "https://github.com/ConardLi/garden-skills/tree/main/skills/my-skill",
  "compat": [
    "claude-code",
    "claude-ai",
    "cursor",
    "codex-cli",
    "gemini-cli",
    "opencode"
  ]
}
```

The `name` field **must match the folder name and `SKILL.md` frontmatter
`name`** — `npm run list` will fail otherwise.

For the full SKILL.md spec, see [agentskills.io](https://agentskills.io) and the
[official examples from Anthropic](https://github.com/anthropics/skills).

---

## Adding a new skill

1. Create `skills/<new-name>/` with at minimum `SKILL.md` + `manifest.json`.
   Start with `version: "0.1.0"` if it's experimental, or `1.0.0` if you're
   confident it's ready.
2. Append the inline DOWNLOAD marker to the end of the new skill's "Links:" /
   "链接：" row in every localized root README (preceded by ` · `):
   ```markdown
   Links: [README](...) · [SKILL.md](...) · <!-- DOWNLOAD:<new-name>:start --><!-- DOWNLOAD:<new-name>:end -->
   ```
3. Run `npm run readme:sync` to populate the placeholder.
4. Run `npm run validate` locally to make sure everything checks out.
5. Open a PR. CI will re-run the validation.
6. After merge, cut the first release with `npm run release` (it'll detect the
   skill has no prior tag and offer "initial release at v<manifest version>").

Optional: add a plugin pack entry to [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)
if you want it discoverable via `/plugin install`.

Checklist for the localized root READMEs (easy to miss; `validate` only checks the DOWNLOAD markers):

- add a cell to the skills gallery at the top and bump the `skills-N` badge
- add the skill section before **Install**, and add its plugin pack to the `/plugin install` list and pack table in Option B
- when `marketplace.json` gains a plugin, bump `metadata.version` (minor) and mention the skill in `metadata.description`
- README images that are not on the CDN go in `dist/imgs/<skill>/`. They are never packed into the release zip

What goes into a release zip: `pack-skill.mjs` ships exactly what git would ship from `skills/<name>/`
(tracked + untracked-but-not-ignored files, minus OS / editor junk). Gitignored runtime downloads
and nested `node_modules/` stay out, so a local `npm run pack` produces the same zip as CI.

---

## Cutting a release

```bash
npm run release
```

That's the whole thing. The script ([`scripts/release/cut-release.mjs`](./scripts/release/cut-release.mjs)) will:

1. Sanity-check (on `main`, clean tree, in sync with `origin`).
2. Scan every skill, find its last release tag, list commits since.
3. For each candidate, prompt **patch / minor / major / skip** — or auto-pick
   "initial release" for skills that have never been tagged.
4. Show a final plan + diff summary.
5. Bump manifests, run `update-readme.mjs`, commit + tag, then push the
   commit and all tags **atomically** with one `git push` so CI sees a
   consistent state.
6. Print the Actions URL so you can watch the rest happen.

The [`release-skill`](./.github/workflows/release-skill.yml) workflow takes
over from there: builds zips, creates GitHub Releases, re-syncs README
download links and commits the change back to `main`.

### Variants

```bash
# Preview without writing anything (works even on a dirty tree).
npm run release:dry

# Skip the final "proceed?" confirmation (useful in scripts).
npm run release -- --yes

# Pre-pick bumps for one or more skills (still prompts for the rest).
npm run release -- \
  --skill web-design-engineer --bump minor \
  --skill gpt-image-2 --bump patch

# Release from a non-default branch.
npm run release -- --branch release/2026-q2
```

> Note the `--` between `npm run release` and the script flags — that's how
> npm passes args through to the underlying node script.

### First-time release walkthrough

For the very first release of this repo (or any skill that's never been
tagged):

```bash
# 1. Make sure all setup work is committed and CI is green.
git status         # should be clean
git push origin main
gh run watch       # wait for validate-skills.yml

# 2. Preview the plan.
npm run release:dry
# Every skill should show as INITIAL — manifest version becomes the release version.

# 3. Cut the releases.
npm run release
# Confirm `y` and watch the script bump nothing (initial), commit the README
# sync, tag every skill, and push.

# 4. Watch the per-skill release workflows run in parallel.
gh run list --workflow=release-skill.yml

# 5. Pull the README sync that the bot pushed back to main.
git pull origin main
```

After this, every skill has a `releases/tag/<skill>-v1.0.0` entry
on GitHub, with downloadable zip + sha256, and the README download links
point at them.

---

## Versioning rules

Each skill is versioned **independently** with [SemVer](https://semver.org/).

| Change | Bump |
|---|---|
| Typo fixes, new optional reference, `SKILL.md` micro-edits | **patch** |
| Workflow changes in `SKILL.md`, restructured `references/`, new required step | **minor** |
| Renamed skill, removed files, breaking frontmatter changes | **major** |

Pre-release suffixes (`1.2.0-beta.1`, `1.2.0-rc.1`) are supported by the tag
regex and the workflow — but `cut-release.mjs` only offers patch / minor /
major. To cut a pre-release, edit the manifest version manually then push the
tag yourself (see [Manual release fallback](#manual-release-fallback)).

For initial releases (skills with no prior tag), the manifest version is used
as-is — `--bump` is ignored. To start at a different initial version, edit
the manifest before running `npm run release`.

---

## npm scripts

```bash
npm run release       # interactive release flow (the main one you'll use)
npm run release:dry   # same, but stops before any writes (preview only)

npm run list          # list all skills + manifest status (exit 1 on bad manifest)
npm run pack          # pack one skill: npm run pack -- --skill web-design-engineer
npm run pack:all      # pack every skill into dist/release/
npm run readme:sync   # rewrite README download links to current manifest versions
npm run readme:check  # CI-style: exit 1 if any download link is stale

npm run validate      # everything CI runs on every PR (list + pack:all + readme:check)
```

---

## CI / GitHub Actions

Two workflows, both small:

### [`validate-skills.yml`](./.github/workflows/validate-skills.yml)

Runs on every PR and every push to `main` that touches `skills/**`,
`scripts/release/**`, or any localized README. It runs `npm run validate`, which:

- lints every `manifest.json` and skill folder structure
- smoke-packs every skill (no upload)
- verifies the README download links are in sync with manifests

### [`release-skill.yml`](./.github/workflows/release-skill.yml)

Triggered by pushing a tag matching `<skill>-v<semver>`. It:

1. Parses the tag, validates it matches `manifest.json#version` (no drift).
2. Packs `skills/<name>/` into `<name>-<version>.zip` + `.sha256`.
3. Generates release notes from `git log` since the previous tag of that skill.
4. Creates a GitHub Release with the zip + sha256 attached.
5. Re-renders the inline `Download v<version> .zip` link in localized READMEs
   and commits the change back to `main` as `github-actions[bot]`.

Both workflows use the same `npm run *` commands you can run locally — single
source of truth.

---

## How the README download links work

Each skill section in the main README ends its "Links:" row with an inline
marker:

```markdown
Links: [README](...) · [SKILL.md](...) · <!-- DOWNLOAD:gpt-image-2:start -->[Download v1.0.0 .zip](...)<!-- DOWNLOAD:gpt-image-2:end -->
```

[`scripts/release/update-readme.mjs`](./scripts/release/update-readme.mjs)
rewrites the content between `:start` and `:end` markers based on each skill's
current `manifest.json#version`. It's idempotent and runs:

- locally via `npm run readme:sync`
- in CI via `npm run readme:check` (PR-time guard)
- automatically by the release workflow after each tag is published

Why an auto-rewriting marker instead of a stable "always-latest" URL? GitHub's
`releases/latest/download/<asset>` redirects to the most recent release of the
**whole repo**, which doesn't fit a multi-skill monorepo where each skill
releases independently. The marker keeps every skill's link pointing at *its
own* most recent immutable artifact.

---

## Manual release fallback

If you want to bypass the helper (or you're debugging it), you can do it by
hand — same end result:

```bash
# 1. Bump the version in skills/<name>/manifest.json
# 2. Sync the README download links
npm run readme:sync

# 3. Commit + tag + push (atomically!)
git commit -am "release(<name>): <X.Y.Z>"
git tag <name>-v<X.Y.Z>
git push origin main <name>-v<X.Y.Z>
```

The `release-skill` workflow validates that the tag matches `manifest.json#version`
and refuses to publish if they drift, so a typo here just fails CI rather than
shipping the wrong artifact.

To recall a release:

```bash
# Delete the tag locally and remotely.
git tag -d <name>-v<X.Y.Z>
git push origin :refs/tags/<name>-v<X.Y.Z>

# Delete the GitHub Release.
gh release delete <name>-v<X.Y.Z> --yes
```

> Strongly prefer bumping the version (publish a `<X.Y.(Z+1)>`) over
> overwriting an existing release — immutability is the whole point of the
> pinned `.zip` URL.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `release-skill` fails: `Version drift: tag asks for 1.1.0 but manifest is 1.0.0` | Tag pushed but `manifest.json#version` not bumped | Bump the manifest, commit, retag |
| `validate-skills` fails: `README out of date` | Someone edited the README's Download line by hand, or bumped a manifest without running `npm run readme:sync` | Run `npm run readme:sync` and commit |
| `validate-skills` fails: missing `manifest.json` | New skill folder added without a manifest | Add `skills/<name>/manifest.json` with at least `name`, `version`, `description`, `category`, `compat` |
| `cut-release.mjs` exits with `Tag 'foo' does not match <skill>-v<semver>` | Tag name typo | Tags must be exactly `<lower-kebab-skill-name>-v<X.Y.Z>` |
| `cut-release.mjs` says "Local main is N commit(s) behind origin/main" | Bot pushed the README sync after your last pull | `git pull origin main` then re-run |
| `npm run release` fails on dirty tree | Uncommitted changes | Commit/stash first, or use `npm run release:dry` to just preview |

---

## Design notes

- **Why a separate `manifest.json` instead of new fields in `SKILL.md` frontmatter?**
  We want the manifest to be machine-readable JSON without depending on a YAML
  parser at runtime, and to decouple `version` / `compat` from the agent-facing
  `SKILL.md` contract.
- **Why per-skill SemVer instead of repo-wide versioning?**
  Skills evolve at very different cadences. Coupling them punishes downstream
  pinning.
- **Why no rolling-latest tag?**
  GitHub already provides `releases/latest/download/<asset>` for the most-recent
  release in the repo, and the per-skill pinned URLs in the README are
  auto-rewritten on every release — so there's no value in maintaining a third
  URL flavour.
- **Why no published npm package?**
  The community-maintained [`npx skills`](https://www.npmjs.com/package/skills)
  CLI already understands this repo's layout (sub-paths, tag URLs, agent
  detection), so re-implementing the same install UX as a private CLI would only
  fragment the ecosystem.
- **Why zero npm dependencies?**
  Keeps CI fast (no install step), eliminates supply-chain surface, and
  guarantees the tooling works in any Node 20+ environment without `npm
  install`.
