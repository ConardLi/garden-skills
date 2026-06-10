# TTS Providers

`synthesize-audio.sh` 是 provider-agnostic 的 runner —— 它自己不知道
怎么调任何 TTS，只知道循环 `audio-segments.json`、跳过已存在文件、
打印进度。

**每个 provider 是这个目录下的一个 `.sh` 文件**，定义一个
`tts_synthesize` 函数（必需），以及可选的 `tts_check` 和
`tts_install_help`。runner 根据 `PRESENTATION_TTS` 环境变量加载对应文件。

---

## 怎么用

```bash
# 默认（minimax）
npm run synthesize-audio

# 换 provider
PRESENTATION_TTS=openai npm run synthesize-audio
npm run synthesize-audio -- --provider=elevenlabs

# 指定音色（每个 provider 自己解析）
PRESENTATION_TTS_VOICE=alloy npm run synthesize-audio
npm run synthesize-audio -- --voice=zh-CN-YunxiNeural

# 强制全部重合成
npm run synthesize-audio -- --force
```

`--provider` 和 `--voice` 的命令行参数会覆盖 env var。

---

## 内置 provider

| 文件 | 后端 | 鉴权 | 备注 |
|---|---|---|---|
| `minimax.sh` | MiniMax `mmx` CLI | `mmx auth login --api-key` | **默认**；中文口播质量稳 |
| `openai.sh` | OpenAI Audio Speech API | `OPENAI_API_KEY` env var | curl-based；多数 agent 已有 key |
| `mimo.sh` | MiMo-V2.5-TTS API | `MIMO_API_KEY` env var | curl-based；9 preset voices；中文口播强 |

只内置这两个 —— 我们不替你做更多技术选型。其它后端的代码片段在下面，
复制到 `tts-providers/<name>.sh` 即可启用。

---

## 怎么加你自己的 TTS

1. 在这个目录建 `<name>.sh`（小写、kebab-case）
2. 实现 `tts_synthesize text out_path [voice]`（必需）
3. 可选实现 `tts_check`（启动前校验环境）和 `tts_install_help`（失败时打印怎么修）
4. `PRESENTATION_TTS=<name> npm run synthesize-audio`

---

## 三函数契约

### `tts_synthesize <text> <out_path> [<voice>]` （required）

把一段文字写成 mp3 / 任意 web 可播的音频文件到 `<out_path>`。

| 参数 | 说明 |
|---|---|
| `$1` | 要合成的文本（已是 UTF-8 字符串，可能包含中英文混排和标点） |
| `$2` | 目标文件绝对路径（runner 已 `mkdir -p` 它的父目录），扩展名 `.mp3` |
| `$3` | 音色 id（可能为空字符串，provider 自行决定默认） |

成功 → exit 0 并把音频写到 `$2`。失败 → 非零退出（runner 会标 FAILED 继续下一段，不会终止全局合成）。

> 如果 backend 只能出 wav / ogg，自己在函数末尾用 `ffmpeg` 转一下：
> `ffmpeg -y -i tmp.wav -codec:a libmp3lame -qscale:a 2 "$out" >/dev/null 2>&1`

### `tts_check` （optional）

启动时被 runner 调一次（不是每段）。检查 CLI 是否装、API key 是否设、auth 是否通。
未就绪 return 非零，runner 会立刻终止并打印 `tts_install_help`。

### `tts_install_help` （optional）

`tts_check` 失败时被 runner 调，往 stderr 打印怎么装 / 怎么登录 / 在哪拿 key。

---

## 常见 TTS 后端的现成片段

下面**不是**内置 provider —— 是你自己写 `tts-providers/<name>.sh` 时
可以**直接抄过去**的代码片段。复制 → 保存为 `<name>.sh` → 调通了
就 `PRESENTATION_TTS=<name>` 用。

> 大多数云 TTS 的 API key 通过环境变量传入（例如 `OPENAI_API_KEY`、
> `ELEVENLABS_API_KEY`）。把 `export` 加到你的 shell rc，或在
> 同目录放一个 git-ignored 的 `.env` 文件并 `set -a; source .env; set +a`。

### OpenAI TTS

**已内置** —— 直接看 [`openai.sh`](./openai.sh)。
该文件也是写 HTTP-based provider 的**官方参考实现**：jq 构造 JSON
payload、curl `-fsS` 提交、可选 base URL（接 Azure-OpenAI / 代理）、
可选 model env var、空音色 fallback 到默认值。新接 REST API 的
provider 直接抄它起手最快。

启用：

```bash
export OPENAI_API_KEY=sk-...
PRESENTATION_TTS=openai npm run synthesize-audio
# 用 HD 模型 + 别的音色
OPENAI_TTS_MODEL=tts-1-hd npm run synthesize-audio -- --provider=openai --voice=nova
```

### MiMo-V2.5-TTS

**已内置** —— 直接看 [`mimo.sh`](./mimo.sh)。
基于 MiMo-V2.5-TTS 的 OpenAI 兼容协议，curl + jq 构造 payload，
返回 base64 编码的 WAV 音频，ffmpeg 转 mp3。

启用：

```bash
export MIMO_API_KEY=tp-...
PRESENTATION_TTS=mimo npm run synthesize-audio
# 指定中文音色
PRESENTATION_TTS=mimo npm run synthesize-audio -- --voice=茉莉
# 切换到新加坡集群
MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1 \
  PRESENTATION_TTS=mimo npm run synthesize-audio
```

9 个预置音色：冰糖 / 茉莉 / 苏打 / 白桦（中文）、Mia / Chloe / Milo / Dean（English）、mimo_default（集群默认）。

### ElevenLabs — `tts-providers/elevenlabs.sh`

```bash
# Docs:   https://elevenlabs.io/docs/api-reference/text-to-speech
# Env:    ELEVENLABS_API_KEY=...
# Voice:  pass voice ID; "Rachel" default is 21m00Tcm4TlvDq8ikWAM
# Model:  eleven_multilingual_v2 supports Chinese; eleven_turbo_v2_5 cheaper

tts_check() {
  command -v curl >/dev/null || { echo "✗ curl not found" >&2; return 1; }
  command -v jq   >/dev/null || { echo "✗ jq not found"   >&2; return 1; }
  [[ -n "${ELEVENLABS_API_KEY:-}" ]] || { echo "✗ ELEVENLABS_API_KEY not set" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
Set your ElevenLabs key first:
  export ELEVENLABS_API_KEY=...       # get one at https://elevenlabs.io
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-21m00Tcm4TlvDq8ikWAM}"
  local payload
  payload=$(jq -n --arg t "$text" \
    '{text:$t, model_id:"eleven_multilingual_v2"}')

  curl -fsS -o "$out" -X POST \
    "https://api.elevenlabs.io/v1/text-to-speech/$voice" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload"
}
```

### edge-tts — `tts-providers/edge-tts.sh`（免费 / 无 API key）

```bash
# Docs:   https://github.com/rany2/edge-tts
# Install: pip install edge-tts
# Voices: edge-tts --list-voices
#   zh-CN-YunxiNeural     (男声)
#   zh-CN-XiaoxiaoNeural  (女声)
#   en-US-AriaNeural      (英文女声)
#   en-US-GuyNeural       (英文男声)

tts_check() {
  command -v edge-tts >/dev/null || { echo "✗ edge-tts not found" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
Install edge-tts (free, uses Microsoft Edge's TTS backend, no API key):
  pip install edge-tts
List available voices:
  edge-tts --list-voices | less
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-YunxiNeural}"
  edge-tts --text "$text" --voice "$voice" --write-media "$out" >/dev/null 2>&1
}
```

### macOS `say` — `tts-providers/say.sh`（离线 / 兜底）

```bash
# 系统自带，零依赖，适合 CI 跑通流程 / 离线预览。
# 中文音色：Tingting / Sinji / Meijia（看 `say -v ?` 全列表）
# 输出是 aiff，要 ffmpeg 转 mp3（Auto 模式 audio 标签默认认 mp3）。

tts_check() {
  command -v say     >/dev/null || { echo "✗ 'say' not available (macOS only)" >&2; return 1; }
  command -v ffmpeg  >/dev/null || { echo "✗ ffmpeg not found (brew install ffmpeg)" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
macOS-only provider. Needs ffmpeg for aiff→mp3:
  brew install ffmpeg
List voices:  say -v ?
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-Tingting}"
  local tmp
  tmp=$(mktemp -t tts).aiff
  say -v "$voice" -o "$tmp" "$text" \
    && ffmpeg -y -i "$tmp" -codec:a libmp3lame -qscale:a 2 "$out" >/dev/null 2>&1
  local code=$?
  rm -f "$tmp"
  return $code
}
```

### Azure Speech — `tts-providers/azure.sh`

```bash
# Docs:    https://learn.microsoft.com/azure/ai-services/speech-service/rest-text-to-speech
# Env:     AZURE_SPEECH_KEY=...   AZURE_SPEECH_REGION=eastus
# SSML payload — Azure requires SSML, not plain JSON

tts_check() {
  command -v curl >/dev/null || { echo "✗ curl not found" >&2; return 1; }
  [[ -n "${AZURE_SPEECH_KEY:-}"    ]] || { echo "✗ AZURE_SPEECH_KEY not set"    >&2; return 1; }
  [[ -n "${AZURE_SPEECH_REGION:-}" ]] || { echo "✗ AZURE_SPEECH_REGION not set" >&2; return 1; }
}

tts_install_help() {
  cat <<'EOF' >&2
Set Azure Speech credentials:
  export AZURE_SPEECH_KEY=...
  export AZURE_SPEECH_REGION=eastus   # or your resource's region
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-YunxiNeural}"
  local lang="${voice%%-*}-${voice#*-}"; lang="${lang%%-*}-${lang#*-}"  # "zh-CN"
  local ssml="<speak version='1.0' xml:lang='$lang'><voice xml:lang='$lang' name='$voice'>$(printf '%s' "$text" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g')</voice></speak>"

  curl -fsS -o "$out" -X POST \
    "https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1" \
    -H "Ocp-Apim-Subscription-Key: $AZURE_SPEECH_KEY" \
    -H "Content-Type: application/ssml+xml" \
    -H "X-Microsoft-OutputFormat: audio-24khz-48kbitrate-mono-mp3" \
    -H "User-Agent: web-video-presentation" \
    --data-binary "$ssml"
}
```

### Google Cloud TTS — `tts-providers/gcloud.sh`

```bash
# Docs:   https://cloud.google.com/text-to-speech/docs/reference/rest
# Auth:   easiest is `gcloud auth application-default login`
#         (or set GOOGLE_APPLICATION_CREDENTIALS to a service-account json)
# Voices: zh-CN-Wavenet-A / zh-CN-Neural2-A / en-US-Neural2-J etc.

tts_check() {
  command -v curl   >/dev/null || { echo "✗ curl not found" >&2; return 1; }
  command -v jq     >/dev/null || { echo "✗ jq not found" >&2; return 1; }
  command -v base64 >/dev/null || { echo "✗ base64 not found" >&2; return 1; }
  command -v gcloud >/dev/null || { echo "✗ gcloud not found" >&2; return 1; }
  gcloud auth application-default print-access-token >/dev/null 2>&1 || {
    echo "✗ gcloud is not authenticated (run: gcloud auth application-default login)" >&2
    return 1
  }
}

tts_install_help() {
  cat <<'EOF' >&2
Install gcloud SDK and authenticate:
  https://cloud.google.com/sdk/docs/install
  gcloud auth application-default login
  gcloud services enable texttospeech.googleapis.com
EOF
}

tts_synthesize() {
  local text="$1" out="$2" voice="${3:-zh-CN-Wavenet-A}"
  local lang="${voice%-*}"; lang="${lang%-*}"  # "zh-CN"
  local token
  token=$(gcloud auth application-default print-access-token)

  local payload
  payload=$(jq -n --arg t "$text" --arg v "$voice" --arg l "$lang" \
    '{input:{text:$t}, voice:{languageCode:$l, name:$v}, audioConfig:{audioEncoding:"MP3"}}')

  curl -fsS -X POST https://texttospeech.googleapis.com/v1/text:synthesize \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "$payload" \
    | jq -r '.audioContent' | base64 -d > "$out"
}
```

---

## 设计要点（自己写 provider 时记住）

1. **`set -e` 友好**：runner 用 `set -euo pipefail`，所以你的函数里要么明确处理失败，要么让命令自然非零退出。不要吞错误。

2. **静默成功，喧闹失败**：成功时不打印任何东西到 stdout（runner 自己打进度条）；失败时往 stderr 打详细原因。把 CLI 工具的 stdout 重定向到 `/dev/null`，stderr 留着看。

3. **mp3 输出**：浏览器里 `<audio>` 标签最稳吃 mp3。能直接出 mp3 就出 mp3；非 mp3 后端在函数末尾加一步 ffmpeg。

4. **音色 fallback**：`$3` 可能是空字符串。给一个合理的默认值（你最常用的中文音色 / 英文音色），不要因为没传音色就报错。

5. **不要做并发**：runner 是串行的（避免 rate limit）。provider 函数也别在内部 fork 多线程。

6. **不要修改全局状态**：provider 文件被 `source` 进 runner 的 shell。别 `cd`、别改 `IFS`、别 `set -e/+e` 切换，否则会污染 runner。把局部变量都 `local`。

   ⚠️ 一个坑：runner 用 `set -u`，**macOS 默认 bash 3.2 在 `"${arr[@]}"` 展开空数组时会炸 `unbound variable`**。如果你的 provider 需要"可选 --voice 参数"，**不要**用 `local args=(); [[ -n $voice ]] && args=(--voice $v); cmd "${args[@]}"` —— 直接写两个 if 分支调命令（看 `minimax.sh` 的写法）。

7. **API 长度上限**：单段大多数 API 都有上限（OpenAI ~4096 chars / MiniMax ~5000 / ElevenLabs ~5000）。Skill 的 narrations 单段一般 < 200 字符，正常不会撞到。如果你的 narration 撞到了，**先回去拆 step**——一个 step 的口播本来就不该这么长。

---

## 调试

```bash
# 看 runner 怎么调你的 provider
bash -x scripts/synthesize-audio.sh

# 跑单段试试，不动 audio-segments.json
source scripts/tts-providers/<name>.sh
tts_check && tts_synthesize "测试一下" /tmp/test.mp3 ""
afplay /tmp/test.mp3   # macOS 播一下听听
```

跑通了再 `npm run synthesize-audio`。
