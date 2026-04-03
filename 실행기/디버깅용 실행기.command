#!/bin/zsh

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_URL="http://localhost:4173"
PORT="4173"
LOG_FILE="$PROJECT_DIR/.local-web.log"

cd "$PROJECT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display alert "npm not found" message "Node.js와 npm이 설치되어 있어야 합니다." as critical'
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  osascript -e 'display alert "python3 not found" message "macOS에 python3가 필요합니다." as critical'
  exit 1
fi

if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "node_modules가 없어 npm install을 실행합니다..."
  npm install
fi

echo "정적 파일을 빌드합니다..."
npm run build

if ! lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "로컬 서버를 시작합니다..."
  osascript <<EOF
tell application "Terminal"
  do script "cd '$PROJECT_DIR'; python3 -m http.server $PORT --bind 127.0.0.1 -d '$PROJECT_DIR/dist' | tee '$LOG_FILE'"
  activate
end tell
EOF

  for _ in {1..40}; do
    if curl -sf "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
      break
    fi
    sleep 0.5
  done
fi

if curl -sf "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
  if [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" "$APP_URL"
    echo "Chrome으로 열었습니다: $APP_URL"
  else
    open "$APP_URL"
    echo "브라우저를 열었습니다: $APP_URL"
  fi
else
  echo "서버가 정상적으로 시작되지 않았습니다. 로그를 확인하세요: $LOG_FILE"
  exit 1
fi
