# 声音：配乐、音效、混音

声音是视频的另一半。同样的画面，有没有卡点的音效，观感能差一个档次。配乐和音效都用代码写，时间点从 `timeline.js` 读取，所以和画面是同一张时间表。

这份文件里的配方、曲线和词汇表是**起点和词汇，不是规定**。所选风格和对标优先，你也可以完全不用这里的写法。

目录：1 选哪一档 · 2 先定声音方向 · 3 第 1 档：内置合成（session API） · 4 第 2 档：Tone.js · 5 结构与戏剧曲线 · 6 词汇：律动、和声、配器、空间 · 7 音效对照表 · 8 时间规则 · 9 混音 · 10 检查（你听不到） · 11 用户给的曲子 · 12 声音的默认味

---

## 1. 选哪一档

| 档 | 文件 | 引擎 | 强项 | 弱项 |
|---|---|---|---|---|
| 第 1 档 · 内置合成（默认） | `score.mjs` | Node 里的合成器，零依赖、完全确定 | 电子鼓、手鼓、合成贝斯、铺底、拨弦、马林巴 / 钢片 / 卡林巴、风琴、人声铺底、FM 钟声、芯片音乐、环境底噪、lo-fi 处理、UI 音效、侧链 | 真实钢琴、弦乐、真鼓不像 |
| 第 2 档 · Tone.js | `score.tone.js` | 在无头浏览器里用 Tone.js 离线渲染（OfflineAudioContext） | 采样乐器、卷积混响、合唱 / 相位 / 失真等效果、更丰富的合成器 | 需要先下载采样；噪声类音色每次渲染略有不同 |
| 外部曲子 | 用户的音频文件 | `S.load()` | 真实制作的音乐（用户自己的、授权的、AI 音乐服务生成的） | 授权要用户负责；只能卡它的拍 |
| 无声 | — | — | 循环动图、要放进别的片子里的素材 | — |

两档可以叠：先 `audio.mjs build score.tone.js --raw --out audio/tone.wav` 得到一层没做母带的音乐，再在 `score.mjs` 里 `S.load('audio/tone.wav')` 放进一条 bus，叠上第 1 档的音效，最后统一做母带。`scaffold.sh --audio layer` 会给出这样一份 `score.mjs`（第一行就加载 `audio/tone.wav`，后面只写音效），`build.sh` 的 `AUDIO=layer` 按这个顺序自动构建；`score.mjs` 里没有引用 `tone.wav` 时 build 会报错，免得 Tone 层渲出来却没混进去。

`build.sh` 只构建 `AUDIO=` 指定的那份 score（synth / tone / layer / none），另一份文件存在时会提示它被忽略，不会悄悄换成别的配乐。

**怎么选**：看所选风格文件里的「声音调色板」。电子、界面、复古、抽象、大多数手作和玩具风格用第 1 档就够了；需要真实钢琴、弦乐和大空间的电影感、高端产品，用第 2 档或两档叠用。

## 2. 先定声音方向

声音和画面一样会落进默认值。没有方向时，合成配乐会收敛成同一首歌：A 小调、120 BPM 四踩、每个重拍 impact + crash、落版一个钟声（见第 12 节）。所以写 brief 时，把声音当作和画面同等的一条轴，**先找声音的对标**：一种曲风、一位作曲家、一部片子的配乐、一个乐队、一种民间音乐。写下学什么（律动、和声色彩、配器、结构、空间）和不学什么（旋律、采样、歌词）。

brief 里 `sound:` 可以展开成下面几项。能从风格和对标里推出来的写一个词就够，不必每项都填：

```yaml
sound:
  benchmark: [声音对标 · 学什么 · 不学什么]
  role: [音乐在这支片子里的角色：推动 / 托底 / 抢戏 / 几乎不出现，让拟音说话]
  groove: [拍号 · BPM · 直拍 / swing / half-time / 无拍]
  harmony: [调和调式 · 进行或持续音 · 色彩]
  palette: [主奏 / 节奏 / 低音 / 纹理分别用什么]
  arc: [戏剧曲线，见第 5 节]
  motif: [可选：一个 2–4 音的动机，以及它怎么变奏]
  mix: [空间大小、宽度、侧链与否、是否 lo-fi]
```

- **候选也想两三个**：和画面结构一样，第一个冒出来的声音方向往往是这个风格的陈词滥调。用一行各写两三个，选一个。
- **和自己拉开**：工作目录里有你之前做的项目时，看一眼它们 brief 里的 `sound`。除非用户要求系列统一，这一支至少在调式、律动、配器、曲线里换掉两项。
- **小样（可选）**：声音是片子的主角之一时（音乐向、卡点、没有文字的情绪片），可以在第 3 步风格帧时顺手给 2–3 段 6–8 秒的声音小样一起发给用户，比如 `audio.mjs build score.a.mjs --dur 8 --out audio/sketch-a.wav`。渲染只要几秒，你听不到，用户可以。不需要就跳过，不增加停顿点。

## 3. 第 1 档：内置合成（session API）

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

**bus 选项**：`gain`、`pan`（−1…1）、`reverb`（发送量 0–1）、`delay`（发送量）、`delayTime`（秒，默认 3/4 拍）、`duck`（侧链深度 0–1）、`duckRelease`（秒）、`highpass` / `lowpass`（Hz）、`drive`（0–1）、`crush`（位深，比如 6–12；0 = 关）、`crushRate`（降采样到多少 Hz）、`wow`（0–1，磁带的抖动和走带不稳）、`width`（0 = 单声道）。
**`bus.add(sound, t, { gain, pan })`**：t 可以为负（声音从片头之前开始，会被截掉一部分）。
**`S.duck(t, depth)`**：登记一个侧链触发点（一般跟着 kick，或者放在撞击上）。
**`S.space({ room, damp, width })`**：全片共用的混响长什么样。room 0.3（小房间）… 0.95（大厅），damp 0（亮）… 0.9（暗）。默认 `{ room: 0.84, damp: 0.3 }`。
**节奏**：`S.tempo(bpm, { beatsPerBar })`（3/4、6/8、5/4 都行）；`S.steps('x..x..x.', step = 0.25)` 把步进字符串变成拍位置（`x` 是击打，其他字符是休止，空格和 `|` 忽略）；`S.swing(n, amount = 1/3, grid = 0.5)` 把拍位置变成带 swing 的秒数（⅓ ≈ 三连音感觉，grid 0.25 是十六分 swing）；`S.humanize(t, ms = 8)` 给一个固定种子的微小时间偏移。
**和声**：`S.midi('C#4')`、`S.hz('A4')`、`S.chord(root, quality, inversion)`（maj、min、sus2、sus4、dim、aug、5、6、m6、7、9、7b9、7sus4、maj7、min7、m7b5、dim7、maj7#11、m9、maj9、add9、madd9、min11、quartal、quartal4、cluster）、`S.scale(root, name)(degree)`（major、minor、dorian、phrygian、lydian、mixolydian、locrian、harmonic、melodic、hijaz、wholetone、blues、penta、minpenta、hirajoshi、insen、gong、shang、jue、zhi、yu）。音符可以写成名字，也可以写成 MIDI 数字。

**乐器**（返回单声道 Float32Array；pad、organ、vox、whoosh、ambience 返回立体声 `{L, R}`）：

| 类别 | 函数 | 常用参数 |
|---|---|---|
| 鼓 | `kick()` | tone 48、start 165、decay 0.42、click 0.5、drive 0.35 |
| | `snare()` `clap()` | tone、decay、snappy |
| | `hat({ open })` `crash()` `tom(note)` | decay、tone |
| 手鼓 | `shaker()` `rim()` `cowbell()` | decay、tone（shaker 起音是软的，rim 是木头敲击） |
| 低音 | `bass(note, dur)` | wave 'saw'/'square'、cutoff 600、envAmt 3、sub 0.6、glideFrom、drive |
| | `sub(note, dur)` | harm 0.15（加泛音，小喇叭上也听得见） |
| 和声 | `pad(notes, dur)` | voices 5、cents 14、cutoff 1800、attack 0.5、release 1.2、wave |
| | `keys(notes, dur)` | FM 电钢琴：decay、index |
| | `organ(notes, dur)` | drawbars '888000000'（9 位拉杆，'808000004' 爵士，'888888888' 满）、click、leslie 0.4、rate |
| | `vox(notes, dur)` | vowel 'a'/'e'/'i'/'o'/'u'、voices 3、vibrato、breath（人声铺底 / 合唱感） |
| 旋律 | `pluck(note, dur)` | bright 0.55、damp（Karplus-Strong 拨弦，bright 低 + damp 高接近古琴、尼龙弦） |
| | `mallet(note, dur)` | material 'marimba'/'xylo'/'vibes'/'glock'/'kalimba'/'steel'/'wood'、bright、decay |
| | `lead(note, dur)` | wave、cutoff、vibrato、glideFrom、detune |
| | `bell(note, dur)` | ratio 3.5、index 4（FM 钟声 / 玻璃） |
| 音效 | `riser(dur)` `downlifter(dur)` | from、to、noise |
| | `whoosh(dur)` | peak 0.7：**最响的点在 peak × dur 处**，所以放在 `切点 − peak × dur` |
| | `impact()` `boom()` `reverseCymbal(dur)` | size |
| | `click()` `tick()` `pop(note)` `blip(note)` `swipe(dur)` | tone |
| | `glitch(dur)` `shimmer(dur)` | seed、bits / root |
| 环境 | `ambience(dur, { kind })` | kind 'tape'/'vinyl'/'wind'/'rain'/'room'、amount（磁带底噪、黑胶噼啪、风、雨、房间底噪） |

**底层工具**（自己做音色时用）：`osc(len, freqOrFn, wave)`、`noise(sec, seed)`、`adsr`、`expEnv`、`biquad(buf, type, cutoffOrFn, q)`、`lowpass`、`highpass`、`bandpass`、`drive`、`crush(buf, bits, rate)`、`reverse`、`fade`、`mul`、`S.SR`（48000）。`S.load(file)` 用 ffmpeg 把任何音频解码成 `{L, R}`。内置音色是素材，不是成品：改参数、换种子、叠两层、用底层工具做一个这支片子独有的声音（比如 braam、卡通哨音、笔尖刮擦），往往比直接用默认值更像「这支片子的声音」。

构建：`node <skill>/scripts/audio.mjs build <slug>/score.mjs [--out audio/music.wav] [--stems]`。母带会自动处理到 −14 LUFS，并用峰值限制器压到 −1.5 dBFS。`--stems` 会把每条 bus 单独导出到 `audio/stems/`，方便排查是哪一轨出了问题。

## 4. 第 2 档：Tone.js

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
- 钢琴不是第 2 档的唯一用法：Salamander 钢琴可以只当一层（低音区单音、高音区点缀），主体交给 FM、合唱、卷积空间这类第 1 档做不到的东西。

## 5. 结构与戏剧曲线

**结构跟用途走，配器跟风格走，曲线跟这支片子的想法走**。配器看所选风格文件里的「声音调色板」（`styles/<slug>.md`）。

下面这张表是各用途**最常见的一种做法**，基本都是「吸气 → 爆发」曲线。它可靠，但也正因为常见，换一条曲线往往更有记忆点：

| 用途 | 常用 BPM | 常见做法 |
|---|---|---|
| A 动效作品集 | 120–128 | 前 2 小节只有铺底和镲 → 进鼓 → drop 前一小节 riser，最后一拍静音 → drop 时 impact + crash |
| B 产品宣传短片 | 100–124 | 卖点切换处放 whoosh；高潮时全部乐器进来；落版用一个钟声加长尾音 |
| C UI 动效演示 | 110–120 | 音乐退后（gain 0.3–0.4），界面音效在前 |
| D 排版卡点 | 按曲子 / 90–140 | 重点词的前一拍静音 |
| E Logo / 片头 | — | riser → impact → 一个持续和弦或钟声，4–8 秒内完成一次起伏 |
| F 循环动图 | 60–90 或无声 | 声音也要能循环：首尾的音量和和声要一致 |
| G 数据爆点 | 120 | 滚动期间 tick 越来越密 → 落定前半拍静音 → impact |
| I 年代回顾 | 全片固定或缓慢上升 | 一首曲子贯穿全片，配器逐段升级（芯片 → 合成器 → 采样 + 大混响），高潮时全部合在一起 |

**戏剧曲线菜单**（可以整片一条，也可以每段一条，也可以自己发明）：

| 曲线 | 形状 | 适合 | 要点 |
|---|---|---|---|
| 吸气 → 爆发 | 铺垫 → riser → 静音 → 撞击 | 作品集、宣传、Logo | 上表那种；`DROPS` 检查专门量它 |
| 累加 | 一层一层叠，从不停 | 生长、从零到一、生成艺术、系统 | 每 2–4 小节进一个声部；高潮是「全部都在」，不是一下撞击（Reich、Bolero） |
| 抽空 | 满编 → 突然只剩一件乐器或一个音 | 反差、「只需要这一个」、产品亮相 | 抽空的那一刻就是记忆点，比 drop 更克制 |
| 波浪 | 起伏几次，没有单一高潮 | 循环、氛围、品牌情绪 | 滤波、音量、密度一起起伏 |
| 一问一答 | 画面问、声音答，或者两件乐器对话 | UI、角色、俏皮 | 动机短，回答时换配器或换音区 |
| 音画同形（mickey-mousing） | 音乐本身就是动作的声音 | 卡通、玩具、手作、定格 | 每个动作一个乐音，音高跟着运动方向走（上升的物体音高也上升） |
| 单线条 | 一件乐器从头到尾 | 极简、东方、高端、诗意 | 留白比音符多，空间感决定质感 |
| 拟音主导 | 几乎没有音乐 | 材质、产品、手作、ASMR | 声音的材质必须对得上画面的材质 |
| 倒放 | 一开场最满，然后越来越少 | 结尾落在一句话、一个字 | 最后一个声音要最干净 |

## 6. 词汇：律动、和声、配器、空间

这些是可以随手组合的词汇，不是清单。

**律动**

| 律动 | 感觉 | 第 1 档写法 |
|---|---|---|
| 四踩（four-on-the-floor） | 推进、俱乐部 | 每拍 kick，反拍 hat |
| half-time | 沉、宽、电影感 | 军鼓只在第 3 拍，kick 稀疏 |
| breakbeat | 碎、街头、能量 | kick `S.steps('x.........x.....')`，军鼓 2、4 拍加轻的 ghost note |
| shuffle / swing | 松弛、爵士、lo-fi、俏皮 | 位置用 `S.swing(n, 0.25–0.4)`；十六分 swing 用 `grid 0.25` |
| trap | 现代、紧张 | half-time 军鼓 + hat 三连音、32 分音符滚奏 |
| tresillo / clave | 热带、拉丁、舞动 | `S.steps('x..x..x.')`；3-2 son clave `S.steps('x..x..x...x.x...')` |
| 6/8 · 12/8 | 摇荡、民谣、叙事 | `S.tempo(bpm, { beatsPerBar: 6 })`，以八分音符为拍 |
| 5/4 · 7/8 | 不稳、聪明、科技 | `beatsPerBar: 5`；7/8 用 2 + 2 + 3 分组 |
| 复节奏 3 : 4 | 机械、迷幻 | 三连音琶音压在四拍上：`S.steps('xxx', 1/3)` |
| 无拍 / 自由时间 | 漂浮、东方、氛围 | 音符按画面事件放，不按网格；BPM 只给画面切点用 |

swing 和 humanize 只改声音。画面要跟着的点仍然写在 `timeline.js` 里；如果整片都 swing，就把 swing 后的时间也写进 timeline，让画面读同一个数字。

**和声**

| 色彩 | 写法 | 感觉 |
|---|---|---|
| Lydian（升 4 级） | `scale(r, 'lydian')`、`maj7#11` | 明亮、惊奇、科技（产品亮相） |
| Dorian | 小调里的大六度 | 冷静、有律动、不悲伤 |
| Mixolydian / ♭VII | I – ♭VII – IV | 开阔、乐观 |
| Phrygian / hijaz | 降 2 级 | 暗、紧张、异域 |
| 和声小调 | 升 7 级导音 | 戏剧、悬疑、古典 |
| 五声调式（宫商角徵羽）、hirajoshi、insen | `scale(r, 'shang')` 等 | 东方；用调式本身，不用陈词滥调的旋律 |
| 全音阶 | `wholetone` | 梦、失重、魔法 |
| 持续低音（pedal） | 低音不动，上面换和弦 | 张力、时间停住 |
| 四度叠置 | `chord(r, 'quartal4')` | 现代、开放、悬而未决 |
| 三度关系的大三和弦 | C → E → A♭ | 电影感、宏大揭示 |
| ♭VI – ♭VII – I | 胜利终止 | 通关、凯旋、落版 |
| 只有一个和弦 | 全片一个和弦，靠音色和密度变化 | 极简、技术感 |
| 音簇 | `chord(r, 'cluster')` | 不安、实验 |

调性从主题、品牌和情绪来，不要默认 A 小调。和弦进行也可以不循环：4 小节一句、第二句换掉最后一个和弦，就已经比一直循环有方向感。

**配器家族**

| 家族 | 第 1 档 | 第 2 档 |
|---|---|---|
| 敲击乐（马林巴、木琴、颤音琴、钢片琴、卡林巴、钢鼓、木鱼） | `mallet({ material })` | Sampler + CC0 采样 |
| 风琴 | `organ({ drawbars, leslie })` | — |
| 人声铺底 | `vox({ vowel })` | — |
| 电钢琴 / FM | `keys`、`bell` | `FMSynth`、`PolySynth` |
| 拨弦（吉他、竖琴、古琴感） | `pluck({ bright, damp })` | — |
| 钢琴 | — | Salamander |
| 手鼓 | `shaker`、`rim`、`cowbell`、高音 `tom` | `MembraneSynth`、`MetalSynth` |
| 铜管感 braam | 多个低八度锯齿叠加 + 强滤波开合 + `drive`（用底层工具） | `Distortion` + `Filter` |
| 环境、媒介 | `ambience({ kind })` | — |

**空间**：`S.space` 决定这支片子在什么地方发声（小房间、木屋、大厅）；`crush` 和 `wow` 决定它通过什么媒介传过来（游戏机、磁带、旧收音机）。同一首曲子换一个空间和媒介，气质就完全不同。

## 7. 音效对照表

音效的密度由风格决定：极简界面几乎每个动作都有声音，生成抽象可能一个都没有。需要音效时，材质要对得上：

| 画面动作 | 音效 |
|---|---|
| 元素弹出 / 出现 | `pop`（音高随元素大小变化：大元素低，小元素高）；手作、玩具风格可以用 `mallet` |
| 点击、开关、吸附 | `click`、`tick`、`rim` |
| 滑动、拖拽、卡片划过 | `swipe` |
| 转场、甩镜、穿越 | `whoosh`（峰值对准切点） |
| 重拍上的大变化、反色、落版 | `impact` + `crash`，并登记 `S.duck`；也可以是这支片子材质的「重」声音（一个低音和弦、一记木头、一团人声） |
| 吸气、蓄力 | `riser`（长度 = 一小节），以 drop 时刻结束 |
| 消散、退场 | `downlifter`、`reverseCymbal` 的反向 |
| 粒子聚合、闪光、成功 | `shimmer`、`bell`、高音区 `mallet({ material: 'glock' })` |
| 数字跳动 | `tick`（每变一次一个，太密就隔几次一个） |
| 故障、像素化、切片 | `glitch` |
| 落在某个场所（雨夜、录音棚、旧电视） | `ambience` 铺在底下 |

## 8. 时间规则

- 音效的触发时间**直接用 timeline.js 里的同一个数字**，不要另外手写。
- whoosh 的峰值对准切点（`t − peak × dur`）；impact 正好落在动作那一帧。
- **用「吸气 → 爆发」曲线时**，drop 前留一拍（至少半拍）静音：鼓和铺底都停，只剩 riser 的尾巴或者什么都没有。静音之后的第一个声音必须是全片最重要的声音之一。其他曲线有自己的重点：累加看声部进场的时机，抽空看抽掉的那一刻是否干净。
- 声音可以当转场：下一镜的声音提前 2–4 帧进来（J-cut），或者上一镜的尾音延续过切点（L-cut）。
- 循环片：最后一小节的混响尾巴会在片头突然断掉，最后一拍要收干净，或者把尾巴叠回片头。

## 9. 混音

- **分 bus**：drums、bass、music、sfx 至少四条，方便调整平衡。
- **侧链**：bass 和 music 的 `duck` 设 0.5–0.7，每个底鼓和撞击都 `S.duck(t)`，律动感立刻就出来了。但侧链的泵感是电子舞曲的签名，**是一种风格，不是默认值**。
- **低频控制**：合成音乐的低频很容易太重。pad 和 music 加 `highpass: 150–250`；kick 的 decay 不要超过 0.45；bass 的 `sub` 控制在 0.3–0.6；低于 MIDI 48 的铺底音符不要用。
- **小喇叭**：手机外放听不到 60Hz 以下。贝斯要有 2、3 次谐波（`sub({ harm })`、`bass` 的锯齿波本来就有）。
- **空间**：混响只发送给 music 和 sfx（0.15–0.35），鼓和贝斯保持干声。
- **响度**：母带自动处理到 −14 LUFS（各大平台的标准）、真峰值 ≤ −1 dBTP。

**混音哲学跟风格走**（下面是几种方向，不是全部）：

| 方向 | 做法 |
|---|---|
| 俱乐部 / 电子舞曲 | 侧链泵感、低频饱满、宽 |
| 电影 | 宽、大空间（`S.space({ room: 0.9 })`）、不侧链；动态要大，安静段真的安静 |
| 原声 / 手作 | 不侧链、小房间（`room: 0.5`）、近距离、保留瞬态 |
| lo-fi | 鼓 bus `crush: 10–12` + `lowpass: 6000–9000`；music `wow: 0.3–0.6`；底下铺 `ambience` tape 或 vinyl；`width` 可以收到 0.6 |
| 芯片 / 像素 | 干声、单声道或硬声像，`crush: 4–6`、`crushRate: 11000–22000` |
| 极简 / 科技 | 干、精确、留大量静音；混响短而亮（`room: 0.5, damp: 0.1`） |
| 东方 / 写意 | 大混响（发送 0.4–0.5）、少声部、长留白，不侧链 |

## 10. 检查（你听不到）

每次 build 之后都要跑：

```bash
node <skill>/scripts/audio.mjs check <slug>/audio/music.wav --out <slug>/qa/music
```

它会打印：整体响度（目标 −14 ± 1 LUFS）、真峰值（< −1 dBTP）、按倍频程的能量（相对 1 kHz，粉红噪声全部为 0；一般的混音在 63–125 Hz 是 +4…+12，4–8 kHz 是 −6…−18）、意外的静音段，并给出 WARN。频段的典型值以电子混音为参照：原声、单线条、东方这类刻意轻盈的片子低频偏少是正常的，看到「thin」时确认是不是有意为之就行。

**drop 前的呼吸**：在 `timeline.js` 里导出 `DROPS = [T.drop, …]`（或者临时传 `--drops 12,24.5`），check 会量出每个重拍前最后半拍比前一小节低多少 dB、重拍比前一小节高多少 dB。凹陷不到 4 dB 就 WARN「没有呼吸」，说明鼓或铺底没停，或者 riser 太响；重拍不比前一小节响也会 WARN。这是你「听」drop 的唯一办法。不用「吸气 → 爆发」曲线的片子不必写 `DROPS`。然后**看** `-wave.png`（有没有削顶、音量起伏是否和画面结构、所选曲线一致：drop 曲线在 drop 处最满、累加曲线一路变厚、抽空曲线在抽空处断崖）和 `-spectrum.png`（低频是否一直轰着、高频是否完全没有）。

成片之后，`inspect.mjs qa` 会对混好的 MP4 再检查一次。

## 11. 用户给的曲子

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

## 12. 声音的默认味

和 craft.md 第 11 节画面的禁止清单一样，这些是没有方向时最容易出来的声音。不是不能用，是不要**不假思索地**用：

| 默认味 | 为什么同质 | 换成 |
|---|---|---|
| A 小调 i – VI – III – VII（Am – F – C – G） | starter 和训练数据里最常见的进行 | 按主题选调和调式（第 6 节）；持续低音、四度叠置、三度关系 |
| 每支片都是 100–128 BPM 四踩 + 反拍 hat + 2、4 拍拍手 | 电子舞曲的默认骨架 | half-time、breakbeat、swing、6/8、5/4、无拍 |
| 每个重拍都 impact + boom + crash | 冲击贬值，所有片子是同一个「砰」 | 只给最重要的 1–2 个；其余用这支片子材质的声音（木头、纸、玻璃、人声、一个和弦） |
| 「riser → 静音 → drop」是唯一的曲线 | 每支片子的情绪形状一样 | 第 5 节的其他曲线 |
| 落版 = 钟声 + shimmer 长尾 | 所有结尾听起来一样 | 动机的最后一个音、一个干声、一下环境声，或者直接切黑 |
| 锯齿 pad 当万能铺底 | 合成器的「出厂音色」 | `vox`、`organ`、`mallet` 滚奏、`ambience`、持续低音 |
| 所有 bus 都侧链、music 都 highpass 180、同一个混响 | 同一种泵感，同一个房间 | 第 9 节的混音哲学；`S.space` |
| 内置音效原样直接用 | 和别的片子同一套 whoosh、impact | 改 from / to / peak / seed、叠层、用底层工具按画面材质自制 |
| 没有动机 | 听完记不住 | 一个 2–4 音的动机，贯穿全片变奏（换配器、换节奏、倒影） |

**例外**：风格或对标本身就是这样（synthwave 就是四踩 + 门控军鼓 + 锯齿铺底，预告片就是 riser + braam），或者用户明确要求。这时它是风格的签名，不是默认味。
