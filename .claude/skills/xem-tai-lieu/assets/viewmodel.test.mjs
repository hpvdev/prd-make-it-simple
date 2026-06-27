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
