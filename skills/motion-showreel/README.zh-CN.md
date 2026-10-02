# Motion Showreel Skill

**用代码做「一眼惊艳」的 5–60 秒短视频：动效作品集、产品 teaser、UI 变形、动态排版、Logo 演绎、生成艺术循环，配乐可选。**

[English](./README.md) · [返回集合首页](../../README.zh-CN.md)

## 定位

| | motion-showreel | web-video-presentation |
|---|---|---|
| 驱动 | 视觉冲击 + 节拍 | 口播稿节拍 |
| 时长 | 5–60 秒 | 几分钟 |
| 产出 | 直接渲染出 MP4（逐帧、确定性） | 点击推进的网页，再录屏 |
| 声音 | 可选：代码合成配乐 + 音效，或用户曲子卡点 | 可选：TTS 口播 |

## 原理

页面暴露 `window.render(t)`，Playwright 逐帧截图，ffmpeg 合成 MP4。配乐和音效在 `score.mjs` 里用代码合成，和画面共用 `timeline.js` 这一张时间表，卡点误差为 0。

## 工作流

一次问清 → Reel Read + brief.md（节拍网格、分镜、禁止清单）→ 🛑 风格帧确认（唯一停顿点）→ 全力制作 → 技术检查（程序判定，必须全过）+ 审片（交给用户终审）→ 交付。

## 依赖

Node 18+、ffmpeg。首次运行 `sh scripts/setup.sh` 安装 Playwright 和 Chromium。

## 目录

```
SKILL.md            工作流 + 底线 + 工具速查
references/         formats（用途）· styles（风格）· craft · stack · recipes · sound · review · brief-template
scripts/            render.mjs · audio.mjs · inspect.mjs · scaffold.sh · setup.sh · check-env.mjs
assets/starter/     index.html · motion.js · timeline.js · score.mjs · build.sh
```
