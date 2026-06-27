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
