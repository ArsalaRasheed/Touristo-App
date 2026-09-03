# Touristo - Implementation Plan

## 1. Introduction
This document outlines the step-by-step sequence for developing the features and modules of the Touristo application, based on the PRD, TRD, and current codebase status.

## 2. Initial Setup & Refactoring
1.  **Environment Setup:**
    *   Ensure all developers have Node.js, npm/yarn, and a PostgreSQL instance installed.
    *   Share `.env` file configurations for local development.
    *   Set up the project locally by running `npm install` in both the root and `frontend/` directories.
2.  **Codebase Cleanup:**
    *   Address the noted issue in `Architecture.md`: Clean up duplicate folders within the backend structure.
    *   Ensure the project runs locally using `npm run dev` (backend) and `npm run dev` (frontend in `frontend/` dir).

## 3. Backend Development (Phase 1)
### 3.1 Core API & Models
1.  **Finalize Models:** Ensure all model files (`User.js`, `Host.js`, etc.) are fully implemented with all necessary CRUD operations and adhere to the schema defined in `BackendSchema.md`. Pay special attention to data validation and error handling.
2.  **Finalize Controllers:** Complete the logic in all controller files (`userController.js`, `hostController.js`, etc.). Implement business logic for creation, updates (with security checks), and deletions.
3.  **API Routes:** Ensure all routes defined in `touristo/routes/` are fully functional and correctly mapped to their respective controller actions.
4.  **Authentication Module:**
    *   Implement user registration (`POST /api/users`) with password hashing (using `bcrypt`).
    *   Implement user login (`POST /auth/login`) to generate and return JWTs.
    *   Create a middleware function to protect routes by verifying the JWT.
    *   Add endpoints for company registration, linking to the `hosts` table.

### 3.2 Database & Configuration
1.  **Database Connection:** Finalize the database connection in `touristo/config/database.js` to connect to the Supabase database instance as intended. Replace the current non-blocking placeholder if necessary.
2.  **Database Migrations:** Write and apply SQL migration scripts to create all tables (`users`, `hosts`, `packages`, etc.) on the target database according to the `BackendSchema.md`.

## 4. Frontend Development (Parallel with Phase 1 backend)
### 4.1 Core Structure & Routing
1.  **Complete Routing:** Expand the `frontend/src/App.jsx` to include routes for all major screens identified in `AppFlow.md` (e.g., `/search`, `/package/:id`, `/my-trips`, etc.). **Status:** Host-side screens (`/host-dashboard`, `/my-packages`, `/bookings`) are now implemented.
2.  **Component Creation:** Begin creating core React components for each screen (e.g., `SearchScreen.jsx`, `PackageDetailScreen.jsx`, `MyTripsScreen.jsx`) in the `frontend/src/components/` directory.
3.  **State Management:** Decide on and implement a state management solution (e.g., Context API, Redux Toolkit) for managing global app state like user session, cart, etc.

### 4.2 UI Component Styling
1.  **Styling Framework:** Ensure Tailwind CSS is correctly configured and working as per `UIUXDesignBrief.md`.
2.  **Component Styling:** Style the basic components created in the previous step according to the color palette, typography, and layout guidelines.

## 5. Integration & Feature Completion (Phase 2)
### 5.1 Frontend-Backend Integration
1.  **API Calls:** Integrate the frontend components with the backend API using `fetch` or `axios`. Implement functions to call user, host, package, and booking endpoints.
2.  **Authentication Flow:** Integrate the login/registration forms with the backend auth endpoints. Store the JWT securely (e.g., `localStorage` or `httpOnly` cookie if handled by backend) and include it in headers for protected API calls.
3.  **Core Flows:** Implement the full flow for key features like searching for packages, viewing details, and initiating a booking (the payment part can be a stub initially).

### 5.2 Advanced Features
1.  **AI Trip Planner Integration:** Begin work on integrating the AI layer as described in `Architecture.md`. This might involve calling external APIs or a dedicated internal service.
2.  **Media Handling:** Implement functionality for uploading and displaying images for packages and host profiles, connecting to Supabase Storage.
3.  **Review System:** Implement the UI and API calls for submitting and displaying reviews.
4.  **Trip Experience Features:** Develop the UI and logic for "My Trips", live weather/road status (potentially via third-party APIs), and the SOS feature. **Status:** SOS feature is now integrated and functional.

## 6. Testing & Deployment Preparation (Phase 3)
1.  **Testing:** Write unit tests for critical backend logic and frontend components. Perform manual end-to-end testing of all major user flows.
2.  **Supabase Setup:** Provision and configure Database, Storage, and Functions on Supabase according to the architecture.
3.  **Deployment Pipeline:** Set up a CI/CD pipeline to automate the deployment of the backend and frontend to Supabase and Vercel.
4.  **Security Hardening:** Finalize security measures like Supabase Row Level Security and ensure all best practices from the TRD are implemented.