# TOURISTO PRODUCTION GAP ANALYSIS

> **⚠️ POINT-IN-TIME BASELINE — 2026-10-06.** This document records the state of the repository on that date and is kept for history; it is **not** a description of the current code. Re-verify anything here against the code before acting on it.
>
> **Findings since fixed (verified against the code on 2026-10-08):**
> * **H1** (unauthenticated AI endpoints) — fixed: `POST /api/trip-planner` and `POST /api/tour-guides/recommend` now require `authenticateToken`, plus a dedicated AI rate limiter (`index.js`).
> * **C2** (unauthenticated `/api/users` reads/updates, `password_hash` leak) — fixed: all `/api/users` routes require auth; listing is admin-only; the security probes assert no hash leakage.
> * **C5** (tour-guide CRUD without ownership checks) — fixed: `loadGuideWithOwnershipCheck` enforces host ownership (403) on create/update/delete.
> * **C7** — not defined in this document (the CRITICAL list runs C1–C5). If a C7 was intended it was never recorded here; **H7** (open CORS) *is* addressed — an origin allowlist via `CORS_ORIGINS` now exists in `index.js` (it must be set in production).
> * **"Global error handler missing"** — fixed: a central error handler in `index.js` returns a safe message and logs details server-side.
> * **"No limiter on AI endpoints"** — fixed: `aiLimiter` (15/15 min) on the three AI routes plus a per-user limiter on `POST /api/packages/ai/generate`.
> * **"No API layer"** — fixed: `frontend/src/api/client.js` (shared fetch wrapper, `VITE_API_URL`, auth headers, 401 broadcast).
> * **"11 tables"** — now 12: `admin_audit_log` was added (`review_summaries` was already counted).
> * **"5 e2e checks"** — now 6 checks in `scripts/e2e-smoke.js` (2 admin checks run only when admin credentials are provided).
>
> **Still true from this baseline:** no notifications backend, no payment gateway, no password reset/email verification, schema migration only runs on local `node index.js` (never on Vercel), rate limits are in-memory, Travel Radar upgrade deferred, `GuideComparisonScreen` deleted and `utils/packageComparison.js` dead code.

**Date:** 2026-10-06
**Basis:** Direct inspection of the repository working tree (commit `14e648b` + uncommitted changes). Every conclusion below is grounded in a file reference. No assumptions from memory.

**Verification performed before this analysis:**
- `git status` / `git diff` reviewed (53 modified files, 11 untracked, 3 deletions).
- `npm run build` (frontend): **PASSES** (7.5s, largest chunk 227 kB gzip 72 kB).
- `npm run lint` (frontend): **FAILS — 74 problems (72 errors, 2 warnings)**.
- Backend `node index.js`: **starts, DB connects, `GET /api`-root health returns HTTP 200**.
- Existing test: `npm run test:e2e` → `scripts/e2e-smoke.js` only (5 checks, untracked).

**Uncommitted prior session state (preserved, not reverted):**
- `touristo/config/database.js` — adds `pool.on('error')`, per-client error listeners, and a correct `withTransaction()` helper. **Useful fix; keep.**
- `touristo/utils/schemaSetup.js` — adds `reports` table + 6 indexes incl. partial unique for open-report dedupe. **Keep.**
- New untracked backend: `adminController.js`, `reportController.js`, `travelRadarController.js`, `adminRoutes.js`, `reportRoutes.js`, `travelRadarRoutes.js`, `middleware/adminAuth.js`.
- New untracked frontend: `AdminDashboardScreen.jsx`, `MyReportsScreen.jsx`, `ReportDialog.jsx`, `TravelTrendRadar.jsx`, `scripts/e2e-smoke.js`.
- Deleted (unstaged, provably orphaned): `LiveMap.jsx`, `GuideComparisonScreen.jsx`, `TourGuideChat.jsx`, `App.css` — verified never imported in HEAD or working tree.

---

## SEVERITY LEGEND

`IMPLEMENTED` · `PARTIAL` · `MISSING` · `BROKEN` · `SECURITY RISK` · `ARCH RISK` · `DOC GAP` · `PERF GAP` · `TEST GAP` · `BLOCKER`

---

## 1. PRODUCT

| Area | Status | Evidence |
|---|---|---|
| Traveler signup/login + role routing | IMPLEMENTED | `LoginSignupScreen.jsx:160-393`, `App.jsx:133-175`, `AuthContext.jsx` |
| `/signup` route renders the **login** form | BROKEN | `LoginSignupScreen.jsx:122` `useState(true)`, never reads `pathname`; no inbound link to `/signup` |
| No authed-user redirect off `/`, `/login` | BROKEN | `SplashScreen.jsx:9` always → `/onboarding` → `/login` |
| 404 route unreachable | BROKEN | `App.jsx:685` renders `<Navigate to="/home">` inside the 404 JSX |
| Host signup (2-step user+host) | IMPLEMENTED | `LoginSignupScreen.jsx:258-363` |
| Destinations / packages / search | IMPLEMENTED | `destinationRoutes.js`, `packageRoutes.js`, `SearchScreen.jsx` |
| Booking flow | PARTIAL | `BookingScreen.jsx` posts to an **unauthenticated** API; no server-side price computation, no payment verification |
| My Trips | PARTIAL | `MyTripsScreen.jsx:148` calls `GET /api/itineraries/trip/:id` — **route does not exist → 404** |
| Messaging (traveler↔host) | IMPLEMENTED | `messageRoutes.js:22-76`, member checks at `messageController.js:137-166,236-292` |
| Reviews + AI review summaries | IMPLEMENTED | `reviewRoutes.js`, `reviewSummarizer.js` (ownership enforced `reviewController.js:203-272`) |
| Tour guides | PARTIAL | CRUD exists but **no ownership checks** (`tourGuideRoutes.js:95-179`) |
| Host discovery/profile | IMPLEMENTED | `HostDiscoveryScreen.jsx`, `HostProfileScreen.jsx` |
| Notifications | **MISSING (data)** | `NotificationsScreen.jsx:68` hardcoded `useState` array; **no `notifications` table**, no backend |
| Payments UI | **MISSING (real)** | `PaymentMethodsScreen.jsx` static cards; no `payments` table, no gateway, no webhook |
| Saved/wishlist packages | MISSING | No table; `PackageDetailScreen.jsx:47` local `useState`; `userController.js:32-34` returns `favorites = []` |
| Contact form | BROKEN | `ContactScreen.jsx:121-131` fake submit (`console.log` only) |
| Settings toggles not persisted | PARTIAL | `SettingsScreen.jsx:199-213` local state only |
| SOS | PARTIAL | `EmergencySOSScreen.jsx` geolocation + map link only; **offline/emergency data not persisted** |
| Weather | PARTIAL | Works (`weatherController.js`) but `WeatherScreen.jsx` has **19 duplicate React keys** (`:91-229`) |
| Travel Radar (YouTube) | IMPLEMENTED | `travelRadarController.js` (36 kB), `TravelTrendRadar.jsx`, 10-min cache `:1187-1210`. **Keep stable — do not expand (Phase 29 deferred by instruction).** |
| AI Trip Planner | PARTIAL | Works but **unauthenticated public Gemini endpoint** (`tripPlannerRoutes.js:6`) — cost sink |
| Admin dashboard | IMPLEMENTED (new, untracked) | `adminRoutes.js` (14 routes, all behind `requireAdmin`), `AdminDashboardScreen.jsx` (9 sections) |
| Reporting system | IMPLEMENTED (new, untracked) | `reports` table, `reportRoutes.js` (auth + burst/daily limiters), `ReportDialog.jsx`, `MyReportsScreen.jsx` |
| Host verification | PARTIAL | Columns exist (`hosts.verification_status`, `verified` — `schemaSetup.js:41-44`); admin can set status (`adminController.js:336-346`); **no documents upload, no status history, no request-changes state, no verified-badge gating beyond the boolean** |
| Bottom nav | VIOLATES SPEC | Traveler nav is Home/Search/AI Planner/**SOS**/Profile (`BottomNav.jsx:21-48`). **Spec requires Home/Search/AI Planner/My Trips/Profile — SOS must be removed from bottom nav.** Host nav has 5 items incl. Messages (spec: 4 incl. overflow). |
| Dead routes | DOC/UX GAP | `/weather`, `/company-reg` have no inbound navigation anywhere in `src` |
| Admin in BottomNav | MISSING | `BottomNav.jsx:78-81` has traveler/host only; admin falls through to traveler items |

---

## 2. BACKEND

| Area | Status | Evidence |
|---|---|---|
| Express 5 app, Vercel export | IMPLEMENTED | `index.js:80` `module.exports = app`, `api/index.js` |
| Route mounting | IMPLEMENTED | `index.js:44-61` (16 routers) |
| **Global error handler** | **MISSING** | Only a 404 catch-all (`index.js:72-77`); async throws fall through |
| Error messages leak internals | SECURITY RISK | `err.message` returned verbatim in ~25 sites: `userController.js:52,124,142,221,266,293`, `hostController.js:48,184,219,318,366`, `bookingController.js:19,38,78,103,187,215,243`, `reviewController.js:18,54,80,183,247,292`, `destinationController.js:22`, `weatherController.js:77`, `tourGuideRoutes.js:88,112,145,176` |
| Controllers/services split | PARTIAL | Controllers talk to models directly; only `adminController`/`reportController` are well-factored |
| Validation | **MISSING (layer)** | `express-validator` installed (`package.json:24`) but **imported nowhere**; validation is ad-hoc `if/return` |
| Rate limiting | PARTIAL | `authLimiter` on login only (`index.js:27,43`); global 300/15min; report limiters (`reportRoutes.js:29-39`). **No limiter on signup, booking writes, AI endpoints.** In-memory ⇒ ineffective on Vercel |
| Connection pooling | PARTIAL | Pool has **no `max`/`idleTimeoutMillis`/`connectionTimeoutMillis`/`statement_timeout`** (`database.js:22`); `connectDB()` acquires a client and **never releases it** (`database.js:38-46`) — permanently leases 1 of 10 slots |
| Transactions | PARTIAL | `withTransaction()` helper exists (`database.js:55-73`) but used in exactly **one** place (`adminController.js:447`); booking create and message send are non-atomic |
| CORS | SECURITY RISK | `cors()` wide open, no origin allowlist (`index.js:36`) |
| Security headers | IMPLEMENTED | `helmet()` (`index.js:35`) |
| SQL injection | **CLEAN** | All queries parameterized across controllers/models/utils — no string-concatenated SQL found |
| Dead module | ARCH RISK | `models/Message.js:1` requires non-existent `../config/db`; would throw if imported (currently orphaned) |
| Dead util | DOC GAP | `schemaUpdater.js` exported but never called |
| Schema runs only locally | **BLOCKER (prod)** | `setupSchema()`/`seedDatabase()` guarded by `require.main === module` (`index.js:91-106,126-128`) ⇒ **never runs on Vercel**; `CREATE TABLE IF NOT EXISTS` cannot add columns to existing tables (`schemaSetup.js:44-45,61-62,86-87,105,109` claim to "add" columns but are no-ops on old DBs) |
| Seeds on every boot with `password123` | SECURITY RISK | `seedData.js:15,234` shared bcrypt hash for 9 hosts + traveler; runs at every local boot |
| No first-admin bootstrap | ARCH RISK | `createUser` forces `role='traveler'` (`userController.js:151`); seed contains no admin ⇒ fresh deploy has no admin path |

---

## 3. DATABASE

**No migration system.** No `migrations/`, no `supabase/`, no `.sql` files, no version/checksum table. Schema evolution = re-running `setupSchema()` locally.

| Finding | Status | Evidence |
|---|---|---|
| 11 tables | IMPLEMENTED | `schemaSetup.js:20,33,54,72,97,115,126,137,155,178,231` |
| `reports` table + 6 indexes + partial unique | IMPLEMENTED | `schemaSetup.js:231-283` |
| `notifications` table | **MISSING** | no DDL anywhere |
| `payments` / `transactions` / `refunds` | **MISSING** | only `bookings.payment_status VARCHAR` (`schemaSetup.js:108`) with no CHECK |
| `favorites` / saved packages | **MISSING** | — |
| user preferences / Travel DNA | **MISSING** | — |
| host verification documents table | **MISSING** | only scalar columns on `hosts` |
| moderation/audit log | **MISSING** | only `reports.resolved_by/resolved_at/resolution_note` snapshot |
| CHECK constraints | PARTIAL | only 3 exist app-wide: `reviews.rating`, `reports.target_type`, `reports.status`. No CHECK on `bookings.status`/`payment_status`/`travelers`, `hosts.verification_status`, `users.role` |
| Foreign keys | PARTIAL | core FKs present; all `NO ACTION` (inconsistent — `tour_guides`/`marketplace_chats`/`reports` cascade) |
| Indexes | PARTIAL | reports/messages/chats good; **no index on `users.role`, `hosts.verification_status`, `hosts.user_id`, `bookings.status`, `destinations.name`** (case-insensitive lookups seq-scan, `destinationController.js:77`) |
| Duplicate reviews allowed | PARTIAL | no `UNIQUE(user_id, package_id)` on `reviews` (app-level duplicate gate only, `reviewController.js`) |
| Orphaned reports on package delete | ARCH RISK | `adminController.deletePackage` (`:447-475`) doesn't clean `reports.target_id` |
| **RLS** | **MISSING** | DB reached via raw `pg` TCP, not Supabase Data API ⇒ RLS would never be evaluated. No policies, no `supabase/` dir. **All authorization depends entirely on Express middleware.** |
| Supabase usage | PARTIAL | Storage REST API only, via service-role key, bucket **forced public** (`packageStorage.js:94-107,132-155`) |

---

## 4. SECURITY (route-by-route)

### CRITICAL — must fix before any production traffic

| # | Finding | Evidence |
|---|---|---|
| C1 | **`/api/bookings` is entirely unauthenticated** (all 7 endpoints, read+write). Returns `user_email`/`user_phone` on every listing. Client supplies `user_id`, `status`, `payment_status` — booking can be created pre-confirmed/pre-paid. | `bookingRoutes.js:6-24`, `bookingController.js:109-245`, `Booking.js:59-61,104-106` |
| C2 | **`/api/users` has no auth on `GET /:id`, `PUT /:id`, `DELETE /:id`.** `GET /:id` returns **`password_hash`** to unauthenticated callers; `GET /` lists all users. | `userRoutes.js:9-21`, `User.js:22`, `userController.js:14,39,227-296` |
| C3 | **Host PII public**: `GET /api/hosts*` exposes `license_number` + `cnic_or_business_registration` (national ID) unauthenticated. | `hostRoutes.js:7-16`, `Host.js:22,31,41` |
| C4 | **Privilege escalation**: `POST /api/hosts` takes `user_id` from the request body, not `req.user` ⇒ any authenticated user can bind/forge host profiles for arbitrary users. | `hostController.js:192-210` |
| C5 | **Tour-guide CRUD has no ownership checks** (authenticated but any user can PUT/DELETE any guide, create guides on any `host_id`). | `tourGuideRoutes.js:95-179` |

### HIGH

| # | Finding | Evidence |
|---|---|---|
| H1 | Unauthenticated public AI endpoints = open cost sinks + prompt-injection surface: `/api/trip-planner`, `/api/tour-guides/recommend` | `tripPlannerRoutes.js:6`, `tourGuideRoutes.js:60` |
| H2 | `GET /api/homepage-data?userId=N` unauthenticated ⇒ personalized data of arbitrary users | `generalRoutes.js:6`, `generalController.js:9` |
| H3 | Duplicate unauthenticated `GET /api/host/bookings/host/:hostId` (frontend uses the other path) | `hostBookingRoutes.js:6` |
| H4 | Token role trusted from JWT with **7-day expiry, no DB re-validation, no revocation** ⇒ role changes/deletions ineffective up to 7 days | `jwtUtils.js:5,11`, `adminAuth.js:39` |
| H5 | No admin bootstrap path; no email verification; no password reset; no account lockout (only IP-based login limiter 20/15min) | `userController.js:151`, `seedData.js` |
| H6 | Seeded demo accounts with known `password123` hashes ship with the repo and re-seed every boot | `seedData.js:15,234` |
| H7 | Open CORS (`cors()`) with no allowlist | `index.js:36` |
| H8 | Supabase storage bucket forced public; images world-listable/readable via service-role key | `packageStorage.js:94-107,132-155` |
| H9 | `~25 controllers return raw `err.message` (DB internals / upstream key errors leaked) | see §2 |
| H10 | Rate limits are in-memory and per-instance — no protection on Vercel | `index.js:27-28` |

### MEDIUM / LOW

- JWT stored in `localStorage` (XSS-exposed); no expiry check client-side (`AuthContext.jsx:29-58`).
- 401/403 handled only in `AdminDashboardScreen.jsx:232-241`; every other screen silently fails on expired tokens.
- No `security.txt`/CSP customization beyond helmet defaults; no HSTS control (helmet default handles it only under HTTPS).
- `vercel.json` rewrite `/api/:path* → /api/index.js` vs app at root `index.js` — works via shim, but the root health route and JSON 404 are unreachable in production (catch-all → `index.html`).
- `frontend/package-lock.json.bak` tracked; `frontend/node_modules_old/` stale dir present.

**No SQL injection found. No hardcoded frontend secrets found. `.env` correctly gitignored.**

---

## 5. FRONTEND

| Area | Status | Evidence |
|---|---|---|
| React 19 + Vite 8 + Tailwind, route table | IMPLEMENTED | `App.jsx` — 30 protected + 8 public routes |
| Protected routes / role guard | PARTIAL | `App.jsx:133-175` — client-side only (correctly so, but no deep-link `from` state; role checks are cosmetic — server must enforce) |
| **API layer** | **MISSING** | No axios/client module: **59 raw `fetch` calls across 27 files**, auth headers re-implemented 4× (`AuthContext.jsx:88`, `InboxScreen.jsx:98`, `ReviewManager.jsx:31`, inline literals) |
| **API base URL** | **BLOCKER (prod)** | All calls are relative `/api/...`; only the Vite dev proxy (`vite.config.js:9` → `localhost:3000`) works. **Zero `VITE_API_*` env usage** ⇒ production build breaks unless an external reverse proxy exists |
| Auth state | PARTIAL | `localStorage` token+user; no expiry/401 handling; `logout` wired only in `PrivacySecurityScreen` + `AdminDashboardScreen` — **no logout in Profile/Settings** |
| Loading/empty states | PARTIAL | Loading in 27/27 fetch components; empty states in ~19; **error states often collapse into empty states** (`DestinationsScreen.jsx:81-86`) and silent multi-fetch failures (`HostDashboardScreen.jsx:33-95`) |
| Lint | **BROKEN** | 72 errors: 33 unused `React` imports, 19 **real duplicate keys** in `WeatherScreen.jsx`, 7 `set-state-in-effect`, dead `API_BASE` (`InboxScreen.jsx:7`) |
| Accessibility | PARTIAL | Good: focus-visible ring (`index.css:458`), all `<img>` have `alt`, 0 `<div onClick>`, proper dialog in `ReportDialog.jsx:112`. Bad: 22/32 inputs unlabelled, **no `aria-current` on BottomNav**, `<title>frontend</title>` (`index.html:7`), no meta description |
| Responsive | PARTIAL | Tailwind prefixes used heavily; `body{overflow-x:hidden}` (`index.css:117`) masks overflow instead of fixing it |
| Duplicate code | PERF GAP | `TravelTrendRadar.jsx` has two near-identical loaders (`:150-177`, `:183-210`); per-screen fetch boilerplate ×27 |
| Dead code | DOC GAP | `src/utils/aiRecommendation.js` (0 importers), unused assets (`hero.png`, `touristo_logo.png`, `react.svg`, `vite.svg`), `frontend/package-lock.json.bak`, `node_modules_old/` |
| Static/demo screens | PARTIAL | `NotificationsScreen` (hardcoded), `ExperiencesScreen` (hardcoded catalog), `ContactScreen` (fake submit), `SettingsScreen` (unpersisted), `OnboardingScreen` (commented persistence) |
| Build | PASSES | 227 kB main chunk (gzip 72 kB) — **under the 500 kB threshold; no code-splitting work needed beyond existing lazy routes** |
| Bundle split | IMPLEMENTED | All screens lazy-loaded via `React.lazy` (`App.jsx`) |

---

## 6. AI

| Area | Status | Evidence |
|---|---|---|
| AI package generation | PARTIAL | `POST /api/packages/ai/generate` exists (`packageRoutes.js`, `packageController.js`) with schema validation work added in this working tree — **verify per Phase 1** |
| AI trip planner | PARTIAL | `tripPlannerController.js` — unauthenticated, no structured-output validation visible, no per-user rate/cost control |
| AI review summaries | IMPLEMENTED | `reviewSummarizer.js` |
| Travel Radar AI explanation | IMPLEMENTED | `travelRadarController.js` (keys server-side, cached) |
| Admin AI assistant | **MISSING** | no tooling exists (Phase 7) |
| AI is assistant-not-authority | PARTIAL | Host must still review/publish — but no structured regeneration/section-accept flow confirmed |
| API key handling | IMPLEMENTED | all keys server-side in `.env`; frontend Gemini call is commented out and never imported (`aiRecommendation.js:74-91`) |
| Cost control / rate limits on AI | **MISSING** | no limiter on any AI endpoint besides global 300/15min |
| Structured output validation | PARTIAL | must be verified per-endpoint in Phases 1/7 |
| Prompt injection surface | SECURITY RISK | raw user prompt → Gemini on trip-planner/radar/guide-recommend |

---

## 7. DEPLOYMENT

| Area | Status | Evidence |
|---|---|---|
| Vercel config present | PARTIAL | `vercel.json` builds frontend only (`installCommand` = `cd frontend && npm install`) — **root deps (express/pg/bcrypt) not installed by that command** |
| Serverless shim | IMPLEMENTED | `api/index.js` → `../index` |
| **Schema/seed never run in prod** | **BLOCKER** | `require.main === module` guards (`index.js:91-128`) |
| Env contract | DOC GAP | `.env` exists locally with all 17 vars; **`.env.example` never created** (`.gitignore:11` whitelists it) |
| Rate limiting in prod | ARCH RISK | in-memory `express-rate-limit` is per-instance and ephemeral |
| Logging | PARTIAL | `morgan('combined')` only; no structured logs, no error tracking (Sentry etc.) |
| Health check unreachable in prod | ARCH RISK | catch-all rewrite sends `/` → `index.html` |
| CI | **MISSING** | no `.github/workflows` |

---

## 8. DOCUMENTATION

| Doc | Status | Gap |
|---|---|---|
| `PRD.md` | DOC GAP | Says admin is "Future Phase" — it's implemented. No mention of reports, Travel Radar, AI package generation, `admin` role |
| `TRD.md` | DOC GAP | RBAC lists traveler/host only; endpoint groups omit `/api/admin`, `/api/reports`, `/api/travel-radar`, `/api/host/bookings`, `POST /api/packages/ai/generate` |
| `Architecture·md` | DOC GAP | Filename uses U+00B7 middle dot, not `.md` (invisible to globs, missing from README). Component/backend trees omit ~15 new files; ER diagram has no `reports` |
| `BackendSchema.md` | DOC GAP | **`reports` table undocumented**; roles omit `admin`; no mention of `withTransaction` or Supabase storage |
| `AppFlow.md` | DOC GAP | No flows for Travel Radar, reporting, admin; no admin login redirect |
| `ImplementationPlan.md` | DOC GAP | Admin/verification/moderation listed as "next phase" though implemented |
| `README.md` | DOC GAP | API areas omit 6 route groups; DB table list omits `reports`; security section overclaims (bookings are unauthenticated) |
| `IMPLEMENTATION_STATUS.md` | **MISSING** | must be created (this document is the gap analysis; status doc created alongside) |
| `UIUXDesignBrief.md` | DOC GAP | No guidance for admin dashboard, reports UI, Travel Radar |

---

## 9. TESTING

| Area | Status | Evidence |
|---|---|---|
| Automated tests | **TEST GAP** | Only `scripts/e2e-smoke.js` (5 GET checks; untracked). No unit tests, no integration tests, no test runner (root `test` = `exit 1`; frontend has no test deps) |
| Auth in tests | PARTIAL | smoke test uses **real** login + Bearer token, env-provided credentials, localhost default — correct approach, minimal coverage |
| Authorization tests | **TEST GAP** | none — the exact area with 5 critical findings (C1–C5) |
| CI enforcement | MISSING | lint failing (72 errors) with nothing to catch it |

---

## 10. PRIORITY ORDER (drives phase sequencing)

1. **CRITICAL security fixes C1–C5** (bookings, users, host PII, host binding, tour-guide ownership) — must precede any production traffic.
2. **Global error handler + stop leaking `err.message`** — single highest-leverage backend change.
3. **API base URL mechanism (`VITE_API_URL`)** — otherwise production frontend cannot talk to the backend at all.
4. **Auth/session hardening** (401 handling, logout everywhere, role re-validation, admin bootstrap).
5. Then Phases 1–30 as specified, keeping Travel Radar stable throughout.

---

## 11. KNOWN BLOCKERS / DEFERRED BY DESIGN

- **RLS**: not feasible without moving DB access to Supabase Data API; compensating control = server-side authorization (being strengthened in Phase 9). Documented as ARCH RISK, not silently ignored.
- **Real payment gateway**: requires merchant credentials not present in repo; Phase 11 implements full state machine + verification architecture behind a gateway adapter.
- **Rate limiting on Vercel**: requires Upstash/Redis; documented; local limiter retained.
- **Travel Radar multi-source expansion**: intentionally deferred to Phase 29 per instruction — current YouTube implementation kept stable.
