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
