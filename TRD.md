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

* Google Gemini API

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
/api/packages
/api/bookings
/api/destinations
/api/reviews
/api/tour-guides
/api/messages
/api/trip-planner
/api/weather
/api/homepage-data
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

Trip Planner:

```text
POST /api/trip-planner
```

The backend sends travel-planning requests to Google Gemini and returns the generated response.

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
* Gemini API key
* Weather API key

in secure environment configuration.

---

# 15. Future Technical Requirements

Future production development may include:

* Payment gateway integration
* Password recovery infrastructure
* Email verification
* Real-time notifications
* Production media storage
* Admin dashboard
* Advanced monitoring
* Automated testing
* Logging/observability
* Enhanced active-trip communication
* Guide/group communication
* Production security audit
