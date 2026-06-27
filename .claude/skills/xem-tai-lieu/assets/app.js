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
  filters.layer = '';
  filters.q = '';
  current = 'prd';
  renderSidebar();
  renderContent();
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
