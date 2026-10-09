# Touristo — Technical Requirements Document

## 1. Introduction

This document defines the current technical architecture and implementation requirements for Touristo.

Touristo is a full-stack React and Node.js tourism marketplace using PostgreSQL on Supabase.

---

# 2. System Architecture

Touristo follows a client-server architecture.

```text
React + Vite Frontend
        │
        ▼
Node.js + Express REST API
        │
        ▼
PostgreSQL on Supabase
```

External services are integrated where required for AI, weather, maps, and location-related functionality.

---

# 3. Technology Stack

## Frontend

* React 19
* Vite
* React Router
* Tailwind CSS
* JavaScript / JSX
* Responsive/mobile-first design
* Browser localStorage for authentication persistence

## Backend

* Node.js
* Express 5
* REST API
* PostgreSQL
* `pg`
* bcrypt
* jsonwebtoken
* express-validator
* helmet
* cors
* morgan
* express-rate-limit

## Database

* PostgreSQL
* Supabase as the hosted database provider

## AI

* Google Gemini API + OpenAI API (via `touristo/services/aiService.js`, server-side keys, retry + fallback)

## External APIs

* OpenWeatherMap
* OpenStreetMap
* Leaflet
* Google Maps URLs
* Nominatim where required by travel/location flows

---

# 4. Authentication Architecture

Authentication is implemented by the Node.js/Express backend.

### Registration

```text
Frontend
   ↓
POST /api/users
   ↓
Validation
   ↓
bcrypt password hashing
   ↓
PostgreSQL
```

### Login

```text
Frontend
   ↓
POST /api/users/login
   ↓
Password verification
   ↓
JWT generation
   ↓
Frontend local storage
```

Protected requests include:

```text
Authorization: Bearer <JWT>
```

The backend authentication middleware validates the token.

---

# 5. Role-Based Access

The application supports:

### Traveler

Access to:

* Home
* Search
* Destinations
* Experiences
* Packages
* Booking
* My Trips
* AI Planner
* Weather
* SOS
* Profile
* Inbox

### Host

Access to:

* Host Dashboard
* My Packages
* Host Bookings
* Tour Guides
* Customer Inquiries / Inbox
* Host Profile

### Admin

Access to:

* Admin Dashboard (`/admin-dashboard`)

Admin API access is guarded by `requireAdmin`, which validates the JWT and then re-reads the account role from the database on every request (401 without/invalid token, 403 for non-admin, 503 when the role cannot be verified).

---

# 6. API Architecture

Base API:

```text
/api
```

Main endpoint groups include:

```text
/api/users
/api/hosts
/api/packages          (incl. POST /api/packages/ai/generate — host-only AI draft)
/api/bookings
/api/host/bookings
/api/destinations
/api/reviews
/api/reports
/api/tour-guides       (incl. POST /api/tour-guides/recommend — AI matching)
/api/messages
/api/trip-planner
/api/weather
/api/homepage-data
/api/admin             (15 endpoints, all behind requireAdmin)
/api/travel-radar
```

---

# 7. Messaging API

The current marketplace messaging system includes:

```text
GET    /api/messages/inbox
GET    /api/messages/unread-count
POST   /api/messages/conversation
GET    /api/messages/conversation/:conversationId
POST   /api/messages/conversation/:conversationId/messages
PATCH  /api/messages/conversation/:conversationId/read
```

The messaging system is restricted to Traveler ↔ Host marketplace communication.

---

# 8. AI API

AI requests are handled by a shared service, `touristo/services/aiService.js`, not by calling a single vendor directly.

* Providers: Google Gemini (`GEMINI_API_KEY`) and OpenAI (`OPENAI_API_KEY`), both server-side only.
* Provider order follows `AI_PRIMARY_PROVIDER` when set; otherwise Gemini first, OpenAI second.
* Per-attempt timeout 20s, overall deadline 30s, bounded retries on the primary provider, then a bounded single fallback to the secondary provider.
* Structured output is parsed and validated; malformed output is returned as a typed `invalid_output` error instead of raw text.
* Typed error codes map to safe HTTP statuses — keys, prompts and stack traces are never exposed.

Endpoints:

```text
POST /api/trip-planner                 (authenticated, AI rate-limited; DB-grounded:
                                         server loads destinations+packages, model must return
                                         {message, packageIds}, ids re-validated against the DB)
POST /api/tour-guides/recommend        (authenticated, AI rate-limited)
POST /api/packages/ai/generate         (host-only, AI rate-limited, response cached)
GET  /api/packages/:id                 (AI review summary, cached in review_summaries)
GET  /api/travel-radar                 (AI explanations over trend data)
```

---

# 9. Weather API

Example:

```text
GET /api/weather/coordinates?lat=&lon=
```

Weather functionality uses OpenWeatherMap where configured.

---

# 10. Database Requirements

The PostgreSQL database should maintain relationships between:

* Users
* Hosts
* Destinations
* Packages
* Bookings
* Reviews
* Review summaries
* Tour guides
* Marketplace chats
* Messages
* Reports (moderation reports)
* Admin audit log

Foreign keys should protect relationships and maintain referential integrity.

Indexes should be created for frequently queried relationships and marketplace operations.

---

# 11. Security Requirements

The application should use:

* JWT authentication
* bcrypt password hashing
* Protected API routes
* Role-based authorization
* Input validation
* Helmet
* CORS configuration
* Rate limiting
* Environment variables for secrets

Secrets must never be committed to GitHub.

---

# 12. Performance Requirements

Target requirements:

* Responsive UI on desktop and mobile.
* Efficient API requests.
* Loading states for asynchronous operations.
* Skeleton/loading UI where appropriate.
* Optimized images.
* Database indexes for common queries.
* Avoid unnecessary API requests.

---

# 13. Error Handling

Frontend should provide:

* Loading states
* Error states
* Empty states
* Retry options where appropriate
* Authentication redirects where required

Backend should return consistent HTTP status codes and useful error messages.

---

# 14. Production Deployment

The application is designed for deployment using Vercel with Supabase PostgreSQL.

The production architecture should keep:

* Frontend deployment configuration
* API routing
* Database credentials
* JWT secret
* AI API keys (Gemini and OpenAI)
* Weather API key
* YouTube API key (Travel Radar)
* CORS allowlist (`CORS_ORIGINS`)

in secure environment configuration.

Known deployment caveats:

* Schema setup only runs on local `node index.js` — it never runs on Vercel (migration entrypoint: PLANNED).
* Rate limits are in-memory and per-instance, so they do not coordinate across serverless instances (distributed rate limiting: PLANNED).

---

# 15. Future Technical Requirements

Future production development may include:

* Payment gateway integration
* Password recovery infrastructure
* Email verification
* Real-time notifications
* Production media storage
* Advanced monitoring
* Distributed rate limiting
* Database migration entrypoint
* Automated unit/integration testing (smoke and probe scripts exist today; no test framework)
* Logging/observability
* Enhanced active-trip communication
* Guide/group communication
* Production security audit
