# Web Design Engineer Skill

**一个让 AI 生成网页从"能用"进阶到"惊艳"的 Agent 技能。**

[English](./README.md) · [返回集合首页](../../README.zh-CN.md)

![Web Design Skill](https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design-skill.webp)

---

## 这是什么？

这是一个面向 AI 编程代理（如 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)、[Cursor](https://cursor.com) 以及其他支持 `SKILL.md` 格式的工具）的可复用 **Skill**（结构化系统提示词），能显著提升 AI 生成的 HTML/CSS/JavaScript 产物的设计品质。

它将 [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) 系统提示词中的核心设计理念提炼为一个开放、可移植、可自定义的技能文件，可以直接放进任何项目中使用。

### 问题

现代大语言模型已经能根据简单的提示词生成功能完整的网页。但它们的输出总是趋向同一种审美：Inter 字体、蓝色主按钮、紫粉渐变、大圆角卡片、emoji 充当图标、编造的好评数据。技术上没问题，视觉上千篇一律。

### 解决方案

这个 Skill 通过以下方式将**设计品位**注入 AI 的决策过程：

- **反俗套规则** —— 一份明确的 AI 设计雷区清单
- **设计系统宣告** —— 强制 AI 在写代码之前，先用自然语言说清配色、字体、间距和动效选择
- **oklch 色彩理论** —— 基于感知均匀色彩空间的配色派生，取代随机 hex 值
- **精选字体 × 配色组合** —— 高品质起点，替代默认的 Inter + #3b82f6
- **占位符哲学** —— 用诚实的 `[icon]` 标记代替拙劣的 SVG 假图
- **五旋钮 Design Read** —— 把受众、产物、品牌和约束转成可见的构图变化 / 动效 / 密度 / 素材 / 品牌保真决策
- **保留契约的改版协议** —— 动手前区分 Extension、Preserve 与 Overhaul
- **上下文化失败模式** —— 识别布局、内容、素材、动效与 Dashboard 的常见 AI 问题，同时保留合理例外
- **结构化工作流** —— 需求 → 上下文 → 校准后的设计系统 → v0 草稿 → 完整构建 → 验证
- **按需浏览器验收** —— 只有用户明确提出验收或浏览器测试时，才运行响应式 / 交互 / 运行时 QA harness

---

## 快速上手

### 用于 Claude Code / Cursor / AI Agent

将本 Skill 目录复制到你的项目中：

```
your-project/
├── .agents/skills/web-design-engineer/   # 或 .claude/skills/web-design-engineer/
│   ├── SKILL.md                          # 主技能文件
│   ├── agents/openai.yaml                # 宿主展示信息与默认提示词
│   └── references/
│       ├── advanced-patterns.md          # 代码模板库（slide engine / 设备框架 / 动效时间线 / 数据可视化）
│       ├── block-library.md               # 已实现可复用 Block 索引
│       ├── browser-acceptance.md          # 仅在用户明确要求时执行的浏览器验收 harness
│       ├── design-calibration.md          # Design Read + 五旋钮 + 可选 image-first 分支
│       ├── design-directions.md          # 设计方向顾问（6 学派，差异化 3 选 1 推荐）
│       ├── failure-patterns.md            # 上下文化 AI 设计失败模式与修复方式
│       ├── redesign-protocol.md           # Extension / Preserve / Overhaul 审计与受保护契约
│       ├── style-recipes/                # 25 套有 anchor 的风格配方（按需读单文件，每个 anchor 一个 .md）
│       │   ├── INDEX.md                   #   目录索引 + 3 张索引表 + 跨配方反模式
│       │   ├── linear.md / aesop.md / pentagram.md / ...    #   25 个独立 recipe 文件
│       └── critique-guide.md             # 5 维评分细则 + 常见问题清单
└── ...
```

也可以从集合首页通过 Claude Code 插件市场一键安装 —— 参见[根目录 README](../../README.zh-CN.md#%E5%AE%89%E8%A3%85)。

当你的请求涉及可视化/交互式前端工作时，Agent 会自动启用此技能。

### 覆盖范围

| 输出类型 | 示例 |
|---|---|
| 网页 & 落地页 | 营销页面、产品页、作品集 |
| 交互式原型 | 带设备框架的可点击 App 模型 |
| 幻灯片 | HTML 演示文稿（1920×1080，键盘导航） |
| 数据可视化 | 基于 Chart.js 或 D3.js 的仪表盘 |
| 动画 | CSS/JS 动效设计，时间线驱动的演示 |
| 设计系统 | Token 探索、组件变体 |

---

## 工作原理

### 校准式工作流

```
1. 理解需求          →  信息充足就干活，信息不足才提问
2. 获取设计上下文    →  代码 > 截图；现有项目先判断改动模式
3. 产出 Design Read  →  五个旋钮把 brief 映射为可见决策
4. 宣告设计系统      →  配色、字体、间距、动效 —— 用 Markdown 说明，写代码之前
5. 尽早展示 v0       →  占位符 + 布局 + token；让用户提前纠偏
6. 完整构建          →  组件、状态、动效；在关键决策点暂停确认
7. 验证              →  默认轻量自检；仅在用户明确要求时运行浏览器 harness
```

### 核心设计原则

**反 AI 俗套清单。** Skill 明确禁止以下模式：
- 紫粉蓝渐变背景
- 带左侧彩色边框的卡片
- Inter / Roboto / Arial / Fraunces / system-ui 字体
- 用 emoji 充当图标
- 编造的数据、假 logo 墙、虚假好评

**oklch 色彩系统。** 在感知均匀的 oklch 色彩空间中派生颜色。相同的亮度值在人眼中看起来确实一样亮——HSL 做不到这一点，HSL 中亮度 50% 的黄色看起来比亮度 50% 的蓝色亮得多。

**精选起点。** 六套经过验证的配色 × 字体组合，覆盖常见场景：

| 风格 | 主色 | 字体组合 | 适用场景 |
|---|---|---|---|
| 现代科技感 | 蓝紫 | Space Grotesk + Inter | SaaS、开发者工具 |
| 优雅杂志风 | 暖棕 | Newsreader + Outfit | 内容平台、博客 |
| 高端品牌 | 近黑 | Sora + Plus Jakarta Sans | 奢侈品、金融 |
| 活泼消费 | 珊瑚 | Plus Jakarta Sans + Outfit | 电商、社交 |
| 极简专业 | 青蓝 | Outfit + Space Grotesk | 仪表盘、B2B |
| 手作温度 | 焦糖 | Caveat + Newsreader | 餐饮、教育 |

**风格配方库（25 套有 anchor，渐进式加载）。** 当用户点名"Linear 风" / "Aesop 风" / "Pentagram 级排版"时，Agent 只需读 `references/style-recipes/<anchor>.md` 单个文件（约 50 行）；目录索引、3 张索引表、跨配方反模式都在 `references/style-recipes/INDEX.md`（约 150 行）。整个目录从不一次性加载。25 套配方分布在 7 个学派（Direction Advisor 的 6 学派 + 一个只能通过直接点名 anchor 触达的 *Specialty / Genre* 学派）：

| 学派 | 配方 |
|---|---|
| Editorial / 极简 | `apple-hig` · `muji-kenya-hara` · `aesop` · `dieter-rams-braun` · `monocle-magazine` |
| 信息架构 | `pentagram` · `vignelli-swiss-helvetica` · `bloomberg-terminal` · `tufte-dataink` · `nyt-the-daily` |
| 现代工具 / Builder SaaS | `linear` · `vercel-mesh` · `raycast` · `notion-pre-ai` |
| 动效 / 实验 | `field-io` · `active-theory` · `resn-storytelling` |
| 粗粝 / Brutalist | `are-na` · `bloomberg-businessweek-turley` · `balenciaga-post-2017` |
| 温暖人文 | `mailchimp-freddie` · `stripe-press` · `headspace-meditation` |
| 特定风格 / 年代 | `y2k-retrofuturism` · `mid-century-modern` |

---

## 风格配方画廊

Skill 自带 **25 套有名字的配方**，每套都对应到真实的品牌、工作室或设计师。目录中的每个配方都在 demo 画廊里有一个完整的整页作品 —— 不是共用模板、不是缩略图情绪板，而是每套配方本来就该长成的那种东西：Aesop 是药剂师产品页、Bloomberg Terminal 是交易工作站、Mid-Century 是 Saul Bass 海报、Y2K 是世纪之交的门户网站。按学派浏览下方卡片，挑一套气质契合你 brief 的配方，或者直接读 `references/style-recipes/<recipe>.md` 的 spec 文件。点击任意预览图打开完整分辨率的 2:1 大图。

> 所有截图都是来自 [`demo/web-design-engineer-demo`](../../demo/web-design-engineer-demo/) 这个 React + Vite 画廊的真实渲染 —— 字体、配色、签名手法都和 spec 文件里一致。每个 demo 位于 `src/recipes/<id>.tsx`。

### Editorial / 极简 · 5 套

> 留白、考究的排版、安静的奢华 —— 药剂师、博物馆图录、硬件产品页。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/apple-hig.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/apple-hig.webp" alt="apple-hig preview" /></a>
<br /><strong><code>apple-hig</code></strong>
<br /><sub>SF Pro Display、慷慨留白、柔和阴影 —— Apple Store 的语气</sub>
<br /><sub><b>适合</b> · 硬件产品页 · 设备发布 · 高端消费电子</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/muji-kenya-hara.webp" alt="muji-kenya-hara preview" /></a>
<br /><strong><code>muji-kenya-hara</code></strong>
<br /><sub>空作为画布、灰与纸、器物悬浮在空气中拍摄</sub>
<br /><sub><b>适合</b> · 器物目录 · 家居品牌 · 慢生活店铺</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/aesop.webp" alt="aesop preview" /></a>
<br /><strong><code>aesop</code></strong>
<br /><sub>暖驼黄、鼠尾草 &amp; 琥珀，衬线正文像文学杂志</sub>
<br /><sub><b>适合</b> · 药剂师产品页 · 美妆 &amp; 健康 · 独立零售</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/dieter-rams-braun.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/dieter-rams-braun.webp" alt="dieter-rams-braun preview" /></a>
<br /><strong><code>dieter-rams-braun</code></strong>
<br /><sub>十大设计原则、灰阶网格、技术正投影 —— 功能即形式</sub>
<br /><sub><b>适合</b> · 工业设计档案 · 硬件 spec · 品牌原则页</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/monocle-magazine.webp" alt="monocle-magazine preview" /></a>
<br /><strong><code>monocle-magazine</code></strong>
<br /><sub>世界主义简报、深海蓝与珊瑚色、脚注式好奇心</sub>
<br /><sub><b>适合</b> · 杂志目录 · 城市 / 旅行简报 · 生活方式期刊</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>当 brief 里出现这些词</strong>
<br /><sub>"考究" · "高端" · "安静" · "编辑感" · "少即是多"</sub>
<br /><br />
<sub>spec 文件在 <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 信息架构 · 5 套

> 理性、数据驱动、克制 —— 指示系统、交易终端、脚注长文、报纸头版的重量。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/pentagram.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/pentagram.webp" alt="pentagram preview" /></a>
<br /><strong><code>pentagram</code></strong>
<br /><sub>一种大字体即艺术品、网格作骨架、仅墨色与底色</sub>
<br /><sub><b>适合</b> · 标识样本 · 字体主导的作品集 · 画廊公告</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vignelli-swiss-helvetica.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vignelli-swiss-helvetica.webp" alt="vignelli-swiss-helvetica preview" /></a>
<br /><strong><code>vignelli-swiss-helvetica</code></strong>
<br /><sub>全字号 Helvetica、六种主色、纽约地铁信号图</sub>
<br /><sub><b>适合</b> · 公共指示 &amp; 交通 · 公共信息海报 · 品牌系统样本</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-terminal.webp" alt="bloomberg-terminal preview" /></a>
<br /><strong><code>bloomberg-terminal</code></strong>
<br /><sub>深海军蓝底上的琥珀色、全等宽、密度高于舒适</sub>
<br /><sub><b>适合</b> · 交易仪表盘 · 运维控制台 · 高密度专业工具</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/tufte-dataink.webp" alt="tufte-dataink preview" /></a>
<br /><strong><code>tufte-dataink</code></strong>
<br /><sub>段落内嵌微图、小型多重图、零图表杂质</sub>
<br /><sub><b>适合</b> · 数据叙事 · 研究报告 · 学术长文</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/nyt-the-daily.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/nyt-the-daily.webp" alt="nyt-the-daily preview" /></a>
<br /><strong><code>nyt-the-daily</code></strong>
<br /><sub>Cheltenham 衬线压在 Imperial 之上、日期线居首、宽幅报纸的重量</sub>
<br /><sub><b>适合</b> · 新闻特稿 · 播客中枢 · 长篇深度报道</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>当 brief 里出现这些词</strong>
<br /><sub>"数据密集" · "指示系统" · "高密度" · "理性" · "权威感"</sub>
<br /><br />
<sub>spec 文件在 <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 现代工具 / Builder SaaS · 4 套

> 发丝级细节、暖色暗夜、单一点缀色 —— 2020 年代后期的开发者工具美学。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/linear.webp" alt="linear preview" /></a>
<br /><strong><code>linear</code></strong>
<br /><sub>暖色调暗夜、发丝边、紫色点缀、键盘快捷键芯片</sub>
<br /><sub><b>适合</b> · 开发者工具落地页 · Issue / 项目 SaaS · API &amp; 基础设施产品</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/vercel-mesh.webp" alt="vercel-mesh preview" /></a>
<br /><strong><code>vercel-mesh</code></strong>
<br /><sub>纯黑、几何网格渐变、Geist Sans、命令行式清晰</sub>
<br /><sub><b>适合</b> · 部署 / 运行时工具 · 框架发布 · 技术 hero 页</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/raycast.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/raycast.webp" alt="raycast preview" /></a>
<br /><strong><code>raycast</code></strong>
<br /><sub>红光雾里的玻璃卡片、键盘优先、紧凑列表行</sub>
<br /><sub><b>适合</b> · 命令面板 · launcher 应用 · 键盘驱动型工具</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/notion-pre-ai.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/notion-pre-ai.webp" alt="notion-pre-ai preview" /></a>
<br /><strong><code>notion-pre-ai</code></strong>
<br /><sub>米白页面、拖拽点、随性 emoji 标题、随处可见的提示条</sub>
<br /><sub><b>适合</b> · 工作区文档 · 内部 Wiki · 友好的生产力应用</sub>
</td>
</tr>
</table>

### 动态 / 实验 · 3 套

> 张扬、生成式、感官 —— brief 里写"电影感""WebGL""能拿 Awwwards"的时候。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/field-io.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/field-io.webp" alt="field-io preview" /></a>
<br /><strong><code>field-io</code></strong>
<br /><sub>粒子系统衬着编辑式字体、代码艺术美学、暗色工作室</sub>
<br /><sub><b>适合</b> · 创意科技工作室 · 生成艺术案例 · WebGL 作品集</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/active-theory.webp" alt="active-theory preview" /></a>
<br /><strong><code>active-theory</code></strong>
<br /><sub>WebGL 野心、全屏字、深黑底上的糖果色</sub>
<br /><sub><b>适合</b> · 电影感产品发布 · 战役站 · 冲奖型微型站点</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/resn-storytelling.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/resn-storytelling.webp" alt="resn-storytelling preview" /></a>
<br /><strong><code>resn-storytelling</code></strong>
<br /><sub>超现实、浓郁、每帧都是布景、标题压在噪点纹理上</sub>
<br /><sub><b>适合</b> · 叙事滚动 · 娱乐 / IP 站 · 工作室作品集</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>当 brief 里出现这些词</strong>
<br /><sub>"电影感" · "WebGL" · "沉浸式" · "Awwwards 级"</sub>
<br /><br />
<sub>spec 文件在 <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 粗野 / Brutalist · 3 套

> 反设计、诚实、未抛光 —— 系统默认的网页、小报封面、反奢侈的奢侈。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/are-na.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/are-na.webp" alt="are-na preview" /></a>
<br /><strong><code>are-na</code></strong>
<br /><sub>刻意的系统字体、浏览器默认蓝色链接、诚实的网页</sub>
<br /><sub><b>适合</b> · 研究型频道 · 独立社区 · 反设计内容工具</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/bloomberg-businessweek-turley.webp" alt="bloomberg-businessweek-turley preview" /></a>
<br /><strong><code>bloomberg-businessweek-turley</code></strong>
<br /><sub>警示黄 + 黑墨、字体作拼贴、手工剪切式标题</sub>
<br /><sub><b>适合</b> · 编辑封面 · 评论文章 · 战役式海报</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/balenciaga-post-2017.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/balenciaga-post-2017.webp" alt="balenciaga-post-2017 preview" /></a>
<br /><strong><code>balenciaga-post-2017</code></strong>
<br /><sub>全大写、破碎网格、白底冷面产品、反奢侈的奢侈</sub>
<br /><sub><b>适合</b> · 时装系列 · drop 公告 · 逆向思考的奢侈品牌</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>当 brief 里出现这些词</strong>
<br /><sub>"粗粝" · "诚实" · "反设计" · "小报感" · "不舒服"</sub>
<br /><br />
<sub>spec 文件在 <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 温暖人文 · 3 套

> 平易近人、有机、手工感 —— 小生意的拉拉队长、手工装帧的书、每日重置。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mailchimp-freddie.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mailchimp-freddie.webp" alt="mailchimp-freddie preview" /></a>
<br /><strong><code>mailchimp-freddie</code></strong>
<br /><sub>Cavendish 黄、手绘涂鸦、对话式文案 —— 小生意的拉拉队长</sub>
<br /><sub><b>适合</b> · 引导流程 · 中小企业营销工具 · 友好的消费类应用</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/stripe-press.webp" alt="stripe-press preview" /></a>
<br /><strong><code>stripe-press</code></strong>
<br /><sub>奶白纸、GT Super、手工装帧式奢华、思想作器物</sub>
<br /><sub><b>适合</b> · 书籍详情页 · 长篇散文 · 出版社 / 出版品牌站</sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/headspace-meditation.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/headspace-meditation.webp" alt="headspace-meditation preview" /></a>
<br /><strong><code>headspace-meditation</code></strong>
<br /><sub>橙色太阳、圆润色团、手绘平静感、每日重置</sub>
<br /><sub><b>适合</b> · 冥想 &amp; 健康 · 习惯 / 情绪应用 · 温馨的消费类卡片</sub>
</td>
<td align="center" width="50%" valign="middle">
<br />
<strong>当 brief 里出现这些词</strong>
<br /><sub>"友好" · "亲切" · "人情味" · "温馨" · "手工感"</sub>
<br /><br />
<sub>spec 文件在 <a href="./references/style-recipes/">style-recipes/</a></sub>
<br /><br />
</td>
</tr>
</table>

### 类型 / 流派 · 2 套

> 时代编码、十年编码、主题编码 —— 只能通过直接 anchor 名字唤起。

<table>
<tr>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/y2k-retrofuturism.webp" alt="y2k-retrofuturism preview" /></a>
<br /><strong><code>y2k-retrofuturism</code></strong>
<br /><sub>铬合金倒角、磨砂玻璃、熔岩色块、随处可见的 MSN 蓝</sub>
<br /><sub><b>适合</b> · Y2K 怀旧 · 早期网络门户 · Z 世代品牌大型整活</sub>
</td>
<td align="center" width="50%">
<a href="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp"><img src="https://cdn.jsdelivr.net/gh/ConardLi/assets@main/imgs/web-design/mid-century-modern.webp" alt="mid-century-modern preview" /></a>
<br /><strong><code>mid-century-modern</code></strong>
<br /><sub>芥末黄、砖红、青蓝；剪纸式几何；1957 年的乐观主义</sub>
<br /><sub><b>适合</b> · 海报致敬 · 文化活动 · 复古印刷品牌语调</sub>
</td>
</tr>
</table>

### 自己跑画廊

```bash
cd demo/web-design-engineer-demo
npm install && npm run dev    # http://localhost:5181/
```

Hash 路由 URL（`#/linear`、`#/aesop`、…）可深链到任意配方。按 `H` 切换配方 HUD，`Esc` 返回画廊。布局细节见 demo 自己的 [README](../../demo/web-design-engineer-demo/README.md)。

---

## 启用前后对比：Skill 开 / 关

仓库的 [`demo/web-design-demo/`](../../demo/web-design-demo) 目录包含使用相同提示词、分别在有 Skill 和无 Skill 条件下生成的页面对比。打开 [`demo/web-design-demo/demo2/index.html`](../../demo/web-design-demo/demo2/index.html) 查看对比展示页。

### Demo 1：太空探索博物馆

**提示词：** *"帮我做一个'太空探索博物馆'的线上展览首页——全屏 Hero、4 个核心展览介绍、一个至少 6 个节点的时间线、参观预约 CTA、页脚。整体风格要沉浸感强、有宇宙的深邃感。"*

| | 无 Skill | 有 Skill |
|---|---|---|
| **文件** | `demo/web-design-demo/demo2/demo1.html` | `demo/web-design-demo/demo2/demo1-with-skill.html` |
| **色彩系统** | 硬编码 hex 值（#7cf0ff, #b388ff） | 基于 oklch 的 token 系统，使用 CSS 自定义属性 |
| **字体** | Orbitron + Noto Serif SC | Instrument Serif + Space Grotesk + JetBrains Mono |
| **布局** | 标准落地页结构 | 杂志编辑式布局，grid 组合排版 |
| **细节** | 大量发光效果、霓虹渐变 | 克制的色彩方案、字体层级、装饰性数据元素 |
| **整体感受** | 热情的初级设计师 | 有经验的设计总监 |

### Demo 2：摄影师作品集

**提示词：** *"帮我做一个独立摄影师的个人作品集网站首页。"*

| | 有 Skill |
|---|---|
| **文件** | `demo/web-design-demo/demo2/demo2-with-skill.html` |
| **角色塑造** | 虚构了北欧摄影师 "Mira Høst"，设计了一整套视觉身份 |
| **配色** | 暖纸色浅底（#f2efe8）+ 墨色深文（#161513）—— 极度克制的双色调 |
| **字体** | Instrument Serif（展示标题）+ Space Grotesk（界面）, 大量使用斜体 |
| **布局** | 杂志编排式结构，编号分节、不对称网格、侧边竖排文字 |
| **动效** | Hero 图片的慢速 Ken Burns 动画（24秒周期），胶片噪点纹理叠加 |
| **导航** | `mix-blend-mode: difference` 顶栏 —— 在深浅背景间无缝过渡 |

> 启发本 Skill 的 Claude Design 原始系统提示词保留在 [`dist/prompt/claude-design-system-prompt.md`](../../dist/prompt/claude-design-system-prompt.md)。

---

## 背景

此 Skill 的灵感来自 [Claude Design](https://www.anthropic.com/news/claude-design-anthropic-labs) 的系统提示词。Claude Design 是 Anthropic 于 2026 年 4 月推出的视觉设计产品。其系统提示词（约 420 行）编码了一套精密的设计原则、反模式和工作流约束，使其输出保持稳定的高品质。

本项目将这些核心理念提取并精炼为一个可移植的 Skill，适用于任何 AI 编程代理——让你获得 Claude Design 级别的设计品位，同时摆脱产品锁定和用量限制。

相比 Claude Design 原始提示词的主要新增内容：
- **设计系统宣告步骤** —— 强制 AI 在编码前用自然语言说明设计 token
- **v0 草稿策略** —— 一套具体的方法论，确保尽早展示半成品
- **扩展的反俗套清单** —— 从真实 AI 输出中识别出的额外模式
- **占位符哲学** —— 一套完整的框架，专业地处理缺失素材
- **配色 × 字体配对表** —— 六套经过验证的视觉系统起点
- **设计方向顾问** —— 模糊需求场景的 6 学派差异化 3 选 1 推荐机制，且显式接入到 recipe 库做落地
- **25 套有 anchor 的风格配方库** —— 每套绑定一个真实品牌 / studio / 设计师，含可粘贴的具体值；用来抵御 AI 默认味
- **高级模式库** —— 常见 UI 模式的即用代码模板

---

## 许可证

MIT
