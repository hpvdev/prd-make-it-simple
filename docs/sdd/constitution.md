# Constitution — Đặt Lịch Tiệm Tóc

> Luật bất biến. Mọi spec, plan, code đều phải tuân. Đọc file này trước mọi việc.

## Ranh giới
| Agent tự làm | Người PHẢI review trước khi merge |
|---|---|
| Thêm/sửa/xóa khách, dịch vụ, thợ; UI; bộ lọc; báo cáo; boilerplate | Đăng nhập & phân quyền (TT-01, TH-04) |
| Migration, refactor giữ nguyên hành vi | Logic chặn trùng giờ (DL-08) — lõi giá trị |
| Tích hợp thư viện phổ biến | Gửi nhắc & tích hợp kênh trả phí (NL-01, ZNS/SMS) |
| | Thay đổi schema phá tương thích · xử lý dữ liệu cá nhân khách (SYS-11/Nghị định 13) |

## Ràng buộc bảo mật
- Không tin input người dùng: validate + sanitize ở biên (đặc biệt trang đặt lịch công khai).
- Không hardcode secret (khóa DB, khóa kênh nhắc); dùng biến môi trường.
- **Cô lập multi-tenant:** mọi truy vấn lọc theo `tiemId` lấy từ session; KHÔNG nhận `tiemId`/`thoId`
  tùy ý từ client (chống IDOR). Phân quyền trong tiệm: thợ chỉ thấy lịch mình, chủ thấy toàn tiệm.
- **Bất biến cho dữ liệu chia sẻ tài nguyên (slot):** chặn trùng giờ (DL-08) phải an toàn trước truy
  cập đồng thời — bảo đảm ở tầng DB (constraint/giao dịch), không chỉ kiểm trong app.
- Mật khẩu phải băm (argon2id, không lưu thô); giới hạn số lần đăng nhập sai.
- **Dữ liệu cá nhân khách (Nghị định 13/2023):** tiệm là bên kiểm soát; có chính sách + đồng ý nhận
  tin + **đường xóa theo yêu cầu**. Bắt buộc **trước khi go-live có khách thật (từ M2)** — M1 nội bộ
  (chưa thu dữ liệu khách lạ qua kênh công khai) chưa bắt buộc, nhưng schema phải chừa chỗ.

## Definition of Done (mỗi mục kiểm chứng được)
- [ ] Khớp tiêu chí "Xong khi" của tính năng trong PRD (theo mã ID).
- [ ] Test xanh (unit + tích hợp ở ranh giới quan trọng: chặn trùng giờ, gửi nhắc).
- [ ] lint + typecheck sạch.
- [ ] Một lượt review riêng: spec + chất lượng + bảo mật (bắt buộc với mục ở cột "Người review").
- [ ] Cập nhật ROADMAP/AGENTS nếu có quyết định mới.
