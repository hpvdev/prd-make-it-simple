# ROADMAP — Đặt Lịch Tiệm Tóc

> ROADMAP chỉ lo **THỨ TỰ làm** các cụm tính năng đã có trong `docs/sdd/PRD.md` — KHÔNG định nghĩa
> lại danh mục tính năng. M1 là cụm chạy trước, cho ra một mạch dùng được đầu→cuối.
> Review tại mỗi milestone / điểm replan, không sửa giữa lúc đang code.

## Milestone (xếp thứ tự các cụm tính năng từ PRD)
- [ ] **M1 — Đặt lịch nội bộ chạy được**: TT (đăng nhập + hồ sơ tiệm + giờ mở cửa) → TH (thợ + giờ làm + ngày nghỉ) → DV (dịch vụ + thời lượng) → DL (xem lịch, tạo/sửa/hủy hẹn, **chặn trùng giờ DL-08**, walk-in). *Mạch đầu→cuối: chủ tiệm tự quản lịch thay sổ tay.*
- [ ] **M2 — Nhắc lịch & giảm no-show**: NL (nhắc trước giờ, xác nhận/hủy qua link, chống gửi trùng, xử lý lỗi) + KH (sổ khách, hồ sơ, no-show). *Phụ thuộc R2 — chốt kênh nhắc rẻ trước khi làm.*
- [ ] **M3 — Khách đặt online**: DL-01 (trang đặt công khai) + DS (danh sách/tìm/lọc) + chống lạm dụng. *Mở kênh khách tự đặt.*
- [ ] **M4 — Báo cáo & hoàn thiện**: BC (bảng điều khiển, doanh thu, no-show, công suất) + XK nếu cần + hoàn thiện cụm SYS.
- [ ] **M5 — Vận hành thương mại**: TT-06 (gói thuê bao & dùng thử) + SYS-11 (quyền riêng tư/Nghị định 13) + onboarding.

## Backlog / Ý tưởng (bắt lấy, không nhảy vào)
> Ý tưởng mới nảy ra giữa chừng → ghi vào đây, làm xong việc đang dở rồi shape ở điểm replan.
- Định mức tin nhắc/tháng theo gói + cơ chế khi vượt (phí ZNS) — quyết ở M2/M5.
- NFR: sao lưu & khôi phục dữ liệu, kiểm thử tải — soi ở M4.
- (Tầm nhìn, chưa làm) Hướng đột phá "máy giữ ghế đầy": cọc giữ chỗ, waitlist tự lấp, nhắc khách quay lại, Zalo Mini App — cân nhắc nếu định vị giá rẻ bị cạnh tranh.
