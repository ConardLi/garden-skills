<div align="center">

# Garden Skills

**花园老师的开源 [Agent Skills](https://support.claude.com/en/articles/12512176-what-are-skills) 集合，面向 Claude Code、Cursor、Codex 等所有支持 `SKILL.md` 格式的 AI 编程代理。**

<a id="skills-gallery"></a>

<table>
<tr>
<td width="50%" valign="top">
<a href="#web-video-presentation"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video-presentation-skill.webp" alt="Web Video Presentation Skill" width="100%"></a>
<br/><a href="#web-video-presentation"><strong>web-video-presentation</strong></a>
<br/><sub>网页视频 / 演示</sub>
</td>
<td width="50%" valign="top">
<a href="#web-design-engineer"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp" alt="Web Design Skill" width="100%"></a>
<br/><a href="#web-design-engineer"><strong>web-design-engineer</strong></a>
<br/><sub>设计 / 前端</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="#gpt-image-2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/gpt-image-2-skill.webp" alt="GPT Image 2 Skill" width="100%"></a>
<br/><a href="#gpt-image-2"><strong>gpt-image-2</strong></a>
<br/><sub>图像生成 / Prompt</sub>
</td>
<td width="50%" valign="top">
<a href="#beautiful-article"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/banner.webp" alt="Beautiful Article Skill" width="100%"></a>
<br/><a href="#beautiful-article"><strong>beautiful-article</strong></a>
<br/><sub>任意素材 → 一篇精美的文章</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top" colspan="2">
<a href="#study"><img src="./dist/imgs/study-skill.png" alt="Study Skill" width="100%"></a>
<br/><a href="#study"><strong>study</strong></a>
<br/><sub>AI 学习助手</sub>
</td>
</tr>
</table>

[![License: MIT](https://img.shields.io/github/license/ConardLi/garden-skills?style=flat-square&color=blue)](./LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/ConardLi/garden-skills?style=flat-square)](https://github.com/ConardLi/garden-skills/stargazers)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#贡献)
[![Skills count](https://img.shields.io/badge/skills-5-orange?style=flat-square)](#skills-gallery)
[![Spec](https://img.shields.io/badge/spec-SKILL.md-black?style=flat-square)](https://agentskills.io)

[English](./README.md) · [中文文档](./README.zh-CN.md) · [日本語](./README.ja-JP.md)

</div>

---

## 目录

| 安装 | 使用 | 参与共建 |
|---|---|---|
| [安装](#安装)<br>[`skills` CLI（npx）](#方式-a--skills-clinpx)<br>[Claude Code 插件市场](#方式-b--claude-code-插件市场)<br>[Releases 钉版本 `.zip`](#方式-c--releases-钉版本-zip)<br>[手动拷贝](#方式-d--手动拷贝到项目)<br>[Git Submodule](#方式-e--git-submodule) | [兼容性](#兼容性)<br>[什么是 Skill？](#什么是-skill) | [贡献](#贡献)<br>[致谢](#致谢)<br>[许可证](#许可证) |

---

### [`study`](./skills/study)

![Study Skill](./dist/imgs/study-skill.png)

**类别：** 学习 / 教育  
**适合：** 学习任何概念或技能 — 从"我不懂"到"我能熟练运用"。

`study` 是基于 **YJango 学习理论 v5.5** 的 AI 学习助手。它不是直接抛信息，而是遵循渐构八步框架：诊断 → 分解 → 逐原子教学 → 验证。适配编程、语言学习、理论知识和实践技能等各类场景。

亮点：

- **先诊断后教学** — 不摸清学习者需求之前不开始讲解
- **三个学习原子** — 判别（🧩）、联结（🔗）、内隐（⚡），各有专属练习工作流
- **24 个参考模块** — 覆盖概念世界、信息论、DCA、内隐/外显学习等
- **领域自适应** — 自动检测编程场景并加载领域专属指导
- **质量护栏** — 11 条质量检查防止浅层学习
- **进度追踪** — 跨会话保存学习记录

链接：[README](./skills/study/README.zh-CN.md) · [SKILL.md](./skills/study/SKILL.md) · <!-- DOWNLOAD:study:start -->_（暂未发布）_<!-- DOWNLOAD:study:end -->

---

### [`web-video-presentation`](./skills/web-video-presentation)

![Web Video Presentation Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video-presentation-skill.webp)

**类别：** 网页视频 / 演示工程  
**适合：** 把口播稿、文章、课程、产品演示和 talk 做成视频（网页模拟）。

`web-video-presentation` 用于构建适合录屏的 Vite + React + TypeScript 演示。它会把原始文章转成口播稿，把口播节拍映射成全屏视觉 step，在关键节点暂停让用户确认，并可在视觉 outline 确认后选择性合成口播音频。

亮点：

- 固定 1920×1080 舞台，并按视口缩放，适合稳定录屏
- 点击 / 键盘驱动 `(chapter, step)` 游标，一个口播节拍对应一个视觉 step
- 在稿子、主题、outline、开发模式和可选音频合成前设置硬 checkpoint
- 悬浮才出现的进度控制，录屏时画面保持干净
- 基于主题 token 的视觉架构，内置 **23 套主题**，每套独立设计签名，覆盖编辑、终端、工程、瑞士国际主义等多种风格
- **可插拔 TTS**：provider-agnostic 音频 runner，**内置 2 个 provider**（MiniMax `mmx-cli` + OpenAI TTS via curl），并附带三函数契约 + ElevenLabs / edge-tts / Azure / Google Cloud / macOS `say` 的现成代码片段
- 脚手架产出 Vite + React + TypeScript 项目，并附带舞台原语与录屏指南

<table>
<tr>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.zh-CN.md#主题画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/creative-voltage.webp" alt="creative-voltage 预览" /></a><br /><sub><code>creative-voltage</code><br />创意分享</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.zh-CN.md#主题画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/blueprint.webp" alt="blueprint 预览" /></a><br /><sub><code>blueprint</code><br />技术架构</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.zh-CN.md#主题画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/swiss-ikb.webp" alt="swiss-ikb 预览" /></a><br /><sub><code>swiss-ikb</code><br />数据汇报</sub></td>
<td align="center" width="25%"><a href="./skills/web-video-presentation/README.zh-CN.md#主题画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/chalk-garden.webp" alt="chalk-garden 预览" /></a><br /><sub><code>chalk-garden</code><br />科普讲解</sub></td>
</tr>
</table>

<a href="./skills/web-video-presentation/README.zh-CN.md#主题画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/gallery.webp" alt="web-video-presentation 主题画廊 —— 23 套内置主题一览" /></a>

<sub>↑ 23 套主题一览 —— <a href="./skills/web-video-presentation/README.zh-CN.md#主题画廊"><b>打开完整画廊</b></a>，含真实预览图、设计签名与适合场景标签。</sub>

链接：[README](./skills/web-video-presentation/README.zh-CN.md) · [SKILL.md](./skills/web-video-presentation/SKILL.md) · <!-- DOWNLOAD:web-video-presentation:start -->[下载 v1.2.2 .zip](https://github.com/ConardLi/garden-skills/releases/download/web-video-presentation-v1.2.2/web-video-presentation-1.2.2.zip)<!-- DOWNLOAD:web-video-presentation:end -->
链接：[README](./skills/web-video-presentation/README.zh-CN.md) · [SKILL.md](./skills/web-video-presentation/SKILL.md) · <!-- DOWNLOAD:web-video-presentation:start -->_（暂未发布）_<!-- DOWNLOAD:web-video-presentation:end -->

---

### [`web-design-engineer`](./skills/web-design-engineer)

![Web Design Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp)

**类别：** 设计 / 前端  
**适合：** 网页、落地页、仪表盘、交互原型、HTML 幻灯片、动画、UI 样机、数据可视化和设计系统探索。

`web-design-engineer` 把 AI 生成的 Web 产物从“能用”推进到“精致、克制、真正有设计判断”。它把 Agent 当作设计工程师来约束：先理解产品上下文，再声明设计系统，尽早展示 v0，然后完整构建并验证结果。

亮点：

- 定义六步设计工作流：需求 → 上下文 → 设计系统 → v0 → 完整构建 → 验证
- 用反 AI 俗套清单和更强的视觉判断，避免千篇一律的生成式 UI
- 内置 **设计方向顾问（6 学派差异化推荐）+ 25 套有 anchor 的风格配方库**（Linear / Aesop / Pentagram / Bloomberg / Stripe Press / Mid-Century 等），含可粘贴的 palette / typography / signature moves / 反模式
- 覆盖 HTML / CSS / JavaScript / React 原型，以及响应式布局、动效和交互细节
- 包含 inline React + Babel、CSS tokens、`oklch()` 配色、container queries、reduced-motion 等实现规则
- 提供高级模式参考，覆盖设备框、幻灯片引擎、动画时间线、仪表盘等常见 Web 产物

<table>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp" alt="aesop 预览" /></a><br /><sub><code>aesop</code><br />药剂师页</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp" alt="muji-kenya-hara 预览" /></a><br /><sub><code>muji-kenya-hara</code><br />器物目录</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp" alt="monocle-magazine 预览" /></a><br /><sub><code>monocle-magazine</code><br />杂志目录</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp" alt="stripe-press 预览" /></a><br /><sub><code>stripe-press</code><br />书籍详情</sub></td>
</tr>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp" alt="bloomberg-terminal 预览" /></a><br /><sub><code>bloomberg-terminal</code><br />交易仪表盘</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp" alt="linear 预览" /></a><br /><sub><code>linear</code><br />开发者落地页</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp" alt="vercel-mesh 预览" /></a><br /><sub><code>vercel-mesh</code><br />部署落地页</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp" alt="tufte-dataink 预览" /></a><br /><sub><code>tufte-dataink</code><br />数据叙事</sub></td>
</tr>
<tr>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp" alt="mid-century-modern 预览" /></a><br /><sub><code>mid-century-modern</code><br />海报致敬</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp" alt="y2k-retrofuturism 预览" /></a><br /><sub><code>y2k-retrofuturism</code><br />Y2K 门户</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp" alt="bloomberg-businessweek-turley 预览" /></a><br /><sub><code>businessweek-turley</code><br />编辑封面</sub></td>
<td align="center" width="25%"><a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp" alt="active-theory 预览" /></a><br /><sub><code>active-theory</code><br />电影感发布</sub></td>
</tr>
</table>

<sub>↑ 25 套有 anchor 的配方里挑出最具代表性的 12 套 —— <a href="./skills/web-design-engineer/README.zh-CN.md#风格配方画廊"><b>打开完整画廊</b></a>，含全部 25 个真实作品（药剂师页、交易工作站、杂志封面、Y2K 门户、Mid-Century 海报……），含签名手法与适合场景标签。</sub>

链接：[README](./skills/web-design-engineer/README.zh-CN.md) · [SKILL.md](./skills/web-design-engineer/SKILL.md) · [Website](./website/web-design-website) · [Demo](./demo/web-design-demo) · <!-- DOWNLOAD:web-design-engineer:start -->[下载 v1.2.2 .zip](https://github.com/ConardLi/garden-skills/releases/download/web-design-engineer-v1.2.2/web-design-engineer-1.2.2.zip)<!-- DOWNLOAD:web-design-engineer:end -->
链接：[README](./skills/web-design-engineer/README.zh-CN.md) · [SKILL.md](./skills/web-design-engineer/SKILL.md) · [Website](./website/web-design-website) · [Demo](./demo/web-design-demo) · <!-- DOWNLOAD:web-design-engineer:start -->_（暂未发布）_<!-- DOWNLOAD:web-design-engineer:end -->

---

### [`gpt-image-2`](./skills/gpt-image-2)

![GPT Image 2 Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/gpt-image-2-skill.webp)

**类别：** 图像生成 / Prompt 工程  
**适合：** 海报、UI 样机、产品图、信息图、学术图、技术架构图、漫画、头像、分镜、品牌板和图像编辑工作流。

`gpt-image-2` 是面向 GPT Image 2 与 OpenAI 兼容图像接口的聚焦型图像生成 Skill。它能适配不同 Agent 环境：Garden 本地完整出图、委托宿主原生图像工具、或在没有图像工具时退化为纯提示词顾问。

亮点：

- 支持三种运行模式：**Mode A Garden 本地生图**、**Mode B 委托宿主出图**、**Mode C 纯提示词顾问**
- 每次任务先做模式探测，避免静默走错执行路径
- 在 `references/` 下提供 18 大类、79 个结构化提示词模板
- 同时覆盖图像生成和图像编辑，并配套专门工作流与脚本
- Garden 模式下会把 prompt 与生成图片保存到 `garden-gpt-image-2/`，方便复用、审查和版本管理

#### 精选线上案例

<table>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/editing-workflows%2Fbackground-replacement%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/editing-workflows/background-replacement/1-thumb.webp" alt="背景替换案例" width="100%"></a><br/>
      <strong><code>background-replacement</code></strong><br/>
      <sub>人像背景替换与时代广场霓虹补光。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fchat-interface-scene%2F3"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/chat-interface-scene/3-thumb.webp" alt="AI 助手 UI 样机案例" width="100%"></a><br/>
      <strong><code>chat-interface-scene</code></strong><br/>
      <sub>Claude 风格 AI 助手产品截图。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Flive-commerce-ui%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/live-commerce-ui/1-thumb.webp" alt="直播带货 UI 案例" width="100%"></a><br/>
      <strong><code>live-commerce-ui</code></strong><br/>
      <sub>明星直播带货产品界面。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/ui-mockups%2Fproduct-card-overlay%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/ui-mockups/product-card-overlay/1-thumb.webp" alt="产品落地页叠层案例" width="100%"></a><br/>
      <strong><code>product-card-overlay</code></strong><br/>
      <sub>护肤落地页 Hero 主视觉。</sub>
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/infographics%2Fbento-grid-infographic%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/infographics/bento-grid-infographic/1-thumb.webp" alt="便当格信息图案例" width="100%"></a><br/>
      <strong><code>bento-grid-infographic</code></strong><br/>
      <sub>iPhone 16 Pro 高密度一图流解析。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/technical-diagrams%2Fsystem-architecture%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/technical-diagrams/system-architecture/1-thumb.webp" alt="系统架构图案例" width="100%"></a><br/>
      <strong><code>system-architecture</code></strong><br/>
      <sub>多租户 AI 客服 SaaS 生产架构。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/slides-and-visual-docs%2Fdense-explainer-slides%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/slides-and-visual-docs/dense-explainer-slides/2-thumb.webp" alt="高密度讲解单页案例" width="100%"></a><br/>
      <strong><code>dense-explainer-slides</code></strong><br/>
      <sub>AI Agent 工作机制一页讲清。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/maps%2Ffood-map%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/maps/food-map/1-thumb.webp" alt="美食地图案例" width="100%"></a><br/>
      <strong><code>food-map</code></strong><br/>
      <sub>City Walk 编辑型美食地图。</sub>
    </td>
  </tr>
  <tr>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/product-visuals%2Fexploded-view-poster%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/product-visuals/exploded-view-poster/2-thumb.webp" alt="产品爆炸图案例" width="100%"></a><br/>
      <strong><code>exploded-view-poster</code></strong><br/>
      <sub>Vision Pro 2 光机与算力模块拆解。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/academic-figures%2Fneural-network-architecture%2F2"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/academic-figures/neural-network-architecture/2-thumb.webp" alt="神经网络架构图案例" width="100%"></a><br/>
      <strong><code>neural-network-architecture</code></strong><br/>
      <sub>适合论文配图的 ViT-B/16 架构图。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/branding-and-packaging%2Fcosmetic-packaging%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/branding-and-packaging/cosmetic-packaging/1-thumb.webp" alt="化妆品包装案例" width="100%"></a><br/>
      <strong><code>cosmetic-packaging</code></strong><br/>
      <sub>国货高端护肤礼盒与影棚主视觉。</sub>
    </td>
    <td width="25%" align="center">
      <a href="https://gpt-image2.mmh1.top/#/case/storyboards-and-sequences%2Fanime-key-visual%2F1"><img src="https://cdn.jsdelivr.net/gh/ConardLi/gpt-image-2-101@main/public/case/storyboards-and-sequences/anime-key-visual/1-thumb.webp" alt="动漫主视觉案例" width="100%"></a><br/>
      <strong><code>anime-key-visual</code></strong><br/>
      <sub>游戏首发 KV 与可裁切主视觉构图。</sub>
    </td>
  </tr>
</table>

<sub>↑ 从 160+ 公开案例库里挑出的 12 个精选入口 —— <a href="./skills/gpt-image-2/README.zh-CN.md#案例画廊"><b>打开 Skill 案例画廊</b></a> 查看更多模板，也可以直接浏览 <a href="https://gpt-image2.mmh1.top/#/case">线上案例站</a>。</sub>

链接：[README](./skills/gpt-image-2/README.zh-CN.md) · [SKILL.md](./skills/gpt-image-2/SKILL.md) · [Website](./website/gpt-image2-website) · <!-- DOWNLOAD:gpt-image-2:start -->[下载 v1.0.4 .zip](https://github.com/ConardLi/garden-skills/releases/download/gpt-image-2-v1.0.4/gpt-image-2-1.0.4.zip)<!-- DOWNLOAD:gpt-image-2:end -->
链接：[README](./skills/gpt-image-2/README.zh-CN.md) · [SKILL.md](./skills/gpt-image-2/SKILL.md) · [Website](./website/gpt-image2-website) · <!-- DOWNLOAD:gpt-image-2:start -->_（暂未发布）_<!-- DOWNLOAD:gpt-image-2:end -->

---

### [`beautiful-article`](./skills/beautiful-article)

![Beautiful Article Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/article/banner.webp)

**类别：** 编辑 · 任意素材 → 一篇精美的文章  
**适合：** 把 URL / PDF / DOCX / Markdown / 纯文本 / 截图 / 粘贴材料编辑成一篇**比原文更易读、更便于分享和归档的精美文章** —— 长文、briefing、解释文、教程、复盘、视觉随笔、对话访谈转写。

`beautiful-article` 是一个编辑型 harness Skill：它不只是"做个网页"，而是把素材编辑、设计成一篇比原文更易读、更便于分享和归档的精美文章。整个 Skill 走一个 `source → plan → 双确认 → 生成 → 终审 → 修复` 小型流程，并在 3 个硬 checkpoint 暂停，让用户掌握文章类型 / 主题 / 版式 / 配图策略 / 封面 / 交付格式的最终控制权。

亮点：

- **首先是一篇文章** —— 注意力永远在"文章"本身：更好的阅读、更好的节奏、更好的美学。交付物是一份自包含的文件（HTML，可选 PDF），但那是交付细节、不是目标
- **Reacticle 组件协议** —— prose-first 的语义组件（Hero / Lead / Section / Quote / Callout / Image / Formula / CodeBlock / Table…）+ 仅允许主题 token 的 `Raw` 自由层；底层 React 组件库见 [`ConardLi/reacticle`](https://github.com/ConardLi/reacticle)
- **10 种文章类型 + 推荐保留比例打包** —— `longform · ~100%` / `tutorial · ~90%` / `full-report · ~80%` / `explainer · ~80%` / `dialogue · ~80%` / `review · ~70%` / `essay · ~70%` / `briefing · ~50%` / `visual-essay · ~40%` / `interactive-explainer · ~25% 摘录 + 75% AI 重构`
- **11 套主题 authoring profile**（`tufte`、`press`、`bayer`、`bodoni`、`vignelli`、`sottsass`、`freddie`、`andy`、`fuller`、`knuth`、`shannon`）—— 每套是给 Agent 看的 Markdown 契约，不是 CSS 文件
- **硬协作 checkpoint**，每项决策独立确认（禁止静默替用户选择），自带 3:4 书封封面、TOC 默认开、目标语言地道翻译
- **分节点质检协议** —— Plan 主 Agent 内联自查、First Spread / Section / Final 用 sub-agent reviewer，修复走最小切片

#### 主题预览

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

链接：[README](./skills/beautiful-article/README.zh-CN.md) · [SKILL.md](./skills/beautiful-article/SKILL.md) · <!-- DOWNLOAD:beautiful-article:start -->[下载 v0.1.0 .zip](https://github.com/ConardLi/garden-skills/releases/download/beautiful-article-v0.1.0/beautiful-article-0.1.0.zip)<!-- DOWNLOAD:beautiful-article:end -->

---


### [`kb-retriever`](./skills/kb-retriever)

![Kb Retriever Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/kb-retriever-skill.webp)

**类别：** 检索 / 本地知识库  
**适合：** 从本地 `knowledge/` 目录回答问题，检索结构化文档，并在不撑爆上下文的前提下从 Markdown、文本、PDF、Excel 中提取证据。

`kb-retriever` 是一个本地知识库检索 Skill，核心是谨慎、渐进、可溯源。它不会直接加载整文件，而是先走分层索引，缩小候选范围，按文件类型正确处理，再带来源回答问题。

亮点：

- 通过分层 `data_structure.md` 文件先导航知识库，再进入内容检索
- 对 PDF 和 Excel 强制执行 **先学习再处理**，必须先阅读内置 reference 文档
- 组合关键词检索、局部窗口读取、同义词扩展和多轮迭代
- 最多 5 轮检索，让探索过程有边界
- 内置 `grep`、`pdftotext`、`pdfplumber`、`pandas` 工作流，并强调答案来源

链接：[README](./skills/kb-retriever/README.zh-CN.md) · [SKILL.md](./skills/kb-retriever/SKILL.md) · <!-- DOWNLOAD:kb-retriever:start -->[下载 v1.0.1 .zip](https://github.com/ConardLi/garden-skills/releases/download/kb-retriever-v1.0.1/kb-retriever-1.0.1.zip)<!-- DOWNLOAD:kb-retriever:end -->
链接：[README](./skills/kb-retriever/README.zh-CN.md) · [SKILL.md](./skills/kb-retriever/SKILL.md) · <!-- DOWNLOAD:kb-retriever:start -->_（暂未发布）_<!-- DOWNLOAD:kb-retriever:end -->

---


## 安装

总共支持 5 种安装方式，按你的工作流选一个即可：

| # | 方式 | 适合场景 | 能钉版本？ |
|---|---|---|---|
| A | [`skills` CLI（`npx skills add`）](#方式-a--skills-clinpx) | 任意 Agent，一行命令，可挑选单个 Skill | ✅ 通过 tag URL |
| B | [Claude Code 插件市场](#方式-b--claude-code-插件市场) | Claude Code 用户、订阅插件包 | ✅ 通过市场版本 |
| C | [Releases 钉版本 `.zip`](#方式-c--releases-钉版本-zip) | CI / 内网 / 可复现安装 | ✅ ✅（不可变） |
| D | [`git clone` 后手动拷贝](#方式-d--手动拷贝到项目) | 本地 hack / 想自己魔改 | ❌（跟随 `main`） |
| E | [Git Submodule](#方式-e--git-submodule) | 嵌进更大项目，需要随上游升级 | ✅ 通过 submodule SHA |

> 上面每个 Skill 的"链接"那一行末尾，都有一个 **`下载 v<版本> .zip`** 链接，
> 指向该 Skill 当前的钉版本发布产物。这些 URL 由
> [`scripts/release/update-readme.mjs`](./scripts/release/update-readme.mjs)
> 在每次发版后自动重写，永远指向最新的不可变版本。

### 方式 A · `skills` CLI（npx）

最快的、跨 Agent 通用的方式。直接使用社区标准的
[`npx skills` CLI](https://www.npmjs.com/package/skills)，它会自动识别你正在用
的 Agent（Claude Code / Cursor / Codex / …）并把 Skill 放到对的目录。

```bash
# 一次装上整个仓库（4 个 Skill），最新
npx skills add ConardLi/garden-skills

# 只装某一个 Skill，最新
npx skills add ConardLi/garden-skills -s web-design-engineer

# 装到全局 (~/.skills) 而不是当前项目 (./.skills)
npx skills add ConardLi/garden-skills -s gpt-image-2 --global

# 指定目标 Agent
npx skills add ConardLi/garden-skills -s kb-retriever -a claude-code
```

> **默认就是 `main` 上的最新版本**，95% 的场景这就是你想要的——CLI 直接从源码
> 树拉每个 Skill 当前的 `SKILL.md`。

**想钉版本？（CI / 生产环境）** 用带 tag 的 `tree/` URL，会指向某次 release
对应的那次提交：

```bash
# 把某个 Skill 钉到具体的 release
npx skills add ConardLi/garden-skills/tree/web-design-engineer-v1.0.0/skills/web-design-engineer
```

每个 Skill 当前的钉版本 `.zip` URL 也直接挂在了上面"链接"那一行末尾的
`下载 v<版本> .zip` 链接里。

常用子命令：

```bash
npx skills list                 # 看已安装了什么
npx skills find web-design      # 在仓库内搜索
npx skills update               # 全部升级
npx skills remove kb-retriever  # 卸载
```

### 方式 B · Claude Code 插件市场

如果你用 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)，可以
订阅插件市场，按"包"安装一组相关的 Skill：

```bash
/plugin marketplace add ConardLi/garden-skills
/plugin install presentation-skills@garden-skills
/plugin install web-design-skills@garden-skills
/plugin install knowledge-base-skills@garden-skills
/plugin install image-generation-skills@garden-skills
```

插件包定义在 [`.claude-plugin/marketplace.json`](./.claude-plugin/marketplace.json)：

| 插件包 | 包含的 Skills |
|---|---|
| `presentation-skills` | `web-video-presentation` |
| `web-design-skills` | `web-design-engineer` |
| `knowledge-base-skills` | `kb-retriever` |
| `image-generation-skills` | `gpt-image-2` |

### 方式 C · Releases 钉版本 `.zip`

每次正式发版都会把对应 Skill 打包成一个**不可变**的 `.zip`（附带
SHA-256 校验文件）发到
[GitHub Releases](https://github.com/ConardLi/garden-skills/releases)。
适合 CI、Dockerfile、内网部署等需要"字节级可复现"的场景。

```bash
# 把 <skill> / <version> 替换成你要的版本即可
SKILL=web-design-engineer
VERSION=1.0.0

curl -fsSL -o "${SKILL}.zip" \
  "https://github.com/ConardLi/garden-skills/releases/download/${SKILL}-v${VERSION}/${SKILL}-${VERSION}.zip"

# 校验 SHA-256（无人值守安装时强烈建议）
curl -fsSL -o "${SKILL}.zip.sha256" \
  "https://github.com/ConardLi/garden-skills/releases/download/${SKILL}-v${VERSION}/${SKILL}-${VERSION}.zip.sha256"
shasum -a 256 -c "${SKILL}.zip.sha256"

# 解压到 Agent 的 skills 目录
unzip -q "${SKILL}.zip" -d .claude/skills/   # 或 .agents/skills/、.codex/skills/ 等
```

如果你只想"永远拿最新"，也有一个跟着最近一次 release 走的 URL：

```bash
https://github.com/ConardLi/garden-skills/releases/latest/download/<skill>-<version>.zip
```

> **每个 Skill 当前版本的钉版本 URL 都直接列在 README 里**——见上面每个 Skill
> 区块"链接"那一行下面的"下载"块。这些链接由发布流水线自动同步。

### 方式 D · 手动拷贝到项目

`git clone` 整仓后再拷贝你要的 Skill。适合本地 fork、二次开发场景：

```bash
git clone https://github.com/ConardLi/garden-skills.git
cp -r garden-skills/skills/web-design-engineer  your-project/.claude/skills/
# Cursor / 通用 Agent：
cp -r garden-skills/skills/web-design-engineer  your-project/.agents/skills/
```

Agent 在下次扫描工作区时会自动发现。

### 方式 E · Git Submodule

如果你想在更大的项目里把本仓库作为依赖来跟踪上游更新：

```bash
git submodule add https://github.com/ConardLi/garden-skills.git vendor/garden-skills
ln -s ../../vendor/garden-skills/skills/web-design-engineer .claude/skills/web-design-engineer
```

为了可复现，建议把 submodule 钉到某个 release tag：

```bash
cd vendor/garden-skills
git checkout web-design-engineer-v1.0.0
```

---

## 兼容性

| Agent / Runtime | Skill 路径 | 状态 |
|---|---|---|
| **Claude Code** | `.claude/skills/<name>/` 或走插件市场 | ✅ 已验证 |
| **Claude.ai**（网页端） | Settings → Capabilities → Skills | ✅ 已验证 |
| **Cursor** | `.agents/skills/<name>/` | ✅ 已验证 |
| **Codex CLI** | `.codex/skills/<name>/` | ✅ 已验证 |
| **Gemini CLI** | extension manifest | ✅ 已验证 |
| **OpenCode** | `.opencode/skills/<name>/` | ✅ 已验证 |

> `SKILL.md` 格式本身是可移植的——只要你的 Agent 支持 Skill 体系，把文件夹放进它扫描的目录就行。欢迎 PR 扩充这张表。

---

## 什么是 Skill？

**Skill** 就是 Agent 可以按需加载的一个自包含文件夹。它的核心是一个
`SKILL.md`（YAML frontmatter + 指令），按需配上 reference 文档、脚本和素材：

```text
<skill-name>/
├── SKILL.md      ← 必需：什么时候用 + 怎么用
├── README.md     ← 给人看的文档
├── references/   ← 可选：Agent 按需加载的扩展文档
├── scripts/      ← 可选：确定性的可执行代码
└── assets/       ← 可选：模板、字体、图标等
```

Agent 会根据 frontmatter 里的 `description` 决定要不要激活这个 Skill——
所以 description 就是你和 Agent 之间的契约。完整规范见
[agentskills.io](https://agentskills.io) 与
[Anthropic 官方示例仓库](https://github.com/anthropics/skills)。

---

## 贡献

欢迎提 issue、贡献新的 Skill、或者改进发版工具链。

维护者向的文档——仓库结构、发版流程、版本号规则、CI 工作流、常见问题——
都在 [**`CONTRIBUTING.zh-CN.md`**](./CONTRIBUTING.zh-CN.md)
（[English](./CONTRIBUTING.md)）。新增 Skill 或者发版前先读那份。

快速上手：

```bash
git clone https://github.com/ConardLi/garden-skills.git
cd garden-skills
npm run list      # 列出所有 Skill + manifest 状态
npm run validate  # 跑一遍和 PR CI 完全一样的检查
```

---

## 致谢

本集合站在以下工作的肩膀上：

- **[Anthropic](https://www.anthropic.com)** —— [Agent Skills 规范](https://agentskills.io) 和 [`anthropics/skills`](https://github.com/anthropics/skills) 参考仓库。
- **[Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs)** —— `web-design-engineer` 的灵感来源，原系统提示词保留在 [`dist/prompt/claude-design-system-prompt.md`](./dist/prompt/claude-design-system-prompt.md) 供参考。
- 更广义的 OSS Skill 社区——延伸阅读：[`travisvn/awesome-claude-skills`](https://github.com/travisvn/awesome-claude-skills) 和 [`obra/superpowers`](https://github.com/obra/superpowers)。

---

## Connect

| 平台 | 账号名称 | 链接 |
| --- | --- | --- |
| X/Twitter | code秘密花园 | https://x.com/GardenConardLi  |
| B 站 | code秘密花园 | https://space.bilibili.com/474921808 |
| 抖音 | code秘密花园 | https://v.douyin.com/i5b33Xfv/ |
| YouTube | code秘密花园 | https://www.youtube.com/@garden-conard |
| 小红书 | code秘密花园 | https://www.xiaohongshu.com/user/profile/5af45e78f7e8b903d6e04618 |
| 公众号 | code秘密花园 | https://cdn.jsdelivr.net/gh/ConardLi/easy-dataset@main/public/imgs/weichat.jpg |
| GitHub | ConardLi | https://github.com/ConardLi |
| 个人网站 | Easy AI | https://mmh1.top |

---

## 许可证

[MIT](./LICENSE) © [ConardLi](https://github.com/ConardLi)
