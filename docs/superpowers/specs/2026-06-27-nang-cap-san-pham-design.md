# Thiết kế: skill `nang-cap-san-pham` (Pha 1-B — nâng cấp sản phẩm đang chạy)

> Spec định hình. Mở rộng pipeline SDD từ chỗ chỉ làm greenfield (project mới) sang xử lý cả
> brownfield (sản phẩm đang chạy). Tài liệu này là đầu vào để viết SKILL.md + assets.

## 1. Vấn đề & mục tiêu

Pipeline hiện tại (`tao-san-pham` → `tao-nen-tang`) giả định **greenfield**: bắt đầu từ `docs/sdd/`
trống. Thực tế phần lớn công việc là **brownfield** — vào một project đã có code, được yêu cầu
"nâng cấp": thêm tính năng mới hoặc tối ưu cái đang có.

**Mục tiêu:** một skill mới `nang-cap-san-pham` xử lý sản phẩm đang chạy, **tách riêng** khỏi
`tao-san-pham` (mỗi skill một trách nhiệm). Nó tự dò trạng thái project, tái dựng bản đồ tính năng
hiện trạng khi cần, rồi cập nhật **in-place** PRD + ROADMAP — giữ một nguồn chân lý sống duy nhất.

**Không thuộc phạm vi skill này:** viết code, quyết kiến trúc/tech stack/migration (đó là
`tao-nen-tang`/Pha 2 và Pha 3). Skill chỉ làm tới mức *cập nhật bản đồ tính năng*.

## 2. Định vị & ranh giới

- **Skill mới, song song** với `tao-san-pham`. Cùng sinh/cập nhật `docs/sdd/PRD.yaml` +
  `docs/sdd/ROADMAP.yaml`, nhưng input là **project đã có code**.
- **Trigger:** "nâng cấp dự án", "thêm tính năng vào app đang chạy", "tối ưu sản phẩm",
  "pha 1 brownfield", "thêm tính năng mới".
- **Phân vai với greenfield:**
  - `tao-san-pham` → trạng thái **S1** (không code, không SDD — tờ giấy trắng).
  - `nang-cap-san-pham` → **S2** (có SDD đồng bộ với code) và **S3** (có code, SDD mồ côi/thiếu/lệch).
  - Nếu user gọi nhầm skill này cho project trống (không phát hiện code) → DỪNG, trỏ sang
    `tao-san-pham`.
- **Tuân thủ quy ước chung:** đọc và theo `sdd-common/conventions.md` (vòng đời 6 pha, nơi để
  output, ngôn ngữ tiếng Việt, cách trình bày, con người nắm quyền, archive không đè bản cũ).

## 3. Luồng các bước

### Bước 0 — Dò trạng thái (tự động)

Đọc `docs/sdd/` + quét nhanh code → phân loại:

- **S1** (không có code, không có SDD) → DỪNG, trỏ sang `tao-san-pham`.
- **S2** (có `docs/sdd/PRD.yaml` **và** nó còn khớp code) → bỏ qua Bước 1, dùng PRD/ROADMAP cũ
  làm bản đồ hiện trạng, nhảy thẳng Bước 2.
- **S3** (có code nhưng không có SDD, **hoặc** có PRD nhưng lệch code đáng kể) → sang Bước 1.

Cách phân biệt S2 vs S3: không chỉ check "PRD có tồn tại" mà **đối chiếu nhanh** PRD ↔ code
(số route/model/service thật so với các cụm liệt kê trong PRD). Lệch đáng kể → xử như S3.

### Bước 1 — Tái dựng bản đồ hiện trạng (mức B — chỉ S3)

Dispatch agent đọc codebase: routes, models, services, schema DB → dựng **"PRD hiện trạng"**:
sản phẩm ĐANG có những cụm tính năng gì + data model thật + mã ID gán cho từng tính năng phát hiện.

> 🚧 **GATE 1 (gate cứng):** trình user xác nhận/sửa bản đồ hiện trạng trước khi đi tiếp.
> PRD tái dựng từ code dễ sai — bắt buộc người duyệt. Nếu Bước 0 phát hiện PRD cũ lệch code,
> đây là chỗ user làm trọng tài "tin PRD hay tin code".

### Bước 2 — 🚧 GATE 2: Chọn loại nâng cấp (gate cứng, user bấm chọn)

Dùng `AskUserQuestion`. User chọn 1 trong 2 nhánh:

| Nhánh | Khi nào | Hành xử |
|---|---|---|
| **Thêm / tối ưu tính năng** *(gọn)* | Định vị sản phẩm đã chốt, chỉ thêm/sửa tính năng | BỎ cổng nghiên cứu + cổng đột phá. Chỉ giữ agent phản biện ở Bước 4. |
| **Mở hướng mới / pivot** *(đầy)* | Đổi định vị, thêm hướng sản phẩm lớn | BẬT lại cổng nghiên cứu + `chien-luoc-dot-pha` (như greenfield) trước khi đào yêu cầu. |

**Cổng C tùy chọn (phân tích nợ kỹ thuật):** nếu mục tiêu là "tối ưu", hỏi thêm user có muốn
agent map vùng code rủi ro / chưa test / nợ kỹ thuật không. Bật → feed vào nhánh tối ưu ở Bước 4.

### Bước 3 — Đào yêu cầu nâng cấp (brainstorm với user)

Hỏi cái muốn thêm/sửa/tối ưu, **đối chiếu bản đồ hiện trạng**. Xác định:
- Cụm tính năng nào bị đụng tới? Có cụm mới hoàn toàn không?
- Data model có đổi không?
- (Nhánh "đầy") chạy cổng nghiên cứu + đột phá trước khi chốt hướng.

### Bước 4 — Cập nhật in-place PRD + ROADMAP

1. **Archive bản cũ** (`docs/sdd/archive/` + hậu tố thời gian) trước khi ghi — không đè mất.
2. **Cập nhật `PRD.yaml`:** thêm mã ID nối tiếp (xem §4), đánh dấu `[MỚI]` / `[SỬA]` để truy vết.
3. **Cập nhật `ROADMAP.yaml`:** tính năng mới vào milestone nào, phụ thuộc gì. Việc "tối ưu" →
   milestone bảo trì riêng (xem §5 ca 4).
4. 🚧 **Agent phản biện** `danh-gia-san-pham` soi PRD đã cập nhật → vá lỗi mức **Cao**.
5. Trình user bản cuối + tóm tắt (đã thêm/sửa gì, còn gì để ngỏ) → bàn giao Pha 2/3.

## 4. Quy tắc mã ID nối tiếp (điểm dễ vỡ nhất của in-place)

- Đọc **mã lớn nhất hiện có trong mỗi cụm** (vd cụm DL đang tới `DL-10`) → cấp tiếp `DL-11`.
- **Không bao giờ tái dùng số cũ**, kể cả khi tính năng mang số đó đã bị xóa (tránh lẫn lịch sử).
- Cụm mới hoàn toàn → cấp mã cụm mới (2 chữ, không trùng cụm hiện có), bắt đầu từ `-01`.
- Mọi tính năng thêm/sửa giữ đủ format pipeline: nhãn lớp (C)/(P) + "Xong khi" + liên kết chéo.

## 5. Xử lý các ca khó (nơi brownfield hay vỡ)

**Ca 1 — PRD cũ lệch code (S2 giả).** Bước 0 đối chiếu PRD ↔ code; lệch đáng kể → tụt xuống S3
(tái dựng + GATE 1 cho user trọng tài tin PRD hay tin code).

**Ca 2 — Đổi data model phá tương thích.** Skill **chỉ ghi nhận** "tính năng này đụng data model X"
vào PRD và **gắn cờ ⚠️ cần người duyệt + cần chiến lược migration** — đẩy quyết định kỹ thuật sang
Pha 2, không tự chốt. Đúng ranh giới Pha 1. (Khớp mục "agent KHÔNG được tự ý" trong AGENTS.md.)

**Ca 3 — Tính năng mới xung đột tính năng cũ.** Vd "đặt lịch nhóm" mâu thuẫn ràng buộc "chặn trùng
giờ một thợ". Bước 3 skill **chủ động nêu xung đột** với cụm hiện có (qua liên kết chéo trong PRD) +
đề xuất cách hòa giải, để user quyết — không lặng lẽ thêm.

**Ca 4 — Nhánh "tối ưu" (không thêm tính năng).** Tối ưu/sửa nợ kỹ thuật KHÔNG nhồi vào PRD
(PRD là *cái gì*, không phải *chất lượng*). Thay vào đó sinh **một milestone bảo trì trong ROADMAP**
(vd `OPT-1`) mô tả mục tiêu tối ưu + tiêu chí đo được (vd "p95 < 200ms"). Cổng C feed thẳng vào đây.

## 6. Cổng chất lượng (phải đạt mới bàn giao Pha 2)

- [ ] Đã dò đúng trạng thái (S1/S2/S3) và xử đúng nhánh; S1 trỏ về `tao-san-pham`.
- [ ] (S3) Bản đồ hiện trạng đã qua **GATE 1** — user xác nhận trước khi đào yêu cầu mới.
- [ ] User đã **chọn loại nâng cấp** qua GATE 2 (gate cứng, không tự quyết).
- [ ] Mã ID mới **nối tiếp, không tái dùng số cũ**; mọi tính năng thêm/sửa đủ (C)/(P) + "Xong khi".
- [ ] Thay đổi data model phá tương thích đã **gắn cờ ⚠️ đẩy sang Pha 2**, không tự chốt.
- [ ] Xung đột với tính năng cũ đã được **nêu rõ cho user**, không lặng lẽ thêm.
- [ ] "Tối ưu" đi vào **ROADMAP (milestone bảo trì)**, không nhồi vào PRD.
- [ ] Bản cũ đã **archive**, không đè mất; phần thêm/sửa **đánh dấu** để truy vết.
- [ ] PRD đã cập nhật **qua agent `danh-gia-san-pham`**, lỗi Cao đã vá hoặc user chấp nhận để ngỏ.

## 7. Bẫy cần tránh

- Tin PRD cũ mù quáng mà không đối chiếu code → bản đồ sai từ gốc.
- Tự quyết/bỏ qua GATE 1 hoặc GATE 2 thay vì để user chọn (gate cứng — lỗi nặng).
- Tái dùng mã ID của tính năng đã xóa → lẫn lịch sử, ROADMAP/Pha 3 truy ngược sai.
- Tự chốt chiến lược migration trong skill này (đó là Pha 2).
- Nhồi việc "tối ưu / nợ kỹ thuật" vào PRD làm bẩn nguồn chân lý "sản phẩm có gì".
- Thêm tính năng xung đột tính năng cũ mà không cảnh báo user.
- Để delta nằm rải rác (change-doc riêng) thay vì cập nhật in-place → hai nguồn lệch nhau.

## 8. Kết thúc — bàn giao

Khi PRD + ROADMAP đã cập nhật và qua cổng chất lượng, tóm tắt cho user + gợi ý bước kế:
- Nếu thay đổi đụng kiến trúc/data model → chạy `tao-nen-tang` (Pha 2) để cập nhật nền tảng.
- Nếu chỉ thêm tính năng trong khung kiến trúc cũ → đi thẳng Pha 3 (Superpowers) cho milestone mới.
