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
