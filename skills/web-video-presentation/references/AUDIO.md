# 音频合成

把 `script.md` / `outline.md` 的口播文字按 **step 颗粒度**合成音频文件，
落到 `presentation/public/audio/<chapter-id>/<step-N>.mp3`。

默认用 **MiniMax CLI（`mmx-cli`）**。本机没装就**询问用户**用什么 TTS，
不要悄悄假装合成成功。

## 文件命名约定

```
presentation/public/audio/
├── coldopen/
│   ├── 1.mp3
│   ├── 2.mp3
│   ├── 3.mp3
│   └── 4.mp3
├── hook/
│   ├── 1.mp3
│   └── ...
└── arena/
    └── ...
```

- 章节子目录名 = `outline.md` 里的 `<chapter-id>`
- 文件名 = `<step-N>.mp3`（1-indexed，对齐 outline 描述里的 "step 1"）
- 格式默认 mp3。如果 TTS 后端只能出 wav，加一步用 `ffmpeg` 转换

## 标准流程

### 1. 检测 mmx-cli

```bash
which mmx
```

- 找到 → 走 [2.A](#2a-mmx-cli-合成)
- 没找到 → 走 [2.B](#2b-退化路径)

### 2.A mmx-cli 合成

#### 鉴权检查

```bash
mmx auth status   # 或运行任意命令看是否报缺 key
```

未登录 → 提示用户：

```
你的 mmx-cli 未登录。请运行：
  mmx auth login --api-key sk-xxxxx
（API key 在 https://platform.minimaxi.com 获取）
```

登录前**不要继续**。

#### 抽取每 step 的文字

从 `outline.md` 的"口播节选"或回到 `script.md` 按 `---` 分块抽出每个
step 对应的台词。如果 `outline.md` 的"口播节选"太精炼，**优先用
`script.md` 的原文**完整段落，因为节选是给视觉策划看的、不是配音用的。

把抽取结果落到中间文件 `audio-segments.json`（方便 review 和重跑）：

```json
[
  { "chapter": "coldopen", "step": 1, "text": "一个激动人心的消息..." },
  { "chapter": "coldopen", "step": 2, "text": "这是真的吗？当然是假的。" },
  ...
]
```

让用户**先扫一眼这个 json**，确认切分对不对，再开始烧 token 合成。

#### 调用 mmx 合成

每条调一次：

```bash
mmx speech synthesize \
  --text "一个激动人心的消息..." \
  --out presentation/public/audio/coldopen/1.mp3
```

写一个简单的 shell 循环或 node script 跑完所有条目。建议**串行**而不是
并行 —— TTS 服务通常有 rate limit，并行容易触发限流且难调试。

每条合成完打印一条进度：

```
[3/24] coldopen/3.mp3   ✓ 4.2s
```

#### 校验

合成完后跑：

```bash
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 \
  presentation/public/audio/coldopen/1.mp3
```

把每条的实际秒数收到一张表，和 outline.md 的 step 节奏对照：

```
coldopen/1   3.8s   (设计期望 ~5s)   ✓
coldopen/2   12.1s  (设计期望 ~5s)   ⚠ 太长，建议拆分这一步
coldopen/3   4.5s   (设计期望 ~3s)   ⚠ 略长
...
```

把异常那几条单独标出来给用户，让他决定**改稿子重合**还是**调整 step
节奏**。

### 2.B 退化路径（mmx-cli 没装）

不要假装能合成。问用户：

```
本机没检测到 mmx-cli。我可以：

  1. 帮你安装 MiniMax CLI（推荐）
     需要：npm 全局安装 + 一个 API key
     运行：npm install -g mmx-cli && mmx auth login --api-key sk-xxxxx
     API key 在 https://platform.minimaxi.com 获取

  2. 用其它 TTS（你来提供）
     告诉我用什么 —— OpenAI TTS / 阿里云 / Azure / ElevenLabs / 其它
     最好附上调用方式（CLI 命令 / API endpoint + 参数）
     我按 outline.md 切分文字、按文件命名约定输出 mp3

  3. 暂时跳过
     稿子和 outline 都在，你自己用任意 TTS 录制即可
```

如果用户选 2，等他给出工具调用方式后，按相同的"切分 → 串行调用 → 落盘
→ 校验"流程做。

## 用户自带 TTS 的最小契约

任何 TTS 后端只要满足三个能力即可接进来：

| 能力 | 输入 | 输出 |
|---|---|---|
| 单段合成 | 一段文字（≤ 5000 字符）+ 音色 id（可选） | 一个 mp3 / wav 文件 |
| 错误反馈 | —— | 失败时明确报错（rate limit / auth / 内容审核 / 网络） |
| 输出可指定路径 | 目标文件路径 | 直接写到该路径 |

不满足"输出可指定路径"的 API（比如返回二进制流）就在外面包一层 curl /
node script 把响应写到目标路径。

## 故障排查

| 现象 | 原因 / 修法 |
|---|---|
| `mmx: command not found` | `npm install -g mmx-cli`；npm 全局 bin 不在 PATH 时 `npm config get prefix` 看一下 |
| `401 / unauthorized` | `mmx auth login --api-key sk-xxxxx` 重新登录 |
| 中间断了几条没合成 | 重跑时跳过已存在的文件：合成前 `[ -f $out ] && continue` |
| 中文音色不自然 | mmx 默认音色未必最佳；查 `mmx speech --help` 看 `--voice-id` 可选项 |
| 整段合成被截断 | 单段过长（mmx 默认上限约 5000 字符）。先按句号 `。!？` 拆短再合成、最后用 ffmpeg 拼回去 |

## 相关链接

- mmx-cli 仓库：<https://github.com/MiniMax-AI/cli>
- 官方文档：<https://platform.minimaxi.com/docs/token-plan/minimax-cli>
- 参数 / 音色查询：`mmx speech --help`
