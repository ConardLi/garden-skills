# コントリビュート & メンテナンス

このモノレポにスキルを追加したり、リリースを切ったり、ツール周りを
ハックしたりするのに必要なすべての情報です。

[English](./CONTRIBUTING.md) · [中文文档](./CONTRIBUTING.zh-CN.md) · [日本語](./CONTRIBUTING.ja-JP.md)

---

## 目次

- [クイックスタート](#クイックスタート)
- [リポジトリ構成](#リポジトリ構成)
- [スキルの構造](#スキルの構造)
- [新しいスキルの追加](#新しいスキルの追加)
- [リリースの切り方](#リリースの切り方)
- [バージョニングルール](#バージョニングルール)
- [npm スクリプト](#npm-スクリプト)
- [CI / GitHub Actions](#ci--github-actions)
- [README のダウンロードリンクの仕組み](#readme-のダウンロードリンクの仕組み)
- [手動リリースのフォールバック](#手動リリースのフォールバック)
- [トラブルシューティング](#トラブルシューティング)

---

## クイックスタート

```bash
git clone https://github.com/ConardLi/garden-skills.git
cd garden-skills
node --version    # >= 20 が必要

npm run list      # すべてのスキル + マニフェストのステータスを表示
npm run validate  # CI がすべての PR で実行するのと同じチェックを実行
```

ランタイム依存関係はありません。`npm install` は no-op です。リリース
ツールは純粋な ESM Node、ゼロ依存です。

---

## リポジトリ構成

```text
.
├── skills/                              ← すべてのスキルはここに、1 フォルダ 1 スキル
│   ├── web-video-presentation/
│   │   ├── SKILL.md                     ← エージェント向け仕様（必須）
│   │   ├── manifest.json                ← name / version / category / compat（必須）
│   │   ├── README.md / README.zh-CN.md  ← 人間向けドキュメント
│   │   ├── references/                  ← （オプション）エージェントがオンデマンドで読み込むドキュメント
│   │   ├── scripts/                     ← （オプション）決定論的な実行可能ヘルパー
│   │   ├── templates/                   ← （オプション）スキャフォールドテンプレート
│   │   └── themes/                      ← （オプション）スキル固有のアセット
│   │
│   ├── web-design-engineer/
│   ├── gpt-image-2/
│   ├── kb-retriever/
│   ├── beautiful-article/
│   └── motion-showreel/
│
├── scripts/release/                     ← リリースツール（ゼロ依存 Node ESM）
│   ├── cut-release.mjs                  ← インタラクティブなリリースヘルパー（メインエントリ）
│   ├── pack-skill.mjs                   ← スキル → バージョン付き .zip + .sha256
│   ├── update-readme.mjs                ← README 内のダウンロードリンクを書き換え
│   ├── list-skills.mjs                  ← マニフェスト + 構造の検査
│   └── lib/skills.mjs                   ← 共有ヘルパー
│
├── .github/workflows/
│   ├── release-skill.yml                ← タグ駆動のスキル別リリース
│   └── validate-skills.yml              ← PR のガードレール
│
├── .claude-plugin/
│   └── marketplace.json                 ← Claude Code プラグインマーケットプレイスのマニフェスト
│
├── demo/                                ← ライブで開けるデモ
├── dist/                                ← 共有 README アセット + リファレンスマテリアル
├── website/                             ← スタンドアロンのショーケースウェブサイト
│
├── package.json                         ← メンテナースクリプト（ランタイム依存なし）
├── README.md / README.zh-CN.md / README.ja-JP.md ← ユーザー向けコレクションインデックス
└── CONTRIBUTING.md / CONTRIBUTING.zh-CN.md / CONTRIBUTING.ja-JP.md ← このファイル
```

---

## スキルの構造

このリポジトリのすべてのスキルは、同じ最小限の形状に従います:

```text
<skill-name>/
├── SKILL.md            ← 必須: YAML フロントマター + エージェント向けの指示
├── manifest.json       ← 必須: name / version / category / description / compat
├── README.md           ← 人間向けの英語ドキュメント（GitHub でレンダリングされるもの）
├── README.zh-CN.md     ← 人間向けの中国語ドキュメント
├── README.ja-JP.md     ← 人間向けの日本語ドキュメント
├── references/         ← オプション: エージェントがオンデマンドで読み込むドキュメント
├── scripts/            ← オプション: 決定論的な実行可能コード
└── assets/             ← オプション: 出力で使用するテンプレート、フォント、アイコン
```

`SKILL.md` のフロントマターは、エージェントに**いつ**スキルを使うかを伝える契約です:

```markdown
---
name: my-skill
description: このスキルが何をして、いつ使うかを明確に説明する文章。
              エージェントはこれを使ってスキルを読み込むかどうかを判断します。
---

# My Skill

詳細な指示、例、制約はここに記述します。
```

`manifest.json` は、**リリースツールおよびダウンストリームのインストーラ**向けの契約です:

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "category": "Design / Frontend",
  "description": "このスキルが何をして、何に向いているか。インストール UI に表示されます。",
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

`name` フィールドは**フォルダ名および `SKILL.md` のフロントマターの
`name` と一致しなければなりません**。そうでないと `npm run list` が失敗します。

完全な SKILL.md 仕様については、[agentskills.io](https://agentskills.io) および
[Anthropic 公式のサンプル](https://github.com/anthropics/skills) を参照してください。

---

## 新しいスキルの追加

1. 最低でも `SKILL.md` + `manifest.json` を含む `skills/<new-name>/` を作成します。
   実験的なものであれば `version: "0.1.0"` から、リリース可能と確信していれば
   `1.0.0` から始めます。
2. すべてのルート多言語 README で、新しいスキルの「Links:」/
   「链接：」行の末尾にインラインの DOWNLOAD マーカーを追加します（先頭に ` · ` を付ける）:
   ```markdown
   Links: [README](...) · [SKILL.md](...) · <!-- DOWNLOAD:<new-name>:start --><!-- DOWNLOAD:<new-name>:end -->
   ```
3. `npm run readme:sync` を実行してプレースホルダーを埋めます。
4. ローカルで `npm run validate` を実行し、すべてが問題ないことを確認します。
5. PR を作成します。CI が検証を再実行します。
6. マージ後、`npm run release` で最初のリリースを切ります（スキルに以前のタグが
   ないことを検出し、「マニフェストバージョンでの初回リリース」を提案します）。

オプション: `/plugin install` 経由で発見できるようにしたい場合は、
[`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json) にプラグインパックエントリを追加します。

ルートの多言語 README のチェックリスト（見落としやすい項目です。`validate` が確認するのは DOWNLOAD マーカーだけ）:

- 先頭のスキルギャラリーにセルを追加し、`skills-N` バッジを 1 つ増やす
- 「インストール」の前にスキルのセクションを追加し、方法 B の `/plugin install` リストとパック表にプラグインパックを追加する
- `marketplace.json` にプラグインを追加したら、`metadata.version` をマイナーバージョンで上げ、`metadata.description` にスキルを追記する
- CDN にない README 画像は `dist/imgs/<skill>/` に置く。リリース zip には含まれない

リリース zip に入るもの: `pack-skill.mjs` は `skills/<name>/` のうち、git が出荷する内容だけを固めます
（追跡済みファイルと、追跡されていないが無視もされていないファイル。OS / エディタのゴミは除外）。gitignore 対象の
ランタイムダウンロードやネストした `node_modules/` は含まれないため、ローカルの `npm run pack` は CI と同じ zip になります。

---

## リリースの切り方

```bash
npm run release
```

それだけです。スクリプト（[`scripts/release/cut-release.mjs`](./scripts/release/cut-release.mjs)）は以下を行います:

1. サニティチェック（`main` 上、クリーンなツリー、`origin` と同期）。
2. すべてのスキルをスキャンし、最後のリリースタグを見つけ、それ以降のコミットを一覧表示。
3. 各候補について、**patch / minor / major / skip** をプロンプトします。
   タグを切ったことのないスキルについては「initial release」を自動選択します。
4. 最終的な計画 + diff のサマリーを表示。
5. マニフェストを更新し、`update-readme.mjs` を実行し、コミット + タグ付けし、
   コミットとすべてのタグを 1 つの `git push` で**アトミックに**プッシュします。
   これにより CI は一貫した状態を見ることになります。
6. Actions の URL を表示するので、残りの処理を見守れます。

[`release-skill`](./.github/workflows/release-skill.yml) ワークフローがそこから引き継ぎます:
zip をビルドし、GitHub リリースを作成し、README のダウンロードリンクを再同期して、
変更を `main` にコミットして戻します。

### バリエーション

```bash
# 何も書き込まずにプレビュー（汚れたツリーでも動作）。
npm run release:dry

# 最終的な「続行しますか？」確認をスキップ（スクリプトで便利）。
npm run release -- --yes

# 1 つまたは複数のスキルのバンプを事前に選択（残りはプロンプト）。
npm run release -- \
  --skill web-design-engineer --bump minor \
  --skill gpt-image-2 --bump patch

# デフォルト以外のブランチからリリース。
npm run release -- --branch release/2026-q2
```

> `npm run release` とスクリプトフラグの間の `--` に注意してください。これは
> npm が基盤の node スクリプトに引数を渡す方法です。

### 初回リリースのウォークスルー

このリポジトリの最初のリリース（またはまだタグが切られていない任意のスキル）の場合:

```bash
# 1. すべてのセットアップ作業がコミットされ、CI がグリーンであることを確認。
git status         # クリーンであるべき
git push origin main
gh run watch       # validate-skills.yml を待つ

# 2. プランをプレビュー。
npm run release:dry
# すべてのスキルが INITIAL として表示されるはずです。マニフェストバージョンがリリースバージョンになります。

# 3. リリースを切る。
npm run release
# `y` で確認し、スクリプトが何もバンプせず（initial）、README 同期をコミットし、
# 4 つすべてにタグを付け、プッシュするのを見守ります。

# 4. 各スキルのリリースワークフローが並列で実行されるのを見守る。
gh run list --workflow=release-skill.yml

# 5. ボットが main にプッシュバックした README 同期を取り込む。
git pull origin main
```

これで、4 つのスキルそれぞれが GitHub 上に `releases/tag/<skill>-v1.0.0` エントリを持ち、
ダウンロード可能な zip + sha256 が用意され、README のダウンロードリンクが
それらを指すようになります。

---

## バージョニングルール

各スキルは [SemVer](https://semver.org/) に従って**独立して**バージョン管理されます。

| 変更 | バンプ |
|---|---|
| 誤字修正、新しいオプションのリファレンス、`SKILL.md` のマイクロエディット | **patch** |
| `SKILL.md` 内のワークフロー変更、`references/` の再構成、新しい必須ステップ | **minor** |
| スキルの改名、ファイルの削除、フロントマターの破壊的変更 | **major** |

プレリリースサフィックス（`1.2.0-beta.1`、`1.2.0-rc.1`）はタグの正規表現と
ワークフローでサポートされていますが、`cut-release.mjs` は patch / minor /
major のみを提供します。プレリリースを切るには、マニフェストのバージョンを
手動で編集してから、自分でタグをプッシュしてください（[手動リリースのフォールバック](#手動リリースのフォールバック)を参照）。

初回リリース（以前のタグがないスキル）の場合、マニフェストバージョンが
そのまま使用されます。`--bump` は無視されます。異なる初期バージョンから
開始するには、`npm run release` を実行する前にマニフェストを編集してください。

---

## npm スクリプト

```bash
npm run release       # インタラクティブなリリースフロー（主に使用するもの）
npm run release:dry   # 同上、ただし書き込み前に停止（プレビューのみ）

npm run list          # すべてのスキル + マニフェストのステータスを一覧表示（マニフェスト不正で exit 1）
npm run pack          # 1 つのスキルをパック: npm run pack -- --skill web-design-engineer
npm run pack:all      # すべてのスキルを dist/release/ にパック
npm run readme:sync   # README のダウンロードリンクを現在のマニフェストバージョンに書き換え
npm run readme:check  # CI スタイル: ダウンロードリンクが古い場合は exit 1

npm run validate      # CI がすべての PR で実行するすべて（list + pack:all + readme:check）
```

---

## CI / GitHub Actions

2 つのワークフロー、どちらも小さいです:

### [`validate-skills.yml`](./.github/workflows/validate-skills.yml)

すべての PR と、`skills/**`、`scripts/release/**`、いずれかの多言語 README に触れる
`main` へのすべてのプッシュで実行されます。`npm run validate` を実行し、以下を行います:

- すべての `manifest.json` とスキルフォルダの構造を lint
- すべてのスキルをスモークパック（アップロードなし）
- README のダウンロードリンクがマニフェストと同期されていることを検証

### [`release-skill.yml`](./.github/workflows/release-skill.yml)

`<skill>-v<semver>` にマッチするタグのプッシュによってトリガーされます。以下を行います:

1. タグを解析し、`manifest.json#version` と一致することを検証（ドリフトなし）。
2. `skills/<name>/` を `<name>-<version>.zip` + `.sha256` にパック。
3. そのスキルの前のタグ以降の `git log` からリリースノートを生成。
4. zip + sha256 を添付した GitHub リリースを作成。
5. 多言語 README のインラインの `Download v<version> .zip` リンクを再レンダリングし、
   変更を `github-actions[bot]` として `main` にコミットして戻す。

両方のワークフローは、ローカルで実行できるのと同じ `npm run *` コマンドを使用します。
シングルソースオブトゥルースです。

---

## README のダウンロードリンクの仕組み

メイン README の各スキルセクションの「Links:」行は、インラインマーカーで終わります:

```markdown
Links: [README](...) · [SKILL.md](...) · <!-- DOWNLOAD:gpt-image-2:start -->[Download v1.0.0 .zip](...)<!-- DOWNLOAD:gpt-image-2:end -->
```

[`scripts/release/update-readme.mjs`](./scripts/release/update-readme.mjs)
は、各スキルの現在の `manifest.json#version` に基づいて `:start` と `:end` マーカーの間の
コンテンツを書き換えます。これは冪等で、以下のタイミングで実行されます:

- ローカルで `npm run readme:sync` 経由
- CI で `npm run readme:check` 経由（PR 時のガード）
- リリースワークフローによってタグが公開された後に自動的に

なぜ安定した「常に最新」の URL ではなく自動書き換えマーカーなのか？ GitHub の
`releases/latest/download/<asset>` は**リポジトリ全体**の最新リリースに
リダイレクトしますが、これは各スキルが独立してリリースされるマルチスキル
モノレポには合いません。マーカーは、すべてのスキルのリンクを*それぞれの*
最新の不変アーティファクトに向け続けます。

---

## 手動リリースのフォールバック

ヘルパーをバイパスしたい場合（またはデバッグしている場合）、手動で実行できます。
最終結果は同じです:

```bash
# 1. skills/<name>/manifest.json のバージョンをバンプ
# 2. README のダウンロードリンクを同期
npm run readme:sync

# 3. コミット + タグ + プッシュ（アトミックに！）
git commit -am "release(<name>): <X.Y.Z>"
git tag <name>-v<X.Y.Z>
git push origin main <name>-v<X.Y.Z>
```

`release-skill` ワークフローは、タグが `manifest.json#version` と一致することを検証し、
ドリフトしている場合は公開を拒否します。したがって、ここでタイプミスがあっても
間違ったアーティファクトを出荷するのではなく、CI が単に失敗するだけです。

リリースを取り消すには:

```bash
# タグをローカルとリモートで削除。
git tag -d <name>-v<X.Y.Z>
git push origin :refs/tags/<name>-v<X.Y.Z>

# GitHub リリースを削除。
gh release delete <name>-v<X.Y.Z> --yes
```

> 既存のリリースを上書きするよりも、バージョンをバンプする（`<X.Y.(Z+1)>` を公開する）
> ことを強く推奨します。不変性こそが、バージョン固定 `.zip` URL の存在意義です。

---

## トラブルシューティング

| 症状 | 原因 | 修正 |
|---|---|---|
| `release-skill` が失敗: `Version drift: tag asks for 1.1.0 but manifest is 1.0.0` | タグはプッシュされたが `manifest.json#version` がバンプされていない | マニフェストをバンプし、コミットし、再タグ付け |
| `validate-skills` が失敗: `README out of date` | 誰かが README のダウンロード行を手で編集したか、`npm run readme:sync` を実行せずにマニフェストをバンプした | `npm run readme:sync` を実行してコミット |
| `validate-skills` が失敗: `manifest.json` がない | 新しいスキルフォルダがマニフェストなしで追加された | 最低でも `name`、`version`、`description`、`category`、`compat` を含む `skills/<name>/manifest.json` を追加 |
| `cut-release.mjs` が `Tag 'foo' does not match <skill>-v<semver>` で終了 | タグ名のタイプミス | タグは正確に `<lower-kebab-skill-name>-v<X.Y.Z>` でなければならない |
| `cut-release.mjs` が「Local main is N commit(s) behind origin/main」と言う | 最後のプルの後にボットが README 同期をプッシュした | `git pull origin main` してから再実行 |
| 汚れたツリーで `npm run release` が失敗 | 未コミットの変更がある | 先にコミット/スタッシュするか、`npm run release:dry` でプレビューのみする |

---

## 設計メモ

- **なぜ `SKILL.md` フロントマターに新しいフィールドを追加するのではなく、別の `manifest.json` なのか？**
  ランタイムで YAML パーサーに依存することなく、マニフェストを機械可読な JSON にしたいことと、
  `version` / `compat` をエージェント向けの `SKILL.md` 契約から切り離したいからです。
- **なぜリポジトリ全体のバージョニングではなく、スキル別の SemVer なのか？**
  スキルは非常に異なるペースで進化します。それらを結合すると、ダウンストリームの
  ピン留めにペナルティを課すことになります。
- **なぜ rolling-latest タグがないのか？**
  GitHub は既にリポジトリ内の最新リリースに対して `releases/latest/download/<asset>` を
  提供しており、README 内のスキル別バージョン固定 URL はリリースごとに自動的に
  書き換えられるため、3 つ目の URL バリエーションを維持する価値はありません。
- **なぜ npm パッケージを公開しないのか？**
  コミュニティが維持する [`npx skills`](https://www.npmjs.com/package/skills)
  CLI が既にこのリポジトリのレイアウト（サブパス、タグ URL、エージェント検出）を
  理解しているため、プライベート CLI として同じインストール UX を再実装しても
  エコシステムを断片化するだけです。
- **なぜ npm 依存関係がゼロなのか？**
  CI を高速に保ち（インストールステップなし）、サプライチェーンの表面積を排除し、
  `npm install` なしで Node 20+ のあらゆる環境でツールが動作することを保証するためです。
