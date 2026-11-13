/* Public PostHog project token (not a secret). Inactive until a verified account/project is connected.
 * Replace ONLY after user connects PostHog and supplies its project token and ingestion region.
 * Never place a PostHog personal API key here.
 */
window.APERTURE_ANALYTICS_CONFIG = Object.freeze({
  provider: "posthog",
  projectToken: "",
  apiHost: "https://us.i.posthog.com"
});
