#!/bin/sh
# One-command rebuild of the film + its technical acceptance. SKILL and AUDIO are filled in by scaffold.sh.
# The spec below drives BOTH the render and the checks, so they cannot drift apart:
#   FPS / SIZE  → render.mjs --fps / --size   and   inspect.mjs qa --expect-fps / --expect-size
#   duration    → DUR from timeline.js         →   --expect-duration
#   AUDIO       → synth: score.mjs · tone: score.tone.js · layer: score.tone.js (raw) loaded by score.mjs · none: silent
#                 (anything but none also makes qa require an audio track)
#   LOOP=1      → qa also checks the loop seam
# Extra arguments go to render.mjs and are for quality only:  sh build.sh --subframes 2 --grain 4
# Set FPS / SIZE as variables (FPS=60 sh build.sh), not as flags. To re-render one segment, call render.mjs --start/--duration.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
SKILL="${SKILL:-__SKILL_DIR__}"
FPS=${FPS:-30}
SIZE=${SIZE:-1920x1080}
AUDIO=${AUDIO:-__AUDIO__}
LOOP=${LOOP:-0}
cd "$HERE"

for a in "$@"; do case "$a" in
  --fps*|--size*|--out*|--audio*|--start*|--duration*)
    echo "✗ build.sh $a: FPS / SIZE are variables here (they also drive the checks): FPS=60 SIZE=1080x1920 sh build.sh"
    echo "  for a segment or a one-off output, call render.mjs directly"; exit 1;;
esac; done

need() { [ -f "$1" ] || { echo "✗ AUDIO=$AUDIO needs $1 (or set AUDIO=synth|tone|layer|none in build.sh)"; exit 1; }; }
ignored() { [ -f "$1" ] && echo "! $1 is ignored (AUDIO=$AUDIO). Delete it, or set AUDIO=layer to use both." || true; }
audio() { node "$SKILL/scripts/audio.mjs" "$@"; }
case "$AUDIO" in
  synth) need score.mjs; ignored score.tone.js; audio build score.mjs --out audio/music.wav ;;
  tone)  need score.tone.js; ignored score.mjs; audio build score.tone.js --out audio/music.wav ;;
  layer) need score.tone.js; need score.mjs
         audio build score.tone.js --raw --out audio/tone.wav     # score.mjs loads it: S.load('audio/tone.wav')
         audio build score.mjs --out audio/music.wav ;;
  none)  ignored score.mjs; ignored score.tone.js ;;
  *) echo "✗ AUDIO must be synth | tone | layer | none (got '$AUDIO')"; exit 1 ;;
esac

if [ "$AUDIO" = none ]; then MUX=""; EXPECT_AUDIO=none; else MUX="--audio audio/music.wav"; EXPECT_AUDIO=required; fi
node "$SKILL/scripts/render.mjs" . --fps "$FPS" --size "$SIZE" --out out/final.mp4 $MUX "$@"

DUR=$(node --input-type=module -e 'import { pathToFileURL } from "node:url"; const m = await import(pathToFileURL(process.argv[1]).href); console.log(m.DUR ?? "")' "$HERE/timeline.js" 2>/dev/null || true)
EXPECT="--expect-size $SIZE --expect-fps $FPS --audio $EXPECT_AUDIO"
if [ -n "$DUR" ]; then EXPECT="$EXPECT --expect-duration $DUR"; else echo "! no DUR in timeline.js: duration will not be checked"; fi
[ "$LOOP" = 1 ] && EXPECT="$EXPECT --loop"
node "$SKILL/scripts/inspect.mjs" qa out/final.mp4 --out qa/final $EXPECT
