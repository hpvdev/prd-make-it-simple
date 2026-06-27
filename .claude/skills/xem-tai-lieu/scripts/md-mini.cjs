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
  t = t.replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\w)/g, '$1<em>$2</em>');
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
