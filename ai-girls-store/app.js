'use strict';
(() => {
  const config = Object.assign({ checkoutUrl: '', sampleDownloadUrl: 'downloads/muse-01-creator-kit.zip', supportEmail: 'parry.s.2324@gmail.com', siteUrl: '' }, window.STORE_CONFIG || {});
  const characters = {
    nova: { name: 'Nova', style: 'Future / silver / teal', category: 'Future', palette: 'Silver, muted teal and cool charcoal', description: 'A composed, future-facing character with a precise eye and a quiet sense of possibility. Nova is a visual starting point for speculative worlds, technology concepts and considered sci-fi storytelling.', uses: 'Future-facing brand concepts, speculative stories, sci-fi mood boards', alt: 'Nova, a fictional adult AI character with a futuristic silver and teal visual style' },
    amara: { name: 'Amara', style: 'Editorial / warmth / terracotta', category: 'Editorial', palette: 'Terracotta, warm neutrals and earthy contrast', description: 'An expressive editorial character with a grounded point of view. Amara brings warmth and presence to creative concepts built around style, everyday observation and personal stories.', uses: 'Editorial mood boards, lifestyle concepts, character-led visual stories', alt: 'Amara, a fictional adult AI character in a warm terracotta editorial portrait' },
    luna: { name: 'Luna', style: 'Dreamlike / lavender / artistic', category: 'Dreamlike', palette: 'Lavender, soft plum and gentle pale tones', description: 'An imaginative artist character drawn to small details and unusual connections. Luna is a starting point for reflective stories, art-led concepts and softer imagined worlds.', uses: 'Artist personas, dreamlike stories, creative portfolio concepts', alt: 'Luna, a fictional adult AI character with a lavender artist aesthetic' }
  };
  const $ = (selector, within = document) => within.querySelector(selector);
  const $$ = (selector, within = document) => [...within.querySelectorAll(selector)];
  const announce = (message) => { $('#page-status').textContent = message; };
  const menuButton = $('.menu-toggle');
  const nav = $('#primary-nav');
  function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); });
  $$('#primary-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
  const desktopQuery = window.matchMedia('(min-width: 761px)');
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', event => { if (event.matches) closeMenu(); });

  $$('.persona-button').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.persona;
    const person = characters[id];
    if (!person) return;
    $('#hero-image').src = `assets/${id}.webp`;
    $('#hero-image').alt = person.alt;
    $('#hero-persona').textContent = person.name.toUpperCase();
    $('#hero-style').textContent = person.style;
    $('.hero-gallery').dataset.character = id;
    $$('.persona-button').forEach(item => { const selected = item === button; item.classList.toggle('is-selected', selected); item.setAttribute('aria-pressed', String(selected)); });
    announce(`Featured character: ${person.name}. ${person.style}.`);
  }));

  $$('.filter').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('.filter').forEach(item => { const selected = item === button; item.classList.toggle('is-active', selected); item.setAttribute('aria-pressed', String(selected)); });
    let count = 0;
    $$('.character-card').forEach(card => { const visible = filter === 'all' || card.dataset.category === filter; card.hidden = !visible; if (visible) count++; });
    $('#character-count').textContent = String(count);
    $('.catalog-count').lastChild.textContent = count === 1 ? ' character' : ' characters';
    announce(`${count} ${count === 1 ? 'character' : 'characters'} shown. ${button.textContent}.`);
  }));

  let lastDialogTrigger = null;
  let resumeCheckout = false;
  function openDialog(id, trigger) {
    const dialog = document.getElementById(id);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    lastDialogTrigger = trigger || document.activeElement;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    const title = dialog.querySelector('h2');
    if (title) title.focus({ preventScroll: true });
  }
  function closeDialog(dialog) { if (dialog && dialog.open) dialog.close(); }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
      if (dialog.id === 'license-dialog' && resumeCheckout) {
        resumeCheckout = false;
        openDialog('checkout-dialog', $('.checkout-trigger'));
      } else if (lastDialogTrigger && document.contains(lastDialogTrigger)) lastDialogTrigger.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog); });
    $$('[data-close-dialog]', dialog).forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
  });
  $$('[data-open-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.openDialog, button)));
  $$('[data-character-detail]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.characterDetail;
    const person = characters[id];
    if (!person) return;
    $('#character-dialog-image').src = `assets/${id}.webp`;
    $('#character-dialog-image').alt = person.alt;
    $('#character-dialog-label').textContent = `MUSE 01 / ${person.category}`;
    $('#character-dialog-title').textContent = person.name;
    $('#character-dialog-description').textContent = person.description;
    $('#character-dialog-palette').textContent = person.palette;
    $('#character-dialog-uses').textContent = person.uses;
    openDialog('character-dialog', button);
  }));
  $('#view-kit-from-dialog').addEventListener('click', () => { closeDialog($('#character-dialog')); document.getElementById('creator-kit').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });

  function stripeCheckoutUrl(value) { try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === 'buy.stripe.com' || url.hostname === 'checkout.stripe.com') ? url.href : ''; } catch { return ''; } }
  const checkoutUrl = stripeCheckoutUrl(config.checkoutUrl);
  const consent = $('#license-consent');
  const checkoutContinue = $('#continue-checkout');
  const checkoutButtons = $$('.checkout-trigger');
  if (checkoutUrl) {
    checkoutButtons.forEach(button => { button.disabled = false; button.innerHTML = 'Get creator license — $19 <span aria-hidden="true"><svg class="icon-arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 19 19 5M5 5h14v14"/></svg></span>'; });
    $('#checkout-status').textContent = 'One-time payment. Secure checkout with Stripe.';
    $$('.purchase-request-link').forEach(link => { link.hidden = true; });
  }
  checkoutButtons.forEach(button => button.addEventListener('click', () => { if (!checkoutUrl) return; consent.checked = false; checkoutContinue.disabled = true; openDialog('checkout-dialog', button); }));
  consent.addEventListener('change', () => { checkoutContinue.disabled = !consent.checked || !checkoutUrl; });
  checkoutContinue.addEventListener('click', () => { if (consent.checked && checkoutUrl) window.location.assign(checkoutUrl); });
  $('#checkout-license-link').addEventListener('click', () => { resumeCheckout = true; closeDialog($('#checkout-dialog')); openDialog('license-dialog', $('#checkout-license-link')); });

  if (typeof config.sampleDownloadUrl === 'string' && config.sampleDownloadUrl && !/^\s*(?:javascript|data):/i.test(config.sampleDownloadUrl)) $$('.download-link').forEach(link => { link.href = config.sampleDownloadUrl; });
  const email = typeof config.supportEmail === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.supportEmail) ? config.supportEmail : 'parry.s.2324@gmail.com';
  $$('.support-link').forEach(link => { link.href = `mailto:${email}`; });
  $$('.purchase-request-link').forEach(link => { link.href = `mailto:${email}?subject=${encodeURIComponent('MUSE 01 creator license — purchase link request')}&body=${encodeURIComponent('Hello APERTURE,\n\nI would like a purchase link for the MUSE 01 creator license at the listed price of $19 USD.\n\nMy intended use:\n\nPlease send the final checkout details and applicable terms before payment.\n')}`; });
  const inquiry = 'Hello APERTURE,\n\nI would like to discuss a custom fictional adult AI character.\n\nProject or brand:\nIntended use:\nPreferred visual style:\nCharacter notes:\nReference material I have permission to use:\nPreferred timeline:\nBudget:\n\nPlease send a proposed scope and quote before starting paid work.\n';
  $$('.inquiry-link').forEach(link => { link.href = `mailto:${email}?subject=${encodeURIComponent('Custom AI character direction inquiry')}&body=${encodeURIComponent(inquiry)}`; });
  $('#year').textContent = String(new Date().getFullYear());
})();
