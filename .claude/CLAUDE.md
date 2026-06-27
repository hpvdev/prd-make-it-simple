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
