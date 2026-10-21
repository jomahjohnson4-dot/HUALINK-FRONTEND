/**
 * Mapbox GL configuration.
 *
 * A Mapbox access token is a *public* token — it is embedded in the browser
 * bundle and visible to anyone, so it must never be a secret. The token
 * should be created in the Mapbox account with a URL allow-list that covers
 * only the Hualink domains, and scoped to the styles it needs.
 *
 * Resolution order:
 *   1. `VITE_MAPBOX_ACCESS_TOKEN`  — the recommended variable.
 *   2. `VITE_MAPBOX_TOKEN`         — kept for brevity / older setups.
 *   3. `VITE_MAPBOX_FALLBACK_TOKEN` — a restricted fallback token used when
 *      the primary variable is not set (e.g. a preview deployment).
 *
 * When no token is available the map degrades to a branded static route
 * preview instead of throwing, so the tracking page is never broken.
 */

/** The light theme used across the customer facing tracking views. */
export const MAPBOX_STYLE_LIGHT = 'mapbox://styles/mapbox/light-v11';

/** The dark theme used by the admin console panels. */
export const MAPBOX_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';

/** The resolved public access token (empty string when none is configured). */
export const MAPBOX_ACCESS_TOKEN = String(
  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
    import.meta.env.VITE_MAPBOX_TOKEN ||
    import.meta.env.VITE_MAPBOX_FALLBACK_TOKEN ||
    ''
).trim();

/** Whether a usable token is configured. */
export const hasMapboxToken = () => MAPBOX_ACCESS_TOKEN.length > 0;

/** The default map viewport — the Tanzanian mainland. */
export const DEFAULT_CENTER = [-7.2, 37.0];
export const DEFAULT_ZOOM = 6.4;
