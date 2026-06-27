---
name: tao-san-pham
description: Định hình sản phẩm (Pha 1 SDD) trước khi viết bất kỳ dòng code nào — làm rõ GIÁ TRỊ THẬT, mục tiêu người làm, cách kiếm tiền, đối thủ (có cổng nghiên cứu/deep-research tùy chọn) RỒI mới chốt phạm vi & tính năng. Không tự quyết sản phẩm chỉ bằng kiến thức sẵn của LLM. Use this skill whenever the user is starting a new project or says "bắt đầu dự án", "khởi động dự án", "định hình sản phẩm", "viết PRD", "ý tưởng sản phẩm", "phân tích đối thủ", "mô hình kinh doanh", "pha 1", wants to validate/scope a product idea before any coding. It produces 2 files — docs/sdd/product-brief.md (vì sao & kiếm tiền) rồi docs/sdd/PRD.yaml (xây gì) — rồi DỪNG, bàn giao cho skill tao-nen-tang (Pha 2). Trigger nó kể cả khi user không nói chữ "skill".
---

# Tạo sản phẩm (`tao-san-pham`) — Pha 1: Định hình sản phẩm

Skill này làm **đúng Pha 1** của vòng đời SDD rồi dừng. Nó KHÔNG đụng kiến trúc, KHÔNG viết
code, KHÔNG chạy test. Mục tiêu: làm rõ **vì sao đáng làm & sống bằng gì** trước, rồi mới chốt
**xây gì**. Pha 2 (nền tảng & kiến trúc) là việc của skill **`tao-nen-tang`**.

**Luồng (theo đúng thứ tự, KHÔNG đảo):** Hạt giống ý tưởng → 🚧 **GATE: cổng nghiên cứu (bắt buộc
user chọn)** → rút ra vấn đề/giá trị/lối đi **TỪ nghiên cứu** → **cổng đột phá (agent tự chạy)** →
`product-brief.md` → **đánh giá độc lập** → `PRD.yaml` → **đánh giá độc lập** → bàn giao. Mỗi tài liệu
phải qua một agent phản biện trước khi user duyệt.

**Output (2 file, theo thứ tự):**
1. `docs/sdd/product-brief.md` — tầng "vì sao & kiếm tiền": giá trị, mục tiêu, mô hình thu tiền,
   đối thủ, thước đo, rủi ro. **Chốt cái này trước.**
2. `docs/sdd/PRD.yaml` — tầng "xây gì": **bản đồ toàn hệ thống** — liệt kê **đủ các cụm tính năng**
   của cả sản phẩm, dữ liệu chính, ngoài phạm vi. (Thứ tự làm cái nào trước → ROADMAP ở Pha 2.)

> **Quy ước chung — đọc TRƯỚC khi làm:** mở và tuân theo `sdd-common/conventions.md` (nằm cùng
> thư mục `skills/` với skill này). File đó quy định: **vòng đời SDD 6 pha**, **nơi để output**
> (`docs/sdd/` + `CLAUDE.md` import), **ngôn ngữ output** (tiếng Việt dễ đọc, tránh thuật ngữ Anh),
> **cách trình bày câu trả lời** (gạch đầu dòng, in đậm, luôn kèm đề xuất), và **con người nắm quyền**.
> **Skill này là Pha 1** trong vòng đời đó.

## Nguyên tắc riêng của Pha 1
- **Nghiên cứu TRƯỚC, kết luận SAU.** Giá trị / khác biệt / lối đi phải **rút ra từ nghiên cứu**
  thị trường & đối thủ — KHÔNG hỏi user tự khẳng định giá trị rồi mới tra.
- **Cổng nghiên cứu là GATE CỨNG.** DỪNG, bắt buộc user tự chọn mức; skill **không được** tự quyết,
  tự bỏ qua hay tự tiếp tục.
- **Không tự quyết sản phẩm bằng kiến thức sẵn của LLM.** Nêu rõ cái nào là *giả định*, cái nào có *bằng chứng*.
- **"Vì sao & kiếm tiền" trước "xây gì".** Chốt `product-brief.md` rồi mới viết `PRD.yaml`.
- **PRD là bản đồ TOÀN hệ thống.** Liệt kê **đủ các cụm tính năng** của cả sản phẩm — KHÔNG đánh
  dấu cái nào làm trước. PRD lo *cái gì có trong sản phẩm*; **thứ tự** làm (chọn cụm nào chạy trước)
  là việc của `ROADMAP.yaml` (Pha 2), **cách làm** từng tính năng là Pha 3. Đừng đi sâu vào cài đặt/UI.
- **Nghĩ theo "sản phẩm giao cho user", không phải bản demo.** Một sản phẩm chỉn chu cần **đủ 3 lớp**:
  (1) **tính năng chính** — giá trị cốt lõi; (2) **tính năng phụ** — kiểm tra dữ liệu nhập, hoàn
  tác/thùng rác, phân trang, trạng thái rỗng, xử lý lỗi, giới hạn file, chống gửi trùng…; (3) **cụm
  xuyên suốt `SYS`** — khung trang, đang tải, trang lỗi, báo lỗi/thành công, mất mạng, responsive,
  a11y, múi giờ, trợ giúp, audit. Thiếu lớp 2–3 là PRD "lởm", Pha sau phải đoán.
- **Mỗi tính năng có MÃ ID cố định** (`<CỤM>-NN`, vd `HD-01`) + nhãn lớp **(C)** chính / **(P)** phụ
  + một dòng **"Xong khi"** (điều kiện nghiệm thu tối thiểu) + lộ phụ thuộc chéo "(liên kết …)". Đây
  là đầu vào trực tiếp cho ROADMAP/Pha 3.
- **Đánh giá độc lập trước khi user duyệt.** Cả brief và PRD đều phải qua một **agent phản biện**
  (theo `sdd-common/danh-gia-doc-lap.md`) soi trên góc nhìn khác; vá lỗi **Cao** rồi mới trình user.
- **Không đè bản cũ.** Trước khi ghi file đã có trong `docs/sdd/`, lưu bản cũ vào `docs/sdd/archive/`
  kèm hậu tố thời gian (xem `sdd-common/conventions.md` mục 2).
- **Gọn, không phình.** Mỗi mục ngắn, sắc. Hai file đủ dùng, không lan man.
- **Mô tả vấn đề, không mô tả giải pháp.** "Người dùng cần lọc nhanh" thay vì "cần một dropdown".

---

## Bước 1 — Nắm hạt giống ý tưởng (vừa đủ để biết nghiên cứu cái gì)
Chỉ hỏi đủ để biết nên tra cứu gì — **CHƯA hỏi giá trị/khác biệt** (cái đó rút ra sau nghiên cứu).
Mỗi câu một khối thoáng, ví dụ in nghiêng:

> **1. Bạn đang nghĩ làm gì, cho ai, giải quyết nỗi đau nào?**
> *Ví dụ: "App nhắc hạn hợp đồng cho freelancer hay quên."*
>
> **2. Bạn làm xong để làm gì?** *(cho bấm chọn)*
> *kiếm tiền / học nghề / xây hồ sơ / kiểm chứng ý tưởng*

Câu 2 có sẵn phương án → dùng `AskUserQuestion` cho bấm chọn.
*(Không hỏi kỹ năng lập trình của user — Claude Code lo phần code. Ràng buộc kỹ thuật thật sự xét ở brief.)*

## Bước 2 — 🚧 CỔNG NGHIÊN CỨU (gate cứng — BẮT BUỘC user chọn)
**DỪNG tại đây.** Đây là gate chặn cứng: **không được tự quyết, tự bỏ qua hay tự tiếp tục.**
Bắt buộc dùng `AskUserQuestion` để user **bấm chọn 1 trong 3 mức**. Nếu môi trường không có công cụ
chọn → hỏi bằng văn bản và **chờ user trả lời**, tuyệt đối không tự chọn thay.

Câu hỏi: *"Muốn kiểm chứng thị trường/đối thủ tới đâu trước khi rút ra giá trị & lối đi?"*

| Phương án (nhãn) | Mô tả ngắn |
|---|---|
| **Bỏ qua** | Tôi tự rõ thị trường → đi tiếp bằng giả định (ghi rõ "chưa kiểm chứng"). |
| **Nhanh** *(khuyến nghị)* | Tìm 3–5 đối thủ/sản phẩm tương tự, điểm mạnh/yếu, khoảng trống. |
| **Sâu** | Phân tích đối thủ + nhu cầu thật + xu hướng (gọi skill `deep-research`). |

Sau khi user chọn, chạy đúng mức đó. Giữ kết quả để dùng ở Bước 3 và ghi vào mục "Bối cảnh thị
trường & đối thủ" của brief (kèm nguồn/ngày).

## Bước 3 — Rút ra vấn đề · giá trị · lối đi TỪ nghiên cứu (cùng user)
Giờ mới chốt phần định vị, dựa trên cái nghiên cứu thấy — KHÔNG dựa cảm tính:
- Nỗi đau có được xác nhận không? Đối thủ đang giải nó thế nào, **thiếu gì**?
- **Khoảng trống** mình chen vào ở đâu → **giá trị/khác biệt** của mình (nhanh / rẻ / dễ hơn chỗ nào)?
- Hướng **kiếm tiền** nào hợp với thị trường đó?

Trình gọn các kết luận này cho user (mỗi ý 1–2 dòng) + **💡 đề xuất định vị**, để user gật/đổi.
Nếu nghiên cứu **lật ngược** ý tưởng ban đầu → nói thẳng trước khi đi tiếp.

## Bước 3.5 — Cổng đột phá (agent tự chạy MẶC ĐỊNH)
Sau khi có định vị nháp, **tự động** dispatch agent `subagent_type: chien-luoc-dot-pha` (không hỏi
user có muốn không — đây là mặc định), truyền định vị nháp + một dòng mô tả sản phẩm/người dùng. Agent
trả về **3–5 cơ hội đột phá + 1 cú đặt cược khuyến nghị + cảnh báo bẫy**.
- Trình gọn các cơ hội cho user (mỗi cái 1–2 dòng, ghi rõ mức rủi ro) + **💡 đề xuất** nên đặt cược cái nào.
- **User chọn** nâng định vị theo hướng nào (hoặc giữ nguyên) — đây là **gate mềm**: agent tự chạy
  nhưng *quyết định* thuộc về user, KHÔNG tự quyết thay.
- Cập nhật lại kết luận định vị ở Bước 3 theo lựa chọn của user, rồi mới sang Bước 4.
(Không có agent đó → bỏ qua bước này, ghi chú để user biết.)

> Cân bằng hai chiều: `chien-luoc-dot-pha` bung ý tưởng (phân kỳ), `danh-gia-san-pham` ở Bước 4/6
> kéo về thực tế (hội tụ). Đột phá vẫn phải qua phản biện trước khi chốt.

## Bước 4 — Viết & đánh giá `docs/sdd/product-brief.md`
1. Tạo `docs/sdd/` nếu chưa có. **Nếu `product-brief.md` đã tồn tại → lưu bản cũ vào
   `docs/sdd/archive/` kèm hậu tố thời gian** (mục 2 của `conventions.md`), KHÔNG đè mất.
2. Đọc khuôn `assets/product-brief.md`, điền theo kết luận Bước 3, ghi ra `docs/sdd/product-brief.md`.
3. **Đánh giá độc lập:** dispatch agent `subagent_type: danh-gia-san-pham` (truyền đường dẫn brief +
   một dòng mô tả sản phẩm). Nếu môi trường không có agent đó → fallback theo `sdd-common/danh-gia-doc-lap.md`.
   Nhận phát hiện → **vá các lỗi mức Cao** vào brief.
4. **Trình user duyệt brief** kèm tóm tắt nhận xét của agent (mục nào đã vá, mục nào còn để ngỏ) —
   đây là chốt chiến lược, đừng tự quyết thay.

## Bước 5 — Vẽ bản đồ toàn hệ thống & viết `docs/sdd/PRD.yaml`
Sau khi brief được duyệt, hỏi để liệt kê **toàn bộ cụm tính năng** của cả sản phẩm. Mỗi câu một
khối thoáng, ví dụ in nghiêng:

> **1. Các cụm tính năng CHÍNH bạn hình dung cho cả sản phẩm?** (cứ liệt kê đủ, gom theo cụm)
> *Ví dụ — Hợp đồng: tạo/sửa/xem · Nhắc hạn: đặt mốc, gửi nhắc · Báo cáo: thống kê sắp hết hạn.*
>
> **2. Các loại dữ liệu chính cần lưu?** (tối đa 5 loại)
> *Ví dụ: Người dùng, Hợp đồng, Lời nhắc.*
>
> **3. Có gì cố tình KHÔNG đưa vào cả sản phẩm lần này?** (ranh giới — ít nhất 3 mục)
> *Ví dụ: "Không bản điện thoại, không nhiều nhóm, không thanh toán."*

User thường chỉ kể được **tính năng chính**. Nhiệm vụ của skill là **chủ động bổ sung cho đủ chỉn
chu** — đừng chỉ chép lại lời user:
1. **Đặt mã**: gán mã cụm (HD, NH…) và mã tính năng `<CỤM>-NN`; thêm "Xong khi" cho mỗi tính năng.
2. **Soi lớp PHỤ từng cụm**: tự hỏi cho mỗi cụm — kiểm tra dữ liệu nhập? lỡ tay xóa (hoàn tác/thùng
   rác)? danh sách rỗng/đang tải/quá dài? thao tác thất bại báo sao? — mỗi câu thiếu → thêm tính năng.
3. **Thêm cụm `SYS` xuyên suốt** (khung trang, đang tải, trang lỗi, báo lỗi/thành công, mất mạng,
   responsive, a11y, múi giờ, trợ giúp, audit, quyền riêng tư) — cắt mục nào không cần thì ghi rõ ở
   "Ngoài phạm vi", đừng lặng lẽ bỏ.
4. **Trình lại cho user** danh sách đã bổ sung (đánh dấu phần skill tự thêm) + **💡 đề xuất**, để
   user gật/bớt — không tự quyết phạm vi thay user.

**Nếu `PRD.yaml` đã tồn tại → lưu bản cũ vào `docs/sdd/archive/` kèm hậu tố thời gian** trước khi ghi
(KHÔNG đè mất). Đọc khuôn `assets/PRD.yaml`, điền **đủ 3 lớp + mã ID + nhãn (C)/(P) + "Xong khi" +
liên kết chéo**, ghi ra `docs/sdd/PRD.yaml`. Việc chọn cụm nào làm trước để dành cho ROADMAP (Pha 2).

## Bước 6 — Đánh giá độc lập PRD rồi bàn giao
1. **Đánh giá độc lập:** dispatch agent `subagent_type: danh-gia-san-pham`, truyền đường dẫn
   `docs/sdd/PRD.yaml` + `docs/sdd/product-brief.md` (để đối chiếu) + một dòng mô tả sản phẩm. Agent
   đóng vai PO + QA + BA soi: thiếu cụm/tính năng phụ, "Xong khi" không kiểm được, NFR bỏ sót, phụ
   thuộc chéo bỏ sót, lệch brief. (Không có agent → fallback theo `sdd-common/danh-gia-doc-lap.md`.)
2. Nhận phát hiện → **vá lỗi mức Cao** vào PRD.
3. **Trình user** tóm tắt nhận xét (đã vá gì, còn gì để ngỏ) + bản PRD cuối, để user duyệt.

## Cổng chất lượng (phải đạt mới sang bước dựng nền tảng)
**product-brief.md:**
- [ ] Giá trị hơn cách hiện tại nói được rõ ràng (không chỉ "tiện hơn" chung chung).
- [ ] Mục tiêu người làm & cách kiếm tiền (hoặc lý do chưa thu tiền) đã rõ.
- [ ] User đã tự chọn mức nghiên cứu (qua gate cứng); nếu chọn Nhanh/Sâu thì có tên đối thủ + nguồn.
- [ ] Giá trị/khác biệt được **rút ra từ nghiên cứu**, không phải user tự khẳng định trước.
- [ ] Có một thước đo thành công + một giả định rủi ro nhất.
- [ ] **Đã qua agent đánh giá độc lập**, lỗi mức Cao đã vá hoặc được user chấp nhận để ngỏ.

**PRD.yaml:**
- [ ] Có **đủ các cụm tính năng** của toàn hệ thống (bức tranh đầy đủ, không thiếu cụm nào).
- [ ] Mỗi cụm có **đủ 3 lớp**: tính năng chính + tính năng phụ (kiểm tra nhập, hoàn tác, trạng thái
      rỗng, xử lý lỗi…) + có cụm **`SYS` xuyên suốt**.
- [ ] **Mọi tính năng có mã ID** (`<CỤM>-NN`), **nhãn lớp (C)/(P)**, và một dòng **"Xong khi"** kiểm được.
- [ ] **Phụ thuộc chéo** giữa các cụm đã ghi rõ bằng "(liên kết …)" ở những chỗ có ràng buộc.
- [ ] "Dữ liệu chính" **tối đa 5 loại**.
- [ ] "Ngoài phạm vi" có **ít nhất 3 mục** (gồm cả mục SYS nào cố tình bỏ).
- [ ] Không lấn sang *thứ tự làm / chọn cái nào trước* (ROADMAP/Pha 2) hay *cách cài đặt* (Pha 3).
- [ ] **Đã qua agent đánh giá độc lập**, lỗi mức Cao đã vá hoặc được user chấp nhận để ngỏ.

## Bẫy cần tránh
- **Tự quyết/tự bỏ qua cổng nghiên cứu** thay vì để user chọn (đây là gate cứng — lỗi nặng nhất).
- **Hỏi giá trị/khác biệt TRƯỚC khi nghiên cứu** rồi coi đó là kết luận (đảo ngược thứ tự).
- Chốt PRD từ kiến thức LLM mà bỏ qua giá trị/đối thủ/cách kiếm tiền.
- **PRD thiếu cụm tính năng** (không đủ bản đồ toàn hệ thống) → mất tầm nhìn, phân mảnh.
- **Chỉ liệt kê tính năng chính**, quên lớp phụ và cụm `SYS` → ra "bản demo" chứ không phải sản
  phẩm giao được; Pha sau phải đoán phần xử lý lỗi/trạng thái rỗng.
- **Quên mã ID hoặc "Xong khi"** → ROADMAP/Pha 3 không truy ngược và nghiệm thu được tính năng.
- Chỉ chép lại lời user mà không **chủ động soi đủ tính năng phụ** cho từng cụm.
- **Tự chọn cái làm trước trong PRD** — đó là việc của ROADMAP (Pha 2), không phải PRD.
- **Đi sâu vào cách cài đặt/UI từng nút** (đó là Pha 3) — PRD chỉ cần *cái gì*, không phải *làm thế nào*.
- Bỏ trống "Ngoài phạm vi".
- Mô tả *giải pháp* thay vì *vấn đề*.

---

## Kết thúc — bàn giao cho Pha 2
Khi cả `product-brief.md` và `PRD.yaml` đạt cổng chất lượng, tóm tắt ngắn cho user và gợi ý bước kế:

> "Brief & PRD đã xong trong `docs/sdd/`. Chạy skill **`tao-nen-tang`** để sang Pha 2 (dựng nền
> tảng & kiến trúc)."

KHÔNG tự nhảy sang kiến trúc/code — đó là việc của skill khác.
