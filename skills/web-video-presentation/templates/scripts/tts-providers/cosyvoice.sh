# ────────────────────────────────────────────────────────────────────
# 阿里云百炼 CosyVoice provider — HTTP REST via curl（非实时/非流式）.
#
# Docs:    https://help.aliyun.com/zh/model-studio/developer-reference/cosyvoice-speech-synthesis
# Env:     DASHSCOPE_API_KEY=sk-...       required  (百炼控制台的真实 API key)
#          DASHSCOPE_TTS_MODEL=cosyvoice-v3-flash    optional (v3.5-plus 最高质量 / v3-flash 快 / v2 兼容)
#          DASHSCOPE_TTS_ENDPOINT=...                 optional (覆盖默认端点)
# Voices:  longanyang (默认,v3 系列配套) / longwan (龙婉) / longcheng (龙诚,男)
#          longxiaochun (龙小春,v2 老音色)
#          完整列表: https://help.aliyun.com/zh/model-studio/cosyvoice-voice-list
#          ⚠️ 音色要跟模型配套：v3 系列用 longanyang 等 v3 音色；longxiaochun
#          老音色在 v3 下会报 418。
#
# 非流式合成：一次请求返回 JSON，output.audio.url 是音频 URL（24h 有效），
# 脚本自动二次下载落盘为 mp3。智能适配：若返回二进制或 base64 也兼容。
# ────────────────────────────────────────────────────────────────────

tts_check() {
  if ! command -v curl >/dev/null; then
    echo "✗ curl not found in PATH." >&2
    return 1
  fi
  if ! command -v jq >/dev/null; then
    echo "✗ jq is required to build the request payload safely." >&2
    return 1
  fi
  if [[ -z "${DASHSCOPE_API_KEY:-}" ]]; then
    echo "✗ DASHSCOPE_API_KEY is not set." >&2
    echo "  请填百炼控制台拿到的真实 sk- key。" >&2
    return 1
  fi
}

tts_install_help() {
  cat <<'EOF' >&2
To use the CosyVoice (阿里云百炼) provider:

  1. 拿百炼 API key（sk- 开头）：
     百炼控制台 https://bailian.console.aliyun.com/ → API-KEY 管理 → 创建

  2. export DASHSCOPE_API_KEY=sk-你的真key

  3. （可选）换模型 / 端点 / 音色：
     export DASHSCOPE_TTS_MODEL=cosyvoice-v3-flash     # 或 cosyvoice-v3.5-plus（最高质量）/ cosyvoice-v2
     export DASHSCOPE_TTS_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer

  Install deps (only if missing):
    curl  — brew install curl  / apt-get install curl
    jq    — brew install jq    / apt-get install jq

  Self-test a single segment:
    source .claude/skills/web-video-presentation/templates/scripts/tts-providers/cosyvoice.sh
    tts_check && tts_synthesize "测试一下" /tmp/test.mp3 ""
    afplay /tmp/test.mp3   # macOS 播一下

  跑通后启用：
    PRESENTATION_TTS=cosyvoice npm run synthesize-audio

Or pick another provider:  PRESENTATION_TTS=<name> npm run synthesize-audio
EOF
}

tts_synthesize() {
  local text="$1"
  local out="$2"
  local voice="${3:-}"
  [[ -z "$voice" ]] && voice="longanyang"

  local model="${DASHSCOPE_TTS_MODEL:-cosyvoice-v3-flash}"
  local endpoint="${DASHSCOPE_TTS_ENDPOINT:-https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer}"

  local payload
  payload=$(jq -n \
    --arg t "$text" \
    --arg v "$voice" \
    --arg m "$model" \
    '{model:$m, input:{text:$t, voice:$v, format:"mp3", sample_rate:22050}}')

  local tmp
  tmp=$(mktemp -t cosy)
  local http_code ct
  http_code=$(curl -sS -o "$tmp" -w "%{http_code} %{content_type}" --max-time 60 \
    -X POST "$endpoint" \
    -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload" 2>/dev/null) || { rm -f "$tmp"; return 1; }
  ct="${http_code#* }"
  http_code="${http_code%% *}"

  # 1) 直接二进制音频
  if [[ "$ct" == audio/* ]]; then
    mv "$tmp" "$out"
    return 0
  fi

  # 2) JSON：output.audio.url（非流式标准返回，二次下载）
  local url
  url=$(jq -r '.output.audio.url // empty' "$tmp" 2>/dev/null)
  if [[ -n "$url" ]]; then
    if curl -fsS -o "$out" --max-time 30 "$url" 2>/dev/null; then
      rm -f "$tmp"
      return 0
    fi
    rm -f "$tmp"
    return 1
  fi

  # 3) JSON：output.audio.data（base64，流式残留兼容）
  local data
  data=$(jq -r '.output.audio.data // empty' "$tmp" 2>/dev/null)
  if [[ -n "$data" ]]; then
    if printf '%s' "$data" | base64 -d > "$out" 2>/dev/null; then
      rm -f "$tmp"
      return 0
    fi
    rm -f "$tmp"
    return 1
  fi

  # 都不是 → 报错（喧闹失败）
  echo "✗ CosyVoice 合成失败 (HTTP $http_code, ct=$ct):" >&2
  head -c 300 "$tmp" >&2
  echo >&2
  echo "  端点: $endpoint" >&2
  echo "  model: $model  voice: $voice" >&2
  rm -f "$tmp"
  return 1
}
