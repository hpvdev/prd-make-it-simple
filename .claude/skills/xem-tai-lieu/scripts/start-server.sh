#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$PWD"
OPEN=0
for arg in "$@"; do
  case "$arg" in
    --open) OPEN=1 ;;
    --project-dir=*) PROJECT_DIR="${arg#*=}" ;;
  esac
done

SDD_DIR="$PROJECT_DIR/docs/sdd"
RUN_DIR="$PROJECT_DIR/.xem-tai-lieu"
mkdir -p "$RUN_DIR"
PIDFILE="$RUN_DIR/server.pid"
URLFILE="$RUN_DIR/server-url"
LOGFILE="$RUN_DIR/server.log"

open_url() {
  if command -v open >/dev/null 2>&1; then open "$1" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$1" >/dev/null 2>&1 || true
  fi
}

# Đã chạy → tái dùng
if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  URL="$(cat "$URLFILE" 2>/dev/null || true)"
  echo "{\"type\":\"already-running\",\"url\":\"$URL\",\"pid\":$(cat "$PIDFILE")}"
  [ "$OPEN" = "1" ] && [ -n "$URL" ] && open_url "$URL"
  exit 0
fi

: > "$LOGFILE"
node "$SCRIPT_DIR/server.cjs" "$SDD_DIR" 0 >"$LOGFILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PIDFILE"

URL=""
for _ in $(seq 1 50); do
  if grep -q '"url"' "$LOGFILE" 2>/dev/null; then
    URL=$(node -e "const fs=require('fs');const l=fs.readFileSync('$LOGFILE','utf8').split('\n').find(x=>x.includes('\"url\"'));process.stdout.write(l?JSON.parse(l).url:'')")
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then break; fi
  sleep 0.1
done

if [ -z "$URL" ]; then
  echo "{\"type\":\"error\",\"message\":\"server không khởi động được; xem $LOGFILE\"}"
  exit 1
fi

echo "$URL" > "$URLFILE"
echo "{\"type\":\"server-started\",\"url\":\"$URL\",\"pid\":$SERVER_PID}"
[ "$OPEN" = "1" ] && open_url "$URL"
exit 0
