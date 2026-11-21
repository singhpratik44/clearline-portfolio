/* Carry known Thanksgiving referrals to the family kit without storing visitor data. */
(() => {
  'use strict';
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const campaign = params.get('utm_campaign');
  const channels = new Map([
    ['seasonal', ['shop_referral', 'thanksgiving_table']],
    ['tiktok', ['organic_video', 'aperture_holiday_2026']],
    ['youtube', ['organic_short', 'aperture_holiday_2026']],
    ['instagram', ['organic_video', 'aperture_holiday_2026']],
    ['stulux', ['creator_email', 'thanksgiving_table']],
    ['alltheholidays_mama', ['partner_email', 'thanksgiving_table']]
  ]);
  const channel = channels.get(source);
  if (!channel || channel[0] !== medium || channel[1] !== campaign) return;
  const content = params.get('utm_content');
  if (content && content !== 'table-draft') return;

  function addTags(url) {
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', medium);
    url.searchParams.set('utm_campaign', campaign);
    if (content) url.searchParams.set('utm_content', content);
    return url;
  }

  const catalogLink = document.querySelector('[data-family-referral]');
  if (catalogLink) {
    catalogLink.href = addTags(new URL(catalogLink.href)).href;
  }

  window.apertureFamilyCheckout = (sku, original) => {
    if (sku !== 'family') return original;
    const url = new URL(original);
    if (url.origin !== 'https://buy.stripe.com') return original;
    if (!url.searchParams.has('client_reference_id')) {
      url.searchParams.set('client_reference_id', 'family_' + campaign + '_' + source);
    }
    return addTags(url).href;
  };
})();
