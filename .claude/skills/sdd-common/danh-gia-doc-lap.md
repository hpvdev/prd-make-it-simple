# Đánh giá độc lập — rubric dùng chung cho các skill SDD

> Mục đích: trước khi chốt một tài liệu (product-brief, PRD, constitution…), **giao cho một agent
> khác đóng vai chuyên gia phản biện** soi tài liệu trên GÓC NHÌN KHÁC với người viết. Người viết
> dễ "yêu sản phẩm của mình"; người đánh giá phải hoài nghi, tìm lỗ hổng.
>
> **Cách gọi (ưu tiên):** dùng agent có sẵn `subagent_type: danh-gia-san-pham` (định nghĩa ở
> `.claude/agents/danh-gia-san-pham.md` — đã nhúng sẵn vai PO + QA + BA + người dùng/người trả tiền
> + đối thủ). Chỉ cần truyền đường dẫn tài liệu + một dòng mô tả sản phẩm; KHÔNG cần dán
> lại rubric. Nếu môi trường không có agent đó → fallback: dispatch `general-purpose` và dán rubric
> dưới đây.
> Subagent **chỉ đọc & trả nhận xét**, KHÔNG sửa file. Skill nhận kết quả → vá lỗi **Cao** → mới
> trình user. File này giữ lại làm **nguồn rubric** cho agent và cho trường hợp fallback.

## Vai của agent đánh giá
Bạn là **chuyên gia sản phẩm cấp cao + người dùng hoài nghi + người rành đối thủ**. Bạn KHÔNG phải
người viết tài liệu này. Nhiệm vụ: tìm chỗ yếu, thiếu, mơ hồ, hoặc tô hồng — không khen lấy lệ.
Mặc định nghi ngờ; chỉ kết luận "đạt" khi thật sự không còn lỗ hổng đáng kể.

## Khi soi `product-brief.md`
- **Giá trị có thật & khác biệt?** Có bị "tiện hơn" chung chung không? Khác biệt có *rút ra từ
  nghiên cứu/đối thủ* hay chỉ là khẳng định suông?
- **Kiếm tiền thực tế?** Ai trả, trả bao nhiêu có hợp lý với nhóm người dùng đó không? Có nhầm
  người dùng với người trả tiền không?
- **Rủi ro lớn nhất** đã chỉ đúng cái dễ làm sụp sản phẩm chưa? Cách kiểm chứng có rẻ & sớm không?
- **Đối thủ:** có bỏ sót đối thủ/giải pháp thay thế hiển nhiên (kể cả "không làm gì / dùng Excel")?

## Khi soi `PRD.yaml`
- **Đủ cụm chưa?** Một sản phẩm thật loại này còn thiếu cụm tính năng nào người dùng sẽ mong đợi?
- **Đủ 3 lớp chưa?** Mỗi cụm có tính năng phụ (kiểm tra nhập, hoàn tác, trạng thái rỗng, xử lý lỗi)
  không, hay chỉ liệt kê tính năng chính kiểu demo? Cụm `SYS` có đủ không?
- **"Xong khi" có kiểm được không?** Có mục nào mơ hồ không test nổi?
- **Phụ thuộc chéo:** có ràng buộc giữa các cụm bị bỏ sót (vd đặt lịch cần giờ mở cửa + giờ thợ)?
- **Phạm vi:** có tính năng nào thực ra là *giải pháp/UI* (sai tầng, thuộc Pha 3)? Có "ôm" quá rộng
  so với brief không?
- **Khớp brief:** PRD có phục vụ đúng giá trị/định vị đã chốt ở brief không, hay lệch hướng?

## Định dạng trả về (bắt buộc)
Trả về danh sách phát hiện, mỗi mục:
- **[Mức] Tiêu đề ngắn** — vấn đề là gì → đề xuất sửa cụ thể (nếu là PRD thì trỏ mã ID/cụm liên quan).
- Mức: **Cao** (phải sửa trước khi chốt) · **Trung** (nên sửa) · **Thấp** (tùy chọn).

Kết bằng một dòng **Phán quyết: Đạt / Cần sửa** + một câu lý do.
Nếu không tìm thấy lỗi nặng nào, nói thẳng "không có mục Cao" thay vì bịa lỗi cho đủ.
