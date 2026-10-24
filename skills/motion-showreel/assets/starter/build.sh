#!/bin/sh
# One-command rebuild of the film + its technical acceptance. SKILL and AUDIO are filled in by scaffold.sh.
# The spec below drives BOTH the render and the checks, so they cannot drift apart:
#   FPS / SIZE  → render.mjs --fps / --size   and   inspect.mjs qa --expect-fps / --expect-size
#   duration    → DUR from timeline.js         →   --expect-duration
#   AUDIO       → synth: score.mjs · tone: score.tone.js · layer: both · file: AUDIO_FILE final mix · none: silent
#                 (anything but none also makes qa require an audio track)
#   LOOP=1      → qa also checks the loop seam
#   DETERMINISM → 1 (default): render.mjs --determinism must pass before the film is rendered; 0 skips it (quick iterations only)
#   TEXTCHECK   → 1 (default): render.mjs --text-check writes review material to qa/text* (text cut by the frame, overlapping,
#                 in the safe zone, too small); it never blocks the build. 0 skips it.
# Extra arguments go to render.mjs and are for quality only:  sh build.sh --subframes 2 --grain 4
# Set FPS / SIZE as variables (FPS=60 sh build.sh), not as flags. To re-render one segment, call render.mjs --start/--duration.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
SKILL="${SKILL:-__SKILL_DIR__}"
FPS=${FPS:-30}
SIZE=${SIZE:-1920x1080}
AUDIO=${AUDIO:-__AUDIO__}
AUDIO_FILE=${AUDIO_FILE:-audio/final.wav}
LOOP=${LOOP:-0}
DETERMINISM=${DETERMINISM:-1}
TEXTCHECK=${TEXTCHECK:-1}
cd "$HERE"

DUR=$(node --input-type=module -e 'import { pathToFileURL } from "node:url"; const m = await import(pathToFileURL(process.argv[1]).href); console.log(m.DUR ?? "")' "$HERE/timeline.js")
# Refuse a conflicting prepared mix before rendering; never silently cut speech to the picture.
node --input-type=module -e '
import { execFileSync } from "node:child_process";
const [raw, fps, mode, file] = process.argv.slice(1), dur = Number(raw);
if (!Number.isFinite(dur) || dur <= 0 || dur > 1200) throw new Error("timeline DUR must be positive and at most 1200 seconds; confirm a duration conflict with the user");
if (mode === "file") {
  const n = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {encoding:"utf8"}).trim());
  if (!Number.isFinite(n) || Math.abs(n - dur) > 1.5 / Number(fps)) throw new Error("prepared audio duration conflicts with timeline; confirm the duration before building (no automatic trimming or speed change)");
}
' "$DUR" "$FPS" "$AUDIO" "$AUDIO_FILE"

for a in "$@"; do case "$a" in
  --fps*|--size*|--out*|--audio*|--start*|--duration*)
    echo "✗ build.sh $a: FPS / SIZE are variables here (they also drive the checks): FPS=60 SIZE=1080x1920 sh build.sh"
    echo "  for a segment or a one-off output, call render.mjs directly"; exit 1;;
esac; done

need() { [ -f "$1" ] || { echo "✗ AUDIO=$AUDIO needs $1 (or set AUDIO=synth|tone|layer|file|none in build.sh)"; exit 1; }; }
ignored() { [ -f "$1" ] && echo "! $1 is ignored (AUDIO=$AUDIO). Delete it, or set AUDIO=layer to use both." || true; }
audio() { node "$SKILL/scripts/audio.mjs" "$@"; }
case "$AUDIO" in
  synth) need score.mjs; ignored score.tone.js; audio build score.mjs --out audio/music.wav ;;
  tone)  need score.tone.js; ignored score.mjs; audio build score.tone.js --out audio/music.wav ;;
  layer) need score.tone.js; need score.mjs
         grep -q "tone\.wav" score.mjs || { echo "✗ AUDIO=layer but score.mjs never loads audio/tone.wav: the Tone layer would be built and then dropped (see assets/starter/score.layer.mjs)"; exit 1; }
         audio build score.tone.js --raw --out audio/tone.wav     # score.mjs loads it: S.load(<project>/audio/tone.wav)
         audio build score.mjs --out audio/music.wav ;;
  none)  ignored score.mjs; ignored score.tone.js ;;
  file)  need "$AUDIO_FILE" ;;
  *) echo "✗ AUDIO must be synth | tone | layer | file | none (got '$AUDIO')"; exit 1 ;;
esac

if [ "$AUDIO" = file ] && [ -f audio/narration.json ]; then
  node "$SKILL/scripts/narration.mjs" check . --duration "$DUR" --audio "$AUDIO_FILE"
fi

if [ "$AUDIO" = file ]; then FINAL_AUDIO=$AUDIO_FILE; else FINAL_AUDIO=audio/music.wav; fi
if [ "$AUDIO" = none ]; then EXPECT_AUDIO=none; else EXPECT_AUDIO=required; fi
# a film that cannot be re-rendered identically cannot be fixed segment by segment: refuse to publish it
if [ "$DETERMINISM" = 1 ]; then node "$SKILL/scripts/render.mjs" . --fps "$FPS" --size "$SIZE" --determinism
else echo "! DETERMINISM=0: determinism not checked (fine for drafts, not for delivery)"; fi
if [ "$AUDIO" = none ]; then
  node "$SKILL/scripts/render.mjs" . --fps "$FPS" --size "$SIZE" --out out/final.mp4 "$@"
else
  node "$SKILL/scripts/render.mjs" . --fps "$FPS" --size "$SIZE" --out out/final.mp4 --audio "$FINAL_AUDIO" "$@"
fi
if [ "$TEXTCHECK" = 1 ]; then node "$SKILL/scripts/render.mjs" . --size "$SIZE" --text-check --out qa/text || echo "! text check could not run (review material only; the build goes on)"; fi

EXPECT="--expect-size $SIZE --expect-fps $FPS --audio $EXPECT_AUDIO"
if [ -n "$DUR" ]; then EXPECT="$EXPECT --expect-duration $DUR"; else echo "! no DUR in timeline.js: duration will not be checked"; fi
[ "$LOOP" = 1 ] && EXPECT="$EXPECT --loop"
node "$SKILL/scripts/inspect.mjs" qa out/final.mp4 --out qa/final $EXPECT
