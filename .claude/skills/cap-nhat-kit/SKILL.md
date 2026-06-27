---
name: cap-nhat-kit
description: Đồng bộ bản MyAIKit mới về project đã cài kit. Đọc kit-manifest.txt của kit nguồn rồi copy đè skills/agents/commands/hooks/settings/CLAUDE.md vào project hiện tại. Use this skill khi user nói "cập nhật kit", "đồng bộ kit", "kéo bản kit mới", "/cap-nhat-kit", và đưa đường dẫn tới thư mục MyAIKit nguồn. KHÔNG dùng cho lần cài đầu (dùng install.sh) — skill này giả định project đã có kit.
---

# cap-nhat-kit — đồng bộ bản MyAIKit mới về project hiện tại

## Khi nào dùng
Project đã cài kit (qua `install.sh`), nay muốn kéo bản kit mới nhất từ thư mục MyAIKit nguồn.

## Tiền điều kiện
- User cung cấp **đường dẫn tới thư mục kit nguồn** (nơi chứa `kit-manifest.txt`).
- Nếu user không đưa đường dẫn → hỏi: "Đường dẫn tới thư mục MyAIKit nguồn là gì?"

## Quy trình
1. Đặt `KIT="<đường-dẫn-user-đưa>"`. Kiểm `KIT/kit-manifest.txt` tồn tại; nếu không → báo lỗi và dừng.
2. Đọc từng dòng `kit-manifest.txt` (bỏ dòng trống và dòng bắt đầu `#`).
3. Với mỗi `path`: copy đè từ `KIT/$path` về `./$path` (project hiện tại). Lệnh tham khảo:
   ```bash
   while IFS= read -r p || [ -n "$p" ]; do
     case "$p" in ''|\#*) continue ;; esac
     [ -e "$KIT/$p" ] || { echo "  ! bo qua: $p"; continue; }
     mkdir -p "$(dirname "$p")"; rm -rf "./$p"; cp -R "$KIT/$p" "./$p"
     echo "  ✓ $p"
   done < "$KIT/kit-manifest.txt"
   ```
4. Báo cáo cho user: liệt kê các path đã cập nhật.
5. Nhắc: nếu user từng chỉnh tay `settings.local.json` thì kiểm lại vì đã bị đè.

## Ranh giới
- KHÔNG tự `git commit` — để user tự xem diff rồi commit.
- KHÔNG cài `docs/sdd/` hay artifact dự án — chỉ đúng các path trong manifest.
- Đè thẳng, không merge (theo thiết kế kit).
