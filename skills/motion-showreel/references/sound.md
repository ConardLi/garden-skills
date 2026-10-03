# 声音：配乐、音效、混音

声音是视频的另一半。同样的画面，有没有卡点的音效，观感能差一个档次。配乐和音效都用代码写，时间点从 `timeline.js` 读取，所以和画面是同一张时间表。

目录：1 选哪一档 · 2 第 1 档：内置合成（session API） · 3 第 2 档：Tone.js · 4 编曲配方 · 5 音效对照表 · 6 时间规则 · 7 混音 · 8 检查（你听不到） · 9 用户给的曲子

---

## 1. 选哪一档

| 档 | 文件 | 引擎 | 强项 | 弱项 |
|---|---|---|---|---|
| 第 1 档 · 内置合成（默认） | `score.mjs` | Node 里的合成器，零依赖、完全确定 | 电子鼓、合成贝斯、铺底、拨弦、FM 钟声、芯片音乐、UI 音效、侧链 | 真实乐器（钢琴、弦乐、真鼓）不像 |
| 第 2 档 · Tone.js | `score.tone.js` | 在无头浏览器里用 Tone.js 离线渲染（OfflineAudioContext） | 采样乐器、卷积混响、合唱 / 相位 / 失真等效果、更丰富的合成器 | 需要先下载采样；噪声类音色每次渲染略有不同 |
| 外部曲子 | 用户的音频文件 | `S.load()` | 真实制作的音乐（用户自己的、授权的、AI 音乐服务生成的） | 授权要用户负责；只能卡它的拍 |
| 无声 | — | — | 循环动图、要放进别的片子里的素材 | — |

两档可以叠：先 `audio.mjs build score.tone.js --raw --out audio/tone.wav` 得到一层没做母带的音乐，再在 `score.mjs` 里 `S.load('audio/tone.wav')` 放进一条 bus，叠上第 1 档的音效，最后统一做母带。`scaffold.sh --audio layer` 会给出这样一份 `score.mjs`（第一行就加载 `audio/tone.wav`，后面只写音效），`build.sh` 的 `AUDIO=layer` 按这个顺序自动构建；`score.mjs` 里没有引用 `tone.wav` 时 build 会报错，免得 Tone 层渲出来却没混进去。

`build.sh` 只构建 `AUDIO=` 指定的那份 score（synth / tone / layer / none），另一份文件存在时会提示它被忽略，不会悄悄换成别的配乐。

**怎么选**：看所选风格文件里的「声音调色板」。电子、界面、复古、抽象类风格用第 1 档就够了；电影感、手作、东方、高端产品这类需要真实乐器和空间感的，用第 2 档。

## 2. 第 1 档：内置合成（session API）

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

## 3. 第 2 档：Tone.js

`score.tone.js` 是一个**浏览器 ES 模块**，和 `timeline.js` 放在一起：

```js
import { DUR, BPM, CUES, b } from './timeline.js';
export { DUR };
export default async function score(Tone, kit) {
  kit.transport.bpm.value = BPM;
  const verb = new Tone.Reverb({ decay: 2.8, wet: 0.25 }).toDestination();
  const piano = new Tone.Sampler({ urls: kit.salamander(), baseUrl: kit.baseUrl('salamander'), release: 1.2 }).connect(verb);
  await kit.loaded();                                        // 采样解码完再排音符
  piano.triggerAttackRelease(['A3', 'C4', 'E4'], b(4), 0);   // 时间用秒（从 timeline 来）
}
```

- **构建**：`node <skill>/scripts/audio.mjs build <slug>/score.tone.js`，输出 −14 LUFS 的 WAV（`--raw` 跳过母带）。`scaffold.sh <slug> --audio tone` 会拷贝一份完整示例 `score.tone.js`，并把 `build.sh` 设成 `AUDIO=tone`；两档叠用时选 `--audio layer`。
- **kit**：`DUR`、`transport`、`loaded()`、`baseUrl(pack)`、`sample(pack, file)`、`salamander()`（Salamander 钢琴的 `Sampler` urls 表）。
- **采样**：`node <skill>/scripts/audio.mjs samples` 列出可下载的包；`samples salamander` 下载 Salamander Grand Piano（CC BY 3.0，交付时要署名）。其他 CC0 / 有授权的采样可以放进 `<slug>/samples/<名字>/`，在页面里用 `/samples/<名字>/文件` 引用。不要使用来源和授权不明的采样。
- **常用部件**：`Sampler`（采样乐器）、`PolySynth(FMSynth | AMSynth | Synth)`、`MonoSynth`（贝斯）、`MembraneSynth`（底鼓）、`MetalSynth`（镲）、`NoiseSynth`；效果 `Reverb`（卷积）、`FeedbackDelay`、`PingPongDelay`、`Chorus`、`Phaser`、`Distortion`、`BitCrusher`、`Filter`、`AutoFilter`、`Compressor`、`Limiter`。
- **注意**：所有声音都要接到 `.toDestination()`（直接或经过效果链），否则渲出来是静音；时间用绝对秒数（从 `timeline.js` 来），不要依赖 `Tone.now()`；采样一定要 `await kit.loaded()` 之后再排音符。

## 4. 编曲配方（按用途给结构，按风格选配器）

**结构跟用途走，配器跟风格走**：配器看所选风格文件里的「声音调色板」（`styles/<slug>.md`）。避免通用的「钢琴 + 弦乐」。

| 用途 | 常用 BPM | 结构要点 |
|---|---|---|
| A 动效作品集 | 120–128 | 前 2 小节只有铺底和镲 → 进鼓 → drop 前一小节 riser，最后一拍静音 → drop 时 impact + crash |
| B 产品宣传短片 | 100–124 | 卖点切换处放 whoosh；高潮时全部乐器进来；落版用一个钟声加长尾音 |
| C UI 动效演示 | 110–120 | 音乐退后（gain 0.3–0.4），界面音效在前 |
| D 排版卡点 | 按曲子 / 90–140 | 重点词的前一拍静音 |
| E Logo / 片头 | — | riser → impact → 一个持续和弦或钟声，4–8 秒内完成一次起伏 |
| F 循环动图 | 60–90 或无声 | 声音也要能循环：首尾的音量和和声要一致 |
| G 数据爆点 | 120 | 滚动期间 tick 越来越密 → 落定前半拍静音 → impact |
| I 年代回顾 | 全片固定或缓慢上升 | 一首曲子贯穿全片，配器逐段升级（芯片 → 合成器 → 采样 + 大混响），高潮时全部合在一起 |

## 5. 音效对照表

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

## 6. 时间规则

- 音效的触发时间**直接用 timeline.js 里的同一个数字**，不要另外手写。
- whoosh 的峰值对准切点（`t − peak × dur`）；impact 正好落在动作那一帧。
- **drop 前留一拍（至少半拍）的静音**：鼓和铺底都停，只剩 riser 的尾巴或者什么都没有。静音之后的第一个声音必须是全片最重要的声音之一。
- 声音可以当转场：下一镜的声音提前 2–4 帧进来（J-cut），或者上一镜的尾音延续过切点（L-cut）。
- 循环片：最后一小节的混响尾巴会在片头突然断掉，最后一拍要收干净，或者把尾巴叠回片头。

## 7. 混音

- **分 bus**：drums、bass、music、sfx 至少四条，方便调整平衡。
- **侧链**：bass 和 music 的 `duck` 设 0.5–0.7，每个底鼓和撞击都 `S.duck(t)`，律动感立刻就出来了。
- **低频控制**：合成音乐的低频很容易太重。pad 和 music 加 `highpass: 150–250`；kick 的 decay 不要超过 0.45；bass 的 `sub` 控制在 0.3–0.6；低于 MIDI 48 的铺底音符不要用。
- **小喇叭**：手机外放听不到 60Hz 以下。贝斯要有 2、3 次谐波（`sub({ harm })`、`bass` 的锯齿波本来就有）。
- **空间**：混响只发送给 music 和 sfx（0.15–0.35），鼓和贝斯保持干声。
- **响度**：母带自动处理到 −14 LUFS（各大平台的标准）、真峰值 ≤ −1 dBTP。

## 8. 检查（你听不到）

每次 build 之后都要跑：

```bash
node <skill>/scripts/audio.mjs check <slug>/audio/music.wav --out <slug>/qa/music
```

它会打印：整体响度（目标 −14 ± 1 LUFS）、真峰值（< −1 dBTP）、按倍频程的能量（相对 1 kHz，粉红噪声全部为 0；一般的混音在 63–125 Hz 是 +4…+12，4–8 kHz 是 −6…−18）、意外的静音段，并给出 WARN。

**drop 前的呼吸**：在 `timeline.js` 里导出 `DROPS = [T.drop, …]`（或者临时传 `--drops 12,24.5`），check 会量出每个重拍前最后半拍比前一小节低多少 dB、重拍比前一小节高多少 dB。凹陷不到 4 dB 就 WARN「没有呼吸」，说明鼓或铺底没停，或者 riser 太响；重拍不比前一小节响也会 WARN。这是你「听」drop 的唯一办法。然后**看** `-wave.png`（有没有削顶、音量起伏是否和画面结构一致：drop 处应该最满，吸气处应该有凹陷）和 `-spectrum.png`（低频是否一直轰着、高频是否完全没有）。

成片之后，`inspect.mjs qa` 会对混好的 MP4 再检查一次。

## 9. 用户给的曲子

1. 确认授权（能不能商用，是不是用户自己的），写进交付说明。
2. `node <skill>/scripts/audio.mjs beats track.mp3 --out <slug>/audio/beats.json`（装了 librosa 时自动用 librosa 定节拍网格，更稳；`--engine js` 强制用内置算法）：得到 BPM、beats、downbeats、onset hits、每小节能量、drops（能量突增的小节）、breaks（能量突降的小节）。
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
