/*
|--------------------------------------------------------------------------
| Offline SOS Alert Queue
|--------------------------------------------------------------------------
| Emergency alerts are created locally first (status Pending) and only move
| to Sent when the server accepts them, to Delivered when a human confirms
| help was reached, or to Failed when transmission is impossible.
|
| Never call an unconfirmed alert "sent" - a queued alert stays Pending or
| Failed until a channel actually delivers it.
*/

import {
  getItem,
  setItem,
  removeItem,
  listByPrefix
} from './offlineStore';

const alertKey = localId => `sos:alert:${localId}`;

export const newLocalId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `sos-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const isOnline = () => {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine !== false;
};

export const createQueuedAlert = async (payload) => {
  const alert = {
    localId: newLocalId(),
    status: 'Pending',
    serverId: null,
    attempts: 0,
    failedReason: null,
    acknowledgedAt: null,
    createdAt: new Date().toISOString(),
    ...payload
  };

  await setItem(alertKey(alert.localId), alert);

  return alert;
};

export const listQueuedAlerts = async () => {
  const entries = await listByPrefix('sos:alert:');

  return entries
    .map((entry) => entry.value)
    .filter(Boolean)
    .sort((a, b) =>
      String(b.createdAt).localeCompare(String(a.createdAt))
    );
};

export const updateQueuedAlert = async (localId, patch) => {
  const current = await getItem(alertKey(localId));

  if (!current) {
    return null;
  }

  const updated = { ...current, ...patch };

  await setItem(alertKey(localId), updated);

  return updated;
};

export const removeQueuedAlert = async localId =>
  removeItem(alertKey(localId));

/*
|--------------------------------------------------------------------------
| Transmit pending alerts to the server.
|--------------------------------------------------------------------------
| Returns the updated alert list. Alerts that could not be transmitted stay
| queued locally with status Failed and a reason.
*/

export const flushQueuedAlerts = async (getAuthHeader) => {
  const alerts = await listQueuedAlerts();
  const transmitable = alerts.filter(
    (alert) => alert.status === 'Pending' || alert.status === 'Failed'
  );

  if (transmitable.length === 0) {
    return alerts;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(getAuthHeader ? getAuthHeader() : {})
  };

  await Promise.all(
    transmitable.map(async (alert) => {
      try {
        const response = await fetch('/api/sos', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            trip_id: alert.tripId ?? null,
            lat: alert.lat,
            lng: alert.lng,
            accuracy: alert.accuracy ?? null,
            message: alert.message ?? null
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || `SOS failed (${response.status})`
          );
        }

        const serverAlert = data?.data?.alert;

        await updateQueuedAlert(alert.localId, {
          status: 'Sent',
          serverId: serverAlert?.id ?? null,
          attempts: alert.attempts + 1,
          failedReason: null
        });
      } catch (err) {
        await updateQueuedAlert(alert.localId, {
          status: 'Failed',
          attempts: alert.attempts + 1,
          failedReason:
            err?.message ||
            'No connection available. Alert is queued locally.'
        });
      }
    })
  );

  return listQueuedAlerts();
};

/*
|--------------------------------------------------------------------------
| Merge device-local alerts with the server truth.
|--------------------------------------------------------------------------
| Server-side status wins for alerts that reached the server, so an alert
| acknowledged from elsewhere still shows Delivered locally.
*/

export const mergeServerStatus = (localAlerts, serverAlerts) => {
  const serverById = new Map();

  (serverAlerts || []).forEach((alert) => {
    serverById.set(alert.id, alert);
  });

  return localAlerts.map((local) => {
    if (local.serverId === null || local.serverId === undefined) {
      return local;
    }

    const server = serverById.get(local.serverId);

    if (!server) {
      return local;
    }

    return {
      ...local,
      status: server.status || local.status,
      acknowledgedAt: server.acknowledged_at || local.acknowledgedAt
    };
  });
};