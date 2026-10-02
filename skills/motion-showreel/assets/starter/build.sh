#!/bin/sh
# One-command rebuild of the film. SKILL is filled in by scaffold.sh; edit FPS / SIZE / flags to match the brief.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
SKILL="${SKILL:-__SKILL_DIR__}"
FPS=${FPS:-30}
SIZE=${SIZE:-1920x1080}
cd "$HERE"
[ -f score.mjs ] && node "$SKILL/scripts/audio.mjs" build score.mjs --out audio/music.wav
AUDIO=""; [ -f audio/music.wav ] && AUDIO="--audio audio/music.wav"
node "$SKILL/scripts/render.mjs" . --fps "$FPS" --size "$SIZE" --out out/final.mp4 $AUDIO "$@"
node "$SKILL/scripts/inspect.mjs" qa out/final.mp4 --out qa/final
