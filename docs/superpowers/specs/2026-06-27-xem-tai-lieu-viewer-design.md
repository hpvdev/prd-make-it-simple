# Thiết kế — Skill `xem-tai-lieu` (trình xem tài liệu SDD trên web)

> Ngày: 2026-06-27 · Trạng thái: đã duyệt thiết kế, chờ viết plan
> Pha kế tiếp: `writing-plans` → triển khai.

## 1. Bối cảnh & mục tiêu

Dự án "Đặt Lịch Tiệm Tóc" theo quy trình SDD sinh ra một bộ tài liệu điều khiển ở [docs/sdd/](../../sdd/):

- **Pha 1** (skill `tao-san-pham`): `product-brief.md`, `PRD.yaml`
- **Pha 2** (skill `tao-nen-tang`): `constitution.md`, `AGENTS.md`, `ROADMAP.yaml`

Hiện chỉ đọc được dưới dạng văn bản thô. Mục tiêu: **một trình xem web cục bộ** render bộ tài liệu này đẹp, có cấu trúc, dễ tham khảo — tham chiếu cơ chế visual của superpowers (server cục bộ + theme + live-reload).

### Mục tiêu
- Xem bộ tài liệu SDD trên trình duyệt với giao diện có cấu trúc (không phải dump văn bản thô).
- "Khung thiết kế sẵn": chạy skill pha 1/2 ghi đè file → trình xem **tự cập nhật** mà không phải đụng vào trình xem.
- Khởi động tức thì, **không** cần `pnpm install`, **không** dính vào build/stack sản phẩm.

### Không làm (non-goals)
- Không sửa tài liệu từ trình duyệt (chỉ-đọc).
- Không ghi sự kiện click ngược về agent (khác superpowers — ta không cần kênh chọn lựa).
- Không xác thực phức tạp; chạy cục bộ trên `localhost`.
- Không đụng vào `package.json` / Next.js của sản phẩm.

## 2. Quyết định đã chốt (qua brainstorming)

| # | Quyết định | Chọn |
|---|-----------|------|
| 1 | Mức cấu trúc | **Dashboard có cấu trúc** — server parse YAML/MD, render view riêng theo loại tài liệu |
| 2 | Runtime | **Node độc lập, zero-dependency** (kiểu superpowers), tách khỏi app sản phẩm |
| 3 | Kích hoạt | **Skill mới `/xem-tai-lieu`** + **live-reload** watch `docs/sdd/` |
| 4 | Visual | Tái dùng theme superpowers: biến CSS sáng/tối, font `system-ui`, accent xanh, status pill |
| 5 | Kênh live-reload | **SSE** (một chiều server→browser) thay cho WebSocket — đủ và gọn hơn |
| 6 | Parsing | Parser **mini tự viết** (YAML theo schema ta kiểm soát + Markdown đơn giản); tùy chọn vendor `js-yaml` 1 file nếu cần chắc chắn hơn |

## 3. Kiến trúc tổng thể

```
chạy /xem-tai-lieu → start server.cjs (chạy nền) → mở trình duyệt tới URL
        │                                              ▲
        │  fs.watch(docs/sdd/)                         │
        ▼                                              │
   file đổi ──► server đẩy SSE "changed" ──► browser re-fetch GET /data.json
                                                       │
                                              app.js render lại dashboard
                                              (giữ nguyên tab/filter/scroll)
```

- **Server (`server.cjs`)** — chỉ làm: (a) parse `docs/sdd/*.{md,yaml}` → đối tượng JS → phơi `GET /data.json`; (b) phục vụ shell HTML + theme.css + app.js tĩnh; (c) `fs.watch` thư mục `docs/sdd/` → đẩy sự kiện SSE qua `GET /events`.
- **Client (`app.js`)** — fetch `/data.json`, render toàn bộ dashboard ở phía trình duyệt (đây là "khung thiết kế sẵn", chỉ *fill* dữ liệu). Nghe SSE → re-fetch + render lại, bảo toàn trạng thái UI.
- **Markdown → HTML** dựng sẵn ở server (Node) và nhét chuỗi HTML vào JSON, để client khỏi cần thư viện markdown.

> **Vì sao SSE thay vì WebSocket:** superpowers dùng WS vì cần 2 chiều (ghi lựa chọn click của user). Trình xem chỉ-đọc nên chỉ cần đẩy 1 chiều "file đã đổi" → SSE (built-in `http`, không bắt tay phức tạp) là đủ và đơn giản hơn nhiều.

## 4. Hình dạng `/data.json` (giao kèo server → client)

```jsonc
{
  "project": "Đặt Lịch Tiệm Tóc",
  "generatedAt": 1719500000000,
  "docs": {
    "product-brief": { "kind": "md",  "exists": true, "title": "...", "html": "<h1>…", "toc": [...] },
    "prd":           { "kind": "prd", "exists": true, "data": { /* PRD.yaml đã parse */ } },
    "constitution":  { "kind": "md",  "exists": true, "html": "…", "toc": [...] },
    "agents":        { "kind": "md",  "exists": true, "html": "…", "toc": [...] },
    "roadmap":       { "kind": "roadmap", "exists": true, "data": { /* ROADMAP.yaml đã parse */ } }
  },
  "errors": [ { "file": "PRD.yaml", "message": "…" } ]  // lỗi parse hiện trên UI, không làm sập server
}
```

- File thiếu → `exists:false` (UI hiện "chưa có"), không ném lỗi.
- Lỗi parse một file → ghi vào `errors[]`, các file khác vẫn render.

## 5. Giao diện viewer

Khung (shell) tái dùng visual superpowers:

```
┌── header: "Đặt Lịch Tiệm Tóc"                       ● live ─┐
├─ sidebar ─────────┬── main content ───────────────────────┤
│ PHA 1 — Sản phẩm  │  [view tùy theo loại tài liệu đang chọn]│
│   • Product Brief │                                         │
│   • PRD           │                                         │
│ PHA 2 — Nền tảng  │                                         │
│   • Constitution  │                                         │
│   • AGENTS        │                                         │
│   • Roadmap       │                                         │
└───────────────────┴─────────────────────────────────────────┘
```

- **Header:** tên dự án (lấy từ PRD/brief), status pill "live" (trạng thái SSE), tự sáng/tối theo OS.
- **Sidebar:** nhóm theo Pha 1 / Pha 2; mục thiếu file hiện mờ + nhãn "chưa có".

### View theo loại
- **`md` (Product Brief / Constitution / AGENTS):** markdown → HTML, typography đẹp, có mục lục (TOC) từ heading.
- **`prd` (PRD.yaml):**
  - Khối *problem* nổi bật.
  - Mỗi **cụm** (DL, KH, DV, TH, NL, BC, TT, SYS) là một section; mỗi **feature** là một *thẻ*: `id`, `name`, `desc`, **badge lớp** (C = lõi / P = hoàn thiện), `done_when`, **chips `links`** (bấm để nhảy tới feature liên quan).
  - **Thanh lọc:** theo cụm, theo lớp (C/P), ô tìm kiếm (id/tên/mô tả).
  - Panel phụ: `key_data`, `out_of_scope`, `nfr`, `fast_track`/`review_carefully`, `open_questions`.
- **`roadmap` (ROADMAP.yaml):**
  - **Timeline milestone** dọc (M0 → M5); mỗi thẻ: `name`, `goal`, **chips `feature_ids`**, **badge `depends_on`**, `done_when`, `estimate`, `risk`.
  - Panel `coverage`, `deferred`, `backlog`.
- **Liên kết chéo:** mã feature (vd `DL-08`) bấm được, nhảy qua lại PRD ↔ Roadmap (tận dụng dữ liệu có cấu trúc).

### Bảo toàn trạng thái khi live-reload
Khi nhận SSE "changed": chỉ re-fetch JSON và render lại, **giữ** tab đang xem, bộ lọc, vị trí scroll.

## 6. Cấu trúc file của skill

```
.claude/skills/xem-tai-lieu/
  SKILL.md            # hướng dẫn agent: chạy start-server.sh, mở trình duyệt, chia sẻ URL
  scripts/
    server.cjs        # HTTP + SSE + fs.watch + parse → /data.json  (zero-dep)
    start-server.sh   # phỏng superpowers: chạy nền, in JSON {url, port, pid}, idempotent
    stop-server.sh    # dừng server theo pid/port
    yaml-mini.cjs     # parser YAML tối giản cho schema ta kiểm soát
    md-mini.cjs       # renderer Markdown tối giản → HTML + TOC
  assets/
    frame.html        # shell: sidebar + header + slot nội dung
    theme.css         # bê từ frame-template.html của superpowers (biến CSS sáng/tối)
    app.js            # render dashboard + filter + cross-link + SSE live-reload client
```

Vị trí tạm thời/đầu ra runtime (gitignore): `.xem-tai-lieu/` (pid, log, server-info) — tương tự `.superpowers/` của superpowers.

## 7. Parsing — giữ "zero install"

Vì server phải tự re-render khi file đổi, parser nằm trong Node (không thể đẩy cho agent):

- **YAML (`yaml-mini.cjs`):** xử lý đúng các cấu trúc xuất hiện trong `PRD.yaml`/`ROADMAP.yaml` do skill ta sinh ra: map lồng nhau (thụt 2 space), list scalar, **list-of-map**, **folded scalar `>`**, chuỗi quoted (chứa dấu `:`), comment `#`, list inline `[A, B]`. KHÔNG cố tổng quát hoá toàn bộ YAML.
  - *Tùy chọn dự phòng:* nếu thấy parser mini rủi ro, vendor `js-yaml` (1 file, commit kèm, `require` cục bộ) — vẫn "không cần install".
- **Markdown (`md-mini.cjs`):** heading, list (có lồng), bold/italic/code inline, code block, link, bảng, blockquote, hr, đoạn văn. Sinh kèm TOC từ heading. Escape HTML an toàn.

## 8. Ca biên & xử lý lỗi

- Thiếu `docs/sdd/` hoặc file → `exists:false`, UI báo "chưa có", không sập.
- Lỗi parse một file → vào `errors[]`, file khác vẫn hiển thị; UI hiện banner lỗi.
- Server đã chạy (gọi `/xem-tai-lieu` lần nữa) → start-server.sh phát hiện port/pid cũ, không khởi động trùng, trả URL cũ.
- `fs.watch` nhả nhiều event dồn → debounce (~150ms) trước khi đẩy SSE.
- Mất kết nối SSE → client tự reconnect (backoff), status pill chuyển "reconnecting".

## 9. Kiểm thử

- **Unit `yaml-mini`:** parse `PRD.yaml` & `ROADMAP.yaml` thật → so khớp các trường chính (số cụm, số feature, milestone, folded scalar `problem`/`goal`).
- **Unit `md-mini`:** các phần tử markdown cơ bản + escape HTML.
- **Smoke server:** start → `GET /data.json` trả 200 + đủ 5 mục `docs` + `project` đúng; sửa 1 file → nhận event SSE.
- Dùng chính bộ `docs/sdd/` hiện có làm fixture.

## 10. Điểm cần xác nhận khi viết plan
- Chốt parser mini vs vendor `js-yaml` (mặc định: mini).
- `start-server.sh`/`stop-server.sh` bám sát mẫu superpowers tới mức nào (idle-timeout, --open, --host).
- Có thêm `?key=` bảo vệ như superpowers không (mặc định: không, vì localhost-only).

> Ghi chú: repo hiện **không phải git** nên bỏ bước commit spec; nếu sau này `git init` thì commit file này.
