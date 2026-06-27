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
