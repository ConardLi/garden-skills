# ────────────────────────────────────────────────────────────────────
# MiMo TTS provider — uses the MiMo-V2.5-TTS API via curl.
#
# Docs:    https://platform.xiaomimimo.com/docs/zh-CN/usage-guide/speech-synthesis-v2.5
# Env:     MIMO_API_KEY=tp-...        required
#          MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
#                         (default: CN cluster; alternatives:
#                          token-plan-sgp / token-plan-ams)
#          MIMO_TTS_MODEL=mimo-v2.5-tts  optional (default shown)
# Voices:  冰糖 / 茉莉 / 苏打 / 白桦 (中文)
#          Mia / Chloe / Milo / Dean (English)
#          mimo_default (集群 default)
#          (default: 冰糖)
#
# Strengths: excellent Chinese narration quality; 9 preset voices;
#            OpenAI-compatible Chat Completions protocol; supports
#            singing mode and natural-language style tags.
#
# Output:  API returns base64-encoded WAV → decoded → converted to mp3.
#          Requires: jq, base64, ffmpeg (for wav→mp3).
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
  if ! command -v base64 >/dev/null; then
    echo "✗ base64 is required to decode the API response." >&2
    return 1
  fi
  if ! command -v ffmpeg >/dev/null; then
    echo "✗ ffmpeg is required for wav→mp3 conversion (brew install ffmpeg)." >&2
    return 1
  fi
  if [[ -z "${MIMO_API_KEY:-}" ]]; then
    echo "✗ MIMO_API_KEY is not set." >&2
    return 1
  fi
}

tts_install_help() {
  cat <<'EOF' >&2
To use the MiMo TTS provider:

  Set your key:    export MIMO_API_KEY=tp-...
                   (get one at https://platform.xiaomimimo.com/#/console/plan-manage)
  Optional:        export MIMO_BASE_URL=https://token-plan-sgp.xiaomimimo.com/v1
                   # default is CN cluster; switch to SGP or AMS as needed

Install deps (only if missing):
  curl   — brew install curl  / apt-get install curl
  jq     — brew install jq    / apt-get install jq
  base64 — built-in on macOS / most Linux
  ffmpeg — brew install ffmpeg / apt-get install ffmpeg

Available voices (mimo-v2.5-tts preset):
  Chinese:  冰糖  茉莉  苏打  白桦
  English:  Mia  Chloe  Milo  Dean
  Default:  mimo_default

Or pick another provider:  PRESENTATION_TTS=<name> npm run synthesize-audio
EOF
}

tts_synthesize() {
  local text="$1"
  local out="$2"
  local voice="${3:-}"
  [[ -z "$voice" ]] && voice="冰糖"

  local base="${MIMO_BASE_URL:-https://token-plan-cn.xiaomimimo.com/v1}"
  local model="${MIMO_TTS_MODEL:-mimo-v2.5-tts}"

  # Build request payload via jq
  # MiMo uses the Chat Completions format: text goes in role=assistant,
  # voice/style goes in role=user. For preset voices, audio.voice is set.
  local payload
  payload=$(jq -n \
    --arg t "$text" \
    --arg v "$voice" \
    --arg m "$model" \
    '{model:$m, messages:[{role:"user", content:""}, {role:"assistant", content:$t}], audio:{format:"wav", voice:$v}}')

  # Write response (JSON with base64 audio) to a temp file, then decode.
  # MiMo API returns: {choices:[{message:{audio:{data:"<base64>"}}}]}
  local tmp
  tmp=$(mktemp -t mimo.XXXXXX.json)

  curl -fsS -o "$tmp" -X POST "$base/chat/completions" \
    -H "api-key: $MIMO_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$payload" 2>/dev/null

  # Decode the base64 WAV from JSON → write raw WAV → convert to mp3
  local raw_wav
  raw_wav=$(mktemp -t mimo.XXXXXX.wav)
  jq -r '.choices[0].message.audio.data' "$tmp" | base64 -d > "$raw_wav"

  # Convert WAV → mp3 (browser <audio> tag best recognizes mp3)
  ffmpeg -y -i "$raw_wav" -codec:a libmp3lame -qscale:a 2 "$out" >/dev/null 2>&1
  local code=$?

  rm -f "$tmp" "$raw_wav"
  return $code
}
