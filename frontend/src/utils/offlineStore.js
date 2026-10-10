/*
|--------------------------------------------------------------------------
| Offline storage
|--------------------------------------------------------------------------
| Small promise-based key/value store backed by IndexedDB, with an
| automatic localStorage fallback when IndexedDB is unavailable.
|
| Used by the Offline Trip Vault, trip tracking, SOS alert queue and
| cached weather snapshots. Keys are namespaced so lists can be scanned
| by prefix (e.g. 'vault:trip:'). Values are JSON-serializable.
*/

const DB_NAME = 'touristo-offline';
const STORE_NAME = 'kv';
const LS_PREFIX = 'touristo-offline:';

let dbPromise = null;

const getDB = () => {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
};

const withStore = async (mode, work) => {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const result = work(store);

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
  });
};

const memoryFallback = {
  get(key) {
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      return raw ? JSON.parse(raw).value : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify({ value }));
    } catch {
      // Storage full or unavailable - ignore for offline cache.
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(LS_PREFIX + key);
    } catch {
      // Ignore.
    }
  },

  list(prefix) {
    const entries = [];

    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);

        if (!key || !key.startsWith(LS_PREFIX + prefix)) {
          continue;
        }

        const shortKey = key.slice(LS_PREFIX.length);

        try {
          const raw = localStorage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : null;
          entries.push({ key: shortKey, value: parsed?.value ?? null });
        } catch {
          // Skip corrupt entries.
        }
      }
    } catch {
      // Ignore.
    }

    return entries;
  }
};

const idbSupported = () => {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
};

export const getItem = async (key) => {
  if (!idbSupported()) {
    return memoryFallback.get(key);
  }

  try {
    return await withStore('readonly', (store) => {
      const request = store.get(key);
      return request.result?.value ?? null;
    });
  } catch {
    return memoryFallback.get(key);
  }
};

export const setItem = async (key, value) => {
  if (!idbSupported()) {
    memoryFallback.set(key, value);
    return;
  }

  try {
    await withStore('readwrite', (store) => {
      store.put({ key, value, updatedAt: Date.now() });
      return null;
    });
  } catch {
    memoryFallback.set(key, value);
  }
};

export const removeItem = async (key) => {
  if (!idbSupported()) {
    memoryFallback.remove(key);
    return;
  }

  try {
    await withStore('readwrite', (store) => {
      store.delete(key);
      return null;
    });
  } catch {
    memoryFallback.remove(key);
  }
};

export const listByPrefix = async (prefix) => {
  if (!idbSupported()) {
    return memoryFallback.list(prefix);
  }

  try {
    return await withStore('readonly', (store) => {
      const request = store.getAll();
      return (request.result || [])
        .filter((entry) => entry.key.startsWith(prefix))
        .map((entry) => ({ key: entry.key, value: entry.value }));
    });
  } catch {
    return memoryFallback.list(prefix);
  }
};

export default {
  getItem,
  setItem,
  removeItem,
  listByPrefix
};