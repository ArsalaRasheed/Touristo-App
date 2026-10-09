/**
 * Shared API client.
 *
 * - Prefixes requests with VITE_API_URL when configured (split deployments).
 *   When unset, relative `/api/...` paths are used, which work with the
 *   Vite dev proxy and the Vercel `/api/*` rewrite.
 * - Attaches the Bearer token from auth state.
 * - Normalises error handling: every failure throws an ApiError carrying
 *   `status` and a user-safe `message`.
 * - Broadcasts `touristo:unauthorized` on 401 so the auth layer can
 *   end the session exactly once. 403 means "logged in but not allowed"
 *   and is surfaced to the caller instead.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const TOKEN_KEY = 'touristo_token';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const notifyUnauthorized = (status) => {
  if (status === 401) {
    window.dispatchEvent(new CustomEvent('touristo:unauthorized'));
  }
};

/**
 * @param {string} path  e.g. '/api/bookings/user/1'
 * @param {object} options
 * @param {string} [options.method]
 * @param {any}    [options.body]       JSON-serialised automatically
 * @param {boolean}[options.auth=true]  attach the Bearer token
 * @param {boolean}[options.silent401=false] suppress the unauthorized broadcast
 * @param {HeadersInit}[options.headers]
 */
export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    auth = true,
    silent401 = false,
    headers = {},
    ...rest
  } = options;

  const finalHeaders = {
    ...(auth ? authHeaders() : {}),
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      ...rest,
    });
  } catch {
    throw new ApiError('Network error. Please check your connection.', 0, null);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (!silent401) notifyUnauthorized(response.status);

    const message =
      (payload && (payload.message || payload.error)) ||
      `Request failed (${response.status})`;

    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export default apiFetch;
