---
description: Bật/tắt nhanh server xem tài liệu SDD (skill xem-tai-lieu)
argument-hint: "[start | stop | restart | status]  (mặc định: start)"
allowed-tools: Bash(.claude/skills/xem-tai-lieu/scripts/start-server.sh:*), Bash(.claude/skills/xem-tai-lieu/scripts/stop-server.sh:*), Bash(cat:*), Bash(kill:*)
---

Quản lý server trình xem tài liệu SDD. Hành động yêu cầu: **$ARGUMENTS** (nếu rỗng → coi là `start`).

Chạy ĐÚNG MỘT hành động tương ứng (luôn từ gốc repo, không thêm bước thừa), rồi trả lời thật ngắn gọn:

- **start** (hoặc rỗng): chạy `.claude/skills/xem-tai-lieu/scripts/start-server.sh --open` → đưa lại URL từ JSON (`server-started` hoặc `already-running`).
- **stop**: chạy `.claude/skills/xem-tai-lieu/scripts/stop-server.sh` → báo đã dừng.
- **restart**: chạy `stop-server.sh` rồi `start-server.sh --open` → đưa lại URL mới.
- **status**: `cat .xem-tai-lieu/server-url` (nếu có) và kiểm tra tiến trình còn sống (`kill -0 $(cat .xem-tai-lieu/server.pid)`) → báo đang chạy ở URL nào hay đã tắt.

Chỉ in URL + trạng thái, không giải thích dài.
