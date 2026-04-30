# GPT Image 2 Skill

**面向 GPT Image 2 的聚焦型图像生成 / 编辑技能。一份 SKILL 定义，自动适配三种运行环境——本地直接出图、宿主原生图像工具、纯提示词顾问。**

[English](./README.md) · [返回集合首页](../../README.zh-CN.md)

![GPT Image 2 Skill](../../dist/imgs/gpt-image-2-skill.png)

---

## 这个 Skill 干什么

围绕 GPT Image 2（以及任何 OpenAI 兼容的图像接口）做的结构化提示词工程 + 图像生成包。只做两件事——`POST /images/generations` 和 `POST /images/edits`，但能在三种完全不同的运行环境下做到对用户无感。

它内置了：

- **模式感知工作流**：无论 Agent 自己持有 API key、宿主带原生图像工具、还是完全没有图像工具，同一份 Skill 都能用。
- **结构化模板库**：18 大类、70+ 个提示词模板，覆盖海报、UI 样机、产品图、信息图、学术图、技术架构图、漫画、头像、编辑工作流。
- **可复用的 prompt + 图片归档**：默认落盘到 `garden-gpt-image-2/prompt/` 和 `garden-gpt-image-2/image/`，按 `<task-slug>-<timestamp>` 命名。

---

## 三种运行模式

任何任务的第一步都是跑这个探测脚本：

```bash
node skills/gpt-image-2/scripts/check-mode.js
# 想拿结构化结果：
node skills/gpt-image-2/scripts/check-mode.js --json
```

输出会判定为以下三种之一：

| 模式 | 触发条件 | 行为 |
|---|---|---|
| **A · Garden 本地生图** | `ENABLE_GARDEN_IMAGEGEN` 为真 **且** 有 `OPENAI_API_KEY` | 端到端：选模板 → 渲染 prompt → 调用 `generate.js` / `edit.js` → 图片落盘 |
| **B · Host-Native 委托宿主出图** | 未启用 Garden，但宿主 Agent 自带图像工具（`image_generation` / `dalle` / `nano_banana` / 图像 MCP 等） | 渲染好 prompt 后**交给宿主自带的图像工具**出图 |
| **C · Advisor 纯提示词顾问** | 未启用 Garden，宿主也没有图像工具 | 退化成"高质量 prompt 撰写顾问"——把 prompt 落盘到 `garden-gpt-image-2/prompt/`，告诉用户去 ChatGPT / Midjourney / DALL·E / Sora / Nano Banana / 自己的网关里执行 |

三种模式都建议落盘 prompt 文件（A、C 必须，B 推荐），但只有 A 会产出图片文件——B 由宿主决定，C 不可能。

---

## 快速上手

### 0. 检测运行模式（永远是第一步）

```bash
node skills/gpt-image-2/scripts/check-mode.js
```

下面 1~4 仅在 **Mode A** 下使用。

### 1. 文本生图

```bash
node skills/gpt-image-2/scripts/generate.js \
  --prompt "A cute baby sea otter" \
  --size 1024x1024 \
  --quality high
```

### 2. 用提示词文件生图

```bash
node skills/gpt-image-2/scripts/generate.js \
  --promptfile garden-gpt-image-2/prompt/poster-20260424-153045.md
```

### 3. 编辑已有图片

```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --prompt "Replace the background with a clean studio scene"
```

### 4. 带遮罩的局部编辑

```bash
node skills/gpt-image-2/scripts/edit.js \
  --image assets/source.png \
  --mask  assets/mask.png \
  --prompt "Replace only the masked area with a glass vase"
```

Mode B / C 没有 CLI 入口——Skill 只负责把最终 prompt 渲染好，然后交给宿主图像工具（B）或直接呈现给用户（C）。

---

## Skill 结构

```
skills/gpt-image-2/
├── SKILL.md                       主技能定义
├── scripts/
│   ├── check-mode.js              模式 A/B/C 探测器（先跑这个）
│   ├── generate.js                文本生图（仅 Mode A）
│   ├── edit.js                    图像编辑 / 局部编辑（仅 Mode A）
│   ├── shared.js                  共享请求 / 落盘 / 环境变量解析
│   └── package.json
└── references/
    ├── prompt-writing.md          方法论：模板怎么设计、缺字段怎么问
    ├── ui-mockups/                直播带货、社交、产品卡、聊天、短视频封面
    ├── product-visuals/           爆炸图、纯白底、影棚、包装、生活方式
    ├── infographics/              信息图
    ├── poster-and-campaigns/      品牌主海报、Campaign KV、banner、杂志封面
    ├── slides-and-visual-docs/    高密度讲解、政策风、商业报告、教学示意
    ├── portraits-and-characters/  职业肖像、创始人肖像、虚拟主播、角色设定
    ├── scenes-and-illustrations/  治愈系、概念大场景、绘本、极简留白
    ├── editing-workflows/         背景替换、局部替换、去除、产品精修、人像编辑
    ├── avatars-and-profile/       风格化自拍、角色网格、3D 图标、贴纸、文化系列
    ├── storyboards-and-sequences/ 4 格漫画、漫画分镜、动漫 KV、角色关系图、流程图
    ├── grids-and-collages/        2×2 banner、lookbook、混风格拼贴、动漫 pitch board
    ├── branding-and-packaging/    品牌识别系统、吉祥物、化妆品包装、饮料标签
    ├── typography-and-text-layout/ 大字海报、双语版式
    ├── assets-and-props/          拟物图标、游戏截图样机
    ├── academic-figures/          方法 pipeline、神经网络架构、定性对比
    ├── technical-diagrams/        架构图、流程图、时序图
    └── maps/                      美食地图、旅行路线图、城市插画、门店分布
```

---

## 环境变量

按以下顺序读取：CLI 参数 → `process.env` → `<cwd>/.env` → `<cwd>/.gateway.env` → `~/.gateway.env`。

| 变量 | 必需性 | 说明 |
|---|---|---|
| `ENABLE_GARDEN_IMAGEGEN` | Mode A 必需 | 模式开关：`1` / `true` / `yes` / `on` 启用 Mode A |
| `OPENAI_API_KEY` | Mode A 必需 | 真正调图像 API 用 |
| `OPENAI_BASE_URL` | 可选 | 默认 `https://api.openai.com/v1`，可指向任意 OpenAI 兼容网关 |
| `OPENAI_IMAGE_MODEL` | 可选 | 默认 `gpt-image-2`，也可换成 `gpt-image-1` / `dall-e-3` 等 |

默认实现严格按 OpenAI 兼容接口工作，**不绑定**任何第三方网关。

---

## 输出约定

如果用户没有明确指定输出路径：

| 内容 | 落盘位置 | 适用模式 |
|---|---|---|
| 渲染好的 prompt | `garden-gpt-image-2/prompt/<task-slug>-<timestamp>.md` | A / B / C |
| 生成的图片 | `garden-gpt-image-2/image/<task-slug>-<timestamp>.png` | 仅 A（B 由宿主决定，C 不产出） |

`<task-slug>` 由用户请求自动派生，`<timestamp>` 是 `YYYYMMDD-HHMMSS`。

示例：

- `garden-gpt-image-2/prompt/live-commerce-ui-20260424-153045.md`
- `garden-gpt-image-2/image/vr-headset-exploded-view-20260424-153102.png`

---

## 设计原则

1. **先判模式，再干活。** 不会因为宿主没 API key 就静默失败，而是优雅地降级到 B / C 并明确告知用户当前状态。
2. **模板优于自由提示。** 18 大类预校验过的结构化模板，带显式 `{argument ...}` 参数槽和 `default` 标记，质量远高于"你说说想要啥"。
3. **精确提问，不要笼统提问。** 模板字段缺失时按字段精确问（"主播是谁？真人照片 / 名人名字 / 自由描述 / 随机生成？"），不要笼统问"想要什么风格"。
4. **永远归档 prompt。** 即使在顾问模式，渲染好的 prompt 也会落盘，方便复用。
5. **默认 OpenAI 兼容。** 不锁定任何特定网关。

---

## 许可证

MIT
