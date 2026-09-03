Touristo 🇵🇰

Pakistan Tourism Marketplace

Touristo is a mobile-first tourism marketplace for Pakistan that connects travelers with tour companies and helps users discover destinations, compare tour packages and guides, plan trips, make bookings, manage trips, and access travel-safety information.

Touristo follows an asset-light marketplace model: the platform connects travelers with tour companies rather than operating tours itself.

Current implementation note: This repository contains a working full-stack prototype/MVP. Some features are fully connected to the backend/database, while others are UI/demo implementations or simplified versions of the planned production functionality. This README describes what is actually implemented in the current codebase rather than only the original product plan.

✨ Current Features

👤 Authentication & User Roles

Traveler and Tour Company/Host registration flows.

Email/password login.

Password hashing with bcrypt.

JWT-based authentication.

Authentication state persisted in browser localStorage.

Role-based routing for:

Travelers

Tour companies/hosts

Protected routes using React ProtectedRoute.

Host registration creates a linked company/host profile.

Host-specific dashboard and management screens.

🏠 Traveler Experience

Splash screen.

Onboarding screen.

Home/discovery experience.

Search for packages and tour companies.

Destination discovery.

Destination detail/explore pages.

Package detail pages.

Host/company profile pages.

Experiences section.

My Trips section.

Profile and settings screens.

Notifications screen.

🔎 Search & Discovery

Search packages by title, destination, location and related text.

Search/discover tour companies.

Destination-based package discovery.

Package cards with price, duration and rating information.

Host ranking information exposed by the backend.

Featured/recommended package sections on the home screen.

Top Match and Best Value style comparison badges are supported in the recommendation/featured-package flow.

🗺️ Pakistan Destinations

The application contains seeded tourism destinations including:

Hunza Valley

Skardu

Swat Valley

Naran

Babusar Top

Lahore

Mohenjo-daro

Gwadar

Destination data includes, where available:

Category

History/background

Culture/traditions

Famous spots

Local food

Latitude/longitude

📦 Tour Package Management

Travelers can:

View package details.

See package price and duration.

View group size.

View inclusions/exclusions.

View itinerary information.

View host/company information.

View package reviews and ratings.

View AI-generated review summaries when available.

Hosts can:

Open a host dashboard.

Create tour packages.

Add package title, description, price and duration.

Add location and availability information.

Add inclusions and exclusions.

Manage their package list.

The backend provides package create, read, update and delete APIs.

🧳 Booking System

Travelers can:

Select a package.

Select number of travelers.

Select a start date.

Enter special requests.

Select a displayed payment method.

See calculated total price.

Submit a booking.

View their trips/bookings in My Trips.

Hosts can:

View bookings associated with their packages.

See traveler/package information through the host bookings flow.

Payment status: The current prototype stores a payment status and presents payment-method choices, but it does not contain a live payment-gateway integration such as Stripe, JazzCash, Easypaisa or a bank API. Production payment processing still needs to be integrated.

🤖 AI Trip Planner

Touristo includes an AI travel-planning chatbot powered by Google Gemini.

Implemented behavior:

Users can ask travel questions.

The assistant is instructed to respond in the same language/script used by the user.

Supports English, Urdu script and Roman Urdu prompts.

Provides concise destination/travel recommendations.

Uses a chat-style interface with loading/error handling.

Backend endpoint: POST /api/trip-planner.

⭐ AI Review Summarization

Package detail pages can receive an AI-generated review summary.

Implemented backend behavior:

Reads package reviews from PostgreSQL.

Sends review content to Gemini.

Generates a short summary covering:

Overall sentiment

Positive highlights

Recurring concerns/suggestions

Stores/caches the generated summary in review_summaries.

Provides fallback messages when AI is unavailable.

🏆 Host Ranking

The backend includes a host-ranking utility that calculates a ranking score using:

Review score: 40%

Response time: 30%

Completion rate: 30%

Host badges include:

Top Rated

Highly Recommended

Rising Host

Trusted Operator

New Host

The host discovery/profile APIs expose ranking-related information such as rating, completion rate, response time and ranking score.

Prototype limitation: Average response time is currently a placeholder value because response-time tracking is not yet stored in the database.

💡 Recommendations

The backend includes personalized/trending package recommendations.

Current logic:

Check the user's previous bookings.

Use previously visited/booked destinations as a basis for similar package recommendations.

Exclude packages already booked by the user where applicable.

Fall back to trending/popular packages when history is unavailable.

Home-page recommendations can receive comparison badges such as Top Match.

🧭 Tour Guide Features

Travelers can:

Browse available tour guides.

Compare guides.

Search/filter guide matching using specialty text.

See guide ratings.

Get a best-match ordering based on preference matching and rating.

Hosts can:

Open Manage Tour Guides.

Add a guide.

Add guide specialty.

Add an optional photo URL.

View guides belonging to their company.

Delete guides.

💬 Tour Guide Messaging

A messaging system is implemented with:

Conversation retrieval between sender/receiver.

Sending messages.

Database-backed message storage.

Authentication middleware on message endpoints.

The host profile includes the tour-guide communication flow.

🌦️ Weather & Road Status

Touristo includes a weather screen with location selection for Pakistani locations.

Implemented backend integration:

OpenWeatherMap API.

Current weather information.

Humidity.

Wind speed.

Feels-like temperature.

Five-day forecast processing.

Simplified road-status calculation.

Road status is currently categorized as:

Clear

Caution

Unknown

Weather data falls back to mock data if the weather API key is unavailable or the external API request fails.

🚨 Emergency SOS

The Emergency SOS screen provides a travel-safety interface with:

Browser geolocation access.

Current latitude/longitude display.

Google Maps location link generation.

Location sharing through clipboard/Google Maps.

Regional tourism/emergency contact information.

Location-based nearest-region matching logic in the backend helper.

Current limitation: This is not yet a real emergency dispatch/SOS service. It does not automatically contact emergency authorities or continuously transmit a user's location.

📍 Live Map

A reusable Leaflet-based map component is included.

Implemented functionality:

OpenStreetMap tiles.

User-location marker.

Destination marker.

Automatic map centering/fitting around locations.

Dynamic loading of Leaflet assets.

The current implementation is primarily a map/self-orientation component rather than a full turn-by-turn navigation system.

⚙️ Profile, Settings & Notifications

The application includes screens for:

User profile.

Host/company information in host profiles.

Account settings.

Profile/activity visibility preferences.

Notification preferences.

Language preference UI.

Currency preference UI.

Notifications.

About Touristo.

Contact Touristo.

Some of these settings/notifications are currently frontend/demo state and are not yet persisted to the backend.

🛠️ Technology Stack

Frontend

React 19

Vite 8

React Router

Tailwind CSS 3

Responsive/mobile-first UI

Browser localStorage for authentication persistence

Backend

Node.js

Express 5

REST API architecture

jsonwebtoken for JWT authentication

bcrypt for password hashing

express-validator for validation utilities

helmet for security headers

cors for cross-origin requests

morgan for HTTP request logging

express-rate-limit for API/login rate limiting

Database

Supabase PostgreSQL

PostgreSQL accessed from the Node.js backend using the pg package.

Database schema is created/verified by the application's schema setup utility.

Database indexes are created for frequently queried relationships.

The application does not use the Supabase JavaScript client for its main database operations; it connects to the Supabase PostgreSQL database through PostgreSQL connection credentials.

AI

Google Gemini API

AI Trip Planner

AI Review Summarization

External Services / APIs

OpenWeatherMap — weather and forecast data.

OpenStreetMap + Leaflet — maps.

Nominatim — location lookup used by the My Trips flow.

Google Maps URLs — emergency location sharing.

Deployment

Vercel — deployment target for the frontend.

Supabase — hosted PostgreSQL database.

The current repository contains a standard Express Node.js backend and a Vite frontend. The frontend currently contains several development-time  API URLs, so these must be replaced with the deployed backend URL (or centralized into a Vite environment variable) before the production Vercel build can communicate with a remotely hosted backend.

📁 Project Structure

Touristo-App/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AITripPlannerScreen.jsx
│   │   │   ├── BookingScreen.jsx
│   │   │   ├── CreateEditPackageScreen.jsx
│   │   │   ├── DestinationExploreScreen.jsx
│   │   │   ├── DestinationsScreen.jsx
│   │   │   ├── EmergencySOSScreen.jsx
│   │   │   ├── GuideComparisonScreen.jsx
│   │   │   ├── HostDashboardScreen.jsx
│   │   │   ├── HostDiscoveryScreen.jsx
│   │   │   ├── HostProfileScreen.jsx
│   │   │   ├── HostBookingsScreen.jsx
│   │   │   ├── ManageTourGuidesScreen.jsx
│   │   │   ├── MyPackagesScreen.jsx
│   │   │   ├── MyTripsScreen.jsx
│   │   │   ├── PackageDetailScreen.jsx
│   │   │   ├── ProfileScreen.jsx
│   │   │   ├── SearchScreen.jsx
│   │   │   ├── WeatherScreen.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── utils/
│   │   │   └── aiRecommendation.js
│   │   └── App.jsx
│   └── package.json
│
├── touristo/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── bookingController.js
│   │   ├── destinationController.js
│   │   ├── generalController.js
│   │   ├── hostController.js
│   │   ├── packageController.js
│   │   ├── reviewController.js
│   │   ├── tripPlannerController.js
│   │   ├── userController.js
│   │   └── weatherController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── Host.js
│   │   ├── Message.js
│   │   ├── Package.js
│   │   ├── Review.js
│   │   ├── TourGuide.js
│   │   └── User.js
│   ├── routes/
│   │   ├── bookingRoutes.js
│   │   ├── destinationRoutes.js
│   │   ├── hostBookingRoutes.js
│   │   ├── hostRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── packageRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── tourGuideRoutes.js
│   │   ├── tripPlannerRoutes.js
│   │   ├── userRoutes.js
│   │   └── weatherRoutes.js
│   └── utils/
│       ├── emergencyHelper.js
│       ├── hostRanking.js
│       ├── packageComparison.js
│       ├── recommendations.js
│       ├── reviewSummarizer.js
│       ├── seedData.js
│       ├── weatherRoadStatus.js
│       └── ...
│
├── index.js
├── BackendSchema.md
├── AppFlow.md
├── PRD.md
├── TRD.md
└── README.md

🗃️ Database Model

The current schema contains the following main tables:

Table

Purpose

users

Traveler and host accounts

hosts

Tour company profiles linked to users

destinations

Pakistani destinations and destination metadata

packages

Tour packages/listings created by hosts

bookings

Traveler bookings

reviews

Package reviews and ratings

review_summaries

Cached AI review summaries

tour_guides

Guides associated with tour companies

messages

User/guide conversation messages

Foreign-key relationships connect users, hosts, packages, bookings, reviews, guides and messages.

The application also creates indexes for common package, booking, review, destination, guide and message lookups.

🔐 Authentication Flow

User
  │
  ├── Traveler Signup
  │       └── users record
  │
  └── Host Signup
          ├── users record
          └── hosts record linked by user_id

Login
  │
  ├── Email + Password
  ├── bcrypt password verification
  ├── JWT generated by backend
  └── Token + user saved in localStorage

Protected React Route
  │
  └── Role check
       ├── traveler
       └── host

JWT tokens are currently configured to expire after 7 days.

🔌 Main API Endpoints

Users

GET    /api/users
GET    /api/users/:id
POST   /api/users
POST   /api/users/login
PUT    /api/users/:id
DELETE /api/users/:id

Hosts

GET    /api/hosts
GET    /api/hosts/:id
GET    /api/hosts/user/:id
POST   /api/hosts
PUT    /api/hosts/:id
DELETE /api/hosts/:id

Packages

GET    /api/packages
GET    /api/packages/:id
GET    /api/packages/destination/:destinationId
GET    /api/packages/host/:hostId
POST   /api/packages
PUT    /api/packages/:id
DELETE /api/packages/:id

Bookings

GET    /api/bookings
GET    /api/bookings/:id
GET    /api/bookings/user/:userId
GET    /api/bookings/host/:hostId
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id

Destinations

GET    /api/destinations
GET    /api/destinations/:id
GET    /api/destinations/name/:name

Reviews

GET    /api/reviews
GET    /api/reviews/:id
POST   /api/reviews
PATCH  /api/reviews/:id
DELETE /api/reviews/:id

Tour Guides

GET    /api/tour-guides
GET    /api/tour-guides/:id
GET    /api/tour-guides/host/:hostId
POST   /api/tour-guides
PUT    /api/tour-guides/:id
DELETE /api/tour-guides/:id

Messaging

GET    /api/messages/conversation/:senderId/:receiverId
POST   /api/messages

AI Trip Planner

POST   /api/trip-planner

Weather

GET    /api/weather/coordinates?lat=<lat>&lon=<lon>

Home / Recommendations

GET    /api/homepage-data

🚀 Local Development Setup

1. Clone/download the project

git clone <your-repository-url>
cd Touristo-App

2. Install backend dependencies

npm install

3. Install frontend dependencies

cd frontend
npm install
cd ..

4. Configure environment variables

Create a .env file in the project root.

Example:

PORT=3000

# Supabase PostgreSQL connection
DB_HOST=<supabase-db-host>
DB_PORT=5432
DB_NAME=<database-name>
DB_USER=<database-user>
DB_PASSWORD=<database-password>
DB_SSL_MODE=require

# Authentication
JWT_SECRET=<strong-random-secret>

# AI
GEMINI_API_KEY=<your-gemini-api-key>

# Weather
OPENWEATHER_API_KEY=<your-openweathermap-api-key>

For the frontend AI helper, the Vite environment variable used by the current code is:

VITE_GEMINI_API_KEY=<your-gemini-api-key>

Never commit real API keys, database passwords or JWT secrets to GitHub.

5. Start the backend

From the project root:

npm run dev

Backend default:



6. Start the frontend

In another terminal:

cd frontend
npm run dev

Vite will display the local frontend URL in the terminal.

🗄️ Supabase Database

Touristo currently uses Supabase as the PostgreSQL database provider.

The backend uses the standard PostgreSQL driver (pg) and connects using database environment variables.

On backend startup, the application attempts to:

Connect to the database.

Ensure required tables exist.

Create missing indexes.

Seed initial tourism data when applicable.

The schema setup is handled by:

touristo/utils/schemaSetup.js

Initial demo/seed records are handled by:

touristo/utils/seedData.js

☁️ Vercel Deployment

The frontend is intended to be deployed on Vercel.

Recommended production architecture:

                  ┌─────────────────────┐
                  │       Vercel        │
                  │   React + Vite UI   │
                  └──────────┬──────────┘
                             │
                             │ HTTPS API calls
                             ▼
                  ┌─────────────────────┐
                  │   Node + Express    │
                  │      Backend        │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │       Supabase      │
                  │    PostgreSQL DB    │
                  └─────────────────────┘

Important production task

The current frontend source contains development URLs such as:

/api/...

For Vercel production, these should be centralized into an environment variable, for example:

VITE_API_BASE_URL=https://your-backend-domain.com

Then frontend requests should use:

`${import.meta.env.VITE_API_BASE_URL}/api/...`

This is necessary when the backend is deployed separately from the Vercel frontend.

🛡️ Security & Reliability Measures

The backend currently includes:

JWT authentication.

Password hashing with bcrypt.

Helmet security headers.

CORS configuration.

Login rate limiting.

General API rate limiting.

Input validation/sanitization in important controllers.

PostgreSQL parameterized queries.

Foreign-key relationships.

Error handling and fallback behavior for several external services.

📱 Responsive Design

Touristo is designed with a mobile-first approach and also supports larger desktop layouts.

The UI uses:

Tailwind CSS responsive breakpoints.

Card-based discovery layouts.

Bottom navigation for application navigation.

Protected role-specific navigation.

Responsive grids for packages, destinations and guides.

🧪 Current Prototype / Production Gaps

The following items are not yet full production implementations and should not be described as completed production features:

Live payment gateway integration.

Real-time emergency dispatch/SOS service.

Continuous background live-location tracking.

Real-time push notification infrastructure.

Persistent settings/preferences backend storage.

Full review submission UI in the current frontend flow.

Production-grade host verification workflow/approval backend.

Real host response-time tracking; current ranking uses a placeholder response-time value.

Full AI package recommendations directly generated by the Trip Planner; the current Trip Planner returns AI advice and the backend recommendation system is separate.

Complete turn-by-turn navigation.

Production file/image upload storage.

Centralized production API base URL for all frontend requests.

Full automated test suite.

These are future improvements rather than claims of functionality that is already complete.

🧭 Product Direction

The long-term Touristo product is intended to provide:

Trusted tour-company discovery.

Better package comparison.

Personalized travel recommendations.

AI-assisted trip planning.

Better destination discovery.

Travel safety information.

Reliable booking and communication between travelers and tour companies.

A scalable marketplace focused initially on tourism within Pakistan.

📄 Related Documentation

PRD.md — Product requirements and product vision.

TRD.md — Technical requirements.

BackendSchema.md — Backend/database schema information.

AppFlow.md — Application flow.

ImplementationPlan.md — Implementation planning.

UIUXDesignBrief.md — UI/UX design direction.

👩‍💻 Development Status

Project: Touristo

Type: Full-stack Pakistan tourism marketplace MVP/prototype

Frontend: React + Vite + Tailwind CSS

Backend: Node.js + Express

Database: Supabase PostgreSQL

AI: Google Gemini

Weather: OpenWeatherMap

Maps: Leaflet + OpenStreetMap

Frontend Deployment: Vercel

Status: Active development

📜 License

This project currently uses the license configuration specified in package.json (ISC) unless a separate project license is added.