#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:3001/display}"

/usr/bin/chromium-browser \
  --kiosk \
  --app="$URL" \
  --incognito \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=Translate,BackForwardCache \
  --disable-extensions \
  --disable-gpu \
  --disable-dev-shm-usage \
  --no-first-run \
  --autoplay-policy=no-user-gesture-required
