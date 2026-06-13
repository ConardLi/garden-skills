<div align="center">

# Garden Skills

**Claude Code、Cursor、Codex、その他の AI コーディングエージェント向けに、本番環境ですぐに使える [Agent Skills](https://support.claude.com/en/articles/12512176-what-are-skills) を厳選したコレクション。**

<a id="skills-gallery"></a>

<table>
<tr>
<td width="50%" valign="top">
<a href="#web-video-presentation"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video-presentation-skill.webp" alt="Web Video Presentation Skill" width="100%"></a>
<br/><a href="#web-video-presentation"><strong>web-video-presentation</strong></a>
<br/><sub>Web 動画 / プレゼンテーション</sub>
</td>
<td width="50%" valign="top">
<a href="#web-design-engineer"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp" alt="Web Design Skill" width="100%"></a>
<br/><a href="#web-design-engineer"><strong>web-design-engineer</strong></a>
<br/><sub>デザイン / フロントエンド</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="#gpt-image-2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/gpt-image-2-skill.webp" alt="GPT Image 2 Skill" width="100%"></a>
<br/><a href="#gpt-image-2"><strong>gpt-image-2</strong></a>
<br/><sub>画像生成 / プロンプト</sub>
</td>
<td width="50%" valign="top">
<a href="#beautiful-article"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/banner.webp" alt="Beautiful Article Skill" width="100%"></a>
<br/><a href="#beautiful-article"><strong>beautiful-article</strong></a>
<br/><sub>あらゆる素材 → 美しい記事</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="#xquik-social-data"><img src="https://xquik.com/icon.svg" alt="Xquik Social Data Skill" width="100%"></a>
<br/><a href="#xquik-social-data"><strong>xquik-social-data</strong></a>
<br/><sub>X/Twitter データ / 自動化</sub>
</td>
<td width="50%" valign="top">
<a href="#kb-retriever"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/kb-retriever-skill.webp" alt="Kb Retriever Skill" width="100%"></a>
<br/><a href="#kb-retriever"><strong>kb-retriever</strong></a>
<br/><sub>検索 / ローカル知識ベース</sub>
</td>
</tr>
</table>

[![License: MIT](https://img.shields.io/github/license/ConardLi/garden-skills?style=flat-square&color=blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ConardLi/garden-skills?style=flat-square)](https://github.com/ConardLi/garden-skills/stargazers)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#コントリビュート)
[![Skills count](https://img.shields.io/badge/skills-6-orange?style=flat-square)](#skills-gallery)
[![Spec](https://img.shields.io/badge/spec-SKILL.md-black?style=flat-square)](https://agentskills.io)

[English](./README.md) · [中文文档](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

</div>

---

## 目次

| インストール | 使い方 | コントリビュート |
|---|---|---|
| [インストール](#インストール)<br>[`skills` CLI（npx）](#方法-a--skills-clinpx)<br>[Claude Code プラグインマーケットプレイス](#方法-b--claude-code-プラグインマーケットプレイス)<br>[Releases のバージョン固定 `.zip`](#方法-c--releases-のバージョン固定-zip)<br>[手動コピー](#方法-d--プロジェクトへ手動コピー)<br>[Git submodule](#方法-e--git-submodule) | [互換性](#互換性)<br>[Skill とは？](#skill-とは) | [コントリビュート](#コントリビュート)<br>[謝辞](#謝辞)<br>[ライセンス](#ライセンス) |

---

### [`web-video-presentation`](./skills/web-video-presentation)

![Web Video Presentation Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video-presentation-skill.webp)

**カテゴリ:** Web 動画 / プレゼンテーションエンジニアリング  
**用途:** スクリプト、記事、レッスン、製品デモ、トークを、シネマティックな動画として画面録画できるクリック駆動の 16:9 Web プレゼンテーションに変換します。

`web-video-presentation` は、動画制作環境のように振る舞う録画対応の Vite + React + TypeScript プレゼンテーションを構築します。このワークフローでは、生の記事をナレーションスクリプトに変換し、スクリプトの各ビートをフルスクリーンシーンにマッピングし、必要なチェックポイントで一時停止し、ビジュアルアウトラインの承認後にオプションでナレーション音声を合成できます。

主な特徴:

- 安定した画面録画のため、ビューポートに合わせてスケールする固定 1920×1080 ステージ
- クリック / キーボード駆動の `(chapter, step)` カーソル、ビジュアルステップごとに 1 つのナレーションビート
- スクリプト、テーマ、アウトライン、実装モード、オプションの音声に対する厳格なコラボレーションチェックポイント
- 録画中もステージをクリーンに保つ、ホバー時のみ表示される進捗コントロール
- **23 種類のビルトインテーマ**（`midnight-press` から `swiss-ikb` まで）を備えたテーマトークンアーキテクチャ。エディトリアル、ターミナル、エンジニアリング、スイス国際主義など、各テーマが独自のデザインシグネチャを持つ
- **プラガブル TTS**：プロバイダー非依存の音声ランナー。**2 つのビルトインプロバイダー**（MiniMax `mmx-cli` + curl 経由の OpenAI TTS）を同梱し、ElevenLabs / edge-tts / Azure / Google Cloud / macOS `say` 用のコピペ可能なスニペットも付属
- 再利用可能なステージプリミティブと録画ガイダンスを備えた Vite + React + TypeScript プロジェクトのスキャフォールド

<table>
<tr>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/creative-voltage.webp" alt="creative-voltage プレビュー" /></a><br /><sub><code>creative-voltage</code><br />クリエイティブトーク</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/blueprint.webp" alt="blueprint プレビュー" /></a><br /><sub><code>blueprint</code><br />技術アーキテクチャ</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/swiss-ikb.webp" alt="swiss-ikb プレビュー" /></a><br /><sub><code>swiss-ikb</code><br />データレポート</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/chalk-garden.webp" alt="chalk-garden プレビュー" /></a><br /><sub><code>chalk-garden</code><br />科学解説</sub></td>
</tr>
</table>

<a href="./skills/web-video-presentation/README.md#theme-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/gallery.webp" alt="web-video-presentation のテーマギャラリー — 23 種類のビルトインテーマ" /></a>

<sub>↑ 23 種類のテーマを一望 — <a href="./skills/web-video-presentation/README.md#theme-gallery"><b>完全なギャラリーを開く</b></a>と、ライブ 16:9 プレビュー、デザインシグネチャ、用途タグ付きで閲覧できます。</sub>

リンク: [README](./skills/web-video-presentation/README.md) · [SKILL.md](./skills/web-video-presentation/SKILL.md) · <!-- DOWNLOAD:web-video-presentation:start -->[Download v1.2.2 .zip](https://github.com/ConardLi/garden-skills/releases/download/web-video-presentation-v1.2.2/web-video-presentation-1.2.2.zip)<!-- DOWNLOAD:web-video-presentation:end -->

---

### [`web-design-engineer`](./skills/web-design-engineer)

![Web Design Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp)

**カテゴリ:** デザイン / フロントエンド  
**用途:** Web ページ、ランディングページ、ダッシュボード、インタラクティブプロトタイプ、HTML スライドデッキ、アニメーション、UI モックアップ、データビジュアライゼーション、デザインシステムの探求。

`web-design-engineer` は、AI が生成する Web 成果物を単に機能するだけのものから、洗練され、意図的で、視覚的に印象に残るフロントエンド作品へと変えます。エージェントをデザインエンジニアとして扱い、まず製品コンテキストを理解し、次にデザインシステムを宣言し、初期 v0 を示し、フルエクスペリエンスを構築し、結果を検証します。

主な特徴:

- 要件 → コンテキスト → デザインシステム → v0 → フルビルド → 検証という 6 ステップのデザインワークフローを定義
- アンチクリシェのブロックリストとより強いビジュアル判断力で、一般的な AI UI パターンを超える
- **デザインディレクション・アドバイザー（6 学派の差別化された 3 択推薦）と、anchor 付きスタイルレシピ 25 種類**（Linear / Aesop / Pentagram / Bloomberg / Stripe Press / Mid-Century など）を内蔵。各レシピにはコピー可能なパレット、タイポグラフィ、シグネチャムーブ、アンチパターンが揃っており、デザインシステム宣言にそのまま貼り込める
- HTML / CSS / JavaScript / React プロトタイプをカバーし、レスポンシブレイアウト、モーション、インタラクションの仕上げに関するガイダンスを提供
- インライン React + Babel、CSS トークン、`oklch()` カラー処理、コンテナクエリ、reduced-motion 対応の実装ルールを含む
- デバイスフレーム、スライドエンジン、アニメーションタイムライン、ダッシュボード、その他の再利用可能な Web 成果物のための高度なパターンリファレンスを同梱

<table>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp" alt="aesop プレビュー" /></a><br /><sub><code>aesop</code><br />アポセカリー</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp" alt="muji-kenya-hara プレビュー" /></a><br /><sub><code>muji-kenya-hara</code><br />器物カタログ</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp" alt="monocle-magazine プレビュー" /></a><br /><sub><code>monocle-magazine</code><br />雑誌目次</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp" alt="stripe-press プレビュー" /></a><br /><sub><code>stripe-press</code><br />書籍詳細</sub></td>
</tr>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp" alt="bloomberg-terminal プレビュー" /></a><br /><sub><code>bloomberg-terminal</code><br />取引ダッシュボード</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp" alt="linear プレビュー" /></a><br /><sub><code>linear</code><br />開発者 LP</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp" alt="vercel-mesh プレビュー" /></a><br /><sub><code>vercel-mesh</code><br />デプロイ Hero</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp" alt="tufte-dataink プレビュー" /></a><br /><sub><code>tufte-dataink</code><br />データナラティブ</sub></td>
</tr>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp" alt="mid-century-modern プレビュー" /></a><br /><sub><code>mid-century-modern</code><br />ポスターオマージュ</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp" alt="y2k-retrofuturism プレビュー" /></a><br /><sub><code>y2k-retrofuturism</code><br />Y2K ポータル</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp" alt="bloomberg-businessweek-turley プレビュー" /></a><br /><sub><code>businessweek-turley</code><br />編集カバー</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp" alt="active-theory プレビュー" /></a><br /><sub><code>active-theory</code><br />没入型ローンチ</sub></td>
</tr>
</table>

<sub>↑ 25 種類の anchor 付きレシピから代表的な 12 種類を抜粋 — <a href="./skills/web-design-engineer/README.md#style-recipe-gallery"><b>完全なギャラリーを開く</b></a>と、25 種類すべての実作品（アポセカリーページ、取引ワークステーション、雑誌カバー、Y2K ポータル、ミッドセンチュリーポスター…）がシグネチャムーブと用途タグ付きで閲覧できます。</sub>

リンク: [README](./skills/web-design-engineer/README.md) · [SKILL.md](./skills/web-design-engineer/SKILL.md) · [Website](./website/web-design-website) · [Demo](./demo/web-design-demo) · <!-- DOWNLOAD:web-design-engineer:start -->[Download v1.2.2 .zip](https://github.com/ConardLi/garden-skills/releases/download/web-design-engineer-v1.2.2/web-design-engineer-1.2.2.zip)<!-- DOWNLOAD:web-design-engineer:end -->

---

### [`gpt-image-2`](./skills/gpt-image-2)

![GPT Image 2 Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/gpt-image-2-skill.webp)

**カテゴリ:** 画像生成 / プロンプトエンジニアリング  
**用途:** ポスター、UI モックアップ、製品ビジュアル、インフォグラフィック、学術図、技術図、コミック、アバター、ストーリーボード、ブランディングボード、画像編集ワークフロー。

`gpt-image-2` は、GPT Image 2 および OpenAI 互換の画像 API に特化した画像生成スキルです。完全にローカルな Garden での生成、ホストネイティブの画像ツールへの委譲、画像ツールがない場合のプロンプトのみのアドバイザーモードなど、異なるエージェント環境で動作するように設計されています。

主な特徴:

- 3 つのランタイムモードをサポート: **モード A: Garden ローカル**、**モード B: ホストネイティブ委譲**、**モード C: アドバイザー専用プロンプト作成**
- すべてのタスクをモード検出から開始し、スキルが間違った実行パスを暗黙的に選択しないようにする
- `references/` 配下に 18 のビジュアルカテゴリと 79 の構造化プロンプトテンプレートを提供
- 専用のワークフローとスクリプトを通じて、画像生成と画像編集の両方をカバー
- Garden モードでは、再利用、レビュー、バージョン管理のためにプロンプトと生成画像を `garden-gpt-image-2/` 配下に保存

#### Selected Live Cases

<table>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/editing-workflows%2Fbackground-replacement%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/editing-workflows/background-replacement/1-thumb.webp" alt="Background replacement case" width="100%"></a><br/>
      <strong><code>background-replacement</code></strong><br/>
      <sub>人物写真の背景差し替えとネオン再ライティング。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fchat-interface-scene%2F3"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/chat-interface-scene/3-thumb.webp" alt="AI assistant UI mockup case" width="100%"></a><br/>
      <strong><code>chat-interface-scene</code></strong><br/>
      <sub>Claude 風 AI アシスタントの製品スクリーン。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Flive-commerce-ui%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/live-commerce-ui/1-thumb.webp" alt="Live commerce UI case" width="100%"></a><br/>
      <strong><code>live-commerce-ui</code></strong><br/>
      <sub>有名人ライブコマース画面。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fproduct-card-overlay%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/product-card-overlay/1-thumb.webp" alt="Product card overlay case" width="100%"></a><br/>
      <strong><code>product-card-overlay</code></strong><br/>
      <sub>スキンケア LP の Hero ビジュアル。</sub>
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/infographics%2Fbento-grid-infographic%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/infographics/bento-grid-infographic/1-thumb.webp" alt="Bento grid infographic case" width="100%"></a><br/>
      <strong><code>bento-grid-infographic</code></strong><br/>
      <sub>iPhone 16 Pro の高密度な一枚解説。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/technical-diagrams%2Fsystem-architecture%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/technical-diagrams/system-architecture/1-thumb.webp" alt="System architecture diagram case" width="100%"></a><br/>
      <strong><code>system-architecture</code></strong><br/>
      <sub>マルチテナント AI SaaS の本番構成図。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/slides-and-visual-docs%2Fdense-explainer-slides%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/slides-and-visual-docs/dense-explainer-slides/2-thumb.webp" alt="Dense explainer slide case" width="100%"></a><br/>
      <strong><code>dense-explainer-slides</code></strong><br/>
      <sub>AI Agent の仕組みを一枚で説明。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/maps%2Ffood-map%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/maps/food-map/1-thumb.webp" alt="Food map case" width="100%"></a><br/>
      <strong><code>food-map</code></strong><br/>
      <sub>街歩き向けの編集型フードマップ。</sub>
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/product-visuals%2Fexploded-view-poster%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/product-visuals/exploded-view-poster/2-thumb.webp" alt="Exploded product poster case" width="100%"></a><br/>
      <strong><code>exploded-view-poster</code></strong><br/>
      <sub>Vision Pro 2 の光学系と演算モジュール分解図。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/academic-figures%2Fneural-network-architecture%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/academic-figures/neural-network-architecture/2-thumb.webp" alt="Neural network architecture case" width="100%"></a><br/>
      <strong><code>neural-network-architecture</code></strong><br/>
      <sub>論文向け ViT-B/16 アーキテクチャ図。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/branding-and-packaging%2Fcosmetic-packaging%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/branding-and-packaging/cosmetic-packaging/1-thumb.webp" alt="Cosmetic packaging case" width="100%"></a><br/>
      <strong><code>cosmetic-packaging</code></strong><br/>
      <sub>高級スキンケアのギフトボックス構成。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/storyboards-and-sequences%2Fanime-key-visual%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/storyboards-and-sequences/anime-key-visual/1-thumb.webp" alt="Anime key visual case" width="100%"></a><br/>
      <strong><code>anime-key-visual</code></strong><br/>
      <sub>ゲームローンチ向けのトリミング安全な KV。</sub>
    </td>
  </tr>
</table>

<sub>↑ 160+ 件の公開ケースライブラリから代表的な 12 件を抜粋 — <a href="./skills/gpt-image-2/README.md#case-gallery"><b>スキルギャラリーを開く</b></a>か、<a href="https://gpt-image2.mmh1.top/#/case">ライブサイト</a>で閲覧できます。</sub>

リンク: [README](./skills/gpt-image-2/README.md) · [SKILL.md](./skills/gpt-image-2/SKILL.md) · [Website](./website/gpt-image2-website) · <!-- DOWNLOAD:gpt-image-2:start -->[Download v1.0.4 .zip](https://github.com/ConardLi/garden-skills/releases/download/gpt-image-2-v1.0.4/gpt-image-2-1.0.4.zip)<!-- DOWNLOAD:gpt-image-2:end -->

---

### [`kb-retriever`](./skills/kb-retriever)

![Kb Retriever Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/kb-retriever-skill.webp)

**カテゴリ:** 検索 / ローカル知識ベース  
**用途:** ローカルの `knowledge/` ディレクトリから質問に答え、構造化されたドキュメントを検索し、エージェントのコンテキストを溢れさせることなく Markdown、テキスト、PDF、Excel ファイルから根拠を抽出します。

`kb-retriever` は、慎重で段階的な検索を中心に構築されたローカル知識ベースのリトリーバです。ファイル全体を読み込むのではなく、階層的なインデックスファイルをたどり、候補集合を絞り込み、複雑なファイルタイプを正しく処理し、出典付きで回答します。

主な特徴:

- 階層化された `data_structure.md` ファイルを使用して、コンテンツを検索する前に知識ベース内を移動
- PDF および Excel ファイルに対して**learn-before-process**ルールを強制し、抽出や分析の前に同梱のリファレンスドキュメントを使用
- 正確なキーワード検索、ローカルウィンドウ読み込み、同義語、反復的なリファインメントを組み合わせる
- 検索を最大 5 ラウンドに制限し、探索を制御された範囲に保つ
- `grep`、`pdftotext`、`pdfplumber`、`pandas` のワークフローと、出典を意識した回答フォーマットを含む

リンク: [README](./skills/kb-retriever/README.md) · [SKILL.md](./skills/kb-retriever/SKILL.md) · <!-- DOWNLOAD:kb-retriever:start -->[Download v1.0.1 .zip](https://github.com/ConardLi/garden-skills/releases/download/kb-retriever-v1.0.1/kb-retriever-1.0.1.zip)<!-- DOWNLOAD:kb-retriever:end -->

---

### [`beautiful-article`](./skills/beautiful-article)

![Beautiful Article Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/banner.webp)

**カテゴリ:** 編集 · あらゆる素材 → 美しい記事  
**用途:** URL / PDF / DOCX / Markdown / プレーンテキスト / スクリーンショット / 貼り付けたメモを、**洗練された共有しやすい記事**に変換します — ロングフォーム、ブリーフィング、解説記事、チュートリアル、レビュー、ビジュアルエッセイ、対話・インタビューの書き起こし。

`beautiful-article` は編集型の harness Skill です — 単に「Web ページを作る」のではなく、素材を編集・デザインして、原文より読みやすく、共有しやすく、保存しやすい記事に仕上げます。Skill は `source → plan → ダブル確認 → 生成 → 最終レビュー → 修復` という小さなループで進み、3 つのハードチェックポイントで一時停止して、記事タイプ・テーマ・レイアウト・画像戦略・カバー・配信形式の編集権をユーザーに保ちます。

主な特徴:

- **まずは記事ありき** — 焦点は常に「記事」そのもの：より良い読書体験、より良いリズム、より良い美学。配信物は自己完結したファイル（HTML、オプションで PDF）ですが、それは配信ディテールであって目的ではありません
- **Reacticle コンポーネントプロトコル** — prose-first の意味的コンポーネント（Hero / Lead / Section / Quote / Callout / Image / Formula / CodeBlock / Table…）と、テーマトークンのみ許可される `Raw` 自由層。基盤の React ライブラリは [`ConardLi/reacticle`](https://github.com/ConardLi/reacticle) にあります
- **10 種類の記事タイプ + 推奨保留率パッケージ** — `longform · ~100%` / `tutorial · ~90%` / `full-report · ~80%` / `explainer · ~80%` / `dialogue · ~80%` / `review · ~70%` / `essay · ~70%` / `briefing · ~50%` / `visual-essay · ~40%` / `interactive-explainer · ~25% 抜粋 + 75% AI 再構成`
- **11 種類のテーマ authoring profile**（`tufte`、`press`、`bayer`、`bodoni`、`vignelli`、`sottsass`、`freddie`、`andy`、`fuller`、`knuth`、`shannon`）— 各々が CSS ではなく Agent 向けの Markdown コントラクト
- **ハードコラボレーションチェックポイント**、項目ごとに独立確認（サイレントデフォルト禁止）、3:4 ブックカバー、TOC デフォルト ON、目標言語へのネイティブ翻訳ステップ
- **ノードごとの品質プロトコル** — Plan は主 Agent インラインチェック、First Spread / Section / Final は sub-agent reviewer、修復は最小スライス

#### テーマギャラリー

<table>
<tr>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/tufte.webp" alt="tufte" width="100%"><br/><sub><b>tufte</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/press.webp" alt="press" width="100%"><br/><sub><b>press</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/bayer.webp" alt="bayer" width="100%"><br/><sub><b>bayer</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/bodoni.webp" alt="bodoni" width="100%"><br/><sub><b>bodoni</b></sub></td>
</tr>
<tr>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/vignell.webp" alt="vignelli" width="100%"><br/><sub><b>vignelli</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/sottsass.webp" alt="sottsass" width="100%"><br/><sub><b>sottsass</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/freddie.webp" alt="freddie" width="100%"><br/><sub><b>freddie</b></sub></td>
<td width="25%" align="center"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/andy.webp" alt="andy" width="100%"><br/><sub><b>andy</b></sub></td>
</tr>
</table>

リンク: [README](./skills/beautiful-article/README.md) · [SKILL.md](./skills/beautiful-article/SKILL.md) · <!-- DOWNLOAD:beautiful-article:start -->[Download v0.1.0 .zip](https://github.com/ConardLi/garden-skills/releases/download/beautiful-article-v0.1.0/beautiful-article-0.1.0.zip)<!-- DOWNLOAD:beautiful-article:end -->

---

### [`xquik-social-data`](./skills/xquik-social-data)

![Xquik Social Data Skill](https://xquik.com/icon.svg)

**カテゴリ:** ソーシャルデータ / 自動化
**用途:** Xquik の REST、MCP、SDK、抽出ジョブ、監視、Webhook、確認付き書き込み操作で X/Twitter データワークフローを構築します。

`xquik-social-data` は、エージェントが適切な Xquik 統合パスを選びながら、認証情報、不信頼な X コンテンツ、書き込み承認を安全に扱うための Skill です。範囲を決めたデータ読み取り、大規模エクスポート、エージェントや IDE の MCP 設定、Webhook 配信、監視、慎重な確認が必要な X 操作に向いています。

主な特徴:

- 最新の Xquik ドキュメント、API reference、MCP guide、公式 Skill repository から確認を始める
- REST / MCP の単発読み取り、抽出ジョブ、監視、HMAC Webhook、SDK 利用、書き込み操作の計画をカバー
- API key をホストの secret または environment system に置き、チャット、ログ、例、コミットへ出さない
- tweets、bios、DMs、articles、display names、API errors を不信頼データとして扱う
- private read、persistent resource、Webhook destination、write、delete、DM、profile update、account change の前に明示的な確認を要求

リンク: [README](./skills/xquik-social-data/README.md) · [SKILL.md](./skills/xquik-social-data/SKILL.md) · [Docs](https://docs.xquik.com) · <!-- DOWNLOAD:xquik-social-data:start -->_（まだリリースされていません）_<!-- DOWNLOAD:xquik-social-data:end -->

---

## インストール

サポートされているインストール方法は 5 つあります。自分のスタックに合うものを選んでください:

| # | 方法 | 用途 | バージョン固定？ |
|---|---|---|---|
| A | [`skills` CLI（`npx skills add`）](#方法-a--skills-clinpx) | あらゆるエージェント、ワンラインインストール、スキルをピンポイントで選択 | ✅ タグ URL 経由 |
| B | [Claude Code プラグインマーケットプレイス](#方法-b--claude-code-プラグインマーケットプレイス) | プラグインパックを購読したい Claude Code ユーザー | ✅ マーケットプレイスのバージョン経由 |
| C | [GitHub Releases のバージョン固定 `.zip`](#方法-c--releases-のバージョン固定-zip) | CI / エアギャップ環境 / 再現可能なインストール | ✅ ✅（不変） |
| D | [`git clone` 後の手動コピー](#方法-d--プロジェクトへ手動コピー) | スキル自体のローカルでのハック | ❌（`main` を追跡） |
| E | [Git submodule](#方法-e--git-submodule) | より大きなプロジェクトにベンダリングし、アップストリームの更新を取り込みたい | ✅ submodule の SHA 経由 |

> 上記の各スキルセクションには「Links:」行に **`Download v<version> .zip`** リンクがあり、
> 現在のバージョン固定リリースアーティファクトを指しています。これらの
> URL はリリースごとに [`scripts/release/update-readme.mjs`](./scripts/release/update-readme.mjs)
> によって自動的に書き換えられるため、常に最新の不変バージョンを示します。

### 方法 A · `skills` CLI（npx）

最速のエージェント非依存のパスです。エージェント（Claude Code、Cursor、Codex など）を
自動検出し、スキルを適切なディレクトリにドロップする標準的な [`npx skills` CLI](https://www.npmjs.com/package/skills) を使用します。

```bash
# すべてのスキルをインストール（最新）
npx skills add ConardLi/garden-skills

# 1 つのスキルだけをインストール（最新）
npx skills add ConardLi/garden-skills -s web-design-engineer

# Xquik ソーシャルデータワークフロースキルだけをインストール
npx skills add ConardLi/garden-skills -s xquik-social-data

# プロジェクト単位（./.skills）ではなくグローバル（~/.skills）にインストール
npx skills add ConardLi/garden-skills -s gpt-image-2 --global

# 特定のエージェントをターゲットにする
npx skills add ConardLi/garden-skills -s kb-retriever -a claude-code
```

> **デフォルトは `main` の最新コミット。** これが 95% の場合に求められるものです。
> CLI は各スキルの最新の公開済み `SKILL.md` をソースツリーから直接追跡します。

**バージョンを固定したい？（CI / 本番）** タグスコープの `tree/` URL を使用します。
これはリリースが切られた正確なコミットを指します:

```bash
# 1 つのスキルを特定のリリースに固定
npx skills add ConardLi/garden-skills/tree/web-design-engineer-v1.0.0/skills/web-design-engineer
```

各スキルについて、現在のバージョン固定 `.zip` URL は上記の
「Links:」行にもインラインで表示されています（`Download v<version> .zip` リンク）。

便利なサブコマンド:

```bash
npx skills list                 # インストール済みのスキル
npx skills find web-design      # レジストリを検索
npx skills update               # すべてを更新
npx skills remove kb-retriever  # アンインストール
```

### 方法 B · Claude Code プラグインマーケットプレイス

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) を使用している場合、
マーケットプレイスを購読して、1 つ以上のスキルをバンドルしたプラグインパックをインストールできます:

```bash
/plugin marketplace add ConardLi/garden-skills
/plugin install presentation-skills@garden-skills
/plugin install web-design-skills@garden-skills
/plugin install knowledge-base-skills@garden-skills
/plugin install image-generation-skills@garden-skills
/plugin install social-data-skills@garden-skills
```

プラグインパックは [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json) で宣言されています:

| プラグインパック | 含まれるスキル |
|---|---|
| `presentation-skills` | `web-video-presentation` |
| `web-design-skills` | `web-design-engineer` |
| `knowledge-base-skills` | `kb-retriever` |
| `image-generation-skills` | `gpt-image-2` |
| `social-data-skills` | `xquik-social-data` |

### 方法 C · Releases のバージョン固定 `.zip`

正式なリリースごとに、不変の `.zip`（SHA-256 チェックサム付き）が
[GitHub Releases](https://github.com/ConardLi/garden-skills/releases) に公開されます。
正確なバイト列が後から変わらないことを保証する必要がある場合は、CI、Dockerfile、
エアギャップインストーラからこれにピン留めしてください。

```bash
# <skill> と <version> を希望するバージョンに置き換えてください。
SKILL=web-design-engineer
VERSION=1.0.0

curl -fsSL -o "${SKILL}.zip" \
  "https://github.com/ConardLi/garden-skills/releases/download/${SKILL}-v${VERSION}/${SKILL}-${VERSION}.zip"

# チェックサムを検証（無人インストールでは強く推奨）
curl -fsSL -o "${SKILL}.zip.sha256" \
  "https://github.com/ConardLi/garden-skills/releases/download/${SKILL}-v${VERSION}/${SKILL}-${VERSION}.zip.sha256"
shasum -a 256 -c "${SKILL}.zip.sha256"

# エージェントのスキルディレクトリにフォルダを展開
unzip -q "${SKILL}.zip" -d .claude/skills/   # または .agents/skills/、.codex/skills/ ...
```

フローティング「常に最新」の URL も利用可能で、ワンオフのインストールに便利です:

```bash
https://github.com/ConardLi/garden-skills/releases/latest/download/<skill>-<version>.zip
```

> **すべてのスキルのバージョン固定 URL は、この README にインラインでリストされています** -
> 上記の各スキルの「Links」エントリの下にある「Download」行を参照してください。
> これらはリリースパイプラインによって自動的に同期されます。

### 方法 D · プロジェクトへ手動コピー

リポジトリをクローンし、必要なスキルフォルダをコピーします。スキル自体を
フォークまたはハックしたい場合に便利です。

```bash
git clone https://github.com/ConardLi/garden-skills.git
cp -r garden-skills/skills/web-design-engineer  your-project/.claude/skills/
# Cursor / 汎用エージェント:
cp -r garden-skills/skills/web-design-engineer  your-project/.agents/skills/
```

次回エージェントがワークスペースをスキャンしたときに、スキルが検出されます。

### 方法 E · Git submodule

アップストリームの更新を追跡したい、より大きなプロジェクトへのベンダリング用:

```bash
git submodule add https://github.com/ConardLi/garden-skills.git vendor/garden-skills
ln -s ../../vendor/garden-skills/skills/web-design-engineer .claude/skills/web-design-engineer
```

再現性のためにリリースタグに固定:

```bash
cd vendor/garden-skills
git checkout web-design-engineer-v1.0.0
```

---

## 互換性

| エージェント / ランタイム | スキルの場所 | ステータス |
|---|---|---|
| **Claude Code** | `.claude/skills/<name>/` またはプラグインマーケットプレイス経由 | ✅ テスト済み |
| **Claude.ai**（Web） | Settings → Capabilities → Skills | ✅ テスト済み |
| **Cursor** | `.agents/skills/<name>/` | ✅ テスト済み |
| **Codex CLI** | `.codex/skills/<name>/` | ✅ テスト済み |
| **Gemini CLI** | extension manifest | ✅ テスト済み |
| **OpenCode** | `.opencode/skills/<name>/` | ✅ テスト済み |

> `SKILL.md` フォーマットは設計上ポータブルです。エージェントがスキルをサポートしていれば、フォルダをスキャンするディレクトリにコピーするだけで動作するはずです。このマトリクスを拡張する PR を歓迎します。

---

## Skill とは？

**Skill** は、エージェントがオンデマンドで読み込める自己完結型のフォルダです。
これは `SKILL.md`（YAML フロントマター + 指示）と、オプションでリファレンスドキュメント、
スクリプト、アセットで構成されます:

```text
<skill-name>/
├── SKILL.md      ← 必須: いつ使うか + どのように使うか
├── README.md     ← 人間向けドキュメント
├── references/   ← オプション: エージェントがオンデマンドで読み込む拡張ドキュメント
├── scripts/      ← オプション: 決定論的な実行可能ヘルパー
└── assets/       ← オプション: テンプレート、フォント、アイコン
```

エージェントは、フロントマターの `description` 行からスキルを有効化するかどうかを
決定します。したがって、description はあなたとエージェントの間の契約です。
詳細な仕様については、[agentskills.io](https://agentskills.io) および
[Anthropic のリファレンスリポジトリ](https://github.com/anthropics/skills) を参照してください。

---

## コントリビュート

バグレポート、新しいスキル、ツールの改善など、すべてを歓迎します。

メンテナー向けのドキュメント（リポジトリ構成、リリースプロセス、バージョン
ルール、CI ワークフロー、トラブルシューティング）は
[**`CONTRIBUTING.md`**](./CONTRIBUTING.md) ([中文](./CONTRIBUTING.zh-CN.md)) にあります。
スキルを追加したりリリースを切ったりしたい場合は、まずそちらを読んでください。

クイックオリエンテーション:

```bash
git clone https://github.com/ConardLi/garden-skills.git
cd garden-skills
npm run list      # すべてのスキル + マニフェストステータスを表示
npm run validate  # CI がすべての PR で実行するのと同じチェック
```

---

## 謝辞

このコレクションは、以下の肩の上に成り立っています:

- **[Anthropic](https://www.anthropic.com)** - [Agent Skills 仕様](https://agentskills.io) および [`anthropics/skills`](https://github.com/anthropics/skills) リファレンスリポジトリの提供。
- **[Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs)** - `web-design-engineer` のインスピレーションとなったシステムプロンプト。オリジナルは参考のため [`dist/prompt/claude-design-system-prompt.md`](./dist/prompt/claude-design-system-prompt.md) に保存されています。
- より広い OSS スキルコミュニティ - さらなる発見のために [`travisvn/awesome-claude-skills`](https://github.com/travisvn/awesome-claude-skills) と [`obra/superpowers`](https://github.com/obra/superpowers) を参照してください。

---

## ライセンス

[MIT](./LICENSE) © [ConardLi](https://github.com/ConardLi)
