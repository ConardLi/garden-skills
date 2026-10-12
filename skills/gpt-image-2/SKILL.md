---
name: gpt-image-2
description: 面向 GPT Image 2 的图像生成 / 编辑技能。可在 3 种环境下使用：(A) Garden 本地模式，通过 OpenAI 兼容接口或可选 Atlas Cloud provider 直接出图并落盘；(B) Host-Native 模式，把本 Skill 当作提示词工程指引，把渲染好的 prompt 交给宿主 Agent 自带的图像工具出图；(C) Advisor 模式，宿主无任何图像工具时退化为高质量 prompt 顾问。涵盖 18 大类、80+ 个结构化模板，覆盖海报 / UI / 产品 / 信息图 / 学术图 / 技术架构图 / 漫画 / 头像 / 流程板 / 电影分镜 / IP 周边 / 编辑工作流等场景。
---

# GPT Image 2

这是一个面向 GPT Image 2 的聚焦型技能，在 3 种运行环境下都能用，但行为差异显著。**第一步必须先确定当前运行模式**。

它只做两类图像任务：

- 生成图片：`POST /images/generations`
- 编辑图片：`POST /images/edits`

本文件保留：运行模式、技能结构、环境变量、保存 / 命名规则、模板索引、模式感知工作流。详细模板全部放在 `references/`，分层组织：

- 一级：分类目录
- 二级：单模板 Markdown 文件

## 运行模式（必读，做任何事之前先确定）

本 Skill 自带一个轻量探测脚本，先跑一次，再根据结果决定怎么干活：

```bash
node skills/gpt-image-2/scripts/check-mode.js
# 想拿结构化结果给上层程序用：
node skills/gpt-image-2/scripts/check-mode.js --json
```

输出会给出 `mode = A` / `A?` / `B-or-C` 以及 `recommendation`。三个模式定义如下：

### Mode A · Garden 本地生图

**触发条件**：环境变量 `ENABLE_GARDEN_IMAGEGEN` 为真（`1` / `true` / `yes` / `on`）**且** 存在所选 provider 的 API Key。

**行为**：完整端到端跑通"选模板 → 写 prompt → 调用脚本 → 出图落盘"。

- 用 `scripts/generate.js` 文本生图、`scripts/edit.js` 编辑现有图。
- prompt 默认落盘到 `garden-gpt-image-2/prompt/`、图片落盘到 `garden-gpt-image-2/image/`。
- 这是最强的模式：你是图像工具的"持有者"。

### Mode B · Host-Native 委托宿主出图

**触发条件**：未启用 Garden（`ENABLE_GARDEN_IMAGEGEN` 未设置 / 为假），但**当前宿主 Agent 自带图像生成工具或图像 MCP**。

**典型识别信号**（你应该自检）：

- 你的工具集里出现 `image_generation` / `imagegen` / `dalle` / `nano_banana` / `mcp__*image*` / `make_image` / 类似名字
- 用户在 ChatGPT / Codex / Gemini / Cursor 等支持原生出图的客户端中调用本 Skill
- 用户显式说"用你自己的工具出图"

**行为**：本 Skill **退化成提示词工程指引**——

1. 仍按"选模板 → 填字段 → 渲染最终 prompt"的流程走。
2. **不要调用 `node scripts/generate.js`**（没有 API key、必失败）。
3. 直接调用宿主自带的图像工具，把渲染好的 prompt 作为输入。
4. 如用户希望可顺手把 prompt 文件保存到 `garden-gpt-image-2/prompt/`，但图片去向由宿主决定，不强制。

### Mode C · Advisor 纯提示词顾问

**触发条件**：未启用 Garden，**且**宿主 Agent 也没有任何图像生成工具。

**行为**：本 Skill 退化为"高质量 prompt 撰写顾问"——

1. 按"选模板 → 填字段 → 渲染最终 prompt"流程走，缺信息就问用户。
2. 把最终 prompt **直接打印给用户** + 保存一份到 `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`。
3. 附一句简短的"如何使用"建议（如：丢进 ChatGPT / Midjourney / DALL·E / Sora / Nano Banana / 自己后端 / 第三方 GPT Image 2 网关）。
4. **不要假装出图成功**。明确告知用户："已生成可直接复用的高质量 prompt，请用你的图像工具执行。"

### 模式决策表

| 条件 | 模式 | 调用脚本？ | 落盘 prompt？ | 落盘图片？ |
|---|---|---|---|---|
| `ENABLE_GARDEN_IMAGEGEN=1` + 有 KEY | **A** | ✅ `generate.js` / `edit.js` | ✅ 自动 | ✅ 自动 |
| `ENABLE_GARDEN_IMAGEGEN=1` 但没 KEY | A? | ❌（先要 KEY） | — | — |
| 未启用 + 宿主有图像工具 | **B** | ❌（用宿主工具） | 可选 | 由宿主决定 |
| 未启用 + 宿主无图像工具 | **C** | ❌ | ✅ 必须 | ❌（无法） |

### 模式不确定时

- 如果你判断不清自己是 B 还是 C，**直接问用户一句**："是用你环境里的图像工具出图，还是只要我写好提示词？"
- Mode A 调脚本失败（401 / 网络 / 配额）→ 报错并询问"切到 B / C 吗？"

## 用户输入工具

当此技能需要向用户提问时，遵循以下规则：

1. 优先使用当前运行时提供的用户输入工具。
2. 如果没有对应工具，则用简短的纯文本编号问题提问。
3. 能合并的问题尽量一次问完。

## 技能结构

- `scripts/check-mode.js`：**先跑这个**，检测运行模式（A / B / C）
- `scripts/generate.js`：文本生图（仅 Mode A 使用）
- `scripts/edit.js`：基于原图 / 遮罩改图（仅 Mode A 使用）
- `scripts/atlas.js`：Atlas Cloud 单次提交、有界轮询和安全下载
- `scripts/shared.js`：共享请求、保存、环境变量读取逻辑
- `scripts/atlas.test.js`：Atlas Cloud 离线契约测试
- `references/`：分层结构化提示词模板（A / B / C 三模式都用）

## 环境变量

按以下顺序读取配置：

1. CLI 参数
2. `process.env`
3. `<cwd>/.env`
4. `<cwd>/.gateway.env`
5. `~/.gateway.env`

核心变量：

- `ENABLE_GARDEN_IMAGEGEN` — **模式开关**。`1` / `true` / `yes` / `on` 时启用 Mode A；未设置或其它值则进入 Mode B / C。
- `GARDEN_IMAGE_PROVIDER` — 可选：`openai`（默认）或 `atlas`。未设置时，只有 Atlas Key 且没有 OpenAI Key 才自动选择 Atlas。
- `OPENAI_API_KEY` — OpenAI Mode A 必需；B / C 不需要。
- `OPENAI_BASE_URL` — 默认 `https://api.openai.com/v1`，可指向第三方兼容网关。
- `OPENAI_IMAGE_MODEL` — 默认 `gpt-image-2`，可换成网关支持的型号（如 `gpt-image-1` / `dall-e-3`）。
- `ATLASCLOUD_API_KEY` — Atlas Mode A 必需。
- `ATLASCLOUD_IMAGE_MODEL` — Atlas 生图模型，默认 `qwen-image-3.0/text-to-image`。
- `ATLASCLOUD_EDIT_MODEL` — Atlas 编辑模型，默认 `qwen-image-3.0/edit`。

OpenAI 兼容路径保持默认。Atlas 为显式可选 provider，使用原生异步接口：POST 只提交一次，GET prediction 有界轮询，输出下载不转发 API Key 且只接受无凭据 HTTPS URL。Atlas 编辑把本地原图转成 data URL；遮罩和 OpenAI 专属参数仍仅用于 OpenAI 路径。

## 默认输出目录

如果用户没有明确指定输出路径，统一使用当前工作区下的：

- 提示词目录：`garden-gpt-image-2/prompt/`（**A / B / C 三种模式都建议用**，方便复用与版本管理）
- 图片目录：`garden-gpt-image-2/image/`（**仅 Mode A 使用**；Mode B 由宿主决定，Mode C 不产生图）

如果目录不存在，脚本（Mode A）必须自动创建；Mode B / C 在写 prompt 前手动 `mkdir -p`。

## 默认命名规则

如果用户没有明确指定文件名，脚本应自动生成与当前任务相关的文件名，并追加当前时间戳，避免重名。

命名规则：

- 提示词：`garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`
- 图片：`garden-gpt-image-2/image/<task-slug>-<timestamp>.png`

其中：

- `<task-slug>`：根据当前用户要求自动提取一个相关短名称
- `<timestamp>`：当前时间戳，例如 `20260424-153045`

示例：

- `garden-gpt-image-2/prompt/live-commerce-ui-20260424-153045.md`
- `garden-gpt-image-2/image/live-commerce-ui-20260424-153045.png`
- `garden-gpt-image-2/prompt/vr-headset-exploded-view-20260424-153102.md`
- `garden-gpt-image-2/image/vr-headset-exploded-view-20260424-153102.png`

## Prompt 保存规则

| 模式 | 是否必须保存 prompt | 说明 |
|---|---|---|
| Mode A | ✅ 必须 | 进入实际生成 / 编辑流程必落盘 |
| Mode B | 推荐 | 默认建议保存方便复用；用户说"不用"就略过 |
| Mode C | ✅ 必须 | 用户拿走 prompt 自己执行，不落盘等于白干 |

通用规则（适用三种模式）：

1. 如果用户显式给了 prompt 文件路径，可直接使用该文件作为输入。
2. 如果用户直接给的是文本 prompt，也要先把最终 prompt 保存到 `garden-gpt-image-2/prompt/`。
3. 如果用户显式指定了 `--prompt-output`，则尊重用户指定路径。
4. 否则使用默认命名规则自动保存。

## 图片保存规则（仅 Mode A）

1. 如果用户显式指定了 `--image` 或 `--output`，则尊重用户指定路径。
2. 否则默认保存到 `garden-gpt-image-2/image/`。
3. 文件名应和当前任务语义相关，并附加时间戳。

Mode B 由宿主图像工具决定保存方式；Mode C 不产生图片。

## 快速用法

### 0. 检测运行模式（**任何任务的第一步**）

```bash
node skills/gpt-image-2/scripts/check-mode.js
```

输出会告诉你当前是 Mode A / B / C，决定后续是否调用 `generate.js` / `edit.js`。下面 1~4 仅在 **Mode A** 下使用。

### 1. 文本生图（Mode A）

```bash
node skills/gpt-image-2/scripts/generate.js \
  --prompt "A cute baby sea otter" \
  --size 1024x1024 \
  --quality high
```

### 2. 用提示词文件生图（Mode A）

```bash
node skills/gpt-image-2/scripts/generate.js \
  --promptfile garden-gpt-image-2/prompt/poster-20260424-153045.md
```

### 3. 编辑已有图片（Mode A）

```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --prompt "Replace the background with a clean studio scene"
```

### 4. 带遮罩的局部编辑（Mode A）

```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --mask assets/mask.png \
  --prompt "Replace only the masked area with a glass vase"
```

### 5. Mode B / C 的"用法"

没有命令行入口——本 Skill 此时只是**提示词工程指南**：

- **Mode B**：渲染好最终 prompt → 调用宿主自带的 `image_generation` 类工具（参数中传入 prompt）→ 拿到图。
- **Mode C**：渲染好最终 prompt → 保存到 `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md` → 把内容直接展示给用户 → 提示用户在哪些图像工具中可以直接复用。

## JSON 模板工作方式

当 `references/` 中提供 JSON 模板时，按下面规则使用：

1. 先从 `SKILL.md` 找到最贴近的分类目录。
2. 再定位到具体模板文件。
3. 模板中的 `{argument ...}` 表示可替换参数。
4. 用户明确提供的值，直接填入。
5. 用户没有提供，但模板标了 `default` 的，默认可以先用默认值。
6. 如果缺失信息会显著影响结果，主动询问用户。
7. 用户也可以明确说“你随机生成”，这时可以保留默认值或在模板允许范围内合理随机化。

## 询问规则

当模板缺少关键变量时，不要笼统地问“你想要什么风格？”。应当根据模板字段精确提问。

例如直播 UI 模板缺少主体时，应优先问：

- 主播是谁？
- 用真人照片、名人名字、人物描述，还是完全随机生成？

缺少商品信息时应问：

- 商品名称是什么？
- 商品价格是否指定？
- 是否希望我自动补全评论和礼物内容？

## 模板索引

按任务类型只读取最贴近的具体模板文件，不要一次性全读整个 `references/`。

### 1. 方法论总文档

先读：

- `references/prompt-writing.md`

适用于：

- 你还没决定怎么构造 JSON 模板
- 你需要判断哪些字段该问、哪些字段可默认、哪些字段可随机
- 你需要把案例抽象成可复用模板

### 2. UI Mockups (`references/ui-mockups/`)

适合各种“界面 + 内容”的样机视觉。当前已落地：

- `live-commerce-ui.md` — 电商直播带货截图样机（主播 + 聊天区 + 礼物区 + 商品卡）
- `social-interface-mockup.md` — 社交平台动态详情页样机（Twitter/X、小红书、微博、Threads 等）
- `product-card-overlay.md` — 落地页 hero / 详情页主图（人物 + 商品 + 卖点 + 价格）
- `chat-interface-scene.md` — 聊天 / 对话界面样机（iMessage、微信、群聊、AI 助手）
- `short-video-cover-ui.md` — 短视频封面 / 直播缩略图（YouTube、抖音、B 站、VTuber stream）
- `landing-page-case-study.md` — 深色 SaaS / 营销 case study **长页面** UI mockup（多 section + 滚动叙事 + 数据卡 + CTA）

### 3. Product Visuals (`references/product-visuals/`)

适合“以商品为视觉中心”的图。当前已落地：

- `exploded-view-poster.md` — 产品爆炸视图海报（主体垂直堆叠 + callout + 顶部 logo + 底部品牌区）
- `white-background-product.md` — 电商纯白底主图（单品 / 多角度 / 极简营销叠层）
- `premium-studio-product.md` — 高级影棚商业产品图（杂志广告级氛围）
- `packaging-showcase.md` — 礼盒 / 包装展示图（外盒 + 内容物展示）
- `lifestyle-product-scene.md` — 生活方式产品场景图（商品出现在真实场景中）
- `ecommerce-marketing-board.md` — 中式电商超复合销售看板（主图 + 详情页 + 卖点 + 使用步骤 + 场景 + TVC 分镜组合一图）

### 4. Maps (`references/maps/`)

适合“地图类视觉”（信息图已抽离到独立分类 17）。当前已落地：

- `food-map.md` — 城市美食手绘地图（编号点位 + 图例 + 中心吉祥物）
- `travel-route-map.md` — 旅行路线图（多日行程 / 单日 city walk / 户外路线）
- `illustrated-city-map.md` — 城市风貌插画地图（地标 + 江山 + 文化元素）
- `store-distribution-map.md` — 品牌门店 / 服务覆盖分布图
- `itinerary-day-trip-map.md` — **一日游** split 海报（左 parchment 行程卡 + 右奇幻写实地图，5-7 站点严格对齐）

### 5. Slides & Visual Docs (`references/slides-and-visual-docs/`)

适合“一页讲清楚一件事”的视觉文档。当前已落地：

- `dense-explainer-slides.md` — Irasutoya × 霞关混合高密度讲解 Slide
- `policy-style-slide.md` — 政策 / 政府公告 / 白皮书风格说明 Slide
- `visual-report-page.md` — 商业报告执行摘要 / 投资人简报 / 年报概览页
- `educational-diagram-slide.md` — 教学示意图（概念 / 机制 / 流程分解）

### 6. Poster & Campaigns (`references/poster-and-campaigns/`)

适合“品牌主视觉 + campaign + banner + 杂志封面”。当前已落地：

- `brand-poster.md` — 品牌主海报（产品 / 人物 / 纯文字主张）
- `campaign-kv.md` — Campaign Key Visual + 衍生 layout 系统
- `banner-hero.md` — Web hero / 落地页 / app banner（横向构图 + CTA）
- `editorial-cover.md` — 杂志 / 期刊 / 出版物封面
- `biomimetic-concept-poster.md` — 仿生工业设计概念海报（自然原型 → 演化条 → hero render → 多视图技术图）
- `vintage-editorial-infographic.md` — 复古档案 / 1940s 编辑式信息图海报（人物 + 公式 + 时间轴 + 模型，Bell Labs 风）
- `character-catalog-poster.md` — 同一角色多版本信息图海报（星座 / 元素 / 朝代 / 人格系列卡片）
- `lineup-comparison-poster.md` — 系列产品 lineup 对比信息图海报（30+ SKU 同图 + 图例 + 等级 key）

### 7. Portraits & Characters (`references/portraits-and-characters/`)

适合“人物视觉”。当前已落地：

- `professional-portrait.md` — 职业级商务肖像（LinkedIn / 团队页 / 媒体配图）
- `founder-portrait.md` — 创始人媒体大片肖像（戏剧灯光 + 留标题位）
- `virtual-host.md` — VTuber / 虚拟主播个人卡 + 直播预览
- `character-sheet.md` — 角色综合设定稿（三视图 + 表情 + 服装 + 配色板）
- `pose-reference-sheet.md` — N×N 姿势 / 动作字典参考表（同一角色多姿势，舞蹈 / 战斗 / 健身）

### 8. Scenes & Illustrations (`references/scenes-and-illustrations/`)

适合 “氛围 + 故事 + 情绪” 的插画类视觉。当前已落地：

- `healing-scene.md` — 治愈系日常 / 季节场景插画
- `concept-scene.md` — 电影感概念大场景 / IP key art
- `picture-book-scene.md` — 童书 / 绘本内页 / 节日卡片
- `minimalist-mood-scene.md` — 极简留白氛围图 / 文学性壁纸

### 9. Editing Workflows (`references/editing-workflows/`)

适合“基于现有图片做编辑”的图改任务（对应 `scripts/edit.js`）。当前已落地：

- `background-replacement.md` — 背景替换（商品 / 人像 / 户外 / 棚景）
- `local-object-replacement.md` — 局部对象替换（配合或不配合蒙版）
- `object-removal.md` — 杂物 / 路人 / 电线 / 瑕疵去除
- `product-retouching.md` — 产品精修（光泽 / 标签 / 阴影 / 瑕疵）
- `portrait-local-edit.md` — 人像局部修改（发型 / 服装 / 妆容 / 配饰）

### 10. Avatars & Profile (`references/avatars-and-profile/`)

适合“风格化头像 / 人设 / 网格 / 贴纸 / 系列肖像”等"个人形象"类视觉。当前已落地：

- `style-transfer-selfie.md` — 把参考图人物转成 cosplay / 哥特 / 复古胶片 / 偶像写真等任意风格
- `character-grid-portrait.md` — 同一角色 n×n 网格肖像（多职业 / 多表情 / 多朝代 / 多风格）
- `themed-3d-icon.md` — Kawaii 3D / Minecraft / 拟物 3D 应用图标式头像
- `sticker-set.md` — 贴纸套装 / 表情包合集（独立元素 + 描边 + 标签）
- `cultural-portrait-series.md` — 朝代 / 神话 / 文学 / 民族系列肖像

### 11. Storyboards & Sequences (`references/storyboards-and-sequences/`)

适合“多分镜 / 漫画 / 关系图 / 流程步骤”等"叙事性序列"类视觉。当前已落地：

- `four-panel-comic.md` — 4 格漫画 / 讽刺漫画 / 段子漫画（起承转合 + 对话气泡）
- `manga-spread-page.md` — 单页 / 跨页漫画分镜（不规则格子 + 对话 + 心声）
- `anime-key-visual.md` — 单图动漫 KV / 轻小说封面 / IP 海报
- `character-relationship-diagram.md` — 角色关系图海报（卡片 + 关系连线 + 图例）
- `recipe-process-flowchart.md` — 食谱 / 教程 / 流程步骤图（编号 + 插图 + 说明）
- `product-tvc-storyboard.md` — 产品 TVC 商业广告分镜板（9-panel 实拍质感 + 镜头描述 + 时长）
- `cinematic-storyboard-grid.md` — **电影感叙事分镜** contact sheet（3×4 / 4×4，连续叙事 + cinematic still）
- `process-photo-board.md` — 真人 cinematic 流程板（装备穿戴 / 化妆 / 训练 / 操作分解，编号 + 步骤递进）

### 12. Grids & Collages (`references/grids-and-collages/`)

适合“多面板网格 / 拼贴 / 立项 board”类视觉。当前已落地：

- `banner-grid-2x2.md` — 2×2 营销 banner 套装（一次出 4 张统一系列设计）
- `lookbook-grid.md` — 7 日 lookbook / 9 宫 self-care / TOP N 清单图
- `mixed-style-multi-panel.md` — 多风格混合拼贴（同一主体不同画风演绎）
- `anime-pitch-board.md` — 动漫 / 游戏 / 影视立项 pitch board（KV + 角色 + 世界观 + 文案）
- `ad-banner-multi-grid.md` — 多行业 / 多主题混合广告 banner 网格（每格独立行业 + 风格 + 文案）

### 13. Branding & Packaging (`references/branding-and-packaging/`)

适合“品牌识别系统 / 吉祥物 / 包装设计”类视觉。当前已落地：

- `brand-identity-board.md` — 品牌识别系统板（logo + 配色 + 字体 + 应用 mockup）
- `mascot-brand-kit.md` — 吉祥物多面板品牌识别套装（主形象 + 三视图 + 表情 + 应用）
- `cosmetic-packaging.md` — 化妆品 / 护肤品 单瓶 / 系列 / 礼盒包装
- `beverage-label-design.md` — 饮料 / 食品 / 调味品标签设计（国潮 / 日式 / 西式）
- `full-mascot-brand-doc.md` — **18+ 模块大型品牌识别 + 吉祥物全流程文档**（DNA / moodboard / 草图 / 线稿 / 3D / 配色 / 材质 / 应用一图概览）
- `character-merch-board.md` — IP 角色 + 周边 / 包装 / 海报 / 社交 profile 多元素综合品牌板

### 14. Typography & Text Layout (`references/typography-and-text-layout/`)

适合“字面优先 / 双语版式”等"以文字为主视觉"的类型。当前已落地：

- `title-safe-poster.md` — 大字主张型海报（日式高能量 / 瑞士极简 / 复古印刷）
- `bilingual-layout-visual.md` — 中英 / 中日双语版式视觉（文化 / 学术 / 跨文化品牌）

### 15. Assets & Props (`references/assets-and-props/`)

适合“图标集 / 游戏截图”等"成套素材 / 游戏资产"类视觉。当前已落地：

- `retro-skeuomorphic-icons.md` — 拟物 / Y2K / 像素 图标集（成套统一风格）
- `game-screenshot-mockup.md` — 游戏内截图 mockup（HUD + 字幕 + 任务面板）

### 16. Academic Figures (`references/academic-figures/`)

适合“论文 / 顶会投稿 / 学术海报 / 答辩 PPT / 开题答辩 / 期刊投稿 Graphical Abstract”的配图。整体偏白底 + 出版物字体 + 几何精确 + 低饱和工程色（深蓝 / 灰蓝 / 黑灰为主，≤3 主色）+ 可单色印刷。**严格禁止虚构定量数据**（数值 / 等值线 / 色标范围 / 公式）。

CS / CV / ML 方向：

- `method-pipeline-overview.md` — 方法总览图 / pipeline figure（多 stage 块 + 数据流；变体 4 提供工程类左/中/右 三段式技术路线图）
- `neural-network-architecture.md` — 神经网络架构图（layer 块 + tensor shape + 跳连）
- `qualitative-comparison-grid.md` — 多方法 qualitative 对比网格（**行 = 样本，列 = 方法**）

工程 / 自然科学 / 答辩通用：

- `scientific-schematic.md` — 概念 / 原理 / 实验装置示意图（自由度高，自然语言模板）
- `mechanism-diagram.md` — 机理示意图 / 因果链路 / 转化路径（中心对象 + 多阶段转化 + 结果区；含三段式因果链 / 循环自激发 / 多分支竞争 三种变体）
- `multi-condition-comparison.md` — **多工况 / 多条件结果对比图**（同一对象在不同 condition 下的并列结果，2×2 / 1×N / M×N；强调 panel 间严格统一）
- `publication-chart.md` — publication-ready 数据图表（bar / line / scatter / heatmap / box）

总览 / 摘要 / 答辩首页：

- `graphical-abstract.md` — 期刊投稿 Graphical Abstract / 图形摘要（横向 4 段式 / 中心展开 / 方形 / 竖版四种变体）
- `research-overview-poster.md` — 开题 / 答辩 / 汇报首页研究总览图（上中下三层 + 五模块；含中心辐射 / 左右双栏 / 极简 三种变体）

> 选择策略：CS/CV/ML 论文首选 `method-pipeline-overview` + `qualitative-comparison-grid`；工程 / 能源 / 化工 / 材料方向首选 `method-pipeline-overview` 变体 4 + `mechanism-diagram` + `multi-condition-comparison`；投稿期刊摘要图用 `graphical-abstract`；答辩 PPT 首页用 `research-overview-poster`。

### 17. Infographics (`references/infographics/`)

适合“信息图 / 高密度科普 / 手绘信息图 / KPI 仪表盘”等"信息可视化大图"。当前已落地：

- `legend-heavy-infographic.md` — 高图例密度科普 / 因果链 / 演化 / 解剖图（双语）
- `hand-drawn-infographic.md` — **手绘风**信息图（macaron / morandi / 黑板 / 牛皮纸；自然语言模板）
- `bento-grid-infographic.md` — 便当格模块化信息图（高密度多模块 widget 排布）
- `comparison-infographic.md` — 二元 / 多元对比信息图（A vs B / 套餐档位 / 误区 vs 正解）
- `step-by-step-infographic.md` — 步骤教程信息图（插画感、温暖；非工程流程图）
- `kpi-dashboard-infographic.md` — KPI 仪表盘式信息图（年度回顾 / Wrapped / 业务 dashboard）

### 18. Technical Diagrams (`references/technical-diagrams/`)

适合“系统架构 / 流程 / 时序 / 状态机 / ER / 思维导图 / 网络拓扑”等工程示意图。统一暗色 grid 背景 + 等宽字体 + 角色编码配色，每个模板都附 light 变体。

⚠️ 注意：本目录生成的是 **PNG 位图**，**不是可编辑 SVG**；需要可编辑请改用 mermaid / draw.io / excalidraw / Figma。当前已落地：

- `system-architecture.md` — 系统架构图（前端 + 后端 + DB + 缓存 + 队列 + 外部）
- `flowchart-decision.md` — 流程图 / 决策图（BPMN 形状语义 + Yes/No 分支）
- `sequence-diagram.md` — 时序图（actor + lifeline + 消息箭头 + 激活条）
- `state-machine.md` — 状态机 / 生命周期图（state + transition + guard / action）
- `er-diagram.md` — ER 图 / 数据模型图（实体 + 字段 + PK/FK + crow's foot 关系）
- `mind-map-tech.md` — 技术主题思维导图（中央 + 放射式分支）
- `network-topology.md` — 网络拓扑图（设备 glyph + zone / VPC + 带宽 / 协议标）

## 提示词工作流（模式感知）

无论 A / B / C，**前 6 步是共用的**；区别只在第 7-8 步如何"出图"。

1. **跑 `check-mode.js` 确定模式**（A / B / C）。
2. 判断任务是生图还是改图。
3. 识别它属于哪个分类目录（参考下方"模板索引"）。
4. 只读取对应的具体模板文件，**不要一次读整个 references/**。
5. 严格遵循模板格式：大部分模板用 JSON 主模板（结构化任务首选），少数模板（`infographics/hand-drawn-infographic.md`、`academic-figures/scientific-schematic.md` 等）使用「结构化自然语言 + 参数」混合形式，因为强行 JSON 会限制创作自由。
6. 把用户输入映射到模板参数；关键信息不足时主动发起有针对性的澄清问题。

到此 prompt 已渲染好。下面按模式分叉：

7-A. **Mode A**：把最终 prompt 保存到 `garden-gpt-image-2/prompt/`，调用 `scripts/generate.js` 或 `scripts/edit.js`，图片落到 `garden-gpt-image-2/image/`。
7-B. **Mode B**：把最终 prompt 直接传给宿主的图像工具调用；按需保存 prompt 副本到 `garden-gpt-image-2/prompt/`。
7-C. **Mode C**：把最终 prompt 保存到 `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md`，并把完整 prompt 在对话中展示给用户，附一句简短的"如何使用 / 推荐工具"建议。

8. 任务结束后用一句话告诉用户：当前模式是什么、prompt 落在哪、图（如有）落在哪。

## 重要约束

通用：

- 模板文件中的 JSON 是**提示词结构模板**，不是 API 请求体模板。
- 三种模式下，最终交给图像模型的都是"渲染后的 prompt 字符串"——可以是拍平的 JSON、可以是结构化自然语言段落，按模板原样使用。
- 除非用户明确要求，否则**不要把 SKILL.md 里的"模式说明"复制到最终 prompt 里**——那是给 Agent 看的元信息。

仅 Mode A 适用：

- 生成脚本使用 JSON body
- 编辑脚本使用 multipart form data
- 响应优先按 `data[0].b64_json` 解析，也兼容 `data[0].url`
- 除非上游接口明确要求，不额外引入特殊 query 参数

## 何时提问

只在这些信息缺失且会显著影响结果时提问：

- 没有 prompt 目标
- 改图时没有原图
- 主体身份或视觉类型决定结果走向
- 商品 / 价格 / 文案 / UI 文本是画面核心组成部分
- 用户同时表达了多个互相冲突的目标

除此之外，优先自己做合理默认并继续执行。
