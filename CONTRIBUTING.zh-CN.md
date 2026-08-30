# 贡献与维护指南

新增 Skill、发版、改 release 工具链——你需要知道的都在这。

[English](./CONTRIBUTING.md) · [中文文档](./CONTRIBUTING.zh-CN.md) · [日本語](./CONTRIBUTING.ja-JP.md)

---

## 目录

- [快速开始](#快速开始)
- [仓库结构](#仓库结构)
- [Skill 的标准结构](#skill-的标准结构)
- [新增一个 Skill](#新增一个-skill)
- [发版](#发版)
- [版本号规则](#版本号规则)
- [npm 脚本](#npm-脚本)
- [CI / GitHub Actions](#ci--github-actions)
- [README 下载链接是怎么自动维护的](#readme-下载链接是怎么自动维护的)
- [手动发版（fallback）](#手动发版fallback)
- [常见问题](#常见问题)

---

## 快速开始

```bash
git clone https://github.com/ConardLi/garden-skills.git
cd garden-skills
node --version    # 必须 >= 20

npm run list      # 列出所有 Skill + manifest 状态
npm run validate  # 跑一遍和 PR CI 完全一样的检查
```

无运行时依赖——`npm install` 是 no-op。Release 工具是纯 ESM Node，零依赖。

---

## 仓库结构

```text
.
├── skills/                              ← 所有 Skill 都在这里，每个一个文件夹
│   ├── web-video-presentation/
│   │   ├── SKILL.md                     ← Agent 看的指令（必需）
│   │   ├── manifest.json                ← name / version / category / compat（必需）
│   │   ├── README.md / README.zh-CN.md  ← 给人看的文档
│   │   ├── references/                  ← （可选）Agent 按需加载的扩展文档
│   │   ├── scripts/                     ← （可选）确定性可执行代码
│   │   ├── templates/                   ← （可选）脚手架模板
│   │   └── themes/                      ← （可选）skill 专属素材
│   │
│   ├── web-design-engineer/
│   ├── gpt-image-2/
│   └── kb-retriever/
│
├── scripts/release/                     ← 发版工具（零依赖 Node ESM）
│   ├── cut-release.mjs                  ← 交互式发版主入口
│   ├── pack-skill.mjs                   ← skill → 钉版本 .zip + .sha256
│   ├── update-readme.mjs                ← 重写 README 的 Download 链接
│   ├── list-skills.mjs                  ← 查看 manifest + 结构状态
│   └── lib/skills.mjs                   ← 共享辅助函数
│
├── .github/workflows/
│   ├── release-skill.yml                ← tag 触发的单 Skill 发版
│   └── validate-skills.yml              ← PR 守门
│
├── .claude-plugin/
│   └── marketplace.json                 ← Claude Code 插件市场清单
│
├── demo/                                ← 可直接打开的演示
├── dist/                                ← 共享 README 素材 + 参考资料
├── website/                             ← 独立展示网站
│
├── package.json                         ← 维护者脚本（无运行时依赖）
├── README.md / README.zh-CN.md / README.ja-JP.md ← 用户向集合首页
└── CONTRIBUTING.md / CONTRIBUTING.zh-CN.md / CONTRIBUTING.ja-JP.md ← 本文件
```

---

## Skill 的标准结构

本仓库每个 Skill 都遵循同一种最简结构：

```text
<skill-name>/
├── SKILL.md            ← 必需：YAML frontmatter + 给 Agent 看的指令
├── manifest.json       ← 必需：name / version / category / description / compat
├── README.md           ← 给人看的英文文档（GitHub 渲染的就是它）
├── README.zh-CN.md     ← 给人看的中文文档
├── README.ja-JP.md     ← 给人看的日文文档
├── references/         ← 可选：Agent 按需加载的扩展文档
├── scripts/            ← 可选：确定性的可执行代码
└── assets/             ← 可选：模板、字体、图标等输出物素材
```

`SKILL.md` 的 frontmatter 是 Agent 判断"什么时候该用这个 Skill"的契约：

```markdown
---
name: my-skill
description: 用一句话清楚说明这个 Skill 是干什么的、什么时候应该用。
              Agent 会用这段话判断是否激活本 Skill。
---

# My Skill

详细指令、示例与约束写在这里。
```

`manifest.json` 是给**发版工具和下游安装器**看的契约：

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "category": "Design / Frontend",
  "description": "做什么的、适合什么场景。会显示在安装界面里。",
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

`name` 字段**必须和文件夹名、`SKILL.md` frontmatter 的 `name` 完全一致**——
不一致 `npm run list` 会 fail。

完整的 SKILL.md 规范见 [agentskills.io](https://agentskills.io) 与
[Anthropic 官方示例仓库](https://github.com/anthropics/skills)。

---

## 新增一个 Skill

1. 创建 `skills/<new-name>/`，至少要有 `SKILL.md` + `manifest.json`。
   实验性的可以用 `version: "0.1.0"` 起步，比较成熟的就直接 `1.0.0`。
2. 在所有根目录多语言 README 里新 Skill 的"链接：" / "Links:" 行末尾
   追加 inline DOWNLOAD marker（前面加 ` · ` 保持视觉一致）：
   ```markdown
   链接：[README](...) · [SKILL.md](...) · <!-- DOWNLOAD:<new-name>:start --><!-- DOWNLOAD:<new-name>:end -->
   ```
3. 跑 `npm run readme:sync` 填充占位符。
4. 本地跑 `npm run validate` 确认全部通过。
5. 开 PR，CI 会再校验一遍。
6. 合并后用 `npm run release` 发首版（脚本会自动检测无 tag 并提示 "initial
   release at v<manifest 版本>"）。

可选：在 [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)
里加一条 plugin pack，让它能通过 `/plugin install` 被发现。

---

## 发版

```bash
npm run release
```

就这一条命令。脚本（[`scripts/release/cut-release.mjs`](./scripts/release/cut-release.mjs)）会：

1. 自检（在 `main`、工作区干净、和 `origin` 同步）。
2. 扫描每个 Skill，找上一个 release tag，列出之后的所有 commit。
3. 对每个候选提示 **patch / minor / major / skip**——首次发版的自动走
   "initial release"。
4. 展示完整计划 + diff 摘要。
5. 改 manifest、跑 `update-readme.mjs`、commit、打 tag，最后**原子地**用一次
   `git push` 把 commit 和所有 tag 一起推出去——CI 永远看到一致的状态。
6. 打印 Actions URL，方便你看后续。

[`release-skill`](./.github/workflows/release-skill.yml) 工作流接管之后会：
打 zip、创建 GitHub Release、再同步一次 README 下载链接 commit 回 `main`。

### 常用变体

```bash
# 只预览，不写不推（dirty tree 也能跑）
npm run release:dry

# 跳过最后的"proceed?"确认
npm run release -- --yes

# 给某些 Skill 预设 bump 类型（其它的还会提示）
npm run release -- \
  --skill web-design-engineer --bump minor \
  --skill gpt-image-2 --bump patch

# 从非默认分支发版
npm run release -- --branch release/2026-q2
```

> 注意 `npm run release` 和参数之间要有 `--`，npm 才会把后面的 flag 透传给
> 下面的 node 脚本。

### 第一次发版完整步骤

第一次给整个仓库（或任何从未打过 tag 的 Skill）发版：

```bash
# 1. 确保所有筹备工作都已 commit、CI 是绿的
git status        # 应该是 clean
git push origin main
gh run watch      # 等 validate-skills.yml 跑完

# 2. 先 dry-run 看一眼计划
npm run release:dry
# 每个 Skill 都应该显示为 INITIAL，manifest 里的版本号会成为发布版本

# 3. 正式发版
npm run release
# 确认 y。脚本会：不改 manifest（initial）、commit README sync、
# 给每个 Skill 打 tag、原子 push

# 4. 看各个 release-skill 工作流并行跑完（每个约 1 分钟）
gh run list --workflow=release-skill.yml

# 5. 拉一下 main（bot 会 commit README 同步）
git pull origin main
```

跑完之后 `https://github.com/ConardLi/garden-skills/releases` 下面就有各个
release，每个带 zip + sha256 + 自动 changelog，README 的下载链接也会指向它们。

---

## 版本号规则

每个 Skill **独立**版本号，遵循 [SemVer](https://semver.org/)。

| 变更 | bump |
|---|---|
| 拼写修正、新增可选 reference、`SKILL.md` 微调 | **patch** |
| `SKILL.md` 工作流改动、`references/` 结构调整、新增必需步骤 | **minor** |
| 重命名 Skill、删除文件、frontmatter 破坏性变更 | **major** |

预发布后缀（`1.2.0-beta.1`、`1.2.0-rc.1`）在 tag 正则和 workflow 里都允许，
但 `cut-release.mjs` 只提供 patch / minor / major 三个选项。要发预发布版本，
请手动改 manifest 后再推 tag（见 [手动发版](#手动发版fallback)）。

首次发版（无 prior tag 的 Skill）会直接用 manifest 里的版本号——`--bump`
被忽略。想从其它版本起步，发版前手动改 manifest。

---

## npm 脚本

```bash
npm run release       # 交互式发版（你 99% 时间会用的命令）
npm run release:dry   # 同上，但不写不推（只预览）

npm run list          # 列出所有 Skill + manifest 状态（manifest 错时 exit 1）
npm run pack          # 打单个 Skill：npm run pack -- --skill web-design-engineer
npm run pack:all      # 把所有 Skill 都打到 dist/release/
npm run readme:sync   # 重写 README 下载链接到当前 manifest 版本
npm run readme:check  # CI 风格检查：有任何链接过期就 exit 1

npm run validate      # CI 在每个 PR 跑的全套（list + pack:all + readme:check）
```

---

## CI / GitHub Actions

两个工作流，都很轻：

### [`validate-skills.yml`](./.github/workflows/validate-skills.yml)

每个 PR、以及 main 上任何动到 `skills/**` / `scripts/release/**` / 任一多语言 README
的 push，都会跑。它跑的是 `npm run validate`，等价于：

- lint 每个 `manifest.json` + skill 文件夹结构
- 空跑一遍打包所有 skill（不上传）
- 校验 README 下载链接是否和 manifest 同步

### [`release-skill.yml`](./.github/workflows/release-skill.yml)

push 一个 `<skill>-v<semver>` 格式的 tag 时触发。流程：

1. 解析 tag，校验是否和 `manifest.json#version` 一致（防漂移）。
2. 把 `skills/<name>/` 打成 `<name>-<version>.zip` + `.sha256`。
3. 基于该 Skill 上一个 tag 之后的 `git log` 自动生成 release notes。
4. 创建一个带 zip + sha256 的 GitHub Release。
5. 重写多语言 README 里这个 Skill 的 `下载 v<版本> .zip` 链接，以
   `github-actions[bot]` 身份 commit 回 `main`。

两个 workflow 跑的是和你本地完全一样的 `npm run *` 命令——单一事实来源。

---

## README 下载链接是怎么自动维护的

主 README 里每个 Skill 区块的"链接：" / "Links:" 行末尾都有一个 inline marker：

```markdown
链接：[README](...) · [SKILL.md](...) · <!-- DOWNLOAD:gpt-image-2:start -->[下载 v1.0.0 .zip](...)<!-- DOWNLOAD:gpt-image-2:end -->
```

[`scripts/release/update-readme.mjs`](./scripts/release/update-readme.mjs)
会根据每个 Skill 当前 `manifest.json#version` 重写 `:start` / `:end` 之间的内容。
幂等的，跑两次没差异。运行时机：

- 本地：`npm run readme:sync`
- CI：`npm run readme:check`（PR 守门）
- 自动：发版工作流在每次 tag 发布后自动跑

为啥不用一个永远指向 latest 的稳定 URL？因为 GitHub 的
`releases/latest/download/<asset>` 跟踪的是**整个仓库**的最新 release，对多
Skill 的 monorepo 不适用——比如 `gpt-image-2` 刚发了 v2，但 `kb-retriever`
的"latest"也会变成那个 release。Marker 让每个 Skill 永远指向它**自己**的最近
不可变产物。

---

## 手动发版（fallback）

不想用 helper（或者要 debug 它）的话，手动等价做法：

```bash
# 1. 改 skills/<name>/manifest.json 里的 version
# 2. 同步 README 下载链接
npm run readme:sync

# 3. commit + tag + push（一定要原子！）
git commit -am "release(<name>): <X.Y.Z>"
git tag <name>-v<X.Y.Z>
git push origin main <name>-v<X.Y.Z>
```

`release-skill` 工作流会校验 tag 与 `manifest.json#version` 一致，不一致就拒
绝发布——所以打错 tag 只会 fail CI，不会发出错版本。

撤回一个 release：

```bash
# 删本地 + 远程 tag
git tag -d <name>-v<X.Y.Z>
git push origin :refs/tags/<name>-v<X.Y.Z>

# 删 GitHub Release
gh release delete <name>-v<X.Y.Z> --yes
```

> 强烈建议**bump 版本号重发**（发个 `<X.Y.(Z+1)>`）而不是覆盖原来的 release——
> 不可变才是钉版本 `.zip` URL 的核心价值。

---

## 常见问题

| 现象 | 原因 | 解决 |
|---|---|---|
| `release-skill` 失败：`Version drift: tag asks for 1.1.0 but manifest is 1.0.0` | tag 推了但 `manifest.json#version` 没 bump | bump manifest 后 commit + 重 tag |
| `validate-skills` 失败：`README out of date` | 有人手改了 README 的 Download 链接，或者改了 manifest 但忘了 `npm run readme:sync` | 跑 `npm run readme:sync` 然后 commit |
| `validate-skills` 失败：missing `manifest.json` | 新加 skill 文件夹但没补 manifest | 在 `skills/<name>/manifest.json` 至少补上 `name` / `version` / `description` / `category` / `compat` |
| `cut-release.mjs` exit `Tag 'foo' does not match <skill>-v<semver>` | tag 名字格式不对 | tag 必须严格是 `<lower-kebab-skill-name>-v<X.Y.Z>` |
| `cut-release.mjs` 提示 "Local main is N commit(s) behind origin/main" | bot 在你上次 pull 后又 push 了 README sync | `git pull origin main` 后重跑 |
| `npm run release` 在 dirty tree 报错 | 有未 commit 的改动 | 先 commit / stash，或者用 `npm run release:dry` 只预览 |

---

## 设计取舍

- **为什么用单独的 `manifest.json` 而不是塞进 `SKILL.md` frontmatter？**
  我们想让 manifest 是机器可读的 JSON，不依赖 YAML 解析器；同时让 `version`
  / `compat` 这些跟 Agent 契约（`SKILL.md`）解耦。
- **为什么 per-skill SemVer 而不是仓库统一版本？**
  每个 Skill 的迭代节奏差异很大，绑定就会让下游钉版本变得困难。
- **为什么不做 rolling-latest tag？**
  GitHub 已经有 `releases/latest/download/<asset>`，加上 README 自动重写机
  制，没必要再维护第三种 URL。
- **为什么不发 npm 包？**
  社区维护的 [`npx skills`](https://www.npmjs.com/package/skills) CLI 已经
  能识别本仓库的布局（子路径、tag URL、Agent 自动检测）。再做一个私有 CLI
  只会割裂生态。
- **为什么零 npm 依赖？**
  CI 不用 install 步骤，没有供应链攻击面，任何 Node 20+ 环境都能直接跑。
