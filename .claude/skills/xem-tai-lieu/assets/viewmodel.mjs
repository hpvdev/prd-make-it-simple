export function groupFeaturesByCluster(prd) {
  return (prd.clusters || []).map(c => ({ code: c.code, name: c.name, features: c.features || [] }));
}

export function filterFeatures(features, { layer = '', q = '' } = {}) {
  const ql = q.toLowerCase();
  return (features || []).filter(f => {
    if (layer && f.layer !== layer) return false;
    if (ql) {
      const hay = `${f.id || ''} ${f.name || ''} ${f.desc || ''}`.toLowerCase();
      if (!hay.includes(ql)) return false;
    }
    return true;
  });
}

export function buildFeatureIndex(prd) {
  const idx = {};
  for (const c of (prd.clusters || [])) {
    for (const f of (c.features || [])) idx[f.id] = { ...f, cluster: c.code };
  }
  return idx;
}
