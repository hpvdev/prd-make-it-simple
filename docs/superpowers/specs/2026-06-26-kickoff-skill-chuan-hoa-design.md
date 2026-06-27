# Design — Chuẩn hóa & tách skill SDD Pha 1 / Pha 2 (Claude Code agent skill)

> Spec là nguồn chân lý. File này (design brainstorming) sống trong `docs/superpowers/specs/`.
> `docs/sdd/` là nơi chứa OUTPUT các pha của skill — không phải nơi để spec này.
> Ngày: 2026-06-26.

## 1. Vấn đề & mục tiêu

Repo MyAIKit đang chứa skill `kickoff` gộp **Pha 1 + Pha 2** của vòng đời SDD nhưng **đặt sai
chỗ và tham chiếu gãy**, nên Claude Code không nhận diện được như project skill.

**Mục tiêu:**
1. Đưa về **đúng cấu trúc agent skill chuẩn Claude Code** (`.claude/skills/<name>/SKILL.md` + `assets/`).
2. **Tách thành 2 skill độc lập** theo từng pha; Pha 2 nhận output Pha 1 làm input.
3. Đặt tên skill **đúng theo chức năng** (bỏ tên "kickoff" chung chung).
4. Chuyển quy ước output sang thư mục `docs/sdd/`.

**Không đổi:** logic/nội dung 2 pha giữ nguyên; chỉ chuẩn hóa vị trí, tách skill, tên, tham chiếu, đích output.

## 2. Hai skill sau khi tách

| Skill | Pha | Input | Output | Bàn giao |
|---|---|---|---|---|
| **`tao-san-pham`** | 1 — Định hình sản phẩm | (user trả lời câu hỏi) | `docs/sdd/PRD.md` | → gợi ý chạy `tao-nen-tang` |
| **`tao-nen-tang`** | 2 — Nền tảng & kiến trúc | `docs/sdd/PRD.md` (bắt buộc) | `docs/sdd/{constitution,AGENTS,ROADMAP}.md` + `CLAUDE.md` gốc repo | → bàn giao Pha 3 (Superpowers) |

**Cơ chế bàn giao:** `tao-san-pham` kết thúc bằng gợi ý chạy `tao-nen-tang`; `tao-nen-tang`
có **tiền điều kiện**: đọc `docs/sdd/PRD.md` — nếu thiếu thì DỪNG và yêu cầu chạy `tao-san-pham` trước.

## 3. Cấu trúc đích

```
<repo>/
├── docs/sdd/                         # OUTPUT spec các pha (control plane, con người sở hữu)
│   ├── PRD.md                        # Pha 1 (tao-san-pham)
│   ├── constitution.md               # Pha 2 (tao-nen-tang)
│   ├── AGENTS.md                    # Pha 2 (bản gốc)
│   └── ROADMAP.md                   # Pha 2
├── CLAUDE.md                         # gốc repo — chỉ `@`-import `docs/sdd/AGENTS.md` để auto-load
└── .claude/skills/
    ├── tao-san-pham/
    │   ├── SKILL.md
    │   └── assets/PRD.md             # khuôn
    └── tao-nen-tang/
        ├── SKILL.md
        └── assets/{constitution,AGENTS,ROADMAP}.md   # khuôn
```

**Tách bạch:** *asset* = khuôn template (sống trong skill, `assets/`); *output* = spec đã điền của
dự án (sống trong `docs/sdd/`).

## 4. Quyết định thiết kế (đã chốt với user)

1. **Tách 2 skill** theo pha, tên theo chức năng: `tao-san-pham` (Pha 1), `tao-nen-tang` (Pha 2).
2. **Output → `docs/sdd/`:** mọi spec output gom vào đây, làm input cho pha sau.
3. **AGENTS.md auto-load:** bản gốc `docs/sdd/AGENTS.md`; `tao-nen-tang` sinh thêm `CLAUDE.md`
   gốc repo chỉ chứa `@docs/sdd/AGENTS.md` (tạo mới nếu chưa có; chèn dòng nếu đã có).
4. **`allowed-tools`:** để trống (skill dùng full tool) — đơn giản, dễ maintain.
5. **Template:** di chuyển nguyên trạng vào `assets/` đúng skill; thêm 1 dòng comment nhắc đích output.
6. **Dọn dẹp:** không còn `SKILL.md`/template trần ở gốc repo; không còn tên "kickoff".

## 5. Definition of Done

- [ ] `.claude/skills/tao-san-pham/` và `.claude/skills/tao-nen-tang/` tồn tại, frontmatter
      `name` khớp tên thư mục.
- [ ] `tao-san-pham` chỉ sinh `docs/sdd/PRD.md` rồi dừng, bàn giao `tao-nen-tang`.
- [ ] `tao-nen-tang` có tiền điều kiện đọc `docs/sdd/PRD.md`; sinh 3 file + `CLAUDE.md` import.
- [ ] `assets/` mỗi skill chứa đúng khuôn của pha đó; không còn đường dẫn gãy, không còn tên "kickoff".
- [ ] Gốc repo sạch (không `SKILL.md`/template trần).
- [ ] Cả 2 skill được Claude Code nhận diện (xuất hiện trong danh sách skill).

## 6. Ngoài phạm vi

- Không xây skill cho Pha 3 (khoán cho Superpowers: brainstorming → writing-plans → TDD → review).
- Không xây skill cho Pha 4–6.
- Không thay đổi logic/nội dung của 2 pha.
- Không thêm artifact ngoài PRD/constitution/AGENTS/ROADMAP (không `project-state.md`, `CHANGELOG.md` — pha sau).
