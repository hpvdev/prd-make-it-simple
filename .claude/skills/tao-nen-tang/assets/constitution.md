<!-- Khuôn template SDD. Điền xong thì ghi bản hoàn chỉnh ra `docs/sdd/constitution.md`. -->
# Constitution — <TÊN DỰ ÁN>

> Luật bất biến. Mọi spec, plan, code đều phải tuân. Đọc file này trước mọi việc.

## Ranh giới
| Agent tự làm | Người PHẢI review trước khi merge |
|---|---|
| CRUD, UI, bộ lọc, boilerplate | Xác thực & phân quyền |
| Migration, refactor giữ nguyên hành vi | Thanh toán / tiền |
| Tích hợp thư viện phổ biến | Thuật toán cốt lõi, thay đổi schema phá tương thích |

## Ràng buộc bảo mật
- Không tin input người dùng: validate + sanitize ở biên.
- Không hardcode secret; dùng biến môi trường.
- Mọi truy cập dữ liệu phải qua kiểm tra phân quyền.
<Điền các mục dưới NẾU áp dụng — xóa mục không liên quan, đừng để trống kiểu chung chung:>
- *(Nếu nhiều người dùng/tổ chức dùng chung)* **Cô lập multi-tenant:** mọi truy vấn lọc theo khóa
  tenant lấy từ session; KHÔNG nhận khóa tenant/định danh tài nguyên tùy ý từ client (chống IDOR).
- *(Nếu có tài nguyên chia sẻ: slot lịch, tồn kho, ghế…)* **Chống đua (race):** giành tài nguyên
  phải an toàn trước truy cập đồng thời ở **tầng DB** (constraint/giao dịch), không chỉ kiểm trong app.
- *(Nếu lưu dữ liệu cá nhân)* tuân thủ pháp lý local (vd VN: Nghị định 13/2023): có chính sách,
  đồng ý, **đường xóa theo yêu cầu**; nêu rõ ai là bên kiểm soát dữ liệu.
- *(Nếu có đăng nhập mật khẩu)* băm mật khẩu (argon2id/bcrypt), giới hạn số lần đăng nhập sai.
- <ràng buộc riêng khác của dự án>

## Definition of Done (mỗi mục kiểm chứng được)
- [ ] Khớp tiêu chí nghiệm thu của spec
- [ ] Test xanh (unit + tích hợp ở ranh giới quan trọng)
- [ ] lint + typecheck sạch
- [ ] Một lượt review riêng: spec + chất lượng + bảo mật
- [ ] Cập nhật ROADMAP/AGENTS nếu có quyết định mới
