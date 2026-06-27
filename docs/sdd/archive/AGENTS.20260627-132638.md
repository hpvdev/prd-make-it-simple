# AGENTS.md — memory bank dự án Đặt Lịch Tiệm Tóc

> Đặt ở `docs/sdd/`. Agent đọc ở mọi phiên (auto-load qua `CLAUDE.md` gốc repo).
> Giữ NGẮN; trỏ tới file mẫu thật thay vì mô tả dài.

## Sản phẩm
App đặt lịch & quản lý khách cho tiệm tóc/barber nhỏ (1–5 thợ) tại VN. Chủ tiệm dùng để chống xếp
trùng giờ, giảm no-show, xem nhanh lịch cả tiệm. Tiếng Việt, giá phẳng, không hoa hồng.

## Tech stack
- Ngôn ngữ/framework: TypeScript + Next.js (App Router) | DB: PostgreSQL qua Prisma | Quản lý gói: pnpm
- UI: Tailwind CSS | Đăng nhập: Auth.js (email + mật khẩu băm)

## Cấu trúc thư mục
```
app/                  # route Next.js (trang + API route)
  (dashboard)/        # khu quản lý của tiệm (cần đăng nhập)
  api/                # API route
components/           # UI dùng lại
lib/
  services/           # logic nghiệp vụ — MỌI truy cập dữ liệu đi qua đây
  db.ts               # Prisma client
prisma/schema.prisma  # GIAO KÈO dữ liệu chính thức (nguồn chân lý)
tests/                # unit + tích hợp
docs/sdd/             # spec điều khiển (PRD, ROADMAP, constitution, file này)
```

## Quy ước (theo đúng, đừng tự sáng tạo)
- Đặt tên: file kebab-case; component PascalCase; hàm camelCase. Mã tính năng PRD (DL-08…) ghi trong commit/PR.
- Xử lý lỗi: service ném lỗi có kiểu; route bắt → trả mã HTTP + thông báo tiếng Việt thống nhất.
- Data access: **luôn qua `lib/services/`**, KHÔNG query Prisma trực tiếp trong route/component.
- Thời gian: lưu UTC trong DB, hiển thị theo giờ tiệm (VN, GMT+7).

## Interface/contract chính (chốt ở Pha 2)
- `prisma/schema.prisma`: 5 model — Tiem, Tho, Khach, DichVu, LichHen (LichHen có trạng thái: ChoXacNhan|DaXacNhan|HoanTat|KhongDen|DaHuy).
- `POST /api/lich-hen` → tạo hẹn, **kiểm chặn trùng giờ một thợ (DL-08)** → 201 LichHen | 409 (trùng giờ) | 400.
- `GET /api/lich-hen?thoId=&tu=&den=` → 200 [LichHen] trong khoảng.
- Gửi nhắc đứng sau interface `lib/services/nhac-lich/Sender` (đổi kênh email↔ZNS↔SMS không sửa nơi gọi).

## Pattern mẫu (đọc trước khi viết loại tương tự)
- Service mẫu: `lib/services/lich-hen.ts` (gồm hàm chặn trùng giờ).
- Route mẫu: `app/api/lich-hen/route.ts`.
- Test mẫu: `tests/lich-hen.test.ts` (ca chặn trùng giờ).

## Lệnh
```
pnpm dev · pnpm test · pnpm lint · pnpm typecheck
```

## Agent KHÔNG được tự ý
- Sửa auth/phân quyền (TT-01, TH-04), logic chặn trùng giờ (DL-08), tích hợp kênh nhắc trả phí, schema phá tương thích, xử lý dữ liệu cá nhân khách → phải có người duyệt.
- Thêm phụ thuộc mới chưa duyệt.

## Bài học (đừng lặp lại)
- <điền dần khi gặp cách làm KHÔNG hiệu quả>
