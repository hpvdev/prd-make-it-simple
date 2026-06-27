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
