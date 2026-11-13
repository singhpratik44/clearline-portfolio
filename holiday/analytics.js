/* APERTURE Holiday — consent-first PostHog transport.
   No SDK request, analytics cookie, event or identity is sent before affirmative analytics consent.
   All tokens are public project identifiers, never personal API keys.
*/
(function () {
  'use strict';
  const allowedEvents = new Set([
    'gift_view','gift_personalize','gift_share_intent','gift_share_success',
    'gift_copy_intent','gift_copy_success','gift_sms_intent',
    'gift_email_intent','sms_invitation_intent'
  ]);
  const sourceKeys = ['ref','utm_source','utm_medium','utm_campaign'];
  const config = window.APERTURE_ANALYTICS_CONFIG || {};
  const valid = config.provider === 'posthog' &&
    /^phc_[a-zA-Z0-9_-]{8,200}$/.test(config.projectToken || '') &&
    ['https://us.i.posthog.com','https://eu.i.posthog.com'].includes(config.apiHost);
  const blocked = navigator.globalPrivacyControl === true ||
    navigator.doNotTrack === '1' || navigator.msDoNotTrack === '1';
  const key = 'aperture_holiday_analytics_consent_v1';
  const status = document.getElementById('analytics-status');
  const accept = document.getElementById('analytics-accept');
  const decline = document.getElementById('analytics-decline');
  const choices = document.getElementById('analytics-choices');
  let consented = false;
  let loaded = false;
  let initialized = false;
  let viewCaptured = false;

  function readPreference() {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writePreference(value) {
    try { localStorage.setItem(key, value); } catch (e) { /* no persistence allowed */ }
  }
  function setStatus(message) { if (status) status.textContent = message; }

  function eventProperties(detail) {
    const properties = { app: 'aperture_holiday', page_path: location.pathname };
    for (const prop of sourceKeys) {
      const value = detail && detail[prop];
      if (typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value)) {
        properties[prop] = value;
      }
    }
    return properties;
  }
  // Drop all auto-generated properties except the sanitized page URL and a small explicit schema.
  function sanitizeOutgoing(event) {
    if (!event || !allowedEvents.has(event.event)) return null;
    const source = eventProperties(event.properties || {});
    event.properties = Object.assign(source, {
      $current_url: location.origin + location.pathname,
      $pathname: location.pathname,
      $process_person_profile: false
    });
    return event;
  }
  function capture(name, detail) {
    if (!consented || !loaded || !allowedEvents.has(name)) return;
    const ph = window.posthog;
    if (ph && typeof ph.capture === 'function') {
      ph.capture(name, eventProperties(detail));
    }
  }
  function pageviewOnce() {
    if (viewCaptured) return;
    viewCaptured = true;
    const tags = new URLSearchParams(location.search);
    const properties = {};
    for (const key of sourceKeys) properties[key] = tags.get(key) || '';
    capture('gift_view', properties);
  }
  function sdkBootstrap() {
    // Official PostHog queue loader; called only after the visitor has accepted analytics.
    !function(t,e){
      var o,n,p,r;
      e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){
        function g(t,e){var o=e.split('.');2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}
        (p=t.createElement('script')).type='text/javascript';p.crossOrigin='anonymous';p.async=!0;
        p.src=s.api_host.replace('.i.posthog.com','-assets.i.posthog.com')+'/static/array.js';
        p.onerror=function(){setStatus('Analytics could not connect. No engagement totals are available.');};
        (r=t.getElementsByTagName('script')[0]).parentNode.insertBefore(p,r);
        var u=e;
        for(void 0!==a?u=e[a]=[]:a='posthog',u.people=u.people||[],
          o='init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRender getNextSurveyStep identify setPersonProperties group resetGroups reset get_distinct_id get_session_id alias set_config startSessionRecording stopSessionRecording captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug'.split(' '),n=0;n<o.length;n++)g(u,o[n]);
        e._i.push([i,s,a]);
      },e.__SV=1);
    }(document,window.posthog||[]);
  }
  function start() {
    if (!valid || blocked || initialized) return;
    initialized = true;
    consented = true;
    sdkBootstrap();
    window.posthog.init(config.projectToken, {
      api_host: config.apiHost,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_heatmaps: false,
      capture_exceptions: false,
      disable_session_recording: true,
      disable_surveys: true,
      person_profiles: 'never',
      persistence: 'memory',
      opt_out_capturing_by_default: true,
      opt_out_persistence_by_default: true,
      before_send: sanitizeOutgoing,
      loaded: function(instance) {
        if (!consented || blocked) return;
        instance.opt_in_capturing({captureEventName:false});
        loaded = true;
        setStatus('Anonymous measurement is enabled. No gift names, messages or phone numbers are tracked.');
        pageviewOnce();
      }
    });
    if (choices) choices.hidden = false;
    setStatus('Analytics connection requested. Your gift works even if tracking cannot connect.');
  }
  function reject() {
    consented = false;
    loaded = false;
    writePreference('no');
    if (window.posthog && typeof window.posthog.opt_out_capturing === 'function') {
      window.posthog.opt_out_capturing();
    }
    setStatus('Analytics is off. You can still create and share free gifts.');
    if (accept) accept.textContent = 'Allow anonymous measurement';
  }

  if (accept) accept.addEventListener('click', function() {
    if (!valid || blocked) return;
    writePreference('yes');
    if (initialized) {
      consented = true;
      if (window.posthog && typeof window.posthog.opt_in_capturing === 'function') {
        window.posthog.opt_in_capturing({captureEventName:false});
      }
      loaded = true;
      setStatus('Anonymous measurement is enabled. No gift names or messages are tracked.');
      pageviewOnce();
    } else start();
  });
  if (decline) decline.addEventListener('click', reject);
  window.addEventListener('aperture:metric', function(evt) {
    if (!evt || !evt.detail || !allowedEvents.has(evt.detail.name)) return;
    // The initial pageview is counted once after explicit consent, not replayed from pre-consent history.
    if (evt.detail.name === 'gift_view') return;
    capture(evt.detail.name, evt.detail);
  });

  if (!valid) {
    if (choices) choices.hidden = true;
    setStatus('Visitor analytics is not connected. No website events are sent or counted.');
    return;
  }
  if (blocked) {
    if (choices) choices.hidden = true;
    setStatus('Your browser privacy preference is respected: analytics is disabled.');
    return;
  }
  // Show the consent choice only when a provider is configured and privacy signals allow it.
  // Showing buttons does not load the SDK or capture an event.
  if (choices) choices.hidden = false;
  const preference = readPreference();
  if (preference === 'yes') start();
  else if (preference === 'no') {
    setStatus('Analytics is off. You can change this choice here anytime.');
  } else {
    setStatus('Optional anonymous measurement is off unless you choose to enable it.');
  }
})();
