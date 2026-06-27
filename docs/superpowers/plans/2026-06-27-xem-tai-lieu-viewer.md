# Skill `xem-tai-lieu` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một skill `/xem-tai-lieu` chạy server Node cục bộ render bộ tài liệu SDD (`docs/sdd/`) thành dashboard web có cấu trúc, tự cập nhật khi file đổi (live-reload).

**Architecture:** Server Node zero-dep parse `docs/sdd/*.{md,yaml}` → phơi `GET /data.json`; phục vụ shell HTML + theme.css + app.js tĩnh; `fs.watch(docs/sdd/)` → đẩy SSE `changed` → trình duyệt re-fetch JSON & render lại (giữ filter/scroll). Front-end render hoàn toàn ở browser từ JSON.

**Tech Stack:** Node.js thuần (`http`, `fs`, không npm), `node:test` để test, HTML/CSS/JS ESM cho front-end. Visual tái dùng theme superpowers (biến CSS sáng/tối).

## Global Constraints

- **Zero-dependency:** KHÔNG thêm npm package, KHÔNG `pnpm install`. Chỉ dùng API built-in của Node. Parser YAML/Markdown tự viết.
- **Tách biệt sản phẩm:** KHÔNG đụng `package.json`, Next.js, Prisma của app. Toàn bộ nằm trong `.claude/skills/xem-tai-lieu/`.
- **Test runner:** `node --test` (built-in). File test `*.test.cjs` (CommonJS) và `*.test.mjs` (ESM).
- **Repo chưa phải git:** bước "Commit" cuối mỗi task là TÙY CHỌN — nếu chưa `git init` thì coi là "Checkpoint": chạy lại toàn bộ test của task và xác nhận xanh. Lệnh commit để sẵn cho khi repo đã là git.
- **Chỉ-đọc:** viewer không ghi ngược dữ liệu; không cần auth (chạy `127.0.0.1`).
- **Ngôn ngữ hiển thị:** nhãn UI tiếng Việt.
- **Đường dẫn gốc skill:** `.claude/skills/xem-tai-lieu/` (gọi tắt `SKILL/` bên dưới).
- **Chạy test từ gốc repo** (`/Users/thuhue/Documents/MyAIKit`) để `process.cwd()` trỏ đúng `docs/sdd/`.

## File Structure

```
.claude/skills/xem-tai-lieu/
  SKILL.md                       # Task 9 — hướng dẫn agent khởi động
  scripts/
    yaml-mini.cjs                # Task 1 — parser YAML tối giản
    yaml-mini.test.cjs           # Task 1
    md-mini.cjs                  # Task 2 — Markdown → HTML + TOC
    md-mini.test.cjs             # Task 2
    data.cjs                     # Task 3 — buildData(sddDir) → object /data.json
    data.test.cjs                # Task 3
    server.cjs                   # Task 4 — HTTP + SSE + watch
    server.test.cjs              # Task 4
    start-server.sh              # Task 8 — khởi động nền + in URL
    stop-server.sh               # Task 8
  assets/
    theme.css                    # Task 5 — theme + layout (từ superpowers)
    frame.html                   # Task 5 — shell sidebar+header+content
    viewmodel.mjs                # Task 6 — hàm thuần lọc/nhóm/index
    viewmodel.test.mjs           # Task 6
    app.js                       # Task 7 — render DOM + filter + cross-link + SSE
```

Đầu ra runtime (gitignore): `.xem-tai-lieu/` ở gốc repo (`server.pid`, `server-url`, `server.log`).

---

### Task 1: Parser YAML tối giản (`yaml-mini.cjs`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/scripts/yaml-mini.cjs`
- Test: `.claude/skills/xem-tai-lieu/scripts/yaml-mini.test.cjs`

**Interfaces:**
- Produces: `module.exports = { parse }` — `parse(text: string) => object`. Hỗ trợ: map lồng (thụt space), list scalar, list-of-map (`- key: val`), folded scalar `>`, literal `|`, flow list `[a, b]`/`[]`, chuỗi quoted `"..."`/`'...'`, comment nguyên dòng `#`. KHÔNG hỗ trợ list cùng-indent với key (file SDD luôn thụt sâu hơn) hay flow map `{}`.

- [ ] **Step 1: Viết test thất bại**

Tạo `yaml-mini.test.cjs`:

````js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { parse } = require('./yaml-mini.cjs');

const SDD = path.join(process.cwd(), 'docs', 'sdd');

test('scalar quoted + unquoted', () => {
  const d = parse('a: "x"\nb: y\n');
  assert.equal(d.a, 'x');
  assert.equal(d.b, 'y');
});

test('flow list rỗng và có phần tử', () => {
  const d = parse('links: []\nrefs: [A, B, C]\n');
  assert.deepEqual(d.links, []);
  assert.deepEqual(d.refs, ['A', 'B', 'C']);
});

test('folded scalar >', () => {
  const d = parse('problem: >\n  dòng một\n  dòng hai\nnext: z\n');
  assert.equal(d.problem, 'dòng một dòng hai');
  assert.equal(d.next, 'z');
});

test('list-of-map lồng', () => {
  const text = 'clusters:\n  - code: DL\n    name: "Đặt lịch"\n    features:\n      - id: DL-01\n        layer: C\n      - id: DL-02\n        layer: P\n';
  const d = parse(text);
  assert.equal(d.clusters.length, 1);
  assert.equal(d.clusters[0].code, 'DL');
  assert.equal(d.clusters[0].features.length, 2);
  assert.equal(d.clusters[0].features[1].layer, 'P');
});

test('PRD.yaml thật: đủ 8 cụm + features có links', () => {
  const d = parse(fs.readFileSync(path.join(SDD, 'PRD.yaml'), 'utf8'));
  assert.equal(d.project, 'Đặt Lịch Tiệm Tóc');
  assert.equal(d.clusters.length, 8);
  const dl = d.clusters.find(c => c.code === 'DL');
  const dl08 = dl.features.find(f => f.id === 'DL-08');
  assert.deepEqual(dl08.links, ['DL-01', 'DL-07']);
  assert.ok(d.problem.includes('Chủ tiệm'));
  assert.equal(d.nfr.security.length > 0, true);
});

test('ROADMAP.yaml thật: milestones + feature_ids', () => {
  const d = parse(fs.readFileSync(path.join(SDD, 'ROADMAP.yaml'), 'utf8'));
  assert.ok(d.milestones.length >= 6);
  const m1a = d.milestones.find(m => m.id === 'M1a');
  assert.ok(m1a.feature_ids.includes('DL-08'));
  assert.deepEqual(m1a.depends_on, ['M0']);
});
````

- [ ] **Step 2: Chạy test để chắc chắn FAIL**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/yaml-mini.test.cjs`
Expected: FAIL — `Cannot find module './yaml-mini'`.

- [ ] **Step 3: Viết implementation**

Tạo `yaml-mini.cjs`:

````js
'use strict';
// Parser YAML tối giản cho PRD.yaml / ROADMAP.yaml (schema do skill SDD sinh).

function tokenize(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === '') { out.push({ blank: true, indent: 0, content: '', raw }); continue; }
    if (/^\s*#/.test(raw)) continue; // bỏ dòng comment nguyên dòng
    const indent = raw.length - raw.replace(/^\s+/, '').length;
    out.push({ blank: false, indent, content: raw.trim(), raw });
  }
  return out;
}

function unquote(s) {
  if (s.length >= 2 && ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'")))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseScalar(s) {
  if (s == null) return null;
  s = s.trim();
  if (s === '') return '';
  if (s === '[]') return [];
  if (s[0] === '[' && s.endsWith(']')) {
    return s.slice(1, -1).split(',').map(x => unquote(x.trim())).filter(x => x !== '');
  }
  return unquote(s);
}

function peek(ctx) {
  while (ctx.pos < ctx.lines.length && ctx.lines[ctx.pos].blank) ctx.pos++;
  return ctx.pos < ctx.lines.length ? ctx.lines[ctx.pos] : null;
}

function parseBlock(ctx, minIndent) {
  const line = peek(ctx);
  if (!line || line.indent < minIndent) return null;
  if (line.content.startsWith('- ') || line.content === '-') return parseList(ctx, line.indent);
  return parseMap(ctx, line.indent);
}

function parseMap(ctx, indent) {
  const obj = {};
  while (true) {
    const line = peek(ctx);
    if (!line || line.indent !== indent || line.content.startsWith('- ')) break;
    const ci = line.content.indexOf(':');
    if (ci === -1) break;
    const key = line.content.slice(0, ci).trim();
    const rest = line.content.slice(ci + 1).trim();
    ctx.pos++;
    if (rest === '>' || rest === '|') obj[key] = parseBlockScalar(ctx, indent, rest);
    else if (rest === '') obj[key] = parseBlock(ctx, indent + 1);
    else obj[key] = parseScalar(rest);
  }
  return obj;
}

function parseList(ctx, indent) {
  const arr = [];
  while (true) {
    const line = peek(ctx);
    if (!line || line.indent !== indent || !(line.content.startsWith('- ') || line.content === '-')) break;
    const after = line.content === '-' ? '' : line.content.slice(2).trim();
    if (after === '') {
      ctx.pos++;
      arr.push(parseBlock(ctx, indent + 1));
    } else if (after[0] !== '"' && after[0] !== "'" && /^[A-Za-z_][\w.-]*:(\s|$)/.test(after)) {
      const off = line.content.indexOf(after);
      line.content = after;
      line.indent = indent + off;
      arr.push(parseMap(ctx, indent + off));
    } else {
      ctx.pos++;
      arr.push(parseScalar(after));
    }
  }
  return arr;
}

function parseBlockScalar(ctx, keyIndent, mode) {
  const parts = [];
  while (ctx.pos < ctx.lines.length) {
    const l = ctx.lines[ctx.pos];
    if (l.blank) { parts.push(''); ctx.pos++; continue; }
    if (l.indent <= keyIndent) break;
    parts.push(l.content);
    ctx.pos++;
  }
  while (parts.length && parts[parts.length - 1] === '') parts.pop();
  if (mode === '|') return parts.join('\n');
  let res = '';
  for (const p of parts) {
    if (p === '') res += '\n';
    else res += (res && !res.endsWith('\n') ? ' ' : '') + p;
  }
  return res;
}

function parse(text) {
  const ctx = { lines: tokenize(text), pos: 0 };
  const v = parseBlock(ctx, 0);
  return v === null ? {} : v;
}

module.exports = { parse };
````

- [ ] **Step 4: Chạy test để chắc chắn PASS**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/yaml-mini.test.cjs`
Expected: PASS — tất cả test xanh. Nếu một ca thật fail, sửa parser theo cấu trúc thực của file (in `JSON.stringify` để soi).

- [ ] **Step 5: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/scripts/yaml-mini.cjs .claude/skills/xem-tai-lieu/scripts/yaml-mini.test.cjs
git commit -m "feat(xem-tai-lieu): parser YAML tối giản cho PRD/ROADMAP"
```

---

### Task 2: Renderer Markdown (`md-mini.cjs`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/scripts/md-mini.cjs`
- Test: `.claude/skills/xem-tai-lieu/scripts/md-mini.test.cjs`

**Interfaces:**
- Produces: `module.exports = { render }` — `render(md: string) => { html: string, toc: Array<{level, text, id}> }`. Hỗ trợ heading (h1–h6, id slug, TOC level ≤3), blockquote nhiều dòng, bảng GFM, list lồng (bullet/ordered/task `- [ ]`), code fence, hr, đoạn văn; inline **bold**, *italic*, `code`, `[t](u)`; escape HTML.

- [ ] **Step 1: Viết test thất bại**

Tạo `md-mini.test.cjs`:

````js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { render } = require('./md-mini.cjs');
const SDD = path.join(process.cwd(), 'docs', 'sdd');

test('heading sinh id + vào toc', () => {
  const r = render('# Tiêu đề Lớn\n');
  assert.match(r.html, /<h1 id="tiêu-đề-lớn">Tiêu đề Lớn<\/h1>/);
  assert.equal(r.toc[0].level, 1);
});

test('inline bold/italic/code/link', () => {
  const r = render('Đây **đậm** và *nghiêng* và `mã` và [link](http://x).\n');
  assert.match(r.html, /<strong>đậm<\/strong>/);
  assert.match(r.html, /<em>nghiêng<\/em>/);
  assert.match(r.html, /<code>mã<\/code>/);
  assert.match(r.html, /<a href="http:\/\/x">link<\/a>/);
});

test('escape HTML', () => {
  const r = render('a < b & c > d\n');
  assert.match(r.html, /a &lt; b &amp; c &gt; d/);
});

test('bảng GFM', () => {
  const r = render('| A | B |\n|---|---|\n| 1 | 2 |\n');
  assert.match(r.html, /<table>/);
  assert.match(r.html, /<th>A<\/th>/);
  assert.match(r.html, /<td>1<\/td>/);
});

test('list lồng + task list', () => {
  const r = render('- cha\n  - con\n- [ ] chưa xong\n- [x] xong\n');
  assert.match(r.html, /<ul>/);
  assert.match(r.html, /<li>cha<ul><li>con<\/li><\/ul><\/li>/);
  assert.match(r.html, /type="checkbox" disabled/);
  assert.match(r.html, /checked/);
});

test('code fence không bị xử lý inline', () => {
  const r = render('```\nx = **a**\n```\n');
  assert.match(r.html, /<pre><code>x = \*\*a\*\*<\/code><\/pre>/);
});

test('constitution.md thật render được bảng + checkbox', () => {
  const r = render(fs.readFileSync(path.join(SDD, 'constitution.md'), 'utf8'));
  assert.match(r.html, /<table>/);
  assert.match(r.html, /type="checkbox"/);
  assert.ok(r.toc.length >= 3);
});
````

- [ ] **Step 2: Chạy test để chắc chắn FAIL**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/md-mini.test.cjs`
Expected: FAIL — `Cannot find module './md-mini'`.

- [ ] **Step 3: Viết implementation**

Tạo `md-mini.cjs`:

````js
'use strict';
// Markdown → HTML tối giản cho .md trong docs/sdd.

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function slugify(s) {
  return s.toLowerCase().trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function inline(s) {
  let t = escapeHtml(s);
  t = t.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => `<a href="${url}">${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return t;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

function renderList(buf) {
  const ordered = /^\s*\d+\./.test(buf[0]);
  let out = ordered ? '<ol>' : '<ul>';
  let i = 0;
  while (i < buf.length) {
    const m = buf[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (!m) { i++; continue; }
    const indent = m[1].length;
    let text = m[3];
    let prefix = '';
    const task = text.match(/^\[([ xX])\]\s+(.*)$/);
    if (task) { prefix = `<input type="checkbox" disabled${task[1].toLowerCase() === 'x' ? ' checked' : ''}> `; text = task[2]; }
    const children = [];
    i++;
    while (i < buf.length) {
      const childIndent = buf[i].match(/^(\s*)/)[1].length;
      if (childIndent > indent && buf[i].trim() !== '') { children.push(buf[i]); i++; }
      else break;
    }
    out += `<li>${prefix}${inline(text)}`;
    if (children.length) out += renderList(children);
    out += '</li>';
  }
  return out + (ordered ? '</ol>' : '</ul>');
}

function render(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  const toc = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (t.startsWith('```')) {
      i++;
      const buf = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++; }
      i++;
      html.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if (t === '') { i++; continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      const id = slugify(text);
      if (level <= 3) toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { html.push('<hr>'); i++; continue; }

    if (/^>/.test(t)) {
      const buf = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
      html.push(`<blockquote>${render(buf.join('\n')).html}</blockquote>`);
      continue;
    }

    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]*-[\s:|-]*\|[\s:|-]*$/.test(lines[i + 1])) {
      const header = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') { rows.push(splitRow(lines[i])); i++; }
      let tbl = '<table><thead><tr>' + header.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      for (const r of rows) tbl += '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>';
      html.push(tbl + '</tbody></table>');
      continue;
    }

    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && lines[i].trim() !== '' &&
             (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || /^\s+\S/.test(lines[i]))) { buf.push(lines[i]); i++; }
      html.push(renderList(buf));
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() !== '' &&
           !/^(#{1,6}\s|\s*>|```|\s*([-*]|\d+\.)\s+)/.test(lines[i]) &&
           !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())) { para.push(lines[i]); i++; }
    html.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return { html: html.join('\n'), toc };
}

module.exports = { render, escapeHtml, slugify };
````

- [ ] **Step 4: Chạy test để chắc chắn PASS**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/md-mini.test.cjs`
Expected: PASS. Nếu ca file thật fail, in `r.html` để soi cấu trúc rồi chỉnh regex tương ứng.

- [ ] **Step 5: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/scripts/md-mini.cjs .claude/skills/xem-tai-lieu/scripts/md-mini.test.cjs
git commit -m "feat(xem-tai-lieu): renderer Markdown tối giản"
```

---

### Task 3: Lắp ráp dữ liệu (`data.cjs`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/scripts/data.cjs`
- Test: `.claude/skills/xem-tai-lieu/scripts/data.test.cjs`

**Interfaces:**
- Consumes: `require('./yaml-mini.cjs').parse`, `require('./md-mini.cjs').render`.
- Produces: `module.exports = { buildData, FILES }`. `buildData(sddDir: string) => { project, generatedAt, docs, errors }` với `docs[key] = { kind, label, phase, exists, ... }` (md: `html,toc,title`; prd/roadmap: `data`). File thiếu → `exists:false` (không lỗi). Lỗi parse → đẩy vào `errors[]`.

- [ ] **Step 1: Viết test thất bại**

Tạo `data.test.cjs`:

````js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { buildData } = require('./data.cjs');
const SDD = path.join(process.cwd(), 'docs', 'sdd');

test('buildData trả 5 docs + project từ PRD', () => {
  const d = buildData(SDD);
  assert.equal(Object.keys(d.docs).length, 5);
  assert.equal(d.project, 'Đặt Lịch Tiệm Tóc');
  assert.equal(d.docs.prd.kind, 'prd');
  assert.equal(d.docs.prd.exists, true);
  assert.ok(d.docs.prd.data.clusters.length === 8);
  assert.equal(d.docs['product-brief'].kind, 'md');
  assert.ok(d.docs['product-brief'].html.includes('<h1'));
  assert.equal(d.docs.roadmap.data.milestones.length >= 6, true);
});

test('file thiếu → exists:false, không ném', () => {
  const d = buildData(path.join(process.cwd(), 'không-tồn-tại'));
  assert.equal(d.docs.prd.exists, false);
  assert.deepEqual(d.errors, []);
});
````

- [ ] **Step 2: Chạy test để chắc chắn FAIL**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/data.test.cjs`
Expected: FAIL — `Cannot find module './data'`.

- [ ] **Step 3: Viết implementation**

Tạo `data.cjs`:

````js
'use strict';
const fs = require('fs');
const path = require('path');
const yaml = require('./yaml-mini.cjs');
const md = require('./md-mini.cjs');

const FILES = [
  { key: 'product-brief', file: 'product-brief.md', kind: 'md',      label: 'Product Brief', phase: 1 },
  { key: 'prd',           file: 'PRD.yaml',         kind: 'prd',     label: 'PRD',           phase: 1 },
  { key: 'constitution',  file: 'constitution.md',  kind: 'md',      label: 'Constitution',  phase: 2 },
  { key: 'agents',        file: 'AGENTS.md',        kind: 'md',      label: 'AGENTS',        phase: 2 },
  { key: 'roadmap',       file: 'ROADMAP.yaml',     kind: 'roadmap', label: 'Roadmap',       phase: 2 },
];

function buildData(sddDir) {
  const docs = {};
  const errors = [];
  let project = 'Tài liệu SDD';
  for (const spec of FILES) {
    const entry = { kind: spec.kind, label: spec.label, phase: spec.phase, exists: false };
    let raw;
    try {
      raw = fs.readFileSync(path.join(sddDir, spec.file), 'utf8');
    } catch (e) {
      docs[spec.key] = entry; // ENOENT → exists:false
      continue;
    }
    try {
      entry.exists = true;
      if (spec.kind === 'md') {
        const r = md.render(raw);
        entry.html = r.html;
        entry.toc = r.toc;
        const h1 = r.toc.find(t => t.level === 1);
        entry.title = h1 ? h1.text : spec.label;
      } else {
        const data = yaml.parse(raw);
        entry.data = data;
        if (data && data.project) project = data.project;
      }
    } catch (e) {
      errors.push({ file: spec.file, message: String((e && e.message) || e) });
    }
    docs[spec.key] = entry;
  }
  return { project, generatedAt: Date.now(), docs, errors };
}

module.exports = { buildData, FILES };
````

- [ ] **Step 4: Chạy test để chắc chắn PASS**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/data.test.cjs`
Expected: PASS.

- [ ] **Step 5: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/scripts/data.cjs .claude/skills/xem-tai-lieu/scripts/data.test.cjs
git commit -m "feat(xem-tai-lieu): lắp ráp /data.json từ docs/sdd"
```

---

### Task 4: HTTP server + SSE + watch (`server.cjs`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/scripts/server.cjs`
- Test: `.claude/skills/xem-tai-lieu/scripts/server.test.cjs`

**Interfaces:**
- Consumes: `require('./data.cjs').buildData`; phục vụ tĩnh từ `../assets`.
- Produces: `module.exports = { createServer }` — `createServer(sddDir) => http.Server`. Route: `GET /` → `assets/frame.html`; `GET /data.json` → JSON; `GET /events` → SSE; còn lại → file tĩnh trong `assets/`. `fs.watch(sddDir)` debounce 150ms → đẩy `event: changed`. Chạy trực tiếp (`node server.cjs <sddDir> <port>`) in JSON `{type:'server-started', url, port, pid}`.

- [ ] **Step 1: Viết test thất bại**

Tạo `server.test.cjs`:

````js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const path = require('path');
const { createServer } = require('./server.cjs');
const SDD = path.join(process.cwd(), 'docs', 'sdd');

function get(port, p) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: p }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'], body: d }));
    }).on('error', reject);
  });
}

test('GET /data.json trả 5 docs + project đúng', async () => {
  const server = createServer(SDD);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  try {
    const res = await get(port, '/data.json');
    assert.equal(res.status, 200);
    const data = JSON.parse(res.body);
    assert.equal(Object.keys(data.docs).length, 5);
    assert.equal(data.project, 'Đặt Lịch Tiệm Tóc');
  } finally { server.close(); }
});

test('GET / trả frame.html (sau khi Task 5 tạo asset)', async () => {
  const server = createServer(SDD);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  try {
    const res = await get(port, '/');
    assert.equal(res.status, 200);
    assert.match(res.type, /text\/html/);
  } finally { server.close(); }
});
````

> Lưu ý: test 'GET /' cần `assets/frame.html` (Task 5). Khi chạy Task 4 độc lập, test này có thể FAIL ở chỗ đọc file — chấp nhận, sẽ xanh sau Task 5. Test '/data.json' phải xanh ngay.

- [ ] **Step 2: Chạy test để chắc chắn FAIL**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/server.test.cjs`
Expected: FAIL — `Cannot find module './server'`.

- [ ] **Step 3: Viết implementation**

Tạo `server.cjs`:

````js
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildData } = require('./data.cjs');

const ASSETS = path.join(__dirname, '..', 'assets');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function sendFile(res, fp) {
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
    res.end(buf);
  });
}

function createServer(sddDir) {
  const clients = new Set();

  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (url === '/') return sendFile(res, path.join(ASSETS, 'frame.html'));
    if (url === '/data.json') {
      const body = JSON.stringify(buildData(sddDir));
      res.writeHead(200, { 'Content-Type': MIME['.json'] });
      return res.end(body);
    }
    if (url === '/events') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
      res.write(': ok\n\n');
      clients.add(res);
      req.on('close', () => clients.delete(res));
      return;
    }
    const safe = path.normalize(url).replace(/^([/\\]|\.\.[/\\])+/, '');
    const fp = path.join(ASSETS, safe);
    if (fp.startsWith(ASSETS) && fs.existsSync(fp) && fs.statSync(fp).isFile()) return sendFile(res, fp);
    res.writeHead(404); res.end('Not found');
  });

  let timer = null;
  try {
    fs.watch(sddDir, { persistent: false }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        for (const res of clients) { try { res.write('event: changed\ndata: {}\n\n'); } catch (e) {} }
      }, 150);
    });
  } catch (e) { /* thư mục có thể chưa tồn tại */ }

  return server;
}

if (require.main === module) {
  const sddDir = process.argv[2] || path.join(process.cwd(), 'docs', 'sdd');
  const port = parseInt(process.argv[3] || process.env.PORT || '0', 10);
  const server = createServer(sddDir);
  server.listen(port, '127.0.0.1', () => {
    const addr = server.address();
    process.stdout.write(JSON.stringify({ type: 'server-started', url: `http://localhost:${addr.port}/`, port: addr.port, pid: process.pid, sddDir }) + '\n');
  });
}

module.exports = { createServer };
````

- [ ] **Step 4: Chạy test để chắc chắn PASS (test /data.json)**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/server.test.cjs`
Expected: test `/data.json` PASS. Test `/` có thể fail tới khi Task 5 xong (frame.html chưa có) — ghi nhận, không sửa server.

- [ ] **Step 5: Kiểm tra thủ công SSE + chạy trực tiếp**

Run: `node .claude/skills/xem-tai-lieu/scripts/server.cjs docs/sdd 0`
Expected: in một dòng JSON `{"type":"server-started","url":"http://localhost:PORT/",...}`. `Ctrl-C` để dừng.

- [ ] **Step 6: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/scripts/server.cjs .claude/skills/xem-tai-lieu/scripts/server.test.cjs
git commit -m "feat(xem-tai-lieu): HTTP server + SSE live-reload + watch"
```

---

### Task 5: Shell + theme (`frame.html`, `theme.css`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/assets/frame.html`
- Create: `.claude/skills/xem-tai-lieu/assets/theme.css`

**Interfaces:**
- Produces: shell HTML có `#project-name`, `#status`, `#sidebar`, `#content`; nạp `/theme.css` và `/app.js` (module). theme.css cung cấp class: `.topbar .brand .status`, `.layout .sidebar .content`, `.nav-group .nav-item.active.missing`, `.markdown` (typography), `.toc`, `.callout .filterbar .cards .fcard .badge .chip .label .panel`, `.timeline .mcard .pill`, `.flash`, `.empty .banner-error`.

- [ ] **Step 1: Tạo `frame.html`**

````html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tài liệu SDD</title>
  <link rel="stylesheet" href="/theme.css">
</head>
<body>
  <header class="topbar">
    <div class="brand" id="project-name">Tài liệu SDD</div>
    <div class="status" id="status">Đang kết nối…</div>
  </header>
  <div class="layout">
    <nav class="sidebar" id="sidebar"></nav>
    <main class="content" id="content"></main>
  </div>
  <script type="module" src="/app.js"></script>
</body>
</html>
````

- [ ] **Step 2: Tạo `theme.css`** (biến CSS sáng/tối mượn từ frame-template superpowers)

````css
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; }

:root {
  --bg-primary: #f5f5f7; --bg-secondary: #ffffff; --bg-tertiary: #e5e5e7;
  --border: #d1d1d6; --text-primary: #1d1d1f; --text-secondary: #86868b; --text-tertiary: #aeaeb2;
  --accent: #0071e3; --success: #34c759; --warning: #ff9f0a; --error: #ff3b30;
  --core: #0071e3; --polish: #8e8e93;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1d1d1f; --bg-secondary: #2d2d2f; --bg-tertiary: #3d3d3f;
    --border: #424245; --text-primary: #f5f5f7; --text-secondary: #98989d; --text-tertiary: #636366;
    --accent: #0a84ff; --core: #0a84ff; --polish: #8e8e93;
  }
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg-primary); color: var(--text-primary);
  display: flex; flex-direction: column; line-height: 1.5;
}

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-secondary); border-bottom: 1px solid var(--border);
  padding: 0.6rem 1.25rem; flex-shrink: 0;
}
.brand { font-weight: 600; font-size: 0.95rem; }
.status { font-size: 0.72rem; color: var(--text-secondary); }
.status.ok { color: var(--success); }
.status.err { color: var(--error); }

.layout { flex: 1; display: grid; grid-template-columns: 230px 1fr; min-height: 0; }
.sidebar {
  background: var(--bg-secondary); border-right: 1px solid var(--border);
  padding: 1rem 0.75rem; overflow-y: auto;
}
.content { overflow-y: auto; padding: 2rem 2.5rem; max-width: 980px; }
@media (max-width: 720px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { display: flex; flex-wrap: wrap; gap: 0.25rem; }
}

.nav-group { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--text-tertiary); margin: 1rem 0.5rem 0.35rem; }
.nav-group:first-child { margin-top: 0; }
.nav-item { display: block; padding: 0.4rem 0.6rem; border-radius: 7px; cursor: pointer;
  color: var(--text-primary); font-size: 0.88rem; text-decoration: none; }
.nav-item:hover { background: var(--bg-tertiary); }
.nav-item.active { background: var(--accent); color: #fff; }
.nav-item.missing { color: var(--text-tertiary); font-style: italic; }

h1 { font-size: 1.7rem; margin-bottom: 1rem; }
h2 { font-size: 1.25rem; margin: 1.5rem 0 0.6rem; }
h3 { font-size: 1rem; margin-bottom: 0.3rem; }
.label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); }

/* markdown */
.markdown :is(h1,h2,h3,h4) { margin-top: 1.4rem; }
.markdown p { margin: 0.6rem 0; }
.markdown ul, .markdown ol { margin: 0.5rem 0 0.5rem 1.5rem; }
.markdown li { margin: 0.2rem 0; }
.markdown code { background: var(--bg-tertiary); padding: 0.1rem 0.35rem; border-radius: 5px; font-size: 0.88em; }
.markdown pre { background: var(--bg-tertiary); padding: 1rem; border-radius: 10px; overflow-x: auto; margin: 0.8rem 0; }
.markdown pre code { background: none; padding: 0; }
.markdown blockquote { border-left: 3px solid var(--accent); padding: 0.3rem 0.9rem; margin: 0.8rem 0;
  color: var(--text-secondary); background: var(--bg-secondary); border-radius: 0 8px 8px 0; }
.markdown table { border-collapse: collapse; width: 100%; margin: 0.8rem 0; font-size: 0.9rem; }
.markdown th, .markdown td { border: 1px solid var(--border); padding: 0.5rem 0.7rem; text-align: left; vertical-align: top; }
.markdown th { background: var(--bg-tertiary); }
.markdown a { color: var(--accent); }

.toc { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px;
  padding: 0.8rem 1rem; margin-bottom: 1.5rem; }
.toc a { display: block; color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; padding: 0.12rem 0; }
.toc a:hover { color: var(--accent); }
.toc .toc-l2 { padding-left: 0.8rem; }
.toc .toc-l3 { padding-left: 1.6rem; }

.callout { background: var(--bg-secondary); border: 1px solid var(--border); border-left: 3px solid var(--accent);
  border-radius: 0 10px 10px 0; padding: 0.9rem 1.1rem; margin-bottom: 1.3rem; color: var(--text-secondary); }

.filterbar { display: flex; gap: 0.6rem; margin-bottom: 1.2rem; flex-wrap: wrap; }
.filterbar select, .filterbar input { background: var(--bg-secondary); color: var(--text-primary);
  border: 1px solid var(--border); border-radius: 8px; padding: 0.45rem 0.7rem; font-size: 0.88rem; }
.filterbar input { flex: 1; min-width: 180px; }

.cluster { margin-bottom: 1.5rem; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.9rem; }
.fcard { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; }
.fcard-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
.fid { font-family: ui-monospace, monospace; font-size: 0.78rem; color: var(--text-secondary); }
.fdesc { color: var(--text-secondary); font-size: 0.88rem; margin: 0.3rem 0; }
.fdone { font-size: 0.82rem; margin-top: 0.4rem; }
.badge { font-size: 0.66rem; padding: 0.12rem 0.5rem; border-radius: 20px; color: #fff; }
.badge-C { background: var(--core); }
.badge-P { background: var(--polish); }

.chips { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.55rem; }
.chip { font-family: ui-monospace, monospace; font-size: 0.72rem; background: var(--bg-tertiary);
  color: var(--text-primary); padding: 0.15rem 0.5rem; border-radius: 6px; cursor: pointer; text-decoration: none; }
.chip:hover { background: var(--accent); color: #fff; }

.panel { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px;
  padding: 1rem 1.2rem; margin-top: 1.2rem; }
.panel ul.plain { margin-left: 1.2rem; font-size: 0.9rem; color: var(--text-secondary); }

.timeline { display: flex; flex-direction: column; gap: 1rem; border-left: 2px solid var(--border); padding-left: 1.2rem; }
.mcard { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.2rem; position: relative; }
.mcard::before { content: ''; position: absolute; left: -1.65rem; top: 1.2rem; width: 11px; height: 11px;
  background: var(--accent); border-radius: 50%; border: 2px solid var(--bg-primary); }
.mcard-head { display: flex; align-items: baseline; gap: 0.6rem; }
.mid { font-family: ui-monospace, monospace; font-weight: 700; color: var(--accent); }
.mname { font-weight: 600; }
.mgoal { color: var(--text-secondary); margin: 0.4rem 0; font-size: 0.9rem; }
.mdep, .mdone, .mrisk { font-size: 0.82rem; margin-top: 0.35rem; }
.pill { display: inline-block; margin-top: 0.5rem; font-size: 0.72rem; background: var(--bg-tertiary);
  padding: 0.15rem 0.6rem; border-radius: 20px; color: var(--text-secondary); }

.empty { color: var(--text-secondary); padding: 2rem; text-align: center; }
.banner-error { background: var(--error); color: #fff; padding: 0.6rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; }

.flash { animation: flash 1.4s ease; }
@keyframes flash { 0%,100% { box-shadow: none; } 30% { box-shadow: 0 0 0 3px var(--accent); } }
````

- [ ] **Step 3: Xác minh server phục vụ shell**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/server.test.cjs`
Expected: cả 2 test PASS (giờ `GET /` trả `text/html`).

- [ ] **Step 4: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/assets/frame.html .claude/skills/xem-tai-lieu/assets/theme.css
git commit -m "feat(xem-tai-lieu): shell HTML + theme (light/dark, layout, components)"
```

---

### Task 6: View-model thuần (`viewmodel.mjs`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/assets/viewmodel.mjs`
- Test: `.claude/skills/xem-tai-lieu/assets/viewmodel.test.mjs`

**Interfaces:**
- Produces (ESM, dùng được cả Node test lẫn trình duyệt):
  - `groupFeaturesByCluster(prd) => [{code, name, features}]`
  - `filterFeatures(features, {layer, q}) => features[]`
  - `buildFeatureIndex(prd) => { [id]: {...feature, cluster} }`

- [ ] **Step 1: Viết test thất bại**

Tạo `viewmodel.test.mjs`:

````js
import { test } from 'node:test';
import assert from 'node:assert';
import { groupFeaturesByCluster, filterFeatures, buildFeatureIndex } from './viewmodel.mjs';

const prd = { clusters: [
  { code: 'DL', name: 'Đặt lịch', features: [
    { id: 'DL-01', name: 'Đặt online', desc: 'khách tự đặt', layer: 'C' },
    { id: 'DL-08', name: 'Chặn trùng giờ', desc: 'lõi giá trị', layer: 'C' },
    { id: 'DL-10', name: 'Khóa slot', desc: 'tạm', layer: 'P' },
  ] },
]};

test('groupFeaturesByCluster', () => {
  const g = groupFeaturesByCluster(prd);
  assert.equal(g.length, 1);
  assert.equal(g[0].features.length, 3);
});

test('filterFeatures theo layer', () => {
  assert.equal(filterFeatures(prd.clusters[0].features, { layer: 'P' }).length, 1);
  assert.equal(filterFeatures(prd.clusters[0].features, { layer: '' }).length, 3);
});

test('filterFeatures theo q (id/tên/mô tả)', () => {
  assert.equal(filterFeatures(prd.clusters[0].features, { q: 'trùng' }).length, 1);
  assert.equal(filterFeatures(prd.clusters[0].features, { q: 'DL-10' }).length, 1);
  assert.equal(filterFeatures(prd.clusters[0].features, { q: 'zzz' }).length, 0);
});

test('buildFeatureIndex gắn cluster', () => {
  const idx = buildFeatureIndex(prd);
  assert.equal(idx['DL-08'].cluster, 'DL');
  assert.equal(idx['DL-08'].name, 'Chặn trùng giờ');
});
````

- [ ] **Step 2: Chạy test để chắc chắn FAIL**

Run: `node --test .claude/skills/xem-tai-lieu/assets/viewmodel.test.mjs`
Expected: FAIL — không tìm thấy `./viewmodel.mjs`.

- [ ] **Step 3: Viết implementation**

Tạo `viewmodel.mjs`:

````js
export function groupFeaturesByCluster(prd) {
  return (prd.clusters || []).map(c => ({ code: c.code, name: c.name, features: c.features || [] }));
}

export function filterFeatures(features, { layer = '', q = '' } = {}) {
  const ql = q.toLowerCase();
  return (features || []).filter(f => {
    if (layer && f.layer !== layer) return false;
    if (ql) {
      const hay = `${f.id || ''} ${f.name || ''} ${f.desc || ''}`.toLowerCase();
      if (!hay.includes(ql)) return false;
    }
    return true;
  });
}

export function buildFeatureIndex(prd) {
  const idx = {};
  for (const c of (prd.clusters || [])) {
    for (const f of (c.features || [])) idx[f.id] = { ...f, cluster: c.code };
  }
  return idx;
}
````

- [ ] **Step 4: Chạy test để chắc chắn PASS**

Run: `node --test .claude/skills/xem-tai-lieu/assets/viewmodel.test.mjs`
Expected: PASS.

- [ ] **Step 5: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/assets/viewmodel.mjs .claude/skills/xem-tai-lieu/assets/viewmodel.test.mjs
git commit -m "feat(xem-tai-lieu): view-model thuần (lọc/nhóm/index feature)"
```

---

### Task 7: Render DOM + cross-link + SSE (`app.js`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/assets/app.js`

**Interfaces:**
- Consumes: `import { groupFeaturesByCluster, filterFeatures } from '/viewmodel.mjs'`; `GET /data.json`; SSE `/events`; các id DOM trong `frame.html`.
- Produces: render sidebar + nội dung theo `kind` (md/prd/roadmap), thanh lọc PRD, cross-link feature id (PRD↔Roadmap), live-reload giữ scroll/filter.

- [ ] **Step 1: Viết `app.js`**

````js
import { groupFeaturesByCluster, filterFeatures } from '/viewmodel.mjs';

let DATA = null;
let current = 'product-brief';
const filters = { layer: '', q: '' };

const $ = (sel) => document.querySelector(sel);
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else if (v != null) n.setAttribute(k, v);
  }
  for (const kid of kids) {
    if (kid == null) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return n;
}

async function load() {
  const res = await fetch('/data.json');
  DATA = await res.json();
  $('#project-name').textContent = DATA.project || 'Tài liệu SDD';
  document.title = DATA.project || 'Tài liệu SDD';
  if (!DATA.docs[current]) current = Object.keys(DATA.docs)[0];
  renderSidebar();
  renderContent();
}

function renderSidebar() {
  const nav = $('#sidebar');
  nav.innerHTML = '';
  const titles = { 1: 'Pha 1 — Sản phẩm', 2: 'Pha 2 — Nền tảng' };
  for (const phase of [1, 2]) {
    nav.append(el('div', { class: 'nav-group' }, titles[phase]));
    for (const [key, doc] of Object.entries(DATA.docs)) {
      if (doc.phase !== phase) continue;
      const cls = 'nav-item' + (key === current ? ' active' : '') + (doc.exists ? '' : ' missing');
      nav.append(el('a', { class: cls, onclick: () => { current = key; renderSidebar(); renderContent(); } },
        doc.label + (doc.exists ? '' : ' · chưa có')));
    }
  }
}

function renderContent() {
  const main = $('#content');
  main.innerHTML = '';
  if (DATA.errors && DATA.errors.length) {
    for (const e of DATA.errors) main.append(el('div', { class: 'banner-error' }, `Lỗi đọc ${e.file}: ${e.message}`));
  }
  const doc = DATA.docs[current];
  if (!doc || !doc.exists) {
    main.append(el('div', { class: 'empty' }, 'Tài liệu chưa có. Chạy skill pha tương ứng để sinh ra.'));
    return;
  }
  if (doc.kind === 'md') renderMd(main, doc);
  else if (doc.kind === 'prd') renderPrd(main, doc.data || {});
  else if (doc.kind === 'roadmap') renderRoadmap(main, doc.data || {});
}

function renderMd(main, doc) {
  if (doc.toc && doc.toc.length > 1) {
    const toc = el('nav', { class: 'toc' });
    for (const t of doc.toc) toc.append(el('a', { class: `toc-l${t.level}`, href: `#${t.id}` }, t.text));
    main.append(toc);
  }
  main.append(el('article', { class: 'markdown', html: doc.html || '' }));
}

function renderPrd(main, prd) {
  main.append(el('h1', {}, prd.project || 'PRD'));
  if (prd.problem) main.append(el('div', { class: 'callout' }, prd.problem));

  const list = el('div', { class: 'clusters' });
  const bar = el('div', { class: 'filterbar' });
  const layerSel = el('select', { onchange: e => { filters.layer = e.target.value; renderClusters(list, prd); } },
    el('option', { value: '' }, 'Mọi lớp'),
    el('option', { value: 'C' }, 'C — Lõi'),
    el('option', { value: 'P' }, 'P — Hoàn thiện'));
  layerSel.value = filters.layer;
  const search = el('input', { type: 'search', placeholder: 'Tìm id / tên / mô tả…', value: filters.q,
    oninput: e => { filters.q = e.target.value; renderClusters(list, prd); } });
  bar.append(layerSel, search);
  main.append(bar, list);
  renderClusters(list, prd);

  appendPanel(main, 'Dữ liệu chính', ul((prd.key_data || []).map(d => `${d.name}: ${(d.stores || []).join(', ')}`)));
  appendPanel(main, 'Ngoài phạm vi', ul(prd.out_of_scope || []));
  if (prd.nfr) appendPanel(main, 'Yêu cầu phi chức năng', ul(Object.entries(prd.nfr).map(([k, v]) => `${k}: ${v}`)));
  appendPanel(main, 'Câu hỏi mở', ul(prd.open_questions || []));
}

function renderClusters(list, prd) {
  list.innerHTML = '';
  for (const c of groupFeaturesByCluster(prd)) {
    const feats = filterFeatures(c.features, filters);
    if (!feats.length) continue;
    const sec = el('section', { class: 'cluster' }, el('h2', {}, `${c.code} — ${c.name}`));
    const grid = el('div', { class: 'cards' });
    for (const f of feats) grid.append(featureCard(f));
    sec.append(grid);
    list.append(sec);
  }
}

function featureCard(f) {
  const card = el('div', { class: 'fcard', id: `f-${f.id}` },
    el('div', { class: 'fcard-head' },
      el('span', { class: 'fid' }, f.id),
      el('span', { class: `badge badge-${f.layer}` }, f.layer === 'C' ? 'Lõi' : 'Hoàn thiện')),
    el('h3', {}, f.name || ''));
  if (f.desc) card.append(el('p', { class: 'fdesc' }, f.desc));
  if (f.done_when) card.append(el('p', { class: 'fdone' }, el('span', { class: 'label' }, 'Xong khi: '), f.done_when));
  if (f.links && f.links.length) {
    const chips = el('div', { class: 'chips' });
    for (const id of f.links) chips.append(el('a', { class: 'chip', onclick: () => jumpToFeature(id) }, id));
    card.append(chips);
  }
  return card;
}

function renderRoadmap(main, rm) {
  main.append(el('h1', {}, (rm.project || 'Roadmap') + ' — Lộ trình'));
  const tl = el('div', { class: 'timeline' });
  for (const m of (rm.milestones || [])) {
    const card = el('div', { class: 'mcard' },
      el('div', { class: 'mcard-head' }, el('span', { class: 'mid' }, m.id), el('span', { class: 'mname' }, m.name || '')));
    if (m.goal) card.append(el('p', { class: 'mgoal' }, m.goal));
    if (m.depends_on && m.depends_on.length)
      card.append(el('div', { class: 'mdep' }, el('span', { class: 'label' }, 'Phụ thuộc: '), m.depends_on.join(', ')));
    if (m.feature_ids && m.feature_ids.length) {
      const chips = el('div', { class: 'chips' });
      for (const id of m.feature_ids) chips.append(el('a', { class: 'chip', onclick: () => jumpToFeature(id) }, id));
      card.append(chips);
    }
    if (m.done_when) card.append(el('p', { class: 'mdone' }, el('span', { class: 'label' }, 'Xong khi: '), m.done_when));
    if (m.estimate) card.append(el('span', { class: 'pill' }, 'Ước lượng: ' + m.estimate));
    if (m.risk) card.append(el('p', { class: 'mrisk' }, el('span', { class: 'label' }, 'Rủi ro: '), m.risk));
    tl.append(card);
  }
  main.append(tl);
  if (rm.coverage) appendPanel(main, 'Độ phủ', el('p', {}, rm.coverage));
  appendPanel(main, 'Hoãn lại', ul(rm.deferred || []));
  appendPanel(main, 'Backlog', ul(rm.backlog || []));
}

function jumpToFeature(id) {
  if (current !== 'prd') { current = 'prd'; renderSidebar(); renderContent(); }
  requestAnimationFrame(() => {
    const t = document.getElementById('f-' + id);
    if (t) { t.scrollIntoView({ behavior: 'smooth', block: 'center' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1400); }
  });
}

function ul(items) {
  const node = el('ul', { class: 'plain' });
  for (const it of items) node.append(el('li', {}, it));
  return node;
}
function appendPanel(main, title, body) {
  if (body.tagName === 'UL' && !body.children.length) return;
  main.append(el('section', { class: 'panel' }, el('h2', {}, title), body));
}

function connectSSE() {
  const status = $('#status');
  const es = new EventSource('/events');
  es.addEventListener('open', () => { status.textContent = '● live'; status.className = 'status ok'; });
  es.addEventListener('changed', async () => {
    const scroll = $('#content').scrollTop;
    await load();
    $('#content').scrollTop = scroll;
  });
  es.onerror = () => { status.textContent = 'mất kết nối — thử lại…'; status.className = 'status err'; };
}

load();
connectSSE();
````

- [ ] **Step 2: Kiểm tra thủ công đầu-cuối**

Run: `node .claude/skills/xem-tai-lieu/scripts/server.cjs docs/sdd 0`
Mở URL in ra trong trình duyệt. Kiểm:
- Sidebar có Pha 1 (Product Brief, PRD) + Pha 2 (Constitution, AGENTS, Roadmap).
- PRD: thẻ feature theo cụm, lọc lớp C/P + tìm kiếm hoạt động; bấm chip `DL-08` cuộn tới thẻ và nháy sáng.
- Roadmap: timeline M0→M5; bấm chip feature nhảy sang PRD.
- Constitution: bảng + checkbox hiển thị; AGENTS: code block hiển thị.
- Status hiện "● live".

- [ ] **Step 3: Kiểm tra live-reload**

Để server chạy. Sửa nhẹ một dòng trong `docs/sdd/PRD.yaml` (vd thêm khoảng trắng) và lưu → trình duyệt tự cập nhật trong ~0.2s, giữ nguyên tab đang xem. Hoàn tác thay đổi. `Ctrl-C` dừng server.

- [ ] **Step 4: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/assets/app.js
git commit -m "feat(xem-tai-lieu): render dashboard + cross-link + SSE live-reload"
```

---

### Task 8: Script khởi động/dừng (`start-server.sh`, `stop-server.sh`)

**Files:**
- Create: `.claude/skills/xem-tai-lieu/scripts/start-server.sh`
- Create: `.claude/skills/xem-tai-lieu/scripts/stop-server.sh`

**Interfaces:**
- Produces: `start-server.sh [--project-dir=PATH] [--open]` — chạy `server.cjs` nền, lưu `.xem-tai-lieu/{server.pid,server-url,server.log}`, in JSON `{type, url, pid}`; idempotent (đang chạy thì tái dùng). `stop-server.sh [PROJECT_DIR]` — kill theo pid.

- [ ] **Step 1: Viết `start-server.sh`**

````bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$PWD"
OPEN=0
for arg in "$@"; do
  case "$arg" in
    --open) OPEN=1 ;;
    --project-dir=*) PROJECT_DIR="${arg#*=}" ;;
  esac
done

SDD_DIR="$PROJECT_DIR/docs/sdd"
RUN_DIR="$PROJECT_DIR/.xem-tai-lieu"
mkdir -p "$RUN_DIR"
PIDFILE="$RUN_DIR/server.pid"
URLFILE="$RUN_DIR/server-url"
LOGFILE="$RUN_DIR/server.log"

open_url() {
  if command -v open >/dev/null 2>&1; then open "$1" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$1" >/dev/null 2>&1 || true
  fi
}

# Đã chạy → tái dùng
if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  URL="$(cat "$URLFILE" 2>/dev/null || true)"
  echo "{\"type\":\"already-running\",\"url\":\"$URL\",\"pid\":$(cat "$PIDFILE")}"
  [ "$OPEN" = "1" ] && [ -n "$URL" ] && open_url "$URL"
  exit 0
fi

: > "$LOGFILE"
node "$SCRIPT_DIR/server.cjs" "$SDD_DIR" 0 >"$LOGFILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PIDFILE"

URL=""
for _ in $(seq 1 50); do
  if grep -q '"url"' "$LOGFILE" 2>/dev/null; then
    URL=$(node -e "const fs=require('fs');const l=fs.readFileSync('$LOGFILE','utf8').split('\n').find(x=>x.includes('\"url\"'));process.stdout.write(l?JSON.parse(l).url:'')")
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then break; fi
  sleep 0.1
done

if [ -z "$URL" ]; then
  echo "{\"type\":\"error\",\"message\":\"server không khởi động được; xem $LOGFILE\"}"
  exit 1
fi

echo "$URL" > "$URLFILE"
echo "{\"type\":\"server-started\",\"url\":\"$URL\",\"pid\":$SERVER_PID}"
[ "$OPEN" = "1" ] && open_url "$URL"
exit 0
````

- [ ] **Step 2: Viết `stop-server.sh`**

````bash
#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="${1:-$PWD}"
RUN_DIR="$PROJECT_DIR/.xem-tai-lieu"
PIDFILE="$RUN_DIR/server.pid"
if [ -f "$PIDFILE" ]; then
  PID="$(cat "$PIDFILE")"
  kill "$PID" 2>/dev/null || true
  rm -f "$PIDFILE" "$RUN_DIR/server-url"
  echo "{\"type\":\"stopped\",\"pid\":$PID}"
else
  echo "{\"type\":\"not-running\"}"
fi
````

- [ ] **Step 3: Cấp quyền chạy**

Run: `chmod +x .claude/skills/xem-tai-lieu/scripts/start-server.sh .claude/skills/xem-tai-lieu/scripts/stop-server.sh`
Expected: không lỗi.

- [ ] **Step 4: Kiểm tra thủ công**

Run (từ gốc repo): `.claude/skills/xem-tai-lieu/scripts/start-server.sh`
Expected: in `{"type":"server-started","url":"http://localhost:PORT/","pid":N}`.

Chạy lại lần nữa → in `{"type":"already-running",...}` cùng URL.

Run: `.claude/skills/xem-tai-lieu/scripts/stop-server.sh`
Expected: `{"type":"stopped","pid":N}`.

- [ ] **Step 5: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/scripts/start-server.sh .claude/skills/xem-tai-lieu/scripts/stop-server.sh
git commit -m "feat(xem-tai-lieu): script khởi động/dừng server nền"
```

---

### Task 9: SKILL.md + gitignore + nghiệm thu đầu-cuối

**Files:**
- Create: `.claude/skills/xem-tai-lieu/SKILL.md`
- Modify/Create: `.gitignore` (gốc repo) — thêm `.xem-tai-lieu/`

**Interfaces:**
- Consumes: tất cả script ở Task 1–8.
- Produces: skill `/xem-tai-lieu` gọi được; agent biết cách khởi động + chia sẻ URL.

- [ ] **Step 1: Viết `SKILL.md`**

````markdown
---
name: xem-tai-lieu
description: Mở trình xem web cục bộ cho bộ tài liệu SDD ở docs/sdd/ (product-brief, PRD, constitution, AGENTS, ROADMAP). Render dashboard có cấu trúc, tự cập nhật khi file đổi (live-reload). Dùng khi user nói "xem tài liệu", "mở tài liệu", "xem PRD/roadmap trên web", "view tài liệu", "xem dự án trên web", hoặc sau khi chạy skill pha 1/pha 2 muốn xem kết quả.
---

# Skill: xem-tai-lieu

Mở server cục bộ render `docs/sdd/` thành dashboard web. Server tự parse file và
live-reload khi tài liệu đổi — chạy skill pha 1/2 ghi đè file là trình duyệt tự cập nhật.

## Các bước

1. Khởi động server (chạy nền) từ gốc repo:

   ```bash
   .claude/skills/xem-tai-lieu/scripts/start-server.sh --open
   ```

   Lệnh in JSON `{"type":"server-started","url":"http://localhost:PORT/","pid":N}`
   (hoặc `already-running` nếu đã mở). Cờ `--open` tự mở trình duyệt mặc định.

2. Chia sẻ URL cho user (kèm cả khi `already-running`). Nói ngắn gọn nội dung:
   sidebar Pha 1/Pha 2, PRD có lọc theo cụm & lớp C/P + tìm kiếm, Roadmap timeline,
   bấm mã feature để nhảy chéo PRD ↔ Roadmap.

3. Tài liệu cập nhật: khi user (hoặc skill pha 1/2) sửa file trong `docs/sdd/`,
   trình duyệt tự refresh — KHÔNG cần khởi động lại.

4. Dừng khi xong (tùy chọn):

   ```bash
   .claude/skills/xem-tai-lieu/scripts/stop-server.sh
   ```

## Ghi chú
- Zero-dependency: chỉ cần Node, không `pnpm install`.
- Output runtime ở `.xem-tai-lieu/` (đã gitignore).
- Nếu server chết, chạy lại `start-server.sh` — trình duyệt đang mở sẽ tự kết nối lại.
- Chạy test bộ công cụ: `node --test .claude/skills/xem-tai-lieu/scripts/ .claude/skills/xem-tai-lieu/assets/`.
````

- [ ] **Step 2: Cập nhật `.gitignore`**

Thêm dòng `.xem-tai-lieu/` vào `.gitignore` ở gốc repo (tạo file nếu chưa có). Nếu đã có dòng này thì bỏ qua.

- [ ] **Step 3: Nghiệm thu toàn bộ test**

Run: `node --test .claude/skills/xem-tai-lieu/scripts/*.test.cjs .claude/skills/xem-tai-lieu/assets/*.test.mjs`
(truyền thẳng các file test — dạng truyền thư mục `--test <dir>` KHÔNG chạy đúng trên Node 22)
Expected: tất cả test PASS (yaml-mini, md-mini, data, server, viewmodel).

- [ ] **Step 4: Nghiệm thu đầu-cuối qua skill**

Gọi `/xem-tai-lieu` (hoặc chạy `start-server.sh --open`). Xác nhận: trình duyệt mở, 5 tài liệu render đúng, lọc + cross-link + live-reload hoạt động như Task 7.

- [ ] **Step 5: Checkpoint (commit nếu repo là git)**

```bash
git add .claude/skills/xem-tai-lieu/SKILL.md .gitignore
git commit -m "feat(xem-tai-lieu): SKILL.md + gitignore + nghiệm thu"
```

---

## Self-Review (người viết plan tự rà)

**1. Spec coverage** (đối chiếu `docs/superpowers/specs/2026-06-27-xem-tai-lieu-viewer-design.md`):
- Dashboard có cấu trúc (QĐ#1) → Task 7 (renderPrd/renderRoadmap/renderMd). ✓
- Node zero-dep (QĐ#2) → Global Constraints + parser tự viết (Task 1,2). ✓
- Skill + live-reload (QĐ#3) → Task 8 (skill/script) + Task 4 (watch) + Task 7 (SSE client). ✓
- Visual superpowers (QĐ#4) → Task 5 theme.css (biến CSS sáng/tối). ✓
- SSE thay WebSocket (QĐ#5) → Task 4 `/events` + Task 7 EventSource. ✓
- Parser mini (QĐ#6) → Task 1, 2. ✓
- `/data.json` schema (spec §4) → Task 3 buildData. ✓
- View theo loại + cross-link (spec §5) → Task 7. ✓
- Ca biên: file thiếu → Task 3 (exists:false) + Task 7 (empty); lỗi parse → errors[] + banner; debounce → Task 4; idempotent start → Task 8; reconnect → Task 7 onerror. ✓
- Kiểm thử (spec §9) → test ở Task 1–4, 6 + nghiệm thu thủ công Task 7,8,9. ✓

**2. Placeholder scan:** không có TBD/TODO; mọi step có code/lệnh thật. ✓

**3. Type consistency:**
- `parse` (Task 1) ← dùng ở `data.cjs` (Task 3). ✓
- `render` trả `{html, toc}` (Task 2) ← `data.cjs` đọc `r.html`, `r.toc`. ✓
- `buildData` trả `{project, generatedAt, docs, errors}` (Task 3) ← `server.cjs` JSON.stringify (Task 4) ← `app.js` đọc `DATA.project/docs/errors` (Task 7). ✓
- `docs[key]` field `{kind,label,phase,exists,html,toc,data}` nhất quán giữa Task 3 và Task 7. ✓
- `groupFeaturesByCluster/filterFeatures/buildFeatureIndex` (Task 6) ← import đúng tên trong `app.js` (Task 7). ✓
- `createServer(sddDir)` (Task 4) ← gọi trong `server.test.cjs` (Task 4) + `server.cjs` runner. ✓

Không phát hiện sai lệch.
