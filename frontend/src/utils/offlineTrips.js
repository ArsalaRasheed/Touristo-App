/*
|--------------------------------------------------------------------------
| Offline Trip Vault
|--------------------------------------------------------------------------
| Stores a compact snapshot of a trip (booking, itinerary, weather and
| emergency contacts) locally so the traveler can review it without an
| internet connection. One record per trip under the `vault:trip:` prefix.
*/

import {
  getItem,
  setItem,
  removeItem,
  listByPrefix
} from './offlineStore';

const vaultKey = tripId => `vault:trip:${tripId}`;

export const PRESET_EMERGENCY_CONTACTS = [
  { name: 'Police', number: '15' },
  { name: 'Ambulance', number: '115' },
  { name: 'Fire Department', number: '115' },
  { name: "Women's Helpline", number: '1043' },
  { name: 'Child Protection', number: '1056' },
  { name: 'Tourist Police', number: '1222' }
];

export const PRESET_SAFETY_TIPS = [
  'Always inform someone about your travel plans',
  'Carry identification and emergency contacts',
  'Stay aware of your surroundings',
  'Respect local customs and regulations',
  'Keep important documents in a safe place'
];

export const saveTripVault = async (snapshot) => {
  const record = {
    ...snapshot,
    downloadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emergencyContacts: snapshot.emergencyContacts || PRESET_EMERGENCY_CONTACTS
  };

  await setItem(vaultKey(snapshot.tripId), record);
  return record;
};

export const getTripVault = async tripId => getItem(vaultKey(tripId));

export const listTripVaults = async () => {
  const entries = await listByPrefix('vault:trip:');

  return entries
    .map((entry) => entry.value)
    .filter(Boolean)
    .sort((a, b) =>
      String(b.updatedAt).localeCompare(String(a.updatedAt))
    );
};

export const removeTripVault = async tripId => removeItem(vaultKey(tripId));

export const isTripDownloaded = async tripId =>
  Boolean(await getTripVault(tripId));