# Motion Showreel Skill

**用代码做「一眼惊艳」的短视频：动效作品集、产品宣传短片、UI 动效、动态排版、Logo 演绎、生成艺术循环、年代回顾，配乐可选。**

[English](./README.md) · [返回集合首页](../../README.zh-CN.md)

## 定位

以图形、文字或界面动画为主的短视频（常见 5–60 秒，纯音乐片最长约 2 分钟），直接渲染出 MP4 和可编辑源码。不做旁白讲解，不做实拍和写实人物。

## 原理

页面暴露确定性的 `window.render(t)`，Playwright 逐帧截图，ffmpeg 合成 MP4。配乐和音效也用代码写，和画面共用 `timeline.js` 这一张时间表，卡点精确到帧。

## 工作流

一次问清 → 找对标、想三个候选结构 → 选用途和风格，写 brief（节拍网格、分镜、禁止清单）→ 🛑 风格帧确认（唯一停顿点：已定风格看 3 张帧；未定风格看 3 个方向各 1 张帧）→ 全力制作 → 技术检查（程序判定，必须全过）+ 审片（交给用户终审）→ 交付。

用户说「全力以赴 / 你随意」时进入**放手模式**：只守底线和技术管线，风格和手法由模型自己判断。

## 风格库

`references/styles/` 下有 22 种风格，每种一个文件（本质、材质、配色、字体、运动、镜头语法、声音调色板、原生手法、变化空间、坑），分 7 组：图形与排版、界面与产品、复古与屏幕、3D 与材质、生成与抽象、手作、电影感。风格库是起点，不是选择题：可以直接用、改造、混搭，也可以按 `_template.md` 自定义。

## 声音

| 档 | 用什么 | 适合 |
|---|---|---|
| 第 1 档 | 内置合成器（`score.mjs`，零依赖）：鼓与手鼓、贝斯、铺底、拨弦、马林巴 / 钢片 / 卡林巴、风琴、人声铺底、环境底噪，swing / 步进节奏，lo-fi 处理（bitcrush、磁带抖动） | 电子、界面、复古、抽象、手作、lo-fi |
| 第 2 档 | Tone.js 在无头浏览器里离线渲染（`score.tone.js`），支持采样乐器（Salamander 钢琴，CC BY）和卷积混响 | 电影感、手作、高端产品 |
| 外部 | 用户提供的曲子，自动测节拍（有 librosa 时优先使用） | 已有配乐 |

声音和画面一样先定方向：声音对标、律动、和声、配器、戏剧曲线（`references/sound.md` 第 2、5、6 节），并有一份声音的「默认味」清单，避免几支片子听起来像同一首歌。所有音乐都自动处理到 −14 LUFS，并用 `audio.mjs check` 输出响度、频段和波形图（模型听不到，只能看）。

## 依赖

Node 18+、ffmpeg。首次运行 `sh scripts/setup.sh` 安装 Playwright、Chromium 和 Tone.js。工具自带回归测试：`cd scripts && npm test`。

## 目录

```
SKILL.md            工作流 + 底线 + 工具速查
references/
  formats.md        用途（9 类）
  styles/           风格库：INDEX.md + _template.md + 22 个风格文件
  craft.md          手法库        stack.md     技术栈与坑      recipes.md   现成写法
  sound.md          声音          review.md    验收与审片      brief-template.md
scripts/            render.mjs · audio.mjs · inspect.mjs · scaffold.sh · setup.sh · check-env.mjs · test/
assets/starter/     index.html · motion.js · timeline.js · score.mjs · score.tone.js · score.layer.mjs · build.sh
```
