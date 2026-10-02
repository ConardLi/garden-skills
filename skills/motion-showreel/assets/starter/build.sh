#!/bin/sh
# One-command rebuild of the film. SKILL is filled in by scaffold.sh; edit FPS / SIZE / flags to match the brief.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
SKILL="${SKILL:-__SKILL_DIR__}"
FPS=${FPS:-30}
SIZE=${SIZE:-1920x1080}
cd "$HERE"
if [ -f score.tone.js ]; then node "$SKILL/scripts/audio.mjs" build score.tone.js --out audio/music.wav
elif [ -f score.mjs ]; then node "$SKILL/scripts/audio.mjs" build score.mjs --out audio/music.wav; fi
AUDIO=""; [ -f audio/music.wav ] && AUDIO="--audio audio/music.wav"
node "$SKILL/scripts/render.mjs" . --fps "$FPS" --size "$SIZE" --out out/final.mp4 $AUDIO "$@"
node "$SKILL/scripts/inspect.mjs" qa out/final.mp4 --out qa/final
