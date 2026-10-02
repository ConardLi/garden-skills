#!/bin/sh
# Create a showreel project from the starter.
#   sh scaffold.sh <project-dir>
# Gives you: index.html (render(t) page) · motion.js (helpers) · timeline.js (shared clock) ·
#            score.mjs (music + SFX) · build.sh (one-command rebuild) · package.json (ESM)
set -e
SKILL=$(cd "$(dirname "$0")/.." && pwd)
DEST=${1:?usage: sh scaffold.sh <project-dir>}
if [ -e "$DEST/index.html" ]; then echo "✗ $DEST/index.html already exists; not overwriting"; exit 1; fi
mkdir -p "$DEST"
cp "$SKILL/assets/starter/index.html" "$SKILL/assets/starter/motion.js" "$SKILL/assets/starter/timeline.js" \
   "$SKILL/assets/starter/score.mjs" "$SKILL/assets/starter/package.json" "$DEST/"
sed "s#__SKILL_DIR__#$SKILL#" "$SKILL/assets/starter/build.sh" > "$DEST/build.sh"
chmod +x "$DEST/build.sh"
mkdir -p "$DEST/fonts" "$DEST/assets" "$DEST/audio" "$DEST/qa" "$DEST/out"
echo "✓ project at $DEST"
echo "  stills:  node $SKILL/scripts/render.mjs $DEST --still 1,3,6 --sheet"
echo "  music:   node $SKILL/scripts/audio.mjs build $DEST/score.mjs"
echo "  film:    sh $DEST/build.sh"
