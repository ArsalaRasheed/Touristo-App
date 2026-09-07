# Touristo 🇵🇰

## Pakistan Tourism Marketplace

Touristo is a full-stack tourism marketplace designed to connect **travelers with tour companies across Pakistan**. The platform allows travelers to discover destinations, explore tour packages, compare hosts and guides, plan trips with AI assistance, make bookings, communicate with tour companies, manage trips, and access travel-safety features.

Touristo follows an **asset-light marketplace model**: Touristo does not operate tours itself. Instead, it provides a digital marketplace where travelers can discover and communicate with tour companies and hosts.

> **Project Status:** Active Development — Full-Stack MVP
> **Primary Focus:** Pakistan Domestic Tourism Marketplace

---

# ✨ Current Features

## 👤 Authentication & User Roles

Touristo currently supports two primary user roles:

* **Traveler**
* **Tour Company / Host**

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
* Compare guide information
* Use AI Trip Planner
* View package reviews and ratings
* View AI-generated review summaries where available
* Make package bookings
* Manage trips through My Trips
* Communicate with tour companies/hosts
* Access weather information
* Use Emergency SOS/location-sharing features
* Manage profile and account settings
* Receive notification information through the application interface

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
* Package comparison indicators
* Experience-based discovery

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
* Add special requests
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

Touristo includes an AI-powered travel assistant using the **Google Gemini API**.

Travelers can:

* Ask travel questions
* Ask for destination recommendations
* Ask for trip-planning suggestions
* Use English
* Use Urdu
* Use Roman Urdu
* Receive concise travel recommendations

The backend provides:

`POST /api/trip-planner`

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
* Compare guides
* Search/filter guides
* Receive preference-based guide matching

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

Touristo provides an Emergency SOS interface designed to support traveler safety.

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

Some settings and notification functionality is still being expanded toward persistent backend-based behavior.

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

* Google Gemini API
* AI Trip Planner
* AI Review Summarization
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
│   └── utils/
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
| `users`             | Traveler and host accounts         |
| `hosts`             | Tour company profiles              |
| `destinations`      | Pakistani destination information  |
| `packages`          | Tour package listings              |
| `bookings`          | Traveler bookings                  |
| `reviews`           | Package reviews and ratings        |
| `review_summaries`  | AI-generated review summaries      |
| `tour_guides`       | Tour guides associated with hosts  |
| `messages`          | Marketplace messages               |
| `marketplace_chats` | Traveler-host conversation records |

Foreign-key relationships connect users, hosts, packages, bookings, reviews, guides and marketplace conversations.

---

# 🔐 Authentication Architecture

The current authentication flow is:

```text
Traveler / Host
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
       └── Host
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

---

# 🚀 Next Development Phase

The current MVP provides the core marketplace foundation. The next phase will focus on transforming the prototype into a stronger production-ready tourism marketplace.

## 👨‍💼 1. Admin Dashboard

A dedicated **Admin Dashboard** will be developed in the next phase.

Planned functionality includes:

* Admin authentication
* Admin dashboard
* User management
* Traveler management
* Host management
* Tour company management
* Host verification/approval
* Package moderation
* Destination management
* Booking monitoring
* Review moderation
* Guide management
* Messaging monitoring where appropriate
* Platform statistics
* Reports and analytics
* Platform-level controls

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

A production-grade host verification workflow will be introduced.

Potential features:

* Business verification
* License/registration verification
* Document submission
* Admin review
* Approval/rejection workflow
* Verified host badge
* Host verification status tracking

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

## 🗺️ 8. Advanced Navigation

Future map functionality may include:

* Route planning
* Turn-by-turn navigation
* Live route tracking
* Travel distance/time estimation
* Road-condition integration
* Offline travel maps

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
* Bottom navigation for travelers
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
* Advanced admin dashboard
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
* Complete review submission and moderation system
* Advanced analytics dashboard
* Full automated testing
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
* `BackendSchema.md` — Database and backend schema
* `AppFlow.md` — Application flow
* `ImplementationPlan.md` — Development planning
* `UIUXDesignBrief.md` — UI/UX direction

---

# 👩‍💻 Development Status

**Project:** Touristo
**Type:** Full-Stack Pakistan Tourism Marketplace
**Status:** Active Development / MVP
**Frontend:** React + Vite + Tailwind CSS
**Backend:** Node.js + Express
**Database:** Supabase PostgreSQL
**AI:** Google Gemini
**Weather:** OpenWeatherMap
**Maps:** Leaflet + OpenStreetMap
**Deployment:** Vercel

Touristo is currently being developed toward a more complete, secure and production-ready tourism marketplace.

---

# 📜 License

This project currently uses the license configuration specified in `package.json`.

License: **ISC**
