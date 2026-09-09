(function () {
  const root = () => document.querySelector('[data-page]');
  const toast = (message) => {
    let node = document.querySelector('.toast');
    if (!node) { node = document.createElement('div'); node.className = 'toast'; document.body.appendChild(node); }
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(node._timer);
    node._timer = window.setTimeout(() => node.classList.remove('show'), 2400);
  };
  const updateQuery = (key, value) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
  };
  const closeSurfaces = () => {
    const openNodes = [...document.querySelectorAll('[data-surface].open')];
    const returnId = openNodes.map((node) => node.dataset.returnFocus).find(Boolean);
    openNodes.forEach((node) => node.classList.remove('open'));
    const page = root();
    if (page) {
      page.dataset.surfaceState = 'closed';
      if (page.dataset.page === 'encyclopedia' && page.dataset.mode === 'interactive' && page.dataset.state !== 'traditional') {
        const variants = document.querySelector('#atlas-variants');
        if (variants && page.dataset.interactiveState !== 'collapsed') {
          variants.classList.add('open');
          page.dataset.surfaceState = 'variant-selection';
        }
      }
    }
    if (returnId) document.getElementById(returnId)?.focus();
  };
  const setMode = (mode) => {
    const page = root();
    if (!page) return;
    page.dataset.mode = mode;
    updateQuery('mode', mode === 'interactive' ? null : mode);
    document.querySelectorAll('[data-mode-link]').forEach((button) => button.classList.toggle('active', button.dataset.modeLink === mode));
    document.querySelectorAll('[data-mode-view]').forEach((view) => { view.hidden = view.dataset.modeView !== mode; });
  };
  const setSection = (section) => {
    const page = root();
    if (!page) return;
    page.dataset.section = section;
    updateQuery('section', section === 'overview' ? null : section);
    document.querySelectorAll('[data-section]').forEach((button) => button.classList.toggle('active', button.dataset.section === section));
    document.querySelectorAll('[data-section-view]').forEach((view) => { view.hidden = view.dataset.sectionView !== section; });
    const copy = {
      overview: ['你的水族记忆', '每个节点都连接一组真实记录。先看看你想继续的那一部分。'],
      wishlist: ['种草物种', '先收藏想进一步了解的物种，再比较环境和照料方式。'],
      care: ['养护收藏', '把有用的照料指南留在同一页，随时回到养护。'],
      memorial: ['生命纪念', '保留已经发生过的陪伴和记录。'],
      achievements: ['成就', '查看已经完成的观察与照料里程碑。']
    }[section];
    if (copy) { document.querySelector('.collection-context h2')?.replaceChildren(document.createTextNode(copy[0])); document.querySelector('.collection-context p')?.replaceChildren(document.createTextNode(copy[1])); }
  };
  const setState = (state) => {
    const page = root();
    if (!page) return;
    page.dataset.state = state;
    page.classList.toggle('state-only', ['empty', 'loading', 'error'].includes(state));
    closeSurfaces();
    document.querySelectorAll('[data-demo-state]').forEach((button) => button.classList.toggle('active', button.dataset.demoState === state));
    document.querySelectorAll('[data-state-panel]').forEach((panel) => { panel.hidden = panel.dataset.statePanel !== state; });
    if (page.dataset.page === 'encyclopedia' && ['variant-selection', 'detail', 'collapsed'].includes(state)) {
      const variants = document.querySelector('#atlas-variants');
      if (variants) openSurface(variants);
      if (state === 'detail' || state === 'collapsed') document.querySelector('#variant-neon')?.click();
      if (state === 'collapsed') { page.dataset.interactiveState = 'collapsed'; page.classList.add('interactive-collapsed'); }
    }
    if (page.dataset.page === 'care' && state === 'detail') document.querySelector('[data-open="#care-surface"]')?.click();
  };
  const openSurface = (target, opener) => {
    if (!target) return;
    document.querySelectorAll('[data-surface].open').forEach((node) => { if (node !== target) node.classList.remove('open'); });
    target.classList.add('open');
    const page = root();
    if (page) page.dataset.surfaceState = target.dataset.surfaceState || target.id || 'open';
    if (opener) target.dataset.returnFocus = opener.id || '';
    target.querySelector('button, [href], input')?.focus();
  };
  document.addEventListener('click', (event) => {
    const stateButton = event.target.closest('[data-demo-state]');
    if (stateButton) { setState(stateButton.dataset.demoState); return; }
    const modeButton = event.target.closest('[data-mode-link]');
    if (modeButton) { setMode(modeButton.dataset.modeLink); return; }
    const sectionButton = event.target.closest('button[data-section], [role="tab"][data-section]');
    if (sectionButton) { setSection(sectionButton.dataset.section); return; }
    const collapse = event.target.closest('[data-collapse-interactive]');
    if (collapse) { root().dataset.interactiveState = 'collapsed'; root().classList.add('interactive-collapsed'); toast('互动场景已折叠，可从左侧恢复'); return; }
    const expand = event.target.closest('[data-expand-interactive]');
    if (expand) { root().dataset.interactiveState = 'expanded'; root().classList.remove('interactive-collapsed'); toast('互动场景已展开'); return; }
    const toastButton = event.target.closest('[data-demo-toast]');
    if (toastButton) { toast(toastButton.dataset.demoToast); return; }
    const openTarget = event.target.closest('[data-open]');
    if (openTarget) { const target = document.querySelector(openTarget.dataset.open); openSurface(target, openTarget); return; }
    const closeTarget = event.target.closest('[data-close]');
    if (closeTarget) {
      const surface = closeTarget.closest('[data-surface]');
      surface?.classList.remove('open');
      const page = root();
      if (page) page.dataset.surfaceState = 'closed';
      const returnId = surface?.dataset.returnFocus;
      if (returnId) document.getElementById(returnId)?.focus();
      if (surface?.id === 'species-profile' && page?.dataset.mode === 'interactive') {
        const variants = document.querySelector('#atlas-variants');
        if (variants && !page.classList.contains('interactive-collapsed')) {
          variants.classList.add('open');
          page.dataset.surfaceState = 'variant-selection';
        }
      }
      return;
    }
    const openSurfaceNode = document.querySelector('[data-surface].open');
    if (openSurfaceNode && !event.target.closest('[data-surface]') && !event.target.closest('[data-open]')) {
      closeSurfaces();
      return;
    }
    if (event.target.classList.contains('modal-backdrop')) event.target.classList.remove('open');
    const nav = event.target.closest('[data-nav]');
    if (nav) { event.preventDefault(); window.location.href = nav.getAttribute('href'); }
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeSurfaces(); });
  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form');
    if (!form) return;
    event.preventDefault();
    const missing = [...form.querySelectorAll('[required]')].filter((field) => !field.value.trim());
    form.querySelectorAll('.field-error').forEach((node) => node.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
    if (missing.length) {
      missing.forEach((field) => {
        const error = document.createElement('small');
        error.className = 'field-error';
        error.textContent = '请填写此项';
        field.insertAdjacentElement('afterend', error);
        field.setAttribute('aria-invalid', 'true');
      });
      missing[0].focus();
      toast('请先完成必填项（HTML 演示，不会发送）');
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    const originalLabel = submit?.textContent;
    if (submit) { submit.disabled = true; submit.setAttribute('aria-busy', 'true'); submit.textContent = '处理中…'; }
    toast(form.dataset.success || 'HTML 演示已完成，不会发送或保存');
    window.setTimeout(() => {
      if (submit) { submit.disabled = false; submit.removeAttribute('aria-busy'); submit.textContent = originalLabel; }
    }, 700);
  });
  const params = new URLSearchParams(window.location.search);
  const page = root();
  document.querySelectorAll('[data-open]').forEach((opener, index) => {
    if (!opener.id) opener.id = `review-trigger-${page?.dataset.page || 'page'}-${index + 1}`;
  });
  document.querySelectorAll('img[src*="neon-tetra.webp"], img[src*="cardinal-tetra.webp"]').forEach((image) => {
    image.src = image.src.replace('neon-tetra.webp', 'neon-tetra.png').replace('cardinal-tetra.webp', 'cardinal-tetra.png');
  });
  const restore = document.querySelector('.interactive-restore');
  if (restore && !restore.querySelector('img')) {
    const thumb = document.createElement('img');
    thumb.src = '../assets/neon-tetra.png';
    thumb.alt = '当前物种';
    restore.prepend(thumb);
  }
  if (page) {
    if (page.dataset.page === 'encyclopedia' || page.dataset.page === 'care') setMode(params.get('mode') === 'traditional' ? 'traditional' : 'interactive');
    if (page.dataset.page === 'collection') setSection(params.get('section') || 'overview');
    if (params.get('state')) setState(params.get('state'));
  }
  window.AquaPrototype = { toast, setState, setMode, setSection, closeSurfaces, openSurface };
})();
