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
- `prisma/schema.prisma`: 5 model — **Tiem, Tho, Khach, DichVu, LichHen**. **Mọi model con mang `tiemId`** (multi-tenant). Field tối thiểu cho M1:
  - `Tiem(id, ten, diaChi, gioMoCua, goiThueBao)`
  - `Tho(id, tiemId, ten, gioLam, ngayNghi, quyen)`
  - `Khach(id, tiemId, ten, sdt, ghiChu)` — *soNoShow, ngaySinh thêm ở M2/M4*
  - `DichVu(id, tiemId, ten, thoiLuong, gia, bật)` — *nhom thêm ở M1 nếu cần DV-04*
  - `LichHen(id, tiemId, thoId, khachId, dichVuId, batDau, ketThuc, trangThai, kenhDat)` với `trangThai ∈ {ChoXacNhan,DaXacNhan,HoanTat,KhongDen,DaHuy}`
- **Cô lập multi-tenant (bắt buộc):** mọi truy vấn trong `lib/services/` lọc theo `tiemId` lấy từ **session**, KHÔNG nhận `tiemId`/`thoId` tùy ý từ client (chống IDOR — liên kết TH-04).
- `POST /api/lich-hen` → tạo hẹn, **chặn trùng giờ một thợ (DL-08)** → 201 LichHen | 409 (trùng giờ) | 400.
  - **Định nghĩa "trùng" (half-open):** trùng khi cùng `thoId`, `trangThai ≠ DaHuy`, và `A.batDau < B.ketThuc AND A.ketThuc > B.batDau` (hai hẹn kề sát 10:00–10:45 và 10:45–11:30 KHÔNG trùng).
  - **Chống đua (race) ở tầng DB, không chỉ ở app:** dùng Postgres exclusion constraint (`btree_gist` trên `tsrange(batDau,ketThuc)` + `thoId`) **hoặc** giao dịch SERIALIZABLE. Read-then-write trong app là KHÔNG đủ (liên kết DL-01, DL-07, DL-10).
- `GET /api/lich-hen?tu=&den=` → 200 [LichHen] trong khoảng; phạm vi thợ **suy từ quyền của actor** (thợ thường chỉ thấy lịch mình), không nhận `thoId` tùy ý.
- Gửi nhắc đứng sau interface `lib/services/nhac-lich/Sender` (đổi kênh email↔ZNS↔SMS không sửa nơi gọi).

## Pattern mẫu (SẼ TẠO ở đầu M1 — chưa tồn tại, là mẫu cho phần sau)
- Service mẫu: `lib/services/lich-hen.ts` (gồm hàm chặn trùng giờ + lọc theo `tiemId`).
- Route mẫu: `app/api/lich-hen/route.ts`.
- Test mẫu: `tests/lich-hen.test.ts` (ca chặn trùng giờ + ca kề-sát + ca đua đồng thời) — chạy trên **Postgres thật** (Testcontainers/DB ephemeral), không SQLite.

## Lệnh
```
pnpm dev · pnpm test · pnpm lint · pnpm typecheck
```

## Agent KHÔNG được tự ý
- Sửa auth/phân quyền (TT-01, TH-04), logic chặn trùng giờ (DL-08), tích hợp kênh nhắc trả phí, schema phá tương thích, xử lý dữ liệu cá nhân khách → phải có người duyệt.
- Thêm phụ thuộc mới chưa duyệt.

## Bài học (đừng lặp lại)
- <điền dần khi gặp cách làm KHÔNG hiệu quả>
