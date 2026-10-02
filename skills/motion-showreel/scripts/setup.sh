#!/bin/sh
# Install the one Node dependency (Playwright + a headless Chromium) next to these scripts,
# or into the project folder if the skill folder is read-only. ffmpeg / Node 18+ are system tools.
#   sh setup.sh [project-dir]
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
PROJ=${1:-}

command -v node >/dev/null 2>&1 || { echo "✗ Node.js 18+ is required (https://nodejs.org)"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || echo "✗ ffmpeg missing: macOS 'brew install ffmpeg' · Windows 'winget install ffmpeg' · Linux 'apt install ffmpeg'"

if [ -d "$HERE/node_modules/playwright" ] || { [ -n "$PROJ" ] && [ -d "$PROJ/node_modules/playwright" ]; }; then
  echo "✓ playwright already installed"
elif [ -w "$HERE" ]; then
  echo "→ installing playwright into $HERE"
  (cd "$HERE" && npm install --no-audit --no-fund --loglevel=error)
elif [ -n "$PROJ" ]; then
  echo "→ skill folder is read-only; installing playwright into $PROJ"
  (cd "$PROJ" && npm install --no-audit --no-fund --loglevel=error -D playwright)
else
  echo "✗ $HERE is read-only. Re-run with a project folder: sh setup.sh <project-dir>"; exit 1
fi

# Browser: reuse Chrome if Playwright's own Chromium can't be downloaded.
(cd "${PROJ:-$HERE}" && npx --yes playwright install chromium) || echo "! could not download Chromium; render.mjs will fall back to an installed Google Chrome / Edge"
node "$HERE/check-env.mjs" ${PROJ:+"$PROJ"}
