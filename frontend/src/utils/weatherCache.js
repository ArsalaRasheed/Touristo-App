/*
|--------------------------------------------------------------------------
| Offline weather cache
|--------------------------------------------------------------------------
| Stores the last downloaded forecast snapshot per trip so it can be shown
| offline with its freshness timestamp. Cached weather is never presented
| as live - stale snapshots are labelled "Outdated - reconnect to refresh".
*/

import {
  getItem,
  setItem,
  removeItem
} from './offlineStore';

export const WEATHER_STALE_MS = 2 * 60 * 60 * 1000; // 2 hours

const weatherKey = tripId => `weather:trip:${tripId}`;

export const saveWeatherSnapshot = async (tripId, snapshot) => {
  await setItem(weatherKey(tripId), {
    ...snapshot,
    savedAt: Date.now()
  });

  return getItem(weatherKey(tripId));
};

export const getWeatherSnapshot = tripId => getItem(weatherKey(tripId));

export const removeWeatherSnapshot = tripId =>
  removeItem(weatherKey(tripId));

export const isSnapshotStale = (savedAt, ttlMs = WEATHER_STALE_MS) => {
  if (!savedAt) {
    return true;
  }

  return Date.now() - Number(savedAt) > ttlMs;
};