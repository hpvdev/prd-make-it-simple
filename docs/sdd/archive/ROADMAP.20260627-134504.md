# ROADMAP — Đặt Lịch Tiệm Tóc

> ROADMAP chỉ lo **THỨ TỰ làm** các cụm tính năng đã có trong `docs/sdd/PRD.md` — KHÔNG định nghĩa
> lại danh mục. M1 là lát cắt chạy trước; M0 là cổng kiểm chứng rủi ro TRƯỚC khi code nhiều.
> Review tại mỗi milestone / điểm replan, không sửa giữa lúc đang code một tính năng.

## Cách đọc
- Mỗi milestone gom vài cụm/tính năng (trỏ **mã ID từ PRD**), cho ra một lát cắt dùng được.
- Ước lượng tương đối: **S / M / L** — không phải cam kết ngày.

## Milestone

### M0 — Cổng kiểm chứng rủi ro (làm TRƯỚC khi code nhiều)
- **Mục tiêu:** đóng R1 + R2 (brief) trước khi đầu tư xây.
- **Việc (phi kỹ thuật, KHÔNG code tính năng PRD):** chào bán trước thu cọc/cam kết 5–10 tiệm ở giá cụ thể; tra giá ZNS/SMS thật + điều kiện đăng ký; thử 1 kênh rẻ (email/Zalo cá nhân) xem khách có đọc nhắc.
- **Phụ thuộc:** không.
- **Tiêu chí xong (đo được):** ≥5 tiệm đặt cọc/ký cam kết; có bảng giá ZNS/SMS + ước tính chi phí tin/tháng/tiệm so với gói 99–199k; đã chốt kênh nhắc cho M2.
- **Ước lượng:** S (chạy song song).
- **Rủi ro / điểm replan:** R1, R2. **Nếu <5 tiệm cọc → dừng hoặc đổi định vị.**

### M1 — Đặt lịch nội bộ chạy được (mạch đầu→cuối)
- **Mục tiêu:** chủ tiệm tự quản lịch thay sổ tay, có chặn trùng giờ.
- **Gồm (mã ID):** TT-01, TT-02, TT-03, TT-05 · TH-01, TH-02, TH-03 · DV-01, DV-02, DV-03, DV-04 · DL-02, DL-03, DL-04, DL-05, DL-06, DL-07, DL-08, DL-09 · **SYS-01, SYS-04, SYS-06, SYS-08** (nền tảng tối thiểu để "dùng được").
- **Phụ thuộc:** M0 (quyết tiếp tục). DL-09 ⟵ TT-03, TH-03; DL-08 & mọi so giờ ⟵ SYS-08.
- **Tiêu chí xong (đo được):** đăng nhập vào đúng dữ liệu tiệm; tạo thợ/dịch vụ/giờ làm; tạo–sửa–hủy hẹn; hệ thống **từ chối hẹn đè giờ cùng thợ (DL-08)** và **ngoài giờ mở cửa/giờ nghỉ (DL-09)**; lịch ngày/tuần hiện đúng; thao tác được trên điện thoại.
- **Ước lượng:** L.
- **Rủi ro / kiểm chứng:** DL-08 + SYS-08 (múi giờ) là phần "phải tự xem kỹ". Cho 1–2 tiệm cọc dùng thử nội bộ.

### M2 — Nhắc lịch & giảm no-show (giá trị cốt lõi)
- **Mục tiêu:** tự nhắc, giảm no-show qua kênh đã chốt ở M0.
- **Gồm (mã ID):** NL-01, NL-02, NL-03, NL-04, NL-05 · KH-01, KH-02, KH-03, KH-05 · TT-04 · **SYS-10** (audit hủy/đổi lịch), **SYS-11** (đồng ý nhận tin + xóa dữ liệu — kéo lên vì bắt đầu xử lý dữ liệu cá nhân).
- **Phụ thuộc:** M1; NL ⟵ TT-04, SYS-08; SYS-11 ⟵ KH-05; kênh nhắc ⟵ M0/R2.
- **Tiêu chí xong (đo được):** tạo hẹn → tới mốc trước 24h có bản ghi gửi trạng thái "thành công" từ nhà cung cấp; khách bấm link đổi trạng thái hẹn; chạy lại không gửi trùng; tin lỗi thấy được + thử lại có giới hạn; có trang chính sách + thao tác xóa dữ liệu khách chạy được.
- **Ước lượng:** M–L.
- **Rủi ro / điểm replan:** R2 (chi phí tin), dữ liệu cá nhân (Nghị định 13). **Nếu chi phí tin vượt biên gói → giảm còn 1 mốc nhắc / đổi kênh.**

### M3 — Khách đặt online
- **Mục tiêu:** mở kênh khách tự đặt, chống giành slot + spam.
- **Gồm (mã ID):** DL-01 · DL-10 (giữ chỗ tạm) · KH-04 (gộp khách trùng) · **SYS-02** (skeleton), **SYS-03** (404/403/500), **SYS-05** (mất mạng/lưu lỗi), **SYS-07** (a11y).
- **Phụ thuộc:** M1 (lịch/slot), M2 (khách); DL-01 ⟵ TT-02.
- **Tiêu chí xong (đo được):** khách mở link tạo được hẹn và hiện trên lịch tiệm; 2 khách không đặt trùng 1 slot (DL-10 khóa tạm); gộp được khách trùng SĐT; có chống lạm dụng cơ bản (rate-limit/xác thực SĐT nhẹ).
- **Ước lượng:** M.
- **Rủi ro / kiểm chứng:** spam/khách lạ; kiểm với 1 tiệm thật mở link công khai.

### M4 — Báo cáo & phân quyền & NFR
- **Mục tiêu:** chủ tiệm thấy hiệu quả; siết phân quyền; nền vận hành bền.
- **Gồm (mã ID):** BC-01, BC-02, BC-03, BC-04 · **TH-04** (phân quyền chủ/thợ) · SYS-09 (trợ giúp/FAQ) · NFR (sao lưu/khôi phục, băm mật khẩu argon2id, giới hạn login sai — gắn TT-01/SYS-10).
- **Phụ thuộc:** M1–M3 (cần dữ liệu hẹn/doanh thu/no-show).
- **Tiêu chí xong (đo được):** số liệu báo cáo = tổng bản ghi tương ứng; thợ không sửa được dữ liệu tiệm (TH-04); có sao lưu/khôi phục cơ bản.
- **Ước lượng:** M.
- **Rủi ro / kiểm chứng:** TH-04 là phần "phải tự xem kỹ".

### M5 — Vận hành thương mại
- **Mục tiêu:** thu tiền, onboarding diện rộng.
- **Gồm (mã ID):** TT-06 (gói thuê bao & dùng thử + khóa tính năng theo gói) · onboarding · hoàn tất SYS-11 (điều khoản/chính sách bản chính thức).
- **Phụ thuộc:** M1–M4; R1 đã xác nhận từ M0.
- **Tiêu chí xong (đo được):** hết hạn gói → khóa tính năng trả phí đúng cách; quy đổi tiệm cọc M0 → trả phí thật.
- **Ước lượng:** M.
- **Rủi ro / kiểm chứng:** TT-06 là phần "phải tự xem kỹ"; đo lại R1 (số tiệm trả phí — thước đo thành công ở brief).

## Đối chiếu độ phủ mã ID (phủ HẾT PRD)
DL-01..10 ✓ · KH-01..05 ✓ · DV-01..04 ✓ · TH-01..04 ✓ · NL-01..05 ✓ · BC-01..04 ✓ · TT-01..06 ✓ · SYS-01..11 ✓. Không thêm tính năng ngoài PRD.

## Phần cố tình hoãn (ghi rõ để không bị coi là bỏ sót)
- DL-01 (đặt online) & DL-10 (giữ chỗ tạm) → M3, vì cần chốt cơ chế chống spam trước.
- TT-06 (thu tiền) → M5, sau khi sản phẩm đủ giá trị.
- Hướng đột phá "máy giữ ghế đầy" (cọc, waitlist, Zalo Mini App) → tầm nhìn, chưa làm (xem product-brief).

## Backlog / Ý tưởng (bắt lấy, không nhảy vào)
> Ý tưởng mới nảy ra giữa chừng → ghi vào đây, làm xong việc đang dở rồi shape ở điểm replan.
- Định mức tin nhắc/tháng theo gói + cơ chế khi vượt (phí ZNS) — quyết ở M2/M5.
