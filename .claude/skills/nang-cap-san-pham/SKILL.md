---
name: nang-cap-san-pham
description: Nâng cấp sản phẩm ĐANG CHẠY (Pha 1-B SDD, brownfield) — thêm tính năng mới hoặc tối ưu cái đang có, cập nhật in-place docs/sdd/PRD.yaml + ROADMAP.yaml. Tự dò trạng thái project (có code? có SDD? SDD khớp code?), tái dựng bản đồ tính năng hiện trạng từ code khi cần, rồi đào yêu cầu nâng cấp. Use this skill khi user nói "nâng cấp dự án", "thêm tính năng vào app đang chạy", "tối ưu sản phẩm", "pha 1 brownfield", và đã CÓ code. Nếu project trống (không code, không SDD) → trỏ sang skill tao-san-pham. KHÔNG viết code, KHÔNG quyết kiến trúc/migration (đó là Pha 2/3).
---

# Nâng cấp sản phẩm (`nang-cap-san-pham`) — Pha 1-B: brownfield

Skill này làm **Pha 1 cho sản phẩm ĐANG CHẠY** rồi dừng. Nó KHÔNG viết code, KHÔNG quyết kiến
trúc/migration (đó là `tao-nen-tang`/Pha 2 và Pha 3). Mục tiêu: hiểu **sản phẩm đang có gì**, rồi
cập nhật bản đồ tính năng (PRD + ROADMAP) cho cái muốn nâng cấp — **in-place, một nguồn chân lý**.

**Khác `tao-san-pham`:** skill kia làm greenfield (giấy trắng). Skill này nhận **project đã có code**.

> **Quy ước chung — đọc TRƯỚC khi làm:** mở và tuân theo `sdd-common/conventions.md` (cùng thư mục
> `skills/`). File đó quy định vòng đời SDD 6 pha, nơi để output (`docs/sdd/` + archive không đè bản
> cũ), ngôn ngữ tiếng Việt, cách trình bày (gạch đầu dòng + in đậm + 💡 đề xuất + 👉 bước kế), và
> **con người nắm quyền (gate cứng = DỪNG chờ người)**. **Skill này là Pha 1-B** trong vòng đời đó.

## Nguyên tắc riêng
- **Đọc hiện trạng TRƯỚC, bàn cái mới SAU.** Không thêm tính năng khi chưa biết sản phẩm đang có gì.
- **In-place, một nguồn chân lý.** Cập nhật thẳng PRD/ROADMAP hiện có; archive bản cũ; KHÔNG tạo
  tài liệu delta rải rác.
- **Mã ID nối tiếp, không tái dùng số cũ** (kể cả tính năng đã xóa) — tránh lẫn lịch sử.
- **PRD = "cái gì", không phải "chất lượng".** Việc tối ưu/nợ kỹ thuật đi vào ROADMAP, không vào PRD.
- **Ranh giới Pha 1:** đổi data model phá tương thích → chỉ GẮN CỜ ⚠️ đẩy sang Pha 2, không tự chốt.
- **Đánh giá độc lập là mặc định** (agent `danh-gia-san-pham` cuối Bước 4).

## Bước 0 — Dò trạng thái (tự động)
Đọc `docs/sdd/` + quét nhanh code (routes/models/services/schema). Phân loại:

| Trạng thái | Dấu hiệu | Xử lý |
|---|---|---|
| **S1** | Không có code **và** không có `docs/sdd/` | DỪNG → trỏ `tao-san-pham` (greenfield). |
| **S2** | Có `docs/sdd/PRD.yaml` **và** nó còn khớp code | Dùng PRD/ROADMAP cũ làm bản đồ hiện trạng → bỏ qua Bước 1, sang Bước 2. |
| **S3** | Có code nhưng KHÔNG có SDD, **hoặc** có PRD nhưng **lệch code đáng kể** | Sang Bước 1 (tái dựng). |

**Phân biệt S2 vs S3 (quan trọng):** không chỉ check "PRD tồn tại". **Đối chiếu nhanh** PRD ↔ code:
đếm route/model/service thật so với cụm liệt kê trong PRD. Lệch đáng kể (nhiều route không có trong
PRD, hoặc PRD ghi cụm mà code không có) → xử như **S3**, để user làm trọng tài ở GATE 1.
