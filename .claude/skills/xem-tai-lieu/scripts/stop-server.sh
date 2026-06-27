#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="${1:-$PWD}"
RUN_DIR="$PROJECT_DIR/.xem-tai-lieu"
PIDFILE="$RUN_DIR/server.pid"
if [ -f "$PIDFILE" ]; then
  PID="$(cat "$PIDFILE")"
  kill "$PID" 2>/dev/null || true
  rm -f "$PIDFILE" "$RUN_DIR/server-url"
  echo "{\"type\":\"stopped\",\"pid\":$PID}"
else
  echo "{\"type\":\"not-running\"}"
fi
