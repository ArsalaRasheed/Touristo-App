# Touristo — App Flow & Navigation Logic

## 1. Introduction

This document describes the current navigation flow and major user journeys implemented in the Touristo application.

Touristo is a Pakistan-first tourism marketplace connecting travelers with tour companies. The application supports traveler discovery, package browsing, bookings, trip management, AI trip planning, host communication, tour-guide discovery, weather information, and emergency SOS functionality.

The application has two main user roles:

* Traveler
* Tour Company / Host

---

## 2. Authentication Flow

### 2.1 Traveler

1. User opens Touristo.
2. New users can register as a Traveler.
3. Existing users can log in using email and password.
4. The backend validates credentials and generates a JWT.
5. The frontend stores the authenticated user and token locally.
6. The user is redirected to the Traveler experience.

### 2.2 Tour Company / Host

1. User selects the Tour Company / Host registration option.
2. User creates an account.
3. A linked host/company profile is created.
4. After authentication, the user is redirected to the Host Dashboard.
5. Host-only routes are protected through role-based routing.

---

## 3. Traveler Navigation

The primary Traveler navigation contains:

* Home
* Search
* AI Trip Planner
* SOS
* Profile

Additional features are accessed through screens, cards, package pages, and the Profile area.

### 3.1 Home

The Home screen is the main discovery hub.

Users can:

* Browse featured destinations.
* Explore recommended tour packages.
* Discover popular destinations.
* Search for packages and tour companies.
* Open destination details.
* Open package details.
* Access the AI Trip Planner.
* Open notifications.
* Explore tour companies and hosts.

---

## 4. Search & Discovery Flow

### Search

User selects Search.

The Search screen allows users to search for:

* Tour packages
* Destinations
* Tour companies / hosts
* Related travel content

### Destination Discovery

User selects a destination.

Result:

`Destination Explore Page`

The destination page can display:

* Destination information
* History
* Culture
* Famous places
* Local food
* Available tour packages

### Package Discovery

User selects a package.

Result:

`Package Detail`

---

## 5. Experience Discovery

The Experiences section groups travel activities into categories such as:

* Mountain Adventures
* Cultural Tours
* Coastal Getaways
* Wildlife Safaris
* Food & Culinary
* Adventure Sports

Selecting an experience opens an informational experience page and, where relevant, connects the user with matching packages.

---

## 6. Package Flow

### Package Detail

The Package Detail screen provides:

* Package title
* Package description
* Price
* Duration
* Location
* Host/company information
* Verification information
* Rating
* Inclusions
* Exclusions
* Itinerary
* Reviews
* Tour-guide information

Available actions include:

* Book Now
* Save package
* Chat with Host
* View Host Profile

### Traveler → Host Communication

Before booking, communication is between:

`Traveler ↔ Tour Company / Host`

The traveler can start a conversation from the package detail page.

The conversation is stored in the backend and remains associated with the marketplace conversation even if package information changes later.

Tour guides are not used as pre-booking chat contacts.

---

## 7. Booking Flow

1. Traveler opens a package.
2. Traveler selects `Book Now`.
3. Traveler enters booking information such as:

   * Number of travelers
   * Start/travel date
   * Special requests
   * Available payment-method selection
4. The system calculates the booking total.
5. The booking is submitted to the backend.
6. The booking becomes available in `My Trips`.
7. The host can view bookings associated with their packages.

### Payment Status

The current prototype stores payment-related status and presents payment-method choices.

A live external payment gateway such as Stripe, JazzCash, Easypaisa, or a bank API is not currently integrated.

---

## 8. My Trips

`My Trips` contains the traveler's booking/trip information.

Users can:

* View upcoming trips.
* View booking information.
* View package details.
* View booking status.
* Access relevant travel tools.

---

## 9. AI Trip Planner

The Traveler can open the AI Trip Planner from the main navigation.

The AI assistant can:

* Answer travel questions.
* Suggest destinations.
* Provide travel recommendations.
* Respond in the language/script used by the user.
* Support English, Urdu and Roman Urdu prompts.

The AI Trip Planner is powered through the backend Gemini integration.

---

## 10. Host Discovery & Host Profile

Travelers can discover tour companies and open their host profiles.

Host profiles can provide:

* Company name
* Description
* Location
* Verification status
* Rating
* Package listings
* Tour-guide information

A traveler can open a package directly from the host profile.

---

## 11. Tour Guide Flow

Travelers can:

* Browse tour guides.
* View guide specialties.
* View guide ratings.
* Compare guides.
* Receive preference-based guide matching.

Hosts can:

* Add tour guides.
* Add guide specialties.
* Add optional guide photo URLs.
* View their guides.
* Delete guides.

### Guide Communication Rule

Tour guides are currently informational/matching resources.

Pre-booking chat is restricted to:

`Traveler ↔ Host`

Guide communication can be expanded for active/paid trips in a future phase.

---

## 12. Messaging & Inbox

The application provides a marketplace inbox for authenticated travelers and hosts.

### Traveler

Traveler can open:

`Profile → Messages & Inbox`

or start a conversation directly from:

`Package Detail → Chat with Host`

### Host

Host can open:

`Host Dashboard → Customer Inquiries`

### Conversation

The current messaging architecture supports:

* Traveler ↔ Host conversations
* Conversation persistence
* Text messages
* Message history
* Read/unread state
* Unread message counts
* Package context
* Host branding/information in the inbox

The system does not currently claim voice calls, voice notes, or file attachments.

---

## 13. Weather & Road Status

Travelers can open the Weather screen to view weather information for supported Pakistani locations.

Information can include:

* Current temperature
* Feels-like temperature
* Humidity
* Wind speed
* Forecast
* Simplified road-status information

Weather data uses OpenWeatherMap where available, with fallback data when the external API is unavailable.

---

## 14. Emergency SOS

The SOS screen provides travel-safety functionality.

Users can:

* Request their current location.
* View latitude and longitude.
* Generate a Google Maps location link.
* Share/copy their location.
* Access regional emergency/tourism contact information.

The current SOS feature does not automatically contact emergency authorities or continuously track the user's location.

---

## 15. Host Dashboard Flow

Authenticated hosts can access:

### Host Dashboard

* Business overview
* Customer inquiries
* Manage tour guides
* Package management
* Booking management

### My Packages

Hosts can:

* View packages
* Create packages
* Edit packages
* Delete/manage packages

### Host Bookings

Hosts can:

* View bookings
* Review traveler/package information
* Manage booking-related information

---

## 16. Profile & Settings

Traveler Profile provides access to:

* Personal information
* My Trips
* Messages & Inbox
* Settings
* Notifications
* About Touristo
* Contact Touristo

Host profiles additionally provide company-related information and host management access where applicable.

---

## 17. Current High-Level User Journey

### Traveler

`Open Touristo`
→ `Login / Register`
→ `Home`
→ `Search / Explore`
→ `Destination`
→ `Package Detail`
→ `Chat with Host or Book`
→ `Booking`
→ `My Trips`

Additional journeys:

`Home → AI Trip Planner`

`Home → SOS`

`Profile → Messages & Inbox`

### Host

`Register / Login`
→ `Host Dashboard`
→ `Manage Packages`
→ `Manage Bookings`
→ `Customer Inquiries / Inbox`
→ `Manage Tour Guides`

---

## 18. Future Extensions

Planned future improvements include:

* Production payment gateway integration
* Advanced authentication including password recovery
* Real-time notifications
* Active-trip communication
* Guide/group communication after booking
* Admin dashboard
* Host verification workflow
* Advanced analytics
* Production media storage
* Enhanced safety and navigation features
