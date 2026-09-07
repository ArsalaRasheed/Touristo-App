# Touristo — Product Requirements Document

## 1. Product Overview

Touristo is a Pakistan-first tourism marketplace that connects travelers with tour companies and tour guides.

The platform allows travelers to discover Pakistani destinations, explore tour packages, compare hosts and guides, plan trips using AI, make bookings, manage trips, communicate with hosts, and access travel-safety tools.

Touristo follows an asset-light marketplace model. The platform does not operate tours itself; it connects travelers with tour companies that provide tour packages.

---

# 2. Vision

To create a trusted digital marketplace for domestic tourism in Pakistan where travelers can discover, compare, communicate with, and book tour packages through one platform.

---

# 3. Target Users

## 3.1 Travelers

Travelers looking for:

* Pakistani destinations
* Tour packages
* Tour companies
* Tour guides
* Travel planning
* Booking management
* Safety information

## 3.2 Tour Companies / Hosts

Tour companies looking to:

* Showcase tour packages
* Reach travelers
* Manage packages
* Manage bookings
* Manage tour guides
* Communicate with potential customers

---

# 4. Core Product Goals

### Discover

Help travelers discover destinations, tour companies, guides, and packages.

### Compare

Allow users to evaluate packages, hosts, and guides using available information such as price, duration, ratings, and verification.

### Plan

Provide AI-powered travel planning assistance.

### Book

Allow travelers to submit tour-package bookings.

### Communicate

Provide direct Traveler ↔ Host communication.

### Manage

Allow travelers to manage their trips and allow hosts to manage packages and bookings.

### Protect

Provide weather information, location sharing, and emergency SOS tools.

---

# 5. Core Features

## 5.1 Authentication

* Traveler registration
* Host registration
* Email/password login
* JWT authentication
* Role-based access
* Protected routes
* Persistent browser authentication state

Future:

* Forgot password
* Password reset
* Email verification
* Additional authentication providers

---

## 5.2 Destination Discovery

Travelers can browse Pakistani destinations.

Current seeded destinations:

* Hunza Valley
* Skardu
* Swat Valley
* Naran
* Babusar Top
* Lahore
* Mohenjo-daro
* Gwadar

Destination pages can include:

* History
* Culture
* Famous spots
* Local food
* Location
* Available packages

---

## 5.3 Package Marketplace

Travelers can:

* Browse packages
* View package details
* View pricing
* View duration
* View itinerary
* View inclusions/exclusions
* View host information
* View ratings/reviews
* View tour-guide information
* Save packages
* Start bookings
* Chat with the host

Hosts can:

* Create packages
* Edit packages
* Manage packages
* Add pricing
* Add duration
* Add itinerary
* Add inclusions/exclusions
* Add availability information

---

# 6. Booking Requirements

Travelers can:

1. Select a package.
2. Select number of travelers.
3. Select travel/start date.
4. Add special requests.
5. Select an available displayed payment method.
6. Review the calculated total.
7. Submit the booking.
8. View the booking in My Trips.

Hosts can view bookings associated with their packages.

### Payment Requirement

The current MVP does not contain a live payment gateway.

Production payment integration is a future requirement.

---

# 7. Messaging Requirements

The messaging system is designed around:

`Traveler ↔ Host`

Travelers can start a conversation from a package page.

Hosts can manage customer inquiries from their dashboard/inbox.

Messaging currently supports:

* Conversation creation
* Text messages
* Message history
* Read/unread state
* Unread counts
* Package context

Tour-guide chat is not part of the pre-booking marketplace flow.

---

# 8. Tour Guide Requirements

Travelers can:

* Browse guides
* Search/filter guides
* Compare guides
* View specialties
* View ratings
* Receive matching recommendations

Hosts can:

* Add guides
* Edit/manage guide information
* Add specialties
* Add optional photos
* Delete guides

Future active-trip functionality may allow guide/group communication after an appropriate booking state.

---

# 9. AI Requirements

## AI Trip Planner

The AI planner should:

* Answer travel questions.
* Suggest destinations.
* Provide travel recommendations.
* Support English.
* Support Urdu.
* Support Roman Urdu.
* Handle loading and errors.

## AI Review Summarization

The system should:

* Read package reviews.
* Analyze sentiment.
* Identify positive highlights.
* Identify recurring concerns.
* Produce a concise summary.
* Cache the generated summary.

---

# 10. Travel Safety Requirements

## Weather

The system provides:

* Current weather
* Humidity
* Wind speed
* Feels-like temperature
* Forecast
* Simplified road status

## SOS

The system provides:

* Browser location access
* Latitude/longitude
* Google Maps location link
* Location sharing
* Regional tourism/emergency information

The current SOS system does not automatically contact emergency authorities.

---

# 11. Host Requirements

Hosts require:

* Host registration
* Company profile
* Dashboard
* Package management
* Booking management
* Tour-guide management
* Customer inquiries/inbox

Future:

* Advanced verification
* Business document verification
* Analytics
* Performance insights

---

# 12. Admin Requirements — Future Phase

The future Admin Dashboard should support:

* User management
* Host verification
* Package moderation
* Booking monitoring
* Review moderation
* Reports
* Platform analytics
* Safety monitoring
* Marketplace activity monitoring

---

# 13. Non-Goals

The current product does not:

* Operate tours directly.
* Provide international tourism as the initial market.
* Provide a production payment gateway yet.
* Provide automated emergency dispatch.
* Provide turn-by-turn navigation.
* Provide pre-booking traveler-to-guide chat.

---

# 14. Success Metrics

Future production metrics may include:

* Registered travelers
* Registered hosts
* Verified hosts
* Active packages
* Booking volume
* Completed trips
* Repeat travelers
* User engagement
* Review scores
* Host response performance
* Platform activity
