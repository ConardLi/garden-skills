#!/bin/sh
# Create a showreel project from the starter.
#   sh scaffold.sh <project-dir> [--audio synth|tone|layer|none]
#     synth (default)  score.mjs       tier 1: built-in synth (electronic, UI, retro, abstract)
#     tone             score.tone.js   tier 2: Tone.js offline (sampled piano, convolution reverb, cinematic)
#     layer            both            tier 2 music rendered raw to audio/tone.wav; score.mjs loads it and adds SFX on top (sound.md §1)
#     none             no score        silent piece (loops, footage for another edit)
# Gives you: index.html (render(t) page) · motion.js (helpers) · timeline.js (shared clock) · the score file(s) above ·
#            build.sh (one-command rebuild + technical checks, AUDIO preset to your choice) · package.json (ESM)
set -e
SKILL=$(cd "$(dirname "$0")/.." && pwd)
DEST=${1:?usage: sh scaffold.sh <project-dir> [--audio synth|tone|layer|none]}
AUDIO=synth
case "${2:-}" in
  --audio) AUDIO=${3:?--audio needs synth|tone|layer|none} ;;
  --audio=*) AUDIO=${2#--audio=} ;;
  "") ;;
  *) echo "✗ unknown option $2 (usage: sh scaffold.sh <project-dir> [--audio synth|tone|layer|none])"; exit 1 ;;
esac
case "$AUDIO" in synth|tone|layer|none) ;; *) echo "✗ --audio must be synth | tone | layer | none (got '$AUDIO')"; exit 1 ;; esac
if [ -e "$DEST/index.html" ]; then echo "✗ $DEST/index.html already exists; not overwriting"; exit 1; fi

mkdir -p "$DEST"
ST="$SKILL/assets/starter"
cp "$ST/index.html" "$ST/motion.js" "$ST/timeline.js" "$ST/package.json" "$DEST/"
case "$AUDIO" in
  synth) cp "$ST/score.mjs" "$DEST/" ;;
  tone)  cp "$ST/score.tone.js" "$DEST/" ;;
  layer) cp "$ST/score.tone.js" "$DEST/"; cp "$ST/score.layer.mjs" "$DEST/score.mjs" ;;   # score.mjs loads audio/tone.wav + adds SFX
esac
sed -e "s#__SKILL_DIR__#$SKILL#" -e "s#__AUDIO__#$AUDIO#" "$ST/build.sh" > "$DEST/build.sh"
chmod +x "$DEST/build.sh"
mkdir -p "$DEST/fonts" "$DEST/assets" "$DEST/audio" "$DEST/qa" "$DEST/out"

echo "✓ project at $DEST  (audio: $AUDIO)"
echo "  stills:  node $SKILL/scripts/render.mjs $DEST --still 1,3,6 --sheet"
case "$AUDIO" in
  synth) echo "  music:   node $SKILL/scripts/audio.mjs build $DEST/score.mjs" ;;
  tone)  echo "  music:   node $SKILL/scripts/audio.mjs build $DEST/score.tone.js   (samples first: audio.mjs samples salamander)" ;;
  layer) echo "  music:   score.tone.js is built raw to audio/tone.wav, then score.mjs loads it with S.load('audio/tone.wav')" ;;
  none)  echo "  music:   none (silent piece; qa will expect no audio track)" ;;
esac
echo "  film:    sh $DEST/build.sh   (FPS / SIZE / AUDIO / LOOP at the top of build.sh; it also runs the technical checks)"
