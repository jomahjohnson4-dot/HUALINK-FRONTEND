import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './DeliveryMap.css';
import { AlertTriangle, Loader2, MapPin, Navigation, Radio, Truck, Warehouse } from 'lucide-react';
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAPBOX_ACCESS_TOKEN,
  MAPBOX_STYLE_LIGHT,
  hasMapboxToken,
} from '../config/mapbox';
import {
  STATUS_LABELS,
  buildProgressGeoJSON,
  buildRouteGeoJSON,
  pointAlongRoute,
  remainingSlice,
  resolveRouteForOrder,
  routeDistance,
  statusProgress,
  travelledSlice,
} from '../data/deliveryRoutes';

/**
 * The interactive delivery map.
 *
 * Renders the corridor a shipment travels along — the Dar es Salaam dispatch
 * hub to the regional depot — as a glowing Mapbox route, with a live truck
 * marker that moves along the road as the order status changes in the
 * database.
 *
 * The component is deliberately defensive: when no Mapbox token is configured
 * (or the token is rejected) it falls back to a static route preview so the
 * tracking page always renders something useful.
 */

/** Inline glyphs for the map markers (lucide paths, rendered imperatively). */
const MARKER_GLYPHS = {
  hub: '<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect width="12" height="12" x="6" y="10"/>',
  truck:
    '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};

/**
 * Builds the DOM node used for a custom Mapbox marker.
 *
 * @param {'origin'|'truck'|'destination'} variant
 * @param {keyof MARKER_GLYPHS} glyph
 * @param {string} [label]
 * @returns {HTMLElement}
 */
const createMarkerElement = (variant, glyph, label) => {
  const element = document.createElement('div');
  element.className = `hualink-marker hualink-marker--${variant}`;

  if (variant === 'truck') {
    const pulse = document.createElement('span');
    pulse.className = 'hualink-marker__pulse';
    element.appendChild(pulse);
  }

  const body = document.createElement('span');
  body.className = 'hualink-marker__body';
  body.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MARKER_GLYPHS[glyph]}</svg>`;
  element.appendChild(body);

  if (label) {
    const tag = document.createElement('span');
    tag.className = 'hualink-marker__label';
    tag.textContent = label;
    element.appendChild(tag);
  }

  return element;
};

/**
 * Eases a marker from its current position to a new one.
 */
const tweenMarker = (marker, to, duration = 1200) => {
  if (!marker) return;

  const from = marker.getLngLat();

  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ) {
    marker.setLngLat(to);
    return;
  }

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const step = (now) => {
    const elapsed = now - startedAt;
    const t = Math.min(elapsed / duration, 1);
    const eased = 1 - (1 - t) ** 3;

    marker.setLngLat([
      from.lng + (to[0] - from.lng) * eased,
      from.lat + (to[1] - from.lat) * eased,
    ]);

    if (t < 1 && typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(step);
    }
  };

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(step);
  } else {
    marker.setLngLat(to);
  }
};

/**
 * Escapes a value before it is injected into the popup markup.
 *
 * @param {string} value
 * @returns {string}
 */
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]
  );

/**
 * The markup shown in the popup that follows the truck.
 *
 * @param {object} route
 * @param {string} stageLabel
 * @param {number} progress
 * @returns {string} the popup HTML
 */
const popupMarkup = (route, stageLabel, progress) => `
  <div class="hualink-popup">
    <p class="hualink-popup__stage">${escapeHtml(stageLabel)}</p>
    <p class="hualink-popup__route">${escapeHtml(route.origin.city)} &rarr; ${escapeHtml(route.destination.city)}</p>
    <p class="hualink-popup__progress">${Math.round(progress * 100)}% of the corridor covered</p>
  </div>
`;

/**
 * Builds a projector that maps [lng, lat] pairs onto an SVG canvas.
 *
 * The bounds are always derived from the full corridor so the travelled and
 * remaining slices stay aligned with the route they belong to.
 *
 * @param {Array<[number, number]>} waypoints the full corridor
 * @param {number} width
 * @param {number} height
 * @param {number} padding
 * @returns {function} maps coordinates onto the canvas
 */
const createProjector = (waypoints, width, height, padding) => {
  const lngs = waypoints.map(([lng]) => lng);
  const lats = waypoints.map(([, lat]) => lat);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const spanLng = maxLng - minLng || 1;
  const spanLat = maxLat - minLat || 1;

  const scale = Math.min(
    (width - padding * 2) / spanLng,
    (height - padding * 2) / spanLat
  );

  const offsetX = (width - spanLng * scale) / 2;
  const offsetY = (height - spanLat * scale) / 2;

  return (coords) =>
    coords.map(([lng, lat]) => [
      offsetX + (lng - minLng) * scale,
      // SVG y grows downwards, latitude grows northwards.
      offsetY + (maxLat - lat) * scale,
    ]);
};

export default function DeliveryMap({
  order = null,
  status,
  progress,
  route: routeProp,
  style: styleProp = MAPBOX_STYLE_LIGHT,
  height = '420px',
  className = '',
  showLegend = true,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const truckMarkerRef = useRef(null);
  const truckPopupRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(null);

  const token = MAPBOX_ACCESS_TOKEN;
  const tokenAvailable = hasMapboxToken();

  const route = useMemo(
    () => routeProp || resolveRouteForOrder(order),
    [routeProp, order]
  );

  const resolvedStatus = String(status || order?.status || 'PENDING').toUpperCase();

  const resolvedProgress = useMemo(() => {
    if (typeof progress === 'number') {
      return Math.min(Math.max(progress, 0), 1);
    }
    return statusProgress(resolvedStatus);
  }, [progress, resolvedStatus]);

  const stageLabel = STATUS_LABELS[resolvedStatus] || resolvedStatus;
  const distanceKm = useMemo(
    () => Math.round(routeDistance(route.waypoints)),
    [route]
  );

  /* ------------------------------------------------------------------ */
  /* Map bootstrap                                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!tokenAvailable || !containerRef.current) return undefined;

    mapboxgl.accessToken = token;

    let map;
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: styleProp,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        // Mapbox GL v3 keeps the attribution responsive — it collapses on
        // narrow viewports on its own.
        attributionControl: true,
        logoPosition: 'bottom-left',
      });
    } catch (error) {
      const message = error?.message || 'The map could not be initialised.';
      // Reported from a scheduled callback so the fallback renders without a
      // cascading render inside the effect body.
      const report = () => setMapError(message);
      if (typeof queueMicrotask === 'function') queueMicrotask(report);
      else setTimeout(report, 0);
      return undefined;
    }

    mapRef.current = map;

    // Zoom / compass controls and a scale bar for the corridor.
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    // A rejected token or an unreachable style must never break the page.
    map.on('error', (event) => {
      const message = event?.error?.message || 'The live map could not be loaded.';
      // Style/tile errors are noisy — only surface the ones that break the map.
      if (/token|401|403|unauthorized|unauthorised|webgl/i.test(message)) {
        setMapError(message);
      }
    });

    map.on('load', () => {
      setMapReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [tokenAvailable, token, styleProp]);

  /* ------------------------------------------------------------------ */
  /* Route layer + markers                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return undefined;

    const waypoints = route.waypoints;

    // --- Sources -------------------------------------------------------
    const routeData = {
      type: 'geojson',
      data: buildRouteGeoJSON(waypoints),
    };
    const progressData = {
      type: 'geojson',
      data: buildProgressGeoJSON(waypoints, resolvedProgress),
    };

    if (!map.getSource('hualink-route')) {
      map.addSource('hualink-route', routeData);
    } else {
      map.getSource('hualink-route').setData(routeData.data);
    }

    if (!map.getSource('hualink-route-progress')) {
      map.addSource('hualink-route-progress', progressData);
    } else {
      map.getSource('hualink-route-progress').setData(progressData.data);
    }

    // --- Layers --------------------------------------------------------
    if (!map.getLayer('hualink-route-glow')) {
      // The soft halo that makes the route read as a "glowing" corridor.
      map.addLayer({
        id: 'hualink-route-glow',
        type: 'line',
        source: 'hualink-route',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#DC2626',
          'line-width': 14,
          'line-opacity': 0.16,
          'line-blur': 8,
        },
      });
    }

    if (!map.getLayer('hualink-route-remaining')) {
      // The part of the corridor the truck has not covered yet.
      map.addLayer({
        id: 'hualink-route-remaining',
        type: 'line',
        source: 'hualink-route-progress',
        filter: ['==', ['get', 'kind'], 'remaining'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#94A3B8',
          'line-width': 3,
          'line-opacity': 0.85,
          'line-dasharray': [2, 2],
        },
      });
    }

    if (!map.getLayer('hualink-route-travelled')) {
      // The part already covered — solid Hualink red.
      map.addLayer({
        id: 'hualink-route-travelled',
        type: 'line',
        source: 'hualink-route-progress',
        filter: ['==', ['get', 'kind'], 'travelled'],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#DC2626',
          'line-width': 4,
          'line-opacity': 1,
        },
      });
    }

    // --- Markers -------------------------------------------------------
    if (!originMarkerRef.current) {
      originMarkerRef.current = new mapboxgl.Marker({
        element: createMarkerElement('origin', 'hub', 'Dispatch Hub'),
        anchor: 'center',
      })
        .setLngLat(route.origin.coordinates)
        .addTo(map);
    }

    if (!destinationMarkerRef.current) {
      destinationMarkerRef.current = new mapboxgl.Marker({
        element: createMarkerElement('destination', 'pin', 'Drop-off'),
        anchor: 'center',
      })
        .setLngLat(route.destination.coordinates)
        .addTo(map);
    }

    if (!truckMarkerRef.current) {
      const truckPosition = pointAlongRoute(waypoints, resolvedProgress);

      truckMarkerRef.current = new mapboxgl.Marker({
        element: createMarkerElement('truck', 'truck', stageLabel),
        anchor: 'center',
      })
        .setLngLat(truckPosition || route.origin.coordinates)
        .addTo(map);

      // A popup that follows the truck with the live shipment details.
      truckPopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 26,
        className: 'hualink-map-popup',
      })
        .setLngLat(truckPosition || route.origin.coordinates)
        .setHTML(popupMarkup(route, stageLabel, resolvedProgress))
        .addTo(map);
    }

    // --- Viewport ------------------------------------------------------
    const bounds = new mapboxgl.LngLatBounds();
    waypoints.forEach(([lng, lat]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 70, maxZoom: 12, duration: 900 });

    return undefined;
  }, [mapReady, route, resolvedProgress, stageLabel]);

  /* ------------------------------------------------------------------ */
  /* Live progress updates                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const source = map.getSource('hualink-route-progress');
    if (source) {
      source.setData(buildProgressGeoJSON(route.waypoints, resolvedProgress));
    }

    const target = pointAlongRoute(route.waypoints, resolvedProgress);
    if (target && truckMarkerRef.current) {
      tweenMarker(truckMarkerRef.current, target);

      // Keep the label under the truck in sync with the new stage.
      const label = truckMarkerRef.current
        .getElement()
        .querySelector('.hualink-marker__label');
      if (label) label.textContent = stageLabel;

      // ... and the popup that follows it.
      if (truckPopupRef.current) {
        truckPopupRef.current
          .setLngLat(target)
          .setHTML(popupMarkup(route, stageLabel, resolvedProgress));
      }
    }
  }, [mapReady, resolvedProgress, route, stageLabel]);

  /* ------------------------------------------------------------------ */
  /* Static fallback                                                     */
  /* ------------------------------------------------------------------ */
  const fallback = !tokenAvailable || Boolean(mapError);

  const fallbackGeometry = useMemo(() => {
    if (!fallback) return null;

    const width = 640;
    const height = 320;
    const padding = 48;

    const project = createProjector(route.waypoints, width, height, padding);

    const toPath = (coords) =>
      coords
        .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
        .join(' ');

    const points = project(route.waypoints);
    const travelled = project(travelledSlice(route.waypoints, resolvedProgress));
    const remaining = project(remainingSlice(route.waypoints, resolvedProgress));

    const truckPoint = pointAlongRoute(route.waypoints, resolvedProgress);
    const truck = truckPoint ? project([truckPoint])[0] : points[0];

    return {
      width,
      height,
      route: toPath(points),
      travelled: toPath(travelled),
      remaining: toPath(remaining),
      origin: points[0],
      destination: points[points.length - 1],
      truck,
    };
  }, [fallback, route, resolvedProgress]);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 ${className}`}>
      {/* The Mapbox canvas */}
      <div
        ref={containerRef}
        className="hualink-map w-full"
        style={{ height }}
        aria-label="Live delivery route map"
      />

      {/* Static preview when the map cannot be loaded */}
      {fallback ? (
        <div
          className="absolute inset-0 flex flex-col bg-slate-950"
          style={{ height }}
        >
          <svg
            viewBox={`0 0 ${fallbackGeometry?.width || 640} ${fallbackGeometry?.height || 320}`}
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Schematic delivery route"
          >
            <defs>
              <linearGradient id="hualink-route-fade" x1="0" x2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#hualink-route-fade)" />

            {/* Grid */}
            {Array.from({ length: 9 }).map((_, index) => (
              <line
                key={`h-${index}`}
                x1="0"
                x2="100%"
                y1={`${(index + 1) * 10}%`}
                y2={`${(index + 1) * 10}%`}
                stroke="#1E293B"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 13 }).map((_, index) => (
              <line
                key={`v-${index}`}
                x1={`${(index + 1) * 7.6}%`}
                x2={`${(index + 1) * 7.6}%`}
                y1="0"
                y2="100%"
                stroke="#1E293B"
                strokeWidth="1"
              />
            ))}

            {/* The corridor */}
            <path
              d={fallbackGeometry?.route}
              fill="none"
              stroke="#DC2626"
              strokeOpacity="0.22"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={fallbackGeometry?.remaining}
              fill="none"
              stroke="#94A3B8"
              strokeOpacity="0.55"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={fallbackGeometry?.travelled}
              fill="none"
              stroke="#DC2626"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Origin */}
            <circle
              cx={fallbackGeometry?.origin?.[0]}
              cy={fallbackGeometry?.origin?.[1]}
              r="9"
              fill="#DC2626"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />

            {/* Destination */}
            <circle
              cx={fallbackGeometry?.destination?.[0]}
              cy={fallbackGeometry?.destination?.[1]}
              r="9"
              fill="#0F172A"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />

            {/* Truck */}
            <circle
              cx={fallbackGeometry?.truck?.[0]}
              cy={fallbackGeometry?.truck?.[1]}
              r="11"
              fill="#E50914"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-sm text-center bg-slate-950/85 backdrop-blur-sm border border-slate-700/70 rounded-2xl px-5 py-4">
              <span className="inline-flex h-9 w-9 rounded-xl bg-amber-500/15 text-amber-400 items-center justify-center">
                <AlertTriangle size={17} />
              </span>
              <p className="text-xs font-black text-white mt-2.5">
                {tokenAvailable ? 'Live map unavailable' : 'Live map not configured'}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1 leading-relaxed">
                {tokenAvailable
                  ? mapError
                  : 'Add VITE_MAPBOX_ACCESS_TOKEN to .env to enable the interactive Mapbox view.'}
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-2">
                Showing the route schematic · {route.label}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Loading veil */}
      {!fallback && !mapReady ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          style={{ height }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-300">
            <Loader2 size={16} className="animate-spin text-red-500" />
            Loading the live route...
          </span>
        </div>
      ) : null}

      {/* Legend / status overlay */}
      {showLegend ? (
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              {route.origin.city}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20" />
              {stageLabel}
            </span>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-200">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900 ring-2 ring-white/70" />
              {route.destination.city}
            </span>

            <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
              <Radio size={10} className={mapReady ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
              {mapReady ? 'Live' : 'Connecting'} · {distanceKm} km
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
