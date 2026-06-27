import { groupFeaturesByCluster, filterFeatures } from '/viewmodel.mjs';

let DATA = null;
let current = 'overview';
const filters = { layer: '', q: '' };

const CLUSTER_COLORS = ['#58cc02', '#1cb0f6', '#ff9600', '#ce82ff', '#ff4b4b', '#14c5b8', '#e5a000', '#ff86d0'];
const CLUSTER_PHRASE = {
  DL: 'đặt lịch & chặn trùng giờ', KH: 'sổ khách, lịch sử, no-show', DV: 'dịch vụ, thời lượng, giá',
  TH: 'thợ, giờ làm, ngày nghỉ', NL: 'tự nhắc, giảm no-show', BC: 'doanh thu & công suất',
  TT: 'đăng nhập, hồ sơ, gói thuê bao', SYS: 'khung app, lỗi, hỗ trợ tiếp cận'
};
const clusterPhrase = (code, c) => CLUSTER_PHRASE[code] || `${(c.features || []).length} tính năng`;

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

/* ---------- Mermaid (nạp lười từ CDN, fallback nếu offline) ---------- */
let _merPromise = null;
function getMermaid() {
  if (_merPromise) return _merPromise;
  _merPromise = import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
    .then(m => m.default || m).catch(() => null);
  return _merPromise;
}
function mermaidVars() {
  const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const f = 'Nunito, system-ui, sans-serif';
  return dark
    ? { fontFamily: f, background: '#1f2c33', primaryColor: '#25343c', primaryTextColor: '#f1f7fb', primaryBorderColor: '#58cc02', lineColor: '#79df2f', secondaryColor: '#182329', tertiaryColor: '#182329' }
    : { fontFamily: f, background: '#ffffff', primaryColor: '#e8ffd6', primaryTextColor: '#3c3c3c', primaryBorderColor: '#58a700', lineColor: '#58a700', secondaryColor: '#e6f7ff', tertiaryColor: '#fff6da' };
}
let _diaSeq = 0;
async function drawDiagram(container, definition, fallback) {
  container.classList.add('diagram');
  container.innerHTML = '<div class="diagram-loading">Đang vẽ sơ đồ…</div>';
  const mer = await getMermaid();
  if (!mer) { container.innerHTML = ''; (fallback || noNet)(container); return; }
  try {
    mer.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'base', themeVariables: mermaidVars() });
    const { svg } = await mer.render('dia-' + (++_diaSeq), definition);
    container.innerHTML = svg;
  } catch (e) {
    container.innerHTML = '';
    (fallback || noNet)(container);
  }
}
const noNet = (c) => c.append(el('div', { class: 'diagram-fallback' }, '⚠ Cần internet để hiện sơ đồ (Mermaid). Nội dung danh sách bên dưới vẫn xem được.'));

const mmText = (s) => String(s == null ? '' : s).replace(/&/g, 'và').replace(/["\[\](){}<>;:#|`]/g, ' ').replace(/\s+/g, ' ').trim();
const nid = (s) => String(s || '').replace(/[^A-Za-z0-9_]/g, '_');
const trunc = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; };
const firstSentence = (s, max = 170) => {
  s = String(s || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  const i = s.indexOf('. ');
  let r = (i > 0 && i < max) ? s.slice(0, i + 1) : s;
  return r.length > max ? r.slice(0, max - 1).trim() + '…' : r;
};

/* ---------- bootstrap ---------- */
async function load() {
  const res = await fetch('/data.json');
  DATA = await res.json();
  $('#project-name').textContent = DATA.project || 'Tài liệu SDD';
  document.title = DATA.project || 'Tài liệu SDD';
  if (current !== 'overview' && !DATA.docs[current]) current = 'overview';
  renderSidebar();
  renderContent();
}

function renderSidebar() {
  const nav = $('#sidebar');
  nav.innerHTML = '';
  nav.append(el('a', {
    class: 'nav-item nav-overview' + (current === 'overview' ? ' active' : ''),
    onclick: () => { current = 'overview'; renderSidebar(); renderContent(); }
  }, '✦ Tổng quan'));
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
  if (current === 'overview') return renderOverview(main);
  const doc = DATA.docs[current];
  if (!doc || !doc.exists) {
    main.append(el('div', { class: 'empty' }, 'Tài liệu chưa có. Chạy skill pha tương ứng để sinh ra.'));
    return;
  }
  if (doc.kind === 'md') renderMd(main, doc);
  else if (doc.kind === 'prd') renderPrd(main, doc.data || {});
  else if (doc.kind === 'roadmap') renderRoadmap(main, doc.data || {});
}

/* ---------- Tổng quan (mindmap) ---------- */
function renderOverview(main) {
  const prd = DATA.docs.prd && DATA.docs.prd.exists ? DATA.docs.prd.data : null;
  const rm = DATA.docs.roadmap && DATA.docs.roadmap.exists ? DATA.docs.roadmap.data : null;
  main.append(el('h1', {}, DATA.project || 'Sản phẩm'));
  const tagline = prd ? firstSentence(prd.problem) : '';
  if (tagline) main.append(el('p', { class: 'tagline' }, tagline));

  if (!prd) { main.append(el('div', { class: 'empty' }, 'Chưa có PRD để vẽ sơ đồ — chạy skill Pha 1.')); return; }

  const feats = (prd.clusters || []).flatMap(c => c.features || []);
  const stats = [
    ['🧩', (prd.clusters || []).length, 'nhóm tính năng'],
    ['✅', feats.filter(f => f.layer === 'C').length, 'tính năng lõi'],
    ['✨', feats.filter(f => f.layer === 'P').length, 'tính năng hoàn thiện'],
  ];
  if (rm) stats.push(['🗺️', (rm.milestones || []).length, 'mốc lộ trình']);
  const vc = el('div', { class: 'value-cards' });
  for (const [ic, n, label] of stats)
    vc.append(el('div', { class: 'value-card' }, el('div', { class: 'vic' }, ic), el('div', { class: 'vnum' }, String(n)), el('div', { class: 'vd' }, label)));
  main.append(vc);

  main.append(el('h2', {}, 'Sản phẩm gồm những gì?'));
  const dia = el('div', { class: 'diagram' });
  main.append(dia);
  drawDiagram(dia, overviewMindmap(prd), null);

  main.append(el('h2', {}, 'Vào từng nhóm'));
  main.append(clusterGrid(prd));
}

function overviewMindmap(prd) {
  const lines = ['mindmap', `  root((${mmText(DATA.project || 'Sản phẩm')}))`];
  for (const c of (prd.clusters || [])) {
    lines.push(`    ${mmText(c.name)} · ${(c.features || []).length}`);
    lines.push(`      ${mmText(clusterPhrase(c.code, c))}`);
  }
  return lines.join('\n');
}

function clusterGrid(prd) {
  const grid = el('div', { class: 'cluster-grid' });
  (prd.clusters || []).forEach((c, i) => {
    const tile = el('div', { class: 'cluster-tile', onclick: () => goCluster(c.code) });
    tile.style.setProperty('--cl', CLUSTER_COLORS[i % CLUSTER_COLORS.length]);
    tile.append(
      el('div', { class: 'ct-name' }, `${c.code} · ${c.name}`),
      el('div', { class: 'ct-phrase' }, clusterPhrase(c.code, c)),
      el('div', { class: 'ct-count' }, `${(c.features || []).length} tính năng`));
    grid.append(tile);
  });
  return grid;
}

function goCluster(code) {
  filters.layer = ''; filters.q = '';
  current = 'prd'; renderSidebar(); renderContent();
  requestAnimationFrame(() => {
    const t = document.getElementById('cluster-' + code);
    if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ---------- Markdown ---------- */
function renderMd(main, doc) {
  if (doc.toc && doc.toc.length > 1) {
    const toc = el('nav', { class: 'toc' });
    for (const t of doc.toc) toc.append(el('a', { class: `toc-l${t.level}`, href: `#${t.id}` }, t.text));
    main.append(toc);
  }
  main.append(el('article', { class: 'markdown', html: doc.html || '' }));
}

/* ---------- PRD ---------- */
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
  groupFeaturesByCluster(prd).forEach((c, i) => {
    const feats = filterFeatures(c.features, filters);
    if (!feats.length) return;
    const sec = el('section', { class: 'cluster', id: 'cluster-' + c.code });
    sec.style.setProperty('--cl', CLUSTER_COLORS[i % CLUSTER_COLORS.length]);
    const dia = el('div', { class: 'diagram cluster-dia', style: 'display:none' });
    const btn = el('button', { class: 'mini-btn', onclick: () => toggleClusterDiagram(btn, dia, c) }, '◇ Sơ đồ');
    sec.append(el('div', { class: 'cluster-head' }, el('h2', {}, `${c.code} — ${c.name}`), btn), dia);
    const grid = el('div', { class: 'cards' });
    for (const f of feats) grid.append(featureCard(f));
    sec.append(grid);
    list.append(sec);
  });
}

async function toggleClusterDiagram(btn, dia, c) {
  if (dia.style.display !== 'none') { dia.style.display = 'none'; btn.textContent = '◇ Sơ đồ'; return; }
  dia.style.display = '';
  btn.textContent = '◇ Ẩn sơ đồ';
  if (!dia.dataset.drawn) { dia.dataset.drawn = '1'; await drawDiagram(dia, clusterMindmap(c), null); }
}

function clusterMindmap(c) {
  const lines = ['mindmap', `  root((${mmText(c.name)}))`];
  for (const f of (c.features || [])) lines.push(`    ${mmText(f.name)}`);
  return lines.join('\n');
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

/* ---------- Roadmap (flowchart + cards) ---------- */
function renderRoadmap(main, rm) {
  main.append(el('h1', {}, (rm.project || 'Roadmap') + ' — Lộ trình'));
  main.append(el('p', { class: 'tagline' }, 'Thứ tự xây dựng — mũi tên là quan hệ phụ thuộc giữa các mốc.'));
  const dia = el('div', { class: 'diagram' });
  main.append(dia);
  drawDiagram(dia, roadmapFlow(rm), null);

  const tl = el('div', { class: 'timeline' });
  for (const m of (rm.milestones || [])) {
    const card = el('div', { class: 'mcard', id: 'ms-' + m.id },
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

function roadmapFlow(rm) {
  const lines = ['flowchart TD'];
  for (const m of (rm.milestones || []))
    lines.push(`  ${nid(m.id)}("${mmText(m.id)} · ${mmText(trunc(m.name, 30))}")`);
  for (const m of (rm.milestones || []))
    for (const d of (m.depends_on || [])) lines.push(`  ${nid(d)} --> ${nid(m.id)}`);
  return lines.join('\n');
}

/* ---------- navigation / helpers ---------- */
function jumpToFeature(id) {
  filters.layer = ''; filters.q = '';
  current = 'prd'; renderSidebar(); renderContent();
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
