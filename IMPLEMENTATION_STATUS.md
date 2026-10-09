# IMPLEMENTATION STATUS

**Living document.** Updated whenever code changes product behavior, API, schema, security, testing, deployment, or AI behavior.
Companion document: `PRODUCTION_GAP_ANALYSIS.md` (evidence-backed audit of the starting state).

**Legend:** `IMPLEMENTED` · `PARTIAL` · `PLANNED` · `DEPRECATED` · `REMOVED` · `BLOCKED`

---

## Current Build State

| Check | Result |
|---|---|
| Frontend build (`npm run build`) | ✅ PASSES (main chunk 227 kB / gzip 72 kB) |
| Frontend lint (`npm run lint`) | ❌ 77 problems (75 errors, 2 warnings) — re-verified 2026-10-08 — tracked in Phase 28 |
| Backend start (`node index.js`) | ✅ boots, DB connects, health 200, schema migration runs on boot |
| E2E smoke (`npm run test:e2e` → `scripts/e2e-smoke.js`) | ✅ 6 checks (requires local server + `.env` credentials) — Verified 2026-10-08 |
| Security probes (`npm run test:security` → `scripts/security-probes.js`) | ✅ 26 probes — Verified 2026-10-08 |
| Package probes (`npm run test:packages` → `scripts/package-probes.js`) | ✅ 24 probes — Verified 2026-10-08 |
| AI package builder (`npm run test:ai` → `scripts/ai-package-builder-tests.js`) | ✅ 12 stubbed-AI checks — Verified 2026-10-08 |
| Package image probes (`node scripts/package-image-probes.js`) | ✅ 16 probes — Verified 2026-10-08 |
| AI provider tests (`node scripts/ai-provider-tests.js`) | ✅ 15 tests — Verified 2026-10-08 |
| Unit/integration tests | ❌ none yet (Phase 25) |
| CI | ❌ none (`.github/workflows` absent) |

**Verified 2026-10-08 (audit note):** suite names/commands above were confirmed against root `package.json` scripts (`test:e2e`, `test:security`, `test:packages`, `test:ai`) and the files in `scripts/`. The suites themselves need a live server on `:3000` and were **not re-run** during this audit — the counts are the recorded passing results from the last run.

---

## Phase Tracker

| Phase | Name | Status | Notes |
|---|---|---|---|
| 0 | Foundational Security & API Client | ✅ DONE | C1–C5 closed, error leakage closed (7 controllers), CORS allowlist, `src/api/client.js`, 26/26 probes |
| 1 | Host AI Package Builder | ✅ DONE | Per-section apply, 7 new package columns (incl. SEO/tags), review-before-publish modal, per-user AI limiter + response cache, 24-check package probe suite + 12/12 stubbed-AI checks |
| 2 | Complete Admin Dashboard | PARTIAL | `adminRoutes.js` + `AdminDashboardScreen.jsx` exist (untracked); verify data authenticity + coverage |
| 3 | Host Verification | PARTIAL | columns + admin status update exist; documents/status-history missing |
| 4 | User Management | PARTIAL | admin endpoints exist; harden against escalation |
| 5 | Package Moderation | PARTIAL | admin endpoints exist; host ownership enforced — verify |
| 6 | Review Moderation | PARTIAL | admin endpoints exist; verify integrity |
| 7 | AI Admin Assistant | PLANNED | allowlisted analytics tools only |
| 8 | Reports & Moderation | IMPLEMENTED | `reports` table, rate-limited routes, `ReportDialog`, `MyReportsScreen`, admin endpoints |
| 9 | Security & Authorization Audit | IN PROGRESS | route-by-route; critical fixes in Phase 0 |
| 10 | Account Security | PLANNED | email verification, password reset, sessions |
| 11 | Real Payments | PLANNED | state machine + gateway adapter |
| 12 | Real Notifications | PLANNED | `notifications` table + realtime |
| 13 | Maps & Live Trip Intelligence | PLANNED | |
| 14 | Offline / PWA | PLANNED | |
| 15 | Solo Women Safety AI | PLANNED | |
| 16 | Travel DNA / Personalization | PLANNED | |
| 17 | AI Package Matching | PLANNED | deterministic scoring |
| 18 | AI Budget Optimizer | PLANNED | |
| 19 | AI Weather + Trip Intelligence | PLANNED | |
| 20 | AI Packing Assistant | PLANNED | |
| 21 | AI During-Trip Companion | PLANNED | |
| 22 | Host AI Copilot | PLANNED | |
| 23 | Marketplace AI Intelligence | PLANNED | |
| 24 | Performance Engineering | PLANNED | measured: build already under threshold |
| 25 | Testing | PLANNED | smoke only today |
| 26 | Browser Visual QA | PLANNED | |
| 27 | Accessibility | PLANNED | known: unlabelled inputs, no `aria-current` |
| 28 | Technical Cleanup | PLANNED | known dead code: `aiRecommendation.js`, `models/Message.js`, `schemaUpdater.js` |
| 29 | Travel Radar Final Upgrade | DEFERRED BY INSTRUCTION | current YouTube implementation kept stable |
| 30 | Final Production Launch Audit | PLANNED | |

---

## Database Changes

- **`reports` table** — IMPLEMENTED (`touristo/utils/schemaSetup.js:252-303`): polymorphic target, CHECK constraints on `target_type`/`status`, 6 indexes incl. partial unique `uq_reports_open_target` for open-report dedupe.
- **`packages` +7 columns** (Phase 1, additive `ALTER TABLE ... IF NOT EXISTS` on every boot): `highlights TEXT[]`, `activities TEXT[]`, `tags TEXT[]`, `target_traveler_type VARCHAR(80)`, `best_season VARCHAR(80)`, `safety_notes TEXT[]`, `seo_description VARCHAR(300)`. Created inline in `CREATE TABLE` for fresh DBs; migrated via `schemaSetup.js` for existing ones.
- All other tables unchanged from audit baseline. See `BackendSchema.md`.

## API Changes

- Mounted (this working tree): `/api/admin` (15 routes, `requireAdmin`), `/api/reports`, `/api/travel-radar`.
- `POST /api/packages/ai/generate` — host-only AI draft (auth + IP limiter 15/15min + per-user limiter 10/15min, 5-min identical-request cache, `temperature 0.7`, `maxOutputTokens 4096`, prose-JSON fallback extraction). Never writes to DB.
- `POST/PUT /api/packages` — accept + persist `highlights`, `activities`, `tags`, `target_traveler_type`, `best_season`, `safety_notes`, `seo_description` (whitelisted, length-capped). `PUT` now requires `title` (400) and truncates `group_size` to 50 chars (column width).

## Security Changes

- Tracked in phase reports below.

## Tests

- `scripts/e2e-smoke.js` — real-login smoke covering reports/inbox/auth-rejection/optional-admin. **Verified 2026-10-08** (script mapping via `npm run test:e2e` in `package.json`; 6 checks).
- `scripts/security-probes.js` — auth/authorization probes. **Verified 2026-10-08** (`npm run test:security`; 26 probes).
- `scripts/package-probes.js` — package CRUD + AI-generate guards. **Verified 2026-10-08** (`npm run test:packages`; 24 probes).
- `scripts/ai-package-builder-tests.js` — stubbed-AI host package builder. **Verified 2026-10-08** (`npm run test:ai`; 12 checks).
- `scripts/package-image-probes.js` — package image persistence probes. **Verified 2026-10-08** (`node scripts/package-image-probes.js`; 16 probes).
- `scripts/ai-provider-tests.js` — AI service retry/fallback/parsing unit tests. **Verified 2026-10-08** (`node scripts/ai-provider-tests.js`; 15 tests).

Counts are the recorded results from the last successful run; the suites were not re-executed during the 2026-10-08 audit (they require a live server on `:3000`).

## Known Blockers

- **RLS** not evaluable (raw `pg`, not Supabase Data API) → compensating control: server-side authorization.
- **Schema never runs on Vercel** (`require.main` guards) → requires migration entrypoint.
- **Rate limits in-memory** → ineffective on serverless; needs Redis/Upstash for production.
- **Gemini flash tier 503 "high demand"** (external, verified 06 Oct 2026 across `gemini-3.5-flash`/`3.8-flash`/`flash-latest`) → app retries 3× then returns safe 429/503; success path verified with stubbed model (`scripts/ai-package-builder-tests.js`, 12/12).
