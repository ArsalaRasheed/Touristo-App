# Touristo - App Flow & Navigation Logic

## 1. Introduction
This document details the navigation flow and logical sequence of screens within the Touristo application, derived from the architecture map.

## 2. User Onboarding Flow
1.  **Splash Screen:** Displays the app logo and tagline for 1-2 seconds.
2.  **Conditional Navigation:**
    *   **First-time user:** Navigates to the Onboarding Carousel.
    *   **Returning user:** Navigates directly to the Home screen.
3.  **Onboarding Carousel:** A skippable series of cinematic slides explaining the app's features. After completion or skip, the user lands on the Home screen.

## 3. Main Navigation Flows
### 3.1 Discover & Search
*   **Home/Discover:** The central hub for exploration.
    *   **Action:** Tap "Search".
        *   **Result:** Navigates to "Search Results" screen.
    *   **Action:** Tap on a destination or "Explore".
        *   **Result:** Navigates to "Destination Explore Page".
    *   **Action:** Tap on the "Host Discovery" tab.
        *   **Result:** Navigates to the "Host Discovery" list.
    *   **Action:** Tap on a package in search results or explore page.
        *   **Result:** Navigates to "Package Detail" screen.
    *   **Action:** Tap on a host in the discovery list or from a package detail.
        *   **Result:** Navigates to "Host Profile" screen.
    *   **Action:** Tap on the AI Trip Planner icon/chat bubble.
        *   **Result:** Navigates to "AI Trip Planner" screen.

### 3.2 Booking & Travel Management
*   **Package Detail:** Displays detailed information about a tour package.
    *   **Action:** Initiate booking and proceed to payment.
        *   **Result:** Navigates to "Booking & Payment" screen.
    *   **Action:** View host information.
        *   **Result:** Navigates to "Host Profile" screen.
*   **Booking & Payment:** Handles the reservation and payment process.
    *   **Action:** Complete booking successfully.
        *   **Result:** Navigates to "My Trip" confirmation screen.
*   **My Trip:** Central place for managing an active or upcoming trip.
    *   **Action:** View trip details.
        *   **Result:** Displays package info, travel date, status.
    *   **Action:** Access live updates.
        *   **Result:** Can navigate to "Live Weather & Road Status".
    *   **Action:** Share location or track journey.
        *   **Result:** Navigates to "Live Location" map view.
    *   **Action:** Need emergency assistance.
        *   **Result:** Triggers the "Emergency SOS" feature.
    *   **Action:** Trip completed.
        *   **Result:** Can navigate to "Post-Trip Review" to rate and comment.

### 3.3 User & Company Profiles
*   **Login/Signup:** Entry point for authenticated actions.
    *   **Action:** New user sign-up or existing user login.
        *   **Result:** Navigates to the Home screen.
    *   **Action:** From login, choose to register as a company.
        *   **Result:** Navigates to "Company Registration" form.
*   **Traveler Profile:** Accessible from the Home screen.
    *   **Result:** View and manage personal profile, settings, and past trips.
*   **Company Dashboard:** Accessible after successful company registration and login.
    *   **Result:** Manage company profile, listed packages, and bookings.