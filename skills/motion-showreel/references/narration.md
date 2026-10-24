# 口播：用户稿件、真实时间轴与混音

有口播时，先准备口播音频和句段时间轴，再制作画面，最后配 BGM 和音效。画面按口播的实际节奏展开；音乐拍点只用于合适的停顿和转场。

口播有三种选择：无口播、TTS 朗读用户稿件、用户提供录音。**TTS 的稿件必须由用户提供；Agent 不代写、不改写，也不能把自己生成的文字标成用户稿件。** `--source user` 是执行者对来源的声明，工具会记录文件和哈希，但不能代替核实来源。普通视觉文案与旁白稿要分清。

工具要求 Node 18+、ffmpeg、ffprobe。不依赖其他 Skill，不需要新增 npm 包。凭据只通过环境变量读取，不写入 brief、时间轴、日志或交付源码。模型和音色由用户配置，通过 `--model` / `--voice` 或相应环境变量传入。

## 1. TTS 只朗读用户稿件

```sh
node <skill>/scripts/narration.mjs tts <project> \
  --script <user-script.txt> --source user \
  --provider gemini --model <available-tts-model> --voice <voice>
```

TXT 按句末标点、换行和长度拆段，不增删词句。用户需要控制段落时，用 JSON：

```json
{
  "source": "user",
  "segments": [
    {"id": "intro", "text": "用户提供的第一段原文。"},
    {"id": "detail", "text": "用户提供的第二段原文。"}
  ]
}
```

默认每段最多 500 字符，可用 `--max-chars 20..3000` 调整。JSON 的长段需先拆分，保留原文。较短分段更易恢复、更易修改，也有助于得到可靠的段落边界；拆得过碎可能影响朗读连贯性，需实际试听。

合成成功后得到：

- `audio/narration.wav`：统一为 48 kHz、双声道 PCM。
- `audio/narration.json`：稿件来源、实际音频时长和句段时间轴。
- `audio/narration-cache/`：分段音频及校验哈希。缓存由原文、adapter、model、voice 和影响声音的配置共同决定；改一段只重做该段，改变音色会重做相关片段。坏缓存会重建。

请求串行执行，临时网络错误、429 和服务端错误最多重试两次，可通过 `--retries 0..5` 调整。失败保留已完成的片段；修复配置后运行原命令即可恢复。合成结果发布前校验每段真实时长与拼接后总时长，不按字数猜测时间。建议同时传入 `--duration <确认的片长秒数>`：每段完成即检查累计时长，超出目标或 1200 秒上限就停止后续请求、保留缓存并要求先解决冲突；已经发出的这一段不能撤销收费。实际口播短于目标时，先确认是否保留片头、片尾或停顿，再制作这些画面，不默默填满。

```json
{
  "source": {"type": "user-script", "provenance": "user-provided", "file": "user-script.txt", "sha256": "…"},
  "alignment": "tts-segments",
  "duration": 8.126,
  "file": "audio/narration.wav",
  "segments": [
    {"id": "intro", "text": "用户原文。", "start": 0, "end": 3.418, "file": "audio/narration-cache/….wav"},
    {"id": "detail", "text": "用户下一段原文。", "start": 3.418, "end": 8.126, "file": "audio/narration-cache/….wav"}
  ],
  "missing": []
}
```

时间戳单位为秒，依据实际合成音频累加，包含该片段内的呼吸和停顿。`tts-segments` 表示逐段合成边界，不宣称字级对齐。句段为同步提供锚点，不要求一句一个镜头；动作和镜头可跨句连续发展，把真实事件写进 `timeline.js` 并让画面与音效共用。正式 `render(t)` 只读传入时间；带声音预览可以用音频播放时间驱动它，但不能让实时音频状态参与离线渲染。

### 关键词事件：只使用有依据的时间

`scaffold.sh` 会复制纯模块 `narration.js`。无词级时间时，原有句段流程继续可用。需要关键词同步时，给对应 segment 保留转录工具输出的词边界，或人工听后标注 `anchors`：

```json
{
  "id": "s1", "text": "靠近，然后汇合。", "start": 0, "end": 4,
  "anchors": [{ "text": "汇合", "start": 2.2, "end": 2.7 }]
}
```

上述秒数仅为结构示例，实际必须来自该音频的人工标注。ASR 词时间使用 `wordTimingSource: "asr"` 和 `words: [{"text":"…","start":0.2,"end":0.8}]`；词序列需覆盖对应原句，工具不补字、不均摊。

```js
import { narrationClock } from './narration.js';
const N = narrationClock(narrationData);
export const MERGE = N.at('s1', '汇合');
// 页面中的主动作和 score 中的音效都引用 MERGE，不分别手写秒数。
// N.end(id, keyword) / N.range(id, keyword) 查询末尾或区间。
// 同一 segment 内重复的关键词必须显式选 { occurrence: 2 }，从 1 开始。
// 全片第几次出现需先定位所属 segment，不能直接当作段内 occurrence。
```

`N.segment(id)` 总能使用有效句段边界；`at/end/range` 缺词时间、存在歧义或关键词落在无真实边界的词内部时会报错。此时补人工锚点或改用句级动作，不伪造逐字同步。关键词事件是时间数据，不强制在该词切镜；镜头可提前建立上下文，事件触发主体变化。

### Gemini

所需环境变量为 `GEMINI_API_KEY`；可选 `GEMINI_TTS_MODEL`、`GEMINI_TTS_VOICE`、`GEMINI_TTS_BASE_URL`。使用 REST `models/<model>:generateContent`。当前 voice schema 与旧模型的 `prebuiltVoiceConfig` 都已适配；2.5 / 3.1 自动采用旧格式，其他模型采用 `voiceConfig.voice`，可用 `GEMINI_TTS_SCHEMA=legacy|voice` 显式切换。可处理 WAV 容器和旧模型返回的 24 kHz、16 位单声道 PCM；PCM 会先封装为 WAV，再交给 ffmpeg。[Gemini 官方接口](https://ai.google.dev/gemini-api/docs/generate-content/speech-generation)

模型支持随账号和服务变化；传入用户可用的模型与音色，先做一小段连通性和试听检查。工具只把提供的文本发给 TTS，不调用语言模型生成或润色稿件。云端朗读是否漏读、重复或读错词，仍需试听核对。

### MiniMax

所需环境变量为 `MINIMAX_API_KEY`；可选 `MINIMAX_TTS_MODEL`、`MINIMAX_TTS_VOICE`、`MINIMAX_TTS_SPEED`。默认 endpoint 是 `https://api.minimax.io/v1/t2a_v2`；中国区或兼容网关用 `MINIMAX_TTS_URL` 指定完整 URL，例如 `https://api.minimaxi.com/v1/t2a_v2`。使用非流式 hex 音频，不依赖 mmx CLI；会检查业务状态再解码。[MiniMax 官方接口](https://platform.minimax.io/docs/api-reference/speech-t2a-http)

两个内置 adapter 都支持 `SHOWREEL_TTS_TIMEOUT_MS` 调整单次请求超时，默认 90000 ms。远程 endpoint 必须 HTTPS；本地 HTTP 仅用于 localhost 测试。

### 自定义 provider

把 `--provider` 指向一个可信本地 `.mjs` 文件，它需要导出：

```js
export async function synthesize({ text, outFile, model, voice }) {
  // 读取自己的环境凭据；将可解码音频写到 outFile。
  // outFile 是临时 .bin 路径；输出 WAV/MP3 时需显式指定格式。
  // 失败抛错；明确不可重试时设置 error.retryable = false。
}
```

不要在 adapter 中打印 key、Authorization 或完整请求。工具不会输出 adapter 抛出的原始错误。adapter 代码、model、voice 都参与缓存；其他影响声音的配置变化时，更新 `SHOWREEL_TTS_CACHE_VERSION` 使缓存失效。

## 2. 导入用户录音

已有句段字幕或转录时间戳时：

```sh
node <skill>/scripts/narration.mjs import <project> \
  --audio <user-voice.wav> --timestamps <voice.srt>
```

支持 SRT，或 `[{"id":"a","text":"真实录音中的一句话","start":0.3,"end":2.8}]` 形式的 JSON，也接受 `{ "segments": [...] }`。时间戳必须递增、不重叠且位于音频范围内；JSON 数值单位是秒。`voice.wav` 旁存在 `voice.srt` 或 `voice.segments.json` 时会自动发现。

有可用的 ASR 时，可传可信本地 adapter：

```sh
node <skill>/scripts/narration.mjs import <project> \
  --audio <user-voice.wav> --transcriber </absolute/asr-adapter.mjs>
```

adapter 契约：

```js
export async function transcribe({ file }) {
  // file 是规范化后的真实录音；调用已获授权的 ASR 或本地转录工具。
  return { segments: [{ id: 'a', text: '实际转录结果', start: 0.3, end: 2.8 }] };
}
```

ASR 必须返回真实文本与时间戳。工具会验证范围，标为 `asr-timestamps`；转录准确性仍需核对。**本 Skill 不内置 ASR 模型或账号，也不会假称运行过转录。** 如果已有本地 Whisper，可先执行 `whisper <user-voice.wav> --output_format json --output_dir <project>/audio/transcription`，再把生成的 JSON 作为 `--timestamps` 导入；需确保 Whisper 已安装且模型可用。

没有时间戳或可用 ASR 时，仍可导入音频：

```sh
node <skill>/scripts/narration.mjs import <project> --audio <user-voice.wav>
```

结果明确记录 `alignment: "unresolved"`、`missing: ["sentence-timestamps"]`，只保留整段录音范围，`text` 为空。此时**不能开始宣称按句对齐的画面制作**。下一步是补 SRT/JSON、配置实际可用的 ASR，或由用户人工标注句段切点；不能用字数估时伪装成实测时间戳。音频已导入和语义时间轴已就绪是两个不同状态。

如果录音长度与用户要求的时长冲突，向用户确认修改哪一项，不自动截断或加速人声。

## 3. BGM、音效、人声分别混音

BGM 和音效各自选择 `ai`、`user` 或 `none`，允许混用。代码合成的音乐/音效属于 `ai`；用户交付的文件属于 `user`。两者必须分别提供文件，不能把未分轨的混音称为可独立控制的音乐和音效。

```sh
node <skill>/scripts/narration.mjs mix <project> \
  --bgm <project>/audio/music.wav --bgm-source ai \
  --sfx <project>/audio/sfx.wav --sfx-source user \
  --duration <timeline-DUR-seconds>
```

人声默认读取 `audio/narration.json` 指定的文件；`--narration <file>` 可指定其他录音。关闭任意一轨：

```sh
node <skill>/scripts/narration.mjs mix <project> \
  --bgm <project>/audio/music.wav --bgm-source user \
  --sfx none --sfx-source none --narration none --duration 30
```

完全无声时，三轨都选 `none` 并传时长。仅有音效或仅有口播也可以。

工具生成 `audio/final.wav` 和 `audio/mix.json`。音乐默认 gain 0.35，音效默认 0.5；通过 `--bgm-gain` / `--sfx-gain` 调整。在已知口播区间，BGM 和音效额外降低 16 dB（`--duck-db -16` 可调），镜头边界附近保留少量提前与延后空间，邻接区间合并以避免频繁抽动。时间戳未就绪时，在整段录音期间保守降低其他两轨，不声称按句避让。

除增益外，**编排本身也要收敛**：有口播时减少连续音效、密集鼓点和抢人声的旋律，把重音效放在停顿或段落交界。工具的音量避让不能代替这一步。

混音采用流式 ffmpeg，统一采样率、限制峰值、处理整体响度并校验时长。输入音乐与音效不足时补静音，不暗自循环。片长最多 1200 秒；口播超出目标片长会失败，要求先解决时长冲突。最终响度、真峰值和人声清晰度仍需通过音频检查与试听确认。

将 `audio/final.wav` 交给渲染工具的 `--audio` 或新的 build 配置进行封装。未开启口播和独立混音时，旧 `audio.mjs` / score 工作方式不变。

## 4. 验证

有口播时，在画面制作前检查时间轴，混音后再带最终音频检查一次：

```sh
node <skill>/scripts/narration.mjs check <project> --duration <timeline-DUR-seconds>
node <skill>/scripts/narration.mjs check <project> --duration <timeline-DUR-seconds> --audio <project>/audio/final.wav
```

结果写入 `audio/narration-qa.json`；缺少真实文本时间戳、音频被替换、口播被目标时长截断或最终混音长度不符，都会返回失败退出码。混音记录包含各输入和最终输出的 SHA-256；即使路径和时长不变，替换口播后也必须重新混音，旧成片音轨不能通过验收。句段之间的真实停顿可以保留，不要求每秒都有文本。字词是否读对、转录是否准确和声音是否好听仍需人工审片。

```sh
node --test <skill>/scripts/test/narration.test.mjs
```

测试使用 mock provider / ASR 和真实 ffmpeg，验证来源限制、Gemini PCM/WAV、MiniMax hex、重试、缓存失效、录音导入、时间戳验证、独立关闭音轨和人声区间的实际衰减，不调用付费 API。真实账号的连通性、可用模型与音色，需使用用户提供的 API 配置单独验证；不能把 mock 测试称作线上验证。
