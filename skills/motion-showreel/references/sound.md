# 声音：配乐、音效、混音

声音是视频的另一半。同样的画面，有没有卡点的音效，观感能差一个档次。这里的配乐和音效全部在 `score.mjs` 里用代码合成，时间点从 `timeline.js` 读取，所以和画面是同一张时间表。

目录：1 三种模式 · 2 session API · 3 按类型的编曲配方 · 4 音效对照表 · 5 时间规则 · 6 混音 · 7 检查（你听不到） · 8 用户给的曲子

---

## 1. 三种模式

| 模式 | 什么时候 | 流程 |
|---|---|---|
| 代码合成（默认） | 用户没给曲子 | 写 `score.mjs` → `audio.mjs build` → `audio.mjs check` |
| 用户的曲子 | 用户提供了能商用的音乐 | `audio.mjs beats` → 把节拍对齐到 timeline → 画面排在节拍上 → `score.mjs` 里 `S.load()` 曲子并叠加音效 |
| 无声 | 循环动图、要放进别的片子里的素材 | 跳过 |

## 2. session API

`score.mjs` 导出 `DUR`，以及一个接收 session `S` 的默认函数：

```js
import { DUR, BPM, CUES } from './timeline.js';
export { DUR };
export default function score(S) {
  S.tempo(BPM);                                         // S.beat(n)、S.bar(n) → 秒
  const drums = S.bus('drums', { gain: 0.9 });
  const music = S.bus('music', { gain: 0.5, reverb: 0.3, duck: 0.6, highpass: 160 });
  drums.add(S.kick(), S.beat(0)); S.duck(S.beat(0));    // 侧链：music 在每个 duck 点被压低
  music.add(S.pad(S.chord('A3', 'min7'), S.bar(2)), S.bar(0));
}
```

**bus 选项**：`gain`、`pan`（−1…1）、`reverb`（发送量 0–1）、`delay`（发送量）、`delayTime`（秒，默认 3/4 拍）、`duck`（侧链深度 0–1）、`duckRelease`（秒）、`highpass` / `lowpass`（Hz）、`drive`（0–1）、`width`（0 = 单声道）。
**`bus.add(sound, t, { gain, pan })`**：t 可以为负（声音从片头之前开始，会被截掉一部分）。
**`S.duck(t, depth)`**：登记一个侧链触发点（一般跟着 kick，或者放在撞击上）。
**和声**：`S.midi('C#4')`、`S.hz('A4')`、`S.chord(root, quality, inversion)`（maj、min、sus2、sus4、maj7、min7、7、m9、maj9、add9、madd9、min11、5…）、`S.scale(root, 'minor')(degree)`（major、minor、dorian、phrygian、lydian、mixolydian、penta、minpenta）。音符可以写成名字，也可以写成 MIDI 数字。

**乐器**（返回单声道 Float32Array；pad 和 whoosh 返回立体声 `{L, R}`）：

| 类别 | 函数 | 常用参数 |
|---|---|---|
| 鼓 | `kick()` | tone 48、start 165、decay 0.42、click 0.5、drive 0.35 |
| | `snare()` `clap()` | tone、decay、snappy |
| | `hat({ open })` `crash()` `tom(note)` | decay、tone |
| 低音 | `bass(note, dur)` | wave 'saw'/'square'、cutoff 600、envAmt 3、sub 0.6、glideFrom、drive |
| | `sub(note, dur)` | harm 0.15（加泛音，小喇叭上也听得见） |
| 和声 | `pad(notes, dur)` | voices 5、cents 14、cutoff 1800、attack 0.5、release 1.2、wave |
| | `keys(notes, dur)` | FM 电钢琴：decay、index |
| 旋律 | `pluck(note, dur)` | bright 0.55（Karplus-Strong 拨弦） |
| | `lead(note, dur)` | wave、cutoff、vibrato、glideFrom、detune |
| | `bell(note, dur)` | ratio 3.5、index 4（FM 钟声 / 玻璃） |
| 音效 | `riser(dur)` `downlifter(dur)` | from、to、noise |
| | `whoosh(dur)` | peak 0.7：**最响的点在 peak × dur 处**，所以放在 `切点 − peak × dur` |
| | `impact()` `boom()` `reverseCymbal(dur)` | size |
| | `click()` `tick()` `pop(note)` `blip(note)` `swipe(dur)` | tone |
| | `glitch(dur)` `shimmer(dur)` | seed、bits / root |

**底层工具**（自己做音色时用）：`osc(len, freqOrFn, wave)`、`noise(sec, seed)`、`adsr`、`expEnv`、`biquad(buf, type, cutoffOrFn, q)`、`lowpass`、`highpass`、`bandpass`、`drive`、`reverse`、`fade`、`mul`、`S.SR`（48000）。`S.load(file)` 用 ffmpeg 把任何音频解码成 `{L, R}`。

构建：`node <skill>/scripts/audio.mjs build <slug>/score.mjs [--out audio/music.wav] [--stems]`。母带会自动处理到 −14 LUFS，并用峰值限制器压到 −1.5 dBFS。`--stems` 会把每条 bus 单独导出到 `audio/stems/`，方便排查是哪一轨出了问题。

## 3. 编曲配方（按用途给结构，按风格选配器）

**结构跟用途走，配器跟风格走**（风格的声音调色板见 styles.md）。避免通用的「钢琴 + 弦乐」。

| 用途 | 常用 BPM | 结构要点 |
|---|---|---|
| A 动效作品集 | 120–128 | 前 2 小节只有铺底和镲 → 进鼓 → drop 前一小节 riser，最后一拍静音 → drop 时 impact + crash |
| B 产品宣传短片 | 100–124 | 卖点切换处放 whoosh；高潮时全部乐器进来；落版用一个钟声加长尾音 |
| C UI 动效演示 | 110–120 | 音乐退后（gain 0.3–0.4），界面音效在前 |
| D 排版卡点 | 按曲子 / 90–140 | 重点词的前一拍静音 |
| E Logo / 片头 | — | riser → impact → 一个持续和弦或钟声，4–8 秒内完成一次起伏 |
| F 循环动图 | 60–90 或无声 | 声音也要能循环：首尾的音量和和声要一致 |
| G 数据爆点 | 120 | 滚动期间 tick 越来越密 → 落定前半拍静音 → impact |

| 风格 | 配器 |
|---|---|
| 瑞士编辑 | 干净的电子鼓、tick 网格、短促的 pluck；混响少 |
| 极简界面 | 拨弦琶音（penta）、轻底鼓、软拍手、界面音效 |
| 像素 CRT | `lead` / `bass` 用 square、`blip`、`glitch`、噪声鼓 |
| 3D 材质 | sub drone、boom、FM 钟声 / 玻璃、颗粒 shimmer、慢 riser |
| 生成抽象 | 铺底 drone、shimmer、慢 pluck |
| 手绘笔触 | pluck、keys、bell，节奏松一些 |

## 4. 音效对照表

音效的密度由风格决定：极简界面几乎每个动作都有声音，生成抽象可能一个都没有。需要音效时，材质要对得上：

| 画面动作 | 音效 |
|---|---|
| 元素弹出 / 出现 | `pop`（音高随元素大小变化：大元素低，小元素高） |
| 点击、开关、吸附 | `click`、`tick` |
| 滑动、拖拽、卡片划过 | `swipe` |
| 转场、甩镜、穿越 | `whoosh`（峰值对准切点） |
| 重拍上的大变化、反色、落版 | `impact` + `crash`，并登记 `S.duck` |
| 吸气、蓄力 | `riser`（长度 = 一小节），以 drop 时刻结束 |
| 消散、退场 | `downlifter`、`reverseCymbal` 的反向 |
| 粒子聚合、闪光、成功 | `shimmer`、`bell` |
| 数字跳动 | `tick`（每变一次一个，太密就隔几次一个） |
| 故障、像素化、切片 | `glitch` |

## 5. 时间规则

- 音效的触发时间**直接用 timeline.js 里的同一个数字**，不要另外手写。
- whoosh 的峰值对准切点（`t − peak × dur`）；impact 正好落在动作那一帧。
- **drop 前留一拍（至少半拍）的静音**：鼓和铺底都停，只剩 riser 的尾巴或者什么都没有。静音之后的第一个声音必须是全片最重要的声音之一。
- 声音可以当转场：下一镜的声音提前 2–4 帧进来（J-cut），或者上一镜的尾音延续过切点（L-cut）。
- 循环片：最后一小节的混响尾巴会在片头突然断掉，最后一拍要收干净，或者把尾巴叠回片头。

## 6. 混音

- **分 bus**：drums、bass、music、sfx 至少四条，方便调整平衡。
- **侧链**：bass 和 music 的 `duck` 设 0.5–0.7，每个底鼓和撞击都 `S.duck(t)`，律动感立刻就出来了。
- **低频控制**：合成音乐的低频很容易太重。pad 和 music 加 `highpass: 150–250`；kick 的 decay 不要超过 0.45；bass 的 `sub` 控制在 0.3–0.6；低于 MIDI 48 的铺底音符不要用。
- **小喇叭**：手机外放听不到 60Hz 以下。贝斯要有 2、3 次谐波（`sub({ harm })`、`bass` 的锯齿波本来就有）。
- **空间**：混响只发送给 music 和 sfx（0.15–0.35），鼓和贝斯保持干声。
- **响度**：母带自动处理到 −14 LUFS（各大平台的标准）、真峰值 ≤ −1 dBTP。

## 7. 检查（你听不到）

每次 build 之后都要跑：

```bash
node <skill>/scripts/audio.mjs check <slug>/audio/music.wav --out <slug>/qa/music
```

它会打印：整体响度（目标 −14 ± 1 LUFS）、真峰值（< −1 dBTP）、按倍频程的能量（相对 1 kHz，粉红噪声全部为 0；一般的混音在 63–125 Hz 是 +4…+12，4–8 kHz 是 −6…−18）、意外的静音段，并给出 WARN。然后**看** `-wave.png`（有没有削顶、音量起伏是否和画面结构一致：drop 处应该最满，吸气处应该有凹陷）和 `-spectrum.png`（低频是否一直轰着、高频是否完全没有）。

成片之后，`inspect.mjs qa` 会对混好的 MP4 再检查一次。

## 8. 用户给的曲子

1. 确认授权（能不能商用，是不是用户自己的），写进交付说明。
2. `node <skill>/scripts/audio.mjs beats track.mp3 --out <slug>/audio/beats.json`：得到 BPM、beats、downbeats、onset hits、每小节能量、drops（能量突增的小节）、breaks（能量突降的小节）。
3. **核对网格**：节拍检测可能锁到半速或倍速，或者落在反拍上。已知 BPM 不一致就加 `--bpm`；拍点在反拍上就加 `--shift 0.5`。打开 `-wave` 图看 drop 的位置是否和 `drops` 一致。
4. 选一段：短片一般截取一个完整的乐句（4 或 8 小节），最好包含一个 drop。在 `score.mjs` 里：
   ```js
   const song = S.load('audio/track.mp3'), a = Math.round(START * S.SR), n = Math.round(DUR * S.SR);
   const cut = { L: S.fade(song.L.slice(a, a + n), 0.01, 0.4), R: S.fade(song.R.slice(a, a + n), 0.01, 0.4) };
   S.bus('song', { gain: 1 }).add(cut, 0);
   ```
   然后把 sfx 叠在上面（`S.load` 的路径相对于运行命令时的当前目录，建议在项目目录里运行 build）。
5. 把截取后的节拍时间（减去起点）写进 `timeline.js`：`export const BEATS = [...]`、`export const DROP = ...`，画面全部从这里读。
6. 曲子本身已经做过母带：bus 的 gain 设 1，别再加 drive；母带处理会把整体拉回 −14 LUFS。
