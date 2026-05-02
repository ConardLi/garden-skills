# 录制与后期合成

网页做完后**手动录屏 + 后期对音频**的标准路径。完整自动化方案（按 step
自动推进 + 自动渲染 mp4）当前未实现，标作 roadmap。

## 录屏工具

| 平台 | 工具 | 设置 |
|---|---|---|
| macOS | QuickTime → 文件 → 新建屏幕录制 | Window 录制 1920×1080；或 Cmd+Shift+5 选窗口 |
| 跨平台 | OBS Studio | 显示 / 窗口捕获，Canvas 1920×1080，60fps |
| 浏览器内 | Chrome DevTools → More tools → Recorder | 仅适合简单交互，**不**推荐成片用 |

## 录制步骤

1. 浏览器全屏（F11 / Ctrl+Cmd+F），打开 `localhost:5173`
2. **刷新一次**清空历史 step，从 step 0 开始
3. 开始录制 → 按口播节奏点击空白推进 step
4. 如果 Phase 3 已合成音频 → 录屏时静音浏览器，后期把
   `presentation/public/audio/<chapter>/<step>.mp3` 按 step 顺序拼到
   时间线上

## 后期工具

| 工具 | 适合 |
|---|---|
| **DaVinci Resolve** | 跨平台免费、能处理多段音频拼接 |
| **iMovie** | macOS 简单场景 |
| **CapCut / 剪映** | B 站 / 抖音风加字幕 |

> agent 在 Phase 3 结束时应主动告诉用户上面这条路径，让用户知道下一步
> 怎么把网页变成 mp4。
