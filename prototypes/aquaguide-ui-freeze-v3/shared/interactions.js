const reviewData = window.ReviewDemoData || {
  species: [
    { id: 'cardinal', base: '宝莲灯', name: '宝莲灯标准款', latin: 'Paracheirodon axelrodi', image: '../assets/cardinal-tetra.png', layer: '中层', tags: ['群游', '淡水'] },
    { id: 'cardinal-red', base: '宝莲灯', name: '宝莲灯红线', latin: 'Paracheirodon axelrodi var.', image: '../assets/cardinal-tetra.webp', layer: '中层', tags: ['群游', '小型'] },
    { id: 'neon', base: '霓虹灯', name: '霓虹灯标准款', latin: 'Paracheirodon innesi', image: '../assets/neon-tetra.png', layer: '中层', tags: ['群游', '小型'] },
    { id: 'oscar', base: '虎鱼', name: '虎鱼标准款', latin: 'Astronotus ocellatus', image: '../assets/oscar.png', layer: '底层', tags: ['大型', '领地'] },
  ],
  careTopics: {
    water: [{ id: 'water-cloudy', title: '水体变浑', summary: '先确认过滤与最近一次换水，再观察是否持续。', image: '../assets/water-care.webp', urgency: '观察' }, { id: 'water-temp', title: '温度波动', summary: '检查加热设备和昼夜温差，避免突然调整。', image: '../assets/acclimation.webp', urgency: '优先' }],
    livestock: [{ id: 'fish-surface', title: '频繁浮到水面', summary: '记录发生时间、呼吸状态和同缸生物反应。', image: '../assets/water-care.webp', urgency: '优先' }],
    filter: [{ id: 'filter-flow', title: '水流变弱', summary: '查看进水口、滤材和泵体，先不要一次性更换全部滤材。', image: '../assets/water-care.webp', urgency: '优先' }],
  },
};
const { species, careTopics } = reviewData;

const root = document.documentElement;
const state = { focus: null, surface: null, group: null, selected: null };

function q(selector, scope = document) { return scope.querySelector(selector); }
function qa(selector, scope = document) { return [...scope.querySelectorAll(selector)]; }
function show(selector, visible) { const el = q(selector); if (el) el.hidden = !visible; }
function focusBack() { if (state.focus && document.getElementById(state.focus)) document.getElementById(state.focus).focus(); }

function closeSurface() {
  qa('[data-surface]').forEach((el) => { el.hidden = true; el.classList.remove('is-open'); });
  state.surface = null;
  document.body.classList.remove('surface-open');
  focusBack();
}

function openDetail(item, trigger) {
  state.focus = trigger?.id || null; state.surface = 'detail'; state.selected = item.id;
  const panel = q('[data-surface="detail"]');
  if (!panel) return;
  q('[data-detail-title]', panel).textContent = item.title || item.name;
  q('[data-detail-subtitle]', panel).textContent = item.latin || '观察重点与可靠资料摘要';
  q('[data-detail-image]', panel).src = item.image;
  q('[data-detail-summary]', panel).textContent = item.summary || '先从当前鱼缸状态开始观察，再决定下一步。';
  panel.hidden = false; panel.classList.add('is-open');
  document.body.classList.add('surface-open');
  panel.setAttribute('aria-modal', 'true');
  panel.querySelector('[data-detail-risk]')?.setAttribute('hidden', '');
  panel.querySelector('[data-detail-risk-toggle]')?.focus();
}

function renderVariants(group) {
  const tray = q('[data-variant-tray]'); if (!tray) return;
  const groupItems = species.filter((item) => item.base === group);
  tray.innerHTML = `<div class="kicker" data-group-label>${group} · ${groupItems.length} 个可选品系</div><h2>选择具体品系</h2><p>先看基础信息，再决定是否打开完整档案。</p><div class="variant-grid">${groupItems.map((item) => `<button class="variant" id="variant-${item.id}" data-species-id="${item.id}" type="button"><img src="${item.image}" alt=""><span><strong>${item.name}</strong><em>${item.latin}</em><small>${item.layer} · ${item.tags.join(' · ')}</small></span></button>`).join('')}</div><button class="secondary-btn" data-collapse-scene type="button">折叠互动场景</button>`;
  tray.hidden = false;
  q('[data-collapse-scene]', tray)?.addEventListener('click', () => root.classList.toggle('scene-collapsed'));
  qa('[data-species-id]', tray).forEach((button) => button.addEventListener('click', () => openDetail(species.find((item) => item.id === button.dataset.speciesId), button)));
}

function renderCareCards(group) {
  const tray = q('[data-care-tray]'); if (!tray) return;
  const items = careTopics[group] || [];
  tray.innerHTML = `<div class="care-tray-heading"><div class="kicker">问题首图卡片流 · <span data-care-group>${({ water: '水体', livestock: '鱼群', filter: '过滤' })[group]}</span></div><h2>先看现象，再决定是否开始排查。</h2></div>${items.length ? items.map((item, index) => `<button class="problem-card" id="problem-${item.id}" data-problem-index="${index}" type="button"><img src="${item.image}" alt=""><span><small>${item.urgency}</small><strong>${item.title}</strong><em>${item.summary}</em></span></button>`).join('') : '<div class="empty-state">当前分类暂无已审核问题卡片。<a href="care.html?mode=traditional">去传统浏览</a></div>'}`;
  tray.hidden = false;
  qa('[data-problem-index]', tray).forEach((button) => button.addEventListener('click', () => openDetail(items[Number(button.dataset.problemIndex)], button)));
}

function bindCommon() {
  qa('[data-close-surface]').forEach((button) => button.addEventListener('click', closeSurface));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSurface(); });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || !state.surface) return;
    const panel = q(`[data-surface="${state.surface}"]`); if (!panel) return;
    const focusable = qa('button,a,[tabindex]:not([tabindex="-1"])', panel).filter((el) => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  qa('[data-open-compatibility]').forEach((button) => button.addEventListener('click', () => { window.location.href = 'compatibility.html?species=' + encodeURIComponent(state.selected || 'cardinal'); }));
  qa('[data-start-task]').forEach((button) => button.addEventListener('click', () => { state.surface = 'task'; show('[data-surface="task"]', true); show('[data-surface="detail"]', false); }));
  q('[data-detail-risk-toggle]')?.addEventListener('click', () => { const risk = q('[data-detail-risk]'); if (risk) risk.hidden = !risk.hidden; });
}

function bindEncyclopedia() {
  qa('[data-scene-species]').forEach((button) => button.addEventListener('click', () => { state.focus = button.id; renderVariants(button.dataset.speciesName || '基础种'); }));
  q('[data-collapse-scene]')?.addEventListener('click', () => { root.classList.toggle('scene-collapsed'); });
}

function bindCare() { qa('[data-care-group-button]').forEach((button) => button.addEventListener('click', () => { state.focus = button.id; renderCareCards(button.dataset.careGroup); })); }

function bindCompatibility() {
  const params = new URLSearchParams(location.search); const selected = params.get('species');
  if (selected) q('[data-selected-species]')?.replaceChildren(document.createTextNode(selected === 'cardinal' ? '宝莲灯（来自图鉴）' : selected));
  qa('[data-result-state]').forEach((button) => button.addEventListener('click', () => { qa('[data-result]').forEach((el) => el.hidden = el.dataset.result !== button.dataset.resultState); }));
  qa('[data-demo-action]').forEach((button) => button.addEventListener('click', () => { button.textContent = button.closest('[data-result="block"]') ? '已保留阻断 · 不会保存' : '组合已更新 · 不会保存'; button.disabled = true; }));
}

document.addEventListener('DOMContentLoaded', () => { bindCommon(); bindEncyclopedia(); bindCare(); bindCompatibility(); });
