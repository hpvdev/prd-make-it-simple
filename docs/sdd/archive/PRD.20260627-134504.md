# Bản định hình sản phẩm — Đặt Lịch Tiệm Tóc

## Vấn đề & người dùng
Chủ tiệm tóc nhỏ (1–5 thợ) nhận lịch qua sổ tay/Zalo nên hay xếp trùng giờ, khách tới phải chờ, và khách quên lịch (no-show). Ví dụ thật: hai khách được hẹn 19h cùng một thợ, một người bỏ về và không quay lại. Người dùng chính: chủ tiệm (vừa quản lý vừa cắt). Người dùng phụ: khách của tiệm đặt lịch online.

## Các cụm tính năng (toàn hệ thống)

> Mỗi tính năng có mã ID cố định (`<CỤM>-NN`). ROADMAP (Pha 2) xếp thứ tự theo mã; Pha 3 code theo mã; test/review truy ngược theo mã. "Xong khi" = điều kiện nghiệm thu tối thiểu.
> Lớp tính năng: **(C)** chính · **(P)** phụ. Cụm `SYS` là lớp xuyên suốt mọi màn hình.

### C1 — Đặt lịch (mã: DL)
- **DL-01 (C) — Khách đặt lịch online**: chọn dịch vụ, thợ (hoặc bất kỳ), ngày giờ trống, nhập tên/SĐT. *Xong khi: tạo được lịch hẹn và hiện trên lịch của tiệm.*
- **DL-02 (C) — Chủ/thợ tạo lịch hộ khách** (khách gọi điện/tới trực tiếp). *Xong khi: lưu được lịch không cần khách có tài khoản.*
- **DL-03 (C) — Xem lịch theo ngày/tuần** theo từng thợ (dạng cột thời gian). *Xong khi: thấy đúng các hẹn trong khoảng đã chọn.*
- **DL-04 (C) — Sửa / dời giờ lịch hẹn** (kéo-thả hoặc đổi giờ). *Xong khi: lịch cập nhật và không đè lên hẹn khác.*
- **DL-05 (C) — Hủy lịch hẹn** (chủ hoặc khách), ghi lý do. *Xong khi: hẹn chuyển trạng thái Đã hủy, giải phóng khung giờ.*
- **DL-06 (C) — Trạng thái lịch hẹn**: Chờ xác nhận → Đã xác nhận → Hoàn tất / Không đến (no-show). *Xong khi: đổi đúng trạng thái và lọc được theo trạng thái.*
- **DL-07 (C) — Nhận khách vãng lai (walk-in)**: thêm nhanh khách tới không hẹn vào khung trống. *Xong khi: chèn được hẹn tức thì.*
- **DL-08 (C) — Chặn đặt trùng giờ một thợ**: không cho 2 hẹn đè giờ cùng một thợ (giá trị cốt lõi hơn Zalo/sổ tay). *Xong khi: hệ thống từ chối và báo khung đã bận.*
- **DL-09 (P) — Chặn đặt vào giờ nghỉ / ngoài giờ mở cửa** (liên kết TT-04, TH-03). *Xong khi: khung giờ đóng không hiện để chọn.*
- **DL-10 (P) — Đặt cọc/giữ chỗ tạm** khi khung đang được chọn (tránh 2 khách đặt cùng lúc một slot). *Xong khi: slot khóa tạm trong lúc một người đang đặt.*

### C2 — Khách hàng (mã: KH)
- **KH-01 (C) — Sổ khách hàng**: tên, SĐT, ghi chú, ngày sinh (tùy chọn). *Xong khi: thêm/xem được khách.*
- **KH-02 (C) — Hồ sơ khách**: lịch sử hẹn, dịch vụ hay dùng, số lần no-show. *Xong khi: mở một khách thấy đủ lịch sử.*
- **KH-03 (C) — Tìm khách** theo tên/SĐT. *Xong khi: gõ là ra đúng khách.*
- **KH-04 (P) — Gộp khách trùng** (cùng SĐT bị tạo 2 lần). *Xong khi: gộp xong lịch sử dồn về một hồ sơ.*
- **KH-05 (P) — Sửa / xóa khách**: xóa có xác nhận; còn lịch sắp tới thì cảnh báo. *Xong khi: hủy thì không xóa, đồng ý thì xóa.*

### C3 — Dịch vụ & bảng giá (mã: DV)
- **DV-01 (C) — Danh mục dịch vụ**: tên, thời lượng, giá. *Xong khi: thêm/sửa/xóa dịch vụ được.*
- **DV-02 (C) — Thời lượng quyết định khung giờ**: lịch hẹn dài đúng theo thời lượng dịch vụ. *Xong khi: chọn dịch vụ 45 phút thì hẹn chiếm 45 phút.*
- **DV-03 (P) — Bật/tắt dịch vụ** (tạm ngừng nhận) thay vì xóa. *Xong khi: dịch vụ tắt không hiện khi đặt.*
- **DV-04 (P) — Nhóm dịch vụ** (Cắt / Nhuộm / Gội…) cho dễ chọn. *Xong khi: lọc dịch vụ theo nhóm.*

### C4 — Thợ & lịch làm (mã: TH)
- **TH-01 (C) — Danh sách thợ**: tên, ảnh, dịch vụ làm được. *Xong khi: thêm/sửa/xóa thợ.*
- **TH-02 (C) — Giờ làm của từng thợ** (ca/ngày trong tuần). *Xong khi: lịch đặt chỉ mở trong giờ làm của thợ.*
- **TH-03 (C) — Ngày nghỉ / nghỉ phép của thợ**. *Xong khi: ngày nghỉ không cho đặt (liên kết DL-09).*
- **TH-04 (P) — Phân quyền**: chủ tiệm (toàn quyền) vs thợ (chỉ xem lịch mình). *Xong khi: thợ không sửa được dữ liệu tiệm.*

### C5 — Nhắc lịch (mã: NL)
- **NL-01 (C) — Nhắc khách trước giờ hẹn** (vd trước 24h và 2h) qua một kênh cụ thể (Zalo ZNS / SMS / email). *Xong khi: tạo hẹn lúc X, tới mốc trước 24h → có bản ghi gửi với trạng thái "thành công" trả về từ nhà cung cấp (callback ZNS/SMS), đúng mốc theo múi giờ tiệm; ca gửi lỗi rơi vào NL-04 (liên kết NL-04, SYS-08).*
- **NL-02 (C) — Xác nhận / hủy qua liên kết trong tin nhắc**. *Xong khi: khách bấm là trạng thái hẹn đổi theo.*
- **NL-03 (P) — Chống gửi trùng**: một mốc chỉ nhắc một lần kể cả khi hệ thống chạy lại. *Xong khi: không có 2 tin cùng mốc.*
- **NL-04 (P) — Xử lý gửi thất bại**: thử lại có giới hạn, ghi log, báo chủ tiệm nếu vẫn lỗi. *Xong khi: thấy được tin nào gửi hỏng.*
- **NL-05 (P) — Mẫu tin nhắc tùy chỉnh** (tên tiệm, giờ hẹn, địa chỉ). *Xong khi: sửa mẫu và tin gửi theo mẫu.*

### C6 — Báo cáo (mã: BC)
- **BC-01 (C) — Bảng điều khiển hôm nay**: số hẹn, khách mới, doanh thu ước tính. *Xong khi: số liệu khớp dữ liệu thật.*
- **BC-02 (C) — Doanh thu theo ngày/tháng** (theo dịch vụ hoàn tất). *Xong khi: xem được biểu đồ/tổng theo khoảng.*
- **BC-03 (P) — Tỷ lệ no-show** theo khách/thợ. *Xong khi: lọc và xếp được khách hay bỏ hẹn.*
- **BC-04 (P) — Thống kê công suất thợ** (giờ kín/giờ trống). *Xong khi: thấy thợ nào quá tải/rảnh.*

### C7 — Tài khoản tiệm & cài đặt (mã: TT)
- **TT-01 (C) — Đăng ký / đăng nhập tiệm** (email hoặc SĐT + mật khẩu). *Xong khi: đăng nhập vào đúng dữ liệu tiệm.*
- **TT-02 (C) — Hồ sơ tiệm**: tên, địa chỉ, SĐT, logo, trang đặt lịch công khai. *Xong khi: khách mở link đặt lịch thấy đúng tiệm.*
- **TT-03 (C) — Giờ mở cửa của tiệm** theo ngày trong tuần + ngày lễ nghỉ. *Xong khi: ngoài giờ mở cửa không cho đặt (liên kết DL-09).*
- **TT-04 (P) — Cài đặt nhắc mặc định** (mốc nhắc, kênh, mẫu tin). *Xong khi: thay đổi áp cho hẹn mới.*
- **TT-05 (P) — Quên mật khẩu** qua email/SĐT. *Xong khi: đặt lại được mật khẩu.*
- **TT-06 (P) — Quản lý gói thuê bao & dùng thử**: xem trạng thái gói, ngày hết hạn. *Xong khi: hết hạn thì khóa tính năng trả phí đúng cách.*

### C8 — Xuyên suốt cả sản phẩm (mã: SYS)
- **SYS-01 — Khung trang chung**: điều hướng, menu tiệm, đăng xuất.
- **SYS-02 — Trạng thái đang tải** (khung xương) cho lịch và danh sách.
- **SYS-03 — Trang lỗi**: 404 / 403 / 500.
- **SYS-04 — Báo lỗi & thông báo thành công** thống nhất toàn app (toast).
- **SYS-05 — Mất mạng / lưu thất bại**: báo rõ, cho thử lại, không mất dữ liệu đang nhập.
- **SYS-06 — Responsive**: dùng tốt trên điện thoại (chủ tiệm hay thao tác trên máy nhỏ).
- **SYS-07 — Hỗ trợ tiếp cận (a11y)**: bàn phím, trình đọc màn hình, đủ tương phản.
- **SYS-08 — Ngày giờ & múi giờ** nhất quán theo múi giờ tiệm.
- **SYS-09 — Trợ giúp / câu hỏi thường gặp** + nút phản hồi.
- **SYS-10 — Nhật ký hoạt động (audit)**: ai đổi/hủy lịch, khi nào (giải quyết tranh cãi).
- **SYS-11 — Quyền riêng tư & dữ liệu cá nhân** (theo Nghị định 13/2023): trang chính sách + điều khoản; **tiệm là bên kiểm soát dữ liệu khách**; khách đồng ý nhận tin nhắc; **khách/tiệm yêu cầu được xóa dữ liệu cá nhân** (liên kết KH-05); nêu rõ dữ liệu lưu gì, dùng làm gì. *Xong khi: có trang chính sách + thao tác xóa dữ liệu khách theo yêu cầu chạy được.*

## Dữ liệu chính (tối đa 5 loại)
- **Tiệm** (tên, địa chỉ, giờ mở cửa, gói thuê bao, cài đặt nhắc)
- **Thợ** (tên, dịch vụ làm được, giờ làm, ngày nghỉ, quyền)
- **Khách** (tên, SĐT, ghi chú, lịch sử, số no-show)
- **Dịch vụ** (tên, nhóm, thời lượng, giá, bật/tắt)
- **Lịch hẹn** (khách, thợ, dịch vụ, giờ bắt đầu/kết thúc, trạng thái, kênh đặt)

## Ngoài phạm vi (cả sản phẩm cũng KHÔNG làm — ít nhất 3 mục)
- Không bán hàng / quản lý kho mỹ phẩm.
- Không thanh toán online (khách trả tại tiệm); chỉ ghi nhận doanh thu.
- Không có chợ khách (marketplace) kéo khách lạ như Booksy/Fresha.
- Không quản lý nhiều chi nhánh trong một tài khoản.
- Không làm app gốc iOS/Android riêng (chỉ web responsive) — cố tình bỏ phần SYS app-native.

## Phần nào làm nhanh, phần nào phải tự xem kỹ
| Làm nhanh, để máy lo | Phải tự xem kỹ trước khi dùng |
|---|---|
| Thêm/sửa/xóa khách, dịch vụ, thợ; danh sách; lọc; báo cáo; giao diện | Đăng nhập & phân quyền (TT-01, TH-04); chặn đặt trùng giờ (DL-08); gửi nhắc đúng giờ theo múi giờ (NL-01); khóa tính năng theo gói (TT-06) |

## Điểm còn phân vân
- Kênh nhắc chính nên là **Zalo OA, SMS hay email**? (ảnh hưởng chi phí và tỷ lệ khách đọc) — cần chốt ở Pha 2.
- Trang đặt lịch công khai cho khách dùng **không cần tài khoản** hay nên có đăng nhập nhẹ? (đổi sự thuận tiện vs chống spam)
- **Định mức tin nhắc/tháng trong gói** + cơ chế khi vượt (phí ZNS ~200–800đ/tin có thể vượt cả gói nếu nhắc 2 mốc × nhiều hẹn) — cân nhắc mặc định 1 mốc nhắc để giữ biên (liên kết TT-06, NL-01, TT-04).
- **Yêu cầu phi chức năng (NFR)** cần chốt ở Pha 2: sao lưu & khôi phục dữ liệu lịch/khách; băm mật khẩu + giới hạn đăng nhập sai (liên kết TT-01, SYS-10).
- Một vòng tra **đối thủ nội địa** (app đặt lịch salon Việt) để chắc ngách "tiếng Việt, giá phẳng" chưa bị chiếm.
