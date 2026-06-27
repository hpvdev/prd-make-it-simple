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

## Bước 1 — Tái dựng bản đồ hiện trạng (chỉ S3)
Dispatch agent (subagent_type `Explore` hoặc `general-purpose`) đọc codebase: routes, models,
services, schema DB. Yêu cầu agent điền khuôn `assets/ban-do-hien-trang.md` — **mỗi tính năng phải
kèm `evidence` (file:dòng / tên route)**, không bịa. Nếu có `docs/sdd/PRD.yaml` cũ → agent điền cả
mục "Đối chiếu PRD cũ" (khớp/lệch).

> 🚧 **GATE 1 (gate cứng — DỪNG chờ người):** trình user bản đồ hiện trạng (gọn, theo cụm) + các
> "điểm nghi ngờ" + (nếu có) phần "lệch PRD cũ". Hỏi user xác nhận/sửa. Nếu PRD cũ lệch code → user
> là trọng tài "tin PRD hay tin code". **Không tự quyết, không đi tiếp khi chưa có xác nhận.**
>
> 💡 **Gợi ý ngưỡng "lệch đáng kể":** ≥20% tập route/model, hoặc ≥3 cụm/route không khớp — dưới
> ngưỡng thì vẫn ưu tiên hỏi user ở GATE 1. Ngưỡng này chỉ là gợi ý; user là trọng tài cuối.

(S2 bỏ qua bước này — PRD cũ chính là bản đồ hiện trạng.)

## Bước 2 — 🚧 GATE 2: chọn loại nâng cấp (gate cứng)
Dùng `AskUserQuestion` (môi trường không có → hỏi văn bản, CHỜ trả lời, không tự chọn). User chọn:

| Nhãn | Khi nào | Skill làm gì |
|---|---|---|
| **Thêm / tối ưu tính năng** *(gọn — khuyến nghị mặc định)* | Định vị đã chốt, chỉ thêm/sửa/tối ưu trong khung cũ | BỎ cổng nghiên cứu + cổng đột phá. Vào thẳng Bước 3. |
| **Mở hướng mới / pivot** *(đầy)* | Đổi định vị, thêm hướng sản phẩm lớn | BẬT cổng nghiên cứu (mức user chọn) + dispatch `chien-luoc-dot-pha` như greenfield, rồi vào Bước 3. |

**Cổng C (tùy chọn — phân tích nợ kỹ thuật):** nếu user nói mục tiêu là *tối ưu*, hỏi thêm (bấm
chọn) có muốn agent map vùng code rủi ro / chưa test / nợ kỹ thuật không. Bật → kết quả feed vào
milestone tối ưu ở Bước 4 (ca 4). Không bật → bỏ qua.

> 💡 **Đề xuất:** nếu user chỉ mô tả "thêm tính năng X" → nghiêng nhánh **gọn**; chỉ chọn **đầy** khi
> user nói tới đổi hướng/đối thủ mới. Luôn để user chốt — đây là gate cứng.

## Bước 3 — Đào yêu cầu nâng cấp (brainstorm với user)
Hỏi cái muốn thêm/sửa/tối ưu (mỗi lần một ý, kèm ví dụ + 💡 đề xuất). **Đối chiếu bản đồ hiện trạng**:
- Cụm nào bị đụng tới? Có cụm mới hoàn toàn không?
- Data model có đổi không? (nếu phá tương thích → ca 2 dưới)
- (Nhánh "đầy") chạy cổng nghiên cứu + `chien-luoc-dot-pha` trước khi chốt hướng.

**Chủ động nêu xung đột (ca 3):** nếu cái mới mâu thuẫn ràng buộc cụm cũ (qua links trong PRD) →
nói thẳng cho user + đề xuất cách hòa giải, KHÔNG lặng lẽ thêm.

## Bước 4 — Cập nhật in-place PRD + ROADMAP
1. **Archive bản cũ** (`docs/sdd/archive/` + hậu tố thời gian — lệnh ở conventions §2) TRƯỚC khi ghi.
2. **PRD.yaml:** thêm tính năng với **mã ID nối tiếp** (đọc mã lớn nhất mỗi cụm → cấp tiếp; cụm mới →
   mã cụm mới từ `-01`; vd cụm DV đang tới DV-04 thì tính năng mới là DV-05; còn cụm hoàn toàn mới vd "Khuyến mãi" → đặt mã cụm mới chưa dùng như KM, bắt đầu KM-01). Đánh dấu `[MỚI]`/`[SỬA]` ở `desc`. Giữ đủ (C)/(P) + done_when kiểm được + links.
   **KHÔNG tái dùng số của tính năng đã xóa.**
3. **ROADMAP.yaml:** xếp tính năng mới vào milestone (mới hoặc có sẵn) + depends_on + done_when đo được.
   Cập nhật `coverage`. **Việc "tối ưu" (ca 4)** → milestone bảo trì riêng `OPT-n` (mục tiêu + tiêu chí
   đo được như "p95 < 200ms"), KHÔNG nhồi vào PRD.
4. 🚧 **Agent phản biện:** dispatch `danh-gia-san-pham` (truyền PRD đã cập nhật + một dòng mô tả nâng
   cấp). Fallback theo `sdd-common/danh-gia-doc-lap.md`. Nhận phát hiện → **vá lỗi Cao**.
5. **Trình user** bản cuối + tóm tắt (thêm/sửa gì, gắn cờ ⚠️ gì, còn gì để ngỏ).

## Bốn ca khó (xử đúng để brownfield không vỡ)
- **Ca 1 — PRD cũ lệch code:** đã xử ở Bước 0 (đối chiếu → tụt S3) + GATE 1 (user trọng tài).
- **Ca 2 — đổi data model phá tương thích:** chỉ GHI NHẬN "tính năng này đụng data model X" vào PRD +
  **gắn cờ ⚠️ cần người duyệt + cần chiến lược migration**, đẩy quyết định sang Pha 2. KHÔNG tự chốt.
  **Chỉ ghi tên model/field bị đụng + một dòng vì sao phá tương thích** — KHÔNG ghi migration plan, KHÔNG ghi câu lệnh ALTER/đổi schema, KHÔNG đề xuất chiến lược kỹ thuật (đó là việc Pha 2).
- **Ca 3 — xung đột tính năng cũ:** nêu rõ cho user ở Bước 3 (qua links), đề xuất hòa giải, user quyết.
- **Ca 4 — nhánh tối ưu (không thêm tính năng):** đi vào ROADMAP (`OPT-n`), KHÔNG vào PRD. Cổng C feed vào đây.
