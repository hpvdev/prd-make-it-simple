# Bộ cài đặt MyAIKit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biến MyAIKit thành kit tái sử dụng — sửa `.claude/CLAUDE.md` thành generic, thêm `install.sh` + `kit-manifest.txt` để bootstrap, và skill `cap-nhat-kit` để đồng bộ bản mới.

**Architecture:** Một manifest text (`kit-manifest.txt`) liệt kê path cần cài, làm nguồn chân lý dùng chung. `install.sh` đọc manifest copy đè sang project đích (bootstrap). Skill `cap-nhat-kit` làm việc tương tự trong context Claude để kéo bản kit mới về project đã cài.

**Tech Stack:** Bash (install.sh), Markdown (SKILL.md, CLAUDE.md), không thêm dependency.

## Global Constraints

- Document/chat output: tiếng Việt. AI-instruction files (CLAUDE.md, SKILL.md) nội dung hướng dẫn viết tiếng Anh được, nhưng kit này theo phong cách hiện có → giữ tiếng Việt cho phần mô tả người đọc.
- KHÔNG cài sang đích: `docs/sdd/`, `docs/superpowers/`, `.superpowers/`, `.xem-tai-lieu/`, `.git/`, `.DS_Store`.
- Đè hết file đã tồn tại ở đích (overwrite, không hỏi).
- Manifest đúng 8 path: `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/settings.json`, `.claude/settings.local.json`, `.claude/skills`, `.claude/agents`, `.claude/commands`, `.claude/hooks`.
- `install.sh` dùng `set -euo pipefail`.

---

### Task 1: Viết lại `.claude/CLAUDE.md` thành generic overlay

**Files:**
- Modify: `.claude/CLAUDE.md` (thay toàn bộ nội dung)

**Interfaces:**
- Consumes: (không)
- Produces: file overlay generic — Task khác không phụ thuộc nội dung, chỉ cần nó tồn tại để manifest copy.

- [ ] **Step 1: Thay toàn bộ nội dung `.claude/CLAUDE.md`**

Ghi đè bằng:

```markdown
# MyAIKit — Claude-specific overlay

> Overlay cấu hình riêng cho Claude Code. Quy ước cross-tool (ngôn ngữ output artifact,
> quy tắc dự án) sống trong `docs/sdd/AGENTS.md` sau khi đã chạy Pha 2 — KHÔNG import ở đây
> để tránh phụ thuộc file chưa tồn tại lúc mới cài kit.

## Ngôn ngữ giao tiếp (chat với user)

**Trả lời bằng tiếng Việt.** Giữ câu trả lời ngắn (3–5 dòng cho câu hỏi thăm dò); tránh bảng
dài hoặc thêm header trừ khi user yêu cầu.

Quy tắc này chỉ áp cho chat. File artifact (báo cáo, tài liệu kế hoạch, dev notes) theo
`document_output_language: tiếng Việt`. File hướng dẫn cho AI (file này, SKILL.md) có thể
viết tiếng Anh cho LLM dễ đọc.

## Auto-load quy ước dự án (sau Pha 2)

Khi project đã chạy skill `tao-nen-tang` (Pha 2), nó sinh `docs/sdd/AGENTS.md` và `CLAUDE.md`
gốc repo có dòng `@docs/sdd/AGENTS.md`. Claude Code auto-load AGENTS qua đường đó — không cần
khai báo lại trong file này.
```

- [ ] **Step 2: Kiểm không còn nội dung cũ**

Run: `grep -ci -e qi-ecosystem -e serena .claude/CLAUDE.md`
Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add .claude/CLAUDE.md
git commit -m "fix(kit): viet lai .claude/CLAUDE.md thanh generic overlay

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Tạo `kit-manifest.txt`

**Files:**
- Create: `kit-manifest.txt`

**Interfaces:**
- Consumes: (không)
- Produces: file text, mỗi dòng 1 path tương đối từ gốc kit; dòng `#`/trống là comment. `install.sh` (Task 3) và `cap-nhat-kit` (Task 4) đọc file này.

- [ ] **Step 1: Tạo `kit-manifest.txt`**

```
# kit-manifest.txt — danh muc path duoc cai sang project dich.
# Dong bat dau bang # va dong trong bi bo qua.
# Dung chung boi install.sh (bootstrap) va skill cap-nhat-kit (dong bo).
CLAUDE.md
.claude/CLAUDE.md
.claude/settings.json
.claude/settings.local.json
.claude/skills
.claude/agents
.claude/commands
.claude/hooks
```

- [ ] **Step 2: Kiểm đúng 8 path (bỏ comment/trống)**

Run: `grep -vE '^\s*(#|$)' kit-manifest.txt | wc -l | tr -d ' '`
Expected: `8`

- [ ] **Step 3: Commit**

```bash
git add kit-manifest.txt
git commit -m "feat(kit): them kit-manifest.txt khai bao path duoc cai

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Tạo `install.sh` (bootstrap)

**Files:**
- Create: `install.sh`
- Test: chạy thử vào thư mục tạm (kiểm thủ công bằng lệnh trong step)

**Interfaces:**
- Consumes: `kit-manifest.txt` (Task 2) — đọc danh sách path.
- Produces: script `bash install.sh <project-đích>` copy đè các path trong manifest sang đích.

- [ ] **Step 1: Tạo `install.sh`**

```bash
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

echo ""
echo "Xong. Buoc tiep: mo project dich bang Claude Code roi go /tao-san-pham de bat dau Pha 1."
```

- [ ] **Step 2: Cho phép chạy**

Run: `chmod +x install.sh`
Expected: (không output)

- [ ] **Step 3: Test — thiếu đối số phải báo lỗi**

Run: `bash install.sh; echo "exit=$?"`
Expected: in dòng `Dung: bash install.sh <duong-dan-project-dich>` và `exit=1`

- [ ] **Step 4: Test — cài vào thư mục tạm**

Run:
```bash
TMP="$(mktemp -d)" && bash install.sh "$TMP" && echo "---KET QUA---" && \
ls "$TMP" "$TMP/.claude" && \
echo "khong-co-docs-sdd:" && ([ -d "$TMP/docs/sdd" ] && echo CO || echo KHONG)
```
Expected: in `✓` cho 8 path; `$TMP` có `CLAUDE.md` + `.claude/`; `.claude/` có `CLAUDE.md settings.json settings.local.json skills agents commands hooks`; dòng cuối `khong-co-docs-sdd: KHONG`.

- [ ] **Step 5: Dọn thư mục tạm**

Run: `rm -rf "$TMP"`
Expected: (không output)

- [ ] **Step 6: Commit**

```bash
git add install.sh
git commit -m "feat(kit): install.sh bootstrap kit sang project dich

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Tạo skill `cap-nhat-kit`

**Files:**
- Create: `.claude/skills/cap-nhat-kit/SKILL.md`

**Interfaces:**
- Consumes: `kit-manifest.txt` của kit nguồn (đọc danh sách path).
- Produces: skill `/cap-nhat-kit <đường-dẫn-kit>` — copy đè các path từ kit về project hiện tại (cwd).

- [ ] **Step 1: Tạo `.claude/skills/cap-nhat-kit/SKILL.md`**

```markdown
---
name: cap-nhat-kit
description: Đồng bộ bản MyAIKit mới về project đã cài kit. Đọc kit-manifest.txt của kit nguồn rồi copy đè skills/agents/commands/hooks/settings/CLAUDE.md vào project hiện tại. Use this skill khi user nói "cập nhật kit", "đồng bộ kit", "kéo bản kit mới", "/cap-nhat-kit", và đưa đường dẫn tới thư mục MyAIKit nguồn. KHÔNG dùng cho lần cài đầu (dùng install.sh) — skill này giả định project đã có kit.
---

# cap-nhat-kit — đồng bộ bản MyAIKit mới về project hiện tại

## Khi nào dùng
Project đã cài kit (qua `install.sh`), nay muốn kéo bản kit mới nhất từ thư mục MyAIKit nguồn.

## Tiền điều kiện
- User cung cấp **đường dẫn tới thư mục kit nguồn** (nơi chứa `kit-manifest.txt`).
- Nếu user không đưa đường dẫn → hỏi: "Đường dẫn tới thư mục MyAIKit nguồn là gì?"

## Quy trình
1. Đặt `KIT="<đường-dẫn-user-đưa>"`. Kiểm `KIT/kit-manifest.txt` tồn tại; nếu không → báo lỗi và dừng.
2. Đọc từng dòng `kit-manifest.txt` (bỏ dòng trống và dòng bắt đầu `#`).
3. Với mỗi `path`: copy đè từ `KIT/$path` về `./$path` (project hiện tại). Lệnh tham khảo:
   ```bash
   while IFS= read -r p || [ -n "$p" ]; do
     case "$p" in ''|\#*) continue ;; esac
     [ -e "$KIT/$p" ] || { echo "  ! bo qua: $p"; continue; }
     mkdir -p "$(dirname "$p")"; rm -rf "./$p"; cp -R "$KIT/$p" "./$p"
     echo "  ✓ $p"
   done < "$KIT/kit-manifest.txt"
   ```
4. Báo cáo cho user: liệt kê các path đã cập nhật.
5. Nhắc: nếu user từng chỉnh tay `settings.local.json` thì kiểm lại vì đã bị đè.

## Ranh giới
- KHÔNG tự `git commit` — để user tự xem diff rồi commit.
- KHÔNG cài `docs/sdd/` hay artifact dự án — chỉ đúng các path trong manifest.
- Đè thẳng, không merge (theo thiết kế kit).
```

- [ ] **Step 2: Kiểm frontmatter `name` khớp tên thư mục**

Run: `grep -m1 '^name:' .claude/skills/cap-nhat-kit/SKILL.md`
Expected: `name: cap-nhat-kit`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/cap-nhat-kit/SKILL.md
git commit -m "feat(kit): skill cap-nhat-kit dong bo ban kit moi

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Kiểm tra tích hợp đầu-cuối

**Files:** (không tạo/sửa — chỉ kiểm thử)

**Interfaces:**
- Consumes: `install.sh`, `kit-manifest.txt`, các file kit.
- Produces: xác nhận DoD của spec.

- [ ] **Step 1: Cài vào thư mục tạm và kiểm cap-nhat-kit có theo cùng**

Run:
```bash
TMP="$(mktemp -d)" && bash install.sh "$TMP" >/dev/null && \
echo "skill cap-nhat-kit:" && ([ -f "$TMP/.claude/skills/cap-nhat-kit/SKILL.md" ] && echo CO || echo KHONG) && \
echo "claude-md-generic:" && (grep -qi qi-ecosystem "$TMP/.claude/CLAUDE.md" && echo CON-CU || echo SACH) && \
echo "settings-local:" && ([ -f "$TMP/.claude/settings.local.json" ] && echo CO || echo KHONG) && \
rm -rf "$TMP"
```
Expected: `skill cap-nhat-kit: CO`, `claude-md-generic: SACH`, `settings-local: CO`.

- [ ] **Step 2: Xác nhận không có thay đổi chưa commit ngoài ý muốn**

Run: `git status --short`
Expected: (trống — mọi thứ đã commit ở Task 1–4)
