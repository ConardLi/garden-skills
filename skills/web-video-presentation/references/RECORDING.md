# 录制与后期合成

网页做完 + 音频合成完之后，**Auto 模式 + 屏幕录制可以一镜到底**——
不需要手动点击推进 step、也不需要后期对音频。

如果你不打音频，仍可走"手动点击 + 后期配"的传统路径（在文档末尾）。

---

## 推荐流程：Auto 模式一镜到底

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

> **竖版（小红书 3:4）**：脚手架加 `--ratio=3:4` 后舞台变为 1080×1440。
> 录屏时把浏览器视口 / OBS 窗口捕获尺寸设为 **1080×1440**（不是 1920×1080），
> `?auto=1` 录出来的成片即为竖版。音频合成与横版完全一致。

### 模式速查

| URL / 快捷键 | 行为 |
|---|---|
| 直接打开（默认） | Manual：点击 / ←→ 推进，不播音频 |
| `?audio=1` 或按 `M` | Audio：进入 step 自动播音频，但**手动点鼠标推进** |
| `?audio=1` + 再按 `M` | Auto：进入 step 自动播 + 自动推进（录制用） |
| Auto 模式下首次按 `Space` | 启动 Auto 播放（绕过浏览器自动播放限制） |

也可以鼠标移到右上角，会出现一个隐藏的模式切换按钮。

---

## 方案 C：无头自动成片（截图定格，零抖动，全自动）

不想手动开 OBS 录屏时，用脚手架自带的 `scripts/record.mjs` + `scripts/build_from_shots.py`
全自动出片。**这条路径专门根治「无头录屏音画不同步」这个已踩过的坑**——

> ⚠️ 已踩坑：无头 Chrome 录 webm 时，每帧时间戳相对页面事件会随机抖 **±0.9s**
> （无净漂移）。重定时 / 改 CFR / 压动画都救不回，因为「录制帧的采样点」根本不在
> 事件上。方案 C 不依赖录制帧时序，改用「逐步截图 + 干净累积音轨」彻底绕开。

### 前置

```bash
cd <project>
npm i -D playwright-core
npx playwright-core install chromium   # 或设 CHROME=系统Chrome路径
# 并确保 ffmpeg 在 PATH（或设 FFMPEG 环境变量指向可执行文件）
```

### 步骤

```bash
npm run dev                      # vite 跑在 5174
npm run extract-narrations       # → audio-segments.json
npm run synthesize-audio         # → public/audio/<chapter>/<step>.mp3
node scripts/record.mjs          # 抓 raw/shots/step-<ch>-<step>.png + raw/marks.json
python scripts/build_from_shots.py   # → <项目名>-final.mp4
```

`record.mjs` 会自动从 `src/hooks/useStepper.ts`、`src/stage.config.ts` 探测
`STORAGE_KEY` 与舞台尺寸，无需手填。成片比例由 `stage.config.ts` 决定（竖版即 1080×1440）。

### 原理（为什么同步）

- 每步切换后 ~200ms（入场动画已定格）截一张图，抓取时刻是已知页面时钟、内容绝对对应「第 i 步」。
- 音频按「干净累积时长」`offset[i] = Σ(durs[j] + 0.2)` 摆放，与截图共用同一时间轴 → 逐帧对齐。
- 实测残差 std < 0.02s，人眼不可察。

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
