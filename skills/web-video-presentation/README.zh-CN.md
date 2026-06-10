# Web Video Presentation Skill

**把文章或口播稿做成点击驱动的 16:9 网页演示，并通过录屏产出有电影感视频的 Agent Skill。**

[English](./README.md) · [返回集合首页](../../README.zh-CN.md)

![Web Video Presentation Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video-presentation-skill.webp)

---

## 这是什么？

`web-video-presentation` 帮 Agent 构建一种 Vite + React + TypeScript 演示：它看起来不是传统幻灯片，而更像为录屏设计的视频舞台。每次点击推进一个口播节拍，每一步独占 1920×1080 舞台，进度 UI 平时隐藏，只有悬浮时出现，方便录出干净画面。

它适合：

- 把文章改写成 B 站 / YouTube / 视频号风格口播稿
- 把已有口播稿做成有节奏的网页演示
- 做产品演示、教程、keynote 式讲解、视觉 talk
- 做“动态 PPT，但不要像 PPT”的演示体验
- 在视觉 outline 对齐后，可选合成口播音频

这个 Skill 的核心是**方法论 + 协作流程**。脚手架提供 token、舞台原语、主题和示例，但每个项目仍然应该根据主题重新选择视觉语言。

---

## 核心理念

- **固定 16:9 舞台**：内容写在稳定的 1920×1080 坐标系里，再按视口缩放。
- **一个全局 step 游标**：点击或键盘推进 `(chapter, step)`，游标本地持久化。
- **一步一个想法**：每个节拍独占整屏，不堆叠项目符号。
- **口播节拍驱动结构**：讲述节奏直接映射为视觉 step。
- **隐藏 chrome**：进度控制悬浮才出现，录屏画面保持干净。
- **动效优先**：每一步都需要一个移动的视觉锚点，静态正文是坏味道。
- **主题 token**：视觉属性通过语义 token 驱动，换主题不只是换颜色。
- **可插拔 TTS**：provider-agnostic 音频 runner，**内置 3 个 provider**（MiniMax `mmx-cli` + OpenAI TTS via curl + MiMo-V2.5-TTS via curl）；往 `tts-providers/` 丢一个 `.sh` 就能换成 ElevenLabs / edge-tts / Azure / Google Cloud / macOS `say` / 任何自部署 TTS。
- **硬 checkpoint**：稿子/主题、outline、音频合成前都必须停下来与用户确认。

---

## 工作流

```text
Phase 1.1  识别用户输入
Phase 1.2  文章 -> 口播稿
   |
Checkpoint A1  稿子、主题、粗略素材计划
   |
Phase 1.3  口播稿 + 原文 -> outline.md
   |
Checkpoint A2  outline 确认 + 开发模式选择
   |
Phase 2    构建 Vite / React / TS 演示
   |
Checkpoint B   询问是否合成音频
   |
Phase 3    可选音频合成
Phase 4    录屏与后期
```

这些 checkpoint 是 Skill 契约的一部分：Agent 不应该从原文一路闷头做到成品。主题选择会影响动效气质，outline 确认能避免章节节奏跑偏。

---

## 内含内容

```text
skills/web-video-presentation/
├── SKILL.md
├── README.md / README.zh-CN.md
├── references/
│   ├── PRINCIPLES.md
│   ├── CHAPTER-CRAFT.md
│   ├── OUTLINE-FORMAT.md
│   ├── SCRIPT-STYLE.md
│   ├── THEMES.md
│   ├── AUDIO.md
│   └── RECORDING.md
├── scripts/
│   └── scaffold.sh
├── templates/
│   ├── index.html
│   ├── vite.config.ts
│   ├── scripts/
│   │   ├── extract-narrations.ts
│   │   ├── synthesize-audio.sh       # provider-agnostic runner
│   │   └── tts-providers/            # 一个文件 = 一个 TTS 后端
│   │       ├── README.md             # 三函数契约 + ElevenLabs / edge-tts / Azure / Google / say 的现成片段
│   │       ├── minimax.sh            # 默认 provider（mmx-cli）
│   │       └── openai.sh             # 内置：OpenAI TTS（curl + OPENAI_API_KEY）
│   └── src/
└── themes/                    # 23 套主题，每套独立设计签名
    ├── midnight-press/
    ├── warm-keynote/
    ├── newsroom/
    ├── bauhaus-bold/
    └── ...                     # 完整列表见 references/THEMES.md
```

---

## 快速上手

把这个 Skill 复制到你的 Agent 会扫描的目录，然后让 Agent 把一篇文章或口播稿做成网页视频演示。

如果要手动脚手架：

```bash
bash skills/web-video-presentation/scripts/scaffold.sh ./presentation --theme=paper-press
```

查看可用主题：

```bash
bash skills/web-video-presentation/scripts/scaffold.sh --list-themes
```

生成的 `presentation/` 是普通 Vite + React + TypeScript 项目。启动后用录屏工具录制 16:9 舞台即可。

---

## 主题画廊

Skill 内置 **23 套**主题，每套都有独立的设计 DNA —— 不是简单换色版。下面按底色分两组浏览，挑一套接近目标气质的，或者把任意一格当作派生新主题的起点。点击任意预览图可放大查看 1920×1080 原帧。

> 所有截图都是真实的 16:9 舞台，来自 [`demo/web-video-presentation-demo`](../../demo/web-video-presentation-demo/) 现场画廊。

### 深色 · 8 套

> 电影感深色画布 —— 适合需要聚焦、戏剧张力、强对比的叙事。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/midnight-press.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/midnight-press.webp" alt="midnight-press 预览" /></a>
<br /><strong><code>midnight-press</code> · 暗色印刷</strong>
<br /><sub>电影感编辑暗底 · 暖暗底 + 火热橙</sub>
<br /><sub><b>适合</b> · 开发者教程 · AI / 工具评测 · 技术 deep dive</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dark-botanical.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dark-botanical.webp" alt="dark-botanical 预览" /></a>
<br /><strong><code>dark-botanical</code> · 暗夜植物</strong>
<br /><sub>高级时尚刊物 · 暖陶 / 玫粉 / 鎏金叠层</sub>
<br /><sub><b>适合</b> · 品牌故事 · 时尚 / 美妆 · 高端产品发布</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/chalk-garden.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/chalk-garden.webp" alt="chalk-garden 预览" /></a>
<br /><strong><code>chalk-garden</code> · 粉笔花园</strong>
<br /><sub>深石板黑板 · 手写 Patrick Hand + 粉笔黄</sub>
<br /><sub><b>适合</b> · 科普讲解 · 教学课堂 · 面向初学者的亲切口吻</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/blueprint.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/blueprint.webp" alt="blueprint 预览" /></a>
<br /><strong><code>blueprint</code> · 工程蓝图</strong>
<br /><sub>制图工作台 · 深海军 + 制图青 + 60 px 网格</sub>
<br /><sub><b>适合</b> · 技术架构 · 系统拆解 · API / SDK 介绍</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/terminal-green.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/terminal-green.webp" alt="terminal-green 预览" /></a>
<br /><strong><code>terminal-green</code> · 终端绿</strong>
<br /><sub>80 年代磷光 CRT · 纯等宽 + 扫描线</sub>
<br /><sub><b>适合</b> · CLI 工具教程 · 黑客 / 安全话题 · 复古技术致敬</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/neon-cyber.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/neon-cyber.webp" alt="neon-cyber 预览" /></a>
<br /><strong><code>neon-cyber</code> · 霓虹赛博</strong>
<br /><sub>赛博朋克未来 · 电光青 + 玫红双霓虹</sub>
<br /><sub><b>适合</b> · AI / 大模型评测 · web3 / 安全 · 未来主义与赛博朋克</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bold-signal.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bold-signal.webp" alt="bold-signal 预览" /></a>
<br /><strong><code>bold-signal</code> · 焦点信号</strong>
<br /><sub>Pitch Deck 主舞台 · 暗渐变 + 大橙焦点卡</sub>
<br /><sub><b>适合</b> · pitch deck / 路演 · 产品发布 · 大字宣言 / brand keynote</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/creative-voltage.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/creative-voltage.webp" alt="creative-voltage 预览" /></a>
<br /><strong><code>creative-voltage</code> · 电压创意</strong>
<br /><sub>饱和电光蓝 + 霓虹黄 + halftone 网点</sub>
<br /><sub><b>适合</b> · 设计周 / 创意分享 · 工作室作品集 · 字体 / 视觉文化</sub>
</td>
</tr>
</table>

### 浅色 · 15 套

> 明亮编辑画布 —— 适合清晰、克制、带纸感温度的内容。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/paper-press.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/paper-press.webp" alt="paper-press 预览" /></a>
<br /><strong><code>paper-press</code> · 亮色印刷</strong>
<br /><sub>编辑纸张 · 暖奶油 + 火热橙</sub>
<br /><sub><b>适合</b> · 杂志型内容 · 生活方式 · 日常工具评测</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/newsroom.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/newsroom.webp" alt="newsroom 预览" /></a>
<br /><strong><code>newsroom</code> · 报社</strong>
<br /><sub>NYT 大报 · 新闻纸奶油 + 旗红</sub>
<br /><sub><b>适合</b> · 纪录片 / 报道 · 深度评测 · 时事 / 热点解读</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/monochrome-print.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/monochrome-print.webp" alt="monochrome-print 预览" /></a>
<br /><strong><code>monochrome-print</code> · 黑白印刷</strong>
<br /><sub>精炼克制 · Monocle / Wallpaper 气质</sub>
<br /><sub><b>适合</b> · 深度阅读改编 · 学术 / 思想型内容 · 文化艺术评论</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/vintage-editorial.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/vintage-editorial.webp" alt="vintage-editorial 预览" /></a>
<br /><strong><code>vintage-editorial</code> · 复古编辑</strong>
<br /><sub>俏皮 Fraunces + 几何叠层（圆 / 线 / 点）</sub>
<br /><sub><b>适合</b> · 个人见解 / 评论 · 文化随笔 · 设计 / 字体话题</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/sunset-zine.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/sunset-zine.webp" alt="sunset-zine 预览" /></a>
<br /><strong><code>sunset-zine</code> · 日落 Zine</strong>
<br /><sub>Risograph 拼贴 · 暖桃 + 玫红 + 虚线剪贴</sub>
<br /><sub><b>适合</b> · 生活向 vlog · 创意分享 · 小红书 / 抖音风</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/pastel-dream.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/pastel-dream.webp" alt="pastel-dream 预览" /></a>
<br /><strong><code>pastel-dream</code> · 柔光梦</strong>
<br /><sub>柔粉 + 鼠尾草绿 + 右侧 pill 色条</sub>
<br /><sub><b>适合</b> · 产品 onboarding · 友好教学 · 心理 / 健康 / 母婴</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/warm-keynote.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/warm-keynote.webp" alt="warm-keynote 预览" /></a>
<br /><strong><code>warm-keynote</code> · 暖色 Keynote</strong>
<br /><sub>现代 SaaS Keynote · glass slab + 青绿 + 暖色网格</sub>
<br /><sub><b>适合</b> · SaaS keynote · B 端产品发布 · 团队对外汇报</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/electric-studio.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/electric-studio.webp" alt="electric-studio 预览" /></a>
<br /><strong><code>electric-studio</code> · 电光企业</strong>
<br /><sub>企业级清晰 · 净白 + 贴底电光蓝色条</sub>
<br /><sub><b>适合</b> · B2B 产品演讲 · 投资人路演 · 企业财报 / 季度更新</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bauhaus-bold.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/bauhaus-bold.webp" alt="bauhaus-bold 预览" /></a>
<br /><strong><code>bauhaus-bold</code> · 包豪斯</strong>
<br /><sub>宣言式现代主义 · 0 圆角 + 4 px 厚边</sub>
<br /><sub><b>适合</b> · 产品发布 · 观点宣言 · 品牌主张</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/swiss-ikb.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/swiss-ikb.webp" alt="swiss-ikb 预览" /></a>
<br /><strong><code>swiss-ikb</code> · 瑞士克莱因蓝</strong>
<br /><sub>极细 200 Helvetica + IKB + 1 px 发丝网格</sub>
<br /><sub><b>适合</b> · AI / 科技产品发布 · 年度数据汇报 · 信息图</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dune.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/dune.webp" alt="dune 预览" /></a>
<br /><strong><code>dune</code> · 沙丘</strong>
<br /><sub>炭褐 + 沙底 · 近乎零 accent，建筑画廊感</sub>
<br /><sub><b>适合</b> · 建筑 / 室内 / 空间 · 艺术展览 · 高端品牌画册</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/indigo-porcelain.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/indigo-porcelain.webp" alt="indigo-porcelain 预览" /></a>
<br /><strong><code>indigo-porcelain</code> · 靛蓝瓷</strong>
<br /><sub>靛蓝<em>本身即墨</em>（不是 accent）+ 瓷白</sub>
<br /><sub><b>适合</b> · 学术 / 论文解读 · AI / 数据深度 · 严肃技术汇报</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/forest-ink.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/forest-ink.webp" alt="forest-ink 预览" /></a>
<br /><strong><code>forest-ink</code> · 森林墨</strong>
<br /><sub>森林绿<em>本身即墨</em> + 象牙 · 旧版国家地理</sub>
<br /><sub><b>适合</b> · 自然 / 可持续 · 纪录 / 非虚构 · 慢生活</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/kraft-paper.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/kraft-paper.webp" alt="kraft-paper 预览" /></a>
<br /><strong><code>kraft-paper</code> · 牛皮纸</strong>
<br /><sub>深棕<em>本身即墨</em> + 牛皮米 + 紫铜 accent</sub>
<br /><sub><b>适合</b> · 书评 / 文学随笔 · 历史 / 怀旧 · 手工艺 / 食物</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/split-canvas.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-video/split-canvas.webp" alt="split-canvas 预览" /></a>
<br /><strong><code>split-canvas</code> · 双拼画布</strong>
<br /><sub>50/50 双底色 · 蜜桃左 + 薰衣草右</sub>
<br /><sub><b>适合</b> · 双主题对比 / 辩论 · 故事讲述 · 概念对照科普</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>+ 派生你自己的</strong>
<br /><sub>完整 token 契约、每套设计签名、<br />以及怎么派生新主题（Swiss 黄 / 绿 / 橙变体等），<br />见 <a href="./references/THEMES.md">THEMES.md</a>。</sub>
<br /><br />
</td>
</tr>
</table>

---

## Reference Map

- [PRINCIPLES.md](./references/PRINCIPLES.md)：视频感网页演示的核心原则
- [CHAPTER-CRAFT.md](./references/CHAPTER-CRAFT.md)：章节实现规则与视觉 checklist
- [OUTLINE-FORMAT.md](./references/OUTLINE-FORMAT.md)：outline 必须遵循的结构
- [SCRIPT-STYLE.md](./references/SCRIPT-STYLE.md)：文章转口播稿规则
- [PATTERNS.md](./references/PATTERNS.md)：可选视觉 primitive 配方
- [AUDIO.md](./references/AUDIO.md)：可选口播音频合成流程（provider-agnostic）
- [tts-providers/README.md](./templates/scripts/tts-providers/README.md)：TTS provider 三函数契约 + 内置 2 个 (minimax / openai) + ElevenLabs / edge-tts / Azure / Google / macOS say 的现成代码片段
- [RECORDING.md](./references/RECORDING.md)：录屏与后期注意事项

