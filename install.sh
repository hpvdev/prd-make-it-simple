#!/usr/bin/env bash
set -euo pipefail

# install.sh — bootstrap MyAIKit vao mot project dich.
# Dung: bash install.sh <duong-dan-project-dich>

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$KIT_DIR/kit-manifest.txt"

if [ "$#" -ne 1 ]; then
  echo "Dung: bash install.sh <duong-dan-project-dich>" >&2
  exit 1
fi

DEST="$1"
if [ ! -d "$DEST" ]; then
  echo "Loi: '$DEST' khong ton tai hoac khong phai thu muc." >&2
  exit 1
fi
DEST="$(cd "$DEST" && pwd)"

if [ ! -f "$MANIFEST" ]; then
  echo "Loi: khong tim thay kit-manifest.txt tai '$MANIFEST'." >&2
  exit 1
fi

echo "Cai MyAIKit tu: $KIT_DIR"
echo "           sang: $DEST"
echo ""

while IFS= read -r path || [ -n "$path" ]; do
  # bo qua dong trong va comment
  case "$path" in
    ''|\#*) continue ;;
  esac
  src="$KIT_DIR/$path"
  if [ ! -e "$src" ]; then
    echo "  ! bo qua (khong co trong kit): $path" >&2
    continue
  fi
  dst="$DEST/$path"
  mkdir -p "$(dirname "$dst")"
  rm -rf "$dst"          # dam bao xoa cu truoc khi copy de (de het)
  cp -R "$src" "$dst"
  echo "  ✓ $path"
done < "$MANIFEST"

# Xu ly root CLAUDE.md rieng: chi sinh stub neu chua co (khong de len CLAUDE.md da co)
if [ ! -f "$DEST/CLAUDE.md" ]; then
  cat > "$DEST/CLAUDE.md" << 'STUB_EOF'
# CLAUDE.md

> Project mới cài MyAIKit. Sau khi chạy Pha 2 (skill `tao-nen-tang`), file này
> sẽ được bổ sung import tự động quy ước dự án (AGENTS.md).
> Hiện chưa import gì để tránh trỏ tới file chưa tồn tại.
STUB_EOF
  echo "  ✓ CLAUDE.md (stub moi)"
else
  echo "  • CLAUDE.md (giu nguyen — da co)"
fi

echo ""
echo "Xong. Buoc tiep: mo project dich bang Claude Code roi go /tao-san-pham de bat dau Pha 1."
