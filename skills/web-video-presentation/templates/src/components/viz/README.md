# viz —— 章节视觉元素库（选用手册）

> **用途**：口播讲到什么，画面就挂出对应的**具象元素**。这是"视频感"的
> 主要来源，也是治「画面空洞 / 内容只占屏幕三分之一」的直接手段。
>
> **硬规则**（CHAPTER-CRAFT.md 中同步）：
> 1. 每步**至少挂 1 个**本库元素（复杂节拍 2~3 个）；整章只有"标题 + 一段
>    文字" = 验收不过。
> 2. 元素必须**与当拍口播内容相关**——不许为了填画面挂无关元素。
> 3. 颜色 / 字体一律走主题 token，禁止硬编码 hex、禁止 emoji 当图标、
>    禁止位图、禁止假数据（数字由调用方传真实值）。
> 4. 主视觉放 `.band-main`（≥55% 舞台高），外层用 `.viz-fill` 撑满。
>
> **动作原语**（viz.css）：`.viz-draw`（连线自绘）`.viz-grow`（条生长）
> `.viz-pop`（弹入）`.viz-rise`（上浮）`.viz-dim / .viz-on`（未点亮 / 点亮）。

## 清单（12 个）

| 组件 | 长什么样 | 什么时候用 | 关键 props |
|---|---|---|---|
| `BrowserWindow` | 浏览器窗（三点 + 地址栏 + 内容行，可高亮某一行） | 讲网页、在线工具、搜索/爬取结果、网页数据 | `url`, `highlight` |
| `Terminal` | 深色终端窗（提示符 + 命令 + 光标） | 讲命令行、跑代码、部署、报错 | `title`, `lines[]` |
| `FolderTree` | 文件夹（标签页 + 目录行，可高亮某行） | 讲文件、仓库结构、数据集、知识库 | `items[]`, `activeIndex` |
| `DocStack` | 三张错位堆叠的文档 | 讲资料、文档、上下文注入、知识来源 | `label` |
| `ChatBubbles` | 左右对话气泡（用户 / AI） | 讲对话、提示词、追问、多轮交互 | `messages[{role,text}]`, `activeIndex` |
| `CardGrid` | 卡片网格（序号 + 标题） | 讲并列的几项、清单、多种能力 | `items[]`, `cols`, `activeIndex` |
| `PipelineFlow` | 节点自上而下竖排 + 箭头，依次点亮 | 讲步骤、链路、数据流、RAG 各段 | `steps[]`, `activeIndex` |
| `TimelineRail` | 时间轴刻度（点亮当前节点） | 讲时间、版本迭代、知识截止、历史 | `ticks[]`, `activeIndex` |
| `BarChart` | 立柱 + 数值 + 轴（`.viz-grow` 生长） | 讲数字对比、跑分、占比 | `bars[{label,value}]`, `activeIndex` |
| `LoopArrow` | 环形箭头（自绘） + 中心文字 | 讲循环、迭代、反复调试、反馈回路 | `label`, `sublabel` |
| `Magnifier` | 放大镜（镜筒里是"命中项"） | 讲检索、搜索、召回、查资料 | `label` |
| `ListStack` | 竖排清单（序号 + 标签 + 可选数值，纵向撑满） | 讲并列的几项 / 清单 / 要点陈列，**竖版舞台单挂即填满** | `items[{label,value}]`, `activeIndex` |

## 用法示例

```tsx
import { PipelineFlow, BrowserWindow } from "../components/viz";

// 章节里按 step 换元素 —— 讲到哪段，点亮哪一段
<div className="band-main viz-fill">
  <PipelineFlow
    steps={["你问", "切块", "检索", "生成"]}
    activeIndex={step}          // step 0→3 依次点亮
  />
</div>
```

```tsx
// 一个节拍挂两个元素：主角 + 上下文
<div className="band-main viz-fill" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
  <Magnifier label="检索" />
  <DocStack label="知识库" />
</div>
```

## 加新元素

按同样约定在 `Viz.tsx` 里加一个纯 SVG 组件（内部用 `var(--…)` 取色、
文字用 `--font-display-cn` / `--font-mono`），在 `index.ts` 导出，
在本表补一行。**不要**引入位图 / 图标字体 / emoji。

## 原生比例（选型参考，2026-10-19 实测）

3:4 竖版舞台的中部盒 ≈ **0.89（近方形）**。元素比例与它差太多，`meet`
缩放后会在上下留大条空色（"画面又变空"）。所以：

| 比例 | 元素 | 单挂中部盒的表现 |
|---|---|---|
| **≈0.8~1.0（竖向/方形）** | `PipelineFlow`(0.80) · `LoopArrow`(1.0) · `Magnifier`(1.0) · `DocStack`(1.03) · `ListStack`(0.94) | ✅ 直接撑满中部 |
| **≈1.1（近方）** | `BrowserWindow`(1.13) · `FolderTree`(1.13) | ✅ 基本撑满，上下各留少量空 |
| **偏横** | `Terminal` · `ChatBubbles` · `CardGrid` · `BarChart` · `TimelineRail` | ⚠️ 会被压扁留大空 → **并置 2 个**（左右）或与竖向元素上下叠 |

> 选型口诀：**单挂挑"方/竖"的，横的一律成对挂**。挂完自检中部剩余空色 ≤20%。

