/*
|--------------------------------------------------------------------------
| GPS Trip Tracker
|--------------------------------------------------------------------------
| Records the traveler's route locally while a trip is active. Uses
| navigator.geolocation.watchPosition and persists points under the
| `track:` prefix so the route and last known position survive offline.
|
| GPS only captures coordinates - it never transmits anything. Delivering
| a route or location still requires a connection or another channel.
*/

import {
  getItem,
  setItem,
  removeItem
} from './offlineStore';

const trackMetaKey = tripId => `track:${tripId}`;
const trackRouteKey = tripId => `track:route:${tripId}`;

const MAX_ROUTE_POINTS = 5000;

const handles = new Map();

const haversineKm = (a, b) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

export const getTrackMeta = async tripId => getItem(trackMetaKey(tripId));

export const getRoutePoints = async tripId => {
  const points = await getItem(trackRouteKey(tripId));
  return Array.isArray(points) ? points : [];
};

export const getRouteDistanceKm = async tripId => {
  const points = await getRoutePoints(tripId);

  if (points.length < 2) {
    return 0;
  }

  let distance = 0;

  for (let i = 1; i < points.length; i += 1) {
    distance += haversineKm(points[i - 1], points[i]);
  }

  return distance;
};

export const isTrackingLocally = tripId => handles.has(tripId);

const appendPoint = async (tripId, point) => {
  const points = await getRoutePoints(tripId);

  points.push(point);

  if (points.length > MAX_ROUTE_POINTS) {
    points.shift();
  }

  const meta = await getTrackMeta(tripId) || {
    tripId,
    startedAt: new Date().toISOString()
  };

  await setItem(trackRouteKey(tripId), points);
  await setItem('gps:last', {
    ...point,
    tripId
  });
  await setItem(trackMetaKey(tripId), {
    ...meta,
    status: 'tracking',
    points: points.length,
    lastPoint: point,
    updatedAt: new Date().toISOString()
  });
};

export const startTracking = async (tripId) => {
  if (handles.has(tripId)) {
    return getTrackMeta(tripId);
  }

  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser.');
  }

  await setItem(trackMetaKey(tripId), {
    tripId,
    status: 'tracking',
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    points: 0
  });

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      appendPoint(tripId, {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy ?? null,
        speed: position.coords.speed ?? null,
        at: new Date().toISOString()
      });
    },
    () => {
      // Location unavailable or denied. We keep the last known position.
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 25000
    }
  );

  handles.set(tripId, watchId);

  return getTrackMeta(tripId);
};

export const stopTracking = async (tripId) => {
  const watchId = handles.get(tripId);

  if (watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
    handles.delete(tripId);
  }

  const meta = await getTrackMeta(tripId);

  if (!meta) {
    return null;
  }

  const updated = {
    ...meta,
    status: 'stopped',
    updatedAt: new Date().toISOString()
  };

  await setItem(trackMetaKey(tripId), updated);

  return updated;
};

export const clearRoute = async (tripId) => {
  await removeItem(trackRouteKey(tripId));

  const meta = await getTrackMeta(tripId);

  if (meta) {
    await setItem(trackMetaKey(tripId), {
      ...meta,
      points: 0,
      lastPoint: null,
      updatedAt: new Date().toISOString()
    });
  }
};

export const getLastKnownPosition = async () => getItem('gps:last');