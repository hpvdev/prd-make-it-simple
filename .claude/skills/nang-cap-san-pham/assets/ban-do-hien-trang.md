# Bản đồ hiện trạng — <TÊN DỰ ÁN>

> Agent điền từ việc ĐỌC CODE (routes, models, services, schema DB). Đây là "PRD hiện trạng":
> sản phẩm ĐANG có gì — chưa phải cái muốn thêm. Trình user xác nhận (GATE 1) trước khi đi tiếp.
> Ngôn ngữ tiếng Việt thường; giữ nguyên định danh code (tên route/model/hàm).

## Nguồn đã đọc
- Routes/API: "<liệt kê file/đường dẫn thật đã quét>"
- Models/Schema DB: "<…>"
- Services/logic: "<…>"

## Cụm tính năng ĐANG có (suy từ code)
> Mỗi cụm gán mã (2 chữ hoa). Mỗi tính năng: id <CỤM>-NN · (C/P) · tên · done_when (suy từ hành vi code).
- code: XX
  name: "<tên cụm>"
  features:
    - id: XX-01
      layer: C
      name: "<tính năng quan sát được trong code>"
      desc: "<route/hàm/màn hình tương ứng>"
      done_when: "<hành vi hiện có, kiểm được>"
      evidence: "<file:dòng hoặc tên route/model làm bằng chứng>"

## Dữ liệu chính ĐANG lưu (suy từ schema)
- name: "<loại dữ liệu>"
  stores: ["<trường chính>"]
  evidence: "<model/schema file:dòng làm bằng chứng>"

## Khoảng trống / điểm nghi ngờ
> Chỗ agent KHÔNG chắc — cần user xác nhận ở GATE 1.
- "<vd: có route X nhưng không rõ thuộc cụm nào>"

## Đối chiếu với PRD cũ (chỉ khi có docs/sdd/PRD.yaml)
- khớp: "<cụm/mã trùng khớp code>"
- lệch: "<PRD ghi có nhưng code không thấy, HOẶC code có nhưng PRD thiếu>"
