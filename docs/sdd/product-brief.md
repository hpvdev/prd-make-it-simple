# Khung giá trị & kinh doanh — Đặt Lịch Tiệm Tóc

> Tầng "vì sao & sống bằng gì" — chốt TRƯỚC khi định hình tính năng (`PRD.yaml`).
> Dựa trên bằng chứng nghiên cứu, không chỉ phỏng đoán.

## Giá trị cốt lõi
- **Đối thủ thật sự không phải Booksy/Fresha** — đa số tiệm tóc nhỏ VN chưa từng dùng app ngoại. Cái đang cạnh tranh là **Zalo + sổ tay + trí nhớ**: MIỄN PHÍ, không phải học gì.
- Vậy nên giá trị phải hơn *Zalo/sổ tay*, không phải hơn app ngoại: **tự động chống xếp trùng giờ, tự nhắc khách giảm no-show, xem nhanh lịch cả tiệm** — những việc Zalo/sổ tay không làm được, đang gây mất tiền thật (khách bỏ về, quên hẹn).
- Lý do tiệm chịu bỏ công cụ free để trả tiền: **mỗi no-show/trùng giờ = mất một suất khách**; chỉ cần cứu vài suất/tháng là đã hơn phí thuê bao.
- So với app ngoại (chỉ là nhóm tham chiếu, không phải đối thủ chính): ta **tiếng Việt, giá phẳng rẻ, không ăn hoa hồng** (Fresha ăn 20% khách mới, Booksy ~$29.99/tháng, hướng thị trường Mỹ).

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
Hai rủi ro ngang nhau, **kiểm chứng TRƯỚC khi code nhiều** (đừng xây xong mới biết sai):

- **R1 — Chủ tiệm có thật sự móc ví hằng tháng không** (quen free Zalo/sổ tay).
  - *Kiểm chứng rẻ & sớm — KHÔNG phải "cho dùng free rồi hỏi"* (dùng free quen tay ≠ quyết định trả tiền, lại tốn công xây sản phẩm trước): **chào bán trước (pre-sell)** ở mức giá cụ thể (vd 149k/tháng) — thu **đặt cọc / thư cam kết trả tiền** từ 5–10 tiệm *trước* khi xây đầy đủ. Có người đặt cọc mới làm tiếp.
- **R2 — Kênh nhắc lịch có chạy được & đủ rẻ không** (đây là giá trị cốt lõi chống no-show).
  - Zalo OA cần doanh nghiệp xác minh + phí ZNS theo tin; SMS brandname cần đăng ký + phí. Nếu phí tin nhắn đội lên trên gói 99–199k thì **giá trị cốt lõi sụp** hoặc lỗ.
  - *Kiểm chứng sớm:* tra **giá ZNS/SMS thực tế + điều kiện đăng ký ngay trong Pha 1**; thử một kênh rẻ nhất (vd email/Zalo cá nhân) cho bản đầu để xác nhận khách có đọc nhắc không, trước khi cam kết kênh trả phí.

## Ràng buộc thực tế
> Claude Code lo phần viết code — chỉ xét những thứ nó KHÔNG giải quyết thay.
- Tích hợp khó kiếm: **gửi nhắc lịch** cần dịch vụ ngoài (Zalo OA / SMS / email) — Zalo/SMS có thể tốn phí và cần đăng ký.
- Chi phí vận hành ước lượng: hosting + cơ sở dữ liệu nhỏ (vài chục–vài trăm nghìn/tháng lúc đầu) + phí tin nhắn nhắc lịch tính theo lượng gửi.
