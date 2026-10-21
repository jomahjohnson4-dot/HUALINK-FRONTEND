/**
 * Delivery corridors, hubs and route maths.
 *
 * Hualink moves wholesale freight out of the Dar es Salaam central hub into
 * the regional depots, so every tracked order is a journey along one of the
 * corridors below. The coordinates follow the real road network closely
 * enough for the map to read as the actual route (Dar es Salaam → Morogoro →
 * Iringa → Mbeya), and the shipment progress is derived from the order status
 * the backend already stores.
 */

/** The distribution hubs Hualink dispatches from and delivers to. */
export const HUBS = {
  darEsSalaam: {
    id: 'dar-es-salaam',
    name: 'Hualink Central Hub',
    city: 'Dar es Salaam',
    coordinates: [-6.7924, 39.2083],
    role: 'Dispatch Hub',
  },
  darEsSalaamPort: {
    id: 'dar-es-salaam-port',
    name: 'Dar es Salaam Port Terminal',
    city: 'Dar es Salaam',
    coordinates: [-6.82, 39.29],
    role: 'Port Gateway',
  },
  mbeya: {
    id: 'mbeya',
    name: 'Mbeya Regional Warehouse',
    city: 'Mbeya',
    coordinates: [-8.902, 33.453],
    role: 'Regional Depot',
  },
  iringa: {
    id: 'iringa',
    name: 'Iringa Transit Depot',
    city: 'Iringa',
    coordinates: [-7.6689, 35.27],
    role: 'Transit Depot',
  },
  morogoro: {
    id: 'morogoro',
    name: 'Morogoro Transit Depot',
    city: 'Morogoro',
    coordinates: [-6.7667, 37.6333],
    role: 'Transit Depot',
  },
  arusha: {
    id: 'arusha',
    name: 'Arusha Regional Warehouse',
    city: 'Arusha',
    coordinates: [-3.3869, 36.683],
    role: 'Regional Depot',
  },
  dodoma: {
    id: 'dodoma',
    name: 'Dodoma Regional Warehouse',
    city: 'Dodoma',
    coordinates: [-6.163, 35.7516],
    role: 'Regional Depot',
  },
  mwanza: {
    id: 'mwanza',
    name: 'Mwanza Regional Warehouse',
    city: 'Mwanza',
    coordinates: [-2.5167, 32.9],
    role: 'Regional Depot',
  },
  tanga: {
    id: 'tanga',
    name: 'Tanga Regional Warehouse',
    city: 'Tanga',
    coordinates: [-5.0692, 39.1083],
    role: 'Regional Depot',
  },
  zanzibar: {
    id: 'zanzibar',
    name: 'Zanzibar City Depot',
    city: 'Zanzibar',
    coordinates: [-6.1659, 39.2026],
    role: 'Regional Depot',
  },
  darLocal: {
    id: 'dar-local',
    name: 'Customer Drop-off — Dar es Salaam',
    city: 'Dar es Salaam',
    coordinates: [-6.7, 39.3],
    role: 'Customer Drop-off',
  },
};

/**
 * The corridors Hualink runs. Every route starts at the Dar es Salaam hub
 * and follows the road network to its destination.
 */
export const ROUTES = {
  mbeya: {
    id: 'dar-mbeya',
    label: 'Dar es Salaam → Mbeya',
    origin: HUBS.darEsSalaam,
    destination: HUBS.mbeya,
    stops: ['Morogoro', 'Iringa'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.82, 39.29],
      [-6.79, 38.95],
      [-6.7667, 37.6333],
      [-7.1, 36.4],
      [-7.6689, 35.27],
      [-8.2, 34.2],
      [-8.902, 33.453],
    ],
  },
  iringa: {
    id: 'dar-iringa',
    label: 'Dar es Salaam → Iringa',
    origin: HUBS.darEsSalaam,
    destination: HUBS.iringa,
    stops: ['Morogoro'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.82, 39.29],
      [-6.79, 38.95],
      [-6.7667, 37.6333],
      [-7.1, 36.4],
      [-7.6689, 35.27],
    ],
  },
  morogoro: {
    id: 'dar-morogoro',
    label: 'Dar es Salaam → Morogoro',
    origin: HUBS.darEsSalaam,
    destination: HUBS.morogoro,
    stops: ['Chalinze'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.82, 39.29],
      [-6.79, 38.95],
      [-6.7667, 37.6333],
    ],
  },
  arusha: {
    id: 'dar-arusha',
    label: 'Dar es Salaam → Arusha',
    origin: HUBS.darEsSalaam,
    destination: HUBS.arusha,
    stops: ['Chalinze', 'Morogoro', 'Kilosa', 'Mount Kilimanjaro'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.82, 39.29],
      [-6.7, 39.0],
      [-6.3, 38.5],
      [-5.5, 37.5],
      [-4.5, 36.9],
      [-3.9, 36.7],
      [-3.3869, 36.683],
    ],
  },
  dodoma: {
    id: 'dar-dodoma',
    label: 'Dar es Salaam → Dodoma',
    origin: HUBS.darEsSalaam,
    destination: HUBS.dodoma,
    stops: ['Chalinze', 'Morogoro', 'Kilosa'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.82, 39.29],
      [-6.7, 39.0],
      [-6.5, 38.0],
      [-6.2, 36.8],
      [-6.163, 35.7516],
    ],
  },
  mwanza: {
    id: 'dar-mwanza',
    label: 'Dar es Salaam → Mwanza',
    origin: HUBS.darEsSalaam,
    destination: HUBS.mwanza,
    stops: ['Morogoro', 'Iringa', 'Sumbawanga', 'Mpanda'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.82, 39.29],
      [-6.5, 38.2],
      [-5.5, 37.0],
      [-4.5, 35.5],
      [-3.5, 34.0],
      [-2.5167, 32.9],
    ],
  },
  tanga: {
    id: 'dar-tanga',
    label: 'Dar es Salaam → Tanga',
    origin: HUBS.darEsSalaam,
    destination: HUBS.tanga,
    stops: ['Chalinze', 'Bagamoyo'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.65, 39.1],
      [-6.2, 39.05],
      [-5.7, 39.05],
      [-5.0692, 39.1083],
    ],
  },
  zanzibar: {
    id: 'dar-zanzibar',
    label: 'Dar es Salaam → Zanzibar',
    origin: HUBS.darEsSalaam,
    destination: HUBS.zanzibar,
    stops: ['Dar es Salaam Port', 'Mafia Channel'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.82, 39.29],
      [-6.6, 39.3],
      [-6.4, 39.3],
      [-6.1659, 39.2026],
    ],
  },
  local: {
    id: 'dar-local',
    label: 'Dar es Salaam → Customer Drop-off',
    origin: HUBS.darEsSalaam,
    destination: HUBS.darLocal,
    stops: ['Kivukoni', 'Kinondoni'],
    waypoints: [
      [-6.7924, 39.2083],
      [-6.75, 39.25],
      [-6.7, 39.3],
    ],
  },
};

/**
 * Picks the corridor that matches an order's delivery region.
 *
 * @param {object} order
 * @returns {object} one of the ROUTES entries
 */
export const resolveRouteForOrder = (order) => {
  const haystack = `${order?.region || ''} ${order?.shippingAddress || ''} ${
    order?.location || ''
  }`.toLowerCase();

  if (haystack.includes('mbeya')) return ROUTES.mbeya;
  if (haystack.includes('iringa')) return ROUTES.iringa;
  if (haystack.includes('morogoro')) return ROUTES.morogoro;
  if (haystack.includes('arusha')) return ROUTES.arusha;
  if (haystack.includes('dodoma')) return ROUTES.dodoma;
  if (haystack.includes('mwanza')) return ROUTES.mwanza;
  if (haystack.includes('tanga')) return ROUTES.tanga;
  if (haystack.includes('zanzibar')) return ROUTES.zanzibar;

  // A Dar es Salaam drop-off stays inside the city, everything else follows
  // the flagship Mbeya corridor.
  if (haystack.includes('dar es salaam') || haystack.includes('dar')) {
    return ROUTES.local;
  }

  return ROUTES.mbeya;
};

/**
 * The intermediate stops a shipment passes through on a corridor.
 *
 * @param {object} route
 * @returns {string} e.g. "Morogoro / Iringa"
 */
export const corridorStops = (route) =>
  (route?.stops || []).filter(Boolean).join(' / ');

/**
 * The human readable stage a status maps onto.
 *
 * @param {string} status
 * @returns {string}
 */
export const stageLabelFor = (status) => {
  const key = String(status || 'PENDING').toUpperCase();
  return STATUS_LABELS[key] || key.replace(/_/g, ' ');
};

/**
 * The Tailwind classes for the status badge used across the tracking views.
 *
 * @param {string} status
 * @returns {string}
 */
export const statusTone = (status) => {
  switch (String(status || '').toUpperCase()) {
    case 'DELIVERED':
    case 'PAID':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    case 'OUT_FOR_DELIVERY':
    case 'IN TRANSIT':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'SHIPPED':
    case 'DISPATCHED':
      return 'bg-indigo-50 text-indigo-600 border-indigo-200';
    case 'CANCELLED':
    case 'FAILED':
      return 'bg-rose-50 text-rose-600 border-rose-200';
    default:
      return 'bg-amber-50 text-amber-600 border-amber-200';
  }
};

/**
 * The Tailwind classes for the active-step pill in the timeline.
 *
 * @param {number} step
 * @returns {string}
 */
export const stepTone = (step) => {
  switch (step) {
    case 2:
      return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    case 3:
      return 'bg-blue-50 text-blue-600 border-blue-100';
    case 4:
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    default:
      return 'bg-amber-50 text-amber-600 border-amber-100';
  }
};

/**
 * How far along its corridor a shipment is, per lifecycle stage.
 *
 * The values are a share of the total route length (0 → 1).
 */
export const STATUS_PROGRESS = {
  PENDING: 0,
  CONFIRMED: 0.04,
  PROCESSING: 0.14,
  SHIPPED: 0.42,
  OUT_FOR_DELIVERY: 0.78,
  DELIVERED: 1,
  PAID: 1,
  CANCELLED: 0,
  FAILED: 0,
};

/**
 * The stage a status maps onto (1 → 4), matching the tracking timeline.
 */
export const STATUS_STEP = {
  PENDING: 1,
  CONFIRMED: 1,
  PROCESSING: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  PAID: 4,
  CANCELLED: 1,
  FAILED: 1,
};

/** The human readable stage labels used by the timeline. */
export const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  SHIPPED: 'Dispatched',
  OUT_FOR_DELIVERY: 'In Transit',
  DELIVERED: 'Delivered',
  PAID: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Cancelled',
};

/**
 * The share of the corridor a shipment has covered for a given status.
 *
 * @param {string} status
 * @returns {number} a value between 0 and 1
 */
export const statusProgress = (status) => {
  const key = String(status || 'PENDING').toUpperCase();
  return STATUS_PROGRESS[key] ?? 0;
};

/** The great-circle distance between two [lng, lat] pairs, in kilometres. */
const haversine = ([lng1, lat1], [lng2, lat2]) => {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
};

/**
 * The total length of a corridor, in kilometres.
 */
export const routeDistance = (waypoints = []) => {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    total += haversine(waypoints[i], waypoints[i + 1]);
  }
  return total;
};

/**
 * The point sitting at `t` (0 → 1) of the waypoint chain.
 *
 * The interpolation follows the real distance along the road, so the truck
 * marker never cuts across the country on a straight line.
 *
 * @param {Array<[number, number]>} waypoints
 * @param {number} t
 * @returns {[number, number]|null}
 */
export const pointAlongRoute = (waypoints = [], t) => {
  if (!waypoints.length) return null;
  if (waypoints.length === 1) return waypoints[0];

  const clamped = Math.min(Math.max(Number(t) || 0, 0), 1);

  const segments = [];
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const distance = haversine(waypoints[i], waypoints[i + 1]);
    segments.push(distance);
    total += distance;
  }

  if (total === 0) return waypoints[0];

  let remaining = clamped * total;
  for (let i = 0; i < segments.length; i += 1) {
    if (remaining <= segments[i]) {
      const ratio = segments[i] === 0 ? 0 : remaining / segments[i];
      return [
        waypoints[i][0] + (waypoints[i + 1][0] - waypoints[i][0]) * ratio,
        waypoints[i][1] + (waypoints[i + 1][1] - waypoints[i][1]) * ratio,
      ];
    }
    remaining -= segments[i];
  }

  return waypoints[waypoints.length - 1];
};

/**
 * The part of the corridor that has already been covered.
 *
 * @param {Array<[number, number]>} waypoints
 * @param {number} t
 * @returns {Array<[number, number]>} the travelled waypoints
 */
export const travelledSlice = (waypoints = [], t) => {
  if (!waypoints.length) return [];
  const clamped = Math.min(Math.max(Number(t) || 0, 0), 1);
  if (clamped <= 0) return [];

  const point = pointAlongRoute(waypoints, clamped);
  if (!point) return [];

  const travelled = [waypoints[0]];
  let total = 0;
  const segments = [];
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const distance = haversine(waypoints[i], waypoints[i + 1]);
    segments.push(distance);
    total += distance;
  }

  let remaining = clamped * total;
  for (let i = 0; i < segments.length; i += 1) {
    if (remaining <= segments[i]) {
      travelled.push(point);
      return travelled;
    }
    remaining -= segments[i];
    travelled.push(waypoints[i + 1]);
  }

  return waypoints;
};

/**
 * The remaining part of the corridor.
 */
export const remainingSlice = (waypoints = [], t) => {
  if (!waypoints.length) return [];
  const clamped = Math.min(Math.max(Number(t) || 0, 0), 1);
  if (clamped >= 1) return [];

  const point = pointAlongRoute(waypoints, clamped);
  if (!point) return [];

  const remaining = [point];
  let total = 0;
  const segments = [];
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const distance = haversine(waypoints[i], waypoints[i + 1]);
    segments.push(distance);
    total += distance;
  }

  let walked = clamped * total;
  for (let i = 0; i < segments.length; i += 1) {
    if (walked <= segments[i]) {
      for (let j = i + 1; j < waypoints.length; j += 1) remaining.push(waypoints[j]);
      return remaining;
    }
    walked -= segments[i];
  }

  return remaining;
};

/**
 * Builds the GeoJSON feature collection for a corridor.
 */
export const buildRouteGeoJSON = (waypoints = []) => ({
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: waypoints,
  },
});

/**
 * The GeoJSON feature collection for the covered / remaining split.
 */
export const buildProgressGeoJSON = (waypoints = [], t) => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { kind: 'travelled' },
      geometry: { type: 'LineString', coordinates: travelledSlice(waypoints, t) },
    },
    {
      type: 'Feature',
      properties: { kind: 'remaining' },
      geometry: { type: 'LineString', coordinates: remainingSlice(waypoints, t) },
    },
  ],
});
