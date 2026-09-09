(() => {
  const blocks = [
    ['aquarium-stage', '我的鱼缸', 'scene', '4196'],
    ['collection-overview', '我的物种册', 'overview', '4196'],
    ['encyclopedia-flow', '图鉴：场景→品系→详情', 'scene→selection→detail', '4197'],
    ['care-flow', '养护：热点→问题卡→指南', 'scene→selection→detail→task', '4197'],
    ['compatibility-board', '混养观察台：选择→结论', 'selection→result', '4197'],
  ];
  const key = 'aquaguide-freeze-review-v3';
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  const status = (id) => saved[id] || 'REVIEW_REQUIRED';
  const persist = () => localStorage.setItem(key, JSON.stringify(saved));
  window.AquaFreeze = { blocks, status, setStatus(id, value) { saved[id] = value; persist(); } };
  const render = () => document.querySelectorAll('[data-freeze-block]').forEach((el) => { const value = status(el.dataset.freezeBlock); el.dataset.status = value; el.textContent = value; });
  const exportReview = () => { const payload = { version: 'html-ui-freeze-v3', exportedAt: new Date().toISOString(), blocks: blocks.map(([id, page, routeState, reference]) => ({ id, page, routeState, reference, status: status(id) })) }; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); link.download = 'aquaguide-html-freeze-review.json'; link.click(); URL.revokeObjectURL(link.href); };
  document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('[data-freeze-row] select').forEach((select) => select.addEventListener('change', () => { AquaFreeze.setStatus(select.closest('[data-freeze-row]').dataset.freezeRow, select.value); render(); })); document.querySelectorAll('[data-export-review]').forEach((button) => button.addEventListener('click', exportReview)); render(); });
})();
