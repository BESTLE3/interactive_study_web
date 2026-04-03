#!/bin/zsh

set -euo pipefail

cd "$(dirname "$0")/.."
CURRENT_TTY="$(tty)"

set +e
node scripts/launcher.mjs
EXIT_CODE=$?
set -e

osascript <<EOF >/dev/null 2>&1 || true
tell application "Terminal"
  repeat with currentWindow in windows
    repeat with currentTab in tabs of currentWindow
      try
        if tty of currentTab is "$CURRENT_TTY" then
          close currentWindow saving no
          return
        end if
      end try
    end repeat
  end repeat
end tell
EOF

exit $EXIT_CODE
