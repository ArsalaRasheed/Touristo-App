# Touristo - Backend Schema & Data Organization

## 1. Introduction
This document defines the database schema for the Touristo application, detailing tables, columns, data types, relationships, and the authentication flow.

## 2. Database
*   **Type:** Relational Database (PostgreSQL)
*   **Host:** Supabase

## 3. Core Tables & Columns

### 3.1 `users` table
Stores information about travelers and potentially tour company representatives.
*   `id` (SERIAL, PRIMARY KEY): Unique identifier for the user.
*   `name` (VARCHAR(255), NOT NULL): Full name of the user.
*   `email` (VARCHAR(255), UNIQUE, NOT NULL): Email address, used for login.
*   `password_hash` (TEXT, NOT NULL): Hashed password for secure authentication.
*   `phone` (VARCHAR(20)): Phone number of the user.
*   `role` (VARCHAR(50), DEFAULT 'traveler'): Role of the user (e.g., 'traveler', 'host_rep').
*   `created_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the user was created.
*   `updated_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the user record was last updated.

### 3.2 `hosts` table
Stores information about verified tour companies.
*   `id` (SERIAL, PRIMARY KEY): Unique identifier for the host/company.
*   `company_name` (VARCHAR(255), NOT NULL): Name of the tour company.
*   `verified` (BOOLEAN, DEFAULT FALSE): Flag indicating if the host is verified.
*   `rating_score` (DECIMAL(3,2), DEFAULT 0.00): Average rating score from reviews.
*   `created_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the host was created.
*   `updated_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the host record was last updated.

### 3.3 `packages` table
Stores information about the tour packages offered by hosts.
*   `id` (SERIAL, PRIMARY KEY): Unique identifier for the package.
*   `host_id` (INTEGER, FOREIGN KEY -> hosts.id, NOT NULL): ID of the host offering the package.
*   `destination_id` (INTEGER, FOREIGN KEY -> destinations.id, NOT NULL): ID of the destination for the package.
*   `title` (VARCHAR(255), NOT NULL): Title of the tour package.
*   `price` (DECIMAL(10,2), NOT NULL): Price of the package.
*   `itinerary` (TEXT): Detailed description of the tour itinerary.
*   `created_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the package was created.
*   `updated_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the package record was last updated.

### 3.4 `bookings` table
Stores information about bookings made by users for packages.
*   `id` (SERIAL, PRIMARY KEY): Unique identifier for the booking.
*   `user_id` (INTEGER, FOREIGN KEY -> users.id, NOT NULL): ID of the user who made the booking.
*   `package_id` (INTEGER, FOREIGN KEY -> packages.id, NOT NULL): ID of the package being booked.
*   `travel_date` (DATE, NOT NULL): Date for which the tour is booked.
*   `status` (VARCHAR(50), DEFAULT 'pending'): Status of the booking (e.g., 'pending', 'confirmed', 'cancelled').
*   `created_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the booking was created.
*   `updated_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the booking record was last updated.

### 3.5 `reviews` table
Stores reviews and ratings given by users to hosts/companies.
*   `id` (SERIAL, PRIMARY KEY): Unique identifier for the review.
*   `user_id` (INTEGER, FOREIGN KEY -> users.id, NOT NULL): ID of the user who wrote the review.
*   `host_id` (INTEGER, FOREIGN KEY -> hosts.id, NOT NULL): ID of the host who received the review.
*   `rating` (INTEGER, CHECK (rating >= 1 AND rating <= 5), NOT NULL): Rating score (1-5).
*   `comment` (TEXT): Written feedback from the user.
*   `created_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the review was created.

### 3.6 `destinations` table
Stores information about touristic destinations.
*   `id` (SERIAL, PRIMARY KEY): Unique identifier for the destination.
*   `name` (VARCHAR(255), NOT NULL): Name of the destination.
*   `category` (VARCHAR(100)): Category of the destination (e.g., 'mountains', 'historical', 'beach').
*   `history` (TEXT): Historical background of the destination.
*   `culture` (TEXT): Cultural information about the destination.
*   `created_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the destination was created.
*   `updated_at` (TIMESTAMP, DEFAULT NOW()): Timestamp when the destination record was last updated.

## 4. Authentication Flow
1.  **Registration:** A new user provides `name`, `email`, `password`, and `phone`. The backend hashes the `password` using a library like `bcrypt` and stores the `password_hash` in the `users` table.
2.  **Login:** An existing user provides `email` and `password`. The backend retrieves the `password_hash` associated with the `email` from the `users` table. It then hashes the provided password and compares it with the stored hash. If they match, the user is authenticated.
3.  **Session Management:** Upon successful login, the backend generates a secure token (e.g., JWT). This token is sent to the frontend and must be included in the headers of subsequent API requests to access protected routes. The token is validated on each request to ensure the user remains authenticated.

## 5. Relationships
*   A `User` **makes** many `Bookings`.
*   A `User` **writes** many `Reviews`.
*   A `Host` **offers** many `Packages`.
*   A `Host` **receives** many `Reviews`.
*   A `Package` **is booked in** many `Bookings`.
*   A `Package` **is located in** one `Destination`.