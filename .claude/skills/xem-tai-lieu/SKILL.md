---
name: xem-tai-lieu
description: Mở trình xem web cục bộ cho bộ tài liệu SDD ở docs/sdd/ (product-brief, PRD, constitution, AGENTS, ROADMAP). Render dashboard có cấu trúc, tự cập nhật khi file đổi (live-reload). Dùng khi user nói "xem tài liệu", "mở tài liệu", "xem PRD/roadmap trên web", "view tài liệu", "xem dự án trên web", hoặc sau khi chạy skill pha 1/pha 2 muốn xem kết quả.
---

# Skill: xem-tai-lieu

Mở server cục bộ render `docs/sdd/` thành dashboard web. Server tự parse file và
live-reload khi tài liệu đổi — chạy skill pha 1/2 ghi đè file là trình duyệt tự cập nhật.

## Các bước

1. Khởi động server (chạy nền) từ gốc repo:

   ```bash
   .claude/skills/xem-tai-lieu/scripts/start-server.sh --open
   ```

   Lệnh in JSON `{"type":"server-started","url":"http://localhost:PORT/","pid":N}`
   (hoặc `already-running` nếu đã mở). Cờ `--open` tự mở trình duyệt mặc định.

2. Chia sẻ URL cho user (kèm cả khi `already-running`). Nói ngắn gọn nội dung:
   sidebar Pha 1/Pha 2, PRD có lọc theo cụm & lớp C/P + tìm kiếm, Roadmap timeline,
   bấm mã feature để nhảy chéo PRD ↔ Roadmap.

3. Tài liệu cập nhật: khi user (hoặc skill pha 1/2) sửa file trong `docs/sdd/`,
   trình duyệt tự refresh — KHÔNG cần khởi động lại.

4. Dừng khi xong (tùy chọn):

   ```bash
   .claude/skills/xem-tai-lieu/scripts/stop-server.sh
   ```

## Ghi chú
- Zero-dependency: chỉ cần Node, không `pnpm install`.
- Output runtime ở `.xem-tai-lieu/` (đã gitignore).
- Nếu server chết, chạy lại `start-server.sh` — trình duyệt đang mở sẽ tự kết nối lại.
- Chạy test bộ công cụ: `node --test .claude/skills/xem-tai-lieu/scripts/*.test.cjs .claude/skills/xem-tai-lieu/assets/*.test.mjs` (truyền thẳng file test; dạng truyền thư mục `--test <dir>` KHÔNG chạy đúng trên Node 22).
