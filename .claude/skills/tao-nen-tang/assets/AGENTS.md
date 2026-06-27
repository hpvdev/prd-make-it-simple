<!-- Khuôn template SDD. Điền xong thì ghi bản hoàn chỉnh ra `docs/sdd/AGENTS.md`. -->
# AGENTS.md — memory bank dự án

> Đặt ở gốc repo. Agent đọc ở mọi phiên. Dùng được cho Claude Code (đổi tên CLAUDE.md),
> Cursor/Windsurf (.cursor/rules). Giữ NGẮN; trỏ tới file mẫu thật thay vì mô tả dài.

## Sản phẩm
<1 đoạn: app làm gì, cho ai.>

## Tech stack
- Ngôn ngữ/framework: <…>  | DB: <…>  | Quản lý gói: <…>

## Cấu trúc thư mục
```
<cây thư mục rút gọn, ghi mỗi thư mục để làm gì>
```

## Quy ước (theo đúng, đừng tự sáng tạo)
- Đặt tên: <…>
- Xử lý lỗi: <pattern chuẩn>
- Data access: <vd luôn qua services/, không query trực tiếp ở route>

## Interface/contract chính (chốt ở Pha 2)
<Định nghĩa bằng kiểu/schema kiểm được, KHÔNG chỉ tả chữ. Ghi rõ ĐIỀU KIỆN/thuật toán ở chỗ có
logic (vd "trùng" nghĩa là gì), đừng để mơ hồ. Liệt kê field tối thiểu của mỗi model.>
- Data model (`schema`): <model + field chính; nếu multi-tenant thì mọi model con mang khóa tenant>
- <vd: GET /api/tasks?status=… → 200 [Task] | 400 — phạm vi suy từ quyền của actor, không nhận id tùy ý>
- <Chỗ có logic: nêu điều kiện chính xác. Vd "trùng giờ": cùng X, A.batDau < B.ketThuc AND A.ketThuc > B.batDau>
- <Tài nguyên chia sẻ (slot/tồn kho): ghi cơ chế chống đua ở tầng DB (constraint/giao dịch)>
- <Điểm dễ đổi (kênh gửi tin, cổng thanh toán): đặt sau một interface để đổi mà không sửa nơi gọi>

## Pattern mẫu (đọc trước khi viết loại tương tự)
<Dự án mới chưa có code → đánh dấu "SẼ TẠO ở milestone đầu, là mẫu cho phần sau", đừng viện dẫn như
đã tồn tại (agent sẽ cố đọc file không có → nhiễu).>
- Service mẫu: <đường dẫn> (SẼ TẠO ở M1)
- Route mẫu: <đường dẫn> (SẼ TẠO ở M1)
- Test mẫu: <đường dẫn> (SẼ TẠO ở M1 — gồm ca biên + ca đua nếu có tài nguyên chia sẻ)

## Lệnh
```
<dev> · <test> · <lint> · <typecheck>
```

## Agent KHÔNG được tự ý
- Sửa auth/phân quyền, thanh toán, schema phá tương thích → phải có người duyệt.
- Thêm phụ thuộc mới chưa duyệt.

## Bài học (đừng lặp lại)
- <cách đã thử và KHÔNG hiệu quả>
