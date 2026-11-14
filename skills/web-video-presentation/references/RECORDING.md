# 录制与后期合成

网页做完 + 音频合成完之后，**Auto 模式 + 屏幕录制可以一镜到底**——
不需要手动点击推进 step、也不需要后期对音频。

如果你不打音频，仍可走"手动点击 + 后期配"的传统路径（在文档末尾）。

---

## 自动渲染（可选，替代 OBS/QuickTime）

`scripts/render/` 提供了一条命令自动出片：Playwright 打开 `?auto=1`、
按 SPACE 启动、录 1920×1080 webm，再用 ffmpeg 把 narration 按真实 mp3
时长切成 SRT/ASS 字幕烧进 MP4。适合批量出片 / CI，不需要手动开录屏工具。

### 前置

- 已跑过 `npm run extract-narrations` + `npm run synthesize-audio`
- 本机装了 `ffmpeg` + `ffprobe`（PATH 里）
- 一次性装好渲染依赖：

  ```bash
  npm run render:setup     # = npm i -D playwright + npx playwright install chromium
  ```

### 一键出片

```bash
npm run render:check       # 自检 node / ffmpeg / playwright / 音频文件
npm run render             # 自动录屏 + 烧字幕 → out/final/video.mp4
```

产物：

```
out/final/video.mp4              # 1920×1080 H.264/AAC，字幕已烧入
out/subtitles/subtitles.srt      # 外挂字幕（可二次编辑）
out/subtitles/subtitles.ass
```

加 `--keep-raw` 可保留 `out/raw/*.webm` 用于排查录屏问题。

> 自动渲染和下面的手动 Auto 模式是**同一条播放路径**（都是 `?auto=1`
> 按 SPACE），只是录屏执行者从 OBS 换成 Playwright。音画同步由页面
> 音频驱动，字幕按真实 mp3 时长生成，不需要后期对轨。

---

## 推荐流程：Auto 模式一镜到底（手动录屏）

### 前置

- 章节代码做完，每章都有 `narrations.ts`
- 已经跑过 `npm run extract-narrations` + `npm run synthesize-audio`，
  `public/audio/<id>/<step>.mp3` 全部就位
- `npm run dev` 跑着，浏览器能打开页面

### 录制步骤

1. **浏览器全屏**（F11 / Ctrl+Cmd+F），URL 改成
   `http://localhost:5173/?auto=1`
2. 看到 "Press SPACE to start" 蒙层 = Auto 模式就绪
3. **打开屏幕录制**（QuickTime / OBS / Cmd+Shift+5），开始录
4. **按一次 Space** → 蒙层消失 → step 0 出现，1.mp3 自动播 →
   播完自动推进到 step 1 → 2.mp3 → … → 最后一个 step 播完 → 停在终态
5. **停止录制** → 后期裁掉头尾（Space 那一下、最后停在终态的尾巴）就是
   成品

整个过程**完全不用点鼠标**。音视频天然同步，不需要后期对轨。

> **Auto 模式严格按音频结束推进**（+ 200ms 缓冲），没有"等动画跑完"
> 的兜底。如果你看到某步动画被切了一半 → 说明该 step 动画长于口播，
> 回章节代码改：写更长口播 / 拆 step / 调动画速度。

### 录屏工具

| 平台 | 工具 | 设置 |
|---|---|---|
| macOS | Cmd+Shift+5 → 录制选定窗口 | 选浏览器窗口；浏览器全屏后输出就是 1920×1080 |
| macOS | QuickTime → 文件 → 新建屏幕录制 | 同上 |
| 跨平台 | OBS Studio | 窗口捕获，Canvas 1920×1080，60fps |

### 模式速查

| URL / 快捷键 | 行为 |
|---|---|
| 直接打开（默认） | Manual：点击 / ←→ 推进，不播音频 |
| `?audio=1` 或按 `M` | Audio：进入 step 自动播音频，但**手动点鼠标推进** |
| `?audio=1` + 再按 `M` | Auto：进入 step 自动播 + 自动推进（录制用） |
| Auto 模式下首次按 `Space` | 启动 Auto 播放（绕过浏览器自动播放限制） |

也可以鼠标移到右上角，会出现一个隐藏的模式切换按钮。

---

## 备用流程：没合成音频时手动录屏

如果你跳过了音频合成（`Checkpoint Audio` 选了"不合成"），按老方法：

1. 浏览器全屏 → 打开 `localhost:5173`（默认 Manual 模式）
2. **刷新一次**清空历史 step
3. 开始录屏 → 按口播节奏点击空白推进 step
4. 后期用任何剪辑软件配音 + 调时间线

### 后期工具

| 工具 | 适合 |
|---|---|
| **DaVinci Resolve** | 跨平台免费、能处理多段音频拼接 |
| **iMovie** | macOS 简单场景 |
| **CapCut / 剪映** | B 站 / 抖音风加字幕 |

---

> agent 在 Checkpoint Audio 后**主动告诉用户**上面 Auto 模式录屏的
> 路径，让用户知道下一步怎么把网页变成 mp4。
