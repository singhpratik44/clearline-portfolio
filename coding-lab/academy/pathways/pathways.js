(() => {
  const trails = [...document.querySelectorAll('[data-path]')];
  const menu = [...document.querySelectorAll('[data-nav]')];
  const prefix = 'aperture.pathways.v1.';
  const memory = new Map();
  function load(id) {
    if (memory.has(id)) return memory.get(id);
    let saved;
    try { saved = JSON.parse(localStorage.getItem(prefix + id)); } catch {}
    const state = {
      title: typeof saved?.title === 'string' ? saved.title.slice(0,80) : '',
      tried: Array.isArray(saved?.tried) ? saved.tried.filter(Number.isInteger) : []
    };
    memory.set(id,state);
    return state;
  }
  function persist(id) {
    try { localStorage.setItem(prefix + id, JSON.stringify(load(id))); return true; }
    catch { return false; }
  }
  for(const trail of trails) {
    const id = trail.dataset.path;
    const form = trail.querySelector('form');
    const title = form.querySelector('input');
    const status = form.querySelector('[role=status]');
    const state = load(id);
    const boxes = [...trail.querySelectorAll('[data-check]')];
    const count = trail.querySelector('[data-count]');
    const evidence = [...trail.querySelectorAll('[data-report]')];
    const defaultProject = trail.querySelector('h2').textContent;
    const updateReportLinks = () => {
      for (const a of evidence) {
        const url = new URL(a.href);
        const fields = new URLSearchParams(url.hash.slice(1));
        fields.set('project',state.title || defaultProject);
        url.hash = fields.toString();
        a.href = url.href;
      }
    };
    function updateCount() {
      count.textContent = boxes.filter(b => b.checked).length + ' of ' + boxes.length + ' stages tried';
    }
    form.hidden = false;
    count.hidden = false;
    title.value = state.title;
    updateReportLinks();
    form.addEventListener('submit', event => {
      event.preventDefault();
      state.title = title.value.trim();
      updateReportLinks();
      const saved = persist(id);
      status.textContent = saved ? 'Project title saved.' : 'Project title set for this visit.';
    });
    for (const b of boxes) {
      const index = Number(b.dataset.check);
      b.closest('label').hidden = false;
      b.checked = state.tried.includes(index);
      b.addEventListener('change',() => {
        state.tried = boxes.filter(box=>box.checked).map(box=>Number(box.dataset.check));
        if(!persist(id)) status.textContent = 'Progress is available for this visit only.';
        updateCount();
      });
    }
    updateCount();
  }
  function show(focus) {
    const id = location.hash.slice(1);
    const active = trails.find(t=>t.id===id) || trails[0];
    for (const trail of trails) trail.hidden = trail !== active;
    for (const a of menu) {
      if (a.dataset.nav===active.id) a.setAttribute('aria-current','true');
      else a.removeAttribute('aria-current');
    }
    if(focus) active.querySelector('h2').focus({preventScroll:true});
    if(focus || id===active.id) active.scrollIntoView({block:'start'});
  }
  window.addEventListener('hashchange',()=>show(true));
  show(false);
})();
