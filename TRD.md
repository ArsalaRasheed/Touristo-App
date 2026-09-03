# Touristo - Technical Requirement Document (TRD)

## 1. Introduction
This document outlines the technical architecture, technologies, and implementation guidelines for the Touristo application, aligning with the goals set in the PRD. It serves as a blueprint for developers to build the system.

## 2. Architecture Overview
The application follows a **client-server** model with a **Node.js/Express** backend and a **React** frontend, hosted on **Supabase**.

### 2.1 High-Level Architecture
*   **Frontend:** React + Vite + Tailwind CSS (Mobile-First).
*   **Backend:** Node.js + Express (REST API).
*   **Database:** PostgreSQL (hosted on Supabase).
*   **Storage:** Supabase Storage for images and videos.
*   **Hosting:** Supabase Functions or Vercel.
*   **Security:** Helmet, CORS, Supabase Auth.

### 2.2 Data Flow
1.  The React frontend sends HTTP requests to the Express backend.
2.  The backend's REST API routes direct requests to appropriate Controllers.
3.  Controllers interact with Models to perform database operations using a PostgreSQL pool.
4.  An AI Layer (to be integrated) will handle trip planning and recommendations.
5.  Static media is served via CDN from Supabase Storage.

## 3. Technology Stack
### 3.1 Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database Driver:** `pg` (node-postgres)
*   **Security:** `helmet`, `cors`
*   **Logging:** `morgan`
*   **Environment Variables:** `dotenv`

### 3.2 Frontend
*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Routing:** `react-router-dom`

### 3.3 Database
*   **Type:** Relational (PostgreSQL)
*   **Version:** As supported by Supabase.

### 3.4 Cloud Services
*   **Provider:** Supabase
*   **Services:** Database (PostgreSQL), Storage, Functions, Auth, Realtime.

## 4. API Specification
### 4.1 Base URL
`http://localhost:3000/api` (Development), `[Production URL]/api` (Production)

### 4.2 Standard Response Format
Successful Response:
```json
{
  "status": "success",
  "data": { ... }
}
```
Error Response:
```json
{
  "status": "error/fail",
  "message": "..."
}
```

### 4.3 Available Endpoints
*   **Users:** `GET /, POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
*   **Hosts:** `GET /, POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
*   **Packages:** `GET /, POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
*   **Bookings:** `GET /, POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
*   **Reviews:** `GET /, POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
*   **Frontend Routes:** `/host-dashboard`, `/my-packages`, `/bookings`

## 5. Security Considerations
*   Implement JWT-based authentication for API endpoints.
*   Use `bcrypt` or similar for password hashing.
*   Validate and sanitize all input data.
*   Leverage `helmet` for setting standard security headers.
*   Utilize Supabase Auth for user management and authorization.

## 6. Performance Requirements
*   Page load time for critical user flows should be under 3 seconds.
*   API response times should be under 1 second for simple queries.
*   Optimize image loading using Supabase Storage and CDN.

## 7. Scalability
*   Use a database connection pool (`pg.Pool`).
*   Design API endpoints to be stateless.
*   Leverage cloud services (Supabase Functions, Auto Scaling) for handling increased load.