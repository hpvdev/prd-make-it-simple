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

test('italic không nuốt dấu * đơn lẻ (2*3)', () => {
  const r = render('Giá 2*3 đồng và *nghiêng* xong.\n');
  assert.match(r.html, /2\*3/);
  assert.match(r.html, /<em>nghiêng<\/em>/);
  assert.doesNotMatch(r.html, /<em>3 đồng/);
});

test('italic theo sau bởi dấu câu', () => {
  const r = render('hơn *Zalo\/sổ tay*, không phải\n');
  assert.match(r.html, /<em>Zalo\/sổ tay<\/em>/);
});
