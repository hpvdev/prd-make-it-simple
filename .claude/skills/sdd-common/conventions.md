# Quy ước chung — bộ skill SDD

> Nguồn duy nhất cho các quy ước dùng chung giữa mọi skill SDD (`tao-san-pham`, `tao-nen-tang`, …).
> Mỗi SKILL.md trỏ về đây thay vì chép lại. Thư mục `sdd-common/` không có `SKILL.md` nên không bị
> nhận diện như một skill — nó chỉ là kho quy ước.
>
> **Mọi skill: đọc và tuân theo file này TRƯỚC khi làm việc.**

## 1. Vòng đời SDD 6 pha

Spec là nguồn chân lý, không phải code. Mặt phẳng điều khiển (roadmap + constitution) nằm TRÊN
vòng lặp thực thi.

| Pha | Việc | Công cụ |
|---|---|---|
| 1. Định hình | Giá trị thật, mục tiêu, cách kiếm tiền, đối thủ (có cổng nghiên cứu) → rồi phạm vi & tính năng | `tao-san-pham` |
| 2. Nền tảng | Tech stack, giao kèo giữa các thành phần, constitution/AGENTS/ROADMAP | `tao-nen-tang` |
| 3. Vòng lặp tính năng | Spec → Plan → Tasks → Code + kiểm thử trước → Soát lại (mỗi tính năng) | Superpowers |
| 4. Kiểm thử & QA | Kiểm thử đơn vị + tích hợp; tự xem kỹ phần nhạy cảm | thủ công / Superpowers |
| 5. Tích hợp & đưa lên | Cổng chặn gộp code, đưa lên môi trường thử, chạy thử nhanh | thủ công / CI |
| 6. Lặp & bảo trì | Cập nhật trạng thái dự án, nhật ký, dọn nợ kỹ thuật, lập lại kế hoạch | thủ công |

Pha 1–2 làm **một lần** lúc khởi động; Pha 3–6 **lặp** cho từng tính năng. Hai cổng con người:
**duyệt bản định hình/spec** và **duyệt khi gộp code**.

## 2. Nơi để output (control plane)

- Mọi output của các pha gom vào thư mục **`docs/sdd/`** ở gốc dự án (con người sở hữu, làm đầu
  vào cho pha sau). Tạo nếu chưa có: `mkdir -p docs/sdd`.
- Khuôn template để điền nằm trong `assets/` của từng skill (đọc khuôn → điền → ghi ra `docs/sdd/`).
- **KHÔNG đè mất bản cũ.** Trước khi ghi một file đã tồn tại trong `docs/sdd/`, chuyển bản cũ vào
  `docs/sdd/archive/` kèm hậu tố thời gian, rồi mới ghi bản mới:
  ```bash
  f=docs/sdd/PRD.yaml   # đổi tên file tùy lúc
  [ -f "$f" ] && mkdir -p docs/sdd/archive && \
    cp "$f" "docs/sdd/archive/$(basename "${f%.*}").$(date +%Y%m%d-%H%M%S).${f##*.}"
  ```
  Nhờ vậy chạy lại skill nhiều lần không làm mất phiên bản trước (xem lại/đối chiếu được).
- **Để `AGENTS.md` được tự nạp:** bản gốc đặt `docs/sdd/AGENTS.md`; tạo thêm `CLAUDE.md` ở gốc dự
  án chỉ chứa một dòng `@docs/sdd/AGENTS.md` (tạo mới nếu chưa có; chèn dòng nếu đã có).

## 3. Ngôn ngữ output — tiếng Việt thường, dễ đọc

Output hướng tới người Việt (spec, tài liệu, văn xuôi) viết **tiếng Việt rõ ràng, câu ngắn**, cho
người không rành kỹ thuật cũng hiểu. **Tránh thuật ngữ tiếng Anh trong câu chữ** — dịch sang
tiếng Việt thường:

- "MVP / lát cắt MVP" → "bản chạy đầu tiên / phần nhỏ nhất đáng làm trước"
- "ship" → "làm xong & dùng được"; "data model / thực thể" → "dữ liệu chính / loại dữ liệu"
- "vibe-code" → "để máy làm nhanh"; "review tay" → "tự xem kỹ"; "real-time" → "cập nhật tức thời"
- "CRUD" → "thêm/sửa/xóa"; "auth" → "đăng nhập & phân quyền"
- "interface/contract" → "giao kèo giữa các thành phần"; "deploy" → "đưa lên môi trường"

**Chỉ** giữ nguyên định danh trong code (tên hàm, kiểu, schema, endpoint…) — đừng dịch chúng.

## 4. Cách trình bày câu trả lời (chat với người dùng)

Mỗi câu trả lời của Claude khi chạy skill phải **dễ quét bằng mắt**:

- **Gạch đầu dòng là chính**, tránh đoạn văn dài liền mạch.
- **In đậm phần quan trọng**: quyết định cần chốt, cảnh báo, con số/giới hạn, bước kế tiếp.
- Hỏi/chốt **mỗi lần một ý**, đánh số rõ ràng — đừng dồn nhiều câu hỏi vào một khối.
- Dùng tiêu đề ngắn hoặc dòng trắng để tách ý; chỉ dùng bảng khi thật sự cần so sánh.
- Giữ ngắn: trả lời thăm dò chỉ 3–5 dòng, đừng viết tường thuật dài.
- **Luôn kèm đề xuất khi hỏi lại.** Đừng hỏi suông. Đặt đề xuất vào **một khung riêng** (blockquote)
  để nổi bật, tách khỏi phần còn lại — dùng sticker 💡:

  > 💡 **Đề xuất của tôi:** <phương án nghiêng về> — <1 câu lý do>.

  Người dùng chỉ cần gật/đổi. Nhiều lựa chọn → đánh dấu rõ cái khuyến nghị.
- **Cho lối tắt đồng ý nhanh.** Khi câu trả lời có một hay nhiều đề xuất, kết bằng dòng:
  *"Gõ **OK** nếu bạn đồng ý với tất cả đề xuất của tôi; hoặc nói rõ muốn đổi cái nào."*
  Khi user gõ **OK** → áp dụng toàn bộ đề xuất vừa nêu, không hỏi lại từng cái.
- Kết mỗi câu trả lời bằng **một dòng "👉 Bước kế tiếp"** nói rõ cần làm/quyết gì (sticker 👉 chỉ
  dành cho bước kế tiếp, đừng dùng lẫn với đề xuất).

### Khi đặt câu hỏi cho người dùng (đừng để câu hỏi dính sát nhau)
- **Mỗi câu hỏi một khối riêng**, cách nhau bằng **một dòng trắng** — không dồn thành danh sách dày đặc.
- **In đậm câu hỏi chính**; phần gợi ý/ví dụ để **dòng riêng bên dưới, in nghiêng**, thật ngắn.
- Hỏi theo **cụm 2–3 câu** rồi chờ trả lời, đừng bắn một loạt 5–6 câu cùng lúc.
- Luôn kèm **một ví dụ trả lời mẫu** để người dùng dễ bắt đầu.
- **Câu có sẵn phương án rời rạc → cho BẤM CHỌN, đừng bắt gõ.** Dùng công cụ chọn của môi trường
  (vd `AskUserQuestion` của Claude Code) để người dùng chọn nhanh; mỗi phương án ghi nhãn ngắn +
  một dòng mô tả; đánh dấu phương án khuyến nghị. Cho phép "Khác" để tự nhập khi cần.
  - *Dùng cho:* mức nghiên cứu (bỏ qua/nhanh/sâu), mục tiêu người làm, cách thu tiền, chọn tech
    stack, chọn phương án kiến trúc… (những thứ liệt kê được).
  - *KHÔNG dùng cho* câu mở cần kể chi tiết (mô tả vấn đề, giá trị, ví dụ đau thật) — để user tự kể.

Mẫu trình bày:

> **1. Giải quyết vấn đề gì, cho ai?**
> *Ví dụ: "Freelancer hay quên hạn hợp đồng → bị phạt tiền."*
>
> **2. Hiện giờ họ đang xoay xở bằng cách nào?**
> *Ví dụ: "Ghi tay vào sổ, hay quên."*

## 5. Agent chuyên gia — tự chạy MẶC ĐỊNH khi chạy skill

Mỗi tài liệu quan trọng **phải qua agent chuyên gia độc lập** trước khi trình user — người viết tự
soi dễ bỏ sót. **Skill tự gọi agent (mặc định, không hỏi user có muốn không)**; agent chỉ đọc & trả
nhận xét (không sửa file) → skill vá lỗi **Cao** → tóm tắt cho user. Quyết định cuối vẫn của user.

| Pha | Tài liệu | Agent | Vai |
|---|---|---|---|
| 1 | (định vị nháp) | `chien-luoc-dot-pha` | bung ý tưởng đột phá (phân kỳ) — gate mềm, user chọn |
| 1 | product-brief, PRD | `danh-gia-san-pham` | PO + QA + BA + người dùng + người trả tiền + đối thủ (hội tụ) |
| 2 | constitution, AGENTS | `danh-gia-kien-truc` | Kiến trúc sư + Tech Lead + Bảo mật |
| 2 | ROADMAP | `danh-gia-lo-trinh` | Trưởng nhóm phát triển + PO + Quản trị rủi ro |

- Rubric & bản dự phòng (khi môi trường thiếu agent): [`danh-gia-doc-lap.md`](./danh-gia-doc-lap.md).
- Agent định nghĩa ở `.claude/agents/`; nếu vừa tạo có thể cần mở lại phiên mới nạp được tên.
- Cân bằng: `chien-luoc-dot-pha` mở rộng (phân kỳ) ↔ các agent đánh giá siết lại (hội tụ).

## 6. Con người nắm quyền

- Hỏi trước khi viết file; trình quyết định để người dùng chốt, đừng tự quyết thay.
- Hai cổng bắt buộc có người: **duyệt bản định hình/spec** và **duyệt khi gộp code**.
- **Gate cứng = DỪNG chờ người.** Ở mọi cổng cần người chọn/duyệt, skill **không được tự quyết, tự
  bỏ qua hay tự tiếp tục**. Đưa lựa chọn cho user bấm chọn rồi mới đi tiếp.
- Phần nhạy cảm (đăng nhập & phân quyền, thanh toán, đổi cấu trúc dữ liệu phá tương thích, phần
  tính toán cốt lõi) luôn để người xem kỹ, không khoán hết cho máy.
