# Touristo 🇵🇰

## Pakistan Tourism Marketplace

Touristo is a full-stack tourism marketplace designed to connect **travelers with tour companies across Pakistan**. The platform allows travelers to discover destinations, explore tour packages, evaluate hosts and guides, plan trips with AI assistance, make bookings, communicate with tour companies, manage trips, and access travel-safety features.

Touristo follows an **asset-light marketplace model**: Touristo does not operate tours itself. Instead, it provides a digital marketplace where travelers can discover and communicate with tour companies and hosts.

> **Project Status:** Active Development — Full-Stack MVP
> **Primary Focus:** Pakistan Domestic Tourism Marketplace

---

# ✨ Current Features

## 👤 Authentication & User Roles

Touristo currently supports three user roles:

* **Traveler**
* **Tour Company / Host**
* **Admin**

### Current Authentication

* Traveler registration
* Tour company/host registration
* Email and password login
* Password hashing using bcrypt
* JWT-based authentication
* Persistent authentication using browser localStorage
* Protected routes
* Role-based access
* Traveler-specific navigation
* Host-specific dashboard and navigation
* Linked host/company profiles

The authentication system is currently functional for the MVP. A more advanced production-grade authentication system is planned for the next phase.

---

# 🧳 Traveler Experience

Travelers can currently:

* Explore the Touristo home/discovery experience
* Search for destinations and tour packages
* Browse Pakistani destinations
* Explore destination information
* View available tour packages
* View detailed package information
* View tour company/host profiles
* Explore available experiences
* Browse tour guides
* View guide information
* Use AI Trip Planner
* View package reviews and ratings
* View AI-generated review summaries where available
* File moderation reports against reviews, packages, users or hosts (`/my-reports`)
* Explore Travel Trend Radar insights (`/travel-radar`)
* Make package bookings
* Manage trips through My Trips
* Communicate with tour companies/hosts
* Access weather information
* Use Emergency SOS/location-sharing features
* Manage profile and account settings
* See the Notifications interface (currently placeholder data — no notifications backend yet)

---

# 🏢 Tour Company / Host Experience

Tour companies can currently:

* Register as a host
* Create a linked company profile
* Access a host dashboard
* Create tour packages
* Edit and manage packages
* Add package descriptions
* Set package prices
* Set package duration
* Add locations
* Add availability information
* Define inclusions and exclusions
* View bookings associated with their packages
* Manage tour guides
* Add tour guides
* Add guide specialties
* Add guide photo URLs
* View travelers' inquiries through the messaging system

---

# 🛡️ Admin Experience

Admin users can currently:

* Sign in with an account whose `role` is `admin` (the role is re-checked against the database on every admin request)
* Open the Admin Dashboard at `/admin-dashboard`
* View platform overview statistics and analytics
* Manage users (including role changes)
* Manage host verification status
* Moderate packages and reviews (delete)
* Monitor bookings
* Review and resolve user reports
* Inspect the admin audit log (`admin_audit_log`)

All 15 admin API endpoints live under `/api/admin` and are guarded by `requireAdmin`.

---

# 🔎 Search & Discovery

Touristo provides multiple discovery mechanisms including:

* Package search
* Destination discovery
* Tour company discovery
* Destination-based package discovery
* Package cards with pricing and duration
* Host rating information
* Featured packages
* Recommended packages
* Experience-based discovery

> **Note:** side-by-side package comparison UI and the guide comparison screen are **not implemented** — `GuideComparisonScreen` was removed and `touristo/utils/packageComparison.js` is dead code (never imported).

The goal is to make it easier for travelers to compare tourism options before booking.

---

# 🗺️ Pakistani Destinations

The current application contains seeded destinations including:

1. Hunza Valley
2. Skardu
3. Swat Valley
4. Naran
5. Babusar Top
6. Lahore
7. Mohenjo-daro
8. Gwadar

Destination information can include:

* Category
* History
* Culture
* Famous places
* Local food
* Latitude
* Longitude
* Available tour packages

---

# 📦 Tour Package Management

Travelers can:

* Browse packages
* View package details
* View package price
* View duration
* View group size
* View inclusions
* View exclusions
* View itinerary
* View host information
* View ratings and reviews
* View AI review summaries where available
* Start the booking process
* Contact the host before booking

Hosts can:

* Create packages
* Edit packages
* Delete/manage packages
* Add package information
* Set price and duration
* Add location
* Add availability
* Add inclusions/exclusions
* Manage their package listings

The backend provides package CRUD functionality.

---

# 🧾 Booking & My Trips

Travelers can currently:

* Select a package
* Select number of travelers
* Select a start date
* Enter special requests in the form (note: the backend does not persist them — there is no `special_requests` column; PLANNED)
* Select a displayed payment method
* View calculated booking totals
* Submit bookings
* View bookings through My Trips

Hosts can:

* View bookings related to their packages
* View traveler and package information

### Payment Status

The current MVP contains booking/payment-status logic and displays payment-method choices.

However, **live payment gateway integration is not yet implemented**.

Future production integrations may include:

* JazzCash
* Easypaisa
* Bank payments
* Card payments
* Other secure payment providers

---

# 💬 Traveler ↔ Host Messaging

Touristo now includes a centralized marketplace messaging architecture for **Traveler ↔ Host communication**.

### Current Messaging Flow

Travelers can:

* Start a conversation with a host
* Open conversations from the Inbox
* Send messages
* View previous messages
* See host/company information
* See verified-host information
* View unread message counts
* Continue conversations from package-related inquiries

Hosts can:

* View traveler inquiries
* Open conversations
* Reply to travelers
* See unread messages
* See package context associated with inquiries

### Messaging Rules

The current marketplace communication model is:

**Traveler ↔ Host**

Pre-booking communication is intentionally handled between the traveler and the tour company/host.

Tour guides are shown as part of package/host information, but **direct guide messaging is not available before an active booking**.

Future trip-based communication may introduce guide/group communication after a booking becomes active.

---

# 🤖 AI Trip Planner

Touristo includes an AI-powered travel assistant backed by a shared AI service that uses **Google Gemini and OpenAI** (server-side keys only, with bounded retries and provider fallback).

Travelers can:

* Ask travel questions
* Ask for destination recommendations
* Ask for trip-planning suggestions
* Use English
* Use Urdu
* Use Roman Urdu
* Receive concise travel recommendations

The planner is **database-grounded**: the server loads destinations and packages from the database into the prompt, the model must answer with `{message, packageIds}`, and the server re-validates every returned package id against the loaded catalog before responding — so the model cannot invent package ids or prices.

The backend provides:

`POST /api/trip-planner` (authenticated, AI rate-limited)

---

# 🧠 Host AI Package Builder

Hosts can generate a draft tour package from a short brief:

`POST /api/packages/ai/generate` (host-only, authenticated, rate-limited, short-lived response cache)

The AI output is a **draft for review** — hosts must review and publish it themselves; the endpoint never writes to the database on its own.

---

# ⭐ AI Review Summarization

Tour package reviews can be processed through AI to generate summarized insights.

The system can identify:

* Overall sentiment
* Positive highlights
* Recurring concerns
* Suggestions from travelers

Generated summaries can be cached in the database to avoid unnecessary repeated AI processing.

---

# 🏆 Host Ranking & Recommendations

Touristo includes host-ranking and recommendation functionality.

Host ranking can consider:

* Review score
* Response-time information
* Completion rate

Host badges can include:

* Top Rated
* Highly Recommended
* Rising Host
* Trusted Operator
* New Host

The recommendation system can use traveler activity and booking history to provide more relevant package suggestions.

---

# 🧭 Tour Guide Features

Travelers can:

* Browse tour guides
* View guide specialties
* View guide ratings
* Search/filter guides
* Receive AI-based matching recommendations (`POST /api/tour-guides/recommend`)

Side-by-side guide comparison is **not implemented** — the guide comparison screen was removed from the app.

Hosts can:

* Add guides
* Manage guides
* Add guide specialties
* Add optional guide photos
* Remove guides associated with their company

### Guide Communication

Tour guides are currently presented as part of the tour package/host ecosystem.

**Pre-booking direct chat with guides is intentionally restricted.**

A future active-trip communication system may allow travelers to communicate with assigned guides after a confirmed/active booking.

---

# 🏔️ Experiences

Touristo includes experience-based discovery such as:

* Mountain Adventures
* Cultural Tours
* Coastal Getaways
* Wildlife Safaris
* Food & Culinary
* Adventure Sports

Each experience is intended to help travelers discover relevant tourism activities and packages.

---

# 🌦️ Weather & Road Status

Touristo includes weather information for Pakistani locations.

Current weather functionality includes:

* Current weather
* Temperature
* Humidity
* Wind speed
* Feels-like temperature
* Forecast information
* Simplified road-status information

Weather data is integrated using OpenWeatherMap.

Road status can currently be categorized as:

* Clear
* Caution
* Unknown

Fallback data may be used if the external weather service is unavailable.

---

# 🚨 Emergency SOS

Touristo provides an Emergency SOS interface designed to support traveler safety. It is a first-class entry in the **traveler bottom navigation** (labelled **SOS**, route `/sos`); **My Trips** remains available from the Profile screen.

Current functionality includes:

* Browser geolocation
* Current latitude/longitude
* Google Maps location generation
* Location sharing
* Tourism/emergency contact information
* Region-based emergency information

### Current Limitation

This is currently a **travel-safety feature, not a real emergency dispatch service**.

It does not currently:

* Automatically contact emergency authorities
* Continuously transmit location
* Provide professional emergency dispatch
* Replace local emergency services

---

# 🗺️ Maps

Touristo uses Leaflet and OpenStreetMap for map functionality.

Current map functionality includes:

* OpenStreetMap tiles
* User location marker
* Destination marker
* Automatic map positioning
* Location-based visualization

The current system is primarily intended for destination/location awareness rather than full turn-by-turn navigation.

---

# 📡 Travel Trend Radar

Touristo includes a Travel Radar screen at `/travel-radar` (`TravelTrendRadar.jsx`) fed by `GET /api/travel-radar`.

Current state:

* Sourced from **YouTube trend data** (`YOUTUBE_API_KEY`), with a server-side cache
* Includes AI-generated explanations of the trends (server-side keys)
* A multi-source radar upgrade is **deferred (PLANNED)** — the current implementation is intentionally kept stable

---

# 👤 Profile, Settings & Notifications

Touristo includes:

* Traveler profile
* Host/company profiles
* Account settings
* Notification interface
* Language preference interface
* Currency preference interface
* Profile/activity settings
* About Touristo
* Contact Touristo

Some settings functionality is still being expanded toward persistent backend-based behavior. The Notifications screen currently shows **placeholder data** — there is no notifications backend (PLANNED).

---

# 🛠️ Technology Stack

## Frontend

* React 19
* Vite
* React Router
* Tailwind CSS
* Responsive/mobile-first UI
* JavaScript
* Browser localStorage for authentication persistence

## Backend

* Node.js
* Express.js
* REST APIs
* JWT authentication
* bcrypt password hashing
* express-validator
* Helmet
* CORS
* express-rate-limit
* Morgan

## Database

* Supabase
* PostgreSQL
* PostgreSQL `pg` driver

The application communicates with PostgreSQL through the Node.js backend.

## AI

* Shared AI service (`touristo/services/aiService.js`) — Google Gemini + OpenAI, server-side keys, 20s per-attempt / 30s overall timeouts, bounded retries with provider fallback, typed errors
* AI Trip Planner
* Host AI package builder (`POST /api/packages/ai/generate`)
* AI guide recommendations (`POST /api/tour-guides/recommend`)
* AI Review Summarization
* Travel Radar AI explanations
* Recommendation-related functionality

## External Services

* OpenWeatherMap — weather
* OpenStreetMap — map data
* Leaflet — interactive maps
* Nominatim — location lookup
* Google Maps URLs — location sharing

## Deployment

* Vercel
* Supabase PostgreSQL

The project uses a Vercel-compatible architecture where the frontend and API can be deployed through the same project structure.

---

# 📁 Project Structure

```text
Touristo-App/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── touristo/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   │   └── aiService.js
│   └── utils/
│
├── scripts/
│   ├── ai-package-builder-tests.js
│   ├── ai-provider-tests.js
│   ├── cleanup-probe-data.js
│   ├── e2e-smoke.js
│   ├── package-image-probes.js
│   ├── package-probes.js
│   └── security-probes.js
│
├── api/
│   └── index.js
│
├── index.js
├── BackendSchema.md
├── AppFlow.md
├── PRD.md
├── TRD.md
├── ImplementationPlan.md
├── UIUXDesignBrief.md
└── README.md
```

---

# 🗃️ Main Database Entities

The application currently uses database entities including:

| Table               | Purpose                            |
| ------------------- | ---------------------------------- |
| `users`             | Traveler, host and admin accounts  |
| `hosts`             | Tour company profiles              |
| `destinations`      | Pakistani destination information  |
| `packages`          | Tour package listings              |
| `bookings`          | Traveler bookings                  |
| `reviews`           | Package reviews and ratings        |
| `review_summaries`  | AI-generated review summaries      |
| `tour_guides`       | Tour guides associated with hosts  |
| `messages`          | Marketplace messages               |
| `marketplace_chats` | Traveler-host conversation records |
| `reports`           | User moderation reports            |
| `admin_audit_log`   | Immutable admin action trail       |

Foreign-key relationships connect users, hosts, packages, bookings, reviews, guides and marketplace conversations.

---

# 🔐 Authentication Architecture

The current authentication flow is:

```text
Traveler / Host / Admin
       │
       ▼
   Registration
       │
       ▼
   User Account
       │
       ▼
 Email + Password
       │
       ▼
 bcrypt Verification
       │
       ▼
 JWT Token
       │
       ▼
 Protected Routes
       │
       ├── Traveler
       │
       ├── Host
       │
       └── Admin (role re-checked against the database on every /api/admin request)
```

The current system provides role-based authentication and protected application routes.

### Authentication Improvements — Next Phase

The authentication system will be strengthened in the next development phase.

Planned improvements include:

* Forgot Password
* Reset Password
* Password reset tokens
* Stronger password validation
* Better session/token handling
* Improved account security
* Better authentication error handling
* Email-based account recovery
* Additional security protections
* Improved login protection
* More robust production authentication flow

---

# 🔌 Main API Areas

### Users

```text
GET     /api/users
GET     /api/users/:id
POST    /api/users
POST    /api/users/login
PUT     /api/users/:id
DELETE  /api/users/:id
```

### Hosts

```text
GET     /api/hosts
GET     /api/hosts/:id
GET     /api/hosts/user/:id
POST    /api/hosts
PUT     /api/hosts/:id
DELETE  /api/hosts/:id
```

### Packages

```text
GET     /api/packages
GET     /api/packages/:id
GET     /api/packages/destination/:destinationId
GET     /api/packages/host/:hostId
POST    /api/packages
PUT     /api/packages/:id
DELETE  /api/packages/:id
POST    /api/packages/ai/generate        (host-only, AI rate-limited)
```

### Bookings

```text
GET     /api/bookings
GET     /api/bookings/:id
GET     /api/bookings/user/:userId
GET     /api/bookings/host/:hostId
POST    /api/bookings
PUT     /api/bookings/:id
DELETE  /api/bookings/:id
```

### Destinations

```text
GET     /api/destinations
GET     /api/destinations/:id
GET     /api/destinations/name/:name
```

### Reviews

```text
GET     /api/reviews
GET     /api/reviews/:id
POST    /api/reviews
PATCH   /api/reviews/:id
DELETE  /api/reviews/:id
```

### Tour Guides

```text
GET     /api/tour-guides
GET     /api/tour-guides/:id
GET     /api/tour-guides/host/:hostId
POST    /api/tour-guides/recommend       (AI, authenticated)
POST    /api/tour-guides
PUT     /api/tour-guides/:id
DELETE  /api/tour-guides/:id
```

### Marketplace Messaging

```text
POST    /api/messages/conversation
GET     /api/messages/inbox
GET     /api/messages/unread-count
GET     /api/messages/conversation/:conversationId
POST    /api/messages/conversation/:conversationId/messages
PATCH   /api/messages/conversation/:conversationId/read
```

### AI Trip Planner

```text
POST    /api/trip-planner
```

### Weather

```text
GET     /api/weather/coordinates?lat=<lat>&lon=<lon>
```

### Home / Recommendations

```text
GET     /api/homepage-data
```

### Host Bookings

```text
GET     /api/host/bookings/host/:hostId  (authenticated)
```

### Reports (moderation)

```text
GET     /api/reports/mine
POST    /api/reports
```

### Admin (all behind `requireAdmin` — fresh database role check)

```text
GET     /api/admin/dashboard
GET     /api/admin/analytics
GET     /api/admin/audit
GET     /api/admin/users
PATCH   /api/admin/users/:id/role
GET     /api/admin/hosts
PATCH   /api/admin/hosts/:id/verification-status
GET     /api/admin/packages
DELETE  /api/admin/packages/:id
GET     /api/admin/bookings
PATCH   /api/admin/bookings/:id/status
GET     /api/admin/reviews
DELETE  /api/admin/reviews/:id
GET     /api/admin/reports
PATCH   /api/admin/reports/:id/status
```

### Travel Radar

```text
GET     /api/travel-radar                 (AI explanations, server-cached)
```

---

# 🧪 Testing

The repository ships several runnable check scripts (run from the repo root). All suites are live-server checks — they need a running backend (`node index.js` on `:3000`) and `.env` credentials:

| Command | What it checks | Count |
| --- | --- | --- |
| `npm run test:security` | `scripts/security-probes.js` — auth/authorization probes (password hashes, booking ownership, PII scrubbing, AI endpoints, guide ownership) | 26 probes |
| `npm run test:packages` | `scripts/package-probes.js` — package CRUD with the newer columns + AI generate guards | 24 probes |
| `npm run test:ai` | `scripts/ai-package-builder-tests.js` — stubbed-AI host package builder behavior | 12 checks |
| `node scripts/package-image-probes.js` | package image upload/persistence probes | 16 probes |
| `node scripts/ai-provider-tests.js` | AI service unit tests: retry, fallback, timeouts, structured-output parsing | 15 tests |
| `npm run test:e2e` | `scripts/e2e-smoke.js` — real-login smoke (requires `.env` `E2E_*` credentials; admin checks run only when admin creds are set) | 6 checks |

> **Probe data cleanup:** the probe suites above create throwaway accounts, hosts and packages (emails on the reserved `@touristo.test` domain, host names like `Phase1 Probes …` / `Image Probes …`). Those rows are not test data and should not appear in the app. Run `node scripts/cleanup-probe-data.js` to transactionally remove all probe packages, hosts and users (and their related messages/bookings/reviews) from the database.

---

# ⚙️ Environment Variables

**Server-side only** (root `.env`, loaded by `dotenv` — never send these to the browser):

```text
PORT
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_SSL_MODE
JWT_SECRET
GEMINI_API_KEY          (AI — server-side only)
OPENAI_API_KEY          (AI — server-side only)
AI_PRIMARY_PROVIDER     (optional: "gemini" or "openai" — controls provider order/fallback)
GEMINI_MODEL            (optional override, default gemini-3.5-flash)
OPENAI_MODEL            (optional override, default gpt-4o-mini)
OPENWEATHER_API_KEY
YOUTUBE_API_KEY
SUPABASE_URL
SUPABASE_SECRET_KEY     (alias: SUPABASE_SERVICE_ROLE_KEY — package image storage)
SUPABASE_STORAGE_BUCKET (optional override for the package-image bucket)
CORS_ORIGINS            (comma-separated allowlist; unset = open API, fine locally, must be set in production)
```

**Frontend** (Vite, `frontend/.env`):

```text
VITE_API_URL            (optional; when unset the dev proxy forwards /api to http://localhost:3000)
```

> **Rule:** AI keys must **never** be `VITE_`-prefixed. Any `VITE_` variable is embedded in the public JS bundle. All Gemini/OpenAI calls happen in `touristo/services/aiService.js` on the server.

E2E-only variables (never committed): `E2E_TRAVELER_EMAIL`, `E2E_TRAVELER_PASSWORD`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_BASE_URL`.

---

# 🚀 Roadmap & Next Development Phase

The current MVP provides the core marketplace foundation. The Admin Dashboard (item 1) has already shipped; the remaining phases below focus on transforming the prototype into a stronger production-ready tourism marketplace.

## 👨‍💼 1. Admin Dashboard — ✅ Implemented

The **Admin Dashboard is implemented** — `AdminDashboardScreen.jsx` at `/admin-dashboard`, backed by 15 endpoints under `/api/admin` (all guarded by `requireAdmin`, which re-reads the account role from the database on every request) plus the `admin_audit_log` action trail.

Currently supported:

* Platform statistics and analytics
* User management (including role changes)
* Traveler/host management
* Host verification status decisions
* Package moderation (delete)
* Booking monitoring
* Review moderation (delete)
* Reports review/resolution workflow
* Audit-log inspection

Still PLANNED for the admin area:

* Destination management
* Messaging monitoring where appropriate
* Deeper reports and analytics
* Host verification document review (no document upload exists yet)

---

## 🔐 2. Advanced Authentication & Account Security

The current login system will be strengthened with:

* Forgot Password
* Reset Password
* Password recovery through email
* Strong password requirements
* Better token/session security
* Account security improvements
* Improved login protection
* Better validation
* Secure password reset workflow
* Production-grade authentication handling

---

## 💳 3. Real Payment Integration

Future payment functionality may include:

* JazzCash
* Easypaisa
* Debit/Credit Cards
* Bank payment options
* Secure payment verification
* Payment transaction records
* Booking payment confirmation
* Refund handling
* Payment status synchronization

---

## 🔔 4. Production Notification System

Planned notification improvements:

* Real-time notifications
* Push notifications
* Booking notifications
* Booking status updates
* New message notifications
* Host response notifications
* Trip reminders
* Payment notifications

---

## 🏢 5. Host Verification System

**Partial today:** hosts carry `verification_status` / `verified` columns, admins can set the status from the dashboard, and a verified badge is displayed — but there is **no document upload** and no status history.

Still to be introduced:

* Business verification
* License/registration verification
* Document submission (**not implemented**)
* Request-changes workflow
* Status history/audit for verification decisions (beyond `admin_audit_log`)

---

## 💬 6. Advanced Trip Communication

Future communication features may include:

* Active-trip group chat
* Traveler ↔ assigned guide communication
* Trip-specific conversations
* Booking-linked conversations
* Real-time messaging
* Message notifications
* Rich message attachments where appropriate

Pre-booking communication will remain focused on:

**Traveler ↔ Host**

---

## 📍 7. Advanced Travel Safety

Future safety improvements may include:

* Continuous location sharing
* Emergency contact workflows
* Improved regional emergency information
* Trip safety alerts
* Location-based notifications
* Advanced SOS functionality
* Real emergency-service integrations where technically and legally appropriate

---

## 🗺️ 8. Advanced Maps & Navigation

Future map functionality may include:

* Interactive destination clustering
* Heatmaps (popular areas, review density)
* Route planning with waypoints
* Points-of-interest layer (food, fuel, hospitals, hotels)
* Terrain/satellite layer options
* Live route tracking during active trips
* Travel distance/time estimation
* Road-condition integration
* Turn-by-turn navigation
* Offline-aware map rendering

---

## 📸 9. Production Media Storage

Future versions will introduce proper media infrastructure for:

* Package images
* Host/company images
* Tour guide photos
* Destination media
* User profile images
* Review images

---

## ⭐ 10. Advanced Reviews & Ratings

Future improvements include:

* Complete review submission flow
* Verified booking reviews
* Photo reviews
* Host ratings
* Guide ratings
* Review moderation
* Review reporting
* More advanced AI review insights

---

## 📊 11. Analytics & Marketplace Intelligence

Future analytics may include:

* Traveler behavior analytics
* Package performance
* Host performance
* Booking trends
* Conversion analytics
* Popular destinations
* Popular experiences
* Revenue analytics
* Admin marketplace statistics

---

## 🧠 12. More Advanced AI

Future AI capabilities may include:

* Personalized trip generation
* AI package recommendations
* Budget-aware trip planning
* Personalized destination recommendations
* Smart itinerary generation
* AI travel assistant improvements
* Context-aware recommendations
* Intelligent host/package matching

---

## 👨‍💼 13. AI Admin Assistant

Future admin AI capabilities may include:

* AI-assisted moderation of packages, reviews and reports
* Automated scam/fraud pattern detection
* Anomaly alerts (booking spikes, unusual cancellations, review brigading)
* AI-generated marketplace health reports
* Suggested actions for report resolution
* Automated audit-log summarization
* Host verification pre-screening assistance
* Natural-language admin queries over platform data

---

## 🧭 14. AI Host Copilot

Future AI capabilities for tour companies/hosts may include:

* AI-assisted package writing and improvement suggestions
* Smart pricing suggestions based on comparable packages
* Demand forecasting for destinations/seasons
* Suggested replies to traveler inquiries
* Response-quality and engagement coaching
* AI-generated itinerary drafts for packages
* Review-response drafting
* Photo/caption suggestions for package listings
* Performance insights and growth recommendations

---

## 🌦️ 15. AI Weather Intelligence

Future AI-powered weather capabilities may include:

* AI-interpreted weather impact summaries for trips
* Route-specific weather risk assessment
* Best-time-to-travel suggestions powered by historical weather patterns
* Proactive weather alerts for active/upcoming trips
* Mountain pass and road-condition predictions
* Personalized packing and preparation suggestions
* Weather-based destination recommendations
* Seasonal travel planning intelligence

---

## 💎 16. Hidden Local Destinations

Future destination-discovery capabilities may include:

* Curated discovery of off-the-beaten-path Pakistani destinations
* AI-recommended hidden local gems based on traveler preferences
* Lesser-known valley, lake, fort and cultural-site listings
* Community/local-expert contributed destination suggestions
* AI-generated destination guides for emerging locations
* Preference-based matching to secret/hidden spots
* Off-season and crowd-avoidance recommendations
* Location-based "near me" hidden destination radar

---

## 📴 17. Offline Maps & Offline Features

Future offline capabilities may include:

* Offline map downloads for destinations and routes
* Cached package and trip information without connectivity
* Offline-accessible itinerary and booking details
* Offline emergency information access
* Background location logging with sync-on-reconnect
* Offline draft messages that send when back online
* Offline SOS with deferred delivery
* Cached weather data for offline viewing
* Reduced-data mode for low-bandwidth areas

---

# 🛡️ Security & Reliability

The backend currently includes security-related measures such as:

* JWT authentication
* bcrypt password hashing
* Helmet security headers
* CORS configuration
* Rate limiting
* Login protection
* Input validation
* Parameterized PostgreSQL queries
* Foreign-key constraints
* Protected API routes
* Role-based access control
* Error handling

Security will continue to be strengthened as the platform moves toward production.

---

# 📱 Responsive Design

Touristo follows a **mobile-first responsive design approach** while supporting desktop layouts.

The UI includes:

* Responsive navigation
* Bottom navigation for travelers (Home, Search, AI Planner, **SOS**, Profile)
* Role-specific navigation
* Responsive package grids
* Destination cards
* Host cards
* Guide cards
* Responsive messaging interface
* Mobile-friendly booking flow
* Responsive dashboards

---

# ⚠️ Current MVP Limitations

The following areas are intentionally considered future development rather than completed production functionality:

* Live payment gateway integration
* Host verification document upload (status columns + admin decisions exist; document upload does not)
* Forgot/reset password system
* Production-grade authentication hardening
* Full host verification workflow
* Real-time push notifications
* Advanced real-time messaging
* Active-trip guide/group communication
* Continuous emergency location tracking
* Real emergency dispatch integration
* Full turn-by-turn navigation
* Production media/file storage
* Complete review submission and moderation system (basic submission, admin deletion and report triage exist; verified-booking reviews, photo reviews and full moderation tooling are PLANNED)
* Advanced analytics dashboard
* Unit/integration test framework (probe and smoke suites exist — see Testing)
* Advanced AI package personalization

---

# 🎯 Product Vision

Touristo aims to become a trusted digital marketplace for **domestic tourism in Pakistan**.

The long-term vision is to provide:

* Trusted tour-company discovery
* Verified tourism businesses
* Transparent package comparison
* Secure bookings
* Reliable traveler-host communication
* Personalized recommendations
* AI-powered trip planning
* AI admin assistant and AI host copilot
* AI weather intelligence
* Hidden local destination discovery
* Offline maps and offline-first travel features
* Advanced maps and navigation
* Destination discovery
* Tour guide discovery
* Travel safety tools
* Secure payments
* Strong account security
* Admin-controlled marketplace management
* Scalable tourism infrastructure

The platform is designed to bring travelers and tourism businesses together through one centralized digital marketplace.

---

# 📚 Related Documentation

The repository also contains supporting project documentation:

* `PRD.md` — Product Requirements Document
* `TRD.md` — Technical Requirements Document
* `Architecture.md` — Architecture map
* `BackendSchema.md` — Database and backend schema
* `AppFlow.md` — Application flow
* `ImplementationPlan.md` — Development planning
* `IMPLEMENTATION_STATUS.md` — living status tracker
* `PRODUCTION_GAP_ANALYSIS.md` — point-in-time baseline audit (2026-10-06)
* `UIUXDesignBrief.md` — UI/UX direction

---

# 👩‍💻 Development Status

**Project:** Touristo
**Type:** Full-Stack Pakistan Tourism Marketplace
**Status:** Active Development / MVP
**Frontend:** React + Vite + Tailwind CSS
**Backend:** Node.js + Express
**Database:** Supabase PostgreSQL
**AI:** Google Gemini + OpenAI (server-side via `touristo/services/aiService.js`)
**Weather:** OpenWeatherMap
**Maps:** Leaflet + OpenStreetMap
**Deployment:** Vercel

Touristo is currently being developed toward a more complete, secure and production-ready tourism marketplace.

---

# 📜 License

This project currently uses the license configuration specified in `package.json`.

License: **ISC**
