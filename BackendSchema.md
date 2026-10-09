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
**Tables:** 12 (`users`, `hosts`, `destinations`, `packages`, `bookings`, `reviews`, `review_summaries`, `tour_guides`, `marketplace_chats`, `messages`, `reports`, `admin_audit_log`), created by `touristo/utils/schemaSetup.js` on local boot.

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
* `admin`

The `admin` role unlocks the `/api/admin` endpoints; the role is re-read from this table on every admin request.

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
* `destination`
* `inclusions`
* `exclusions`
* `itinerary`
* `group_size`
* `availability_start`
* `availability_end`
* `highlights` (TEXT[])
* `activities` (TEXT[])
* `tags` (TEXT[])
* `target_traveler_type` (VARCHAR(80))
* `best_season` (VARCHAR(80))
* `safety_notes` (TEXT[])
* `seo_description` (VARCHAR(300))
* `created_at`
* `updated_at`

The seven newer columns are created inline for fresh databases and applied additively (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`) on every local boot for existing ones.

Each package belongs to a host and can optionally be associated with a destination.

---

## 7. Bookings Table

The `bookings` table stores traveler bookings.

Main fields include:

* `id`
* `user_id`
* `package_id`
* `booking_date`
* `start_date`
* `end_date`
* `travel_date`
* `travelers`
* `total_price`
* `status`
* `payment_status`
* `created_at`
* `updated_at`

There is **no special-requests column** — the booking form's "special requests" field is collected in the UI but not persisted (PLANNED).

The current prototype stores payment-related information but does not integrate a live external payment gateway.

---

## 8. Reviews Table

Reviews store traveler feedback about packages/hosts.

Main fields include:

* `id`
* `user_id`
* `package_id`
* `rating`
* `comment`
* `created_at`

Ratings use a 1–5 scale. There is no `host_id` column on reviews — reviews are attached to packages only.

---

## 9. Review Summaries

AI-generated review summaries are cached so package pages can display a concise summary without repeatedly processing the same reviews.

The `review_summaries` table stores:

* `id`
* `package_id` (references `packages`, cascade delete)
* `summary`
* `created_at`
* `updated_at`

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

Travelers can browse and match with guides based on specialty and rating (AI-assisted matching via `POST /api/tour-guides/recommend`). Side-by-side guide comparison is not implemented.

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

## 13. Reports Table

The `reports` table stores moderation reports raised by users against reviews, packages, users or hosts.

Main fields include:

* `id`
* `reporter_id` (references `users`)
* `target_type` — CHECK-constrained to `review`, `package`, `user`, `host`
* `target_id`
* `reason`
* `details`
* `status` — CHECK-constrained to `open`, `resolved`, `dismissed`
* `resolution_note`
* `resolved_by` (references `users`, nullable)
* `resolved_at`
* `created_at`
* `updated_at`

Indexes cover reporter, resolver, target, status/created_at, a partial index for open reports, plus a partial unique index (`uq_reports_open_target`) that allows only one open report per reporter per target.

---

## 14. Admin Audit Log

The `admin_audit_log` table is an immutable trail of every admin mutation (role changes, verification decisions, deletions, report resolutions).

Main fields include:

* `id`
* `actor_id` (references `users`, nullable so the trail survives user deletion)
* `actor_email` (denormalized copy)
* `action`
* `target_type`
* `target_id`
* `details` (JSONB)
* `created_at`

Indexes exist on `created_at` and on `(actor_id, created_at)`.

---

## 15. Relationships

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
 ├── receives Reviews
 └── receives Review Summaries

User
 └── files Reports (and resolves them when acting as admin)

Marketplace Chat
 ├── belongs to Traveler
 ├── belongs to Host
 └── contains Messages
```

---

## 16. Authentication Flow

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

## 17. Data Security

The backend uses:

* JWT authentication
* bcrypt password hashing
* Protected routes
* Input validation
* PostgreSQL foreign-key relationships
* Helmet security headers
* Rate limiting where configured (in-memory — not coordinated across serverless instances)
* Fresh database role checks for admin endpoints

Production deployments must never expose:

* Database passwords
* JWT secrets
* Gemini API keys
* OpenAI API keys
* Weather API keys
* YouTube API keys
* Supabase service-role keys
