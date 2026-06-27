---
name: tao-nen-tang
description: Dựng nền tảng & kiến trúc cho dự án (Pha 2 SDD) — chốt tech stack, data model chính thức, định nghĩa interface/contract giữa các thành phần, và sinh bộ memory bank điều khiển (constitution + AGENTS + ROADMAP). Use this skill ngay SAU Pha 1, khi đã có docs/sdd/PRD.yaml và user nói "dựng nền tảng", "chốt kiến trúc", "setup foundation", "pha 2", "viết constitution/AGENTS/ROADMAP", "scaffold dự án". Nó đọc docs/sdd/PRD.yaml làm input và sinh đúng 3 file — docs/sdd/constitution.md, docs/sdd/AGENTS.md, docs/sdd/ROADMAP.yaml — cùng CLAUDE.md ở gốc repo để auto-load. Nếu chưa có PRD thì yêu cầu chạy skill tao-san-pham trước.
---

# Tạo nền tảng (`tao-nen-tang`) — Pha 2: Nền tảng & kiến trúc

Skill này làm **đúng Pha 2** của vòng đời SDD: dựng cái *khung* mọi tính năng sẽ sống bên trong —
mặt phẳng điều khiển giải quyết nỗi đau "mất bức tranh tổng thể". Nó nhận **output của Pha 1**
(`docs/sdd/PRD.yaml`) làm input. Chất lượng pha này quyết định code sau này có "thuộc về" codebase
hay cảm giác lạc lõng.

**Input (bắt buộc):** `docs/sdd/PRD.yaml` (do skill `tao-san-pham` sinh ra).
**Output (đúng 3 file + 1 file auto-load):**
- `docs/sdd/constitution.md`, `docs/sdd/AGENTS.md`, `docs/sdd/ROADMAP.yaml`
- `CLAUDE.md` ở gốc repo — chỉ `@`-import `docs/sdd/AGENTS.md`

> **Quy ước chung — đọc TRƯỚC khi làm:** mở và tuân theo `sdd-common/conventions.md` (nằm cùng
> thư mục `skills/` với skill này). File đó quy định: **vòng đời SDD 6 pha**, **nơi để output**
> (`docs/sdd/` + `CLAUDE.md` import), **ngôn ngữ output** (tiếng Việt dễ đọc, tránh thuật ngữ Anh),
> **cách trình bày câu trả lời** (gạch đầu dòng, in đậm, luôn kèm đề xuất), và **con người nắm quyền**.
> **Skill này là Pha 2** trong vòng đời đó.

## Tiền điều kiện (kiểm TRƯỚC khi làm gì)
1. Đọc `docs/sdd/PRD.yaml`. **Nếu không tồn tại** → DỪNG, báo user:
   > "Chưa có `docs/sdd/PRD.yaml`. Hãy chạy skill **`tao-san-pham`** (Pha 1) trước."
2. Đọc cả `docs/sdd/product-brief.md` nếu có — mục tiêu, cách kiếm tiền, thước đo, rủi ro lớn nhất
   **chi phối lựa chọn kiến trúc** (vd: định thu tiền sớm → cần thanh toán; rủi ro ở quy mô → chọn
   nền chịu tải). Đừng bỏ qua tầng chiến lược khi quyết kỹ thuật.
3. Đọc kỹ **các cụm tính năng, phạm vi, dữ liệu chính** trong PRD — đây là nguồn chân lý cho mọi
   quyết định kiến trúc dưới đây. (PRD liệt kê đủ tính năng nhưng KHÔNG nói cụm nào làm trước —
   việc chọn cụm chạy trước = M1 là do ROADMAP ở Bước 3 quyết.)

## Nguyên tắc riêng của Pha 2
- **YAGNI.** Chỉ kiến trúc cho bản chạy đầu tiên + một bước tới. Không vẽ vời cấu trúc thừa cho app nhỏ.
- **Trỏ tới sự thật, đừng chép lại.** Trong `AGENTS.md`, trỏ tới file mẫu thật thay vì mô tả dài.
- **Trình quyết định kiến trúc theo từng cụm**, mỗi cụm chốt xong rồi mới sang cụm sau.
- **Phạm vi: skill này RA SPEC, không dựng code.** Output là 3 file điều khiển. Walking skeleton
  (Bước 2) là *tùy chọn*; việc viết code thật là Pha 3. Đừng để user hiểu nhầm skill scaffold dự án.
- **Trỏ mã ID nhất quán với PRD.** constitution/AGENTS/ROADMAP đều dẫn theo mã tính năng (DL-08…) để
  truy vết — không mô tả lại tính năng bằng lời khác.
- **Đánh giá độc lập là MẶC ĐỊNH, không tùy chọn.** Sau khi viết file, tự động gọi agent chuyên gia
  (kiến trúc + lộ trình) soi lại; vá lỗi Cao rồi mới bàn giao (xem Bước 4).
- **Không đè bản cũ.** Trước khi ghi file đã có trong `docs/sdd/`, lưu bản cũ vào `docs/sdd/archive/`
  kèm hậu tố thời gian (xem `sdd-common/conventions.md` mục 2).

---

## Bước 1 — Quyết kiến trúc (trình user chốt)
- Tech stack (và lý do ngắn). Áp dụng YAGNI: chỉ kiến trúc cho cụm M1 + một bước tới.
- Data model chính thức hóa từ PRD.
- **Định nghĩa interface/contract giữa các thành phần TRƯỚC** — bằng *kiểu/schema* kiểm được
  (TypeScript types, Prisma schema, OpenAPI), không chỉ mô tả chữ. Đây là phần giá trị nhất và
  hay bị bỏ; bỏ nó là nguyên nhân khiến các task rời rạc sau này lạc nhau.

## Bước 2 — (Khuyến khích) Walking skeleton
Dựng một lát cắt dọc *rỗng* chạy end-to-end (vd: login giả → gọi API rỗng → render list rỗng)
trước khi làm tính năng thật. Nó ép interface lộ ra sớm và cho "ngày 0 xanh".

## Bước 3 — Viết 3 file (đọc khuôn `assets/` → ghi ra `docs/sdd/`)
**Trước khi ghi mỗi file: nếu đã tồn tại → lưu bản cũ vào `docs/sdd/archive/` kèm hậu tố thời gian**
(mục 2 của `conventions.md`), KHÔNG đè mất.
- `docs/sdd/constitution.md` — ranh giới, ràng buộc bảo mật, Definition of Done (kiểm chứng được).
- `docs/sdd/AGENTS.md` — stack, cấu trúc thư mục, quy ước, **interface/contract chính bằng kiểu/schema**,
  và **trỏ tới file mẫu thật** (một service mẫu, một route mẫu, một test mẫu). Sau khi ghi, đảm bảo
  gốc repo có `CLAUDE.md` chứa dòng `@docs/sdd/AGENTS.md` (tạo mới nếu chưa có; chèn thêm dòng nếu đã có).
- `docs/sdd/ROADMAP.yaml` — **xếp THỨ TỰ các cụm tính năng đã có trong PRD** thành milestone và **chọn
  cụm chạy trước = M1**; KHÔNG định nghĩa lại danh mục. **Mỗi milestone phải đủ chi tiết** theo khuôn:
  mục tiêu (giá trị giao được) · cụm & **mã ID** · phụ thuộc · tiêu chí xong (đo được) · ước lượng
  S/M/L · rủi ro/điểm kiểm chứng. **Phủ hết mã ID trong PRD** (cụm nào hoãn thì ghi rõ ở mục "cố tình hoãn").

## Bước 4 — Đánh giá độc lập (MẶC ĐỊNH tự chạy) rồi bàn giao
Sau khi viết xong, **tự động** gọi 2 agent chuyên gia (không hỏi user có muốn không — đây là mặc định):
1. `subagent_type: danh-gia-kien-truc` — truyền `docs/sdd/constitution.md` + `docs/sdd/AGENTS.md`
   (+ `PRD.yaml` đối chiếu). Soi stack/interface/data model/bảo mật/YAGNI.
2. `subagent_type: danh-gia-lo-trinh` — truyền `docs/sdd/ROADMAP.yaml` + `PRD.yaml` + `product-brief.md`.
   Soi thứ tự/phụ thuộc/tiêu chí milestone + trả **khung milestone làm dày**.

Có thể chạy **song song**. Nhận phát hiện → **vá lỗi mức Cao** (và áp khung làm dày cho ROADMAP) →
**trình user** tóm tắt nhận xét (đã vá gì, còn gì để ngỏ) + bản cuối. Nếu môi trường không có 2 agent
đó → fallback theo `sdd-common/danh-gia-doc-lap.md`.

## Cổng chất lượng Pha 2
- [ ] Interface/contract giữa các thành phần đã định nghĩa bằng kiểu/schema.
- [ ] `AGENTS.md` **trỏ tới file mẫu thật** (đường dẫn dự kiến), không chỉ mô tả quy ước trừu tượng.
- [ ] `constitution` có Definition of Done mà mỗi mục trả lời được "test thế nào".
- [ ] `ROADMAP` **đủ chi tiết** (mỗi milestone có mục tiêu/mã ID/phụ thuộc/tiêu chí xong) và **phủ hết mã ID** trong PRD.
- [ ] Mọi quyết định **trỏ mã ID** nhất quán với PRD.
- [ ] Không over-engineer (không microservice/abstraction cho app nhỏ).
- [ ] **Đã qua agent `danh-gia-kien-truc` + `danh-gia-lo-trinh`**, lỗi Cao đã vá hoặc được user chấp nhận để ngỏ.
- [ ] *(Chỉ khi có làm walking skeleton — Bước 2)* **Ngày 0 xanh**: chạy được `test`/`lint` không lỗi môi trường.

## Bẫy cần tránh
- Bỏ qua interface, "tính sau" → task pha sau rời rạc, code lạc nhau.
- `AGENTS.md` viết quy ước chung chung không trỏ file mẫu → agent vẫn tự sáng tạo pattern.
- Để file nền tảng phình dài ngay từ đầu (tốn ngữ cảnh mỗi phiên).

---

## Kết thúc — bàn giao cho Pha 3
Tóm tắt ngắn cho user: các quyết định kiến trúc/interface đã chốt, 3 file đã tạo trong `docs/sdd/`,
và tính năng đầu tiên nên làm (lấy từ đầu `docs/sdd/ROADMAP.yaml`). KHÔNG tự nhảy sang code —
Pha 3 (vòng lặp từng tính năng) khoán cho bộ skill **Superpowers** (brainstorming → writing-plans
→ TDD → review).

## Phép thử "đã đủ tốt chưa"
Vẽ được data model + interface chính trên một mặt giấy · ROADMAP đủ chi tiết để đội ngũ bắt tay vào
M1 mà không phải hỏi lại · (nếu có walking skeleton) test/lint xanh. Thiếu cái nào thì quay lại bù,
đặc biệt là interface (rẻ nhất để sửa bây giờ, đắt nhất để sửa sau).
