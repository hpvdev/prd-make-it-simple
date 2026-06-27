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
- Mọi truy cập dữ liệu phải qua kiểm tra phân quyền: thợ chỉ thấy lịch mình, chủ thấy toàn tiệm.
- Mật khẩu phải băm (không lưu thô); giới hạn số lần đăng nhập sai.
- Dữ liệu cá nhân khách (SĐT, ngày sinh, lịch sử): chỉ tiệm sở hữu truy cập; có đường xóa theo yêu cầu (Nghị định 13/2023).

## Definition of Done (mỗi mục kiểm chứng được)
- [ ] Khớp tiêu chí "Xong khi" của tính năng trong PRD (theo mã ID).
- [ ] Test xanh (unit + tích hợp ở ranh giới quan trọng: chặn trùng giờ, gửi nhắc).
- [ ] lint + typecheck sạch.
- [ ] Một lượt review riêng: spec + chất lượng + bảo mật (bắt buộc với mục ở cột "Người review").
- [ ] Cập nhật ROADMAP/AGENTS nếu có quyết định mới.
