# Design — Bộ cài đặt MyAIKit (kit tái sử dụng cho project khác)

> Spec là nguồn chân lý. File này (design brainstorming) sống trong `docs/superpowers/specs/`.
> Ngày: 2026-06-27.

## 1. Vấn đề & mục tiêu

MyAIKit KHÔNG phải app "Đặt Lịch Tiệm Tóc" — đó chỉ là **dữ liệu ví dụ** sống trong `docs/sdd/`.
MyAIKit thực chất là **bộ kit tái sử dụng** của user: bộ skills SDD + agents reviewer + commands +
settings, để sau này **bê sang project khác**.

Hai vấn đề cần xử lý:

1. **`.claude/CLAUDE.md` dính nội dung dự án cũ "qi-ecosystem"** — sai bối cảnh, import gãy
   (`@../AGENTS.md` trỏ tới file không tồn tại), đoạn Serena thừa (kit không bắt buộc Serena).
2. **Chưa có bộ cài đặt** để mang kit sang project mới.

**Mục tiêu:**
1. Viết lại `.claude/CLAUDE.md` thành overlay **generic** (không gắn dự án cụ thể).
2. Có **`install.sh`** bootstrap lần đầu (copy kit vào project đích).
3. Có skill **`cap-nhat-kit`** để đồng bộ bản kit mới sau khi đã cài.
4. Một **manifest** khai báo "cài gì" làm nguồn chân lý dùng chung cho cả 2 cơ chế.

## 2. Quyết định thiết kế (đã chốt với user)

| # | Quyết định | Chốt |
|---|---|---|
| 1 | Cài gì | `.claude/skills` + `agents` + `commands` + `hooks` + `settings.json` + `settings.local.json` + `CLAUDE.md` gốc + `.claude/CLAUDE.md` |
| 2 | Cơ chế | **Cả hai**: `install.sh` (bootstrap) + skill `cap-nhat-kit` (đồng bộ sau) |
| 3 | Xung đột file đã tồn tại | **Đè hết** (overwrite, không hỏi, không `.suggested`) |
| 4 | `settings.local.json` | **Cài luôn**, giữ nguyên cả `Bash(*)` (user chấp nhận rủi ro auto-allow mọi bash) |
| 5 | KHÔNG cài | `docs/sdd/` (ví dụ tiệm tóc), `docs/superpowers/`, `.superpowers/`, `.xem-tai-lieu/`, `.git/`, `.DS_Store` |

## 3. Cấu trúc đích (trong kit)

```
MyAIKit/
├── install.sh                  # MỚI — bootstrap lần đầu: bash install.sh <project-đích>
├── kit-manifest.txt            # MỚI — danh mục path được cài (nguồn chân lý dùng chung)
├── CLAUDE.md                   # đã có — @-import docs/sdd/AGENTS.md (cài sang đích)
└── .claude/
    ├── CLAUDE.md               # SỬA LẠI — overlay generic, bỏ qi-ecosystem/Serena/import gãy
    ├── settings.json           # cài sang đích
    ├── settings.local.json     # cài sang đích (gồm Bash(*))
    ├── skills/
    │   └── cap-nhat-kit/SKILL.md   # MỚI — đồng bộ bản kit mới về project đã cài
    ├── agents/                 # cài sang đích
    ├── commands/               # cài sang đích
    └── hooks/                  # cài sang đích
```

## 4. Thành phần

### 4.1 `.claude/CLAUDE.md` viết lại (generic overlay)
- Tiêu đề chung "MyAIKit — Claude-specific overlay" (bỏ "qi-ecosystem").
- Giữ: quy ước **communication_language: Vietnamese** cho chat; document_output_language: Vietnamese cho artifact; AI-instruction files viết tiếng Anh.
- Bỏ: toàn bộ đoạn Serena (kit không bắt buộc Serena MCP).
- Bỏ: import gãy `@../AGENTS.md`. Thay bằng ghi chú: khi project đã chạy Pha 2, AGENTS auto-load qua `CLAUDE.md` gốc repo (`@docs/sdd/AGENTS.md`) — không import ở đây.

### 4.2 `kit-manifest.txt` (nguồn chân lý "cài gì")
- Mỗi dòng = 1 path tương đối từ gốc kit cần copy sang project đích.
- Dòng trống / dòng bắt đầu `#` bị bỏ qua (comment).
- Nội dung:
  ```
  CLAUDE.md
  .claude/CLAUDE.md
  .claude/settings.json
  .claude/settings.local.json
  .claude/skills
  .claude/agents
  .claude/commands
  .claude/hooks
  ```
- Cả `install.sh` lẫn skill `cap-nhat-kit` đọc file này → một chỗ khai báo, không lệch.

### 4.3 `install.sh` (bootstrap)
- Dùng: `bash install.sh <đường-dẫn-project-đích>` (đối số bắt buộc).
- Tự xác định thư mục kit = thư mục chứa chính `install.sh` (`$(cd "$(dirname "$0")" && pwd)`).
- Validate: project đích tồn tại & là thư mục; nếu thiếu đối số → in cách dùng & thoát mã ≠ 0.
- Đọc `kit-manifest.txt`, với mỗi path: tạo thư mục cha ở đích nếu cần, copy đè (`cp -R`),
  in dòng `✓ <path>`.
- KHÔNG copy gì ngoài manifest (docs/sdd ví dụ không bị mang theo).
- Kết: in tóm tắt + bước tiếp ("Mở project đích bằng Claude Code rồi gõ `/tao-san-pham` để bắt đầu Pha 1").
- `set -euo pipefail` để fail nhanh.

### 4.4 Skill `cap-nhat-kit`
- `.claude/skills/cap-nhat-kit/SKILL.md`, frontmatter `name: cap-nhat-kit`.
- Trigger: user gõ `/cap-nhat-kit <đường-dẫn-kit>` ở project đã cài kit, muốn kéo bản mới.
- Hành vi: đọc `<kit>/kit-manifest.txt`, copy đè từng path từ kit về project hiện tại (giống install.sh nhưng chạy trong context Claude, đích = cwd).
- Báo cáo: liệt kê file đã cập nhật. Nhắc user kiểm `settings.local.json` nếu có chỉnh tay.
- Không tự commit.

## 5. Definition of Done

- [ ] `.claude/CLAUDE.md` không còn chữ "qi-ecosystem", không còn đoạn Serena, không còn import gãy `@../AGENTS.md`; là overlay generic.
- [ ] `kit-manifest.txt` tồn tại ở gốc kit, liệt kê đúng 8 path mục 4.2.
- [ ] `install.sh` chạy được: `bash install.sh <tmp-project>` copy đúng các path trong manifest, đè file đã tồn tại, KHÔNG mang `docs/sdd/`.
- [ ] `.claude/skills/cap-nhat-kit/SKILL.md` tồn tại, Claude Code nhận diện skill.
- [ ] Thử cài vào 1 thư mục trống tạm: project đích có đủ skills/agents/commands/settings + CLAUDE.md, gõ được `/tao-san-pham`.

## 6. Ngoài phạm vi

- Không xử lý merge xung đột (đã chốt: đè hết).
- Không lọc bớt quyền trong `settings.local.json` (giữ nguyên `Bash(*)`).
- Không cài `docs/sdd/` mẫu — giữ trong kit làm ví dụ tham khảo.
- Không cài qua `curl | bash` từ remote (chỉ chạy local từ thư mục kit) — có thể thêm sau.
- Không versioning/diff khi cập nhật — `cap-nhat-kit` đè thẳng.
