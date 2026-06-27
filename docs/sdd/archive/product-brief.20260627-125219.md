# Khung giá trị & kinh doanh — Đặt Lịch Tiệm Tóc

> Tầng "vì sao & sống bằng gì" — chốt TRƯỚC khi định hình tính năng (`PRD.md`).
> Dựa trên bằng chứng nghiên cứu, không chỉ phỏng đoán.

## Giá trị cốt lõi
- Hiện giờ chủ tiệm tóc nhỏ xoay xở bằng: ghi sổ tay / nhắn Zalo / Facebook, hoặc dùng app ngoại (Booksy, Fresha) đắt và tiếng Anh → hay trùng giờ, khách chờ, khách quên lịch (no-show).
- Sản phẩm hơn ở chỗ: **tiếng Việt, giá phẳng rẻ, không ăn hoa hồng khách, cài đặt trong ~10 phút** — đủ đơn giản cho chủ tiệm tự dùng.
- Khác biệt rõ với đối thủ: Fresha ăn 20% hoa hồng khách mới, Booksy ~$29.99/tháng và hướng thị trường Mỹ.

## Mục tiêu của người làm
- Làm xong để **kiếm tiền**: bán phần mềm theo gói thuê bao cho các tiệm tóc nhỏ tại VN.

## Mô hình kiếm tiền
- Ai trả tiền: **chủ tiệm tóc** (1–5 thợ). Trả cho: chỗ nhận đặt lịch + quản lý khách/thợ gọn nhẹ.
- Cách thu: **thuê bao tháng phẳng theo tiệm** (vd 99–199k/tháng), **không thu hoa hồng** trên khách.
- Có bản dùng thử miễn phí (vd 14 ngày) để tiệm trải nghiệm trước khi trả tiền.

## Người dùng & thị trường
- Người dùng chính: **chủ tiệm tóc/barber nhỏ** (vừa quản lý vừa làm). Người trả tiền: cùng là chủ tiệm.
- Người dùng phụ: **khách của tiệm** (đặt lịch online, không trả tiền cho phần mềm).
- Quy mô / xu hướng: rất nhiều tiệm tóc nhỏ ở VN đang chuyển từ sổ tay/Zalo sang công cụ số; thị trường đặt lịch làm đẹp toàn cầu tăng đều.

## Bối cảnh thị trường & đối thủ  (mức nghiên cứu: nhanh)
- **Booksy** — mạnh: chợ khách kéo khách mới, nhắc tự động; yếu: ~$29.99/tháng, hướng thị trường Mỹ.
- **Fresha** — mạnh: miễn phí, có thanh toán/kho hàng; yếu: **ăn 20% hoa hồng** khách mới qua chợ.
- **Square Appointments** — mạnh: gắn liền thanh toán Square; yếu: phụ thuộc hệ Square, khó dùng ở VN.
- **Zenoti** — mạnh: nhiều tính năng; yếu: cho chuỗi lớn, nặng & đắt cho tiệm nhỏ.
- **StylesGo** — mạnh: app cho thợ, gọn; yếu: mới, hệ sinh thái nhỏ.
- Khoảng trống mình chen vào: **app tiếng Việt, giá phẳng rẻ, không hoa hồng, đơn giản** cho tiệm 1–5 thợ.
- Nguồn tham khảo: Booksy blog, Zenoti blog, StylesGo blog — tra ngày 27/06/2026.

## Thước đo thành công
- Con số chính sau ra mắt: **số tiệm trả phí đang dùng hằng tháng** (vd đạt 50 tiệm trả phí trong 6 tháng đầu).

## Giả định rủi ro nhất
- Rủi ro lớn nhất: **chủ tiệm nhỏ có chịu trả tiền hằng tháng không** (quen miễn phí Zalo/sổ tay).
- Cách kiểm chứng sớm & rẻ: cho 5–10 tiệm dùng thử bản đầu tiên miễn phí, đo có ai chịu trả tiền sau thử việc.

## Ràng buộc thực tế
> Claude Code lo phần viết code — chỉ xét những thứ nó KHÔNG giải quyết thay.
- Tích hợp khó kiếm: **gửi nhắc lịch** cần dịch vụ ngoài (Zalo OA / SMS / email) — Zalo/SMS có thể tốn phí và cần đăng ký.
- Chi phí vận hành ước lượng: hosting + cơ sở dữ liệu nhỏ (vài chục–vài trăm nghìn/tháng lúc đầu) + phí tin nhắn nhắc lịch tính theo lượng gửi.
