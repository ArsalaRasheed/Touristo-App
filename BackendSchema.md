# Touristo — Backend Schema & Data Organization

## 1. Introduction

This document describes the main PostgreSQL data structures used by the Touristo application.

Touristo uses PostgreSQL hosted through Supabase. The Node.js backend connects to PostgreSQL using the `pg` package.

Authentication is handled by the application's Express backend using bcrypt and JWT.

---

## 2. Main Database

**Database:** PostgreSQL
**Provider:** Supabase
**Backend Driver:** `pg`

---

## 3. Users Table

The `users` table stores traveler and host account information.

Main fields include:

* `id`
* `name`
* `email`
* `password_hash`
* `phone`
* `role`
* `created_at`
* `updated_at`

### Roles

Supported application roles include:

* `traveler`
* `host`

---

## 4. Hosts Table

The `hosts` table stores tour company information linked to user accounts.

Main fields include:

* `id`
* `user_id`
* `company_name`
* `description`
* `location`
* `license_number`
* `cnic_or_business_registration`
* `company_address`
* `verification_status`
* `verified`
* `rating_score`
* `rating`
* `created_at`
* `updated_at`

Each host represents a tour company / marketplace operator.

---

## 5. Destinations Table

The `destinations` table stores Pakistani tourism destinations.

Main fields include:

* `id`
* `name`
* `category`
* `history`
* `culture`
* `famous_spots`
* `famous_food`
* `latitude`
* `longitude`

Current seeded destinations include:

* Hunza Valley
* Skardu
* Swat Valley
* Naran
* Babusar Top
* Lahore
* Mohenjo-daro
* Gwadar

---

## 6. Packages Table

The `packages` table stores tour packages created by hosts.

Main fields include:

* `id`
* `host_id`
* `destination_id`
* `title`
* `description`
* `price`
* `duration_days`
* `location`
* `image`
* `inclusions`
* `exclusions`
* `itinerary`
* `group_size`
* `availability_start`
* `availability_end`
* `created_at`
* `updated_at`

Each package belongs to a host and can optionally be associated with a destination.

---

## 7. Bookings Table

The `bookings` table stores traveler bookings.

Main booking information includes:

* Traveler/user ID
* Package ID
* Number of travelers
* Travel/start date
* Special requests
* Total price
* Payment-related status
* Booking status
* Creation/update timestamps

The current prototype stores payment-related information but does not integrate a live external payment gateway.

---

## 8. Reviews Table

Reviews store traveler feedback about packages/hosts.

Main fields include:

* `id`
* `user_id`
* `package_id`
* `host_id`
* `rating`
* `comment`
* `created_at`

Ratings use a 1–5 scale.

---

## 9. Review Summaries

AI-generated review summaries are cached so package pages can display a concise summary without repeatedly processing the same reviews.

The summary system can identify:

* Overall sentiment
* Positive highlights
* Recurring concerns
* Suggestions

---

## 10. Tour Guides Table

The `tour_guides` table stores guides associated with tour companies.

Main fields include:

* `id`
* `host_id`
* `name`
* `photo`
* `specialty`
* `rating`
* `created_at`
* `updated_at`

Hosts can manage their own guides.

Travelers can browse, compare, and match with guides based on specialty and rating.

---

## 11. Marketplace Chats

The marketplace messaging system uses a persistent conversation record.

Conceptually:

```text
marketplace_chats
```

Main fields include:

* `id`
* `conversation_id`
* `traveler_id`
* `host_id`
* `last_message_snippet`
* `updated_at`

A conversation is between one traveler and one host.

---

## 12. Messages

Messages belong to a marketplace conversation.

Main information includes:

* `id`
* `conversation_id`
* `sender_id`
* `receiver_id`
* `message_text`
* `content` (legacy compatibility where applicable)
* `associated_package_id`
* `is_read`
* `created_at`

The associated package may become `NULL` if the package is removed while the conversation remains active.

---

## 13. Relationships

```text
User
 ├── creates Bookings
 ├── writes Reviews
 └── participates in Marketplace Chats

Host
 ├── belongs to User
 ├── creates Packages
 ├── manages Tour Guides
 ├── receives Reviews
 └── participates in Marketplace Chats

Destination
 └── contains Packages

Package
 ├── belongs to Host
 ├── belongs to Destination
 ├── receives Bookings
 └── receives Reviews

Marketplace Chat
 ├── belongs to Traveler
 ├── belongs to Host
 └── contains Messages
```

---

## 14. Authentication Flow

### Registration

1. User submits registration information.
2. Backend validates the request.
3. Password is hashed using bcrypt.
4. User record is stored in PostgreSQL.
5. Host registration additionally creates a linked host/company record.

### Login

1. User submits email and password.
2. Backend retrieves the account.
3. Password is compared with the stored bcrypt hash.
4. Backend generates a JWT.
5. Frontend stores the authenticated user and token locally.
6. Protected API requests send the JWT in the Authorization header.

---

## 15. Data Security

The backend uses:

* JWT authentication
* bcrypt password hashing
* Protected routes
* Input validation
* PostgreSQL foreign-key relationships
* Helmet security headers
* Rate limiting where configured

Production deployments must never expose:

* Database passwords
* JWT secrets
* Gemini API keys
* Weather API keys
