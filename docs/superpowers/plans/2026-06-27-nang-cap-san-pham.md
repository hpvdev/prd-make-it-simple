# Skill `nang-cap-san-pham` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo skill SDD mới `nang-cap-san-pham` (Pha 1-B) xử lý brownfield — nâng cấp/tối ưu sản phẩm đang chạy — bằng cách dò trạng thái project, tái dựng bản đồ tính năng khi cần, rồi cập nhật in-place PRD + ROADMAP.

**Architecture:** Một thư mục skill `.claude/skills/nang-cap-san-pham/` gồm `SKILL.md` (luồng 5 bước + 3 gate) và `assets/ban-do-hien-trang.md` (template cho bản đồ tái dựng ở Bước 1). Skill tái dùng tối đa hạ tầng sẵn có: `sdd-common/conventions.md`, agent `danh-gia-san-pham`, `chien-luoc-dot-pha`, và 2 template PRD/ROADMAP của các skill khác (cập nhật in-place, không tạo template PRD/ROADMAP mới).

**Tech Stack:** Markdown (SKILL.md theo chuẩn skill Claude Code: frontmatter `name` + `description`), không code chạy. Kiểm chứng = đối chiếu spec + dry-run logic dò trạng thái trên 3 ca giả lập.

## Global Constraints

[Copy verbatim từ spec `docs/superpowers/specs/2026-06-27-nang-cap-san-pham-design.md` và conventions chung — mọi task ngầm tuân theo:]

- **Tách riêng, không sửa `tao-san-pham`/`tao-nen-tang`.** Skill mới song song, không đụng skill cũ.
- **Tuân `sdd-common/conventions.md`:** ngôn ngữ tiếng Việt thường (tránh thuật ngữ Anh trong câu chữ, giữ nguyên định danh code); trình bày gạch đầu dòng + in đậm + 💡 đề xuất khung blockquote + dòng 👉 bước kế tiếp; gate cứng = DỪNG chờ người.
- **Output đi vào `docs/sdd/`** (PRD.yaml, ROADMAP.yaml); archive bản cũ vào `docs/sdd/archive/` kèm hậu tố thời gian TRƯỚC khi ghi đè (lệnh ở conventions §2).
- **3 trạng thái:** S1 (không code, không SDD) → trỏ `tao-san-pham`; S2 (SDD khớp code); S3 (code mồ côi/SDD lệch).
- **3 gate:** GATE 1 (xác nhận bản đồ hiện trạng, chỉ S3) · GATE 2 (chọn loại nâng cấp, gate cứng) · agent phản biện `danh-gia-san-pham` cuối Bước 4.
- **Mã ID nối tiếp, KHÔNG tái dùng số cũ;** mọi tính năng thêm/sửa giữ format: nhãn (C)/(P) + "Xong khi" kiểm được + links.
- **PRD = "cái gì", ROADMAP = thứ tự + bảo trì.** Việc "tối ưu" đi vào ROADMAP (milestone `OPT-n`), KHÔNG nhồi vào PRD.
- **Ranh giới Pha 1:** không viết code, không quyết kiến trúc/migration. Đổi data model phá tương thích → gắn cờ ⚠️ đẩy sang Pha 2.

**Đường dẫn tham chiếu (đọc khi cần, đừng chép lại):**
- Spec: `docs/superpowers/specs/2026-06-27-nang-cap-san-pham-design.md`
- Quy ước chung: `.claude/skills/sdd-common/conventions.md`
- Rubric đánh giá: `.claude/skills/sdd-common/danh-gia-doc-lap.md`
- Mẫu SKILL.md để bắt chước giọng/cấu trúc: `.claude/skills/tao-san-pham/SKILL.md`
- Template PRD/ROADMAP (skill cập nhật in-place, không sửa template): `.claude/skills/tao-san-pham/assets/PRD.yaml`, `.claude/skills/tao-nen-tang/assets/ROADMAP.yaml`

---

### Task 1: Tạo template bản đồ hiện trạng (`assets/ban-do-hien-trang.md`)

Đây là khuôn agent điền ở Bước 1 (S3) khi tái dựng "sản phẩm đang có gì". Làm trước vì Task 2 (SKILL.md) sẽ trỏ tới nó.

**Files:**
- Create: `.claude/skills/nang-cap-san-pham/assets/ban-do-hien-trang.md`

**Interfaces:**
- Consumes: format mã ID + (C)/(P) + done_when từ `tao-san-pham/assets/PRD.yaml` (để bản đồ tái dựng dùng cùng ngôn ngữ với PRD, merge được ở Bước 4).
- Produces: file template mà SKILL.md Bước 1 sẽ tham chiếu bằng đường dẫn `assets/ban-do-hien-trang.md`.

- [ ] **Step 1: Viết template bản đồ hiện trạng**

Tạo file với nội dung (điền sẵn cấu trúc + chú thích cách điền, để trống chỗ dữ liệu thật):

```markdown
# Bản đồ hiện trạng — <TÊN DỰ ÁN>

> Agent điền từ việc ĐỌC CODE (routes, models, services, schema DB). Đây là "PRD hiện trạng":
> sản phẩm ĐANG có gì — chưa phải cái muốn thêm. Trình user xác nhận (GATE 1) trước khi đi tiếp.
> Ngôn ngữ tiếng Việt thường; giữ nguyên định danh code (tên route/model/hàm).

## Nguồn đã đọc
- Routes/API: "<liệt kê file/đường dẫn thật đã quét>"
- Models/Schema DB: "<…>"
- Services/logic: "<…>"

## Cụm tính năng ĐANG có (suy từ code)
# Mỗi cụm gán mã (2 chữ hoa). Mỗi tính năng: id <CỤM>-NN · (C/P) · tên · done_when (suy từ hành vi code).
- code: XX
  name: "<tên cụm>"
  features:
    - id: XX-01
      layer: C
      name: "<tính năng quan sát được trong code>"
      desc: "<route/hàm/màn hình tương ứng>"
      done_when: "<hành vi hiện có, kiểm được>"
      evidence: "<file:dòng hoặc tên route/model làm bằng chứng>"

## Dữ liệu chính ĐANG lưu (suy từ schema)
- name: "<loại dữ liệu>"
  stores: ["<trường chính>"]

## Khoảng trống / điểm nghi ngờ
# Chỗ agent KHÔNG chắc — cần user xác nhận ở GATE 1.
- "<vd: có route X nhưng không rõ thuộc cụm nào>"

## Đối chiếu với PRD cũ (chỉ khi có docs/sdd/PRD.yaml)
- khớp: "<cụm/mã trùng khớp code>"
- lệch: "<PRD ghi có nhưng code không thấy, HOẶC code có nhưng PRD thiếu>"
```

- [ ] **Step 2: Kiểm chứng template**

Đọc lại file. Xác nhận:
- Có đủ 5 mục: Nguồn đã đọc · Cụm tính năng · Dữ liệu chính · Khoảng trống · Đối chiếu PRD cũ.
- Trường `evidence` (file:dòng) có mặt — đây là thứ làm GATE 1 kiểm được, phân biệt "đọc code thật" với "bịa".
- Mục "Đối chiếu PRD cũ" có điều kiện "chỉ khi có PRD" — phục vụ ca phát hiện S2-giả (PRD lệch code).
Expected: cả 3 điểm đều có.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/nang-cap-san-pham/assets/ban-do-hien-trang.md
git commit -m "feat(skill): them template ban-do-hien-trang cho nang-cap-san-pham"
```

---

### Task 2: Viết `SKILL.md` — frontmatter + khung + Bước 0 (dò trạng thái)

Phần đầu skill: nhận diện skill (frontmatter), nguyên tắc riêng, và bước dò S1/S2/S3 — phần logic cốt lõi nhất.

**Files:**
- Create: `.claude/skills/nang-cap-san-pham/SKILL.md`

**Interfaces:**
- Consumes: `sdd-common/conventions.md` (trỏ tới, không chép).
- Produces: frontmatter `name: nang-cap-san-pham` + mô tả trigger (các skill khác và user nhận ra skill này); định nghĩa S1/S2/S3 + luật phân biệt mà Task 3-5 dựa vào.

- [ ] **Step 1: Viết frontmatter + phần mở đầu + Bước 0**

Tạo file bắt đầu bằng frontmatter và các phần sau (theo giọng `tao-san-pham/SKILL.md`):

```markdown
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
```

- [ ] **Step 2: Kiểm chứng frontmatter + logic dò trạng thái**

Dry-run logic Bước 0 trên 3 ca giả lập, xác nhận rẽ đúng nhánh:
- Ca A: thư mục trống, không code → phải ra **S1** → trỏ `tao-san-pham`. ✓
- Ca B: có code + `PRD.yaml` liệt đủ cụm khớp route → phải ra **S2** → bỏ qua Bước 1. ✓
- Ca C: có code nhưng không `docs/sdd/` → phải ra **S3** → vào Bước 1. ✓
- Ca D (S2-giả): có `PRD.yaml` nhưng code có 5 route không nằm trong PRD → luật "đối chiếu nhanh" phải kéo về **S3**. ✓
Đồng thời check frontmatter: `name` đúng kebab-case, `description` có cả trigger lẫn ranh giới (không viết code) lẫn lối thoát S1.
Expected: cả 4 ca rẽ đúng; frontmatter đủ 3 yếu tố.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/nang-cap-san-pham/SKILL.md
git commit -m "feat(skill): nang-cap-san-pham frontmatter + Buoc 0 do trang thai"
```

---

### Task 3: Thêm Bước 1 (tái dựng bản đồ + GATE 1) + Bước 2 (GATE 2 chọn loại nâng cấp)

Hai bước có gate. Bước 1 chỉ chạy cho S3; Bước 2 cho mọi nhánh.

**Files:**
- Modify: `.claude/skills/nang-cap-san-pham/SKILL.md` (append sau Bước 0)

**Interfaces:**
- Consumes: trạng thái S2/S3 từ Bước 0 (Task 2); template `assets/ban-do-hien-trang.md` (Task 1); agent `chien-luoc-dot-pha` (nhánh "đầy").
- Produces: bản đồ hiện trạng đã user-duyệt (cho Bước 3-4); biến "loại nâng cấp" (gọn/đầy) + cờ "bật cổng C" mà Bước 3-4 đọc.

- [ ] **Step 1: Append Bước 1 + Bước 2**

Thêm vào cuối SKILL.md:

```markdown
## Bước 1 — Tái dựng bản đồ hiện trạng (chỉ S3)
Dispatch agent (subagent_type `Explore` hoặc `general-purpose`) đọc codebase: routes, models,
services, schema DB. Yêu cầu agent điền khuôn `assets/ban-do-hien-trang.md` — **mỗi tính năng phải
kèm `evidence` (file:dòng / tên route)**, không bịa. Nếu có `docs/sdd/PRD.yaml` cũ → agent điền cả
mục "Đối chiếu PRD cũ" (khớp/lệch).

> 🚧 **GATE 1 (gate cứng — DỪNG chờ người):** trình user bản đồ hiện trạng (gọn, theo cụm) + các
> "điểm nghi ngờ" + (nếu có) phần "lệch PRD cũ". Hỏi user xác nhận/sửa. Nếu PRD cũ lệch code → user
> là trọng tài "tin PRD hay tin code". **Không tự quyết, không đi tiếp khi chưa có xác nhận.**

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
```

- [ ] **Step 2: Kiểm chứng 2 bước gate**

Đối chiếu spec §3:
- Bước 1 chỉ chạy S3; S2 bỏ qua — đã ghi rõ. ✓
- GATE 1 yêu cầu `evidence` + xử ca "lệch PRD cũ" (trọng tài user) — đã có. ✓
- GATE 2 dùng AskUserQuestion, có fallback văn bản "CHỜ trả lời, không tự chọn" (gate cứng) — đã có. ✓
- Nhánh "đầy" gọi đúng `chien-luoc-dot-pha` + cổng nghiên cứu; nhánh "gọn" bỏ chúng — đã có. ✓
- Cổng C là tùy chọn, chỉ hỏi khi mục tiêu tối ưu, feed vào Bước 4 — đã có. ✓
Expected: cả 5 điểm khớp spec.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/nang-cap-san-pham/SKILL.md
git commit -m "feat(skill): nang-cap-san-pham Buoc 1 (tai dung+GATE1) + Buoc 2 (GATE2)"
```

---

### Task 4: Thêm Bước 3 (đào yêu cầu) + Bước 4 (cập nhật in-place) + 4 ca khó

Phần thân chính: brainstorm cái muốn nâng cấp, rồi cập nhật PRD/ROADMAP, kèm cách xử 4 ca khó.

**Files:**
- Modify: `.claude/skills/nang-cap-san-pham/SKILL.md` (append sau Bước 2)

**Interfaces:**
- Consumes: bản đồ hiện trạng (Bước 1/PRD cũ); loại nâng cấp + cờ cổng C (Bước 2); template PRD `tao-san-pham/assets/PRD.yaml` + ROADMAP `tao-nen-tang/assets/ROADMAP.yaml` (để biết format khi merge in-place); agent `danh-gia-san-pham`.
- Produces: `docs/sdd/PRD.yaml` + `docs/sdd/ROADMAP.yaml` đã cập nhật (đầu vào cho Pha 2/3).

- [ ] **Step 1: Append Bước 3 + Bước 4 + mục ca khó**

Thêm vào cuối SKILL.md:

```markdown
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
   mã cụm mới từ `-01`). Đánh dấu `[MỚI]`/`[SỬA]` ở `desc`. Giữ đủ (C)/(P) + done_when kiểm được + links.
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
- **Ca 3 — xung đột tính năng cũ:** nêu rõ cho user ở Bước 3 (qua links), đề xuất hòa giải, user quyết.
- **Ca 4 — nhánh tối ưu (không thêm tính năng):** đi vào ROADMAP (`OPT-n`), KHÔNG vào PRD. Cổng C feed vào đây.
```

- [ ] **Step 2: Kiểm chứng thân skill + 4 ca khó**

Đối chiếu spec §3-§5:
- Bước 4 archive TRƯỚC khi ghi (không đè) — đã có. ✓
- Quy tắc mã ID nối tiếp + không tái dùng số cũ + cụm mới từ `-01` — đã có (khớp spec §4). ✓
- Cả 4 ca khó đều có cách xử rõ, trỏ đúng bước — đã có (khớp spec §5). ✓
- Ca 2 chỉ gắn cờ ⚠️ đẩy Pha 2, không tự chốt migration (ranh giới Pha 1) — đã có. ✓
- Ca 4: tối ưu vào ROADMAP `OPT-n`, không vào PRD — đã có. ✓
- Bước 4 gọi `danh-gia-san-pham` + fallback rubric — đã có. ✓
Expected: cả 6 điểm khớp spec.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/nang-cap-san-pham/SKILL.md
git commit -m "feat(skill): nang-cap-san-pham Buoc 3-4 + 4 ca kho brownfield"
```

---

### Task 5: Thêm cổng chất lượng + bẫy + kết thúc/bàn giao, và soát toàn skill

Phần cuối SKILL.md + soát tổng thể đối chiếu spec §6-§8.

**Files:**
- Modify: `.claude/skills/nang-cap-san-pham/SKILL.md` (append cuối)

**Interfaces:**
- Consumes: toàn bộ Bước 0-4 (Task 2-4).
- Produces: SKILL.md hoàn chỉnh, sẵn sàng dùng.

- [ ] **Step 1: Append cổng chất lượng + bẫy + kết thúc**

Thêm vào cuối SKILL.md (chuyển spec §6-§8 thành checklist + văn bàn giao):

```markdown
## Cổng chất lượng (phải đạt mới bàn giao Pha 2/3)
- [ ] Đã dò đúng S1/S2/S3 và xử đúng nhánh; S1 trỏ về `tao-san-pham`.
- [ ] (S3) Bản đồ hiện trạng đã qua **GATE 1** — user xác nhận trước khi đào yêu cầu mới.
- [ ] User đã **chọn loại nâng cấp** qua GATE 2 (gate cứng).
- [ ] Mã ID mới **nối tiếp, không tái dùng số cũ**; mọi tính năng thêm/sửa đủ (C)/(P) + "Xong khi".
- [ ] Đổi data model phá tương thích đã **gắn cờ ⚠️ đẩy sang Pha 2**, không tự chốt.
- [ ] Xung đột tính năng cũ đã **nêu rõ cho user**, không lặng lẽ thêm.
- [ ] "Tối ưu" đi vào **ROADMAP (`OPT-n`)**, không nhồi vào PRD.
- [ ] Bản cũ đã **archive**; phần thêm/sửa **đánh dấu [MỚI]/[SỬA]** để truy vết.
- [ ] PRD cập nhật đã **qua agent `danh-gia-san-pham`**, lỗi Cao đã vá hoặc user chấp nhận để ngỏ.

## Bẫy cần tránh
- Tin PRD cũ mù quáng mà không đối chiếu code → bản đồ sai từ gốc.
- Tự quyết/bỏ qua GATE 1 hoặc GATE 2 (gate cứng — lỗi nặng).
- Tái dùng mã ID của tính năng đã xóa → lẫn lịch sử.
- Tự chốt chiến lược migration (đó là Pha 2).
- Nhồi "tối ưu / nợ kỹ thuật" vào PRD làm bẩn nguồn chân lý "sản phẩm có gì".
- Thêm tính năng xung đột tính năng cũ mà không cảnh báo user.
- Để delta nằm rải rác thay vì cập nhật in-place → hai nguồn lệch nhau.

---

## Kết thúc — bàn giao
Khi PRD + ROADMAP đã cập nhật và qua cổng chất lượng, tóm tắt cho user + gợi bước kế:
- Thay đổi đụng kiến trúc/data model (có cờ ⚠️) → chạy `tao-nen-tang` (Pha 2) cập nhật nền tảng.
- Chỉ thêm tính năng trong khung cũ → đi thẳng Pha 3 (Superpowers) cho milestone mới.
KHÔNG tự nhảy sang code.
```

- [ ] **Step 2: Soát toàn skill đối chiếu spec (self-review)**

Đọc trọn `.claude/skills/nang-cap-san-pham/SKILL.md` một lượt với mắt mới:
- **Phủ spec:** mỗi mục spec §1-§8 trỏ được tới một phần trong SKILL.md? (liệt kê, tìm lỗ hổng)
- **Không placeholder:** không còn `<…>` lạc, TBD, mục treo.
- **Nhất quán thuật ngữ:** S1/S2/S3, GATE 1/GATE 2, `OPT-n`, `[MỚI]/[SỬA]` dùng giống nhau xuyên suốt.
- **Ngôn ngữ:** tiếng Việt thường, giữ định danh code — theo conventions §3.
- **Đường dẫn đúng:** `assets/ban-do-hien-trang.md`, `sdd-common/conventions.md`, các agent tên đúng.
Sửa inline nếu thấy lệch.
Expected: không còn lỗ hổng phủ spec; không placeholder; thuật ngữ nhất quán.

- [ ] **Step 3: Kiểm skill nạp được (smoke test cấu trúc)**

Xác nhận cấu trúc thư mục skill hợp lệ để Claude Code nhận diện:
```bash
ls -la .claude/skills/nang-cap-san-pham/ .claude/skills/nang-cap-san-pham/assets/
head -5 .claude/skills/nang-cap-san-pham/SKILL.md
```
Expected: có `SKILL.md` + `assets/ban-do-hien-trang.md`; frontmatter mở bằng `---` và có `name: nang-cap-san-pham`.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/nang-cap-san-pham/SKILL.md
git commit -m "feat(skill): nang-cap-san-pham cong chat luong + bay + ban giao"
```

---

## Self-Review (người viết plan tự soát — đã chạy)

**1. Phủ spec:**
- §1 Vấn đề/mục tiêu → Task 2 phần mở đầu SKILL.md. ✓
- §2 Định vị/ranh giới → Task 2 frontmatter + mở đầu. ✓
- §3 Luồng 5 bước → Task 2 (B0), Task 3 (B1-B2), Task 4 (B3-B4). ✓
- §4 Mã ID nối tiếp → Task 4 Step 1 (Bước 4 mục 2) + Global Constraints. ✓
- §5 Bốn ca khó → Task 4 mục "Bốn ca khó". ✓
- §6 Cổng chất lượng → Task 5 Step 1. ✓
- §7 Bẫy → Task 5 Step 1. ✓
- §8 Kết thúc/bàn giao → Task 5 Step 1. ✓
- Template bản đồ hiện trạng (cần cho B1) → Task 1. ✓
Không có lỗ hổng.

**2. Quét placeholder:** Các `<…>` trong code block là **template có chủ đích** (chỗ user/agent điền), không phải placeholder của plan. Mọi step có nội dung thật để dán. ✓

**3. Nhất quán kiểu/tên:** `S1/S2/S3`, `GATE 1/GATE 2`, cổng C, `OPT-n`, `[MỚI]/[SỬA]`, `assets/ban-do-hien-trang.md`, agent `danh-gia-san-pham`/`chien-luoc-dot-pha`/`Explore` — dùng đồng nhất giữa các task. ✓
