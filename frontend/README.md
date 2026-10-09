# Touristo Frontend

React frontend for the Touristo marketplace.

## Stack

* React 19 + Vite
* React Router
* Tailwind CSS
* lucide-react icons
* JavaScript / JSX (no TypeScript)

## Scripts

```text
npm run dev       start the Vite dev server
npm run build     production build
npm run preview   preview the production build
npm run lint      eslint
```

## Configuration

`VITE_API_URL` (optional, `frontend/.env`):

* When set, `src/api/client.js` prefixes all API requests with this base URL (for split deployments).
* When unset, requests use relative `/api/...` paths, which the Vite dev server proxies to `http://localhost:3000` (see `vite.config.js`).

> Never prefix AI keys (or any secret) with `VITE_` — Vite embeds `VITE_*` values in the public bundle. All Gemini/OpenAI calls happen on the server.

## API access

All network calls go through the shared client at `src/api/client.js`:

* prefixes `VITE_API_URL`
* attaches the `Bearer` token from local storage
* throws a typed `ApiError` carrying `status` and a user-safe `message`
* broadcasts a `touristo:unauthorized` event on 401 so auth state is cleared exactly once

## Backend

The Express API lives at the repository root (`index.js`, code in `touristo/`). For local development run `node index.js` from the repo root so the dev proxy has something on `:3000`.
